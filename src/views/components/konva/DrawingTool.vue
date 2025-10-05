<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import Konva from "konva";
import type { TextConfig } from "konva/types/shapes/Text";

defineOptions({ name: "DrawingTool" });
const props = defineProps({
  enableDrawing: Boolean,
  stageRef: Object,
  drawingLayerRef: Object
});

const emit = defineEmits([
  "update:enableDrawing",
  "clear-drawing",
  "undo-drawing",
  "delete-selected"
]);

// 绘图相关状态
const curStrokeColor = ref("#df4b26");
const curIsDashed = ref(false);
const selectedStrokeColor = ref("");
const drawingMode = ref("free");
const showDrawingToolbar = ref(false);
const drawingHistory = ref<any[]>([]); // 绘图历史记录
const selectedShape = ref<any>(null); // 当前选中的图形
const transformerNode = ref<Konva.Transformer | null>(null);
const isTransforming = ref(false);
let isDrawing = false;
let lastShape: any = null;
let startPos: any = null;

// 绘图模式选项
const drawingModes = [
  { value: "free", label: "自由" },
  { value: "line", label: "直线" },
  { value: "arrow", label: "箭头" },
  { value: "triangle", label: "三角形" },
  { value: "rect", label: "长方形" },
  { value: "circle", label: "圆形" },
  { value: "text", label: "文本" },
  { value: "select", label: "选择" }
];
const curDash = [10, 5];
const predefineColors = [
  "#ff4500",
  "#ff8c00",
  "#ffd700",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585",
  "rgba(255, 69, 0, 0.68)",
  "rgb(255, 120, 0)",
  "hsv(51, 100, 98)",
  "hsvl(120, 40, 94, 0.5)",
  "hsl(181, 100%, 37%)",
  "hsla(209, 100%, 56%, 0.73)",
  "#c7158577"
];

const currentModeLabel = computed(() => {
  const mode = drawingModes.find(m => m.value === drawingMode.value);
  return mode ? mode.label : "";
});

// 切换绘图模式
const toggleDrawing = () => {
  const newValue = !props.enableDrawing;
  emit("update:enableDrawing", newValue);
  showDrawingToolbar.value = newValue;

  if (newValue) {
    initTransformer();
  } else {
    // 退出绘图模式时清除选中状态
    if (selectedShape.value) {
      selectedShape.value.stroke(selectedStrokeColor.value);
      selectedShape.value.strokeWidth(3);
      selectedShape.value = null;
    }
    // 清除变换工具
    if (transformerNode.value) {
      transformerNode.value.destroy();
      transformerNode.value = null;
    }
    drawingMode.value = "free";
  }
};

// 设置绘图模式
const setDrawingMode = (mode: string) => {
  // 清除之前的选中状态
  if (selectedShape.value) {
    selectedShape.value.stroke(selectedStrokeColor.value);
    selectedShape.value.strokeWidth(3);
    selectedShape.value = null;
  }
  // 清除变换工具
  if (transformerNode.value) {
    transformerNode.value.nodes([]);
  }
  // 设置新模式
  drawingMode.value = mode;
};

// 清除绘图
const clearDrawing = () => {
  if (props.drawingLayerRef) {
    props.drawingLayerRef.getNode().destroyChildren();
    props.drawingLayerRef.getNode().draw();
    drawingHistory.value = [];
    selectedShape.value = null;
  }
  emit("clear-drawing");
};

// 撤销上一步绘图
const undoLastDrawing = () => {
  if (drawingHistory.value.length === 0) return;

  const lastItem = drawingHistory.value.pop();
  if (lastItem && props.drawingLayerRef) {
    lastItem.destroy();
    props.drawingLayerRef.getNode().draw();
  }
  emit("undo-drawing");
};

// 删除选中的图形
const deleteSelectedShape = () => {
  if (!selectedShape.value || !props.drawingLayerRef) return;

  // 从历史记录中移除
  const index = drawingHistory.value.indexOf(selectedShape.value);
  if (index !== -1) {
    drawingHistory.value.splice(index, 1);
    // 销毁图形
    selectedShape.value.destroy();
    selectedShape.value = null;
  }
  // 清除变换工具
  if (transformerNode.value) {
    transformerNode.value.nodes([]);
  }
  props.drawingLayerRef.getNode().draw();
  emit("delete-selected");
};

// 保存绘图到历史记录
const saveToHistory = (shape: any) => {
  drawingHistory.value.push(shape);
};

// 初始化变换工具
const initTransformer = () => {
  if (transformerNode.value) {
    transformerNode.value.destroy();
  }

  const transformer = new Konva.Transformer({
    rotateEnabled: true,
    anchorSize: 8,
    borderStroke: "#0099ff",
    anchorStroke: "#0099ff",
    anchorCornerRadius: 4,
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < 10 || newBox.height < 10) {
        return oldBox;
      }
      return newBox;
    },
    ignoreStroke: true
  });

  transformer.on("transformstart", () => {
    isTransforming.value = true;
  });

  transformer.on("transformend", () => {
    isTransforming.value = false;
    props.drawingLayerRef?.getNode()?.batchDraw();
  });

  props.drawingLayerRef?.getNode()?.add(transformer);
  transformerNode.value = transformer;
};

// 选中或者切换 shape
const selectShape = (shape: Konva.Shape) => {
  if (
    !props.enableDrawing ||
    !shape ||
    shape._partialText !== undefined ||
    isTransforming.value
  )
    return;

  //检查当选中的shape是否在绘画数组里存在？
  let b = false;
  drawingHistory.value.forEach(_shape => {
    if (shape._id == _shape._id) {
      b = true;
    }
  });
  if (!b) return;

  // 确保变换工具存在
  if (!transformerNode.value) {
    initTransformer();
  }

  // 如果点击的是当前已选中的形状，不做任何操作
  if (selectedShape.value === shape) {
    return;
  }

  // 取消之前选中的图形
  if (selectedShape.value) {
    selectedShape.value.stroke(selectedStrokeColor.value);
    selectedShape.value.strokeWidth(3);
  }

  // 选中新图形
  selectedStrokeColor.value = shape.stroke();
  shape.stroke("#3a7bd5");
  shape.strokeWidth(4);
  selectedShape.value = shape;

  // 使用 setTimeout 避免直接递归调用
  setTimeout(() => {
    if (transformerNode.value && shape) {
      try {
        transformerNode.value.nodes([shape]);
        props.drawingLayerRef?.getNode()?.batchDraw();
      } catch (e) {
        console.error("Failed to attach transformer:", e);
      }
    }
  }, 0);
};

// 鼠标事件处理
const handleMouseDown = (e: any) => {
  const stage = e.target.getStage();
  if (
    !props.enableDrawing ||
    !props.drawingLayerRef ||
    !stage ||
    isTransforming.value
  )
    return;

  // 如果是在选择模式下，并且点击的是图形
  if (drawingMode.value === "select" && e.target !== stage) {
    selectShape(e.target);
    return;
  }

  // 如果点击的是空白处，取消选中
  if (e.target === stage) {
    if (selectedShape.value) {
      selectedShape.value.stroke(curStrokeColor.value);
      selectedShape.value.strokeWidth(3);
      selectedShape.value = null;
    }
    if (transformerNode.value) {
      transformerNode.value.nodes([]);
      props.drawingLayerRef.getNode().batchDraw();
    }
  }

  // 如果已经有选中的图形或者在选择模式下，不开始新绘图
  if (selectedShape.value || drawingMode.value === "select") return;

  isDrawing = true;
  const pos = stage.getPointerPosition();
  if (!pos) return;

  startPos = pos;
  console.log(`curIsDashed: ${curIsDashed.value}`);
  switch (drawingMode.value) {
    case "free":
      lastShape = new Konva.Line({
        stroke: curStrokeColor.value,
        strokeWidth: 3,
        points: [pos.x, pos.y],
        tension: 0,
        draggable: true,
        dash: curIsDashed.value ? curDash : undefined,
        strokeScaleEnabled: false
      });
      break;
    case "line":
      lastShape = new Konva.Line({
        stroke: curStrokeColor.value,
        strokeWidth: 3,
        points: [pos.x, pos.y, pos.x, pos.y],
        draggable: true,
        dash: curIsDashed.value ? curDash : undefined,
        strokeScaleEnabled: false
      });
      break;
    case "arrow":
      lastShape = new Konva.Arrow({
        points: [pos.x, pos.y, pos.x, pos.y],
        fill: curStrokeColor.value,
        stroke: curStrokeColor.value,
        strokeWidth: 3,
        pointerLength: 10,
        pointerWidth: 10,
        draggable: true,
        dash: curIsDashed.value ? curDash : undefined,
        strokeScaleEnabled: false
      });
      break;
    //{ value: "triangle", label: "三角形" },
    case "triangle":
      lastShape = new Konva.Line({
        fill: "transparent",
        stroke: curStrokeColor.value,
        strokeWidth: 3,
        points: [pos.x, pos.y, pos.x, pos.y],
        draggable: true,
        closed: true,
        dash: curIsDashed.value ? curDash : undefined,
        strokeScaleEnabled: false
      });
      break;
    case "rect":
      lastShape = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: curStrokeColor.value,
        strokeWidth: 3,
        draggable: true,
        dash: curIsDashed.value ? curDash : undefined,
        strokeScaleEnabled: false
      });
      break;
    case "circle":
      lastShape = new Konva.Circle({
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: curStrokeColor.value,
        strokeWidth: 3,
        draggable: true,
        dash: curIsDashed.value ? curDash : undefined,
        strokeScaleEnabled: false
      });
      break;
    case "text":
      let lastShapeT = new Konva.Text({
        x: pos.x,
        y: pos.y,
        text: "输入文本",
        fontSize: 30,
        fontFamily: "Calibri",
        fill: curStrokeColor.value,
        draggable: true
      });
      // 添加双击事件
      lastShapeT.on("dblclick dbltap", (e: any) => {
        startTextEditing(lastShapeT);
      });
      lastShape = lastShapeT;
      break;
  }

  // 添加点击事件
  lastShape.on("click tap", (e: any) => {
    if (drawingMode.value === "select") {
      selectShape(e.currentTarget);
    }
  });

  props.drawingLayerRef.getNode().add(lastShape);
  saveToHistory(lastShape);
};

const handleMouseMove = (e: any) => {
  if (!isDrawing || !props.enableDrawing || !lastShape) return;
  //获取舞台鼠标位置
  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  switch (drawingMode.value) {
    case "free":
      const newPoints = lastShape.points().concat([pos.x, pos.y]);
      lastShape.points(newPoints);
      break;
    case "line":
      lastShape.points([startPos.x, startPos.y, pos.x, pos.y]);
      break;
    case "arrow":
      lastShape.points([startPos.x, startPos.y, pos.x, pos.y]);
      break;
    case "triangle":
      lastShape.points([
        startPos.x,
        startPos.y,
        pos.x + 150,
        pos.y + 150,
        pos.x + (pos.x - startPos.x) / 2,
        pos.y + (pos.y - startPos.y) / 2
      ]);
      break;
    case "rect":
      lastShape.width(Math.abs(pos.x - startPos.x));
      lastShape.height(Math.abs(pos.y - startPos.y));
      lastShape.x(Math.min(startPos.x, pos.x));
      lastShape.y(Math.min(startPos.y, pos.y));
      break;
    case "circle":
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      lastShape.radius(radius);
      break;
    case "text":
      break;
  }
  props.drawingLayerRef.getNode().batchDraw();
};

const handleMouseUp = () => {
  isDrawing = false;
};

// 开始编辑文本
const isEditing = ref(false);
const inputRef = ref<HTMLInputElement>();
const activeTextRef = ref<Konva.Text>();
//const textNodes = ref<Konva.Text[]>([]);
const startTextEditing = async (textNode: Konva.Text) => {
  isEditing.value = true;
  activeTextRef.value = textNode;

  await nextTick();
  //const stage = props.stageRef?.getStage();
  const stageContainer = props.stageRef?.getStage()?.getContainer();
  if (!inputRef.value || !stageContainer) return;

  // 获取文本位置
  const stageBox = stageContainer.getBoundingClientRect();
  const textPos = textNode.getAbsolutePosition();
  const textBox = textNode.getClientRect();

  // 设置输入框样式
  inputRef.value.value = textNode.text();
  inputRef.value.style.position = "absolute";
  inputRef.value.style.top = `${stageBox.top + textPos.y - 227}px`;
  inputRef.value.style.left = `${stageBox.left + textPos.x - 165}px`;
  inputRef.value.style.width = `${textBox.width}px`;
  inputRef.value.style.height = `${textBox.height}px`;
  inputRef.value.style.fontSize = `${textNode.fontSize()}px`;
  inputRef.value.style.display = "block";
  inputRef.value.style.zIndex = "1000";

  // 聚焦输入框
  inputRef.value.focus();
  inputRef.value.select();
};

// 结束编辑
const endTextEditing = () => {
  if (!isEditing.value || !inputRef.value || !activeTextRef.value) return;

  activeTextRef.value.text(inputRef.value.value);
  inputRef.value.style.display = "none";
  isEditing.value = false;
  //layerRef.value!.draw();
};

// 生命周期钩子
onMounted(() => {
  watch(
    () => props.enableDrawing,
    newVal => {
      const stage = props.stageRef?.getStage();
      if (!stage) return;

      if (newVal) {
        stage.container().style.cursor = "crosshair";
        stage.on("mousedown touchstart", handleMouseDown);
        stage.on("mousemove touchmove", handleMouseMove);
        stage.on("mouseup touchend mouseleave", handleMouseUp);

        nextTick(() => {
          initTransformer();
        });
      } else {
        stage.container().style.cursor = "default";
        stage.off("mousedown touchstart");
        stage.off("mousemove touchmove");
        stage.off("mouseup touchend mouseleave");

        if (transformerNode.value) {
          transformerNode.value.destroy();
          transformerNode.value = null;
        }
      }
    },
    { immediate: true }
  );
});
</script>

<template>
  <div>
    <!-- 绘图控制按钮 -->

    <el-color-picker
      v-model="curStrokeColor"
      :show-alpha="true"
      class="mr-[10px]"
      :predefine="predefineColors"
    />
    <span class="mr-[10px]"> 虚框<el-switch v-model="curIsDashed" /></span>
    <el-button
      :type="props.enableDrawing ? 'primary' : ''"
      @click="toggleDrawing"
    >
      {{ props.enableDrawing ? "退出绘图" : "自由绘图" }}
    </el-button>
    <el-button
      type="danger"
      :disabled="!props.enableDrawing"
      @click="clearDrawing"
    >
      清除绘图
    </el-button>
    <el-button
      type="warning"
      :disabled="!props.enableDrawing || drawingHistory.length === 0"
      @click="undoLastDrawing"
    >
      撤销
    </el-button>
    <el-button
      v-if="props.enableDrawing"
      type="danger"
      :disabled="!props.enableDrawing || !selectedShape"
      @click="deleteSelectedShape"
    >
      删除选中
    </el-button>

    <!-- 绘图工具栏 -->
    <div
      v-if="showDrawingToolbar"
      class="dtoobar absolute z-50 top-35 left-6 bg-white bg-opacity-90 p-2 rounded shadow-md flex flex-col gap-2"
      style="background: rgb(0 0 0 / 60%)"
    >
      <el-button
        v-for="mode in drawingModes"
        :key="mode.value"
        size="small"
        :type="drawingMode === mode.value ? 'primary' : ''"
        @click="setDrawingMode(mode.value)"
      >
        {{ mode.label }}
      </el-button>
      <input
        ref="inputRef"
        type="text"
        class="text-input"
        style="display: none"
        @blur="endTextEditing"
        @keyup.enter="endTextEditing"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Using Tailwind CSS, no additional styles needed */
.dtoobar > .el-button {
  margin-left: 0 !important;
}
.text-input {
  padding: 0;
  margin: 0;
  border: 1px solid #3498db;
  outline: none;
  background: white;
  font-family: Arial;
  box-sizing: border-box;
}
</style>

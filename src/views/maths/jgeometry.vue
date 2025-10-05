<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { message } from "@/utils/message";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";
import type { StageConfig, GroupConfig } from "konva/types";

defineOptions({ name: "JGeometry" });

// Canvas引用
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);
const layerRef = ref<any>(null);
const enableDrawing = ref(false); //是否显示画图工具
const mousePos = ref({ x: 0, y: 0 }); // 当前鼠标坐标位置
// 舞台配置
const stageConfig: StageConfig = { width: 940, height: 680 };
let origin = { x: stageConfig.width / 2, y: stageConfig.height / 2 };
const SCALE = 40; // 每单位像素数
const gGrid = ref({ lines: [], labels: [] });

// 三角形列表
const triangles = ref([]);
// 当前选中的三角形索引
const activeTriangleIndex = ref(-1);
// 三角形拖动位置
//const isDragging = ref(false);
const offsetXY = reactive({ x: 0, y: 0 });
// 整体拖动配置
const groupConfig = reactive<GroupConfig & Konva.NodeConfig>({
  draggable: true, // 默认不启用,拖动时启用
  listening: true, // 可监听
  // 关键设置：强制使用图形边界作为hitRegion
  hitFunc: context => {
    // 获取图形实际边界
    const bounds = this.getClientRect();
    context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
  }
});

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

// 添加新三角形, 随机生成一个三角形
const addTriangle = (num: number) => {
  //const randomBit = Math.random() > 0.5;
  let points = [
    {
      x: 200 + triangles.value.length * 30,
      y: 100 + triangles.value.length * 30
    },
    {
      x: 100 + triangles.value.length * 30,
      y: 300 + triangles.value.length * 30
    },
    {
      x: 300 + triangles.value.length * 30,
      y: 300 + triangles.value.length * 30
    },
    {
      x: 400 + triangles.value.length * 30,
      y: 100 + triangles.value.length * 30
    }
  ];
  const newTriangle = {
    id: Date.now(),
    x: origin.x,
    y: origin.y,
    x2: origin.x,
    y2: origin.y,
    radius: num > 1 ? 0 : 100 + triangles.value.length * 5,
    points: points.slice(0, num),
    fillColor: "transparent", //: `hsl(${Math.random() * 360}, 70%, 80%)`,
    strokeColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
    strokeWidth: 3,
    isDashed: false,
    dash: [10, 5]
  };
  triangles.value.push(newTriangle);
  activeTriangleIndex.value = triangles.value.length - 1;
  //message(`已添加三角形 ${triangles.value.length}`, { type: "success" });
};

// 删除三角形
const deleteTriangle = () => {
  if (triangles.value.length <= 1) {
    message("至少需要保留一个三角形", { type: "warning" });
    return;
  }
  triangles.value.splice(activeTriangleIndex.value, 1);
  if (triangles.value.length > 0) {
    setActiveTriangle(triangles.value.length - 1);
  }
  message("三角形已删除", { type: "success" });
};

//阻止冒泡
const handlePreventBubbling = (event: any) => {
  event.cancelBubble = true; // 阻止事件冒泡到group
  offsetXY.x = event.target.x();
  offsetXY.y = event.target.y();
};
/**
 * 处理顶点拖拽 ,处理三角形顶点拖拽，改变三角形形状
 * 只有第一个顶点（索引0）可以自由拖拽，另外两个角点固定, 但这里我们允许所有点都可以拖拽以更灵活，你可以根据需要修改
 * @param event
 * @param triangleIndex
 * @param pointIndex
 */
const handleDragMoveShape = (
  event: any,
  triangleIndex: number,
  pointIndex: number
) => {
  const newNode = event.target;
  event.cancelBubble = true; // 阻止事件冒泡到group
  // 直接更新顶点坐标 线条和圆
  if (pointIndex > -1 && triangles.value[triangleIndex].radius == 0) {
    triangles.value[triangleIndex].points[pointIndex] = {
      x: event.target.x(),
      y: event.target.y()
    };
  } else {
    let x = event.target.x() - offsetXY.x;
    let y = event.target.y() - offsetXY.y;
    offsetXY.x = event.target.x();
    offsetXY.y = event.target.y();
    triangles.value[triangleIndex].radius += (x + y) / 2;
  }
  // 强制重绘
  layerRef.value?.getNode()?.getLayer()?.batchDraw();
};
// 处理拖拽结束事件
const handleDragEndShape = (event: any, triangleIndex: number) => {
  // 更新圆形的坐标为新位置
  triangles.value[triangleIndex].x2 -= 0.0001;
  triangles.value[triangleIndex].y2 -= 0.0001;
};

// 1. 点击选择三角形
const handleGroupDown = (event: any, triangleIndex: number) => {
  if (activeTriangleIndex.value !== triangleIndex) {
    setActiveTriangle(triangleIndex);
  }
  event.cancelBubble = true; // 阻止事件冒泡到group
};

/**
 * // 判断点是否在三角形内（射线法）
 * @param point  {x,y}
 * @param triangle  [{x,y},{x,y},{x,y}]
 *//*
const isPointInTriangle = (
  point: { x: number; y: number },
  triangle: Array<{ x: number; y: number }>
) => {
  const [pA, pB, pC] = triangle;
  const areaABC = calculateArea([pA, pB, pC]);
  const areaPAB = calculateArea([point, pA, pB]);
  const areaPBC = calculateArea([point, pB, pC]);
  const areaPCA = calculateArea([point, pC, pA]);

  // 允许一定误差
  const epsilon = 0.5;
  return Math.abs(areaABC - (areaPAB + areaPBC + areaPCA)) < epsilon;
};
*/
const setActiveTriangle = (index: number) => {
  if (activeTriangleIndex.value != index) {
    console.log(`active: ${index} ， ${activeTriangleIndex.value}`);
    //删除index, 然后把它添加到数组最后
    // 移除第 index 个元素（索引为index）并保存
    const obj = triangles.value.splice(index, 1)[0];
    // 将第3个元素添加到数组末尾
    triangles.value.push(obj);
    activeTriangleIndex.value = triangles.value.length - 1;
    //重绘layer
    layerRef.value?.getNode()?.getLayer()?.batchDraw();
  }
};

// 计算三角形面积
const calculateArea = (points, toFixedLength = -1) => {
  if (points.length !== 3) return 0;

  const [a, b, c] = points;
  let result = Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2
  );
  return toFixedLength == -1 ? result : result.toFixed(toFixedLength);
};

// 计算三角形周长
const calculatePerimeter = points => {
  if (points.length !== 3) return 0;

  const [a, b, c] = points;
  const ab = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  const bc = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2));
  const ca = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));

  return (ab + bc + ca).toFixed(2);
};

// 组件挂载后的初始化
onMounted(() => {
  //画网格和x,y轴函数
  gGrid.value = DUtils.drawGrid(
    stageConfig.width,
    stageConfig.height,
    origin,
    SCALE
  );
  // 添加鼠标位置监听
  const stage = stageRef.value?.getStage();
  if (stage) {
    stage.on("mousemove", e => {
      const pos = stage.getPointerPosition();
      if (pos) {
        mousePos.value = {
          x: Math.round(pos.x),
          y: Math.round(pos.y)
        };
      }
    });
    addTriangle(3);
  }
});
</script>

<template>
  <div
    class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva triangle-container"
  >
    <div class="flex-1">
      <div
        class="p-2 flex justify-between items-center border-left-blue border rounded-lg overflow-hidden bg-white"
      >
        <div class="text-sm font-medium text-gray-700 bg-gray">
          探索三角形图像变化规律
        </div>
        <div class="flex gap-2">
          <DrawingTool
            v-model:enableDrawing="enableDrawing"
            :stageRef="stageRef"
            :drawingLayerRef="drawingLayerRef"
          />
        </div>
      </div>
      <div class="stage-container relative">
        <v-stage ref="stageRef" :config="stageConfig">
          <v-layer ref="layerRef">
            <!-- 网格线 -->
            <v-line
              v-for="(line, index) in gGrid.lines"
              :key="'grid-' + index"
              :config="line"
            />
            <v-text
              v-for="(label, index) in gGrid.labels"
              :key="'axe-label-' + index"
              :config="label"
            />
            <!-- 绘制三角形 -->
            <template
              v-for="(triangle, triangleIndex) in triangles"
              :key="triangle.id"
            >
              <v-group
                ref="triangleGroup"
                :config="groupConfig"
                @mousedown="handleGroupDown($event, triangleIndex)"
              >
                <template v-if="triangles[triangleIndex].radius == 0">
                  <!-- 三角形主体 -->
                  <v-line
                    :config="{
                      points: triangle.points.flatMap(point => [
                        point.x,
                        point.y
                      ]),
                      fill: triangle.fillColor,
                      stroke: triangle.strokeColor,
                      strokeWidth: triangle.strokeWidth,
                      dash: triangle.isDashed ? triangle.dash : undefined,
                      closed: true
                    }"
                  />
                  <!-- 三个可拖拽的角点 -->
                  <v-circle
                    v-for="(point, pointIndex) in triangle.points"
                    :key="pointIndex"
                    :config="{
                      x: point.x,
                      y: point.y,
                      radius: 5,
                      fill: triangle.strokeColor,
                      stroke: '#fff',
                      strokeWidth: 2,
                      draggable: true,
                      istening: false // 整体拖动时禁用角点拖动
                    }"
                    @mousedown="handlePreventBubbling"
                    @dragmove="
                      e => handleDragMoveShape(e, triangleIndex, pointIndex)
                    "
                  />
                </template>
                <template v-else>
                  <v-circle
                    :config="{
                      x: triangle.x,
                      y: triangle.y,
                      radius: triangle.radius,
                      fill: triangle.fillColor,
                      stroke: triangle.strokeColor,
                      strokeWidth: triangle.strokeWidth,
                      dash: triangle.isDashed ? triangle.dash : undefined
                    }"
                  />
                  <v-circle
                    :config="{
                      x: triangle.x2,
                      y: triangle.y2,
                      radius: 5,
                      fill: triangle.strokeColor,
                      stroke: triangle.strokeColor,
                      strokeWidth: triangle.strokeWidth,
                      draggable: true,
                      istening: false // 整体拖动时禁用角点拖动
                    }"
                    @mousedown="handlePreventBubbling"
                    @dragmove="e => handleDragMoveShape(e, triangleIndex, -1)"
                    @dragend="e => handleDragEndShape(e, triangleIndex)"
                  />
                </template>
              </v-group>
            </template>
          </v-layer>
          <!-- 绘图层 -->
          <v-layer ref="drawingLayerRef" />
        </v-stage>
      </div>
    </div>

    <el-card class="control-panel w-full md:w-120 space-y-2">
      <template #header>
        <div class="mr-5">控制面板</div>
        <div>
          <el-button type="primary" size="small" @click="addTriangle(3)">
            三角形
          </el-button>
          <el-button type="primary" size="small" @click="addTriangle(4)">
            四边形
          </el-button>
          <el-button type="primary" size="small" @click="addTriangle(2)">
            线段
          </el-button>
          <el-button type="primary" size="small" @click="addTriangle(1)">
            圆
          </el-button>
        </div>
      </template>

      <el-form label-width="80px">
        <el-form-item v-if="activeTriangleIndex != -1" label="填充颜色">
          <el-color-picker
            v-model="triangles[activeTriangleIndex].fillColor"
            :predefine="predefineColors"
          />
        </el-form-item>

        <el-form-item v-if="activeTriangleIndex != -1" label="边框颜色">
          <el-color-picker
            v-model="triangles[activeTriangleIndex].strokeColor"
            :predefine="predefineColors"
          />
        </el-form-item>

        <el-form-item v-if="activeTriangleIndex != -1" label="边框宽度">
          <el-slider
            v-model="triangles[activeTriangleIndex].strokeWidth"
            :min="1"
            :max="10"
            :step="1"
          />
        </el-form-item>
        <el-form-item v-if="activeTriangleIndex != -1" label="是否虚线">
          <el-switch v-model="triangles[activeTriangleIndex].isDashed" />
          虚框
        </el-form-item>

        <el-form-item>
          <el-button
            type="danger"
            :disabled="triangles.length <= 0"
            @click.stop="deleteTriangle"
          >
            删除
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.triangle-container {
  display: flex;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.control-panel {
  width: 300px;
  margin-right: 20px;
}

.stage-container {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

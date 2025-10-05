<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";
import { filterSpecialChars2 } from "@/utils/my/myUtils";
import { parseLineFunction } from "@/utils/my/functional"; // 导入新的绘图组件
import MathJax from "vue-mathjax-v3";

defineOptions({ name: "JLinear" });

// Constants
let CANVAS_WIDTH = 940;
let CANVAS_HEIGHT = 580;
let origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const SCALE = 40; // pixels per unit

const gGrid = ref({ lines: [], labels: [] });
// Reactive state
const k = ref(1); // 正比例系数
const showK = ref(true);
const b = ref(0);
const lineFunction = ref("x");
const showB = ref(true);
const showGraph = ref(true);
const showGrid = ref(true);
const showXIntercept = ref(true);
const enableDrawing = ref(false);
const mousePos = ref({ x: 0, y: 0 }); //当前鼠标坐标位置
const formulaK = `$$(y-b) \\over x $$`;
// Canvas references
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);

// Computed properties
//方程式
const equation = computed(() => {
  let y = "";
  const { value: kVal } = k;
  const { value: bVal } = b;
  // 处理k为0的特殊情况
  if (kVal === 0) return `${bVal}`;
  // 处理斜率部分
  if (Math.abs(kVal) === 1) {
    y += kVal > 0 ? "x" : "-x";
  } else {
    y += `${kVal}x`;
  }

  // 处理截距部分
  if (bVal !== 0) {
    const sign = bVal > 0 ? " + " : " - ";
    y += `${sign}${Math.abs(bVal)}`;
  }
  return y;
});

//x截距、y截距
const xIntercept = computed(() => {
  if (k.value === 0) return null;
  return -b.value / k.value;
});
const yIntercept = computed(() => b.value);

//三角图形显示斜率
const slopeTriangle = computed(() => {
  if (!showK.value || !showGraph.value) return null;

  const triangleX = xIntercept.value;
  const triangleY = k.value * triangleX + b.value;
  const startX = origin.x + triangleX * SCALE;
  const startY = origin.y - triangleY * SCALE;
  const horizontalLength = SCALE * 5;
  const verticalLength = k.value * SCALE * 5;

  return {
    points: [
      startX,
      startY,
      startX + horizontalLength,
      startY,
      startX + horizontalLength,
      startY - verticalLength
    ],
    stroke: "#ff6b6b",
    strokeWidth: 2,
    fill: "rgba(255, 107, 107, 0.3)",
    closed: true
  };
});
//绘制一次函数线的点
const equationLine = computed(() => {
  if (!showGraph.value) return null;

  const leftY = k.value * (-origin.x / SCALE) + b.value;
  const rightY = k.value * (origin.x / SCALE) + b.value;
  const topX = (origin.y / SCALE - b.value) / k.value;
  const bottomX = (-origin.y / SCALE - b.value) / k.value;

  const intersections = [];

  if (leftY >= -origin.y / SCALE && leftY <= origin.y / SCALE) {
    intersections.push({ x: -origin.x / SCALE, y: leftY });
  }

  if (rightY >= -origin.y / SCALE && rightY <= origin.y / SCALE) {
    intersections.push({ x: origin.x / SCALE, y: rightY });
  }

  if (topX >= -origin.x / SCALE && topX <= origin.x / SCALE) {
    intersections.push({ x: topX, y: origin.y / SCALE });
  }

  if (bottomX >= -origin.x / SCALE && bottomX <= origin.x / SCALE) {
    intersections.push({ x: bottomX, y: -origin.y / SCALE });
  }

  let points =
    intersections.length >= 2
      ? [
          origin.x + intersections[0].x * SCALE,
          origin.y - intersections[0].y * SCALE,
          origin.x + intersections[1].x * SCALE,
          origin.y - intersections[1].y * SCALE
        ]
      : [
          origin.x - origin.x,
          origin.y - leftY * SCALE,
          origin.x + origin.x,
          origin.y - rightY * SCALE
        ];

  return {
    points: points,
    stroke: "#3a7bd5",
    strokeWidth: 3
  };
});

//b截距文本
const interceptMarker = computed(() => {
  if (!showB.value || !showGraph.value) return null;
  return {
    x: origin.x + 10,
    y: origin.y - b.value * SCALE - 10,
    text: `y截距: ${b.value.toFixed(2)}`,
    fontSize: 16,
    fill: "#4ecdc4"
  };
});
//x截距文本
const xInterceptMarker = computed(() => {
  if (!showXIntercept.value || !showGraph.value || xIntercept.value === null)
    return null;
  return {
    x: origin.x + xIntercept.value * SCALE,
    y: origin.y + 20,
    text: `x截距: ${xIntercept.value.toFixed(2)}`,
    fontSize: 16,
    fill: "#ffa502"
  };
});
//b截距点
const interceptPoints = computed(() => {
  if (!showGraph.value) return [];
  const points = [];
  if (showB.value) {
    points.push({
      x: origin.x,
      y: origin.y - b.value * SCALE,
      radius: 6,
      fill: "#4ecdc4",
      stroke: "#fff",
      strokeWidth: 2
    });
  }

  if (showXIntercept.value && xIntercept.value !== null) {
    points.push({
      x: origin.x + xIntercept.value * SCALE,
      y: origin.y,
      radius: 6,
      fill: "#ffa502",
      stroke: "#fff",
      strokeWidth: 2
    });
  }
  return points;
});

// Methods
const resetView = () => {
  k.value = 1;
  b.value = 0;
};
const handleOk = () => {
  let str = filterSpecialChars2(lineFunction.value);
  if (str != lineFunction.value) {
    lineFunction.value = str;
  }
  let result = parseLineFunction(str);
  k.value = result.k;
  b.value = result.b;
  //lineFunction.value = result.f;
};
const handleClear = () => {
  k.value = 1;
  b.value = 0;
};
// Lifecycle hooks
onMounted(() => {
  gGrid.value = DUtils.drawGrid(CANVAS_WIDTH, CANVAS_HEIGHT, origin, SCALE);
  // 添加鼠标位置监听, 获取舞台鼠标位置
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
  }
});
//监控k,b变化
watch([k, b], () => {
  lineFunction.value = equation.value;
});
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva">
    <!-- Canvas Section -->
    <div class="flex-1">
      <div class="border rounded-lg overflow-hidden bg-white">
        <div>
          <div class="p-2 flex justify-between items-center border-left-blue">
            <div class="text-sm font-medium text-gray-700 bg-gray">
              探索一次函数 y = kx + b 的图像变化规律
            </div>
            <div class="flex gap-2">
              <DrawingTool
                v-model:enableDrawing="enableDrawing"
                :stageRef="stageRef"
                :drawingLayerRef="drawingLayerRef"
              />
            </div>
          </div>

          <div class="relative">
            <v-stage
              ref="stageRef"
              :config="{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }"
            >
              <v-layer>
                <!-- Grid Lines 网格线，x,y轴刻度线 -->
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

                <!-- Equation Line, 一次函数线 -->
                <v-line v-if="equationLine" :config="equationLine" />

                <!-- Slope Triangle 三角形 -->
                <v-line v-if="slopeTriangle" :config="slopeTriangle" />

                <!-- Markers，x截距和y截距， 右上角公式 -->
                <k-text-with-bg
                  :text="'斜率: ' + k?.toFixed(2)"
                  :x="CANVAS_WIDTH - 200"
                  :y="2"
                  :fontSize="16"
                  bg-color="#ef4444bb"
                  text-color="white"
                  :corner-radius="8"
                />
                <!-- x截距标签 -->
                <k-text-with-bg
                  v-if="xInterceptMarker"
                  :text="'x截距: ' + xIntercept.toFixed(2)"
                  :x="origin.x + xIntercept * SCALE"
                  :y="origin.y + 20"
                  :fontSize="16"
                  bg-color="#ef4444aa"
                  text-color="white"
                  :corner-radius="8"
                />
                <!-- y轴截距 -->
                <k-text-with-bg
                  v-if="interceptMarker"
                  :text="'y截距: ' + b.toFixed(2)"
                  :x="origin.x + 10"
                  :y="origin.y - b * SCALE - 10"
                  :fontSize="16"
                  bg-color="#10b981aa"
                  text-color="white"
                  :corner-radius="8"
                />
                <!-- b Points 截距圆点 -->
                <v-circle
                  v-for="(point, index) in interceptPoints"
                  :key="'point-' + index"
                  :config="point"
                />
                <!-- 鼠标移动坐标(图形左上角0,0开始) -->
                <k-text-with-bg
                  :text="'坐标: ( ' + mousePos.x + ', ' + mousePos.y + ' )'"
                  :x="2"
                  :y="10"
                  :fontSize="16"
                  bg-color="#333333bb"
                  text-color="white"
                  :corner-radius="8"
                />
              </v-layer>

              <!-- Drawing Layer -->
              <v-layer ref="drawingLayerRef" />
            </v-stage>
          </div>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="w-full md:w-120 space-y-2">
      <!-- 参数控制 -->
      <!-- 参数控制 -->
      <div class="bg-white p-4 rounded-lg shadow border-left-blue">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <el-form>
          <el-form-item label="斜率k" class="">
            <el-slider v-model="k" :min="-5" :max="5" :step="0.1" show-input />
          </el-form-item>
          <el-form-item label="截距b" class="">
            <el-slider
              v-model="b"
              :min="-10"
              :max="10"
              :step="0.1"
              :show-input="true"
            />
          </el-form-item>
          <el-form-item label="" class="">
            <el-button type="info" class="w-full" @click="resetView">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 函数方程 -->
      <div class="bg-white p-4 rounded-lg shadow border-left-blue">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">方程信息:</h3>
        <el-form class="right-forms" label-position="right" label-width="100">
          <el-form-item
            label="y = "
            class=""
            style="margin-bottom: 10px !important"
          >
            <!-- input失去焦点、按下回车、清空内容 -->
            <el-input
              v-model="lineFunction"
              style="font-size: 21px"
              @blur="handleOk"
              @clear="handleClear"
              @keyup.enter="handleOk"
            />
          </el-form-item>
          <el-form-item label="斜率K = " class="">
            <MathJax :formula="formulaK" />
          </el-form-item>
          <el-form-item label="Y轴交点 = " class="">
            <p class="text-lg font-mono">{{ yIntercept?.toFixed(2) }}</p>
          </el-form-item>
          <el-form-item label="X轴交点 = " class="">
            <p class="text-lg font-mono">{{ xIntercept?.toFixed(2) }}</p>
          </el-form-item>
          <el-form-item label="斜率K关系:" class="">
            <p class="text-lg font-mono">两条互垂线斜率：K1*K2=-1</p>
          </el-form-item>
        </el-form>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">显示选项</h3>
        <div class="space-y-2">
          <el-checkbox v-model="showGrid">显示网格</el-checkbox>
          <el-checkbox v-model="showK">显示斜率</el-checkbox>
          <el-checkbox v-model="showB">显示y截距</el-checkbox>
          <el-checkbox v-model="showXIntercept" :disabled="xIntercept === null">
            显示x截距
          </el-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Using Tailwind CSS, no additional styles needed */
:deep(.el-slider__input) {
  width: 110px;
}
:deep(.MathJax) {
  margin: 2px 0 !important;
}
</style>

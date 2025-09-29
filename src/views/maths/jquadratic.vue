<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";
import MathJax from "vue-mathjax-v3";

defineOptions({ name: "JQuadratic" });

// 常量定义
let CANVAS_WIDTH = 940;
let CANVAS_HEIGHT = 580;
let origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const SCALE = 40; // 每单位像素数

const gGrid = ref({ lines: [], labels: [] });
// 响应式状态
const a = ref(1); // 二次项系数
const b = ref(0); // 一次项系数
const c = ref(0); // 常数项
const showVertex = ref(true); // 显示顶点
const showAxis = ref(true); // 显示对称轴
const showGraph = ref(true);
const showGrid = ref(true);
const showXIntercepts = ref(true);
const showYIntercept = ref(true);
const enableDrawing = ref(false);
const mousePos = ref({ x: 0, y: 0 }); // 当前鼠标坐标位置

//const formula = ref("\\frac { -b\\pm \\sqrt{b^{2}-4ac} } { 2a }"); // 你可以将公式替换为你需要的任何LaTeX公式
//const formula = ref("$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$");
// 公式可以是响应式变量
const formula = "$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$";
// Canvas引用
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);

// 计算属性
// 方程表达式
const equation = computed(() => {
  let y = "y = ";
  const { value: aVal } = a;
  const { value: bVal } = b;
  const { value: cVal } = c;

  // 处理a为0的特殊情况（变成一次函数）
  if (aVal === 0) {
    // 处理b为0的特殊情况（变成常数函数）
    if (bVal === 0) {
      return `y = ${cVal}`;
    }

    // 一次函数形式
    if (Math.abs(bVal) === 1) {
      y += bVal > 0 ? "x" : "-x";
    } else {
      y += `${bVal}x`;
    }

    if (cVal !== 0) {
      const sign = cVal > 0 ? " + " : " - ";
      y += `${sign}${Math.abs(cVal)}`;
    }
    return y;
  }

  // 二次函数形式
  if (Math.abs(aVal) === 1) {
    y += aVal > 0 ? "x²" : "-x²";
  } else {
    y += `${aVal}x²`;
  }

  // 处理一次项
  if (bVal !== 0) {
    const sign = bVal > 0 ? " + " : " - ";
    if (Math.abs(bVal) === 1) {
      y += `${sign}x`;
    } else {
      y += `${sign}${Math.abs(bVal)}x`;
    }
  }

  // 处理常数项
  if (cVal !== 0) {
    const sign = cVal > 0 ? " + " : " - ";
    y += `${sign}${Math.abs(cVal)}`;
  }

  return y;
});

// 计算判别式 △
const discriminant = computed(() => {
  return b.value * b.value - 4 * a.value * c.value;
});

// x截距（可能有0、1或2个）
const xIntercepts = computed(() => {
  const disc = discriminant.value;
  if (disc < 0) return []; // 无实根
  if (a.value === 0) {
    // 当a=0时变成一次函数
    if (b.value === 0) return []; // 不是函数
    return [-c.value / b.value];
  }

  const sqrtDisc = Math.sqrt(disc);
  const x1 = (-b.value - sqrtDisc) / (2 * a.value);
  const x2 = (-b.value + sqrtDisc) / (2 * a.value);

  return disc === 0 ? [x1] : [x1, x2];
});

// 顶点坐标
const vertex = computed(() => {
  if (a.value === 0) return null; // 不是二次函数
  const x = -b.value / (2 * a.value);
  const y = a.value * x * x + b.value * x + c.value;
  return { x, y };
});

// 对称轴
const axisOfSymmetry = computed(() => {
  if (a.value === 0) return null; // 不是二次函数
  return -b.value / (2 * a.value);
});

// 二次函数图像（抛物线）
const parabola = computed(() => {
  if (!showGraph.value || a.value === 0) return null;

  const points = [];
  // 计算抛物线的点，从左到右
  for (let i = -origin.x / SCALE; i <= origin.x / SCALE; i += 0.1) {
    const x = i;
    const y = a.value * x * x + b.value * x + c.value;

    // 检查点是否在画布范围内
    if (y >= -origin.y / SCALE && y <= origin.y / SCALE) {
      points.push(origin.x + x * SCALE);
      points.push(origin.y - y * SCALE);
    }
  }

  return {
    points: points,
    stroke: "#3a7bd5",
    strokeWidth: 3,
    tension: 0.2 // 使曲线更平滑
  };
});

// 对称轴显示
const axisLine = computed(() => {
  if (!showAxis.value || !showGraph.value || axisOfSymmetry.value === null)
    return null;

  const x = origin.x + axisOfSymmetry.value * SCALE;

  return {
    points: [x, 0, x, CANVAS_HEIGHT],
    stroke: "#ff6b6b",
    strokeWidth: 2,
    dash: [5, 5] // 虚线
  };
});

// 顶点标记
const vertexMarker = computed(() => {
  if (!showVertex.value || !showGraph.value || vertex.value === null)
    return null;

  const { x, y } = vertex.value;
  return {
    x: origin.x + x * SCALE,
    y: origin.y - y * SCALE,
    text: `顶点: (${x.toFixed(2)}, ${y.toFixed(2)})`,
    fontSize: 16,
    fill: "#ff6b6b"
  };
});

// y截距标记
const yInterceptMarker = computed(() => {
  if (!showYIntercept.value || !showGraph.value) return null;
  return {
    x: origin.x + 10,
    y: origin.y - c.value * SCALE - 10,
    text: `y截距: ${c.value.toFixed(2)}`,
    fontSize: 16,
    fill: "#4ecdc4"
  };
});

// 截距点
const interceptPoints = computed(() => {
  if (!showGraph.value) return [];
  const points = [];

  // y截距点
  if (showYIntercept.value) {
    points.push({
      x: origin.x,
      y: origin.y - c.value * SCALE,
      radius: 6,
      fill: "#4ecdc4",
      stroke: "#fff",
      strokeWidth: 2
    });
  }

  // x截距点
  if (showXIntercepts.value) {
    xIntercepts.value.forEach(x => {
      points.push({
        x: origin.x + x * SCALE,
        y: origin.y,
        radius: 6,
        fill: "#ffa502",
        stroke: "#fff",
        strokeWidth: 2
      });
    });
  }

  // 顶点
  if (showVertex.value && vertex.value) {
    const { x, y } = vertex.value;
    points.push({
      x: origin.x + x * SCALE,
      y: origin.y - y * SCALE,
      radius: 6,
      fill: "#ff6b6b",
      stroke: "#fff",
      strokeWidth: 2
    });
  }

  return points;
});

// x截距文本标记（与x轴交点的解）
const xInterceptsMarkers = computed(() => {
  if (
    !showXIntercepts.value ||
    !showGraph.value ||
    xIntercepts.value.length === 0
  ) {
    return [];
  }

  return xIntercepts.value.map((x, index) => {
    return {
      x: origin.x + x * SCALE,
      y: origin.y + 20,
      text: `解: ${x.toFixed(2)}`,
      fontSize: 16,
      fill: "#EE2A2AD1"
    };
  });
});

// 方法
const resetView = () => {
  a.value = 1;
  b.value = 0;
  c.value = 0;
};

// 生命周期钩子
onMounted(() => {
  gGrid.value = DUtils.drawGrid(CANVAS_WIDTH, CANVAS_HEIGHT, origin, SCALE);
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
  }
});
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva">
    <!-- 画布区域 -->
    <div class="flex-1">
      <div class="border rounded-lg overflow-hidden bg-white">
        <div>
          <div class="p-2 flex justify-between items-center border-left-blue">
            <div class="text-sm font-medium text-gray-700 bg-gray">
              探索二次函数 y = ax² + bx + c 的图像变化规律
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

                <!-- 抛物线 -->
                <v-line v-if="parabola" :config="parabola" />

                <!-- 对称轴 -->
                <v-line v-if="axisLine" :config="axisLine" />

                <!-- 顶点标记 -->
                <k-text-with-bg
                  v-if="vertexMarker"
                  :text="vertexMarker.text"
                  :x="vertexMarker.x + 10"
                  :y="vertexMarker.y - 10"
                  :fontSize="vertexMarker.fontSize"
                  bg-color="#ff6b6b88"
                  text-color="white"
                  :corner-radius="8"
                />

                <!-- y截距标记 -->
                <k-text-with-bg
                  v-if="yInterceptMarker"
                  :text="yInterceptMarker.text"
                  :x="yInterceptMarker.x"
                  :y="yInterceptMarker.y"
                  :fontSize="yInterceptMarker.fontSize"
                  bg-color="#10b98188"
                  text-color="white"
                  :corner-radius="8"
                />

                <!-- x截距标记 -->
                <k-text-with-bg
                  v-for="(marker, index) in xInterceptsMarkers"
                  :key="'x-intercept-' + index"
                  :text="marker.text"
                  :x="marker.x + 10"
                  :y="marker.y"
                  :fontSize="marker.fontSize"
                  bg-color="#ffa50288"
                  text-color="white"
                  :corner-radius="8"
                />

                <!-- 截距点 -->
                <v-circle
                  v-for="(point, index) in interceptPoints"
                  :key="'point-' + index"
                  :config="point"
                />

                <!-- 鼠标坐标 -->
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

              <!-- 绘图层 -->
              <v-layer ref="drawingLayerRef" />
            </v-stage>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="w-full md:w-80 space-y-6">
      <div class="bg-white p-4 rounded-lg shadow border-left-blue">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">方程信息:</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">标准形式</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              {{ equation }}
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">判别式:</p>
            <p class="text-lg font-mono">
              {{ "△ = b² - 4ac, " + discriminant.toFixed(2) }}
            </p>
          </div>
          <div
            class="flex items-center justify-between h-full"
            style=" padding: 0 5px;background: #4c484829; border-radius: 8px"
          >
            <p class="text-sm text-gray-600">求根公式:</p>
            <p class="text-lg font-mono">
              <MathJax :formula="formula" />
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">顶点坐标:</p>
            <p class="text-lg font-mono">x = -b/(2a), <br />y = c - b²/(4a)</p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">顶点坐标点</p>
            <p class="text-lg font-mono">
              {{
                vertex !== null
                  ? `(${vertex.x.toFixed(2)}, ${vertex.y.toFixed(2)})`
                  : "无"
              }}
            </p>
          </div>

          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">X轴交点</p>
            <p class="text-lg font-mono">
              {{
                xIntercepts.length > 0
                  ? xIntercepts.map(x => x.toFixed(2)).join(", ")
                  : "无实根"
              }}
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">对称轴</p>
            <p class="text-lg font-mono">
              {{
                axisOfSymmetry !== null
                  ? `x = ${axisOfSymmetry.toFixed(2)}`
                  : "无"
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              二次项系数a: {{ a.toFixed(2) }}
            </label>
            <el-slider v-model="a" :min="-5" :max="5" :step="0.1" show-input />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              一次项系数b: {{ b.toFixed(2) }}
            </label>
            <el-slider
              v-model="b"
              :min="-10"
              :max="10"
              :step="0.1"
              show-input
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              常数项c: {{ c.toFixed(2) }}
            </label>
            <el-slider
              v-model="c"
              :min="-10"
              :max="10"
              :step="0.1"
              show-input
            />
          </div>
          <el-button type="info" class="w-full" @click="resetView">
            重置
          </el-button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">显示选项</h3>
        <div class="space-y-2">
          <el-checkbox v-model="showGrid">显示网格</el-checkbox>
          <el-checkbox v-model="showVertex">显示顶点</el-checkbox>
          <el-checkbox v-model="showAxis">显示对称轴</el-checkbox>
          <el-checkbox v-model="showYIntercept">显示y截距</el-checkbox>
          <el-checkbox
            v-model="showXIntercepts"
            :disabled="xIntercepts.length === 0"
          >
            显示x截距
          </el-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-slider__input) {
  width: 110px;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import MathJax from "vue-mathjax-v3";

defineOptions({ name: "JTrig" });
// 常量定义
const PI = Math.PI;
//const TWO_PI = 2 * PI;

const TRIG_WIDTH = 500;
const TRIG_HEIGHT = 500;
const WAVE_WIDTH = 800;
const WAVE_HEIGHT = 250;
const CENTER_X = TRIG_WIDTH / 2;
const CENTER_Y = TRIG_HEIGHT / 2;
const RADIUS = 180;

// 响应式状态
const currentAngle = ref(30);
const isDraggingPoint = ref(false);
const isAnimating = ref(false);
const animationId = ref<number | null>(null);
const animationSpeed = ref(5);
const shows = reactive({
  showSine: [true, "显示正弦线 (sin) - 对边比斜边 - 绿线"],
  showCosine: [true, "显示余弦线 (cos) - 邻边比斜边 - 橙线"],
  showTangent: [true, "显示正切线 (tan) - 对边比邻边 - 红线"],
  showCotangent: [true, "显示余切线 (ctan) - 邻边比对边 - 紫线"],
  showLabels: [true, "显示标签"]
});
const buttons = [0, 30, 45, 60, 90, 180];

// 计算属性 - 三角函数值
const rad = computed(() => (currentAngle.value * Math.PI) / 180);
const sinValue = computed(() => Math.sin(rad.value).toFixed(3));
const cosValue = computed(() => Math.cos(rad.value).toFixed(3));
const tanValue = computed(() => {
  if (Math.abs(Math.cos(rad.value)) < 0.01) {
    return currentAngle.value % 180 === 90 ? "∞" : "-∞";
  }
  return Math.tan(rad.value).toFixed(3);
});
const sinValue2 = ref("");
const cosValue2 = ref("");
const tanValue2 = ref("");

// 计算属性 - 单位圆上的点坐标
const pointX = computed(() => CENTER_X + RADIUS * Math.cos(rad.value));
const pointY = computed(() => CENTER_Y - RADIUS * Math.sin(rad.value));

// 计算属性 - 角度标签位置
const angleLabelPosition = computed(() => {
  const angle = currentAngle.value;
  if (angle >= 0 && angle <= 90) {
    return { x: CENTER_X + 40, y: CENTER_Y - 40 };
  } else if (angle > 90 && angle <= 180) {
    return { x: CENTER_X - 100, y: CENTER_Y - 40 };
  } else if (angle > 180 && angle <= 270) {
    return { x: CENTER_X - 100, y: CENTER_Y + 20 };
  } else {
    return { x: CENTER_X + 40, y: CENTER_Y + 20 };
  }
});

// 计算属性 - 波形图相关点
const sinePoints = computed(() => {
  const pointsPerWave = 360;
  const waves = 2;
  const amplitude = 80;
  const centerY = WAVE_HEIGHT / 2;
  const pixelsPerDegree = WAVE_WIDTH / (pointsPerWave * waves);

  const points: number[] = [];
  for (let i = 0; i <= pointsPerWave * waves; i++) {
    const x = i * pixelsPerDegree;
    const rad = (i * Math.PI) / 180;
    const y = centerY - amplitude * Math.sin(rad);
    points.push(x, y);
  }
  return points;
});

const cosinePoints = computed(() => {
  const pointsPerWave = 360;
  const waves = 2;
  const amplitude = 80;
  const centerY = WAVE_HEIGHT / 2;
  const pixelsPerDegree = WAVE_WIDTH / (pointsPerWave * waves);

  const points: number[] = [];
  for (let i = 0; i <= pointsPerWave * waves; i++) {
    const x = i * pixelsPerDegree;
    const rad = (i * Math.PI) / 180;
    const y = centerY - amplitude * Math.cos(rad);
    points.push(x, y);
  }
  return points;
});

const angleMarkerX = computed(() => {
  const pointsPerWave = 360;
  const waves = 2;
  const pixelsPerDegree = WAVE_WIDTH / (pointsPerWave * waves);
  return (currentAngle.value % 360) * pixelsPerDegree;
});

// 计算属性 - 三角函数线的点
const radiusLinePoints = computed(() => [
  CENTER_X,
  CENTER_Y,
  pointX.value,
  pointY.value
]);

const sineLinePoints = computed(() => {
  if (!shows.showSine[0]) return [];
  return [pointX.value, pointY.value, pointX.value, CENTER_Y];
});

const cosineLinePoints = computed(() => {
  if (!shows.showCosine[0]) return [];
  return [CENTER_X, CENTER_Y, pointX.value, CENTER_Y];
});

const tangentLinePoints = computed(() => {
  if (!shows.showTangent[0] || Math.abs(Math.cos(rad.value)) < 0.01) return [];
  const tanY = CENTER_Y - RADIUS * Math.tan(rad.value);
  return [CENTER_X + RADIUS, CENTER_Y, CENTER_X + RADIUS, tanY];
});

// 方法 - 更新角度
const specialValues = {
  0: {
    sin: "0",
    cos: "1",
    tan: "0"
  },
  30: {
    sin: "\\frac{1}{2}",
    cos: "\\frac{\\sqrt{3}}{2}",
    tan: "\\frac{\\sqrt{3}}{3}"
  },
  45: {
    sin: "\\frac{\\sqrt{2}}{2}",
    cos: "\\frac{\\sqrt{2}}{2}",
    tan: "1"
  },
  60: {
    sin: "\\frac{\\sqrt{3}}{2}",
    cos: "\\frac{1}{2}",
    tan: "\\sqrt{3}"
  },
  90: {
    sin: "1",
    cos: "0",
    tan: "\\text{未定义}"
  },
  180: {
    sin: "0",
    cos: "-1",
    tan: "0"
  }
};
const updateAngle = (angle: number) => {
  currentAngle.value = Math.max(0, Math.min(360, Math.round(angle)));
  //右边三个值更新为特定值
  angle = Math.round(angle);
  if (specialValues.hasOwnProperty(angle)) {
    const values = specialValues[angle];
    sinValue2.value = `$$\\sin ${angle}^\\circ = ${values.sin}$$`;
    cosValue2.value = `$$\\cos ${angle}^\\circ = ${values.cos}$$`;
    tanValue2.value = `$$\\tan ${angle}^\\circ = ${values.tan}$$`;
  } else {
    sinValue2.value = cosValue2.value = tanValue2.value = "";
  }
};

// 方法 - 处理动画
const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value;

  if (isAnimating.value) {
    animate();
  } else if (animationId.value) {
    cancelAnimationFrame(animationId.value);
    animationId.value = null;
  }
};

const animate = () => {
  if (!isAnimating.value) return;

  updateAngle((currentAngle.value + 1) % 360);

  animationId.value = requestAnimationFrame(() => {
    setTimeout(animate, 1000 / animationSpeed.value);
  });
};

// 方法 - 处理拖动
const handleDragStart = () => {
  isDraggingPoint.value = true;
};

const handleDragEnd = () => {
  isDraggingPoint.value = false;
};

const handleDragMove = (e: any) => {
  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  const dx = pos.x - CENTER_X;
  const dy = pos.y - CENTER_Y;
  const angle = Math.atan2(-dy, dx);

  let newAngle = (angle * 180) / Math.PI;
  if (newAngle < 0) newAngle += 360;

  updateAngle(newAngle);
};

const handleCircleClick = (e: any) => {
  if (isAnimating.value) return;

  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  const dx = pos.x - CENTER_X;
  const dy = pos.y - CENTER_Y;
  const angle = Math.atan2(-dy, dx);

  let newAngle = (angle * 180) / Math.PI;
  if (newAngle < 0) newAngle += 360;

  updateAngle(newAngle);
};

const handleStageMouseMove = (e: any) => {
  if (!isDraggingPoint.value || isAnimating.value) return;

  const pos = e.target.getPointerPosition();
  if (!pos) return;

  const dx = pos.x - CENTER_X;
  const dy = pos.y - CENTER_Y;
  const angle = Math.atan2(-dy, dx);

  let newAngle = (angle * 180) / Math.PI;
  if (newAngle < 0) newAngle += 360;

  updateAngle(newAngle);
};

// 生命周期 - 初始化
onMounted(() => {
  // 创建角度标记点
  const angles = [
    0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330
  ];

  // 响应窗口大小变化
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    if (animationId.value) {
      cancelAnimationFrame(animationId.value);
    }
  };
});

// 处理窗口大小调整
const handleResize = () => {
  // 可以在这里添加响应式调整逻辑
};

// 生成刻度线和标签
const generateTickMarks = () => {
  const xTicks = [];
  const xLabels = [];
  const yTicks = [];
  const yLabels = [];

  const xTickStep = 60;
  const yTickStep = 60;
  const tickCount = Math.floor(TRIG_WIDTH / xTickStep);

  // X轴刻度
  for (let i = -tickCount; i <= tickCount; i++) {
    const x = CENTER_X + i * xTickStep;
    xTicks.push({
      points: [x, CENTER_Y - 5, x, CENTER_Y + 5],
      stroke: "#9CA3AF",
      strokeWidth: 1
    });

    xLabels.push({
      x: x - 10,
      y: CENTER_Y + 15,
      text: i.toString(),
      fontSize: 10,
      fill: "#6B7280"
    });
  }

  // Y轴刻度
  for (let i = -tickCount; i <= tickCount; i++) {
    const y = CENTER_Y + i * yTickStep;
    yTicks.push({
      points: [CENTER_X - 5, y, CENTER_X + 5, y],
      stroke: "#9CA3AF",
      strokeWidth: 1
    });

    yLabels.push({
      x: CENTER_X - 20,
      y: y - 5,
      text: (-i).toString(),
      fontSize: 10,
      fill: "#6B7280"
    });
  }

  return { xTicks, xLabels, yTicks, yLabels };
};

// 生成角度标记
const generateAngleMarkers = () => {
  const angles = [
    0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330
  ];
  const markers = [];
  const labels = [];

  angles.forEach(angle => {
    const rad = (angle * Math.PI) / 180;
    const x = CENTER_X + RADIUS * Math.cos(rad);
    const y = CENTER_Y - RADIUS * Math.sin(rad);

    markers.push({
      x,
      y,
      radius: 3,
      fill: "#9CA3AF"
    });

    // 只添加重要角度的标签
    if ([0, 30, 45, 60, 90, 180, 270].includes(angle)) {
      labels.push({
        x: x + (angle === 90 || angle === 270 ? 5 : 0),
        y: y + (angle === 0 ? 15 : angle === 180 ? -15 : 0),
        text: `${angle}°`,
        fontSize: 12,
        fill: "#6B7280"
      });
    }
  });

  return { markers, labels };
};

// 生成刻度和标记
const { xTicks, xLabels, yTicks, yLabels } = generateTickMarks();
const { markers: angleMarkers, labels: angleLabels } = generateAngleMarkers();
</script>

<template>
  <div
    class="bg-gradient-to-br from-light to-gray-100 min-h-screen font-sans text-dark"
  >
    <main class="container mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧控制面板 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl p-6 card-shadow h-full">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-sliders text-primary mr-2" />
              角度控制
            </h2>

            <div class="space-y-6">
              <div>
                <label
                  for="angle"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >旋转角度 (θ):</label
                >
                <div class="flex items-center">
                  <input
                    id="angle"
                    v-model="currentAngle"
                    type="range"
                    min="0"
                    max="360"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span
                    id="angle-value"
                    class="ml-3 text-lg font-medium text-primary min-w-[3rem] text-right"
                    >{{ currentAngle }}°</span
                  >
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <el-button
                  v-for="(val, index) of buttons"
                  :key="index"
                  class="angle-btn bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-lg transition-colors"
                  style="
                    padding: 4px;
                    margin-left: 12px;
                    background-color: #c8c4c496;
                  "
                  @click="updateAngle(val)"
                >
                  {{ val }}°
                </el-button>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h3 class="font-medium mb-2">动画选项</h3>
                <div class="flex items-center justify-between">
                  <label for="animation-speed" class="text-sm text-gray-700"
                    >动画速度:</label
                  >
                  <input
                    id="animation-speed"
                    v-model="animationSpeed"
                    type="range"
                    min="1"
                    max="10"
                    class="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                </div>
                <button
                  class="mt-3 w-full py-2 px-10 rounded-lg transition-colors flex items-center justify-center"
                  :class="
                    isAnimating
                      ? 'bg-red-400 text-white'
                      : 'bg-green-400 text-white'
                  "
                  style="padding: 4px"
                  @click="toggleAnimation"
                >
                  {{ isAnimating ? "暂停动画" : "开始动画" }}
                </button>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h3 class="font-medium mb-5">显示选项</h3>
                <div class="space-y-2">
                  <label
                    v-for="(item, key) in shows"
                    :key="key"
                    class="flex items-center"
                  >
                    <input
                      v-model="item[0]"
                      type="checkbox"
                      class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span class="ml-2 text-gray-500">{{ item[1] }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间图形区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl p-6 card-shadow mb-6 relative">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-area-chart text-primary mr-2" />
              初中三角函数互动演示 -
              <span style=" margin-left: 10px; font-size: 12px;color: #9ca3af">
                探索正弦、余弦和正切函数的几何意义</span
              >
            </h2>
            <div
              id="trig-container"
              class="bg-gray-50 rounded-lg overflow-hidden relative h-[500px]"
            >
              <!-- 单位圆舞台 -->
              <v-stage :config="{ width: TRIG_WIDTH, height: TRIG_HEIGHT }">
                <v-layer>
                  <!-- 单位圆背景 -->
                  <v-circle
                    :config="{
                      x: CENTER_X,
                      y: CENTER_Y,
                      radius: RADIUS,
                      stroke: '#E5E7EB',
                      strokeWidth: 2,
                      dash: [5, 5]
                    }"
                  />

                  <!-- 坐标轴 -->
                  <v-line
                    :config="{
                      points: [0, CENTER_Y, TRIG_WIDTH, CENTER_Y],
                      stroke: '#9CA3AF',
                      strokeWidth: 1
                    }"
                  />
                  <v-line
                    :config="{
                      points: [CENTER_X, 0, CENTER_X, TRIG_HEIGHT],
                      stroke: '#9CA3AF',
                      strokeWidth: 1
                    }"
                  />

                  <!-- 刻度线和标签 -->
                  <v-line
                    v-for="(tick, index) in xTicks"
                    :key="'x-tick-' + index"
                    :config="tick"
                  />
                  <v-text
                    v-for="(label, index) in xLabels"
                    :key="'x-label-' + index"
                    :config="label"
                  />
                  <v-line
                    v-for="(tick, index) in yTicks"
                    :key="'y-tick-' + index"
                    :config="tick"
                  />
                  <v-text
                    v-for="(label, index) in yLabels"
                    :key="'y-label-' + index"
                    :config="label"
                  />

                  <!-- 角度标记 -->
                  <v-circle
                    v-for="(marker, index) in angleMarkers"
                    :key="'angle-marker-' + index"
                    :config="marker"
                  />
                  <v-text
                    v-for="(label, index) in angleLabels"
                    :key="'angle-label-' + index"
                    :config="label"
                  />

                  <!-- 可拖动交互区域 -->
                  <v-circle
                    :config="{
                      x: CENTER_X,
                      y: CENTER_Y,
                      radius: RADIUS + 20,
                      fill: 'transparent',
                      stroke: 'transparent'
                    }"
                    @click="handleCircleClick"
                    @mousedown="handleDragStart"
                    @mouseup="handleDragEnd"
                    @mousemove="isDraggingPoint && handleDragMove"
                    @touchstart="handleDragStart"
                    @touchend="handleDragEnd"
                    @touchmove="isDraggingPoint && handleDragMove"
                  />

                  <!-- 旋转半径 指针 -->
                  <v-line
                    :config="{
                      points: radiusLinePoints,
                      stroke: '#3B82F6',
                      strokeWidth: 3,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }"
                  />

                  <!-- 旋转半径 指针的针头圆点 -->
                  <v-circle
                    :config="{
                      x: pointX,
                      y: pointY,
                      radius: 9,
                      fill: '#3B82F6',
                      stroke: 'white',
                      strokeWidth: 1.5,
                      draggable: true
                    }"
                    @dragstart="handleDragStart"
                    @dragend="handleDragEnd"
                    @dragmove="handleDragMove"
                  />

                  <!-- 角度圆弧 -->
                  <v-arc
                    :config="{
                      x: CENTER_X,
                      y: CENTER_Y,
                      innerRadius: 10,
                      outerRadius: 30,
                      clockwise: true,
                      angle: -currentAngle,
                      fill: '#3B82F6',
                      opacity: 0.3
                    }"
                  />

                  <!-- 角度标签 -->
                  <v-text
                    v-if="shows.showLabels[0]"
                    :config="{
                      x: angleLabelPosition.x,
                      y: angleLabelPosition.y,
                      text: `θ = ${currentAngle}°`,
                      fontSize: 14,
                      fill: '#3B82F6'
                    }"
                  />

                  <!-- 正弦线 (垂直) -->
                  <v-line
                    :config="{
                      points: sineLinePoints,
                      stroke: '#10B981',
                      strokeWidth: 3,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }"
                  />

                  <!-- 余弦线 (水平) -->
                  <v-line
                    :config="{
                      points: cosineLinePoints,
                      stroke: '#F59E0B',
                      strokeWidth: 3,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }"
                  />

                  <!-- 正切线 -->
                  <v-line
                    :config="{
                      points: tangentLinePoints,
                      stroke: '#EF4444',
                      strokeWidth: 3,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }"
                  />

                  <!-- 单位圆右侧的切线 -->
                  <v-line
                    v-if="
                      shows.showTangent[0] && Math.abs(Math.cos(rad)) >= 0.01
                    "
                    :config="{
                      points: [
                        CENTER_X + RADIUS,
                        0,
                        CENTER_X + RADIUS,
                        TRIG_HEIGHT
                      ],
                      stroke: '#EF4444',
                      strokeWidth: 1,
                      dash: [3, 3]
                    }"
                  />

                  <!-- 正弦标签 -->
                  <v-text
                    v-if="
                      shows.showSine[0] &&
                      shows.showLabels[0] &&
                      sineLinePoints.length > 0
                    "
                    :config="{
                      x: pointX + 5,
                      y: (pointY + CENTER_Y) / 2,
                      text: 'sin(θ)',
                      fontSize: 14,
                      fill: '#10B981'
                    }"
                  />

                  <!-- 余弦标签 -->
                  <v-text
                    v-if="
                      shows.showCosine[0] &&
                      shows.showLabels[0] &&
                      cosineLinePoints.length > 0
                    "
                    :config="{
                      x: (CENTER_X + pointX) / 2,
                      y: CENTER_Y - 20,
                      text: 'cos(θ)',
                      fontSize: 14,
                      fill: '#F59E0B'
                    }"
                  />

                  <!-- 正切标签 -->
                  <v-text
                    v-if="
                      shows.showTangent[0] &&
                      shows.showLabels[0] &&
                      tangentLinePoints.length > 0
                    "
                    :config="{
                      x: CENTER_X + RADIUS + 5,
                      y: (CENTER_Y + tangentLinePoints[3]) / 2,
                      text: 'tan(θ)',
                      fontSize: 14,
                      fill: '#EF4444'
                    }"
                  />
                </v-layer>
              </v-stage>
            </div>

            <!-- 函数值显示 -->
            <div
              class="grid grid-cols-1 gap-4 mb-6 absolute"
              style="top: 80px; right: 0; width: 300px"
            >
              <div class="bg-white rounded-xl p-4 card-shadow">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-gray-700">正弦值 - 绿线</h3>
                  <span
                    class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                    >sin(θ)</span
                  >
                </div>
                <div
                  class="text-2xl font-bold text-primary flex items-center justify-between"
                >
                  <h3>{{ sinValue }}</h3>
                  <MathJax :formula="sinValue2" />
                </div>
              </div>

              <div class="bg-white rounded-xl p-4 card-shadow">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-gray-700">余弦值 - 橙线</h3>
                  <span
                    class="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full"
                    >cos(θ)</span
                  >
                </div>
                <div
                  class="text-2xl font-bold text-orange-400 flex items-center justify-between"
                >
                  <h3>{{ cosValue }}</h3>
                  <MathJax :formula="cosValue2" />
                </div>
              </div>

              <div class="bg-white rounded-xl p-4 card-shadow">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-gray-700">正切值 - 红线</h3>
                  <span
                    class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full"
                    >tan(θ)</span
                  >
                </div>
                <div
                  class="text-2xl font-bold text-red-400 flex items-center justify-between"
                >
                  <h3>{{ tanValue }}</h3>
                  <MathJax :formula="tanValue2" />
                </div>
              </div>
            </div>
          </div>

          <!-- 三角函数图像 -->
          <div class="bg-white rounded-xl p-6 card-shadow">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-line-chart text-primary mr-2" />
              三角函数曲线
            </h2>
            <div
              id="wave-container"
              class="w-full h-[250px] bg-gray-50 rounded-lg overflow-hidden relative"
            >
              <!-- 波形图舞台 -->
              <v-stage :config="{ width: WAVE_WIDTH, height: WAVE_HEIGHT }">
                <v-layer>
                  <!-- 波形图背景 -->
                  <v-rect
                    :config="{
                      x: 0,
                      y: 0,
                      width: WAVE_WIDTH,
                      height: WAVE_HEIGHT,
                      fill: '#F9FAFB'
                    }"
                  />

                  <!-- 波形图坐标轴 -->
                  <v-line
                    :config="{
                      points: [0, WAVE_HEIGHT / 2, WAVE_WIDTH, WAVE_HEIGHT / 2],
                      stroke: '#9CA3AF',
                      strokeWidth: 1
                    }"
                  />
                  <v-line
                    :config="{
                      points: [0, 0, 0, WAVE_HEIGHT],
                      stroke: '#9CA3AF',
                      strokeWidth: 1
                    }"
                  />

                  <!-- 正弦波形 -->
                  <v-line
                    :config="{
                      points: sinePoints,
                      stroke: '#10B981',
                      strokeWidth: 2,
                      tension: 0.5
                    }"
                  />

                  <!-- 余弦波形 -->
                  <v-line
                    :config="{
                      points: cosinePoints,
                      stroke: '#F59E0B',
                      strokeWidth: 2,
                      tension: 0.5
                    }"
                  />

                  <!-- 当前角度标记线 -->
                  <v-line
                    :config="{
                      points: [angleMarkerX, 0, angleMarkerX, WAVE_HEIGHT],
                      stroke: '#3B82F6',
                      strokeWidth: 2,
                      dash: [3, 3]
                    }"
                  />

                  <!-- 波形标签 -->
                  <v-text
                    :config="{
                      x: WAVE_WIDTH - 100,
                      y: WAVE_HEIGHT / 2 - 40,
                      text: 'sin(θ)',
                      fontSize: 14,
                      fill: '#10B981'
                    }"
                  />
                  <v-text
                    :config="{
                      x: WAVE_WIDTH - 100,
                      y: WAVE_HEIGHT / 2 - 20,
                      text: 'cos(θ)',
                      fontSize: 14,
                      fill: '#F59E0B'
                    }"
                  />
                </v-layer>
              </v-stage>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-dark text-white" style="margin: 20px 30px 10px">
      <div class="mb-4 md:mb-0 text-center">
        <span class="text-lg font-semibold" style="color: #3b82f6">
          初中三角函数互动演示
        </span>
        <span class="text-gray-400 text-sm mt-1">
          探索正弦、余弦和正切函数的几何意义
        </span>
      </div>
      <el-divider />
    </footer>
  </div>
</template>

<style scoped lang="scss">
/* 导入Tailwind工具类 */

.content-auto {
  content-visibility: auto;
}

.text-shadow {
  text-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.card-shadow {
  box-shadow:
    0 10px 25px -5px rgb(0 0 0 / 10%),
    0 8px 10px -6px rgb(0 0 0 / 10%);
}

/* 颜色变量 */
:root {
  --primary: #3b82f6;
  --secondary: #10b981;
  --accent: #f59e0b;
  --dark: #1f2937;
  --light: #f9fafb;
}

:deep(mjx-container) {
  margin: 0 !important;
}
</style>

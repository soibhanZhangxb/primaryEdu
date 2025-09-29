<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import MathJax from "vue-mathjax-v3";

defineOptions({ name: "CircleGeometryTool" });

// 常量定义
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const MIN_RADIUS = 50;
const MAX_RADIUS = 200;

// 响应式状态
const radius = ref(120);
const diameter = computed(() => radius.value * 2);
const circumference = computed(() => (2 * Math.PI * radius.value).toFixed(2));
const area = computed(() => (Math.PI * radius.value * radius.value).toFixed(2));

const centralAngle = ref(60);
const arcLength = computed(() => {
  return ((centralAngle.value / 360) * 2 * Math.PI * radius.value).toFixed(2);
});

const isDraggingCenter = ref(false);
const isDraggingEdge = ref(false);
const isAnimating = ref(false);
const animationId = ref<number | null>(null);
const animationSpeed = ref(5);

const shows = reactive({
  showRadius: [true, "显示半径 (r)"],
  showDiameter: [true, "显示直径 (d)"],
  showCentralAngle: [true, "显示圆心角 (θ)"],
  showArc: [true, "显示圆弧"],
  showChord: [true, "显示弦"],
  showCircumference: [true, "显示周长计算"],
  showArea: [true, "显示面积计算"],
  showGrid: [true, "显示网格"],
  showLabels: [true, "显示标签"]
});

const circlePoints = [0, 30, 45, 60, 90, 180, 270, 360];

// 计算属性 - 圆上点的坐标
const edgePoint = computed(() => {
  const rad = (centralAngle.value * Math.PI) / 180;
  return {
    x: CENTER_X + radius.value * Math.cos(rad),
    y: CENTER_Y + radius.value * Math.sin(rad)
  };
});

const diameterEndPoint = computed(() => {
  return {
    x: CENTER_X - radius.value,
    y: CENTER_Y
  };
});

// 计算属性 - 角度标签位置
const angleLabelPosition = computed(() => {
  const rad = ((centralAngle.value / 2) * Math.PI) / 180;
  const labelRadius = radius.value / 3;
  return {
    x: CENTER_X + labelRadius * Math.cos(rad),
    y: CENTER_Y + labelRadius * Math.sin(rad)
  };
});

// 计算属性 - 各种线的点
const radiusLinePoints = computed(() => [
  CENTER_X,
  CENTER_Y,
  edgePoint.value.x,
  edgePoint.value.y
]);

const diameterLinePoints = computed(() => [
  CENTER_X + radius.value,
  CENTER_Y,
  diameterEndPoint.value.x,
  diameterEndPoint.value.y
]);

const chordLinePoints = computed(() => [
  CENTER_X + radius.value,
  CENTER_Y,
  edgePoint.value.x,
  edgePoint.value.y
]);

// 方法 - 更新半径
const updateRadius = (newRadius: number) => {
  radius.value = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, newRadius));
};

// 方法 - 更新角度
const updateAngle = (angle: number) => {
  centralAngle.value = Math.max(0, Math.min(360, Math.round(angle)));
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

  updateAngle((centralAngle.value + 1) % 360);

  animationId.value = requestAnimationFrame(() => {
    setTimeout(animate, 1000 / animationSpeed.value);
  });
};

// 方法 - 处理拖动
const handleCenterDragStart = () => {
  isDraggingCenter.value = true;
};

const handleEdgeDragStart = () => {
  isDraggingEdge.value = true;
};

const handleDragEnd = () => {
  isDraggingCenter.value = false;
  isDraggingEdge.value = false;
};

const handleCenterDragMove = (e: any) => {
  if (!isDraggingCenter.value) return;

  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  // 这里可以实现拖动圆心的逻辑
  // 简化版：不实际移动圆心，只做演示
};

const handleEdgeDragMove = (e: any) => {
  if (!isDraggingEdge.value) return;

  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  // 计算新半径（从圆心到鼠标位置的距离）
  const dx = pos.x - CENTER_X;
  const dy = pos.y - CENTER_Y;
  const newRadius = Math.sqrt(dx * dx + dy * dy);

  updateRadius(newRadius);

  // 计算角度
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  updateAngle((angle + 360) % 360);
};

// 生成网格线
const generateGrid = () => {
  const gridLines = [];
  const step = 50;

  // 水平线
  for (let y = 0; y <= CANVAS_HEIGHT; y += step) {
    gridLines.push({
      points: [0, y, CANVAS_WIDTH, y],
      stroke: "#E5E7EB",
      strokeWidth: 1
    });
  }

  // 垂直线
  for (let x = 0; x <= CANVAS_WIDTH; x += step) {
    gridLines.push({
      points: [x, 0, x, CANVAS_HEIGHT],
      stroke: "#E5E7EB",
      strokeWidth: 1
    });
  }

  return gridLines;
};

// 生成刻度和标签
const gridLines = generateGrid();

// 生成圆周上的标记点
const generateCircleMarkers = () => {
  const markers = [];
  const labels = [];

  circlePoints.forEach(angle => {
    const rad = (angle * Math.PI) / 180;
    const x = CENTER_X + radius.value * Math.cos(rad);
    const y = CENTER_Y + radius.value * Math.sin(rad);

    markers.push({
      x,
      y,
      radius: 4,
      fill: "#60A5FA"
    });

    labels.push({
      x: x + (angle === 0 ? 5 : angle === 180 ? -20 : 0),
      y: y + (angle === 90 ? 15 : angle === 270 ? -10 : 0),
      text: `${angle}°`,
      fontSize: 12,
      fill: "#4B5563"
    });
  });

  return { markers, labels };
};

const { markers: circleMarkers, labels: circleLabels } =
  generateCircleMarkers();
</script>

<template>
  <div
    class="bg-gradient-to-br from-light to-gray-100 min-h-screen font-sans text-dark"
  >
    <main class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6 text-center">
        初中圆知识互动学习工具
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧控制面板 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl p-6 shadow-lg h-full">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-sliders text-blue-500 mr-2" />
              圆参数控制
            </h2>

            <div class="space-y-6">
              <div>
                <label
                  for="radius"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  半径 (r): {{ radius }}
                </label>
                <input
                  id="radius"
                  v-model="radius"
                  type="range"
                  :min="MIN_RADIUS"
                  :max="MAX_RADIUS"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  @input="updateRadius(radius)"
                />
              </div>

              <div>
                <label
                  for="angle"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  圆心角 (θ): {{ centralAngle }}°
                </label>
                <input
                  id="angle"
                  v-model="centralAngle"
                  type="range"
                  min="0"
                  max="360"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  @input="updateAngle(centralAngle)"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="(angle, index) of circlePoints"
                  :key="index"
                  class="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded-lg transition-colors text-sm"
                  @click="updateAngle(angle)"
                >
                  {{ angle }}°
                </button>
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
                    class="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
                <button
                  class="mt-3 w-full py-2 rounded-lg transition-colors flex items-center justify-center"
                  :class="
                    isAnimating
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                  "
                  @click="toggleAnimation"
                >
                  {{ isAnimating ? "暂停动画" : "开始动画" }}
                </button>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h3 class="font-medium mb-3">显示选项</h3>
                <div class="space-y-2">
                  <label
                    v-for="(item, key) in shows"
                    :key="key"
                    class="flex items-center"
                  >
                    <input
                      v-model="item[0]"
                      type="checkbox"
                      class="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-gray-600 text-sm">{{
                      item[1]
                    }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧图形和信息展示 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl p-6 shadow-lg mb-6">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-circle-o text-blue-500 mr-2" />
              圆的基本元素与性质展示
            </h2>

            <div
              class="bg-gray-50 rounded-lg overflow-hidden relative h-[500px]"
            >
              <!-- 圆舞台 -->
              <v-stage :config="{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }">
                <v-layer>
                  <!-- 网格 -->
                  <template v-if="shows.showGrid[0]">
                    <v-line
                      v-for="(line, index) in gridLines"
                      :key="'grid-' + index"
                      :config="line"
                    />
                  </template>

                  <!-- 圆 -->
                  <v-circle
                    :config="{
                      x: CENTER_X,
                      y: CENTER_Y,
                      radius: radius.value,
                      stroke: '#3B82F6',
                      strokeWidth: 2,
                      fill: 'rgba(59, 130, 246, 0.05)'
                    }"
                  />

                  <!-- 直径 -->
                  <template v-if="shows.showDiameter[0]">
                    <v-line
                      :config="{
                        points: diameterLinePoints,
                        stroke: '#F59E0B',
                        strokeWidth: 2,
                        lineCap: 'round'
                      }"
                    />

                    <!-- 直径标签 -->
                    <v-text
                      v-if="shows.showLabels[0]"
                      :config="{
                        x: CENTER_X,
                        y: CENTER_Y - 10,
                        text: 'd = ' + diameter,
                        fontSize: 14,
                        fill: '#D97706'
                      }"
                    />
                  </template>

                  <!-- 半径 -->
                  <template v-if="shows.showRadius[0]">
                    <v-line
                      :config="{
                        points: radiusLinePoints,
                        stroke: '#10B981',
                        strokeWidth: 2,
                        lineCap: 'round'
                      }"
                    />

                    <!-- 半径标签 -->
                    <v-text
                      v-if="shows.showLabels[0]"
                      :config="{
                        x: (CENTER_X + edgePoint.x) / 2 + 10,
                        y: (CENTER_Y + edgePoint.y) / 2 - 10,
                        text: 'r = ' + radius,
                        fontSize: 14,
                        fill: '#059669'
                      }"
                    />
                  </template>

                  <!-- 圆弧 -->
                  <template v-if="shows.showArc[0]">
                    <v-arc
                      :config="{
                        x: CENTER_X,
                        y: CENTER_Y,
                        innerRadius: radius.value,
                        outerRadius: radius.value,
                        startAngle: 0,
                        endAngle: -centralAngle.value,
                        stroke: '#8B5CF6',
                        strokeWidth: 3,
                        fill: 'none'
                      }"
                    />
                  </template>

                  <!-- 弦 -->
                  <template v-if="shows.showChord[0]">
                    <v-line
                      :config="{
                        points: chordLinePoints,
                        stroke: '#EC4899',
                        strokeWidth: 2,
                        lineCap: 'round',
                        dash: [5, 2]
                      }"
                    />

                    <!-- 弦标签 -->
                    <v-text
                      v-if="shows.showLabels[0]"
                      :config="{
                        x: (CENTER_X + radius.value + edgePoint.x) / 2 + 10,
                        y: (CENTER_Y + edgePoint.y) / 2 + 10,
                        text: '弦',
                        fontSize: 12,
                        fill: '#BE185D'
                      }"
                    />
                  </template>

                  <!-- 圆心角 -->
                  <template v-if="shows.showCentralAngle[0]">
                    <v-arc
                      :config="{
                        x: CENTER_X,
                        y: CENTER_Y,
                        innerRadius: 20,
                        outerRadius: 40,
                        startAngle: 0,
                        endAngle: -centralAngle.value,
                        stroke: '#EF4444',
                        strokeWidth: 2,
                        fill: 'rgba(239, 68, 68, 0.1)'
                      }"
                    />

                    <!-- 角度标签 -->
                    <v-text
                      v-if="shows.showLabels[0]"
                      :config="{
                        x: angleLabelPosition.x,
                        y: angleLabelPosition.y,
                        text: centralAngle + '°',
                        fontSize: 14,
                        fill: '#DC2626'
                      }"
                    />
                  </template>

                  <!-- 圆周点标记 -->
                  <v-circle
                    v-for="(marker, index) in circleMarkers"
                    :key="'circle-marker-' + index"
                    :config="marker"
                  />

                  <v-text
                    v-for="(label, index) in circleLabels"
                    :key="'circle-label-' + index"
                    :config="label"
                  />

                  <!-- 圆心 -->
                  <v-circle
                    :config="{
                      x: CENTER_X,
                      y: CENTER_Y,
                      radius: 6,
                      fill: '#3B82F6',
                      stroke: 'white',
                      strokeWidth: 1,
                      draggable: true
                    }"
                    @dragstart="handleCenterDragStart"
                    @dragend="handleDragEnd"
                    @dragmove="handleCenterDragMove"
                  />

                  <!-- 圆周上的点（可拖动） -->
                  <v-circle
                    :config="{
                      x: edgePoint.x,
                      y: edgePoint.y,
                      radius: 6,
                      fill: '#10B981',
                      stroke: 'white',
                      strokeWidth: 1,
                      draggable: true
                    }"
                    @dragstart="handleEdgeDragStart"
                    @dragend="handleDragEnd"
                    @dragmove="handleEdgeDragMove"
                  />
                </v-layer>
              </v-stage>
            </div>
          </div>

          <!-- 计算公式和结果 -->
          <div class="bg-white rounded-xl p-6 shadow-lg">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-calculator text-blue-500 mr-2" />
              圆的计算公式与结果
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="font-medium text-gray-700 mb-2">直径公式</h3>
                <div class="flex items-center justify-between">
                  <MathJax formula="$$d = 2r$$" />
                  <span class="text-lg font-bold text-blue-600">{{
                    diameter
                  }}</span>
                </div>
              </div>

              <div class="bg-green-50 p-4 rounded-lg">
                <h3 class="font-medium text-gray-700 mb-2">周长公式</h3>
                <div class="flex items-center justify-between">
                  <MathJax formula="$$C = 2\pi r = \pi d$$" />
                  <span class="text-lg font-bold text-green-600">{{
                    circumference
                  }}</span>
                </div>
              </div>

              <div class="bg-purple-50 p-4 rounded-lg">
                <h3 class="font-medium text-gray-700 mb-2">面积公式</h3>
                <div class="flex items-center justify-between">
                  <MathJax formula="$$A = \pi r^2$$" />
                  <span class="text-lg font-bold text-purple-600">{{
                    area
                  }}</span>
                </div>
              </div>

              <div class="bg-orange-50 p-4 rounded-lg">
                <h3 class="font-medium text-gray-700 mb-2">弧长公式</h3>
                <div class="flex items-center justify-between">
                  <MathJax formula="$$L = \frac{\theta}{360} \times 2\pi r$$" />
                  <span class="text-lg font-bold text-orange-600">{{
                    arcLength
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-8 bg-dark text-white p-6 text-center">
      <p>初中圆知识互动学习工具 - 帮助理解圆的基本概念和性质</p>
    </footer>
  </div>
</template>

<style scoped>
:root {
  --primary: #3b82f6;
  --secondary: #10b981;
  --accent: #f59e0b;
  --dark: #1f2937;
  --light: #f9fafb;
}

.text-shadow {
  text-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

:deep(mjx-container) {
  margin: 0 !important;
  font-size: 1.1em !important;
}
</style>

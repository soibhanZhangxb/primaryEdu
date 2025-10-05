<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";

defineOptions({ name: "JCircle" });
// 常量定义
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

// 响应式状态
const circleProps = reactive({
  centerX: CENTER_X,
  centerY: CENTER_Y,
  radius: 150,
  stroke: "#3B82F6",
  strokeWidth: 2,
  fill: "rgba(59, 130, 246, 0.05)"
});

// 弦的属性
const chordProps = reactive({
  startAngle: 60,
  endAngle: 210,
  stroke: "#10B981",
  strokeWidth: 2,
  isVisible: true
});

// 切线属性
const tangentProps = reactive({
  angle: 45,
  length: 100,
  stroke: "#EF4444",
  strokeWidth: 2,
  isVisible: true
});

// 显示控制
const shows = reactive({
  showCenter: [true, "显示圆心"],
  showRadius: [true, "显示半径"],
  showDiameter: [true, "显示直径"],
  showChord: [true, "显示弦"],
  showArc: [true, "显示弧"],
  showTangent: [true, "显示切线"],
  showCentralAngle: [true, "显示圆心角"],
  showLabels: [true, "显示标签"]
});

// 动画状态
const isAnimating = ref(false);
const animationId = ref<number | null>(null);
const animationSpeed = ref(3);

// 计算属性 - 弦的端点坐标
const chordPoints = computed(() => {
  const startRad = (chordProps.startAngle * Math.PI) / 180;
  const endRad = (chordProps.endAngle * Math.PI) / 180;

  return [
    circleProps.centerX + circleProps.radius * Math.cos(startRad),
    circleProps.centerY + circleProps.radius * Math.sin(startRad),
    circleProps.centerX + circleProps.radius * Math.cos(endRad),
    circleProps.centerY + circleProps.radius * Math.sin(endRad)
  ];
});

// 计算属性 - 直径端点坐标
const diameterPoints = computed(() => {
  const angle = 0; // 水平直径
  const rad = (angle * Math.PI) / 180;

  return [
    circleProps.centerX + circleProps.radius * Math.cos(rad),
    circleProps.centerY + circleProps.radius * Math.sin(rad),
    circleProps.centerX - circleProps.radius * Math.cos(rad),
    circleProps.centerY - circleProps.radius * Math.sin(rad)
  ];
});

// 计算属性 - 半径端点坐标
const radiusPoints = computed(() => {
  const angle = 60; // 60度方向的半径
  const rad = (angle * Math.PI) / 180;

  return [
    circleProps.centerX,
    circleProps.centerY,
    circleProps.centerX + circleProps.radius * Math.cos(rad),
    circleProps.centerY + circleProps.radius * Math.sin(rad)
  ];
});

// 计算属性 - 切线坐标
const tangentPoints = computed(() => {
  const angle = (tangentProps.angle * Math.PI) / 180;
  // 切点坐标
  const tangentPointX =
    circleProps.centerX + circleProps.radius * Math.cos(angle);
  const tangentPointY =
    circleProps.centerY + circleProps.radius * Math.sin(angle);

  // 切线方向垂直于半径
  const tangentAngle = angle + Math.PI / 2;

  // 切线两端点
  return [
    tangentPointX - tangentProps.length * Math.cos(tangentAngle),
    tangentPointY - tangentProps.length * Math.sin(tangentAngle),
    tangentPointX + tangentProps.length * Math.cos(tangentAngle),
    tangentPointY + tangentProps.length * Math.sin(tangentAngle)
  ];
});

// 计算属性 - 切点坐标
const tangentPoint = computed(() => {
  const angle = (tangentProps.angle * Math.PI) / 180;
  return {
    x: circleProps.centerX + circleProps.radius * Math.cos(angle),
    y: circleProps.centerY + circleProps.radius * Math.sin(angle)
  };
});

// 计算属性 - 弧的参数
const arcProps = computed(() => {
  let startAngle = chordProps.startAngle;
  let endAngle = chordProps.endAngle;

  // 确保角度正确（Konva的角度是顺时针为正）
  startAngle = -startAngle;
  endAngle = -endAngle;

  // 计算优弧还是劣弧
  const isMinorArc = Math.abs(endAngle - startAngle) <= 180;

  return {
    innerRadius: circleProps.radius - 5,
    outerRadius: circleProps.radius + 5,
    startAngle,
    endAngle,
    isMinorArc,
    // 对于优弧，需要调整角度范围
    sweep: isMinorArc
      ? Math.abs(endAngle - startAngle)
      : 360 - Math.abs(endAngle - startAngle)
  };
});

// 计算属性 - 圆心角参数
const centralAngleProps = computed(() => {
  let startAngle = chordProps.startAngle;
  let endAngle = chordProps.endAngle;

  // 转换为Konva角度系统
  startAngle = -startAngle;
  endAngle = -endAngle;

  return {
    innerRadius: 20,
    outerRadius: 40,
    startAngle,
    endAngle,
    angle: Math.abs(endAngle - startAngle)
  };
});

// 方法 - 更新半径
const updateRadius = (radius: number) => {
  circleProps.radius = Math.max(50, Math.min(250, radius));
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

  // 动画效果：旋转弦和切线
  chordProps.startAngle = (chordProps.startAngle + 1) % 360;
  chordProps.endAngle = (chordProps.endAngle + 1.5) % 360;
  tangentProps.angle = (tangentProps.angle + 2) % 360;

  animationId.value = requestAnimationFrame(() => {
    setTimeout(animate, 1000 / animationSpeed.value);
  });
};

// 方法 - 处理拖动圆心
const handleCenterDrag = (e: any) => {
  const pos = e.target.getStage().getPointerPosition();
  if (pos) {
    circleProps.centerX = pos.x;
    circleProps.centerY = pos.y;
  }
};

// 方法 - 处理拖动弦的起点
const handleChordStartDrag = (e: any) => {
  const onMove = (moveEvent: any) => {
    const pos = moveEvent.target.getStage().getPointerPosition();
    if (!pos) return;

    // 计算从圆心到鼠标位置的角度
    const dx = pos.x - circleProps.centerX;
    const dy = pos.y - circleProps.centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // 标准化角度
    if (angle < 0) angle += 360;

    chordProps.startAngle = angle;
  };

  const onEnd = () => {
    e.target.off("dragmove", onMove);
    e.target.off("dragend", onEnd);
  };

  e.target.on("dragmove", onMove);
  e.target.on("dragend", onEnd);
};

// 方法 - 处理拖动弦的终点
const handleChordEndDrag = (e: any) => {
  const onMove = (moveEvent: any) => {
    const pos = moveEvent.target.getStage().getPointerPosition();
    if (!pos) return;

    // 计算从圆心到鼠标位置的角度
    const dx = pos.x - circleProps.centerX;
    const dy = pos.y - circleProps.centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // 标准化角度
    if (angle < 0) angle += 360;

    chordProps.endAngle = angle;
  };

  const onEnd = () => {
    e.target.off("dragmove", onMove);
    e.target.off("dragend", onEnd);
  };

  e.target.on("dragmove", onMove);
  e.target.on("dragend", onEnd);
};

// 方法 - 处理拖动切点
const handleTangentDrag = (e: any) => {
  const onMove = (moveEvent: any) => {
    const pos = moveEvent.target.getStage().getPointerPosition();
    if (!pos) return;

    // 计算从圆心到鼠标位置的角度
    const dx = pos.x - circleProps.centerX;
    const dy = pos.y - circleProps.centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // 标准化角度
    if (angle < 0) angle += 360;

    tangentProps.angle = angle;
  };

  const onEnd = () => {
    e.target.off("dragmove", onMove);
    e.target.off("dragend", onEnd);
  };

  e.target.on("dragmove", onMove);
  e.target.on("dragend", onEnd);
};

// 生成刻度线
const generateGrid = () => {
  const lines = [];
  const step = 50;

  // 水平线
  for (let y = 0; y <= CANVAS_HEIGHT; y += step) {
    lines.push({
      points: [0, y, CANVAS_WIDTH, y],
      stroke: "#E5E7EB",
      strokeWidth: 1
    });
  }

  // 垂直线
  for (let x = 0; x <= CANVAS_WIDTH; x += step) {
    lines.push({
      points: [x, 0, x, CANVAS_HEIGHT],
      stroke: "#E5E7EB",
      strokeWidth: 1
    });
  }

  return lines;
};

// 生成坐标轴标签
const generateAxisLabels = () => {
  const labels = [];
  const step = 50;

  // X轴标签
  for (let x = 0; x <= CANVAS_WIDTH; x += step) {
    labels.push({
      x,
      y: CANVAS_HEIGHT - 10,
      text: ((x - CENTER_X) / step).toString(),
      fontSize: 10,
      fill: "#6B7280",
      align: "center"
    });
  }

  // Y轴标签
  for (let y = 0; y <= CANVAS_HEIGHT; y += step) {
    labels.push({
      x: 10,
      y,
      text: ((CENTER_Y - y) / step).toString(),
      fontSize: 10,
      fill: "#6B7280",
      align: "left"
    });
  }

  return labels;
};

// 生成网格和标签
const gridLines = generateGrid();
const axisLabels = generateAxisLabels();

onMounted(() => {
  return () => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value);
    }
  };
});
</script>

<template>
  <div
    class="bg-gradient-to-br from-light to-gray-100 min-h-screen font-sans text-dark"
  >
    <main class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6 text-center">
        初中圆的性质与概念演示
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧控制面板 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl p-5 shadow-md h-full">
            <h2 class="text-xl font-bold mb-4 flex items-center">
              <i class="fa fa-sliders text-primary mr-2" />
              圆属性控制
            </h2>

            <div class="space-y-6">
              <!-- 半径控制 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  半径: {{ circleProps.radius }}px
                </label>
                <input
                  v-model.number="circleProps.radius"
                  type="range"
                  min="50"
                  max="250"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  @input="updateRadius(circleProps.radius)"
                />
              </div>

              <!-- 弦角度控制 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    弦起点角度: {{ Math.round(chordProps.startAngle) }}°
                  </label>
                  <input
                    v-model.number="chordProps.startAngle"
                    type="range"
                    min="0"
                    max="360"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    弦终点角度: {{ Math.round(chordProps.endAngle) }}°
                  </label>
                  <input
                    v-model.number="chordProps.endAngle"
                    type="range"
                    min="0"
                    max="360"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              </div>

              <!-- 切线角度控制 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  切线角度: {{ tangentProps.angle }}°
                </label>
                <input
                  v-model.number="tangentProps.angle"
                  type="range"
                  min="0"
                  max="360"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <!-- 动画控制 -->
              <div class="border-t border-gray-200 pt-4">
                <h3 class="font-medium mb-3">动画控制</h3>
                <button
                  class="w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  :class="
                    isAnimating
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                  "
                  @click="toggleAnimation"
                >
                  {{ isAnimating ? "暂停动画" : "开始动画" }}
                </button>

                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    动画速度: {{ animationSpeed }}x
                  </label>
                  <input
                    v-model.number="animationSpeed"
                    type="range"
                    min="1"
                    max="10"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              <!-- 显示选项 -->
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
                      class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span class="ml-2 text-gray-600">{{ item[1] }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧图形区域 -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl p-4 shadow-md">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold flex items-center">
                <i class="fa fa-circle-o text-primary mr-2" />
                圆的基本元素与性质
              </h2>
              <div class="text-sm text-gray-500">
                可拖动圆心、弦的端点和切点进行交互
              </div>
            </div>

            <!-- 圆的演示画布 -->
            <v-stage
              :width="CANVAS_WIDTH"
              :height="CANVAS_HEIGHT"
              class="border border-gray-200 rounded-lg bg-white"
            >
              <v-layer>
                <!-- 网格背景 -->
                <v-line
                  v-for="(line, index) in gridLines"
                  :key="'grid-' + index"
                  :points="line.points"
                  :stroke="line.stroke"
                  :strokeWidth="line.strokeWidth"
                />

                <!-- 坐标轴标签 -->
                <v-text
                  v-for="(label, index) in axisLabels"
                  :key="'label-' + index"
                  :x="label.x"
                  :y="label.y"
                  :text="label.text"
                  :fontSize="label.fontSize"
                  :fill="label.fill"
                  :align="label.align"
                />

                <!-- 圆 -->
                <v-circle
                  :x="circleProps.centerX"
                  :y="circleProps.centerY"
                  :radius="circleProps.radius"
                  :stroke="circleProps.stroke"
                  :strokeWidth="circleProps.strokeWidth"
                  :fill="circleProps.fill"
                />

                <!-- 直径 -->
                <v-line
                  v-if="shows.showDiameter[0]"
                  :points="diameterPoints"
                  stroke="#6366F1"
                  :strokeWidth="2"
                  :dash="[5, 5]"
                />
                <v-text
                  v-if="shows.showDiameter[0] && shows.showLabels[0]"
                  :x="(diameterPoints[0] + diameterPoints[2]) / 2 + 10"
                  :y="(diameterPoints[1] + diameterPoints[3]) / 2 - 10"
                  text="直径"
                  :fontSize="12"
                  fill="#6366F1"
                />

                <!-- 半径 -->
                <v-line
                  v-if="shows.showRadius[0]"
                  :points="radiusPoints"
                  stroke="#F59E0B"
                  :strokeWidth="2"
                />
                <v-text
                  v-if="shows.showRadius[0] && shows.showLabels[0]"
                  :x="(radiusPoints[0] + radiusPoints[2]) / 2 + 10"
                  :y="(radiusPoints[1] + radiusPoints[3]) / 2 + 10"
                  text="半径"
                  :fontSize="12"
                  fill="#F59E0B"
                />

                <!-- 弦 -->
                <v-line
                  v-if="shows.showChord[0]"
                  :points="chordPoints"
                  :stroke="chordProps.stroke"
                  :strokeWidth="chordProps.strokeWidth"
                />
                <v-text
                  v-if="shows.showChord[0] && shows.showLabels[0]"
                  :x="(chordPoints[0] + chordPoints[2]) / 2 + 10"
                  :y="(chordPoints[1] + chordPoints[3]) / 2 - 10"
                  text="弦"
                  :fontSize="12"
                  :fill="chordProps.stroke"
                />

                <!-- 弧 -->
                <v-arc
                  v-if="shows.showArc[0]"
                  :x="circleProps.centerX"
                  :y="circleProps.centerY"
                  :innerRadius="arcProps.innerRadius"
                  :outerRadius="arcProps.outerRadius"
                  :startAngle="arcProps.startAngle"
                  :endAngle="arcProps.endAngle"
                  fill="#10B981"
                  :opacity="0.3"
                />
                <v-text
                  v-if="shows.showArc[0] && shows.showLabels[0]"
                  :x="
                    circleProps.centerX +
                    Math.cos(
                      (((chordProps.startAngle + chordProps.endAngle) / 2) *
                        Math.PI) /
                        180
                    ) *
                      (circleProps.radius + 20)
                  "
                  :y="
                    circleProps.centerY +
                    Math.sin(
                      (((chordProps.startAngle + chordProps.endAngle) / 2) *
                        Math.PI) /
                        180
                    ) *
                      (circleProps.radius + 20)
                  "
                  :text="arcProps.isMinorArc ? '劣弧' : '优弧'"
                  :fontSize="12"
                  fill="#10B981"
                />

                <!-- 圆心角 -->
                <v-arc
                  v-if="shows.showCentralAngle[0]"
                  :x="circleProps.centerX"
                  :y="circleProps.centerY"
                  :innerRadius="centralAngleProps.innerRadius"
                  :outerRadius="centralAngleProps.outerRadius"
                  :startAngle="centralAngleProps.startAngle"
                  :endAngle="centralAngleProps.endAngle"
                  fill="#8B5CF6"
                  :opacity="0.5"
                />
                <v-text
                  v-if="shows.showCentralAngle[0] && shows.showLabels[0]"
                  :x="
                    circleProps.centerX +
                    50 *
                      Math.cos(
                        (((chordProps.startAngle + chordProps.endAngle) / 2) *
                          Math.PI) /
                          180
                      )
                  "
                  :y="
                    circleProps.centerY +
                    50 *
                      Math.sin(
                        (((chordProps.startAngle + chordProps.endAngle) / 2) *
                          Math.PI) /
                          180
                      )
                  "
                  :text="`圆心角: ${Math.round(centralAngleProps.angle)}°`"
                  :fontSize="11"
                  fill="#8B5CF6"
                />

                <!-- 切线 -->
                <v-line
                  v-if="shows.showTangent[0]"
                  :points="tangentPoints"
                  :stroke="tangentProps.stroke"
                  :strokeWidth="tangentProps.strokeWidth"
                />
                <v-text
                  v-if="shows.showTangent[0] && shows.showLabels[0]"
                  :x="(tangentPoints[0] + tangentPoints[2]) / 2 + 10"
                  :y="(tangentPoints[1] + tangentPoints[3]) / 2 - 10"
                  text="切线"
                  :fontSize="12"
                  :fill="tangentProps.stroke"
                />

                <!-- 切点到圆心的连线 (半径) -->
                <v-line
                  v-if="shows.showTangent[0] && shows.showRadius[0]"
                  :points="[
                    circleProps.centerX,
                    circleProps.centerY,
                    tangentPoint.x,
                    tangentPoint.y
                  ]"
                  stroke="#EF4444"
                  :strokeWidth="1"
                  :dash="[3, 3]"
                />

                <!-- 圆心 -->
                <v-circle
                  v-if="shows.showCenter[0]"
                  :x="circleProps.centerX"
                  :y="circleProps.centerY"
                  :radius="6"
                  fill="#3B82F6"
                  stroke="white"
                  :strokeWidth="2"
                  draggable
                  @dragmove="handleCenterDrag"
                />
                <v-text
                  v-if="shows.showCenter[0] && shows.showLabels[0]"
                  :x="circleProps.centerX + 10"
                  :y="circleProps.centerY - 10"
                  text="圆心"
                  :fontSize="12"
                  fill="#3B82F6"
                />

                <!-- 弦的起点 -->
                <v-circle
                  v-if="shows.showChord[0]"
                  :x="chordPoints[0]"
                  :y="chordPoints[1]"
                  :radius="5"
                  fill="#10B981"
                  stroke="white"
                  :strokeWidth="1"
                  draggable
                  @dragmove="handleChordStartDrag"
                />

                <!-- 弦的终点 -->
                <v-circle
                  v-if="shows.showChord[0]"
                  :x="chordPoints[2]"
                  :y="chordPoints[3]"
                  :radius="5"
                  fill="#10B981"
                  stroke="white"
                  :strokeWidth="1"
                  draggable
                  @dragmove="handleChordEndDrag"
                />

                <!-- 切点 -->
                <v-circle
                  v-if="shows.showTangent[0]"
                  :x="tangentPoint.x"
                  :y="tangentPoint.y"
                  :radius="5"
                  fill="#EF4444"
                  stroke="white"
                  :strokeWidth="1"
                  draggable
                  @dragmove="handleTangentDrag"
                />
                <v-text
                  v-if="shows.showTangent[0] && shows.showLabels[0]"
                  :x="tangentPoint.x + 10"
                  :y="tangentPoint.y + 10"
                  text="切点"
                  :fontSize="12"
                  fill="#EF4444"
                />
              </v-layer>
            </v-stage>

            <!-- 知识点说明 -->
            <div class="mt-4 bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
              <h3 class="font-medium text-blue-700 mb-2">圆的基本概念:</h3>
              <ul class="list-disc pl-5 space-y-1">
                <li>
                  <strong>圆心</strong>: 圆的中心，到圆上任意一点的距离相等
                </li>
                <li><strong>半径</strong>: 连接圆心和圆上任意一点的线段</li>
                <li>
                  <strong>直径</strong>:
                  通过圆心且两端都在圆上的线段，长度是半径的2倍
                </li>
                <li>
                  <strong>弦</strong>: 连接圆上任意两点的线段，直径是最长的弦
                </li>
                <li>
                  <strong>弧</strong>:
                  圆上任意两点间的部分，小于半圆的叫劣弧，大于半圆的叫优弧
                </li>
                <li>
                  <strong>切线</strong>:
                  与圆只有一个交点的直线，切线垂直于过切点的半径
                </li>
                <li><strong>圆心角</strong>: 顶点在圆心，两边为半径的角</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-8 py-4 text-center text-gray-500 text-sm">
      初中数学圆的性质交互式学习工具 | 拖动元素可交互探索
    </footer>
  </div>
</template>

<style scoped>
:root {
  --primary: #3b82f6;
  --light: #f9fafb;
  --dark: #1f2937;
}

.card-shadow {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}

label {
  font-weight: 400;
}
</style>

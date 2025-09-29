<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue"; // 导入新的绘图组件

defineOptions({ name: "JInverse" });

// Constants
let CANVAS_WIDTH = 940;
let CANVAS_HEIGHT = 580;
let origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const SCALE = 40; // pixels per unit

const gGrid = ref({ lines: [], labels: [] });
// Reactive state
const k = ref(1); // 反比例系数
const showGraph = ref(true);
const showGrid = ref(true);
const showAsymptotes = ref(true); // 显示渐近线
const enableDrawing = ref(false);
const mousePos = ref({ x: 0, y: 0 }); //当前鼠标坐标位置

// Canvas references
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);

// Computed properties
//方程式
const equation = computed(() => {
  return `y = ${k.value}/x`;
});

// 渐近线
const asymptotes = computed(() => {
  if (!showAsymptotes.value || !showGraph.value) return [];
  return [
    {
      // x轴渐近线 (y=0)
      points: [0, origin.y, CANVAS_WIDTH, origin.y],
      stroke: "#ff6b6b",
      strokeWidth: 2,
      dash: [5, 5]
    },
    {
      // y轴渐近线 (x=0)
      points: [origin.x, 0, origin.x, CANVAS_HEIGHT],
      stroke: "#ff6b6b",
      strokeWidth: 2,
      dash: [5, 5]
    }
  ];
});

// 反比例函数曲线 - 改进版
const inverseCurve = computed(() => {
  if (!showGraph.value) return null;

  const points = [[], []];
  const step = 0.1; // 更小的采样步长
  const maxX = origin.x / SCALE;
  const maxY = origin.y / SCALE;

  // 第一四象限曲线 (x > 0)
  for (let x = step; x <= maxX; x += step) {
    const y = k.value / x;
    // 跳过超出画布的点
    if (Math.abs(y) > maxY + 5) continue;
    points[0].push(origin.x + x * SCALE);
    points[0].push(origin.y - y * SCALE);
  }

  // 第二三象限曲线 (x < 0)
  for (let x = -step; x >= -maxX; x -= step) {
    const y = k.value / x;
    // 跳过超出画布的点
    if (Math.abs(y) > maxY + 5) continue;
    points[1].push(origin.x + x * SCALE);
    points[1].push(origin.y - y * SCALE);
  }
  return [
    {
      points: points[0],
      stroke: "#3a7bd5",
      strokeWidth: 3,
      tension: 0.5 // 使曲线更平滑
    },
    {
      points: points[1],
      stroke: "#3a7bd5",
      strokeWidth: 3,
      tension: 0.5 // 使曲线更平滑
    }
  ];
});

// Methods
const resetView = () => {
  k.value = 1;
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
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva">
    <!-- Canvas Section -->
    <div class="flex-1">
      <div class="border rounded-lg overflow-hidden bg-white">
        <div>
          <div class="p-2 flex justify-between items-center border-left-blue">
            <div class="text-sm font-medium text-gray-700 bg-gray">
              探索反比例函数 y = k/x 的图像变化规律
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
                <!-- Asymptotes 渐近线 -->
                <v-line
                  v-for="(line, index) in asymptotes"
                  :key="'asymptote-' + index"
                  :config="line"
                />

                <!-- 反比例函数方程曲线图 -->
                <template v-for="(item, index) in inverseCurve" :key="index">
                  <v-line :config="item" />
                </template>
                <!-- Equation Label 右上角公式 -->
                <k-text-with-bg
                  :text="equation"
                  :x="CANVAS_WIDTH - 200"
                  :y="2"
                  :fontSize="16"
                  bg-color="#3a7bd5bb"
                  text-color="white"
                  :corner-radius="8"
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
            <p class="text-sm text-gray-600">比例系数 K</p>
            <p class="text-lg font-mono">{{ k.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              比例系数k: {{ k.toFixed(2) }}
            </label>
            <el-slider
              v-model="k"
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
          <el-checkbox v-model="showAsymptotes">显示渐近线</el-checkbox>
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
</style>

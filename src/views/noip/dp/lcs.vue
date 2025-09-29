<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";

defineOptions({ name: "JLCSVisualizer" });

// Constants
const CANVAS_WIDTH = 940;
const CANVAS_HEIGHT = 580;
const origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const CELL_SIZE = 60;

const gGrid = ref({ lines: [], labels: [] });

// Reactive state
const str1 = ref("ABCBDAB");
const str2 = ref("BDCABA");
const speed = ref(500);
const isPlaying = ref(false);
const currentStep = ref(0);
const totalSteps = ref(0);
const lcsResult = ref("");
const steps = ref<any[]>([]);
const showGrid = ref(true);
const enableDrawing = ref(false);
const mousePos = ref({ x: 0, y: 0 });

// Canvas references
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);

// 颜色定义
const colors = {
  current: "#ff7875", // 当前单元格
  match: "#95de64", // 字符匹配
  left: "#69c0ff", // 左边单元格
  top: "#69c0ff", // 上面单元格
  topLeft: "#ff9c6e", // 左上角单元格
  arrow: "#597ef7", // 箭头颜色
  text: "#314659" // 文本颜色
};

// 计算LCS并生成步骤
const calculateLCS = () => {
  const s1 = str1.value;
  const s2 = str2.value;
  const m = s1.length;
  const n = s2.length;

  // 初始化DP表
  const dp = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  const directions = Array(m + 1)
    .fill("")
    .map(() => Array(n + 1).fill(""));

  // 生成步骤
  const newSteps = [];

  // 基础情况步骤
  for (let i = 0; i <= m; i++) {
    dp[i][0] = 0;
    directions[i][0] = "↑";
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = 0;
    directions[0][j] = "←";
  }

  newSteps.push({
    description: `初始化DP表：第一行和第一列都设为0`,
    dp: JSON.parse(JSON.stringify(dp)),
    directions: JSON.parse(JSON.stringify(directions)),
    i: 0,
    j: 0,
    highlight: []
  });

  // 填充DP表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const highlights = [
        { i, j, color: colors.current }, // 当前单元格
        { i: i - 1, j, color: colors.top }, // 上面单元格
        { i, j: j - 1, color: colors.left }, // 左边单元格
        { i: i - 1, j: j - 1, color: colors.topLeft } // 左上角单元格
      ];

      if (s1[i - 1] === s2[j - 1]) {
        // 字符匹配，取左上角值+1
        dp[i][j] = dp[i - 1][j - 1] + 1;
        directions[i][j] = "↖";
        newSteps.push({
          description: `X[${i}] = '${s1[i - 1]}' 和 Y[${j}] = '${s2[j - 1]}' 相等，取左上角值 ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}`,
          dp: JSON.parse(JSON.stringify(dp)),
          directions: JSON.parse(JSON.stringify(directions)),
          i,
          j,
          highlight: highlights
        });
      } else {
        // 字符不匹配，取左边或上面的最大值
        if (dp[i - 1][j] >= dp[i][j - 1]) {
          dp[i][j] = dp[i - 1][j];
          directions[i][j] = "↑";
          newSteps.push({
            description: `X[${i}] = '${s1[i - 1]}' 和 Y[${j}] = '${s2[j - 1]}' 不相等，取上面值 ${dp[i - 1][j]}（大于左边值 ${dp[i][j - 1]}）`,
            dp: JSON.parse(JSON.stringify(dp)),
            directions: JSON.parse(JSON.stringify(directions)),
            i,
            j,
            highlight: highlights
          });
        } else {
          dp[i][j] = dp[i][j - 1];
          directions[i][j] = "←";
          newSteps.push({
            description: `X[${i}] = '${s1[i - 1]}' 和 Y[${j}] = '${s2[j - 1]}' 不相等，取左边值 ${dp[i][j - 1]}（大于上面值 ${dp[i - 1][j]}）`,
            dp: JSON.parse(JSON.stringify(dp)),
            directions: JSON.parse(JSON.stringify(directions)),
            i,
            j,
            highlight: highlights
          });
        }
      }
    }
  }

  // 回溯找出LCS
  let i = m,
    j = n;
  const lcs = [];
  const backtrackSteps = [];

  while (i > 0 && j > 0) {
    const highlights = [{ i, j, color: colors.current }];

    if (directions[i][j] === "↖") {
      lcs.unshift(s1[i - 1]);
      backtrackSteps.push({
        description: `回溯：X[${i}] = '${s1[i - 1]}' 和 Y[${j}] = '${s2[j - 1]}' 匹配，加入LCS`,
        dp: JSON.parse(JSON.stringify(dp)),
        directions: JSON.parse(JSON.stringify(directions)),
        i,
        j,
        highlight: highlights,
        lcs: [...lcs]
      });
      i--;
      j--;
    } else if (directions[i][j] === "↑") {
      backtrackSteps.push({
        description: `回溯：方向向上，移动到 (${i - 1}, ${j})`,
        dp: JSON.parse(JSON.stringify(dp)),
        directions: JSON.parse(JSON.stringify(directions)),
        i,
        j,
        highlight: highlights
      });
      i--;
    } else {
      backtrackSteps.push({
        description: `回溯：方向向左，移动到 (${i}, ${j - 1})`,
        dp: JSON.parse(JSON.stringify(dp)),
        directions: JSON.parse(JSON.stringify(directions)),
        i,
        j,
        highlight: highlights
      });
      j--;
    }
  }

  steps.value = [...newSteps, ...backtrackSteps];
  totalSteps.value = steps.value.length;
  lcsResult.value = lcs.join("");
  currentStep.value = 0;
};

// 控制播放
let playInterval: any = null;

const play = () => {
  if (isPlaying.value) {
    pause();
    return;
  }

  isPlaying.value = true;
  playInterval = setInterval(() => {
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++;
    } else {
      pause();
    }
  }, 1000 - speed.value);
};

const pause = () => {
  isPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

const prevStep = () => {
  pause();
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const nextStep = () => {
  pause();
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++;
  }
};

const restart = () => {
  pause();
  currentStep.value = 0;
};

// 当输入字符串变化时重新计算
const onInputChange = () => {
  pause();
  calculateLCS();
};

// 计算当前步骤的单元格颜色
const getCellColor = (i: number, j: number) => {
  if (!steps.value.length) return i === 0 || j === 0 ? "#f0f0f0" : "white";

  const step = steps.value[currentStep.value];
  const highlight = step.highlight.find((h: any) => h.i === i && h.j === j);

  return highlight ? highlight.color : i === 0 || j === 0 ? "#f0f0f0" : "white";
};

// 获取当前步骤的描述
const currentDescription = computed(() => {
  return steps.value[currentStep.value]?.description || "";
});

// 获取当前步骤的LCS
const currentLCS = computed(() => {
  return steps.value[currentStep.value]?.lcs?.join("") || "";
});

// Lifecycle hooks
onMounted(() => {
  gGrid.value = DUtils.drawGrid(CANVAS_WIDTH, CANVAS_HEIGHT, origin, CELL_SIZE);
  calculateLCS();
});
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva">
    <!-- Canvas Section -->
    <div class="flex-1">
      <div class="border rounded-lg overflow-hidden bg-white">
        <div>
          <div class="p-2 flex justify-between items-center border-left-blue">
            <div class="bg-gray">探索最长公共子序列(LCS)算法</div>
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
                <!-- 绘制网格 -->
                <template v-if="showGrid">
                  <v-line
                    v-for="(line, index) in gGrid.lines"
                    :key="'line-' + index"
                    :config="line"
                  />
                </template>

                <!-- 绘制当前步骤说明 -->
                <v-text
                  :config="{
                    x: 20,
                    y: 20,
                    text: currentDescription,
                    fontSize: 18,
                    width: CANVAS_WIDTH - 40,
                    fill: colors.text
                  }"
                />

                <!-- 绘制LCS结果（如果有） -->
                <v-text
                  v-if="currentLCS"
                  :config="{
                    x: CANVAS_WIDTH - 200,
                    y: 20,
                    text: `LCS: ${currentLCS}`,
                    fontSize: 18,
                    fill: '#ff4d4f',
                    fontStyle: 'bold'
                  }"
                />

                <!-- 绘制列标签（字符串2） -->
                <v-text
                  v-for="j in str2.length + 1"
                  :key="'col-label-' + j"
                  :config="{
                    x: 100 + (j - 1) * CELL_SIZE,
                    y: 100 - CELL_SIZE,
                    text: j === 1 ? 'Y/X' : `${str2[j - 2]}[${j - 1}]`,
                    fontSize: 16,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    align: 'center',
                    verticalAlign: 'middle',
                    fill: '#64B5F6'
                  }"
                />

                <!-- 绘制行标签（字符串1） -->
                <v-text
                  v-for="i in str1.length + 1"
                  :key="'row-label-' + i"
                  :config="{
                    x: 100 - CELL_SIZE,
                    y: 100 + (i - 1) * CELL_SIZE,
                    text: i === 1 ? '' : `${str1[i - 2]}[${i - 1}]`,
                    fontSize: 16,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    align: 'center',
                    verticalAlign: 'middle',
                    fill: '#FF6B6B'
                  }"
                />

                <!-- 绘制DP表格单元格 -->
                <template v-for="i in str1.length + 1" :key="'row-' + i">
                  <template v-for="j in str2.length + 1" :key="'cell-' + j">
                    <!-- 单元格矩形 -->
                    <v-rect
                      :config="{
                        x: 100 + (j - 1) * CELL_SIZE,
                        y: 100 + (i - 1) * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        fill: getCellColor(i - 1, j - 1),
                        stroke: '#ddd',
                        strokeWidth: 1
                      }"
                    />

                    <!-- DP值文本 -->
                    <v-text
                      v-if="
                        steps.length &&
                        steps[currentStep]?.dp[i - 1]?.[j - 1] !== undefined
                      "
                      :config="{
                        x: 100 + (j - 1) * CELL_SIZE,
                        y: 100 + (i - 1) * CELL_SIZE,
                        text: steps[currentStep].dp[i - 1][j - 1].toString(),
                        fontSize: 20,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        align: 'center',
                        verticalAlign: 'middle',
                        fill: colors.text
                      }"
                    />

                    <!-- 方向箭头 -->
                    <v-text
                      v-if="
                        steps.length &&
                        steps[currentStep]?.directions[i - 1]?.[j - 1]
                      "
                      :config="{
                        x: 100 + (j - 1) * CELL_SIZE + CELL_SIZE - 20,
                        y: 100 + (i - 1) * CELL_SIZE + CELL_SIZE - 20,
                        text: steps[currentStep].directions[i - 1][j - 1],
                        fontSize: 16,
                        fill: colors.arrow
                      }"
                    />
                  </template>
                </template>
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
        <h3 class="text-lg font-semibold mb-4 text-gray-800">算法信息:</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">字符串 X</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              {{ str1 }}
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">字符串 Y</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              {{ str2 }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between h-full">
            <label
              class="block text-sm font-medium text-gray-700 mb-1"
              style="width: 100px"
            >
              字符串 X:
            </label>
            <el-input
              v-model="str1"
              placeholder="请输入第一个字符串"
              @change="onInputChange"
            />
          </div>
          <div class="flex items-center justify-between h-full">
            <label
              class="block text-sm font-medium text-gray-700 mb-1"
              style="width: 100px"
            >
              字符串 Y:
            </label>
            <el-input
              v-model="str2"
              placeholder="请输入第二个字符串"
              @change="onInputChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              动画速度: {{ speed }}
            </label>
            <el-slider v-model="speed" :min="0" :max="900" :step="50" />
          </div>
          <el-button type="primary" class="w-full" @click="calculateLCS">
            计算LCS
          </el-button>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">步骤控制</h3>
        <div class="step-controls">
          <el-button :disabled="currentStep === 0" @click="prevStep"
            >上一步</el-button
          >
          <el-button :disabled="currentStep >= totalSteps - 1" @click="nextStep"
            >下一步</el-button
          >
          <el-button :type="isPlaying ? 'danger' : 'success'" @click="play">
            {{ isPlaying ? "暂停" : "播放" }}
          </el-button>
          <el-button @click="restart">重新开始</el-button>
        </div>
        <div class="mt-3 text-center text-sm text-gray-600">
          步骤: {{ currentStep + 1 }} / {{ totalSteps }}
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">计算结果</h3>
        <div class="result-box">
          <p class="text-sm font-medium text-gray-700">最长公共子序列:</p>
          <p class="text-lg font-mono mt-2 text-blue-600 font-bold">
            {{ lcsResult }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.border-left-blue {
  border-left: 4px solid #409eff;
}

.mkonva {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 12px;
}

:deep(.el-slider__input) {
  width: 110px;
}

.step-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
</style>

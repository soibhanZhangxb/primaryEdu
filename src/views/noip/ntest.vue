<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";

defineOptions({ name: "ClimbStairsVisualizer" });

// 常量定义
const CANVAS_WIDTH = 940;
const CANVAS_HEIGHT = 580;
const origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80 }; // 原点在底部中间
const STEP_WIDTH = 120; // 台阶宽度
const STEP_HEIGHT = 60; // 台阶高度
const HUMAN_SIZE = 40; // 人物尺寸

// 网格相关
const gGrid = ref({ lines: [], labels: [] });

// 响应式状态
const stairsCount = ref(5); // 台阶数量
const speed = ref(500); // 动画速度
const isPlaying = ref(false); // 是否播放中
const currentStep = ref(0); // 当前步骤
const totalSteps = ref(0); // 总步骤数
const dpResult = ref<number[]>([]); // DP结果数组
const steps = ref<any[]>([]); // 步骤数组
const showGrid = ref(true); // 是否显示网格
const enableDrawing = ref(false); // 是否启用绘图
const mousePos = ref({ x: 0, y: 0 }); // 鼠标位置

// Canvas引用
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);

// 颜色定义
const colors = {
  currentStep: "#ff7875", // 当前步骤
  dpCell: "#95de64", // DP单元格
  stairs: "#e6a23c", // 台阶颜色
  human: "#409eff", // 人物颜色
  text: "#314659", // 文本颜色
  arrow: "#597ef7", // 箭头颜色
  background: "#f9fafc" // 背景色
};

// 计算爬楼梯方案并生成步骤
const calculateClimbStairs = () => {
  const n = stairsCount.value;
  const newSteps = [];
  const dp = new Array(n + 1).fill(0);

  // 步骤1: 初始化DP数组
  dp[0] = 1; // 0级台阶1种方法（不动）
  if (n >= 1) dp[1] = 1; // 1级台阶1种方法

  newSteps.push({
    description: `初始化DP数组：dp[0] = 1（0级台阶1种方法），dp[1] = 1（1级台阶1种方法）`,
    dp: [...dp],
    humanPos: { x: origin.x - HUMAN_SIZE / 2, y: origin.y - HUMAN_SIZE }, // 人物在地面
    currentStair: 0,
    highlight: [0, 1]
  });

  // 步骤2: 填充DP数组（从2级台阶开始）
  for (let i = 2; i <= n; i++) {
    // 状态转移方程：dp[i] = dp[i-1] + dp[i-2]
    dp[i] = dp[i - 1] + dp[i - 2];

    newSteps.push({
      description: `计算dp[${i}]：到达第${i}级台阶可从第${i - 1}级跨1步或第${i - 2}级跨2步，故dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      dp: [...dp],
      humanPos: {
        x: origin.x - HUMAN_SIZE / 2 + ((i - 1) * STEP_WIDTH) / 2,
        y: origin.y - HUMAN_SIZE - ((i - 1) * STEP_HEIGHT) / 2
      }, // 人物移动中
      currentStair: i,
      highlight: [i - 2, i - 1, i]
    });
  }

  // 步骤3: 最终结果展示
  newSteps.push({
    description: `计算完成！爬上${n}级台阶共有${dp[n]}种不同方法`,
    dp: [...dp],
    humanPos: {
      x: origin.x - HUMAN_SIZE / 2 + (n - 1) * STEP_WIDTH,
      y: origin.y - HUMAN_SIZE - n * STEP_HEIGHT
    }, // 人物在顶部台阶
    currentStair: n,
    highlight: [n]
  });

  // 步骤4: 动画演示每种爬楼方案
  const plans = generateClimbPlans(n);
  plans.forEach((plan, index) => {
    newSteps.push({
      description: `方案${index + 1}：${plan.description}`,
      dp: [...dp],
      humanPos: getHumanPosByPlan(plan.steps, n), // 人物按方案移动
      currentStair: n,
      highlight: [n],
      currentPlan: plan
    });
  });

  // 更新状态
  steps.value = newSteps;
  totalSteps.value = steps.value.length;
  dpResult.value = dp;
  currentStep.value = 0;
};

// 生成爬楼梯方案（递归）
const generateClimbPlans = (n: number): any[] => {
  const plans: any[] = [];

  const backtrack = (current: number, path: number[]) => {
    if (current === n) {
      plans.push({
        steps: [...path],
        description: path.map(step => `跨${step}步`).join(" → ")
      });
      return;
    }
    if (current > n) return;

    // 跨1步
    path.push(1);
    backtrack(current + 1, path);
    path.pop();

    // 跨2步
    path.push(2);
    backtrack(current + 2, path);
    path.pop();
  };

  backtrack(0, []);
  return plans;
};

// 根据方案获取人物位置
const getHumanPosByPlan = (planSteps: number[], totalStairs: number) => {
  const totalHeight = totalStairs * STEP_HEIGHT;
  const totalWidth = totalStairs * STEP_WIDTH;

  // 计算总步数对应的位置
  let currentStair = 0;
  planSteps.forEach(step => {
    currentStair += step;
  });

  return {
    x: origin.x - HUMAN_SIZE / 2 + (currentStair - 1) * STEP_WIDTH,
    y: origin.y - HUMAN_SIZE - currentStair * STEP_HEIGHT
  };
};

// 动画控制
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
  }, 1500 - speed.value); // 速度调整公式
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

// 台阶数量变化时重新计算
const onStairsCountChange = () => {
  // 限制台阶数量在1-10之间
  if (stairsCount.value < 1) stairsCount.value = 1;
  if (stairsCount.value > 10) stairsCount.value = 10;

  pause();
  calculateClimbStairs();
};

// 计算当前步骤的描述
const currentDescription = computed(() => {
  return (
    steps.value[currentStep.value]?.description || "请点击计算按钮开始演示"
  );
});

// 计算当前人物位置
const currentHumanPos = computed(() => {
  if (!steps.value.length) {
    return { x: origin.x - HUMAN_SIZE / 2, y: origin.y - HUMAN_SIZE };
  }
  return steps.value[currentStep.value].humanPos;
});

// 计算当前高亮的DP单元格
const currentHighlight = computed(() => {
  return steps.value[currentStep.value]?.highlight || [];
});

// 计算当前方案
const currentPlan = computed(() => {
  return steps.value[currentStep.value]?.currentPlan || null;
});

const sumSteps = (steps: number[], endIndex: number): number => {
  return steps.slice(0, endIndex + 1).reduce((sum, step) => sum + step, 0);
};

// 生命周期钩子
onMounted(() => {
  // 绘制网格
  gGrid.value = DUtils.drawGrid(
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    { x: 0, y: 0 },
    50
  );
  // 初始计算
  calculateClimbStairs();
});

// 监听台阶数量变化
watch(stairsCount, onStairsCountChange);
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva">
    <!-- 画布区域 -->
    <div class="flex-1">
      <div class="border rounded-lg overflow-hidden bg-white">
        <div>
          <div class="p-2 flex justify-between items-center border-left-blue">
            <div class="bg-gray">爬楼梯算法动画演示</div>
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
              :config="{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                fill: colors.background
              }"
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
                    fill: colors.text,
                    wrap: 'word'
                  }"
                />

                <!-- 绘制DP表格 -->
                <template v-if="steps.length">
                  <v-text
                    :config="{
                      x: 20,
                      y: 60,
                      text: 'DP数组（dp[i]表示爬上i级台阶的方法数）:',
                      fontSize: 16,
                      fill: colors.text
                    }"
                  />

                  <!-- DP单元格 -->
                  <template
                    v-for="(value, index) in steps[currentStep].dp"
                    :key="`dp-cell-${index}`"
                  >
                    <v-rect
                      :config="{
                        x: 20 + index * 80,
                        y: 90,
                        width: 70,
                        height: 40,
                        fill: currentHighlight.includes(index)
                          ? colors.currentStep
                          : colors.dpCell,
                        stroke: '#ddd',
                        strokeWidth: 2,
                        cornerRadius: 4
                      }"
                    />
                    <v-text
                      :config="{
                        x: 20 + index * 80,
                        y: 90,
                        text: `dp[${index}]`,
                        fontSize: 14,
                        width: 70,
                        height: 20,
                        align: 'center',
                        verticalAlign: 'middle',
                        fill: colors.text
                      }"
                    />
                    <v-text
                      :config="{
                        x: 20 + index * 80,
                        y: 110,
                        text: value.toString(),
                        fontSize: 16,
                        fontWeight: 'bold',
                        width: 70,
                        height: 20,
                        align: 'center',
                        verticalAlign: 'middle',
                        fill: colors.text
                      }"
                    />
                  </template>
                </template>

                <!-- 绘制台阶 -->
                <template v-for="i in stairsCount" :key="`stair-${i}`">
                  <v-rect
                    :config="{
                      x:
                        origin.x -
                        (stairsCount * STEP_WIDTH) / 2 +
                        (i - 1) * STEP_WIDTH,
                      y: origin.y - i * STEP_HEIGHT,
                      width: STEP_WIDTH,
                      height: STEP_HEIGHT,
                      fill: colors.stairs,
                      stroke: '#d48806',
                      strokeWidth: 2
                    }"
                  />
                  <v-text
                    :config="{
                      x:
                        origin.x -
                        (stairsCount * STEP_WIDTH) / 2 +
                        (i - 1) * STEP_WIDTH,
                      y: origin.y - i * STEP_HEIGHT + STEP_HEIGHT / 2,
                      text: `第${i}级`,
                      fontSize: 16,
                      width: STEP_WIDTH,
                      height: STEP_HEIGHT,
                      align: 'center',
                      verticalAlign: 'middle',
                      fill: '#fff',
                      fontWeight: 'bold'
                    }"
                  />
                </template>

                <!-- 绘制地面 -->
                <v-rect
                  :config="{
                    x: 0,
                    y: origin.y,
                    width: CANVAS_WIDTH,
                    height: 20,
                    fill: '#909399',
                    stroke: '#606266',
                    strokeWidth: 2
                  }"
                />

                <!-- 绘制人物 -->
                <v-circle
                  :config="{
                    x: currentHumanPos.x + HUMAN_SIZE / 2,
                    y: currentHumanPos.y + HUMAN_SIZE / 2,
                    radius: HUMAN_SIZE / 2,
                    fill: colors.human,
                    stroke: '#1890ff',
                    strokeWidth: 2
                  }"
                />
                <v-text
                  :config="{
                    x: currentHumanPos.x,
                    y: currentHumanPos.y,
                    text: '人',
                    fontSize: 20,
                    width: HUMAN_SIZE,
                    height: HUMAN_SIZE,
                    align: 'center',
                    verticalAlign: 'middle',
                    fill: '#fff',
                    fontWeight: 'bold'
                  }"
                />

                <!-- 绘制当前方案（如果有） -->
                <template v-if="currentPlan">
                  <v-text
                    :config="{
                      x: CANVAS_WIDTH - 300,
                      y: 60,
                      text: `当前方案：${currentPlan.description}`,
                      fontSize: 16,
                      fill: '#ff4d4f',
                      fontWeight: 'bold'
                    }"
                  />

                  <!-- 绘制方案步骤箭头 -->
                  <template
                    v-for="(step, index) in currentPlan.steps"
                    :key="`plan-arrow-${index}`"
                  >
                    <v-arrow
                      v-if="index < currentPlan.steps.length - 1"
                      :config="{
                        points: [
                          origin.x -
                            (stairsCount * STEP_WIDTH) / 2 +
                            (sumSteps(currentPlan.steps, index) - 1) *
                              STEP_WIDTH +
                            STEP_WIDTH / 2,
                          origin.y -
                            sumSteps(currentPlan.steps, index) * STEP_HEIGHT +
                            STEP_HEIGHT / 2,
                          origin.x -
                            (stairsCount * STEP_WIDTH) / 2 +
                            sumSteps(currentPlan.steps, index + 1) *
                              STEP_WIDTH -
                            STEP_WIDTH / 2,
                          origin.y -
                            sumSteps(currentPlan.steps, index + 1) *
                              STEP_HEIGHT +
                            STEP_HEIGHT / 2
                        ],
                        stroke: colors.arrow,
                        strokeWidth: 3,
                        fill: 'none',
                        pointerLength: 10,
                        pointerWidth: 8
                      }"
                    />
                  </template>
                </template>
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
        <h3 class="text-lg font-semibold mb-4 text-gray-800">算法信息:</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">问题描述</p>
            <p class="text-sm text-gray-800">
              一个人每次可以爬1级或2级台阶，求爬上n级台阶的不同方法数
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">核心公式</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              dp[i] = dp[i-1] + dp[i-2]
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">时间复杂度</p>
            <p class="text-lg font-mono font-bold text-blue-600">O(n)</p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">空间复杂度</p>
            <p class="text-lg font-mono font-bold text-blue-600">O(n)</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              台阶数量: {{ stairsCount }} 级
            </label>
            <el-slider
              v-model="stairsCount"
              :min="1"
              :max="10"
              :step="1"
              @change="onStairsCountChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              动画速度: {{ speed }}
            </label>
            <el-slider v-model="speed" :min="100" :max="900" :step="50" />
          </div>
          <el-button
            type="primary"
            class="w-full"
            @click="calculateClimbStairs"
          >
            重新计算
          </el-button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">步骤控制</h3>
        <div class="step-controls">
          <el-button :disabled="currentStep === 0" @click="prevStep">
            上一步
          </el-button>
          <el-button
            :disabled="currentStep >= totalSteps - 1"
            @click="nextStep"
          >
            下一步
          </el-button>
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
          <p class="text-sm font-medium text-gray-700">
            爬上{{ stairsCount }}级台阶的方法数:
          </p>
          <p class="text-2xl font-mono mt-2 text-blue-600 font-bold">
            {{ dpResult[stairsCount] || 0 }} 种
          </p>
          <p v-if="dpResult.length > 0" class="text-sm text-gray-500 mt-2">
            DP数组: [{{ dpResult.join(", ") }}]
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- 辅助函数：计算步骤总和 -->
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

.result-box {
  padding: 10px;
  text-align: center;
  background-color: #f0f7ff;
  border-radius: 8px;
}
</style>

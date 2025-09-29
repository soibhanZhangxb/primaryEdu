<template>
  <div class="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 shadow mkonva">
    <!-- 可视化区域 -->
    <div class="flex-1">
      <div class="border rounded-lg overflow-hidden bg-white">
        <div>
          <div class="p-2 flex justify-between items-center border-left-blue">
            <div class="bg-gray">爬楼梯算法可视化 - 动态规划方法</div>
          </div>

          <div class="relative">
            <v-stage ref="stage" :config="stageConfig">
              <v-layer>
                <!-- 绘制楼梯 -->
                <v-rect
                  v-for="(stair, index) in stairs"
                  :key="'stair-' + index"
                  :config="stair.config"
                  @click="handleStairClick(index)"
                />

                <!-- 绘制楼梯编号 -->
                <v-text
                  v-for="(stair, index) in stairs"
                  :key="'label-' + index"
                  :config="{
                    x: stair.config.x + stair.config.width / 2 - 10,
                    y: stair.config.y + stair.config.height / 2 - 10,
                    text: index.toString(),
                    fontSize: 16,
                    fill: '#333'
                  }"
                />

                <!-- 绘制方式数 -->
                <v-text
                  v-for="(stair, index) in stairs"
                  :key="'ways-' + index"
                  :config="{
                    x: stair.config.x + stair.config.width / 2 - 15,
                    y: stair.config.y + stair.config.height / 2 + 15,
                    text: 'f(' + index + ')=' + stair.ways,
                    fontSize: 14,
                    fill: stair.highlight ? '#1890ff' : '#666'
                  }"
                />

                <!-- 绘制箭头 -->
                <v-arrow
                  v-for="(arrow, index) in arrows"
                  :key="'arrow-' + index"
                  :config="arrow"
                />

                <!-- 绘制弯曲箭头 -->
                <v-path
                  v-for="(curve, index) in curvedArrows"
                  :key="'curve-' + index"
                  :config="curve"
                />

                <!-- 绘制公式 -->
                <v-text
                  v-if="formulaVisible"
                  :config="{
                    x: formulaPosition.x,
                    y: formulaPosition.y,
                    text: formulaText,
                    fontSize: 18,
                    fill: '#ff4d4f',
                    fontStyle: 'bold'
                  }"
                />

                <!-- 绘制当前说明 -->
                <v-text
                  :config="{
                    x: 20,
                    y: stageConfig.height - 40,
                    text: currentExplanation,
                    fontSize: 18,
                    fill: '#333',
                    width: stageConfig.width - 40
                  }"
                />
              </v-layer>
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
            <p class="text-sm text-gray-600">楼梯层数</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              {{ stairsCount }}
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">总方式数</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              {{ totalWays }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              楼梯层数: {{ stairsCount }}
            </label>
            <el-slider
              v-model="stairsCount"
              :min="3"
              :max="15"
              :step="1"
              @change="resetAnimation"
            />
          </div>
          <el-button type="primary" class="w-full" @click="calculateWays">
            计算方式
          </el-button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">步骤控制</h3>
        <div class="step-controls">
          <el-button :disabled="!hasPreviousStep" @click="prevStep"
            >上一步</el-button
          >
          <el-button :disabled="!hasNextStep" @click="nextStep"
            >下一步</el-button
          >
          <el-button
            :type="isPlaying ? 'danger' : 'success'"
            @click="togglePlay"
          >
            {{ isPlaying ? "暂停" : "播放" }}
          </el-button>
          <el-button @click="resetAnimation">重新开始</el-button>
        </div>
        <div class="mt-3 text-center text-sm text-gray-600">
          步骤: {{ currentStep + 1 }} / {{ Math.max(animationSteps.length, 1) }}
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">当前说明</h3>
        <div class="result-box">
          <p class="text-sm font-medium text-gray-700">
            {{ currentExplanation }}
          </p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">算法原理</h3>
        <div class="algorithm-explanation">
          <p class="text-sm text-gray-600 mb-2">动态规划方程:</p>
          <p class="text-md font-mono text-blue-600 mb-2">
            f(n) = f(n-1) + f(n-2)
          </p>
          <p class="text-xs text-gray-500">
            到达第n层楼梯的方式数等于到达第n-1层和第n-2层的方式数之和，
            因为可以从n-1层爬1阶到达，或者从n-2层爬2阶到达。
          </p>
          <p class="text-xs text-gray-500 mt-2">
            提示: 点击楼梯可以查看从下面两层到当前层的路径关系
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

// 楼梯配置
const stairsCount = ref(5);
const stairs = ref<any[]>([]);
const arrows = ref<any[]>([]);
const curvedArrows = ref<any[]>([]);
const ways = ref<number[]>([]);
const currentStep = ref(0);
const isPlaying = ref(false);
const totalWays = ref(0);
const animationSteps = ref<any[]>([]);
const currentExplanation = ref('点击"计算方式"开始演示');
const formulaVisible = ref(false);
const formulaText = ref("");
const formulaPosition = ref({ x: 0, y: 0 });

// 计算属性：是否有上一步
const hasPreviousStep = computed(() => {
  return currentStep.value > 0 && animationSteps.value.length > 0;
});

// 计算属性：是否有下一步
const hasNextStep = computed(() => {
  return (
    currentStep.value < animationSteps.value.length - 1 &&
    animationSteps.value.length > 0
  );
});

// 舞台配置
const stageConfig = ref({
  width: 700,
  height: 500
});

// 初始化楼梯
const initializeStairs = () => {
  stairs.value = [];
  const stairWidth = 60;
  const stairHeight = 35;
  const startX = 100;
  const startY = 100;

  for (let i = 0; i <= stairsCount.value; i++) {
    const x = startX + i * stairWidth;
    const y = startY + (stairsCount.value - i) * stairHeight;

    stairs.value.push({
      config: {
        x,
        y,
        width: stairWidth,
        height: stairHeight,
        fill:
          i === 0 ? "#95de64" : i === stairsCount.value ? "#ff7875" : "#e8e8e8",
        stroke: "#d9d9d9",
        strokeWidth: 2
      },
      ways: i <= 1 ? i : 0,
      highlight: false
    });
  }

  // 初始化方式数组
  ways.value = new Array(stairsCount.value + 1).fill(0);
  ways.value[0] = 0;
  ways.value[1] = 1;
  if (stairsCount.value >= 2) ways.value[2] = 2;
};

// 处理楼梯点击事件
const handleStairClick = (index: number) => {
  if (index < 2 || ways.value[index] === 0) return;

  // 清除之前的弯曲箭头和公式
  curvedArrows.value = [];
  formulaVisible.value = false;

  // 高亮当前楼梯
  stairs.value.forEach((stair, i) => {
    stair.highlight = i === index || i === index - 1 || i === index - 2;
  });

  // 创建从n-1和n-2到n的弯曲箭头
  const currentStair = stairs.value[index];
  const prevStair1 = stairs.value[index - 1];
  const prevStair2 = stairs.value[index - 2];

  if (prevStair1) {
    createCurvedArrow(
      prevStair1.config.x + prevStair1.config.width / 2,
      prevStair1.config.y + prevStair1.config.height / 2,
      currentStair.config.x + currentStair.config.width / 2,
      currentStair.config.y + currentStair.config.height / 2,
      -30 // 向上弯曲
    );
  }

  if (prevStair2) {
    createCurvedArrow(
      prevStair2.config.x + prevStair2.config.width / 2,
      prevStair2.config.y + prevStair2.config.height / 2,
      currentStair.config.x + currentStair.config.width / 2,
      currentStair.config.y + currentStair.config.height / 2,
      30 // 向下弯曲
    );
  }

  // 显示公式
  formulaText.value = `f(${index}) = f(${index - 1}) + f(${index - 2}) = ${ways.value[index - 1]} + ${ways.value[index - 2]} = ${ways.value[index]}`;
  formulaPosition.value = {
    x: currentStair.config.x + currentStair.config.width + 10,
    y: currentStair.config.y
  };
  formulaVisible.value = true;

  // 更新说明
  currentExplanation.value = `从第${index - 1}层和第${index - 2}层可以到达第${index}层，方式数相加得到f(${index})=${ways.value[index]}`;
};

// 创建弯曲箭头
const createCurvedArrow = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  curveAmount: number
) => {
  // 计算控制点（使曲线弯曲）
  const controlX = (fromX + toX) / 2;
  const controlY = (fromY + toY) / 2 + curveAmount;

  // 创建二次贝塞尔曲线路径
  const path = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;

  curvedArrows.value.push({
    data: path,
    stroke: "#1890ff",
    strokeWidth: 3,
    fill: "transparent",
    pointerLength: 10,
    pointerWidth: 10
  });
};

// 计算爬楼梯的方式
const calculateWays = () => {
  // 重置状态
  resetAnimation();

  // 生成动画步骤
  animationSteps.value = [];

  // 添加初始状态说明
  animationSteps.value.push({
    explanation: "初始状态：在第0层有0种方式，在第1层有1种方式",
    highlight: [0, 1]
  });

  if (stairsCount.value >= 2) {
    animationSteps.value.push({
      explanation: "在第2层有2种方式：一次爬2阶，或分两次各爬1阶",
      highlight: [2],
      ways: 2,
      from: [0, 1]
    });
  }

  // 动态规划过程
  for (let i = 3; i <= stairsCount.value; i++) {
    animationSteps.value.push({
      explanation: `计算到达第${i}层的方式：f(${i}) = f(${i - 1}) + f(${i - 2}) = ${ways.value[i - 1]} + ${ways.value[i - 2]} = ${ways.value[i - 1] + ways.value[i - 2]}`,
      highlight: [i],
      from: [i - 1, i - 2],
      ways: ways.value[i - 1] + ways.value[i - 2]
    });
    ways.value[i] = ways.value[i - 1] + ways.value[i - 2];
  }

  // 最终结果
  animationSteps.value.push({
    explanation: `最终结果：到达第${stairsCount.value}层有${ways.value[stairsCount.value]}种方式`,
    highlight: [stairsCount.value]
  });

  // 开始播放
  currentStep.value = 0;
  updateVisualization();
};

// 更新可视化
const updateVisualization = () => {
  if (
    currentStep.value >= animationSteps.value.length ||
    animationSteps.value.length === 0
  ) {
    isPlaying.value = false;
    return;
  }

  const step = animationSteps.value[currentStep.value];
  currentExplanation.value = step.explanation;

  // 重置所有楼梯高亮
  stairs.value.forEach(stair => {
    stair.highlight = false;
  });

  // 高亮当前相关楼梯
  if (step.highlight) {
    step.highlight.forEach(i => {
      if (stairs.value[i]) stairs.value[i].highlight = true;
    });
  }

  // 更新方式数
  if (
    step.ways !== undefined &&
    step.highlight &&
    step.highlight.length === 1
  ) {
    const i = step.highlight[0];
    stairs.value[i].ways = step.ways;
    ways.value[i] = step.ways;
  }

  // 绘制箭头
  arrows.value = [];
  if (step.from) {
    step.from.forEach(from => {
      const to = step.highlight[0];
      if (stairs.value[from] && stairs.value[to]) {
        const fromStair = stairs.value[from];
        const toStair = stairs.value[to];

        arrows.value.push({
          points: [
            fromStair.config.x + fromStair.config.width / 2,
            fromStair.config.y + fromStair.config.height / 2,
            toStair.config.x + toStair.config.width / 2,
            toStair.config.y + toStair.config.height / 2
          ],
          pointerLength: 10,
          pointerWidth: 10,
          fill: "#1890ff",
          stroke: "#1890ff",
          strokeWidth: 3
        });
      }
    });
  }

  // 更新总方式数
  if (currentStep.value === animationSteps.value.length - 1) {
    totalWays.value = ways.value[stairsCount.value];
  }

  // 清除弯曲箭头和公式
  curvedArrows.value = [];
  formulaVisible.value = false;
};

// 播放控制
let playInterval: any = null;

const togglePlay = () => {
  if (isPlaying.value) {
    clearInterval(playInterval);
    isPlaying.value = false;
  } else {
    if (currentStep.value >= animationSteps.value.length) {
      currentStep.value = 0;
    }
    isPlaying.value = true;
    playInterval = setInterval(() => {
      if (currentStep.value < animationSteps.value.length - 1) {
        currentStep.value++;
        updateVisualization();
      } else {
        clearInterval(playInterval);
        isPlaying.value = false;
      }
    }, 2000);
  }
};

// 上一步
const prevStep = () => {
  pause();
  if (currentStep.value > 0) {
    currentStep.value--;
    updateVisualization();
  }
};

// 下一步
const nextStep = () => {
  pause();
  if (currentStep.value < animationSteps.value.length - 1) {
    currentStep.value++;
    updateVisualization();
  }
};

// 暂停
const pause = () => {
  isPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

// 重置动画
const resetAnimation = () => {
  pause();
  currentStep.value = 0;
  initializeStairs();
  totalWays.value = 0;
  currentExplanation.value = '点击"计算方式"开始演示';
  arrows.value = [];
  curvedArrows.value = [];
  formulaVisible.value = false;
  animationSteps.value = [];
};

// 监听楼梯数量变化
watch(stairsCount, () => {
  resetAnimation();
});

// 初始化
onMounted(() => {
  initializeStairs();
});
</script>

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

.algorithm-explanation {
  padding: 12px;
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 6px;
}

// 添加鼠标悬停效果
:deep(.konvajs-content) {
  canvas {
    cursor: pointer;
  }
}
</style>

<script setup>
import { ref, watch, onMounted } from "vue";
import Play from "~icons/ep/delete";
import Pause from "~icons/ep/edit-pen";
import PlayCircle from "~icons/ri/add-circle-line";
import Refresh from "~icons/ep/refresh";

// 常量定义
const elementRadius = 25;
const elementsStageHeight = 200;
const resultStageHeight = 200;

// 舞台尺寸配置
const elementsStageSize = ref({
  width: 800,
  height: elementsStageHeight
});

const resultStageSize = ref({
  width: 800,
  height: resultStageHeight
});

// 基本参数设置
const totalElements = ref(5);
const selectedElements = ref(2);
const demoType = ref("permutation"); // 'permutation' 或 'combination'
const animationSpeed = ref(1000);

// 状态管理
const isPlaying = ref(false);
const isPaused = ref(false);
const currentIndex = ref(0);
const resultCount = ref(0);
const elements = ref([]);
const allResults = ref([]);
const currentResult = ref([]);
const manualSelection = ref([]);

// 初始化元素
const initializeElements = () => {
  const newElements = [];
  const availableWidth = elementsStageSize.value.width - elementRadius * 2;
  const spacing = availableWidth / (totalElements.value - 1);

  for (let i = 0; i < totalElements.value; i++) {
    newElements.push({
      index: i,
      label: String.fromCharCode(65 + i), // A, B, C, ...
      x: elementRadius + i * spacing,
      y: elementsStageHeight / 2,
      selected: false
    });
  }

  elements.value = newElements;
  manualSelection.value = [];
};

// 验证选择的元素数量
const validateSelectedElements = () => {
  if (selectedElements.value > totalElements.value) {
    selectedElements.value = totalElements.value;
  }
  resetDemo();
};

// 更新元素
const updateElements = () => {
  if (selectedElements.value > totalElements.value) {
    selectedElements.value = totalElements.value;
  }
  initializeElements();
  generateResults();
};

// 计算阶乘
const factorial = n => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

// 计算排列数 P(n,k) = n! / (n-k)!
const calculatePermutations = (n, k) => {
  if (k > n) return 0;
  return factorial(n) / factorial(n - k);
};

// 计算组合数 C(n,k) = n! / (k! * (n-k)!)
const calculateCombinations = (n, k) => {
  if (k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
};

// 生成所有排列
const generatePermutations = (arr, k) => {
  const result = [];

  const permute = (current, remaining) => {
    if (current.length === k) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      const next = [...current, remaining[i]];
      const newRemaining = [
        ...remaining.slice(0, i),
        ...remaining.slice(i + 1)
      ];
      permute(next, newRemaining);
    }
  };

  permute([], arr);
  return result;
};

// 生成所有组合
const generateCombinations = (arr, k) => {
  const result = [];

  const combine = (start, current) => {
    if (current.length === k) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      combine(i + 1, current);
      current.pop();
    }
  };

  combine(0, []);
  return result;
};

// 生成所有结果
const generateResults = () => {
  const elementsArray = elements.value.map(el => ({
    index: el.index,
    label: el.label
  }));

  if (demoType.value === "permutation") {
    allResults.value = generatePermutations(
      elementsArray,
      selectedElements.value
    );
    resultCount.value = calculatePermutations(
      totalElements.value,
      selectedElements.value
    );
  } else {
    allResults.value = generateCombinations(
      elementsArray,
      selectedElements.value
    );
    resultCount.value = calculateCombinations(
      totalElements.value,
      selectedElements.value
    );
  }

  currentIndex.value = 0;
  currentResult.value = allResults.value[0] || [];
};

// 获取元素颜色
const getElementColor = index => {
  const element = elements.value[index];

  // 如果在演示中，高亮显示当前结果中的元素
  if (isPlaying.value && !isPaused.value) {
    const isInResult = currentResult.value.some(item => item.index === index);
    return isInResult ? "#F56C6C" : "#409EFF";
  }

  // 手动选择模式
  return element.selected ? "#67C23A" : "#409EFF";
};

// 获取结果元素颜色
const getResultElementColor = index => {
  return "#F56C6C";
};

// 处理元素点击
const handleElementClick = index => {
  if (isPlaying.value) return;

  const element = elements.value[index];

  // 如果已经选择，取消选择
  if (element.selected) {
    element.selected = false;
    const idx = manualSelection.value.findIndex(item => item.index === index);
    if (idx !== -1) {
      manualSelection.value.splice(idx, 1);
    }
  }
  // 如果未选择且未达到选择数量上限，进行选择
  else if (manualSelection.value.length < selectedElements.value) {
    element.selected = true;
    manualSelection.value.push({
      index: element.index,
      label: element.label
    });
  }

  // 更新视图
  elements.value = [...elements.value];
};

// 显示手动选择的结果
const showManualResult = () => {
  currentResult.value = [...manualSelection.value];
};

// 开始演示
const startDemo = () => {
  if (isPlaying.value && !isPaused.value) return;

  isPlaying.value = true;
  isPaused.value = false;
  currentIndex.value = 0;
  currentResult.value = allResults.value[0] || [];

  // 开始动画循环
  playNextResult();
};

// 播放下一个结果
const playNextResult = () => {
  if (!isPlaying.value || isPaused.value) return;

  if (currentIndex.value < allResults.value.length - 1) {
    currentIndex.value++;
    currentResult.value = allResults.value[currentIndex.value];

    // 继续循环
    setTimeout(playNextResult, animationSpeed.value);
  } else {
    // 演示结束
    isPlaying.value = false;
  }
};

// 暂停演示
const pauseDemo = () => {
  if (isPlaying.value && !isPaused.value) {
    isPaused.value = true;
  }
};

// 继续演示
const resumeDemo = () => {
  if (isPlaying.value && isPaused.value) {
    isPaused.value = false;
    playNextResult();
  }
};

// 重置演示
const resetDemo = () => {
  isPlaying.value = false;
  isPaused.value = false;
  currentIndex.value = 0;
  generateResults();

  // 重置选择状态
  elements.value.forEach(el => {
    el.selected = false;
  });
  manualSelection.value = [];
};

// 初始化
onMounted(() => {
  initializeElements();
  generateResults();

  // 监听窗口大小变化
  const handleResize = () => {
    // 响应式调整逻辑
    const newWidth = window.innerWidth - 400;
    if (newWidth > 500) {
      elementsStageSize.value.width = newWidth;
      resultStageSize.value.width = newWidth;
      initializeElements();
    }
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
});

// 监听参数变化，重新生成结果
watch([totalElements, selectedElements, demoType], () => {
  generateResults();
});
</script>

<template>
  <div class="permutation-combination-app">
    <!-- 顶部导航 -->
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <h1>数学排列组合演示工具</h1>
          <p>可视化展示排列与组合的概念和计算过程</p>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <!-- 左侧控制面板 -->
        <el-aside width="300px" class="control-panel">
          <el-card title="控制面板" class="control-card">
            <!-- 基本设置 -->
            <el-form label-width="100px" class="setting-form">
              <el-form-item label="总元素数(n)">
                <el-slider
                  v-model="totalElements"
                  :min="2"
                  :max="10"
                  :step="1"
                  @change="updateElements"
                />
                <span class="slider-value">{{ totalElements }}</span>
              </el-form-item>

              <el-form-item label="选取元素数(k)">
                <el-slider
                  v-model="selectedElements"
                  :min="1"
                  :max="Math.min(totalElements, 6)"
                  :step="1"
                  @change="validateSelectedElements"
                />
                <span class="slider-value">{{ selectedElements }}</span>
              </el-form-item>

              <el-form-item label="演示类型">
                <el-radio-group v-model="demoType" @change="resetDemo">
                  <el-radio label="permutation">排列 (P(n,k))</el-radio>
                  <el-radio label="combination">组合 (C(n,k))</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="动画速度">
                <el-slider
                  v-model="animationSpeed"
                  :min="300"
                  :max="2000"
                  :step="100"
                  :reverse="true"
                />
              </el-form-item>
            </el-form>

            <!-- 控制按钮 -->
            <div class="control-buttons">
              <el-button
                type="success"
                :icon="Play"
                :disabled="isPlaying"
                class="control-btn"
                @click="startDemo"
              >
                开始演示
              </el-button>

              <el-button
                type="warning"
                :icon="Pause"
                :disabled="!isPlaying || isPaused"
                class="control-btn"
                @click="pauseDemo"
              >
                暂停
              </el-button>

              <el-button
                type="primary"
                :icon="PlayCircle"
                :disabled="!isPlaying || !isPaused"
                class="control-btn"
                @click="resumeDemo"
              >
                继续
              </el-button>

              <el-button
                type="danger"
                :icon="Refresh"
                class="control-btn"
                @click="resetDemo"
              >
                重置
              </el-button>
            </div>

            <!-- 结果显示 -->
            <div class="result-info">
              <el-descriptions column="1" border>
                <el-descriptions-item label="计算公式">
                  <span v-if="demoType === 'permutation'">
                    P({{ totalElements }}, {{ selectedElements }}) =
                    {{ totalElements }}! / ({{ totalElements }} -
                    {{ selectedElements }})!
                  </span>
                  <span v-if="demoType === 'combination'">
                    C({{ totalElements }}, {{ selectedElements }}) =
                    {{ totalElements }}! / ({{ selectedElements }}! × ({{
                      totalElements
                    }}
                    - {{ selectedElements }})!)
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="结果">
                  <span class="result-value">{{ resultCount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="当前展示">
                  <span>{{ currentIndex + 1 }} / {{ resultCount }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 手动选择区域 -->
            <div v-if="!isPlaying" class="manual-selection">
              <el-card title="手动选择" class="manual-card">
                <p class="manual-hint">点击元素进行选择/取消选择</p>
                <el-button
                  type="info"
                  :disabled="manualSelection.length !== selectedElements"
                  class="manual-btn"
                  @click="showManualResult"
                >
                  查看结果
                </el-button>
              </el-card>
            </div>
          </el-card>
        </el-aside>

        <!-- 右侧演示区域 -->
        <el-main class="demo-container">
          <el-card class="demo-card">
            <!-- 元素展示区 -->
            <div class="elements-container">
              <h3 class="section-title">全部元素</h3>
              <v-stage
                :config="elementsStageSize"
                class="konva-stage elements-stage"
              >
                <v-layer>
                  <!-- 背景 -->
                  <v-rect
                    :config="{
                      x: 0,
                      y: 0,
                      width: elementsStageSize.width,
                      height: elementsStageSize.height,
                      fill: '#f9f9f9',
                      cornerRadius: 4
                    }"
                  />

                  <!-- 元素 -->
                  <v-circle
                    v-for="(element, index) in elements"
                    :key="index"
                    :config="{
                      x: element.x,
                      y: element.y,
                      radius: elementRadius,
                      fill: getElementColor(index),
                      stroke: '#333',
                      strokeWidth: 2,
                      draggable: !isPlaying
                    }"
                    @click="handleElementClick(index)"
                  />

                  <!-- 元素标签 -->
                  <v-text
                    v-for="(element, index) in elements"
                    :key="`text-${index}`"
                    :config="{
                      x: element.x,
                      y: element.y,
                      text: element.label,
                      fontSize: 16,
                      fill: '#333',
                      align: 'center',
                      verticalAlign: 'middle'
                    }"
                  />
                </v-layer>
              </v-stage>
            </div>

            <!-- 结果展示区 -->
            <div class="result-container">
              <h3 class="section-title">
                {{ demoType === "permutation" ? "排列结果" : "组合结果" }}
              </h3>
              <v-stage
                :config="resultStageSize"
                class="konva-stage result-stage"
              >
                <v-layer>
                  <!-- 背景 -->
                  <v-rect
                    :config="{
                      x: 0,
                      y: 0,
                      width: resultStageSize.width,
                      height: resultStageSize.height,
                      fill: '#f9f9f9',
                      cornerRadius: 4
                    }"
                  />

                  <!-- 结果元素 -->
                  <v-circle
                    v-for="(item, pos) in currentResult"
                    :key="pos"
                    :config="{
                      x:
                        resultStageSize.width / 2 -
                        (selectedElements * (elementRadius * 2 + 10) - 10) / 2 +
                        pos * (elementRadius * 2 + 10),
                      y: resultStageSize.height / 2,
                      radius: elementRadius,
                      fill: getResultElementColor(item.index),
                      stroke: '#333',
                      strokeWidth: 2
                    }"
                  />

                  <!-- 结果元素标签 -->
                  <v-text
                    v-for="(item, pos) in currentResult"
                    :key="`result-text-${pos}`"
                    :config="{
                      x:
                        resultStageSize.width / 2 -
                        (selectedElements * (elementRadius * 2 + 10) - 10) / 2 +
                        pos * (elementRadius * 2 + 10),
                      y: resultStageSize.height / 2,
                      text: item.label,
                      fontSize: 16,
                      fill: '#333',
                      align: 'center',
                      verticalAlign: 'middle'
                    }"
                  />
                </v-layer>
              </v-stage>
            </div>

            <!-- 操作提示 -->
            <div class="demo-hint">
              <p v-if="!isPlaying">
                <i class="el-icon-info" />
                提示：选择演示类型和参数，点击"开始演示"观看动画，或手动选择元素
              </p>
              <p v-if="isPlaying && !isPaused">
                <i class="el-icon-loading" /> 正在演示{{
                  demoType === "permutation" ? "排列" : "组合"
                }}过程...
              </p>
              <p v-if="isPaused">
                <i class="el-icon-pause" /> 演示已暂停，点击"继续"继续观看
              </p>
            </div>
          </el-card>
        </el-main>
      </el-container>

      <!-- 页脚 -->
      <el-footer class="app-footer">
        <p>数学排列组合演示工具 &copy; 2023</p>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.permutation-combination-app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

.app-header {
  padding: 0;
  color: white;
  background-color: #165dff;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.header-content {
  padding: 20px 40px;
}

.header-content h1 {
  margin: 0 0 10px;
  font-size: 24px;
}

.header-content p {
  margin: 0;
  opacity: 0.9;
}

.main-container {
  height: calc(100% - 130px);
  overflow: hidden;
}

.control-panel {
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: 2px 0 12px 0 rgb(0 0 0 / 5%);
}

.control-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.setting-form {
  margin-bottom: 20px;
}

.slider-value {
  display: inline-block;
  width: 40px;
  margin-left: 10px;
  text-align: center;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.control-btn {
  flex: 1;
  min-width: 80px;
}

.result-info {
  margin-bottom: 20px;
}

.result-value {
  font-size: 18px;
  font-weight: bold;
  color: #165dff;
}

.manual-selection {
  margin-top: auto;
}

.manual-card {
  background-color: #f9f9f9;
}

.manual-hint {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.manual-btn {
  width: 100%;
}

.demo-container {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.demo-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.elements-container,
.result-container {
  margin-bottom: 20px;
}

.section-title {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.konva-stage {
  background-color: white;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.demo-hint {
  padding: 10px 0;
  margin-top: auto;
  font-size: 14px;
  color: #666;
}

.app-footer {
  padding: 15px 0;
  font-size: 14px;
  color: #666;
  text-align: center;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
}
</style>

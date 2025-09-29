<script setup>
import { ref, computed, watch, onMounted } from "vue";
// 画布尺寸配置
const stageWidth = 1000;
const stageHeight = 500;
const stageSize = ref({
  width: stageWidth,
  height: stageHeight
});

// 数据配置
const dataCount = ref(15);
const dataRange = ref(80);
const bars = ref([]);
const originalData = ref([]);

// 排序状态
const selectedAlgorithm = ref("bubble");
const animationSpeed = ref(300);
const isSorting = ref(false);
const isPaused = ref(false);
const isSorted = ref(false);
const comparisons = ref(0);
const swaps = ref(0);
const currentIndices = ref({ i: -1, j: -1, pivot: -1 });

// 生成新的随机数据
const generateNewData = () => {
  resetSorting();

  const newBars = [];
  const barWidth = Math.floor((stageWidth - 40) / dataCount.value) - 2;
  const values = [];

  // 生成不重复的随机数
  while (values.length < dataCount.value) {
    const value = Math.floor(Math.random() * dataRange.value) + 10;
    if (!values.includes(value)) {
      values.push(value);
    }
  }

  // 计算每个条的位置和尺寸
  values.forEach((value, index) => {
    const barHeight = value * 4;
    newBars.push({
      value,
      width: barWidth,
      height: barHeight,
      x: 20 + index * (barWidth + 2),
      y: stageHeight - barHeight - 20,
      originalIndex: index
    });
  });

  bars.value = newBars;
  originalData.value = [...newBars];
};

// 获取条的颜色
const getBarColor = index => {
  // 已排序完成的颜色
  if (isSorted.value) {
    return "#67C23A"; // 绿色
  }

  // 正在比较的元素
  if (index === currentIndices.value.i || index === currentIndices.value.j) {
    return "#F56C6C"; // 红色
  }

  // 基准元素
  if (index === currentIndices.value.pivot) {
    return "#E6A23C"; // 橙色
  }

  // 普通元素
  return "#409EFF"; // 蓝色
};

// 获取当前选择的算法名称
const getAlgorithmName = () => {
  const algorithmMap = {
    bubble: "冒泡排序",
    selection: "选择排序",
    insertion: "插入排序",
    quick: "快速排序"
  };
  return algorithmMap[selectedAlgorithm.value] || "排序";
};

// 拖拽相关方法
const draggedIndex = ref(-1);
const handleDragStart = index => {
  draggedIndex.value = index;
};

const handleDragMove = (index, event) => {
  if (draggedIndex.value !== index) return;

  // 更新位置
  bars.value[index].x = event.target.x();

  // 检查是否需要交换位置
  const draggedBar = bars.value[index];
  bars.value.forEach((bar, i) => {
    if (
      i !== index &&
      draggedBar.x + draggedBar.width / 2 > bar.x + bar.width / 2
    ) {
      // 交换位置
      [bars.value[index], bars.value[i]] = [bars.value[i], bars.value[index]];
      draggedIndex.value = i;
    }
  });
};

const handleDragEnd = () => {
  // 重新排列，使条形整齐排列
  const sortedBars = [...bars.value].sort((a, b) => a.x - b.x);
  sortedBars.forEach((bar, index) => {
    const barWidth = bar.width;
    bar.x = 20 + index * (barWidth + 2);
  });
  bars.value = sortedBars;

  // 检查是否已排序
  checkIfSorted();
  draggedIndex.value = -1;
};

// 检查是否已排序
const checkIfSorted = () => {
  for (let i = 0; i < bars.value.length - 1; i++) {
    if (bars.value[i].value > bars.value[i + 1].value) {
      isSorted.value = false;
      return;
    }
  }
  isSorted.value = true;
  isSorting.value = false;
};

// 排序算法实现
let sortingInterval;

// 开始排序
const startSorting = () => {
  if (isSorting.value && !isPaused.value) return;

  isSorting.value = true;
  isPaused.value = false;
  comparisons.value = 0;
  swaps.value = 0;

  // 根据选择的算法开始排序
  switch (selectedAlgorithm.value) {
    case "bubble":
      startBubbleSort();
      break;
    case "selection":
      startSelectionSort();
      break;
    case "insertion":
      startInsertionSort();
      break;
    case "quick":
      startQuickSort();
      break;
    default:
      startBubbleSort();
  }
};

// 暂停排序
const pauseSorting = () => {
  if (!isSorting.value) return;

  isPaused.value = !isPaused.value;

  if (isPaused.value) {
    clearInterval(sortingInterval);
  } else {
    startSorting(); // 恢复排序
  }
};

// 重置排序
const resetSorting = () => {
  isSorting.value = false;
  isPaused.value = false;
  isSorted.value = false;
  comparisons.value = 0;
  swaps.value = 0;
  currentIndices.value = { i: -1, j: -1, pivot: -1 };
  clearInterval(sortingInterval);

  // 恢复原始数据
  bars.value = [...originalData.value];
};

// 冒泡排序
const startBubbleSort = () => {
  let i = 0;
  let j = 0;
  let swapped = false;

  sortingInterval = setInterval(() => {
    if (i >= bars.value.length - 1) {
      clearInterval(sortingInterval);
      isSorted.value = true;
      isSorting.value = false;
      currentIndices.value = { i: -1, j: -1 };
      return;
    }

    if (j < bars.value.length - i - 1) {
      currentIndices.value = { i: j, j: j + 1 };
      comparisons.value++;

      if (bars.value[j].value > bars.value[j + 1].value) {
        // 交换元素
        [bars.value[j], bars.value[j + 1]] = [bars.value[j + 1], bars.value[j]];
        swaps.value++;

        // 更新位置
        updateBarPositions();
      }
      j++;
    } else {
      j = 0;
      i++;
    }
  }, animationSpeed.value);
};

// 选择排序
const startSelectionSort = () => {
  let i = 0;
  let j = i + 1;
  let minIndex = i;

  sortingInterval = setInterval(() => {
    if (i >= bars.value.length - 1) {
      clearInterval(sortingInterval);
      isSorted.value = true;
      isSorting.value = false;
      currentIndices.value = { i: -1, j: -1 };
      return;
    }

    if (j < bars.value.length) {
      currentIndices.value = { i: minIndex, j: j };
      comparisons.value++;

      if (bars.value[j].value < bars.value[minIndex].value) {
        minIndex = j;
      }
      j++;
    } else {
      // 交换最小元素和当前元素
      if (minIndex !== i) {
        [bars.value[i], bars.value[minIndex]] = [
          bars.value[minIndex],
          bars.value[i]
        ];
        swaps.value++;
        updateBarPositions();
      }
      i++;
      j = i + 1;
      minIndex = i;
    }
  }, animationSpeed.value);
};

// 插入排序
const startInsertionSort = () => {
  let i = 1;
  let j = i;
  let key = bars.value[i]?.value;

  sortingInterval = setInterval(() => {
    if (i >= bars.value.length) {
      clearInterval(sortingInterval);
      isSorted.value = true;
      isSorting.value = false;
      currentIndices.value = { i: -1, j: -1 };
      return;
    }

    if (j > 0 && bars.value[j - 1].value > key) {
      currentIndices.value = { i: j, j: j - 1 };
      comparisons.value++;

      // 移动元素
      bars.value[j] = bars.value[j - 1];
      j--;
      updateBarPositions();
    } else {
      bars.value[j] = originalData.value[i];
      i++;
      j = i;
      key = bars.value[i]?.value;
    }
  }, animationSpeed.value);
};

// 快速排序
const startQuickSort = () => {
  const stack = [];
  stack.push(0);
  stack.push(bars.value.length - 1);
  let top = 1;
  let pivotIndex;

  const quickSortStep = () => {
    if (top >= 0) {
      // 弹出栈顶元素
      const high = stack[top--];
      const low = stack[top--];

      // 分区操作
      pivotIndex = low;
      const pivotValue = bars.value[high].value;

      const partitionStep = () => {
        if (pivotIndex < high) {
          currentIndices.value = { i: pivotIndex, j: high, pivot: high };
          comparisons.value++;

          if (bars.value[pivotIndex].value <= pivotValue) {
            pivotIndex++;
          } else {
            // 交换元素
            [bars.value[pivotIndex], bars.value[high - 1]] = [
              bars.value[high - 1],
              bars.value[pivotIndex]
            ];
            [bars.value[high - 1], bars.value[high]] = [
              bars.value[high],
              bars.value[high - 1]
            ];
            swaps.value++;
            updateBarPositions();
          }
          setTimeout(partitionStep, animationSpeed.value);
        } else {
          // 分区完成，将子数组入栈
          if (pivotIndex - 1 > low) {
            stack[++top] = low;
            stack[++top] = pivotIndex - 1;
          }

          if (pivotIndex + 1 < high) {
            stack[++top] = pivotIndex + 1;
            stack[++top] = high;
          }

          // 检查是否完成所有排序
          if (top >= 0) {
            setTimeout(quickSortStep, animationSpeed.value);
          } else {
            isSorted.value = true;
            isSorting.value = false;
            currentIndices.value = { i: -1, j: -1, pivot: -1 };
          }
        }
      };

      partitionStep();
    }
  };

  quickSortStep();
};

// 更新条形位置，保持整齐排列
const updateBarPositions = () => {
  // 按x坐标排序
  const sortedBars = [...bars.value].sort((a, b) => a.x - b.x);

  // 重新计算位置
  sortedBars.forEach((bar, index) => {
    const barWidth = bar.width;
    bar.x = 20 + index * (barWidth + 2);
  });

  bars.value = sortedBars;
};

// 初始化
onMounted(() => {
  generateNewData();
});

// 监听窗口大小变化
const handleResize = () => {
  // 这里可以添加响应式调整画布大小的逻辑
};

window.addEventListener("resize", handleResize);
</script>

<template>
  <div class="sorting-animation-app">
    <!-- 顶部导航 -->
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <h1>图形化排序动画学习工具</h1>
          <p>通过动画直观理解各种排序算法的工作原理</p>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <!-- 左侧控制面板 -->
        <el-aside width="300px" class="control-panel">
          <el-card title="控制面板" class="control-card">
            <!-- 数据设置 -->
            <el-form label-width="100px" class="setting-form">
              <el-form-item label="数据数量">
                <el-slider
                  v-model="dataCount"
                  :min="5"
                  :max="30"
                  :step="1"
                  @change="generateNewData"
                />
                <span class="slider-value">{{ dataCount }}</span>
              </el-form-item>

              <el-form-item label="数据范围">
                <el-input-number
                  v-model="dataRange"
                  :min="10"
                  :max="100"
                  :step="10"
                  @change="generateNewData"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  icon="Refresh"
                  class="generate-btn"
                  @click="generateNewData"
                >
                  生成新数据
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 算法选择 -->
            <el-form label-width="100px" class="algorithm-form">
              <el-form-item label="排序算法">
                <el-select
                  v-model="selectedAlgorithm"
                  placeholder="选择算法"
                  class="algorithm-select"
                >
                  <el-option label="冒泡排序" value="bubble" />
                  <el-option label="选择排序" value="selection" />
                  <el-option label="插入排序" value="insertion" />
                  <el-option label="快速排序" value="quick" />
                </el-select>
              </el-form-item>

              <el-form-item label="动画速度">
                <el-slider
                  v-model="animationSpeed"
                  :min="50"
                  :max="1000"
                  :step="50"
                  :reverse="true"
                />
              </el-form-item>
            </el-form>

            <!-- 控制按钮 -->
            <div class="control-buttons">
              <el-button
                type="success"
                icon="Play"
                :disabled="isSorting || isSorted"
                class="control-btn"
                @click="startSorting"
              >
                开始排序
              </el-button>

              <el-button
                type="warning"
                icon="Pause"
                :disabled="!isSorting"
                class="control-btn"
                @click="pauseSorting"
              >
                暂停
              </el-button>

              <el-button
                type="danger"
                icon="Stop"
                class="control-btn"
                @click="resetSorting"
              >
                重置
              </el-button>
            </div>

            <!-- 信息显示 -->
            <div v-if="isSorting || isSorted" class="sorting-info">
              <el-descriptions column="1" border>
                <el-descriptions-item label="状态">
                  <span :class="isSorted ? 'status-sorted' : 'status-sorting'">
                    {{ isSorted ? "已完成" : "排序中" }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="比较次数">{{
                  comparisons
                }}</el-descriptions-item>
                <el-descriptions-item label="交换次数">{{
                  swaps
                }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-aside>

        <!-- 右侧画布区域 -->
        <el-main class="canvas-container">
          <el-card class="canvas-card">
            <div class="canvas-wrapper">
              <!-- Konva 画布 -->
              <v-stage :config="stageSize" class="konva-stage">
                <v-layer>
                  <!-- 绘制数据条 -->
                  <v-rect
                    v-for="(item, index) in bars"
                    :key="index"
                    :config="{
                      x: item.x,
                      y: item.y,
                      width: item.width,
                      height: item.height,
                      fill: getBarColor(index),
                      cornerRadius: 4
                    }"
                    :draggable="!isSorting && !isSorted"
                    @dragstart="handleDragStart(index)"
                    @dragmove="handleDragMove(index, $event)"
                    @dragend="handleDragEnd"
                  />

                  <!-- 数据标签 -->
                  <v-text
                    v-for="(item, index) in bars"
                    :key="`text-${index}`"
                    :config="{
                      x: item.x + item.width / 2,
                      y: item.y - 20,
                      text: item.value,
                      fontSize: 14,
                      fill: '#333',
                      align: 'center',
                      verticalAlign: 'middle'
                    }"
                  />
                </v-layer>
              </v-stage>
            </div>

            <!-- 操作提示 -->
            <div class="canvas-hint">
              <p v-if="!isSorting && !isSorted">
                <i class="el-icon-info" />
                提示：您可以拖拽方块手动排序，或选择算法观看动画
              </p>
              <p v-if="isSorting">
                <i class="el-icon-loading" /> 正在进行{{
                  getAlgorithmName()
                }}...
              </p>
              <p v-if="isSorted">
                <i class="el-icon-success" /> {{ getAlgorithmName() }}已完成！
              </p>
            </div>
          </el-card>
        </el-main>
      </el-container>

      <!-- 页脚 -->
      <el-footer class="app-footer">
        <p>图形化排序动画学习工具 &copy; 2023</p>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.sorting-animation-app {
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

.setting-form,
.algorithm-form {
  margin-bottom: 20px;
}

.slider-value {
  display: inline-block;
  width: 40px;
  margin-left: 10px;
  text-align: center;
}

.generate-btn {
  width: 100%;
}

.algorithm-select {
  width: 100%;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.control-btn {
  flex: 1;
}

.sorting-info {
  margin-top: auto;
}

.status-sorting {
  color: #e6a23c;
}

.status-sorted {
  color: #67c23a;
}

.canvas-container {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.canvas-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.canvas-wrapper {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.konva-stage {
  background-color: white;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.canvas-hint {
  padding: 10px 0;
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

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { mySplitString } from "@/utils/my/myUtils";

interface ElementPosition {
  x: number;
  y: number;
  color: string;
  text: string;
}

// 舞台配置
const stageConfig = reactive({
  width: 600,
  height: 400
});

const elementsString = "一 二 三 四";
// 控制面板数据
const elementsStr = ref<string>(elementsString); //①②③④⑤⑥⑦❶❷❸❹❺❻1︎⃣2︎⃣一
const elements = ref<string[]>(mySplitString(elementsString));
const selectCount = ref<number>(2);
const calcType = ref<"permutation" | "combination">("permutation");
const allowRepeat = ref<boolean>(false);
const animationSpeed = ref<number>(800);
const isRect = ref<boolean>(false);

// 计算结果数据
const allResults = ref<string[][]>([]);
const currentIndex = ref<number>(0);
const currentResult = ref<string[]>([]);
const animatingElement = ref<ElementPosition | null>(null);
const isAnimating = ref<boolean>(false);

// 颜色集合
const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F06292",
  "#7986CB",
  "#9575CD",
  "#64B5F6",
  "#4DB6AC",
  "#81C784",
  "#FFD54F"
];

// 计算属性
const maxSelectCount = computed(() => elements.value.length);
const totalResults = computed(() => allResults.value.length);

// 获取元素颜色
const getElementColor = (index: number): string => {
  return colors[index % colors.length];
};

// 更新元素集合
const updateElements = (): void => {
  elements.value = elementsStr.value
    .split(" ")
    .map(item => item.trim())
    .filter(item => item.length > 0);

  if (elements.value.length === 0) {
    elementsStr.value = elementsString;
    elements.value = mySplitString(elementsString);
  }

  selectCount.value = Math.min(selectCount.value, elements.value.length);
};

// 计算排列组合
const calculate = (): void => {
  if (isAnimating.value) return;

  allResults.value = [];

  if (calcType.value === "permutation") {
    if (allowRepeat.value) {
      generatePermutationsWithRepetition(elements.value, selectCount.value);
    } else {
      generatePermutations(elements.value, selectCount.value);
    }
  } else {
    if (allowRepeat.value) {
      generateCombinationsWithRepetition(elements.value, selectCount.value);
    } else {
      generateCombinations(elements.value, selectCount.value);
    }
  }

  if (allResults.value.length > 0) {
    currentIndex.value = 0;
    showResultWithAnimation(0);
  } else {
    ElMessage.warning("没有符合条件的排列组合");
  }
};

// 生成排列（不重复）
const generatePermutations = (
  items: string[],
  k: number,
  current: string[] = []
): void => {
  if (current.length === k) {
    allResults.value.push([...current]);
    return;
  }

  for (let i = 0; i < items.length; i++) {
    if (!current.includes(items[i])) {
      current.push(items[i]);
      generatePermutations(items, k, current);
      current.pop();
    }
  }
};

// 生成排列（可重复）
const generatePermutationsWithRepetition = (
  items: string[],
  k: number,
  current: string[] = []
): void => {
  if (current.length === k) {
    allResults.value.push([...current]);
    return;
  }

  for (let i = 0; i < items.length; i++) {
    current.push(items[i]);
    generatePermutationsWithRepetition(items, k, current);
    current.pop();
  }
};

// 生成组合（不重复）
const generateCombinations = (
  items: string[],
  k: number,
  start: number = 0,
  current: string[] = []
): void => {
  if (current.length === k) {
    allResults.value.push([...current]);
    return;
  }

  for (let i = start; i < items.length; i++) {
    current.push(items[i]);
    generateCombinations(items, k, i + 1, current);
    current.pop();
  }
};

// 生成组合（可重复）
const generateCombinationsWithRepetition = (
  items: string[],
  k: number,
  start: number = 0,
  current: string[] = []
): void => {
  if (current.length === k) {
    allResults.value.push([...current]);
    return;
  }

  for (let i = start; i < items.length; i++) {
    current.push(items[i]);
    generateCombinationsWithRepetition(items, k, i, current);
    current.pop();
  }
};

// 显示结果（带动画）
const showResultWithAnimation = (index: number): void => {
  if (index < 0 || index >= allResults.value.length) return;

  isAnimating.value = true;
  currentResult.value = [];

  const result = allResults.value[index];
  const duration = animationSpeed.value;
  const startTime = Date.now();

  const animate = (): void => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentResult.value = result;
      isAnimating.value = false;
      animatingElement.value = null;
      return;
    }

    // 计算当前应该显示到第几个元素
    const elementIndex = Math.floor(progress * result.length);

    if (elementIndex < result.length) {
      const element = result[elementIndex];
      const sourceIndex = elements.value.indexOf(element);
      const sourceX = 100 + sourceIndex * 80;
      const targetX = 100 + elementIndex * 80;

      // 计算动画元素位置
      animatingElement.value = {
        x:
          sourceX +
          (targetX - sourceX) * (progress * result.length - elementIndex),
        y: 100 + (300 - 100) * (progress * result.length - elementIndex),
        color: getElementColor(sourceIndex),
        text: element
      };

      // 更新已显示的元素
      currentResult.value = result.slice(0, elementIndex);
    }
  };

  animate();
};

// 上一个结果
const prevResult = (): void => {
  if (currentIndex.value > 0 && !isAnimating.value) {
    currentIndex.value--;
    showResultWithAnimation(currentIndex.value);
  }
};

// 下一个结果
const nextResult = (): void => {
  if (currentIndex.value < allResults.value.length - 1 && !isAnimating.value) {
    currentIndex.value++;
    showResultWithAnimation(currentIndex.value);
  }
};

// 重置
const reset = (): void => {
  if (isAnimating.value) return;

  elementsStr.value = elementsString;
  elements.value = mySplitString(elementsString);
  selectCount.value = 2;
  calcType.value = "permutation";
  allowRepeat.value = false;
  allResults.value = [];
  currentResult.value = [];
  currentIndex.value = 0;
};

// 监听元素变化
watch(
  elements,
  () => {
    selectCount.value = Math.min(selectCount.value, elements.value.length);
  },
  { deep: true }
);

// 初始化
updateElements();
</script>

<template>
  <div class="combination-demo-container">
    <el-card class="control-panel">
      <template #header>
        <div class="card-header">
          <span>排列组合演示工具</span>
        </div>
      </template>
      <div class="content">
        <div class="font-bold">参数设置：</div>
        <el-form label-width="100px">
          <el-form-item label="是否圆形">
            <el-switch
              v-model="isRect"
              active-text="方型"
              inactive-text="圆型"
            />
          </el-form-item>
          <el-form-item label="元素集合">
            <el-input
              v-model="elementsStr"
              placeholder="输入元素，空格分隔"
              @change="updateElements"
            />
          </el-form-item>
          <el-form-item
            :label="`选择(${selectCount}个)`"
            class="flex flex-between"
          >
            <el-slider
              v-model="selectCount"
              :min="1"
              :max="maxSelectCount"
              :step="1"
            />
          </el-form-item>

          <el-form-item label="计算类型">
            <el-radio-group v-model="calcType">
              <el-radio-button label="permutation">排列 (P)</el-radio-button>
              <el-radio-button label="combination">组合 (C)</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="是否重复">
            <el-switch
              v-model="allowRepeat"
              active-text="允许"
              inactive-text="禁止"
            />
          </el-form-item>

          <el-form-item label="动画速度">
            <el-slider
              v-model="animationSpeed"
              :min="100"
              :max="2000"
              :step="100"
            />
          </el-form-item>
        </el-form>
      </div>
      <el-divider />
      <el-button
        :type="totalResults > 0 ? 'success' : 'primary'"
        @click="calculate"
        >开始计算</el-button
      >
      <el-button @click="reset">重置计算</el-button>

      <div class="result-info font-bold">
        <p>总可能性: {{ totalResults }}</p>
        <p>当前展示: {{ currentIndex + 1 }} / {{ totalResults }}</p>
        <div>
          计算公式:
          <span v-if="calcType === 'permutation'">
            P({{ elements.length }}, {{ selectCount }}) = {{ elements.length }}!
            / ({{ elements.length }} - {{ selectCount }})!
          </span>
          <span v-else>
            C({{ elements.length }}, {{ selectCount }}) = {{ elements.length }}!
            / ({{ selectCount }}! × ({{ elements.length }} -
            {{ selectCount }})!)
          </span>
        </div>
      </div>

      <el-button-group class="nav-buttons">
        <el-button :disabled="currentIndex <= 0" @click="prevResult">
          <el-icon><ArrowLeft /></el-icon> 上一个
        </el-button>
        <el-button
          :disabled="currentIndex >= totalResults - 1"
          @click="nextResult"
        >
          下一个 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </el-button-group>
    </el-card>

    <div class="canvas-container">
      <v-stage ref="stage" :config="stageConfig">
        <v-layer ref="layer">
          <!-- 原始元素 -->
          <v-group
            v-for="(element, index) in elements"
            :key="'element-' + index"
          >
            <v-circle
              v-if="!isRect"
              :config="{
                x: 100 + index * 80,
                y: 100,
                radius: 30,
                fill: getElementColor(index),
                //stroke: '#333',
                strokeWidth: 2,
                shadowColor: 'black',
                shadowBlur: 5,
                shadowOpacity: 0.3,
                shadowOffset: { x: 2, y: 2 }
              }"
            />
            <v-rect
              v-else
              :config="{
                x: 70 + index * 80,
                y: 70,
                width: 60,
                height: 60,
                fill: getElementColor(index),
                cornerRadius: 8,
                shadowColor: 'black',
                shadowBlur: 5,
                shadowOpacity: 0.3,
                shadowOffset: { x: 2, y: 2 }
              }"
            />
            <v-text
              :config="{
                x: 70 + index * 80,
                y: 92,
                text: element,
                fontSize: 20,
                fill: '#fff',
                align: 'center',
                width: 60
              }"
            />
          </v-group>

          <!-- 箭头 -->
          <v-arrow
            :config="{
              points: [70, 200, 550, 200],
              pointerLength: 10,
              pointerWidth: 10,
              fill: 'rgb(76,152,237)',
              stroke: 'rgb(61,135,216,0.6)',
              strokeWidth: 5
            }"
          />

          <!-- 结果元素 -->
          <template v-if="currentResult.length > 0">
            <v-group
              v-for="(item, index) in currentResult"
              :key="'result-' + index"
            >
              <v-circle
                v-if="!isRect"
                :config="{
                  x: 100 + index * 80,
                  y: 300,
                  radius: 30,
                  fill: getElementColor(elements.indexOf(item)),
                  //stroke: '#333',
                  strokeWidth: 2,
                  shadowColor: 'black',
                  shadowBlur: 5,
                  shadowOpacity: 0.3,
                  shadowOffset: { x: 2, y: 2 }
                }"
              />
              <v-rect
                v-else
                :config="{
                  x: 70 + index * 80,
                  y: 270,
                  width: 60,
                  height: 60,
                  fill: getElementColor(elements.indexOf(item)),
                  cornerRadius: 8,
                  shadowColor: 'black',
                  shadowBlur: 5,
                  shadowOpacity: 0.3,
                  shadowOffset: { x: 2, y: 2 }
                }"
              />
              <v-text
                :config="{
                  x: 70 + index * 80,
                  y: 292,
                  text: item,
                  fontSize: 20,
                  fill: '#fff',
                  align: 'center',
                  width: 60
                }"
              />
            </v-group>
          </template>

          <!-- 动画元素 -->
          <v-circle
            v-if="!isRect && animatingElement"
            :config="{
              x: animatingElement.x,
              y: animatingElement.y,
              radius: 30,
              fill: animatingElement.color,
              //stroke: '#333',
              strokeWidth: 2,
              shadowColor: 'black',
              shadowBlur: 5,
              shadowOpacity: 0.3,
              shadowOffset: { x: 2, y: 2 }
            }"
          />
          <v-rect
            v-else-if="isRect && animatingElement"
            :config="{
              x: animatingElement.x - 30,
              y: animatingElement.y - 30,
              width: 60,
              height: 60,
              fill: animatingElement.color,
              cornerRadius: 8,
              shadowColor: 'black',
              shadowBlur: 5,
              shadowOpacity: 0.3,
              shadowOffset: { x: 2, y: 2 }
            }"
          />
          <v-text
            v-if="animatingElement"
            :config="{
              x: animatingElement.x - 30,
              y: animatingElement.y - 5,
              text: animatingElement.text,
              fontSize: 20,
              fill: '#fff',
              align: 'center',
              width: 60
            }"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<style scoped lang="scss">
.combination-demo-container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;

  .control-panel {
    flex-shrink: 0;
    width: 320px;

    .card-header {
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: bold;
    }

    .result-info {
      padding: 10px;
      margin: 15px 0;
      background-color: #f5f7fa;
      border-radius: 4px;

      p {
        margin: 5px 0;
        font-size: 14px;
      }
    }

    .nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
  }

  .canvas-container {
    flex-grow: 1;
    padding: 10px;
    background: white;
    border: 1px solid #eee;
    border-radius: 4px;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-radio-group) {
    width: 100%;

    .el-radio-button {
      flex: 1;

      :deep(.el-radio-button__inner) {
        width: 100%;
      }
    }
  }
}
</style>

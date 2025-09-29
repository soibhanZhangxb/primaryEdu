<template>
  <div class="sorting-demo-container">
    <el-card class="control-panel">
      <template #header>
        <div class="card-header">
          <span>排序学习演示</span>
        </div>
      </template>

      <el-form label-width="100px">
        <el-form-item label="元素数量">
          <el-slider
            v-model="itemCount"
            :min="3"
            :max="10"
            @change="resetItems"
          />
        </el-form-item>

        <el-form-item label="排序类型">
          <el-select v-model="sortType" placeholder="请选择排序类型">
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
            <el-option label="随机" value="random" />
          </el-select>
        </el-form-item>

        <el-form-item label="动画速度">
          <el-slider
            v-model="animationSpeed"
            :min="100"
            :max="1000"
            :step="100"
          />
        </el-form-item>

        <el-button type="primary" @click="startSorting">开始排序</el-button>
        <el-button @click="resetItems">重置</el-button>
      </el-form>
    </el-card>

    <div class="canvas-container">
      <v-stage ref="stage" :config="stageConfig" @dragend="handleDragEnd">
        <v-layer ref="layer">
          <!-- 背景网格 -->
          <v-group v-for="x in 10" :key="'grid-x-' + x">
            <v-line
              :config="{
                points: [x * 60, 0, x * 60, 600],
                stroke: '#eee',
                strokeWidth: 1
              }"
            />
            <v-line
              :config="{
                points: [0, x * 60, 600, x * 60],
                stroke: '#eee',
                strokeWidth: 1
              }"
            />
          </v-group>

          <!-- 排序元素 -->
          <v-rect
            v-for="(item, index) in items"
            :key="'item-' + index"
            :config="{
              x: item.x,
              y: item.y,
              width: 50,
              height: item.height,
              fill: item.color,
              shadowColor: 'black',
              shadowBlur: 5,
              shadowOpacity: 0.3,
              shadowOffset: { x: 2, y: 2 },
              cornerRadius: 5,
              draggable: true,
              id: item.id
            }"
            @dragstart="handleDragStart(item)"
            @dragmove="handleDragMove(item)"
          />

          <!-- 元素上的数字标签 -->
          <v-text
            v-for="(item, index) in items"
            :key="'text-' + index"
            :config="{
              x: item.x + 25,
              y: item.y + item.height + 10,
              text: item.value.toString(),
              fontSize: 20,
              fill: '#333',
              align: 'center',
              width: 50
            }"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";

interface SortItem {
  id: string;
  value: number;
  height: number;
  x: number;
  y: number;
  originalX: number;
  color: string;
  order: number;
}

// 舞台配置
const stageConfig = reactive({
  width: 600,
  height: 400
});

// 控制面板数据
const itemCount = ref<number>(5);
const sortType = ref<"asc" | "desc" | "random">("asc");
const animationSpeed = ref<number>(500);
const isSorting = ref<boolean>(false);

// 排序元素数据
const items = ref<SortItem[]>([]);

// 颜色集合
const colors: string[] = [
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

// 初始化元素
const initItems = (): void => {
  const newItems: SortItem[] = [];
  const baseY = 300;

  for (let i = 0; i < itemCount.value; i++) {
    const value = Math.floor(Math.random() * 90) + 10;
    const height = value * 2;

    newItems.push({
      id: `item-${i}`,
      value: value,
      height: height,
      x: 100 + i * 60,
      y: baseY - height,
      originalX: 100 + i * 60,
      color: colors[i % colors.length],
      order: i
    });
  }

  items.value = newItems;
};

// 重置元素
const resetItems = (): void => {
  if (isSorting.value) {
    ElMessage.warning("请等待排序动画完成");
    return;
  }
  initItems();
};

// 开始排序
const startSorting = (): void => {
  if (isSorting.value) return;

  isSorting.value = true;

  // 根据排序类型确定目标顺序
  let targetItems = [...items.value];
  if (sortType.value === "asc") {
    targetItems.sort((a, b) => a.value - b.value);
  } else if (sortType.value === "desc") {
    targetItems.sort((a, b) => b.value - a.value);
  }
  // random 不需要排序，保持原样

  // 执行动画
  animateSorting(targetItems);
};

// 排序动画
const animateSorting = (targetItems: SortItem[]): void => {
  const duration = animationSpeed.value;
  const startTime = Date.now();

  // 保存初始位置
  const initialPositions = items.value.reduce(
    (acc: Record<string, { x: number; y: number }>, item) => {
      acc[item.id] = { x: item.x, y: item.y };
      return acc;
    },
    {}
  );

  // 计算目标位置
  const targetPositions: Record<string, { x: number; y: number }> = {};
  targetItems.forEach((item, index) => {
    targetPositions[item.id] = {
      x: 100 + index * 60,
      y: item.y
    };
  });

  // 动画函数
  const animate = (): void => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    items.value.forEach(item => {
      const initial = initialPositions[item.id];
      const target = targetPositions[item.id];

      if (initial && target) {
        item.x = initial.x + (target.x - initial.x) * progress;
      }
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // 动画完成，更新items的顺序
      items.value = targetItems.map((item, index) => ({
        ...item,
        x: 100 + index * 60,
        originalX: 100 + index * 60,
        order: index
      }));
      isSorting.value = false;
    }
  };

  animate();
};

// 拖拽处理
const draggedItem = ref<SortItem | null>(null);
const originalPosition = reactive({ x: 0, y: 0 });

const handleDragStart = (item: SortItem): void => {
  if (isSorting.value) return;

  draggedItem.value = item;
  originalPosition.x = item.x;
  originalPosition.y = item.y;
};

const handleDragMove = (item: SortItem): void => {
  if (isSorting.value) return;

  // 限制只能在水平方向移动
  item.y = originalPosition.y;
};

const handleDragEnd = (): void => {
  if (isSorting.value || !draggedItem.value) return;

  const item = draggedItem.value;
  const newX = item.x;

  // 找出最近的槽位
  let closestSlot = Math.round((newX - 100) / 60);
  closestSlot = Math.max(0, Math.min(items.value.length - 1, closestSlot));

  // 计算新位置
  const targetX = 100 + closestSlot * 60;

  // 更新元素位置
  item.x = targetX;
  item.originalX = targetX;

  // 更新其他元素的位置
  const otherItems = items.value.filter(i => i.id !== item.id);
  otherItems.sort((a, b) => a.originalX - b.originalX);

  let currentSlot = 0;
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[i].id === item.id) continue;

    const newPos = 100 + currentSlot * 60;
    if (newPos >= targetX) currentSlot++;

    items.value[i].x = newPos;
    items.value[i].originalX = newPos;
    currentSlot++;
  }

  // 重新排序items数组
  items.value.sort((a, b) => a.originalX - b.originalX);

  draggedItem.value = null;
};

// 初始化
initItems();
</script>

<style scoped lang="scss">
.sorting-demo-container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;

  .control-panel {
    flex-shrink: 0;
    width: 300px;

    .card-header {
      font-size: 18px;
      font-weight: bold;
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
}
</style>

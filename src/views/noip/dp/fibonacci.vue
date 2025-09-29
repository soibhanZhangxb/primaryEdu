<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DUtils from "@/utils/my/dutils";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";

defineOptions({ name: "NFibonacci" });

// Constants
const CANVAS_WIDTH = 940;
const CANVAS_HEIGHT = 580;
const origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const SCALE = 8; // 缩放因子

const gGrid = ref({ lines: [], labels: [] });

// Reactive state
const n = ref(10); // 斐波那契数列项数
const showGrid = ref(true);
const enableDrawing = ref(false);
const mousePos = ref({ x: 0, y: 0 }); // 当前鼠标坐标位置

// 斐波那契数列数据
const fibonacciNumbers = ref<number[]>([]);

// 计算步骤
const steps = ref<{ text: string; timestamp: string }[]>([]);

// 可视化元素
const fibonacciRects = ref<any[]>([]);
const fibonacciCircles = ref<any[]>([]);
const fibonacciTexts = ref<any[]>([]);
const fibonacciSpiral = ref<any[]>([]);

// Canvas references
const stageRef = ref<any>(null);
const drawingLayerRef = ref<any>(null);

// 计算斐波那契数列结果
const result = computed(() => {
  return fibonacciNumbers.value.join(", ");
});

// 计算斐波那契数列
const calculateFibonacci = () => {
  const num = n.value;
  const fib = [0, 1];
  const newSteps = [
    {
      text: `开始计算斐波那契数列前 ${num} 项`,
      timestamp: new Date().toLocaleTimeString()
    },
    { text: `F(0) = 0`, timestamp: new Date().toLocaleTimeString() },
    { text: `F(1) = 1`, timestamp: new Date().toLocaleTimeString() }
  ];

  for (let i = 2; i < num; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
    newSteps.push({
      text: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${fib[i - 1]} + ${fib[i - 2]} = ${fib[i]}`,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  fibonacciNumbers.value = fib.slice(0, num);
  steps.value = newSteps;

  steps.value.push({
    text: `计算完成！斐波那契数列前 ${num} 项为: ${fibonacciNumbers.value.join(", ")}`,
    timestamp: new Date().toLocaleTimeString()
  });

  // 更新可视化
  visualizeFibonacci();
};

// 可视化斐波那契数列 - 蜗牛壳样式
const visualizeFibonacci = () => {
  const numbers = fibonacciNumbers.value;

  // 清空现有元素
  fibonacciRects.value = [];
  fibonacciCircles.value = [];
  fibonacciTexts.value = [];
  fibonacciSpiral.value = [];

  // 从第三项开始绘制（前两项太小）
  let startX = origin.x;
  let startY = origin.y;
  let direction = 0; // 0=右, 1=下, 2=左, 3=上

  // 绘制螺旋路径点
  const spiralPoints: number[] = [];

  for (let i = 2; i < numbers.length; i++) {
    const num = numbers[i];
    const size = num * SCALE;
    let rectX, rectY;

    // 根据方向确定方块位置
    switch (direction) {
      case 0: // 右
        rectX = startX;
        rectY = startY;
        startX += size;
        break;
      case 1: // 下
        rectX = startX - size;
        rectY = startY;
        startY += size;
        break;
      case 2: // 左
        rectX = startX - size;
        rectY = startY - size;
        startX -= size;
        break;
      case 3: // 上
        rectX = startX;
        rectY = startY - size;
        startY -= size;
        break;
    }

    // 添加方块
    fibonacciRects.value.push({
      x: rectX,
      y: rectY,
      width: size,
      height: size,
      fill: `hsla(${(i * 30) % 360}, 70%, 70%, 0.3)`,
      stroke: `hsl(${(i * 30) % 360}, 70%, 50%)`,
      strokeWidth: 2
    });

    // 添加文本
    fibonacciTexts.value.push({
      x: rectX + size / 2,
      y: rectY + size / 2,
      text: num.toString(),
      fontSize: Math.max(12, Math.min(20, 16 - i)),
      fill: "white",
      align: "center",
      verticalAlign: "middle",
      fontStyle: "bold"
    });

    // 绘制四分之一圆弧 - 蜗牛壳样式
    let arcX, arcY;
    let arcStart = direction * 90;

    switch (direction) {
      case 0: // 右
        arcX = rectX + size;
        arcY = rectY;
        // 添加螺旋路径点
        for (let a = 0; a <= 90; a += 5) {
          const angle = (a * Math.PI) / 180;
          spiralPoints.push(arcX - Math.cos(angle) * size);
          spiralPoints.push(arcY + Math.sin(angle) * size);
        }
        break;
      case 1: // 下
        arcX = rectX;
        arcY = rectY + size;
        for (let a = 90; a <= 180; a += 5) {
          const angle = (a * Math.PI) / 180;
          spiralPoints.push(arcX + Math.sin(angle - Math.PI / 2) * size);
          spiralPoints.push(arcY - Math.cos(angle - Math.PI / 2) * size);
        }
        break;
      case 2: // 左
        arcX = rectX;
        arcY = rectY;
        for (let a = 180; a <= 270; a += 5) {
          const angle = (a * Math.PI) / 180;
          spiralPoints.push(arcX + Math.cos(angle) * size);
          spiralPoints.push(arcY - Math.sin(angle) * size);
        }
        break;
      case 3: // 上
        arcX = rectX + size;
        arcY = rectY;
        for (let a = 270; a <= 360; a += 5) {
          const angle = (a * Math.PI) / 180;
          spiralPoints.push(arcX - Math.sin(angle - Math.PI * 1.5) * size);
          spiralPoints.push(arcY + Math.cos(angle - Math.PI * 1.5) * size);
        }
        break;
    }

    // 添加圆弧
    fibonacciCircles.value.push({
      x: arcX,
      y: arcY,
      radius: size,
      stroke: `hsl(${(i * 30) % 360}, 70%, 50%)`,
      strokeWidth: 2,
      angle: 90,
      rotation: arcStart
    });

    // 更新方向
    direction = (direction + 1) % 4;
  }

  // 添加螺旋线
  if (spiralPoints.length > 0) {
    fibonacciSpiral.value.push({
      points: spiralPoints,
      stroke: "#3a7bd5",
      strokeWidth: 3,
      tension: 0.5,
      lineCap: "round",
      lineJoin: "round"
    });
  }
};

// 重置函数
const resetView = () => {
  n.value = 10;
  calculateFibonacci();
};

// Lifecycle hooks
onMounted(() => {
  gGrid.value = DUtils.drawGrid(CANVAS_WIDTH, CANVAS_HEIGHT, origin, SCALE);
  calculateFibonacci();

  // 添加鼠标位置监听, 获取舞台鼠标位置
  const stage = stageRef.value?.getStage();
  if (stage) {
    stage.on("mousemove", (e: any) => {
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
              斐波那契螺旋 - 自然界中的数学之美
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
                  v-show="showGrid"
                  :key="'grid-' + index"
                  :config="line"
                />

                <!-- 斐波那契方块 -->
                <v-rect
                  v-for="(rect, index) in fibonacciRects"
                  :key="'rect-' + index"
                  :config="rect"
                />

                <!-- 斐波那契圆弧 -->
                <v-circle
                  v-for="(circle, index) in fibonacciCircles"
                  :key="'circle-' + index"
                  :config="circle"
                />

                <!-- 斐波那契螺旋线 -->
                <v-line
                  v-for="(line, index) in fibonacciSpiral"
                  :key="'spiral-' + index"
                  :config="line"
                />

                <!-- 数字标签 -->
                <v-text
                  v-for="(text, index) in fibonacciTexts"
                  :key="'text-' + index"
                  :config="text"
                />

                <!-- 标题 -->
                <k-text-with-bg
                  text="斐波那契螺旋"
                  :x="CANVAS_WIDTH - 150"
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
        <h3 class="text-lg font-semibold mb-4 text-gray-800">数列信息:</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">斐波那契数列</p>
            <p class="text-xl font-mono font-bold text-blue-600">
              F(n) = F(n-1) + F(n-2)
            </p>
          </div>
          <div class="flex items-center justify-between h-full">
            <p class="text-sm text-gray-600">当前项数</p>
            <p class="text-lg font-mono">{{ n }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">参数控制</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              项数 n: {{ n }}
            </label>
            <el-slider
              v-model="n"
              :min="3"
              :max="15"
              :step="1"
              show-input
              @change="calculateFibonacci"
            />
          </div>
          <el-button type="primary" class="w-full" @click="calculateFibonacci">
            计算
          </el-button>
          <el-button type="info" class="w-full" @click="resetView">
            重置
          </el-button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">显示选项</h3>
        <div class="space-y-2">
          <el-checkbox v-model="showGrid">显示网格</el-checkbox>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">计算结果</h3>
        <div class="result-box">
          <p class="text-sm font-medium text-gray-700">斐波那契数列:</p>
          <p class="text-lg font-mono mt-2">{{ result }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">斐波那契螺旋</h3>
        <p class="text-sm text-gray-600">
          斐波那契螺旋(又称黄金螺旋)是根据斐波那契数列画出来的螺旋曲线，
          在自然界中广泛存在，如鹦鹉螺的外壳、星系旋臂等。
        </p>
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

.result-box {
  padding: 15px;
  margin-top: 10px;
  background: linear-gradient(135deg, #ecf5ff 0%, #b3d8ff 100%);
  border-left: 4px solid #409eff;
  border-radius: 8px;
}

:deep(.el-slider__input) {
  width: 110px;
}
</style>

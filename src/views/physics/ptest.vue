<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">
      初中物理动态滑轮组演示工具
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 左侧控制面板 -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">参数设置</h2>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >滑轮组类型</label
          >
          <el-radio-group v-model="state.pulleyType" size="small">
            <el-radio-button label="fixed" value="定滑轮" />
            <el-radio-button label="movable" value="动滑轮" />
            <el-radio-button label="system" value="滑轮组" />
          </el-radio-group>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >物重 (N)</label
          >
          <el-slider
            v-model="state.weight"
            :min="10"
            :max="100"
            :step="5"
            size="small"
          />
          <el-input v-model.number="state.weight" size="small" class="mt-1" />
        </div>

        <div v-if="state.pulleyType === 'system'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >动滑轮数量</label
          >
          <el-slider
            v-model="movablePulleyCount"
            :min="1"
            :max="3"
            :step="1"
            size="small"
          />
          <el-input
            v-model.number="movablePulleyCount"
            size="small"
            class="mt-1"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >摩擦系数</label
          >
          <el-slider
            v-model="state.frictionCoefficient"
            :min="0"
            :max="0.5"
            :step="0.05"
            size="small"
          />
          <el-input
            v-model.number="state.frictionCoefficient"
            size="small"
            class="mt-1"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >是否显示力向量</label
          >
          <el-switch v-model="state.showForces" size="small" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >是否显示物理量</label
          >
          <el-switch v-model="state.showValues" size="small" />
        </div>

        <el-button type="primary" class="w-full mt-4" @click="startSimulation">
          开始演示
        </el-button>
      </div>

      <!-- 中间演示区域 -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">滑轮组演示</h2>
        <div
          class="relative w-full h-[500px] bg-gray-50 rounded-lg overflow-hidden"
        >
          <v-stage ref="stageRef" :config="stageConfig" class="w-full h-full">
            <v-layer ref="backgroundLayerRef">
              <!-- 背景网格 -->
              <v-rect
                :x="0"
                :y="0"
                :width="stageConfig.width"
                :height="stageConfig.height"
                fill="#f9fafb"
              />
            </v-layer>

            <v-layer ref="pulleysLayerRef">
              <!-- 滑轮组将在这里动态生成 -->
            </v-layer>

            <v-layer v-if="state.showForces" ref="forcesLayerRef">
              <!-- 力向量将在这里动态生成 -->
            </v-layer>

            <v-layer v-if="state.showValues" ref="labelsLayerRef">
              <!-- 物理量标签将在这里动态生成 -->
            </v-layer>
          </v-stage>
        </div>
      </div>
    </div>

    <!-- 底部说明区域 -->
    <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4">物理原理说明</h2>
      <div class="prose max-w-none">
        <p>
          滑轮组是由多个滑轮组合而成的简单机械，主要用于改变力的方向和大小。
        </p>
        <h3>定滑轮</h3>
        <p>
          定滑轮的轴心固定不动，主要作用是改变力的方向，但不能省力。拉力等于物重：$F
          = G$
        </p>
        <h3>动滑轮</h3>
        <p>
          动滑轮的轴心可以移动，能省一半的力，但不能改变力的方向。拉力等于物重的一半：$F
          = \frac{G}{2}$
        </p>
        <h3>滑轮组</h3>
        <p>
          滑轮组由定滑轮和动滑轮组合而成，既能改变力的方向，又能省力。拉力计算公式：$F
          = \frac{G}{n}$，其中$n$是承重的绳子段数。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { Stage, Layer, Circle, Line, Text, Rect } from "vue-konva";
import {
  ElSlider,
  ElInput,
  ElRadioGroup,
  ElRadioButton,
  ElSwitch,
  ElButton
} from "element-plus";

// 导入Element Plus样式
import "element-plus/dist/index.css";

// 类型定义
type PulleyType = "fixed" | "movable" | "system";

// 状态管理
const stageRef = ref(null);
const backgroundLayerRef = ref(null);
const pulleysLayerRef = ref(null);
const forcesLayerRef = ref(null);
const labelsLayerRef = ref(null);

const state = reactive({
  pulleyType: "fixed" as PulleyType,
  weight: 50, // 物重 (N)
  frictionCoefficient: 0.1, // 摩擦系数
  showForces: true,
  showValues: true,
  movablePulleyCount: 1, // 动滑轮数量
  isSimulating: false,
  animationFrameId: null
});

// 计算属性
const stageConfig = reactive({
  width: 800,
  height: 500
});

// 计算拉力
const calculateTension = () => {
  if (state.pulleyType === "fixed") {
    return state.weight;
  } else if (state.pulleyType === "movable") {
    return state.weight / 2;
  } else {
    // 滑轮组: 拉力 = 物重 / 动滑轮上的绳子段数
    return state.weight / (state.movablePulleyCount * 2);
  }
};

// 计算机械效率
const calculateEfficiency = () => {
  const tension = calculateTension();
  const idealTension =
    state.weight /
    (state.pulleyType === "movable"
      ? 2
      : state.pulleyType === "system"
        ? state.movablePulleyCount * 2
        : 1);
  return Math.min(
    100,
    Math.round(
      (idealTension / (tension + tension * state.frictionCoefficient)) * 100
    )
  );
};

// 初始化演示
const initializeSimulation = () => {
  const backgroundLayer = backgroundLayerRef.value?.getNode()?.getLayer();
  const pulleysLayer = pulleysLayerRef.value?.getNode()?.getLayer();
  const forcesLayer = forcesLayerRef.value?.getNode()?.getLayer();
  const labelsLayer = labelsLayerRef.value?.getNode()?.getLayer();

  // 清空所有层
  if (backgroundLayer) backgroundLayer.destroyChildren();
  if (pulleysLayer) pulleysLayer.destroyChildren();
  if (forcesLayer) forcesLayer.destroyChildren();
  if (labelsLayer) labelsLayer.destroyChildren();

  // 创建背景
  if (backgroundLayer) {
    const bg = new window.Konva.Rect({
      x: 0,
      y: 0,
      width: stageConfig.width,
      height: stageConfig.height,
      fill: "#f9fafb"
    });
    backgroundLayer.add(bg);

    // 添加网格背景
    const gridSize = 20;
    const gridColor = "#e5e7eb";

    // 垂直线
    for (let i = 0; i <= stageConfig.width; i += gridSize) {
      const line = new window.Konva.Line({
        points: [i, 0, i, stageConfig.height],
        stroke: gridColor,
        strokeWidth: 1
      });
      backgroundLayer.add(line);
    }

    // 水平线
    for (let i = 0; i <= stageConfig.height; i += gridSize) {
      const line = new window.Konva.Line({
        points: [0, i, stageConfig.width, i],
        stroke: gridColor,
        strokeWidth: 1
      });
      backgroundLayer.add(line);
    }

    backgroundLayer.draw();
  }

  // 根据选择的滑轮类型创建相应的滑轮组
  if (pulleysLayer) {
    if (state.pulleyType === "fixed") {
      createFixedPulley(pulleysLayer);
    } else if (state.pulleyType === "movable") {
      createMovablePulley(pulleysLayer);
    } else {
      createPulleySystem(pulleysLayer);
    }

    pulleysLayer.draw();
  }

  // 更新力向量显示
  updateForcesDisplay();

  // 更新物理量显示
  updateLabelsDisplay();
};

// 创建定滑轮
const createFixedPulley = layer => {
  const pulleyRadius = 40;
  const pulleyX = stageConfig.width / 2;
  const pulleyY = 100;

  // 创建支架
  const support = new window.Konva.Rect({
    x: pulleyX - 60,
    y: pulleyY - 20,
    width: 120,
    height: 10,
    fill: "#334155"
  });
  layer.add(support);

  const supportLeg = new window.Konva.Rect({
    x: pulleyX - 5,
    y: pulleyY - 80,
    width: 10,
    height: 60,
    fill: "#334155"
  });
  layer.add(supportLeg);

  // 创建滑轮
  const pulley = new window.Konva.Circle({
    x: pulleyX,
    y: pulleyY,
    radius: pulleyRadius,
    stroke: "#1e293b",
    strokeWidth: 3,
    fill: "#cbd5e1"
  });
  layer.add(pulley);

  // 创建滑轮中心轴
  const pulleyAxis = new window.Konva.Circle({
    x: pulleyX,
    y: pulleyY,
    radius: 5,
    fill: "#1e293b"
  });
  layer.add(pulleyAxis);

  // 创建绳子
  const ropeTop = new window.Konva.Line({
    points: [
      pulleyX - pulleyRadius,
      pulleyY,
      pulleyX - pulleyRadius,
      pulleyY - 50
    ],
    stroke: "#78350f",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(ropeTop);

  const ropeBottom = new window.Konva.Line({
    points: [
      pulleyX - pulleyRadius,
      pulleyY,
      pulleyX - pulleyRadius,
      pulleyY + 200
    ],
    stroke: "#78350f",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(ropeBottom);

  // 创建重物
  const weightHeight = 60;
  const weightWidth = 40;
  const weightX = pulleyX - pulleyRadius;
  const weightY = pulleyY + 200 - weightHeight / 2;

  const weight = new window.Konva.Rect({
    x: weightX - weightWidth / 2,
    y: weightY - weightHeight / 2,
    width: weightWidth,
    height: weightHeight,
    fill: "#ef4444",
    stroke: "#b91c1c",
    strokeWidth: 2
  });
  layer.add(weight);

  // 存储引用以便动画使用
  state["weightObj"] = weight;
  state["ropeBottom"] = ropeBottom;
};

// 创建动滑轮
const createMovablePulley = layer => {
  const pulleyRadius = 40;
  const pulleyX = stageConfig.width / 2;
  const pulleyY = 150;

  // 创建支架
  const support = new window.Konva.Rect({
    x: pulleyX - 60,
    y: 50,
    width: 120,
    height: 10,
    fill: "#334155"
  });
  layer.add(support);

  // 创建固定点
  const anchorPoint = new window.Konva.Circle({
    x: pulleyX,
    y: 50,
    radius: 5,
    fill: "#1e293b"
  });
  layer.add(anchorPoint);

  // 创建滑轮
  const pulley = new window.Konva.Circle({
    x: pulleyX,
    y: pulleyY,
    radius: pulleyRadius,
    stroke: "#1e293b",
    strokeWidth: 3,
    fill: "#cbd5e1"
  });
  layer.add(pulley);

  // 创建滑轮中心轴
  const pulleyAxis = new window.Konva.Circle({
    x: pulleyX,
    y: pulleyY,
    radius: 5,
    fill: "#1e293b"
  });
  layer.add(pulleyAxis);

  // 创建绳子
  const ropeLeft = new window.Konva.Line({
    points: [pulleyX - pulleyRadius, pulleyY, pulleyX - pulleyRadius, 50],
    stroke: "#78350f",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(ropeLeft);

  const ropeRight = new window.Konva.Line({
    points: [pulleyX + pulleyRadius, pulleyY, pulleyX + pulleyRadius, 50],
    stroke: "#78350f",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(ropeRight);

  // 创建重物
  const weightHeight = 60;
  const weightWidth = 40;
  const weightX = pulleyX;
  const weightY = pulleyY + pulleyRadius + weightHeight / 2 + 10;

  const weight = new window.Konva.Rect({
    x: weightX - weightWidth / 2,
    y: weightY - weightHeight / 2,
    width: weightWidth,
    height: weightHeight,
    fill: "#ef4444",
    stroke: "#b91c1c",
    strokeWidth: 2
  });
  layer.add(weight);

  // 连接重物和滑轮的绳子
  const connectingRope = new window.Konva.Line({
    points: [
      weightX,
      weightY - weightHeight / 2,
      weightX,
      pulleyY + pulleyRadius
    ],
    stroke: "#78350f",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(connectingRope);

  // 存储引用以便动画使用
  state["weightObj"] = weight;
  state["pulleyObj"] = pulley;
  state["ropeLeft"] = ropeLeft;
  state["ropeRight"] = ropeRight;
  state["connectingRope"] = connectingRope;
};

// 创建滑轮组
const createPulleySystem = layer => {
  const pulleyRadius = 35;
  const pulleyX = stageConfig.width / 2;
  const topPulleyY = 100;
  const bottomPulleyY = 250;

  // 创建支架
  const support = new window.Konva.Rect({
    x: pulleyX - 80,
    y: topPulleyY - 20,
    width: 160,
    height: 10,
    fill: "#334155"
  });
  layer.add(support);

  // 创建定滑轮
  const fixedPulleys = [];
  const fixedPulleyCount = state.movablePulleyCount;

  for (let i = 0; i < fixedPulleyCount; i++) {
    const xPos =
      pulleyX -
      (fixedPulleyCount - 1) * pulleyRadius * 0.8 +
      i * pulleyRadius * 1.6;

    const pulley = new window.Konva.Circle({
      x: xPos,
      y: topPulleyY,
      radius: pulleyRadius,
      stroke: "#1e293b",
      strokeWidth: 3,
      fill: "#cbd5e1"
    });
    layer.add(pulley);

    const pulleyAxis = new window.Konva.Circle({
      x: xPos,
      y: topPulleyY,
      radius: 5,
      fill: "#1e293b"
    });
    layer.add(pulleyAxis);

    fixedPulleys.push({ pulley, x: xPos, y: topPulleyY });
  }

  // 创建动滑轮
  const movablePulleys = [];

  for (let i = 0; i < state.movablePulleyCount; i++) {
    const xPos =
      pulleyX -
      (state.movablePulleyCount - 1) * pulleyRadius * 0.8 +
      i * pulleyRadius * 1.6;

    const pulley = new window.Konva.Circle({
      x: xPos,
      y: bottomPulleyY,
      radius: pulleyRadius,
      stroke: "#1e293b",
      strokeWidth: 3,
      fill: "#94a3b8"
    });
    layer.add(pulley);

    const pulleyAxis = new window.Konva.Circle({
      x: xPos,
      y: bottomPulleyY,
      radius: 5,
      fill: "#1e293b"
    });
    layer.add(pulleyAxis);

    movablePulleys.push({ pulley, x: xPos, y: bottomPulleyY });
  }

  // 创建重物
  const weightHeight = 60;
  const weightWidth = 40 + (state.movablePulleyCount - 1) * 20;
  const weightX = pulleyX;
  const weightY = bottomPulleyY + pulleyRadius + weightHeight / 2 + 10;

  const weight = new window.Konva.Rect({
    x: weightX - weightWidth / 2,
    y: weightY - weightHeight / 2,
    width: weightWidth,
    height: weightHeight,
    fill: "#ef4444",
    stroke: "#b91c1c",
    strokeWidth: 2
  });
  layer.add(weight);

  // 连接动滑轮和重物
  const weightConnectors = [];
  for (let i = 0; i < state.movablePulleyCount; i++) {
    const connector = new window.Konva.Line({
      points: [
        movablePulleys[i].x,
        movablePulleys[i].y + pulleyRadius,
        weightX -
          weightWidth / 2 +
          (i * weightWidth) / (state.movablePulleyCount - 1 || 1),
        weightY - weightHeight / 2
      ],
      stroke: "#78350f",
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round"
    });
    layer.add(connector);
    weightConnectors.push(connector);
  }

  // 创建绳子系统
  let ropePoints = [];
  let currentX = fixedPulleys[0].x - pulleyRadius;
  let currentY = topPulleyY - 30;

  // 起点
  ropePoints.push(currentX, currentY);

  // 绳子连接定滑轮和动滑轮
  for (let i = 0; i < state.movablePulleyCount * 2; i++) {
    const isFixed = i % 2 === 0;
    const pulleyIndex = Math.floor(i / 2);

    if (isFixed) {
      // 连接到定滑轮
      const targetPulley = fixedPulleys[pulleyIndex];
      ropePoints.push(currentX, targetPulley.y);
      ropePoints.push(targetPulley.x, targetPulley.y);
      currentX = targetPulley.x;
      currentY = targetPulley.y;
    } else {
      // 连接到动滑轮
      const targetPulley = movablePulleys[pulleyIndex];
      ropePoints.push(currentX, targetPulley.y);
      ropePoints.push(targetPulley.x, targetPulley.y);
      currentX = targetPulley.x;
      currentY = targetPulley.y;
    }
  }

  // 终点
  ropePoints.push(currentX, currentY + 40);

  const rope = new window.Konva.Line({
    points: ropePoints,
    stroke: "#78350f",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(rope);

  // 存储引用以便动画使用
  state["weightObj"] = weight;
  state["movablePulleys"] = movablePulleys.map(p => p.pulley);
  state["fixedPulleys"] = fixedPulleys.map(p => p.pulley);
  state["rope"] = rope;
  state["weightConnectors"] = weightConnectors;
};

// 更新力向量显示
const updateForcesDisplay = () => {
  const forcesLayer = forcesLayerRef.value?.getNode()?.getLayer();
  if (!forcesLayer || !state.showForces) return;

  forcesLayer.destroyChildren();

  const tension = calculateTension();
  const gravity = state.weight;

  if (state.pulleyType === "fixed") {
    // 定滑轮的力向量
    const weightObj = state["weightObj"];
    const ropeBottom = state["ropeBottom"];

    if (weightObj && ropeBottom) {
      const weightX = weightObj.x() + weightObj.width() / 2;
      const weightY = weightObj.y();

      // 重力向量
      drawForceVector(
        forcesLayer,
        weightX,
        weightY,
        0,
        100,
        gravity,
        "#ef4444"
      );

      // 拉力向量
      drawForceVector(
        forcesLayer,
        weightX,
        weightY,
        0,
        -100,
        tension,
        "#3b82f6"
      );

      // 滑轮上的拉力
      const pulleyX = ropeBottom.points()[0];
      const pulleyY = ropeBottom.points()[1];
      drawForceVector(
        forcesLayer,
        pulleyX,
        pulleyY,
        0,
        -100,
        tension,
        "#3b82f6"
      );
    }
  } else if (state.pulleyType === "movable") {
    // 动滑轮的力向量
    const weightObj = state["weightObj"];
    const pulleyObj = state["pulleyObj"];

    if (weightObj && pulleyObj) {
      const weightX = weightObj.x() + weightObj.width() / 2;
      const weightY = weightObj.y();

      // 重力向量
      drawForceVector(
        forcesLayer,
        weightX,
        weightY,
        0,
        100,
        gravity,
        "#ef4444"
      );

      // 滑轮上的拉力
      const pulleyX = pulleyObj.x();
      const pulleyY = pulleyObj.y();

      // 左侧绳子拉力
      drawForceVector(
        forcesLayer,
        pulleyX - pulleyObj.radius(),
        pulleyY,
        -50,
        0,
        tension,
        "#3b82f6"
      );

      // 右侧绳子拉力
      drawForceVector(
        forcesLayer,
        pulleyX + pulleyObj.radius(),
        pulleyY,
        50,
        0,
        tension,
        "#3b82f6"
      );
    }
  } else {
    // 滑轮组的力向量
    const weightObj = state["weightObj"];
    const movablePulleys = state["movablePulleys"];

    if (weightObj && movablePulleys && movablePulleys.length > 0) {
      const weightX = weightObj.x() + weightObj.width() / 2;
      const weightY = weightObj.y();

      // 重力向量
      drawForceVector(
        forcesLayer,
        weightX,
        weightY,
        0,
        100,
        gravity,
        "#ef4444"
      );

      // 每个动滑轮上的拉力
      movablePulleys.forEach(pulley => {
        const pulleyX = pulley.x();
        const pulleyY = pulley.y();

        // 左侧绳子拉力
        drawForceVector(
          forcesLayer,
          pulleyX - pulley.radius(),
          pulleyY,
          -50,
          0,
          tension,
          "#3b82f6"
        );

        // 右侧绳子拉力
        drawForceVector(
          forcesLayer,
          pulleyX + pulley.radius(),
          pulleyY,
          50,
          0,
          tension,
          "#3b82f6"
        );
      });
    }
  }

  forcesLayer.draw();
};

// 绘制力向量
const drawForceVector = (layer, x, y, dx, dy, magnitude, color) => {
  const scale = 0.5; // 缩放因子，使向量更合适

  // 向量线段
  const line = new window.Konva.Line({
    points: [x, y, x + dx * scale, y + dy * scale],
    stroke: color,
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(line);

  // 箭头
  const headLength = 10;
  const angle = Math.atan2(dy, dx);

  const arrow1 = new window.Konva.Line({
    points: [
      x + dx * scale,
      y + dy * scale,
      x + dx * scale - headLength * Math.cos(angle - Math.PI / 6),
      y + dy * scale - headLength * Math.sin(angle - Math.PI / 6)
    ],
    stroke: color,
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(arrow1);

  const arrow2 = new window.Konva.Line({
    points: [
      x + dx * scale,
      y + dy * scale,
      x + dx * scale - headLength * Math.cos(angle + Math.PI / 6),
      y + dy * scale - headLength * Math.sin(angle + Math.PI / 6)
    ],
    stroke: color,
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round"
  });
  layer.add(arrow2);

  // 力大小标签
  const label = new window.Konva.Text({
    x: x + (dx * scale) / 2 - 15,
    y: y + (dy * scale) / 2 - 15,
    text: `${magnitude}N`,
    fontSize: 12,
    fill: color
  });
  layer.add(label);
};

// 更新物理量显示
const updateLabelsDisplay = () => {
  const labelsLayer = labelsLayerRef.value?.getNode()?.getLayer();
  if (!labelsLayer || !state.showValues) return;

  labelsLayer.destroyChildren();

  const tension = calculateTension();
  const efficiency = calculateEfficiency();

  // 创建标签
  const tensionLabel = new window.Konva.Text({
    x: 20,
    y: 20,
    text: `拉力: ${tension.toFixed(1)} N`,
    fontSize: 16,
    fill: "#1e293b"
  });
  labelsLayer.add(tensionLabel);

  const weightLabel = new window.Konva.Text({
    x: 20,
    y: 45,
    text: `物重: ${state.weight} N`,
    fontSize: 16,
    fill: "#1e293b"
  });
  labelsLayer.add(weightLabel);

  const efficiencyLabel = new window.Konva.Text({
    x: 20,
    y: 70,
    text: `机械效率: ${efficiency}%`,
    fontSize: 16,
    fill: "#1e293b"
  });
  labelsLayer.add(efficiencyLabel);

  // 在滑轮组上显示一些物理量
  if (
    state.pulleyType === "system" &&
    state.movablePulleys &&
    state.movablePulleys.length > 0
  ) {
    const pulley = state.movablePulleys[0];
    const pulleyX = pulley.x();
    const pulleyY = pulley.y() - 40;

    const segmentsLabel = new window.Konva.Text({
      x: pulleyX - 60,
      y: pulleyY,
      text: `承重绳子段数: ${state.movablePulleyCount * 2}`,
      fontSize: 14,
      fill: "#1e293b"
    });
    labelsLayer.add(segmentsLabel);
  }

  labelsLayer.draw();
};

// 开始演示
const startSimulation = () => {
  if (state.isSimulating) {
    stopSimulation();
  }

  state.isSimulating = true;

  // 初始化演示
  initializeSimulation();

  // 创建动画
  if (state.pulleyType === "fixed") {
    // 定滑轮动画
    animateFixedPulley();
  } else if (state.pulleyType === "movable") {
    // 动滑轮动画
    animateMovablePulley();
  } else {
    // 滑轮组动画
    animatePulleySystem();
  }
};

// 停止演示
const stopSimulation = () => {
  state.isSimulating = false;
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
};

// 定滑轮动画
const animateFixedPulley = () => {
  if (!state.isSimulating) return;

  const weightObj = state["weightObj"];
  const ropeBottom = state["ropeBottom"];

  if (!weightObj || !ropeBottom) return;

  // 上下移动动画
  const amplitude = 30;
  const speed = 0.02;
  const offset = Math.sin(Date.now() * speed) * amplitude;

  weightObj.y(
    weightObj.y() + offset - weightObj.getAttr("originalY", weightObj.y())
  );
  ropeBottom.points([
    ropeBottom.points()[0],
    ropeBottom.points()[1],
    ropeBottom.points()[2],
    ropeBottom.points()[3] +
      offset -
      ropeBottom.getAttr("originalY", ropeBottom.points()[3])
  ]);

  // 保存原始位置
  if (!weightObj.hasAttr("originalY")) {
    weightObj.setAttr("originalY", weightObj.y());
  }
  if (!ropeBottom.hasAttr("originalY")) {
    ropeBottom.setAttr("originalY", ropeBottom.points()[3]);
  }

  // 更新力向量和标签
  updateForcesDisplay();
  updateLabelsDisplay();

  // 重绘图层
  const pulleysLayer = pulleysLayerRef.value?.getNode()?.getLayer();
  if (pulleysLayer) pulleysLayer.draw();

  // 继续动画
  state.animationFrameId = requestAnimationFrame(animateFixedPulley);
};

// 动滑轮动画
const animateMovablePulley = () => {
  if (!state.isSimulating) return;

  const weightObj = state["weightObj"];
  const pulleyObj = state["pulleyObj"];
  const ropeLeft = state["ropeLeft"];
  const ropeRight = state["ropeRight"];
  const connectingRope = state["connectingRope"];

  if (!weightObj || !pulleyObj || !ropeLeft || !ropeRight || !connectingRope)
    return;

  // 上下移动动画
  const amplitude = 20;
  const speed = 0.015;
  const offset = Math.sin(Date.now() * speed) * amplitude;

  pulleyObj.y(
    pulleyObj.y() + offset - pulleyObj.getAttr("originalY", pulleyObj.y())
  );
  weightObj.y(
    weightObj.y() + offset - weightObj.getAttr("originalY", weightObj.y())
  );

  // 更新绳子
  ropeLeft.points([
    ropeLeft.points()[0],
    ropeLeft.points()[1],
    ropeLeft.points()[2],
    pulleyObj.y()
  ]);

  ropeRight.points([
    ropeRight.points()[0],
    ropeRight.points()[1],
    ropeRight.points()[2],
    pulleyObj.y()
  ]);

  connectingRope.points([
    connectingRope.points()[0],
    connectingRope.points()[1],
    connectingRope.points()[2],
    pulleyObj.y() + pulleyObj.radius()
  ]);

  // 保存原始位置
  if (!pulleyObj.hasAttr("originalY")) {
    pulleyObj.setAttr("originalY", pulleyObj.y());
  }
  if (!weightObj.hasAttr("originalY")) {
    weightObj.setAttr("originalY", weightObj.y());
  }

  // 更新力向量和标签
  updateForcesDisplay();
  updateLabelsDisplay();

  // 重绘图层
  const pulleysLayer = pulleysLayerRef.value?.getNode()?.getLayer();
  if (pulleysLayer) pulleysLayer.draw();

  // 继续动画
  state.animationFrameId = requestAnimationFrame(animateMovablePulley);
};

// 滑轮组动画
const animatePulleySystem = () => {
  if (!state.isSimulating) return;

  const weightObj = state["weightObj"];
  const movablePulleys = state["movablePulleys"];
  const rope = state["rope"];
  const weightConnectors = state["weightConnectors"];

  if (
    !weightObj ||
    !movablePulleys ||
    !movablePulleys.length ||
    !rope ||
    !weightConnectors
  )
    return;

  // 上下移动动画
  const amplitude = 25;
  const speed = 0.01;
  const offset = Math.sin(Date.now() * speed) * amplitude;

  // 更新动滑轮位置
  movablePulleys.forEach(pulley => {
    pulley.y(pulley.y() + offset - pulley.getAttr("originalY", pulley.y()));

    // 保存原始位置
    if (!pulley.hasAttr("originalY")) {
      pulley.setAttr("originalY", pulley.y());
    }
  });

  // 更新重物位置
  weightObj.y(
    weightObj.y() + offset - weightObj.getAttr("originalY", weightObj.y())
  );

  // 保存原始位置
  if (!weightObj.hasAttr("originalY")) {
    weightObj.setAttr("originalY", weightObj.y());
  }

  // 更新连接重物的绳子
  weightConnectors.forEach((connector, i) => {
    connector.points([
      connector.points()[0],
      connector.points()[1],
      connector.points()[2],
      weightObj.y() - weightObj.height() / 2
    ]);
  });

  // 更新力向量和标签
  updateForcesDisplay();
  updateLabelsDisplay();

  // 重绘图层
  const pulleysLayer = pulleysLayerRef.value?.getNode()?.getLayer();
  if (pulleysLayer) pulleysLayer.draw();

  // 继续动画
  state.animationFrameId = requestAnimationFrame(animatePulleySystem);
};

// 监听参数变化，更新演示
watch(
  [
    () => state.pulleyType,
    () => state.weight,
    () => state.frictionCoefficient,
    () => state.movablePulleyCount,
    () => state.showForces,
    () => state.showValues
  ],
  () => {
    if (!state.isSimulating) {
      initializeSimulation();
    }
  }
);

// 组件挂载后初始化
onMounted(() => {
  initializeSimulation();
});
</script>

<style scoped>
.container {
  max-width: 1400px;
}
</style>

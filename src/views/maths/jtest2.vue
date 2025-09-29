<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { v4 as uuidv4 } from "uuid";
import { message } from "@/utils/message";
import KTextWithBg from "@/views/components/konva/KTextWithBg.vue";
import DrawingTool from "@/views/components/konva/DrawingTool.vue";

interface StickMan {
  // ... 其他属性保持不变
  isHovered: boolean;
  id: string;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  rotation: number;
  color: string;
  headType: "circle" | "square" | "ellipse" | "triangle";
  headColor: string;
  headRadius: number;
  faceType: "normal" | "happy" | "angry";
  bodyLength: number;
  bodyWidth: number;
  armType: "straight" | "bent" | "wave";
  armLength: number;
  armWidth: number;
  armY: number;
  legType: "line" | "arrow" | "double-arrow" | "lightning";
  legLength: number;
  legWidth: number;
  legScale: {
    left: number;
    right: number;
  };
  legAngle: {
    left: number;
    right: number;
  };
  accessory: "none" | "hat" | "glasses";
  animationType: "walk" | "run" | "bounce" | "dance" | "float";
}
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

// 头部颜色集合
const headColors = [
  "#fff",
  "#ffe0b2",
  "#ffccbc",
  "#d1c4e9",
  "#b3e5fc",
  "#b2dfdb",
  "#c8e6c9",
  "#ffecb3"
];
// Canvas references
const stageRef = ref<any>(null);
//画图工具
const enableDrawing = ref(false);
const drawingLayerRef = ref<any>(null);
const mousePos = ref({ x: 0, y: 0 }); //当前鼠标坐标位置
// 舞台配置 宽高
const stageConfig = reactive({
  width: 900,
  height: 560
});

// 火柴人数据
const stickMen = reactive<StickMan[]>([]);
const animationSpeed = ref(5); //5 ~ 10
const animationId = ref<number | null>(null);
const isAnimating = ref(false);
const stickManRefs = ref<any[]>([]);
const bottomLine = ref(400);

// 随机 创建火柴人
const createRandomStickMan = (): StickMan => {
  const types = {
    head: ["circle", "square", "ellipse", "triangle"],
    face: ["normal", "happy", "angry"],
    arm: ["straight", "bent", "wave"],
    leg: ["line", "arrow", "double-arrow", "lightning"],
    accessory: ["none", "hat", "glasses"],
    animation: ["walk", "run", "bounce", "dance", "float"]
  };
  const headType = types.head[Math.floor(Math.random() * types.head.length)] as
    | "circle"
    | "square"
    | "ellipse"
    | "triangle";
  const headRadius = 15 + Math.random() * 10;
  let x = 150 + Math.random() * (stageConfig.width - 300),
    y = bottomLine.value;
  return {
    isHovered: false,
    id: uuidv4(),
    x: x,
    y: y,
    originalX: x,
    originalY: y,
    rotation: Math.random() * 10 - 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    headType,
    headColor: headColors[Math.floor(Math.random() * headColors.length)],
    headRadius,
    faceType: types.face[Math.floor(Math.random() * types.face.length)] as
      | "normal"
      | "happy"
      | "angry",
    bodyLength: 40 + Math.random() * 30,
    bodyWidth: 2 + Math.random() * 2,
    armType: types.arm[Math.floor(Math.random() * types.arm.length)] as
      | "straight"
      | "bent"
      | "wave",
    armLength: 25 + Math.random() * 20,
    armWidth: 2 + Math.random() * 2,
    armY: 10 + Math.random() * 10,
    legType: types.leg[Math.floor(Math.random() * types.leg.length)] as
      | "line"
      | "arrow"
      | "double-arrow"
      | "lightning",
    legLength: 30 + Math.random() * 20,
    legWidth: 2 + Math.random() * 2,
    legScale: { left: 1, right: 1 },
    legAngle: { left: 0, right: 0 },
    accessory: types.accessory[
      Math.floor(Math.random() * types.accessory.length)
    ] as "none" | "hat" | "glasses",
    animationType: types.animation[
      Math.floor(Math.random() * types.animation.length)
    ] as "walk" | "run" | "bounce" | "dance" | "float"
  };
};

// 随机添加火柴人
const addRandomStickMan = () => {
  if (stickMen.length >= 15) {
    message("最多只能添加15个火柴人", { type: "warning" });
    return;
  }
  stickMen.push(createRandomStickMan());
};

//重置火柴人
const resetRandomStickMan = () => {
  stopAllAnimations();
  //随机添加3个火柴人
  stickMen.length = 0;
  for (let i = 0; i < 3; i++) {
    addRandomStickMan();
  }
};

// 拖拽边界函数, 如果左右超界直接删除火柴人
const stickManDragBound = (pos: { x: number; y: number }, index: number) => {
  if (pos.x < -50 || pos.x > stageConfig.width + 50) {
    //删除 stickMen数组的 第 index个元素
    stickMen.splice(index, 1);
    return;
  }
  mousePos.value = { x: Math.round(pos.x), y: Math.round(pos.y) };
  //限定y向下和向上超界：
  let y = Math.min(
    pos.y,
    bottomLine.value - (stickMen[index].animationType === "float" ? 30 : 0)
  );
  y = y > 30 ? y : 30;

  //保存火柴人当前移动后的位置
  stickMen[index].originalX = stickMen[index].x = pos.x;
  stickMen[index].originalY = stickMen[index].y = y;

  return { x: pos.x, y: y };
};
// 添加鼠标事件处理函数
const handleMouseEnter = (index: number) => {
  if (index >= stickMen.length) return;

  stickMen[index].isHovered = true;
  // 安全地获取舞台元素
  const groupNode = stickManRefs.value[index]?.getNode();
  if (!groupNode) return;
  const stage = groupNode.getStage();
  if (!stage?.content) return;
  stage.content.style.cursor = "pointer";
};

const handleMouseLeave = (index: number) => {
  if (index >= stickMen.length) return;

  stickMen[index].isHovered = false;
  // 安全地获取舞台元素
  const groupNode = stickManRefs.value[index]?.getNode();
  if (!groupNode) return;
  const stage = groupNode.getStage();
  if (!stage?.content) return;
  stage.content.style.cursor = "default";
};
// 开始所有动画
const startAllAnimations = () => {
  if (isAnimating.value) return;
  // 记录每个火柴人的初始位置
  stickMen.forEach(man => {
    man.originalX = man.x;
    man.originalY = man.y;
  });
  isAnimating.value = true;
  animate();
};

// 动画函数
const animate = () => {
  if (!isAnimating.value) return;

  const time = Date.now();
  const speedFactor = 200 - animationSpeed.value * 15;

  // 更新每个火柴人的动画状态
  stickMen.forEach((man, index) => {
    const timeFactor = time / (speedFactor * (0.8 + Math.random() * 0.4));

    // 保存原始位置
    const originalX = man.originalX;
    const originalY = man.originalY;

    switch (man.animationType) {
      case "walk":
        // 行走动画 - 基于原始位置计算
        man.legAngle.left = Math.sin(timeFactor) * 20;
        man.legAngle.right = -man.legAngle.left;
        man.legScale.left = 1 + Math.sin(timeFactor) * 0.2;
        man.legScale.right = 1 - Math.sin(timeFactor) * 0.2;
        man.x = originalX + Math.cos(timeFactor) * 0.5;
        break;

      case "run":
        // 奔跑动画 - 基于原始位置计算
        man.legAngle.left = Math.sin(timeFactor * 2) * 30;
        man.legAngle.right = -man.legAngle.left;
        man.legScale.left = 1.2 + Math.sin(timeFactor * 2) * 0.3;
        man.legScale.right = 1.2 - Math.sin(timeFactor * 2) * 0.3;
        man.x = originalX + Math.cos(timeFactor * 2) * 1.5;
        break;

      case "bounce":
        // 弹跳动画 - 基于原始位置计算
        const bounce = Math.abs(Math.sin(timeFactor));
        man.legScale.left = 0.8 + bounce * 0.4;
        man.legScale.right = 0.8 + bounce * 0.4;
        man.y = originalY - bounce * 30;
        break;

      case "dance":
        // 舞蹈动画 - 基于原始位置计算
        man.legAngle.left = Math.sin(timeFactor) * 45;
        man.legAngle.right = Math.cos(timeFactor) * 45;
        man.legScale.left = 1 + Math.sin(timeFactor * 1.5) * 0.3;
        man.legScale.right = 1 + Math.cos(timeFactor * 1.5) * 0.3;
        man.rotation = Math.sin(timeFactor / 2) * 10;
        break;

      case "float":
        // 漂浮动画 - 基于原始位置计算
        man.y = originalY - 50 + Math.sin(timeFactor / 2) * 30;
        man.rotation = Math.sin(timeFactor / 3) * 5;
        man.legScale.left = 1 + Math.sin(timeFactor) * 0.1;
        man.legScale.right = 1 + Math.cos(timeFactor) * 0.1;
        break;
    }
    // 边界检查
    if (man.x < 50) man.x = 50;
    if (man.x > stageConfig.width - 50) man.x = stageConfig.width - 50;
    if (man.y < 50) man.y = 50;
    if (man.y > stageConfig.height - 50) man.y = stageConfig.height - 50;
  });

  animationId.value = requestAnimationFrame(animate);
};

// 停止所有动画
const stopAllAnimations = () => {
  if (!isAnimating.value) return;
  isAnimating.value = false;
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
    animationId.value = null;
  }

  // 重置所有动画状态
  stickMen.forEach(man => {
    man.legScale.left = 1;
    man.legScale.right = 1;
    man.legAngle.left = 0;
    man.legAngle.right = 0;
    //man.y = bottomLine.value;
    man.rotation = 0;
  });
};

// 初始化几个火柴人
onMounted(() => {
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
  //随机添加3个火柴人
  for (let i = 0; i < 3; i++) {
    addRandomStickMan();
  }
});

// 组件卸载前
onBeforeUnmount(() => {
  stopAllAnimations();
});
</script>

<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="main-content">
        <!-- 主内容区 -->
        <div class="p-2 flex justify-between items-center border-left-blue">
          <div class="bg-gray">探索排列组合</div>
          <div class="flex gap-2">
            <DrawingTool
              v-model:enableDrawing="enableDrawing"
              :stageRef="stageRef"
              :drawingLayerRef="drawingLayerRef"
            />
          </div>
        </div>
        <div class="relative">
          <v-stage ref="stageRef" :config="stageConfig">
            <v-layer ref="layer">
              <!-- 背景 -->
              <v-rect
                :config="{
                  x: 0,
                  y: 0,
                  width: stageConfig.width,
                  height: stageConfig.height,
                  fill: '#f5f7fa'
                }"
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
              <!-- 地面 -->
              <v-line
                :config="{
                  points: [
                    0,
                    bottomLine + 80,
                    stageConfig.width,
                    bottomLine + 80
                  ],
                  stroke: '#909399',
                  strokeWidth: 2,
                  dash: [10, 5]
                }"
              />

              <!-- 动态生成的火柴人 -->
              <v-group
                v-for="(man, index) in stickMen"
                :key="man.id"
                :ref="
                  el => {
                    if (el) stickManRefs[index] = el;
                  }
                "
                :config="{
                  x: man.x,
                  y: man.y,
                  draggable: true,
                  dragBoundFunc: pos => stickManDragBound(pos, index),
                  rotation: man.rotation
                }"
                @mouseenter="handleMouseEnter(index)"
                @mouseleave="handleMouseLeave(index)"
              >
                <!-- 添加高亮效果层 -->
                <template v-if="man.isHovered">
                  <v-circle
                    v-if="man.headType === 'circle'"
                    :config="{
                      x: 0,
                      y: -man.headRadius,
                      radius: man.headRadius + 5,
                      fill: 'rgba(255, 255, 0, 1)',
                      stroke: '#FFD700',
                      strokeWidth: 2,
                      dash: [5, 5],
                      listening: false
                    }"
                  />
                  <v-rect
                    v-else-if="man.headType === 'square'"
                    :config="{
                      x: -man.headRadius - 4,
                      y: -man.headRadius * 2 - 4,
                      width: man.headRadius * 2 + 8,
                      height: man.headRadius * 2 + 8,
                      fill: 'rgba(255, 255, 0, 1)',
                      stroke: '#FFD700',
                      strokeWidth: 2,
                      cornerRadius: 5,
                      dash: [5, 5],
                      listening: false
                    }"
                  />
                  <v-RegularPolygon
                    v-else-if="man.headType === 'triangle'"
                    :config="{
                      x: 0,
                      y: -man.headRadius,
                      sides: 3, // 三边形成三角形
                      radius: man.headRadius * 2 + 9,
                      fill: 'rgba(255, 255, 0, 1)',
                      stroke: '#FFD700',
                      strokeWidth: 2,
                      cornerRadius: 5,
                      dash: [5, 5],
                      listening: false
                    }"
                  />
                  <v-ellipse
                    v-else-if="man.headType === 'ellipse'"
                    :config="{
                      x: 0,
                      y: -man.headRadius,
                      radiusX: man.headRadius * 1.5 + 5,
                      radiusY: man.headRadius * 0.8 + 5,
                      fill: 'rgba(255, 255, 0, 1)',
                      stroke: '#FFD700',
                      strokeWidth: 2,
                      cornerRadius: 5,
                      dash: [5, 5],
                      listening: false
                    }"
                  />
                </template>
                <!-- 头部 - 根据类型不同可能有不同形状 -->
                <v-circle
                  v-if="man.headType === 'circle'"
                  :config="{
                    x: 0,
                    y: -man.headRadius,
                    radius: man.headRadius,
                    fill: man.headColor,
                    stroke: man.color,
                    strokeWidth: 2
                  }"
                />
                <v-rect
                  v-else-if="man.headType === 'square'"
                  :config="{
                    x: -man.headRadius,
                    y: -man.headRadius * 2,
                    width: man.headRadius * 2,
                    height: man.headRadius * 2,
                    fill: man.headColor,
                    stroke: man.color,
                    strokeWidth: 2,
                    cornerRadius: 5
                  }"
                />
                <v-RegularPolygon
                  v-else-if="man.headType === 'triangle'"
                  :config="{
                    x: 0,
                    y: -man.headRadius,
                    sides: 3, // 三边形成三角形
                    radius: man.headRadius * 2,
                    fill: man.headColor,
                    stroke: man.color,
                    strokeWidth: 2,
                    cornerRadius: 5
                  }"
                />
                <v-ellipse
                  v-else-if="man.headType === 'ellipse'"
                  :config="{
                    x: 0,
                    y: -man.headRadius,
                    radiusX: man.headRadius * 1.5,
                    radiusY: man.headRadius * 0.8,
                    fill: man.headColor,
                    stroke: man.color,
                    strokeWidth: 2,
                    cornerRadius: 5
                  }"
                />

                <!-- 身体 -->
                <v-line
                  :config="{
                    points: [0, 0, 0, man.bodyLength],
                    stroke: man.color,
                    strokeWidth: man.bodyWidth
                  }"
                />

                <!-- 手臂 -->
                <template v-if="man.armType === 'straight'">
                  <v-line
                    :config="{
                      points: [
                        -man.armLength,
                        man.armY,
                        man.armLength,
                        man.armY
                      ],
                      stroke: man.color,
                      strokeWidth: man.armWidth
                    }"
                  />
                </template>

                <template v-else-if="man.armType === 'bent'">
                  <v-line
                    :config="{
                      points: [
                        -man.armLength / 2,
                        man.armY - 10,
                        -man.armLength,
                        man.armY
                      ],
                      stroke: man.color,
                      strokeWidth: man.armWidth
                    }"
                  />
                  <v-line
                    :config="{
                      points: [
                        man.armLength / 2,
                        man.armY - 10,
                        man.armLength,
                        man.armY
                      ],
                      stroke: man.color,
                      strokeWidth: man.armWidth
                    }"
                  />
                </template>

                <template v-else-if="man.armType === 'wave'">
                  <v-line
                    :config="{
                      points: [
                        -man.armLength / 3,
                        man.armY - 5,
                        (-man.armLength * 2) / 3,
                        man.armY + 5,
                        -man.armLength,
                        man.armY
                      ],
                      stroke: man.color,
                      strokeWidth: man.armWidth,
                      tension: 0.5
                    }"
                  />
                  <v-line
                    :config="{
                      points: [
                        man.armLength / 3,
                        man.armY - 5,
                        (man.armLength * 2) / 3,
                        man.armY + 5,
                        man.armLength,
                        man.armY
                      ],
                      stroke: man.color,
                      strokeWidth: man.armWidth,
                      tension: 0.5
                    }"
                  />
                </template>

                <!-- 腿部 - 根据类型不同有多种形态 -->
                <template v-if="man.legType === 'line'">
                  <v-line
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        -man.legLength * man.legScale.left,
                        man.bodyLength + man.legLength
                      ],
                      stroke: man.color,
                      strokeWidth: man.legWidth
                    }"
                  />
                  <v-line
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        man.legLength * man.legScale.right,
                        man.bodyLength + man.legLength
                      ],
                      stroke: man.color,
                      strokeWidth: man.legWidth
                    }"
                  />
                </template>

                <template v-else-if="man.legType === 'arrow'">
                  <v-arrow
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        -man.legLength * man.legScale.left,
                        man.bodyLength + man.legLength
                      ],
                      pointerLength: 10,
                      pointerWidth: 8,
                      fill: man.color,
                      stroke: man.color,
                      strokeWidth: man.legWidth
                    }"
                  />
                  <v-arrow
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        man.legLength * man.legScale.right,
                        man.bodyLength + man.legLength
                      ],
                      pointerLength: 10,
                      pointerWidth: 8,
                      fill: man.color,
                      stroke: man.color,
                      strokeWidth: man.legWidth
                    }"
                  />
                </template>

                <template v-else-if="man.legType === 'double-arrow'">
                  <v-arrow
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        -man.legLength * man.legScale.left,
                        man.bodyLength + man.legLength
                      ],
                      pointerLength: 10,
                      pointerWidth: 8,
                      fill: man.color,
                      stroke: man.color,
                      strokeWidth: man.legWidth,
                      pointerAtBeginning: true,
                      pointerAtEnding: true
                    }"
                  />
                  <v-arrow
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        man.legLength * man.legScale.right,
                        man.bodyLength + man.legLength
                      ],
                      pointerLength: 10,
                      pointerWidth: 8,
                      fill: man.color,
                      stroke: man.color,
                      strokeWidth: man.legWidth,
                      pointerAtBeginning: true,
                      pointerAtEnding: true
                    }"
                  />
                </template>

                <template v-else-if="man.legType === 'lightning'">
                  <v-line
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        (-man.legLength / 2) * man.legScale.left,
                        man.bodyLength + man.legLength / 2,
                        -man.legLength * man.legScale.left,
                        man.bodyLength + man.legLength
                      ],
                      stroke: man.color,
                      strokeWidth: man.legWidth,
                      lineJoin: 'bevel'
                    }"
                  />
                  <v-line
                    :config="{
                      points: [
                        0,
                        man.bodyLength,
                        (man.legLength / 2) * man.legScale.right,
                        man.bodyLength + man.legLength / 2,
                        man.legLength * man.legScale.right,
                        man.bodyLength + man.legLength
                      ],
                      stroke: man.color,
                      strokeWidth: man.legWidth,
                      lineJoin: 'bevel'
                    }"
                  />
                  <v-arrow
                    :config="{
                      points: [
                        -man.legLength * man.legScale.left,
                        man.bodyLength + man.legLength,
                        -man.legLength * man.legScale.left - 10,
                        man.bodyLength + man.legLength + 10
                      ],
                      pointerLength: 8,
                      pointerWidth: 6,
                      fill: man.color,
                      stroke: man.color,
                      strokeWidth: 2
                    }"
                  />
                  <v-arrow
                    :config="{
                      points: [
                        man.legLength * man.legScale.right,
                        man.bodyLength + man.legLength,
                        man.legLength * man.legScale.right + 10,
                        man.bodyLength + man.legLength + 10
                      ],
                      pointerLength: 8,
                      pointerWidth: 6,
                      fill: man.color,
                      stroke: man.color,
                      strokeWidth: 2
                    }"
                  />
                </template>

                <!-- 面部特征 -->
                <template v-if="man.faceType === 'normal'">
                  <v-circle
                    :config="{
                      x: -8,
                      y: -man.headRadius - 5,
                      radius: 3,
                      fill: '#333'
                    }"
                  />
                  <v-circle
                    :config="{
                      x: 8,
                      y: -man.headRadius - 5,
                      radius: 3,
                      fill: '#333'
                    }"
                  />
                  <v-line
                    :config="{
                      points: [-8, -man.headRadius + 5, 8, -man.headRadius + 5],
                      stroke: '#333',
                      strokeWidth: 2,
                      lineCap: 'round'
                    }"
                  />
                </template>

                <template v-else-if="man.faceType === 'happy'">
                  <v-circle
                    :config="{
                      x: -8,
                      y: -man.headRadius - 5,
                      radius: 3,
                      fill: '#333'
                    }"
                  />
                  <v-circle
                    :config="{
                      x: 8,
                      y: -man.headRadius - 5,
                      radius: 3,
                      fill: '#333'
                    }"
                  />
                  <v-arc
                    :config="{
                      x: 0,
                      y: -man.headRadius + 5,
                      innerRadius: 0,
                      outerRadius: 8,
                      angle: 180,
                      rotation: 0,
                      fill: 'transparent',
                      stroke: '#333',
                      strokeWidth: 2
                    }"
                  />
                </template>

                <template v-else-if="man.faceType === 'angry'">
                  <v-line
                    :config="{
                      points: [
                        -12,
                        -man.headRadius - 8,
                        -4,
                        -man.headRadius - 2
                      ],
                      stroke: '#333',
                      strokeWidth: 2
                    }"
                  />
                  <v-line
                    :config="{
                      points: [12, -man.headRadius - 8, 4, -man.headRadius - 2],
                      stroke: '#333',
                      strokeWidth: 2
                    }"
                  />
                  <v-line
                    :config="{
                      points: [
                        -8,
                        -man.headRadius + 5,
                        0,
                        -man.headRadius + 2,
                        8,
                        -man.headRadius + 5
                      ],
                      stroke: '#333',
                      strokeWidth: 2,
                      tension: 0.5
                    }"
                  />
                </template>

                <!-- 装饰物 -->
                <template v-if="man.accessory === 'hat'">
                  <v-rect
                    :config="{
                      x: -man.headRadius - 5,
                      y: -man.headRadius * 2 - 10,
                      width: man.headRadius * 2 + 10,
                      height: 10,
                      fill: man.color,
                      stroke: '#333',
                      strokeWidth: 1,
                      cornerRadius: 3
                    }"
                  />
                </template>

                <template v-else-if="man.accessory === 'glasses'">
                  <v-rect
                    :config="{
                      x: -15,
                      y: -man.headRadius - 8,
                      width: 10,
                      height: 5,
                      fill: 'rgba(200, 200, 255, 0.5)',
                      stroke: '#333',
                      strokeWidth: 1
                    }"
                  />
                  <v-rect
                    :config="{
                      x: 5,
                      y: -man.headRadius - 8,
                      width: 10,
                      height: 5,
                      fill: 'rgba(200, 200, 255, 0.5)',
                      stroke: '#333',
                      strokeWidth: 1
                    }"
                  />
                  <v-line
                    :config="{
                      points: [-5, -man.headRadius - 5, 5, -man.headRadius - 5],
                      stroke: '#333',
                      strokeWidth: 1
                    }"
                  />
                </template>
                <!-- 名字 -->
                <!-- simple label -->
                <v-label
                  :config="{
                    x: man.headRadius,
                    y: man.bodyLength / 2,
                    opacity: 0.75
                  }"
                >
                  <v-tag
                    :config="{
                      fill: man.color,
                      cornerRadius: 10
                    }"
                  />
                  <v-text
                    :config="{
                      text: `小${index + 1}`,
                      fontFamily: 'Calibri',
                      fontSize: 14,
                      padding: 5,
                      fill: 'black'
                    }"
                  />
                </v-label>
              </v-group>
            </v-layer>
            <!-- Drawing Layer -->
            <v-layer ref="drawingLayerRef" />
          </v-stage>
        </div>
      </div>
      <div class="sidebar">
        <!-- 右侧边栏 -->
        <div class="controls">
          <div class="flex justify-between items-center">
            <el-button-group>
              <el-button type="success" @click="addRandomStickMan"
                >添加</el-button
              >
              <el-button type="primary" @click="resetRandomStickMan"
                >重置</el-button
              >
            </el-button-group>
            <div class="inline-block">（{{ stickMen?.length }} 人）</div>
          </div>

          <div class="mt-10">
            <div class="flex justify-between items-center mb-2">
              <el-button-group>
                <el-button type="primary" @click="startAllAnimations"
                  >开始</el-button
                >
                <el-button @click="stopAllAnimations">停止</el-button>
              </el-button-group>
              <div class="font-bold">动画速度</div>
            </div>
            <el-slider
              v-model="animationSpeed"
              :min="1"
              :max="10"
              label="速度"
            />
          </div>
        </div>
        <!-- 可以添加更多内容 -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


/* 响应式调整 - 可选 */
@media (width <= 1200px) {
  .main-container {
    min-width: 100%;

    .content-wrapper {
      flex-direction: column;
      min-width: 100%;

      .main-content {
        margin-right: 0;
        margin-bottom: 20px;
      }

      .sidebar {
        width: 100%;
      }
    }
  }
}

.main-container {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 1200px;
  height: calc(100vh - 130px) !important;
  min-height: 600px !important;
  background-color: #f5f7fa;

  .content-wrapper {
    display: flex;
    min-width: 1200px;
    //width: 100%;
    max-width: 1600px; /* 可根据需要调整最大宽度 */

    .main-content {
      /* 主区域 */
      flex: 1;
      padding: 20px;
      margin-right: 20px;
      background-color: #fff;
      box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    }

    .sidebar {
      /* 左边操作区 */
      width: 300px;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    }
  }
}

.dynamic-stick-man-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .el-button-group {
    margin-right: 20px;
  }
}

/* 添加全局光标样式 */
:deep(.konvajs-content) {
  cursor: default;
}
</style>

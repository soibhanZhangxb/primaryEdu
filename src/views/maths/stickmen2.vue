<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

interface StickMan {
  x: number;
  y: number;
  color: string;
  headRadius: number;
  animationType: string;
  armAngle: {
    left: number;
    right: number;
  };
  legAngle: {
    left: number;
    right: number;
  };
}

// 舞台配置
const stageConfig = reactive({
  width: 800,
  height: 400
});

// 五个不同形态的火柴人
const stickMen = reactive<StickMan[]>([
  {
    // 1标准火柴人
    x: 150,
    y: 300,
    color: "#333",
    headRadius: 20,
    animationType: "walk",
    armAngle: { left: 0, right: 0 },
    legAngle: { left: 0, right: 0 }
  },
  {
    // 2举手欢呼的火柴人
    x: 300,
    y: 300,
    color: "#45B7D1",
    headRadius: 18,
    animationType: "cheer",
    armAngle: { left: 0, right: 0 },
    legAngle: { left: 0, right: 0 }
  },
  {
    // 3跑步姿势的火柴人
    x: 450,
    y: 300,
    color: "rgba(222,143,63,0.8)",
    headRadius: 16,
    animationType: "run",
    armAngle: { left: 0, right: 0 },
    legAngle: { left: 0, right: 0 }
  },
  {
    // 4思考姿势的火柴人
    x: 600,
    y: 300,
    color: "#9575CD",
    headRadius: 22,
    animationType: "think",
    armAngle: { left: 0, right: 0 },
    legAngle: { left: 0, right: 0 }
  },
  {
    // 5跳舞的火柴人
    x: 750,
    y: 300,
    color: "#ff6b6b",
    headRadius: 24,
    animationType: "dance",
    armAngle: { left: 0, right: 0 },
    legAngle: { left: 0, right: 0 }
  }
]);

// 动画控制
const animationSpeed = ref(5);
const animationId = ref<number | null>(null);
const isAnimating = ref(false);
const stickManRefs = ref<any[]>([]);

// 获取身体配置
const getBodyConfig = (index: number) => ({
  points: [0, -stickMen[index].headRadius * 2, 0, 20],
  stroke: stickMen[index].color,
  strokeWidth: 3
});

// 获取头部配置
const getHeadConfig = (index: number) => ({
  x: 0,
  y: -stickMen[index].headRadius * 3,
  radius: stickMen[index].headRadius,
  fill: "#fff",
  stroke: stickMen[index].color,
  strokeWidth: 2
});

// 获取手臂配置
const getArmConfig = (index: number, side: "left" | "right") => ({
  points: side === "left" ? [-30, -20, -50, 0] : [30, -20, 50, 0],
  stroke: stickMen[index].color,
  strokeWidth: 3
});

// 获取腿部配置
const getLegConfig = (index: number, side: "left" | "right") => ({
  points: side === "left" ? [0, 20, -20, 50] : [0, 20, 20, 50],
  stroke: stickMen[index].color,
  strokeWidth: 3
});

// 获取眼睛配置
const getEyeConfig = (index: number, side: "left" | "right") => ({
  x: side === "left" ? -8 : 8,
  y: -stickMen[index].headRadius * 3 - 5,
  radius: 3,
  fill: stickMen[index].color
});

// 获取嘴巴配置
const getMouthConfig = (index: number) => ({
  points: [
    -8,
    -stickMen[index].headRadius * 3 + 5,
    8,
    -stickMen[index].headRadius * 3 + 5
  ],
  stroke: stickMen[index].color,
  strokeWidth: 2,
  lineCap: "round"
});

// 拖拽边界函数
const stickManDragBound = (pos: { x: number; y: number }, index: number) => {
  return {
    x: pos.x,
    y: Math.min(pos.y, 300 - (index === 4 ? 30 : 0)) // 跳舞的火柴人可以稍微低一点
  };
};

// 动画函数
const animate = () => {
  if (!isAnimating.value) return;

  const time = Date.now();

  // 更新每个火柴人的动画状态
  stickMen.forEach((man, index) => {
    switch (man.animationType) {
      case "walk":
        man.legAngle.left =
          Math.sin(time / (200 - animationSpeed.value * 15)) * 15;
        man.legAngle.right = -man.legAngle.left;
        break;

      case "cheer":
        man.armAngle.left =
          Math.sin(time / (300 - animationSpeed.value * 20)) * 10;
        man.armAngle.right = man.armAngle.left;
        break;

      case "run":
        man.armAngle.left =
          Math.sin(time / (150 - animationSpeed.value * 10)) * 30;
        man.armAngle.right = -man.armAngle.left;
        man.legAngle.left = -man.armAngle.left + 10;
        man.legAngle.right = -man.legAngle.left + 10;
        break;

      case "think":
        man.armAngle.right =
          Math.sin(time / (500 - animationSpeed.value * 30)) * 15;
        break;

      case "dance":
        man.armAngle.left =
          Math.sin(time / (250 - animationSpeed.value * 15)) * 45;
        man.armAngle.right =
          Math.cos(time / (250 - animationSpeed.value * 15)) * 45;
        man.legAngle.left = -man.armAngle.left * 0.7;
        man.legAngle.right = -man.legAngle.left;
        break;
    }

    // 更新DOM
    if (stickManRefs.value[index]) {
      const node = stickManRefs.value[index].getNode();
      node.find("Line").forEach((line: any) => {
        // 更新手臂和腿的角度
        if (line.attrs.points) {
          if (line.attrs.points[0] === -30 || line.attrs.points[0] === 30) {
            // 左臂或右臂
            const side = line.attrs.points[0] === -30 ? "left" : "right";
            const angle = man.armAngle[side];
            const length = 30;
            const endX =
              length *
              Math.cos(
                ((angle + (side === "left" ? 225 : 315)) * Math.PI) / 180
              );
            const endY =
              length *
              Math.sin(
                ((angle + (side === "left" ? 225 : 315)) * Math.PI) / 180
              );
            line.points([side === "left" ? -length : length, -20, endX, endY]);
          } else if (
            line.attrs.points[0] === 0 &&
            line.attrs.points[2] === -20
          ) {
            // 左腿
            const angle = man.legAngle.left;
            const length = 30;
            const endX = length * Math.cos(((angle + 225) * Math.PI) / 180);
            const endY = length * Math.sin(((angle + 225) * Math.PI) / 180);
            line.points([0, 20, endX, endY + 20]);
          } else if (
            line.attrs.points[0] === 0 &&
            line.attrs.points[2] === 20
          ) {
            // 右腿
            const angle = man.legAngle.right;
            const length = 30;
            const endX = length * Math.cos(((angle + 315) * Math.PI) / 180);
            const endY = length * Math.sin(((angle + 315) * Math.PI) / 180);
            line.points([0, 20, endX, endY + 20]);
          }
        }
      });
    }
  });

  animationId.value = requestAnimationFrame(animate);
};

// 开始所有动画
const startAllAnimations = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  animate();
};

// 停止所有动画
const stopAllAnimations = () => {
  if (!isAnimating.value) return;
  isAnimating.value = false;
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
    animationId.value = null;
  }

  // 重置所有角度
  stickMen.forEach(man => {
    man.armAngle.left = 0;
    man.armAngle.right = 0;
    man.legAngle.left = 0;
    man.legAngle.right = 0;
  });
};

// 重置所有位置
const resetAllPositions = () => {
  stickMen[0].x = 150;
  stickMen[1].x = 300;
  stickMen[2].x = 450;
  stickMen[3].x = 600;
  stickMen[4].x = 750;
  stickMen.forEach(man => (man.y = 300));
};

// 组件卸载前
onBeforeUnmount(() => {
  stopAllAnimations();
});
</script>

<template>
  <div class="multi-stick-man-container">
    <div class="controls">
      <el-button-group>
        <el-button type="primary" @click="startAllAnimations"
          >全部开始</el-button
        >
        <el-button @click="stopAllAnimations">全部停止</el-button>
        <el-button @click="resetAllPositions">全部重置</el-button>
      </el-button-group>

      <el-slider
        v-model="animationSpeed"
        :min="1"
        :max="10"
        label="动画速度"
        style="width: 200px; margin-left: 20px"
      />
    </div>

    <v-stage ref="stage" :config="stageConfig">
      <v-layer ref="layer">
        <!-- 背景 -->
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: stageConfig.width,
            height: stageConfig.height,
            fill: '#f0f0f0'
          }"
        />

        <!-- 地面 -->
        <v-line
          :config="{
            points: [0, 350, stageConfig.width, 350],
            stroke: '#888',
            strokeWidth: 2,
            dash: [10, 5]
          }"
        />

        <!-- 五个不同形态的火柴人 -->
        <v-group
          v-for="(man, index) in stickMen"
          :key="index"
          :ref="
            el => {
              if (el) stickManRefs[index] = el;
            }
          "
          :config="{
            x: man.x,
            y: man.y,
            draggable: true,
            dragBoundFunc: pos => stickManDragBound(pos, index)
          }"
        >
          <!-- 公共部分 - 身体 -->
          <v-line :config="getBodyConfig(index)" />

          <!-- 根据不同形态绘制不同部分 -->
          <template v-if="index === 0">
            <!-- 标准火柴人 -->
            <v-circle :config="getHeadConfig(index)" />
            <v-line :config="getArmConfig(index, 'left')" />
            <v-line :config="getArmConfig(index, 'right')" />
            <v-line :config="getLegConfig(index, 'left')" />
            <v-line :config="getLegConfig(index, 'right')" />
            <v-circle :config="getEyeConfig(index, 'left')" />
            <v-circle :config="getEyeConfig(index, 'right')" />
            <v-line :config="getMouthConfig(index)" />
          </template>

          <template v-else-if="index === 1">
            <!-- 举手欢呼的火柴人 -->
            <v-circle :config="getHeadConfig(index)" />
            <v-line
              :config="{
                points: [-30, -40, -30, -80],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [30, -40, 30, -80],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line :config="getLegConfig(index, 'left')" />
            <v-line :config="getLegConfig(index, 'right')" />
            <v-circle :config="getEyeConfig(index, 'left')" />
            <v-circle :config="getEyeConfig(index, 'right')" />
            <v-line
              :config="{
                points: [-8, -45, 8, -45],
                stroke: '#333',
                strokeWidth: 2,
                lineCap: 'round'
              }"
            />
          </template>

          <template v-else-if="index === 2">
            <!-- 跑步姿势的火柴人 -->
            <v-circle :config="getHeadConfig(index)" />
            <v-line
              :config="{
                points: [-30, -20, -50, 0],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [30, -20, 50, 0],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [0, 20, -30, 60],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [0, 20, 30, 60],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-circle :config="getEyeConfig(index, 'left')" />
            <v-circle :config="getEyeConfig(index, 'right')" />
            <v-line
              :config="{
                points: [-8, -45, 8, -45],
                stroke: '#333',
                strokeWidth: 2,
                lineCap: 'round'
              }"
            />
          </template>

          <template v-else-if="index === 3">
            <!-- 思考姿势的火柴人 -->
            <v-circle :config="getHeadConfig(index)" />
            <v-line
              :config="{
                points: [-30, -20, -50, -40],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [30, -20, 50, -10],
                stroke: '#333',
                strokeWidth: 3
              }"
            />
            <v-line :config="getLegConfig(index, 'left')" />
            <v-line :config="getLegConfig(index, 'right')" />
            <v-circle :config="getEyeConfig(index, 'left')" />
            <v-circle :config="getEyeConfig(index, 'right')" />
            <v-line
              :config="{
                points: [-8, -45, 0, -40, 8, -45],
                stroke: '#333',
                strokeWidth: 2,
                lineCap: 'round'
              }"
            />
          </template>

          <template v-else-if="index === 4">
            <!-- 跳舞的火柴人 -->
            <v-circle :config="getHeadConfig(index)" />
            <v-line
              :config="{
                points: [-30, -20, -50, -50],
                stroke: '#ff6b6b',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [30, -20, 50, -50],
                stroke: '#ff6b6b',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [0, 20, -30, 80],
                stroke: '#ff6b6b',
                strokeWidth: 3
              }"
            />
            <v-line
              :config="{
                points: [0, 20, 30, 80],
                stroke: '#ff6b6b',
                strokeWidth: 3
              }"
            />
            <v-circle :config="getEyeConfig(index, 'left')" />
            <v-circle :config="getEyeConfig(index, 'right')" />
            <v-line
              :config="{
                points: [-8, -45, 8, -45],
                stroke: '#ff6b6b',
                strokeWidth: 2,
                lineCap: 'round'
              }"
            />
          </template>
        </v-group>
      </v-layer>
    </v-stage>
  </div>
</template>

<style scoped lang="scss">
.multi-stick-man-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .controls {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .el-button-group {
    margin-right: 20px;
  }
}
</style>

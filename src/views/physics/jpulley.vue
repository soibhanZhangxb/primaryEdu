<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
//KonvaNodeComponent 是 Konva 组件的基础类型，主要用于类型定义和组件扩展
import { Node } from "vue-konva";

interface PulleyConfig {
  groupConfig: Node;
  wheelConfig: Node;
  axleConfig: Node;
  bracketConfig: Node;
}

interface RopeConfig extends Node {
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap: string;
}

// 控制参数
const pulleyType = ref<"single" | "double" | "triple">("single");
const pulleyFixed = ref(true); // true: 定滑轮, false: 动滑轮
const weight = ref(10); // 物体重量(N)
const appliedForce = ref(5); // 施加拉力(N)
const isAnimating = ref(false);
const animationFrameId = ref<number | null>(null);

// 物理参数
const objectPosition = ref(400); // 物体初始Y位置
const objectVelocity = ref(0);
const objectAcceleration = ref(0);
const lastTimestamp = ref(0);

// 画布配置
const stageConfig = ref({
  width: 800,
  height: 600
});

// 支撑结构配置
const supportConfig = ref({
  x: 100,
  y: 50,
  width: 600,
  height: 20,
  fill: "#8B4513",
  stroke: "#654321",
  strokeWidth: 2
});

// 滑轮组配置
const pulleys = ref<PulleyConfig[]>([]);

// 绳子配置
const ropes = ref<RopeConfig[]>([]);

// 物体配置
const objectGroupConfig = ref({
  x: 400,
  y: objectPosition,
  width: 60,
  height: 80
});

const objectConfig = ref({
  width: 60,
  height: 80,
  fill: "#4682B4",
  stroke: "#2F4F4F",
  strokeWidth: 2,
  cornerRadius: 5
});

const objectTextConfig = ref({
  text: "10N",
  x: 30,
  y: 40,
  fontSize: 16,
  fill: "white",
  align: "center"
});

// 手配置
const handGroupConfig = ref({
  x: 700,
  y: 150,
  draggable: false
});

const handConfig = ref({
  x: 0,
  y: 0,
  radius: 15,
  fill: "#FFD700",
  stroke: "#DAA520",
  strokeWidth: 2
});

const armConfig = ref({
  points: [0, 0, 0, 60],
  stroke: "#FFD700",
  strokeWidth: 8,
  lineCap: "round",
  lineJoin: "round"
});

// 力指示器配置
const showForceIndicator = ref(false);
const forceIndicatorConfig = ref({
  points: [0, 0, 0, 0],
  stroke: "red",
  strokeWidth: 2,
  dash: [5, 5]
});

const forceTextConfig = ref({
  x: 0,
  y: 0,
  text: "",
  fontSize: 14,
  fill: "red"
});

// 计算属性
const mechanicalAdvantage = computed(() => {
  if (pulleyFixed.value) return 1; // 定滑轮不省力

  // 动滑轮的机械利益取决于绳子段数
  switch (pulleyType.value) {
    case "single":
      return 2; // 单动滑轮
    case "double":
      return 3; // 一动一定
    case "triple":
      return 4; // 一动两定
    default:
      return 1;
  }
});

const theoreticalForce = computed(() => {
  return weight.value / mechanicalAdvantage.value;
});

const netForce = computed(() => {
  return appliedForce.value * mechanicalAdvantage.value - weight.value;
});

const forceStatus = computed(() => {
  if (!isAnimating.value) return "未开始";

  if (Math.abs(netForce.value) < 0.1) return "平衡状态";
  if (netForce.value > 0) return "物体上升中";
  return "拉力不足";
});

const forceStatusColor = computed(() => {
  if (!isAnimating.value) return "black";

  if (Math.abs(netForce.value) < 0.1) return "green";
  if (netForce.value > 0) return "blue";
  return "red";
});

// 创建滑轮
const createPulley = (x: number, y: number, isFixed: boolean): PulleyConfig => {
  return {
    groupConfig: {
      x,
      y,
      offsetX: 20,
      offsetY: 20,
      draggable: false
    },
    wheelConfig: {
      x: 0,
      y: 0,
      radius: 20,
      fill: "#D3D3D3",
      stroke: "#A9A9A9",
      strokeWidth: 2
    },
    axleConfig: {
      x: 0,
      y: 0,
      radius: 3,
      fill: "#696969"
    },
    bracketConfig: {
      points: [0, 0, 0, isFixed ? -30 : 30],
      stroke: "#A9A9A9",
      strokeWidth: 5,
      lineCap: "round"
    }
  };
};

// 初始化滑轮系统
const initPulleys = () => {
  pulleys.value = [];
  ropes.value = [];

  const baseX = 400;
  const fixedY = 100;
  const movableY = pulleyFixed.value ? fixedY : objectPosition.value - 40;

  // 主滑轮
  pulleys.value.push(createPulley(baseX, movableY, pulleyFixed.value));

  // 根据类型添加额外滑轮
  if (pulleyType.value === "double" || pulleyType.value === "triple") {
    pulleys.value.push(createPulley(baseX - 120, fixedY, true));
    if (pulleyType.value === "triple") {
      pulleys.value.push(createPulley(baseX + 120, fixedY, true));
    }
  }

  updateRopes();
};

// 更新绳子路径
const updateRopes = () => {
  ropes.value = [];

  const mainPulley = pulleys.value[0];
  const objectX = objectGroupConfig.value.x;
  const objectTop = objectPosition.value;

  // 主绳子 - 从手到第一个滑轮
  ropes.value.push({
    points: [
      handGroupConfig.value.x,
      handGroupConfig.value.y + 15,
      mainPulley.groupConfig.x - 20,
      mainPulley.groupConfig.y
    ],
    stroke: "#F5F5F5",
    strokeWidth: 3,
    lineCap: "round"
  });

  // 滑轮间的绳子
  if (pulleyType.value === "double") {
    const fixedPulley = pulleys.value[1];
    ropes.value.push({
      points: [
        mainPulley.groupConfig.x + 20,
        mainPulley.groupConfig.y,
        fixedPulley.groupConfig.x - 20,
        fixedPulley.groupConfig.y
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });

    // 从固定滑轮连接到物体
    ropes.value.push({
      points: [
        fixedPulley.groupConfig.x + 20,
        fixedPulley.groupConfig.y,
        objectX,
        objectTop
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });
  } else if (pulleyType.value === "triple") {
    const fixedPulley1 = pulleys.value[1];
    const fixedPulley2 = pulleys.value[2];

    // 主滑轮到左侧固定滑轮
    ropes.value.push({
      points: [
        mainPulley.groupConfig.x - 20,
        mainPulley.groupConfig.y,
        fixedPulley1.groupConfig.x + 20,
        fixedPulley1.groupConfig.y
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });

    // 主滑轮到右侧固定滑轮
    ropes.value.push({
      points: [
        mainPulley.groupConfig.x + 20,
        mainPulley.groupConfig.y,
        fixedPulley2.groupConfig.x - 20,
        fixedPulley2.groupConfig.y
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });

    // 从固定滑轮连接到物体
    ropes.value.push({
      points: [
        fixedPulley1.groupConfig.x - 20,
        fixedPulley1.groupConfig.y,
        objectX - 30,
        objectTop
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });

    ropes.value.push({
      points: [
        fixedPulley2.groupConfig.x + 20,
        fixedPulley2.groupConfig.y,
        objectX + 30,
        objectTop
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });
  } else {
    // 单滑轮直接连接到物体
    ropes.value.push({
      points: [
        mainPulley.groupConfig.x + 20,
        mainPulley.groupConfig.y,
        objectX,
        objectTop
      ],
      stroke: "#F5F5F5",
      strokeWidth: 3,
      lineCap: "round"
    });
  }
};

// 更新力指示器
const updateForceIndicator = () => {
  const length = Math.min(Math.abs(netForce.value) * 5, 150);

  forceIndicatorConfig.value.points = [
    objectGroupConfig.value.x,
    objectPosition.value + 80,
    objectGroupConfig.value.x,
    objectPosition.value + 80 + length * (netForce.value > 0 ? -1 : 1)
  ];

  forceTextConfig.value.text = `${Math.abs(netForce.value).toFixed(2)}N ${netForce.value > 0 ? "↑" : "↓"}`;
  forceTextConfig.value.x = objectGroupConfig.value.x + 5;
  forceTextConfig.value.y =
    objectPosition.value +
    80 +
    length * (netForce.value > 0 ? -1 : 1) +
    (netForce.value > 0 ? -20 : 5);
};

// 动画循环
const animate = (timestamp: number) => {
  if (!lastTimestamp.value) {
    lastTimestamp.value = timestamp;
  }

  const deltaTime = (timestamp - lastTimestamp.value) / 1000; // 转换为秒
  lastTimestamp.value = timestamp;

  // 计算加速度 (F=ma)
  objectAcceleration.value = (netForce.value / weight.value) * 9.8 * 10; // 乘以10是为了放大动画效果

  // 更新速度
  objectVelocity.value += objectAcceleration.value * deltaTime;

  // 限制最大速度
  const maxSpeed = 100;
  if (Math.abs(objectVelocity.value) > maxSpeed) {
    objectVelocity.value = maxSpeed * Math.sign(objectVelocity.value);
  }

  // 更新位置
  objectPosition.value += objectVelocity.value * deltaTime;

  // 限制物体位置范围
  if (objectPosition.value < 200) objectPosition.value = 200;
  if (objectPosition.value > 500) objectPosition.value = 500;

  // 如果是动滑轮，更新滑轮位置
  if (!pulleyFixed.value) {
    pulleys.value[0].groupConfig.y = objectPosition.value - 40;
  }

  // 更新绳子路径
  updateRopes();

  // 更新力指示器
  updateForceIndicator();

  // 更新物体文本
  objectTextConfig.value.text = `${weight.value}N`;

  // 继续动画
  if (isAnimating.value) {
    animationFrameId.value = requestAnimationFrame(animate);
  }
};

// 开始动画
const startAnimation = () => {
  if (isAnimating.value) return;

  isAnimating.value = true;
  showForceIndicator.value = true;
  objectVelocity.value = 0;
  lastTimestamp.value = 0;

  animationFrameId.value = requestAnimationFrame(animate);
};

// 重置动画
const resetAnimation = () => {
  isAnimating.value = false;
  showForceIndicator.value = false;

  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }

  // 重置位置和速度
  objectPosition.value = 400;
  objectVelocity.value = 0;
  objectAcceleration.value = 0;

  // 重置滑轮位置
  initPulleys();
};

// 监视参数变化
watch([pulleyType, pulleyFixed, weight], () => {
  resetAnimation();
  initPulleys();
});

// 初始化
onMounted(() => {
  initPulleys();
});
</script>

<template>
  <div class="pulley-system-demo">
    <el-card class="control-panel">
      <template #header>
        <div class="card-header">
          <span>滑轮组控制系统</span>
        </div>
      </template>

      <el-form label-width="100px">
        <el-form-item label="滑轮组类型">
          <el-radio-group v-model="pulleyType">
            <el-radio-button value="single">单滑轮</el-radio-button>
            <el-radio-button value="double">双滑轮</el-radio-button>
            <el-radio-button value="triple">三滑轮</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="滑轮类型">
          <el-radio-group v-model="pulleyFixed">
            <el-radio-button :value="true">定滑轮</el-radio-button>
            <el-radio-button :value="false">动滑轮</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="物体重量(N)">
          <el-slider
            v-model="weight"
            :min="1"
            :max="20"
            :step="0.5"
            show-input
          />
        </el-form-item>

        <el-form-item label="施加拉力(N)">
          <el-slider
            v-model="appliedForce"
            :min="0.5"
            :max="20"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="startAnimation">开始演示</el-button>
          <el-button @click="resetAnimation">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="physics-info">
        <p>机械利益: {{ mechanicalAdvantage }}</p>
        <p>理论所需拉力: {{ theoreticalForce.toFixed(2) }} N</p>
        <p v-if="isAnimating" :style="{ color: forceStatusColor }">
          状态: {{ forceStatus }}
        </p>
        <p v-if="isAnimating">物体位置: {{ objectPosition.toFixed(1) }} px</p>
      </div>
    </el-card>

    <div class="canvas-container">
      <v-stage ref="stageRef" :config="stageConfig">
        <v-layer ref="layerRef">
          <!-- 支撑结构 -->
          <v-rect :config="supportConfig" />

          <!-- 滑轮组 -->
          <v-group
            v-for="(pulley, index) in pulleys"
            :key="'pulley-' + index"
            :config="pulley.groupConfig"
          >
            <v-circle :config="pulley.wheelConfig" />
            <v-circle :config="pulley.axleConfig" />
            <v-line :config="pulley.bracketConfig" />
          </v-group>

          <!-- 绳子 -->
          <v-line
            v-for="(rope, index) in ropes"
            :key="'rope-' + index"
            :config="rope"
          />

          <!-- 物体 -->
          <v-group :config="objectGroupConfig">
            <v-rect :config="objectConfig" />
            <v-text :config="objectTextConfig" />
          </v-group>

          <!-- 手 -->
          <v-group :config="handGroupConfig">
            <v-circle :config="handConfig" />
            <v-line :config="armConfig" />
          </v-group>

          <!-- 力指示器 -->
          <v-group v-if="showForceIndicator">
            <v-line :config="forceIndicatorConfig" />
            <v-text :config="forceTextConfig" />
          </v-group>
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<style scoped>
.pulley-system-demo {
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  padding: 20px;
}

.control-panel {
  width: 350px;
  height: 100%;
  margin-right: 20px;
  overflow-y: auto;
}

.canvas-container {
  flex: 1;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: 4px;
}

.physics-info {
  padding: 10px;
  margin-top: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.physics-info p {
  margin: 5px 0;
  font-size: 14px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>

<template>
  <div class="lens-demo-container">
    <!-- 控制面板（右侧） -->
    <div class="control-panel">
      <h2>凸透镜成像原理演示</h2>
      <div class="slider-container">
        <span class="label">蜡烛位置: {{ candlePosition }} (单位: cm)</span>
        <el-slider
          v-model="candlePosition"
          :min="10"
          :max="90"
          :step="1"
          @input="updateImage"
        />
      </div>
      <div class="params-display">
        <p>焦距: {{ focalLength }} cm</p>
        <p>物距: {{ objectDistance }} cm</p>
        <p>像距: {{ Math.abs(imageDistance).toFixed(2) }} cm</p>
        <p>
          放大率: {{ Math.abs(magnification).toFixed(2) }} ×
          {{ magnification > 0 ? "正立" : "倒立" }}
        </p>
        <p :class="imageTypeClass">{{ imageType }}</p>
      </div>
      <div class="image-info">
        <h3>成像规律</h3>
        <ul>
          <li>物距 > 2倍焦距: 倒立缩小的实像</li>
          <li>物距 = 2倍焦距: 倒立等大的实像</li>
          <li>物距在1-2倍焦距之间: 倒立放大的实像</li>
          <li>物距 = 焦距: 不成像（平行光）</li>
          <li>物距 {{ "<" }} 焦距: 正立放大的虚像</li>
        </ul>
      </div>
    </div>

    <!-- 画布区域（左侧） -->
    <div class="canvas-container">
      <v-stage ref="stage" :config="stageConfig">
        <v-layer>
          <!-- 坐标轴 -->
          <v-line :config="axisX" />
          <v-line :config="axisY" />

          <!-- 刻度线 -->
          <v-line
            v-for="(mark, index) in xAxisMarks"
            :key="'x-mark-' + index"
            :config="mark"
          />
          <v-text
            v-for="(label, index) in xAxisLabels"
            :key="'x-label-' + index"
            :config="label"
          />

          <!-- 橄榄球形凸透镜 -->
          <v-path :config="lensPath" />

          <!-- 焦点标记 -->
          <v-line :config="focusFLeft" />
          <v-line :config="focus2FLeft" />
          <v-line :config="focusFRight" />
          <v-line :config="focus2FRight" />
          <v-text :config="focusFLeftLabel" />
          <v-text :config="focus2FLeftLabel" />
          <v-text :config="focusFRightLabel" />
          <v-text :config="focus2FRightLabel" />
          <v-text :config="lensCenterLabel" />

          <!-- 蜡烛（可拖动） -->
          <v-group
            :config="{
              x: candleX,
              y: candleY,
              draggable: true,
              dragBoundFunc: pos => {
                return {
                  x: Math.max(60, Math.min(pos.x, lensCenterX - 20)), // 蜡烛只能在透镜左侧
                  y: candleY
                };
              }
            }"
            @dragmove="handleCandleDrag"
          >
            <v-line :config="candleBase" />
            <v-rect :config="candleBody" />
            <v-circle :config="candleFlame" />
            <v-line :config="candleLight" />
          </v-group>

          <!-- 光线 -->
          <v-line
            v-for="(ray, index) in lightRays"
            :key="'ray-' + index"
            :config="ray"
          />

          <!-- 像（实像） -->
          <v-group v-if="showRealImage" :config="{ x: imageX, y: imageY }">
            <v-line :config="imageBase" />
            <v-rect :config="imageBody" />
            <v-circle :config="imageFlame" />
            <v-line :config="imageLight" />
          </v-group>

          <!-- 像（虚像） -->
          <v-group
            v-if="showVirtualImage"
            :config="{ x: virtualImageX, y: virtualImageY }"
          >
            <v-line :config="virtualImageBase" />
            <v-rect :config="virtualImageBody" />
            <v-circle :config="virtualImageFlame" />
            <v-line :config="virtualImageLight" />
          </v-group>

          <!-- 标记文本 -->
          <v-text :config="objectLabel" />
          <v-text v-if="showRealImage" :config="imageLabel" />
          <v-text v-if="showVirtualImage" :config="virtualImageLabel" />

          <!-- 拖动提示 -->
          <v-text :config="dragHint" />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 凸透镜参数
const focalLength = ref(15); // 焦距 15cm
const candlePosition = ref(50); // 蜡烛初始位置 50cm

// 蜡烛位置（像素坐标）
const candleX = ref(300);
const candleY = ref(300); // 蜡烛底部在x轴上

// 透镜中心位置
const lensCenterX = 400;

// 舞台配置
const stageConfig = ref({
  width: 800,
  height: 400
});

// 计算物距、像距和放大率
const objectDistance = computed(() => {
  // 将像素坐标转换为物理距离 (1像素 = 0.1cm)
  return Math.abs((lensCenterX - candleX.value) / 10);
});

const imageDistance = computed(() => {
  // 使用凸透镜公式: 1/f = 1/u + 1/v
  if (objectDistance.value === focalLength.value) return Infinity; // 平行光，不成像
  return 1 / (1 / focalLength.value - 1 / objectDistance.value);
});

const magnification = computed(() => {
  if (!isFinite(imageDistance.value)) return 1;
  return -imageDistance.value / objectDistance.value;
});

const imageType = computed(() => {
  if (objectDistance.value > 2 * focalLength.value) {
    return "倒立、缩小的实像";
  } else if (objectDistance.value === 2 * focalLength.value) {
    return "倒立、等大的实像";
  } else if (objectDistance.value > focalLength.value) {
    return "倒立、放大的实像";
  } else if (objectDistance.value === focalLength.value) {
    return "不成像（平行光）";
  } else {
    return "正立、放大的虚像";
  }
});

const imageTypeClass = computed(() => {
  if (objectDistance.value > focalLength.value) {
    return "real-image";
  } else if (objectDistance.value < focalLength.value) {
    return "virtual-image";
  } else {
    return "no-image";
  }
});

const showRealImage = computed(() => {
  return objectDistance.value > focalLength.value;
});

const showVirtualImage = computed(() => {
  return objectDistance.value < focalLength.value;
});

// 像的位置（像素坐标）
const imageX = computed(() => {
  if (!isFinite(imageDistance.value)) return 0;
  // 透镜中心在400像素处，实像在右侧
  return lensCenterX + imageDistance.value * 10;
});

const imageY = computed(() => {
  return 300; // 像的底部也在x轴上
});

// 虚像的位置（像素坐标）
const virtualImageX = computed(() => {
  // 虚像与物体在同一侧（左侧）
  return lensCenterX - Math.abs(imageDistance.value) * 10;
});

const virtualImageY = computed(() => {
  return 300; // 虚像的底部也在x轴上
});

// 坐标轴配置
const axisX = computed(() => {
  return {
    points: [50, 300, 750, 300],
    stroke: "#666",
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round"
  };
});

const axisY = computed(() => {
  return {
    points: [lensCenterX, 200, lensCenterX, 350],
    stroke: "#666",
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round"
  };
});

// 刻度线
const xAxisMarks = computed(() => {
  const marks = [];
  for (let i = 0; i <= 80; i += 10) {
    marks.push({
      points: [50 + i * 10, 295, 50 + i * 10, 305],
      stroke: "#666",
      strokeWidth: 1
    });
  }
  return marks;
});

const xAxisLabels = computed(() => {
  const labels = [];
  for (let i = 0; i <= 80; i += 10) {
    //for (let i = 40, j = 0; i >= -40, j <= 80; i += 10, j += 10) {
    let t = Math.abs(i <= 40 ? 40 - i : i - 40).toString();
    labels.push({
      //x: 45 + i * 10,
      x: 45 + i * 10,
      y: 310,
      text: t,
      fontSize: 12,
      fill: "#333"
    });
  }
  return labels;
});

// 橄榄球形凸透镜配置
const lensPath = computed(() => {
  // 创建橄榄球形路径
  const lensHeight = 100;
  const lensWidth = 20;
  const centerY = 300;

  const path = `
    M ${lensCenterX - lensWidth} ${centerY - lensHeight / 2}
    Q ${lensCenterX} ${centerY - lensHeight / 2 - 10} ${lensCenterX + lensWidth} ${centerY - lensHeight / 2}
    Q ${lensCenterX + lensWidth + 10} ${centerY} ${lensCenterX + lensWidth} ${centerY + lensHeight / 2}
    Q ${lensCenterX} ${centerY + lensHeight / 2 + 10} ${lensCenterX - lensWidth} ${centerY + lensHeight / 2}
    Q ${lensCenterX - lensWidth - 10} ${centerY} ${lensCenterX - lensWidth} ${centerY - lensHeight / 2}
    Z
  `;

  return {
    data: path,
    fill: "rgba(200, 200, 255, 0.3)",
    stroke: "#333",
    strokeWidth: 2
  };
});

// 焦点标记（左右两侧都有）
const focusFLeft = computed(() => {
  return {
    points: [
      lensCenterX - focalLength.value * 10,
      290,
      lensCenterX - focalLength.value * 10,
      310
    ],
    stroke: "#f56c6c",
    strokeWidth: 2
  };
});

const focus2FLeft = computed(() => {
  return {
    points: [
      lensCenterX - 2 * focalLength.value * 10,
      290,
      lensCenterX - 2 * focalLength.value * 10,
      310
    ],
    stroke: "#e6a23c",
    strokeWidth: 2
  };
});

const focusFRight = computed(() => {
  return {
    points: [
      lensCenterX + focalLength.value * 10,
      290,
      lensCenterX + focalLength.value * 10,
      310
    ],
    stroke: "#f56c6c",
    strokeWidth: 2
  };
});

const focus2FRight = computed(() => {
  return {
    points: [
      lensCenterX + 2 * focalLength.value * 10,
      290,
      lensCenterX + 2 * focalLength.value * 10,
      310
    ],
    stroke: "#e6a23c",
    strokeWidth: 2
  };
});

const focusFLeftLabel = computed(() => {
  return {
    x: lensCenterX - focalLength.value * 10 - 5,
    y: 315,
    text: "F",
    fontSize: 14,
    fill: "#f56c6c",
    fontStyle: "bold"
  };
});

const focus2FLeftLabel = computed(() => {
  return {
    x: lensCenterX - 2 * focalLength.value * 10 - 10,
    y: 315,
    text: "2F",
    fontSize: 14,
    fill: "#e6a23c",
    fontStyle: "bold"
  };
});

const focusFRightLabel = computed(() => {
  return {
    x: lensCenterX + focalLength.value * 10 - 5,
    y: 315,
    text: "F",
    fontSize: 14,
    fill: "#f56c6c",
    fontStyle: "bold"
  };
});

const focus2FRightLabel = computed(() => {
  return {
    x: lensCenterX + 2 * focalLength.value * 10 - 10,
    y: 315,
    text: "2F",
    fontSize: 14,
    fill: "#e6a23c",
    fontStyle: "bold"
  };
});

const lensCenterLabel = computed(() => {
  return {
    x: lensCenterX - 5,
    y: 280,
    text: "O",
    fontSize: 14,
    fill: "#333",
    fontStyle: "bold"
  };
});

// 蜡烛配置 - 确保蜡烛底部在x轴上
const candleBase = computed(() => {
  return {
    points: [0, 0, 0, -40], // 增加蜡烛高度，使底部在x轴上
    stroke: "#8c8c8c",
    strokeWidth: 3
  };
});

const candleBody = computed(() => {
  return {
    x: -10,
    y: -40, // 调整位置，使底部在x轴上
    width: 20,
    height: 40,
    fill: "#ffccc7",
    stroke: "#ff4d4f",
    strokeWidth: 2
  };
});

const candleFlame = computed(() => {
  return {
    x: 0,
    y: -60, // 调整火焰位置
    radius: 8,
    fill: "#ffa940",
    stroke: "#ff7a45",
    strokeWidth: 1
  };
});

const candleLight = computed(() => {
  return {
    points: [0, -68, 0, -75], // 调整光线位置
    stroke: "#ffa940",
    strokeWidth: 2,
    lineCap: "round"
  };
});

const objectLabel = computed(() => {
  return {
    x: candleX.value - 15,
    y: 315,
    text: "物体",
    fontSize: 14,
    fill: "#ff4d4f"
  };
});

// 光线路径
const lightRays = computed(() => {
  const rays = [];
  const objectX = candleX.value;
  const objectTopY = candleY.value - 75; // 调整光线起点

  // 平行于主光轴的光线
  rays.push({
    points: [objectX, objectTopY, lensCenterX, objectTopY],
    stroke: "#1890ff",
    strokeWidth: 1.5,
    lineCap: "round"
  });

  if (objectDistance.value > focalLength.value) {
    // 实像情况 - 光线通过焦点
    rays.push({
      points: [
        lensCenterX,
        objectTopY,
        lensCenterX + focalLength.value * 10,
        300
      ],
      stroke: "#1890ff",
      strokeWidth: 1.5
    });

    // 通过光心的光线
    rays.push({
      points: [objectX, objectTopY, lensCenterX, 300],
      stroke: "#52c41a",
      strokeWidth: 1.5
    });

    rays.push({
      points: [
        lensCenterX,
        300,
        imageX.value,
        imageY.value - 75 * Math.abs(magnification.value)
      ],
      stroke: "#52c41a",
      strokeWidth: 1.5
    });
  } else if (objectDistance.value < focalLength.value) {
    // 虚像情况 - 光线反向延长
    rays.push({
      points: [
        lensCenterX,
        objectTopY,
        lensCenterX - focalLength.value * 10,
        300
      ],
      stroke: "#1890ff",
      strokeWidth: 1.5,
      dash: [5, 5]
    });

    // 通过光心的光线
    rays.push({
      points: [objectX, objectTopY, lensCenterX, 300],
      stroke: "#52c41a",
      strokeWidth: 1.5
    });

    // 虚像的延长线
    rays.push({
      points: [
        lensCenterX,
        300,
        virtualImageX.value,
        virtualImageY.value - 75 * Math.abs(magnification.value)
      ],
      stroke: "#52c41a",
      strokeWidth: 1.5,
      dash: [5, 5]
    });
  }

  return rays;
});

// 实像的配置
const imageBase = computed(() => {
  return {
    points: [0, 0, 0, -40 * Math.abs(magnification.value)],
    stroke: "#8c8c8c",
    strokeWidth: 3
  };
});

const imageBody = computed(() => {
  return {
    x: -10,
    y: -40 * Math.abs(magnification.value),
    width: 20,
    height: 40 * Math.abs(magnification.value),
    fill: "#91d5ff",
    stroke: "#1890ff",
    strokeWidth: 2
  };
});

const imageFlame = computed(() => {
  return {
    x: 0,
    y: -60 * Math.abs(magnification.value),
    radius: 8 * Math.abs(magnification.value),
    fill: "#69c0ff",
    stroke: "#1890ff",
    strokeWidth: 1
  };
});

const imageLight = computed(() => {
  return {
    points: [
      0,
      -68 * Math.abs(magnification.value),
      0,
      -75 * Math.abs(magnification.value)
    ],
    stroke: "#69c0ff",
    strokeWidth: 2,
    lineCap: "round"
  };
});

const imageLabel = computed(() => {
  return {
    x: imageX.value - 15,
    y: 315,
    text: "实像",
    fontSize: 14,
    fill: "#1890ff"
  };
});

// 虚像的配置
const virtualImageBase = computed(() => {
  return {
    points: [0, 0, 0, -40 * Math.abs(magnification.value)],
    stroke: "#8c8c8c",
    strokeWidth: 3,
    dash: [5, 5]
  };
});

const virtualImageBody = computed(() => {
  return {
    x: -10,
    y: -40 * Math.abs(magnification.value),
    width: 20,
    height: 40 * Math.abs(magnification.value),
    fill: "rgba(179, 127, 235, 0.7)",
    stroke: "#9254de",
    strokeWidth: 2,
    dash: [5, 5]
  };
});

const virtualImageFlame = computed(() => {
  return {
    x: 0,
    y: -60 * Math.abs(magnification.value),
    radius: 8 * Math.abs(magnification.value),
    fill: "rgba(146, 84, 222, 0.7)",
    stroke: "#722ed1",
    strokeWidth: 1,
    dash: [5, 5]
  };
});

const virtualImageLight = computed(() => {
  return {
    points: [
      0,
      -68 * Math.abs(magnification.value),
      0,
      -75 * Math.abs(magnification.value)
    ],
    stroke: "#9254de",
    strokeWidth: 2,
    lineCap: "round",
    dash: [5, 5]
  };
});

const virtualImageLabel = computed(() => {
  return {
    x: virtualImageX.value - 15,
    y: 315,
    text: "虚像",
    fontSize: 14,
    fill: "#722ed1"
  };
});

const dragHint = computed(() => {
  return {
    x: 20,
    y: 370,
    text: "提示: 可以直接拖动蜡烛来改变位置",
    fontSize: 14,
    fill: "#666",
    fontStyle: "italic"
  };
});

// 处理蜡烛拖动
const handleCandleDrag = (e: any) => {
  const newX = e.target.x();
  candleX.value = newX;
  // 更新蜡烛位置滑块值 (像素坐标转换为物理距离)
  candlePosition.value = Math.round((newX - 50) / 10);
  updateImage();
};

// 更新图像
const updateImage = () => {
  // 更新蜡烛位置（根据滑块值）
  candleX.value = 50 + candlePosition.value * 10;
};

// 初始化
onMounted(() => {
  updateImage();
});
</script>

<style scoped>
.lens-demo-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.control-panel {
  width: 300px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.control-panel h2 {
  padding-bottom: 10px;
  margin-top: 0;
  color: #303133;
  border-bottom: 1px solid #eaeefb;
}

.slider-container {
  margin: 20px 0;
}

.label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #606266;
}

.params-display {
  padding: 15px;
  margin-bottom: 20px;
  background: #f0f9ff;
  border-left: 4px solid #1890ff;
  border-radius: 4px;
}

.params-display p {
  margin: 8px 0;
  color: #606266;
}

.params-display .real-image {
  font-weight: bold;
  color: #1890ff;
}

.params-display .virtual-image {
  font-weight: bold;
  color: #722ed1;
}

.params-display .no-image {
  font-weight: bold;
  color: #f56c6c;
}

.image-info {
  padding: 15px;
  background: #f6ffed;
  border-left: 4px solid #52c41a;
  border-radius: 4px;
}

.image-info h3 {
  margin-top: 0;
  color: #389e0d;
}

.image-info ul {
  padding-left: 20px;
  margin-bottom: 0;
}

.image-info li {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.canvas-container {
  flex: 1;
  padding: 15px;
  overflow: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}
</style>

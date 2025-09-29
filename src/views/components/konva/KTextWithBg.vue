<template>
  <v-group :config="groupConfig">
    <v-rect ref="bgRect" :config="bgConfig" />
    <v-text ref="textNode" :config="textConfig" />
  </v-group>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import type {
  RectConfig,
  TextConfig,
  GroupConfig
} from "konva/lib/shapes/Node";
import type { Rect } from "konva/lib/shapes/Rect";
import type { Text } from "konva/lib/shapes/Text";

defineOptions({ name: "KTextWithBg" });

interface Props {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  bgColor?: string;
  padding?: number;
  cornerRadius?: number;
}

const props = withDefaults(defineProps<Props>(), {
  x: 0,
  y: 0,
  fontSize: 16,
  fontFamily: "Arial",
  textColor: "#333",
  bgColor: "#f0f0f0",
  padding: 5,
  cornerRadius: 5
});

const groupConfig = ref<GroupConfig>({
  x: props.x,
  y: props.y
});

const textConfig = ref<TextConfig>({
  text: props.text,
  fontSize: props.fontSize,
  fontFamily: props.fontFamily,
  fill: props.textColor,
  padding: props.padding
});

const bgConfig = ref<RectConfig>({
  fill: props.bgColor,
  cornerRadius: props.cornerRadius,
  stroke: "#ccc",
  strokeWidth: 1
});

const bgRect = ref<Rect | null>(null);
const textNode = ref<Text | null>(null);

const updateSize = () => {
  nextTick(() => {
    if (!textNode.value || !bgRect.value) return;

    const text = textNode.value.getNode();
    const bg = bgRect.value.getNode();

    // 测量文本实际尺寸
    const textWidth = text.width();
    const textHeight = text.height();

    // 更新背景尺寸（包含padding）
    bg.width(textWidth + props.padding * 2);
    bg.height(textHeight + props.padding * 2);

    // 让文本居中
    text.x(props.padding);
    text.y(props.padding);
  });
};

// 新增：更新位置的方法
const updatePosition = () => {
  groupConfig.value = {
    ...groupConfig.value,
    x: props.x,
    y: props.y
  };
};

onMounted(() => {
  updateSize();
});

// 监听文本变化
watch(
  () => props.text,
  newText => {
    textConfig.value.text = newText;
    updateSize();
  }
);

// 新增：监听 x/y 变化
watch(
  () => [props.x, props.y],
  () => {
    updatePosition();
  }
);

// 暴露方法给父组件
defineExpose({
  updateSize
});
</script>

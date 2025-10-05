<script setup lang="ts">
// 可以在这里添加组件逻辑
</script>

<template>
  <div class="main-container">
    <div class="content-wrapper">
      <div class="main-content">
        <!-- 主内容区 -->
        <h2>主内容区</h2>
        <p>这里是页面的主要内容...</p>
        <!-- 可以添加更多内容 -->
      </div>
      <div class="sidebar">
        <!-- 右侧边栏 -->
        <h3>右侧边栏</h3>
        <p>固定宽度 400px</p>
        <!-- 可以添加更多内容 -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
/* 响应式调整 - 可选 */
@media (width <= 1200px) {
  .main-container {
    min-width: 100%;
  }

  .content-wrapper {
    flex-direction: column;
    min-width: 100%;
  }

  .main-content {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .sidebar {
    width: 100%;
  }
}

.main-container {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 1200px;
  background-color: #f5f7fa;
}

.content-wrapper {
  display: flex;
  width: 100%;
  min-width: 1200px;
  max-width: 1600px; /* 可根据需要调整最大宽度 */
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-right: 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.sidebar {
  width: 400px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
</style>

<template>
  <div class="error-page">
    <div class="error-container">
      <h1 class="error-code">403</h1>
      <h2 class="error-message">无权访问</h2>
      <p class="error-description">
        抱歉，您没有权限访问此页面。
      </p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
        <el-button @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  color: white;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-message {
  font-size: 32px;
  margin: 20px 0;
}

.error-description {
  font-size: 18px;
  margin: 20px 0 40px;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}
</style>
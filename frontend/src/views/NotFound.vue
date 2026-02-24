<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-message">页面未找到</h2>
      <p class="error-description">抱歉，您访问的页面不存在或已被移除。</p>
      <div class="action-buttons">
        <router-link to="/" class="button primary">返回首页</router-link>
        <button @click="goBack" class="button">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #667eea;
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 32px;
  color: #2c3e50;
  margin: 20px 0 10px;
}

.error-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.button {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.button.primary {
  background: #667eea;
  color: white;
}

.button.primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.button:not(.primary) {
  background: #f0f0f0;
  color: #333;
}

.button:not(.primary):hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}
</style>

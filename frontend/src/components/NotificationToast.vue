<template>
  <teleport to="body">
    <transition-group name="toast" tag="div" class="toast-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['toast', `toast-${notification.type}`]"
      >
        <span class="toast-icon">{{ getIcon(notification.type) }}</span>
        <span class="toast-message">{{ notification.message }}</span>
        <button class="toast-close" @click="remove(notification.id)">✕</button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([])
let nextId = 0

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}

function add(message, type = 'info', duration = 3000) {
  const id = nextId++
  notifications.value.push({ id, message, type })
  
  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
  
  return id
}

function remove(id) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

function success(message, duration) {
  return add(message, 'success', duration)
}

function error(message, duration) {
  return add(message, 'error', duration)
}

function warning(message, duration) {
  return add(message, 'warning', duration)
}

function info(message, duration) {
  return add(message, 'info', duration)
}

defineExpose({
  add,
  remove,
  success,
  error,
  warning,
  info
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
  pointer-events: auto;
  border-left: 4px solid;
}

.toast-success {
  border-left-color: #4caf50;
}

.toast-error {
  border-left-color: #f44336;
}

.toast-warning {
  border-left-color: #ff9800;
}

.toast-info {
  border-left-color: #2196f3;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #4caf50;
  color: white;
}

.toast-error .toast-icon {
  background: #f44336;
  color: white;
}

.toast-warning .toast-icon {
  background: #ff9800;
  color: white;
}

.toast-info .toast-icon {
  background: #2196f3;
  color: white;
}

.toast-message {
  flex: 1;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #333;
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

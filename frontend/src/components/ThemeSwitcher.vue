<template>
  <div class="theme-switcher">
    <button class="theme-toggle-btn" @click="showMenu = !showMenu" title="切换主题">
      🎨
    </button>
    <div v-if="showMenu" class="theme-menu">
      <div class="theme-menu-header">选择主题</div>
      <button
        v-for="theme in themes"
        :key="theme.id"
        class="theme-option"
        :class="{ active: currentTheme === theme.id }"
        @click="changeTheme(theme.id)"
      >
        <span class="theme-check">{{ currentTheme === theme.id ? '✓' : '' }}</span>
        {{ theme.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { setTheme, getCurrentThemeName, getAvailableThemes } from '../utils/theme.js'

const showMenu = ref(false)
const currentTheme = ref('default')
const themes = ref([])

onMounted(() => {
  themes.value = getAvailableThemes()
  currentTheme.value = getCurrentThemeName()
  
  // Close menu when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  const themeSwitcher = event.target.closest('.theme-switcher')
  if (!themeSwitcher && showMenu.value) {
    showMenu.value = false
  }
}

async function changeTheme(themeName) {
  try {
    await setTheme(themeName)
    currentTheme.value = themeName
    showMenu.value = false
  } catch (error) {
    console.error('Failed to change theme:', error)
  }
}
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.theme-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-bg-container, white);
  border: 1px solid var(--color-border-default, #e0e0e0);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
}

.theme-menu-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-heading, #2c3e50);
  border-bottom: 1px solid var(--color-border-light, #ddd);
  background: var(--color-bg-section, #f9f9f9);
}

.theme-option {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary, #333);
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-option:hover {
  background: var(--color-bg-hover, #f0f0f0);
}

.theme-option.active {
  background: var(--color-primary-main, #667eea);
  color: white;
  font-weight: 500;
}

.theme-check {
  width: 16px;
  display: inline-block;
  font-weight: bold;
}
</style>

// Theme management utility
import { ref, watch } from 'vue'
import defaultThemeYaml from '../themes/default.yaml?raw'
import darkThemeYaml from '../themes/dark.yaml?raw'

const currentTheme = ref('default')
const themeData = ref(null)

// Available themes with their YAML content
const themeFiles = {
  'default': defaultThemeYaml,
  'dark': darkThemeYaml
}

// Available themes
const availableThemes = [
  { id: 'default', name: '默认主题' },
  { id: 'dark', name: '暗色主题' }
]

/**
 * Load a theme from YAML content
 * @param {string} themeName - The theme name (e.g., 'default', 'dark')
 * @returns {Promise<Object>} Theme data
 */
async function loadTheme(themeName) {
  try {
    const yamlText = themeFiles[themeName]
    if (!yamlText) {
      throw new Error(`Theme ${themeName} not found`)
    }
    
    // Import js-yaml dynamically
    const jsyaml = await import('js-yaml')
    const theme = jsyaml.load(yamlText)
    
    return theme
  } catch (error) {
    console.error(`Failed to load theme ${themeName}:`, error)
    throw error
  }
}

/**
 * Apply theme colors to CSS variables
 * @param {Object} theme - Theme data object
 */
function applyTheme(theme) {
  if (!theme) return
  
  const root = document.documentElement
  
  // Apply primary colors
  if (theme.primary) {
    root.style.setProperty('--color-primary-main', theme.primary.main)
    root.style.setProperty('--color-primary-light', theme.primary.light)
    root.style.setProperty('--color-primary-dark', theme.primary.dark)
    root.style.setProperty('--color-primary-gradient', theme.primary.gradient)
  }
  
  // Apply secondary colors
  if (theme.secondary) {
    root.style.setProperty('--color-secondary-blue', theme.secondary.blue)
    root.style.setProperty('--color-secondary-blue-dark', theme.secondary.blue_dark)
    root.style.setProperty('--color-secondary-green', theme.secondary.green)
    root.style.setProperty('--color-secondary-green-dark', theme.secondary.green_dark)
    root.style.setProperty('--color-secondary-green-light', theme.secondary.green_light)
    root.style.setProperty('--color-secondary-green-success', theme.secondary.green_success)
    root.style.setProperty('--color-secondary-red', theme.secondary.red)
    root.style.setProperty('--color-secondary-red-dark', theme.secondary.red_dark)
  }
  
  // Apply text colors
  if (theme.text) {
    root.style.setProperty('--color-text-primary', theme.text.primary)
    root.style.setProperty('--color-text-secondary', theme.text.secondary)
    root.style.setProperty('--color-text-tertiary', theme.text.tertiary)
    root.style.setProperty('--color-text-muted', theme.text.muted)
    root.style.setProperty('--color-text-heading', theme.text.heading)
    root.style.setProperty('--color-text-subheading', theme.text.subheading)
    root.style.setProperty('--color-text-gray', theme.text.gray)
    root.style.setProperty('--color-text-gray-light', theme.text.gray_light)
  }
  
  // Apply background colors
  if (theme.background) {
    root.style.setProperty('--color-bg-body', theme.background.body)
    root.style.setProperty('--color-bg-container', theme.background.container)
    root.style.setProperty('--color-bg-section', theme.background.section)
    root.style.setProperty('--color-bg-panel', theme.background.panel)
    root.style.setProperty('--color-bg-hover', theme.background.hover)
    root.style.setProperty('--color-bg-light', theme.background.light)
    root.style.setProperty('--color-bg-readonly', theme.background.readonly)
  }
  
  // Apply border colors
  if (theme.border) {
    root.style.setProperty('--color-border-default', theme.border.default)
    root.style.setProperty('--color-border-light', theme.border.light)
    root.style.setProperty('--color-border-lighter', theme.border.lighter)
    root.style.setProperty('--color-border-medium', theme.border.medium)
  }
  
  // Apply rarity colors
  if (theme.rarity) {
    if (theme.rarity.ssr) {
      root.style.setProperty('--color-rarity-ssr-gradient', theme.rarity.ssr.gradient)
      root.style.setProperty('--color-rarity-ssr-text', theme.rarity.ssr.text)
    }
    if (theme.rarity.sr) {
      root.style.setProperty('--color-rarity-sr-gradient', theme.rarity.sr.gradient)
      root.style.setProperty('--color-rarity-sr-text', theme.rarity.sr.text)
    }
    if (theme.rarity.r) {
      root.style.setProperty('--color-rarity-r-gradient', theme.rarity.r.gradient)
      root.style.setProperty('--color-rarity-r-text', theme.rarity.r.text)
    }
    if (theme.rarity.n) {
      root.style.setProperty('--color-rarity-n-gradient', theme.rarity.n.gradient)
      root.style.setProperty('--color-rarity-n-text', theme.rarity.n.text)
    }
  }
  
  // Apply status colors
  if (theme.status) {
    if (theme.status.success) {
      root.style.setProperty('--color-status-success-bg', theme.status.success.bg)
      root.style.setProperty('--color-status-success-text', theme.status.success.text)
      root.style.setProperty('--color-status-success-border', theme.status.success.border)
    }
    if (theme.status.warning) {
      root.style.setProperty('--color-status-warning-bg', theme.status.warning.bg)
      root.style.setProperty('--color-status-warning-bg-alt', theme.status.warning.bg_alt)
      root.style.setProperty('--color-status-warning-text', theme.status.warning.text)
      root.style.setProperty('--color-status-warning-border', theme.status.warning.border)
      root.style.setProperty('--color-status-warning-border-alt', theme.status.warning.border_alt)
    }
    if (theme.status.error) {
      root.style.setProperty('--color-status-error-bg', theme.status.error.bg)
      root.style.setProperty('--color-status-error-text', theme.status.error.text)
      root.style.setProperty('--color-status-error-border', theme.status.error.border)
    }
    if (theme.status.info) {
      root.style.setProperty('--color-status-info-bg', theme.status.info.bg)
      root.style.setProperty('--color-status-info-text', theme.status.info.text)
      root.style.setProperty('--color-status-info-border', theme.status.info.border)
    }
  }
  
  // Apply button colors
  if (theme.button) {
    root.style.setProperty('--color-button-primary', theme.button.primary)
    root.style.setProperty('--color-button-primary-hover', theme.button.primary_hover)
    root.style.setProperty('--color-button-secondary', theme.button.secondary)
    root.style.setProperty('--color-button-danger', theme.button.danger)
    root.style.setProperty('--color-button-danger-hover', theme.button.danger_hover)
  }
  
  // Apply special colors
  if (theme.special) {
    root.style.setProperty('--color-special-pink-gradient', theme.special.pink_gradient)
  }
}

/**
 * Set and apply a theme
 * @param {string} themeName - The theme name
 */
async function setTheme(themeName) {
  try {
    const theme = await loadTheme(themeName)
    themeData.value = theme
    applyTheme(theme)
    currentTheme.value = themeName
    
    // Save preference to localStorage
    localStorage.setItem('chessfight-theme', themeName)
    
    return theme
  } catch (error) {
    console.error(`Failed to set theme ${themeName}:`, error)
    throw error
  }
}

/**
 * Initialize theme system
 */
async function initTheme() {
  // Load saved theme from localStorage or use default
  const savedTheme = localStorage.getItem('chessfight-theme') || 'default'
  await setTheme(savedTheme)
}

/**
 * Get current theme data
 */
function getCurrentTheme() {
  return themeData.value
}

/**
 * Get current theme name
 */
function getCurrentThemeName() {
  return currentTheme.value
}

/**
 * Get list of available themes
 */
function getAvailableThemes() {
  return availableThemes
}

export {
  initTheme,
  setTheme,
  getCurrentTheme,
  getCurrentThemeName,
  getAvailableThemes,
  currentTheme,
  themeData
}

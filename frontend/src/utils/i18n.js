// i18n utility for loading and using translations
import { ref } from 'vue'

const currentLocale = ref('zh-CN')
const translations = ref({})
let isInitialized = false

/**
 * Load translations from YAML file
 * @param {string} locale - Locale code (e.g., 'zh-CN')
 * @returns {Promise<Object>} Translation data
 */
async function loadTranslations(locale) {
  try {
    const response = await fetch(`/src/locales/${locale}.yaml`)
    const yamlText = await response.text()
    
    // Import js-yaml dynamically
    const jsyaml = await import('js-yaml')
    const data = jsyaml.load(yamlText)
    
    return data
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error)
    throw error
  }
}

/**
 * Initialize i18n system
 * @param {string} locale - Optional locale to load, defaults to 'zh-CN'
 */
async function initI18n(locale = 'zh-CN') {
  if (isInitialized) return
  
  try {
    const data = await loadTranslations(locale)
    translations.value = data
    currentLocale.value = locale
    isInitialized = true
  } catch (error) {
    console.error('Failed to initialize i18n:', error)
    throw error
  }
}

/**
 * Get translation by key path
 * @param {string} key - Dot-notation key path (e.g., 'common.save', 'btn.create_set')
 * @param {Object} params - Optional parameters for string interpolation
 * @returns {string} Translated string or key if not found
 */
function t(key, params = {}) {
  if (!isInitialized) {
    console.warn('i18n not initialized, returning key:', key)
    return key
  }
  
  // Split key by dots and traverse the object
  const keys = key.split('.')
  let value = translations.value
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }
  
  // Handle string interpolation if params provided
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match
    })
  }
  
  return value
}

/**
 * Get current locale
 * @returns {string} Current locale code
 */
function getCurrentLocale() {
  return currentLocale.value
}

/**
 * Get all translations
 * @returns {Object} All translation data
 */
function getTranslations() {
  return translations.value
}

/**
 * Check if i18n is initialized
 * @returns {boolean} Initialization status
 */
function isI18nInitialized() {
  return isInitialized
}

/**
 * Vue composable for using i18n in components
 * @returns {Object} i18n utilities
 */
function useI18n() {
  return {
    t,
    currentLocale,
    translations,
    isInitialized: isI18nInitialized
  }
}

export {
  initI18n,
  t,
  getCurrentLocale,
  getTranslations,
  isI18nInitialized,
  useI18n,
  currentLocale,
  translations
}

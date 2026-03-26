// Shared validation patterns and constants
import { t } from './i18n.js'

// Pattern for entity IDs (forms, effects, terms, etc.)
export const ID_PATTERN = /^[a-z0-9][a-z0-9\-_]*$/

// Pattern for set codes
export const SET_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-_]*$/

// Alignment options for effects
export const ALIGNMENT_OPTIONS = ['positive', 'neutral', 'negative']

// Rarity options for cards
export const RARITY_OPTIONS = ['R', 'SR', 'SSR']

// Translation map for effect alignment (using i18n)
export function getAlignmentTranslation(alignment) {
  return t(`alignment.${alignment}`)
}

// Validation helper functions
export function validateId(id, fieldName = 'ID') {
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${fieldName}${t('validation.id_format_invalid')}`)
  }
  return true
}

export function validateSetCode(code) {
  if (!SET_CODE_PATTERN.test(code)) {
    throw new Error(t('validation.set_code_format_invalid'))
  }
  return true
}

// Generate a random ID with 8 characters (0-9a-z)
export function generateRandomId(length = 8) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

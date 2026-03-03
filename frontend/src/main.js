import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTheme } from './utils/theme.js'
import { initI18n } from './utils/i18n.js'

const app = createApp(App)

app.use(router)

// Initialize theme and i18n before mounting
Promise.all([
  initTheme(),
  initI18n()
]).then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('Failed to initialize app:', error)
  // Mount anyway with default settings
  app.mount('#app')
})

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTheme } from './utils/theme.js'

const app = createApp(App)

app.use(router)

// Initialize theme before mounting
initTheme().then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('Failed to initialize theme:', error)
  // Mount anyway with default styles
  app.mount('#app')
})

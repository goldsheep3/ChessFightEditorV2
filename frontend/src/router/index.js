import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import SetEditor from '@/views/SetEditor.vue'
import GlobalEffects from '@/views/GlobalEffects.vue'
import GlobalFixedTerms from '@/views/GlobalFixedTerms.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/editor/:setCode',
    name: 'SetEditor',
    component: SetEditor,
    props: true
  },
  {
    path: '/global/effects',
    name: 'GlobalEffects',
    component: GlobalEffects
  },
  {
    path: '/global/fixed-terms',
    name: 'GlobalFixedTerms',
    component: GlobalFixedTerms
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

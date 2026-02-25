<template>
  <div id="app">
    <router-view />
    <NotificationToast ref="notificationToastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NotificationToast from '@/components/NotificationToast.vue'
import { useNotification } from '@/utils/notification'

const notificationToastRef = ref(null)
const { setInstance } = useNotification()

onMounted(() => {
  if (notificationToastRef.value) {
    setInstance(notificationToastRef.value)
  }
})
</script>

<style>
/* Global styles are imported in main.js */
</style>

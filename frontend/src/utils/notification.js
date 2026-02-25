import { ref } from 'vue'

const notificationInstance = ref(null)

export function useNotification() {
  function setInstance(instance) {
    notificationInstance.value = instance
  }

  function success(message, duration = 3000) {
    if (notificationInstance.value) {
      return notificationInstance.value.success(message, duration)
    }
    console.warn('Notification instance not set, falling back to alert')
    alert(message)
  }

  function error(message, duration = 4000) {
    if (notificationInstance.value) {
      return notificationInstance.value.error(message, duration)
    }
    console.warn('Notification instance not set, falling back to alert')
    alert(message)
  }

  function warning(message, duration = 3000) {
    if (notificationInstance.value) {
      return notificationInstance.value.warning(message, duration)
    }
    console.warn('Notification instance not set, falling back to alert')
    alert(message)
  }

  function info(message, duration = 3000) {
    if (notificationInstance.value) {
      return notificationInstance.value.info(message, duration)
    }
    console.warn('Notification instance not set, falling back to alert')
    alert(message)
  }

  return {
    setInstance,
    success,
    error,
    warning,
    info
  }
}

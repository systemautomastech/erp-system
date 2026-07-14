import { ref } from 'vue'

export function useForwarding(callStore) {
  const forwardNumber = ref('')
  const forwardEnabled = ref(false)

  function enableForwarding() {
    if (!forwardNumber.value.trim()) return
    forwardEnabled.value = true
    if (callStore) {
      callStore.connectionMessage = `Forwarding enabled to ${forwardNumber.value}`
    }
  }

  function disableForwarding() {
    forwardEnabled.value = false
    forwardNumber.value = ''
    if (callStore) {
      callStore.connectionMessage = 'Call forwarding disabled'
    }
  }

  async function forwardCurrentCall(destination = '') {
    const target = (destination || forwardNumber.value || '').trim()
    if (!target) return
    if (!callStore || callStore.callStatus !== 'active') {
      if (callStore) {
        callStore.connectionMessage = 'No active call available to forward.'
      }
      return
    }

    if (callStore) {
      callStore.connectionMessage = `Forwarding current call to ${target}`
    }

    if (window.CTI_PHONE?.transfer) {
      try {
        const result = window.CTI_PHONE.transfer(target)
        if (result && typeof result.then === 'function') {
          await result
        }
      } catch (err) {
        console.error('Transfer failed:', err)
        if (callStore) {
          callStore.connectionMessage = 'Call forward failed'
        }
      }
      return
    }

    if (window.CTI_PHONE?.call) {
      try {
        await window.CTI_PHONE.call(target)
      } catch (err) {
        console.error('Fallback forward call failed:', err)
        if (callStore) {
          callStore.connectionMessage = 'Forward attempt failed'
        }
      }
      return
    }

    if (callStore) {
      callStore.connectionMessage = 'Forwarding not supported by CTI_PHONE'
    }
  }

  return {
    forwardNumber,
    forwardEnabled,
    enableForwarding,
    disableForwarding,
    forwardCurrentCall,
  }
}

import { useState, useCallback } from 'react'

import type { CallStore } from '../store/callStore'

declare global {
  interface Window {
    CTI_PHONE?: {
      transfer?: (target: string) => Promise<void> | void
      call?: (target: string) => Promise<void> | void
    }
  }
}

export function useForwarding(callStore: CallStore) {
  const [forwardNumber, setForwardNumber] = useState('')
  const [forwardEnabled, setForwardEnabled] = useState(false)

  const enableForwarding = useCallback((): void => {
    if (!forwardNumber.trim()) return

    setForwardEnabled(true)

    callStore.connectionMessage = `Forwarding enabled to ${forwardNumber}`
  }, [forwardNumber, callStore])

  const disableForwarding = useCallback((): void => {
    setForwardEnabled(false)
    setForwardNumber('')

    callStore.connectionMessage = 'Call forwarding disabled'
  }, [callStore])

  const forwardCurrentCall = useCallback(
    async (destination = ''): Promise<void> => {
      const target = (destination || forwardNumber).trim()

      if (!target) return

      if (callStore.callStatus !== 'active') {
        callStore.connectionMessage =
          'No active call available to forward.'
        return
      }

      callStore.connectionMessage = `Forwarding current call to ${target}`

      if (window.CTI_PHONE?.transfer) {
        try {
          await Promise.resolve(window.CTI_PHONE.transfer(target))
        } catch (err) {
          console.error('Transfer failed:', err)
          callStore.connectionMessage = 'Call forward failed'
        }
        return
      }

      if (window.CTI_PHONE?.call) {
        try {
          await Promise.resolve(window.CTI_PHONE.call(target))
        } catch (err) {
          console.error('Fallback forward call failed:', err)
          callStore.connectionMessage = 'Forward attempt failed'
        }
        return
      }

      callStore.connectionMessage =
        'Forwarding not supported by CTI_PHONE'
    },
    [forwardNumber, callStore],
  )

  return {
    forwardNumber,
    setForwardNumber,

    forwardEnabled,
    setForwardEnabled,

    enableForwarding,
    disableForwarding,
    forwardCurrentCall,
  }
}
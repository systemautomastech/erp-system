import axios from 'axios'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDraggable } from '@vueuse/core'
import { initWebRTCPhone } from '../services/webrtcPhone'
import callStore from './callStore'
import { useCallHistory } from './useCallHistory'
import { useCallerLookup } from './useCallerLookup'
import { useCallTimer } from './useCallTimer'
import { useForwarding } from './useForwarding'
import { forwardMakeCallToOwner } from './useDialerTabOwner'

export function useDialer() {
  const isOpen = ref(false)
  const number = ref('')
  const currentTime = ref('')
  const panelRef = ref(null)
  const headerRef = ref(null)
  const activePanel = ref('dialpad')

  const { forwardNumber, forwardEnabled, enableForwarding, disableForwarding, forwardCurrentCall } = useForwarding(callStore)

  const { recentSearch, missedUnreadCount, filteredRecentCalls, loadCallCache, saveCallCache, addRecentCall, markMissedRead, clearMissedCalls, confirmClearMissed } = useCallHistory(callStore)
  const { performCallerLookup } = useCallerLookup(callStore)
  const { startTimer, stopTimer } = useCallTimer(callStore)

  const { style: panelStyle } = useDraggable(panelRef, {
    handle: headerRef,
    initialValue: { x: 950, y: 15 },
  })

  const keys = [
    { value: '1', label: '' },
    { value: '2', label: 'ABC' },
    { value: '3', label: 'DEF' },
    { value: '4', label: 'GHI' },
    { value: '5', label: 'JKL' },
    { value: '6', label: 'MNO' },
    { value: '7', label: 'PQRS' },
    { value: '8', label: 'TUV' },
    { value: '9', label: 'WXYZ' },
    { value: '*', label: '' },
    { value: '0', label: '+' },
    { value: '#', label: '' },
  ]

  let clockInterval = null

  const isIncomingCall = computed(() => callStore.callStatus === 'incoming')
  const isActiveCall = computed(() => callStore.callStatus === 'active')
  const hasDigits = computed(() => number.value.trim().length > 0)

  const canPlaceCall = computed(() => {
    return hasDigits.value && callStore.registered && callStore.callStatus !== 'ringing'
  })

  const activeCallTitle = computed(() => {
    return callStore.caller || callStore.currentNumber || number.value || 'Connected call'
  })

  const statusLabel = computed(() => {
    if (callStore.callStatus === 'incoming') return 'Incoming'
    if (callStore.callStatus === 'ringing') return 'Ringing'
    if (callStore.callStatus === 'active') return 'Connected'
    if (callStore.callStatus === 'calling') return 'Calling'
    return callStore.registered ? 'Ready' : 'Not registered'
  })

  const helperText = computed(() => {
    if (callStore.callStatus === 'incoming') return 'Use the answer or reject controls to respond.'
    if (callStore.callStatus === 'ringing') return 'The call is being placed.'
    if (callStore.callStatus === 'active') return 'Keypad presses send DTMF tones while the call is active.'
    if (callStore.callStatus === 'calling') return 'Starting the call...'
    if (!callStore.registered) return 'Register first to place or receive calls.'
    return 'Type a number, then start the call.'
  })

  const inputPlaceholder = computed(() => {
    return callStore.callStatus === 'incoming' ? 'Incoming call number' : 'Enter number or extension'
  })

  function updateCurrentTime() {
    currentTime.value = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function pressKey(key) {
    if (isActiveCall.value) {
      window.CTI_PHONE?.sendDTMF?.(key)
      return
    }

    number.value += key
  }

  function backspaceNumber() {
    number.value = number.value.slice(0, -1)
  }

  function clearNumber() {
    number.value = ''
  }

  function handleSocketConnected() {
    callStore.socketConnected = true
    callStore.connectionMessage = ''
  }

  function handleSocketDisconnected() {
    callStore.socketConnected = false
    callStore.registered = false
    callStore.agentStatus = 'offline'
    callStore.connectionMessage = 'Connection lost. Reconnecting...'
  }

  function handlePrimaryAction() {
    if (callStore.callStatus === 'ringing' || callStore.callStatus === 'calling') {
      // If call is already being placed (calling) or ringing, treat primary
      // button as cancel/hangup so the user can stop the outgoing attempt.
      endCurrentCall()
      return
    }

    callNumber()
  }

  async function callNumber() {
    const target = number.value.trim()
    if (!target) return

    if (callStore.callStatus === 'active') {
      forwardCurrentCall(target)
      number.value = ''
      return
    }

    const forwarded = await forwardMakeCallToOwner(target)
    if (forwarded) {
      alert('The dialer is already active in another tab. Your call request has been forwarded to the active dialer.')
      return
    }

    callStore.currentNumber = target
    callStore.caller = target
    callStore.callStatus = 'calling'
    callStore.agentStatus = 'busy'

    clickToCallWithLogging(target)
  }

  function callFromHistory(item) {
    const phoneNumber = item?.number?.trim()
    if (!phoneNumber) return

    number.value = phoneNumber
    callStore.currentNumber = phoneNumber
    callStore.caller = phoneNumber
    callStore.module = item?.module || callStore.module
    callStore.recordId = item?.recordId || callStore.recordId
    callStore.callStatus = 'calling'
    callStore.agentStatus = 'busy'
    isOpen.value = true
    activePanel.value = 'dialpad'

    clickToCallWithLogging(phoneNumber, {
      module: item?.module,
      record_id: item?.recordId,
    })
  }

  function redialLastCall() {
    const lastCall = callStore.recentCalls?.[0]
    if (!lastCall?.number) return
    callFromHistory(lastCall)
  }

  function answerCurrentCall() {
    console.log('Answer button clicked')
    window.CTI_PHONE?.answer?.()
  }

  function rejectCurrentCall() {
    console.log('Reject button clicked')
    window.CTI_PHONE?.reject?.()
  }

  function endCurrentCall() {
    try {
      window.CTI_PHONE?.hangup?.()
    } catch (err) {
      console.warn('Error calling CTI_PHONE.hangup():', err)
    }

    // Immediately update UI to reflect call canceled/ended. The WebRTC
    // layer will also emit events which may re-run cleanup, but update now
    // so the user sees immediate feedback and can't re-trigger stray state.
    resetCallState()
  }

  function toggleMuteCurrentCall() {
    if (callStore.muted) {
      window.CTI_PHONE?.unmute?.()
      callStore.muted = false
    } else {
      window.CTI_PHONE?.mute?.()
      callStore.muted = true
    }
  }

  function toggleHoldCurrentCall() {
    if (callStore.onHold) {
      window.CTI_PHONE?.unhold?.()
      callStore.onHold = false
    } else {
      window.CTI_PHONE?.hold?.()
      callStore.onHold = true
    }
  }

  function manualRegister() {
    window.CTI_PHONE?.register?.()
  }

  function resetCallState() {
    stopTimer()

    callStore.callStatus = 'idle'
    callStore.agentStatus = callStore.registered ? 'available' : 'offline'
    callStore.direction = null
    callStore.caller = ''
    callStore.incomingNumber = ''
    callStore.currentNumber = ''
    callStore.contactName = ''
    callStore.module = null
    callStore.recordId = null
    callStore.callerInfo = null
    callStore.muted = false
    callStore.onHold = false
  }

  function handleRegistered() {
    callStore.registered = true
    callStore.agentStatus = 'available'
  }

  function handleRegistrationFailed(event) {
    callStore.registered = false
    callStore.agentStatus = 'offline'
    callStore.connectionMessage = event.detail?.reason || 'Registration failed'
  }

  function handleIncoming(event) {
    const data = event.detail || {}

    callStore.callStatus = 'incoming'
    callStore.agentStatus = 'busy'
    callStore.direction = 'inbound'

    callStore.caller = data.caller
    callStore.incomingNumber = data.caller
    callStore.currentNumber = data.caller

    activePanel.value = 'dialpad'
    isOpen.value = true

    console.log('Incoming call UI opened')

    performCallerLookup(data.caller)
  }

  function handleRinging() {
    if (callStore.callStatus === 'incoming') return
    callStore.callStatus = 'ringing'
    callStore.agentStatus = 'busy'
    callStore.direction = 'outbound'
    isOpen.value = true
  }

  function handleCallFailed(event) {
    const detail = event.detail || {}

    const numberLocal =
      detail.number ||
      callStore.currentNumber ||
      callStore.incomingNumber ||
      callStore.caller

    const direction =
      detail.direction ||
      callStore.direction ||
      (callStore.incomingNumber ? 'inbound' : 'outbound')

    let status = detail.status || 'failed'

    const reason = String(detail.reason || '').toLowerCase()

    if (
      direction === 'inbound' &&
      (
        reason.includes('canceled') ||
        reason.includes('cancelled') ||
        reason.includes('no answer') ||
        status === 'cancelled'
      )
    ) {
      status = 'missed'
    }

    addRecentCall(numberLocal, direction, status)

    try {
      if (window.CTI_PHONE?.hangup) {
        window.CTI_PHONE.hangup()
      } else if (window.CTI_PHONE?.currentSession?.terminate) {
        window.CTI_PHONE.currentSession.terminate()
      }
    } catch (err) {
      console.warn('Error terminating session after call failed:', err)
    }

    stopTimer()
    resetCallState()
    callStore.connectionMessage = detail.reason || 'Call failed'
  }

  function handleActive() {
    callStore.callStatus = 'active'
    callStore.agentStatus = 'busy'
    isOpen.value = true
    startTimer()
  }

  function handleEnded(event) {
    const detail = event.detail || {}

    const numberLocal =
      detail.number ||
      callStore.currentNumber ||
      callStore.incomingNumber ||
      callStore.caller

    const direction =
      detail.direction ||
      callStore.direction ||
      (callStore.incomingNumber ? 'inbound' : 'outbound')

    addRecentCall(numberLocal, direction, detail.status || 'completed')

    try {
      if (window.CTI_PHONE?.hangup) {
        window.CTI_PHONE.hangup()
      } else if (window.CTI_PHONE?.currentSession?.terminate) {
        window.CTI_PHONE.currentSession.terminate()
      }
    } catch (err) {
      console.warn('Error terminating session after call ended:', err)
    }

    stopTimer()
    resetCallState()
  }

  function handleMicError(event) {
    callStore.connectionMessage = event.detail?.reason || 'Microphone permission denied'
    callStore.callStatus = 'idle'
    callStore.agentStatus = callStore.registered ? 'available' : 'offline'
  }

  function handleBeforeUnload(event) {
    try {
      if (['active', 'ringing', 'calling', 'incoming'].includes(callStore.callStatus)) {
        if (window.CTI_PHONE?.hangup) {
          window.CTI_PHONE.hangup()
        } else if (window.CTI_PHONE?.currentSession?.terminate) {
          window.CTI_PHONE.currentSession.terminate()
        }
      }
    } catch (err) {
      console.warn('Error terminating session on unload:', err)
    }
  }

  function handleNetworkStats(event) {
    callStore.latency = event.detail.latency

    if (callStore.latency == null)
      callStore.callQuality = 'Unknown'
    else if (callStore.latency < 100)
      callStore.callQuality = 'Excellent'
    else if (callStore.latency < 180)
      callStore.callQuality = 'Good'
    else if (callStore.latency < 300)
      callStore.callQuality = 'Fair'
    else
      callStore.callQuality = 'Poor'
  }

  async function clickToCallWithLogging(phoneNumber, context = {}) {
    number.value = phoneNumber
    callStore.currentNumber = phoneNumber
    callStore.caller = phoneNumber

    if (context.module) {
      callStore.module = context.module
      callStore.recordId = context.record_id
    }

    isOpen.value = true
    callStore.callStatus = 'calling'
    callStore.agentStatus = 'busy'

    try {
      addRecentCall(phoneNumber, 'outbound', 'calling')
    } catch (e) {
      console.warn('Failed to add immediate recent call log:', e)
    }

    try {
      const impl = window.CTI_PHONE && typeof window.CTI_PHONE.call === 'function' ? window.CTI_PHONE.call.bind(window.CTI_PHONE) : null
      if (impl) {
        try {
          const res = impl(phoneNumber)
          if (res && typeof res.then === 'function') {
            res.catch((err) => console.error('Error placing call via CTI_PHONE (async):', err))
          }
          if (res === false) {
            console.warn('CTI_PHONE.call returned false — not registered or failed to start')
            resetCallState()
          }
        } catch (err) {
          console.error('Error placing call via CTI_PHONE:', err)
        }
      } else {
        console.warn('No CTI_PHONE implementation available to place call')
        callStore.callStatus = 'ringing'
        callStore.agentStatus = 'busy'
      }
    } finally {
      if (window.Dialer?.api?.clickToCall) {
        axios.post(window.Dialer.api.clickToCall, {
          number: phoneNumber,
          module: context.module,
          record_id: context.record_id,
        }).catch((error) => {
          console.warn('Failed to log click-to-call:', error)
        })
      }
    }
  }

  async function bootWebRTC() {
    try {
      const { data } = await axios.get(window.Dialer.api.webrtcConfig)
      initWebRTCPhone(data)
    } catch (error) {
      console.error('WebRTC config failed:', error)
      callStore.registered = false
      callStore.agentStatus = 'offline'
    }
  }

  onMounted(() => {
    updateCurrentTime()
    clockInterval = window.setInterval(updateCurrentTime, 1000)

    window.addEventListener('cti:registered', handleRegistered)
    window.addEventListener('cti:registration-failed', handleRegistrationFailed)
    window.addEventListener('cti:sip-incoming', handleIncoming)
    window.addEventListener('cti:incoming-call', handleIncoming)
    window.addEventListener('cti:call-ringing', handleRinging)
    window.addEventListener('cti:call-active', handleActive)
    window.addEventListener('cti:call-ended', handleEnded)
    window.addEventListener('cti:socket-connected', handleSocketConnected)
    window.addEventListener('cti:socket-disconnected', handleSocketDisconnected)
    window.addEventListener('cti:call-failed', handleCallFailed)
    window.addEventListener('cti:mic-error', handleMicError)
    window.addEventListener('cti:network-stats', handleNetworkStats)

    window.addEventListener('beforeunload', handleBeforeUnload)

    loadCallCache()
    bootWebRTC()

    window.addEventListener('cti:open-dialer-panel', () => {
      isOpen.value = true
      activePanel.value = 'dialpad'
    })

    window.CTI_PHONE_CALL = clickToCallWithLogging
  })

  onUnmounted(() => {
    if (clockInterval) window.clearInterval(clockInterval)

    stopTimer()

    window.removeEventListener('cti:registered', handleRegistered)
    window.removeEventListener('cti:registration-failed', handleRegistrationFailed)
    window.removeEventListener('cti:sip-incoming', handleIncoming)
    window.removeEventListener('cti:incoming-call', handleIncoming)
    window.removeEventListener('cti:call-ringing', handleRinging)
    window.removeEventListener('cti:call-active', handleActive)
    window.removeEventListener('cti:call-ended', handleEnded)
    window.removeEventListener('cti:socket-connected', handleSocketConnected)
    window.removeEventListener('cti:socket-disconnected', handleSocketDisconnected)
    window.removeEventListener('cti:call-failed', handleCallFailed)
    window.removeEventListener('cti:mic-error', handleMicError)
    window.removeEventListener('cti:network-stats', handleNetworkStats)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    isOpen,
    number,
    currentTime,
    panelRef,
    headerRef,
    activePanel,
    forwardNumber,
    forwardEnabled,
    recentSearch,
    missedUnreadCount,
    filteredRecentCalls,
    panelStyle,
    keys,
    callStore,
    pressKey,
    backspaceNumber,
    clearNumber,
    handlePrimaryAction,
    callFromHistory,
    callNumber,
    answerCurrentCall,
    rejectCurrentCall,
    endCurrentCall,
    toggleMuteCurrentCall,
    toggleHoldCurrentCall,
    manualRegister,
    redialLastCall,
    markMissedRead,
    confirmClearMissed,
    enableForwarding,
    disableForwarding,
    isIncomingCall,
    isActiveCall,
    inputPlaceholder,
    helperText,
    hasDigits,
    canPlaceCall,
    activeCallTitle,
    statusLabel,
  }
}

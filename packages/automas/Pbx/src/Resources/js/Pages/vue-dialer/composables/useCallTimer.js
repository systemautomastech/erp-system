export function useCallTimer(callStore) {
  let timerInterval = null

  function startTimer() {
    stopTimer()

    callStore.callStartedAt = Date.now()
    callStore.callDuration = '00:00'

    timerInterval = window.setInterval(() => {
      const diff = Math.floor((Date.now() - callStore.callStartedAt) / 1000)
      const min = String(Math.floor(diff / 60)).padStart(2, '0')
      const sec = String(diff % 60).padStart(2, '0')
      callStore.callDuration = `${min}:${sec}`
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      window.clearInterval(timerInterval)
      timerInterval = null
    }

    callStore.callStartedAt = null
    callStore.callDuration = '00:00'
  }

  return {
    startTimer,
    stopTimer,
  }
}

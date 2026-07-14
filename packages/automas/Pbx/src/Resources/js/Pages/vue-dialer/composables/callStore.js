import { reactive } from 'vue'

export const callStore = reactive({
  registered: false,
  agentStatus: 'offline',
  callStatus: 'idle',
  caller: '',
  incomingNumber: '',
  currentNumber: '',
  contactName: '',
  module: null,
  recordId: null,
  callerInfo: null,
  muted: false,
  onHold: false,
  callStartedAt: null,
  callDuration: '00:00',
  socketConnected: false,
  connectionMessage: '',
  callQuality: 'Unknown',
  latency: null,
  packetLoss: null,
  recentCalls: [],
  missedCalls: [],
  direction: null,
})

// Backwards compatibility for any code that referenced window.callStore
window.callStore = callStore

export default callStore

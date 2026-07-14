export interface RecentCall {
  number: string
  direction: 'inbound' | 'outbound' | string
  status: string
  module?: string | null
  recordId?: number | string | null
  createdAt?: string
}

export interface CallerInfo {
  found: boolean
  type?: string
  id?: number | string
  name?: string
  phone?: string
  number?: string
  email?: string
  organization?: string
  address?: string
  extra?: Record<string, unknown>
}

export interface CallStore {
  registered: boolean
  agentStatus: string
  callStatus: string

  caller: string
  incomingNumber: string
  currentNumber: string
  contactName: string

  module: string | null
  recordId: number | string | null

  callerInfo: CallerInfo | null

  muted: boolean
  onHold: boolean

  callStartedAt: number | null
  callDuration: string

  socketConnected: boolean
  connectionMessage: string

  callQuality: string
  latency: number | null
  packetLoss: number | null

  recentCalls: RecentCall[]
  missedCalls: RecentCall[]

  direction: 'inbound' | 'outbound' | null
}

const callStore: CallStore = {
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
}

declare global {
  interface Window {
    callStore: CallStore
  }
}

window.callStore = callStore

export default callStore
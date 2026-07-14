<template>
  <div>
    <template v-if="isOwnerTab">
      <div>
        <audio id="remoteAudio" autoplay aria-hidden="true"></audio>

        <button v-if="!isOpen" class="phone-tab" @click="isOpen = true" title="Open Dialer">
          <PhoneIcon class="phone-tab-icon" />

          <span v-if="missedUnreadCount > 0" class="call-alert-badge">
            {{ missedUnreadCount > 9 ? '9+' : missedUnreadCount }}
          </span>
        </button>

        <transition name="slide-phone">
          <div v-if="isOpen" ref="panelRef" class="webphone" :style="panelStyle">
            <div class="phone-screen">
              <div ref="headerRef" class="phone-topbar">
                <div class="phone-topbar-left">{{ currentTime }}</div>

                <div class="dynamic-island">
                  <span :class="['status-pill', callStore.agentStatus]">
                    {{ callStore.agentStatus }}
                  </span>
                  <span class="dynamic-status">
                    {{ callStore.callStatus === 'active' ? callStore.callDuration : statusLabel }}
                  </span>
                </div>

                <div class="phone-topbar-right">
                  <span v-if="callStore.registered" class="signal-dots">
                    <span></span><span></span><span></span><span></span>
                  </span>
                  <X v-else class="connection-cross" />
                  <span class="battery">80%</span>
                </div>
              </div>

              <div class="phone-content" :class="callStore.callStatus">
                <div class="dialer-window-actions">
                  <div class="dialer-window-actions">
                    <button class="phone-close" @click="isOpen = false">
                      <Minimize2 class="" />
                    </button>

                    <div v-if="activePanel !== 'dialpad'">
                      <button class="phone-close" @click="activePanel = 'dialpad'">
                        <Undo2 class="" />
                      </button>
                    </div>
                  </div>

                  <div class="dialer-window-actions">
                    <button class="close-btn phone-close position-relative"
                      :class="{ 'history-alert-badge': missedUnreadCount > 0 }" @click="openHistoryPanel">
                      <History class="" />
                    </button>

                    <button class="close-btn phone-close" @click="activePanel = 'forward'">
                      <Forward class="" />
                    </button>
                  </div>
                </div>

                <transition name="panel-slide" mode="out-in">
                  <div :key="panelTransitionKey" :class="{ 'idle-panel': activePanel === 'dialpad' }">
                    <!-- Incoming -->
                    <template v-if="isIncomingCall">
                      <div class="incoming-panel">
                        <div class="incoming-hero">
                          <div class="incoming-kicker">
                            <span class="status-pill incoming">Incoming</span>
                            <!-- <span>Call waiting</span> -->
                          </div>

                          <h3>{{ callStore.caller || callStore.incomingNumber }}</h3>
                          <p>Answer to start the conversation or reject to decline the call.</p>
                        </div>

                        <div class="incoming-meta">
                          <div class="meta-row">
                            <div class="lookup-item">
                              <span class="meta-label">Contact</span>
                              <span class="meta-value">{{ callStore.callerInfo?.name || callStore.contactName ||
                                'Unknown'
                                }}</span>
                            </div>

                            <div v-if="callStore.callerInfo?.organization" class="lookup-item">
                              <span class="meta-label">Organization</span>
                              <span class="meta-value">{{ callStore.callerInfo.organization }}</span>
                            </div>

                            <div v-if="callStore.callerInfo?.email" class="lookup-item">
                              <span class="meta-label">Email</span>
                              <span class="meta-value">{{ callStore.callerInfo.email }}</span>
                            </div>

                            <div v-if="callStore.callerInfo?.extra?.lead_subject" class="lookup-item">
                              <span class="meta-label">Subject</span>
                              <span class="meta-value">{{ callStore.callerInfo.extra.lead_subject }}</span>
                            </div>

                            <div v-if="callStore.callerInfo?.extra?.lead_status" class="lookup-item">
                              <span class="meta-label">Status</span>
                              <span class="meta-value">{{ callStore.callerInfo.extra.lead_status }}</span>
                            </div>

                            <div v-if="callStore.callerInfo?.extra?.lead_created_at" class="lookup-item">
                              <span class="meta-label">Created</span>
                              <span class="meta-value">{{ callStore.callerInfo.extra.lead_created_at }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="main-actions incoming">
                          <button class="dialer-action-btn answer" @click="answerCurrentCall">
                            <PhoneIcon class="action-icon" />
                            <span>Answer</span>
                          </button>

                          <button class="dialer-action-btn reject" @click="rejectCurrentCall">
                            <PhoneIcon class="action-icon rotate-135" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </template>

                    <!-- Active -->
                    <template v-else-if="isActiveCall">
                      <div class="active-panel">
                        <div class="active-hero">
                          <div class="active-identity">
                            <div class="active-avatar">
                              <PhoneIcon class="active-avatar-icon" />
                            </div>

                            <div class="active-copy">
                              <div class="label-row">
                                <span class="label">Live call</span>
                              </div>
                              <h3>{{ activeCallTitle }}</h3>
                            </div>
                          </div>
                        </div>

                        <div class="active-badges">
                          <span v-if="callStore.muted" class="active-badge">Muted</span>
                          <span v-if="callStore.onHold" class="active-badge">On hold</span>
                          <span class="active-badge">
                            {{ callStore.callQuality }}
                          </span>

                          <span class="active-badge" v-if="callStore.latency">
                            {{ callStore.latency }} ms
                          </span>
                        </div>

                        <div class="active-controls">
                          <div class="active-controls-row">
                            <button class="dialer-action-btn icon-only mute" :class="{ active: callStore.muted }"
                              @click="toggleMuteCurrentCall">
                              <component :is="callStore.muted ? MicOff : Mic" class="action-icon" />
                            </button>

                            <button class="dialer-action-btn icon-only hold" :class="{ active: callStore.onHold }"
                              @click="toggleHoldCurrentCall">
                              <component :is="callStore.onHold ? Play : Pause" class="action-icon" />
                            </button>

                            <button class="dialer-action-btn icon-only hangup" @click="endCurrentCall">
                              <PhoneIcon class="action-icon rotate-135" />
                            </button>
                          </div>
                        </div>

                        <div class="active-keypad">
                          <div class="dialpad">
                            <button v-for="key in keys" :key="key.value" class="dialpad-key"
                              @click="pressKey(key.value)">
                              <span class="dialpad-value">{{ key.value }}</span>
                              <span class="dialpad-label">{{ key.label }}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Idle / Dialing -->
                    <template v-else>
                      <div class="idle-panel">
                        <template v-if="activePanel === 'dialpad'">
                          <div class="display">
                            <input v-model="number" :placeholder="inputPlaceholder" inputmode="tel" autocomplete="off"
                              @keydown.enter.prevent="handlePrimaryAction" />

                            <div class="status-row">
                              <span class="status-copy">{{ helperText }}</span>
                            </div>

                            <div v-if="callStore.connectionMessage" class="status-row">
                              <span class="status-copy text-danger">
                                {{ callStore.connectionMessage }}
                              </span>
                            </div>
                          </div>

                          <div class="dialpad">
                            <button v-for="key in keys" :key="key.value" class="dialpad-key"
                              @click="pressKey(key.value)">
                              <span class="dialpad-value">{{ key.value }}</span>
                              <span class="dialpad-label">{{ key.label }}</span>
                            </button>
                          </div>

                          <div class="utility-actions dialer-actions" :class="callStore.callStatus">
                            <button class="utility-btn icon-only" :disabled="!hasDigits" @click="clearNumber">
                              <X class="" />
                            </button>

                            <template v-if="['ringing', 'calling'].includes(callStore.callStatus)">
                              <button class="dialer-action-btn hangup full icon-only" @click="endCurrentCall">
                                <PhoneIcon class="action-icon rotate-135" />
                              </button>
                            </template>

                            <template v-else>
                              <button class="dialer-action-btn call full icon-only" :disabled="!canPlaceCall"
                                @click="handlePrimaryAction">
                                <PhoneIcon class="action-icon" />
                              </button>
                            </template>

                            <button class="utility-btn icon-only" :disabled="!hasDigits" @click="backspaceNumber">
                              <Delete class="" />
                            </button>
                          </div>

                          <button v-if="!callStore.registered" class="register-btn" @click="manualRegister">
                            <Radio class="" />
                            <span>Register Dialer</span>
                          </button>
                        </template>

                        <template v-else-if="activePanel === 'calls'">
                          <DialerHistory :callStore="callStore" :recentSearch="recentSearch"
                            :missedUnreadCount="missedUnreadCount" :filteredRecentCalls="filteredRecentCalls"
                            :redialLastCall="redialLastCall" :markMissedRead="markMissedRead"
                            :confirmClearMissed="confirmClearMissed" :callFromHistory="callFromHistory"
                            @close="activePanel = 'dialpad'" @update:recentSearch="val => recentSearch = val" />
                        </template>

                        <template v-else-if="activePanel === 'forward'">
                          <DialerForward :forwardNumber="forwardNumber" :forwardEnabled="forwardEnabled"
                            :enableForwarding="enableForwarding" :disableForwarding="disableForwarding"
                            :forwardCurrentCall="forwardCurrentCall" @close="activePanel = 'dialpad'"
                            @update:forwardNumber="val => forwardNumber = val" />
                        </template>
                      </div>
                    </template>
                  </div>
                </transition>
              </div>

              <div class="home-indicator" @click="isOpen = false"></div>
            </div>
          </div>
        </transition>
      </div>
    </template>

    <template v-else>
      <button class="phone-tab" @click="openDialerPopup" title="Dialer active in another tab">
        <PhoneIcon class="phone-tab-icon" />
        <span class="call-alert-badge">!</span>
      </button>
    </template>
  </div>
</template>
<script setup>
import '../styles/dialer/variables.css'
import '../styles/dialer/base.css'
import '../styles/dialer/topbar.css'
import '../styles/dialer/buttons.css'
import '../styles/dialer/dialpad.css'
import '../styles/dialer/incoming.css'
import '../styles/dialer/history.css'
import '../styles/dialer/panels.css'
import '../styles/dialer/active.css'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { PhoneIcon, X, Minimize2, Delete, Mic, MicOff, Play, Pause, Radio, History, Forward, Undo2, RotateCw, Check, Trash2 } from 'lucide-vue-next'
import { useDialer } from '../composables/useDialer.js'
import DialerHistory from './DialerHistory.vue'
import DialerForward from './DialerForward.vue'
import { useDialerTabOwner } from '../composables/useDialerTabOwner.js'

const {
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
  forwardCurrentCall,
  inputPlaceholder,
  helperText,
  hasDigits,
  canPlaceCall,
  activeCallTitle,
  statusLabel,
  isIncomingCall,
  isActiveCall,
} = useDialer()

const { isOwnerTab, openDialerPopup } = useDialerTabOwner()

const panelTransitionKey = computed(() => `${activePanel}-${callStore.callStatus}`)

function openHistoryPanel() {
  activePanel.value = 'calls'
  markMissedRead()
}

function flashPanelOnce() {
  try {
    const el = panelRef?.value
    if (!el) return
    el.classList.add('flash-notice')
    setTimeout(() => el.classList.remove('flash-notice'), 2000)
  } catch (e) {
    // ignore
  }
}

function onOpenDialerEvent() {
  isOpen.value = true
  // bring panel to front visually
  flashPanelOnce()
}

function onMakeCallEvent(e) {
  const num = e?.detail?.number
  if (!num) return
  number.value = num
  isOpen.value = true
  // give UI a moment, then place call via UA
  setTimeout(() => {
    try {
      callNumber(num)
    } catch (err) {
      // fallback to primary action
      handlePrimaryAction()
    }
  }, 150)
}

onMounted(() => {
  window.addEventListener('cti:open-dialer-panel', onOpenDialerEvent)
  window.addEventListener('cti:make-call', onMakeCallEvent)
  // Prevent accidental refresh/close while a call is in progress
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('cti:open-dialer-panel', onOpenDialerEvent)
  window.removeEventListener('cti:make-call', onMakeCallEvent)
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

function beforeUnloadHandler(event) {
  try {
    const status = callStore.callStatus
    const blocking = ['active', 'calling', 'ringing']
    if (isOwnerTab.value && blocking.includes(status)) {
      const message = 'A call is in progress. Please end or reject the call before leaving this page.'
      event.preventDefault()
      // Some browsers require setting returnValue
      event.returnValue = message
      return message
    }
  } catch (e) {
    // ignore errors and allow unload
  }
}
</script>
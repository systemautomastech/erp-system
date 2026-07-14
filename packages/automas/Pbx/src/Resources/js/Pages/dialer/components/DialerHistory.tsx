<template>
  <div class="history-panel panel-transition">
    <div class="panel-header">
      <h2>Recent calls</h2>
    </div>

    <div class="search-row mb-2 position-relative">
      <input :value="recentSearch" @input="updateSearch($event.target.value)" type="text" class="form-control"
        placeholder="Search recent calls" />

      <div v-if="showNoResultCallPopover" class="no-result-popover shadow-sm">
        <div class="small text-muted mb-1">No result found</div>

        <div class="fw-semibold mb-2">
          {{ recentSearch }}
        </div>

        <button class="btn btn-sm btn-primary w-100" @click="callSearchNumber">
          <PhoneIcon class="me-1 action-icon" />
          Call
        </button>
      </div>
    </div>

    <!-- <div class="history-actions d-flex gap-2 mb-2">
      <button class="btn btn-sm btn-primary" :disabled="!callStore.recentCalls.length" @click="redialLastCall">
        <RotateCw class="me-1" /> Redial
      </button>
      <button class="btn btn-sm btn-outline-secondary" :disabled="missedUnreadCount === 0" @click="markMissedRead">
        <Check class="me-1" /> Mark read
      </button>
      <button class="btn btn-sm btn-outline-danger" :disabled="!callStore.missedCalls.length"
        @click="confirmClearMissed">
        <Trash2 class="me-1" /> Clear
      </button>
    </div> -->

    <div v-if="filteredRecentCalls.length" class="history-list">
      <div v-for="item in filteredRecentCalls" :key="item.id" class="history-item border-bottom py-2 px-1">
        <div class="ms-1 w-100" :class="{
          'text-danger': item.status === 'missed' || item.status === 'failed' || item.status === 'rejected',
          'text-success': item.status === 'answered',
          'text-primary': item.direction === 'outbound' && item.status === 'answered',
        }"
          @click="copyNumber(item.number)">
          <span class="fw-semibold history-number">
            {{ item.number }}

            <small v-if="copiedNumber === item.number" class="text-success text-muted ms-2">
              ✓ Copied
            </small>
          </span>
          <div class="history-meta d-flex gap-2 align-items-center">
            <small class="d-flex align-items-center">
              <PhoneMissed v-if="item.status === 'missed'" class="history-direction-icon text-danger" />

              <X v-else-if="item.status === 'failed' || item.status === 'rejected'"
                class="history-direction-icon text-danger" />

              <ArrowDownLeft v-else-if="item.direction === 'outbound'" class="history-direction-icon text-success" />

              <ArrowUpRight v-else-if="item.direction === 'inbound'" class="history-direction-icon text-success" />
            </small>

            <small class="text-muted">{{ getCallLabel(item) }}</small>
            <small class="text-muted">{{ item.time }}</small>
          </div>
        </div>

        <div class="history-item-right">
          <div class="history-avatar" @click.stop="callFromHistory(item)">
            <PhoneIcon class="action-icon" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-muted py-3">
      No recent calls found
    </div>
  </div>
</template>

<script setup>
import {
  PhoneIcon,
  RotateCw,
  Check,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  PhoneMissed,
  X
} from 'lucide-vue-next'

import { defineProps } from 'vue'

function getCallLabel(item) {
  if (item.status === 'missed') return 'Missed'
  if (item.status === 'failed') return 'Failed'
  if (item.status === 'rejected') return 'Rejected'

  if (item.direction === 'inbound') return 'Incoming'
  if (item.direction === 'outbound') return 'Outgoing'

  return 'Call'
}

const props = defineProps({
  callStore: Object,
  recentSearch: String,
  missedUnreadCount: Number,
  filteredRecentCalls: Array,
  redialLastCall: Function,
  markMissedRead: Function,
  confirmClearMissed: Function,
  callFromHistory: Function,
})

const emit = defineEmits(['close', 'update:recentSearch'])

function updateSearch(value) {
  emit('update:recentSearch', value)
}

import { ref } from 'vue'

const copiedNumber = ref(null)

async function copyNumber(number) {
  try {
    await navigator.clipboard.writeText(number)

    copiedNumber.value = number

    setTimeout(() => {
      if (copiedNumber.value === number) {
        copiedNumber.value = null
      }
    }, 1500)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

import { computed } from 'vue'

const showNoResultCallPopover = computed(() => {
  return (
    props.recentSearch &&
    props.recentSearch.trim().length >= 3 &&
    props.filteredRecentCalls.length === 0
  )
})

function callSearchNumber() {
  const number = props.recentSearch.trim()
  if (!number) return

  props.callFromHistory({
    number,
    direction: 'outbound',
    status: 'answered',
  })
}
</script>

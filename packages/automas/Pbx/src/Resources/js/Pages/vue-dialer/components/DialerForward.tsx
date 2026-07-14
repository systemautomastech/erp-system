<template>
  <div class="forward-panel panel-transition">
    <div class="panel-header">
      <h2>Forward call</h2>
    </div>

    <div class="forward-body">
      <label for="forwardNumber" class="form-label mb-0">Forward current call to</label>
      <input id="forwardNumber" :value="forwardNumber" @input="updateForwardNumber($event.target.value)" type="text"
        class="form-control mb-3" placeholder="Enter extension or number" />

      <div class="d-flex gap-2">
        <button v-if="!forwardEnabled" class="btn btn-sm btn-outline-secondary w-50 mb-2"
          :disabled="!forwardNumber?.trim()" @click="enableForwarding">
          Enable
        </button>

        <button v-else class="btn btn-sm btn-outline-danger w-50 mb-2" @click="disableForwarding">
          Disable
        </button>

        <button class="btn btn-sm btn-primary w-50 mb-2" :disabled="!forwardNumber?.trim()"
          @click="forwardCurrentCall(forwardNumber)">
          <PhoneIcon class="me-1" />
        </button>
      </div>

      <p class="text-muted small mt-2">If a call is active, dialing a number will forward the call to that number.</p>
    </div>
  </div>
</template>

<script setup>
import { PhoneIcon, Undo2 } from 'lucide-vue-next'
import { defineProps } from 'vue'

const props = defineProps({
  forwardNumber: String,
  forwardEnabled: Boolean,
  enableForwarding: Function,
  disableForwarding: Function,
  forwardCurrentCall: Function,
})

const emit = defineEmits(['close', 'update:forwardNumber'])

function updateForwardNumber(value) {
  emit('update:forwardNumber', value)
}
</script>

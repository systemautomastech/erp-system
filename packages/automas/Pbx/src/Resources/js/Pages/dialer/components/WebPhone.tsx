<script setup>
import { useDialerTabOwner } from '../composables/useDialerTabOwner.js'
import DialerPhone from './Dialer.vue'

const { isOwnerTab, openDialerPopup } = useDialerTabOwner()
</script>

<template>
  <DialerPhone v-if="isOwnerTab" />

  <button
    v-else
    class="phone-tab"
    @click="openDialerPopup"
    title="Dialer active in another tab"
  >
    Dialer running in another tab
  </button>
</template>
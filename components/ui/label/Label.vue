<script setup lang="ts">
import { Label as RadixLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  for?: string
  class?: string
}>()
</script>

<template>
  <RadixLabel
    :for="props.for"
    :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)"
  >
    <slot />
  </RadixLabel>
</template>

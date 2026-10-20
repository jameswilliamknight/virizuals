<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useRippleSurface } from '../../composables/useRippleSurface'
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
useRippleSurface(canvas)
</script>

<template>
  <canvas ref="canvas" tabindex="0" aria-label="Interactive ripple surface. Move to illuminate, click or hold for ripples. Press Enter or Space for a centred ripple." class="block size-full touch-none text-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current" />
</template>

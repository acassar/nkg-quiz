<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import QRCode from "qrcode";

const props = defineProps<{
  sessionCode: string;
  small?: boolean;
}>();

const canvas = ref<HTMLCanvasElement>();

const render = () => {
  if (!canvas.value) return;
  const playerUrl = import.meta.env.VITE_PLAYER_URL || "http://localhost:5174";
  const urlObj = new URL(playerUrl);
  urlObj.searchParams.set("code", props.sessionCode);
  const url = urlObj.toString();
  QRCode.toCanvas(canvas.value, url, {
    width: props.small ? 100 : 200,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
};

onMounted(render);
watch(() => [props.sessionCode, props.small], render);
</script>

<template>
  <div :class="['qr-wrapper', { small }]">
    <canvas ref="canvas" />
    <span v-if="!small" class="qr-label">{{ sessionCode }}</span>
  </div>
</template>

<style scoped>
.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.qr-wrapper canvas {
  border-radius: 8px;
}

.qr-label {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.qr-wrapper.small {
  gap: 0.25rem;
}
</style>

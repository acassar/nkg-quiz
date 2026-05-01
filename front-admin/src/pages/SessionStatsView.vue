<script setup lang="ts">
import { socketClient, connectAdminSocket } from "@/services/socket.service";
import { S2C_EVENTS, useSocketEvent } from "@nkg-quiz/shared-socket";
import { useSessionFetcher } from "@/composables/fetcher/session/useSessionFetcher";
import CurrentQuestion from "@/components/stats/CurrentQuestion.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LiveStats } from "@/types/session/session.types";

const route = useRoute();
const router = useRouter();
const code = route.params.code as string;

const { getLiveStats } = useSessionFetcher();
const data = ref<LiveStats | null>(null);

useSocketEvent(socketClient, S2C_EVENTS.LIVE_STATS, (payload) => {
  data.value = payload;
});

onMounted(async () => {
  if (!socketClient.isConnected()) {
    connectAdminSocket(code);
  }
  const result = await getLiveStats.execute(code);
  if (result && !data.value) {
    data.value = result;
  }
});
</script>

<template>
  <div class="stats-page">
    <div class="row">
      <button @click="router.back()">← Retour</button>
      <h1 style="margin: 0; font-size: 1.1rem;">Stats — <code>{{ code }}</code></h1>
    </div>
    <CurrentQuestion :stats="data" />
  </div>
</template>

<style scoped>
.stats-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 860px;
  margin: 0 auto;
}
</style>

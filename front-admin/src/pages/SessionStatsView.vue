<script setup lang="ts">
import { socketClient, connectAdminSocket } from "@/services/socket.service";
import { S2C_EVENTS, useSocketEvent } from "@nkg-quiz/shared-socket";
import { useSessionFetcher } from "@/composables/fetcher/session/useSessionFetcher";
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
  <div>
    <button @click="router.back()">← Retour</button>
    <h1>Stats — {{ code }}</h1>
    {{ data }}
  </div>
</template>

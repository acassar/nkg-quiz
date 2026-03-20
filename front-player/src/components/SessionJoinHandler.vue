<script setup lang="ts">
import { ref } from "vue";
import { Player } from "../types/player.types";
import SearchSessionByCode from "./SearchSessionByCode.vue";
import SessionJoin from "./SessionJoin.vue";
import { useSessionFetcher } from "../composable/useSessionFetcher";

const { getState } = useSessionFetcher();

const sessionCode = ref();
const status = ref<"sessionCode" | "nickname">("sessionCode");
const retrievedPlayer = ref<Player>();

const handleRetrievedPlayerForSession = async (player: Player | undefined) => {
  if (!sessionCode.value) return;
  // Check session state before proceeding to nickname input
  await getState.execute(sessionCode.value);
  if (getState.error.value) return;

  retrievedPlayer.value = player;
  status.value = "nickname";
};
</script>

<template>
  <section class="hero">
    <span class="badge">Player</span>
    <h1>Join the live quiz</h1>
    <p>Enter the session code and your nickname to play.</p>
  </section>

  <section class="card">
    <div class="form">
      <SearchSessionByCode
        v-if="status === 'sessionCode'"
        v-model="sessionCode"
        @submit="handleRetrievedPlayerForSession"
      ></SearchSessionByCode>
      <span class="error">{{ getState.error.value?.message }}</span>
      <SessionJoin
        v-if="sessionCode && status === 'nickname'"
        :sessionCode="sessionCode"
        :player="retrievedPlayer"
        @back="status = 'sessionCode'"
      ></SessionJoin>
    </div>
  </section>
</template>

<style scoped></style>

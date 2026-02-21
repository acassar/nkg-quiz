<script setup lang="ts">
import { useSession } from "../composables/useSession";
import { SessionState } from "../types/Session.types";

const {
  performAction,
  activeSession,
  sessionState,
  error: sessionError,
} = useSession();

const sessionAction = async (action: "start" | "next" | "reveal" | "end") => {
  if (!activeSession.value) return;
  const data = await performAction(action);
  sessionState.value = data.state as SessionState;
  if (action === "end") activeSession.value = null;
};
</script>

<template>
  <div class="card">
    <div class="section-title">Active session</div>
    <p v-if="!activeSession">No active session yet.</p>
    <div v-else class="grid">
      <div><strong>Code:</strong> {{ activeSession.code }}</div>
      <div><strong>Status:</strong> {{ sessionState?.status }}</div>
      <div class="row">
        <button @click="sessionAction('start')">Start</button>
        <button @click="sessionAction('next')">Next</button>
        <button @click="sessionAction('reveal')">Reveal</button>
        <button class="secondary" @click="sessionAction('end')">End</button>
      </div>
    </div>
    <p v-if="sessionError">{{ sessionError }}</p>
  </div>
</template>

<style scoped></style>

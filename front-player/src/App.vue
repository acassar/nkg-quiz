<script setup lang="ts">
import QuestionsComponent from "./components/QuestionsComponent.vue";
import SessionJoinHandler from "./components/SessionJoinHandler.vue";
import { useSessionState } from "./composable/useSessionState";

const { sessionCode, leaveSession } = useSessionState();
</script>

<template>
  <div class="app-content">
    <button v-if="sessionCode" @click="leaveSession">Leave session</button>
    <SessionJoinHandler v-if="!sessionCode" />
    <QuestionsComponent />
  </div>
</template>

<style scoped>
.app-content {
  display: grid;
  gap: 1.8rem;
  padding: 2rem 7vw 4rem;
}

@media (max-width: 720px) {
  .app-content {
    padding: 1.6rem 6vw 3rem;
  }
}
</style>

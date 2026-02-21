<script setup lang="ts">
import { computed } from "vue";
import { useQuiz } from "../composables/useQuiz";
import { useSession } from "../composables/useSession";
import { SessionAction, SessionState } from "../types/Session.types";

const {
  performAction,
  activeSession,
  sessionState,
  error: sessionError,
} = useSession();

const { quizzes } = useQuiz();

const sessionQuiz = computed(() => {
  if (!activeSession.value) return null;
  return (
    quizzes.value.find((q) => q.id === activeSession.value?.quizId) || null
  );
});

const sessionAction = async (action: SessionAction) => {
  if (!activeSession.value) return;
  const data = await performAction(action);
  sessionState.value = data.state as SessionState;
};
</script>

<template>
  <div class="card">
    <div class="row">
      <div class="section-title">Active session :</div>
      <span>{{ sessionQuiz?.title }}</span>
    </div>
    <p v-if="!activeSession">No active session yet.</p>
    <div v-else class="grid">
      <div class="code-status">
        <div><strong>Code:</strong> {{ activeSession.code }}</div>
        <div>
          <strong>Status : </strong>
          <span id="session-status" :status="sessionState?.status">{{
            sessionState?.status
          }}</span>
        </div>
      </div>
      <div class="row">
        <button
          v-if="sessionState?.status === 'LOBBY'"
          @click="sessionAction('start')"
        >
          Start
        </button>
        <button
          v-else-if="sessionState?.status !== 'ARCHIVED'"
          @click="sessionAction('restart')"
        >
          Restart
        </button>

        <button @click="sessionAction('next')">Next</button>
        <button @click="sessionAction('reveal')">Reveal</button>
        <button class="secondary" @click="sessionAction('end')">End</button>
        <button
          v-if="sessionState?.status === 'ENDED'"
          class="secondary"
          @click="sessionAction('archive')"
        >
          Archive
        </button>
      </div>
    </div>
    <p v-if="sessionError">{{ sessionError }}</p>
  </div>
</template>

<style scoped>
.code-status {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  justify-content: space-between;
  margin-bottom: 1rem;
}

#status {
  font-size: large;
}

span[status="LOBBY"] {
  color: #6b7280;
}

span[status="RUNNING"] {
  color: #059669;
}

span[status="REVEAL"] {
  color: #f59e0b;
}

span[status="ENDED"] {
  color: #dc2626;
}
</style>

<script setup lang="ts">
import { useQuizStore } from "@/stores/quizStore";
import { useSession } from "../composables/useSession";
import { SessionAction } from "../types/session/session.types";
import { answersCount } from "../services/socket.service";
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const { performAction, activeSession, sessionState } = useSession();
const { getById } = useQuizStore();

const quiz = computed(() => {
  if (!activeSession.value) return undefined;
  return getById(activeSession.value?.quizId);
});

const quizActiveQuestion = computed(() => {
  if (
    !quiz.value ||
    sessionState.value?.currentQuestionIndex === null ||
    sessionState.value?.currentQuestionIndex === undefined
  )
    return undefined;
  const questionIndex = sessionState.value?.currentQuestionIndex;
  return quiz.value?.questions[questionIndex];
});

const sessionAction = async (action: SessionAction, body?: Record<string, unknown>) => {
  await performAction(action, body);
};
</script>

<template>
  <div class="card">
    <div class="row">
      <div class="section-title">Active session :</div>
      <span>{{ quiz?.title ?? "N/A" }}</span>
    </div>
    <p v-if="!activeSession">No active session yet.</p>
    <div v-else>
      <div class="infos-container">
        <div><strong>Code:</strong> {{ activeSession.code }}</div>
        <div>
          Active question
          {{ quizActiveQuestion?.prompt ?? "N/A" }} ({{
            sessionState?.currentQuestionIndex ?? "N/A"
          }})
        </div>
        <div>
          <strong>Status : </strong>
          <span id="session-status" :status="sessionState?.status">{{
            sessionState?.status
          }}</span>
        </div>
        <div>
          <strong>Réponses : </strong>{{ answersCount }}
        </div>
      </div>
      <div class="row">
        <button
          class="secondary"
          @click="router.push({ name: 'SessionStats', params: { code: activeSession.code } })"
        >
          Stats
        </button>
        <button
          v-if="sessionState?.status === 'LOBBY'"
          @click="sessionAction('start')"
        >
          Start
        </button>
        <template v-else-if="sessionState?.status !== 'ARCHIVED'">
          <button @click="sessionAction('restart')">Restart</button>
          <button class="secondary" @click="sessionAction('restart', { keepAnswers: true })">Restart (keep answers)</button>
        </template>

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
  </div>
</template>

<style scoped>
.infos-container {
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

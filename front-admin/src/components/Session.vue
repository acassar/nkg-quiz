<script setup lang="ts">
import { useQuizStore } from "@/stores/quizStore";
import { useSession } from "../composables/useSession";
import { socketClient } from "../services/socket.service";
import { S2C_EVENTS, useSocketEvent } from "@nkg-quiz/shared-socket";
import { useI18n } from "vue-i18n";
import type { SessionAction, SessionState } from "../types/session/session.types";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n();
const { performAction, activeSession, sessionState } = useSession();
const { getById } = useQuizStore();

const answersCount = ref(0);

useSocketEvent(socketClient, S2C_EVENTS.SESSION_JOINED, (payload) => {
  sessionState.value = payload as unknown as SessionState;
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_STATE, (payload) => {
  sessionState.value = payload as SessionState;
  answersCount.value = 0;
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_END, (payload) => {
  sessionState.value = payload as SessionState;
});
useSocketEvent(socketClient, S2C_EVENTS.ANSWER_RECEIVED, () => { answersCount.value++; });

const quiz = computed(() => activeSession.value ? getById(activeSession.value.quizId) : undefined);

const quizActiveQuestion = computed(() => {
  const index = sessionState.value?.currentQuestionIndex;
  if (!quiz.value || index === null || index === undefined) return undefined;
  return quiz.value.questions[index];
});

const sessionAction = async (action: SessionAction, body?: Record<string, unknown>) => {
  await performAction(action, body);
};
</script>

<template>
  <div class="card">
    <div class="row">
      <div class="section-title">{{ t("session.sectionTitle") }} :</div>
      <span>{{ quiz?.title ?? t("session.na") }}</span>
    </div>

    <p v-if="!activeSession">{{ t("session.none") }}</p>

    <div v-else>
      <div class="infos-container">
        <div><strong>{{ t("session.code") }}</strong> {{ activeSession.code }}</div>
        <div>
          {{ t("session.activeQuestion") }}
          {{ quizActiveQuestion?.prompt ?? t("session.na") }}
          ({{ sessionState?.currentQuestionIndex ?? t("session.na") }})
        </div>
        <div>
          <strong>{{ t("session.status") }}</strong>
          <span :status="sessionState?.status">{{ sessionState?.status }}</span>
        </div>
        <div>
          <strong>{{ t("session.answers") }}</strong> {{ answersCount }}
        </div>
      </div>

      <div class="row">
        <button
          class="secondary"
          @click="router.push({ name: 'SessionStats', params: { code: activeSession.code } })"
        >
          {{ t("session.actions.stats") }}
        </button>
        <button v-if="sessionState?.status === 'LOBBY'" @click="sessionAction('start')">
          {{ t("session.actions.start") }}
        </button>
        <template v-else-if="sessionState?.status !== 'ARCHIVED'">
          <button @click="sessionAction('restart')">{{ t("session.actions.restart") }}</button>
          <button class="secondary" @click="sessionAction('restart', { keepAnswers: true })">
            {{ t("session.actions.restartKeep") }}
          </button>
        </template>
        <button @click="sessionAction('next')">{{ t("session.actions.next") }}</button>
        <button @click="sessionAction('reveal')">{{ t("session.actions.reveal") }}</button>
        <button class="secondary" @click="sessionAction('end')">{{ t("session.actions.end") }}</button>
        <button
          v-if="sessionState?.status === 'ENDED'"
          class="secondary"
          @click="sessionAction('archive')"
        >
          {{ t("session.actions.archive") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.infos-container {
  display: flex;
  gap: 1rem;
  margin: 1rem 0 1rem;
  justify-content: space-between;
  flex-wrap: wrap;
}

span[status="LOBBY"]    { color: #6b7280; }
span[status="RUNNING"]  { color: #059669; }
span[status="REVEAL"]   { color: #f59e0b; }
span[status="ENDED"]    { color: #dc2626; }
</style>

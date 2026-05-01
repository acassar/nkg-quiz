<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { useAuth } from "../composables/useAuth";
import { useSession } from "../composables/useSession";
import { useSessionFetcher } from "@/composables/fetcher/session/useSessionFetcher";
import { useQuizStore } from "@/stores/quizStore";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import type { Quiz } from "@/types/quiz/quiz.types";

const emits = defineEmits<{ (e: "edit:quiz", quizId: number): void }>();

const { t } = useI18n();
const { isAuthed } = useAuth();
const { getQuizzes, deleteQuiz: deleteQuizFetcher } = useQuizFetcher();
const { set: updateQuizStore, clear: clearQuizzesStore } = useQuizStore();
const { changeActiveSession } = useSession();
const { createSession } = useSessionFetcher();

const isLoading = computed(() => getQuizzes.isLoading.value);

if (isAuthed.value) init();

async function init() {
  try {
    await initQuizzes();
  } catch (err) {
    console.error("Error loading quizzes:", err);
  }
}

async function initQuizzes() {
  await getQuizzes.execute();
  if (getQuizzes.data.value) {
    clearQuizzesStore();
    getQuizzes.data.value.forEach((quiz: Quiz) => updateQuizStore(quiz));
  }
}

const getQuizActionLabel = (quiz: Quiz) =>
  quiz.sessions && quiz.sessions.length > 0
    ? t("quiz.actions.viewSession")
    : t("quiz.actions.createSession");

const handleClickQuiz = async (quiz: Quiz) => {
  if (quiz.sessions && quiz.sessions.length > 0) {
    const session = quiz.sessions[0];
    if (session) changeActiveSession(session);
  } else {
    await createSession.execute(quiz.id);
    init();
  }
};

const deleteQuiz = async (quizId: number) => {
  if (!confirm(t("quiz.deleteConfirm"))) return;
  await deleteQuizFetcher.execute(quizId.toString());
  if (deleteQuizFetcher.error.value) {
    alert(t("quiz.deleteError"));
    return;
  }
  init();
  alert(t("quiz.deleteSuccess"));
};
</script>

<template>
  <div class="card grid">
    <div class="section-title">{{ t("quiz.listTitle") }}</div>
    <button class="secondary" :disabled="isLoading" @click="init">
      {{ t("quiz.refresh") }}
    </button>
    <div class="list">
      <p v-if="!getQuizzes.data.value?.length" class="muted">{{ t("quiz.noQuizzes") }}</p>
      <div v-for="quiz in getQuizzes.data.value" :key="quiz.id" class="list-item">
        <div>
          <strong>{{ quiz.title }}</strong>
          <div class="section-title">{{ t(`quiz.status.${quiz.status}`) }}</div>
        </div>
        <div class="row">
          <button @click="handleClickQuiz(quiz)">{{ getQuizActionLabel(quiz) }}</button>
          <button class="secondary" @click="emits('edit:quiz', quiz.id)">{{ t("quiz.actions.edit") }}</button>
          <button class="secondary" @click="deleteQuiz(quiz.id)">{{ t("quiz.actions.delete") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.muted {
  color: #7a6a56;
  font-style: italic;
  margin: 0;
}
</style>

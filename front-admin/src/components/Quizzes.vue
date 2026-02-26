<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { useAuth } from "../composables/useAuth";
import { useSession } from "../composables/useSession";
import { useSessionFetcher } from "@/composables/fetcher/session/useSessionFetcher";
import { computed } from "vue";

const emits = defineEmits<{
  (e: "edit:quiz", quizId: number): void;
}>();

const { isAuthed } = useAuth();
const { getQuizzes } = useQuizFetcher();

const { changeActiveSession } = useSession();
const { getActiveSessions, createSession } = useSessionFetcher();

const isLoading = computed(
  () => getQuizzes.isLoading.value || getActiveSessions.isLoading.value,
);

if (isAuthed.value) init();

async function init() {
  try {
    await Promise.all([getQuizzes.execute(), getActiveSessions.execute()]);
  } catch (err) {
    console.error("Error loading quizzes or sessions:", err);
  }
}

const getQuizActionLabel = (quizId: number) => {
  if (getActiveSessions.data.value?.some((s) => s.quizId === quizId)) {
    return "View session";
  }
  return "Create session";
};

const handleClickQuiz = async (quizId: number) => {
  if (getActiveSessions.data.value?.some((s) => s.quizId === quizId)) {
    const session = getActiveSessions.data.value.find(
      (s) => s.quizId === quizId,
    );
    if (session) {
      changeActiveSession(session);
    }
  } else {
    await createSession.execute(quizId);
    init(); // Refresh the list of active sessions after creating a new one
  }
};

const editQuiz = (quizId: number) => {
  emits("edit:quiz", quizId);
};
</script>

<template>
  <div class="card grid">
    <div class="section-title">Quizzes</div>
    <button class="secondary" @click="init" :disabled="isLoading">
      Refresh list
    </button>
    <div class="list">
      <div
        v-for="quiz in getQuizzes.data.value"
        :key="quiz.id"
        class="list-item"
      >
        <div>
          <strong>{{ quiz.title }}</strong>
          <div class="section-title">{{ quiz.status }}</div>
        </div>
        <div>
          <button @click="handleClickQuiz(quiz.id)" style="margin-right: 10px">
            {{ getQuizActionLabel(quiz.id) }}
          </button>
          <button @click="editQuiz(quiz.id)" class="secondary">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

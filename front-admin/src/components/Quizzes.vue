<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { useAuth } from "../composables/useAuth";
import { useSession } from "../composables/useSession";
import { useSessionFetcher } from "@/composables/fetcher/session/useSessionFetcher";
import { computed } from "vue";
import { Quiz } from "@/types/Quiz.types";
import { useQuizStore } from "@/stores/quizStore";

const emits = defineEmits<{
  (e: "edit:quiz", quizId: number): void;
}>();

const { isAuthed } = useAuth();
const { getQuizzes } = useQuizFetcher();
const { set: updateQuizStore, clear: clearQuizzesStore } = useQuizStore();

const { changeActiveSession } = useSession();
const { createSession } = useSessionFetcher();

const isLoading = computed(() => getQuizzes.isLoading.value);

if (isAuthed.value) init();

async function init() {
  try {
    await Promise.all([initQuizzes()]);
  } catch (err) {
    console.error("Error loading quizzes or sessions:", err);
  }
}

async function initQuizzes() {
  await getQuizzes.execute();
  if (getQuizzes.data.value) {
    clearQuizzesStore(); // Clear the quiz store before setting new data
    getQuizzes.data.value.forEach((quiz) => {
      updateQuizStore(quiz);
    });
  }
}

const getQuizActionLabel = (quiz: Quiz) => {
  if (quiz.sessions && quiz.sessions.length > 0) {
    return "View session";
  }
  return "Create session";
};

const handleClickQuiz = async (quiz: Quiz) => {
  if (quiz.sessions && quiz.sessions.length > 0) {
    const session = quiz.sessions[0]; // Using the most recent session if multiple exist
    if (session) {
      changeActiveSession(session);
    }
  } else {
    await createSession.execute(quiz.id);
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
          <button @click="handleClickQuiz(quiz)" style="margin-right: 10px">
            {{ getQuizActionLabel(quiz) }}
          </button>
          <button @click="editQuiz(quiz.id)" class="secondary">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

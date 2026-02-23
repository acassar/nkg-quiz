<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import { useQuiz } from "../composables/useQuiz";
import { useSession } from "../composables/useSession";

const emits = defineEmits<{
  (e: "edit:quiz", quizId: number): void;
}>();

const { isAuthed } = useAuth();
const { loadQuizzes, quizzes, loading } = useQuiz();
const {
  createSession,
  getActiveSessions,
  changeActiveSession,
  activeSessions,
} = useSession();

if (isAuthed.value) init();

async function init() {
  try {
    await Promise.all([loadQuizzes(), getActiveSessions()]);
  } catch (err) {
    console.error("Error loading quizzes or sessions:", err);
  }
}

const getQuizActionLabel = (quizId: number) => {
  if (activeSessions.value.some((s) => s.quizId === quizId)) {
    return "View session";
  }
  return "Create session";
};

const handleClickQuiz = async (quizId: number) => {
  if (activeSessions.value.some((s) => s.quizId === quizId)) {
    const session = activeSessions.value.find((s) => s.quizId === quizId);
    if (session) {
      changeActiveSession(session);
    }
  } else {
    await createSession(quizId);
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
    <button class="secondary" @click="init" :disabled="loading">
      Refresh list
    </button>
    <div class="list">
      <div v-for="quiz in quizzes" :key="quiz.id" class="list-item">
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

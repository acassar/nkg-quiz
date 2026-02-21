<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";
import { useQuiz } from "../composables/useQuiz";
import { useSession } from "../composables/useSession";
import { Session } from "../types/Session.types";

const { isAuthed } = useAuth();
const { loadQuizzes, quizzes, loading } = useQuiz();
const { createSession, getActiveSessions, changeActiveSession } = useSession();

const activeSessions = ref<Session[]>([]);

if (isAuthed.value) init();

async function init() {
  try {
    const [, sessions] = await Promise.all([
      loadQuizzes(),
      getActiveSessions(),
    ]);
    activeSessions.value = sessions;
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
        <button @click="handleClickQuiz(quiz.id)">
          {{ getQuizActionLabel(quiz.id) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

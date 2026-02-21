<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import { useQuiz } from "../composables/useQuiz";
import { useSession } from "../composables/useSession";

const { isAuthed } = useAuth();
const { loadQuizzes, quizzes, loading } = useQuiz();
const { createSession } = useSession();

if (isAuthed.value) loadQuizzes();
</script>

<template>
  <div class="card">
    <div class="section-title">Quizzes</div>
    <button class="secondary" @click="loadQuizzes" :disabled="loading">
      Refresh list
    </button>
    <div class="list">
      <div v-for="quiz in quizzes" :key="quiz.id" class="list-item">
        <div>
          <strong>{{ quiz.title }}</strong>
          <div class="section-title">{{ quiz.status }}</div>
        </div>
        <button @click="createSession(quiz.id)">Create session</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

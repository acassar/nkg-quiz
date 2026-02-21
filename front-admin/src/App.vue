<script setup lang="ts">
import Login from "./components/Login.vue";
import HeaderBar from "./components/HeaderBar.vue";
import { useAuth } from "./composables/useAuth";
import Quizzes from "./components/Quizzes.vue";
import QuizForm from "./components/QuizForm.vue";
import Session from "./components/Session.vue";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

const { isAuthed } = useAuth();
</script>

<template>
  <div class="shell">
    <Login />

    <HeaderBar />

    <section v-if="isAuthed" class="columns">
      <div class="grid">
        <Quizzes></Quizzes>
        <QuizForm></QuizForm>
      </div>
      <Session></Session>
    </section>
  </div>
</template>

<script setup lang="ts">
import Quizzes from "../components/Quizzes.vue";
import QuizForm from "../components/QuizCreateForm.vue";
import Session from "../components/Session.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const openQuizEdit = (quizId: number) => {
  router.push({ name: "EditQuiz", params: { id: quizId } });
};
</script>

<template>
  <div class="columns">
    <section>
      <div class="grid">
        <Quizzes @edit:quiz="openQuizEdit" />
        <QuizForm @created:quiz="openQuizEdit" />
      </div>
    </section>
    <section>
      <Session />
    </section>
  </div>
</template>

<style scoped></style>

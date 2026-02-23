<script setup lang="ts">
import Quizzes from "../components/Quizzes.vue";
import QuizForm from "../components/QuizCreateForm.vue";
import Session from "../components/Session.vue";
import { PageHandlerEmits } from "../components/pageHandler/PageHandler.vue";

const emits = defineEmits<PageHandlerEmits>();
</script>

<template>
  <div class="columns">
    <section>
      <div class="grid">
        <Quizzes @edit:quiz="emits('open:quizEdit', $event)" />
        <QuizForm @created:quiz="emits('open:quizEdit', $event)" />
      </div>
    </section>
    <section>
      <Session />
    </section>
  </div>
</template>

<style scoped></style>

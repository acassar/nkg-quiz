<script setup lang="ts">
import { Question } from "@nkg-quiz/shared-fetcher";

const props = defineProps<{
  currentQuestion: Question | undefined;
  answersCount: number;
}>();
</script>

<template>
  <section v-if="currentQuestion" class="question-card">
    <h1 class="question-title">{{ currentQuestion.prompt }}</h1>
    <div class="meta-row">
      <span>Answers: {{ answersCount }}</span>
      <span v-if="currentQuestion.timeLimitSec">
        Timer: {{ currentQuestion.timeLimitSec }}s
      </span>
      <span v-if="currentQuestion.points"
        >Points: {{ currentQuestion.points }}</span
      >
    </div>
    <div class="choices">
      <div
        v-for="choice in currentQuestion.choices"
        :key="choice.id"
        class="choice"
      >
        {{ choice.text }}
      </div>
    </div>
  </section>
</template>

<style scoped></style>

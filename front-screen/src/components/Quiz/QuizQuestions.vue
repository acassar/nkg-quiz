<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { Question } from "@nkg-quiz/shared-types";

const { t } = useI18n();

const props = defineProps<{
  currentQuestion: Question | undefined;
  answersCount: number;
}>();
</script>

<template>
  <section v-if="currentQuestion" class="question-card">
    <h1 class="question-title">{{ currentQuestion.prompt }}</h1>
    <div class="meta-row">
      <span>{{ t("screen.quiz.answers", { count: answersCount }) }}</span>
      <span v-if="currentQuestion.timeLimitSec">
        {{ t("screen.quiz.timer", { sec: currentQuestion.timeLimitSec }) }}
      </span>
      <span v-if="currentQuestion.points">
        {{ t("screen.quiz.points", { count: currentQuestion.points }) }}
      </span>
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

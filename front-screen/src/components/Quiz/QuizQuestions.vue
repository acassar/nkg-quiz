<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { Question } from "@nkg-quiz/shared-types";

const { t } = useI18n();

const props = defineProps<{
  currentQuestion: Question | undefined;
  answersCount: number;
  categoryName: string | null;
}>();
</script>

<template>
  <section v-if="currentQuestion" class="question-card">
    <span v-if="categoryName" class="category-badge">{{ categoryName }}</span>
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

<style scoped>
.question-card {
  display: grid;
  gap: 1rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  background: var(--bg-badge);
  color: var(--text-inverse);
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  align-self: start;
  justify-self: start;
}
</style>

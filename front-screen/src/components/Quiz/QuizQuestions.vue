<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Question } from "@nkg-quiz/shared-types";

const { t } = useI18n();

const props = defineProps<{
  currentQuestion: Question | undefined;
  answersCount: number;
  categoryName: string | null;
  currentQuestionIndex: number;
  totalQuestions: number;
}>();

const progressPct = computed(() =>
  props.totalQuestions ? Math.round(((props.currentQuestionIndex + 1) / props.totalQuestions) * 100) : 0,
);
</script>

<template>
  <section v-if="currentQuestion" class="question-card">
    <div class="quiz-progress">
      <div class="quiz-progress-track">
        <div class="quiz-progress-fill" :style="{ width: `${progressPct}%` }" />
      </div>
      <span class="quiz-progress-label">
        {{ t("screen.quiz.progress", { current: currentQuestionIndex + 1, total: totalQuestions }) }}
      </span>
    </div>
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

.quiz-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quiz-progress-track {
  flex: 1;
  height: 6px;
  background: var(--bg-category-badge, rgba(255,255,255,0.15));
  border-radius: 999px;
  overflow: hidden;
}

.quiz-progress-fill {
  height: 100%;
  background: var(--text-category-badge, #fff);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.quiz-progress-label {
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  font-weight: 600;
  opacity: 0.7;
  white-space: nowrap;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  background: var(--bg-category-badge);
  color: var(--text-category-badge);
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  align-self: start;
  justify-self: start;
}
</style>

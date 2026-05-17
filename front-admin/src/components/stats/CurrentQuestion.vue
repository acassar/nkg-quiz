<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { LiveStats } from "@nkg-quiz/shared-types";

const props = defineProps<{ stats: LiveStats | null }>();

const { t } = useI18n();

type QuestionWithMeta = NonNullable<LiveStats["currentQuestion"]> & {
  category?: string;
  answersCount?: number;
};

const question = computed(() => props.stats?.currentQuestion as QuestionWithMeta | null);
const index = computed(() => props.stats?.currentQuestionIndex);
const totalQuestions = computed(() => props.stats?.totalQuestions ?? 0);
const quizProgressPct = computed(() =>
  totalQuestions.value && index.value != null
    ? Math.round(((index.value + 1) / totalQuestions.value) * 100)
    : 0,
);
const totalPlayers = computed(() => props.stats?.totalPlayers ?? 0);
const answeredCount = computed(() => question.value?.answersCount ?? 0);
const progressPct = computed(() =>
  totalPlayers.value ? Math.round((answeredCount.value / totalPlayers.value) * 100) : 0,
);
</script>

<template>
  <div class="card current-question">
    <div class="section-title">{{ t("stats.currentQuestion.sectionTitle") }}</div>

    <div v-if="question" class="q-body">
      <div class="q-meta">
        <span v-if="index !== null && index !== undefined" class="q-index">#{{ index + 1 }}</span>
        <span v-if="question.category" class="q-tag">{{ question.category }}</span>
        <span v-if="question.points" class="q-tag q-tag--dark">{{ question.points }} pts</span>
      </div>

      <p class="q-prompt">{{ question.prompt }}</p>

      <div class="quiz-progress-track">
        <div class="quiz-progress-fill" :style="{ width: `${quizProgressPct}%` }" />
      </div>
      <div class="progress-label">
        {{ t("stats.currentQuestion.progress", { current: (index ?? 0) + 1, total: totalQuestions }) }}
      </div>

      <div class="progress-track">
        <div class="progress-fill" :style="{ width: `${progressPct}%` }" />
      </div>
      <div class="progress-label">
        {{ t("stats.currentQuestion.answered", { count: answeredCount, total: totalPlayers }) }}
        <span class="progress-pct">({{ progressPct }}%)</span>
      </div>
    </div>

    <p v-else class="muted">{{ t("stats.currentQuestion.none") }}</p>
  </div>
</template>

<style scoped>
.current-question {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.q-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.q-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.q-index {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.95rem;
}

.q-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-section-title);
}

.q-tag--dark {
  background: var(--bg-tag-dark);
  color: var(--text-inverse);
  font-weight: 600;
}

.q-prompt {
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
}

.quiz-progress-track {
  height: 6px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.quiz-progress-fill {
  height: 100%;
  background: var(--color-primary, #4f46e5);
  border-radius: var(--radius-sm);
  transition: width 0.4s ease;
}

.progress-track {
  height: 8px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--text);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.progress-pct {
  opacity: 0.7;
}

.muted {
  font-style: italic;
  color: var(--text-muted);
  margin: 0;
}
</style>

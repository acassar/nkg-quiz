<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { LiveStats } from "@/types/session/session.types";

const props = defineProps<{ stats: LiveStats | null }>();

const { t } = useI18n();

type QuestionWithMeta = NonNullable<LiveStats["currentQuestion"]> & {
  category?: string;
  answersCount?: number;
};

const question = computed(() => props.stats?.currentQuestion as QuestionWithMeta | null);
const index = computed(() => props.stats?.currentQuestionIndex);
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
  font-family: "Space Mono", monospace;
  font-weight: 700;
  font-size: 0.95rem;
}

.q-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  background: #f0ebe3;
  color: #5b4a37;
}

.q-tag--dark {
  background: #101010;
  color: #f9f1e6;
  font-weight: 600;
}

.q-prompt {
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
}

.progress-track {
  height: 8px;
  background: #f0ebe3;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #101010;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 0.82rem;
  color: #7a6a56;
}

.progress-pct {
  opacity: 0.7;
}

.muted {
  font-style: italic;
  color: #7a6a56;
  margin: 0;
}
</style>

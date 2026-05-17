<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { QuizOptions } from "@/types/quiz/quiz.types";

const props = defineProps<{ modelValue: QuizOptions; disabled?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [QuizOptions] }>();

const { t } = useI18n();

function update(key: keyof QuizOptions, value: boolean) {
  const next = { ...props.modelValue, [key]: value };
  if (key === "showLeaderboard" && !value) {
    next.showScores = false;
    next.showFullRanking = false;
  }
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="field">
    <label>{{ t("quiz.create.autoRestartLabel") }}</label>
    <input
      type="checkbox"
      :checked="modelValue.autoRestart"
      :disabled="disabled"
      @change="update('autoRestart', ($event.target as HTMLInputElement).checked)"
    />
  </div>

  <div class="field">
    <label>{{ t("quiz.create.revealAnswersLabel") }}</label>
    <input
      type="checkbox"
      :checked="modelValue.revealAnswers"
      :disabled="disabled"
      @change="update('revealAnswers', ($event.target as HTMLInputElement).checked)"
    />
  </div>

  <div class="field">
    <label>{{ t("quiz.create.showLeaderboardLabel") }}</label>
    <input
      type="checkbox"
      :checked="modelValue.showLeaderboard"
      :disabled="disabled"
      @change="update('showLeaderboard', ($event.target as HTMLInputElement).checked)"
    />
  </div>

  <div class="field" :class="{ disabled: !modelValue.showLeaderboard }">
    <label>{{ t("quiz.create.showScoresLabel") }}</label>
    <input
      type="checkbox"
      :checked="modelValue.showScores"
      :disabled="disabled || !modelValue.showLeaderboard"
      @change="update('showScores', ($event.target as HTMLInputElement).checked)"
    />
  </div>

  <div class="field" :class="{ disabled: !modelValue.showLeaderboard }">
    <label>{{ t("quiz.create.showFullRankingLabel") }}</label>
    <input
      type="checkbox"
      :checked="modelValue.showFullRanking"
      :disabled="disabled || !modelValue.showLeaderboard"
      @change="update('showFullRanking', ($event.target as HTMLInputElement).checked)"
    />
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: 1fr auto;
  border-bottom: 1px solid gray;
}

.field.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.field.disabled label {
  cursor: not-allowed;
}
</style>


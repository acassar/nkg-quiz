<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ canRemove: boolean }>();
defineEmits<{ remove: [] }>();

const { t } = useI18n();
const text = defineModel<string>("text", { default: "" });
const isCorrect = defineModel<boolean>("isCorrect", { default: false });
</script>

<template>
  <div class="choice-row" :class="{ 'choice-correct': isCorrect }">
    <input
      v-model.trim="text"
      :placeholder="t('question.choice.placeholder')"
      class="choice-input"
    />
    <label class="checkbox correct-label">
      <input v-model="isCorrect" type="checkbox" />
      {{ t("question.choice.correct") }}
    </label>
    <button
      class="secondary btn-remove"
      type="button"
      :disabled="!canRemove"
      @click="$emit('remove')"
    >
      {{ t("question.choice.remove") }}
    </button>
  </div>
</template>

<style scoped>
.choice-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--ds-border-subtle);
  background: var(--bg-input);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.choice-row:focus-within {
  border-color: var(--ds-primary-light);
  box-shadow: 0 0 0 3px var(--ds-primary-lighter);
}

.choice-row.choice-correct {
  border-color: var(--ds-success);
  background: var(--ds-success-bg);
}

.choice-row.choice-correct:focus-within {
  box-shadow: 0 0 0 3px rgba(26, 127, 55, 0.14);
}

.choice-input {
  flex: 1;
  width: auto;
  border: none;
  background: transparent;
  padding: 0.25rem 0;
  outline: none;
  box-shadow: none;
  font-size: 0.95rem;
}

.correct-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.choice-correct .correct-label {
  color: var(--ds-success);
  font-weight: 700;
}

.btn-remove {
  flex-shrink: 0;
  padding: 0.25rem 0.6rem;
  font-size: 0.78rem;
  line-height: 1.3;
  border-radius: var(--radius-sm);
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { QuestionInput } from "@nkg-quiz/shared-types";
import ChoiceRow from "./ChoiceRow.vue";

const emits = defineEmits<{
  (e: "submit", payload: QuestionInput): void;
  (e: "form-changed"): void;
  (e: "cancel"): void;
}>();

const props = defineProps<{ question?: QuestionInput }>();

const { t } = useI18n();
const form = ref<QuestionInput>(getFormInitData());
const error = ref("");
const isHydrating = ref(false);

const isNew = computed(() => !form.value.id);
const hasMinChoices = computed(() => form.value.choices.length >= 2);
const hasCorrectChoice = computed(() => form.value.choices.some((c) => c.isCorrect));
const hasAllChoiceText = computed(() => form.value.choices.every((c) => c.text.trim().length > 0));
const canSubmit = computed(
  () => form.value.prompt.trim().length > 0 && hasMinChoices.value && hasCorrectChoice.value && hasAllChoiceText.value,
);

function getFormInitData(): QuestionInput {
  return {
    id: props.question?.id,
    prompt: props.question?.prompt ?? "",
    timeLimitSec: props.question?.timeLimitSec ?? null,
    points: props.question?.points ?? null,
    categoryId: props.question?.categoryId ?? 0,
    choices: props.question?.choices ?? [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
}

const addChoice = () => form.value.choices.push({ text: "", isCorrect: false });

const removeChoice = (index: number) => {
  if (form.value.choices.length <= 2) return;
  form.value.choices.splice(index, 1);
};

const normalizeNumber = (value: number | null) => (Number.isNaN(value) ? null : value);

const submit = () => {
  error.value = "";
  if (!canSubmit.value) {
    if (!form.value.prompt.trim()) { error.value = t("question.form.errorPrompt"); return; }
    if (!hasAllChoiceText.value) { error.value = t("question.form.errorChoiceText"); return; }
    if (!hasCorrectChoice.value) { error.value = t("question.form.errorCorrectChoice"); return; }
    error.value = t("question.form.errorMinChoices");
    return;
  }
  emits("submit", {
    id: form.value.id,
    prompt: form.value.prompt.trim(),
    timeLimitSec: normalizeNumber(form.value.timeLimitSec),
    points: normalizeNumber(form.value.points),
    categoryId: form.value.categoryId,
    choices: form.value.choices.map((c) => ({ id: c.id, text: c.text.trim(), isCorrect: c.isCorrect })),
  });
};

watch(
  () => props.question,
  () => {
    isHydrating.value = true;
    form.value = getFormInitData();
    setTimeout(() => { isHydrating.value = false; }, 50);
  },
);

watch(form, () => { if (!isHydrating.value) emits("form-changed"); }, { deep: true });
</script>

<template>
  <div class="grid question-form">
    <!-- Form title -->
    <div class="form-title">
      {{ isNew ? t("question.form.titleNew") : t("question.form.titleEdit") }}
    </div>

    <!-- Validation error -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Question fields -->
    <div class="form-panel grid">
      <div class="field">
        <label class="field-label">{{ t("question.form.promptLabel") }}</label>
        <textarea v-model.trim="form.prompt" :placeholder="t('question.form.promptPlaceholder')" />
      </div>

      <div class="row">
        <div class="field">
          <label class="field-label">{{ t("question.form.timeLimitLabel") }}</label>
          <input v-model.number="form.timeLimitSec" type="number" min="1" />
        </div>
        <div class="field">
          <label class="field-label">{{ t("question.form.pointsLabel") }}</label>
          <input v-model.number="form.points" type="number" min="0" />
        </div>
      </div>
    </div>

    <!-- Choices panel -->
    <div class="choices-panel">
      <div class="section-title">{{ t("question.form.choicesTitle") }}</div>
      <div class="list">
        <ChoiceRow
          v-for="(choice, index) in form.choices"
          :key="index"
          v-model:text="choice.text"
          v-model:is-correct="choice.isCorrect"
          :can-remove="form.choices.length > 2"
          @remove="removeChoice(index)"
        />
      </div>
      <button class="secondary btn-add-choice" type="button" @click="addChoice">
        {{ t("question.form.addChoice") }}
      </button>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button class="secondary" type="button" @click="emits('cancel')">
        {{ t("question.form.cancel") }}
      </button>
      <button type="button" :disabled="!canSubmit" @click="submit">
        {{ t("question.form.save") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.question-form {
  gap: 1rem;
}

.form-title {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-section-title);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--ds-primary-lighter);
}

.form-panel {
  background: var(--bg-subtle, var(--ds-secondary-light));
  border-radius: var(--radius-md);
  padding: 1rem;
  gap: 0.8rem;
}

.field-label {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}

.choices-panel {
  display: grid;
  gap: 0.6rem;
  background: var(--ds-surface-raised);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.btn-add-choice {
  justify-self: start;
  font-size: 0.83rem;
  padding: 0.4rem 0.85rem;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}
</style>

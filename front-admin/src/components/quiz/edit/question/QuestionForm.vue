<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { QuestionInput } from "@/types/question/question.types";

const emits = defineEmits<{
  (e: "submit", payload: QuestionInput): void;
  (e: "form-changed"): void;
  (e: "cancel"): void;
}>();

const props = defineProps<{
  question?: QuestionInput;
}>();

const form = ref<QuestionInput>(getFormInitData());

const error = ref("");
const isHydrating = ref(false);

const hasMinChoices = computed(() => form.value.choices.length >= 2);
const hasCorrectChoice = computed(() =>
  form.value.choices.some((choice) => choice.isCorrect),
);
const hasAllChoiceText = computed(() =>
  form.value.choices.every((choice) => choice.text.trim().length > 0),
);
const canSubmit = computed(
  () =>
    form.value.prompt.trim().length > 0 &&
    hasMinChoices.value &&
    hasCorrectChoice.value &&
    hasAllChoiceText.value,
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

const addChoice = () => {
  form.value.choices.push({ text: "", isCorrect: false });
};

const removeChoice = (index: number) => {
  if (form.value.choices.length <= 2) {
    return;
  }
  form.value.choices.splice(index, 1);
};

const normalizeNumber = (value: number | null) => {
  return Number.isNaN(value) ? null : value;
};

const submit = () => {
  error.value = "";

  if (!canSubmit.value) {
    if (!form.value.prompt.trim()) {
      error.value = "Question prompt is required.";
      return;
    }
    if (!hasAllChoiceText.value) {
      error.value = "All choices must have text.";
      return;
    }
    if (!hasCorrectChoice.value) {
      error.value = "Select at least one correct choice.";
      return;
    }
    error.value = "Please add at least two choices.";
    return;
  }

  const payload: QuestionInput = {
    id: form.value.id,
    prompt: form.value.prompt.trim(),
    timeLimitSec: normalizeNumber(form.value.timeLimitSec),
    points: normalizeNumber(form.value.points),
    categoryId: form.value.categoryId,
    choices: form.value.choices.map((choice) => ({
      id: choice.id,
      text: choice.text.trim(),
      isCorrect: choice.isCorrect,
    })),
  };

  emits("submit", payload);
};

watch(
  () => props.question,
  () => {
    isHydrating.value = true;
    // Reset form when question prop changes (e.g. when selecting another question)
    form.value = getFormInitData();
    setTimeout(() => {
      // Set a small timeout to ensure that form is updated before marking hydration as complete. This prevents triggering form-changed event on initial load or when switching questions.
      isHydrating.value = false;
    }, 50);
  },
);

watch(
  form,
  () => {
    if (isHydrating.value) return;
    emits("form-changed");
  },
  { deep: true },
);
</script>

<template>
  <div class="card grid">
    <div class="section-title">New question</div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <label>Prompt</label>
    <textarea v-model.trim="form.prompt" placeholder="Question prompt" />

    <div class="row">
      <div class="field">
        <label>Time limit (sec)</label>
        <input v-model.number="form.timeLimitSec" type="number" min="1" />
      </div>
      <div class="field">
        <label>Points</label>
        <input v-model.number="form.points" type="number" min="0" />
      </div>
    </div>

    <div class="section-title">Choices</div>
    <div class="list">
      <div v-for="(choice, index) in form.choices" :key="index" class="row">
        <input
          v-model.trim="choice.text"
          placeholder="Choice text"
          style="flex: 1"
        />
        <label class="row checkbox">
          <input v-model="choice.isCorrect" type="checkbox" />
          Correct
        </label>
        <button
          class="secondary"
          type="button"
          @click="removeChoice(index)"
          :disabled="form.choices.length <= 2"
        >
          Remove
        </button>
      </div>
    </div>

    <div class="row">
      <button class="secondary" type="button" @click="addChoice">
        Add choice
      </button>
      <button type="button" @click="submit" :disabled="!canSubmit">
        Save question
      </button>
      <button class="secondary" type="button" @click="emits('cancel')">
        Cancel
      </button>
    </div>
  </div>
</template>

<style scoped></style>

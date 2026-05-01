<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { QuestionInput } from "@/types/question/question.types";
import ChoiceRow from "./ChoiceRow.vue";

const emits = defineEmits<{
  (e: "submit", payload: QuestionInput): void;
  (e: "form-changed"): void;
  (e: "cancel"): void;
}>();

const props = defineProps<{ question?: QuestionInput }>();

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
    if (!form.value.prompt.trim()) { error.value = "Le prompt est requis."; return; }
    if (!hasAllChoiceText.value) { error.value = "Toutes les réponses doivent avoir du texte."; return; }
    if (!hasCorrectChoice.value) { error.value = "Au moins une réponse correcte requise."; return; }
    error.value = "Au moins deux réponses requises.";
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
  <div class="card grid">
    <div class="section-title">{{ isNew ? "Nouvelle question" : "Modifier la question" }}</div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="field">
      <label>Prompt</label>
      <textarea v-model.trim="form.prompt" placeholder="Énoncé de la question" />
    </div>

    <div class="row">
      <div class="field">
        <label>Limite de temps (sec)</label>
        <input v-model.number="form.timeLimitSec" type="number" min="1" />
      </div>
      <div class="field">
        <label>Points</label>
        <input v-model.number="form.points" type="number" min="0" />
      </div>
    </div>

    <div class="section-title">Réponses</div>
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

    <div class="row">
      <button class="secondary" type="button" @click="addChoice">+ Ajouter une réponse</button>
      <button type="button" :disabled="!canSubmit" @click="submit">Sauvegarder</button>
      <button class="secondary" type="button" @click="emits('cancel')">Annuler</button>
    </div>
  </div>
</template>

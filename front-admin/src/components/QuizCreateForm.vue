<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";
import type { QuizOptions } from "@nkg-quiz/shared-types";
import OptionsForm from "./OptionsForm.vue";
import ImportOptionsModal from "./ImportOptionsModal.vue";

const emits = defineEmits<{ (e: "created:quiz", quizId: number): void }>();

const { t } = useI18n();
const { createQuiz: createQuizFetcher, importQuiz: importQuizFetcher } = useQuizFetcher();

const title = ref("");
const status = ref<"DRAFT" | "PUBLISHED">("DRAFT");
const options = ref<QuizOptions>({
  autoRestart: false,
  revealAnswers: false,
  showLeaderboard: true,
  showScores: true,
  showFullRanking: true,
});
const error = ref("");

const isLoading = computed(() => createQuizFetcher.isLoading.value || importQuizFetcher.isLoading.value);
const importError = ref("");
const pendingImport = ref<{ title: string; categories: unknown[] } | null>(null);
let pendingImportEvent: HTMLInputElement | null = null;

const handleImport = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  importError.value = "";
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    pendingImport.value = payload;
    pendingImportEvent = input;
  } catch {
    importError.value = t("quiz.import.parseError");
    input.value = "";
  }
};

const handleImportConfirm = async (options: QuizOptions) => {
  if (!pendingImport.value) return;
  const newQuiz = await importQuizFetcher.execute({ ...pendingImport.value, options });
  pendingImport.value = null;
  if (pendingImportEvent) { pendingImportEvent.value = ""; pendingImportEvent = null; }
  if (newQuiz?.id) emits("created:quiz", newQuiz.id);
  else importError.value = t("quiz.import.error");
};

const handleImportCancel = () => {
  pendingImport.value = null;
  if (pendingImportEvent) { pendingImportEvent.value = ""; pendingImportEvent = null; }
};

const createQuiz = async () => {
  if (!title.value.trim()) {
    error.value = t("quiz.create.titleRequired");
    return;
  }
  const newQuiz = await createQuizFetcher.execute({
    title: title.value,
    status: status.value,
    options: options.value,
  });
  if (newQuiz?.id) emits("created:quiz", newQuiz.id);
};
</script>

<template>
  <div class="card">
    <div class="section-title">{{ t("quiz.create.sectionTitle") }}</div>

    <form class="grid" @submit.prevent="createQuiz">
      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="field">
        <label>{{ t("quiz.create.titleLabel") }}</label>
        <input
          v-model.trim="title"
          :placeholder="t('quiz.create.titlePlaceholder')"
          :disabled="isLoading"
          @input="error = ''"
        />
      </div>

      <div class="field">
        <label>{{ t("quiz.create.statusLabel") }}</label>
        <select v-model="status" :disabled="isLoading">
          <option value="DRAFT">{{ t("quiz.status.DRAFT") }}</option>
          <option value="PUBLISHED">{{ t("quiz.status.PUBLISHED") }}</option>
        </select>
      </div>

      <OptionsForm v-model="options" :disabled="isLoading" />

      <div class="row">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? t("quiz.create.submitting") : t("quiz.create.submit") }}
        </button>
        <label class="import-label" :class="{ disabled: isLoading }">
          {{ t("quiz.import.button") }}
          <input type="file" accept=".json" :disabled="isLoading" @change="handleImport" />
        </label>
      </div>
      <p v-if="importError" class="error-message">{{ importError }}</p>
    </form>
  </div>

  <ImportOptionsModal
    v-if="pendingImport"
    :title="pendingImport.title"
    @confirm="handleImportConfirm"
    @cancel="handleImportCancel"
  />
</template>

<style scoped>
.import-label {
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  background: var(--bg-btn-secondary);
  color: var(--text-btn-secondary);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-size: inherit;
  font-family: inherit;
}

.import-label:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-btn-hover);
}

.import-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.import-label input[type="file"] {
  display: none;
}
</style>

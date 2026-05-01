<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";

const emits = defineEmits<{ (e: "created:quiz", quizId: number): void }>();

const { t } = useI18n();
const { createQuiz: createQuizFetcher } = useQuizFetcher();

const title = ref("");
const status = ref<"DRAFT" | "PUBLISHED">("DRAFT");
const autoRestart = ref(false);
const error = ref("");

const isLoading = computed(() => createQuizFetcher.isLoading.value);

const createQuiz = async () => {
  if (!title.value.trim()) {
    error.value = t("quiz.create.titleRequired");
    return;
  }
  const newQuiz = await createQuizFetcher.execute({
    title: title.value,
    status: status.value,
    options: {
      autoRestart: autoRestart.value,
    },
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

      <div class="field">
        <label>{{ t("quiz.create.autoRestartLabel") }}</label>
        <input type="checkbox" v-model="autoRestart" :disabled="isLoading" />
      </div>

      <div class="row">
        <button type="submit" :disabled="isLoading">
          {{
            isLoading ? t("quiz.create.submitting") : t("quiz.create.submit")
          }}
        </button>
      </div>
    </form>
  </div>
</template>

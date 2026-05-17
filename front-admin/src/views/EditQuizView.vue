<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Quiz, QuizOptions } from "../types/quiz/quiz.types";
import { useQuizStore } from "@/stores/quizStore";
import { useRouter } from "vue-router";
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import EditQuiz from "@/components/quiz/edit/EditQuiz.vue";
import OptionsForm from "@/components/OptionsForm.vue";

const router = useRouter();
const quizStore = useQuizStore();
const { updateQuiz } = useQuizFetcher();
const { getQuizzes } = useQuizFetcher();
const { set: updateQuizStore, clear: clearQuizzesStore } = useQuizStore();
const { t } = useI18n();

const props = defineProps<{ quizId: number }>();

const quiz = ref<Quiz>();
const savedTitle = ref("");
const savedStatus = ref<"DRAFT" | "PUBLISHED">("DRAFT");
const options = ref<QuizOptions | null>(null);
const savedOptions = ref<QuizOptions | null>(null);
const formHasUnsavedChanges = ref(false);

onMounted(async () => {
  await reloadQuizzes();
  const cached = quizStore.getById(props.quizId);
  quiz.value = cached;
  if (cached) {
    savedTitle.value = cached.title;
    savedStatus.value = cached.status;
    options.value = cached.options ?? null;
    savedOptions.value = cached.options ? { ...cached.options } : null;
  }
});

const isDirty = computed(() => {
  if (quiz.value?.title !== savedTitle.value) return true;
  if (quiz.value?.status !== savedStatus.value) return true;
  if (!options.value || !savedOptions.value) return false;
  return (Object.keys(options.value) as (keyof QuizOptions)[]).some(
    (k) => options.value![k] !== savedOptions.value![k],
  );
});

async function reloadQuizzes() {
  await getQuizzes.execute();
  if (getQuizzes.data.value) {
    clearQuizzesStore();
    getQuizzes.data.value.forEach((quiz: Quiz) => updateQuizStore(quiz));
  }
}

const save = async () => {
  if (!quiz.value || !isDirty.value) return;
  await updateQuiz.execute(props.quizId.toString(), {
    title: quiz.value.title,
    status: quiz.value.status,
    options: options.value,
  });
  savedTitle.value = quiz.value.title;
  savedStatus.value = quiz.value.status;
  savedOptions.value = options.value ? { ...options.value } : null;
  quizStore.set(quiz.value);
  if (!updateQuiz.error.value) {
    alert(t("quiz.edit.updateSuccess"));
    await reloadQuizzes();
    quiz.value = quizStore.getById(props.quizId);
  }
};

const goHome = () => {
  if (formHasUnsavedChanges.value) {
    if (!confirm(t("session.unsavedConfirm"))) return;
  }
  router.push({ name: "Home" });
};
</script>

<template>
  <div v-if="!quiz">{{ t("quiz.edit.notFound") }}</div>

  <div v-else class="grid">
    <div class="card">
      <div class="quiz-header row">
        <button class="secondary" @click="goHome">
          {{ t("quiz.edit.back") }}
        </button>
        <input
          v-model.trim="quiz.title"
          :placeholder="t('quiz.edit.titlePlaceholder')"
          class="title-input"
        />
        <select v-model="quiz.status" class="status-select">
          <option value="DRAFT">{{ t("quiz.status.DRAFT") }}</option>
          <option value="PUBLISHED">{{ t("quiz.status.PUBLISHED") }}</option>
        </select>

        <OptionsForm v-if="options" v-model="options" />

        <button :disabled="!isDirty" @click="save">
          {{ t("quiz.edit.save") }}
        </button>
      </div>

      <p class="error">
        {{ updateQuiz.error.value ? t("quiz.edit.updateError") : undefined }}
      </p>
    </div>

    <EditQuiz
      :quiz="quiz"
      v-model:has-unsaved-changes="formHasUnsavedChanges"
    />
  </div>
</template>

<style scoped>
.title-input {
  flex: 1;
  width: auto;
}

.status-select {
  width: auto;
}

.error {
  color: red;
}
</style>

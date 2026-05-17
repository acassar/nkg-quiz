<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Quiz, QuizOptions } from "@nkg-quiz/shared-types";
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
    <div class="card quiz-header-card">
      <!-- Title bar -->
      <div class="quiz-meta-bar">
        <button class="secondary btn-back" @click="goHome">
          {{ t("quiz.edit.back") }}
        </button>
        <input
          v-model.trim="quiz.title"
          :placeholder="t('quiz.edit.titlePlaceholder')"
          class="title-input"
        />
        <select
          v-model="quiz.status"
          class="status-select"
          :class="`status--${quiz.status.toLowerCase()}`"
        >
          <option value="DRAFT">{{ t("quiz.status.DRAFT") }}</option>
          <option value="PUBLISHED">{{ t("quiz.status.PUBLISHED") }}</option>
        </select>
        <button :disabled="!isDirty" class="btn-save" @click="save">
          {{ t("quiz.edit.save") }}
        </button>
      </div>

      <!-- Options section -->
      <div v-if="options" class="quiz-options">
        <OptionsForm v-model="options" />
      </div>

      <!-- Error feedback -->
      <div v-if="updateQuiz.error.value" class="update-error">
        {{ t("quiz.edit.updateError") }}
      </div>
    </div>

    <EditQuiz
      :quiz="quiz"
      v-model:has-unsaved-changes="formHasUnsavedChanges"
    />
  </div>
</template>

<style scoped>
.quiz-meta-bar {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-back {
  flex-shrink: 0;
}

.title-input {
  flex: 1;
  min-width: 200px;
  width: auto;
  font-size: 1.05rem;
  font-weight: 600;
}

.status-select {
  width: auto;
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  cursor: pointer;
  border-width: 1.5px;
  transition: background 0.2s ease, color 0.2s ease;
}

.status--draft {
  background: var(--ds-warning-bg);
  border-color: var(--ds-warning);
  color: var(--ds-warning);
}

.status--published {
  background: var(--ds-success-bg);
  border-color: var(--ds-success);
  color: var(--ds-success);
}

.btn-save {
  margin-left: auto;
}

.quiz-options {
  padding-top: 0.9rem;
  margin-top: 0.5rem;
  border-top: 1px solid var(--ds-border-subtle);
}

.update-error {
  margin-top: 0.6rem;
  padding: 0.55rem 0.9rem;
  border-radius: var(--radius-md);
  background: var(--ds-error-bg);
  border: 1px solid var(--ds-error);
  color: var(--ds-error);
  font-size: 0.9rem;
}
</style>

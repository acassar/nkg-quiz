<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Quiz } from "../../types/quiz/quiz.types";
import EditQuiz from "../../components/quiz/edit/EditQuiz.vue";
import { useQuizStore } from "@/stores/quizStore";
import { useRouter } from "vue-router";
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";

const router = useRouter();
const quizStore = useQuizStore();
const { updateQuiz } = useQuizFetcher();
const { t } = useI18n();

const props = defineProps<{ quizId: number }>();

const quiz = ref<Quiz>();
const savedTitle = ref("");
const savedStatus = ref<"DRAFT" | "PUBLISHED">("DRAFT");
const formHasUnsavedChanges = ref(false);

onMounted(() => {
  const cached = quizStore.getById(props.quizId);
  quiz.value = cached;
  if (cached) {
    savedTitle.value = cached.title;
    savedStatus.value = cached.status;
  }
});

const isDirty = computed(
  () => quiz.value?.title !== savedTitle.value || quiz.value?.status !== savedStatus.value,
);

const save = async () => {
  if (!quiz.value || !isDirty.value) return;
  await updateQuiz.execute(props.quizId.toString(), {
    title: quiz.value.title,
    status: quiz.value.status,
  });
  savedTitle.value = quiz.value.title;
  savedStatus.value = quiz.value.status;
  quizStore.set(quiz.value);
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
        <button class="secondary" @click="goHome">{{ t("quiz.edit.back") }}</button>
        <input v-model.trim="quiz.title" :placeholder="t('quiz.edit.titlePlaceholder')" class="title-input" />
        <select v-model="quiz.status" class="status-select">
          <option value="DRAFT">{{ t("quiz.status.DRAFT") }}</option>
          <option value="PUBLISHED">{{ t("quiz.status.PUBLISHED") }}</option>
        </select>
        <button :disabled="!isDirty" @click="save">{{ t("quiz.edit.save") }}</button>
      </div>
    </div>

    <EditQuiz :quiz="quiz" v-model:has-unsaved-changes="formHasUnsavedChanges" />
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
</style>

<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { computed, ref } from "vue";

const emits = defineEmits<{
  (e: "created:quiz", quizId: number): void;
}>();

const { createQuiz: createQuizFetcher } = useQuizFetcher();

const quizForm = ref({
  title: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
});

const error = ref("");

const isLoading = computed(() => createQuizFetcher.isLoading.value);

const createQuiz = async () => {
  if (!quizForm.value.title.trim()) {
    error.value = "Quiz title is required";
    return;
  }

  const newQuiz = await createQuizFetcher.execute({
    title: quizForm.value.title,
    status: quizForm.value.status,
  });

  if (newQuiz?.id) emits("created:quiz", newQuiz.id);
};
</script>

<template>
  <div class="card">
    <div class="section-title">Create New Quiz</div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <input
      v-model.trim="quizForm.title"
      placeholder="Quiz title"
      :disabled="isLoading"
    />

    <label>Status:</label>
    <select v-model="quizForm.status" :disabled="isLoading">
      <option value="DRAFT">Draft</option>
      <option value="PUBLISHED">Published</option>
    </select>

    <div class="row">
      <button :disabled="isLoading" @click="createQuiz">
        {{ isLoading ? "Creating..." : "Create Quiz" }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>

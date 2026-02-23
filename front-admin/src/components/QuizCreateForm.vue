<script setup lang="ts">
import { ref } from "vue";
import { useQuiz } from "../composables/useQuiz";

const emits = defineEmits<{
  (e: "created:quiz", quizId: number): void;
}>();

const { createQuiz: createQuizApi } = useQuiz();

const quizForm = ref({
  title: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
});

const isLoading = ref(false);
const error = ref("");

const createQuiz = async () => {
  if (!quizForm.value.title.trim()) {
    error.value = "Quiz title is required";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const newQuiz = await createQuizApi({
      title: quizForm.value.title,
      status: quizForm.value.status,
    });

    emits("created:quiz", newQuiz.id);
  } catch (err: any) {
    error.value = err.message || "Failed to create quiz";
  } finally {
    isLoading.value = false;
  }
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

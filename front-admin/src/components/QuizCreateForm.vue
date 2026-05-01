<script setup lang="ts">
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";
import { computed, ref } from "vue";

const emits = defineEmits<{
  (e: "created:quiz", quizId: number): void;
}>();

const { createQuiz: createQuizFetcher } = useQuizFetcher();

const title = ref("");
const status = ref<"DRAFT" | "PUBLISHED">("DRAFT");
const error = ref("");

const isLoading = computed(() => createQuizFetcher.isLoading.value);

const createQuiz = async () => {
  if (!title.value.trim()) {
    error.value = "Le titre est requis";
    return;
  }
  const newQuiz = await createQuizFetcher.execute({ title: title.value, status: status.value });
  if (newQuiz?.id) emits("created:quiz", newQuiz.id);
};
</script>

<template>
  <div class="card">
    <div class="section-title">Créer un quiz</div>

    <form class="grid" @submit.prevent="createQuiz">
      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="field">
        <label>Titre</label>
        <input v-model.trim="title" placeholder="Titre du quiz" :disabled="isLoading" @input="error = ''" />
      </div>

      <div class="field">
        <label>Statut</label>
        <select v-model="status" :disabled="isLoading">
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
        </select>
      </div>

      <div class="row">
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "Création…" : "Créer" }}
        </button>
      </div>
    </form>
  </div>
</template>

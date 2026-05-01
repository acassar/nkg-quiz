<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Quiz } from "../../types/quiz/quiz.types";
import EditQuiz from "../../components/quiz/edit/EditQuiz.vue";
import { useQuizStore } from "@/stores/quizStore";
import { useRouter } from "vue-router";
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";

const router = useRouter();
const quizStore = useQuizStore();
const { updateQuiz } = useQuizFetcher();

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
    if (!confirm("Vous avez des modifications non sauvegardées. Quitter quand même ?")) return;
  }
  router.push({ name: "Home" });
};
</script>

<template>
  <div v-if="!quiz">Quiz introuvable</div>

  <div v-else class="grid">
    <div class="card">
      <div class="quiz-header row">
        <button class="secondary" @click="goHome">← Retour</button>
        <input v-model.trim="quiz.title" placeholder="Titre du quiz" class="title-input" />
        <select v-model="quiz.status" class="status-select">
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
        </select>
        <button :disabled="!isDirty" @click="save">Sauvegarder</button>
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

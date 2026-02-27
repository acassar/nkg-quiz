<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Quiz } from "../../types/Quiz.types";
import EditQuiz from "../../components/quiz/edit/EditQuiz.vue";
import { useQuizStore } from "@/stores/quizStore";
import { useRouter } from "vue-router";
import { useQuizFetcher } from "@/composables/fetcher/quiz/useQuizFetcher";

const router = useRouter();
const quizStore = useQuizStore();
const { updateQuiz } = useQuizFetcher();

const props = defineProps<{
  quizId: number;
}>();

const quiz = ref<Quiz>();

const editingTitle = ref(false);
const editingStatus = ref(false);
const formHasUnsavedChanges = ref(false);

onMounted(async () => {
  const cached = quizStore.getById(props.quizId);
  quiz.value = cached;
});

const saveQuiz = async () => {
  if (!quiz.value) return;
  await updateQuiz.execute(props.quizId.toString(), {
    title: quiz.value.title,
    status: quiz.value.status,
  });
  updateQuizInStore(quiz.value);
};

const saveTitle = async () => {
  if (quiz.value) {
    await saveQuiz();
    editingTitle.value = false;
  }
};

const saveStatus = async () => {
  if (quiz.value) {
    await saveQuiz();
    editingStatus.value = false;
  }
};

const updateQuizInStore = (updatedQuiz: Quiz) => {
  quizStore.set(updatedQuiz);
  quiz.value = updatedQuiz;
};

const goHome = () => {
  if (formHasUnsavedChanges.value) {
    if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
  }
  router.push({ name: "Home" });
};
</script>

<template>
  <div class="card">
    <div class="content">
      <!-- Back Button -->
      <button @click="goHome" class="secondary" style="margin-bottom: 1rem">
        ← Back to Quizzes
      </button>

      <div v-if="!quiz">
        <div class="content">Quiz not found</div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="section-title">
          <div class="row">
            <div v-if="editingTitle" class="row">
              <input v-model.trim="quiz.title" />
              <button @click="saveTitle" class="secondary">Save</button>
              <button @click="editingTitle = false" class="secondary">
                Cancel
              </button>
            </div>
            <div v-else class="row">
              <span>{{ quiz.title }}</span>
              <button @click="editingTitle = true" class="secondary">
                Edit
              </button>
            </div>
          </div>
        </div>
        <!-- Status -->
        <div class="row">
          <label>Status:</label>
          <div v-if="editingStatus" class="row">
            <select v-model="quiz.status">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <button @click="saveStatus" class="secondary">Save</button>
            <button @click="editingStatus = false" class="secondary">
              Cancel
            </button>
          </div>
          <div v-else class="row">
            <span>{{ quiz.status }}</span>
            <button @click="editingStatus = true" class="secondary">
              Edit
            </button>
          </div>
        </div>
        <!-- Categories -->
        <EditQuiz
          :quiz="quiz"
          v-model:has-unsaved-changes="formHasUnsavedChanges"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.category-list {
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.content > *:not(:last-child) {
  margin-bottom: 1rem;
}
</style>

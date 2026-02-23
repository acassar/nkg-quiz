<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Quiz } from "../../types/Quiz.types";
import { useQuiz } from "../../composables/useQuiz";
import { PageHandlerEmits } from "../../components/pageHandler/PageHandler.vue";
import EditQuiz from "../../components/quiz/edit/EditQuiz.vue";

const emits = defineEmits<PageHandlerEmits>();

const props = defineProps<{
  quizId: number;
}>();

const { getQuiz, updateQuiz } = useQuiz();

const quiz = ref<Quiz | null>(null);
const loading = ref(true);
const error = ref("");

const editingTitle = ref(false);
const editingStatus = ref(false);
const formHasUnsavedChanges = ref(false);

onMounted(async () => {
  try {
    quiz.value = await getQuiz(props.quizId);
  } catch (err) {
    error.value = "Failed to load quiz";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const saveTitle = async () => {
  if (quiz.value) {
    try {
      await updateQuiz(props.quizId, { title: quiz.value.title });
      editingTitle.value = false;
    } catch (err) {
      error.value = "Failed to save title";
    }
  }
};

const saveStatus = async () => {
  if (quiz.value) {
    try {
      await updateQuiz(props.quizId, { status: quiz.value.status });
      editingStatus.value = false;
    } catch (err) {
      error.value = "Failed to save status";
    }
  }
};

const goHome = () => {
  if (formHasUnsavedChanges.value) {
    if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
  }
  emits("open:home");
};
</script>

<template>
  <div class="card">
    <div v-if="loading" class="section-title">Loading quiz...</div>

    <div v-else-if="error" class="section-title">{{ error }}</div>

    <div v-else-if="quiz" class="content">
      <!-- Back Button -->
      <button @click="goHome" class="secondary" style="margin-bottom: 1rem">
        ← Back to Quizzes
      </button>

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
            <button @click="editingTitle = true" class="secondary">Edit</button>
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
          <button @click="editingStatus = true" class="secondary">Edit</button>
        </div>
      </div>

      <!-- Categories -->
      <EditQuiz
        :quiz="quiz"
        v-model:has-unsaved-changes="formHasUnsavedChanges"
      />
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

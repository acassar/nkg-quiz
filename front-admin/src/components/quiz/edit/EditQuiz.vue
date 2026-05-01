<script setup lang="ts">
import { computed, Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import CategoryCard from "../../category/CategoryCard.vue";
import CategoryQuestions from "./question/CategoryQuestions.vue";
import QuestionForm from "./question/QuestionForm.vue";
import type { Question, QuestionInput } from "@/types/question/question.types";
import type { Category, CategoryInput } from "@/types/category/category.types";
import type { Quiz } from "@/types/quiz/quiz.types";
import { useQuestionFetcher } from "@/composables/fetcher/question/useQuestionFetcher";
import CategoryForm from "./category/CategoryForm.vue";
import { useCategoryFetcher } from "@/composables/fetcher/category/useCategoryFetcher";

const props = defineProps<{ quiz: Quiz }>();

const { t } = useI18n();
const { createQuestion, updateQuestion, deleteQuestion } = useQuestionFetcher();
const { deleteCategory } = useCategoryFetcher();

const selectedCategory = ref<Category>();
const selectedQuestion = ref<QuestionInput>();
const editingCategory = ref<CategoryInput>();
const hasUnsavedChanges = defineModel<boolean>("hasUnsavedChanges");

const categories = computed(() => props.quiz.categories);

const selectOrDeselect = <T,>(current: T | undefined, newValue: T) =>
  current === newValue ? undefined : newValue;

const handleUnsavedChanges = <T,>(
  valueToChange: Ref<T | undefined>,
  newValue: T,
) => {
  const result = window.confirm(t("question.unsavedConfirm"));
  if (result) {
    hasUnsavedChanges.value = false;
    valueToChange.value = selectOrDeselect(valueToChange.value, newValue);
  }
  return result;
};

const onCategoryClick = (category: Category) => {
  if (editingCategory.value) {
    if (!window.confirm(t("category.discardNewConfirm"))) return;
    editingCategory.value = undefined;
  }
  if (!hasUnsavedChanges.value) {
    selectedCategory.value = selectOrDeselect(selectedCategory.value, category);
  } else {
    handleUnsavedChanges(selectedCategory, category);
  }
};

const onQuestionClick = (question: QuestionInput) => {
  if (!hasUnsavedChanges.value) {
    selectedQuestion.value = selectOrDeselect(selectedQuestion.value, question);
  } else {
    handleUnsavedChanges(selectedQuestion, question);
  }
};

const handleClickCreateCategory = () => {
  let result = true;
  if (hasUnsavedChanges.value) {
    result = window.confirm(t("question.unsavedConfirm"));
  }
  if (result) {
    hasUnsavedChanges.value = false;
    selectedQuestion.value = undefined;
    selectedCategory.value = undefined;
    editingCategory.value = { quizId: props.quiz.id, name: "", questions: [] };
  }
};

const handleCategoryDelete = async (category: Category) => {
  if (!window.confirm(t("category.deleteConfirm", { name: category.name })))
    return;
  const deleted = await deleteCategory.execute(category.id.toString());
  if (deleted) {
    const index = props.quiz.categories.findIndex((c) => c.id === category.id);
    if (index !== -1) props.quiz.categories.splice(index, 1);
  }
  if (selectedCategory.value?.id === category.id)
    selectedCategory.value = undefined;
};

const handleQuestionDelete = async (question: QuestionInput) => {
  const category = props.quiz.categories.find(
    (c) => c.id === question.categoryId,
  );
  if (!category) throw new Error("Category not found for question");
  if (!question.id) throw new Error("Question not found");
  if (!window.confirm(t("question.deleteConfirm", { prompt: question.prompt })))
    return;

  const deleted = await deleteQuestion.execute(question.id.toString());
  if (!deleted) throw new Error("Failed to delete question");

  const index = category.questions.findIndex((q) => q.id === question.id);
  if (index === -1) return;
  category.questions.splice(index, 1);
  if (selectedQuestion.value?.id === question.id)
    selectedQuestion.value = undefined;
};

const handleCategoryCreated = (category: Category) => {
  props.quiz.categories.push(category);
  editingCategory.value = undefined;
  selectedCategory.value = category;
};

const onQuestionFormSubmit = async (payload: QuestionInput) => {
  let updatedQuestion: Question | undefined;
  if (payload.id) {
    if (payload.choices.some((choice) => !choice.id))
      throw Error("All choices must have an id for update");
    updatedQuestion = await updateQuestion.execute(
      payload.id.toString(),
      payload,
    );
  } else {
    if (!selectedCategory.value)
      throw new Error("No category selected for new question");
    updatedQuestion = await createQuestion.execute(
      selectedCategory.value.id,
      payload,
    );
  }

  if (!updatedQuestion) throw new Error("Failed to save question");

  const category = props.quiz.categories.find(
    (c) => c.id === updatedQuestion!.categoryId,
  );
  if (!category) throw new Error("Category not found for updated question");
  const index = category.questions.findIndex(
    (q) => q.id === updatedQuestion!.id,
  );
  if (index === -1) {
    category.questions.push(updatedQuestion);
  } else {
    category.questions.splice(index, 1, updatedQuestion);
  }
  hasUnsavedChanges.value = false;
};

const handleAddQuestion = (categoryId: number) => {
  const category = props.quiz.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error("Category not found");
  selectedQuestion.value = {
    id: 0,
    prompt: "",
    timeLimitSec: null,
    points: null,
    categoryId,
    choices: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
};

watch(selectedCategory, () => {
  selectedQuestion.value = undefined;
});
</script>

<template>
  <div class="card grid">
    <h3 class="section-title">{{ t("category.sectionTitle") }}</h3>

    <div v-if="editingCategory">
      <CategoryForm
        :category="editingCategory"
        @created="handleCategoryCreated"
        @cancel="editingCategory = undefined"
      />
    </div>

    <div v-else class="row">
      <span v-if="categories.length === 0" class="muted">{{
        t("category.none")
      }}</span>
      <CategoryCard
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :selected="selectedCategory?.id === category.id"
        @click="onCategoryClick(category)"
        @delete="handleCategoryDelete(category)"
      />
      <button class="secondary" @click="handleClickCreateCategory">
        {{ t("category.add") }}
      </button>
    </div>

    <CategoryQuestions
      v-if="selectedCategory"
      :category="selectedCategory"
      :selected-question="selectedQuestion"
      @click="onQuestionClick"
      @delete="handleQuestionDelete"
      @click:new="() => handleAddQuestion(selectedCategory!.id)"
    />

    <QuestionForm
      v-if="selectedQuestion"
      :question="selectedQuestion"
      @form-changed="hasUnsavedChanges = true"
      @submit="onQuestionFormSubmit"
    />
  </div>
</template>

<style scoped>
.muted {
  color: #7a6a56;
  font-style: italic;
}
</style>

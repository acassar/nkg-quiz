<script setup lang="ts">
import { computed, Ref, ref, watch } from "vue";
import CategoryCard from "../../category/CategoryCard.vue";
import CategoryQuestions from "./question/CategoryQuestions.vue";
import QuestionForm from "./question/QuestionForm.vue";
import { Question, QuestionInput } from "@/types/question/question.types";
import { Category, CategoryInput } from "@/types/category/category.types";
import { Quiz } from "@/types/quiz/quiz.types";
import { useQuestionFetcher } from "@/composables/fetcher/question/useQuestionFetcher";
import CategoryForm from "./category/CategoryForm.vue";
import { useCategoryFetcher } from "@/composables/fetcher/category/useCategoryFetcher";

const props = defineProps<{
  quiz: Quiz;
}>();

const { createQuestion, updateQuestion, deleteQuestion } = useQuestionFetcher();
const { deleteCategory } = useCategoryFetcher();

const selectedCategory = ref<Category>();
const selectedQuestion = ref<QuestionInput>();
const editingCategory = ref<CategoryInput>();
const hasUnsavedChanges = defineModel<boolean>("hasUnsavedChanges"); //Allows to track if form has unsaved changes and prevent category/question switch without confirmation

const categories = computed(() => {
  // const allCategories: (Category | CategoryInput)[] = props.quiz.categories;
  // if (editingCategory.value) allCategories.push(editingCategory.value);
  return props.quiz.categories;
});

const selectOrDeselect = <T,>(current: T | undefined, newValue: T) => {
  if (current === newValue) {
    return undefined;
  }
  return newValue;
};

const handleUnsavedChanges = <T,>(
  valueToChange: Ref<T | undefined>,
  newValue: T,
) => {
  const result = window.confirm(
    "You have unsaved changes. Do you want to discard them and switch?",
  );
  if (result) {
    hasUnsavedChanges.value = false;
    valueToChange.value = selectOrDeselect(valueToChange.value, newValue);
  }
  return result;
};

const onCategoryClick = (category: Category) => {
  if (editingCategory.value) {
    const result = window.confirm(
      "You are currently creating a new category. Do you want to discard it and switch?",
    );
    if (result) {
      editingCategory.value = undefined;
    }
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
  const newCategory: CategoryInput = {
    quizId: props.quiz.id,
    name: "New Category",
    questions: [],
  };

  let result = true;
  if (hasUnsavedChanges.value) {
    result = window.confirm(
      "You have unsaved changes. Do you want to discard them and create a new category?",
    );
  }

  if (result) {
    hasUnsavedChanges.value = false;
    selectedQuestion.value = undefined;
    selectedCategory.value = undefined;
    editingCategory.value = newCategory;
  }
};

const handleCategoryDelete = async (category: Category) => {
  const result = window.confirm(
    `Are you sure you want to delete category "${category.name}"? This will also delete all its questions.`,
  );
  if (result) {
    const deleted = await deleteCategory.execute(category.id.toString());
    if (deleted) {
      const index = props.quiz.categories.findIndex(
        (c) => c.id === category.id,
      );
      if (index !== -1) {
        props.quiz.categories.splice(index, 1);
      }
    }
    if (selectedCategory.value?.id === category.id) {
      selectedCategory.value = undefined;
    }
  }
};

const handleQuestionDelete = async (question: QuestionInput) => {
  const category = props.quiz.categories.find(
    (c) => c.id === question.categoryId,
  );
  if (!category) throw new Error("Category not found for question");
  if (!question.id) throw new Error("Question not found");

  const result = window.confirm(
    `Are you sure you want to delete question "${question.prompt}"?`,
  );
  if (!result) return;

  const deleted = await deleteQuestion.execute(question.id.toString());
  if (!deleted) throw new Error("Failed to delete question");

  const index = category.questions.findIndex((q) => q.id === question.id);
  if (index === -1) return;
  category.questions.splice(index, 1);
  if (selectedQuestion.value?.id === question.id) {
    selectedQuestion.value = undefined;
  }
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
    if (selectedCategory.value == null) {
      throw new Error("No category selected for new question");
    }
    updatedQuestion = await createQuestion.execute(
      selectedCategory.value.id,
      payload,
    );
  }

  if (!updatedQuestion) {
    throw new Error("Failed to save question");
  }
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
    categoryId: categoryId,
    choices: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
};

const onFormChanged = () => {
  console.log("form changed");
  hasUnsavedChanges.value = true;
};

watch(selectedCategory, () => {
  selectedQuestion.value = undefined;
});
</script>

<template>
  <h3 class="section-title">Categories</h3>

  <div v-if="editingCategory">
    <CategoryForm
      :category="editingCategory"
      @created="handleCategoryCreated"
      @cancel="editingCategory = undefined"
    />
  </div>

  <div v-else class="row category-list">
    <div v-if="categories.length === 0">No categories assigned</div>
    <CategoryCard
      v-for="category in categories"
      :key="category.id"
      :category="category"
      :selected="selectedCategory?.id === category.id"
      @click="onCategoryClick(category)"
      @delete="handleCategoryDelete(category)"
    />

    <button class="secondary" @click="handleClickCreateCategory">➕</button>
  </div>

  <!-- questions -->
  <CategoryQuestions
    v-if="selectedCategory"
    :category="selectedCategory"
    :selected-question="selectedQuestion"
    @click="onQuestionClick"
    @delete="handleQuestionDelete"
    @click:new="() => handleAddQuestion(selectedCategory!.id)"
  />

  <!-- form -->
  <QuestionForm
    v-if="selectedQuestion"
    :question="selectedQuestion"
    @form-changed="onFormChanged"
    @submit="onQuestionFormSubmit"
  />
</template>

<style scoped></style>

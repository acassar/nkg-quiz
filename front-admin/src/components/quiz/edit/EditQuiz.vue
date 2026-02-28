<script setup lang="ts">
import { computed, Ref, ref, watch } from "vue";
import CategoryCard from "../../category/CategoryCard.vue";
import CategoryQuestions from "./question/CategoryQuestions.vue";
import QuestionForm from "./question/QuestionForm.vue";
import { Question } from "@/types/question/question.types";
import { Category, CategoryInput } from "@/types/category/category.types";
import { Quiz } from "@/types/quiz/quiz.types";
import { useQuestionFetcher } from "@/composables/fetcher/question/useQuestionFetcher";
import CategoryForm from "./category/CategoryForm.vue";

const props = defineProps<{
  quiz: Quiz;
}>();

const { createQuestion, updateQuestion } = useQuestionFetcher();

const selectedCategory = ref<Category>();
const selectedQuestion = ref<Question>();
const editingCategory = ref<CategoryInput>();
const hasUnsavedChanges = defineModel<boolean>("hasUnsavedChanges"); //Allows to track if form has unsaved changes and prevent category/question switch without confirmation

const categories = computed(() => {
  // const allCategories: (Category | CategoryInput)[] = props.quiz.categories;
  // if (editingCategory.value) allCategories.push(editingCategory.value);
  return props.quiz.categories;
});

const selectOrDeselect = <T extends { id: number }>(
  current: T | undefined,
  newValue: T,
) => {
  if (current?.id === newValue.id) {
    return undefined;
  }
  return newValue;
};

const handleUnsavedChanges = <T extends { id: number }>(
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

const onQuestionClick = (question: Question) => {
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

const handleCategoryCreated = (category: Category) => {
  props.quiz.categories.push(category);
  editingCategory.value = undefined;
  selectedCategory.value = category;
};

const onQuestionFormSubmit = async (payload: any) => {
  if (payload.id) {
    await updateQuestion.execute(payload.id.toString(), payload);
  } else {
    await createQuestion.execute({
      ...payload,
      categoryId: selectedCategory.value?.id,
    });
  }
  hasUnsavedChanges.value = false;
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
    />

    <button class="secondary" @click="handleClickCreateCategory">➕</button>
  </div>

  <!-- questions -->
  <CategoryQuestions
    v-if="selectedCategory"
    :category="selectedCategory"
    :selected-question="selectedQuestion"
    @click="onQuestionClick"
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

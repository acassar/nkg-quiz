<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import CategoryCard from "../../category/CategoryCard.vue";
import CategoryQuestions from "./question/CategoryQuestions.vue";
import { Category, Question, Quiz } from "@/types/Quiz.types";
import QuestionForm from "./question/QuestionForm.vue";

const props = defineProps<{
  quiz: Quiz;
}>();

const selectedCategory = ref<Category>();
const selectedQuestion = ref<Question>();
const hasUnsavedChanges = defineModel<boolean>("hasUnsavedChanges"); //Allows to track if form has unsaved changes and prevent category/question switch without confirmation

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

const onFormSubmit = (payload: any) => {
  //TODO
  console.log("submit", payload);
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
  <div v-if="quiz.categories.length === 0">No categories assigned</div>
  <div v-else class="row category-list">
    <CategoryCard
      v-for="category in quiz.categories"
      :key="category.id"
      :category="category"
      :selected="selectedCategory?.id === category.id"
      @click="onCategoryClick(category)"
    />
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
  />
</template>

<style scoped></style>

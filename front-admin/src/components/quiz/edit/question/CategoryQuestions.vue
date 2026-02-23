<script setup lang="ts">
import QuestionCard from "@/components/question/QuestionCard.vue";
import { Category, Question } from "@/types/Quiz.types";

defineEmits<{
  (e: "click", question: Question): void;
}>();

const props = defineProps<{
  category: Category;
  selectedQuestion?: Question;
}>();
</script>

<template>
  <div>
    <h3 class="section-title">Questions for {{ category.name }}</h3>
    <div>
      <div v-if="category.questions.length === 0">
        No questions in this category
      </div>
      <div v-else class="row question-list">
        <QuestionCard
          v-for="question in category.questions"
          :key="question.id"
          :question="question"
          :selected="selectedQuestion?.id === question.id"
          @click="$emit('click', question)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import QuestionCard from "@/components/question/QuestionCard.vue";
import { Category } from "@/types/category/category.types";
import { QuestionInput } from "@/types/question/question.types";

defineEmits<{
  (e: "click", question: QuestionInput): void;
  (e: "click:new"): void;
  (e: "delete", question: QuestionInput): void;
}>();

const props = defineProps<{
  category: Category;
  selectedQuestion?: QuestionInput;
}>();
</script>

<template>
  <div>
    <h3 class="section-title">Questions for {{ category.name }}</h3>
    <div>
      <div v-if="category.questions.length === 0">
        No questions in this category
      </div>

      <div class="row question-list">
        <QuestionCard
          v-for="(question, index) in category.questions"
          :key="index"
          :question="question"
          :selected="selectedQuestion === question"
          @click="$emit('click', question)"
          @delete="$emit('delete', question)"
        />

        <button class="secondary" @click="$emit('click:new')">➕</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

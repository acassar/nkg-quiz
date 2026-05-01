<script setup lang="ts">
import { useI18n } from "vue-i18n";
import QuestionCard from "@/components/question/QuestionCard.vue";
import type { Category } from "@/types/category/category.types";
import type { QuestionInput } from "@/types/question/question.types";

defineEmits<{
  (e: "click", question: QuestionInput): void;
  (e: "click:new"): void;
  (e: "delete", question: QuestionInput): void;
}>();

const props = defineProps<{
  category: Category;
  selectedQuestion?: QuestionInput;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="grid">
    <h3 class="section-title">{{ t("category.questions", { name: category.name }) }}</h3>
    <div class="row">
      <span v-if="category.questions.length === 0" class="muted">{{ t("category.questionsNone") }}</span>
      <QuestionCard
        v-for="(question, index) in category.questions"
        :key="index"
        :question="question"
        :selected="selectedQuestion === question"
        @click="$emit('click', question)"
        @delete="$emit('delete', question)"
      />
      <button class="secondary" @click="$emit('click:new')">{{ t("category.addQuestion") }}</button>
    </div>
  </div>
</template>

<style scoped>
.muted {
  color: #7a6a56;
  font-style: italic;
}
</style>

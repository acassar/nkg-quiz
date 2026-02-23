<script setup lang="ts">
import { Question } from "@/types/Quiz.types";

defineEmits<{
  (e: "click", question: Question): void;
}>();

const props = defineProps<{
  question: Question;
  selected?: boolean;
}>();
</script>

<template>
  <div
    class="card selectable-card"
    @click="$emit('click', question)"
    :class="{ selected: props.selected }"
  >
    <div class="question-text">{{ question.prompt }}</div>
  </div>
</template>

<style scoped>
.card {
  background-color: #b9c8f8;
}

.card:hover {
  background-color: #70a0f0;
}

.card.selected {
  background-color: #70a0f0;
}
</style>

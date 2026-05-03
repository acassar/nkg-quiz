<script setup lang="ts">
import { Question } from "@/types/question/question.types";
import CardItem, { CardItemAction } from "../common/card/CardItem.vue";

const emits = defineEmits<{
  (e: "click", question: Question): void;
  (e: "delete", question: Question): void;
}>();

const props = defineProps<{
  question: Question;
  selected?: boolean;
}>();

const actions: CardItemAction[] = [
  {
    color: "red",
    label: "🗑️",
    onClick: () => emits("delete", props.question),
    key: "delete",
  },
];
</script>

<template>
  <CardItem
    :title="props.question.prompt"
    :selected="props.selected"
    selectedBgColor="var(--question-selected-bg)"
    bgColor="var(--question-bg)"
    :actions="actions"
    @click="$emit('click', props.question)"
  />
</template>

<style scoped></style>

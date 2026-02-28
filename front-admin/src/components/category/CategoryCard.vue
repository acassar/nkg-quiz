<script setup lang="ts">
import { Category } from "@/types/category/category.types";
import CardItem, { CardItemAction } from "../common/card/CardItem.vue";

const emits = defineEmits<{
  (e: "click", category: Category): void;
  (e: "delete", category: Category): void;
}>();

const props = defineProps<{
  category: Category;
  selected?: boolean;
}>();

const actions: CardItemAction[] = [
  {
    color: "red",
    label: "🗑️",
    onClick: () => emits("delete", props.category),
    key: "delete",
  },
];
</script>

<template>
  <CardItem
    :title="props.category.name"
    :selected="props.selected"
    selectedBgColor="#f0b070"
    bgColor="#f8d9b9"
    :actions
    @click="$emit('click', props.category)"
  ></CardItem>
</template>

<style scoped></style>

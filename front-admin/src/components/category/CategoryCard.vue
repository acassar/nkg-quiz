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

<style scoped>
.category-card {
  background-color: #f8d9b9;
  min-width: 200px;
  padding: 0px;
}

.section-title {
  padding: 1.6rem;
  flex: 1 0 auto;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.category-card:hover {
  background-color: #f0b070;
}

.category-card.selected {
  background-color: #f0b070;
}

.category-card .title {
  justify-content: space-between;
}

.delete {
  background-color: red;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>

<script setup lang="ts">
import { Category } from "@/types/category/category.types";

defineEmits<{
  (e: "click", category: Category): void;
}>();

const props = defineProps<{
  category: Category;
  selected?: boolean;
}>();
</script>

<template>
  <div>
    <div
      @click="$emit('click', category)"
      class="card selectable-card category-card"
      :class="{ selected: props.selected }"
    >
      <div class="row title">
        <div class="section-title">{{ category.name }}</div>
        <span>{{ category.questions.length }} 📋</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-card {
  background-color: #f8d9b9;
  min-width: 200px;
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
</style>

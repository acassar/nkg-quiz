<script setup lang="ts">
import { useCategoryFetcher } from "@/composables/fetcher/category/useCategoryFetcher";
import { Category, CategoryInput } from "@/types/category/category.types";

const emits = defineEmits<{
  (e: "created", payload: Category): void;
  (e: "cancel"): void;
}>();

const props = defineProps<{
  category: CategoryInput;
}>();

const { createCategory } = useCategoryFetcher();

const handleSubmitCreateCategory = async () => {
  if (props.category) {
    const newCategory = await createCategory.execute(
      props.category.quizId.toString(),
      props.category,
    );
    if (!newCategory) return;

    emits("created", newCategory);
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmitCreateCategory">
    <input v-model="category.name" type="text" />

    <button class="secondary" @click="$emit('cancel')">Cancel</button>
    <button class="secondary" @click="handleSubmitCreateCategory">Save</button>
  </form>
</template>

<style scoped>
input {
  margin: 1rem 0;
}
</style>

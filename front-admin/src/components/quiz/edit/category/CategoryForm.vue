<script setup lang="ts">
import { ref } from "vue";
import { useCategoryFetcher } from "@/composables/fetcher/category/useCategoryFetcher";
import type { Category, CategoryInput } from "@/types/category/category.types";

const emits = defineEmits<{
  (e: "created", payload: Category): void;
  (e: "cancel"): void;
}>();

const props = defineProps<{ category: CategoryInput }>();

const { createCategory } = useCategoryFetcher();
const name = ref("");

const submit = async () => {
  if (!name.value.trim()) return;
  const newCategory = await createCategory.execute(props.category.quizId.toString(), {
    ...props.category,
    name: name.value.trim(),
  });
  if (newCategory) emits("created", newCategory);
};
</script>

<template>
  <div class="card">
    <div class="section-title">Nouvelle catégorie</div>
    <form class="row" @submit.prevent="submit">
      <input v-model.trim="name" placeholder="Nom de la catégorie" autofocus class="flex-input" />
      <button type="submit" :disabled="!name.trim()">Créer</button>
      <button type="button" class="secondary" @click="$emit('cancel')">Annuler</button>
    </form>
  </div>
</template>

<style scoped>
.flex-input {
  flex: 1;
  width: auto;
}
</style>

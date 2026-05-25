<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCategoryFetcher } from "@/composables/fetcher/category/useCategoryFetcher";
import type { Category, CategoryInput } from "@nkg-quiz/shared-types";

const emits = defineEmits<{
  (e: "created", payload: Category): void;
  (e: "cancel"): void;
}>();

const props = defineProps<{ category: CategoryInput }>();

const { t } = useI18n();
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
  <div class="new-category-form">
    <div class="section-title">{{ t("category.form.sectionTitle") }}</div>
    <form class="form-row" @submit.prevent="submit">
      <input
        v-model.trim="name"
        :placeholder="t('category.form.namePlaceholder')"
        autofocus
        class="name-input"
      />
      <button type="submit" :disabled="!name.trim()">{{ t("category.form.submit") }}</button>
      <button type="button" class="secondary" @click="$emit('cancel')">{{ t("category.form.cancel") }}</button>
    </form>
  </div>
</template>

<style scoped>
.new-category-form {
  background: var(--ds-secondary-light);
  border: 1.5px dashed var(--ds-border);
  border-radius: var(--radius-md);
  padding: 0.9rem 1.1rem;
  display: grid;
  gap: 0.7rem;
}

.form-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

.name-input {
  flex: 1;
  min-width: 160px;
  width: auto;
}
</style>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ canRemove: boolean }>();
defineEmits<{ remove: [] }>();

const { t } = useI18n();
const text = defineModel<string>("text", { default: "" });
const isCorrect = defineModel<boolean>("isCorrect", { default: false });
</script>

<template>
  <div class="row">
    <input v-model.trim="text" :placeholder="t('question.choice.placeholder')" class="choice-input" />
    <label class="row checkbox">
      <input v-model="isCorrect" type="checkbox" />
      {{ t("question.choice.correct") }}
    </label>
    <button class="secondary" type="button" :disabled="!canRemove" @click="$emit('remove')">
      {{ t("question.choice.remove") }}
    </button>
  </div>
</template>

<style scoped>
.choice-input {
  flex: 1;
  width: auto;
}
</style>

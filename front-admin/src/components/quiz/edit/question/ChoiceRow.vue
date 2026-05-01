<script setup lang="ts">
defineProps<{ canRemove: boolean }>();
defineEmits<{ remove: [] }>();

const text = defineModel<string>("text", { default: "" });
const isCorrect = defineModel<boolean>("isCorrect", { default: false });
</script>

<template>
  <div class="row">
    <input v-model.trim="text" placeholder="Réponse" class="choice-input" />
    <label class="row checkbox">
      <input v-model="isCorrect" type="checkbox" />
      Correcte
    </label>
    <button class="secondary" type="button" :disabled="!canRemove" @click="$emit('remove')">
      Retirer
    </button>
  </div>
</template>

<style scoped>
.choice-input {
  flex: 1;
  width: auto;
}
</style>

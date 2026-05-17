<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { QuizOptions } from "@nkg-quiz/shared-types";
import OptionsForm from "./OptionsForm.vue";

const props = defineProps<{ title: string }>();
const emits = defineEmits<{
  (e: "confirm", options: QuizOptions): void;
  (e: "cancel"): void;
}>();

const { t } = useI18n();

const options = ref<QuizOptions>({
  autoRestart: false,
  revealAnswers: false,
  showLeaderboard: true,
  showScores: true,
  showFullRanking: true,
});

const confirm = () => emits("confirm", options.value);
</script>

<template>
  <div class="modal-backdrop" @click.self="emits('cancel')">
    <div class="modal card">
      <div class="section-title">{{ t("quiz.import.modalTitle", { title }) }}</div>

      <div class="options-section">
        <div class="section-title small">{{ t("session.create.optionsTitle") }}</div>
        <OptionsForm v-model="options" />
      </div>

      <div class="row">
        <button @click="confirm">{{ t("quiz.import.confirm") }}</button>
        <button class="secondary" @click="emits('cancel')">{{ t("session.create.cancel") }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  min-width: 360px;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title.small {
  font-size: 0.85rem;
}
</style>

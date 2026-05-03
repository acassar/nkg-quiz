<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useSessionState } from "../composable/useSessionState";
import { sendAnswer } from "../service/socket.service";
import { usePlayer } from "../composable/usePlayer";
import ChoiceComponent from "./ChoiceComponent.vue";

const { t } = useI18n();

const emit = defineEmits<{
  "click:results": [];
}>();

const {
  sessionCode,
  currentQuestion: question,
  currentCategoryName: categoryName,
  status,
  savePlayerAnswer,
  getPlayerAnswer,
} = useSessionState();
const { currentPlayerId: playerId } = usePlayer();

const selectedChoiceId = ref<number | null>(null);

// Restore previously selected choice when question changes (e.g. after auto-restart)
watch(
  () => question.value?.id,
  (questionId) => {
    selectedChoiceId.value =
      questionId != null ? getPlayerAnswer(questionId) : null;
  },
  { immediate: true },
);

const submitAnswer = async (choiceId: number) => {
  if (!question.value || !playerId.value || !sessionCode.value) return;
  selectedChoiceId.value = choiceId;
  savePlayerAnswer(question.value.id, choiceId);

  sendAnswer({
    questionId: question.value.id,
    choiceId,
    playerId: parseInt(playerId.value),
    sessionCode: sessionCode.value,
  });
};

const showResults = () => {
  emit("click:results");
};
</script>

<template>
  <section class="card question" v-if="question">
    <span v-if="categoryName" class="category-badge">{{ categoryName }}</span>
    <h2>{{ question.prompt }}</h2>
    <div class="choices">
      <ChoiceComponent
        v-for="choice in question.choices"
        :key="choice.id"
        :choice="choice"
        :type="selectedChoiceId === choice.id ? 'selected' : 'normal'"
        @click="submitAnswer(choice.id)"
      />
    </div>
  </section>

  <section class="card" v-else>
    <p v-if="status === 'connected'">{{ t("player.questions.waiting") }}</p>
    <div v-else-if="status === 'ended'">
      <p>{{ t("player.questions.ended") }}</p>
      <button @click="showResults">
        {{ t("player.questions.showResults") }}
      </button>
    </div>
    <p v-else>{{ t("player.questions.noSession") }}</p>
  </section>
</template>

<style scoped>
.question {
  display: grid;
  gap: 1rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--bg-badge);
  color: var(--text-inverse);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  align-self: start;
  justify-self: start;
}

.question h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2.6vw, 2.2rem);
}

.choices {
  display: grid;
  gap: 0.8rem;
}
</style>

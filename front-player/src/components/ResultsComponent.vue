<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePlayer } from "../composable/usePlayer";
import { useSessionFetcher } from "../composable/useSessionFetcher";
import { useSessionState } from "../composable/useSessionState";
import ChoiceComponent from "./ChoiceComponent.vue";

const { t } = useI18n();
const { sessionCode } = useSessionState();
const { currentPlayerId } = usePlayer();
const { getResults } = useSessionFetcher();

const error = ref<string | null>(null);
const currentIndex = ref(0);

const questions = computed(() => getResults.data.value?.questions ?? []);
const currentQuestion = computed(() => questions.value[currentIndex.value]);

type ChoiceState = "correct" | "incorrect" | "missed" | "normal";

function getChoiceState(
  choice: { id: number; isCorrect: boolean },
  playerChoiceId: number | null,
): ChoiceState {
  const picked = choice.id === playerChoiceId;
  if (picked && choice.isCorrect) return "correct";
  if (picked && !choice.isCorrect) return "incorrect";
  if (!picked && choice.isCorrect) return "missed";
  return "normal";
}

const fetchResults = async () => {
  if (!sessionCode.value || !currentPlayerId.value) {
    error.value = t("player.results.errors.noSession");
    return;
  }
  await getResults.execute(sessionCode.value, currentPlayerId.value);
  if (getResults.error.value) {
    error.value = t("player.results.errors.fetchError");
  }
};

fetchResults();
</script>

<template>
  <div class="results">
    <p class="error" v-if="error">{{ error }}</p>

    <template v-else-if="questions.length > 0 && currentQuestion">
      <div class="header">
        <h2>{{ t("player.results.title") }}</h2>
        <span class="counter">
          {{ t("player.results.question", { current: currentIndex + 1, total: questions.length }) }}
        </span>
      </div>

      <div class="card question-card">
        <p class="prompt">{{ currentQuestion.prompt }}</p>

        <div class="choices">
          <ChoiceComponent
            v-for="choice in currentQuestion.choices"
            :key="choice.id"
            :choice="{ ...choice, questionId: currentQuestion.id }"
            :type="getChoiceState(choice, currentQuestion.playerChoiceId)"
          />
        </div>
      </div>

      <div class="nav">
        <button
          class="secondary"
          @click="currentIndex--"
          :disabled="currentIndex === 0"
        >
          {{ t("player.results.prev") }}
        </button>
        <button
          @click="currentIndex++"
          :disabled="currentIndex === questions.length - 1"
        >
          {{ t("player.results.next") }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.results {
  display: grid;
  gap: 1.4rem;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.header h2 {
  margin: 0;
}

.counter {
  font-size: 0.9rem;
  color: #6b7280;
}

.question-card {
  display: grid;
  gap: 1rem;
}

.prompt {
  margin: 0;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 600;
}

.choices {
  display: grid;
  gap: 0.8rem;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>

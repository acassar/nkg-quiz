<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useLocaleSwitch } from "@nkg-quiz/shared-i18n";
import { useSessionState } from "../../composables/useSessionState";
import { connectSocket } from "../../services/socket.service";
import { useSessionFetcher } from "../../composables/useSessionFetcher";

const { t } = useI18n();
const { switchLabel, toggleLocale } = useLocaleSwitch();

const {
  state,
  status,
  sessionCode: currentSessionCode,
  setSessionQuiz,
} = useSessionState();
const { getQuiz } = useSessionFetcher();
const sessionCodeModel = ref(""); // Session code input by the user

watch(status, (newStatus) => {
  if (newStatus === "connected") {
    fetchQuiz();
  }
});

const fetchQuiz = async () => {
  if (!currentSessionCode.value) return;
  const quiz = await getQuiz.execute(currentSessionCode.value);
  if (quiz) {
    setSessionQuiz(quiz);
  }
};

const handleConnectClick = () => {
  if (!sessionCodeModel.value) return;
  connectSocket(sessionCodeModel.value);
};
</script>

<template>
  <header class="header">
    <div>
      <div class="brand">{{ t("screen.brand") }}</div>
      <div class="meta-row">
        <span class="status-pill">{{ status }}</span>
        <span v-if="state">{{ t("screen.header.session", { code: state.code }) }}</span>
      </div>
    </div>
    <div class="session-card">
      <input
        v-model.trim="sessionCodeModel"
        :placeholder="t('screen.header.codePlaceholder')"
        :aria-label="t('screen.header.codePlaceholder')"
      />
      <button @click="handleConnectClick">{{ t("screen.header.connect") }}</button>
      <button @click="toggleLocale">{{ switchLabel }}</button>
    </div>
  </header>
</template>

<style scoped></style>

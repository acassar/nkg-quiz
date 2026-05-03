<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Player } from "../types/player.types";

const { t } = useI18n();
import { useSessionState } from "../composable/useSessionState";
import { usePlayer } from "../composable/usePlayer";
import { useSessionFetcher } from "../composable/useSessionFetcher";
import { connectSocket } from "../service/socket.service";

defineEmits<{
  (e: "back"): void;
}>();

const props = defineProps<{
  player?: Player;
  sessionCode: string;
}>();

const { status, setSessionQuiz } = useSessionState();
const { savePlayer } = usePlayer();
const { joinSession: joinSessionFetcher, getQuiz } = useSessionFetcher();

const nickName = ref(props.player?.name || "");

const canJoin = computed(() => nickName.value.trim().length > 1);
const joinFetcherError = computed(
  () => joinSessionFetcher.error.value?.message,
);

const joinSession = async () => {
  if (!canJoin.value) return;
  status.value = "joining";
  const sessionCode = props.sessionCode.trim();
  const nickname = nickName.value.trim();

  // Attempt to join the session and get the player ID
  const response = await joinSessionFetcher.execute(
    sessionCode,
    nickname,
    props.player?.id,
  );

  if (!response?.playerId || joinSessionFetcher.error.value) {
    status.value = "error";
    return;
  }

  // Fetch quiz data immediately after joining to have it ready when the session state arrives
  await getQuiz.execute(sessionCode);

  if (getQuiz.error.value || !getQuiz.data.value) {
    status.value = "error";
    return;
  }

  // Set the quiz data in the session state so it's available for the rest of the app
  setSessionQuiz(getQuiz.data.value);

  // Store player ID and connect to the session
  savePlayer({
    id: response.playerId.toString(),
    name: nickname,
    sessionCode,
  });
  connectSocket(sessionCode);
};
</script>

<template>
  <div class="back-container">
    <span
      >{{ t("player.join.codeLabel") }} <b>{{ props.sessionCode }}</b></span
    >
    <button @click="$emit('back')">{{ t("player.join.changeCode") }}</button>
  </div>
  <div class="session-join">
    <input v-model.trim="nickName" :placeholder="t('player.join.nicknamePlaceholder')" />
    <button :disabled="!canJoin || status === 'joining'" @click="joinSession">
      {{ status === "joining" ? t("player.join.submitting") : t("player.join.submit") }}
    </button>
    <span class="error" v-if="joinFetcherError">{{ joinFetcherError }}</span>
  </div>
</template>

<style scoped>
.session-join {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-container {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 720px) {
  .session-join {
    justify-content: center;
  }

  .back-container {
    justify-content: center;
  }
}
</style>

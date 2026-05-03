<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Player } from "../types/player.types";

const { t } = useI18n();
import SearchSessionByCode from "./SearchSessionByCode.vue";
import SessionJoin from "./SessionJoin.vue";
import { useSessionFetcher } from "../composable/useSessionFetcher";

const { getState } = useSessionFetcher();

const sessionCode = ref();
const status = ref<"sessionCode" | "nickname">("sessionCode");
const retrievedPlayer = ref<Player>();

const handleRetrievedPlayerForSession = async (player: Player | undefined) => {
  if (!sessionCode.value) return;
  // Check session state before proceeding to nickname input
  await getState.execute(sessionCode.value);
  if (getState.error.value) return;

  retrievedPlayer.value = player;
  status.value = "nickname";
};
</script>

<template>
  <section class="hero">
    <span class="badge">{{ t("player.handler.badge") }}</span>
    <h1>{{ t("player.handler.title") }}</h1>
    <p>{{ t("player.handler.description") }}</p>
  </section>

  <section class="card">
    <div class="form">
      <SearchSessionByCode
        v-if="status === 'sessionCode'"
        v-model="sessionCode"
        @submit="handleRetrievedPlayerForSession"
      ></SearchSessionByCode>
      <span class="error">{{ getState.error.value?.message }}</span>
      <SessionJoin
        v-if="sessionCode && status === 'nickname'"
        :sessionCode="sessionCode"
        :player="retrievedPlayer"
        @back="status = 'sessionCode'"
      ></SessionJoin>
    </div>
  </section>
</template>

<style scoped></style>

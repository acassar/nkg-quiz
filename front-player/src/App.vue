<script setup lang="ts">
import QuestionsComponent from "./components/QuestionsComponent.vue";
import SessionJoinHandler from "./components/SessionJoinHandler.vue";
import { useSessionState } from "./composable/useSessionState";

const { sessionCode, leaveSession } = useSessionState();
</script>

<template>
  <div class="player">
    <button v-if="sessionCode" @click="leaveSession">Leave session</button>
    <SessionJoinHandler v-if="!sessionCode" />
    <QuestionsComponent />
  </div>
</template>

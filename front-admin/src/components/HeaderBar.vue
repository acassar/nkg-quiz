<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import { useI18n } from "vue-i18n";

const { isAuthed, logout } = useAuth();
const { t } = useI18n();
</script>

<template>
  <header class="header" v-if="isAuthed">
    <div>
      <div class="brand">{{ t("nav.brand") }}</div>
      <div class="badge">{{ t("nav.badge") }}</div>
    </div>
    <div class="row">
      <button class="secondary" @click="logout">{{ t("auth.logout") }}</button>
    </div>
  </header>
</template>

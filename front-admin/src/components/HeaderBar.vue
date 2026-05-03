<script setup lang="ts">
import { useAuth } from "../composables/useAuth";
import { useI18n } from "vue-i18n";
import { useLocaleSwitch } from "@nkg-quiz/shared-i18n";

const { isAuthed, logout } = useAuth();
const { t } = useI18n();
const { switchLabel, toggleLocale } = useLocaleSwitch();
</script>

<template>
  <header class="header" v-if="isAuthed">
    <div>
      <div class="brand">{{ t("nav.brand") }}</div>
      <div class="badge">{{ t("nav.badge") }}</div>
    </div>
    <div class="row">
      <button class="secondary" @click="toggleLocale">{{ switchLabel }}</button>
      <button class="secondary" @click="logout">{{ t("auth.logout") }}</button>
    </div>
  </header>
</template>

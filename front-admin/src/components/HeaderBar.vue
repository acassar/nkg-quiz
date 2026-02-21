<script setup lang="ts">
import { useAuth } from "../composables/useAuth";

const { isAuthed, logout } = useAuth();
</script>

<template>
  <header class="header" v-if="isAuthed">
    <div>
      <div class="brand">NKG Backoffice</div>
      <div class="badge">Session control</div>
    </div>
    <button v-if="isAuthed" class="secondary" @click="logout">Logout</button>
  </header>
</template>

<style scoped></style>

<script setup lang="ts">
import HeaderBar from "./components/HeaderBar.vue";
import Login from "./components/Login.vue";
import { useAuth } from "./composables/useAuth";

const { isAuthed } = useAuth();

//TODO: handle auth state changes (e.g. token expiration) and redirect to login if needed
</script>

<template>
  <div class="shell">
    <Login />

    <HeaderBar />

    <div v-if="isAuthed" class="columns">
      <div class="grid">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<!-- 
  EXEMPLE D'UTILISATION : AuthForm.vue réécrit avec useAuth()
  
  Avant : Toute la logique auth était dans App.vue 
  Après : Logique centralisée dans useAuth, réutilisable partout
-->

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";

type Mode = "login" | "register";

const mode = ref<Mode>("login");
const email = ref("");
const password = ref("");

// ✨ Utiliser le composable au lieu de définir la logique ici
const { isAuthed, error, login, register, logout } = useAuth();

const handleSubmit = async () => {
  try {
    if (mode.value === "login") {
      await login(email.value, password.value);
    } else {
      await register(email.value, password.value);
    }
    // Après succès, les données sont automatiquement partagées
    // Tous les autres composants verront isAuthed.value = true
  } catch (err) {
    // error.value est défini automatiquement
  }
};
</script>

<template>
  <!-- Si pas connecté, afficher le formulaire -->
  <div v-if="!isAuthed" class="shell">
    <div class="card" style="max-width: 400px; margin: 4rem auto; width: 100%">
      <span class="section-title">NKG Quiz</span>

      <div class="row" style="margin-bottom: 1.5rem">
        <button
          class="secondary"
          :disabled="mode === 'login'"
          @click="mode = 'login'"
        >
          Login
        </button>
        <button
          class="secondary"
          :disabled="mode === 'register'"
          @click="mode = 'register'"
        >
          Register
        </button>
      </div>

      <div class="grid">
        <input v-model.trim="email" type="email" placeholder="Email" required />
        <input
          v-model.trim="password"
          type="password"
          placeholder="Password"
          required
        />
        <button @click="handleSubmit">
          {{ mode === "login" ? "Login" : "Register" }}
        </button>

        <!-- ✨ error vient du composable -->
        <p v-if="error" style="color: #c32c2c; font-size: 0.9rem; margin: 0">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

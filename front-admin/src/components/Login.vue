<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";

type Mode = "login" | "register";

const mode = ref<Mode>("login");
const email = ref("");
const password = ref("");

const { isAuthed, login, register, error } = useAuth();

const handleSubmit = async () => {
  if (mode.value === "login") {
    await login(email.value, password.value);
  } else {
    await register(email.value, password.value);
  }
};
</script>

<template>
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

        <p v-if="error" style="color: #c32c2c; font-size: 0.9rem; margin: 0">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

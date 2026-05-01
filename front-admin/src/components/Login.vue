<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";
import { useI18n } from "vue-i18n";

type Mode = "login" | "register";

const { t } = useI18n();
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
    <div class="card login-card">
      <span class="section-title">NKG Quiz</span>

      <div class="row mode-row">
        <button class="secondary" :disabled="mode === 'login'" @click="mode = 'login'">
          {{ t("auth.login") }}
        </button>
        <button class="secondary" :disabled="mode === 'register'" @click="mode = 'register'">
          {{ t("auth.register") }}
        </button>
      </div>

      <form class="grid" @submit.prevent="handleSubmit">
        <input v-model.trim="email" type="email" :placeholder="t('auth.emailPlaceholder')" required />
        <input v-model.trim="password" type="password" :placeholder="t('auth.passwordPlaceholder')" required />
        <button type="submit">
          {{ mode === "login" ? t("auth.submitLogin") : t("auth.submitRegister") }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 4rem auto;
  width: 100%;
}

.mode-row {
  margin-bottom: 1.5rem;
}
</style>

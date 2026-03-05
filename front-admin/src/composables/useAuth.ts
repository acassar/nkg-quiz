import { computed, ref } from "vue";
import { useAuthFetcher } from "./fetcher/auth/useAuthFetcher.ts";

const token = ref(localStorage.getItem("nkg_token") || "");

export const useAuth = () => {
  const isAuthed = computed(() => Boolean(token.value));
  const error = ref<string | null>(null);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem("nkg_token", newToken);
  };

  const login = async (email: string, password: string) => {
    const { login } = useAuthFetcher();

    try {
      const response = await login.execute(email, password);
      if (!response?.token && !login.error)
        throw new Error("No token received");

      if (login.error.value)
        throw new Error(login.error.value?.message || "Login failed");

      setToken(response?.token || "");
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      error.value = errMsg;
    }
  };

  const register = async (email: string, password: string) => {
    const { register } = useAuthFetcher();

    try {
      const response = await register.execute(email, password);
      if (!response?.token) throw new Error("No token received");

      setToken(response?.token || "");
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      error.value = errMsg;
    }
  };

  const logout = () => {
    token.value = "";
    localStorage.removeItem("nkg_token");
  };

  return {
    // State
    token,
    isAuthed,
    // Methods
    login,
    register,
    logout,
    error,
  };
};

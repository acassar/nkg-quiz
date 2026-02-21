import { computed, ref } from "vue";

const token = ref(localStorage.getItem("nkg_token") || "");
const error = ref("");

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token.value) headers.set("Authorization", `Bearer ${token.value}`);

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response.json();
};

export const useAuth = () => {
  const isAuthed = computed(() => Boolean(token.value));

  const login = async (email: string, password: string) => {
    error.value = "";
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      token.value = data.token;
      localStorage.setItem("nkg_token", data.token);
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Login failed";
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    error.value = "";
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      token.value = data.token;
      localStorage.setItem("nkg_token", data.token);
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Registration failed";
      throw err;
    }
  };

  const logout = () => {
    token.value = "";
    localStorage.removeItem("nkg_token");
    error.value = "";
  };

  return {
    // State
    token,
    error,
    isAuthed,
    // Methods
    login,
    register,
    logout,
    // Helper
    apiFetch,
  };
};

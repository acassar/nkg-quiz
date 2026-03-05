import { apiFetch } from "../fetcher";

const authEndpoint = "/auth";

export const authFetcher = {
  login: async (email: string, password: string) => {
    return apiFetch<{ token: string }>(`${authEndpoint}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (email: string, password: string) => {
    return apiFetch<{ token: string }>(`${authEndpoint}/register`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

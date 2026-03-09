import { configureFetcher, type AuthProvider } from "@nkg-quiz/shared-fetcher";

// Auth provider specific to this app
const authProvider: AuthProvider = {
  getToken: () => {
    return localStorage.getItem("nkg_token");
  },
  logout: () => {
    localStorage.removeItem("nkg_token");
    // Trigger a page reload to reset app state
    window.location.reload();
  },
};

// Configure the shared fetcher
export function setupFetcher() {
  configureFetcher({
    apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    authProvider,
  });
}

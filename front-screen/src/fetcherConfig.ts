import { configureFetcher } from '@nkg-quiz/shared-fetcher';

// Configuration simple sans authentification pour front-screen
export function setupFetcher() {
  configureFetcher({
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    // Pas d'authProvider = pas de token requis
  });
}
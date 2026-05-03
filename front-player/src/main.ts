import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";
import { configureFetcher } from "@nkg-quiz/shared-fetcher";
import { i18n } from "./i18n";

configureFetcher({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
});

createApp(App).use(i18n).mount("#app");

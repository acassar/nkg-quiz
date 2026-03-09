import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";
import { setupFetcher } from "./fetcherConfig";

// Configure the shared fetcher
setupFetcher();

createApp(App).mount("#app");

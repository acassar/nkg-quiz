import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./base.css";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { setupFetcher } from "./services/fetcher/fetcherConfig";

// Configure the shared fetcher
setupFetcher();

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount("#app");

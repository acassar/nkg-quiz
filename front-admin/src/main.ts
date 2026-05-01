import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./base.css";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { setupFetcher } from "./services/fetcher/fetcherConfig";
import { i18n } from "./i18n";

setupFetcher();

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(i18n);
app.mount("#app");

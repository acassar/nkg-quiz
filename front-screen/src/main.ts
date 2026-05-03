import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles.css";
import { setupFetcher } from "./fetcherConfig";
import { i18n } from "./i18n";

setupFetcher();

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount("#app");

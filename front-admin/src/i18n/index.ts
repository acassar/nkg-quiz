import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export type MessageSchema = typeof en;

export const i18n = createI18n<[MessageSchema], "en" | "fr">({
  legacy: false,
  locale: (localStorage.getItem("locale") as "en" | "fr") ?? "en",
  fallbackLocale: "en",
  messages: { en, fr },
});

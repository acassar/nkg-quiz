import { createI18n } from "vue-i18n";
import { getI18nConfig } from "@nkg-quiz/shared-i18n";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export type MessageSchema = typeof en;

export const i18n = createI18n<[MessageSchema], "en" | "fr">({
  ...getI18nConfig(),
  messages: { en, fr },
});

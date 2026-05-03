export { useLocaleSwitch } from "./useLocaleSwitch";

export function getI18nConfig() {
  return {
    legacy: false as const,
    locale: (localStorage.getItem("locale") as "en" | "fr") ?? "en",
    fallbackLocale: "en" as const,
  };
}

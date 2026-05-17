export { useLocaleSwitch } from "./useLocaleSwitch";

export function getI18nConfig() {
  return {
    legacy: false as const,
    locale: (localStorage.getItem("locale") as "en" | "fr") ?? "fr",
    fallbackLocale: "fr" as const,
  };
}

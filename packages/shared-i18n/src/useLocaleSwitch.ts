import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useLocaleSwitch() {
  const { locale } = useI18n();

  const switchLabel = computed(() => (locale.value === "en" ? "FR" : "EN"));

  const toggleLocale = () => {
    locale.value = locale.value === "en" ? "fr" : "en";
    localStorage.setItem("locale", locale.value);
  };

  return { locale, switchLabel, toggleLocale };
}

import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useLocaleSwitch() {
  const { locale } = useI18n();

  const switchLabel = computed(() => (locale.value === "en" ? "FR" : "EN"));

  const setLocale = (val: string) => {
    locale.value = val;
    localStorage.setItem("locale", val);
  };

  return { locale, switchLabel, setLocale };
}

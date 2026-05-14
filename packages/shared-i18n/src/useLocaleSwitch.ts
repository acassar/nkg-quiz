import { useI18n } from "vue-i18n";

export function useLocaleSwitch() {
  const i18n = useI18n();

  const setLocale = (val: string) => {
    i18n.locale.value = val;
    localStorage.setItem("locale", val);
  };

  return { locale: i18n.locale, setLocale };
}

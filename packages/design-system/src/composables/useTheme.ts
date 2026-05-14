import { ref } from "vue";

export type Theme = "blue" | "black";

const STORAGE_KEY = "nkg-quiz-theme";
const theme = ref<Theme>(
  (localStorage.getItem(STORAGE_KEY) as Theme) ?? "blue",
);

function applyTheme(t: Theme) {
  if (t === "blue") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", t);
  }
}

applyTheme(theme.value);

export function useTheme() {
  function setTheme(t: Theme) {
    theme.value = t;
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }

  return { theme, setTheme };
}

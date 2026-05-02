import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import lt from "./locales/lt.json";

const savedLanguage = localStorage.getItem("language") ?? "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    lt: { translation: lt },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem("language", lang);
}

export const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "lt", label: "LT" },
] as const;

export type LanguageCode = "en" | "lt";

export default i18n;

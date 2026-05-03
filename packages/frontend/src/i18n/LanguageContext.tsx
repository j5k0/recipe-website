import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { translations } from "./translations";
import type { Lang } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, ...args: any[]) => string;
  tTag: (name: string) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  tTag: (name) => name,
  locale: "en-US",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("language");
    return saved === "lt" ? "lt" : "en";
  });

  const setLang = (newLang: Lang) => {
    localStorage.setItem("language", newLang);
    setLangState(newLang);
  };

  const t = (key: string, ...args: any[]): string => {
    const val = translations[lang][key] ?? translations.en[key];
    if (val === undefined) return key;
    if (typeof val === "function") return val(...args);
    return val as string;
  };

  const tTag = (name: string): string => {
    const val = translations[lang][`tag.${name}`] ?? translations.en[`tag.${name}`];
    if (!val || typeof val !== "string") return name;
    return val;
  };

  const locale = lang === "lt" ? "lt-LT" : "en-US";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tTag, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

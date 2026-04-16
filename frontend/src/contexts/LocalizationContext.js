import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as storage from "../services/storage";

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to Sanskar",
    select_language: "Select Language",
    select_religion: "Choose your spiritual path",
    hindu: "Hindu",
    buddhist: "Buddhist",
    next: "Next",
    skip: "Skip",
    login: "Login",
    register: "Register",
    traditional_vedic: "Traditional Vedic rituals",
    lama_dharma: "Lama rituals & dharma",
  },
  np: {
    welcome: "संस्कारमा स्वागत छ",
    select_language: "भाषा छान्नुहोस्",
    select_religion: "तपाईको आध्यात्मिक मार्ग छान्नुहोस्",
    hindu: "हिन्दू",
    buddhist: "बौद्ध",
    next: "थप",
    skip: "छोड्नुहोस्",
    login: "लगइन",
    register: "दर्ता",
    traditional_vedic: "परम्परागत वैदिक अनुष्ठान",
    lama_dharma: "लामा अनुष्ठान र धर्म",
  },
};

const LocalizationContext = createContext(null);

export function LocalizationProvider({ children }) {
  const [locale, setLocale] = useState("en");
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getLanguagePref();
        if (saved === "en" || saved === "np") {
          setLocale(saved);
        } else {
          setShowPrompt(true);
        }
      } catch {
        setShowPrompt(true);
      }
    })();
  }, []);

  const setLanguage = useCallback((lang) => {
    if (lang === "en" || lang === "np") {
      setLocale(lang);
      setShowPrompt(false);
      storage.storeLanguagePref(lang).catch(() => {});
    }
  }, []);

  const t = useCallback((key) => {
    return TRANSLATIONS[locale][key] || key;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLanguage, t, showPrompt }), [
    locale,
    setLanguage,
    t,
    showPrompt,
  ]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error("useLocalization must be used within LocalizationProvider");
  return ctx;
}

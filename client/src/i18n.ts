import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { normalizeLanguage, resources } from "@/locales/resources";

const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: "appLanguageDetector",
  lookup() {
    if (typeof window === "undefined") return "zh-CN";

    const saved = window.localStorage.getItem("tcgplay_locale");
    if (saved) return normalizeLanguage(saved);

    const browserLanguage = navigator.languages?.[0] || navigator.language;
    return normalizeLanguage(browserLanguage);
  },
  cacheUserLanguage(lng) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("tcgplay_locale", normalizeLanguage(lng));
  },
});

void i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "zh-CN",
    supportedLngs: ["zh-CN", "zh-TW", "en", "ja", "ko"],
    lng: "zh-CN",
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["appLanguageDetector"],
      caches: ["appLanguageDetector"],
    },
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    const normalized = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
    if (normalized !== i18n.language) {
      void i18n.changeLanguage(normalized);
    }
  });

export default i18n;

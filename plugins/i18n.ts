import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "@/i18n/en/translation.json";
import translationPl from "@/i18n/pl/translation.json";
import tabsEn from "@/i18n/en/tabs.json";
import tabsPl from "@/i18n/pl/tabs.json";
import setupEn from "@/i18n/en/setup.json";
import setupPl from "@/i18n/pl/setup.json";
import languagesEn from "@/i18n/en/languages.json";
import languagesPl from "@/i18n/pl/languages.json";
import onboardingEn from "@/i18n/en/onboarding.json";

const resources = {
  en: {
    translation: translationEn,
    tabs: tabsEn,
    setup: setupEn,
    languages: languagesEn,
    onboarding: onboardingEn,
  },
  pl: {
    translation: translationPl,
    tabs: tabsPl,
    setup: setupPl,
    languages: languagesPl,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

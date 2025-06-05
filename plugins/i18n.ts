import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";

const resources = {
  en,
  pl,
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

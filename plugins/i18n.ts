import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/en";
import pl from "@/i18n/pl";
import de from "@/i18n/de";
import es from "@/i18n/es";
import cs from "@/i18n/cs";
import fr from "@/i18n/fr";
import it from "@/i18n/it";
import uk from "@/i18n/uk";
import hr from "@/i18n/hr";
import pt from "@/i18n/pt";
import ja from "@/i18n/ja";
import id from "@/i18n/id";

const resources = {
  en,
  pl,
  de,
  es,
  cs,
  fr,
  it,
  uk,
  hr,
  pt,
  ja,
  id,
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

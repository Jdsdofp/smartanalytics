import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import pt from "./locales/pt/translation.json";
import es from "./locales/es/translation.json";
// import ar from "./locales/ar/translation.json";

// Função para carregar idioma do localStorage
const getSavedLanguage = () => {
  try {
    const savedSettings = sessionStorage.getItem('companyData');
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.language || 'en';
    }
  } catch (error) {
    console.error('Erro ao carregar idioma salvo:', error);
  }
  return 'en'; // fallback
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      // ar: { translation: ar }
    },
    lng: getSavedLanguage(), // Define o idioma inicial baseado no localStorage
    fallbackLng: "en", // ✅ Corrigido para 'pt' (consistente)
    interpolation: { 
      escapeValue: false 
    },
    // Configurações para persistir a escolha do idioma
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

export default i18n;
// src/components/LanguageSync.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompany } from '../hooks/useCompany';

export function LanguageSync() {
  const { i18n } = useTranslation();
  const { language } = useCompany();

  useEffect(() => {
    if (language && i18n.language !== language) {
      console.log('🌐 Mudando idioma para:', language);
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return null; // Componente invisível
}
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, Language } from '@/config/languages';

interface LanguageContextProps {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Simple dictionary mapping for the MVP
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.overview': 'Overview',
    'nav.appointments': 'Appointments',
    'nav.prescriptions': 'Prescriptions',
    'nav.patients': 'Patients',
    'nav.inventory': 'Inventory',
    'nav.monitoring': 'District Monitoring',
    'nav.redistribution': 'Redistribute Stock',
    'common.logout': 'Log Out',
    'common.search': 'Search...',
    'common.notifications': 'Notifications',
    'common.ai_assistant': 'Arogya AI Assistant',
    'dashboard.welcome': 'Welcome to ArogyaOS',
  },
  hi: {
    'nav.overview': 'अवलोकन',
    'nav.appointments': 'नियुक्तियां',
    'nav.prescriptions': 'नुस्खे',
    'nav.patients': 'मरीजों',
    'nav.inventory': 'इन्वेंटरी',
    'nav.monitoring': 'जिला निगरानी',
    'nav.redistribution': 'स्टॉक पुनर्वितरण',
    'common.logout': 'लॉग आउट',
    'common.search': 'खोजें...',
    'common.notifications': 'सूचनाएं',
    'common.ai_assistant': 'आरोग्य एआई सहायक',
    'dashboard.welcome': 'आरोग्य ओएस में आपका स्वागत है',
  },
  // Other language fallbacks resolve to English in t() function
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [langCode, setLangCode] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem('arogya_lang');
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setLangCode(saved);
    }
  }, []);

  const setLanguage = (code: string) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      setLangCode(code);
      localStorage.setItem('arogya_lang', code);
    }
  };

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    return translations[langCode]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
export default LanguageProvider;

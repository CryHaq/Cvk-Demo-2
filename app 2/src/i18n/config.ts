// CVK Dijital - i18n Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Çeviri dosyalarını import et
import trTranslation from '../../public/locales/tr/translation.json';
import enTranslation from '../../public/locales/en/translation.json';
import deTranslation from '../../public/locales/de/translation.json';
import frTranslation from '../../public/locales/fr/translation.json';
import arTranslation from '../../public/locales/ar/translation.json';

// Desteklenen diller ve yapılandırma
export const SUPPORTED_LANGUAGES = ['tr', 'en', 'de', 'fr', 'ar'];
export const DEFAULT_LANGUAGE = 'tr';
export const RTL_LANGUAGES = ['ar'];

// Kaynaklar
const resources = {
  tr: { translation: trTranslation },
  en: { translation: enTranslation },
  de: { translation: deTranslation },
  fr: { translation: frTranslation },
  ar: { translation: arTranslation },
};

// i18n yapılandırması
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    debug: import.meta.env.DEV,
    
    supportedLngs: SUPPORTED_LANGUAGES,
    
    interpolation: {
      escapeValue: false, // XSS koruması React tarafından yapılır
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    

    
    react: {
      useSuspense: false,
    },
    
    // Namespace yapılandırması
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Kayıp key davranışı
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, _ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${key} (${lng})`);
      }
    },
  });

// Dil değiştiğinde çalışacak callback
i18n.on('languageChanged', (lng) => {
  // HTML lang attribute güncelle
  document.documentElement.lang = lng;
  
  // RTL kontrolü
  const isRTL = RTL_LANGUAGES.includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  
  // Body class güncelleme
  if (isRTL) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
  
  // Meta tag güncelleme
  const metaLang = document.querySelector('meta[name="language"]');
  if (metaLang) {
    metaLang.setAttribute('content', lng);
  }
});

export default i18n;

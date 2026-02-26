// CVK Dijital - Dil Servisi
import i18n from '../i18n/config';

// Desteklenen diller
export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'tr';

// Mevcut dili al
export const getCurrentLanguage = (): string => {
  return i18n.language || DEFAULT_LANGUAGE;
};

// Dil değiştir
export const changeLanguage = async (code: string): Promise<boolean> => {
  try {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    if (!lang) {
      console.error(`Unsupported language: ${code}`);
      return false;
    }

    await i18n.changeLanguage(code);
    
    // HTML lang ve dir attribute güncelle
    document.documentElement.lang = code;
    document.documentElement.dir = lang.dir;
    
    // RTL için body class ekle/kaldır
    if (lang.dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
    
    // LocalStorage'a kaydet
    localStorage.setItem('i18nextLng', code);
    
    return true;
  } catch (error) {
    console.error('Language change error:', error);
    return false;
  }
};

// Varsayılan dili algıla
export const detectLanguage = (): string => {
  // 1. LocalStorage kontrolü
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && SUPPORTED_LANGUAGES.find(l => l.code === savedLang)) {
    return savedLang;
  }

  // 2. Tarayıcı dilini kontrol et
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.find(l => l.code === browserLang)) {
    return browserLang;
  }

  // 3. Varsayılan dile dön
  return DEFAULT_LANGUAGE;
};

// RTL kontrolü
export const isRTL = (code?: string): boolean => {
  const langCode = code || getCurrentLanguage();
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return lang?.dir === 'rtl' || false;
};

// Dil bilgisi al
export const getLanguageInfo = (code?: string) => {
  const langCode = code || getCurrentLanguage();
  return SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
};

// Tüm dilleri al
export const getSupportedLanguages = () => {
  return [...SUPPORTED_LANGUAGES];
};

// Çeviri fonksiyonu (direkt i18n kullanımı yerine)
export const translate = (key: string, options?: Record<string, any>): string => {
  return i18n.t(key, options);
};

// Event listeners
export const onLanguageChanged = (callback: (lng: string) => void) => {
  i18n.on('languageChanged', callback);
  return () => i18n.off('languageChanged', callback);
};

// Initialize language
export const initializeLanguage = () => {
  const detectedLang = detectLanguage();
  changeLanguage(detectedLang);
};

export default {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getCurrentLanguage,
  changeLanguage,
  detectLanguage,
  isRTL,
  getLanguageInfo,
  getSupportedLanguages,
  translate,
  onLanguageChanged,
  initializeLanguage,
};

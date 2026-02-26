// CVK Dijital - Dil Yönetimi Hook'u
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../services/languageService';

export interface LanguageState {
  currentLanguage: string;
  isRTL: boolean;
  isLoading: boolean;
}

export interface LanguageActions {
  setLanguage: (code: string) => Promise<void>;
  toggleLanguage: () => void;
  detectLanguage: () => string;
}

export const useLanguage = (): [LanguageState, LanguageActions] => {
  const [isLoading, setIsLoading] = useState(false);

  // Mevcut dil bilgisi
  const currentLanguage = getCurrentLanguage() || 'tr';
  const isRTL = currentLanguage === 'ar';

  // Dil değiştirme
  const setLanguage = useCallback(async (code: string) => {
    if (code === currentLanguage) return;
    
    setIsLoading(true);
    try {
      await changeLanguage(code);
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Dil değiştir (toggle)
  const toggleLanguage = useCallback(() => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex(l => l.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    setLanguage(SUPPORTED_LANGUAGES[nextIndex].code);
  }, [currentLanguage, setLanguage]);

  // Tarayıcı dilini algıla
  const detectLanguage = useCallback(() => {
    const browserLang = navigator.language.split('-')[0];
    const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
    
    if (supportedCodes.includes(browserLang)) {
      return browserLang;
    }
    
    return 'tr'; // Varsayılan
  }, []);

  // İlk yüklemede tarayıcı dilini kontrol et
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (!savedLang) {
      const detectedLang = detectLanguage();
      if (detectedLang !== currentLanguage) {
        setLanguage(detectedLang);
      }
    }
  }, []);

  // HTML lang attribute güncelleme
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage, isRTL]);

  return [
    { currentLanguage, isRTL, isLoading },
    { setLanguage, toggleLanguage, detectLanguage },
  ];
};

// Çeviri fonksiyonu ile dinamik anahtar oluşturma
export const useTranslate = () => {
  const { t } = useTranslation();

  const translate = useCallback(
    (key: string, options?: Record<string, any>) => {
      return t(key, options);
    },
    [t]
  );

  const translateWithFallback = useCallback(
    (key: string, fallback: string, options?: Record<string, any>) => {
      const translation = t(key, options);
      return translation === key ? fallback : translation;
    },
    [t]
  );

  return { translate, translateWithFallback, t };
};

// Format fonksiyonları
export const useFormat = () => {
  const { i18n } = useTranslation();

  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      });
    },
    [i18n.language]
  );

  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions) => {
      return num.toLocaleString(i18n.language, options);
    },
    [i18n.language]
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string = 'EUR') => {
      return new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
      }).format(amount);
    },
    [i18n.language]
  );

  const formatRelativeTime = useCallback(
    (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

      const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
      }
    },
    [i18n.language]
  );

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
  };
};

export default useLanguage;

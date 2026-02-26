import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../services/languageService';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'minimal';
  showFlag?: boolean;
  showName?: boolean;
}

export default function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showName = true,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage() || 'tr');
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = (code: string) => {
    if (code !== currentLang) {
      changeLanguage(code);
    }
    setIsOpen(false);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);

  // Minimal variant - sadece düğme
  if (variant === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors text-sm"
        >
          {showFlag && <span className="text-base">{currentLanguage?.flag}</span>}
          {showName && <span className="uppercase font-medium">{currentLang}</span>}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    currentLang === lang.code ? 'bg-blue-50 text-[#0077be]' : 'text-gray-700'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {currentLang === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Buttons variant - yatay düğmeler
  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentLang === lang.code
                ? 'bg-white text-[#0077be] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {showFlag && <span>{lang.flag}</span>}
            {showName && <span>{lang.code.toUpperCase()}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          isOpen
            ? 'bg-[#0077be]/10 text-[#0077be]'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Globe className={`w-5 h-5 transition-transform ${isAnimating ? 'animate-spin' : ''}`} />
        {showFlag && <span className="text-lg">{currentLanguage?.flag}</span>}
        {showName && (
          <span className="font-medium hidden sm:block">{currentLanguage?.name}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Dil Seçimi
              </p>
            </div>
            
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all max-w-[calc(100%-16px)] ${
                  currentLang === lang.code
                    ? 'bg-gradient-to-r from-[#0077be]/10 to-[#00a8e8]/10 text-[#0077be]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-xs text-gray-400">{lang.code.toUpperCase()}</p>
                </div>
                {currentLang === lang.code && (
                  <div className="w-6 h-6 rounded-full bg-[#0077be] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}

            <div className="px-4 py-3 mt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Daha fazla dil yakında...
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

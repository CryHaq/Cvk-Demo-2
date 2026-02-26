import { Instagram, Facebook, Linkedin, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function TopBar() {
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-[#7cb342] text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left - Announcement */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            Prezzi e tempi di consegna ridotti 🚀
          </span>
        </div>

        {/* Center - Social & Support */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3">
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          <span className="text-sm">
            Assistenza clienti: LUN-VEN 09:00 – 13:00
          </span>
        </div>

        {/* Right - Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          >
            <span>{selectedLang.flag}</span>
            <span>{selectedLang.name}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

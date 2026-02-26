import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    if (!cookieChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[480px] z-50">
      <div className="bg-[#7c4dff] rounded-2xl p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-white font-semibold text-lg mb-3">
          Informativa
        </h3>

        <p className="text-white/80 text-sm mb-6 leading-relaxed">
          CVK Dijital e 7 terze parti selezionate utilizzano cookie o tecnologie simili per finalità tecniche e, con il tuo consenso, anche per le finalità di funzionalità, esperienza, misurazione e marketing (con annunci personalizzati) come specificato nella cookie policy.
          <br /><br />
          Usa il pulsante "Accetta" per acconsentire. Usa il pulsante "Rifiuta" o chiudi questa informativa per continuare senza accettare.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              Rifiuta
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-[#7cb342] hover:bg-[#6a9e38] text-white"
            >
              Accetta
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full text-white/80 hover:text-white hover:bg-white/10"
          >
            Scopri di più e personalizza
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const phoneNumber = '+905340000000'; // CVK Dijital WhatsApp numarası
  const message = 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.';

  useEffect(() => {
    // İlk 5 saniye sonra otomatik sallanma animasyonu
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const quickMessages = [
    { icon: '📦', text: 'Sipariş takibi', message: 'Siparişimi takip etmek istiyorum' },
    { icon: '💰', text: 'Fiyat teklifi', message: 'Tabela için fiyat teklifi almak istiyorum' },
    { icon: '🎨', text: 'Tasarım desteği', message: 'Tasarım desteği almak istiyorum' },
    { icon: '❓', text: 'Bilgi almak', message: 'Ürünler hakkında bilgi almak istiyorum' },
  ];

  return (
    <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">CVK Dijital</h3>
                    <p className="text-xs text-white/80">Genellikle 1 dakika içinde yanıt verir</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-2 bg-gray-50">
              <p className="text-sm text-gray-500 mb-3">Nasıl yardımcı olabiliriz?</p>
              {quickMessages.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(item.message)}`;
                    window.open(url, '_blank');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-[#25D366]/30 transition-all text-left group"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-700 group-hover:text-[#25D366] transition-colors">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-gray-100 text-center">
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Sohbet Başlat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full shadow-lg shadow-[#25D366]/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-[#25D366]/40 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={hasAnimated && !isOpen ? {
          rotate: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5, repeat: 0 }
        } : {}}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </motion.button>

      {/* Notification Badge */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"
        />
      )}
    </div>
  );
}

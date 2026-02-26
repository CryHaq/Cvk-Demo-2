import { useState } from 'react';
import { Bell, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface StockNotificationProps {
  productId: number;
  productName: string;
}

export default function StockNotification({ productId, productName }: StockNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check if already subscribed
  const checkSubscription = () => {
    const subscriptions = JSON.parse(localStorage.getItem('stockNotifications') || '[]');
    return subscriptions.some((sub: any) => sub.productId === productId);
  };

  const [alreadySubscribed, setAlreadySubscribed] = useState(checkSubscription());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save to localStorage (in production, this would be an API call)
    const subscriptions = JSON.parse(localStorage.getItem('stockNotifications') || '[]');
    subscriptions.push({
      productId,
      productName,
      email,
      date: new Date().toISOString(),
    });
    localStorage.setItem('stockNotifications', JSON.stringify(subscriptions));

    setIsLoading(false);
    setIsSubscribed(true);
    setAlreadySubscribed(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsOpen(false);
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  const handleUnsubscribe = () => {
    const subscriptions = JSON.parse(localStorage.getItem('stockNotifications') || '[]');
    const updated = subscriptions.filter((sub: any) => sub.productId !== productId);
    localStorage.setItem('stockNotifications', JSON.stringify(updated));
    setAlreadySubscribed(false);
  };

  if (alreadySubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
        <Check className="w-4 h-4" />
        <span>Stok bildirimine kayıtlısınız</span>
        <button 
          onClick={handleUnsubscribe}
          className="text-green-700 hover:text-green-800 underline ml-2"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-[#0077be] hover:text-[#005a8f] transition-colors"
      >
        <Bell className="w-4 h-4" />
        <span>Stokta yok - Gelince haber ver</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120]"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[121] p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {isSubscribed ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Başarılı!</h3>
                    <p className="text-gray-600">
                      Ürün stoklara girince size e-posta ile haber vereceğiz.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0077be]/10 rounded-xl flex items-center justify-center">
                          <Bell className="w-6 h-6 text-[#0077be]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Stok Bildirimi</h3>
                          <p className="text-sm text-gray-500">Ürün stoklara girince haber verelim</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{productName}</span> şu anda stokta yok. 
                        E-posta adresinizi bırakın, ürün stoklara girince ilk siz haber alın.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-posta Adresiniz
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ornek@email.com"
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:border-[#0077be] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0077be] hover:bg-[#005a8f] text-white py-6"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Bell className="w-5 h-5 mr-2" />
                            Beni Haberdar Et
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Bildirim isteğinizi istediğiniz zaman iptal edebilirsiniz.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

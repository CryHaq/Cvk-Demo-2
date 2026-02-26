import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Page } from '../App';

interface PaymentSuccessProps {
  onNavigate: (page: Page) => void;
}

export default function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const { clearCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order');
    if (order) {
      setOrderNumber(order);
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ödemeniz Başarıyla Alındı!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Siparişiniz onaylandı ve üretim sürecine alındı. 
            Sipariş detayları e-posta adresinize gönderildi.
          </p>

          {orderNumber && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Sipariş Numarası</p>
              <p className="text-2xl font-bold text-[#0077be] font-mono">{orderNumber}</p>
            </div>
          )}

          {/* Order Status Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-500 mt-1">Onaylandı</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-200">
                <div className="w-0 h-full bg-green-500"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs text-gray-500 mt-1">Üretim</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs text-gray-500 mt-1">Kargo</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onNavigate('order-tracking')}
            >
              <Package className="w-4 h-4" />
              Sipariş Takip
            </Button>
            <Button
              className="cvk-btn-primary flex items-center gap-2"
              onClick={() => onNavigate('shop')}
            >
              Alışverişe Devam Et
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Üretim Süreci
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Siparişiniz yaklaşık 15 iş günü içinde hazırlanacaktır. 
              Durum değişikliklerinde e-posta ile bilgilendirileceksiniz.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Yardım mı Lazım?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sorularınız için bizimle iletişime geçebilirsiniz. 
              Müşteri hizmetleri: info@cvkdijital.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

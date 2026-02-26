import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';
import type { Page } from '../App';

interface PaymentFailedProps {
  onNavigate: (page: Page) => void;
}

export default function PaymentFailed({ onNavigate }: PaymentFailedProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderNumber(params.get('order') || '');
    setErrorMessage(params.get('error') || '');
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ödeme İşlemi Başarısız
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ödeme işleminiz tamamlanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.
          </p>

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-700 dark:text-red-400 text-sm">
                Hata: {decodeURIComponent(errorMessage)}
              </p>
            </div>
          )}

          {orderNumber && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Sipariş Numarası</p>
              <p className="text-xl font-bold text-gray-700 font-mono">{orderNumber}</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Olası Nedenler:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Kartınızda yetersiz bakiye</li>
              <li>• Banka tarafından reddedilen işlem</li>
              <li>• 3D Secure doğrulama hatası</li>
              <li>• Bağlantı sorunları</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
            <Button
              className="cvk-btn-primary flex items-center gap-2"
              onClick={() => onNavigate('checkout')}
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#0077be]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-[#0077be]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Yardım mı Lazım?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Ödeme sorunlarınız için müşteri hizmetlerimizle iletişime geçebilirsiniz.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>E-posta: info@cvkdijital.com</p>
                <p>Telefon: +90 212 XXX XX XX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

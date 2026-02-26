import { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, Download, RefreshCw, Check, 
  Smartphone, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '../hooks/usePWA';

export default function PWAStatus() {
  const [state, actions] = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  // Install prompt gösterimi
  useEffect(() => {
    if (state.canInstall && !dismissedInstall && !state.isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // 5 saniye sonra göster
      return () => clearTimeout(timer);
    }
  }, [state.canInstall, dismissedInstall, state.isInstalled]);

  // Update banner gösterimi
  useEffect(() => {
    if (state.isUpdateAvailable) {
      setShowUpdateBanner(true);
    }
  }, [state.isUpdateAvailable]);

  // Offline banner gösterimi
  useEffect(() => {
    if (!state.isOnline) {
      setShowOfflineBanner(true);
    } else {
      setShowOfflineBanner(false);
    }
  }, [state.isOnline]);

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDismissedInstall(true);
  };

  const handleInstall = async () => {
    await actions.install();
    setShowInstallPrompt(false);
  };

  const handleUpdate = async () => {
    await actions.update();
    setShowUpdateBanner(false);
  };

  // Offline Banner (Üstte sabit)
  if (showOfflineBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Bağlantı Yok</p>
              <p className="text-sm text-white/80">Çevrimdışı moddasınız. Bazı özellikler sınırlı olabilir.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yeniden Dene
            </Button>
            <button 
              onClick={() => setShowOfflineBanner(false)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Update Banner
  if (showUpdateBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#0077be] to-[#00a8e8] text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="font-semibold">Yeni Güncelleme Mevcut</p>
              <p className="text-sm text-white/80">Uygulamanın yeni versiyonu hazır. Şimdi güncelleyin!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleUpdate}
              className="bg-white text-[#0077be] hover:bg-gray-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Güncelle
            </Button>
            <button 
              onClick={() => setShowUpdateBanner(false)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Install Prompt
  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-[400px] z-50">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1">Uygulamayı Yükleyin</h4>
              <p className="text-gray-600 text-sm mb-4">
                CVK Dijital'i ana ekranınıza ekleyin. Daha hızlı erişim ve çevrimdışı kullanım için!
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="bg-[#0077be] hover:bg-[#005a8f] text-white flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Yükle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDismissInstall}
                  className="flex-1"
                >
                  Şimdi Değil
                </Button>
              </div>
            </div>
            <button 
              onClick={handleDismissInstall}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Durum göstergesi (küçük)
  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2">
      {/* Online/Offline durumu */}
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
          state.isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}
      >
        {state.isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-medium">Çevrimiçi</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">Çevrimdışı</span>
          </>
        )}
      </div>

      {/* Install durumu */}
      {state.isInstalled && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0077be] text-white rounded-full shadow-lg">
          <Check className="w-4 h-4" />
          <span className="text-xs font-medium">Yüklü</span>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bell, BellRing, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PushPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  subscription: PushSubscription | null;
}

export default function PushNotificationManager() {
  const [state, setState] = useState<PushPermissionState>({
    permission: 'default',
    isSupported: false,
    subscription: null,
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    const permission = Notification.permission;
    
    // Mevcut subscription'ı kontrol et
    let subscription = null;
    try {
      const registration = await navigator.serviceWorker.ready;
      subscription = await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Push subscription check failed:', error);
    }

    setState({
      permission,
      isSupported: true,
      subscription,
    });

    // İzin isteme prompt'ını göster
    if (permission === 'default') {
      const dismissed = localStorage.getItem('cvk_push_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 10000); // 10 saniye sonra
      }
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await subscribeToPush();
      }
      
      setState(prev => ({ ...prev, permission }));
      setShowPrompt(false);
    } catch (error) {
      console.error('Push permission request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key (production'da gerçek key kullanılmalı)
      const vapidPublicKey = 'BEl62iM...'; // Örnek, değiştirilmeli
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // Subscription'ı sunucuya gönder
      await sendSubscriptionToServer(subscription);
      
      setState(prev => ({ ...prev, subscription }));
      
      // Test bildirimi gönder
      showTestNotification();
      
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (state.subscription) {
        await state.subscription.unsubscribe();
        await deleteSubscriptionFromServer(state.subscription);
        setState(prev => ({ ...prev, subscription: null }));
      }
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    // Production'da bu endpoint değişecek
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.log('Server subscription failed (expected in dev):', error);
    }
  };

  const deleteSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    } catch (error) {
      console.log('Server unsubscription failed (expected in dev):', error);
    }
  };

  const showTestNotification = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('CVK Dijital', {
          body: 'Bildirimler başarıyla etkinleştirildi! 🎉',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'welcome',
        });
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('cvk_push_dismissed', 'true');
  };

  // Base64'ü Uint8Array'e çevir (VAPID için)
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Desteklenmiyorsa gösterme
  if (!state.isSupported) return null;

  // Zaten izin verilmişse ayarlar butonu göster
  if (state.permission === 'granted') {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowPrompt(true)}
          className="flex items-center gap-2 px-3 py-2 bg-[#0077be] text-white rounded-full shadow-lg hover:bg-[#005a8f] transition-colors"
          title="Bildirim Ayarları"
        >
          <BellRing className="w-4 h-4" />
          <span className="text-xs font-medium">Bildirimler Açık</span>
        </button>

        {showPrompt && (
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Bildirim Ayarları</h4>
              <button onClick={() => setShowPrompt(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Bildirimler şu anda açık. Kapatmak ister misiniz?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={unsubscribeFromPush}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Bildirimleri Kapat
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Reddedilmişse gösterme
  if (state.permission === 'denied') return null;

  // İzin isteme prompt'ı
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[400px] z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-in slide-in-from-bottom-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg mb-1">Bildirimleri Etkinleştir</h4>
            <p className="text-gray-600 text-sm mb-4">
              Sipariş durumu, kampanyalar ve yeni ürünlerden haberdar olmak için bildirimleri açın.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={requestPermission}
                disabled={isLoading}
                className="bg-[#0077be] hover:bg-[#005a8f] text-white flex-1"
              >
                {isLoading ? (
                  <span className="animate-pulse">İşleniyor...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    İzin Ver
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDismiss}
                className="flex-1"
              >
                Sonra
              </Button>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

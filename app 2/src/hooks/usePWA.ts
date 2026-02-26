import { useState, useEffect, useCallback } from 'react';

export interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

export interface PWAActions {
  install: () => Promise<void>;
  update: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

export const usePWA = (): [PWAState, PWAActions] => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Service Worker kaydet
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] SW registered:', registration);
          setSwRegistration(registration);

          // Yeni versiyon kontrolü
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] SW registration failed:', error);
        });

      // Controller değişikliğini dinle (update tamamlandığında)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  // Online/Offline durumunu izle
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install prompt'u yakala
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Uygulama zaten yüklü mü?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Uygulamayı yükle
  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] App installed');
      setIsInstalled(true);
    } else {
      console.log('[PWA] App install dismissed');
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  // Service Worker'ı güncelle
  const update = useCallback(async () => {
    if (swRegistration && swRegistration.waiting) {
      // Yeni versiyona geç
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setIsUpdateAvailable(false);
    }
  }, [swRegistration]);

  // Manuel güncelleme kontrolü
  const checkForUpdates = useCallback(async () => {
    if (swRegistration) {
      try {
        await swRegistration.update();
        console.log('[PWA] Checked for updates');
      } catch (error) {
        console.error('[PWA] Update check failed:', error);
      }
    }
  }, [swRegistration]);

  return [
    { isInstalled, isOnline, canInstall, isUpdateAvailable, swRegistration },
    { install, update, checkForUpdates },
  ];
};

export default usePWA;

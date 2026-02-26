// CVK Dijital - Service Worker
// PWA Offline Support

const CACHE_NAME = 'cvk-dijital-v1';
const STATIC_CACHE = 'cvk-static-v1';
const DYNAMIC_CACHE = 'cvk-dynamic-v1';
const IMAGE_CACHE = 'cvk-images-v1';

// Precache - Temel sayfalar ve assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js'
];

// Install event - Precache temel dosyalar
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Precache failed:', err);
      })
  );
});

// Activate event - Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - Cache stratejileri
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API istekleri - Network first
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/php/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Görseller - Cache first, stale while revalidate
  if (request.destination === 'image') {
    event.respondWith(cacheFirstWithRevalidate(request, IMAGE_CACHE));
    return;
  }
  
  // Fontlar - Cache first
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // CSS/JS - Stale while revalidate
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }
  
  // HTML sayfaları - Network first
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
  
  // Diğer istekler - Cache first
  event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
});

// Cache stratejileri

// 1. Cache First - Önce cache'de ara, yoksa network'ten al
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

// 2. Network First - Önce network'ten al, hata olursa cache'den göster
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// 3. Network First with Offline Fallback - HTML sayfalar için
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving offline page');
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Offline fallback
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    throw error;
  }
}

// 4. Stale While Revalidate - Cache'den göster, arka planda güncelle
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error);
    });
  
  if (cached) {
    fetchPromise; // Arka planda güncelle
    return cached;
  }
  
  return fetchPromise;
}

// 5. Cache First with Revalidate - Görseller için
async function cacheFirstWithRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Arka planda güncelle
  fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse);
      }
    })
    .catch(() => {});
  
  if (cached) {
    return cached;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

// Background Sync - Çevrimdışı işlemleri senkronize et
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrderData());
  }
});

async function syncCartData() {
  console.log('[SW] Syncing cart data...');
  // LocalStorage'dan sepet verilerini al ve sunucuya gönder
  // Bu kısım IndexedDB ile daha iyi yönetilebilir
}

async function syncOrderData() {
  console.log('[SW] Syncing order data...');
  // Bekleyen siparişleri senkronize et
}

// Push Notifications - Push bildirimlerini yönet
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: false,
    tag: data.tag || 'general',
    renotify: true,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'CVK Dijital',
      options
    )
  );
});

// Notification Click - Bildirim tıklamalarını yönet
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const notificationData = event.notification.data;
  let url = '/';
  
  if (notificationData?.url) {
    url = notificationData.url;
  } else if (notificationData?.orderId) {
    url = `/order-tracking?order=${notificationData.orderId}`;
  } else if (notificationData?.productId) {
    url = `/shop`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Açık bir pencere var mı kontrol et
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Yoksa yeni pencere aç
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Message from client - Ana uygulamadan gelen mesajları dinle
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic Background Sync - Periyodik senkronizasyon (destekleniyorsa)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  console.log('[SW] Periodic sync - updating content...');
  // Periyodik güncellemeler (kampanyalar, yeni ürünler vb.)
}

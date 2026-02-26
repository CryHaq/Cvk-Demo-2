/**
 * Offline Queue Service
 * 
 * İnternet bağlantısı olmadığında işlemleri kuyruğa alır
 * Bağlantı gelince otomatik senkronize eder
 */

import { toast } from '@/components/Toast';

export type QueueActionType = 
  | 'order' 
  | 'contact' 
  | 'cart_update' 
  | 'profile_update' 
  | 'newsletter_subscribe'
  | 'sample_kit_request'
  | 'blog_comment';

export interface QueuedAction {
  id: string;
  type: QueueActionType;
  data: any;
  timestamp: number;
  retryCount: number;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface SyncResult {
  success: boolean;
  actionId: string;
  error?: string;
}

const QUEUE_STORAGE_KEY = 'cvk_offline_queue';
const SYNC_INTERVAL = 30000; // 30 saniye

class OfflineQueueService {
  private queue: QueuedAction[] = [];

  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(queue: QueuedAction[]) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupEventListeners();
    this.startSyncInterval();
  }

  // Event listener'ları ayarla
  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.showOnlineNotification();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.showOfflineNotification();
    });

    // Sayfa görünür olduğunda senkronize et
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.processQueue();
      }
    });
  }

  // Senkronizasyon interval'ını başlat
  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.queue.length > 0) {
        this.processQueue();
      }
    }, SYNC_INTERVAL);
  }

  // Queue'yu localStorage'dan yükle
  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Queue yüklenirken hata:', error);
    }
  }

  // Queue'yu localStorage'a kaydet
  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Queue kaydedilirken hata:', error);
    }
  }

  // Listener'ları bilgilendir
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  // Yeni işlem ekle
  public enqueue(
    type: QueueActionType, 
    data: any, 
    endpoint?: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): string {
    const action: QueuedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      endpoint,
      method,
    };

    this.queue.push(action);
    this.saveQueue();

    // Online isek hemen işle
    if (navigator.onLine) {
      this.processQueue();
    } else {
      toast.info('İnternet bağlantısı yok. İşlem kuyruğa alındı ve bağlantı gelince otomatik gönderilecek.');
    }

    return action.id;
  }

  // İşlemi kuyruktan kaldır
  public dequeue(actionId: string): boolean {
    const index = this.queue.findIndex(a => a.id === actionId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveQueue();
      return true;
    }
    return false;
  }

  // Kuyruğu işle
  public async processQueue(): Promise<SyncResult[]> {
    if (!navigator.onLine || this.queue.length === 0) {
      return [];
    }

    const results: SyncResult[] = [];
    const processedIds: string[] = [];

    for (const action of [...this.queue]) {
      try {
        const result = await this.processAction(action);
        results.push(result);

        if (result.success) {
          processedIds.push(action.id);
        } else {
          // Başarısız olanın retry count'unu artır
          action.retryCount++;
          if (action.retryCount >= 3) {
            // 3 denemeden sonra çıkar
            processedIds.push(action.id);
            toast.error(`${action.type} işlemi 3 kez denendi ve başarısız oldu.`);
          }
        }
      } catch (error) {
        console.error('İşlem hatası:', error);
        results.push({
          success: false,
          actionId: action.id,
          error: 'Bilinmeyen hata',
        });
      }
    }

    // Başarılı işlemleri kuyruktan çıkar
    this.queue = this.queue.filter(a => !processedIds.includes(a.id));
    this.saveQueue();

    // Sonuçları göster
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      toast.success(`${successCount} işlem başarıyla senkronize edildi.`);
    }

    return results;
  }

  // Tek bir işlemi işle
  private async processAction(action: QueuedAction): Promise<SyncResult> {
    try {
      switch (action.type) {
        case 'order':
          return await this.processOrder(action);
        case 'contact':
          return await this.processContact(action);
        case 'newsletter_subscribe':
          return await this.processNewsletter(action);
        case 'sample_kit_request':
          return await this.processSampleKit(action);
        case 'blog_comment':
          return await this.processBlogComment(action);
        default:
          // Endpoint varsa fetch ile dene
          if (action.endpoint) {
            return await this.processGeneric(action);
          }
          return { success: false, actionId: action.id, error: 'Bilinmeyen işlem tipi' };
      }
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  // Sipariş işle
  private async processOrder(action: QueuedAction): Promise<SyncResult> {
    try {
      // Mock API kullan (localStorage)
      const orders = JSON.parse(localStorage.getItem('cvk_mock_orders') || '[]');
      const orderNumber = `CVK-${Date.now()}`;
      
      const newOrder = {
        id: Date.now(),
        order_number: orderNumber,
        ...action.data,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      };

      orders.push(newOrder);
      localStorage.setItem('cvk_mock_orders', JSON.stringify(orders));

      return { success: true, actionId: action.id };
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: 'Sipariş kaydedilemedi',
      };
    }
  }

  // İletişim formu işle
  private async processContact(action: QueuedAction): Promise<SyncResult> {
    try {
      const messages = JSON.parse(localStorage.getItem('cvk_contact_messages') || '[]');
      messages.push({
        id: Date.now(),
        ...action.data,
        status: 'new',
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('cvk_contact_messages', JSON.stringify(messages));

      return { success: true, actionId: action.id };
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: 'Mesaj kaydedilemedi',
      };
    }
  }

  // Newsletter işle
  private async processNewsletter(action: QueuedAction): Promise<SyncResult> {
    try {
      const subscribers = JSON.parse(localStorage.getItem('cvk_newsletter') || '[]');
      if (!subscribers.find((s: any) => s.email === action.data.email)) {
        subscribers.push({
          email: action.data.email,
          name: action.data.name,
          subscribed_at: new Date().toISOString(),
        });
        localStorage.setItem('cvk_newsletter', JSON.stringify(subscribers));
      }
      return { success: true, actionId: action.id };
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: 'Abonelik kaydedilemedi',
      };
    }
  }

  // Numune seti işle
  private async processSampleKit(action: QueuedAction): Promise<SyncResult> {
    try {
      const requests = JSON.parse(localStorage.getItem('cvk_sample_requests') || '[]');
      requests.push({
        id: Date.now(),
        ...action.data,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('cvk_sample_requests', JSON.stringify(requests));
      return { success: true, actionId: action.id };
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: 'Numune talebi kaydedilemedi',
      };
    }
  }

  // Blog yorumu işle
  private async processBlogComment(action: QueuedAction): Promise<SyncResult> {
    try {
      const comments = JSON.parse(
        localStorage.getItem(`blog_comments_${action.data.postId}`) || '[]'
      );
      comments.push({
        id: Date.now(),
        ...action.data,
        status: 'pending',
        date: new Date().toLocaleDateString('tr-TR'),
      });
      localStorage.setItem(
        `blog_comments_${action.data.postId}`,
        JSON.stringify(comments)
      );
      return { success: true, actionId: action.id };
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: 'Yorum kaydedilemedi',
      };
    }
  }

  // Genel fetch işlemi
  private async processGeneric(action: QueuedAction): Promise<SyncResult> {
    try {
      if (!action.endpoint) {
        throw new Error('Endpoint belirtilmemiş');
      }

      const response = await fetch(action.endpoint, {
        method: action.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action.data),
      });

      if (response.ok) {
        return { success: true, actionId: action.id };
      } else {
        return {
          success: false,
          actionId: action.id,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        actionId: action.id,
        error: 'Bağlantı hatası',
      };
    }
  }

  // Kuyruk durumunu al
  public getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  // Bekleyen işlem sayısı
  public getPendingCount(): number {
    return this.queue.length;
  }

  // Online durumu
  public isOnlineStatus(): boolean {
    return navigator.onLine;
  }

  // Listener ekle
  public subscribe(listener: (queue: QueuedAction[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Tüm kuyruğu temizle
  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  // Bildirimler
  private showOnlineNotification() {
    toast.success('İnternet bağlantısı sağlandı! Bekleyen işlemler senkronize ediliyor...');
  }

  private showOfflineNotification() {
    toast.warning('İnternet bağlantısı kesildi. İşlemleriniz kuyruğa alınacak.');
  }

  // Servisi durdur
  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueueService();

// Hook için helper
export function useOfflineQueue() {
  return {
    enqueue: offlineQueue.enqueue.bind(offlineQueue),
    dequeue: offlineQueue.dequeue.bind(offlineQueue),
    processQueue: offlineQueue.processQueue.bind(offlineQueue),
    getQueue: offlineQueue.getQueue.bind(offlineQueue),
    getPendingCount: offlineQueue.getPendingCount.bind(offlineQueue),
    isOnline: offlineQueue.isOnlineStatus.bind(offlineQueue),
    clearQueue: offlineQueue.clearQueue.bind(offlineQueue),
    subscribe: offlineQueue.subscribe.bind(offlineQueue),
  };
}

export default offlineQueue;

/**
 * Stock Notification Service
 * 
 * Stokta olmayan ürünler için "Gelince Haber Ver" sistemi
 * - Kullanıcı e-posta bırakır
 * - Stok güncellenince otomatik bildirim
 * - Admin panelinde bekleme listesi
 */

import { toast } from '@/components/Toast';

export interface StockAlert {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  email: string;
  phone?: string;
  requestedAt: string;
  notifiedAt?: string;
  status: 'pending' | 'notified' | 'cancelled';
}

export interface StockAlertInput {
  productId: number;
  productName: string;
  productImage: string;
  email: string;
  phone?: string;
}

const STORAGE_KEY = 'cvk_stock_alerts';
const SUBSCRIBED_KEY = 'cvk_stock_subscribed';

class StockNotificationService {
  /**
   * Stok bildirimine kaydol
   */
  public subscribe(input: StockAlertInput): boolean {
    const alerts = this.getAllAlerts();
    
    // Aynı ürün ve e-posta kombinasyonu var mı kontrol et
    const existing = alerts.find(
      a => a.productId === input.productId && a.email === input.email && a.status === 'pending'
    );
    
    if (existing) {
      toast.info('Bu ürün için zaten bildirim kaydınız bulunuyor.');
      return false;
    }

    const newAlert: StockAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: input.productId,
      productName: input.productName,
      productImage: input.productImage,
      email: input.email,
      phone: input.phone,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    alerts.push(newAlert);
    this.saveAlerts(alerts);
    
    // Kullanıcının aboneliklerini de kaydet
    this.addToUserSubscriptions(input.email, input.productId);
    
    toast.success('Stok gelince size haber vereceğiz!');
    return true;
  }

  /**
   * Bildirim iptal et
   */
  public cancel(alertId: string): void {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.status = 'cancelled';
      this.saveAlerts(alerts);
      toast.success('Bildirim iptal edildi.');
    }
  }

  /**
   * Stok güncellendiğinde bildirim gönder
   */
  public checkAndNotify(productId: number, newStock: number): StockAlert[] {
    if (newStock <= 0) return [];

    const alerts = this.getAllAlerts();
    const pendingAlerts = alerts.filter(
      a => a.productId === productId && a.status === 'pending'
    );

    const notified: StockAlert[] = [];

    for (const alert of pendingAlerts) {
      // Bildirim gönderildi olarak işaretle
      alert.status = 'notified';
      alert.notifiedAt = new Date().toISOString();
      notified.push(alert);

      // Mock: Console'a bildirim mesajı yaz
      console.log(`[STOCK ALERT] ${alert.email} için ${alert.productName} stoğa girdi!`);
      
      // Gerçek uygulamada burada e-posta gönderilecek
      this.sendNotificationEmail(alert);
    }

    if (notified.length > 0) {
      this.saveAlerts(alerts);
    }

    return notified;
  }

  /**
   * Bildirim gönder (mock)
   */
  private sendNotificationEmail(alert: StockAlert): void {
    // Gerçek uygulamada burada e-posta API çağrılacak
    // fetch('/php/send_stock_notification.php', { method: 'POST', body: JSON.stringify(alert) });
    
    setTimeout(() => {
      toast.success(`[MOCK] ${alert.email} adresine bildirim gönderildi: ${alert.productName} stoğa girdi!`);
    }, 1000);
  }

  /**
   * Tüm bildirimleri getir (Admin için)
   */
  public getAllAlerts(): StockAlert[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Bekleyen bildirimleri getir
   */
  public getPendingAlerts(): StockAlert[] {
    return this.getAllAlerts().filter(a => a.status === 'pending');
  }

  /**
   * Ürüne göre bildirimleri getir
   */
  public getAlertsByProduct(productId: number): StockAlert[] {
    return this.getAllAlerts().filter(a => a.productId === productId);
  }

  /**
   * Kullanıcının aboneliklerini getir
   */
  public getUserSubscriptions(email: string): StockAlert[] {
    return this.getAllAlerts().filter(
      a => a.email === email && a.status === 'pending'
    );
  }

  /**
   * Bildirimleri kaydet
   */
  private saveAlerts(alerts: StockAlert[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }

  /**
   * Kullanıcının abonelik listesine ekle
   */
  private addToUserSubscriptions(email: string, productId: number): void {
    const subscribed = this.getUserSubscribedProducts(email);
    if (!subscribed.includes(productId)) {
      subscribed.push(productId);
      localStorage.setItem(
        `${SUBSCRIBED_KEY}_${email}`,
        JSON.stringify(subscribed)
      );
    }
  }

  /**
   * Kullanıcının abone olduğu ürünleri getir
   */
  public getUserSubscribedProducts(email: string): number[] {
    try {
      return JSON.parse(localStorage.getItem(`${SUBSCRIBED_KEY}_${email}`) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Kullanıcı ürüne abone mi kontrol et
   */
  public isSubscribed(email: string, productId: number): boolean {
    return this.getUserSubscribedProducts(email).includes(productId);
  }

  /**
   * İstatistikler
   */
  public getStats(): {
    total: number;
    pending: number;
    notified: number;
    cancelled: number;
  } {
    const alerts = this.getAllAlerts();
    return {
      total: alerts.length,
      pending: alerts.filter(a => a.status === 'pending').length,
      notified: alerts.filter(a => a.status === 'notified').length,
      cancelled: alerts.filter(a => a.status === 'cancelled').length,
    };
  }

  /**
   * En çok talep edilen ürünler
   */
  public getMostWantedProducts(limit: number = 10): { productId: number; productName: string; count: number }[] {
    const alerts = this.getAllAlerts();
    const productCounts: { [key: number]: { name: string; count: number } } = {};

    for (const alert of alerts) {
      if (!productCounts[alert.productId]) {
        productCounts[alert.productId] = { name: alert.productName, count: 0 };
      }
      productCounts[alert.productId].count++;
    }

    return Object.entries(productCounts)
      .map(([productId, data]) => ({
        productId: parseInt(productId),
        productName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Toplu bildirim gönder (Admin için)
   */
  public notifyAllPending(): number {
    const pending = this.getPendingAlerts();
    let notified = 0;

    for (const alert of pending) {
      this.sendNotificationEmail(alert);
      alert.status = 'notified';
      alert.notifiedAt = new Date().toISOString();
      notified++;
    }

    this.saveAlerts(pending);
    return notified;
  }

  /**
   * Eski kayıtları temizle
   */
  public cleanupOldAlerts(days: number = 30): number {
    const alerts = this.getAllAlerts();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = alerts.filter(a => {
      if (a.status === 'pending') return true;
      const alertDate = new Date(a.notifiedAt || a.requestedAt);
      return alertDate > cutoffDate;
    });

    const removed = alerts.length - filtered.length;
    this.saveAlerts(filtered);
    return removed;
  }
}

// Singleton instance
export const stockNotification = new StockNotificationService();

// Hook için helper
export function useStockNotification() {
  return {
    subscribe: stockNotification.subscribe.bind(stockNotification),
    cancel: stockNotification.cancel.bind(stockNotification),
    checkAndNotify: stockNotification.checkAndNotify.bind(stockNotification),
    getPendingAlerts: stockNotification.getPendingAlerts.bind(stockNotification),
    getUserSubscriptions: stockNotification.getUserSubscriptions.bind(stockNotification),
    isSubscribed: stockNotification.isSubscribed.bind(stockNotification),
    getStats: stockNotification.getStats.bind(stockNotification),
    getMostWantedProducts: stockNotification.getMostWantedProducts.bind(stockNotification),
  };
}

export default stockNotification;

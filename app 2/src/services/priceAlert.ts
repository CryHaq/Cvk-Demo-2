/**
 * Price Alert Service
 * 
 * Fiyat Alarmı Sistemi
 * - Ürün fiyatı düşünce otomatik bildirim
 * - Hedef fiyat belirleme
 * - İndirim bildirimleri
 * - Fiyat geçmişi takibi
 */

import { toast } from '@/components/Toast';

export interface PriceAlert {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  email: string;
  phone?: string;
  status: 'active' | 'triggered' | 'cancelled' | 'expired';
  createdAt: string;
  triggeredAt?: string;
  expiresAt?: string;
}

export interface PriceHistory {
  productId: number;
  prices: {
    price: number;
    date: string;
    source?: string;
  }[];
}

export interface PriceAlertInput {
  productId: number;
  productName: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  email: string;
  phone?: string;
  expiryDays?: number;
}

const ALERTS_KEY = 'cvk_price_alerts';
const HISTORY_KEY = 'cvk_price_history';

class PriceAlertService {
  /**
   * Fiyat alarmı oluştur
   */
  public create(input: PriceAlertInput): PriceAlert {
    // Hedef fiyat kontrolü
    if (input.targetPrice >= input.currentPrice) {
      toast.error('Hedef fiyat mevcut fiyattan düşük olmalı.');
      throw new Error('Invalid target price');
    }

    const alerts = this.getAllAlerts();
    
    // Aynı ürün ve e-posta için aktif alarm var mı?
    const existing = alerts.find(
      a => a.productId === input.productId && 
           a.email === input.email && 
           a.status === 'active'
    );
    
    if (existing) {
      toast.info('Bu ürün için zaten aktif bir fiyat alarmınız var.');
      throw new Error('Alert already exists');
    }

    const now = new Date();
    const expiresAt = input.expiryDays 
      ? new Date(now.getTime() + input.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: input.productId,
      productName: input.productName,
      productImage: input.productImage,
      currentPrice: input.currentPrice,
      targetPrice: input.targetPrice,
      email: input.email,
      phone: input.phone,
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt,
    };

    alerts.push(newAlert);
    this.saveAlerts(alerts);
    
    // Fiyat geçmişine ekle
    this.addPriceHistory(input.productId, input.currentPrice, 'alert_created');
    
    toast.success(`Fiyat alarmı oluşturuldu! Hedef: €${input.targetPrice.toFixed(2)}`);
    return newAlert;
  }

  /**
   * Fiyat kontrolü ve alarm tetikleme
   */
  public checkPrice(productId: number, newPrice: number): PriceAlert[] {
    const alerts = this.getAllAlerts();
    const triggered: PriceAlert[] = [];
    
    // Fiyat geçmişine ekle
    this.addPriceHistory(productId, newPrice);
    
    for (const alert of alerts) {
      if (alert.productId !== productId || alert.status !== 'active') continue;
      
      // Süresi dolmuş mu kontrol et
      if (alert.expiresAt && new Date(alert.expiresAt) < new Date()) {
        alert.status = 'expired';
        continue;
      }
      
      // Hedef fiyata düştü mü?
      if (newPrice <= alert.targetPrice) {
        alert.status = 'triggered';
        alert.triggeredAt = new Date().toISOString();
        triggered.push(alert);
        
        // Bildirim gönder
        this.sendNotification(alert, newPrice);
      } else {
        // Mevcut fiyatı güncelle
        alert.currentPrice = newPrice;
      }
    }
    
    if (triggered.length > 0) {
      this.saveAlerts(alerts);
    }
    
    return triggered;
  }

  /**
   * Bildirim gönder (mock)
   */
  private sendNotification(alert: PriceAlert, currentPrice: number): void {
    const savings = alert.currentPrice - currentPrice;
    const savingsPercent = ((savings / alert.currentPrice) * 100).toFixed(0);
    
    console.log(`[PRICE ALERT] ${alert.email} için ${alert.productName} hedef fiyata düştü!`);
    console.log(`  Hedef: €${alert.targetPrice.toFixed(2)}`);
    console.log(`  Mevcut: €${currentPrice.toFixed(2)}`);
    console.log(`  Tasarruf: %${savingsPercent}`);
    
    setTimeout(() => {
      toast.success(
        `${alert.productName} hedef fiyatına düştü! €${currentPrice.toFixed(2)} (Tasarruf: %${savingsPercent})`
      );
    }, 500);
  }

  /**
   * Alarmı iptal et
   */
  public cancel(alertId: string): void {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert && alert.status === 'active') {
      alert.status = 'cancelled';
      this.saveAlerts(alerts);
      toast.success('Fiyat alarmı iptal edildi.');
    }
  }

  /**
   * Alarmı güncelle
   */
  public update(alertId: string, updates: Partial<PriceAlert>): void {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      Object.assign(alert, updates);
      this.saveAlerts(alerts);
      toast.success('Fiyat alarmı güncellendi.');
    }
  }

  /**
   * Tüm alarmları getir
   */
  public getAllAlerts(): PriceAlert[] {
    try {
      return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Aktif alarmları getir
   */
  public getActiveAlerts(): PriceAlert[] {
    return this.getAllAlerts().filter(a => a.status === 'active');
  }

  /**
   * Kullanıcının alarmlarını getir
   */
  public getUserAlerts(email: string): PriceAlert[] {
    return this.getAllAlerts()
      .filter(a => a.email === email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Ürüne göre alarmları getir
   */
  public getAlertsByProduct(productId: number): PriceAlert[] {
    return this.getAllAlerts().filter(a => a.productId === productId);
  }

  /**
   * Fiyat geçmişine ekle
   */
  public addPriceHistory(productId: number, price: number, source?: string): void {
    const histories = this.getAllPriceHistories();
    let history = histories.find(h => h.productId === productId);
    
    if (!history) {
      history = { productId, prices: [] };
      histories.push(history);
    }
    
    history.prices.push({
      price,
      date: new Date().toISOString(),
      source,
    });
    
    // Son 100 fiyatı tut
    if (history.prices.length > 100) {
      history.prices = history.prices.slice(-100);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(histories));
  }

  /**
   * Tüm fiyat geçmişlerini getir
   */
  public getAllPriceHistories(): PriceHistory[] {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Ürün fiyat geçmişini getir
   */
  public getPriceHistory(productId: number): PriceHistory | null {
    return this.getAllPriceHistories().find(h => h.productId === productId) || null;
  }

  /**
   * Ortalama fiyat hesapla
   */
  public getAveragePrice(productId: number, days: number = 30): number | null {
    const history = this.getPriceHistory(productId);
    if (!history || history.prices.length === 0) return null;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentPrices = history.prices.filter(p => new Date(p.date) >= cutoffDate);
    if (recentPrices.length === 0) return null;
    
    const sum = recentPrices.reduce((acc, p) => acc + p.price, 0);
    return Math.round((sum / recentPrices.length) * 100) / 100;
  }

  /**
   * En düşük fiyatı bul
   */
  public getLowestPrice(productId: number): { price: number; date: string } | null {
    const history = this.getPriceHistory(productId);
    if (!history || history.prices.length === 0) return null;
    
    const lowest = history.prices.reduce((min, p) => p.price < min.price ? p : min);
    return { price: lowest.price, date: lowest.date };
  }

  /**
   * İstatistikler
   */
  public getStats(): {
    total: number;
    active: number;
    triggered: number;
    avgTargetDiscount: number;
  } {
    const alerts = this.getAllAlerts();
    const active = alerts.filter(a => a.status === 'active');
    const triggered = alerts.filter(a => a.status === 'triggered');
    
    const totalDiscount = active.reduce((sum, a) => {
      const discount = ((a.currentPrice - a.targetPrice) / a.currentPrice) * 100;
      return sum + discount;
    }, 0);
    
    return {
      total: alerts.length,
      active: active.length,
      triggered: triggered.length,
      avgTargetDiscount: active.length > 0 ? Math.round((totalDiscount / active.length) * 10) / 10 : 0,
    };
  }

  /**
   * En çok alarm kurulan ürünler
   */
  public getMostTrackedProducts(limit: number = 10): { productId: number; productName: string; count: number }[] {
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
   * Süresi dolmuş alarmları temizle
   */
  public cleanupExpiredAlerts(): number {
    const alerts = this.getAllAlerts();
    const now = new Date();
    
    let cleaned = 0;
    for (const alert of alerts) {
      if (alert.status === 'active' && alert.expiresAt && new Date(alert.expiresAt) < now) {
        alert.status = 'expired';
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.saveAlerts(alerts);
    }
    
    return cleaned;
  }

  /**
   * Alarmları kaydet
   */
  private saveAlerts(alerts: PriceAlert[]): void {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }

  /**
   * Mock alarm oluştur (Demo için)
   */
  public seedMockAlert(): void {
    try {
      this.create({
        productId: 1,
        productName: 'Stand-Up Poşet',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        currentPrice: 0.45,
        targetPrice: 0.35,
        email: 'demo@example.com',
        expiryDays: 30,
      });
    } catch {
      // Zaten varsa atla
    }
  }
}

// Singleton instance
export const priceAlertService = new PriceAlertService();

// Hook için helper
export function usePriceAlert() {
  return {
    create: priceAlertService.create.bind(priceAlertService),
    cancel: priceAlertService.cancel.bind(priceAlertService),
    update: priceAlertService.update.bind(priceAlertService),
    checkPrice: priceAlertService.checkPrice.bind(priceAlertService),
    getUserAlerts: priceAlertService.getUserAlerts.bind(priceAlertService),
    getActiveAlerts: priceAlertService.getActiveAlerts.bind(priceAlertService),
    getPriceHistory: priceAlertService.getPriceHistory.bind(priceAlertService),
    getAveragePrice: priceAlertService.getAveragePrice.bind(priceAlertService),
    getLowestPrice: priceAlertService.getLowestPrice.bind(priceAlertService),
    getStats: priceAlertService.getStats.bind(priceAlertService),
    getMostTrackedProducts: priceAlertService.getMostTrackedProducts.bind(priceAlertService),
    cleanupExpiredAlerts: priceAlertService.cleanupExpiredAlerts.bind(priceAlertService),
  };
}

export default priceAlertService;

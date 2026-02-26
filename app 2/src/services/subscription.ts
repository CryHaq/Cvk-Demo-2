/**
 * Subscription Service
 * 
 * Abonelik / Periyodik Sipariş Sistemi
 * - Otomatik tekrarlayan siparişler
 * - Aylık/haftalık/periyodik gönderim
 * - Abonelik yönetimi (durdur, devam ettir, iptal et)
 * - Abone özel indirimleri
 */

import { toast } from '@/components/Toast';

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly';

export interface Subscription {
  id: string;
  userId: number;
  userEmail: string;
  items: SubscriptionItem[];
  frequency: SubscriptionFrequency;
  nextOrderDate: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
  };
  paymentMethod: string;
  discountPercent: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  lastOrderDate?: string;
}

export interface SubscriptionItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  options?: {
    size?: string;
    material?: string;
    color?: string;
  };
}

export interface SubscriptionInput {
  userId: number;
  userEmail: string;
  items: SubscriptionItem[];
  frequency: SubscriptionFrequency;
  shippingAddress: Subscription['shippingAddress'];
  paymentMethod: string;
  notes?: string;
  startDate?: string;
}

const SUBSCRIPTIONS_KEY = 'cvk_subscriptions';
const DISCOUNT_RATES: { [key in SubscriptionFrequency]: number } = {
  weekly: 5,
  biweekly: 7,
  monthly: 10,
  bimonthly: 12,
  quarterly: 15,
};

class SubscriptionService {
  /**
   * Yeni abonelik oluştur
   */
  public create(input: SubscriptionInput): Subscription {
    const subscriptions = this.getAllSubscriptions();
    
    // Bir sonraki sipariş tarihini hesapla
    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const nextOrderDate = this.calculateNextDate(startDate, input.frequency);
    
    // İndirim oranını belirle
    const discountPercent = DISCOUNT_RATES[input.frequency];
    
    // Toplam tutarı hesapla
    const subtotal = input.items.reduce((sum, item) => 
      sum + (item.unitPrice * item.quantity), 0
    );
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAmount = subtotal - discountAmount;

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: input.userId,
      userEmail: input.userEmail,
      items: input.items,
      frequency: input.frequency,
      nextOrderDate: nextOrderDate.toISOString(),
      startDate: startDate.toISOString(),
      status: 'active',
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      discountPercent,
      totalAmount,
      currency: 'EUR',
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderCount: 0,
    };

    subscriptions.push(newSubscription);
    this.saveSubscriptions(subscriptions);
    
    toast.success(`Aboneliğiniz oluşturuldu! %${discountPercent} indirim kazandınız.`);
    return newSubscription;
  }

  /**
   * Aboneliği duraklat
   */
  public pause(subscriptionId: string): void {
    const subscriptions = this.getAllSubscriptions();
    const sub = subscriptions.find(s => s.id === subscriptionId);
    
    if (sub && sub.status === 'active') {
      sub.status = 'paused';
      sub.updatedAt = new Date().toISOString();
      this.saveSubscriptions(subscriptions);
      toast.success('Aboneliğiniz duraklatıldı.');
    }
  }

  /**
   * Aboneliği devam ettir
   */
  public resume(subscriptionId: string): void {
    const subscriptions = this.getAllSubscriptions();
    const sub = subscriptions.find(s => s.id === subscriptionId);
    
    if (sub && sub.status === 'paused') {
      sub.status = 'active';
      // Sonraki tarihi bugünden itibaren yeniden hesapla
      sub.nextOrderDate = this.calculateNextDate(new Date(), sub.frequency).toISOString();
      sub.updatedAt = new Date().toISOString();
      this.saveSubscriptions(subscriptions);
      toast.success('Aboneliğiniz devam ediyor.');
    }
  }

  /**
   * Aboneliği iptal et
   */
  public cancel(subscriptionId: string, reason?: string): void {
    const subscriptions = this.getAllSubscriptions();
    const sub = subscriptions.find(s => s.id === subscriptionId);
    
    if (sub && sub.status !== 'cancelled') {
      sub.status = 'cancelled';
      sub.endDate = new Date().toISOString();
      sub.notes = reason ? `${sub.notes || ''} İptal nedeni: ${reason}` : sub.notes;
      sub.updatedAt = new Date().toISOString();
      this.saveSubscriptions(subscriptions);
      toast.success('Aboneliğiniz iptal edildi.');
    }
  }

  /**
   * Aboneliği güncelle
   */
  public update(subscriptionId: string, updates: Partial<Subscription>): void {
    const subscriptions = this.getAllSubscriptions();
    const sub = subscriptions.find(s => s.id === subscriptionId);
    
    if (sub) {
      Object.assign(sub, updates);
      sub.updatedAt = new Date().toISOString();
      this.saveSubscriptions(subscriptions);
      toast.success('Aboneliğiniz güncellendi.');
    }
  }

  /**
   * Bir sonraki sipariş tarihini hesapla
   */
  private calculateNextDate(fromDate: Date, frequency: SubscriptionFrequency): Date {
    const nextDate = new Date(fromDate);
    
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'bimonthly':
        nextDate.setMonth(nextDate.getMonth() + 2);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
    }
    
    return nextDate;
  }

  /**
   * Manuel sipariş oluştur (otomatik çalıştırma için)
   */
  public processOrder(subscriptionId: string): boolean {
    const subscriptions = this.getAllSubscriptions();
    const sub = subscriptions.find(s => s.id === subscriptionId);
    
    if (!sub || sub.status !== 'active') return false;
    
    // Sipariş oluştur
    const orderNumber = `SUB-${Date.now()}`;
    const order = {
      id: `order_${Date.now()}`,
      order_number: orderNumber,
      subscriptionId: sub.id,
      items: sub.items,
      totalAmount: sub.totalAmount,
      shippingAddress: sub.shippingAddress,
      paymentMethod: sub.paymentMethod,
      createdAt: new Date().toISOString(),
    };
    
    // Sipariş kaydet (mock)
    const orders = JSON.parse(localStorage.getItem('cvk_mock_orders') || '[]');
    orders.push({
      ...order,
      status: 'pending',
      payment_status: 'pending',
    });
    localStorage.setItem('cvk_mock_orders', JSON.stringify(orders));
    
    // Aboneliği güncelle
    sub.orderCount++;
    sub.lastOrderDate = new Date().toISOString();
    sub.nextOrderDate = this.calculateNextDate(new Date(), sub.frequency).toISOString();
    sub.updatedAt = new Date().toISOString();
    
    this.saveSubscriptions(subscriptions);
    
    // Bildirim
    toast.success(`Abonelik siparişiniz oluşturuldu: ${order.order_number}`);
    
    return true;
  }

  /**
   * Vadesi gelen abonelikleri kontrol et ve işle
   */
  public checkDueSubscriptions(): Subscription[] {
    const subscriptions = this.getActiveSubscriptions();
    const now = new Date();
    const processed: Subscription[] = [];
    
    for (const sub of subscriptions) {
      const nextDate = new Date(sub.nextOrderDate);
      
      if (nextDate <= now) {
        // Sipariş oluştur
        if (this.processOrder(sub.id)) {
          processed.push(sub);
        }
      }
    }
    
    return processed;
  }

  /**
   * Tüm abonelikleri getir
   */
  public getAllSubscriptions(): Subscription[] {
    try {
      return JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Aktif abonelikleri getir
   */
  public getActiveSubscriptions(): Subscription[] {
    return this.getAllSubscriptions().filter(s => s.status === 'active');
  }

  /**
   * Kullanıcının aboneliklerini getir
   */
  public getUserSubscriptions(userEmail: string): Subscription[] {
    return this.getAllSubscriptions()
      .filter(s => s.userEmail === userEmail)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Belirli bir aboneliği getir
   */
  public getSubscription(id: string): Subscription | null {
    return this.getAllSubscriptions().find(s => s.id === id) || null;
  }

  /**
   * İndirim oranını getir
   */
  public getDiscountRate(frequency: SubscriptionFrequency): number {
    return DISCOUNT_RATES[frequency];
  }

  /**
   * Frekans etiketini getir
   */
  public getFrequencyLabel(frequency: SubscriptionFrequency): string {
    const labels: { [key in SubscriptionFrequency]: string } = {
      weekly: 'Haftalık',
      biweekly: '2 Haftada Bir',
      monthly: 'Aylık',
      bimonthly: '2 Ayda Bir',
      quarterly: '3 Ayda Bir',
    };
    return labels[frequency];
  }

  /**
   * İstatistikler
   */
  public getStats(): {
    total: number;
    active: number;
    paused: number;
    cancelled: number;
    totalRevenue: number;
    avgOrderValue: number;
  } {
    const subs = this.getAllSubscriptions();
    const active = subs.filter(s => s.status === 'active');
    
    const totalRevenue = subs.reduce((sum, s) => 
      sum + (s.totalAmount * s.orderCount), 0
    );
    
    const totalOrders = subs.reduce((sum, s) => sum + s.orderCount, 0);
    
    return {
      total: subs.length,
      active: active.length,
      paused: subs.filter(s => s.status === 'paused').length,
      cancelled: subs.filter(s => s.status === 'cancelled').length,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }

  /**
   * Yaklaşan siparişleri getir
   */
  public getUpcomingOrders(days: number = 7): Subscription[] {
    const subs = this.getActiveSubscriptions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return subs
      .filter(s => new Date(s.nextOrderDate) <= cutoffDate)
      .sort((a, b) => new Date(a.nextOrderDate).getTime() - new Date(b.nextOrderDate).getTime());
  }

  /**
   * Abonelikleri kaydet
   */
  private saveSubscriptions(subscriptions: Subscription[]): void {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  }

  /**
   * Mock abonelik oluştur (Demo için)
   */
  public seedMockSubscriptions(): void {
    const mockInput: SubscriptionInput = {
      userId: 1,
      userEmail: 'demo@example.com',
      items: [
        {
          productId: 1,
          productName: 'Stand-Up Poşet',
          quantity: 1000,
          unitPrice: 0.45,
          options: { size: '10x15 cm', material: 'Alüminyum' },
        },
      ],
      frequency: 'monthly',
      shippingAddress: {
        fullName: 'Demo Kullanıcı',
        address: 'Atatürk Cad. No:1',
        city: 'İstanbul',
        phone: '+90 532 123 45 67',
      },
      paymentMethod: 'credit_card',
    };

    this.create(mockInput);
  }
}

// Singleton instance
export const subscriptionService = new SubscriptionService();

// Hook için helper
export function useSubscription() {
  return {
    create: subscriptionService.create.bind(subscriptionService),
    pause: subscriptionService.pause.bind(subscriptionService),
    resume: subscriptionService.resume.bind(subscriptionService),
    cancel: subscriptionService.cancel.bind(subscriptionService),
    update: subscriptionService.update.bind(subscriptionService),
    getUserSubscriptions: subscriptionService.getUserSubscriptions.bind(subscriptionService),
    getSubscription: subscriptionService.getSubscription.bind(subscriptionService),
    getStats: subscriptionService.getStats.bind(subscriptionService),
    getUpcomingOrders: subscriptionService.getUpcomingOrders.bind(subscriptionService),
    getDiscountRate: subscriptionService.getDiscountRate.bind(subscriptionService),
    getFrequencyLabel: subscriptionService.getFrequencyLabel.bind(subscriptionService),
    checkDueSubscriptions: subscriptionService.checkDueSubscriptions.bind(subscriptionService),
  };
}

export default subscriptionService;

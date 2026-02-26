/**
 * Shipping Tracker Service
 * 
 * Kargo Takip Entegrasyonu
 * - Yurtiçi, Aras, MNG, PTT, UPS entegrasyonu
 * - Otomatik kargo durumu güncellemesi
 * - Müşteriye otomatik bildirim
 * - Kargo istatistikleri
 */

import { toast } from '@/components/Toast';

export type ShippingCompany = 'yurtici' | 'aras' | 'mng' | 'ptt' | 'ups' | 'dhl' | 'fedex';

export interface Shipment {
  id: string;
  orderId: number;
  orderNumber: string;
  trackingNumber: string;
  company: ShippingCompany;
  status: ShipmentStatus;
  estimatedDelivery?: string;
  actualDelivery?: string;
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  history: ShipmentEvent[];
  notificationsSent: string[];
  createdAt: string;
  updatedAt: string;
}

export type ShipmentStatus = 
  | 'pending'
  | 'label_created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned';

export interface ShipmentEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingResult {
  success: boolean;
  shipment?: Shipment;
  error?: string;
}

const SHIPMENTS_KEY = 'cvk_shipments';

// Kargo firması bilgileri
const COMPANY_INFO: { [key in ShippingCompany]: { name: string; logo: string; trackingUrl: string } } = {
  yurtici: {
    name: 'Yurtiçi Kargo',
    logo: '/logos/yurtici.svg',
    trackingUrl: 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula',
  },
  aras: {
    name: 'Aras Kargo',
    logo: '/logos/aras.svg',
    trackingUrl: 'https://www.araskargo.com.tr/tr/cargo-tracking',
  },
  mng: {
    name: 'MNG Kargo',
    logo: '/logos/mng.svg',
    trackingUrl: 'https://www.mngkargo.com.tr/gonderi-takip',
  },
  ptt: {
    name: 'PTT Kargo',
    logo: '/logos/ptt.svg',
    trackingUrl: 'https://ptt.gov.tr/Track/Verify',
  },
  ups: {
    name: 'UPS',
    logo: '/logos/ups.svg',
    trackingUrl: 'https://www.ups.com/track',
  },
  dhl: {
    name: 'DHL',
    logo: '/logos/dhl.svg',
    trackingUrl: 'https://www.dhl.com/tr-en/home/tracking.html',
  },
  fedex: {
    name: 'FedEx',
    logo: '/logos/fedex.svg',
    trackingUrl: 'https://www.fedex.com/en-us/tracking.html',
  },
};

class ShippingTrackerService {
  /**
   * Yeni kargo kaydı oluştur
   */
  public createShipment(
    orderId: number,
    orderNumber: string,
    trackingNumber: string,
    company: ShippingCompany,
    recipient: Shipment['recipient']
  ): Shipment {
    const shipments = this.getAllShipments();
    
    const newShipment: Shipment = {
      id: `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      orderNumber,
      trackingNumber,
      company,
      status: 'pending',
      recipient,
      history: [
        {
          date: new Date().toISOString(),
          location: 'Merkez',
          status: 'pending',
          description: 'Kargo kaydı oluşturuldu',
        },
      ],
      notificationsSent: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shipments.push(newShipment);
    this.saveShipments(shipments);
    
    toast.success('Kargo kaydı oluşturuldu.');
    return newShipment;
  }

  /**
   * Kargo durumunu güncelle (Admin/Manuel)
   */
  public updateStatus(
    shipmentId: string,
    status: ShipmentStatus,
    event: Omit<ShipmentEvent, 'date'>,
    estimatedDelivery?: string
  ): void {
    const fullEvent: ShipmentEvent = {
      ...event,
      date: new Date().toISOString(),
    };
    const shipments = this.getAllShipments();
    const shipment = shipments.find(s => s.id === shipmentId);
    
    if (!shipment) return;

    const oldStatus = shipment.status;
    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();
    
    if (estimatedDelivery) {
      shipment.estimatedDelivery = estimatedDelivery;
    }

    // Yeni event ekle
    shipment.history.unshift(fullEvent);

    // Bildirim kontrolü
    if (oldStatus !== status) {
      this.checkAndNotify(shipment, status);
    }

    this.saveShipments(shipments);
  }

  /**
   * Otomatik kargo takip (mock)
   * Gerçek uygulamada kargo firması API'leri çağrılacak
   */
  public async trackShipment(trackingNumber: string, _company: ShippingCompany): Promise<TrackingResult> {
    // Mock: Simüle edilmiş takip sonucu
    const shipment = this.getAllShipments().find(s => s.trackingNumber === trackingNumber);
    
    if (!shipment) {
      return { success: false, error: 'Kargo kaydı bulunamadı' };
    }

    // Simülasyon: Rastgele ilerleme
    const statuses: ShipmentStatus[] = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Mock event oluştur
    const mockEvents: { [key in ShipmentStatus]?: Omit<ShipmentEvent, 'date'> } = {
      picked_up: {
        location: 'İstanbul',
        status: 'picked_up',
        description: 'Kargo şubeden alındı',
      },
      in_transit: {
        location: 'Ankara Dağıtım Merkezi',
        status: 'in_transit',
        description: 'Transfer merkezine ulaştı',
      },
      out_for_delivery: {
        location: shipment.recipient.city,
        status: 'out_for_delivery',
        description: 'Dağıtıma çıktı',
      },
      delivered: {
        location: shipment.recipient.city,
        status: 'delivered',
        description: 'Teslim edildi',
      },
    };

    if (randomStatus !== shipment.status) {
      this.updateStatus(
        shipment.id,
        randomStatus,
        mockEvents[randomStatus]!,
        randomStatus === 'delivered' ? new Date().toISOString() : undefined
      );
    }

    const updatedShipment = this.getShipment(shipment.id);
    return { success: true, shipment: updatedShipment || undefined };
  }

  /**
   * Tüm kargoları kontrol et ve güncelle
   */
  public async checkAllShipments(): Promise<Shipment[]> {
    const shipments = this.getActiveShipments();
    const updated: Shipment[] = [];

    for (const shipment of shipments) {
      const result = await this.trackShipment(shipment.trackingNumber, shipment.company);
      if (result.success && result.shipment) {
        updated.push(result.shipment);
      }
    }

    return updated;
  }

  /**
   * Bildirim kontrolü
   */
  private checkAndNotify(shipment: Shipment, newStatus: ShipmentStatus): void {
    const notificationKey = `status_${newStatus}`;
    
    // Aynı durum için tekrar bildirim gönderme
    if (shipment.notificationsSent.includes(notificationKey)) return;

    let message = '';
    switch (newStatus) {
      case 'picked_up':
        message = `Siparişiniz ${COMPANY_INFO[shipment.company].name} tarafından alındı.`;
        break;
      case 'in_transit':
        message = `Siparişiniz yolda. Tahmini teslimat: ${this.formatDate(shipment.estimatedDelivery)}`;
        break;
      case 'out_for_delivery':
        message = `Siparişiniz bugün teslim edilecek!`;
        break;
      case 'delivered':
        message = `Siparişiniz teslim edildi. İyi günlerde kullanın!`;
        break;
      case 'exception':
        message = `Siparişinizde bir sorun oluştu. Lütfen bizimle iletişime geçin.`;
        break;
    }

    if (message) {
      console.log(`[SHIPMENT NOTIFY] ${shipment.recipient.email}: ${message}`);
      toast.success(message);
      shipment.notificationsSent.push(notificationKey);
    }
  }

  /**
   * Tüm kargoları getir
   */
  public getAllShipments(): Shipment[] {
    try {
      return JSON.parse(localStorage.getItem(SHIPMENTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Aktif kargoları getir
   */
  public getActiveShipments(): Shipment[] {
    return this.getAllShipments().filter(
      s => !['delivered', 'returned'].includes(s.status)
    );
  }

  /**
   * Siparişe göre kargo getir
   */
  public getShipmentByOrder(orderId: number): Shipment | null {
    return this.getAllShipments().find(s => s.orderId === orderId) || null;
  }

  /**
   * Kargo takip numarasına göre getir
   */
  public getShipmentByTracking(trackingNumber: string): Shipment | null {
    return this.getAllShipments().find(s => s.trackingNumber === trackingNumber) || null;
  }

  /**
   * Belirli bir kargoyu getir
   */
  public getShipment(shipmentId: string): Shipment | null {
    return this.getAllShipments().find(s => s.id === shipmentId) || null;
  }

  /**
   * Müşterinin kargolarını getir (e-posta ile)
   */
  public getCustomerShipments(email: string): Shipment[] {
    return this.getAllShipments()
      .filter(s => s.recipient.email === email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Kargo firması bilgisi
   */
  public getCompanyInfo(company: ShippingCompany) {
    return COMPANY_INFO[company];
  }

  /**
   * Takip linki oluştur
   */
  public getTrackingUrl(trackingNumber: string, company: ShippingCompany): string {
    const baseUrl = COMPANY_INFO[company].trackingUrl;
    return `${baseUrl}?tracking=${trackingNumber}`;
  }

  /**
   * Durum etiketi
   */
  public getStatusLabel(status: ShipmentStatus): string {
    const labels: { [key in ShipmentStatus]: string } = {
      pending: 'Beklemede',
      label_created: 'Etiket Oluşturuldu',
      picked_up: 'Alındı',
      in_transit: 'Yolda',
      out_for_delivery: 'Dağıtımda',
      delivered: 'Teslim Edildi',
      exception: 'Sorun Var',
      returned: 'İade',
    };
    return labels[status];
  }

  /**
   * Durum rengi
   */
  public getStatusColor(status: ShipmentStatus): string {
    const colors: { [key in ShipmentStatus]: string } = {
      pending: '#9CA3AF',
      label_created: '#6B7280',
      picked_up: '#3B82F6',
      in_transit: '#F59E0B',
      out_for_delivery: '#8B5CF6',
      delivered: '#10B981',
      exception: '#EF4444',
      returned: '#6B7280',
    };
    return colors[status];
  }

  /**
   * İstatistikler
   */
  public getStats(): {
    total: number;
    active: number;
    delivered: number;
    avgDeliveryTime: number;
  } {
    const shipments = this.getAllShipments();
    const delivered = shipments.filter(s => s.status === 'delivered');
    
    // Ortalama teslimat süresi hesapla
    let totalDays = 0;
    for (const s of delivered) {
      if (s.actualDelivery && s.createdAt) {
        const start = new Date(s.createdAt);
        const end = new Date(s.actualDelivery);
        const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        totalDays += days;
      }
    }

    return {
      total: shipments.length,
      active: this.getActiveShipments().length,
      delivered: delivered.length,
      avgDeliveryTime: delivered.length > 0 ? Math.round((totalDays / delivered.length) * 10) / 10 : 0,
    };
  }

  /**
   * Kargo firması dağılımı
   */
  public getCompanyDistribution(): { company: ShippingCompany; count: number; percentage: number }[] {
    const shipments = this.getAllShipments();
    const distribution: { [key in ShippingCompany]?: number } = {};
    
    for (const s of shipments) {
      distribution[s.company] = (distribution[s.company] || 0) + 1;
    }

    return Object.entries(distribution)
      .map(([company, count]) => ({
        company: company as ShippingCompany,
        count: count as number,
        percentage: Math.round(((count as number) / shipments.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Kargoları kaydet
   */
  private saveShipments(shipments: Shipment[]): void {
    localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(shipments));
  }

  /**
   * Tarih formatla
   */
  private formatDate(dateString?: string): string {
    if (!dateString) return 'Belirtilmedi';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    });
  }

  /**
   * Mock kargo oluştur (Demo için)
   */
  public seedMockShipment(): void {
    const existing = this.getAllShipments();
    if (existing.length > 0) return;

    this.createShipment(
      1,
      'CVK-20240220-ABC123',
      '1' + Math.floor(Math.random() * 10000000000),
      'yurtici',
      {
        name: 'Demo Müşteri',
        phone: '+90 532 123 45 67',
        email: 'demo@example.com',
        address: 'Atatürk Cad. No:1',
        city: 'İstanbul',
      }
    );
  }
}

// Singleton instance
export const shippingTracker = new ShippingTrackerService();

// Hook için helper
export function useShippingTracker() {
  return {
    createShipment: shippingTracker.createShipment.bind(shippingTracker),
    updateStatus: shippingTracker.updateStatus.bind(shippingTracker),
    trackShipment: shippingTracker.trackShipment.bind(shippingTracker),
    checkAllShipments: shippingTracker.checkAllShipments.bind(shippingTracker),
    getActiveShipments: shippingTracker.getActiveShipments.bind(shippingTracker),
    getShipmentByOrder: shippingTracker.getShipmentByOrder.bind(shippingTracker),
    getCustomerShipments: shippingTracker.getCustomerShipments.bind(shippingTracker),
    getCompanyInfo: shippingTracker.getCompanyInfo.bind(shippingTracker),
    getTrackingUrl: shippingTracker.getTrackingUrl.bind(shippingTracker),
    getStatusLabel: shippingTracker.getStatusLabel.bind(shippingTracker),
    getStatusColor: shippingTracker.getStatusColor.bind(shippingTracker),
    getStats: shippingTracker.getStats.bind(shippingTracker),
    getCompanyDistribution: shippingTracker.getCompanyDistribution.bind(shippingTracker),
  };
}

export default shippingTracker;

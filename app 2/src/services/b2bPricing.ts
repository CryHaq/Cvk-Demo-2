/**
 * B2B Pricing Service
 * 
 * B2B Özel Fiyatlandırma Sistemi
 * - Müşteri grupları (Bayi, Zincir Market, Perakende)
 * - Grup bazlı indirim oranları
 * - Özel fiyat listeleri
 * - Minimum sipariş miktarları
 * - Vadeli ödeme seçenekleri
 */

import { toast } from '@/components/Toast';

export type CustomerGroup = 'retail' | 'dealer' | 'chain' | 'corporate' | 'vip';

export interface B2BCustomer {
  id: number;
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  group: CustomerGroup;
  taxNumber: string;
  taxOffice: string;
  address: string;
  city: string;
  creditLimit: number;
  paymentTerm: number; // Vade (gün)
  discountPercent: number;
  minOrderAmount: number;
  isActive?: boolean;
  createdAt: string;
  notes?: string;
}

export interface B2BPriceList {
  id: string;
  name: string;
  group: CustomerGroup;
  products: B2BProductPrice[];
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
}

export interface B2BProductPrice {
  productId: number;
  productName: string;
  basePrice: number;
  b2bPrice: number;
  minQuantity: number;
  discountPercent: number;
}

export interface B2BQuote {
  id: string;
  customerId: number;
  customerName: string;
  items: B2BQuoteItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface B2BQuoteItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

const B2B_CUSTOMERS_KEY = 'cvk_b2b_customers';
const B2B_PRICE_LISTS_KEY = 'cvk_b2b_pricelists';
const B2B_QUOTES_KEY = 'cvk_b2b_quotes';

// Grup bazlı varsayılan ayarlar
const GROUP_DEFAULTS: { [key in CustomerGroup]: { discount: number; minOrder: number; paymentTerm: number } } = {
  retail: { discount: 0, minOrder: 0, paymentTerm: 0 },
  dealer: { discount: 15, minOrder: 500, paymentTerm: 30 },
  chain: { discount: 20, minOrder: 2000, paymentTerm: 45 },
  corporate: { discount: 10, minOrder: 1000, paymentTerm: 30 },
  vip: { discount: 25, minOrder: 100, paymentTerm: 60 },
};

// Grup etiketleri
const GROUP_LABELS: { [key in CustomerGroup]: string } = {
  retail: 'Perakende',
  dealer: 'Bayi',
  chain: 'Zincir Market',
  corporate: 'Kurumsal',
  vip: 'VIP',
};

class B2BPricingService {
  /**
   * B2B müşteri ekle
   */
  public addCustomer(customer: Omit<B2BCustomer, 'id' | 'createdAt' | 'discountPercent' | 'minOrderAmount' | 'paymentTerm'>): B2BCustomer {
    const customers = this.getAllCustomers();
    
    // E-posta kontrolü
    if (customers.some(c => c.email === customer.email)) {
      toast.error('Bu e-posta adresi zaten kayıtlı.');
      throw new Error('Email already exists');
    }

    const defaults = GROUP_DEFAULTS[customer.group];

    const newCustomer: B2BCustomer = {
      ...customer,
      id: Date.now(),
      discountPercent: defaults.discount,
      minOrderAmount: defaults.minOrder,
      paymentTerm: defaults.paymentTerm,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    this.saveCustomers(customers);
    toast.success(`${customer.companyName} B2B müşteri olarak eklendi.`);
    return newCustomer;
  }

  /**
   * Müşteri güncelle
   */
  public updateCustomer(customerId: number, updates: Partial<B2BCustomer>): void {
    const customers = this.getAllCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
      Object.assign(customer, updates);
      this.saveCustomers(customers);
      toast.success('Müşteri bilgileri güncellendi.');
    }
  }

  /**
   * Grup değiştirme
   */
  public changeGroup(customerId: number, newGroup: CustomerGroup): void {
    const customers = this.getAllCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
      const defaults = GROUP_DEFAULTS[newGroup];
      customer.group = newGroup;
      customer.discountPercent = defaults.discount;
      customer.minOrderAmount = defaults.minOrder;
      customer.paymentTerm = defaults.paymentTerm;
      this.saveCustomers(customers);
      toast.success(`Müşteri ${GROUP_LABELS[newGroup]} grubuna taşındı.`);
    }
  }

  /**
   * Müşteriye özel fiyat hesapla
   */
  public calculatePrice(customerId: number, productId: number, basePrice: number, quantity: number): {
    originalPrice: number;
    discountedPrice: number;
    discountAmount: number;
    discountPercent: number;
    total: number;
  } {
    const customer = this.getCustomer(customerId);
    if (!customer || !customer.isActive) {
      return {
        originalPrice: basePrice,
        discountedPrice: basePrice,
        discountAmount: 0,
        discountPercent: 0,
        total: basePrice * quantity,
      };
    }

    // Özel fiyat listesi kontrolü
    const specialPrice = this.getSpecialPrice(customer.group, productId);
    let unitPrice = basePrice;
    let discountPercent = customer.discountPercent;

    if (specialPrice) {
      unitPrice = specialPrice.b2bPrice;
      discountPercent = specialPrice.discountPercent;
    } else {
      // Grup indirimi uygula
      unitPrice = basePrice * (1 - discountPercent / 100);
    }

    // Miktar indirimi
    const volumeDiscount = this.calculateVolumeDiscount(quantity);
    if (volumeDiscount > 0) {
      unitPrice = unitPrice * (1 - volumeDiscount / 100);
      discountPercent = discountPercent + volumeDiscount;
    }

    const total = unitPrice * quantity;
    const originalTotal = basePrice * quantity;

    return {
      originalPrice: basePrice,
      discountedPrice: unitPrice,
      discountAmount: originalTotal - total,
      discountPercent,
      total,
    };
  }

  /**
   * Miktar indirimi hesapla
   */
  private calculateVolumeDiscount(quantity: number): number {
    if (quantity >= 10000) return 10;
    if (quantity >= 5000) return 7;
    if (quantity >= 2000) return 5;
    if (quantity >= 1000) return 3;
    return 0;
  }

  /**
   * Özel fiyat getir
   */
  private getSpecialPrice(group: CustomerGroup, productId: number): B2BProductPrice | null {
    const priceLists = this.getActivePriceLists().filter(pl => pl.group === group);
    
    for (const list of priceLists) {
      const price = list.products.find(p => p.productId === productId);
      if (price) return price;
    }
    
    return null;
  }

  /**
   * Fiyat listesi oluştur
   */
  public createPriceList(list: Omit<B2BPriceList, 'id' | 'createdAt'>): B2BPriceList {
    const lists = this.getAllPriceLists();
    
    const newList: B2BPriceList = {
      ...list,
      id: `list_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    lists.push(newList);
    this.savePriceLists(lists);
    toast.success('Fiyat listesi oluşturuldu.');
    return newList;
  }

  /**
   * Fiyat listesi güncelle
   */
  public updatePriceList(listId: string, updates: Partial<B2BPriceList>): void {
    const lists = this.getAllPriceLists();
    const list = lists.find(l => l.id === listId);
    
    if (list) {
      Object.assign(list, updates);
      this.savePriceLists(lists);
      toast.success('Fiyat listesi güncellendi.');
    }
  }

  /**
   * Teklif oluştur
   */
  public createQuote(customerId: number, items: Omit<B2BQuoteItem, 'totalPrice'>[], validDays: number = 30, notes?: string): B2BQuote {
    const customer = this.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');

    let subtotal = 0;
    const quoteItems: B2BQuoteItem[] = [];

    for (const item of items) {
      const pricing = this.calculatePrice(customerId, item.productId, item.unitPrice, item.quantity);
      const totalPrice = pricing.total;
      subtotal += totalPrice;

      quoteItems.push({
        ...item,
        totalPrice,
      });
    }

    const discountAmount = quoteItems.reduce((sum, item) => {
      const original = item.unitPrice * item.quantity;
      return sum + (original - item.totalPrice);
    }, 0);

    const taxAmount = subtotal * 0.20; // %20 KDV
    const total = subtotal + taxAmount;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const quote: B2BQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      customerName: customer.companyName,
      items: quoteItems,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      currency: 'EUR',
      validUntil: validUntil.toISOString(),
      status: 'draft',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const quotes = this.getAllQuotes();
    quotes.push(quote);
    this.saveQuotes(quotes);

    toast.success('Teklif oluşturuldu.');
    return quote;
  }

  /**
   * Teklif gönder
   */
  public sendQuote(quoteId: string): void {
    const quotes = this.getAllQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    
    if (quote) {
      quote.status = 'sent';
      quote.updatedAt = new Date().toISOString();
      this.saveQuotes(quotes);
      toast.success('Teklif müşteriye gönderildi.');
    }
  }

  /**
   * Teklif kabul/red
   */
  public updateQuoteStatus(quoteId: string, status: 'accepted' | 'rejected'): void {
    const quotes = this.getAllQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    
    if (quote) {
      quote.status = status;
      quote.updatedAt = new Date().toISOString();
      this.saveQuotes(quotes);
      toast.success(`Teklif ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}.`);
    }
  }

  /**
   * Tüm müşterileri getir
   */
  public getAllCustomers(): B2BCustomer[] {
    try {
      return JSON.parse(localStorage.getItem(B2B_CUSTOMERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Müşteri getir
   */
  public getCustomer(id: number): B2BCustomer | null {
    return this.getAllCustomers().find(c => c.id === id) || null;
  }

  /**
   * E-posta ile müşteri getir
   */
  public getCustomerByEmail(email: string): B2BCustomer | null {
    return this.getAllCustomers().find(c => c.email === email) || null;
  }

  /**
   * Gruba göre müşterileri getir
   */
  public getCustomersByGroup(group: CustomerGroup): B2BCustomer[] {
    return this.getAllCustomers().filter(c => c.group === group);
  }

  /**
   * Fiyat listelerini getir
   */
  public getAllPriceLists(): B2BPriceList[] {
    try {
      return JSON.parse(localStorage.getItem(B2B_PRICE_LISTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Aktif fiyat listelerini getir
   */
  public getActivePriceLists(): B2BPriceList[] {
    const now = new Date().toISOString();
    return this.getAllPriceLists().filter(
      l => l.isActive && l.validFrom <= now && (!l.validUntil || l.validUntil >= now)
    );
  }

  /**
   * Teklifleri getir
   */
  public getAllQuotes(): B2BQuote[] {
    try {
      return JSON.parse(localStorage.getItem(B2B_QUOTES_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Müşteri tekliflerini getir
   */
  public getCustomerQuotes(customerId: number): B2BQuote[] {
    return this.getAllQuotes()
      .filter(q => q.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Grup etiketi
   */
  public getGroupLabel(group: CustomerGroup): string {
    return GROUP_LABELS[group];
  }

  /**
   * İstatistikler
   */
  public getStats(): {
    totalCustomers: number;
    byGroup: { [key in CustomerGroup]?: number };
    totalQuotes: number;
    pendingQuotes: number;
    totalRevenue: number;
  } {
    const customers = this.getAllCustomers();
    const quotes = this.getAllQuotes();
    
    const byGroup: { [key in CustomerGroup]?: number } = {};
    for (const group of Object.keys(GROUP_LABELS) as CustomerGroup[]) {
      byGroup[group] = customers.filter(c => c.group === group).length;
    }

    const acceptedQuotes = quotes.filter(q => q.status === 'accepted');

    return {
      totalCustomers: customers.length,
      byGroup,
      totalQuotes: quotes.length,
      pendingQuotes: quotes.filter(q => q.status === 'sent').length,
      totalRevenue: acceptedQuotes.reduce((sum, q) => sum + q.total, 0),
    };
  }

  /**
   * Kaydetme fonksiyonları
   */
  private saveCustomers(customers: B2BCustomer[]): void {
    localStorage.setItem(B2B_CUSTOMERS_KEY, JSON.stringify(customers));
  }

  private savePriceLists(lists: B2BPriceList[]): void {
    localStorage.setItem(B2B_PRICE_LISTS_KEY, JSON.stringify(lists));
  }

  private saveQuotes(quotes: B2BQuote[]): void {
    localStorage.setItem(B2B_QUOTES_KEY, JSON.stringify(quotes));
  }

  /**
   * Mock veri oluştur
   */
  public seedMockData(): void {
    if (this.getAllCustomers().length > 0) return;

    this.addCustomer({
      email: 'b2b@market.com',
      companyName: 'Örnek Market Ltd.',
      contactName: 'Ali Veli',
      phone: '+90 212 123 45 67',
      group: 'chain',
      taxNumber: '1234567890',
      taxOffice: 'Beşiktaş',
      address: 'Barbaros Bulvarı No:123',
      city: 'İstanbul',
      creditLimit: 50000,
    });

    this.addCustomer({
      email: 'bayi@demo.com',
      companyName: 'Demo Bayi A.Ş.',
      contactName: 'Mehmet Demir',
      phone: '+90 232 987 65 43',
      group: 'dealer',
      taxNumber: '0987654321',
      taxOffice: 'Konak',
      address: 'Cumhuriyet Bulvarı No:45',
      city: 'İzmir',
      creditLimit: 20000,
    });
  }
}

// Singleton instance
export const b2bPricing = new B2BPricingService();

// Hook için helper
export function useB2BPricing() {
  return {
    addCustomer: b2bPricing.addCustomer.bind(b2bPricing),
    updateCustomer: b2bPricing.updateCustomer.bind(b2bPricing),
    changeGroup: b2bPricing.changeGroup.bind(b2bPricing),
    calculatePrice: b2bPricing.calculatePrice.bind(b2bPricing),
    createPriceList: b2bPricing.createPriceList.bind(b2bPricing),
    createQuote: b2bPricing.createQuote.bind(b2bPricing),
    sendQuote: b2bPricing.sendQuote.bind(b2bPricing),
    updateQuoteStatus: b2bPricing.updateQuoteStatus.bind(b2bPricing),
    getAllCustomers: b2bPricing.getAllCustomers.bind(b2bPricing),
    getCustomer: b2bPricing.getCustomer.bind(b2bPricing),
    getCustomerByEmail: b2bPricing.getCustomerByEmail.bind(b2bPricing),
    getCustomersByGroup: b2bPricing.getCustomersByGroup.bind(b2bPricing),
    getActivePriceLists: b2bPricing.getActivePriceLists.bind(b2bPricing),
    getCustomerQuotes: b2bPricing.getCustomerQuotes.bind(b2bPricing),
    getGroupLabel: b2bPricing.getGroupLabel.bind(b2bPricing),
    getStats: b2bPricing.getStats.bind(b2bPricing),
    seedMockData: b2bPricing.seedMockData.bind(b2bPricing),
  };
}

export default b2bPricing;

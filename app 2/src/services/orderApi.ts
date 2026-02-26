// CVK Dijital - Order API Service
// Uses SQL backend when available, falls back to local mock storage.

import { API_ENDPOINTS, getAuthToken } from '@/lib/api';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  vat_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  shipping_company?: string;
  tracking_number?: string;
  shipping_address: {
    full_name: string;
    phone: string;
    email: string;
    company?: string;
    full_address: string;
    city: string;
    zip: string;
    country: string;
  };
  billing_address: {
    full_name: string;
    phone: string;
    email: string;
    company?: string;
    full_address: string;
    city: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  status_history: StatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_type: string;
  size: string;
  dimensions?: string;
  material: string;
  material_spec?: string;
  optional_features?: string;
  corner_type?: string;
  quantity: number;
  graphics_count: number;
  unit_price: number;
  total_price: number;
  has_zip: boolean;
  has_valve: boolean;
  design_file_url?: string;
}

export interface StatusHistory {
  id: number;
  old_status?: string;
  new_status: string;
  changed_by: number;
  changed_by_type: 'system' | 'admin' | 'customer';
  note?: string;
  created_at: string;
}

export interface CreateOrderRequest {
  items: {
    product_type: string;
    size: string;
    dimensions?: string;
    material: string;
    material_spec?: string;
    optional_features?: string;
    corner_type?: string;
    quantity: number;
    graphics_count: number;
    unit_price: number;
    total_price: number;
    has_zip?: boolean;
    has_valve?: boolean;
  }[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  shipping_address: {
    full_name: string;
    phone: string;
    email: string;
    company?: string;
    full_address: string;
    city: string;
    zip: string;
    country: string;
  };
  billing_address: {
    full_name: string;
    phone: string;
    email: string;
    company?: string;
    full_address: string;
    city: string;
    zip: string;
    country: string;
  };
}

const hasBackend = () => Boolean((import.meta.env.VITE_API_BASE_URL || '').trim()) || window.location.protocol.startsWith('http');

const getMockOrders = (): Order[] => {
  const stored = localStorage.getItem('cvk_mock_orders');
  return stored ? JSON.parse(stored) : [];
};

const saveMockOrders = (orders: Order[]) => {
  localStorage.setItem('cvk_mock_orders', JSON.stringify(orders));
};

const getCurrentUserId = (): number => {
  const raw = localStorage.getItem('cvk_user_v1') || localStorage.getItem('user') || '{}';
  const user = JSON.parse(raw);
  return Number(user.id) || 1;
};

async function requestApi(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const orderApi = {
  async createOrder(data: CreateOrderRequest): Promise<{ success: boolean; data?: Order; message?: string }> {
    if (hasBackend()) {
      try {
        const apiData = await requestApi(API_ENDPOINTS.orders, {
          method: 'POST',
          body: JSON.stringify({ action: 'create', ...data }),
        });

        if (apiData.data?.order_id) {
          const detail = await this.getOrderDetails(apiData.data.order_id);
          if (detail.success && detail.data) {
            return { success: true, data: detail.data };
          }
        }

        return { success: true, message: apiData.message || 'Sipariş oluşturuldu.' };
      } catch (error) {
        console.warn('Backend createOrder failed, fallback to mock:', error);
      }
    }

    const orders = getMockOrders();
    const newOrder: Order = {
      id: Date.now(),
      order_number: `CVK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      user_id: getCurrentUserId(),
      subtotal: data.subtotal,
      vat_amount: data.vat_amount,
      discount_amount: 0,
      shipping_cost: 0,
      total_amount: data.total_amount,
      currency: 'EUR',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: data.shipping_address,
      billing_address: data.billing_address,
      items: data.items.map((item, index) => ({ id: Date.now() + index, ...item, has_zip: !!item.has_zip, has_valve: !!item.has_valve })),
      status_history: [
        {
          id: Date.now(),
          new_status: 'pending',
          changed_by: getCurrentUserId(),
          changed_by_type: 'system',
          note: 'Sipariş oluşturuldu',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.push(newOrder);
    saveMockOrders(orders);
    return { success: true, data: newOrder };
  },

  async getMyOrders(): Promise<{ success: boolean; data?: Order[]; message?: string }> {
    if (hasBackend()) {
      try {
        const apiData = await requestApi(`${API_ENDPOINTS.orders}?action=my`, { method: 'GET' });
        return { success: true, data: apiData.data?.orders || [] };
      } catch (error) {
        console.warn('Backend getMyOrders failed, fallback to mock:', error);
      }
    }

    const orders = getMockOrders();
    const userOrders = orders.filter((o) => o.user_id === getCurrentUserId());
    return { success: true, data: userOrders };
  },

  async getOrderDetails(orderId: number): Promise<{ success: boolean; data?: Order; message?: string }> {
    if (hasBackend()) {
      try {
        const apiData = await requestApi(`${API_ENDPOINTS.orders}?action=detail&id=${orderId}`, { method: 'GET' });
        return { success: true, data: apiData.data?.order };
      } catch (error) {
        console.warn('Backend getOrderDetails failed, fallback to mock:', error);
      }
    }

    const orders = getMockOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı' };

    if (order.user_id !== getCurrentUserId()) {
      const user = JSON.parse(localStorage.getItem('cvk_user_v1') || localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        return { success: false, message: 'Yetkisiz erişim' };
      }
    }

    return { success: true, data: order };
  },

  async updateOrderStatus(
    orderId: number,
    newStatus: Order['status'],
    note?: string,
    options?: { paymentStatus?: Order['payment_status']; shippingCompany?: string; trackingNumber?: string }
  ): Promise<{ success: boolean; message?: string }> {
    if (hasBackend()) {
      try {
        const apiData = await requestApi(API_ENDPOINTS.orders, {
          method: 'POST',
          body: JSON.stringify({
            action: 'update_status',
            orderId,
            status: newStatus,
            note,
            paymentStatus: options?.paymentStatus,
            shippingCompany: options?.shippingCompany,
            trackingNumber: options?.trackingNumber,
          }),
        });
        return { success: true, message: apiData.message || 'Sipariş durumu güncellendi' };
      } catch (error) {
        console.warn('Backend updateOrderStatus failed, fallback to mock:', error);
      }
    }

    const orders = getMockOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Sipariş bulunamadı' };

    const order = orders[orderIndex];
    const oldStatus = order.status;
    order.status = newStatus;
    if (options?.paymentStatus) {
      order.payment_status = options.paymentStatus;
    }
    if (options?.shippingCompany) {
      order.shipping_company = options.shippingCompany;
    }
    if (options?.trackingNumber) {
      order.tracking_number = options.trackingNumber;
    }
    order.updated_at = new Date().toISOString();
    order.status_history.push({
      id: Date.now(),
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: getCurrentUserId(),
      changed_by_type: 'admin',
      note: note || `Durum ${oldStatus} -> ${newStatus}`,
      created_at: new Date().toISOString(),
    });

    saveMockOrders(orders);
    return { success: true, message: 'Sipariş durumu güncellendi' };
  },

  async sendCustomerNotification(
    orderId: number,
    channel: 'email' | 'sms',
    template: 'payment_received' | 'shipment_created' | 'invoice_ready'
  ): Promise<{ success: boolean; message?: string }> {
    void orderId;
    void channel;
    void template;
    return { success: true, message: 'Müşteri bildirimi gönderildi' };
  },

  async processPayment(orderId: number): Promise<{ success: boolean; message?: string; data?: any }> {
    const orders = getMockOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Sipariş bulunamadı' };

    const isSuccess = Math.random() > 0.1;
    if (isSuccess) {
      order.payment_status = 'paid';
      order.status = 'confirmed';
      order.payment_method = 'iyzico';
      order.updated_at = new Date().toISOString();
      saveMockOrders(orders);
      return { success: true, message: 'Ödeme başarılı', data: { payment_id: `PAY-${Date.now()}` } };
    }

    order.payment_status = 'failed';
    order.updated_at = new Date().toISOString();
    saveMockOrders(orders);
    return { success: false, message: 'Ödeme başarısız' };
  },

  async getAllOrders(filters?: { status?: string; page?: number; limit?: number }): Promise<{ success: boolean; data?: { orders: Order[]; pagination: any }; message?: string }> {
    if (hasBackend()) {
      try {
        const params = new URLSearchParams({ action: 'admin_list' });
        if (filters?.status) params.set('status', filters.status);
        if (filters?.limit) params.set('limit', String(filters.limit));

        const apiData = await requestApi(`${API_ENDPOINTS.orders}?${params.toString()}`, { method: 'GET' });
        return {
          success: true,
          data: {
            orders: apiData.data?.orders || [],
            pagination: apiData.data?.pagination || { total: 0, page: 1, limit: filters?.limit || 200, total_pages: 1 },
          },
        };
      } catch (error) {
        console.warn('Backend getAllOrders failed, fallback to mock:', error);
      }
    }

    const orders = getMockOrders().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return {
      success: true,
      data: {
        orders,
        pagination: {
          total: orders.length,
          page: 1,
          limit: orders.length,
          total_pages: 1,
        },
      },
    };
  },

  async getOrderStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    const all = await this.getAllOrders();
    if (!all.success || !all.data) {
      return { success: false, message: 'İstatistik alınamadı' };
    }

    const orders = all.data.orders;
    const stats = {
      total_orders: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      total_revenue: orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0),
    };

    return { success: true, data: stats };
  },
};

export const emailService = {
  sendOrderConfirmation: (_order: Order) => {},
  sendPaymentReceived: (_order: Order) => {},
  sendOrderShipped: (_order: Order) => {},
};

export default orderApi;

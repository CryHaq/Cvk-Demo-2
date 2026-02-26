// CVK Dijital - Order API Service
// Mock API for local development

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

// Generate unique order number
const generateOrderNumber = () => {
  const prefix = 'CVK';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

// Initialize mock orders from localStorage
const getMockOrders = (): Order[] => {
  const stored = localStorage.getItem('cvk_mock_orders');
  return stored ? JSON.parse(stored) : [];
};

const saveMockOrders = (orders: Order[]) => {
  localStorage.setItem('cvk_mock_orders', JSON.stringify(orders));
};

// Get current user ID from auth
const getCurrentUserId = (): number => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || 1;
};

// Order API Service
export const orderApi = {
  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<{ success: boolean; data?: Order; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        const newOrder: Order = {
          id: Date.now(),
          order_number: generateOrderNumber(),
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
          items: data.items.map((item, index) => ({
            id: Date.now() + index,
            ...item,
            has_zip: item.has_zip || false,
            has_valve: item.has_valve || false,
          })),
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

        resolve({ success: true, data: newOrder });
      }, 800);
    });
  },

  // Get user's orders
  getMyOrders: async (): Promise<{ success: boolean; data?: Order[]; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        const userOrders = orders.filter(o => o.user_id === getCurrentUserId());
        resolve({ success: true, data: userOrders });
      }, 500);
    });
  },

  // Get order details
  getOrderDetails: async (orderId: number): Promise<{ success: boolean; data?: Order; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
          resolve({ success: false, message: 'Sipariş bulunamadı' });
          return;
        }

        // Check ownership
        if (order.user_id !== getCurrentUserId()) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role !== 'admin') {
            resolve({ success: false, message: 'Yetkisiz erişim' });
            return;
          }
        }

        resolve({ success: true, data: order });
      }, 500);
    });
  },

  // Update order status (Admin only)
  updateOrderStatus: async (
    orderId: number, 
    newStatus: Order['status'], 
    note?: string
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
          resolve({ success: false, message: 'Sipariş bulunamadı' });
          return;
        }

        const order = orders[orderIndex];
        const oldStatus = order.status;

        // Update order
        order.status = newStatus;
        order.updated_at = new Date().toISOString();

        // Add status history
        order.status_history.push({
          id: Date.now(),
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: getCurrentUserId(),
          changed_by_type: 'admin',
          note: note || `Durum ${oldStatus} -> ${newStatus} olarak değiştirildi`,
          created_at: new Date().toISOString(),
        });

        // Update timestamps based on status
        if (newStatus === 'shipped') {
          order.shipping_company = 'Yurtiçi Kargo';
          order.tracking_number = `1${Math.floor(Math.random() * 10000000000)}`;
        }

        saveMockOrders(orders);
        resolve({ success: true, message: 'Sipariş durumu güncellendi' });
      }, 600);
    });
  },

  // Process payment (Mock iyzico)
  processPayment: async (orderId: number): Promise<{ success: boolean; message?: string; data?: any }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
          resolve({ success: false, message: 'Sipariş bulunamadı' });
          return;
        }

        // Simulate payment processing (90% success rate)
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
          order.payment_status = 'paid';
          order.status = 'confirmed';
          order.payment_method = 'iyzico';
          order.updated_at = new Date().toISOString();

          order.status_history.push({
            id: Date.now(),
            old_status: 'pending',
            new_status: 'confirmed',
            changed_by: 0,
            changed_by_type: 'system',
            note: 'Ödeme başarılı - iyzico',
            created_at: new Date().toISOString(),
          });

          saveMockOrders(orders);
          
          // Send email notification (mock)
          emailService.sendOrderConfirmation(order);

          resolve({ 
            success: true, 
            message: 'Ödeme başarılı',
            data: { payment_id: `PAY-${Date.now()}` }
          });
        } else {
          order.payment_status = 'failed';
          order.updated_at = new Date().toISOString();
          saveMockOrders(orders);

          resolve({ 
            success: false, 
            message: 'Kartınızda yetersiz bakiye veya banka reddetti' 
          });
        }
      }, 1500);
    });
  },

  // Get all orders (Admin)
  getAllOrders: async (_filters?: { status?: string; page?: number; limit?: number }): Promise<{ 
    success: boolean; 
    data?: { orders: Order[]; pagination: any }; 
    message?: string 
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        
        // Sort by date
        orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        resolve({ 
          success: true, 
          data: { 
            orders,
            pagination: {
              total: orders.length,
              page: 1,
              limit: orders.length,
              total_pages: 1
            }
          } 
        });
      }, 500);
    });
  },

  // Get order statistics (Admin)
  getOrderStats: async (): Promise<{ success: boolean; data?: any; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getMockOrders();
        
        const stats = {
          total_orders: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          confirmed: orders.filter(o => o.status === 'confirmed').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          total_revenue: orders
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + o.total_amount, 0),
        };

        resolve({ success: true, data: stats });
      }, 400);
    });
  },
};

// Mock Email Service
export const emailService = {
  sendOrderConfirmation: (order: Order) => {
    console.log(`[EMAIL] Order confirmation sent to ${order.shipping_address.email}`);
    // In real implementation, this would call PHP backend
  },
  
  sendPaymentReceived: (order: Order) => {
    console.log(`[EMAIL] Payment received notification sent to ${order.shipping_address.email}`);
  },
  
  sendOrderShipped: (order: Order) => {
    console.log(`[EMAIL] Order shipped notification sent to ${order.shipping_address.email}`);
  },
};

export default orderApi;

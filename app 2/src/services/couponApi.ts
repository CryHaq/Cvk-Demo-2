// CVK Dijital - Kupon API Service
// Mock API for local development

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
}

// Mock coupons data
const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'HOSGELDIN10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 100,
    maxDiscount: 50,
    usageLimit: 100,
    usageCount: 45,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    description: 'Hoşgeldiniz indirimi - İlk alışverişinize %10 indirim',
  },
  {
    id: '2',
    code: 'VIP20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 500,
    maxDiscount: 100,
    usageLimit: 50,
    usageCount: 12,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    description: 'VIP müşteri indirimi - %20 indirim',
  },
  {
    id: '3',
    code: 'SABIT50',
    type: 'fixed',
    value: 50,
    minOrderAmount: 300,
    usageLimit: 200,
    usageCount: 89,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    description: 'Sabit 50€ indirim - 300€ ve üzeri alışverişlerde',
  },
  {
    id: '4',
    code: 'BLACKFRIDAY',
    type: 'percentage',
    value: 30,
    minOrderAmount: 200,
    maxDiscount: 200,
    usageLimit: 500,
    usageCount: 0,
    validFrom: '2024-11-01',
    validUntil: '2024-11-30',
    isActive: false, // Expired
    description: 'Black Friday özel - %30 indirim',
  },
  {
    id: '5',
    code: 'BEDAVAKARGO',
    type: 'fixed',
    value: 15,
    minOrderAmount: 150,
    usageLimit: 1000,
    usageCount: 234,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    description: 'Bedava kargo - 15€ kargo ücreti indirimi',
  },
];

// Get coupons from localStorage or use mock
const getStoredCoupons = (): Coupon[] => {
  const stored = localStorage.getItem('cvk_mock_coupons');
  return stored ? JSON.parse(stored) : MOCK_COUPONS;
};

const saveCoupons = (coupons: Coupon[]) => {
  localStorage.setItem('cvk_mock_coupons', JSON.stringify(coupons));
};

// Initialize
if (!localStorage.getItem('cvk_mock_coupons')) {
  saveCoupons(MOCK_COUPONS);
}

export const couponApi = {
  // Validate and apply coupon
  validateCoupon: async (
    code: string, 
    cartTotal: number
  ): Promise<{ 
    success: boolean; 
    coupon?: AppliedCoupon; 
    message?: string;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupons = getStoredCoupons();
        const coupon = coupons.find(
          c => c.code.toUpperCase() === code.toUpperCase()
        );

        if (!coupon) {
          resolve({ 
            success: false, 
            message: 'Geçersiz kupon kodu' 
          });
          return;
        }

        if (!coupon.isActive) {
          resolve({ 
            success: false, 
            message: 'Bu kupon kodu aktif değil' 
          });
          return;
        }

        const now = new Date();
        const validUntil = new Date(coupon.validUntil);
        if (now > validUntil) {
          resolve({ 
            success: false, 
            message: 'Bu kuponun süresi dolmuş' 
          });
          return;
        }

        if (coupon.usageCount >= coupon.usageLimit) {
          resolve({ 
            success: false, 
            message: 'Bu kuponun kullanım limiti dolmuş' 
          });
          return;
        }

        if (cartTotal < coupon.minOrderAmount) {
          resolve({ 
            success: false, 
            message: `Bu kupon için minimum sipariş tutarı €${coupon.minOrderAmount}'dir` 
          });
          return;
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
          discountAmount = (cartTotal * coupon.value) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.value;
        }

        resolve({
          success: true,
          coupon: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount: Number(discountAmount.toFixed(2)),
          },
        });
      }, 600);
    });
  },

  // Apply coupon (increment usage)
  applyCoupon: async (code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupons = getStoredCoupons();
        const couponIndex = coupons.findIndex(
          c => c.code.toUpperCase() === code.toUpperCase()
        );

        if (couponIndex !== -1) {
          coupons[couponIndex].usageCount += 1;
          saveCoupons(coupons);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  },

  // Get all coupons (Admin)
  getAllCoupons: async (): Promise<{ success: boolean; data?: Coupon[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupons = getStoredCoupons();
        resolve({ success: true, data: coupons });
      }, 400);
    });
  },

  // Create coupon (Admin)
  createCoupon: async (couponData: Omit<Coupon, 'id' | 'usageCount'>): Promise<{ 
    success: boolean; 
    data?: Coupon;
    message?: string;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupons = getStoredCoupons();
        
        // Check if code already exists
        if (coupons.some(c => c.code.toUpperCase() === couponData.code.toUpperCase())) {
          resolve({ success: false, message: 'Bu kupon kodu zaten mevcut' });
          return;
        }

        const newCoupon: Coupon = {
          ...couponData,
          id: Date.now().toString(),
          usageCount: 0,
        };

        coupons.push(newCoupon);
        saveCoupons(coupons);
        resolve({ success: true, data: newCoupon });
      }, 500);
    });
  },

  // Update coupon (Admin)
  updateCoupon: async (
    id: string, 
    updates: Partial<Coupon>
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupons = getStoredCoupons();
        const index = coupons.findIndex(c => c.id === id);

        if (index === -1) {
          resolve({ success: false, message: 'Kupon bulunamadı' });
          return;
        }

        coupons[index] = { ...coupons[index], ...updates };
        saveCoupons(coupons);
        resolve({ success: true });
      }, 400);
    });
  },

  // Delete coupon (Admin)
  deleteCoupon: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const coupons = getStoredCoupons();
        const filtered = coupons.filter(c => c.id !== id);
        
        if (filtered.length === coupons.length) {
          resolve({ success: false, message: 'Kupon bulunamadı' });
          return;
        }

        saveCoupons(filtered);
        resolve({ success: true });
      }, 400);
    });
  },

  // Calculate discount
  calculateDiscount: (coupon: AppliedCoupon, cartTotal: number): number => {
    if (coupon.type === 'percentage') {
      return Number(((cartTotal * coupon.value) / 100).toFixed(2));
    }
    return coupon.value;
  },
};

export default couponApi;

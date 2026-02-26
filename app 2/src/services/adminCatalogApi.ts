import { API_ENDPOINTS, getAuthToken } from '@/lib/api';

export interface ProductVariantPayload {
  id: string;
  size: string;
  color: string;
  palette: string;
  subscription: string;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
}

export interface ManagedProductPayload {
  id: number;
  name: string;
  slug: string;
  image: string;
  category: string;
  subCategory: string;
  tags: string[];
  status: 'active' | 'passive' | 'out_of_stock';
  description: string;
  metaTitle: string;
  metaDescription: string;
  basePrice: number;
  updatedAt: string;
  variants: ProductVariantPayload[];
}

export interface InventoryDepotStockPayload {
  variantId: string;
  depot: string;
  stock: number;
  minStock: number;
}

export interface InventoryMovementPayload {
  id: string;
  timestamp: string;
  productId: number;
  variantId: string;
  depot: string;
  type: 'in' | 'out' | 'return';
  quantity: number;
  note?: string;
}

export interface AdminCatalogSnapshot {
  products: ManagedProductPayload[];
  depots: string[];
  depotStocks: InventoryDepotStockPayload[];
  inventoryMovements: InventoryMovementPayload[];
  processedOrderIds: number[];
}

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const adminCatalogApi = {
  async getSnapshot(): Promise<{ success: boolean; data?: AdminCatalogSnapshot; message?: string }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.adminCatalog}?action=snapshot`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();
      if (!data.success) return { success: false, message: data.message || 'Katalog verisi alınamadı.' };
      return { success: true, data: data.data as AdminCatalogSnapshot };
    } catch {
      return { success: false, message: 'Katalog API bağlantısı kurulamadı.' };
    }
  },

  async saveSnapshot(snapshot: AdminCatalogSnapshot): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.adminCatalog, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          action: 'save_snapshot',
          ...snapshot,
        }),
      });

      const data = await response.json();
      if (!data.success) return { success: false, message: data.message || 'Katalog verisi kaydedilemedi.' };
      return { success: true, message: data.message || 'Katalog verisi kaydedildi.' };
    } catch {
      return { success: false, message: 'Katalog API bağlantısı kurulamadı.' };
    }
  },
};

// CVK Dijital - Ürün Karşılaştırma API Service
// localStorage + admin catalog based implementation (no SQL required)

import { getCatalogProducts, type CatalogProduct } from '@/services/productCatalog';

export interface CompareProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  features: Record<string, string | boolean | number>;
  specifications: Record<string, string>;
  pros: string[];
  cons: string[];
}

const COMPARISON_STORAGE_KEY = 'cvk_comparison_list';

const getStoredComparison = (): string[] => {
  try {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
};

const saveComparison = (ids: string[]) => {
  localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(ids));
};

function toCompareProduct(product: CatalogProduct): CompareProduct {
  const materialsText = product.materials.length > 0 ? product.materials.join(', ') : 'Standart';
  const sizesText = product.sizes.length > 0 ? product.sizes.join(', ') : 'Standart';

  return {
    id: String(product.id),
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image,
    rating: product.rating,
    reviews: product.reviews,
    features: {
      'Stok Durumu': (product.stock ?? 0) > 0 ? 'Stokta' : 'Tukendi',
      'Minimum Siparis': `${product.minOrder} adet`,
      'Kategori': product.category,
      'One Cikan': product.features[0] || 'Ozel Uretim',
      'Teslimat': product.leadTime,
      'Rozet': product.badge || 'Standart',
    },
    specifications: {
      Boyutlar: sizesText,
      Malzemeler: materialsText,
      'Baslangic Fiyati': product.startingPrice,
      'Birim Fiyat': `€${product.price.toFixed(2)}`,
      Aciklama: product.description,
    },
    pros: [
      product.features[0] || 'Yuksek baski kalitesi',
      product.features[1] || 'Esnek urun yapisi',
      product.stock && product.stock > 0 ? 'Hizli temin' : 'Yeniden stoklanabilir',
    ],
    cons: [
      product.stock === 0 ? 'Anlik olarak stokta degil' : 'Kisisel baski sureci gerekiyor',
      product.minOrder > 100 ? `${product.minOrder} adet minimum siparis` : 'Standart minimum siparis',
    ],
  };
}

function getComparableProducts(): CompareProduct[] {
  return getCatalogProducts().map(toCompareProduct);
}

export const comparisonApi = {
  addToComparison: async (
    productId: string
  ): Promise<{ success: boolean; message?: string; count?: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = getStoredComparison();
        const normalizedId = String(productId);

        if (current.includes(normalizedId)) {
          resolve({ success: false, message: 'Urun zaten listede', count: current.length });
          return;
        }

        if (current.length >= 4) {
          resolve({ success: false, message: 'En fazla 4 urun karsilastirabilirsiniz', count: current.length });
          return;
        }

        current.push(normalizedId);
        saveComparison(current);

        resolve({ success: true, count: current.length });
      }, 200);
    });
  },

  removeFromComparison: async (productId: string): Promise<{ success: boolean; count?: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedId = String(productId);
        const current = getStoredComparison();
        const updated = current.filter((id) => id !== normalizedId);
        saveComparison(updated);

        resolve({ success: true, count: updated.length });
      }, 200);
    });
  },

  getComparisonList: async (): Promise<{
    success: boolean;
    products?: CompareProduct[];
    count?: number;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ids = getStoredComparison();
        const catalogProducts = getComparableProducts();
        const productsById = new Map(catalogProducts.map((product) => [product.id, product]));

        const products = ids
          .map((id) => productsById.get(String(id)))
          .filter((product): product is CompareProduct => Boolean(product));

        if (products.length !== ids.length) {
          saveComparison(products.map((product) => product.id));
        }

        resolve({
          success: true,
          products,
          count: products.length,
        });
      }, 250);
    });
  },

  isInComparison: (productId: string): boolean => {
    const current = getStoredComparison();
    return current.includes(String(productId));
  },

  clearComparison: async (): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        saveComparison([]);
        resolve({ success: true });
      }, 200);
    });
  },

  getCount: (): number => {
    return getStoredComparison().length;
  },
};

export default comparisonApi;

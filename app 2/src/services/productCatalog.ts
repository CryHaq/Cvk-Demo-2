export interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  minOrder: number;
  stock?: number;
  image: string;
  rating: number;
  reviews: number;
  features: string[];
  badge?: string | null;
  description: string;
  sizes: string[];
  materials: string[];
  leadTime: string;
  startingPrice: string;
}

interface AdminVariant {
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

interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  image?: string;
  category: string;
  subCategory: string;
  tags: string[];
  status: 'active' | 'passive' | 'out_of_stock';
  description: string;
  metaTitle: string;
  metaDescription: string;
  basePrice: number;
  updatedAt: string;
  variants: AdminVariant[];
}

const ADMIN_PRODUCT_STORAGE_KEY = 'cvk_admin_products_v1';
const EUR_TO_TRY = 40;

const categoryImageMap: Record<string, string> = {
  doypack: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  zip: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  paper: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
  recyclable: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&q=80',
  aluminum: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
};

const fallbackProducts: CatalogProduct[] = [
  {
    id: 1,
    name: 'Özel Baskılı Doypack Poşet',
    category: 'doypack',
    price: 0.45,
    minOrder: 500,
    stock: 1500,
    image: categoryImageMap.doypack,
    rating: 4.8,
    reviews: 124,
    features: ['12 Boyut', '10 Malzeme', 'Mat veya Parlak'],
    badge: 'En Çok Satan',
    description: 'Yüksek bariyerli malzeme ile raf görünürlüğü yüksek ambalaj çözümü.',
    sizes: ['8x13 cm', '10x15 cm', '12x18 cm', '14x20 cm'],
    materials: ['Alüminyum Bariyer', 'Kraft Kağıt', 'Geri Dönüştürülebilir'],
    leadTime: '24 saat',
    startingPrice: '₺1.250',
  },
  {
    id: 2,
    name: 'Fermuarlı Doypack Poşet',
    category: 'zip',
    price: 0.52,
    minOrder: 500,
    stock: 800,
    image: categoryImageMap.zip,
    rating: 4.9,
    reviews: 89,
    features: ['Tekrar Kapanabilir', 'Koku Geçirmez', 'Gıda Güvenli'],
    badge: 'Yeni',
    description: 'Fermuarlı yapı ile tekrar kullanım ve tazelik koruma avantajı.',
    sizes: ['10x15 cm', '12x18 cm', '14x20 cm'],
    materials: ['Alüminyum Bariyer', 'Mat BOPP'],
    leadTime: '36 saat',
    startingPrice: '₺1.380',
  },
  {
    id: 3,
    name: 'Kraft Kağıt Doypack',
    category: 'paper',
    price: 0.38,
    minOrder: 1000,
    stock: 0,
    image: categoryImageMap.paper,
    rating: 4.7,
    reviews: 67,
    features: ['%100 Geri Dönüştürülebilir', 'Doğal Görünüm', 'Eco-Friendly'],
    badge: 'Sürdürülebilir',
    description: 'Doğal ve çevre dostu kraft kağıt görünümü.',
    sizes: ['8x13 cm', '10x15 cm', '12x18 cm'],
    materials: ['Kraft Kağıt'],
    leadTime: '48 saat',
    startingPrice: '₺980',
  },
];

function toShopCategory(rawCategory: string): string {
  const value = (rawCategory || '').toLocaleLowerCase('tr-TR');
  if (value.includes('alü') || value.includes('alu')) return 'aluminum';
  if (value.includes('kraft') || value.includes('kağıt') || value.includes('kagit') || value.includes('paper')) return 'paper';
  if (value.includes('recy') || value.includes('geri')) return 'recyclable';
  if (value.includes('zip') || value.includes('fermuar')) return 'zip';
  return 'doypack';
}

function fromAdminProduct(product: AdminProduct, index: number): CatalogProduct {
  const category = toShopCategory(product.category);
  const totalStock = product.variants.reduce((sum, item) => sum + (item.stock || 0), 0);
  const firstVariant = product.variants[0];
  const bestPrice = firstVariant?.price || product.basePrice || 0.45;
  const sizes = product.variants.map((variant) => variant.size).filter(Boolean);
  const materials = product.variants.map((variant) => variant.palette).filter(Boolean);
  const colorFeatures = product.variants.map((variant) => variant.color).filter(Boolean);
  const tagFeatures = (product.tags || []).slice(0, 2);
  const features = Array.from(new Set([...sizes.slice(0, 2), ...colorFeatures.slice(0, 2), ...tagFeatures])).slice(0, 3);

  return {
    id: product.id,
    name: product.name,
    category,
    price: Number(bestPrice) || 0.45,
    minOrder: 500,
    stock: product.status === 'out_of_stock' ? 0 : totalStock,
    image: product.image || categoryImageMap[category] || categoryImageMap.doypack,
    rating: 4.5 + (index % 5) * 0.1,
    reviews: 20 + index * 7,
    features: features.length > 0 ? features : ['Özel Üretim', 'Yüksek Baskı Kalitesi', 'Hızlı Termin'],
    badge: product.status === 'out_of_stock' ? null : 'Admin Ürünü',
    description: product.description || product.metaDescription || 'Admin panelden yönetilen özel ambalaj ürünü.',
    sizes: sizes.length > 0 ? sizes : ['Standart'],
    materials: materials.length > 0 ? materials : ['CMYK'],
    leadTime: product.status === 'out_of_stock' ? 'Stok yenileniyor' : '24-48 saat',
    startingPrice: `₺${Math.round((Number(bestPrice) || 0.45) * EUR_TO_TRY).toLocaleString('tr-TR')}`,
  };
}

function getAdminProducts(): AdminProduct[] {
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCatalogProducts(): CatalogProduct[] {
  if (typeof window === 'undefined') return fallbackProducts;

  const adminProducts = getAdminProducts()
    .filter((product) => product.status !== 'passive')
    .map((product, index) => fromAdminProduct(product, index));

  if (adminProducts.length > 0) {
    return adminProducts;
  }

  return fallbackProducts;
}

export function getHomeShowcaseProducts(limit: number = 3): CatalogProduct[] {
  return getCatalogProducts().slice(0, limit);
}

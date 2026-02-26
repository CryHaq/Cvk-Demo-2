import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Upload,
  Trash2,
  RefreshCw,
  Activity,
  Database,
  FileJson,
  FileSpreadsheet,
  Calendar,
  Filter,
  Clock,
  Archive,
  AlertTriangle,
  Truck,
  CreditCard,
  Plus,
  Pencil,
  WandSparkles,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orderApi } from '@/services/orderApi';
import { useDataManager } from '@/services/dataManager';
import { recommendationEngine } from '@/services/recommendationEngine';
import { couponApi, type Coupon } from '@/services/couponApi';
import { toast } from '@/components/Toast';
import {
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';

interface OrderItem {
  id: number;
  product_type?: string;
  quantity: number;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type ProductStatus = 'active' | 'passive' | 'out_of_stock';

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  shipping_address: {
    full_name: string;
    email: string;
  };
  items: OrderItem[];
}

interface PeriodMetric {
  orders: number;
  revenue: number;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  detail: string;
  count: number;
}

interface ProductVariant {
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

interface ManagedProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
  category: string;
  subCategory: string;
  tags: string[];
  status: ProductStatus;
  description: string;
  metaTitle: string;
  metaDescription: string;
  basePrice: number;
  updatedAt: string;
  variants: ProductVariant[];
}

interface ProductFormState {
  id?: number;
  name: string;
  slug: string;
  image: string;
  category: string;
  subCategory: string;
  tags: string;
  status: ProductStatus;
  description: string;
  metaTitle: string;
  metaDescription: string;
  basePrice: number;
  variants: ProductVariant[];
}

interface CouponFormState {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description: string;
}

type MovementType = 'in' | 'out' | 'return';

interface InventoryDepotStock {
  variantId: string;
  depot: string;
  stock: number;
  minStock: number;
}

interface InventoryMovement {
  id: string;
  timestamp: string;
  productId: number;
  variantId: string;
  depot: string;
  type: MovementType;
  quantity: number;
  note?: string;
}

interface InventoryRow {
  productId: number;
  productName: string;
  variantId: string;
  variantLabel: string;
  sku: string;
  totalStock: number;
  minStock: number;
  depots: Record<string, number>;
  dailySales: number;
  daysToStockout: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const lowStockCatalog = [
  { name: 'Doypack 250g', stock: 12 },
  { name: 'Kraft 500g', stock: 9 },
  { name: 'Valfli Kahve 1kg', stock: 6 },
  { name: 'Ziplock Snack', stock: 28 },
];

const PRODUCT_STORAGE_KEY = 'cvk_admin_products_v1';
const INVENTORY_STOCK_KEY = 'cvk_inventory_depot_stock_v1';
const INVENTORY_MOVEMENTS_KEY = 'cvk_inventory_movements_v1';
const INVENTORY_PROCESSED_ORDERS_KEY = 'cvk_inventory_processed_orders_v1';
const INVENTORY_DEPOTS_STORAGE_KEY = 'cvk_inventory_depots_v1';
const MOCK_ORDER_STORAGE_KEY = 'cvk_mock_orders';
const MOCK_COUPON_STORAGE_KEY = 'cvk_mock_coupons';
const RECOMMENDATION_BEHAVIOR_KEY = 'cvk_user_behavior';
const RECOMMENDATION_PRODUCT_STATS_KEY = 'cvk_reco_product_stats_v1';
const DEFAULT_INVENTORY_DEPOTS = ['Merkez Depo', 'İstanbul Depo', 'Ankara Depo'];

const productCategories = ['Doypack', 'Fermuarlı', 'Kraft', 'Alüminyum', 'Recyclable', 'Abonelik'];

const initialProductSeed: ManagedProduct[] = [
  {
    id: 1,
    name: 'Özel Baskılı Doypack Poşet',
    slug: 'ozel-baskili-doypack-poset',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    category: 'Doypack',
    subCategory: 'Stand-Up',
    tags: ['baskili', 'doypack', 'gida'],
    status: 'active',
    description: 'Yüksek bariyerli özel baskılı doypack çözümü.',
    metaTitle: 'Özel Baskılı Doypack Poşet | CVK',
    metaDescription: 'Gıda ve kahve için özel baskılı doypack poşet üretimi.',
    basePrice: 0.45,
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 'v1',
        size: '12x18 cm',
        color: 'Mat Siyah',
        palette: 'CMYK',
        subscription: 'Tek Sefer',
        sku: 'CVK-DYP-1218-MS',
        barcode: '8690000000001',
        price: 0.45,
        stock: 320,
      },
      {
        id: 'v2',
        size: '14x20 cm',
        color: 'Kraft',
        palette: 'Pantone',
        subscription: 'Aylık',
        sku: 'CVK-DYP-1420-KR',
        barcode: '8690000000002',
        price: 0.51,
        stock: 95,
      },
    ],
  },
  {
    id: 2,
    name: 'Fermuarlı Kahve Poşeti',
    slug: 'fermuarli-kahve-poseti',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
    category: 'Fermuarlı',
    subCategory: 'Kahve',
    tags: ['kahve', 'zip', 'premium'],
    status: 'active',
    description: 'Aroma koruyucu fermuarlı kahve poşeti.',
    metaTitle: 'Fermuarlı Kahve Poşeti | CVK',
    metaDescription: 'Kahve ambalajı için valfli ve fermuarlı premium poşet.',
    basePrice: 0.58,
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 'v3',
        size: '10x15 cm',
        color: 'Lacivert',
        palette: 'CMYK',
        subscription: 'Tek Sefer',
        sku: 'CVK-ZIP-1015-LC',
        barcode: '8690000000003',
        price: 0.58,
        stock: 42,
      },
    ],
  },
];

const initialCouponSeed: Coupon[] = [
  {
    id: 'seed-1',
    code: 'HOSGELDIN15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 150,
    maxDiscount: 120,
    usageLimit: 300,
    usageCount: 23,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    description: 'Yeni musterilere %15 indirim',
  },
  {
    id: 'seed-2',
    code: 'KARGO25',
    type: 'fixed',
    value: 25,
    minOrderAmount: 250,
    usageLimit: 500,
    usageCount: 55,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    description: 'Sepette sabit 25 EUR indirim',
  },
  {
    id: 'seed-3',
    code: 'B2BVIP20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 500,
    maxDiscount: 250,
    usageLimit: 100,
    usageCount: 9,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    description: 'B2B partnerlere ozel %20 kampanya',
  },
];

function createDemoOrders(): any[] {
  const now = Date.now();
  const day = DAY_MS;

  return [
    {
      id: 900001,
      order_number: 'CVK-20260226-ALFA01',
      user_id: 1,
      subtotal: 980,
      vat_amount: 215.6,
      discount_amount: 0,
      shipping_cost: 0,
      total_amount: 1195.6,
      currency: 'EUR',
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'card',
      shipping_company: 'Yurtici Kargo',
      tracking_number: 'TR900001234',
      shipping_address: {
        full_name: 'Demo Kullanici',
        phone: '+90 555 000 00 01',
        email: 'demo@cvk.com',
        full_address: 'Levent Mah. Buyukdere Cd. No:1',
        city: 'Istanbul',
        zip: '34330',
        country: 'TR',
      },
      billing_address: {
        full_name: 'Demo Kullanici',
        phone: '+90 555 000 00 01',
        email: 'demo@cvk.com',
        full_address: 'Levent Mah. Buyukdere Cd. No:1',
        city: 'Istanbul',
        zip: '34330',
        country: 'TR',
      },
      items: [
        {
          id: 1,
          product_type: 'Özel Baskılı Doypack Poşet',
          size: '12x18 cm',
          material: 'Mat Siyah',
          quantity: 1500,
          graphics_count: 1,
          unit_price: 0.45,
          total_price: 675,
          has_zip: true,
          has_valve: false,
        },
      ],
      status_history: [{ id: 1, new_status: 'delivered', changed_by: 0, changed_by_type: 'system', created_at: new Date(now - day).toISOString() }],
      created_at: new Date(now - day * 9).toISOString(),
      updated_at: new Date(now - day).toISOString(),
    },
    {
      id: 900002,
      order_number: 'CVK-20260226-BETA02',
      user_id: 1,
      subtotal: 640,
      vat_amount: 140.8,
      discount_amount: 0,
      shipping_cost: 0,
      total_amount: 780.8,
      currency: 'EUR',
      status: 'processing',
      payment_status: 'paid',
      payment_method: 'card',
      shipping_address: {
        full_name: 'Demo Kullanici',
        phone: '+90 555 000 00 01',
        email: 'demo@cvk.com',
        full_address: 'Levent Mah. Buyukdere Cd. No:1',
        city: 'Istanbul',
        zip: '34330',
        country: 'TR',
      },
      billing_address: {
        full_name: 'Demo Kullanici',
        phone: '+90 555 000 00 01',
        email: 'demo@cvk.com',
        full_address: 'Levent Mah. Buyukdere Cd. No:1',
        city: 'Istanbul',
        zip: '34330',
        country: 'TR',
      },
      items: [
        {
          id: 2,
          product_type: 'Fermuarlı Kahve Poşeti',
          size: '10x15 cm',
          material: 'Lacivert',
          quantity: 1000,
          graphics_count: 1,
          unit_price: 0.58,
          total_price: 580,
          has_zip: true,
          has_valve: true,
        },
      ],
      status_history: [{ id: 2, new_status: 'processing', changed_by: 0, changed_by_type: 'system', created_at: new Date(now - day * 2).toISOString() }],
      created_at: new Date(now - day * 4).toISOString(),
      updated_at: new Date(now - day * 2).toISOString(),
    },
    {
      id: 900003,
      order_number: 'CVK-20260226-GAMMA03',
      user_id: 2,
      subtotal: 440,
      vat_amount: 96.8,
      discount_amount: 25,
      shipping_cost: 0,
      total_amount: 511.8,
      currency: 'EUR',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: {
        full_name: 'Kurumsal Musteri',
        phone: '+90 555 000 00 02',
        email: 'satinalma@firma.com',
        full_address: 'Teknopark Blok A',
        city: 'Ankara',
        zip: '06560',
        country: 'TR',
      },
      billing_address: {
        full_name: 'Kurumsal Musteri',
        phone: '+90 555 000 00 02',
        email: 'satinalma@firma.com',
        full_address: 'Teknopark Blok A',
        city: 'Ankara',
        zip: '06560',
        country: 'TR',
      },
      items: [
        {
          id: 3,
          product_type: 'Özel Baskılı Doypack Poşet',
          size: '14x20 cm',
          material: 'Kraft',
          quantity: 800,
          graphics_count: 2,
          unit_price: 0.51,
          total_price: 408,
          has_zip: true,
          has_valve: false,
        },
      ],
      status_history: [{ id: 3, new_status: 'pending', changed_by: 2, changed_by_type: 'customer', created_at: new Date(now - day).toISOString() }],
      created_at: new Date(now - day).toISOString(),
      updated_at: new Date(now - day).toISOString(),
    },
    {
      id: 900004,
      order_number: 'CVK-20260226-DELTA04',
      user_id: 3,
      subtotal: 320,
      vat_amount: 70.4,
      discount_amount: 0,
      shipping_cost: 0,
      total_amount: 390.4,
      currency: 'EUR',
      status: 'cancelled',
      payment_status: 'failed',
      shipping_address: {
        full_name: 'Iptal Musterisi',
        phone: '+90 555 000 00 03',
        email: 'failed@cvk.com',
        full_address: 'Ornek Mah. No:12',
        city: 'Izmir',
        zip: '35000',
        country: 'TR',
      },
      billing_address: {
        full_name: 'Iptal Musterisi',
        phone: '+90 555 000 00 03',
        email: 'failed@cvk.com',
        full_address: 'Ornek Mah. No:12',
        city: 'Izmir',
        zip: '35000',
        country: 'TR',
      },
      items: [
        {
          id: 4,
          product_type: 'Fermuarlı Kahve Poşeti',
          size: '10x15 cm',
          material: 'Lacivert',
          quantity: 500,
          graphics_count: 1,
          unit_price: 0.58,
          total_price: 290,
          has_zip: true,
          has_valve: true,
        },
      ],
      status_history: [{ id: 4, new_status: 'cancelled', changed_by: 0, changed_by_type: 'system', created_at: new Date(now - day * 3).toISOString() }],
      created_at: new Date(now - day * 3).toISOString(),
      updated_at: new Date(now - day * 3).toISOString(),
    },
  ];
}

function getRangeDays(dateRange: string): number {
  if (dateRange === 'today') return 1;
  if (dateRange === '7days') return 7;
  if (dateRange === '30days') return 30;
  if (dateRange === '90days') return 90;
  return 365;
}

function isWithinDays(dateIso: string, days: number): boolean {
  const target = new Date(dateIso).getTime();
  const cutoff = Date.now() - days * DAY_MS;
  return target >= cutoff;
}

function sumRevenue(orders: Order[]): number {
  return orders
    .filter((order) => order.payment_status === 'paid')
    .reduce((acc, order) => acc + (order.total_amount || 0), 0);
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateEan13(seed: number): string {
  const body = `869${String(seed).padStart(9, '0')}`.slice(0, 12);
  const sum = body
    .split('')
    .map(Number)
    .reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return `${body}${check}`;
}

function createVariant(seed: number): ProductVariant {
  return {
    id: `variant-${Date.now()}-${seed}`,
    size: '',
    color: '',
    palette: '',
    subscription: '',
    sku: `CVK-SKU-${Date.now().toString().slice(-6)}-${seed}`,
    barcode: generateEan13(seed + 100000),
    price: 0,
    stock: 0,
  };
}

function createEmptyProductForm(): ProductFormState {
  return {
    name: '',
    slug: '',
    image: '',
    category: 'Doypack',
    subCategory: '',
    tags: '',
    status: 'active',
    description: '',
    metaTitle: '',
    metaDescription: '',
    basePrice: 0,
    variants: [createVariant(1)],
  };
}

function createEmptyCouponForm(): CouponFormState {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    code: '',
    type: 'percentage',
    value: 10,
    minOrderAmount: 100,
    maxDiscount: 100,
    usageLimit: 100,
    validFrom: today.toISOString().slice(0, 10),
    validUntil: nextMonth.toISOString().slice(0, 10),
    isActive: true,
    description: '',
  };
}

function aiGenerateProductCopy(form: ProductFormState): Pick<ProductFormState, 'description' | 'metaTitle' | 'metaDescription' | 'slug'> {
  const categoryText = form.category || 'Ambalaj';
  const subCategoryText = form.subCategory ? ` ${form.subCategory}` : '';
  const title = form.name || `${categoryText} Ürünü`;
  const slug = form.slug || slugify(title);

  const description = `${title}, ${categoryText}${subCategoryText} segmentinde yüksek bariyerli, baskı kalitesi yüksek ve üretim süreçlerine uygun bir çözüm sunar. Farklı beden/renk/palet varyantlarıyla markanızın raf görünürlüğünü güçlendirir.`;
  const metaTitle = `${title} | ${categoryText} Ambalaj Çözümü`;
  const metaDescription = `${title} için özel üretim, varyant yönetimi ve hızlı termin avantajı. ${categoryText} ambalaj ihtiyaçlarınız için profesyonel çözüm.`;

  return { description, metaTitle, metaDescription, slug };
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm());
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | ProductStatus>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | string>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<'none' | ProductStatus>('none');
  const [bulkCategory, setBulkCategory] = useState<'none' | string>('none');
  const [bulkTag, setBulkTag] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState<CouponFormState>(createEmptyCouponForm());
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [couponTypeFilter, setCouponTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [depots, setDepots] = useState<string[]>(DEFAULT_INVENTORY_DEPOTS);
  const [newDepotName, setNewDepotName] = useState('');
  const [depotStocks, setDepotStocks] = useState<InventoryDepotStock[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [inventoryDepotFilter, setInventoryDepotFilter] = useState<'all' | string>('all');
  const [movementForm, setMovementForm] = useState<{
    productId: number | null;
    variantId: string;
    depot: string;
    type: MovementType;
    quantity: number;
    note: string;
  }>({
    productId: null,
    variantId: '',
    depot: DEFAULT_INVENTORY_DEPOTS[0],
    type: 'in',
    quantity: 1,
    note: '',
  });
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [backups, setBackups] = useState<any[]>([]);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [recommendationStats, setRecommendationStats] = useState<any>(null);

  const dataManager = useDataManager();

  useEffect(() => {
    loadData();
    loadBackups();
    loadStorageStats();
    loadRecommendationStats();
    loadProducts();
    loadCoupons();
    loadDepots();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const ordersResponse = await orderApi.getAllOrders();
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data.orders || []);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Veriler yüklenirken hata oluştu.');
    }
    setLoading(false);
  };

  const loadBackups = () => {
    setBackups(dataManager.getBackups());
  };

  const loadStorageStats = () => {
    setStorageStats(dataManager.getStorageStats());
  };

  const loadRecommendationStats = () => {
    setRecommendationStats(recommendationEngine.getStats());
  };

  const loadProducts = () => {
    try {
      const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
      if (!raw) {
        setProducts(initialProductSeed);
        return;
      }
      const parsed = JSON.parse(raw) as ManagedProduct[];
      setProducts(Array.isArray(parsed) ? parsed : initialProductSeed);
    } catch {
      setProducts(initialProductSeed);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await couponApi.getAllCoupons();
      if (response.success && response.data) {
        setCoupons(response.data);
      }
    } catch {
      toast.error('Kuponlar yüklenemedi.');
    }
  };

  const loadDepots = () => {
    try {
      const raw = localStorage.getItem(INVENTORY_DEPOTS_STORAGE_KEY);
      if (!raw) {
        setDepots(DEFAULT_INVENTORY_DEPOTS);
        return;
      }
      const parsed = JSON.parse(raw) as string[];
      const cleaned = Array.isArray(parsed)
        ? parsed.map((item) => item.trim()).filter(Boolean)
        : [];
      setDepots(cleaned.length > 0 ? cleaned : DEFAULT_INVENTORY_DEPOTS);
    } catch {
      setDepots(DEFAULT_INVENTORY_DEPOTS);
    }
  };

  const initializeInventoryForProducts = (sourceProducts: ManagedProduct[], depotList: string[]) => {
    const variants = sourceProducts.flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        variantId: variant.id,
        stock: variant.stock,
      }))
    );

    let storedStocks: InventoryDepotStock[] = [];
    let storedMovements: InventoryMovement[] = [];
    try {
      storedStocks = JSON.parse(localStorage.getItem(INVENTORY_STOCK_KEY) || '[]') as InventoryDepotStock[];
    } catch {
      storedStocks = [];
    }
    try {
      storedMovements = JSON.parse(localStorage.getItem(INVENTORY_MOVEMENTS_KEY) || '[]') as InventoryMovement[];
    } catch {
      storedMovements = [];
    }

    const variantIdSet = new Set(variants.map((variant) => variant.variantId));
    const cleanStocks = storedStocks.filter((item) => variantIdSet.has(item.variantId));

    const stockMap = new Map(cleanStocks.map((item) => [`${item.variantId}__${item.depot}`, item]));

    variants.forEach((variant) => {
      const center = Math.max(0, Math.floor(variant.stock * 0.6));
      const istanbul = Math.max(0, Math.floor(variant.stock * 0.25));
      const ankara = Math.max(0, variant.stock - center - istanbul);

      const defaults: Record<string, number> = {
        [depotList[0] || DEFAULT_INVENTORY_DEPOTS[0]]: center,
        [depotList[1] || DEFAULT_INVENTORY_DEPOTS[1]]: istanbul,
        [depotList[2] || DEFAULT_INVENTORY_DEPOTS[2]]: ankara,
      };

      depotList.forEach((depot) => {
        const key = `${variant.variantId}__${depot}`;
        if (!stockMap.has(key)) {
          stockMap.set(key, {
            variantId: variant.variantId,
            depot,
            stock: defaults[depot] ?? 0,
            minStock: Math.max(5, Math.floor(variant.stock * 0.15)),
          });
        }
      });
    });

    const nextStocks = Array.from(stockMap.values());
    const nextMovements = storedMovements.filter((movement) => variantIdSet.has(movement.variantId));

    setDepotStocks(nextStocks);
    setInventoryMovements(nextMovements);
  };

  useEffect(() => {
    if (products.length === 0) return;
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (products.length === 0 || depots.length === 0) return;
    initializeInventoryForProducts(products, depots);
  }, [products, depots]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_STOCK_KEY, JSON.stringify(depotStocks));
  }, [depotStocks]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_MOVEMENTS_KEY, JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_DEPOTS_STORAGE_KEY, JSON.stringify(depots));
    setMovementForm((prev) => {
      if (depots.includes(prev.depot)) return prev;
      return { ...prev, depot: depots[0] || '' };
    });
  }, [depots]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders]
  );

  const todayOrders = useMemo(() => orders.filter((order) => isWithinDays(order.created_at, 1)), [orders]);
  const weekOrders = useMemo(() => orders.filter((order) => isWithinDays(order.created_at, 7)), [orders]);
  const monthOrders = useMemo(() => orders.filter((order) => isWithinDays(order.created_at, 30)), [orders]);

  const selectedRangeOrders = useMemo(() => {
    const days = getRangeDays(dateRange);
    return orders.filter((order) => isWithinDays(order.created_at, days));
  }, [orders, dateRange]);

  const periodMetrics = useMemo((): { daily: PeriodMetric; weekly: PeriodMetric; monthly: PeriodMetric } => {
    return {
      daily: { orders: todayOrders.length, revenue: sumRevenue(todayOrders) },
      weekly: { orders: weekOrders.length, revenue: sumRevenue(weekOrders) },
      monthly: { orders: monthOrders.length, revenue: sumRevenue(monthOrders) },
    };
  }, [todayOrders, weekOrders, monthOrders]);

  const paidOrders = useMemo(() => orders.filter((order) => order.payment_status === 'paid'), [orders]);

  const averageBasket = useMemo(() => {
    if (paidOrders.length === 0) return 0;
    return sumRevenue(paidOrders) / paidOrders.length;
  }, [paidOrders]);

  const returnRate = useMemo(() => {
    if (orders.length === 0) return 0;
    const returned = orders.filter((order) => ['cancelled', 'refunded'].includes(order.status)).length;
    return (returned / orders.length) * 100;
  }, [orders]);

  const topSellers = useMemo(() => {
    const bucket: Record<string, number> = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.product_type || 'Diğer Ürün';
        bucket[name] = (bucket[name] || 0) + (item.quantity || 1);
      });
    });

    return Object.entries(bucket)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [orders]);

  const topSeller = topSellers[0];

  const criticalAlerts = useMemo((): AlertItem[] => {
    const lowStockItems = lowStockCatalog.filter((item) => item.stock <= 15);
    const unshipped = orders.filter((order) => !['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status));
    const failedPayments = orders.filter((order) => order.payment_status === 'failed');

    const alerts: AlertItem[] = [];

    if (lowStockItems.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'danger',
        title: 'Stok bitmek üzere',
        detail: `${lowStockItems.slice(0, 2).map((x) => x.name).join(', ')} ürünlerinde kritik seviye.`,
        count: lowStockItems.length,
      });
    }

    if (unshipped.length > 0) {
      alerts.push({
        id: 'unshipped',
        type: 'warning',
        title: 'Kargoya verilmemiş siparişler',
        detail: 'Operasyon kuyruğunda bekleyen siparişler var.',
        count: unshipped.length,
      });
    }

    if (failedPayments.length > 0) {
      alerts.push({
        id: 'failed-payment',
        type: 'warning',
        title: 'Başarısız ödemeler',
        detail: 'Ödeme tekrar denemesi veya müşteri iletişimi gerekiyor.',
        count: failedPayments.length,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'healthy',
        type: 'info',
        title: 'Kritik uyarı yok',
        detail: 'Stok, ödeme ve gönderim akışları normal ilerliyor.',
        count: 0,
      });
    }

    return alerts;
  }, [orders]);

  const statusData = useMemo(() => {
    const statuses = [
      { key: 'pending', name: 'Bekleyen', color: '#f59e0b' },
      { key: 'confirmed', name: 'Onaylandı', color: '#0077be' },
      { key: 'processing', name: 'İşleniyor', color: '#00a8e8' },
      { key: 'shipped', name: 'Kargoda', color: '#6366f1' },
      { key: 'delivered', name: 'Teslim', color: '#22c55e' },
      { key: 'cancelled', name: 'İptal', color: '#ef4444' },
    ];

    return statuses.map((status) => ({
      name: status.name,
      value: orders.filter((order) => order.status === status.key).length,
      color: status.color,
    }));
  }, [orders]);

  const salesTrendData = useMemo(() => {
    const days = getRangeDays(dateRange);
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dailyOrders = orders.filter((order) => {
        const ts = new Date(order.created_at).getTime();
        return ts >= dayStart.getTime() && ts < dayEnd.getTime();
      });

      result.push({
        day: dayStart.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        orders: dailyOrders.length,
        revenue: sumRevenue(dailyOrders),
      });
    }

    return result;
  }, [orders, dateRange]);

  const trafficConversionData = useMemo(() => {
    return salesTrendData.map((item, index) => {
      const traffic = Math.max(item.orders * 18 + 80 + ((index + 3) % 5) * 21, 50);
      const conversion = traffic > 0 ? (item.orders / traffic) * 100 : 0;
      return {
        day: item.day,
        traffic,
        orders: item.orders,
        conversion: Number(conversion.toFixed(2)),
      };
    });
  }, [salesTrendData]);

  const campaignPerformance = useMemo(() => {
    const totalRevenue = sumRevenue(selectedRangeOrders);
    const base = Math.max(totalRevenue, 2000);

    return [
      { name: 'Google Ads', spend: Math.round(base * 0.09), revenue: Math.round(base * 0.33), conversion: 3.6 },
      { name: 'Meta Ads', spend: Math.round(base * 0.07), revenue: Math.round(base * 0.24), conversion: 2.9 },
      { name: 'E-posta', spend: Math.round(base * 0.03), revenue: Math.round(base * 0.17), conversion: 5.4 },
      { name: 'Affiliate', spend: Math.round(base * 0.04), revenue: Math.round(base * 0.12), conversion: 2.4 },
    ].map((campaign) => ({
      ...campaign,
      roas: campaign.spend > 0 ? Number((campaign.revenue / campaign.spend).toFixed(2)) : 0,
    }));
  }, [selectedRangeOrders]);

  const topProductData = useMemo(
    () => topSellers.slice(0, 6).map((product) => ({ name: product.name, quantity: product.quantity })),
    [topSellers]
  );

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();

    return sortedOrders.filter((order) => {
      const matchesQuery =
        !query ||
        order.order_number.toLowerCase().includes(query) ||
        order.shipping_address?.full_name?.toLowerCase().includes(query) ||
        order.shipping_address?.email?.toLowerCase().includes(query);

      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const matchesPayment = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;

      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [sortedOrders, orderSearch, orderStatusFilter, paymentStatusFilter]);

  const orderOpsSummary = useMemo(
    () => ({
      pending: orders.filter((order) => order.status === 'pending').length,
      processing: orders.filter((order) => ['confirmed', 'processing'].includes(order.status)).length,
      shipped: orders.filter((order) => order.status === 'shipped').length,
      failedPayments: orders.filter((order) => order.payment_status === 'failed').length,
    }),
    [orders]
  );

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const inQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));
      const inStatus = productStatusFilter === 'all' || product.status === productStatusFilter;
      const inCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
      return inQuery && inStatus && inCategory;
    });
  }, [products, productSearch, productStatusFilter, productCategoryFilter]);

  const productSummary = useMemo(
    () => ({
      total: products.length,
      active: products.filter((x) => x.status === 'active').length,
      passive: products.filter((x) => x.status === 'passive').length,
      outOfStock: products.filter((x) => x.status === 'out_of_stock').length,
      variants: products.reduce((acc, item) => acc + item.variants.length, 0),
    }),
    [products]
  );

  const filteredCoupons = useMemo(() => {
    const query = couponSearch.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const inQuery =
        !query ||
        coupon.code.toLowerCase().includes(query) ||
        (coupon.description || '').toLowerCase().includes(query);
      const inStatus =
        couponStatusFilter === 'all' ||
        (couponStatusFilter === 'active' ? coupon.isActive : !coupon.isActive);
      const inType = couponTypeFilter === 'all' || coupon.type === couponTypeFilter;

      return inQuery && inStatus && inType;
    });
  }, [coupons, couponSearch, couponStatusFilter, couponTypeFilter]);

  const couponSummary = useMemo(
    () => ({
      total: coupons.length,
      active: coupons.filter((coupon) => coupon.isActive).length,
      inactive: coupons.filter((coupon) => !coupon.isActive).length,
      used: coupons.reduce((sum, coupon) => sum + coupon.usageCount, 0),
    }),
    [coupons]
  );

  const inventoryRows = useMemo((): InventoryRow[] => {
    const rows: InventoryRow[] = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        const variantDepotRows = depotStocks.filter((item) => item.variantId === variant.id);
        const depotsMap = Object.fromEntries(depots.map((depot) => [depot, 0])) as Record<string, number>;
        variantDepotRows.forEach((item) => {
          depotsMap[item.depot] = item.stock;
        });

        const totalStock = Object.values(depotsMap).reduce((sum, value) => sum + value, 0);
        const minStock = variantDepotRows[0]?.minStock ?? Math.max(5, Math.floor(totalStock * 0.2));

        const soldLast30Days = orders
          .filter((order) => isWithinDays(order.created_at, 30) && order.payment_status === 'paid')
          .reduce((sum, order) => {
            const orderQty = (order.items || []).reduce((qty, item) => {
              const sourceName = (item.product_type || '').toLocaleLowerCase('tr-TR');
              const productName = product.name.toLocaleLowerCase('tr-TR');
              return sourceName.includes(productName) || productName.includes(sourceName)
                ? qty + (item.quantity || 0)
                : qty;
            }, 0);
            return sum + orderQty;
          }, 0);

        const dailySales = Number((soldLast30Days / 30).toFixed(2));
        const daysToStockout = dailySales > 0 ? Number((totalStock / dailySales).toFixed(1)) : null;

        rows.push({
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantLabel: `${variant.size || 'Standart'} / ${variant.color || 'Renk yok'}`,
          sku: variant.sku || '-',
          totalStock,
          minStock,
          depots: depotsMap,
          dailySales,
          daysToStockout,
        });
      });
    });

    return rows;
  }, [products, depotStocks, orders, depots]);

  const filteredInventoryRows = useMemo(() => {
    if (inventoryDepotFilter === 'all') return inventoryRows;
    return inventoryRows.filter((row) => (row.depots[inventoryDepotFilter] || 0) > 0);
  }, [inventoryRows, inventoryDepotFilter]);

  const inventorySummary = useMemo(
    () => ({
      totalStock: inventoryRows.reduce((sum, row) => sum + row.totalStock, 0),
      lowStockCount: inventoryRows.filter((row) => row.totalStock <= row.minStock).length,
      criticalForecastCount: inventoryRows.filter(
        (row) => row.daysToStockout !== null && row.daysToStockout <= 14
      ).length,
      movementCount: inventoryMovements.length,
    }),
    [inventoryRows, inventoryMovements]
  );

  const recentInventoryMovements = useMemo(
    () => [...inventoryMovements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12),
    [inventoryMovements]
  );

  const selectedMovementProduct = useMemo(
    () => products.find((product) => product.id === movementForm.productId) || null,
    [products, movementForm.productId]
  );

  const selectedMovementVariant = useMemo(
    () => selectedMovementProduct?.variants.find((variant) => variant.id === movementForm.variantId) || null,
    [selectedMovementProduct, movementForm.variantId]
  );

  useEffect(() => {
    if (products.length === 0 || orders.length === 0 || depotStocks.length === 0) return;

    const processed = new Set<number>(JSON.parse(localStorage.getItem(INVENTORY_PROCESSED_ORDERS_KEY) || '[]'));
    const eligibleOrders = orders.filter(
      (order) =>
        order.payment_status === 'paid' &&
        !['cancelled', 'refunded'].includes(order.status) &&
        !processed.has(order.id)
    );

    if (eligibleOrders.length === 0) return;

    const stockMap = new Map(depotStocks.map((item) => [`${item.variantId}__${item.depot}`, { ...item }]));
    const newMovements: InventoryMovement[] = [];

    eligibleOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const itemName = (item.product_type || '').toLocaleLowerCase('tr-TR');
        const matchedProduct = products.find((product) => {
          const name = product.name.toLocaleLowerCase('tr-TR');
          return itemName.includes(name) || name.includes(itemName);
        });
        if (!matchedProduct) return;
        const targetVariant = matchedProduct.variants[0];
        if (!targetVariant) return;

        const autoDepot = depots[0] || DEFAULT_INVENTORY_DEPOTS[0];
        const key = `${targetVariant.id}__${autoDepot}`;
        const current = stockMap.get(key);
        if (!current) return;

        const qty = Math.max(1, item.quantity || 1);
        current.stock = Math.max(0, current.stock - qty);
        stockMap.set(key, current);
        newMovements.push({
          id: `auto-${order.id}-${targetVariant.id}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          productId: matchedProduct.id,
          variantId: targetVariant.id,
          depot: autoDepot,
          type: 'out',
          quantity: qty,
          note: `Sipariş ${order.order_number} için otomatik stok düşümü`,
        });
      });

      processed.add(order.id);
    });

    if (newMovements.length > 0) {
      const nextStocks = Array.from(stockMap.values());
      setDepotStocks(nextStocks);
      setInventoryMovements((prev) => [...newMovements, ...prev]);
      localStorage.setItem(INVENTORY_PROCESSED_ORDERS_KEY, JSON.stringify(Array.from(processed)));
      toast.success(`Otomatik stok düşümü uygulandı (${newMovements.length} hareket).`);
    }
  }, [orders, products, depotStocks, depots]);

  const handleExportJSON = () => dataManager.downloadJSON();

  const handleExportCSV = () => dataManager.downloadOrdersCSV();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await dataManager.importFromFile(file);
      loadData();
      loadStorageStats();
    } catch {
      toast.error('Dosya içe aktarılamadı.');
    }
  };

  const handleCreateBackup = () => {
    dataManager.createAutoBackup();
    loadBackups();
    toast.success('Yedek oluşturuldu.');
  };

  const refreshAdminData = async () => {
    await loadData();
    loadProducts();
    await loadCoupons();
    loadDepots();
    loadBackups();
    loadStorageStats();
    loadRecommendationStats();
  };

  const handleSeedDemoData = async () => {
    if (!confirm('Demo veriler yüklensin mi? Mevcut local verileriniz demo setiyle güncellenecek.')) return;

    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(initialProductSeed));
    localStorage.setItem(MOCK_ORDER_STORAGE_KEY, JSON.stringify(createDemoOrders()));
    localStorage.setItem(MOCK_COUPON_STORAGE_KEY, JSON.stringify(initialCouponSeed));
    localStorage.setItem(INVENTORY_DEPOTS_STORAGE_KEY, JSON.stringify(DEFAULT_INVENTORY_DEPOTS));
    localStorage.removeItem(INVENTORY_STOCK_KEY);
    localStorage.removeItem(INVENTORY_MOVEMENTS_KEY);
    localStorage.removeItem(INVENTORY_PROCESSED_ORDERS_KEY);
    localStorage.removeItem(RECOMMENDATION_BEHAVIOR_KEY);
    localStorage.removeItem(RECOMMENDATION_PRODUCT_STATS_KEY);
    localStorage.removeItem('cvk_comparison_list');

    await refreshAdminData();
    toast.success('Demo veriler başarıyla yüklendi.');
  };

  const handleResetDemoData = async () => {
    if (!confirm('Demo veriler sıfırlansın mı? Bu işlem local admin verilerini temizler.')) return;

    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(MOCK_ORDER_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(MOCK_COUPON_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(INVENTORY_STOCK_KEY, JSON.stringify([]));
    localStorage.setItem(INVENTORY_MOVEMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(INVENTORY_PROCESSED_ORDERS_KEY, JSON.stringify([]));
    localStorage.setItem(INVENTORY_DEPOTS_STORAGE_KEY, JSON.stringify(DEFAULT_INVENTORY_DEPOTS));
    localStorage.removeItem(RECOMMENDATION_BEHAVIOR_KEY);
    localStorage.removeItem(RECOMMENDATION_PRODUCT_STATS_KEY);
    localStorage.removeItem('cvk_comparison_list');

    await refreshAdminData();
    toast.success('Demo veriler sıfırlandı.');
  };

  const handleRestoreBackup = (timestamp: number) => {
    if (confirm('Bu yedeği geri yüklemek istediğinize emin misiniz? Mevcut verileriniz değişecek.')) {
      if (dataManager.restoreBackup(timestamp)) {
        loadData();
        loadStorageStats();
      }
    }
  };

  const handleDeleteBackup = (timestamp: number) => {
    if (confirm('Bu yedeği silmek istediğinize emin misiniz?')) {
      dataManager.deleteBackup(timestamp);
      loadBackups();
    }
  };

  const handleOrderStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const result = await orderApi.updateOrderStatus(orderId, newStatus, 'Admin panelden hızlı güncelleme');
      if (!result.success) {
        toast.error(result.message || 'Sipariş durumu güncellenemedi.');
        return;
      }

      toast.success('Sipariş durumu güncellendi.');
      await loadData();
    } catch {
      toast.error('Sipariş durumu güncellenirken hata oluştu.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openCreateProductForm = () => {
    setProductForm(createEmptyProductForm());
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (product: ManagedProduct) => {
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image || '',
      category: product.category,
      subCategory: product.subCategory,
      tags: product.tags.join(', '),
      status: product.status,
      description: product.description,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      basePrice: product.basePrice,
      variants: product.variants.map((variant) => ({ ...variant })),
    });
    setIsProductFormOpen(true);
  };

  const handleProductFormChange = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = <K extends keyof ProductVariant>(variantId: string, field: K, value: ProductVariant[K]) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)),
    }));
  };

  const addVariant = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createVariant(prev.variants.length + 1)],
    }));
  };

  const removeVariant = (variantId: string) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant.id !== variantId),
    }));
  };

  const handleGenerateAiContent = () => {
    const generated = aiGenerateProductCopy(productForm);
    setProductForm((prev) => ({ ...prev, ...generated }));
    toast.success('AI destekli açıklama ve SEO alanları oluşturuldu.');
  };

  const handleSaveProduct = () => {
    if (!productForm.name.trim()) {
      toast.error('Ürün adı zorunludur.');
      return;
    }

    const slug = productForm.slug.trim() || slugify(productForm.name);
    const tags = productForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const now = new Date().toISOString();

    if (productForm.id) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productForm.id
            ? {
                ...item,
                name: productForm.name.trim(),
                slug,
                image: productForm.image.trim(),
                category: productForm.category.trim(),
                subCategory: productForm.subCategory.trim(),
                tags,
                status: productForm.status,
                description: productForm.description.trim(),
                metaTitle: productForm.metaTitle.trim(),
                metaDescription: productForm.metaDescription.trim(),
                basePrice: Number(productForm.basePrice) || 0,
                variants: productForm.variants,
                updatedAt: now,
              }
            : item
        )
      );
      toast.success('Ürün güncellendi.');
    } else {
      const nextId = products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1;
      const newProduct: ManagedProduct = {
        id: nextId,
        name: productForm.name.trim(),
        slug,
        image: productForm.image.trim(),
        category: productForm.category.trim(),
        subCategory: productForm.subCategory.trim(),
        tags,
        status: productForm.status,
        description: productForm.description.trim(),
        metaTitle: productForm.metaTitle.trim(),
        metaDescription: productForm.metaDescription.trim(),
        basePrice: Number(productForm.basePrice) || 0,
        variants: productForm.variants,
        updatedAt: now,
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success('Yeni ürün eklendi.');
    }

    setIsProductFormOpen(false);
    setProductForm(createEmptyProductForm());
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setSelectedProductIds((prev) => prev.filter((selectedId) => selectedId !== id));
    toast.success('Ürün silindi.');
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkProductUpdate = () => {
    if (selectedProductIds.length === 0) {
      toast.error('Toplu güncelleme için ürün seçin.');
      return;
    }

    setProducts((prev) =>
      prev.map((product) => {
        if (!selectedProductIds.includes(product.id)) return product;

        const nextTags = bulkTag.trim()
          ? Array.from(new Set([...product.tags, ...bulkTag.split(',').map((x) => x.trim()).filter(Boolean)]))
          : product.tags;

        return {
          ...product,
          status: bulkStatus === 'none' ? product.status : bulkStatus,
          category: bulkCategory === 'none' ? product.category : bulkCategory,
          tags: nextTags,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setBulkTag('');
    toast.success('Seçili ürünler toplu güncellendi.');
  };

  const getProductStatusBadge = (status: ProductStatus) => {
    if (status === 'active') return <Badge className="bg-green-100 text-green-700">Aktif</Badge>;
    if (status === 'passive') return <Badge className="bg-gray-100 text-gray-700">Pasif</Badge>;
    return <Badge className="bg-rose-100 text-rose-700">Tükendi</Badge>;
  };

  const openCreateCouponForm = () => {
    setCouponForm(createEmptyCouponForm());
    setIsCouponFormOpen(true);
  };

  const openEditCouponForm = (coupon: Coupon) => {
    setCouponForm({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
      description: coupon.description || '',
    });
    setIsCouponFormOpen(true);
  };

  const handleCouponFormChange = <K extends keyof CouponFormState>(field: K, value: CouponFormState[K]) => {
    setCouponForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim()) {
      toast.error('Kupon kodu zorunludur.');
      return;
    }

    if (couponForm.validUntil < couponForm.validFrom) {
      toast.error('Bitiş tarihi başlangıç tarihinden küçük olamaz.');
      return;
    }

    if (couponForm.id) {
      const result = await couponApi.updateCoupon(couponForm.id, {
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrderAmount: Number(couponForm.minOrderAmount),
        maxDiscount: couponForm.type === 'percentage' ? Number(couponForm.maxDiscount || 0) : undefined,
        usageLimit: Number(couponForm.usageLimit),
        validFrom: couponForm.validFrom,
        validUntil: couponForm.validUntil,
        isActive: couponForm.isActive,
        description: couponForm.description.trim(),
      });

      if (!result.success) {
        toast.error(result.message || 'Kupon güncellenemedi.');
        return;
      }

      toast.success('Kupon güncellendi.');
    } else {
      const result = await couponApi.createCoupon({
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrderAmount: Number(couponForm.minOrderAmount),
        maxDiscount: couponForm.type === 'percentage' ? Number(couponForm.maxDiscount || 0) : undefined,
        usageLimit: Number(couponForm.usageLimit),
        validFrom: couponForm.validFrom,
        validUntil: couponForm.validUntil,
        isActive: couponForm.isActive,
        description: couponForm.description.trim(),
      });

      if (!result.success) {
        toast.error(result.message || 'Kupon oluşturulamadı.');
        return;
      }

      toast.success('Yeni kupon oluşturuldu.');
    }

    setIsCouponFormOpen(false);
    setCouponForm(createEmptyCouponForm());
    await loadCoupons();
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    const result = await couponApi.updateCoupon(coupon.id, { isActive: !coupon.isActive });
    if (!result.success) {
      toast.error(result.message || 'Kupon durumu güncellenemedi.');
      return;
    }
    toast.success(`Kupon ${coupon.isActive ? 'pasif' : 'aktif'} yapıldı.`);
    await loadCoupons();
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`${coupon.code} kuponunu silmek istediğinize emin misiniz?`)) return;
    const result = await couponApi.deleteCoupon(coupon.id);
    if (!result.success) {
      toast.error(result.message || 'Kupon silinemedi.');
      return;
    }
    toast.success('Kupon silindi.');
    await loadCoupons();
  };

  const handleMovementProductChange = (productId: number) => {
    const product = products.find((item) => item.id === productId);
    const firstVariantId = product?.variants[0]?.id || '';
    setMovementForm((prev) => ({ ...prev, productId, variantId: firstVariantId }));
  };

  const handleInventoryMovement = () => {
    if (!movementForm.productId || !movementForm.variantId || movementForm.quantity <= 0) {
      toast.error('Hareket için ürün, varyant ve miktar girin.');
      return;
    }

    const targetProduct = products.find((product) => product.id === movementForm.productId);
    const targetVariant = targetProduct?.variants.find((variant) => variant.id === movementForm.variantId);
    if (!targetProduct || !targetVariant) {
      toast.error('Seçili ürün/varyant bulunamadı.');
      return;
    }

    const key = `${movementForm.variantId}__${movementForm.depot}`;
    const index = depotStocks.findIndex((item) => `${item.variantId}__${item.depot}` === key);
    if (index < 0) {
      toast.error('Depo stok kaydı bulunamadı.');
      return;
    }

    const nextStocks = [...depotStocks];
    const current = { ...nextStocks[index] };
    const delta = movementForm.type === 'in' || movementForm.type === 'return' ? movementForm.quantity : -movementForm.quantity;
    current.stock = Math.max(0, current.stock + delta);
    nextStocks[index] = current;

    setDepotStocks(nextStocks);

    const movement: InventoryMovement = {
      id: `movement-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: movementForm.productId,
      variantId: movementForm.variantId,
      depot: movementForm.depot,
      type: movementForm.type,
      quantity: movementForm.quantity,
      note: movementForm.note.trim(),
    };
    setInventoryMovements((prev) => [movement, ...prev]);

    // Sync variant total stock back to product catalog so storefront reflects stock changes.
    const variantTotalStock = nextStocks
      .filter((item) => item.variantId === movementForm.variantId)
      .reduce((sum, item) => sum + item.stock, 0);

    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== movementForm.productId) return product;
        const variants = product.variants.map((variant) =>
          variant.id === movementForm.variantId ? { ...variant, stock: variantTotalStock } : variant
        );
        const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
        return {
          ...product,
          variants,
          status: product.status === 'passive' ? 'passive' : totalStock === 0 ? 'out_of_stock' : 'active',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    toast.success('Stok hareketi işlendi.');
    setMovementForm((prev) => ({ ...prev, quantity: 1, note: '' }));
  };

  const handleMinStockChange = (variantId: string, minStock: number) => {
    setDepotStocks((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, minStock: Math.max(0, minStock) } : item))
    );
  };

  const handleAddDepot = () => {
    const name = newDepotName.trim();
    if (!name) {
      toast.error('Depo adı boş olamaz.');
      return;
    }
    if (depots.some((depot) => depot.toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'))) {
      toast.error('Bu depo zaten mevcut.');
      return;
    }

    setDepots((prev) => [...prev, name]);
    setNewDepotName('');
    toast.success('Yeni depo eklendi.');
  };

  const handleRemoveDepot = (depotName: string) => {
    if (depots.length <= 1) {
      toast.error('En az bir depo kalmalıdır.');
      return;
    }
    if (!confirm(`${depotName} deposunu kaldırmak istiyor musunuz? Bu depodaki stok satırları silinir.`)) {
      return;
    }

    setDepots((prev) => prev.filter((depot) => depot !== depotName));
    setDepotStocks((prev) => prev.filter((item) => item.depot !== depotName));
    setInventoryMovements((prev) => prev.filter((movement) => movement.depot !== depotName));
    setInventoryDepotFilter((prev) => (prev === depotName ? 'all' : prev));
    toast.success('Depo kaldırıldı.');
  };

  const handleImportInventoryCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const lines = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        toast.error('CSV dosyasında veri bulunamadı.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const skuIndex = headers.findIndex((h) => ['sku', 'stok_kodu'].includes(h));
      const depotIndex = headers.findIndex((h) => ['depot', 'warehouse', 'depo'].includes(h));
      const stockIndex = headers.findIndex((h) => ['stock', 'stok'].includes(h));
      const minStockIndex = headers.findIndex((h) => ['min_stock', 'minimum_stok', 'min'].includes(h));

      if (skuIndex < 0 || depotIndex < 0 || stockIndex < 0) {
        toast.error('CSV başlıkları: sku,depot,stock,(min_stock) formatında olmalı.');
        return;
      }

      const variantMap = new Map(
        products.flatMap((product) => product.variants.map((variant) => [variant.sku.toLocaleLowerCase('tr-TR'), variant.id]))
      );

      const nextStocksMap = new Map(depotStocks.map((item) => [`${item.variantId}__${item.depot}`, { ...item }]));
      const importedDepots = new Set<string>();
      let appliedCount = 0;

      for (const line of lines.slice(1)) {
        const cols = line.split(',').map((col) => col.trim());
        const sku = (cols[skuIndex] || '').toLocaleLowerCase('tr-TR');
        const depot = cols[depotIndex] || '';
        const stock = Number(cols[stockIndex]);
        const minStock = minStockIndex >= 0 ? Number(cols[minStockIndex]) : undefined;
        if (!sku || !depot || Number.isNaN(stock)) continue;

        const variantId = variantMap.get(sku);
        if (!variantId) continue;

        importedDepots.add(depot);
        const key = `${variantId}__${depot}`;
        const current = nextStocksMap.get(key);
        nextStocksMap.set(key, {
          variantId,
          depot,
          stock: Math.max(0, stock),
          minStock: Number.isFinite(minStock as number) ? Math.max(0, minStock as number) : current?.minStock ?? 10,
        });
        appliedCount += 1;
      }

      if (appliedCount === 0) {
        toast.error('CSV satırları SKU eşleşmediği için içe aktarılamadı.');
        return;
      }

      const mergedDepots = Array.from(new Set([...depots, ...Array.from(importedDepots)]));
      setDepots(mergedDepots);
      setDepotStocks(Array.from(nextStocksMap.values()));

      toast.success(`${appliedCount} stok satırı CSV'den içe aktarıldı.`);
    } catch {
      toast.error('CSV dosyası okunamadı.');
    } finally {
      event.target.value = '';
    }
  };

  const movementTypeBadge = (type: MovementType) => {
    if (type === 'in') return <Badge className="bg-green-100 text-green-700">Giriş</Badge>;
    if (type === 'out') return <Badge className="bg-red-100 text-red-700">Çıkış</Badge>;
    return <Badge className="bg-blue-100 text-blue-700">İade</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-rose-100 text-rose-800',
    };
    const labels: { [key: string]: string } = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      processing: 'İşleniyor',
      shipped: 'Kargoda',
      delivered: 'Teslim',
      cancelled: 'İptal',
      refunded: 'İade',
    };
    return <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0077be] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Yönetim Paneli</h1>
          <p className="text-gray-500 mt-1">Ciro, operasyon ve dönüşüm metriklerini tek ekrandan izleyin</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="7days">Son 7 Gün</SelectItem>
              <SelectItem value="30days">Son 30 Gün</SelectItem>
              <SelectItem value="90days">Son 3 Ay</SelectItem>
              <SelectItem value="year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline" onClick={handleSeedDemoData}>
            <WandSparkles className="w-4 h-4 mr-2" />
            Demo Kur
          </Button>
          <Button variant="outline" onClick={handleResetDemoData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Demo Sıfırla
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7 lg:grid-cols-8">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Siparişler</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
          <TabsTrigger value="products">Ürün Yönetimi</TabsTrigger>
          <TabsTrigger value="inventory">Stok & Envanter</TabsTrigger>
          <TabsTrigger value="campaigns">Kampanyalar</TabsTrigger>
          <TabsTrigger value="data">Veri Yönetimi</TabsTrigger>
          <TabsTrigger value="ai">AI İstatistikleri</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Günlük Ciro / Sipariş</CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{currency.format(periodMetrics.daily.revenue)}</div>
                <p className="text-xs text-gray-600 mt-1">{periodMetrics.daily.orders} sipariş</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Haftalık Ciro / Sipariş</CardTitle>
                <TrendingUp className="w-4 h-4 text-[#0077be]" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{currency.format(periodMetrics.weekly.revenue)}</div>
                <p className="text-xs text-gray-600 mt-1">{periodMetrics.weekly.orders} sipariş</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Aylık Ciro / Sipariş</CardTitle>
                <ShoppingCart className="w-4 h-4 text-[#00a8e8]" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{currency.format(periodMetrics.monthly.revenue)}</div>
                <p className="text-xs text-gray-600 mt-1">{periodMetrics.monthly.orders} sipariş</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Ortalama Sepet Tutarı</CardTitle>
                <Users className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{currency.format(averageBasket)}</div>
                <p className="text-xs text-gray-600 mt-1">Ödemesi tamamlanan siparişlere göre</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">İade Oranı</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">%{percent.format(returnRate)}</div>
                  <p className="text-xs text-gray-600">İptal + iade / toplam sipariş</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">En Çok Satan Ürün</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Package className="w-8 h-8 text-[#0077be]" />
                <div>
                  <div className="text-lg font-bold">{topSeller?.name || 'Veri yok'}</div>
                  <p className="text-xs text-gray-600">{topSeller ? `${topSeller.quantity} adet satıldı` : 'Sipariş verisi bekleniyor'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Toplam Sipariş</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-indigo-500" />
                <div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-gray-600">Sistemdeki tüm siparişler</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Kritik Uyarılar
              </CardTitle>
              <CardDescription>Stok, operasyon ve ödeme riskleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3 flex items-center justify-between ${
                    alert.type === 'danger'
                      ? 'border-red-200 bg-red-50'
                      : alert.type === 'warning'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.id === 'low-stock' && <Package className="w-5 h-5 mt-0.5 text-red-600" />}
                    {alert.id === 'unshipped' && <Truck className="w-5 h-5 mt-0.5 text-amber-600" />}
                    {alert.id === 'failed-payment' && <CreditCard className="w-5 h-5 mt-0.5 text-amber-700" />}
                    {alert.id === 'healthy' && <Activity className="w-5 h-5 mt-0.5 text-blue-600" />}
                    <div>
                      <p className="font-semibold text-[#1a1a2e]">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.detail}</p>
                    </div>
                  </div>
                  <Badge className="bg-white text-[#1a1a2e] border">{alert.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Satış Trendi</CardTitle>
                <CardDescription>Seçilen dönemde günlük satış ve ciro</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0077be" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0077be" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="orders" name="Sipariş" stroke="#0077be" fill="url(#colorOrders)" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Ciro (€)" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sipariş Durum Dağılımı</CardTitle>
                <CardDescription>Operasyon dengesi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`status-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Son Siparişler</CardTitle>
              <CardDescription>Güncel operasyon akışı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Sipariş No</th>
                      <th className="text-left py-3 px-4">Müşteri</th>
                      <th className="text-left py-3 px-4">Tutar</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders.slice(0, 6).map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4">{order.shipping_address?.full_name}</td>
                        <td className="py-3 px-4">€{order.total_amount?.toFixed(2)}</td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">Bekleyen</p>
                <p className="text-2xl font-bold text-amber-600">{orderOpsSummary.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">Hazırlanan</p>
                <p className="text-2xl font-bold text-blue-600">{orderOpsSummary.processing}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">Kargodaki</p>
                <p className="text-2xl font-bold text-indigo-600">{orderOpsSummary.shipped}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-gray-500">Başarısız Ödeme</p>
                <p className="text-2xl font-bold text-rose-600">{orderOpsSummary.failedPayments}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tüm Siparişler</CardTitle>
                <CardDescription>
                  Toplam {orders.length} sipariş • Listelenen {filteredOrders.length}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Input
                  placeholder="Sipariş no, müşteri, e-posta..."
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  className="w-64"
                />
                <Select value={orderStatusFilter} onValueChange={(value) => setOrderStatusFilter(value as 'all' | OrderStatus)}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sipariş durumu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="confirmed">Onaylandı</SelectItem>
                    <SelectItem value="processing">İşleniyor</SelectItem>
                    <SelectItem value="shipped">Kargoda</SelectItem>
                    <SelectItem value="delivered">Teslim</SelectItem>
                    <SelectItem value="cancelled">İptal</SelectItem>
                    <SelectItem value="refunded">İade</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatusFilter} onValueChange={(value) => setPaymentStatusFilter(value as 'all' | PaymentStatus)}>
                  <SelectTrigger className="w-[150px]">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ödeme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Ödemeler</SelectItem>
                    <SelectItem value="pending">Bekleyen</SelectItem>
                    <SelectItem value="paid">Ödendi</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                    <SelectItem value="refunded">İade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Sipariş No</th>
                      <th className="text-left py-3 px-4">Müşteri</th>
                      <th className="text-left py-3 px-4">E-posta</th>
                      <th className="text-left py-3 px-4">Ürünler</th>
                      <th className="text-left py-3 px-4">Tutar</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">Ödeme</th>
                      <th className="text-left py-3 px-4">Tarih</th>
                      <th className="text-left py-3 px-4">Hızlı İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4">{order.shipping_address?.full_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{order.shipping_address?.email}</td>
                        <td className="py-3 px-4">{order.items?.length || 0} ürün</td>
                        <td className="py-3 px-4 font-medium">€{order.total_amount?.toFixed(2)}</td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              order.payment_status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : order.payment_status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {order.payment_status === 'paid'
                              ? 'Ödendi'
                              : order.payment_status === 'failed'
                              ? 'Başarısız'
                              : order.payment_status === 'refunded'
                              ? 'İade'
                              : 'Bekliyor'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleOrderStatusChange(order.id, value as Order['status'])}
                              disabled={updatingOrderId === order.id}
                            >
                              <SelectTrigger className="w-[150px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Beklemede</SelectItem>
                                <SelectItem value="confirmed">Onaylandı</SelectItem>
                                <SelectItem value="processing">İşleniyor</SelectItem>
                                <SelectItem value="shipped">Kargoda</SelectItem>
                                <SelectItem value="delivered">Teslim</SelectItem>
                                <SelectItem value="cancelled">İptal</SelectItem>
                                <SelectItem value="refunded">İade</SelectItem>
                              </SelectContent>
                            </Select>
                            {updatingOrderId === order.id && (
                              <RefreshCw className="w-4 h-4 animate-spin text-[#0077be]" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Arama/filtre kriterlerine uygun sipariş bulunamadı.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trafik vs Satış Dönüşüm</CardTitle>
                <CardDescription>Trafik hacmi ve dönüşüm oranı karşılaştırması</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={trafficConversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="traffic" name="Trafik" fill="#0ea5e9" />
                    <Line yAxisId="right" dataKey="conversion" name="Dönüşüm %" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>En Çok Satan Ürünler</CardTitle>
                <CardDescription>Satılan adet bazında ilk ürünler</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductData} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={140} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#0077be" name="Satılan Adet" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kampanya Performansı</CardTitle>
              <CardDescription>Gelir, harcama, dönüşüm ve ROAS karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Kampanya</th>
                      <th className="text-left py-3 px-4">Harcama</th>
                      <th className="text-left py-3 px-4">Gelir</th>
                      <th className="text-left py-3 px-4">Dönüşüm</th>
                      <th className="text-left py-3 px-4">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignPerformance.map((campaign) => (
                      <tr key={campaign.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{campaign.name}</td>
                        <td className="py-3 px-4">€{campaign.spend.toLocaleString('tr-TR')}</td>
                        <td className="py-3 px-4">€{campaign.revenue.toLocaleString('tr-TR')}</td>
                        <td className="py-3 px-4">%{campaign.conversion}</td>
                        <td className="py-3 px-4">
                          <Badge className={campaign.roas >= 3 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {campaign.roas}x
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Toplam Ürün</p><p className="text-2xl font-bold">{productSummary.total}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Aktif</p><p className="text-2xl font-bold text-green-600">{productSummary.active}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Pasif</p><p className="text-2xl font-bold text-gray-600">{productSummary.passive}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Tükendi</p><p className="text-2xl font-bold text-rose-600">{productSummary.outOfStock}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Toplam Varyant</p><p className="text-2xl font-bold text-[#0077be]">{productSummary.variants}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ürün Yönetimi</CardTitle>
                <CardDescription>Ürün ekleme, düzenleme, silme, varyant, SEO ve toplu güncelleme</CardDescription>
              </div>
              <Button onClick={openCreateProductForm}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                <Input
                  className="lg:col-span-2"
                  placeholder="Ürün adı, slug veya tag ara..."
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                />
                <Select value={productStatusFilter} onValueChange={(value) => setProductStatusFilter(value as 'all' | ProductStatus)}>
                  <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="passive">Pasif</SelectItem>
                    <SelectItem value="out_of_stock">Tükendi</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={productCategoryFilter} onValueChange={(value) => setProductCategoryFilter(value)}>
                  <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {productCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setProductSearch(''); setProductStatusFilter('all'); setProductCategoryFilter('all'); }}>
                  <X className="w-4 h-4 mr-2" />
                  Filtre Temizle
                </Button>
              </div>

              <div className="rounded-xl border p-3 bg-gray-50/70">
                <p className="text-sm font-semibold mb-3">Toplu Ürün Güncelleme ({selectedProductIds.length} seçili)</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as 'none' | ProductStatus)}>
                    <SelectTrigger><SelectValue placeholder="Durum güncelle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Durum değiştirme</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="passive">Pasif</SelectItem>
                      <SelectItem value="out_of_stock">Tükendi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={bulkCategory} onValueChange={(value) => setBulkCategory(value)}>
                    <SelectTrigger><SelectValue placeholder="Kategori güncelle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kategori değiştirme</SelectItem>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={bulkTag}
                    onChange={(event) => setBulkTag(event.target.value)}
                    placeholder="Tag ekle (virgülle)"
                  />
                  <Button onClick={handleBulkProductUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    Seçili Ürünlere Uygula
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Seç</th>
                      <th className="text-left py-3 px-4">Ürün</th>
                      <th className="text-left py-3 px-4">Kategori</th>
                      <th className="text-left py-3 px-4">Varyant</th>
                      <th className="text-left py-3 px-4">SKU/Barkod</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">SEO</th>
                      <th className="text-left py-3 px-4">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">/{product.slug}</p>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <p>{product.category}</p>
                          <p className="text-xs text-gray-500">{product.subCategory || '-'}</p>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <p>{product.variants.length} varyant</p>
                          <p className="text-xs text-gray-500">
                            {product.variants.map((variant) => variant.size).filter(Boolean).slice(0, 2).join(', ') || '-'}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <p>{product.variants[0]?.sku || '-'}</p>
                          <p className="text-gray-500">{product.variants[0]?.barcode || '-'}</p>
                        </td>
                        <td className="py-3 px-4">{getProductStatusBadge(product.status)}</td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          <p>{product.metaTitle ? 'Meta title var' : 'Meta title yok'}</p>
                          <p>{product.metaDescription ? 'Meta desc var' : 'Meta desc yok'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditProductForm(product)}>
                              <Pencil className="w-4 h-4 mr-1" />
                              Düzenle
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                              Sil
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">Kriterlere uygun ürün bulunamadı.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {isProductFormOpen && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{productForm.id ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</CardTitle>
                  <CardDescription>Varyant, SKU, barkod, kategori, etiket, durum ve SEO alanları</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerateAiContent}>
                    <WandSparkles className="w-4 h-4 mr-2" />
                    AI ile Açıklama/SEO Üret
                  </Button>
                  <Button variant="outline" onClick={() => setIsProductFormOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Kapat
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input value={productForm.name} onChange={(e) => handleProductFormChange('name', e.target.value)} placeholder="Ürün adı" />
                  <Input value={productForm.slug} onChange={(e) => handleProductFormChange('slug', e.target.value)} placeholder="Slug (boşsa otomatik)" />
                  <Input value={productForm.image} onChange={(e) => handleProductFormChange('image', e.target.value)} placeholder="Görsel URL (https://...)" />
                  <Input type="number" min={0} step={0.01} value={productForm.basePrice} onChange={(e) => handleProductFormChange('basePrice', Number(e.target.value))} placeholder="Baz fiyat" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select value={productForm.category} onValueChange={(value) => handleProductFormChange('category', value)}>
                    <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={productForm.subCategory} onChange={(e) => handleProductFormChange('subCategory', e.target.value)} placeholder="Alt kategori" />
                  <Input value={productForm.tags} onChange={(e) => handleProductFormChange('tags', e.target.value)} placeholder="Etiketler (virgülle)" />
                  <Select value={productForm.status} onValueChange={(value) => handleProductFormChange('status', value as ProductStatus)}>
                    <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="passive">Pasif</SelectItem>
                      <SelectItem value="out_of_stock">Tükendi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Ürün Açıklaması</p>
                  <Textarea value={productForm.description} onChange={(e) => handleProductFormChange('description', e.target.value)} rows={4} placeholder="Ürün açıklaması..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={productForm.metaTitle} onChange={(e) => handleProductFormChange('metaTitle', e.target.value)} placeholder="SEO Meta Title" />
                  <Input value={productForm.metaDescription} onChange={(e) => handleProductFormChange('metaDescription', e.target.value)} placeholder="SEO Meta Description" />
                </div>

                <div className="rounded-xl border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Varyant Yönetimi (Beden / Renk / Palet / Abonelik / SKU / Barkod)</p>
                    <Button size="sm" variant="outline" onClick={addVariant}>
                      <Plus className="w-4 h-4 mr-1" />
                      Varyant Ekle
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {productForm.variants.map((variant) => (
                      <div key={variant.id} className="grid grid-cols-1 lg:grid-cols-9 gap-2 p-2 rounded-lg border bg-gray-50/50">
                        <Input value={variant.size} onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)} placeholder="Beden" />
                        <Input value={variant.color} onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)} placeholder="Renk" />
                        <Input value={variant.palette} onChange={(e) => handleVariantChange(variant.id, 'palette', e.target.value)} placeholder="Palet" />
                        <Input value={variant.subscription} onChange={(e) => handleVariantChange(variant.id, 'subscription', e.target.value)} placeholder="Abonelik" />
                        <Input value={variant.sku} onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} placeholder="SKU" />
                        <Input value={variant.barcode} onChange={(e) => handleVariantChange(variant.id, 'barcode', e.target.value)} placeholder="Barkod" />
                        <Input type="number" min={0} step={0.01} value={variant.price} onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))} placeholder="Fiyat" />
                        <Input type="number" min={0} step={1} value={variant.stock} onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))} placeholder="Stok" />
                        <Button variant="outline" onClick={() => removeVariant(variant.id)} disabled={productForm.variants.length === 1}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsProductFormOpen(false)}>İptal</Button>
                  <Button onClick={handleSaveProduct}>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Anlık Toplam Stok</p><p className="text-2xl font-bold">{inventorySummary.totalStock}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Minimum Altı Ürün</p><p className="text-2xl font-bold text-amber-600">{inventorySummary.lowStockCount}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Kritik Tahmin (14g)</p><p className="text-2xl font-bold text-rose-600">{inventorySummary.criticalForecastCount}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Stok Hareketi</p><p className="text-2xl font-bold text-[#0077be]">{inventorySummary.movementCount}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Depo Bazlı Anlık Stok Takibi</CardTitle>
              <CardDescription>Depolar, minimum stok eşiği ve tükenme tahmini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <Select value={inventoryDepotFilter} onValueChange={(value) => setInventoryDepotFilter(value)}>
                  <SelectTrigger><SelectValue placeholder="Depo filtresi" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Depolar</SelectItem>
                    {depots.map((depot) => (
                      <SelectItem key={depot} value={depot}>{depot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Yeni depo adı"
                    value={newDepotName}
                    onChange={(event) => setNewDepotName(event.target.value)}
                  />
                  <Button onClick={handleAddDepot} variant="outline">Depo Ekle</Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportInventoryCsv}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {depots.map((depot) => (
                  <div key={depot} className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                    <span>{depot}</span>
                    <button onClick={() => handleRemoveDepot(depot)} className="text-red-600 hover:text-red-700">sil</button>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Ürün / Varyant</th>
                      <th className="text-left py-3 px-4">SKU</th>
                      {depots.map((depot) => (
                        <th key={depot} className="text-left py-3 px-4">{depot}</th>
                      ))}
                      <th className="text-left py-3 px-4">Toplam</th>
                      <th className="text-left py-3 px-4">Min Stok</th>
                      <th className="text-left py-3 px-4">Satış Hızı / Gün</th>
                      <th className="text-left py-3 px-4">Tahmin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventoryRows.map((row) => (
                      <tr key={row.variantId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium">{row.productName}</p>
                          <p className="text-xs text-gray-500">{row.variantLabel}</p>
                        </td>
                        <td className="py-3 px-4 text-xs">{row.sku}</td>
                        {depots.map((depot) => (
                          <td key={depot} className="py-3 px-4">{row.depots[depot] || 0}</td>
                        ))}
                        <td className="py-3 px-4">
                          <span className={row.totalStock <= row.minStock ? 'text-rose-600 font-bold' : 'font-semibold'}>
                            {row.totalStock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            min={0}
                            value={row.minStock}
                            onChange={(event) => handleMinStockChange(row.variantId, Number(event.target.value))}
                            className="h-8 w-24"
                          />
                        </td>
                        <td className="py-3 px-4">{row.dailySales.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          {row.daysToStockout === null ? (
                            <Badge className="bg-gray-100 text-gray-700">Veri yok</Badge>
                          ) : row.daysToStockout <= 14 ? (
                            <Badge className="bg-rose-100 text-rose-700">{row.daysToStockout} gün sonra bitecek</Badge>
                          ) : row.daysToStockout <= 30 ? (
                            <Badge className="bg-amber-100 text-amber-700">{row.daysToStockout} gün sonra bitecek</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">{row.daysToStockout} gün</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredInventoryRows.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">Depo filtresine uygun stok kaydı bulunamadı.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Stok Hareketi Ekle (Giriş / Çıkış / İade)</CardTitle>
                <CardDescription>Stok hareketleri ürün stoklarını anlık günceller</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={movementForm.productId ? movementForm.productId.toString() : 'none'}
                  onValueChange={(value) => handleMovementProductChange(value === 'none' ? 0 : Number(value))}
                >
                  <SelectTrigger><SelectValue placeholder="Ürün seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ürün seçin</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={movementForm.variantId || 'none'}
                  onValueChange={(value) => setMovementForm((prev) => ({ ...prev, variantId: value === 'none' ? '' : value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Varyant seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Varyant seçin</SelectItem>
                    {(selectedMovementProduct?.variants || []).map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.size || 'Standart'} / {variant.color || 'Renk yok'} ({variant.sku || '-'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select value={movementForm.depot} onValueChange={(value) => setMovementForm((prev) => ({ ...prev, depot: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {depots.map((depot) => (
                        <SelectItem key={depot} value={depot}>{depot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={movementForm.type} onValueChange={(value) => setMovementForm((prev) => ({ ...prev, type: value as MovementType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Giriş</SelectItem>
                      <SelectItem value="out">Çıkış</SelectItem>
                      <SelectItem value="return">İade</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={movementForm.quantity}
                    onChange={(event) => setMovementForm((prev) => ({ ...prev, quantity: Number(event.target.value) || 1 }))}
                    placeholder="Miktar"
                  />
                </div>

                <Input
                  value={movementForm.note}
                  onChange={(event) => setMovementForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Açıklama / referans notu"
                />

                <Button onClick={handleInventoryMovement} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Stok Hareketini Kaydet
                </Button>

                {selectedMovementVariant && (
                  <p className="text-xs text-gray-500">
                    Seçili varyant: {selectedMovementVariant.size || 'Standart'} / {selectedMovementVariant.color || 'Renk yok'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stok Hareket Geçmişi</CardTitle>
                <CardDescription>Giriş, çıkış ve iade kayıtları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[440px] overflow-y-auto">
                {recentInventoryMovements.map((movement) => {
                  const product = products.find((item) => item.id === movement.productId);
                  const variant = product?.variants.find((item) => item.id === movement.variantId);
                  return (
                    <div key={movement.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product?.name || 'Ürün'}</p>
                          <p className="text-xs text-gray-500">
                            {variant?.sku || '-'} • {movement.depot}
                          </p>
                        </div>
                        {movementTypeBadge(movement.type)}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <p>Miktar: <span className="font-semibold">{movement.quantity}</span></p>
                        <p className="text-gray-500">{new Date(movement.timestamp).toLocaleString('tr-TR')}</p>
                      </div>
                      {movement.note && <p className="text-xs text-gray-600 mt-2">{movement.note}</p>}
                    </div>
                  );
                })}
                {recentInventoryMovements.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">Henüz stok hareketi kaydı yok.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Toplam Kupon</p><p className="text-2xl font-bold">{couponSummary.total}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Aktif Kupon</p><p className="text-2xl font-bold text-green-600">{couponSummary.active}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Pasif Kupon</p><p className="text-2xl font-bold text-gray-600">{couponSummary.inactive}</p></CardContent></Card>
            <Card><CardContent className="pt-5"><p className="text-xs text-gray-500">Toplam Kullanım</p><p className="text-2xl font-bold text-[#0077be]">{couponSummary.used}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kampanya ve Kupon Yönetimi</CardTitle>
                <CardDescription>Sepet ve checkout ile entegre kuponları yönetin</CardDescription>
              </div>
              <Button onClick={openCreateCouponForm}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kupon
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Kod veya açıklama ara..."
                  value={couponSearch}
                  onChange={(event) => setCouponSearch(event.target.value)}
                />
                <Select value={couponStatusFilter} onValueChange={(value) => setCouponStatusFilter(value as 'all' | 'active' | 'inactive')}>
                  <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={couponTypeFilter} onValueChange={(value) => setCouponTypeFilter(value as 'all' | 'percentage' | 'fixed')}>
                  <SelectTrigger><SelectValue placeholder="Tip" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    <SelectItem value="percentage">Yüzde</SelectItem>
                    <SelectItem value="fixed">Sabit</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setCouponSearch(''); setCouponStatusFilter('all'); setCouponTypeFilter('all'); }}>
                  <X className="w-4 h-4 mr-2" />
                  Temizle
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Kod</th>
                      <th className="text-left py-3 px-4">Tip/Değer</th>
                      <th className="text-left py-3 px-4">Min Tutar</th>
                      <th className="text-left py-3 px-4">Limit/Kullanım</th>
                      <th className="text-left py-3 px-4">Geçerlilik</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-semibold">{coupon.code}</p>
                          <p className="text-xs text-gray-500">{coupon.description || '-'}</p>
                        </td>
                        <td className="py-3 px-4">
                          {coupon.type === 'percentage' ? `%${coupon.value}` : `€${coupon.value}`}
                        </td>
                        <td className="py-3 px-4">€{coupon.minOrderAmount}</td>
                        <td className="py-3 px-4">{coupon.usageCount} / {coupon.usageLimit}</td>
                        <td className="py-3 px-4 text-xs">{coupon.validFrom} - {coupon.validUntil}</td>
                        <td className="py-3 px-4">
                          <Badge className={coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {coupon.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditCouponForm(coupon)}>
                              <Pencil className="w-4 h-4 mr-1" />
                              Düzenle
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleToggleCoupon(coupon)}>
                              {coupon.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCoupon(coupon)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCoupons.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500">Kriterlere uygun kupon bulunamadı.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {isCouponFormOpen && (
            <Card>
              <CardHeader>
                <CardTitle>{couponForm.id ? 'Kupon Düzenle' : 'Yeni Kupon Oluştur'}</CardTitle>
                <CardDescription>Checkout ekranında kullanılacak kampanya kodu ayarları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input value={couponForm.code} onChange={(e) => handleCouponFormChange('code', e.target.value.toUpperCase())} placeholder="Kupon kodu" />
                  <Select value={couponForm.type} onValueChange={(value) => handleCouponFormChange('type', value as 'percentage' | 'fixed')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Yüzde</SelectItem>
                      <SelectItem value="fixed">Sabit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" min={0} step={0.01} value={couponForm.value} onChange={(e) => handleCouponFormChange('value', Number(e.target.value))} placeholder="Değer" />
                  <Input type="number" min={0} step={1} value={couponForm.usageLimit} onChange={(e) => handleCouponFormChange('usageLimit', Number(e.target.value))} placeholder="Kullanım limiti" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input type="number" min={0} step={0.01} value={couponForm.minOrderAmount} onChange={(e) => handleCouponFormChange('minOrderAmount', Number(e.target.value))} placeholder="Minimum sepet tutarı" />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={couponForm.maxDiscount || 0}
                    onChange={(e) => handleCouponFormChange('maxDiscount', Number(e.target.value))}
                    placeholder="Maks. indirim (yüzde için)"
                    disabled={couponForm.type === 'fixed'}
                  />
                  <Input type="date" value={couponForm.validFrom} onChange={(e) => handleCouponFormChange('validFrom', e.target.value)} />
                  <Input type="date" value={couponForm.validUntil} onChange={(e) => handleCouponFormChange('validUntil', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={couponForm.description} onChange={(e) => handleCouponFormChange('description', e.target.value)} placeholder="Açıklama" />
                  <Select value={couponForm.isActive ? 'active' : 'inactive'} onValueChange={(value) => handleCouponFormChange('isActive', value === 'active')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCouponFormOpen(false)}>İptal</Button>
                  <Button onClick={handleSaveCoupon}>
                    <Save className="w-4 h-4 mr-2" />
                    Kuponu Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Dışa Aktar</CardTitle>
                <CardDescription>Verilerinizi yedekleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleExportJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON Olarak İndir
                </Button>
                <Button variant="outline" className="w-full" onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Siparişleri CSV İndir
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İçe Aktar</CardTitle>
                <CardDescription>Yedek dosyanızı yükleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <Input type="file" accept=".json" onChange={handleImport} className="mb-2" />
                <p className="text-xs text-gray-500">Yalnızca .json dosyaları desteklenir.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Otomatik Yedek</CardTitle>
                <CardDescription>Yedekleme yönetimi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleCreateBackup}>
                  <Archive className="w-4 h-4 mr-2" />
                  Şimdi Yedekle
                </Button>
                <p className="text-xs text-gray-500">Son {backups.length} yedek saklanıyor.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Yedek Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz yedek bulunmuyor.</p>
              ) : (
                <div className="space-y-2">
                  {backups
                    .slice()
                    .reverse()
                    .map((backup) => (
                      <div key={backup.timestamp} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Database className="w-5 h-5 text-[#0077be]" />
                          <div>
                            <p className="font-medium">{new Date(backup.date).toLocaleString('tr-TR')}</p>
                            <p className="text-sm text-gray-500">
                              {backup.metadata.totalKeys} kayıt • {backup.metadata.totalSize}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleRestoreBackup(backup.timestamp)}>
                            <Upload className="w-4 h-4 mr-1" />
                            Geri Yükle
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBackup(backup.timestamp)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {storageStats && (
            <Card>
              <CardHeader>
                <CardTitle>Depolama İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Toplam Kayıt</p>
                    <p className="text-2xl font-bold">{storageStats.totalKeys}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Toplam Boyut</p>
                    <p className="text-2xl font-bold">{(storageStats.totalSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Anahtar</th>
                        <th className="text-left py-2">Tip</th>
                        <th className="text-left py-2">Boyut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storageStats.items?.slice(0, 10).map((item: any) => (
                        <tr key={item.key} className="border-b">
                          <td className="py-2 font-mono text-sm">{item.key}</td>
                          <td className="py-2">
                            <Badge variant="outline">{item.type}</Badge>
                          </td>
                          <td className="py-2">{(item.size / 1024).toFixed(2)} KB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Davranışları</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendationStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Toplam Etkileşim</span>
                      <span className="font-bold">{recommendationStats.totalBehaviors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Görüntülenen Ürünler</span>
                      <span className="font-bold">{recommendationStats.uniqueProductsViewed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Satın Alınan</span>
                      <span className="font-bold">{recommendationStats.uniqueProductsPurchased}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">En Popüler Kategori</span>
                      <span className="font-bold capitalize">{recommendationStats.topCategory}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Henüz veri yok.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Öneri Performansı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Kişiselleştirme</p>
                      <p className="text-sm text-gray-500">Aktif ve çalışıyor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Davranış Takibi</p>
                      <p className="text-sm text-gray-500">Gerçek zamanlı</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Ürün Eşleştirme</p>
                      <p className="text-sm text-gray-500">10 ürün eşleştirildi</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eylemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    recommendationEngine.clearBehaviors();
                    loadRecommendationStats();
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Verileri Temizle
                </Button>
                <p className="text-xs text-gray-500">Kullanıcı davranış verilerini sıfırlar.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

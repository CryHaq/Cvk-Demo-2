// CVK Dijital - Sabitler

// Dil ayarları
export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'tr';

// Ürün kategorileri
export const PRODUCT_CATEGORIES = [
  { id: 'all', icon: 'Grid3X3' },
  { id: 'ic-mekan', icon: 'Home' },
  { id: 'dis-mekan', icon: 'Sun' },
  { id: 'event', icon: 'PartyPopper' },
  { id: 'stand', icon: 'Store' },
];

// Renkler
export const AVAILABLE_COLORS = [
  { name: 'Beyaz', hex: '#FFFFFF', border: true },
  { name: 'Siyah', hex: '#1A1A1A' },
  { name: 'Altın', hex: '#D4AF37' },
  { name: 'Gümüş', hex: '#C0C0C0' },
  { name: 'Kırmızı', hex: '#E63946' },
  { name: 'Mavi', hex: '#0077BE' },
  { name: 'Yeşil', hex: '#2A9D8F' },
  { name: 'Sarı', hex: '#FFD60A' },
  { name: 'Turuncu', hex: '#F48C06' },
  { name: 'Mor', hex: '#7B2CBF' },
  { name: 'Pembe', hex: '#FF006E' },
  { name: 'Kahverengi', hex: '#7F5539' },
];

// Boyutlar
export const SIZE_PRESETS = [
  { width: 50, height: 50, label: '50x50 cm' },
  { width: 70, height: 100, label: '70x100 cm' },
  { width: 100, height: 150, label: '100x150 cm' },
  { width: 100, height: 200, label: '100x200 cm' },
  { width: 150, height: 200, label: '150x200 cm' },
];

// Adet seçenekleri
export const QUANTITY_STEPS = [1, 10, 50, 100, 250, 500, 1000];

// Baskı tipleri
export const PRINT_TYPES = [
  { id: 'single', description: 'Ön yüzeye baskı' },
  { id: 'double', description: 'Çift yüzeye baskı (+50%)' },
];

// Montaj seçenekleri
export const MOUNTING_OPTIONS = [
  { id: 'none', price: 0 },
  { id: 'wall', price: 15 },
  { id: 'ceiling', price: 20 },
  { id: 'floor', price: 25 },
];

// Teslimat seçenekleri
export const SHIPPING_OPTIONS = [
  { id: 'standard', price: 150, minDays: 3, maxDays: 7 },
  { id: 'express', price: 300, minDays: 1, maxDays: 2 },
  { id: 'pickup', price: 0, minDays: 1, maxDays: 1 },
];

// İndirimler
export const DISCOUNTS = {
  VOLUME: [
    { min: 10, rate: 0.05 },
    { min: 50, rate: 0.10 },
    { min: 100, rate: 0.15 },
    { min: 500, rate: 0.20 },
    { min: 1000, rate: 0.25 },
  ],
};

// Form validasyonları
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,15}$/,
  MIN_PASSWORD: 6,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/pdf', 'application/pdf'],
};

// Animasyon süreleri
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  DIALOG: 200,
  PAGE_TRANSITION: 400,
};

// Breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// SEO
export const SEO = {
  TITLE: 'CVK Dijital | Tabela ve Dijital Baskı Çözümleri',
  DESCRIPTION: 'Tabela ve dijital baskıda yenilikçi çözümler. 3D konfigurator, süper hızlı teslimat, kurumsal çözümler.',
  KEYWORDS: 'tabela, dijital baskı, reklam, konfigurator, 3d tabela, Led tabela',
  OG_IMAGE: '/og-image.jpg',
};

// Sosyal medya
export const SOCIAL = {
  FACEBOOK: 'https://facebook.com/cvkdijital',
  INSTAGRAM: 'https://instagram.com/cvkdijital',
  TWITTER: 'https://twitter.com/cvkdijital',
  LINKEDIN: 'https://linkedin.com/company/cvkdijital',
  YOUTUBE: 'https://youtube.com/cvkdijital',
};

// İletişim
export const CONTACT = {
  PHONE: '+90 534 000 00 00',
  EMAIL: 'info@cvkdijital.com',
  ADDRESS: 'İstanbul, Türkiye',
  WORKING_HOURS: '09:00 - 18:00',
};

// Cache süreleri (saniye)
export const CACHE_DURATION = {
  PRODUCTS: 60 * 60, // 1 saat
  CATEGORIES: 60 * 60 * 24, // 1 gün
  USER: 60 * 60, // 1 saat
  ORDERS: 60 * 5, // 5 dakika
};

// LocalStorage anahtarları
export const STORAGE_KEYS = {
  CART: 'cvk_cart',
  USER: 'cvk_user',
  THEME: 'cvk_theme',
  LANGUAGE: 'i18nextLng',
  WISHLIST: 'cvk_wishlist',
  COMPARE: 'cvk_compare',
  COUPONS: 'cvk_coupons',
  RECENTLY_VIEWED: 'cvk_recently_viewed',
  NOTIFICATIONS: 'cvk_notifications',
};

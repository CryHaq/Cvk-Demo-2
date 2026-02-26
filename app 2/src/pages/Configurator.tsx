import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, Save, ShoppingCart, Upload, Check, Image,
  Package, Sparkles, TrendingDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Page } from '../App';
import PouchPreview from '../components/PouchPreview';
import { AnimatedPrice, PriceChange } from '../components/AnimatedPrice';
import ConfiguratorWizard, { configuratorSteps } from '../components/ConfiguratorWizard';
import { getCatalogProducts, type CatalogProduct } from '@/services/productCatalog';

const sizes = [
  { id: '8x13x6', name: 'Stand up pouch - 8x13x6', dimensions: '8x13x6 cm', description: 'Küçük örnekler için ideal' },
  { id: '10x15x7', name: 'Stand up pouch - 10x15x7', dimensions: '10x15x7 cm', description: 'En popüler boyut' },
  { id: '12x18x8', name: 'Stand up pouch - 12x18x8', dimensions: '12x18x8 cm', description: 'Orta büyüklükte ürünler' },
  { id: '14x20x9', name: 'Stand up pouch - 14x20x9', dimensions: '14x20x9 cm', description: 'Büyük kapasite' },
  { id: '16x22x10', name: 'Stand up pouch - 16x22x10', dimensions: '16x22x10 cm', description: 'Endüstriyel boyut' },
];

const materials = [
  { id: 'alu-paper', name: 'Alüminyum kağıt', spec: 'KAĞIT / ALÜ / PE', price: 0, description: 'Yüksek bariyer, uzun raf ömrü' },
  { id: 'matte', name: 'Mat BOPP / ALÜ / PE', spec: 'Mat BOPP / ALÜ / PE', price: 0.02, description: 'Premium mat görünüm' },
  { id: 'glossy', name: 'Parlak BOPP / ALÜ / PE', spec: 'Parlak BOPP / ALÜ / PE', price: 0.01, description: 'Canlı renkler, parlak yüzey' },
  { id: 'kraft', name: 'Kraft kağıt', spec: 'Kraft / ALÜ / PE', price: 0.03, description: 'Doğal, organik görünüm' },
  { id: 'recyclable', name: 'Geri dönüştürülebilir', spec: 'Mono PE', price: 0.05, description: 'Çevre dostu, %100 geri dönüştürülebilir', badge: 'SÜRDÜRÜLEBİLİRLİK' },
];

const optionalFeatures = [
  { id: 'none', name: 'Standart', price: 0, description: 'Temel özellikler' },
  { id: 'zip', name: 'Fermuar (Zip)', price: 0.05, description: 'Yeniden kapanabilir', icon: '🔒' },
  { id: 'valve', name: 'Hava Valfi', price: 0.03, description: 'Kahve için ideal', icon: '☕' },
  { id: 'zip-valve', name: 'Fermuar + Valf', price: 0.08, description: 'Tam donanım', icon: '⭐' },
];

const cornerTypes = [
  { id: 'square', name: 'Kare köşeler', description: 'Klasik görünüm' },
  { id: 'round', name: 'Yuvarlak köşeler', description: 'Modern görünüm' },
];

const quantities = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000];

const leadTimes = [
  { id: 'standard', name: 'Standart', days: 15, discount: 0, description: '15 iş günü' },
  { id: 'relax', name: 'Rahat', days: 20, discount: -0.05, description: '20 iş günü, %5 indirim' },
  { id: 'priority', name: 'Öncelikli', days: 10, discount: 0.10, description: '10 iş günü, +%10 hızlı üretim' },
];

const basePrices: Record<number, number> = {
  100: 132.60, 250: 242.25, 500: 306.00, 750: 376.13,
  1000: 476.00, 1500: 637.50, 2000: 731.00, 2500: 913.75,
  3000: 1045.50, 5000: 1700.00,
};

interface ConfiguratorProps {
  onNavigate: (page: Page) => void;
}

export default function Configurator({ onNavigate }: ConfiguratorProps) {
  const { addToCart } = useCart();
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<CatalogProduct | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [selectedSize, setSelectedSize] = useState(sizes[1]);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[1]);
  const [selectedOptional, setSelectedOptional] = useState(optionalFeatures[0]);
  const [selectedCorner, setSelectedCorner] = useState(cornerTypes[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(500);
  const [graphicsCount, setGraphicsCount] = useState(1);
  const [selectedLeadTime, setSelectedLeadTime] = useState(leadTimes[0]);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string>('');
  const [previousPrice, setPreviousPrice] = useState(0);
  
  const [insurance, setInsurance] = useState(false);
  const [fileVerification, setFileVerification] = useState(false);
  const [cvkLogo, setCvkLogo] = useState(false);
  const [trademark, setTrademark] = useState(false);

  useEffect(() => {
    const loadCatalog = () => {
      const products = getCatalogProducts();
      setCatalogProducts(products);
      setSelectedCatalogProduct((prev) => {
        if (prev && products.some((item) => item.id === prev.id)) {
          return prev;
        }
        return products[0] || null;
      });
    };

    loadCatalog();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'cvk_admin_products_v1') {
        loadCatalog();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const minimumOrder = selectedCatalogProduct?.minOrder || 100;

  useEffect(() => {
    if (selectedQuantity < minimumOrder) {
      const nextQuantity = quantities.find((qty) => qty >= minimumOrder) || minimumOrder;
      setSelectedQuantity(nextQuantity);
    }
  }, [minimumOrder, selectedQuantity]);

  const calculatePrice = useCallback((quantity = selectedQuantity, leadTime = selectedLeadTime) => {
    const priceRatio = (selectedCatalogProduct?.price || 0.45) / 0.45;
    let basePrice = (basePrices[quantity] || basePrices[500]) * priceRatio;
    
    basePrice = basePrice * (1 + leadTime.discount);
    basePrice += selectedOptional.price * quantity;
    basePrice += selectedMaterial.price * quantity;
    
    if (insurance) basePrice += 4.68;
    if (fileVerification) basePrice += 15;
    
    if (cvkLogo) basePrice *= 0.98;
    if (trademark) basePrice *= 0.97;
    
    return basePrice;
  }, [selectedQuantity, selectedLeadTime, selectedOptional, selectedMaterial, insurance, fileVerification, cvkLogo, trademark, selectedCatalogProduct]);

  const netPrice = calculatePrice(selectedQuantity, selectedLeadTime);
  const vat = netPrice * 0.22;
  const total = netPrice + vat;
  const unitPrice = netPrice / selectedQuantity;

  // Fiyat değişiminde previous price güncelle
  useEffect(() => {
    const timer = setTimeout(() => setPreviousPrice(netPrice), 600);
    return () => clearTimeout(timer);
  }, [netPrice]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignFile(file);
      const url = URL.createObjectURL(file);
      setDesignPreview(url);
    }
  };

  const handleReset = () => {
    setProjectName('');
    setSelectedSize(sizes[1]);
    setSelectedMaterial(materials[1]);
    setSelectedOptional(optionalFeatures[0]);
    setSelectedCorner(cornerTypes[0]);
    setSelectedQuantity(Math.max(minimumOrder, 500));
    setGraphicsCount(1);
    setSelectedLeadTime(leadTimes[0]);
    setInsurance(false);
    setFileVerification(false);
    setCvkLogo(false);
    setTrademark(false);
    setDesignFile(null);
    setDesignPreview('');
    setCurrentStep(0);
  };

  const handleAddToCartAndNavigate = () => {
    const cartItem = {
      id: Date.now(), // Unique ID for custom config
      name: selectedCatalogProduct ? `${selectedCatalogProduct.name} - ${selectedSize.name}` : `Ozel Uretim - ${selectedSize.name}`,
      price: unitPrice,
      quantity: selectedQuantity,
      minOrder: minimumOrder,
      image: designPreview || selectedCatalogProduct?.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      options: {
        size: selectedSize.dimensions,
        material: selectedMaterial.name,
        color: selectedOptional.name,
        corner: selectedCorner.name,
        leadTime: selectedLeadTime.name,
        graphicsCount: graphicsCount.toString(),
        projectName: projectName || 'Adsız Proje',
      },
      notes: `Teslimat: ${selectedLeadTime.name} (${selectedLeadTime.days} gün)`,
    };
    
    addToCart(cartItem);
    // Sepet sayfasına yönlendir
    onNavigate('cart');
  };

  // Her adımın tamamlanabilirlik kontrolü
  const canProceed = (() => {
    switch (currentStep) {
      case 0: return !!selectedCatalogProduct; // Ürün tipi seçili
      case 1: return !!selectedSize; // Boyut seçili
      case 2: return !!selectedMaterial; // Malzeme seçili
      case 3: return !!selectedOptional && !!selectedCorner; // Özellikler seçili
      case 4: return selectedQuantity >= minimumOrder; // Miktar yeterli
      case 5: return !!selectedLeadTime; // Teslimat seçili
      default: return true;
    }
  })();

  // Adım içerikleri
  const stepContents = [
    // Adım 1: Ürün Tipi
    <div key="product" className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ürününüzü Seçin</h3>
        <p className="text-gray-600 dark:text-gray-400">Ambalaj tipini seçerek başlayın</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {catalogProducts.slice(0, 6).map((product) => (
          <button
            key={product.id}
            onClick={() => setSelectedCatalogProduct(product)}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedCatalogProduct?.id === product.id
                ? 'border-[#0077be] bg-[#0077be]/5 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 hover:border-[#0077be]/40'
            }`}
          >
            <Package className={`w-12 h-12 mx-auto mb-4 ${selectedCatalogProduct?.id === product.id ? 'text-[#0077be]' : 'text-gray-400'}`} />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
            {selectedCatalogProduct?.id === product.id && <span className="text-sm text-[#0077be]">✓ Secili</span>}
          </button>
        ))}
        {catalogProducts.length === 0 && (
          <div className="md:col-span-3 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Admin panelde urun bulunamadi. Lutfen once urun yonetiminden urun ekleyin.
          </div>
        )}
      </div>
    </div>,

    // Adım 2: Boyut
    <div key="size" className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Boyut Seçimi</h3>
          <div className="space-y-3">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedSize.id === size.id
                    ? 'border-[#0077be] bg-[#0077be]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{size.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{size.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200">
                      {size.dimensions}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 flex items-center justify-center">
          <PouchPreview 
            size={selectedSize} 
            material={selectedMaterial}
            optional={selectedOptional}
            corner={selectedCorner}
            designUrl={designPreview}
          />
        </div>
      </div>
    </div>,

    // Adım 3: Malzeme
    <div key="material" className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Malzeme Seçimi</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {materials.map((material) => (
          <button
            key={material.id}
            onClick={() => setSelectedMaterial(material)}
            className={`p-5 rounded-xl border-2 text-left transition-all relative ${
              selectedMaterial.id === material.id
                ? 'border-[#0077be] bg-[#0077be]/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            {material.badge && (
              <span className="absolute -top-3 left-4 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                {material.badge}
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{material.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{material.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{material.spec}</p>
              </div>
              {material.price > 0 && (
                <span className="text-sm text-orange-500 font-medium">
                  +€{material.price.toFixed(2)}/adet
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Adım 4: Özellikler
    <div key="features" className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Opsiyonel Özellikler</h3>
          <div className="space-y-3">
            {optionalFeatures.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedOptional(feature)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOptional.id === feature.id
                    ? 'border-[#0077be] bg-[#0077be]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {feature.icon && <span className="text-2xl">{feature.icon}</span>}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{feature.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  {feature.price > 0 && (
                    <span className="text-sm text-orange-500 font-medium">
                      +€{feature.price.toFixed(2)}/adet
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Köşe Tipi</h3>
          <div className="space-y-3">
            {cornerTypes.map((corner) => (
              <button
                key={corner.id}
                onClick={() => setSelectedCorner(corner)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedCorner.id === corner.id
                    ? 'border-[#0077be] bg-[#0077be]/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100">{corner.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{corner.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // Adım 5: Miktar + Üretim Süresi Matrisi
    <div key="quantity" className="space-y-6">
      <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Miktar ve Üretim Süresi</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Tablodan bir hücre seçerek hem miktarı hem üretim planını aynı anda belirleyin.</p>

          <div className="rounded-2xl border border-[#0077be]/15 dark:border-[#3b82f6]/25 bg-[#f4f8ff] dark:bg-[#0f1f38] p-2 sm:p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-none">
            <div className="overflow-x-auto pb-2 scrollbar-thin overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] snap-x snap-mandatory">
              <div style={{ minWidth: `${110 + quantities.length * 96}px` }}>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `110px repeat(${quantities.length}, minmax(78px, 1fr))` }}>
                  <div className="sticky left-0 z-20 rounded-lg border border-[#d8e6ff] dark:border-[#334155] bg-white/95 dark:bg-[#1e293b]/95 px-2 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-300 backdrop-blur-sm">
                    Teslimat / Miktar
                  </div>
                  {quantities.map((qty) => (
                    <button
                      key={`q-${qty}`}
                      onClick={() => qty >= minimumOrder && setSelectedQuantity(qty)}
                      disabled={qty < minimumOrder}
                      className={`rounded-lg border px-1.5 py-2 text-center transition-all snap-start ${
                        selectedQuantity === qty
                          ? 'border-[#273889] bg-[#273889] text-white shadow-md'
                          : qty < minimumOrder
                          ? 'border-[#d8e6ff] dark:border-[#334155] bg-slate-100 dark:bg-[#111827] text-slate-400 cursor-not-allowed'
                          : 'border-[#d8e6ff] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#273889] dark:text-[#c7d2fe] hover:border-[#273889]/45 dark:hover:border-[#6366f1]/60'
                      }`}
                    >
                      <p className="text-[9px] uppercase tracking-[0.08em] opacity-80">Miktar</p>
                      <p className="text-base font-semibold leading-none mt-0.5">{qty}</p>
                      <p className="text-[10px] opacity-80">pcs</p>
                    </button>
                  ))}

                  {leadTimes.map((lt) => {
                    const date = new Date();
                    date.setDate(date.getDate() + lt.days);
                    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const day = date.getDate();
                    return (
                      <div key={`lead-row-${lt.id}`} className="contents">
                        <div className="sticky left-0 z-10 rounded-lg border border-[#d8e6ff] dark:border-[#334155] bg-white/95 dark:bg-[#1e293b]/95 p-1.5 backdrop-blur-sm">
                          <div className="grid grid-cols-[22px_1fr] items-stretch">
                            <div className="rounded-l-md bg-[#273889] text-white flex items-center justify-center">
                              <span className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-bold tracking-[0.16em] uppercase">
                                {lt.name}
                              </span>
                            </div>
                            <div className="rounded-r-md bg-[#f7f9ff] dark:bg-[#0f172a] px-1.5 py-2 text-center">
                              <p className="text-xl font-bold text-[#273889] leading-none">{day}</p>
                              <p className="text-[10px] font-semibold text-[#273889] mt-0.5">{month}</p>
                            </div>
                          </div>
                        </div>
                        {quantities.map((qty) => {
                          const cellPrice = calculatePrice(qty, lt);
                          const cellUnit = cellPrice / qty;
                          const active = selectedQuantity === qty && selectedLeadTime.id === lt.id;
                          const belowMin = qty < minimumOrder;
                          return (
                            <button
                              key={`${lt.id}-${qty}`}
                              onClick={() => {
                                if (belowMin) return;
                                setSelectedLeadTime(lt);
                                setSelectedQuantity(qty);
                              }}
                              disabled={belowMin}
                              className={`rounded-lg border px-1.5 py-2 text-center transition-all snap-start ${
                                active
                                  ? 'border-[#273889] bg-[#273889] text-white shadow-lg'
                                  : belowMin
                                  ? 'border-[#d8e6ff] dark:border-[#334155] bg-slate-100 dark:bg-[#111827] text-slate-400 cursor-not-allowed'
                                  : 'border-[#d8e6ff] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#273889] dark:text-[#c7d2fe] hover:border-[#273889]/45 dark:hover:border-[#6366f1]/60 hover:bg-[#f9fbff] dark:hover:bg-[#111827]'
                              }`}
                            >
                              <p className="text-base font-semibold leading-none">€ {cellPrice.toFixed(0)}</p>
                              <p className={`mt-0.5 text-[10px] ${active ? 'text-white/80' : 'text-[#4f62ad]'}`}>€ {cellUnit.toFixed(3)} / pcs</p>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Birim Fiyat Göstergesi */}
          <div className="mt-6 mb-6 p-4 bg-gradient-to-r from-[#0077be]/10 to-[#00a8e8]/10 dark:from-[#1d4ed8]/25 dark:to-[#0f172a] rounded-2xl border border-[#0077be]/20 dark:border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Birim Fiyat</p>
                <p className="text-3xl font-bold text-[#0077be]">€ {unitPrice.toFixed(3)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">Toplam Tutar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">€ {netPrice.toFixed(2)}</p>
              </div>
            </div>
            {selectedQuantity >= 500 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full w-fit">
                <Sparkles className="w-4 h-4" />
                <span>{selectedQuantity >= 5000 ? '%35' : selectedQuantity >= 2500 ? '%25' : selectedQuantity >= 1000 ? '%15' : '%10'} toplu alım indirimi uygulandı!</span>
              </div>
            )}
          </div>

          {/* Grafik Sayısı */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Farklı Tasarım Sayısı
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={graphicsCount}
                onChange={(e) => setGraphicsCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0077be]"
              />
              <span className="w-12 text-center font-bold text-[#0077be] text-xl">{graphicsCount}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Her farklı tasarım için ayrı baskı hazırlığı yapılır</p>
          </div>

          <div className="rounded-xl border border-[#0077be]/15 dark:border-[#334155] bg-white dark:bg-[#1e293b] px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
            Seçili plan: <span className="font-semibold text-[#273889]">{selectedLeadTime.name}</span> •{' '}
            <span className="font-semibold text-[#273889]">{selectedQuantity} pcs</span>
            <span className="ml-2 text-xs text-gray-500">(Min. {minimumOrder} pcs)</span>
          </div>

          <div className="mt-6 cvk-panel-subtle p-4 sm:p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tasarım Yükleme</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 sm:p-8 text-center hover:border-[#0077be] transition-colors bg-white dark:bg-[#111827]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef6ff]">
                <Upload className="w-7 h-7 text-[#0077be]" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Tasarım dosyanızı sürükleyin veya seçin</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">AI, PDF, EPS (max. 100MB)</p>
              <label className="inline-flex items-center px-4 py-2 bg-[#0077be] text-white rounded-lg cursor-pointer hover:bg-[#005a8f] transition-colors">
                <Image className="w-4 h-4 mr-2" />
                Dosya Seç
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".ai,.pdf,.eps,.jpg,.png" />
              </label>
              {designFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 text-sm truncate">{designFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              💡 Tasarım yüklemek zorunda değilsiniz. Sipariş sonrası yükleyebilirsiniz.
            </p>
          </div>
      </div>
    </div>,

    // Adım 6: Ek Hizmetler ve Özet
    <div key="delivery" className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Seçili Üretim Planı</h3>
          <div className="mb-8 rounded-2xl border border-[#0077be]/15 dark:border-[#334155] bg-[#f5f9ff] dark:bg-[#0f1f38] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                <p className="text-xl font-bold text-[#273889]">{selectedLeadTime.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedLeadTime.description}</p>
              </div>
              {selectedLeadTime.discount !== 0 && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedLeadTime.discount > 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedLeadTime.discount > 0 ? `+${Math.round(selectedLeadTime.discount * 100)}%` : `${Math.round(selectedLeadTime.discount * 100)}%`}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-[#273889] dark:text-[#a5b4fc]">
              Bu planı değiştirmek için bir önceki adımda tablodan farklı bir satır/hücre seçebilirsiniz.
            </p>
          </div>

          {/* Ek Hizmetler */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ek Hizmetler</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="w-5 h-5 accent-[#0077be]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Üretim Sigortası</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">€4.68</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <input type="checkbox" checked={fileVerification} onChange={(e) => setFileVerification(e.target.checked)} className="w-5 h-5 accent-[#0077be]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Dosya Doğrulama</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">€15.00</p>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Teklif Özeti</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-4 border border-transparent dark:border-gray-700">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center">
                <Package className="w-8 h-8 text-[#0077be]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedSize.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMaterial.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOptional.name}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Miktar</span>
                <span>{selectedQuantity} adet × {graphicsCount} grafik</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Birim Fiyat</span>
                <span>€{unitPrice.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-gray-900 dark:text-gray-100 font-semibold text-lg">
                <span>Net Fiyat</span>
                <div className="text-right">
                  <AnimatedPrice value={netPrice} decimals={2} />
                  <PriceChange previousPrice={previousPrice} currentPrice={netPrice} />
                </div>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>KDV (%22)</span>
                <AnimatedPrice value={vat} decimals={2} />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Toplam</span>
                <span className="text-3xl font-bold text-[#0077be]">
                  <AnimatedPrice value={total} decimals={2} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="cvk-page">
      {/* Hero */}
      <section className="relative py-12 overflow-hidden bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="cvk-container">
          <div className="text-center md:text-left">
            <p className="text-white/80 font-medium mb-1">YAPILANDIRMA ARACI</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Poşetinizi Adım Adım Oluşturun
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 sm:py-8">
        <div className="cvk-container">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Wizard */}
            <div className="lg:col-span-2">
              <div className="cvk-panel p-4 sm:p-6">
                <ConfiguratorWizard
                  steps={configuratorSteps}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                  onComplete={handleAddToCartAndNavigate}
                  canProceed={canProceed}
                >
                  {stepContents}
                </ConfiguratorWizard>
              </div>
            </div>

            {/* Right: Sticky Preview & Summary */}
            <div className="xl:sticky xl:top-24 h-fit space-y-4 sm:space-y-6">
              {/* 3D Preview */}
              <div className="cvk-panel-subtle p-4 sm:p-6 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Canlı Önizleme</h3>
                <PouchPreview 
                  size={selectedSize}
                  material={selectedMaterial}
                  optional={selectedOptional}
                  corner={selectedCorner}
                  designUrl={designPreview}
                />
              </div>

              {/* Quick Summary */}
              <div className="cvk-panel-subtle p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Teklif Özeti</h3>
                  <button onClick={handleReset} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" /> Sıfırla
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Net Fiyat</span>
                    <AnimatedPrice value={netPrice} decimals={2} />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>KDV (%22)</span>
                    <AnimatedPrice value={vat} decimals={2} />
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Toplam</span>
                    <span className="text-[#0077be]">
                      <AnimatedPrice value={total} decimals={2} />
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {selectedQuantity} adet × €{unitPrice.toFixed(3)}/adet
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => {}}>
                    <Save className="w-4 h-4 mr-2" /> Kaydet
                  </Button>
                  <Button 
                    className="flex-1 cvk-btn-primary"
                    onClick={handleAddToCartAndNavigate}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Sepete Ekle
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-[#11243a] dark:to-[#0f172a] rounded-2xl p-4 border border-[#0077be]/10 dark:border-[#334155]">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-5 h-5 text-[#0077be]" />
                  <span>Minimum 100 adet sipariş alınır</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span>Daha yüksek miktar = Daha düşük birim fiyat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

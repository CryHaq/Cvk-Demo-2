import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, Search, ChevronDown, Star, Check, ArrowRight, Package, Heart, Grid3X3, LayoutList, SlidersHorizontal, X, Scale, Bell } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductQuickView from '@/components/ProductQuickView';
import ComparisonWidget from '@/components/ComparisonWidget';
import { comparisonApi } from '@/services/comparisonApi';
import { ProductGridSkeleton } from '@/components/ProductCardSkeleton';
import StockNotification from '@/components/StockNotification';
import PDFQuote from '@/components/PDFQuote';
import Fuse from 'fuse.js';
import { getCatalogProducts, type CatalogProduct } from '@/services/productCatalog';
import type { Page } from '../App';

const categories = [
  { id: 'all', name: 'Tümü' },
  { id: 'doypack', name: 'Doypack Poşetler' },
  { id: 'zip', name: 'Fermuarlı Poşetler' },
  { id: 'paper', name: 'Kağıt Poşetler' },
  { id: 'recyclable', name: 'Geri Dönüştürülebilir' },
  { id: 'aluminum', name: 'Alüminyum Poşetler' },
];

const sortOptions = [
  { id: 'featured', name: 'Önerilen' },
  { id: 'price-low', name: 'Fiyat: Düşükten Yükseğe' },
  { id: 'price-high', name: 'Fiyat: Yüksekten Düşüğe' },
  { id: 'rating', name: 'En Yüksek Puan' },
  { id: 'newest', name: 'En Yeniler' },
];

const markets = [
  { id: 'hemp', name: 'Kenevir', icon: '🌿' },
  { id: 'tea', name: 'Çay ve Bitki Çayları', icon: '🍵' },
  { id: 'supplements', name: 'Takviyeler', icon: '💊' },
  { id: 'superfood', name: 'Süper Gıdalar', icon: '🥜' },
  { id: 'cosmetics', name: 'Kozmetik', icon: '💄' },
  { id: 'petfood', name: 'Evcil Hayvan Gıdası', icon: '🐾' },
];

interface ShopProps {
  onNavigate: (page: Page) => void;
}

export default function Shop({ onNavigate }: ShopProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = () => {
      setIsLoading(true);
      const catalogProducts = getCatalogProducts();
      setProducts(catalogProducts);
      setTimeout(() => setIsLoading(false), 250);
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

  // Initialize Fuse.js for search
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'features', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Fuse.js search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map(r => r.item);
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, priceRange, fuse]);

  const handleAddToCart = (product: CatalogProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      minOrder: product.minOrder,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleQuickView = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setPriceRange([0, 1]);
    setSortBy('featured');
  };

  const hasFilters = activeCategory !== 'all' || searchQuery || priceRange[0] > 0 || priceRange[1] < 1;

  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  useEffect(() => {
    const updateComparison = () => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === 'cvk_comparison_list') {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              const parsed = JSON.parse(val);
              setComparisonIds(parsed);
            } catch (e) {
              setComparisonIds([]);
            }
          }
        }
      }
    };
    updateComparison();
    window.addEventListener('storage', updateComparison);
    return () => window.removeEventListener('storage', updateComparison);
  }, []);

  const handleAddToComparison = async (productId: string) => {
    const result = await comparisonApi.addToComparison(productId);
    if (result.success) {
      // Trigger storage event for widget
      window.dispatchEvent(new Event('storage'));
    }
    // Refresh list
    const list = await comparisonApi.getComparisonList();
    if (list.products) {
      setComparisonIds(list.products.map(p => p.id));
    }
  };

  const handleRemoveFromComparison = async (productId: string) => {
    await comparisonApi.removeFromComparison(productId);
    window.dispatchEvent(new Event('storage'));
    const list = await comparisonApi.getComparisonList();
    if (list.products) {
      setComparisonIds(list.products.map(p => p.id));
    }
  };

  return (
    <div className="cvk-page">
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-20 lg:py-24 bg-gradient-to-r from-[#0f3057] via-[#0077be] to-[#00a8e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(255,255,255,0.22),transparent_35%)]" />
        <div className="cvk-container">
          <div className="relative text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/30 bg-white/10 text-white text-xs font-semibold tracking-wide mb-5">
              SHOP
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Özelleştirilmiş Esnek Ambalaj</h1>
            <p className="text-white/85 text-lg max-w-2xl mx-auto">Markanız için özel tasarlanmış, yüksek kaliteli doypack poşetler ve ambalaj çözümleri.</p>
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="py-8 border-b border-[#0077be]/10 bg-white/85 backdrop-blur-sm">
        <div className="cvk-container">
          <p className="text-gray-500 text-sm mb-4">Sektöre Göre:</p>
          <div className="flex flex-wrap gap-3">
            {markets.map(market => (
              <button key={market.id} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#0077be]/15 rounded-full text-gray-700 hover:bg-[#0077be]/10 hover:border-[#0077be]/30 transition-all">
                <span>{market.icon}</span>
                <span className="text-sm">{market.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-6 sticky top-16 bg-white/95 backdrop-blur z-30 border-b border-[#0077be]/10 shadow-sm">
        <div className="cvk-container">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Ürün ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#0077be]/15 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-[#0077be] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-white hover:bg-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-white border border-[#0077be]/15 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0077be]' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0077be]' : 'text-gray-500'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-[#0077be]/15 rounded-xl text-gray-700 hover:bg-[#0077be]/10 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Sırala:</span>
                  <span className="text-gray-900 font-medium">{sortOptions.find(s => s.id === sortBy)?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#0077be]/15 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        sortBy === option.id ? 'text-[#0077be] bg-[#f0f7fc]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                  showFilters ? 'bg-[#0077be] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrele</span>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 mr-2">Kategoriler:</span>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      activeCategory === cat.id 
                        ? 'bg-[#0077be] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="cvk-container">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Ürünler 
              <span className="text-gray-400 font-normal ml-2">({filteredProducts.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 cvk-panel-subtle">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-500 mb-6">Farklı arama kriterleri deneyin.</p>
              <Button onClick={clearFilters} variant="outline" className="border-[#0077be] text-[#0077be]">
                Filtreleri Temizle
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`group cvk-panel-subtle hover:border-[#0077be]/30 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden bg-gray-100 ${
                    viewMode === 'list' ? 'sm:w-64 aspect-square' : 'aspect-square'
                  }`}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {product.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#0077be] text-white text-xs font-semibold rounded-full">{product.badge}</span>
                      </div>
                    )}
                    
                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleQuickView(product)}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-[#0077be] hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => comparisonIds.includes(product.id.toString()) 
                          ? handleRemoveFromComparison(product.id.toString())
                          : handleAddToComparison(product.id.toString())
                        }
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 ${
                          comparisonIds.includes(product.id.toString()) 
                            ? 'bg-[#0077be] text-white' 
                            : 'bg-white text-gray-900 hover:bg-[#0077be] hover:text-white'
                        }`}
                        title={comparisonIds.includes(product.id.toString()) ? 'Karşılaştırmadan Çıkar' : 'Karşılaştır'}
                      >
                        <Scale className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => toggleWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          category: categories.find(c => c.id === product.category)?.name || product.category,
                          minOrder: product.minOrder,
                        })}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150 ${
                          isInWishlist(product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-900 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-700 text-sm">{product.rating}</span>
                      <span className="text-gray-400 text-sm">({product.reviews})</span>
                    </div>
                    
                    <h3 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-[#0077be] transition-colors">{product.name}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                          <Check className="w-3 h-3 text-[#0077be]" />
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {product.stock === undefined || product.stock === 0 ? (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <StockNotification productId={product.id} productName={product.name} />
                        </div>
                      ) : product.stock < 100 ? (
                        <div className="flex items-center gap-2 text-orange-600 text-sm">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                          <span>Son {product.stock} adet - Acele edin!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Stokta var</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between mb-4 mt-auto">
                      <div>
                        <p className="text-gray-500 text-sm">Min: {product.minOrder} adet</p>
                        <p className="text-2xl font-bold text-[#0077be]">€{product.price.toFixed(2)} <span className="text-sm text-gray-500 font-normal">/ adet</span></p>
                      </div>
                    </div>

                    {/* PDF Quote Button */}
                    <div className="mb-3">
                      <PDFQuote product={product} />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`flex-1 font-semibold transition-all ${
                          product.stock === 0 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : addedId === product.id
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-[#0077be] hover:bg-[#005a8f]'
                        }`}
                      >
                        {(product.stock === undefined || product.stock === 0) ? (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Stokta Yok
                          </>
                        ) : addedId === product.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Eklendi
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Sepete Ekle
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => handleQuickView(product)}
                        variant="outline"
                        className="cvk-btn-outline"
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white/90 border-t border-[#0077be]/10">
        <div className="cvk-container text-center">
          <h2 className="cvk-heading-xl mb-4">Özel bir ihtiyacınız mı var?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">Standart ürünlerimiz dışında özel boyut, malzeme veya tasarım ihtiyaçlarınız için bize ulaşın.</p>
          <Button size="lg" onClick={() => onNavigate('contact')} className="cvk-btn-primary font-semibold px-8">
            Özel Teklif Al
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Comparison Widget */}
      <ComparisonWidget />
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Clock, TrendingUp, Package, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';

interface SearchResult {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

interface AdvancedSearchProps {
  products: SearchResult[];
  onSelect: (productId: number) => void;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT = 5;

export default function AdvancedSearch({ products, onSelect, onClose }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    inputRef.current?.focus();
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Fuse.js setup
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.2 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }, [products]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    let searchResults = fuse.search(query).map(r => r.item);
    
    // Apply filters
    if (selectedCategory !== 'all') {
      searchResults = searchResults.filter(p => p.category === selectedCategory);
    }
    
    searchResults = searchResults.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    return searchResults.slice(0, 8);
  }, [query, fuse, selectedCategory, priceRange]);

  // Trending searches
  const trendingSearches = ['Doypack', 'Kraft Poşet', 'Fermuarlı', 'Baskılı'];

  // Categories
  const categories = ['all', 'doypack', 'zip', 'paper', 'recyclable', 'aluminum'];

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Save to recent
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Ürün, kategori veya anahtar kelime ara..."
              className="flex-1 text-lg outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-[#0077be] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-gray-100 bg-gray-50 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedCategory === cat
                            ? 'bg-[#0077be] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0077be]'
                        }`}
                      >
                        {cat === 'all' ? 'Tümü' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Fiyat Aralığı: €{priceRange[0]} - €{priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-[#0077be]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query ? (
            results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onSelect(product.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-[#0077be] font-semibold">€{product.price.toFixed(2)}</p>
                    </div>
                    <Package className="w-5 h-5 text-gray-300" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Sonuç bulunamadı</p>
                <p className="text-sm mt-1">Farklı anahtar kelimeler deneyin</p>
              </div>
            )
          ) : (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Son Aramalar
                    </h3>
                    <button
                      onClick={clearRecent}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Temizle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(search)}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  Popüler Aramalar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(search)}
                      className="px-3 py-1.5 bg-[#0077be]/10 text-[#0077be] rounded-full text-sm hover:bg-[#0077be]/20 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
          ESC ile kapat • {results.length} sonuç bulundu
        </div>
      </motion.div>
    </motion.div>
  );
}

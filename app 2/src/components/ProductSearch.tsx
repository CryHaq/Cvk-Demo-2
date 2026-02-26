import { useState, useEffect, useMemo } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Fuse from 'fuse.js';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  size?: string;
  material?: string;
  price: number;
  features?: string[];
}

interface ProductSearchProps {
  products: Product[];
  onSearchResults: (results: Product[]) => void;
  onFilterChange: (filters: FilterState) => void;
  placeholder?: string;
}

export interface FilterState {
  query: string;
  categories: string[];
  sizes: string[];
  materials: string[];
  priceRange: [number, number];
  features: string[];
}

const CATEGORIES = ['Stand-Up Pouch', 'Yatay Poşet', 'Rulo Film', 'Doypack'];
const SIZES = ['8x13x6', '10x15x7', '12x18x8', '14x20x9', '16x22x10'];
const MATERIALS = ['Alüminyum kağıt', 'Mat BOPP', 'Parlak BOPP', 'Kraft kağıt', 'Geri dönüştürülebilir'];
const FEATURES = ['Fermuar (Zip)', 'Hava Valfi', 'Clear Window', 'Tear Notch'];

export default function ProductSearch({ 
  products, 
  onSearchResults, 
  onFilterChange,
  placeholder = 'Ürün ara...'
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    categories: [],
    sizes: [],
    materials: [],
    priceRange: [0, 1000],
    features: [],
  });

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.2 },
        { name: 'material', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [products]);

  // Perform search and filter
  useEffect(() => {
    let results = products;

    // Text search
    if (query.trim()) {
      const searchResults = fuse.search(query);
      results = searchResults.map(result => result.item);
    }

    // Apply filters
    if (filters.categories.length > 0) {
      results = results.filter(p => filters.categories.includes(p.category));
    }
    if (filters.sizes.length > 0) {
      results = results.filter(p => p.size && filters.sizes.includes(p.size));
    }
    if (filters.materials.length > 0) {
      results = results.filter(p => p.material && filters.materials.includes(p.material));
    }
    if (filters.features.length > 0) {
      results = results.filter(p => 
        p.features && filters.features.some(f => p.features?.includes(f))
      );
    }
    results = results.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    onSearchResults(results);
    onFilterChange({ ...filters, query });
  }, [query, filters, products]);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      query: '',
      categories: [],
      sizes: [],
      materials: [],
      priceRange: [0, 1000],
      features: [],
    });
  };

  const hasActiveFilters = 
    query || 
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.materials.length > 0 ||
    filters.features.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000;

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0077be] focus:border-transparent outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 ${showFilters ? 'bg-[#0077be] text-white' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtreler
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-6 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Categories */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Kategori</h4>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat)}
                      onChange={() => toggleFilter('categories', cat)}
                      className="w-4 h-4 accent-[#0077be]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Boyut</h4>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleFilter('sizes', size)}
                    className={`px-3 py-1 text-sm rounded-lg border transition-all ${
                      filters.sizes.includes(size)
                        ? 'bg-[#0077be] text-white border-[#0077be]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#0077be]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Malzeme</h4>
              <div className="space-y-2">
                {MATERIALS.map(mat => (
                  <label key={mat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.materials.includes(mat)}
                      onChange={() => toggleFilter('materials', mat)}
                      className="w-4 h-4 accent-[#0077be]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{mat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Özellikler</h4>
              <div className="space-y-2">
                {FEATURES.map(feature => (
                  <label key={feature} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.features.includes(feature)}
                      onChange={() => toggleFilter('features', feature)}
                      className="w-4 h-4 accent-[#0077be]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Fiyat Aralığı: €{filters.priceRange[0]} - €{filters.priceRange[1]}
            </h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0077be]"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={clearFilters} className="text-red-500">
                <X className="w-4 h-4 mr-2" />
                Tüm Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {query && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Ara: "{query}"
              <button onClick={() => setQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.categories.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              {cat}
              <button onClick={() => toggleFilter('categories', cat)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {filters.sizes.map(size => (
            <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              {size}
              <button onClick={() => toggleFilter('sizes', size)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {filters.materials.map(mat => (
            <span key={mat} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              {mat}
              <button onClick={() => toggleFilter('materials', mat)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

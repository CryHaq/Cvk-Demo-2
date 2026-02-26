import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Scale, X, ChevronUp, ChevronDown } from 'lucide-react';
import { comparisonApi } from '../services/comparisonApi';
import ProductComparison from './ProductComparison';

export default function ComparisonWidget() {
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadCount();
    
    // Listen for storage changes (from other tabs/components)
    const handleStorageChange = () => {
      loadCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadCount = async () => {
    const result = await comparisonApi.getComparisonList();
    if (result.success) {
      setCount(result.count || 0);
      setProducts(result.products || []);
    }
  };

  const handleClear = async () => {
    await comparisonApi.clearComparison();
    loadCount();
  };

  if (count === 0) return null;

  return (
    <>
      {/* Floating Widget */}
      <div className="fixed bottom-24 right-4 z-40">
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-auto'
        }`}>
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 bg-[#0077be] text-white rounded-t-2xl"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span className="font-semibold">Karşılaştır ({count})</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="p-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-[#0077be] text-sm">€{product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => {
                        comparisonApi.removeFromComparison(product.id);
                        loadCount();
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="flex-1"
                >
                  Temizle
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowComparison(true);
                    setIsExpanded(false);
                  }}
                  className="flex-1 bg-[#0077be] text-white"
                  disabled={count < 2}
                >
                  Karşılaştır
                </Button>
              </div>

              {count < 2 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Karşılaştırmak için en az 2 ürün ekleyin
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      <ProductComparison
        isOpen={showComparison}
        onClose={() => {
          setShowComparison(false);
          loadCount();
        }}
      />
    </>
  );
}

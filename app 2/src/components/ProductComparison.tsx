import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Scale, Trash2 } from 'lucide-react';
import { comparisonApi, type CompareProduct } from '../services/comparisonApi';
import { useCart } from '@/context/CartContext';

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductComparison({ isOpen, onClose }: ProductComparisonProps) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadComparison();
    }
  }, [isOpen]);

  const loadComparison = async () => {
    setIsLoading(true);
    const result = await comparisonApi.getComparisonList();
    if (result.success) {
      setProducts(result.products || []);
    }
    setIsLoading(false);
  };

  const handleRemove = async (productId: string) => {
    await comparisonApi.removeFromComparison(productId);
    loadComparison();
  };

  const handleClear = async () => {
    await comparisonApi.clearComparison();
    loadComparison();
  };

  const parseMinOrder = (product: CompareProduct): number => {
    const raw = String(product.features['Minimum Siparis'] || '');
    const match = raw.match(/\d+/);
    return match ? Number(match[0]) : 100;
  };

  const handleAddToCart = (product: CompareProduct) => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      minOrder: parseMinOrder(product),
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-2 border-[#0077be] border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Karşılaştırma Listesi Boş</h3>
          <p className="text-gray-500 mb-6">Karşılaştırmak için ürün ekleyin.</p>
          <Button onClick={onClose} className="bg-[#0077be] text-white">
            Alışverişe Devam Et
          </Button>
        </div>
      </div>
    );
  }

  // Get all unique feature keys
  const featureKeys = Array.from(
    new Set(products.flatMap(p => Object.keys(p.features)))
  );

  // Get all unique spec keys
  const specKeys = Array.from(
    new Set(products.flatMap(p => Object.keys(p.specifications)))
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ürün Karşılaştırma</h2>
            <p className="text-gray-500">{products.length} ürün karşılaştırılıyor</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Temizle
            </Button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            {/* Product Headers */}
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-50 rounded-tl-lg sticky left-0 min-w-[200px]">
                  Özellik
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 min-w-[250px]">
                    <div className="relative">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-xl mx-auto mb-3"
                      />
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-[#0077be] font-bold text-xl mt-1">
                        €{product.price.toFixed(2)}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm">{product.rating}</span>
                        <span className="text-gray-400 text-sm">({product.reviews})</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Features Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 bg-gray-100 font-semibold">
                  Özellikler
                </td>
              </tr>
              {featureKeys.map((key) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="p-4 bg-gray-50 sticky left-0 font-medium text-gray-700">
                    {key}
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {typeof product.features[key] === 'boolean' ? (
                        product.features[key] ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )
                      ) : (
                        <span className="text-gray-700">{product.features[key] || '-'}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Specifications Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 bg-gray-100 font-semibold">
                  Teknik Özellikler
                </td>
              </tr>
              {specKeys.map((key) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="p-4 bg-gray-50 sticky left-0 font-medium text-gray-700">
                    {key}
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="text-gray-700">
                        {product.specifications[key] || '-'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Pros Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 bg-gray-100 font-semibold">
                  Artıları
                </td>
              </tr>
              <tr>
                <td className="p-4 bg-gray-50 sticky left-0"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    <ul className="space-y-1">
                      {product.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-green-700">
                          <Check className="w-4 h-4" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Cons Section */}
              <tr>
                <td colSpan={products.length + 1} className="p-4 bg-gray-100 font-semibold">
                  Eksileri
                </td>
              </tr>
              <tr>
                <td className="p-4 bg-gray-50 sticky left-0"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    <ul className="space-y-1">
                      {product.cons.map((con, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-red-700">
                          <X className="w-4 h-4" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr>
                <td className="p-4 bg-gray-50 sticky left-0 rounded-bl-lg"></td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    <Button className="w-full bg-[#0077be] text-white" onClick={() => handleAddToCart(product)}>
                      Sepete Ekle
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

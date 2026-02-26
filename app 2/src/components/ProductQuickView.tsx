import { useState, useEffect } from 'react';
import { X, ShoppingCart, Heart, Check, Star, Minus, Plus, Ruler, Package, Truck, Shield, Info, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductReviews from './ProductReviews';
import type { Page } from '@/App';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  minOrder: number;
  image: string;
  rating: number;
  reviews: number;
  features: string[];
  badge?: string | null;
  description?: string;
  images?: string[];
  stock?: number;
  sizes?: string[];
  materials?: string[];
}

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export default function ProductQuickView({ product, isOpen, onClose, onNavigate }: ProductQuickViewProps) {
  const { addToCart, isInCart, getItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(product.minOrder);
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedMaterial(product.materials?.[0] || '');
      setActiveImage(0);
      setAddedToCart(false);
    }
  }, [product]);

  // Update quantity if product is already in cart
  useEffect(() => {
    if (product && isInCart(product.id)) {
      const item = getItem(product.id);
      if (item) {
        setQuantity(item.quantity);
      }
    }
  }, [product, isInCart, getItem]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const images = product.images || [product.image];
  const isWishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      minOrder: product.minOrder,
      stock: product.stock,
      options: {
        size: selectedSize,
        material: selectedMaterial,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= product.minOrder) {
      setQuantity(newQty);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    onNavigate('shop');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid lg:grid-cols-2 h-full max-h-[90vh]">
          {/* Left - Images */}
          <div className="bg-gray-50 p-6 lg:p-8 flex flex-col">
            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <div className="relative w-full max-w-md aspect-square">
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-2xl"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#0077be] text-white text-xs font-semibold rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-[#0077be] ring-2 ring-[#0077be]/20' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="p-6 lg:p-8 overflow-y-auto">
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#0077be] font-medium uppercase tracking-wide">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-gray-400">({product.reviews} değerlendirme)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description || 'Profesyonel ambalaj çözümü. Yüksek kaliteli malzemeler ve modern baskı teknolojisiyle üretilmiştir. Gıda güvenliği sertifikalı.'}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.features.map((feature, idx) => (
                <span 
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  <Check className="w-3 h-3 text-[#0077be]" />
                  {feature}
                </span>
              ))}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                  <Ruler className="w-4 h-4 text-gray-400" />
                  Boyut
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedSize === size
                          ? 'border-[#0077be] bg-[#0077be]/10 text-[#0077be]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Selection */}
            {product.materials && product.materials.length > 0 && (
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  Malzeme
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <button
                      key={material}
                      onClick={() => setSelectedMaterial(material)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedMaterial === material
                          ? 'border-[#0077be] bg-[#0077be]/10 text-[#0077be]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-bold text-[#0077be]">
                €{product.price.toFixed(2)}
              </span>
              <span className="text-gray-500 mb-1">/ adet</span>
            </div>

            {/* Minimum Order */}
            <div className="flex items-center gap-2 p-4 bg-[#0077be]/5 rounded-xl mb-6">
              <Info className="w-5 h-5 text-[#0077be]" />
              <span className="text-sm text-gray-700">
                Minimum sipariş: <span className="font-semibold">{product.minOrder} adet</span>
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Miktar:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(-product.minOrder)}
                    disabled={quantity <= product.minOrder}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(product.minOrder)}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  = €{(product.price * quantity).toFixed(2)}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 py-6 font-semibold transition-all ${
                    addedToCart
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-[#0077be] hover:bg-[#005a8f]'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Sepete Eklendi
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {inCart ? 'Sepeti Güncelle' : 'Sepete Ekle'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => toggleWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    minOrder: product.minOrder,
                  })}
                  variant="outline"
                  className={`px-6 ${isWishlisted ? 'border-red-200 text-red-500 bg-red-50' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* View Full Details */}
              <button
                onClick={handleViewFullDetails}
                className="w-full text-center text-[#0077be] hover:underline text-sm"
              >
                Detaylı bilgi görüntüle →
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-[#0077be]" />
                <h4 className="font-semibold text-gray-900">Müşteri Yorumları</h4>
              </div>
              <ProductReviews 
                productId={product.id.toString()} 
                productName={product.name}
              />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                <Truck className="w-6 h-6 text-[#0077be] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Hızlı Teslimat</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-[#0077be] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Güvenli Ödeme</p>
              </div>
              <div className="text-center">
                <Package className="w-6 h-6 text-[#0077be] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Kalite Garantisi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

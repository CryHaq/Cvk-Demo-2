import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Package, Truck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import type { Page } from '@/App';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export default function MiniCart({ isOpen, onClose, onNavigate }: MiniCartProps) {
  const { cart, getCartTotal, getCartCount, updateQuantity, removeFromCart, getItemCount } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  };

  const handleQuantityChange = (id: number, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  const handleCheckout = () => {
    onClose();
    onNavigate('checkout');
  };

  const handleViewCart = () => {
    onClose();
    onNavigate('cart');
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const freeShippingRemaining = Math.max(0, 500 - subtotal);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div 
        ref={cartRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] animate-in slide-in-from-right duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#0077be]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0077be] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alışveriş Sepeti</h2>
              <p className="text-sm text-gray-500">{getItemCount()} ürün ({getCartCount()} adet)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sepetiniz Boş</h3>
              <p className="text-gray-500 mb-6">Ürünleri keşfedin ve sepetinize ekleyin.</p>
              <Button 
                onClick={() => { onClose(); onNavigate('shop'); }}
                className="bg-[#0077be] hover:bg-[#005a8f] text-white"
              >
                Alışverişe Başla
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className={`group flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 ${
                    removingId === item.id ? 'opacity-0 translate-x-full' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    
                    {/* Options */}
                    {item.options && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.options.size && `${item.options.size}`}
                        {item.options.material && ` • ${item.options.material}`}
                      </p>
                    )}
                    
                    {/* Price */}
                    <p className="text-[#0077be] font-semibold mt-1">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -item.minOrder)}
                        disabled={item.quantity <= item.minOrder}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0077be] hover:text-[#0077be] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.minOrder)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0077be] hover:text-[#0077be] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4 bg-gray-50/50">
            {/* Free Shipping Progress */}
            {freeShippingRemaining > 0 ? (
              <div className="p-4 bg-gradient-to-r from-[#0077be]/10 to-[#00a8e8]/10 rounded-xl border border-[#0077be]/20">
                <div className="flex items-center gap-2 text-[#0077be] mb-2">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm font-medium">Ücretsiz Kargo Fırsatı!</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold text-[#0077be]">€{freeShippingRemaining.toFixed(2)}</span> daha harcayın, ücretsiz kargo kazanın!
                </p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">🎉 Tebrikler! Ücretsiz kargo kazandınız!</span>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ara Toplam</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Kargo
                </span>
                <span>{shipping === 0 ? 'Ücretsiz' : `€${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Toplam</span>
                <span className="text-[#0077be]">€{(subtotal + shipping).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-[#0077be] hover:bg-[#005a8f] text-white font-semibold py-6"
              >
                <Package className="w-5 h-5 mr-2" />
                Siparişi Tamamla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={handleViewCart}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Sepeti Görüntüle
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                SSL Güvenli
              </span>
              <span>•</span>
              <span>256-bit Şifreleme</span>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

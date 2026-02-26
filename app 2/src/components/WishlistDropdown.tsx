import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, ShoppingCart, ArrowRight, Trash2, Package } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import type { Page } from '@/App';

interface WishlistDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export default function WishlistDropdown({ isOpen, onClose, onNavigate }: WishlistDropdownProps) {
  const { wishlist, removeFromWishlist, getWishlistCount, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      removeFromWishlist(id);
      setRemovingId(null);
    }, 300);
  };

  const handleMoveToCart = (item: typeof wishlist[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      minOrder: item.minOrder,
    });
    removeFromWishlist(item.id);
  };

  const handleViewWishlist = () => {
    onClose();
    onNavigate('shop');
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-transparent z-[90]"
        onClick={onClose}
      />
      <div 
        ref={dropdownRef}
        className="fixed top-20 right-4 sm:right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[91] animate-in fade-in slide-in-from-top-2 duration-200"
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-transparent">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span className="font-semibold text-gray-900">Favorilerim</span>
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            {getWishlistCount()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              Tümünü Sil
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto">
        {wishlist.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-4">Favori listeniz boş</p>
            <Button 
              onClick={() => { onClose(); onNavigate('shop'); }}
              size="sm"
              className="bg-[#0077be] hover:bg-[#005a8f] text-white"
            >
              Ürünleri Keşfet
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {wishlist.map((item) => (
              <div 
                key={item.id}
                className={`group flex gap-3 p-4 hover:bg-gray-50 transition-all duration-300 ${
                  removingId === item.id ? 'opacity-0 translate-x-full' : ''
                }`}
              >
                {/* Image */}
                <div 
                  onClick={() => { onClose(); onNavigate('shop'); }}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 
                    onClick={() => { onClose(); onNavigate('shop'); }}
                    className="font-medium text-gray-900 truncate cursor-pointer hover:text-[#0077be] transition-colors"
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                  <p className="text-[#0077be] font-semibold">€{item.price.toFixed(2)}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-8 h-8 rounded-lg bg-[#0077be] flex items-center justify-center text-white hover:bg-[#005a8f] transition-colors"
                    title="Sepete Ekle"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {wishlist.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Button 
            onClick={handleViewWishlist}
            variant="outline"
            className="w-full border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Tüm Favorileri Gör
          </Button>
        </div>
      )}
    </div>
    </>,
    document.body
  );
}

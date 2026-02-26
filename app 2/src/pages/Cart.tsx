import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, Truck, Shield, Sparkles, FileText, Clock, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CouponInput from '@/components/CouponInput';
import type { Page } from '../App';

interface CartProps {
  onNavigate: (page: Page) => void;
}

const TRUST_BADGES = [
  { icon: Shield, text: '256-bit SSL Güvenlik' },
  { icon: Truck, text: '500€+ Ücretsiz Kargo' },
  { icon: Clock, text: '7-15 İş Günü Teslimat' },
];

export default function Cart({ onNavigate }: CartProps) {
  const { 
    cart, removeFromCart, updateQuantity, updateNotes, 
    getCartTotal, getCartCount, clearCart,
    appliedCoupon, applyCoupon, removeCoupon, getDiscountAmount, getFinalTotal
  } = useCart();
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const discount = getDiscountAmount();
  const total = getFinalTotal() + shipping;
  const freeShippingRemaining = Math.max(0, 500 - subtotal);

  const handleQuantityChange = (id: number, delta: number, minOrder: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty >= minOrder) {
        updateQuantity(id, newQty);
      }
    }
  };

  const handleSaveNote = (id: number) => {
    updateNotes(id, noteText);
    setEditingNotes(null);
    setNoteText('');
  };

  const handleEditNote = (id: number, currentNote: string = '') => {
    setEditingNotes(id);
    setNoteText(currentNote);
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + 7));
    const maxDate = new Date(today.setDate(today.getDate() + 8));
    return {
      min: minDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
      max: maxDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
    };
  };

  const delivery = getEstimatedDelivery();

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="cvk-container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Alışveriş Sepeti</h1>
              <p className="text-gray-600">{cart.length} ürün ({getCartCount()} adet)</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Sepeti Boşalt
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12">
        <div className="cvk-container">
          {cart.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Sepetinizde henüz ürün bulunmuyor. Ürünleri keşfedin ve sepetinize ekleyin.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={() => onNavigate('shop')} className="cvk-btn-primary font-semibold px-8">
                  Alışverişe Başla
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button onClick={() => onNavigate('configurator')} variant="outline" className="border-[#0077be] text-[#0077be]">
                  Yapılandırıcıya Git
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {TRUST_BADGES.map((badge, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100">
                      <badge.icon className="w-6 h-6 text-[#0077be] mb-2" />
                      <span className="text-xs text-gray-600">{badge.text}</span>
                    </div>
                  ))}
                </div>

                {/* Items */}
                {cart.map((item) => (
                  <div key={item.id} className="p-6 rounded-2xl bg-white border border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Image */}
                      <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Options */}
                        {item.options && (item.options.size || item.options.material) && (
                          <p className="text-sm text-gray-500 mb-3">
                            {item.options.size && `${item.options.size}`}
                            {item.options.size && item.options.material && ' • '}
                            {item.options.material && `${item.options.material}`}
                          </p>
                        )}

                        {/* SKU */}
                        {item.sku && (
                          <p className="text-xs text-gray-400 mb-3">SKU: {item.sku}</p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-gray-600">Miktar:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -item.minOrder, item.minOrder)}
                              disabled={item.quantity <= item.minOrder}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0077be] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-16 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.minOrder, item.minOrder)}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0077be] hover:text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">Min: {item.minOrder}</span>
                        </div>

                        {/* Notes */}
                        {editingNotes === item.id ? (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Ürün notu ekleyin..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0077be] resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveNote(item.id)}
                                className="px-3 py-1 bg-[#0077be] text-white text-sm rounded-lg hover:bg-[#005a8f]"
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="px-3 py-1 text-gray-500 text-sm hover:text-gray-700"
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        ) : item.notes ? (
                          <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                            <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{item.notes}</p>
                              <button
                                onClick={() => handleEditNote(item.id, item.notes)}
                                className="text-xs text-[#0077be] hover:underline mt-1"
                              >
                                Notu Düzenle
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditNote(item.id)}
                            className="mt-3 text-sm text-gray-500 hover:text-[#0077be] flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            Not Ekle
                          </button>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right sm:text-right">
                        <p className="text-xl font-bold text-[#0077be]">€{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">€{item.price.toFixed(2)} / adet</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Coupon */}
                <CouponInput
                  cartTotal={subtotal}
                  appliedCoupon={appliedCoupon}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                />

                {/* Continue Shopping */}
                <button
                  onClick={() => onNavigate('shop')}
                  className="flex items-center gap-2 text-[#0077be] hover:underline"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Alışverişe Devam Et
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white border border-gray-200 sticky top-24">
                  <h3 className="text-gray-900 font-semibold text-lg mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#0077be]" />
                    Sipariş Özeti
                  </h3>

                  {/* Free Shipping Progress */}
                  {freeShippingRemaining > 0 ? (
                    <div className="p-4 bg-gradient-to-r from-[#0077be]/10 to-[#00a8e8]/10 rounded-xl border border-[#0077be]/20 mb-6">
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold text-[#0077be]">€{freeShippingRemaining.toFixed(2)}</span> daha harcayın, ücretsiz kargo kazanın!
                      </p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-full transition-all"
                          style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-6 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">🎉 Ücretsiz kargo kazandınız!</span>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>İndirim</span>
                        <span>-€{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        Kargo
                      </span>
                      <span>{shipping === 0 ? 'Ücretsiz' : `€${shipping.toFixed(2)}`}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between text-gray-900 font-bold text-xl">
                      <span>Toplam</span>
                      <span className="text-[#0077be]">€{total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">KDV dahil</p>
                  </div>

                  {/* Checkout Button */}
                  <Button 
                    onClick={() => onNavigate('checkout')} 
                    className="w-full cvk-btn-primary font-semibold py-6"
                  >
                    Siparişi Tamamla
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  {/* Delivery Estimate */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Clock className="w-4 h-4 text-[#0077be]" />
                      <span className="text-sm font-medium">Tahmini Teslimat</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {delivery.min} - {delivery.max}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4">
                  <h4 className="font-medium text-gray-900 mb-4">Neden CVKDijital?</h4>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#0077be]" />
                    <span className="text-gray-600 text-sm">500€ üzeri ücretsiz kargo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#0077be]" />
                    <span className="text-gray-600 text-sm">7-15 iş günü teslimat</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#0077be]" />
                    <span className="text-gray-600 text-sm">256-bit SSL güvenli ödeme</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#0077be]" />
                    <span className="text-gray-600 text-sm">Türkiye geneli kargo</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

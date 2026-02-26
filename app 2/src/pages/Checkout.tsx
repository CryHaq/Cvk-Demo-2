import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, Truck, Package, ChevronRight,
  MapPin, User, Phone, Building 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CouponInput from '@/components/CouponInput';
import { API_ENDPOINTS, getAuthToken } from '@/lib/api';
import type { Page } from '../App';

interface CheckoutProps {
  onNavigate?: (page: Page) => void;
}

interface AddressForm {
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export default function Checkout({  }: CheckoutProps) {
  const { 
    getCartTotal, getDiscountAmount, getFinalTotal, 
    appliedCoupon, applyCoupon, removeCoupon 
  } = useCart();
  
  const [step, setStep] = useState<'address' | 'review' | 'payment'>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutFormHtml, setCheckoutFormHtml] = useState('');
  const [, setOrderId] = useState<number | null>(null);
  
  const cartTotal = getCartTotal();
  const discount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  
  const [shippingAddress, setShippingAddress] = useState<AddressForm>({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Türkiye'
  });
  
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress] = useState<AddressForm>({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Türkiye'
  });

  // Sepet verilerini al
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cvk_cart_v2');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart || []);
    }
  }, []);

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      
      const orderData = {
        items: cartItems.map(item => ({
          product_type: item.productType || 'Stand-Up Pouch',
          size: item.size,
          dimensions: item.dimensions,
          material: item.material,
          material_spec: item.materialSpec,
          optional_features: item.optionalFeatures,
          corner_type: item.cornerType,
          quantity: item.quantity,
          graphics_count: item.graphicsCount || 1,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          has_zip: item.hasZip || false,
          has_valve: item.hasValve || false
        })),
        subtotal: cartTotal,
        vat_amount: cartTotal * 0.22,
        total_amount: cartTotal * 1.22,
        shipping_address: {
          full_name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          company: shippingAddress.company,
          full_address: shippingAddress.address,
          city: shippingAddress.city,
          zip: shippingAddress.zipCode,
          country: shippingAddress.country
        },
        billing_address: billingSameAsShipping ? {
          full_name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          company: shippingAddress.company,
          full_address: shippingAddress.address,
          city: shippingAddress.city,
          zip: shippingAddress.zipCode,
          country: shippingAddress.country
        } : {
          full_name: billingAddress.fullName,
          phone: billingAddress.phone,
          email: billingAddress.email,
          company: billingAddress.company,
          full_address: billingAddress.address,
          city: billingAddress.city,
          zip: billingAddress.zipCode,
          country: billingAddress.country
        }
      };

      const response = await fetch(API_ENDPOINTS.orders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        setOrderId(result.data.order_id);
        // Ödeme formunu oluştur
        await initiatePayment(result.data.order_id);
      } else {
        alert('Sipariş oluşturulurken hata: ' + result.message);
      }
    } catch (error) {
      alert('Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayment = async (orderId: number) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(API_ENDPOINTS.paymentCheckout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_id: orderId })
      });

      const result = await response.json();

      if (result.success) {
        setCheckoutFormHtml(result.data.checkout_form_content);
        setStep('payment');
        
        // iyzico formunu render et
        setTimeout(() => {
          const script = document.createElement('script');
          script.innerHTML = `
            if (typeof iyziInit === 'function') {
              iyziInit.init();
            }
          `;
          document.body.appendChild(script);
        }, 100);
      } else {
        alert('Ödeme formu oluşturulamadı: ' + result.message);
      }
    } catch (error) {
      alert('Ödeme başlatma hatası');
    }
  };

  const canProceed = () => {
    return shippingAddress.fullName && 
           shippingAddress.phone && 
           shippingAddress.email && 
           shippingAddress.address && 
           shippingAddress.city;
  };

  return (
    <div className="cvk-page pt-24 pb-12">
      <div className="cvk-container">
        <section className="mb-8 rounded-3xl border border-[#0077be]/15 bg-gradient-to-r from-[#0f3057] via-[#0077be] to-[#00a8e8] px-6 py-7 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/80 mb-2">Secure Checkout</p>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Siparişinizi Güvenle Tamamlayın</h1>
              <p className="text-white/85 mt-2">Adres, onay ve ödeme adımları tek akışta.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Truck className="w-4 h-4" />
              <span>Hızlı teslimat planlaması</span>
            </div>
          </div>
        </section>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'address' ? 'bg-[#0077be] text-white' : 'bg-green-100 text-green-700'}`}>
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Adres</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'review' ? 'bg-[#0077be] text-white' : step === 'payment' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Sipariş Özeti</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 'payment' ? 'bg-[#0077be] text-white' : 'bg-gray-200 text-gray-600'}`}>
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Ödeme</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'address' && (
              <div className="cvk-panel p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0077be]" />
                  Teslimat Adresi
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="fullName">Ad Soyad *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                        className="pl-10"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="pl-10"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-posta *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Şirket (Opsiyonel)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="company"
                        value={shippingAddress.company}
                        onChange={(e) => setShippingAddress({...shippingAddress, company: e.target.value})}
                        className="pl-10"
                        placeholder="Şirket adı"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="address">Adres *</Label>
                    <textarea
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#0077be] outline-none resize-none"
                      rows={3}
                      placeholder="Sokak, mahalle, bina no, daire no"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Şehir *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        placeholder="Şehir"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Posta Kodu</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        placeholder="34000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Ülke</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                  <input
                    type="checkbox"
                    id="billingSame"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="w-5 h-5 accent-[#0077be]"
                  />
                  <Label htmlFor="billingSame" className="mb-0 cursor-pointer">
                    Fatura adresim teslimat adresimle aynı
                  </Label>
                </div>

                <Button
                  className="w-full cvk-btn-primary py-6"
                  onClick={() => setStep('review')}
                  disabled={!canProceed()}
                >
                  Devam Et
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 'review' && (
              <div className="cvk-panel p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Sipariş Özeti
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.productType || 'Stand-Up Pouch'} - {item.size}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.material} | {item.quantity} adet
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0077be]">€ {item.totalPrice?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Input */}
                {step === 'review' && (
                  <div className="mb-6">
                    <CouponInput
                      cartTotal={cartTotal}
                      appliedCoupon={appliedCoupon}
                      onApplyCoupon={applyCoupon}
                      onRemoveCoupon={removeCoupon}
                    />
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                    <span>Ara Toplam</span>
                    <span>€ {cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 mb-2">
                      <span>İndirim ({appliedCoupon?.code})</span>
                      <span>-€ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                    <span>KDV (%22)</span>
                    <span>€ {(finalTotal * 0.22).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2">
                    <span>Toplam</span>
                    <span className="text-[#0077be]">€ {(finalTotal * 1.22).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('address')}
                  >
                    Geri
                  </Button>
                  <Button
                    className="flex-1 cvk-btn-primary"
                    onClick={handleCreateOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? 'İşleniyor...' : 'Ödemeye Geç'}
                    <CreditCard className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 'payment' && checkoutFormHtml && (
              <div className="cvk-panel p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0077be]" />
                  Güvenli Ödeme
                </h2>
                
                <div 
                  id="iyzipay-checkout-form"
                  className="iyzipay-checkout-form"
                  dangerouslySetInnerHTML={{ __html: checkoutFormHtml }}
                />
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="cvk-panel p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Sepet Özeti
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Ürünler ({cartItems.length})</span>
                  <span>€ {cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span>-€ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>KDV</span>
                  <span>€ {(finalTotal * 0.22).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Toplam</span>
                  <span className="text-2xl font-bold text-[#0077be]">
                    € {(finalTotal * 1.22).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Güvenli ödeme ile korunmaktadır</p>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                  <Truck className="w-4 h-4" />
                  <span>Ücretsiz Kargo</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  500€ üzeri siparişlerde kargo ücretsiz
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

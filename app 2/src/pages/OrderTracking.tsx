import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Box,
  ChevronRight,
  Home,
  RotateCcw,
} from 'lucide-react';
import { orderApi, type Order } from '@/services/orderApi';
import type { Page } from '../App';

interface OrderTrackingProps {
  onNavigate: (page: Page) => void;
}

interface TimelineStep {
  id: string;
  date: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

const STATUS_FLOW: Array<{ key: Order['status']; title: string; description: string }> = [
  { key: 'pending', title: 'Siparis Alindi', description: 'Siparisiniz basariyla olusturuldu.' },
  { key: 'confirmed', title: 'Odeme Onaylandi', description: 'Odemeniz dogrulandi.' },
  { key: 'processing', title: 'Uretimde', description: 'Urunleriniz uretim asamasinda.' },
  { key: 'shipped', title: 'Kargoya Verildi', description: 'Siparisiniz kargoya teslim edildi.' },
  { key: 'delivered', title: 'Teslim Edildi', description: 'Siparisiniz teslim edildi.' },
];

const statusIndexMap = STATUS_FLOW.reduce<Record<string, number>>((acc, status, index) => {
  acc[status.key] = index;
  return acc;
}, {});

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnly(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildTimeline(order: Order): TimelineStep[] {
  const currentIndex = statusIndexMap[order.status] ?? 0;

  return STATUS_FLOW.map((status, index) => {
    const historyMatch = [...order.status_history]
      .reverse()
      .find((entry) => entry.new_status === status.key);

    const isCompleted = index <= currentIndex;
    const isCurrent = index === currentIndex;

    return {
      id: status.key,
      date: historyMatch
        ? formatDateTime(historyMatch.created_at)
        : isCompleted
        ? formatDateTime(order.updated_at)
        : 'Bekleniyor',
      title: status.title,
      description: status.description,
      completed: isCompleted,
      current: isCurrent,
    };
  });
}

export default function OrderTracking({ onNavigate }: OrderTrackingProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const timeline = useMemo(() => (trackedOrder ? buildTimeline(trackedOrder) : []), [trackedOrder]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');

    const normalizedOrderNo = orderNumber.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedOrderNo || !normalizedEmail) {
      setError('Lutfen siparis numarasi ve e-posta adresi girin.');
      setIsSearching(false);
      return;
    }

    const response = await orderApi.getAllOrders();

    if (!response.success || !response.data?.orders) {
      setError('Siparisler yuklenemedi. Lutfen tekrar deneyin.');
      setIsSearching(false);
      return;
    }

    const matchedOrder = response.data.orders.find((order) => {
      const orderMatch = (order.order_number || '').toUpperCase() === normalizedOrderNo;
      const shippingEmail = (order.shipping_address?.email || '').toLowerCase();
      const billingEmail = (order.billing_address?.email || '').toLowerCase();
      const emailMatch = shippingEmail === normalizedEmail || billingEmail === normalizedEmail;
      return orderMatch && emailMatch;
    });

    if (!matchedOrder) {
      setTrackedOrder(null);
      setError('Siparis bulunamadi. Siparis no ve e-postayi kontrol edin.');
      setIsSearching(false);
      return;
    }

    setTrackedOrder(matchedOrder);
    setIsSearching(false);
  };

  const getStatusIcon = (status: TimelineStep) => {
    if (status.completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (status.current) {
      return <Clock className="w-6 h-6 text-[#0077be] animate-pulse" />;
    }
    return <Box className="w-6 h-6 text-gray-300" />;
  };

  const orderSubtotal = trackedOrder
    ? trackedOrder.items.reduce((sum, item) => sum + item.total_price, 0)
    : 0;

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      <section className="py-16 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="cvk-container text-center">
          <Package className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Siparis Takibi</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Siparisinizin durumunu anlik olarak takip edin. Siparis numarasi ve e-posta adresinizle sorgulama yapabilirsiniz.
          </p>
        </div>
      </section>

      {!trackedOrder && (
        <section className="py-16">
          <div className="max-w-xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Siparis Sorgula</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Siparis Numarasi</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="Orn: CVK-20260225-ABC123"
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">E-posta Adresi</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSearching} className="w-full cvk-btn-primary font-semibold py-6">
                  {isSearching ? (
                    <>
                      <RotateCcw className="mr-2 w-5 h-5 animate-spin" />
                      Sorgulaniyor...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 w-5 h-5" />
                      Siparisi Bul
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center mb-4">Siparis numaranizi bilmiyor musunuz?</p>
                <button onClick={() => onNavigate('contact')} className="w-full text-center text-[#0077be] hover:underline">
                  Musteri Hizmetleri ile Iletisime Gecin
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {trackedOrder && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <button onClick={() => setTrackedOrder(null)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Yeni Sorgulama
            </button>

            <div className="bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-3xl p-8 text-white mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-white/80 mb-1">Siparis Numarasi</p>
                  <h2 className="text-3xl font-bold font-mono">{trackedOrder.order_number}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Siparis Tarihi</p>
                    <p className="font-medium">{formatDateOnly(trackedOrder.created_at)}</p>
                  </div>
                  <div className="w-px h-12 bg-white/30" />
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Son Guncelleme</p>
                    <p className="font-medium">{formatDateOnly(trackedOrder.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">Siparis Durumu</h3>
                  <div className="space-y-0">
                    {timeline.map((status, idx) => (
                      <div key={status.id} className="relative flex gap-4">
                        {idx < timeline.length - 1 && (
                          <div className={`absolute left-3 top-8 w-0.5 h-full ${status.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}

                        <div className="relative z-10 w-6 h-6 mt-1">{getStatusIcon(status)}</div>

                        <div className="pb-8">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${status.completed || status.current ? 'text-gray-900' : 'text-gray-400'}`}>
                              {status.title}
                            </h4>
                            {status.current && (
                              <span className="px-2 py-0.5 bg-[#0077be]/10 text-[#0077be] text-xs font-medium rounded-full">Su An</span>
                            )}
                          </div>
                          <p className={`text-sm mb-1 ${status.completed || status.current ? 'text-gray-600' : 'text-gray-400'}`}>
                            {status.description}
                          </p>
                          <p className="text-xs text-gray-400">{status.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Yardima mi ihtiyaciniz var?</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Siparisinizle ilgili bir sorun varsa destek ekibimiz yardimci olur.
                  </p>
                  <Button onClick={() => onNavigate('contact')} variant="outline" className="cvk-btn-outline">
                    Iletisime Gec
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Siparis Ozeti</h3>

                  <div className="space-y-4 mb-6">
                    {trackedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_type}</p>
                          <p className="text-sm text-gray-500">{item.quantity} adet</p>
                        </div>
                        <p className="font-semibold text-[#0077be]">€{item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Ara Toplam</span>
                      <span>€{orderSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Kargo</span>
                      <span>{trackedOrder.shipping_cost > 0 ? `€${trackedOrder.shipping_cost.toFixed(2)}` : 'Ucretsiz'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-4">
                      <span>KDV</span>
                      <span>€{trackedOrder.vat_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Toplam</span>
                      <span className="text-[#0077be]">€{trackedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Teslimat Bilgileri</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-[#0077be] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Kargo Yontemi</p>
                        <p className="font-medium text-gray-900">{trackedOrder.shipping_company || 'Hazirlaniyor'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#0077be] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Teslimat Adresi</p>
                        <p className="font-medium text-gray-900">{trackedOrder.shipping_address.full_address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-[#0077be] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Kargo Takip No</p>
                        <p className="font-medium text-gray-900 font-mono">{trackedOrder.tracking_number || 'Henuz olusmadi'}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-6 cvk-btn-outline"
                    onClick={() => alert(trackedOrder.tracking_number ? `Takip no: ${trackedOrder.tracking_number}` : 'Takip numarasi henuz olusturulmadi.')}
                  >
                    Kargoyu Takip Et
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => onNavigate('shop')} variant="outline" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Magaza
                  </Button>
                  <Button onClick={() => window.print()} variant="outline" className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Yazdir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sik Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Siparisim ne zaman teslim edilir?',
                a: 'Duruma gore degisir. Siparis takibindeki adimlar en guncel teslimat surecini gosterir.',
              },
              {
                q: 'Siparisimi iptal edebilir miyim?',
                a: 'Uretime gecmeden once destek ekibinden iptal talebi acabilirsiniz.',
              },
              {
                q: 'Kargo takip numarami nerede bulurum?',
                a: 'Siparisiniz shipped oldugunda bu sayfada takip numarasi gorunur.',
              },
              {
                q: 'Hasarli urun gelirse ne yapmaliyim?',
                a: '7 gun icinde destek birimine ulasarak degisim veya iade sureci baslatabilirsiniz.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

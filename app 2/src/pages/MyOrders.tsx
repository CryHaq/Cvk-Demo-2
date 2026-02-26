import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Truck, Check, Clock, X, ChevronRight, 
  Eye, RefreshCw, Download, Search 
} from 'lucide-react';
import { orderApi, type Order } from '../services/orderApi';
import type { Page } from '../App';

interface MyOrdersProps {
  onNavigate: (page: Page) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800', icon: Check },
  processing: { label: 'Üretimde', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Kargoda', color: 'bg-orange-100 text-orange-800', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: X },
  refunded: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800', icon: RefreshCw },
};

export default function MyOrders({ onNavigate }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    const response = await orderApi.getMyOrders();
    if (response.success && response.data) {
      setOrders(response.data);
    }
    setIsLoading(false);
  };

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.product_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-[#0077be] animate-spin" />
            <span>Siparişler yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-24 pb-12">
      <div className="cvk-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Siparişlerim
            </h1>
            <p className="text-gray-500 mt-1">
              Toplam {orders.length} sipariş
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş no veya ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full md:w-80"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Henüz siparişiniz yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk siparişinizi vermek için ürünlerimize göz atın
            </p>
            <Button 
              className="cvk-btn-primary"
              onClick={() => onNavigate('shop')}
            >
              Alışverişe Başla
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white dark:bg-[#1e293b] rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                    selectedOrder?.id === order.id 
                      ? 'border-[#0077be] shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {order.order_number}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0077be]">
                        € {order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} ürün
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 mb-4">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, index) => {
                      const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                      const currentIndex = stepOrder.indexOf(order.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={step} className="flex-1 flex items-center">
                          <div 
                            className={`h-2 flex-1 rounded-full ${
                              isCompleted ? 'bg-[#0077be]' : 'bg-gray-200'
                            }`}
                          />
                          {index < 4 && (
                            <div className={`w-3 h-3 rounded-full ${
                              isCompleted ? 'bg-[#0077be]' : 'bg-gray-200'
                            } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-4">
                    {order.items.slice(0, 3).map((_, idx) => (
                      <div 
                        key={idx}
                        className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                      >
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 font-medium">+{order.items.length - 3}</span>
                      </div>
                    )}
                    
                    <Button variant="ghost" className="ml-auto">
                      <Eye className="w-4 h-4 mr-2" />
                      Detaylar
                    </Button>
                  </div>

                  {/* Tracking Info */}
                  {order.status === 'shipped' && order.tracking_number && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900 dark:text-orange-400">
                            {order.shipping_company}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-orange-900 dark:text-orange-400">
                          {order.tracking_number}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Details Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              {selectedOrder ? (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    Sipariş Detayı
                  </h3>

                  {/* Status */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Durum</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm text-gray-500">Ürünler</p>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {item.product_type} - {item.size}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.material} | {item.quantity} adet
                          </p>
                        </div>
                        <p className="font-bold text-[#0077be]">
                          € {item.total_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Ara Toplam</span>
                      <span>€ {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>KDV</span>
                      <span>€ {selectedOrder.vat_amount.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2">
                        <span>İndirim</span>
                        <span>-€ {selectedOrder.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2">
                      <span>Toplam</span>
                      <span className="text-[#0077be]">€ {selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Teslimat Adresi</p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.shipping_address.full_name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedOrder.shipping_address.full_address}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.zip}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Fatura
                    </Button>
                    {selectedOrder.status === 'delivered' && (
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        İade
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Detayları görüntülemek için bir sipariş seçin
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

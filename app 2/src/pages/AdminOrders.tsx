import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Label } from '@/components/ui/label';
import { 
  Package, Truck, Check, Clock, X, Search, Filter, 
  Eye, RefreshCw, Download, DollarSign, ShoppingBag
} from 'lucide-react';
import { orderApi, type Order } from '../services/orderApi';
import type { Page } from '../App';

interface AdminOrdersProps {
  onNavigate: (page: Page) => void;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Beklemede', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  confirmed: { label: 'Onaylandı', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  processing: { label: 'Üretimde', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  shipped: { label: 'Kargoda', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  delivered: { label: 'Teslim Edildi', color: 'text-green-800', bgColor: 'bg-green-100' },
  cancelled: { label: 'İptal Edildi', color: 'text-red-800', bgColor: 'bg-red-100' },
  refunded: { label: 'İade Edildi', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

export default function AdminOrders({  }: AdminOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [ordersRes, statsRes] = await Promise.all([
      orderApi.getAllOrders(),
      orderApi.getOrderStats()
    ]);
    
    if (ordersRes.success && ordersRes.data) {
      setOrders(ordersRes.data.orders);
    }
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    const response = await orderApi.updateOrderStatus(
      selectedOrder.id, 
      newStatus as any, 
      statusNote
    );

    if (response.success) {
      setShowStatusModal(false);
      setStatusNote('');
      loadData();
      // Refresh selected order
      const orderRes = await orderApi.getOrderDetails(selectedOrder.id);
      if (orderRes.success && orderRes.data) {
        setSelectedOrder(orderRes.data);
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (amount: number) => {
    return `€ ${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-24 pb-12">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-[#0077be] animate-spin" />
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
              Sipariş Yönetimi
            </h1>
            <p className="text-gray-500 mt-1">
              Tüm siparişleri görüntüleyin ve yönetin
            </p>
          </div>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_orders}</p>
                  <p className="text-xs text-gray-500">Toplam Sipariş</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                  <p className="text-xs text-gray-500">Beklemede</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.processing}</p>
                  <p className="text-xs text-gray-500">Üretimde</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.shipped}</p>
                  <p className="text-xs text-gray-500">Kargoda</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
                  <p className="text-xs text-gray-500">Teslim Edildi</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    € {stats.total_revenue?.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500">Toplam Ciro</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Sipariş no, müşteri adı veya e-posta ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="all">Tüm Durumlar</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Sipariş No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ödeme</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Tutar</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.shipping_address.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.shipping_address.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${statusConfig[order.status]?.bgColor} ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                        className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {order.payment_status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Sipariş bulunamadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sipariş Detayı
                </h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sipariş No</p>
                  <p className="font-mono font-bold text-lg">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tarih</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Müşteri Bilgileri</h4>
                <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.shipping_address.email}</p>
                <p className="text-sm text-gray-600">{selectedOrder.shipping_address.phone}</p>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Ürünler</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product_type} - {item.size}</p>
                        <p className="text-sm text-gray-500">{item.material}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.total_price)}</p>
                        <p className="text-sm text-gray-500">{item.quantity} adet</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Durum Geçmişi</h4>
                <div className="space-y-2">
                  {selectedOrder.status_history.map((history, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-[#0077be] rounded-full" />
                      <span className="text-gray-500">{formatDate(history.created_at)}</span>
                      <Badge variant="outline">
                        {statusConfig[history.new_status]?.label || history.new_status}
                      </Badge>
                      {history.note && <span className="text-gray-600">- {history.note}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-[#0077be] hover:bg-[#005a8f]"
                  onClick={() => setShowStatusModal(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Durum Güncelle
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Fatura İndir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Durum Güncelle</h3>
            
            <div className="mb-4">
              <Label>Sipariş Durumu</Label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Durum seçin</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <Label>Not (Opsiyonel)</Label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Durum değişikliği için not ekleyin..."
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowStatusModal(false)}
              >
                İptal
              </Button>
              <Button 
                className="flex-1 bg-[#0077be] hover:bg-[#005a8f]"
                onClick={handleUpdateStatus}
                disabled={!newStatus}
              >
                Güncelle
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

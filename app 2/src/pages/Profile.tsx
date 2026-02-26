import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Package, MapPin, Lock, LogOut, Edit2, CheckCircle, AlertCircle, Loader2, ChevronRight, Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { orderApi, type Order } from '@/services/orderApi';
import type { Page } from '../App';

interface ProfileProps {
  onNavigate: (page: Page) => void;
}

type ProfileTab = 'overview' | 'orders' | 'addresses' | 'settings';

const statusLabelMap: Record<Order['status'], string> = {
  pending: 'Beklemede',
  confirmed: 'Onaylandi',
  processing: 'Uretimde',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'Iptal',
  refunded: 'Iade',
};

export default function Profile({ onNavigate }: ProfileProps) {
  const { user, isAuthenticated, logout, updateProfile, changePassword } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  if (!isAuthenticated) {
    onNavigate('login');
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage('');

    const result = await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      company: profileData.company,
    });

    if (result.success) {
      setSaveMessage('Profil güncellendi.');
      setIsEditing(false);
    } else {
      setSaveMessage(result.message || 'Güncelleme başarısız.');
    }

    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Şifreler eşleşmiyor.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage('');

    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);

    if (result.success) {
      setPasswordMessage('Şifre değiştirildi.');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMessage(result.message || 'Şifre değiştirme başarısız.');
    }

    setIsChangingPassword(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  useEffect(() => {
    const loadOrders = async () => {
      const response = await orderApi.getMyOrders();
      if (response.success && response.data) {
        setUserOrders(response.data);
      }
    };

    loadOrders();
  }, []);

  const menuItems: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: User },
    { id: 'orders', label: 'Siparişlerim', icon: Package },
    { id: 'addresses', label: 'Adreslerim', icon: MapPin },
    { id: 'settings', label: 'Hesap Ayarları', icon: Lock },
  ];

  const quickStats = [
    { label: 'Toplam Sipariş', value: userOrders.length.toString(), icon: ShoppingBag, color: 'bg-[#dff0ff] text-[#0077be]' },
    { label: 'Favoriler', value: getWishlistCount().toString(), icon: Heart, color: 'bg-rose-100 text-rose-600' },
    { label: 'Sepette', value: getCartCount().toString(), icon: Package, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Adres', value: '2', icon: MapPin, color: 'bg-amber-100 text-amber-600' },
  ];

  const recentOrders = useMemo(
    () =>
      [...userOrders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((order) => ({
          id: order.order_number,
          date: new Date(order.created_at).toLocaleDateString('tr-TR'),
          status: statusLabelMap[order.status],
          total: order.total_amount,
          items: order.items.length,
        })),
    [userOrders]
  );

  const addresses = [
    { id: 1, title: 'Ev Adresi', default: true, address: 'Atatürk Cad. No:123', city: 'İstanbul', postalCode: '34000' },
    { id: 2, title: 'İş Adresi', default: false, address: 'Levent Mah. İş Kuleleri', city: 'İstanbul', postalCode: '34330' },
  ];

  const inputClass =
    'w-full cvk-input h-11 rounded-xl border-[#0077be]/15 bg-white/90 px-4 focus:border-[#0077be] focus:ring-0 disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className="cvk-page">
      <section className="pt-10 pb-6">
        <div className="cvk-container">
          <div className="cvk-panel overflow-hidden bg-gradient-to-r from-[#005f95] via-[#0077be] to-[#00a8e8] p-6 sm:p-8 text-white">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#0077be]">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold sm:text-3xl">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="truncate text-sm text-white/85">{user?.email}</p>
                  <p className="text-xs text-white/70">
                    Üyelik: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="h-10 border-white/70 bg-white/5 text-white hover:bg-white/15">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="cvk-container">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1 space-y-6">
              <div className="cvk-panel-subtle p-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors last:mb-0 ${
                      activeTab === item.id ? 'bg-[#0077be] text-white shadow-sm' : 'text-slate-700 hover:bg-[#eaf5fd]'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="cvk-panel-subtle p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1a1a2e]/70">Hızlı İşlemler</h3>
                <div className="mt-3 space-y-1">
                  <button onClick={() => onNavigate('shop')} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-[#f1f8ff]">
                    Alışverişe Başla
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('order-tracking')}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-[#f1f8ff]"
                  >
                    Sipariş Takip
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button onClick={() => onNavigate('contact')} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-[#f1f8ff]">
                    Destek Al
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {quickStats.map((stat, idx) => (
                      <div key={idx} className="cvk-panel-subtle p-5">
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-[#1a1a2e]">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="cvk-panel p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-[#1a1a2e]">Son Siparişlerim</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-sm font-medium text-[#0077be] hover:underline">
                        Tümünü Gör
                      </button>
                    </div>
                    <div className="space-y-3">
                      {recentOrders.length === 0 ? (
                        <p className="rounded-xl border border-[#0077be]/12 bg-[#f8fcff] p-4 text-sm text-slate-500">
                          Henuz siparisiniz bulunmuyor.
                        </p>
                      ) : (
                        recentOrders.map((order) => (
                          <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-[#0077be]/12 bg-[#f8fcff] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-[#1a1a2e]">{order.id}</p>
                              <p className="text-sm text-slate-500">
                                {order.date} • {order.items} urun
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="font-semibold text-[#0077be]">€{order.total.toFixed(2)}</p>
                              <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{order.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="cvk-panel p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-[#1a1a2e]">Profil Bilgileri</h3>
                      <button onClick={() => setActiveTab('settings')} className="inline-flex items-center gap-1 text-sm font-medium text-[#0077be] hover:underline">
                        <Edit2 className="h-4 w-4" />
                        Düzenle
                      </button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Ad Soyad</p>
                        <p className="mt-1 font-medium text-[#1a1a2e]">
                          {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">E-posta</p>
                        <p className="mt-1 font-medium text-[#1a1a2e]">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Telefon</p>
                        <p className="mt-1 font-medium text-[#1a1a2e]">{user?.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Şirket</p>
                        <p className="mt-1 font-medium text-[#1a1a2e]">{user?.company || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="cvk-panel p-6">
                  <h3 className="mb-5 text-lg font-bold text-[#1a1a2e]">Tüm Siparişlerim</h3>
                  <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                      <p className="rounded-xl border border-[#0077be]/12 bg-[#f8fcff] p-4 text-sm text-slate-500">
                        Henuz siparisiniz bulunmuyor.
                      </p>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order.id} className="rounded-xl border border-[#0077be]/12 p-5 transition-shadow hover:shadow-md">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-bold text-[#1a1a2e]">{order.id}</p>
                              <p className="text-sm text-slate-500">{order.date}</p>
                              <p className="text-sm text-slate-500">{order.items} urun</p>
                            </div>
                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                              <div>
                                <p className="text-lg font-bold text-[#0077be]">€{order.total.toFixed(2)}</p>
                                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{order.status}</span>
                              </div>
                              <Button onClick={() => onNavigate('order-tracking')} variant="outline" size="sm" className="cvk-btn-outline">
                                Takip Et
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-7 text-center">
                    <Button onClick={() => onNavigate('shop')} className="cvk-btn-primary h-11 rounded-xl">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Yeni Sipariş Ver
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-bold text-[#1a1a2e]">Kayıtlı Adreslerim</h3>
                    <Button className="cvk-btn-primary h-10 rounded-xl">+ Yeni Adres Ekle</Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`rounded-2xl border p-5 ${addr.default ? 'border-[#0077be]/35 bg-[#f2f9ff]' : 'border-[#0077be]/12 bg-white'}`}>
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#1a1a2e]">{addr.title}</h4>
                            {addr.default && <span className="rounded-full bg-[#0077be] px-2 py-0.5 text-xs text-white">Varsayılan</span>}
                          </div>
                          <button className="text-slate-400 transition-colors hover:text-[#0077be]">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600">{addr.address}</p>
                        <p className="text-sm text-slate-600">
                          {addr.city}, {addr.postalCode}
                        </p>
                        {!addr.default && <button className="mt-4 text-sm font-medium text-[#0077be] hover:underline">Varsayılan Yap</button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="cvk-panel p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-[#1a1a2e]">Profil Bilgileri</h3>
                      {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1 text-sm font-medium text-[#0077be] hover:underline">
                          <Edit2 className="h-4 w-4" />
                          Düzenle
                        </button>
                      )}
                    </div>

                    {saveMessage && (
                      <div
                        className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                          saveMessage.includes('başarısız') ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {saveMessage.includes('başarısız') ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                        {saveMessage}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">Ad</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          disabled={!isEditing}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">Soyad</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          disabled={!isEditing}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">E-posta</label>
                        <input type="email" value={profileData.email} disabled className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">Telefon</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          className={inputClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm text-slate-600">Şirket</label>
                        <input
                          type="text"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          disabled={!isEditing}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Button onClick={() => setIsEditing(false)} variant="outline" className="cvk-btn-outline h-11 rounded-xl">
                          İptal
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="cvk-btn-primary h-11 rounded-xl">
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="cvk-panel p-6">
                    <h3 className="mb-5 text-lg font-bold text-[#1a1a2e]">Şifre Değiştir</h3>

                    {passwordMessage && (
                      <div
                        className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                          passwordMessage.includes('başarısız') || passwordMessage.includes('eşleşmiyor')
                            ? 'border border-red-200 bg-red-50 text-red-700'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {passwordMessage.includes('başarısız') || passwordMessage.includes('eşleşmiyor') ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {passwordMessage}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">Mevcut Şifre</label>
                        <input
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">Yeni Şifre</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-600">Yeni Şifre Tekrar</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} disabled={isChangingPassword} className="mt-6 cvk-btn-primary h-11 rounded-xl">
                      {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Şifreyi Değiştir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

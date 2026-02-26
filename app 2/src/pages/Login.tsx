import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '../App';

interface LoginProps {
  onNavigate: (page: Page) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) {
    onNavigate('home');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    } else {
      setError(result.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }

    setIsLoading(false);
  };

  const inputBase =
    'w-full cvk-input h-12 rounded-xl border-[#0077be]/15 bg-white/90 pl-11 pr-4 focus:border-[#0077be] focus:ring-0';

  return (
    <div className="cvk-page">
      <section className="pt-12 pb-16">
        <div className="cvk-container-lg">
          <div className="cvk-panel overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="relative bg-gradient-to-br from-[#005f95] via-[#0077be] to-[#00a8e8] p-8 sm:p-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.22),transparent_45%)]" />
                <div className="relative z-10">
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                    Hesabınıza Giriş
                  </p>
                  <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">Sipariş, teklif ve favorilerinize tek ekrandan ulaşın.</h1>
                  <p className="mt-4 max-w-md text-white/85">
                    Giriş yaptıktan sonra sipariş sürecinizi izleyebilir, favorilerinizi yönetebilir ve yeni ambalaj projelerinizi hızla başlatabilirsiniz.
                  </p>

                  <div className="mt-8 space-y-3 text-sm">
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <ShieldCheck className="h-4 w-4" />
                      Güvenli hesap ve veri koruması
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <Truck className="h-4 w-4" />
                      Canlı sipariş ve teslimat takibi
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <Sparkles className="h-4 w-4" />
                      Size özel teklif ve kampanyalar
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 sm:p-10">
                {success && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    Giriş başarılı! Yönlendiriliyorsunuz...
                  </div>
                )}

                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">E-posta Adresi</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputBase}
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Şifre</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`${inputBase} pr-11`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="h-4 w-4 accent-[#0077be]"
                      />
                      Beni hatırla
                    </label>
                    <button type="button" onClick={() => onNavigate('forgot-password')} className="text-sm font-medium text-[#0077be] hover:underline">
                      Şifremi unuttum
                    </button>
                  </div>

                  <Button type="submit" disabled={isLoading || success} className="w-full cvk-btn-primary h-12 rounded-xl text-sm font-semibold">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Giriş yapılıyor...
                      </>
                    ) : (
                      <>
                        Giriş Yap
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#0077be]/15" />
                  <span className="text-xs uppercase tracking-[0.1em] text-gray-400">veya</span>
                  <div className="h-px flex-1 bg-[#0077be]/15" />
                </div>

                <Button onClick={() => onNavigate('register')} variant="outline" className="w-full cvk-btn-outline h-12 rounded-xl text-sm font-semibold">
                  Hesap Oluştur
                </Button>

                <p className="mt-5 text-center text-sm text-gray-500">
                  Girişte sorun mu yaşıyorsunuz?{' '}
                  <button onClick={() => onNavigate('contact')} className="font-medium text-[#0077be] hover:underline">
                    Destek alın
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

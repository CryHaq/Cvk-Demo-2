import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Lock, Eye, EyeOff, User, Phone, Building2, AlertCircle, CheckCircle, Loader2, BadgeCheck, Rocket, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '../App';

interface RegisterProps {
  onNavigate: (page: Page) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) {
    onNavigate('home');
    return null;
  }

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      company: formData.company,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
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
              <div className="relative bg-gradient-to-br from-[#0d5a87] via-[#0077be] to-[#00a8e8] p-8 sm:p-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_40%)]" />
                <div className="relative z-10">
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                    Yeni Hesap
                  </p>
                  <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">CVK Dijital müşterilerine özel deneyime katılın.</h1>
                  <p className="mt-4 max-w-md text-white/85">
                    Hesabınızı oluşturun; siparişlerinizi yönetin, önceki çalışmaları tekrar kullanın ve teklif sürecini hızlandırın.
                  </p>

                  <div className="mt-8 space-y-3 text-sm">
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <BadgeCheck className="h-4 w-4" />
                      Ücretsiz üyelik ve hızlı başlangıç
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <Rocket className="h-4 w-4" />
                      Tek tıkla tekrar sipariş kolaylığı
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <Gift className="h-4 w-4" />
                      Kampanya ve fırsatlara erken erişim
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 sm:p-10">
                {success ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
                    <h3 className="text-xl font-bold text-emerald-700">Kayıt Başarılı!</h3>
                    <p className="mt-2 text-sm text-emerald-700/90">
                      Hesabınız oluşturuldu. Giriş yaparak siparişlerinizi hemen başlatabilirsiniz.
                    </p>
                    <Button onClick={() => onNavigate('login')} className="mt-5 cvk-btn-primary h-11 rounded-xl">
                      Giriş Yap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Ad *</label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                            <input
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className={inputBase}
                              placeholder="Adınız"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Soyad *</label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                            <input
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className={inputBase}
                              placeholder="Soyadınız"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">E-posta Adresi *</label>
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
                        <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Telefon</label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputBase}
                            placeholder="+90 5XX XXX XX XX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Şirket (İsteğe bağlı)</label>
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className={inputBase}
                            placeholder="Şirket adı"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Şifre *</label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              minLength={8}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className={`${inputBase} pr-11`}
                              placeholder="En az 8 karakter"
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

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Şifre Tekrar *</label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className={`${inputBase} pr-11`}
                              placeholder="Tekrar girin"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 rounded-xl border border-[#0077be]/10 bg-[#f7fbff] p-4">
                        <label className="flex items-start gap-3 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            required
                            checked={formData.acceptTerms}
                            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                            className="mt-0.5 h-4 w-4 accent-[#0077be]"
                          />
                          <span>
                            <a href="#" className="font-medium text-[#0077be] hover:underline">Kullanım Koşullarını</a> ve{' '}
                            <a href="#" className="font-medium text-[#0077be] hover:underline">Gizlilik Politikasını</a> okudum ve kabul ediyorum. *
                          </span>
                        </label>

                        <label className="flex items-start gap-3 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={formData.newsletter}
                            onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                            className="mt-0.5 h-4 w-4 accent-[#0077be]"
                          />
                          Kampanya ve yeni ürün duyurularını e-posta ile almak istiyorum.
                        </label>
                      </div>

                      <Button type="submit" disabled={isLoading} className="mt-1 h-12 w-full cvk-btn-primary rounded-xl text-sm font-semibold">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Hesap oluşturuluyor...
                          </>
                        ) : (
                          <>
                            Hesap Oluştur
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

                    <Button onClick={() => onNavigate('login')} variant="outline" className="w-full cvk-btn-outline h-12 rounded-xl text-sm font-semibold">
                      Giriş Yap
                    </Button>

                    <p className="mt-5 text-center text-sm text-gray-500">
                      Kayıt olurken sorun mu yaşıyorsunuz?{' '}
                      <button onClick={() => onNavigate('contact')} className="font-medium text-[#0077be] hover:underline">
                        Destek alın
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

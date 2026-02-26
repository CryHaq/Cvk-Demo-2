import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, Lock, Eye, EyeOff, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '../App';

interface ForgotPasswordProps {
  onNavigate: (page: Page) => void;
  resetToken?: string;
}

export default function ForgotPassword({ onNavigate, resetToken }: ForgotPasswordProps) {
  const { forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step] = useState<'request' | 'reset'>(resetToken ? 'reset' : 'request');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setIsLoading(true);

    const result = await resetPassword(resetToken || '', newPassword);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Şifre değiştirme başarısız. Lütfen tekrar deneyin.');
    }

    setIsLoading(false);
  };

  const inputBase =
    'w-full cvk-input h-12 rounded-xl border-[#0077be]/15 bg-white/90 pl-11 pr-4 focus:border-[#0077be] focus:ring-0';

  return (
    <div className="cvk-page">
      <section className="pt-12 pb-16">
        <div className="cvk-container-md">
          <div className="cvk-panel overflow-hidden">
            <div className="grid lg:grid-cols-[1.05fr_1fr]">
              <div className="relative bg-gradient-to-br from-[#0d5a87] via-[#0077be] to-[#00a8e8] p-8 sm:p-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.22),transparent_42%)]" />
                <div className="relative z-10">
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                    Hesap Güvenliği
                  </p>
                  <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                    {step === 'request' ? 'Şifrenizi sıfırlayın.' : 'Yeni şifrenizi oluşturun.'}
                  </h1>
                  <p className="mt-4 max-w-md text-white/85">
                    {step === 'request'
                      ? 'E-posta adresinizi girin, sıfırlama bağlantısını anında gönderelim.'
                      : 'Güvenli bir yeni şifre belirleyin ve hesabınıza geri dönün.'}
                  </p>

                  <div className="mt-8 space-y-3 text-sm">
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <KeyRound className="h-4 w-4" />
                      Tek kullanımlık güvenli sıfırlama bağlantısı
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                      <Shield className="h-4 w-4" />
                      Hesap verileriniz korunur
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 sm:p-10">
                <button onClick={() => onNavigate('login')} className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="h-4 w-4" />
                  Girişe Dön
                </button>

                {success && step === 'request' && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
                    <h3 className="text-xl font-bold text-emerald-700">Bağlantı Gönderildi!</h3>
                    <p className="mt-2 text-sm text-emerald-700/90">
                      Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                    </p>
                    <Button onClick={() => onNavigate('login')} className="mt-5 cvk-btn-primary h-11 rounded-xl">
                      Giriş Sayfasına Dön
                    </Button>
                  </div>
                )}

                {success && step === 'reset' && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
                    <h3 className="text-xl font-bold text-emerald-700">Şifre Değiştirildi!</h3>
                    <p className="mt-2 text-sm text-emerald-700/90">
                      Yeni şifreniz kaydedildi, şimdi hesabınıza giriş yapabilirsiniz.
                    </p>
                    <Button onClick={() => onNavigate('login')} className="mt-5 cvk-btn-primary h-11 rounded-xl">
                      Giriş Yap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {!success && step === 'request' && (
                  <>
                    {error && (
                      <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleRequestReset} className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">E-posta Adresi</label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputBase}
                            placeholder="ornek@email.com"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Kayıtlı e-posta adresinizi girin, sıfırlama linki gönderelim.</p>
                      </div>

                      <Button type="submit" disabled={isLoading} className="h-12 w-full cvk-btn-primary rounded-xl text-sm font-semibold">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            Sıfırlama Bağlantısı Gönder
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-500">
                      Şifrenizi hatırladınız mı?{' '}
                      <button onClick={() => onNavigate('login')} className="font-medium text-[#0077be] hover:underline">
                        Giriş yapın
                      </button>
                    </p>
                  </>
                )}

                {!success && step === 'reset' && (
                  <>
                    {error && (
                      <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Yeni Şifre</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                        <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Yeni Şifre Tekrar</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputBase}
                            placeholder="Şifrenizi tekrar girin"
                          />
                        </div>
                      </div>

                      <Button type="submit" disabled={isLoading} className="h-12 w-full cvk-btn-primary rounded-xl text-sm font-semibold">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Değiştiriliyor...
                          </>
                        ) : (
                          <>
                            Şifreyi Değiştir
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}

                {!success && (
                  <p className="mt-5 text-center text-sm text-gray-500">
                    Yardıma mı ihtiyacınız var?{' '}
                    <button onClick={() => onNavigate('contact')} className="font-medium text-[#0077be] hover:underline">
                      Destek alın
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

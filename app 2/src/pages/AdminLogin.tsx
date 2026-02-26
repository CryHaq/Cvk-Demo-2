import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { USER_STORAGE_KEY, clearAuthStorage } from '@/lib/api';
import type { Page } from '@/App';

interface AdminLoginProps {
  onNavigate: (page: Page) => void;
}

const ADMIN_REMEMBER_EMAIL_KEY = 'cvk_admin_remember_email';
const ADMIN_LOGIN_ATTEMPT_KEY = 'cvk_admin_login_attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

interface LoginAttemptState {
  failCount: number;
  lockUntil: number;
}

function getAttemptState(): LoginAttemptState {
  try {
    const raw = localStorage.getItem(ADMIN_LOGIN_ATTEMPT_KEY);
    if (!raw) return { failCount: 0, lockUntil: 0 };
    const parsed = JSON.parse(raw) as LoginAttemptState;
    return {
      failCount: Number(parsed.failCount) || 0,
      lockUntil: Number(parsed.lockUntil) || 0,
    };
  } catch {
    return { failCount: 0, lockUntil: 0 };
  }
}

function setAttemptState(next: LoginAttemptState): void {
  localStorage.setItem(ADMIN_LOGIN_ATTEMPT_KEY, JSON.stringify(next));
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { login, isAuthenticated, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(ADMIN_REMEMBER_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    const attempts = getAttemptState();
    setFailCount(attempts.failCount);
    setLockUntil(attempts.lockUntil);
  }, []);

  useEffect(() => {
    if (lockUntil <= Date.now()) return;
    const timer = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [lockUntil]);

  const isLocked = lockUntil > nowTs;
  const remainingSeconds = Math.max(0, Math.ceil((lockUntil - nowTs) / 1000));
  const remainingText = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [remainingSeconds]);

  const registerFailedAttempt = (message: string) => {
    const current = getAttemptState();
    const nextFailCount = current.failCount + 1;

    if (nextFailCount >= MAX_LOGIN_ATTEMPTS) {
      const nextLockUntil = Date.now() + LOCK_DURATION_MS;
      const next = { failCount: 0, lockUntil: nextLockUntil };
      setAttemptState(next);
      setFailCount(next.failCount);
      setLockUntil(next.lockUntil);
      setError('Cok fazla hatali deneme. Giris gecici olarak kilitlendi (5 dakika).');
      return;
    }

    const next = { failCount: nextFailCount, lockUntil: 0 };
    setAttemptState(next);
    setFailCount(next.failCount);
    setLockUntil(next.lockUntil);
    setError(`${message} Kalan deneme: ${MAX_LOGIN_ATTEMPTS - nextFailCount}`);
  };

  const clearAttemptState = () => {
    const next = { failCount: 0, lockUntil: 0 };
    setAttemptState(next);
    setFailCount(0);
    setLockUntil(0);
  };

  if (isAuthenticated && user?.role === 'admin') {
    onNavigate('admin');
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (isLocked) {
      setError(`Giris gecici olarak kilitli. Lutfen ${remainingText} sonra tekrar deneyin.`);
      return;
    }

    setIsLoading(true);

    const result = await login(email.trim(), password);

    if (!result.success) {
      registerFailedAttempt(result.message || 'Giris basarisiz.');
      setIsLoading(false);
      return;
    }

    let role = '';
    try {
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      role = parsedUser?.role || '';
    } catch {
      role = '';
    }

    if (role !== 'admin') {
      logout();
      clearAuthStorage();
      registerFailedAttempt('Bu paneli sadece admin kullanicilar gorebilir.');
      setIsLoading(false);
      return;
    }

    clearAttemptState();
    if (rememberMe) {
      localStorage.setItem(ADMIN_REMEMBER_EMAIL_KEY, email.trim());
    } else {
      localStorage.removeItem(ADMIN_REMEMBER_EMAIL_KEY);
    }

    setIsLoading(false);
    onNavigate('admin');
  };

  return (
    <div className="min-h-screen bg-[#0b1220] px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#101a2f] shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] lg:grid-cols-2">
          <div className="relative bg-gradient-to-br from-[#005f95] via-[#0077be] to-[#00a8e8] p-8 text-white sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_42%)]" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                CVK Admin
              </p>
              <h1 className="mt-5 text-3xl font-bold leading-tight">Yonetim paneline guvenli giris</h1>
              <p className="mt-4 text-sm text-white/85">
                Dashboard, urun, stok ve kampanya yonetimini tek bir panelden yonetin.
              </p>

              <div className="mt-8 space-y-3 text-sm">
                <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2">
                  <ShieldCheck className="h-4 w-4" />
                  Rol bazli erisim kontrolu
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2">
                  <ShieldCheck className="h-4 w-4" />
                  Islem ve rapor ekranlari
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-10">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Admin Girisi</h2>
            <p className="mt-1 text-sm text-slate-500">Yetkili hesabinizla devam edin.</p>

            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {isLocked && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Guvenlik kilidi aktif. Kalan sure: <span className="font-semibold">{remainingText}</span>
              </div>
            )}
            {!isLocked && failCount > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Guvenlik denemesi: {failCount}/{MAX_LOGIN_ATTEMPTS}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">E-posta</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#0077be]/20 bg-white pl-11 pr-4 focus:border-[#0077be] focus:outline-none"
                    placeholder="admin@cvk.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">Sifre</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0077be]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#0077be]/20 bg-white pl-11 pr-11 focus:border-[#0077be] focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#0077be]"
                />
                Beni hatirla (admin e-posta)
              </label>

              <Button type="submit" disabled={isLoading || isLocked} className="h-11 w-full bg-[#0077be] text-white hover:bg-[#005a8f] disabled:bg-slate-400">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giris kontrol ediliyor...
                  </>
                ) : (
                  <>
                    Admin Panele Gir
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <Button variant="outline" className="w-full" onClick={() => onNavigate('home')}>
                Siteye Don
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

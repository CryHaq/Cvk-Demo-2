import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { 
  X, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, 
  Loader2, ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '@/App';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export default function LoginModal({ isOpen, onClose, onNavigate }: LoginModalProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', password: '', rememberMe: false });
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }

    setIsLoading(false);
  };

  const handleRegisterClick = () => {
    onClose();
    onNavigate('register');
  };

  const handleForgotPassword = () => {
    onClose();
    onNavigate('forgot-password');
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[111] p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-8 pb-0">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yap</h2>
            <p className="text-gray-500">Hesabınıza giriş yaparak devam edin</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Giriş başarılı! Yönlendiriliyorsunuz...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20 transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:border-[#0077be] focus:outline-none focus:ring-2 focus:ring-[#0077be]/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 accent-[#0077be] rounded"
                  />
                  <span className="text-gray-600 text-sm">Beni hatırla</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#0077be] text-sm hover:underline"
                >
                  Şifremi unuttum
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-[#0077be] hover:bg-[#005a8f] text-white font-semibold py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">veya</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600 mb-3 text-sm">Hesabınız yok mu?</p>
              <Button
                onClick={handleRegisterClick}
                variant="outline"
                className="w-full border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white"
              >
                Hesap Oluştur
              </Button>
            </div>

            {/* Help */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                Giriş yaparken sorun mu yaşıyorsunuz?{' '}
                <button 
                  onClick={() => { onClose(); onNavigate('contact'); }} 
                  className="text-[#0077be] hover:underline"
                >
                  Destek alın
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

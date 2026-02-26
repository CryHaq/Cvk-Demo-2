import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Check, Gift, X, Loader2, Sparkles } from 'lucide-react';
import { newsletterApi } from '../services/newsletterApi';

interface NewsletterProps {
  variant?: 'inline' | 'card' | 'popup' | 'footer';
  onClose?: () => void;
}

export default function Newsletter({ variant = 'card', onClose }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [preferences, setPreferences] = useState({
    promotions: true,
    newProducts: true,
    blogUpdates: false,
    designTips: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await newsletterApi.subscribe(email, firstName, preferences);

    if (result.success) {
      setIsSuccess(true);
      setEmail('');
      setFirstName('');
    } else {
      setError(result.message || 'Bir hata oluştu');
    }

    setIsLoading(false);
  };

  const content = {
    inline: {
      container: 'flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-r from-[#0077be]/10 to-[#00a8e8]/10 rounded-xl',
      title: 'text-lg font-semibold text-gray-900',
      description: 'text-sm text-gray-600',
      input: 'flex-1 px-4 py-2 border border-gray-200 rounded-lg',
      button: 'px-6 py-2 bg-[#0077be] text-white rounded-lg hover:bg-[#005a8f]',
    },
    card: {
      container: 'p-8 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-2xl text-white',
      title: 'text-2xl font-bold',
      description: 'text-white/80',
      input: 'w-full px-4 py-3 rounded-xl text-gray-900',
      button: 'w-full px-6 py-3 bg-white text-[#0077be] rounded-xl font-semibold hover:bg-gray-100',
    },
    popup: {
      container: 'relative p-8 bg-white rounded-2xl shadow-2xl max-w-md w-full',
      title: 'text-2xl font-bold text-gray-900',
      description: 'text-gray-600',
      input: 'w-full px-4 py-3 border border-gray-200 rounded-xl',
      button: 'w-full px-6 py-3 bg-[#0077be] text-white rounded-xl font-semibold hover:bg-[#005a8f]',
    },
    footer: {
      container: 'w-full',
      title: 'text-lg font-semibold text-white mb-2',
      description: 'text-gray-400 text-sm mb-4',
      input: 'flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400',
      button: 'px-4 py-2 bg-[#0077be] text-white rounded-lg hover:bg-[#005a8f]',
    },
  };

  const style = content[variant];

  if (isSuccess) {
    return (
      <div className={style.container}>
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-600">Başarıyla abone oldunuz!</p>
            <p className="text-sm text-gray-500">E-posta adresinizi kontrol edin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      {/* Close button for popup */}
      {variant === 'popup' && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className={variant === 'inline' ? '' : 'text-center mb-6'}>
        {variant === 'card' && (
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
        )}
        
        {variant === 'popup' && (
          <div className="w-16 h-16 bg-[#0077be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-[#0077be]" />
          </div>
        )}

        <h3 className={style.title}>
          {variant === 'card' ? 'Bültenimize Abone Olun' : 
           variant === 'popup' ? 'Özel Fırsatları Kaçırmayın!' :
           'E-posta Bülteni'}
        </h3>
        
        <p className={`${style.description} ${variant === 'inline' ? '' : 'mt-2'}`}>
          {variant === 'popup' 
            ? 'Abone olun ve ilk siparişinize %10 indirim kazanın!' 
            : 'Yeni ürünler, kampanyalar ve tasarım ipuçları için abone olun.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={variant === 'inline' ? 'flex-1 flex gap-3' : 'space-y-4'}>
        {variant !== 'inline' && (
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Adınız (opsiyonel)"
            className={style.input}
          />
        )}
        
        <div className={variant === 'inline' ? 'flex-1 flex gap-3' : 'flex gap-3'}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className={style.input}
          />
          
          <Button
            type="submit"
            disabled={isLoading}
            className={style.button}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : variant === 'footer' ? (
              <Mail className="w-5 h-5" />
            ) : (
              'Abone Ol'
            )}
          </Button>
        </div>
      </form>

      {/* Preferences Toggle */}
      {variant !== 'inline' && variant !== 'footer' && (
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="mt-4 text-sm text-[#0077be] hover:underline"
        >
          Tercihleri {showPreferences ? 'gizle' : 'göster'}
        </button>
      )}

      {/* Preferences */}
      {(showPreferences || variant === 'footer') && variant !== 'inline' && (
        <div className={`mt-4 space-y-2 ${variant === 'card' ? 'text-white/80' : 'text-gray-600'}`}>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.promotions}
              onChange={(e) => setPreferences({ ...preferences, promotions: e.target.checked })}
              className="w-4 h-4 accent-[#0077be]"
            />
            <span className="text-sm">Kampanya ve indirimler</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.newProducts}
              onChange={(e) => setPreferences({ ...preferences, newProducts: e.target.checked })}
              className="w-4 h-4 accent-[#0077be]"
            />
            <span className="text-sm">Yeni ürünler</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.designTips}
              onChange={(e) => setPreferences({ ...preferences, designTips: e.target.checked })}
              className="w-4 h-4 accent-[#0077be]"
            />
            <span className="text-sm">Tasarım ipuçları</span>
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Trust badges for popup */}
      {variant === 'popup' && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              %10 İndirim
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              İstediğiniz zaman çıkabilirsiniz
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

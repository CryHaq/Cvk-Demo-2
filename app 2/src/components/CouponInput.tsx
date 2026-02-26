import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { couponApi, type AppliedCoupon } from '../services/couponApi';

interface CouponInputProps {
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
}

export default function CouponInput({
  cartTotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await couponApi.validateCoupon(code.trim(), cartTotal);

    if (result.success && result.coupon) {
      setSuccess(true);
      onApplyCoupon(result.coupon);
      setCode('');
    } else {
      setError(result.message || 'Kupon uygulanamadı');
    }

    setIsLoading(false);
  };

  const handleRemove = () => {
    onRemoveCoupon();
    setCode('');
    setError(null);
    setSuccess(false);
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-900 dark:text-green-400">
                {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-700 dark:text-green-500">
                {appliedCoupon.type === 'percentage' 
                  ? `%${appliedCoupon.value} indirim uygulandı`
                  : `€${appliedCoupon.value} indirim uygulandı`
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-400">
            İndirim: <span className="font-bold">-€ {appliedCoupon.discountAmount.toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        İndirim Kodu
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder="Kupon kodunuzu girin"
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="bg-[#0077be] hover:bg-[#005a8f] text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Uygula'
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Available Coupons Hint */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 mb-2">Örnek kupon kodları:</p>
        <div className="flex flex-wrap gap-2">
          {['HOSGELDIN10', 'VIP20', 'SABIT50'].map((c) => (
            <button
              key={c}
              onClick={() => setCode(c)}
              className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:border-[#0077be] transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

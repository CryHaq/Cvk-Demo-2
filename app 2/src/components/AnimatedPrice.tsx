import { useEffect, useState, useRef } from 'react';

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export function AnimatedPrice({ 
  value, 
  prefix = '€', 
  suffix = '', 
  decimals = 2, 
  className = '',
  duration = 500 
}: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();
    
    // Önceki animasyonu iptal et
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing fonksiyonu (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);
  const [integerPart, decimalPart] = formattedValue.split('.');

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span className="text-sm mr-1 opacity-70">{prefix}</span>}
      <span className="tabular-nums">
        {integerPart}
        {decimals > 0 && (
          <span className="text-sm opacity-70">.{decimalPart}</span>
        )}
      </span>
      {suffix && <span className="text-sm ml-1 opacity-70">{suffix}</span>}
    </span>
  );
}

// Fiyat değişim göstergesi
export function PriceChange({ 
  previousPrice, 
  currentPrice 
}: { 
  previousPrice: number; 
  currentPrice: number; 
}) {
  const diff = currentPrice - previousPrice;
  const percentChange = ((diff / previousPrice) * 100);
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;

  if (Math.abs(diff) < 0.01) return null;

  return (
    <span 
      className={`inline-flex items-center text-sm font-medium ${
        isIncrease ? 'text-orange-500' : 'text-green-500'
      }`}
    >
      <span className="mr-1">
        {isIncrease ? '↑' : isDecrease ? '↓' : '→'}
      </span>
      {Math.abs(percentChange).toFixed(1)}%
      <span className="ml-1 text-xs opacity-70">
        ({isIncrease ? '+' : ''}{diff.toFixed(2)}€)
      </span>
    </span>
  );
}

// Birim fiyat grafiği (basit bar chart)
export function UnitPriceChart({ 
  quantities, 
  basePrices, 
  selectedQuantity 
}: { 
  quantities: number[]; 
  basePrices: Record<number, number>; 
  selectedQuantity: number;
}) {
  const maxPrice = Math.max(...Object.values(basePrices));
  const minPrice = Math.min(...Object.values(basePrices));
  
  // Son 5 miktarı göster
  const displayQuantities = quantities.slice(-5);

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Birim Fiyat Analizi</h4>
      <div className="flex items-end gap-2 h-24">
        {displayQuantities.map((qty) => {
          const unitPrice = basePrices[qty] / qty;
          const height = ((maxPrice - unitPrice) / (maxPrice - minPrice)) * 100;
          const isSelected = qty === selectedQuantity;
          
          return (
            <div key={qty} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t transition-all duration-300 ${
                  isSelected ? 'bg-[#0077be]' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={{ height: `${Math.max(height, 20)}%` }}
              />
              <span className={`text-xs mt-1 ${isSelected ? 'font-semibold text-[#0077be]' : 'text-gray-500'}`}>
                {qty}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        Daha yüksek miktar = Daha düşük birim fiyat
      </p>
    </div>
  );
}

// İndirim rozetleri
export function DiscountBadges({ quantity }: { quantity: number }) {
  const badges = [];
  
  if (quantity >= 500) badges.push({ label: '%5 İndirim', color: 'bg-green-100 text-green-700' });
  if (quantity >= 1000) badges.push({ label: '%10 İndirim', color: 'bg-blue-100 text-blue-700' });
  if (quantity >= 2500) badges.push({ label: '%15 İndirim', color: 'bg-purple-100 text-purple-700' });
  if (quantity >= 5000) badges.push({ label: 'Toplu Fiyat', color: 'bg-orange-100 text-orange-700' });
  
  if (badges.length === 0) {
    const nextMilestone = quantity < 500 ? 500 : quantity < 1000 ? 1000 : 2500;
    const remaining = nextMilestone - quantity;
    return (
      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-sm text-orange-700">
          <span className="font-semibold">{remaining} adet</span> daha ekle, 
          <span className="font-semibold"> %5 indirim</span> kazan!
        </p>
        <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${(quantity / nextMilestone) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map((badge, idx) => (
        <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}

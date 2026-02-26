import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, Info } from 'lucide-react';
import type { Page } from '../App';

const sizes = [
  { id: '8x13', name: '8x13 cm', basePrice: 0.45 },
  { id: '10x15', name: '10x15 cm', basePrice: 0.52 },
  { id: '12x18', name: '12x18 cm', basePrice: 0.58 },
  { id: '14x20', name: '14x20 cm', basePrice: 0.65 },
  { id: '16x22', name: '16x22 cm', basePrice: 0.72 },
];

const materials = [
  { id: 'alu', name: 'Alüminyum Bariyer', multiplier: 1 },
  { id: 'kraft', name: 'Kraft Kağıt', multiplier: 1.1 },
  { id: 'recyclable', name: 'Geri Dönüştürülebilir', multiplier: 1.2 },
];

const quantities = [100, 250, 500, 1000, 2000, 3000, 5000];

interface PricingCalculatorProps {
  onNavigate: (page: Page) => void;
}

export default function PricingCalculator({ onNavigate }: PricingCalculatorProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[1]);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(500);

  const calculatePrice = () => {
    const basePrice = selectedSize.basePrice * selectedMaterial.multiplier;
    let quantityDiscount = 1;
    
    if (selectedQuantity >= 5000) quantityDiscount = 0.75;
    else if (selectedQuantity >= 3000) quantityDiscount = 0.80;
    else if (selectedQuantity >= 2000) quantityDiscount = 0.85;
    else if (selectedQuantity >= 1000) quantityDiscount = 0.90;
    else if (selectedQuantity >= 500) quantityDiscount = 0.95;
    
    const unitPrice = basePrice * quantityDiscount;
    const total = unitPrice * selectedQuantity;
    const vat = total * 0.22;
    
    return { unitPrice, total, vat, grandTotal: total + vat };
  };

  const { unitPrice, total, vat, grandTotal } = calculatePrice();

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#f0f7fc] via-[#e8f4fc] to-[#d4ebf7]">
        <div className="cvk-container text-center">
          <Calculator className="w-16 h-16 text-[#0077be] mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a2e] mb-6">
            Fiyat <span className="text-[#0077be]">Hesaplayıcı</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            İhtiyacınıza uygun fiyatı hesaplayın. Minimum sipariş miktarı yok.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 lg:py-24">
        <div className="cvk-container-md">
          <div className="cvk-panel p-8">
            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-[#1a1a2e] font-semibold mb-4">Boyut Seçin</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedSize.id === size.id
                        ? 'border-[#0077be] bg-[#f0f7fc] text-[#0077be]'
                        : 'border-gray-200 hover:border-[#0077be]'
                    }`}
                  >
                    <span className="font-medium">{size.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div className="mb-8">
              <label className="block text-[#1a1a2e] font-semibold mb-4">Malzeme Seçin</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMaterial.id === material.id
                        ? 'border-[#0077be] bg-[#f0f7fc] text-[#0077be]'
                        : 'border-gray-200 hover:border-[#0077be]'
                    }`}
                  >
                    <span className="font-medium">{material.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-8">
              <label className="block text-[#1a1a2e] font-semibold mb-4">Miktar</label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {quantities.map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSelectedQuantity(qty)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedQuantity === qty
                        ? 'border-[#0077be] bg-[#f0f7fc] text-[#0077be]'
                        : 'border-gray-200 hover:border-[#0077be]'
                    }`}
                  >
                    <span className="font-medium">{qty}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-[#f0f7fc] rounded-xl p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Birim Fiyat</span>
                  <span>€ {unitPrice.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Toplam</span>
                  <span>€ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>KDV (%22)</span>
                  <span>€ {vat.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-[#1a1a2e]">
                  <span className="font-semibold text-lg">Genel Toplam</span>
                  <span className="text-2xl font-bold text-[#0077be]">€ {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                onClick={() => onNavigate('configurator')} 
                className="flex-1 cvk-btn-primary font-semibold py-6"
              >
                Bu Konfigürasyonla Devam Et
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
              <Info className="w-4 h-4" />
              <span>Fiyatlar tahmini olup, nihai fiyat sipariş sırasında belirlenir.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

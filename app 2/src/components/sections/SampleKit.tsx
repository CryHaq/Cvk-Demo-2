import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Check } from 'lucide-react';

const features = [
  '12 Formati',
  '10 Materiali',
];

export default function SampleKit() {
  const [formData, setFormData] = useState({
    azienda: '',
    mercato: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Grazie per il tuo interesse! Ti contatteremo presto.');
  };

  return (
    <section className="w-full bg-[#16162a] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7cb342]/20 rounded-full">
              <Package className="w-5 h-5 text-[#7cb342]" />
              <span className="text-[#7cb342] font-medium">Campionario</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Acquista il campionario a 5€
            </h2>

            <div className="flex items-baseline gap-3">
              <span className="text-white/50 line-through text-lg">
                9,90€
              </span>
              <span className="text-4xl font-bold text-[#7cb342]">
                5,00€
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white/80"
                >
                  <Check className="w-5 h-5 text-[#7cb342]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Azienda"
                  value={formData.azienda}
                  onChange={(e) =>
                    setFormData({ ...formData, azienda: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#7cb342]"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Mercato"
                  value={formData.mercato}
                  onChange={(e) =>
                    setFormData({ ...formData, mercato: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#7cb342]"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#7cb342]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#7cb342] hover:bg-[#6a9e38] text-white font-semibold py-6"
              >
                Acquista il campionario a 5€
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

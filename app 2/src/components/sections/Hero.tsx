import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full bg-[#1a1a2e] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[#7cb342] font-medium text-lg">
                CVK Dijital – Pack your way
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Il primo e-commerce dedicato al{' '}
                <span className="text-[#7cb342]">packaging flessibile personalizzato</span>
              </h1>
            </div>
            
            <p className="text-lg text-white/70 leading-relaxed">
              CVK Dijital è oggi il punto di riferimento in tutta Europa per la produzione di{' '}
              <strong className="text-white">packaging flessibile personalizzato</strong>,
              come <strong className="text-white">buste e sacchetti</strong>.
            </p>

            <Button
              size="lg"
              className="bg-[#7cb342] hover:bg-[#6a9e38] text-white font-semibold px-8 py-6 text-lg group"
            >
              Personalizza la tua busta
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Content - Product Images Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Main large image */}
              <div className="col-span-2 relative">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2a2a4e] to-[#1a1a2e] border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                    alt="Custom packaging bags"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Smaller images */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#2a2a4e] to-[#1a1a2e] border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80"
                  alt="Product packaging"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#2a2a4e] to-[#1a1a2e] border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80"
                  alt="Flexible packaging"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#7cb342]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#7c4dff]/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#7cb342]/5 to-transparent pointer-events-none" />
    </section>
  );
}

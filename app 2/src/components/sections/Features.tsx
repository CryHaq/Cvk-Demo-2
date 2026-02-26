import { Ruler, Shield, Palette } from 'lucide-react';

const features = [
  {
    icon: Ruler,
    title: 'Ampia scelta',
    description: '12 Dimensioni diverse',
  },
  {
    icon: Shield,
    title: 'Per tutti i mercati',
    description: '10 Materiali disponibili',
  },
  {
    icon: Palette,
    title: 'Creatività senza limiti',
    description: 'Fino a 20 grafiche differenti in un ordine',
  },
];

export default function Features() {
  return (
    <section className="w-full bg-[#1a1a2e] py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#7cb342]/30 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#7cb342]/20 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-[#7cb342]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

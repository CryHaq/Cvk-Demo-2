import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    category: 'Cosmetico',
    title: "Italy's leading destination for beauty products.",
    description:
      'Scopri il packaging beauty Pinalli: le buste flessibili personalizzate CVK Dijital esaltano la brand identity e aumentano la desiderabilità del prodotto.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    color: 'from-pink-500/20 to-purple-500/20',
  },
  {
    category: 'Integratori',
    title: 'A natural energy boost with NaturVeg',
    description:
      'Integratori e proteine 100% vegani per supportare il fabbisogno vitaminico giornaliero, potenziare l\'energia durante l\'attività fisica e favorire un\'alimentazione equilibrata nei programmi di controllo del peso.',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&q=80',
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    category: 'Accessori',
    title: 'From Pack to Peak with Chalk Rebels',
    description:
      'Nessuno conosce l\'importanza dell\'attrito meglio di chi vive la parete ogni giorno: per questo Chalk Rebels ha sviluppato prodotti che garantiscono grip massimo e protezione per chi vuole dominare ogni salita con sicurezza.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80',
    color: 'from-orange-500/20 to-red-500/20',
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-[#1a1a2e] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
          Scopri le storie dei nostri testimonial
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#7cb342]/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={testimonial.image}
                  alt={testimonial.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${testimonial.color} opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#7cb342] text-white text-xs font-semibold rounded-full">
                    {testimonial.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-3">
                  {testimonial.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  {testimonial.description}
                </p>
                <Button
                  variant="ghost"
                  className="text-[#7cb342] hover:text-[#9ccc65] hover:bg-[#7cb342]/10 p-0 h-auto font-medium group/btn"
                >
                  Scopri di più
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

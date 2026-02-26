import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Page } from '../App';

const testimonials = [
  {
    id: 1,
    company: 'Pinalli',
    industry: 'Kozmetik',
    logo: '💄',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    quote: 'CVKDijital ile çalışmaya başladığımızdan beri ürünlerimizin ambalajı tamamen değişti. Müşterilerimiz ambalajın kalitesini ve estetiğini sürekli takdir ediyor. Satışlarımızda %25 artış gözlemledik.',
    author: 'Giulia Bianchi',
    role: 'Marka Müdürü',
    stats: [
      { value: '%25', label: 'Satış Artışı' },
      { value: '500K', label: 'Üretilen Poşet' },
      { value: '3 Yıl', label: 'Ortaklık' },
    ],
  },
  {
    id: 2,
    company: 'NaturVeg',
    industry: 'Takviyeler',
    logo: '🌿',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80',
    quote: 'Vegan takviyelerimiz için doğal ve sürdürülebilir ambalaj arayışındaydık. CVKDijital hem çevre dostu çözümler sundu hem de marka kimliğimizi mükemmel şekilde yansıttı.',
    author: 'Marco Rossi',
    role: 'Kurucu & CEO',
    stats: [
      { value: '%40', label: 'Marka Bilinirliği' },
      { value: '1M+', label: 'Poşet' },
      { value: '2 Yıl', label: 'Ortaklık' },
    ],
  },
  {
    id: 3,
    company: 'Chalk Rebels',
    industry: 'Spor Aksesuarları',
    logo: '🧗',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    quote: 'Tırmanış tebeşirimiz için dayanıklı ve pratik ambalaj çözümlerine ihtiyacımız vardı. CVKDijital ekibi sektörümüzün ihtiyaçlarını anladı ve mükemmel sonuçlar sundu.',
    author: 'Luca Ferrari',
    role: 'Ürün Müdürü',
    stats: [
      { value: '%30', label: 'Müşteri Memnuniyeti' },
      { value: '200K', label: 'Poşet' },
      { value: '1.5 Yıl', label: 'Ortaklık' },
    ],
  },
];

const allTestimonials = [
  { company: 'BioFoods', industry: 'Organik Gıda', quote: 'Organik ürünlerimiz için mükemmel ambalaj çözümleri.', author: 'Anna M.', rating: 5 },
  { company: 'FitProtein', industry: 'Spor Gıdaları', quote: 'Hızlı teslimat ve kaliteli baskı.', author: 'Davide L.', rating: 5 },
  { company: 'TeaMaster', industry: 'Çay', quote: 'Fermuarlı poşetler çok pratik.', author: 'Sofia R.', rating: 5 },
  { company: 'PetCare', industry: 'Evcil Hayvan', quote: 'Köpek mamaları için ideal ambalaj.', author: 'Roberto C.', rating: 4 },
  { company: 'BeautyLab', industry: 'Kozmetik', quote: 'Lüks görünümlü ambalajlar.', author: 'Elena G.', rating: 5 },
  { company: 'CoffeeRoast', industry: 'Kahve', quote: 'Koku koruması mükemmel.', author: 'Francesco P.', rating: 5 },
];

interface TestimonialsProps {
  onNavigate: (page: Page) => void;
}

export default function TestimonialsPage({ onNavigate }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const active = testimonials[activeIndex];

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="cvk-container relative text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Müşteri <span className="text-white/90">Hikayeleri</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Bizi tercih eden markaların başarı hikayelerini keşfedin. CVKDijital ile büyüyen işletmeler.
          </p>
        </div>
      </section>

      {/* Featured Testimonial */}
      <section className="py-16">
        <div className="cvk-container">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="grid lg:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[4/3] lg:aspect-auto">
                <img src={active.image} alt={active.company} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/80 lg:bg-gradient-to-l" />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-[#0077be] text-white text-sm font-semibold rounded-full">{active.industry}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{active.logo}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{active.company}</h2>
                    <p className="text-[#0077be]">{active.industry}</p>
                  </div>
                </div>

                <Quote className="w-12 h-12 text-[#0077be]/30 mb-4" />

                <p className="text-gray-700 text-lg leading-relaxed mb-8">{active.quote}</p>

                <div className="border-t border-gray-200 pt-6 mb-8">
                  <p className="text-gray-900 font-semibold">{active.author}</p>
                  <p className="text-gray-500">{active.role}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {active.stats.map((stat, idx) => (
                    <div key={idx} className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-[#0077be]">{stat.value}</p>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4 mt-8">
                  <button onClick={prevTestimonial} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0077be] hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-colors ${idx === activeIndex ? 'bg-[#0077be]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                  <button onClick={nextTestimonial} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0077be] hover:text-white transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Testimonials Grid */}
      <section className="py-24 bg-white border-y border-gray-200">
        <div className="cvk-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Daha Fazla Yorum</h2>
            <p className="text-gray-600">Müşterilerimizin deneyimleri</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTestimonials.map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0077be]/30 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-gray-900 font-semibold">{t.company}</h4>
                    <p className="text-[#0077be] text-sm">{t.industry}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">"{t.quote}"</p>
                <p className="text-gray-500 text-sm mt-4">- {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Siz de Başarı Hikayesi Olun</h2>
          <p className="text-white/80 text-lg mb-8">Markanız için en uygun ambalaj çözümünü birlikte bulalım.</p>
          <Button size="lg" onClick={() => onNavigate('contact')} className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold px-10 py-6 text-lg">
            Ücretsiz Teklif Al<ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

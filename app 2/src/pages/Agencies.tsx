import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Users, Zap, BadgeCheck, ArrowUpRight, Layers, Globe, TrendingUp, Handshake, Sparkles, Check, Quote } from 'lucide-react';
import type { Page } from '../App';

interface AgenciesProps {
  onNavigate: (page: Page) => void;
}

const partnershipBenefits = [
  {
    icon: Palette,
    title: 'Beyaz Etiket Çözümleri',
    description: 'Müşterilerinizin ambalajlarını kendi markanız altında tasarlayın ve teslim edin. CVKDijital arka planda kalır.',
  },
  {
    icon: Zap,
    title: 'Hızlı Prototipleme',
    description: '3 gün içinde numune üretimi. Müşterilerinize hızlı dönüş yapın ve projeleri kazanın.',
  },
  {
    icon: BadgeCheck,
    title: 'Kalite Garantisi',
    description: 'Tüm üretimlerimizde kalite garantisi. Problem durumunda ücretsiz yeniden üretim.',
  },
  {
    icon: Layers,
    title: 'API Entegrasyonu',
    description: 'Kendi sisteminizden doğrudan sipariş verin, takip edin ve raporlayın. Tam entegrasyon desteği.',
  },
  {
    icon: Globe,
    title: 'Global Lojistik',
    description: 'Dünya geneline teslimat. Müşterileriniz nerede olursa olsun, ambalajları ulaştırıyoruz.',
  },
  {
    icon: TrendingUp,
    title: 'Rekabetçi Komisyon',
    description: 'Cazip komisyon oranları ve hacim bazlı artan getiriler. Ne kadar çok sipariş, o kadar çok kazanç.',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Başvuru Yapın',
    description: 'Ajans ortaklık formunu doldurun. Ekibimiz 24 saat içinde size ulaşsın.',
  },
  {
    step: '2',
    title: 'Onboarding',
    description: 'API dokümantasyonu, tasarım şablonları ve eğitim materyallerine erişim sağlayın.',
  },
  {
    step: '3',
    title: 'Sipariş Alın',
    description: 'Müşterilerinizden siparişleri alın ve beyaz etiket sistemimiz üzerinden bize iletin.',
  },
  {
    step: '4',
    title: 'Kazanın',
    description: 'Her siparişte komisyon kazanın. Aylık otomatik ödemelerle kazancınızı alın.',
  },
];

const commissionTiers = [
  { volume: '0 - 10K', commission: '%15', description: 'Balangıç seviyesi' },
  { volume: '10K - 50K', commission: '%20', description: 'Büyüyen ajanslar' },
  { volume: '50K - 100K', commission: '%25', description: 'Profesyonel ajanslar' },
  { volume: '100K+', commission: '%30', description: 'Enterprise partnerler' },
];

const testimonials = [
  {
    name: 'Can Yılmaz',
    role: 'Kreatif Direktör',
    company: 'Pixelmark Agency',
    avatar: 'CY',
    quote: 'CVKDijital ile çalışmaya başladıktan sonra ambalaj tasarımı hizmetlerimizin kar marjı %40 arttı. Müşterilerimiz kaliteden çok memnun.',
  },
  {
    name: 'Selin Kaya',
    role: 'Founder',
    company: 'Brand Studio',
    avatar: 'SK',
    quote: 'Beyaz etiket çözümleri sayesinde kendi markamız altında premium ambalaj hizmeti sunabiliyoruz. Teknik altyapıyı düşünmeden tasarıma odaklanıyoruz.',
  },
];

const tools = [
  'Özel Tasarım Portalı',
  'API & Webhook Entegrasyonu',
  'Beyaz Etiket Müşteri Paneli',
  'Otomatik Fiyat Teklifi Sistemi',
  'Sipariş Takip Dashboard',
  'Fatura ve Raporlama Sistemi',
];

export default function Agencies({ onNavigate }: AgenciesProps) {
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#0077be]/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="cvk-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
                <Handshake className="w-4 h-4" />
                Ajans Ortaklık Programı
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Tasarım Gücünüze <span className="text-[#00a8e8]">Üretim</span> Ekleyin
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Ambalaj tasarımı yapan ajanslar için özel geliştirilmiş beyaz etiket çözümleri. 
                Müşterilerinize kendi markanız altında premium ambalaj hizmeti sunun.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => onNavigate('contact')} 
                  size="lg"
                  className="cvk-btn-primary font-semibold px-8"
                >
                  Ortaklık Başvurusu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => onNavigate('contact')} 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Detaylı Bilgi
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-[#0077be] rounded-3xl opacity-30 blur-2xl" />
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80" 
                  alt="Ajans Ortaklığı" 
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="cvk-container">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {[
              { value: '150+', label: 'Ortak Ajans' },
              { value: '%40', label: 'Ortalama Kar Marjı' },
              { value: '3 Gün', label: 'Numune Süresi' },
              { value: '24/7', label: 'Teknik Destek' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl font-bold text-[#0077be]">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Ajans Ortağı Olun?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tasarım gücünüze üretim kapasitesi ekleyin, müşterilerinize komple çözümler sunun
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnershipBenefits.map((benefit, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-purple-200 transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-[#0077be]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-[#0077be]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
            <p className="text-gray-600">4 basit adımda ajans ortağı olun ve kazanmaya başlayın</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#0077be] to-[#00a8e8] flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-24">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kazanç Planı</h2>
            <p className="text-gray-600">Ne kadar çok sipariş, o kadar çok kazanç</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {commissionTiers.map((tier, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredTier(idx)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`p-8 rounded-2xl border-2 transition-all cursor-pointer ${
                  hoveredTier === idx 
                    ? 'border-[#0077be] shadow-xl scale-105 bg-white' 
                    : 'border-gray-200 bg-white/50'
                }`}
              >
                <p className="text-sm text-gray-500 mb-2">Aylık Hacim</p>
                <p className="text-lg font-bold text-gray-900 mb-4">€{tier.volume}</p>
                <div className="w-16 h-1 bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-full mb-4" />
                <p className="text-4xl font-bold text-[#0077be] mb-2">{tier.commission}</p>
                <p className="text-sm text-gray-600">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools & Integration */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-[#1a1a2e] text-white">
        <div className="cvk-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[#00a8e8] text-sm font-medium mb-6">
                <Layers className="w-4 h-4" />
                Teknik Altyapı
              </div>
              <h2 className="text-3xl font-bold mb-6">Size Özel Araçlar</h2>
              <p className="text-gray-300 text-lg mb-8">
                Ajans ortaklarımıza özel geliştirilmiş araçlar ile iş süreçlerinizi 
                hızlandırın ve müşterilerinize profesyonel deneyim sunun.
              </p>
              <ul className="space-y-4">
                {tools.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0077be] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => onNavigate('contact')}
                className="mt-8 bg-[#0077be] hover:bg-[#005a8f]"
              >
                API Dokümantasyonu
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#0077be] to-purple-500 rounded-3xl opacity-20 blur-2xl" />
              <div className="relative bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Sipariş Durumu</p>
                      <p className="font-medium">Üretimde - %75 Tamamlandı</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Aylık Komisyon</p>
                      <p className="font-medium">€12,450 (+23%)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Aktif Müşteriler</p>
                      <p className="font-medium">48 Müşteri</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ortaklarımız Ne Diyor?</h2>
            <p className="text-gray-600">CVKDijital ile büyüyen ajansların hikayeleri</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0077be] to-[#00a8e8] flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-sm text-[#0077be]">{testimonial.company}</p>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#0077be]/10" />
                  <p className="text-gray-600 italic pl-6">{testimonial.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-[#0077be]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-12 h-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ajansınızı Bir Üst Seviyeye Taşıyın
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Hemen başvurun, 24 saat içinde uzman ekibimiz size ulaşsın.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => onNavigate('contact')} 
              size="lg"
              className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold px-8"
            >
              Ücretsiz Başvuru Yap
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => onNavigate('configurator')} 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Ürünleri İncele
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

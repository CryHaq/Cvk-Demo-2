import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, TrendingUp, Shield, Clock, Users, Package, Check, Star, Briefcase, Zap, Award, ChevronRight, Quote } from 'lucide-react';
import type { Page } from '../App';

interface CompaniesProps {
  onNavigate: (page: Page) => void;
}

const benefits = [
  {
    icon: TrendingUp,
    title: 'Ölçeklenebilir Üretim',
    description: 'İhtiyacınıza göre esnek sipariş miktarları. 100 adetten başlayarak büyük hacimli üretimlere kadar.',
  },
  {
    icon: Shield,
    title: 'Kalite Garantisi',
    description: 'ISO 9001 ve GMP sertifikalı üretim tesislerimizde en yüksek kalite standartları.',
  },
  {
    icon: Clock,
    title: 'Hızlı Teslimat',
    description: '7-15 iş günü içinde teslimat. Acil siparişler için express üretim seçenekleri.',
  },
  {
    icon: Users,
    title: 'Özel Hesap Yöneticisi',
    description: 'Kurumsal müşterilerimize adanmış hesap yöneticisi ve 7/24 destek.',
  },
  {
    icon: Package,
    title: 'Stok Yönetimi',
    description: 'Just-in-time teslimat ve stok depolama hizmetleri ile tedarik zincirinizi optimize edin.',
  },
  {
    icon: Zap,
    title: 'Hızlı Prototipleme',
    description: 'Yeni ürün lansmanları için hızlı numune üretimi ve prototipleme hizmetleri.',
  },
];

const caseStudies = [
  {
    company: 'NutriLife Supplements',
    industry: 'Gıda Takviyeleri',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
    result: '%40 Maliyet Tasarrufu',
    quote: 'CVKDijital ile çalışmaya başladıktan sonra ambalaj maliyetlerimizde %40 tasarruf sağladık. Kalite standartlarımızdan ödün vermeden daha rekabetçi fiyatlar sunabiliyoruz.',
    stats: [
      { label: 'Yıllık Sipariş', value: '500K+' },
      { label: 'Teslimat Süresi', value: '-30%' },
      { label: 'Müşteri Memnuniyeti', value: '98%' },
    ],
  },
  {
    company: 'Green Organics',
    industry: 'Organik Gıda',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    result: '3 Yeni Ürün Lansmanı',
    quote: 'Hızlı prototipleme ve esnek minimum sipariş miktarları sayesinde yeni ürünlerimizi pazara çok daha hızlı sunabiliyoruz.',
    stats: [
      { label: 'Yeni Ürün', value: '3' },
      { label: 'Pazara Süresi', value: '-50%' },
      { label: 'Tazelik Süresi', value: '+25%' },
    ],
  },
];

const features = [
  'Özel baskı ve tasarım hizmetleri',
  'ERP sistemi entegrasyonu',
  'Aylık fatura ve ödeme koşulları',
  'Toplu sipariş indirimleri',
  'Kalite kontrol raporları',
  'Sürdürülebilir ambalaj seçenekleri',
  'Depolama ve lojistik desteği',
  '7/24 teknik destek',
];

const plans = [
  {
    name: 'Startup',
    description: 'Küçük ölçekli işletmeler için',
    minOrder: '500 adet',
    benefits: ['Standart teslimat', 'E-posta desteği', 'Online sipariş takibi'],
    discount: '0%',
  },
  {
    name: 'Business',
    description: 'Büyüyen markalar için',
    minOrder: '5,000 adet',
    benefits: ['Öncelikli üretim', 'Telefon desteği', 'Özel hesap yöneticisi', 'Aylık faturalama'],
    discount: '%10',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Kurumsal çözümler',
    minOrder: '50,000+ adet',
    benefits: ['Express üretim', '7/24 destek', 'Tam entegrasyon', 'Stok yönetimi', 'Özel fiyatlandırma'],
    discount: 'Özel',
  },
];

export default function Companies({ onNavigate }: CompaniesProps) {
  const [activeTab, setActiveTab] = useState<'benefits' | 'cases' | 'plans'>('benefits');

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#0077be]/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="cvk-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077be]/20 rounded-full text-[#00a8e8] text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                Kurumsal Çözümler
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                İşletmeniz için <span className="text-[#00a8e8]">Özel Ambalaj</span> Çözümleri
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Ölçeğiniz ne olursa olsun, markanızı büyütmenize yardımcı olacak esnek, 
                ölçeklenebilir ve ekonomik ambalaj çözümleri sunuyoruz.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => onNavigate('contact')} 
                  size="lg"
                  className="cvk-btn-primary font-semibold px-8"
                >
                  Kurumsal Teklif Al
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
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-3xl opacity-30 blur-2xl" />
                <img 
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80" 
                  alt="Kurumsal Ambalaj Çözümleri" 
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="cvk-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Kurumsal Müşteri' },
              { value: '10M+', label: 'Yıllık Üretim' },
              { value: '99.2%', label: 'Teslimat Başarısı' },
              { value: '24h', label: 'En Hızlı Teslimat' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-[#0077be] mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white sticky top-16 z-30 border-b border-gray-200">
        <div className="cvk-container">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'benefits', label: 'Avantajlar', icon: Award },
              { id: 'cases', label: 'Başarı Hikayeleri', icon: Briefcase },
              { id: 'plans', label: 'Planlar', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0077be] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="cvk-container">
          {/* Benefits Tab */}
          {activeTab === 'benefits' && (
            <div className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden CVKDijital?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  İşletmenizin ambalaj ihtiyaçlarını karşılamak için tasarlanmış kapsamlı çözümler
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#0077be]/20 transition-all group">
                    <div className="w-14 h-14 rounded-xl bg-[#0077be]/10 flex items-center justify-center mb-6 group-hover:bg-[#0077be] transition-colors">
                      <benefit.icon className="w-7 h-7 text-[#0077be] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
              </div>

              {/* Features List */}
              <div className="bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-3xl p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-6">Kurumsal Özellikler</h3>
                    <p className="text-white/80 text-lg mb-8">
                      İşletmenizin büyümesini destekleyecek tüm özelliklere sahibiz.
                    </p>
                    <Button 
                      onClick={() => onNavigate('contact')}
                      className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold"
                    >
                      Detaylı Bilgi Al
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-white">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case Studies Tab */}
          {activeTab === 'cases' && (
            <div className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Başarı Hikayeleri</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Müşterilerimizin CVKDijital ile nasıl büyüdüklerini keşfedin
                </p>
              </div>

              <div className="space-y-12">
                {caseStudies.map((study, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                    <div className="grid lg:grid-cols-2">
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[#0077be] font-medium mb-4">
                          <Building2 className="w-4 h-4" />
                          {study.industry}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{study.company}</h3>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6 w-fit">
                          <TrendingUp className="w-4 h-4" />
                          {study.result}
                        </div>
                        <div className="relative mb-8">
                          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#0077be]/20" />
                          <p className="text-gray-600 italic pl-6">{study.quote}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {study.stats.map((stat, sIdx) => (
                            <div key={sIdx} className="text-center p-4 bg-gray-50 rounded-xl">
                              <p className="text-2xl font-bold text-[#0077be]">{stat.value}</p>
                              <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="relative h-64 lg:h-auto">
                        <img 
                          src={study.image} 
                          alt={study.company}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-l" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Kurumsal Planlar</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  İşletmenizin büyüklüğüne ve ihtiyaçlarına uygun esnek çözümler
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                  <div 
                    key={idx} 
                    className={`relative p-8 rounded-3xl border transition-all ${
                      plan.popular 
                        ? 'bg-[#0077be] text-white border-[#0077be] shadow-xl scale-105' 
                        : 'bg-white border-gray-200 hover:border-[#0077be]/30 hover:shadow-lg'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
                        En Popüler
                      </div>
                    )}
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-6 ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-[#0077be]'}`}>
                        {plan.discount}
                      </span>
                      <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>
                        {' '}indirim
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl mb-6 ${plan.popular ? 'bg-white/10' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>Minimum Sipariş</p>
                      <p className={`font-semibold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.minOrder}</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-3">
                          <Check className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-[#0077be]'}`} />
                          <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => onNavigate('contact')}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-white text-[#0077be] hover:bg-gray-100' 
                          : 'bg-[#0077be] text-white hover:bg-[#005a8f]'
                      }`}
                    >
                      İletişime Geç
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            İşletmenize Özel Teklif Alın
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Uzman ekibimiz size en uygun çözümü sunmak için hazır. 
            Hemen iletişime geçin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => onNavigate('contact')} 
              size="lg"
              className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold px-8"
            >
              Teklif İste
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => onNavigate('free-sample')} 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Ücretsiz Numune Talep Et
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, Truck, BadgeDollarSign, Headphones, Check, Star, Package, Users, Clock, Shield, ChevronRight, Calculator } from 'lucide-react';
import type { Page } from '../App';

interface ResellersProps {
  onNavigate: (page: Page) => void;
}

const benefits = [
  {
    icon: BadgeDollarSign,
    title: 'Rekabetçi Toptan Fiyatlar',
    description: 'Perakende fiyatlarına göre %40\'a varan indirimler. Ne kadar çok alırsanız, o kadar çok kazanırsınız.',
    highlight: '%40\'a varan',
  },
  {
    icon: Truck,
    title: 'Ücretsiz Kargo',
    description: 'Tüm toptan siparişlerde Türkiye geneli ücretsiz kargo. Minimum sipariş şartı yok.',
    highlight: 'Ücretsiz',
  },
  {
    icon: Package,
    title: 'Stoksuz Satış',
    description: 'Dropshipping desteği ile stok tutmadan satış yapın. Biz depolayalım, biz gönderelim.',
    highlight: 'Dropship',
  },
  {
    icon: Headphones,
    title: 'Özel Destek Hattı',
    description: 'Bayilerimize özel 7/24 telefon ve WhatsApp destek hattı. Sorularınızı anında yanıtlıyoruz.',
    highlight: '7/24',
  },
  {
    icon: Store,
    title: 'Mağaza Materyalleri',
    description: 'Ücretsiz kataloglar, bannerlar, ürün görselleri ve satış destek materyalleri.',
    highlight: 'Ücretsiz',
  },
  {
    icon: Shield,
    title: 'Garanti ve İade',
    description: 'Tüm ürünlerde 30 gün iade garantisi. Kalite sorunlarında koşulsuz değişim.',
    highlight: '30 Gün',
  },
];

const requirements = [
  'Ticari işletme veya şirket olma şartı',
  'Minimum ilk sipariş: €1,000',
  'Geçerli vergi numarası',
  'Ambalaj veya ilgili sektörde faaliyet',
];

const pricingTiers = [
  {
    name: 'Bronz Bayi',
    minOrder: '€1,000 - €5,000',
    discount: '%25',
    features: ['Toptan fiyatlar', 'Ücretsiz kargo', 'E-posta desteği', 'Aylık katalog'],
    color: 'from-amber-600 to-amber-700',
  },
  {
    name: 'Gümüş Bayi',
    minOrder: '€5,000 - €20,000',
    discount: '%35',
    features: ['Daha iyi fiyatlar', 'Öncelikli kargo', 'Telefon desteği', 'Haftalık stok raporu', 'Özel indirimler'],
    popular: true,
    color: 'from-gray-400 to-gray-500',
  },
  {
    name: 'Altın Bayi',
    minOrder: '€20,000+',
    discount: '%45',
    features: ['En iyi fiyatlar', 'Express kargo', '7/24 destek', 'Stok yönetimi', 'Özel üretim', 'API erişimi'],
    color: 'from-yellow-400 to-yellow-600',
  },
];

const applicationSteps = [
  {
    step: '1',
    title: 'Online Başvuru',
    description: 'Aşağıdaki formu doldurarak bayi başvurunuzu yapın.',
    icon: Users,
  },
  {
    step: '2',
    title: 'İnceleme',
    description: 'Ekibimiz 48 saat içinde başvurunuzu değerlendirir.',
    icon: Clock,
  },
  {
    step: '3',
    title: 'Onay ve Sözleşme',
    description: 'Onaylanan başvurular için bayi sözleşmesi imzalanır.',
    icon: Check,
  },
  {
    step: '4',
    title: 'İlk Sipariş',
    description: 'Hemen sipariş vermeye başlayın ve kazanmaya başlayın.',
    icon: Package,
  },
];

const faqs = [
  {
    question: 'Bayi olmak için fiziksel mağaza şart mı?',
    answer: 'Hayır, fiziksel mağaza şartı yok. E-ticaret siteniz, sosyal medya satışlarınız veya B2B satış kanallarınız olabilir. Önemli olan düzenli sipariş potansiyeliniz.',
  },
  {
    question: 'Dropshipping yapabilir miyim?',
    answer: 'Evet! Gümüş ve Altın bayilerimize dropshipping hizmeti sunuyoruz. Siparişleri müşterilerinize biz gönderiyoruz, siz sadece kârınızı alıyorsunuz.',
  },
  {
    question: 'Ödeme koşulları nelerdir?',
    answer: 'Bronz bayilerde peşin ödeme, Gümüş bayilerde 15 gün vadeli, Altın bayilerde 30 gün vadeli ödeme imkanı sunuyoruz.',
  },
  {
    question: 'İade politikası nasıl işliyor?',
    answer: 'Tüm bayilerimiz 30 gün içinde hasarlı veya kalitesiz ürünleri koşulsuz iade edebilir. İade kargo ücretleri tarafımızdan karşılanır.',
  },
];

export default function Resellers({ onNavigate }: ResellersProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    businessType: '',
    monthlyVolume: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
                <Store className="w-4 h-4" />
                Bayi Programı
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                CVKDijital <span className="text-[#00a8e8]">Bayisi</span> Olun
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Kaliteli ambalaj ürünlerini toptan fiyatlarla satın alın, 
                kendi müşterilerinize karla satın. Stoksuz satış ve dropshipping desteği ile 
                risk almadan kazanın.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })} 
                  size="lg"
                  className="cvk-btn-primary font-semibold px-8"
                >
                  Hemen Başvur
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => onNavigate('pricing-calculator')} 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Calculator className="mr-2 w-4 h-4" />
                  Fiyat Hesapla
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-3xl opacity-30 blur-2xl" />
                <img 
                  src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&q=80" 
                  alt="Bayi Programı" 
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="cvk-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '200+', label: 'Aktif Bayi' },
              { value: '%40', label: 'Maksimum İndirim' },
              { value: '81', label: 'Şehir' },
              { value: '30', label: 'Gün İade Garantisi' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold text-[#0077be]">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bayi Avantajları</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              CVKDijital bayisi olarak sahip olacağınız tüm avantajlar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#0077be]/20 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-[#0077be]/10 flex items-center justify-center group-hover:bg-[#0077be] transition-colors">
                    <benefit.icon className="w-7 h-7 text-[#0077be] group-hover:text-white transition-colors" />
                  </div>
                  <span className="px-3 py-1 bg-[#0077be]/10 text-[#0077be] text-xs font-bold rounded-full">
                    {benefit.highlight}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 bg-white">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bayi Seviyeleri</h2>
            <p className="text-gray-600">Satış hacminize göre artan indirimler ve avantajlar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`relative p-8 rounded-3xl border-2 transition-all ${
                  tier.popular 
                    ? 'border-[#0077be] shadow-xl scale-105 bg-white' 
                    : 'border-gray-200 hover:border-[#0077be]/30'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0077be] text-white text-sm font-bold rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    En Popüler
                  </div>
                )}
                
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${tier.color} mb-8`} />
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{tier.minOrder} / ay</p>
                
                <div className="mb-8">
                  <span className="text-5xl font-bold text-[#0077be]">{tier.discount}</span>
                  <span className="text-gray-500"> indirim</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`w-full ${
                    tier.popular 
                      ? 'cvk-btn-primary' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Başvuru Yap
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="cvk-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Başvuru Süreci</h2>
            <p className="text-gray-600">4 adımda CVKDijital bayisi olun</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {applicationSteps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#0077be] to-[#00a8e8] flex items-center justify-center mb-6 shadow-lg">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0077be]/10 text-[#0077be] font-bold text-sm mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-24">
        <div className="cvk-container-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-[#0077be] to-[#00a8e8] text-white">
              <h2 className="text-2xl font-bold mb-2">Bayi Başvuru Formu</h2>
              <p className="text-white/80">Başvurunuz 48 saat içinde değerlendirilecektir.</p>
            </div>

            <div className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Başvurunuz Alındı!</h3>
                  <p className="text-gray-600 mb-6">
                    Başvurunuz başarıyla gönderildi. Ekibimiz 48 saat içinde sizinle iletişime geçecektir.
                  </p>
                  <Button onClick={() => onNavigate('home')} className="bg-[#0077be] hover:bg-[#005a8f]">
                    Ana Sayfaya Dön
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Şirket Adı *</label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                        placeholder="Şirketinizin adı"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Yetkili Adı *</label>
                      <input
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                        placeholder="Ad Soyad"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">E-posta *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                        placeholder="ornek@sirket.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Telefon *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Şehir *</label>
                      <select
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      >
                        <option value="">Şehir Seçin</option>
                        <option value="istanbul">İstanbul</option>
                        <option value="ankara">Ankara</option>
                        <option value="izmir">İzmir</option>
                        <option value="antalya">Antalya</option>
                        <option value="bursa">Bursa</option>
                        <option value="diger">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">İşletme Türü *</label>
                      <select
                        required
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      >
                        <option value="">Seçin</option>
                        <option value="retail">Perakende Satış</option>
                        <option value="wholesale">Toptan Satış</option>
                        <option value="ecommerce">E-ticaret</option>
                        <option value="marketplace">Pazaryeri Satıcısı</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tahmini Aylık Hacim</label>
                    <select
                      value={formData.monthlyVolume}
                      onChange={(e) => setFormData({...formData, monthlyVolume: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                    >
                      <option value="">Seçin</option>
                      <option value="1000-5000">€1,000 - €5,000</option>
                      <option value="5000-20000">€5,000 - €20,000</option>
                      <option value="20000+">€20,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Ek Bilgi</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be] resize-none"
                      placeholder="İşletmeniz hakkında kısa bilgi..."
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">Başvuru Şartları:</h4>
                    <ul className="space-y-2">
                      {requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full cvk-btn-primary font-semibold py-6"
                  >
                    Başvuruyu Gönder
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="cvk-container-md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sık Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hemen Kazanmaya Başlayın
          </h2>
          <p className="text-white/90 text-lg mb-8">
            CVKDijital bayisi olun, kaliteli ürünleri uygun fiyatlarla satın ve kazanın.
          </p>
          <Button 
            onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })} 
            size="lg"
            className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold px-8"
          >
            Ücretsiz Başvuru Yap
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

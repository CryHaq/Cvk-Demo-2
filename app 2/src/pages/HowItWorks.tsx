import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Ruler, Layers, Hash, ShoppingCart, Upload } from 'lucide-react';
import type { Page } from '../App';

interface HowItWorksProps {
  onNavigate: (page: Page) => void;
}

const steps = [
  {
    icon: Ruler,
    step: '1',
    title: 'Boyut Seçin',
    description: 'Ürününüz için en uygun boyutu seçin. Farklı boyut seçeneklerimiz arasından ihtiyacınıza uygun olanı bulun.',
    details: ['Stand-up poşetler', 'Yatay poşetler', 'Özel boyutlar'],
  },
  {
    icon: Layers,
    step: '2',
    title: 'Malzeme Seçin',
    description: 'Ambalajınız için en uygun malzemeyi seçin. Gıda güvenliği sertifikalı malzemelerimizle ürünleriniz güvende.',
    details: ['Alüminyum bariyer', 'Kraft kağıt', 'Geri dönüştürülebilir'],
  },
  {
    icon: Hash,
    step: '3',
    title: 'Miktarı Girin',
    description: 'İhtiyacınız olan miktarı belirtin. Minimum sipariş miktarı yok, istediğiniz kadar sipariş verebilirsiniz.',
    details: ['100 adetten başlayan', 'Esnek sipariş miktarları', 'Toplu indirimler'],
  },
  {
    icon: ShoppingCart,
    step: '4',
    title: 'Sipariş Verin',
    description: 'Ödemeyi tamamlayın ve siparişinizi oluşturun. Güvenli ödeme seçenekleriyle kolayca sipariş verin.',
    details: ['Kredi kartı', 'Havale/EFT', 'PayPal'],
  },
  {
    icon: Upload,
    step: '5',
    title: 'Tasarımı Yükleyin',
    description: 'Hesabınızdan grafik dosyanızı yükleyin. Profesyonel tasarım ekibimiz dosyanızı kontrol eder.',
    details: ['AI, PDF, PSD desteği', 'Ücretsiz dosya kontrolü', 'Tasarım yardımı'],
  },
];

export default function HowItWorks({ onNavigate }: HowItWorksProps) {
  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#f0f7fc] via-[#e8f4fc] to-[#d4ebf7]">
        <div className="cvk-container text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a2e] mb-6">
            Nasıl <span className="text-[#0077be]">Sipariş Verilir</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            5 basit adımda özel ambalajınıza sahip olun. 
            Minimum sipariş miktarı yok, 24 saatte teslimat.
          </p>
          <Button 
            onClick={() => onNavigate('configurator')} 
            size="lg"
            className="cvk-btn-primary font-semibold px-8"
          >
            Şimdi Başlayın
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24">
        <div className="cvk-container">
          <div className="space-y-16">
            {steps.map((item, idx) => (
              <div key={idx} className="grid lg:grid-cols-2 gap-8 items-center">
                <div className={`${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#0077be] flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#f0f7fc] flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#0077be]">{item.step}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a2e] mb-4">{item.title}</h2>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-gray-600">
                        <Check className="w-5 h-5 text-[#0077be]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="cvk-panel p-8">
                    <div className="aspect-video bg-gradient-to-br from-[#f0f7fc] to-[#e8f4fc] rounded-xl flex items-center justify-center">
                      <item.icon className="w-24 h-24 text-[#0077be]/30" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hazır mısınız?
          </h2>
          <p className="text-white/90 mb-8">
            Hemen sipariş verin ve 24 saatte teslim alın.
          </p>
          <Button 
            onClick={() => onNavigate('configurator')} 
            size="lg"
            className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold px-8"
          >
            Şimdi Sipariş Ver
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

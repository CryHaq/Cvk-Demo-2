import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Palette, FileCheck, Rocket, MessageSquare } from 'lucide-react';
import type { Page } from '../App';

interface DesignHelpProps {
  onNavigate: (page: Page) => void;
}

const services = [
  {
    icon: Palette,
    title: 'Tasarım Oluşturma',
    description: 'Markanız için özgün tasarımlar oluşturuyoruz.',
    price: '€150',
    features: ['2 revizyon hakkı', '3 gün teslimat', 'AI, PDF, PSD dosyaları'],
  },
  {
    icon: FileCheck,
    title: 'Dosya Kontrolü',
    description: 'Mevcut tasarımınızı kontrol ediyoruz.',
    price: '€25',
    features: ['Baskı uygunluğu', 'Renk profili kontrolü', 'Kesim hattı kontrolü'],
  },
  {
    icon: Rocket,
    title: 'Tam Paket',
    description: 'Tasarım + kontrol + revizyonlar.',
    price: '€175',
    features: ['Sınırsız revizyon', 'Öncelikli destek', 'Tüm dosya formatları'],
  },
];

export default function DesignHelp({ onNavigate }: DesignHelpProps) {
  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#f0f7fc] via-[#e8f4fc] to-[#d4ebf7]">
        <div className="cvk-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a2e] mb-6">
                Tasarım <span className="text-[#0077be]">Yardımı</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Profesyonel tasarım ekibimiz size yardımcı olmaya hazır. 
                İster kendi tasarımınızı yükleyin, ister bizim için tasarlayın.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => onNavigate('configurator')} 
                  size="lg"
                  className="cvk-btn-primary font-semibold px-8"
                >
                  Hizmet Al
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80" 
                alt="Tasarım Yardımı" 
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 lg:py-24">
        <div className="cvk-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-4">Hizmetlerimiz</h2>
            <p className="text-gray-600">İhtiyacınıza uygun tasarım hizmetini seçin</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="cvk-panel p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full bg-[#f0f7fc] flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-[#0077be]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-3xl font-bold text-[#0077be] mb-6">{service.price}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-[#0077be]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => onNavigate('configurator')} 
                  className="w-full cvk-btn-primary"
                >
                  Seç
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="cvk-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a2e] mb-4">Süreç</h2>
            <p className="text-gray-600">Tasarım sürecimiz nasıl işler?</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Talep Gönderin', desc: 'İhtiyacınızı bize bildirin' },
              { step: '2', title: 'Tasarım', desc: 'Ekibimiz tasarımı hazırlar' },
              { step: '3', title: 'Revizyon', desc: 'Geri bildirimlerinizi alırız' },
              { step: '4', title: 'Teslimat', desc: 'Final dosyalarını teslim ederiz' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0077be] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-semibold text-[#1a1a2e] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Sorularınız mı var?</h2>
          <p className="text-white/90 mb-8">
            Tasarım ekibimizle iletişime geçin, size yardımcı olalım.
          </p>
          <Button 
            onClick={() => onNavigate('contact')} 
            size="lg"
            className="bg-white text-[#0077be] hover:bg-gray-100 font-semibold px-8"
          >
            Bize Ulaşın
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

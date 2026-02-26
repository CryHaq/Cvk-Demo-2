import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Monitor, Package, Zap, Truck, Check, ChevronDown, ChevronUp, Upload, Download, FileImage, X } from 'lucide-react';
import type { Page } from '../App';
import { HomeSEO } from '../components/SEO';
import { OrganizationSchema, LocalBusinessSchema, FAQSchema, BreadcrumbSchema } from '../components/StructuredData';
import HeroSlider from '../components/HeroSlider';
import { ScrollReveal, HoverScale, FloatingElement } from '../components/animations/PageTransition';
import { getHomeShowcaseProducts, type CatalogProduct } from '@/services/productCatalog';

const features = [
  { icon: Monitor, title: 'Online Sipariş', description: 'Kolay online sipariş sistemi' },
  { icon: Package, title: 'Minimum Sipariş Yok', description: 'Esnek sipariş miktarları' },
  { icon: Zap, title: 'Dijital Baskı', description: 'Yüksek kaliteli dijital baskı' },
  { icon: Truck, title: 'En Hızlı Teslimat', description: '24 saatte teslimat' },
];

const faqs = [
  {
    question: 'Minimum sipariş miktarı var mı?',
    answer: 'Hayır, minimum sipariş miktarı yoktur. İhtiyacınız kadar sipariş verebilirsiniz.',
  },
  {
    question: 'Teslimat süresi ne kadar?',
    answer: 'Standart siparişler 24 saatte, express siparişler 12 saatte teslim edilir.',
  },
  {
    question: 'Kendi tasarımımı nasıl yüklerim?',
    answer: 'Sipariş tamamlandıktan sonra hesabınızdan dosyanızı yükleyebilirsiniz.',
  },
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, havale/EFT ve PayPal ödeme seçenekleri sunuyoruz.',
  },
  {
    question: 'Numune gönderebilir misiniz?',
    answer: 'Evet, ücretsiz numune paketimizi talep edebilirsiniz.',
  },
];

interface HomeProps {
  onNavigate: (page: Page) => void;
}

// Şablon dosyaları
const templates = [
  { id: 1, name: 'Stand-Up Poşet Şablonu', size: '10x15 cm', format: 'AI, PDF, PSD', fileName: 'standup-pouch-template.zip' },
  { id: 2, name: 'Yatay Poşet Şablonu', size: '15x10 cm', format: 'AI, PDF, PSD', fileName: 'flat-pouch-template.zip' },
  { id: 3, name: 'Rulo Film Şablonu', size: 'Genişlik: 10cm', format: 'AI, PDF', fileName: 'roll-film-template.zip' },
];

export default function Home({ onNavigate }: HomeProps) {
  const [homeProducts, setHomeProducts] = useState<CatalogProduct[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProducts = () => {
      setHomeProducts(getHomeShowcaseProducts(3));
    };

    loadProducts();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'cvk_admin_products_v1') {
        loadProducts();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleDownloadTemplate = (template: typeof templates[0]) => {
    // Simüle edilmiş indirme
    const link = document.createElement('a');
    link.href = '#';
    link.download = template.fileName;
    alert(`${template.name} indiriliyor...\n\nDosya: ${template.fileName}\nFormat: ${template.format}`);
    setShowTemplateModal(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simüle edilmiş yükleme
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setTimeout(() => {
            alert(`Dosya başarıyla yüklendi!\n\nDosya: ${file.name}\nBoyut: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nTasarım ekibimiz dosyanızı inceleyip size en kısa sürede dönüş yapacaktır.`);
            setShowUploadModal(false);
            setUploadedFile(null);
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      handleUpload(file);
    }
  };

  const faqItems = [
    { question: 'Minimum sipariş miktarı var mı?', answer: 'Hayır, minimum sipariş miktarı yoktur. İhtiyacınız kadar sipariş verebilirsiniz.' },
    { question: 'Teslimat süresi ne kadar?', answer: 'Standart siparişler 24 saatte, express siparişler 12 saatte teslim edilir.' },
    { question: 'Kendi tasarımımı nasıl yüklerim?', answer: 'Sipariş tamamlandıktan sonra hesabınızdan dosyanızı yükleyebilirsiniz.' },
    { question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', answer: 'Kredi kartı, havale/EFT ve PayPal ödeme seçenekleri sunuyoruz.' },
  ];

  return (
    <div className="w-full">
      <HomeSEO />
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema items={[{ name: 'Ana Sayfa', url: 'https://cvkdijital.com' }]} />
      
      {/* Hero Slider */}
      <HeroSlider onNavigate={onNavigate} />

      {/* Trust Banner */}
      <section className="relative -mt-2 z-10">
        <div className="cvk-container">
          <div className="rounded-2xl border border-[#0077be]/20 bg-white/95 backdrop-blur-sm shadow-lg p-4 md:p-5">
            <div className="grid sm:grid-cols-3 gap-3 md:gap-4 text-sm font-semibold">
              <div className="flex items-center gap-2.5 justify-center sm:justify-start text-[#1a1a2e]">
                <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </span>
                <span>Garantili sevkiyat tarihi</span>
              </div>
              <div className="flex items-center gap-2.5 justify-center sm:justify-start text-[#1a1a2e]">
                <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#0077be]" />
                </span>
                <span>Garantili üretim süresi</span>
              </div>
              <div className="flex items-center gap-2.5 justify-center sm:justify-start text-[#1a1a2e]">
                <span className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#00a8e8]" />
                </span>
                <span>Türkiye geneli ücretsiz kargo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="relative bg-gradient-to-b from-[#f5fbff] via-[#eef8ff] to-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,119,190,0.10),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(0,168,232,0.12),transparent_35%)]" />

        <div className="relative cvk-container">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0077be]/20 bg-white/80 text-[#0077be] text-xs font-semibold tracking-wide">
              HIZLI BAŞLANGIÇ
            </span>
            <h2 className="mt-4 cvk-heading-xl tracking-tight">
              Tasarım ve Sipariş Sürecini 3 Adımda Başlatın
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Tekrarlayan tanıtım yerine, doğrudan işinize yarayan aksiyonlarla ilerleyin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-[#0077be]/10 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#0077be]/10 text-[#0077be] flex items-center justify-center mb-4">
                <ArrowRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">1. Konfigüratörü Aç</h3>
              <p className="text-sm text-gray-600 mb-5">Ölçü, materyal ve baskı türünü seçip anlık teklif görün.</p>
              <Button
                onClick={() => onNavigate('configurator')}
                className="w-full cvk-btn-primary"
              >
                Konfigüratöre Git
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#0077be]/10 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-[#00a8e8]/10 text-[#0077be] flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">2. Şablon İndir</h3>
              <p className="text-sm text-gray-600 mb-5">Hazır teknik şablonlarla tasarım hatalarını en aza indirin.</p>
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(true)}
                className="w-full border-[#0077be]/30 text-[#0077be] hover:bg-[#0077be] hover:text-white"
              >
                Şablonları Gör
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#0077be]/10 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">3. Tasarımı Yükle</h3>
              <p className="text-sm text-gray-600 mb-5">Dosyanızı yükleyin, ekip inceleyip üretim için sizi yönlendirsin.</p>
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white"
              >
                Tasarım Yükle
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 bg-white">
        <div className="cvk-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.08} direction="up">
                <HoverScale>
                  <div className="h-full flex items-center gap-4 p-4 rounded-2xl border border-[#0077be]/10 bg-gradient-to-br from-white to-[#f7fbff] hover:shadow-md transition-all cursor-pointer">
                    <FloatingElement>
                      <div className="w-12 h-12 rounded-xl bg-[#0077be]/10 flex items-center justify-center shrink-0">
                        <feature.icon className="w-6 h-6 text-[#0077be]" />
                      </div>
                    </FloatingElement>
                    <div>
                      <h3 className="font-semibold text-[#1a1a2e] leading-tight">{feature.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </HoverScale>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-b from-white via-[#f8fcff] to-[#eef8ff]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(0,119,190,0.08),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(0,168,232,0.10),transparent_34%)]" />

        <div className="relative cvk-container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0077be]/20 bg-white/80 text-[#0077be] text-xs font-semibold tracking-wide">
              ÜRÜN KOLEKSİYONU
            </span>
            <h2 className="mt-4 cvk-heading-xl tracking-tight">
              Markanıza Uygun Ambalajı Seçin
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Her ürün kartında teslim süresi, başlangıç fiyatı ve üretime geçiş adımlarını net gösteriyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {homeProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-white/95 border border-[#0077be]/10 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-[#0077be]/15 transition-all overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1320]/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full bg-white/90 text-[#0077be] text-xs font-semibold px-3 py-1">
                      {product.minOrder}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="inline-flex items-center rounded-full bg-[#0077be] text-white text-xs font-semibold px-3 py-1 shadow-lg">
                      {product.startingPrice}'den başlayan
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-[#1a1a2e]">{product.name}</h3>
                    <span className="text-xs font-medium text-[#0077be] bg-[#0077be]/10 px-2.5 py-1 rounded-full">
                      Teslim: {product.leadTime}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-5 leading-relaxed">{product.description}</p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Yüksek kaliteli dijital baskı</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Gıda temasına uygun materyal opsiyonları</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Hızlı revize ve teknik kontrol desteği</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => onNavigate('configurator')}
                      className="w-full cvk-btn-primary font-semibold"
                    >
                      Şimdi Sipariş Ver
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowTemplateModal(true)}
                        className="border-[#0077be]/20 text-[#0077be] hover:bg-[#0077be] hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Şablon
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadModal(true)}
                        className="border-[#00a8e8]/30 text-[#0077be] hover:bg-[#00a8e8] hover:text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Yükle
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Free Sample Section */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f3057] via-[#0077be] to-[#00a8e8]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.16),transparent_35%)]" />

        <div className="relative cvk-container">
          <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-8 lg:gap-10 items-center">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-xs font-semibold tracking-wide mb-4">
                ÜCRETSİZ NUMUNE KİTİ
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                Üretim Öncesi Kaliteyi Gözünüzle Görün
              </h2>
              <p className="text-white/90 text-lg mb-7 max-w-2xl">
                Malzeme ve baskı kalitesini doğrulamak için numune kitinizi hemen talep edin.
                Teknik ekip uygun seçenekleri sizin için notlandırır.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/70 mb-1">İçerik</p>
                  <p className="font-semibold">Farklı materyal örnekleri</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/70 mb-1">Doğrulama</p>
                  <p className="font-semibold">Baskı ve renk kalitesi</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Ücretsiz kargo ile gönderim</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Numune sonrası hızlı üretim planı</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Teknik ekipten birebir yönlendirme</span>
                </li>
              </ul>

              <Button
                onClick={() => onNavigate('free-sample')}
                size="lg"
                className="bg-white text-[#0077be] hover:bg-[#eaf6ff] font-semibold px-8"
              >
                Ücretsiz Numune Al
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-3 bg-white/20 blur-2xl rounded-[2rem]" />
                <div className="relative rounded-[2rem] border border-white/25 bg-white/10 backdrop-blur-sm p-4 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=700&q=80"
                    alt="Ücretsiz Numune Paketi"
                    className="rounded-2xl w-full h-[420px] object-cover"
                  />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/15 border border-white/20 p-3 text-center">
                      <p className="text-xs text-white/70">Teslim</p>
                      <p className="text-sm font-semibold text-white">24-48s</p>
                    </div>
                    <div className="rounded-xl bg-white/15 border border-white/20 p-3 text-center">
                      <p className="text-xs text-white/70">Maliyet</p>
                      <p className="text-sm font-semibold text-white">Ücretsiz</p>
                    </div>
                    <div className="rounded-xl bg-white/15 border border-white/20 p-3 text-center">
                      <p className="text-xs text-white/70">Destek</p>
                      <p className="text-sm font-semibold text-white">1:1 Teknik</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 lg:py-24 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(0,119,190,0.08),transparent_30%)]" />
        <div className="relative cvk-container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0077be]/20 bg-[#f4faff] text-[#0077be] text-xs font-semibold tracking-wide">
              SÜREÇ AKIŞI
            </span>
            <h2 className="mt-4 cvk-heading-xl mb-3 tracking-tight">
              5 Adımda Üretime Geçin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Süreci sadeleştirdik: seçim, onay ve üretim adımlarını aynı akışta yönetin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-5">
            {[
              { step: '1', title: 'Boyut Seçin', desc: 'İhtiyacınıza uygun ölçüyü belirleyin.' },
              { step: '2', title: 'Malzeme Seçin', desc: 'Kullanım senaryonuza uygun materyal seçin.' },
              { step: '3', title: 'Miktarı Girin', desc: 'Planlanan üretim miktarını netleştirin.' },
              { step: '4', title: 'Sipariş Verin', desc: 'Onay sonrası güvenli ödeme ile tamamlayın.' },
              { step: '5', title: 'Tasarımı Yükleyin', desc: 'Dosyanızı yükleyin, teknik kontrol başlasın.' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="h-full rounded-2xl border border-[#0077be]/10 bg-white shadow-sm hover:shadow-lg transition-shadow p-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0077be] to-[#00a8e8] flex items-center justify-center mb-4 shadow-md">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-[#1a1a2e] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden xl:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-[#0077be]/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => onNavigate('how-it-works')}
              variant="outline"
              className="cvk-btn-outline font-semibold"
            >
              Detaylı Süreci İncele
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Design Help Section */}
      <section className="relative py-16 lg:py-20 bg-[#f6fbff] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,119,190,0.10),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(0,168,232,0.10),transparent_35%)]" />

        <div className="relative cvk-container">
          <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-8 lg:gap-10 items-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-[#0077be]/10 blur-2xl rounded-[2rem]" />
              <div className="relative rounded-[2rem] border border-[#0077be]/15 bg-white p-4 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80"
                  alt="Tasarım Yardımı"
                  className="rounded-2xl w-full h-[420px] object-cover"
                />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0077be]/20 bg-white text-[#0077be] text-xs font-semibold tracking-wide mb-4">
                TASARIM STÜDYOSU
              </span>
              <h2 className="cvk-heading-xl mb-4 tracking-tight">
                Tasarım Ekibimizle Hızlıca Üretime Geçin
              </h2>
              <p className="text-gray-600 mb-7 leading-relaxed">
                Sıfırdan marka dili oluşturma, mevcut tasarımı üretime hazırlama veya dosya kontrolü:
                tüm tasarım ihtiyaçları için profesyonel ekip desteği sağlıyoruz.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-7">
                <div className="rounded-xl border border-[#0077be]/15 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#0077be]/80 mb-1">Teslim Süresi</p>
                  <p className="font-semibold text-[#1a1a2e]">Hızlı revize akışı</p>
                </div>
                <div className="rounded-xl border border-[#0077be]/15 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#0077be]/80 mb-1">Uzmanlık</p>
                  <p className="font-semibold text-[#1a1a2e]">Ambalaj odaklı tasarım</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#0077be]" />
                  <span>Profesyonel grafik tasarım hizmeti</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#0077be]" />
                  <span>Markanıza özel, üretime hazır dosyalar</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#0077be]" />
                  <span>Teknik kontrol + baskı öncesi doğrulama</span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => onNavigate('design-help')}
                  className="cvk-btn-primary font-semibold"
                >
                  Tasarım Yardımı Al
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('contact')}
                  className="border-[#0077be]/30 text-[#0077be] hover:bg-[#0077be] hover:text-white"
                >
                  Ekiple İletişime Geç
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 lg:py-24 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(0,119,190,0.07),transparent_32%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0077be]/20 bg-[#f4faff] text-[#0077be] text-xs font-semibold tracking-wide">
              FAQ
            </span>
            <h2 className="mt-4 cvk-heading-xl mb-3 tracking-tight">
              Sık Sorulan Sorular
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Karar sürecini hızlandırmak için en çok sorulan konuları tek yerde topladık.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border transition-all ${
                  openFaq === idx
                    ? 'border-[#0077be]/30 bg-[#f7fbff] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#0077be]/20'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                >
                  <span className="font-semibold text-[#1a1a2e] pr-4">{faq.question}</span>
                  <span className="w-8 h-8 rounded-full border border-[#0077be]/20 bg-white flex items-center justify-center shrink-0">
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-[#0077be]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#0077be]/70" />
                    )}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f3057] via-[#0077be] to-[#00a8e8]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(255,255,255,0.20),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/25 bg-white/10 backdrop-blur-md p-8 lg:p-10 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
              Ambalaj Sürecinizi Bugün Başlatın
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-3xl mx-auto">
              Konfigüratöre geçin, teknik detayları belirleyin ve üretim onayını hızla tamamlayın.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => onNavigate('configurator')}
                size="lg"
                className="bg-white text-[#0077be] hover:bg-[#eaf6ff] font-semibold px-8"
              >
                Şimdi Sipariş Ver
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => onNavigate('contact')}
                size="lg"
                className="bg-[#0f172a] text-white border border-white/40 hover:bg-[#020617] hover:text-white font-semibold px-8"
              >
                Bize Ulaşın
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Template Download Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Şablon İndir</h3>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Tasarımınızı oluşturmak için ihtiyacınız olan şablonu indirin. 
              Tüm şablonlar AI, PDF ve PSD formatlarında mevcuttur.
            </p>
            <div className="space-y-3">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#f0f7fc] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0077be]/10 rounded-lg flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-[#0077be]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">{template.size} • {template.format}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownloadTemplate(template)}
                    variant="outline"
                    className="cvk-btn-outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Design Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Tasarımınızı Yükleyin</h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFile(null);
                  setUploadProgress(0);
                  setIsUploading(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!uploadedFile ? (
              <div 
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-[#0077be] hover:bg-[#f0f7fc] transition-colors"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".ai,.pdf,.psd,.jpg,.jpeg,.png,.tiff,.eps"
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto bg-[#0077be]/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-[#0077be]" />
                </div>
                <p className="text-gray-900 font-medium mb-2">Dosyanızı buraya sürükleyin</p>
                <p className="text-gray-500 text-sm mb-4">veya tıklayarak seçin</p>
                <p className="text-gray-400 text-xs">
                  Desteklenen formatlar: AI, PDF, PSD, JPG, PNG, TIFF, EPS
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#f0f7fc] rounded-xl">
                  <div className="w-10 h-10 bg-[#0077be]/10 rounded-lg flex items-center justify-center">
                    <FileImage className="w-5 h-5 text-[#0077be]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!isUploading && uploadProgress === 100 && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Yükleniyor...</span>
                      <span className="text-[#0077be] font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0077be] transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {uploadProgress === 100 && !isUploading && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-green-700 text-sm">
                      ✅ Dosyanız başarıyla yüklendi! Tasarım ekibimiz dosyanızı inceleyecek.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

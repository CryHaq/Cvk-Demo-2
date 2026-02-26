import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Package, Gift, Truck } from 'lucide-react';
import type { Page } from '../App';

interface FreeSampleProps {
  onNavigate: (page: Page) => void;
}

const includes = [
  'Farklı boyutlarda poşet örnekleri',
  'Çeşitli malzeme örnekleri',
  'Baskı kalitesi gösterimi',
  'Fermuar ve valf örnekleri',
  'Ücretsiz kargo',
];

export default function FreeSample({ onNavigate }: FreeSampleProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#0077be] to-[#00a8e8]">
        <div className="cvk-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Gift className="w-16 h-16 mb-6" />
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                ÜCRETSİZ Numune Paketi
              </h1>
              <p className="text-white/90 text-lg mb-8">
                Malzemelerimizi ve baskı kalitemizi kendiniz görün. 
                Ücretsiz numune paketimizi talep edin.
              </p>
              <ul className="space-y-3">
                {includes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80" 
                alt="Ücretsiz Numune Paketi" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="cvk-panel p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4">Talebiniz Alındı!</h2>
              <p className="text-gray-600 mb-6">
                Numune paketiniz 3-5 iş günü içinde adresinize gönderilecektir.
              </p>
              <Button 
                onClick={() => onNavigate('home')} 
                className="cvk-btn-primary"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          ) : (
            <div className="cvk-panel p-8">
              <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Numune Paketi Talep Formu</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">E-posta *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Şirket</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      placeholder="Şirket adı"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Adres *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                    placeholder="Sokak, bina no, daire"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Şehir *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      placeholder="Şehir"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Posta Kodu *</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077be]"
                      placeholder="34000"
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full cvk-btn-primary font-semibold py-6"
                >
                  <Package className="mr-2 w-5 h-5" />
                  Numune Paketi Talep Et
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="cvk-container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Package className="w-12 h-12 text-[#0077be] mx-auto mb-4" />
              <h3 className="font-semibold text-[#1a1a2e] mb-2">Kapsamlı Örnekler</h3>
              <p className="text-gray-600 text-sm">Farklı boyut ve malzeme seçeneklerini görün</p>
            </div>
            <div className="text-center">
              <Truck className="w-12 h-12 text-[#0077be] mx-auto mb-4" />
              <h3 className="font-semibold text-[#1a1a2e] mb-2">Ücretsiz Kargo</h3>
              <p className="text-gray-600 text-sm">Numune paketiniz ücretsiz kargoyla gönderilir</p>
            </div>
            <div className="text-center">
              <Check className="w-12 h-12 text-[#0077be] mx-auto mb-4" />
              <h3 className="font-semibold text-[#1a1a2e] mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-600 text-sm">3-5 iş günü içinde teslimat</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const contactTypes = [
  { id: 'company', title: 'Şirket', desc: 'Şirketiniz için özel teklif' },
  { id: 'agency', title: 'Ajans', desc: 'Ortaklık ve beyaz etiket' },
  { id: 'reseller', title: 'Bayi', desc: 'Toptan satış başvurusu' },
  { id: 'other', title: 'Diğer', desc: 'Genel sorular' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'company',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="cvk-page">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-[#0f3057] via-[#0077be] to-[#00a8e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.2),transparent_36%)]" />
        <div className="cvk-container relative text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Bizimle <span className="text-white/90">İletişime Geçin</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Sorularınız mı var? Teklif mi almak istiyorsunuz? Ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-12">
        <div className="cvk-container">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Phone, title: 'Telefon', value: '+90 212 123 45 67', sub: 'Pzt-Cum 09:00-18:00' },
              { icon: Mail, title: 'E-posta', value: 'info@cvkdijital.com.tr', sub: '7/24 destek' },
              { icon: MapPin, title: 'Adres', value: 'İstanbul, Türkiye', sub: 'Merkez Ofis' },
              { icon: Clock, title: 'Çalışma Saatleri', value: '09:00 - 18:00', sub: 'Pazartesi-Cuma' },
            ].map((item, idx) => (
              <div key={idx} className="cvk-panel-subtle p-6 hover:border-[#0077be]/30 hover:shadow-lg transition-all text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#0077be]/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#0077be]" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">{item.title}</h3>
                <p className="text-[#0077be] font-medium">{item.value}</p>
                <p className="text-gray-500 text-sm">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24">
        <div className="cvk-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="cvk-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bize Ulaşın</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-[#0077be] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Teşekkürler!</h3>
                  <p className="text-gray-600">Mesajınız alındı. En kısa sürede size dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Type */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-3">Başvuru Türü</label>
                    <div className="grid grid-cols-2 gap-3">
                      {contactTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            formData.type === type.id
                              ? 'border-[#0077be] bg-[#0077be]/10'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <p className={`font-medium text-sm ${formData.type === type.id ? 'text-gray-900' : 'text-gray-700'}`}>{type.title}</p>
                          <p className="text-gray-500 text-xs">{type.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Ad Soyad *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:border-[#0077be] focus:outline-none"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">E-posta *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:border-[#0077be] focus:outline-none"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:border-[#0077be] focus:outline-none"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Şirket</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:border-[#0077be] focus:outline-none"
                        placeholder="Şirket Adı"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Mesajınız *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:border-[#0077be] focus:outline-none resize-none"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>

                  <Button type="submit" className="w-full cvk-btn-primary font-semibold py-6">
                    <Send className="w-5 h-5 mr-2" />
                    Gönder
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sık Sorulan Sorular</h2>
              <div className="space-y-4">
                {[
                  { q: 'Minimum sipariş miktarı nedir?', a: 'Standart ürünlerimizde minimum sipariş miktarı 500 adettir. Özel projeler için bu miktar değişebilir.' },
                  { q: 'Teslimat süresi ne kadar?', a: 'Onaylı tasarımlar için ortalama teslimat süresi 7-15 iş günüdür. Hızlı teslimat seçeneğimiz de mevcuttur.' },
                  { q: 'Tasarım desteği sağlıyor musunuz?', a: 'Evet, profesyonel grafik ekibimiz tasarım danışmanlığı ve uygulama hizmeti sunmaktadır.' },
                  { q: 'Numune gönderebilir misiniz?', a: 'Evet, numune setimizi 5€ karşılığında satın alabilirsiniz. 12 farklı format ve 10 malzeme içerir.' },
                  { q: 'Ödeme seçenekleri nelerdir?', a: 'Kredi kartı, havale/EFT ve taksitli ödeme seçenekleri sunuyoruz. Bayilerimize özel ödeme koşulları da mevcuttur.' },
                ].map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-[#0077be]/10">
                    <h4 className="text-gray-900 font-semibold mb-2">{faq.q}</h4>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-white/90 border-t border-[#0077be]/10">
        <div className="cvk-container">
          <div className="text-center mb-12">
            <h2 className="cvk-heading-xl mb-4">Bizi Ziyaret Edin</h2>
            <p className="text-gray-600">İstanbul ofisimizde sizi ağırlamaktan mutluluk duyarız</p>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-[#0077be]/10 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.607628516859!2d28.9795303154139!3d41.0082379792996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9be0c8c2f7d%3A0x6a5e6e6e6e6e6e6e!2sIstanbul%2C%20Turkey!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

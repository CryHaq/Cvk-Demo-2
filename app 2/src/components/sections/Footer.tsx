import { Instagram, Facebook, Linkedin, CreditCard } from 'lucide-react';

const footerLinks = {
  cvkdijital: [
    { label: 'Packaging per aziende', href: '#' },
    { label: 'Packaging per agenzie', href: '#' },
    { label: 'Packaging per rivenditori', href: '#' },
    { label: 'Preventivo personalizzato', href: '#' },
    { label: 'Contatti', href: '#' },
    { label: 'Reclami', href: '#' },
  ],
  shop: [
    { label: 'Buste doypack personalizzate', href: '#' },
    { label: 'Buste doypack con zip personalizzate', href: '#' },
    { label: 'Buste doypack in carta', href: '#' },
    { label: 'Buste doypack riciclabili', href: '#' },
    { label: 'Buste doypack in alluminio', href: '#' },
  ],
  packaging: [
    { label: 'Canapa', href: '#' },
    { label: 'Tè e infusi', href: '#' },
    { label: 'Integratori', href: '#' },
    { label: 'Superfood', href: '#' },
    { label: 'Cosmetici', href: '#' },
    { label: 'Petfood', href: '#' },
  ],
  info: [
    { label: 'Condizioni di vendita', href: '#' },
    { label: 'Modalità di pagamento', href: '#' },
    { label: 'Politica di rimborso', href: '#' },
    { label: 'Politica di reso', href: '#' },
    { label: 'Politica di spedizione', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f0f1a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <a href="#" className="inline-block mb-4">
              <span className="text-3xl font-bold text-white italic">
                CVK Dijital
              </span>
            </a>
            <p className="text-white/50 text-sm mb-6">
              Il primo e-commerce dedicato al packaging flessibile personalizzato
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#7cb342] hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#7cb342] hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#7cb342] hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* CVK Dijital Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">CVK Dijital</h4>
            <ul className="space-y-3">
              {footerLinks.cvkdijital.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-[#7cb342] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Acquista su CVK Dijital</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-[#7cb342] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Packaging Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Packaging per</h4>
            <ul className="space-y-3">
              {footerLinks.packaging.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-[#7cb342] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informazioni utili</h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-[#7cb342] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment & Credits */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-white/40" />
              <div>
                <p className="text-white font-medium">Pagamenti sicuri</p>
                <p className="text-white/50 text-sm">
                  Su CVK Dijital acquisti packaging personalizzato con i metodi di pagamento online più popolari, anche a rate!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">VISA</span>
              </div>
              <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">MC</span>
              </div>
              <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">PP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © CVK Dijital - Pack your way 2023
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-white/40 hover:text-[#7cb342] transition-colors text-sm"
              >
                Privacy policy
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-[#7cb342] transition-colors text-sm"
              >
                Cookie policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

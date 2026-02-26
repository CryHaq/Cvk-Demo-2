import { useState } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Aziende', href: '#aziende' },
  { label: 'Agenzie', href: '#agenzie' },
  { label: 'Rivenditori', href: '#rivenditori' },
  { label: 'Shop', href: '#shop' },
  { label: 'Buste doypack personalizzate', href: '#buste' },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-[#1a1a2e] border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <span className="text-2xl font-bold text-white italic">
              CVK Dijital
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Button
              className="hidden sm:flex bg-[#7cb342] hover:bg-[#6a9e38] text-white font-semibold px-6"
            >
              CONFIGURA LA BUSTA
            </Button>
            
            <button className="text-white/80 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </button>
            
            <button className="text-white/80 hover:text-white transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#7cb342] rounded-full text-xs flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button
                className="w-full bg-[#7cb342] hover:bg-[#6a9e38] text-white font-semibold mt-4"
              >
                CONFIGURA LA BUSTA
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

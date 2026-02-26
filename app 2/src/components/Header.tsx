import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, ShoppingCart, Menu, X, ChevronDown, Heart, Sparkles,
  Package, FileText, Calculator, HelpCircle, Gift, Clock, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Page } from '../App';
import MiniCart from './MiniCart';
import WishlistDropdown from './WishlistDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import LoginModal from './LoginModal';
import AdvancedSearch from './AdvancedSearch';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  cartCount: number;
  wishlistCount: number;
  isAuthenticated: boolean;
  user: any;
  onLogout: () => void;
}

const navItems = [
  { label: 'Ana Sayfa', page: 'home' as Page, icon: Sparkles },
  { label: 'Ürünler', page: 'shop' as Page, icon: Package },
  { label: 'Blog', page: 'blog' as Page, icon: FileText },
  { label: 'İletişim', page: 'contact' as Page, icon: HelpCircle },
];

const resourcesMenu = [
  { label: 'Fiyat Hesaplayıcı', page: 'pricing-calculator' as Page, icon: Calculator, desc: 'Anlık fiyat teklifi alın' },
  { label: 'Nasıl Sipariş Verilir', page: 'how-it-works' as Page, icon: Clock, desc: 'Adım adım rehber' },
  { label: 'Tasarım Yardımı', page: 'design-help' as Page, icon: FileText, desc: 'Profesyonel destek' },
  { label: 'Ücretsiz Numune', page: 'free-sample' as Page, icon: Gift, desc: 'Örnek isteyin' },
];

export default function Header({ 
  currentPage, 
  onNavigate, 
  cartCount, 
  wishlistCount,
  isAuthenticated,
  user,
  onLogout
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    setResourcesOpen(false);
    setShowMiniCart(false);
    setShowWishlist(false);
    setShowLoginModal(false);
    setShowSearch(false);
  };

  const shellClasses = isScrolled
    ? 'bg-white/90 dark:bg-[#0f172a]/90 border-white/60 dark:border-white/10 shadow-[0_12px_35px_-18px_rgba(2,132,199,0.45)] backdrop-blur-xl'
    : 'bg-white/70 dark:bg-[#0f172a]/75 border-white/40 dark:border-white/5 shadow-[0_14px_45px_-25px_rgba(2,132,199,0.35)] backdrop-blur-md';

  const iconButtonClasses = `p-2.5 rounded-2xl border transition-all ${
    isScrolled
      ? 'border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-700'
      : 'border-white/50 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700'
  }`;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'pt-2 pb-1' : 'pt-4 pb-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`hidden 2xl:flex items-center justify-between px-5 py-2 text-xs rounded-t-2xl border ${shellClasses}`}>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-[#0077be]" />
              <span className="font-semibold tracking-wide">24 Saatte Teslimat ve Ücretsiz Kargo</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Destek Saatleri: 09:00 - 18:00</span>
            </div>
          </div>

          <div className={`flex items-center gap-3 xl:gap-4 h-16 px-3 sm:px-5 rounded-2xl border ${shellClasses}`}>
            {/* Logo */}
            <motion.button 
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-3 group shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-xl flex items-center justify-center shadow-lg shadow-[#0077be]/30 group-hover:shadow-[#0077be]/50 transition-shadow">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xl font-extrabold tracking-tight text-[#0077be] transition-colors hidden 2xl:block">
                  CVKDijital
                </span>
                <span className="text-base font-extrabold tracking-tight text-[#0077be] transition-colors hidden xl:block 2xl:hidden">
                  CVK
                </span>
                <span className="hidden 2xl:block text-[10px] font-semibold tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  ÖZEL AMBALAJ ÇÖZÜMLERİ
                </span>
              </div>
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex flex-1 min-w-0 items-center gap-1 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 overflow-visible">
              {navItems.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <motion.button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className={`relative px-3 py-2 text-[13px] font-semibold transition-colors rounded-xl shrink-0 ${
                      isActive 
                        ? 'text-[#0077be] bg-[#0077be]/10 shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-[#0077be] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#0077be] rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}

              {/* Resources Dropdown */}
              <div ref={resourcesRef} className="relative">
                <motion.button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:text-[#0077be] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors rounded-xl shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hizmetler
                  <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {resourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {resourcesMenu.map((item) => (
                          <motion.button
                            key={item.page}
                            onClick={() => handleNavigate(item.page)}
                            className="w-full flex items-start gap-3 p-3 rounded-xl text-left hover:bg-[#0077be]/5 dark:hover:bg-slate-800 transition-colors group"
                            whileHover={{ x: 4 }}
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#f0f7fc] dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#0077be]/10 transition-colors">
                              <item.icon className="w-5 h-5 text-[#0077be]" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{item.desc}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <motion.button
                  onClick={() => setShowSearch(true)}
                  className="hidden xl:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Ara...</span>
                  <kbd className="px-2 py-0.5 text-xs bg-white rounded border border-gray-200 text-gray-400">
                    ⌘K
                  </kbd>
                </motion.button>
              </div>

              <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700 flex items-center gap-2">
                {isAuthenticated && user ? (
                  <div className="relative group">
                    <motion.button
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0077be] to-[#00a8e8] flex items-center justify-center text-white text-xs font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </motion.button>

                    <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => handleNavigate('profile')} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Profilim</button>
                      <button onClick={() => handleNavigate('order-tracking')} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Siparişlerim</button>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">Çıkış Yap</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setShowLoginModal(true)}
                    className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                )}

                <div className="relative">
                  <motion.button
                    onClick={() => { setShowWishlist(!showWishlist); setShowMiniCart(false); }}
                    className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 transition-colors relative"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
                    {wishlistCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold"
                      >
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </motion.span>
                    )}
                  </motion.button>
                  <WishlistDropdown isOpen={showWishlist} onClose={() => setShowWishlist(false)} onNavigate={handleNavigate} />
                </div>

                <div className="relative">
                  <motion.button
                    onClick={() => { setShowMiniCart(!showMiniCart); setShowWishlist(false); }}
                    className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 transition-colors relative"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-[#0077be] rounded-full text-xs text-white flex items-center justify-center font-bold"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </motion.button>
                  <MiniCart isOpen={showMiniCart} onClose={() => setShowMiniCart(false)} onNavigate={handleNavigate} />
                </div>
              </div>

              <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <motion.button
                  onClick={() => handleNavigate('configurator')}
                  className="hidden xl:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0077be] via-[#00a8e8] to-[#0077be] bg-[length:200%_100%] hover:bg-[position:100%_0%] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#0077be]/35 hover:shadow-[#0077be]/55 transition-all duration-500 border border-white/20"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Hemen Tasarla</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700 hidden xl:flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-slate-800/70 shrink-0">
                <LanguageSwitcher variant="minimal" showName={false} />
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <motion.button
                onClick={() => setShowSearch(true)}
                className={`hidden lg:flex xl:hidden ${iconButtonClasses}`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </motion.button>

              {/* Theme Toggle */}
              <div className="xl:hidden flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70">
                <LanguageSwitcher />
              </div>

              {/* Order Now Button - Desktop */}
              <motion.button
                onClick={() => handleNavigate('configurator')}
                className="hidden sm:flex xl:hidden items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0077be] via-[#00a8e8] to-[#0077be] bg-[length:200%_100%] hover:bg-[position:100%_0%] text-white text-sm font-bold rounded-full shadow-xl shadow-[#0077be]/40 hover:shadow-[#0077be]/60 transition-all duration-500 animate-gradient border border-white/20"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(0, 119, 190, 0.4)',
                    '0 0 0 10px rgba(0, 119, 190, 0)',
                    '0 0 0 0 rgba(0, 119, 190, 0)',
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span className="tracking-wide">Hemen Tasarla</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative group xl:hidden">
                  <motion.button 
                    className={`${iconButtonClasses} flex items-center gap-2`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077be] to-[#00a8e8] flex items-center justify-center text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 hidden md:block" />
                  </motion.button>

                  {/* Dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => handleNavigate('profile')} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Profilim</button>
                    <button onClick={() => handleNavigate('order-tracking')} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Siparişlerim</button>
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                      <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">Çıkış Yap</button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button 
                  onClick={() => setShowLoginModal(true)}
                  className={`${iconButtonClasses} xl:hidden`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <User className={`w-5 h-5 ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`} />
                </motion.button>
              )}

              {/* Wishlist */}
              <div className="relative xl:hidden">
                <motion.button
                  onClick={() => { setShowWishlist(!showWishlist); setShowMiniCart(false); }}
                  className={`${iconButtonClasses} relative`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`} />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold"
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </motion.span>
                  )}
                </motion.button>
                <WishlistDropdown isOpen={showWishlist} onClose={() => setShowWishlist(false)} onNavigate={handleNavigate} />
              </div>

              {/* Cart */}
              <div className="relative xl:hidden">
                <motion.button
                  onClick={() => { setShowMiniCart(!showMiniCart); setShowWishlist(false); }}
                  className={`${iconButtonClasses} relative`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShoppingCart className={`w-5 h-5 ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-[#0077be] rounded-full text-xs text-white flex items-center justify-center font-bold"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </motion.button>
                <MiniCart isOpen={showMiniCart} onClose={() => setShowMiniCart(false)} onNavigate={handleNavigate} />
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className={`xl:hidden ${iconButtonClasses}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onNavigate={handleNavigate}
      />

      {/* Advanced Search */}
      {showSearch && (
        <AdvancedSearch
          products={[]}
          onSelect={(id) => {
            handleNavigate('shop');
            console.log('Selected product:', id);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 z-40 xl:hidden"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.page}
                  onClick={() => handleNavigate(item.page)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    currentPage === item.page
                      ? 'bg-[#0077be]/10 text-[#0077be] border border-[#0077be]/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </motion.button>
              ))}
              
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Hizmetler</p>
                {resourcesMenu.map((item) => (
                  <motion.button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                  onClick={() => handleNavigate('configurator')}
                  className="w-full bg-gradient-to-r from-[#0077be] via-[#00a8e8] to-[#0077be] bg-[length:200%_100%] hover:bg-[position:100%_0%] text-white font-bold animate-gradient shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Hemen Tasarla
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

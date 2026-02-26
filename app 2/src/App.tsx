import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2, Youtube, Facebook, Instagram, Linkedin, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Home from './pages/Home';
import AdvancedLiveChat from './components/AdvancedLiveChat';
import Newsletter from './components/Newsletter';
import Header from './components/Header';
import PWAStatus from './components/PWAStatus';
import PushNotificationManager from './components/PushNotificationManager';
import WhatsAppButton from './components/WhatsAppButton';
import ReviewSystem from './components/ReviewSystem';
import { checkAbandonedCarts } from './services/emailAutomation';
import { useOfflineQueue } from './services/offlineQueue';


// Lazy loaded pages for better performance
const Shop = lazy(() => import('./pages/Shop'));
const Companies = lazy(() => import('./pages/Companies'));
const Agencies = lazy(() => import('./pages/Agencies'));
const Resellers = lazy(() => import('./pages/Resellers'));
const Contact = lazy(() => import('./pages/Contact'));
const TestimonialsPage = lazy(() => import('./pages/Testimonials'));
const Cart = lazy(() => import('./pages/Cart'));
const Configurator = lazy(() => import('./pages/Configurator'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const DesignHelp = lazy(() => import('./pages/DesignHelp'));
const PricingCalculator = lazy(() => import('./pages/PricingCalculator'));
const FreeSample = lazy(() => import('./pages/FreeSample'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { useAuth } from './context/AuthContext';
import Analytics, { pageview } from './components/Analytics';
import { useSEO } from './hooks/useSEO';
import './App.css';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#f0f7fc]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-[#0077be] animate-spin" />
      <p className="text-gray-500">Yükleniyor...</p>
    </div>
  </div>
);

export type Page = 'home' | 'shop' | 'companies' | 'agencies' | 'resellers' | 'contact' | 'testimonials' | 'cart' | 'configurator' | 'checkout' | 'payment-success' | 'payment-failed' | 'my-orders' | 'admin-orders' | 'how-it-works' | 'design-help' | 'pricing-calculator' | 'free-sample' | 'order-tracking' | 'login' | 'register' | 'forgot-password' | 'profile' | 'blog' | 'blog-post' | 'admin' | 'admin-login';

const PAGE_PATHS: Record<Exclude<Page, 'blog-post'>, string> = {
  home: '/',
  shop: '/shop',
  companies: '/companies',
  agencies: '/agencies',
  resellers: '/resellers',
  contact: '/contact',
  testimonials: '/testimonials',
  cart: '/cart',
  configurator: '/configurator',
  checkout: '/checkout',
  'payment-success': '/payment-success',
  'payment-failed': '/payment-failed',
  'my-orders': '/my-orders',
  'admin-orders': '/admin-orders',
  'how-it-works': '/how-it-works',
  'design-help': '/design-help',
  'pricing-calculator': '/pricing-calculator',
  'free-sample': '/free-sample',
  'order-tracking': '/order-tracking',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  profile: '/profile',
  blog: '/blog',
  admin: '/admin',
  'admin-login': '/admin/login',
};

const PATH_PAGE_MAP = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page as Exclude<Page, 'blog-post'>])
) as Record<string, Exclude<Page, 'blog-post'>>;

const normalizePath = (pathname: string) => {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed.length === 0 ? '/' : trimmed;
};

const getPathFromPage = (page: Page, slug?: string) => {
  if (page === 'blog-post') {
    return slug ? `/blog/${encodeURIComponent(slug)}` : PAGE_PATHS.blog;
  }

  return PAGE_PATHS[page];
};

const getPageFromPath = (pathname: string): { page: Page; slug: string } => {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath.startsWith('/blog/')) {
    const slug = decodeURIComponent(normalizedPath.replace('/blog/', ''));
    if (slug) {
      return { page: 'blog-post', slug };
    }
  }

  return {
    page: PATH_PAGE_MAP[normalizedPath] || 'home',
    slug: '',
  };
};

// SEO Configs
const SEO_CONFIGS: Record<string, { title?: string; description?: string; noindex?: boolean }> = {
  home: {
    title: 'Tabela ve Dijital Baskı Çözümleri',
    description: 'Tabela ve dijital baskıda yenilikçi çözümler. 3D konfigurator ile hayalinizdeki tabelayı dakikalar içinde tasarlayın. 50.000+ projeyle güvenilir ortağınız.',
  },
  shop: {
    title: 'Ürünler',
    description: 'Yüksek kaliteli tabela ve dijital baskı ürünleri. İç mekan, dış mekan, fuar standı ve LED ekran çözümleri. Hemen sipariş verin!',
  },
  configurator: {
    title: '3D Tabela Konfigurator',
    description: '3D konfigurator ile kendi tabelanızı tasarlayın. Boyut, renk, malzeme seçenekleri ile anında fiyat teklifi alın.',
  },
  cart: {
    title: 'Alışveriş Sepeti',
    description: 'Sepetinizi görüntüleyin ve güvenli ödeme ile siparişinizi tamamlayın.',
    noindex: true,
  },
  checkout: {
    title: 'Ödeme',
    description: 'Güvenli ödeme ile siparişinizi tamamlayın.',
    noindex: true,
  },
  login: {
    title: 'Giriş Yap',
    description: 'Hesabınıza giriş yaparak siparişlerinizi takip edin.',
    noindex: true,
  },
  register: {
    title: 'Hesap Oluştur',
    description: 'Hızlı alışveriş için ücretsiz hesap oluşturun.',
    noindex: true,
  },
  blog: {
    title: 'Blog',
    description: 'Tabela ve dijital baskı sektöründen en güncel haberler, ipuçları ve rehberler.',
  },
  contact: {
    title: 'İletişim',
    description: 'Bizimle iletişime geçin. Profesyonel ekibimiz size yardımcı olmaya hazır.',
  },
};

function App() {
  const initialRoute = getPageFromPath(window.location.pathname);
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [blogSlug, setBlogSlug] = useState<string>(initialRoute.slug);
  
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const offlineQueue = useOfflineQueue();

  // SEO for current page
  useSEO({
    title: SEO_CONFIGS[currentPage]?.title || '',
    description: SEO_CONFIGS[currentPage]?.description,
    noindex: SEO_CONFIGS[currentPage]?.noindex,
  });

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
  }, []);

  // Track page views
  useEffect(() => {
    pageview(getPathFromPage(currentPage, blogSlug));
  }, [currentPage, blogSlug]);

  // Check abandoned carts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAbandonedCarts();
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // Sync page state with browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const route = getPageFromPath(window.location.pathname);
      setCurrentPage(route.page);
      setBlogSlug(route.slug);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track cart visits for abandoned cart emails
  useEffect(() => {
    if (currentPage === 'cart') {
      localStorage.setItem('lastCartVisit', Date.now().toString());
    }
  }, [currentPage]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Subscribe to queue changes
    const unsubscribe = offlineQueue.subscribe((queue) => {
      setPendingQueueCount(queue.length);
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleCookieAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieBanner(false);
  };

  const handleCookieReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowCookieBanner(false);
  };

  const navigate = (page: Page, slug?: string) => {
    const nextPage = page === 'blog-post' && !slug ? 'blog' : page;
    const nextSlug = nextPage === 'blog-post' ? (slug || '') : '';

    setCurrentPage(nextPage);
    setBlogSlug(nextSlug);

    const nextPath = getPathFromPage(nextPage, nextSlug);
    if (normalizePath(window.location.pathname) !== nextPath) {
      window.history.pushState({ page: nextPage, slug: nextSlug }, '', nextPath);
    }

    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    const pageContent = (() => {
      switch (currentPage) {
        case 'home':
          return <Home onNavigate={navigate} />;
        case 'shop':
          return <Shop onNavigate={navigate} />;
        case 'companies':
          return <Companies onNavigate={navigate} />;
        case 'agencies':
          return <Agencies onNavigate={navigate} />;
        case 'resellers':
          return <Resellers onNavigate={navigate} />;
        case 'contact':
          return <Contact />;
        case 'testimonials':
          return <TestimonialsPage onNavigate={navigate} />;
        case 'cart':
          return <Cart onNavigate={navigate} />;
        case 'configurator':
          return <Configurator onNavigate={navigate} />;
        case 'checkout':
          return <Checkout onNavigate={navigate} />;
        case 'payment-success':
          return <PaymentSuccess onNavigate={navigate} />;
        case 'payment-failed':
          return <PaymentFailed onNavigate={navigate} />;
        case 'my-orders':
          return <MyOrders onNavigate={navigate} />;
        case 'admin-orders':
          return <AdminOrders onNavigate={navigate} />;
        case 'how-it-works':
          return <HowItWorks onNavigate={navigate} />;
        case 'design-help':
          return <DesignHelp onNavigate={navigate} />;
        case 'pricing-calculator':
          return <PricingCalculator onNavigate={navigate} />;
        case 'free-sample':
          return <FreeSample onNavigate={navigate} />;
        case 'order-tracking':
          return <OrderTracking onNavigate={navigate} />;
        case 'login':
          return <Login onNavigate={navigate} />;
        case 'register':
          return <Register onNavigate={navigate} />;
        case 'forgot-password':
          return <ForgotPassword onNavigate={navigate} />;
        case 'profile':
          return <Profile onNavigate={navigate} />;
        case 'blog':
          return <Blog onNavigate={navigate} />;
        case 'blog-post':
          return <BlogPost slug={blogSlug} onNavigate={navigate} />;
        case 'admin':
          return <Admin onNavigate={navigate} />;
        case 'admin-login':
          return <AdminLogin onNavigate={navigate} />;
        default:
          return <Home onNavigate={navigate} />;
      }
    })();

    return (
      <Suspense fallback={<PageLoader />}>
        {pageContent}
      </Suspense>
    );
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const isAdminPage = currentPage === 'admin' || currentPage === 'admin-login';

  return (
    <div className={`min-h-screen ${isAdminPage ? 'bg-gray-50' : 'bg-[#f0f7fc]'}`}>
      {!isAdminPage && (
        <Header 
          currentPage={currentPage}
          onNavigate={navigate}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={logout}
        />
      )}

      {/* Main Content */}
      <main>{renderPage()}</main>

      {!isAdminPage && (
        <>
      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">CVK</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">CVKDijital</span>
                  <span className="block text-xs text-gray-400 -mt-1">ÖZEL AMBALAJ ÇÖZÜMLERİ</span>
                </div>
              </button>
              <p className="text-gray-400 text-sm mb-6">
                24 saatte teslimat ve minimum sipariş miktarı olmadan istediğiniz zaman oluşturma özgürlüğü.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#0077be] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#0077be] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#0077be] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#0077be] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Markets */}
            <div>
              <h4 className="text-white font-semibold mb-4">Sektörler</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Gıda</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Sağlık & Güzellik</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Kahve & Çay</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Granola & Tahıllar</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Spor & Fitness</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Organik & Takviyeler</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Evcil Hayvan Gıdası</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Tatlılar & Atıştırmalıklar</span></li>
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold mb-4">Ürünler</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('configurator')} className="text-gray-400 hover:text-white transition-colors text-sm">Stand-Up Poşet</button></li>
                <li><button onClick={() => navigate('configurator')} className="text-gray-400 hover:text-white transition-colors text-sm">Yatay Poşet</button></li>
                <li><button onClick={() => navigate('configurator')} className="text-gray-400 hover:text-white transition-colors text-sm">Rulo Film</button></li>
                <li><button onClick={() => navigate('free-sample')} className="text-gray-400 hover:text-white transition-colors text-sm">Ücretsiz Numune Paketi</button></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hizmetler</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('design-help')} className="text-gray-400 hover:text-white transition-colors text-sm">Tasarım Yardımı</button></li>
                <li><button onClick={() => navigate('pricing-calculator')} className="text-gray-400 hover:text-white transition-colors text-sm">Fiyat Hesaplayıcı</button></li>
                <li><button onClick={() => navigate('how-it-works')} className="text-gray-400 hover:text-white transition-colors text-sm">Nasıl Çalışır</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hesap & Destek</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('contact')} className="text-gray-400 hover:text-white transition-colors text-sm">Hesabım</button></li>
                <li><button onClick={() => navigate('cart')} className="text-gray-400 hover:text-white transition-colors text-sm">Sepetim ({cartCount})</button></li>
                <li><button onClick={() => navigate('order-tracking')} className="text-gray-400 hover:text-white transition-colors text-sm">Sipariş Takibi</button></li>
                <li><button onClick={() => navigate('checkout')} className="text-gray-400 hover:text-white transition-colors text-sm">Ödeme</button></li>
                <li><button onClick={() => navigate('blog')} className="text-gray-400 hover:text-white transition-colors text-sm">Blog</button></li>
                <li><button onClick={() => navigate('contact')} className="text-gray-400 hover:text-white transition-colors text-sm">Hakkımızda</button></li>
                <li><button onClick={() => navigate('contact')} className="text-gray-400 hover:text-white transition-colors text-sm">SSS</button></li>
                <li><button onClick={() => navigate('contact')} className="text-gray-400 hover:text-white transition-colors text-sm">İletişim</button></li>
                <li><span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Kullanım Koşulları</span></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-white/10 pt-8 pb-8">
            <Newsletter variant="footer" />
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">© 2024 CVKDijital. Tüm hakları saklıdır.</p>
              <div className="flex items-center gap-6">
                <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Gizlilik Politikası</span>
                <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Çerez Politikası</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">İnternet bağlantısı yok</span>
            {pendingQueueCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {pendingQueueCount} işlem beklemede
              </span>
            )}
          </div>
        </div>
      )}

      {/* Online Status (show briefly when coming back online) */}
      {isOnline && pendingQueueCount > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Bağlantı sağlandı</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {pendingQueueCount} işlem senkronize ediliyor
            </span>
          </div>
        </div>
      )}

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[480px] z-50">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 shadow-2xl relative border border-white/10">
            <button onClick={() => setShowCookieBanner(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-white font-semibold text-lg mb-3">Bilgilendirme</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              CVKDijital ve seçilmiş üçüncü taraflar, teknik amaçlarla ve izninizle çerezler veya benzer teknolojiler kullanır. 
              "Kabul Et" butonunu kullanarak onay verebilirsiniz.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button onClick={handleCookieReject} variant="outline" className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                  Reddet
                </Button>
                <Button onClick={handleCookieAccept} className="flex-1 bg-[#0077be] hover:bg-[#005a8f] text-white">
                  Kabul Et
                </Button>
              </div>
              <Button variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/10">
                Daha fazla bilgi ve özelleştir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat */}
      <AdvancedLiveChat />

      {/* Analytics */}
      <Analytics />

      {/* PWA Status & Install Prompt */}
      <PWAStatus />

      {/* Push Notifications */}
      <PushNotificationManager />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Review System Section - Only on Shop page */}
      {currentPage === 'shop' && (
        <section className="py-16 bg-[#f0f7fc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewSystem 
              productId={1} 
              productName="Özel Baskılı Doypack Poşet"
            />
          </div>
        </section>
      )}
        </>
      )}
    </div>
  );
}

export default App;

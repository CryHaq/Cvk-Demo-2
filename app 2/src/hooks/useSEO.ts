import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'CVK Dijital | Tabela ve Dijital Baskı Çözümleri',
  description: 'Tabela ve dijital baskıda yenilikçi çözümler. 3D konfigurator, süper hızlı teslimat, kurumsal çözümler. 50.000+ projeyle güvenilir ortağınız.',
  keywords: 'tabela, dijital baskı, reklam, konfigurator, 3d tabela, led tabela, istanbul tabela, dijital baskı, fuar standı, iç mekan tabela',
  image: 'https://cvkdijital.com/og-image.jpg',
  url: 'https://cvkdijital.com',
  type: 'website' as const,
};

export function useSEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
}: SEOProps = {}) {
  useEffect(() => {
    // Page Title
    const pageTitle = title 
      ? `${title} | CVK Dijital`
      : DEFAULT_SEO.title;
    document.title = pageTitle;

    // Meta Tags
    setMetaTag('description', description || DEFAULT_SEO.description);
    setMetaTag('keywords', keywords || DEFAULT_SEO.keywords);

    // Open Graph
    setMetaTag('og:title', pageTitle, 'property');
    setMetaTag('og:description', description || DEFAULT_SEO.description, 'property');
    setMetaTag('og:image', image || DEFAULT_SEO.image, 'property');
    setMetaTag('og:url', url || window.location.href, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:site_name', 'CVK Dijital', 'property');

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', description || DEFAULT_SEO.description);
    setMetaTag('twitter:image', image || DEFAULT_SEO.image);

    // Robots
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url || window.location.href);

  }, [title, description, keywords, image, url, type, noindex]);
}

function setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

// Pre-defined SEO configs for common pages
export const SEO_CONFIGS = {
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
    type: 'article' as const,
  },
  contact: {
    title: 'İletişim',
    description: 'Bizimle iletişime geçin. Profesyonel ekibimiz size yardımcı olmaya hazır.',
  },
  about: {
    title: 'Hakkımızda',
    description: 'CVK Dijital olarak 50.000+ projeyle tabela ve dijital baskı sektöründe öncüyüz. Hikayemizi keşfedin.',
  },
  faq: {
    title: 'Sıkça Sorulan Sorular',
    description: 'Tabela siparişi, teslimat süreleri, ödeme seçenekleri hakkında sık sorulan sorular ve cevapları.',
  },
};

export default useSEO;

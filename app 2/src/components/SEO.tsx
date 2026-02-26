import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  canonical?: string;
}

const defaultSEO = {
  title: 'CVKDijital - Özel Ambalaj Çözümleri',
  description: 'Stand-up pouch, doypack ve özel ambalaj çözümleri. 24 saatte teslimat, minimum sipariş limiti olmadan. Kaliteli ve sürdürülebilir ambalaj ürünleri.',
  keywords: 'ambalaj, doypack, stand up pouch, gıda ambalajı, özel ambalaj, baskılı poşet, sürdürülebilir ambalaj',
  image: 'https://cvkdijital.com/og-image.jpg',
  url: 'https://cvkdijital.com',
  type: 'website' as const,
};

export function SEO({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  image = defaultSEO.image,
  url = window.location.href,
  type = defaultSEO.type,
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  canonical,
}: SEOProps) {
  const fullTitle = title === defaultSEO.title ? title : `${title} | CVKDijital`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Update meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Robots
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    
    // Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical || url;

    // Open Graph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', 'CVKDijital', true);
    updateMeta('og:locale', 'tr_TR', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    updateMeta('twitter:site', '@cvkdijital');

    // Article specific
    if (type === 'article') {
      if (author) updateMeta('article:author', author, true);
      if (publishedTime) updateMeta('article:published_time', publishedTime, true);
      if (modifiedTime) updateMeta('article:modified_time', modifiedTime, true);
    }

    // Cleanup on unmount
    return () => {
      // Meta tags are replaced on next SEO mount, no need to remove
    };
  }, [fullTitle, description, keywords, image, url, type, author, publishedTime, modifiedTime, noindex, canonical]);

  return null;
}

// Predefined SEO configurations for common pages
export const HomeSEO = () => (
  <SEO
    title="CVKDijital - Özel Ambalaj Çözümleri"
    description="Stand-up pouch, doypack ve özel ambalaj çözümleri. 24 saatte teslimat, minimum sipariş limiti olmadan. Kaliteli ve sürdürülebilir ambalaj ürünleri."
    type="website"
  />
);

export const ShopSEO = () => (
  <SEO
    title="Ürünler"
    description="Stand-up pouch, yatay poşet, rulo film ve daha fazlası. İhtiyacınıza özel ambalaj çözümleri."
    type="website"
  />
);

export const BlogSEO = () => (
  <SEO
    title="Blog"
    description="Ambalaj dünyasından içgörüler. Tasarım trendleri, sürdürülebilirlik ipuçları ve sektör haberleri."
    type="website"
  />
);

export const ContactSEO = () => (
  <SEO
    title="İletişim"
    description="CVKDijital ile iletişime geçin. Özel ambalaj çözümleri için bizimle konuşun."
    type="website"
  />
);

export const BlogPostSEO = ({ 
  title, 
  description, 
  image, 
  author, 
  publishedTime 
}: { 
  title: string; 
  description: string; 
  image: string; 
  author: string;
  publishedTime: string;
}) => (
  <SEO
    title={title}
    description={description}
    image={image}
    type="article"
    author={author}
    publishedTime={publishedTime}
  />
);

export default SEO;

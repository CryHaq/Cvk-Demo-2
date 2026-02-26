import { useEffect } from 'react';

// Organization Schema
export const OrganizationSchema = () => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CVKDijital',
      url: 'https://cvkdijital.com',
      logo: 'https://cvkdijital.com/logo.png',
      description: 'Özel ambalaj çözümleri ve dijital baskı hizmetleri',
      sameAs: [
        'https://facebook.com/cvkdijital',
        'https://instagram.com/cvkdijital',
        'https://linkedin.com/company/cvkdijital',
        'https://youtube.com/cvkdijital',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+90-XXX-XXX-XXXX',
        contactType: 'sales',
        areaServed: 'TR',
        availableLanguage: ['Turkish', 'English'],
      },
    };

    addSchemaScript(schema);
  }, []);

  return null;
};

// Local Business Schema
export const LocalBusinessSchema = () => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'CVKDijital',
      image: 'https://cvkdijital.com/og-image.jpg',
      '@id': 'https://cvkdijital.com',
      url: 'https://cvkdijital.com',
      telephone: '+90-XXX-XXX-XXXX',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Adres Sokak No:1',
        addressLocality: 'İstanbul',
        postalCode: '34000',
        addressCountry: 'TR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 41.0082,
        longitude: 28.9784,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      priceRange: '$$',
    };

    addSchemaScript(schema);
  }, []);

  return null;
};

// Product Schema
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: string;
  currency?: string;
  availability?: string;
}

export const ProductSchema = ({ 
  name, 
  description, 
  image, 
  price, 
  currency = 'TRY',
  availability = 'https://schema.org/InStock'
}: ProductSchemaProps) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image,
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: currency,
        price,
        availability,
        seller: {
          '@type': 'Organization',
          name: 'CVKDijital',
        },
      },
    };

    addSchemaScript(schema);
  }, [name, description, image, price, currency, availability]);

  return null;
};

// Blog Post Schema
interface BlogPostSchemaProps {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url?: string;
}

export const BlogPostSchema = ({
  title,
  description,
  image,
  author,
  datePublished,
  dateModified,
  url = window.location.href,
}: BlogPostSchemaProps) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      image,
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'CVKDijital',
        logo: {
          '@type': 'ImageObject',
          url: 'https://cvkdijital.com/logo.png',
        },
      },
      url,
      datePublished,
      dateModified: dateModified || datePublished,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    };

    addSchemaScript(schema);
  }, [title, description, image, author, datePublished, dateModified, url]);

  return null;
};

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export const BreadcrumbSchema = ({ items }: { items: BreadcrumbItem[] }) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    addSchemaScript(schema);
  }, [items]);

  return null;
};

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSchema = ({ items }: { items: FAQItem[] }) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    addSchemaScript(schema);
  }, [items]);

  return null;
};

// Review Schema
interface ReviewSchemaProps {
  itemReviewed: string;
  reviewRating: number;
  author: string;
  reviewBody: string;
  datePublished: string;
}

export const ReviewSchema = ({
  itemReviewed,
  reviewRating,
  author,
  reviewBody,
  datePublished,
}: ReviewSchemaProps) => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Product',
        name: itemReviewed,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: reviewRating,
        bestRating: 5,
      },
      author: {
        '@type': 'Person',
        name: author,
      },
      reviewBody,
      datePublished,
      publisher: {
        '@type': 'Organization',
        name: 'CVKDijital',
      },
    };

    addSchemaScript(schema);
  }, [itemReviewed, reviewRating, author, reviewBody, datePublished]);

  return null;
};

// Helper function to add schema script
function addSchemaScript(schema: object) {
  const existingScript = document.querySelector('script[data-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-structured-data', '');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

export default {
  OrganizationSchema,
  LocalBusinessSchema,
  ProductSchema,
  BlogPostSchema,
  BreadcrumbSchema,
  FAQSchema,
  ReviewSchema,
};

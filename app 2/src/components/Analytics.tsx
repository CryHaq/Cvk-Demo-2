import { useEffect } from 'react';

// Google Analytics Tracking ID
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX';

// Meta Pixel ID
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || 'XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  });
};

// Track page view
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track event
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// E-commerce events
export const ecommerce = {
  // View product
  viewItem: (item: {
    id: string;
    name: string;
    price: number;
    category?: string;
  }) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    window.gtag('event', 'view_item', {
      currency: 'TRY',
      value: item.price,
      items: [item],
    });
  },

  // Add to cart
  addToCart: (item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    window.gtag('event', 'add_to_cart', {
      currency: 'TRY',
      value: item.price * item.quantity,
      items: [item],
    });
  },

  // Begin checkout
  beginCheckout: (value: number) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    window.gtag('event', 'begin_checkout', {
      currency: 'TRY',
      value,
    });
  },

  // Purchase
  purchase: ({
    transactionId,
    value,
    items,
  }: {
    transactionId: string;
    value: number;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'TRY',
      value,
      items,
    });
  },
};

// Initialize Meta Pixel
export const initMetaPixel = () => {
  if (typeof window === 'undefined') return;
  
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

// Meta Pixel events
export const metaEvent = (eventName: string, data?: object) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  window.fbq('track', eventName, data);
};

// Analytics Component
export default function Analytics() {
  useEffect(() => {
    // Only initialize in production
    if (import.meta.env.PROD) {
      initGA();
      initMetaPixel();
    }
  }, []);

  return null;
}

// TypeScript declarations
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

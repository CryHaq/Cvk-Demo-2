// CVK Dijital - Newsletter/Bülten API Service
// Mock API for local development

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  preferences: {
    promotions: boolean;
    newProducts: boolean;
    blogUpdates: boolean;
    designTips: boolean;
  };
  subscribedAt: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string; // Where they subscribed from
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  type: 'promotion' | 'new_product' | 'blog' | 'design_tip' | 'welcome';
  sentAt?: string;
  scheduledFor?: string;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
}

// Mock data
const MOCK_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: '1',
    email: 'ahmet@example.com',
    firstName: 'Ahmet',
    preferences: {
      promotions: true,
      newProducts: true,
      blogUpdates: false,
      designTips: true,
    },
    subscribedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    source: 'footer',
  },
  {
    id: '2',
    email: 'zeynep@example.com',
    firstName: 'Zeynep',
    preferences: {
      promotions: true,
      newProducts: true,
      blogUpdates: true,
      designTips: false,
    },
    subscribedAt: '2024-02-01T14:20:00Z',
    status: 'active',
    source: 'popup',
  },
];

const getStoredSubscribers = (): NewsletterSubscriber[] => {
  const stored = localStorage.getItem('cvk_newsletter_subscribers');
  return stored ? JSON.parse(stored) : MOCK_SUBSCRIBERS;
};

const saveSubscribers = (subscribers: NewsletterSubscriber[]) => {
  localStorage.setItem('cvk_newsletter_subscribers', JSON.stringify(subscribers));
};

if (!localStorage.getItem('cvk_newsletter_subscribers')) {
  saveSubscribers(MOCK_SUBSCRIBERS);
}

export const newsletterApi = {
  // Subscribe to newsletter
  subscribe: async (
    email: string,
    firstName?: string,
    preferences?: Partial<NewsletterSubscriber['preferences']>,
    source: string = 'website'
  ): Promise<{ success: boolean; message?: string; subscriber?: NewsletterSubscriber }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          resolve({ success: false, message: 'Geçerli bir e-posta adresi girin' });
          return;
        }

        const subscribers = getStoredSubscribers();
        
        // Check if already subscribed
        const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          if (existing.status === 'active') {
            resolve({ success: false, message: 'Bu e-posta adresi zaten abone' });
            return;
          } else {
            // Reactivate
            existing.status = 'active';
            existing.subscribedAt = new Date().toISOString();
            saveSubscribers(subscribers);
            resolve({ 
              success: true, 
              message: 'Aboneliğiniz yeniden aktif edildi',
              subscriber: existing 
            });
            return;
          }
        }

        const newSubscriber: NewsletterSubscriber = {
          id: Date.now().toString(),
          email: email.toLowerCase(),
          firstName,
          preferences: {
            promotions: preferences?.promotions ?? true,
            newProducts: preferences?.newProducts ?? true,
            blogUpdates: preferences?.blogUpdates ?? false,
            designTips: preferences?.designTips ?? false,
          },
          subscribedAt: new Date().toISOString(),
          status: 'active',
          source,
        };

        subscribers.push(newSubscriber);
        saveSubscribers(subscribers);

        // Simulate welcome email
        console.log(`[EMAIL] Welcome email sent to ${email}`);

        resolve({ 
          success: true, 
          message: 'Başarıyla abone oldunuz!',
          subscriber: newSubscriber 
        });
      }, 800);
    });
  },

  // Unsubscribe
  unsubscribe: async (email: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subscribers = getStoredSubscribers();
        const subscriber = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
        
        if (!subscriber) {
          resolve({ success: false, message: 'Abonelik bulunamadı' });
          return;
        }

        subscriber.status = 'unsubscribed';
        saveSubscribers(subscribers);
        
        resolve({ success: true, message: 'Abonelikten çıkıldı' });
      }, 500);
    });
  },

  // Update preferences
  updatePreferences: async (
    email: string,
    preferences: Partial<NewsletterSubscriber['preferences']>
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subscribers = getStoredSubscribers();
        const subscriber = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
        
        if (!subscriber) {
          resolve({ success: false, message: 'Abonelik bulunamadı' });
          return;
        }

        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        saveSubscribers(subscribers);
        
        resolve({ success: true, message: 'Tercihler güncellendi' });
      }, 400);
    });
  },

  // Check if subscribed
  isSubscribed: async (email: string): Promise<boolean> => {
    const subscribers = getStoredSubscribers();
    const subscriber = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    return subscriber?.status === 'active';
  },

  // Get subscriber stats (Admin)
  getStats: async (): Promise<{ 
    success: boolean; 
    data?: {
      total: number;
      active: number;
      unsubscribed: number;
      newThisMonth: number;
    }
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subscribers = getStoredSubscribers();
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = {
          total: subscribers.length,
          active: subscribers.filter(s => s.status === 'active').length,
          unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
          newThisMonth: subscribers.filter(s => new Date(s.subscribedAt) >= thisMonth).length,
        };

        resolve({ success: true, data: stats });
      }, 300);
    });
  },

  // Get all subscribers (Admin)
  getAllSubscribers: async (): Promise<{ success: boolean; data?: NewsletterSubscriber[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subscribers = getStoredSubscribers();
        resolve({ success: true, data: subscribers });
      }, 400);
    });
  },
};

export default newsletterApi;

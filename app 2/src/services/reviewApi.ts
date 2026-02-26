// CVK Dijital - Ürün Yorumları API Service
// Mock API for local development

export interface Review {
  id: string;
  productId: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  verifiedPurchase: boolean;
  helpful: number; // Beğeni sayısı
  createdAt: string;
  updatedAt?: string;
  reply?: {
    author: string;
    comment: string;
    createdAt: string;
  };
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
}

// Mock reviews data
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: 1,
    userName: 'Ahmet Yılmaz',
    rating: 5,
    title: 'Mükemmel kalite!',
    comment: 'Ürünlerim için bu poşetleri kullanıyorum ve gerçekten çok kaliteli. Baskı net, malzeme sağlam. Müşterilerim de çok beğeniyor.',
    pros: ['Kaliteli malzeme', 'Net baskı', 'Hızlı teslimat'],
    verifiedPurchase: true,
    helpful: 12,
    createdAt: '2024-01-15T10:30:00Z',
    reply: {
      author: 'CVK Dijital',
      comment: 'Değerli yorumunuz için teşekkürler! Müşteri memnuniyeti bizim için çok önemli.',
      createdAt: '2024-01-16T09:00:00Z',
    },
  },
  {
    id: '2',
    productId: '1',
    userId: 2,
    userName: 'Zeynep Kaya',
    rating: 4,
    title: 'Çok güzel ama...',
    comment: 'Genel olarak çok memnunum ancak fermuar kısmı biraz sert olabilir. Onun dışında mükemmel!',
    cons: ['Fermuar biraz sert'],
    verifiedPurchase: true,
    helpful: 8,
    createdAt: '2024-01-20T14:20:00Z',
  },
  {
    id: '3',
    productId: '2',
    userId: 3,
    userName: 'Mehmet Demir',
    rating: 5,
    title: 'Kahve için ideal',
    comment: 'Kahve çekirdeklerimi bu poşetlerde saklıyorum. Hava valfi sayesinde tazeliği çok uzun süre korunuyor. Kesinlikle tavsiye ederim!',
    pros: ['Hava valfi mükemmel', 'Aroma koruma'],
    verifiedPurchase: true,
    helpful: 15,
    createdAt: '2024-02-01T11:00:00Z',
  },
  {
    id: '4',
    productId: '1',
    userId: 4,
    userName: 'Ayşe Şahin',
    rating: 3,
    title: 'Fena değil',
    comment: 'Fiyatına göre iyi ama beklediğim kadar kaliteli değil. Yine de kullanılabilir.',
    verifiedPurchase: true,
    helpful: 3,
    createdAt: '2024-02-10T16:45:00Z',
  },
  {
    id: '5',
    productId: '3',
    userId: 5,
    userName: 'Can Özdemir',
    rating: 5,
    title: 'Organik ürünler için mükemmel',
    comment: 'Organik gıda ürünlerim için bu kraft poşetleri kullanıyorum. Doğal görünümü tam istediğim gibi.',
    pros: ['Doğal görünüm', 'Çevre dostu', 'Sağlam yapı'],
    verifiedPurchase: true,
    helpful: 20,
    createdAt: '2024-02-15T09:30:00Z',
  },
];

// Get reviews from localStorage or use mock
const getStoredReviews = (): Review[] => {
  const stored = localStorage.getItem('cvk_mock_reviews');
  return stored ? JSON.parse(stored) : MOCK_REVIEWS;
};

const saveReviews = (reviews: Review[]) => {
  localStorage.setItem('cvk_mock_reviews', JSON.stringify(reviews));
};

// Initialize
if (!localStorage.getItem('cvk_mock_reviews')) {
  saveReviews(MOCK_REVIEWS);
}

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const reviewApi = {
  // Get reviews for a product
  getProductReviews: async (
    productId: string,
    options?: {
      rating?: number; // Filter by rating
      sortBy?: 'newest' | 'oldest' | 'helpful' | 'highest' | 'lowest';
      verifiedOnly?: boolean;
    }
  ): Promise<{ success: boolean; data?: Review[]; stats?: ReviewStats }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let reviews = getStoredReviews().filter(r => r.productId === productId);

        // Filter by rating
        if (options?.rating) {
          reviews = reviews.filter(r => r.rating === options.rating);
        }

        // Filter verified only
        if (options?.verifiedOnly) {
          reviews = reviews.filter(r => r.verifiedPurchase);
        }

        // Sort
        switch (options?.sortBy) {
          case 'oldest':
            reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
          case 'helpful':
            reviews.sort((a, b) => b.helpful - a.helpful);
            break;
          case 'highest':
            reviews.sort((a, b) => b.rating - a.rating);
            break;
          case 'lowest':
            reviews.sort((a, b) => a.rating - b.rating);
            break;
          default: // newest
            reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // Calculate stats
        const stats: ReviewStats = {
          average: 0,
          total: reviews.length,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          stats.average = Number((sum / reviews.length).toFixed(1));
          
          reviews.forEach(r => {
            stats.distribution[r.rating as keyof typeof stats.distribution]++;
          });
        }

        resolve({ success: true, data: reviews, stats });
      }, 400);
    });
  },

  // Create a new review
  createReview: async (
    reviewData: CreateReviewRequest
  ): Promise<{ success: boolean; data?: Review; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = getCurrentUser();
        
        if (!user) {
          resolve({ success: false, message: 'Yorum yapmak için giriş yapmalısınız' });
          return;
        }

        const reviews = getStoredReviews();
        
        // Check if user already reviewed this product
        const existing = reviews.find(r => 
          r.productId === reviewData.productId && r.userId === user.id
        );
        
        if (existing) {
          resolve({ success: false, message: 'Bu ürün için zaten yorum yapmışsınız' });
          return;
        }

        const newReview: Review = {
          id: Date.now().toString(),
          ...reviewData,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userAvatar: user.avatar,
          verifiedPurchase: true, // Mock: assume verified
          helpful: 0,
          createdAt: new Date().toISOString(),
        };

        reviews.push(newReview);
        saveReviews(reviews);

        resolve({ success: true, data: newReview });
      }, 600);
    });
  },

  // Mark review as helpful
  markHelpful: async (reviewId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = getStoredReviews();
        const review = reviews.find(r => r.id === reviewId);
        
        if (review) {
          review.helpful++;
          saveReviews(reviews);
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  },

  // Admin: Reply to review
  replyToReview: async (
    reviewId: string,
    reply: { author: string; comment: string }
  ): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = getStoredReviews();
        const review = reviews.find(r => r.id === reviewId);
        
        if (review) {
          review.reply = {
            ...reply,
            createdAt: new Date().toISOString(),
          };
          saveReviews(reviews);
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 400);
    });
  },

  // Get all reviews (Admin)
  getAllReviews: async (): Promise<{ success: boolean; data?: Review[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = getStoredReviews();
        resolve({ success: true, data: reviews });
      }, 400);
    });
  },

  // Delete review (Admin)
  deleteReview: async (reviewId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = getStoredReviews();
        const filtered = reviews.filter(r => r.id !== reviewId);
        
        if (filtered.length < reviews.length) {
          saveReviews(filtered);
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  },
};

export default reviewApi;

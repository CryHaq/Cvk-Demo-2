/**
 * Review System Service
 * 
 * Ürün yorumları ve değerlendirmeleri
 * - Yıldız derecelendirme (1-5)
 * - Fotoğraf paylaşma
 * - Admin onayı
 * - "Onaylı Satın Alma" rozeti
 * - Faydalı/Faydasız oylama
 */

import { toast } from '@/components/Toast';

export interface Review {
  id: string;
  productId: number;
  productName: string;
  userId?: number;
  userName: string;
  userEmail: string;
  avatar?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpful: number; // Faydalı bulunma sayısı
  unhelpful: number; // Faydasız bulunma sayısı
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewInput {
  productId: number;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  orderId?: string; // Satın alma doğrulaması için
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { [key: number]: number }; // 1-5 yıldız dağılımı
  verified: number;
  withImages: number;
}

const REVIEWS_KEY = 'cvk_reviews';
const USER_REVIEWS_KEY = 'cvk_user_reviews';

class ReviewSystemService {
  /**
   * Yeni yorum ekle
   */
  public addReview(input: ReviewInput): Review {
    const reviews = this.getAllReviews();
    
    // Aynı kullanıcı aynı ürüne yorum yapmış mı kontrol et
    const existing = reviews.find(
      r => r.productId === input.productId && 
           r.userEmail === input.userEmail && 
           r.status !== 'rejected'
    );
    
    if (existing) {
      toast.error('Bu ürüne zaten yorum yaptınız.');
      throw new Error('Already reviewed');
    }

    const newReview: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: input.productId,
      productName: input.productName,
      userName: input.userName,
      userEmail: input.userEmail,
      rating: input.rating,
      title: input.title,
      content: input.content,
      images: input.images || [],
      isVerifiedPurchase: !!input.orderId,
      helpful: 0,
      unhelpful: 0,
      status: 'pending', // Admin onayı için beklemede
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    this.saveReviews(reviews);
    
    // Kullanıcının yorumlarına ekle
    this.addToUserReviews(input.userEmail, newReview.id);
    
    toast.success('Yorumunuz gönderildi! Onaylandıktan sonra yayınlanacak.');
    return newReview;
  }

  /**
   * Yorumu onayla (Admin)
   */
  public approveReview(reviewId: string): void {
    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
      review.status = 'approved';
      review.updatedAt = new Date().toISOString();
      this.saveReviews(reviews);
      toast.success('Yorum onaylandı.');
    }
  }

  /**
   * Yorumu reddet (Admin)
   */
  public rejectReview(reviewId: string, reason?: string): void {
    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
      review.status = 'rejected';
      review.updatedAt = new Date().toISOString();
      this.saveReviews(reviews);
      toast.success(`Yorum reddedildi. ${reason || ''}`);
    }
  }

  /**
   * Admin yanıtı ekle
   */
  public addAdminReply(reviewId: string, reply: string): void {
    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
      review.adminReply = reply;
      review.updatedAt = new Date().toISOString();
      this.saveReviews(reviews);
      toast.success('Yanıt eklendi.');
    }
  }

  /**
   * Faydalı bul
   */
  public markHelpful(reviewId: string): void {
    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review && review.status === 'approved') {
      review.helpful++;
      this.saveReviews(reviews);
    }
  }

  /**
   * Faydasız bul
   */
  public markUnhelpful(reviewId: string): void {
    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review && review.status === 'approved') {
      review.unhelpful++;
      this.saveReviews(reviews);
    }
  }

  /**
   * Ürüne göre yorumları getir
   */
  public getReviewsByProduct(productId: number, includePending: boolean = false): Review[] {
    const reviews = this.getAllReviews().filter(
      r => r.productId === productId && (includePending || r.status === 'approved')
    );
    
    // Onaylı satın almalar önce, sonra tarih sırası
    return reviews.sort((a, b) => {
      if (a.isVerifiedPurchase && !b.isVerifiedPurchase) return -1;
      if (!a.isVerifiedPurchase && b.isVerifiedPurchase) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Tüm yorumları getir (Admin için)
   */
  public getAllReviews(): Review[] {
    try {
      return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Onay bekleyen yorumları getir
   */
  public getPendingReviews(): Review[] {
    return this.getAllReviews().filter(r => r.status === 'pending');
  }

  /**
   * Kullanıcının yorumlarını getir
   */
  public getUserReviews(email: string): Review[] {
    return this.getAllReviews().filter(r => r.userEmail === email);
  }

  /**
   * Yorum istatistikleri
   */
  public getReviewStats(productId: number): ReviewStats {
    const reviews = this.getReviewsByProduct(productId);
    
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verified: 0,
        withImages: 0,
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    for (const review of reviews) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    }

    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      total: reviews.length,
      distribution,
      verified: reviews.filter(r => r.isVerifiedPurchase).length,
      withImages: reviews.filter(r => r.images.length > 0).length,
    };
  }

  /**
   * Kullanıcı ürüne yorum yapmış mı?
   */
  public hasReviewed(email: string, productId: number): boolean {
    return this.getAllReviews().some(
      r => r.userEmail === email && 
           r.productId === productId && 
           r.status !== 'rejected'
    );
  }

  /**
   * Yorum sil
   */
  public deleteReview(reviewId: string): void {
    const reviews = this.getAllReviews().filter(r => r.id !== reviewId);
    this.saveReviews(reviews);
    toast.success('Yorum silindi.');
  }

  /**
   * Yorumları kaydet
   */
  private saveReviews(reviews: Review[]): void {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }

  /**
   * Kullanıcının yorum listesine ekle
   */
  private addToUserReviews(email: string, reviewId: string): void {
    const userReviews = this.getUserReviewIds(email);
    userReviews.push(reviewId);
    localStorage.setItem(`${USER_REVIEWS_KEY}_${email}`, JSON.stringify(userReviews));
  }

  /**
   * Kullanıcının yorum ID'lerini getir
   */
  private getUserReviewIds(email: string): string[] {
    try {
      return JSON.parse(localStorage.getItem(`${USER_REVIEWS_KEY}_${email}`) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Son yorumları getir (Ana sayfa için)
   */
  public getRecentReviews(limit: number = 5): Review[] {
    return this.getAllReviews()
      .filter(r => r.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * En faydalı yorumları getir
   */
  public getMostHelpfulReviews(productId: number, limit: number = 3): Review[] {
    return this.getReviewsByProduct(productId)
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, limit);
  }

  /**
   * Global istatistikler
   */
  public getGlobalStats(): {
    totalReviews: number;
    averageRating: number;
    pendingCount: number;
    verifiedCount: number;
  } {
    const reviews = this.getAllReviews();
    const approved = reviews.filter(r => r.status === 'approved');
    
    const sum = approved.reduce((acc, r) => acc + r.rating, 0);
    
    return {
      totalReviews: approved.length,
      averageRating: approved.length > 0 ? Math.round((sum / approved.length) * 10) / 10 : 0,
      pendingCount: reviews.filter(r => r.status === 'pending').length,
      verifiedCount: approved.filter(r => r.isVerifiedPurchase).length,
    };
  }

  /**
   * Mock yorumlar oluştur (Demo için)
   */
  public seedMockReviews(): void {
    const mockReviews: ReviewInput[] = [
      {
        productId: 1,
        productName: 'Stand-Up Poşet',
        userName: 'Ahmet Yılmaz',
        userEmail: 'ahmet@example.com',
        rating: 5,
        title: 'Harika kalite!',
        content: 'Ürünler çok güzel paketlendi. Baskı kalitesi mükemmel. Kesinlikle tavsiye ederim.',
        orderId: 'ORDER123',
      },
      {
        productId: 1,
        productName: 'Stand-Up Poşet',
        userName: 'Ayşe Demir',
        userEmail: 'ayse@example.com',
        rating: 4,
        title: 'Güzel ürün',
        content: 'Genel olarak memnun kaldım. Teslimat bir gün gecikti ama ürün kaliteli.',
        orderId: 'ORDER124',
      },
    ];

    for (const review of mockReviews) {
      try {
        const newReview = this.addReview(review);
        // Otomatik onayla (mock için)
        this.approveReview(newReview.id);
      } catch {
        // Zaten varsa atla
      }
    }
  }
}

// Singleton instance
export const reviewSystem = new ReviewSystemService();

// Hook için helper
export function useReviewSystem() {
  return {
    addReview: reviewSystem.addReview.bind(reviewSystem),
    approveReview: reviewSystem.approveReview.bind(reviewSystem),
    rejectReview: reviewSystem.rejectReview.bind(reviewSystem),
    getReviewsByProduct: reviewSystem.getReviewsByProduct.bind(reviewSystem),
    getPendingReviews: reviewSystem.getPendingReviews.bind(reviewSystem),
    getReviewStats: reviewSystem.getReviewStats.bind(reviewSystem),
    markHelpful: reviewSystem.markHelpful.bind(reviewSystem),
    markUnhelpful: reviewSystem.markUnhelpful.bind(reviewSystem),
    hasReviewed: reviewSystem.hasReviewed.bind(reviewSystem),
    getGlobalStats: reviewSystem.getGlobalStats.bind(reviewSystem),
    seedMockReviews: reviewSystem.seedMockReviews.bind(reviewSystem),
  };
}

export default reviewSystem;

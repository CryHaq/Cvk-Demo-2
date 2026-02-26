/**
 * AI Recommendation Engine
 *
 * localStorage davranis verisi + admin urun katalogu uzerinden oneriler uretir.
 */

import { toast } from '@/components/Toast';
import { getCatalogProducts } from '@/services/productCatalog';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  views: number;
  purchases: number;
}

export interface UserBehavior {
  productId: number;
  action: 'view' | 'cart' | 'purchase' | 'wishlist';
  timestamp: number;
  sessionId: string;
}

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
  type: 'similar' | 'frequently_bought' | 'trending' | 'personalized' | 'cart_based';
}

export interface CartPattern {
  items: number[];
  frequency: number;
  confidence: number;
}

const BEHAVIOR_KEY = 'cvk_user_behavior';
const SESSION_KEY = 'cvk_session_id';
const PRODUCT_STATS_KEY = 'cvk_reco_product_stats_v1';

class RecommendationEngine {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.trackPageView();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  private getProductStats(): Record<string, { views: number; purchases: number }> {
    try {
      return JSON.parse(localStorage.getItem(PRODUCT_STATS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveProductStats(stats: Record<string, { views: number; purchases: number }>): void {
    localStorage.setItem(PRODUCT_STATS_KEY, JSON.stringify(stats));
  }

  private getAllProducts(): Product[] {
    const stats = this.getProductStats();
    return getCatalogProducts().map((item, index) => {
      const key = String(item.id);
      const stat = stats[key] || { views: 120 + index * 11, purchases: 25 + index * 4 };
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        rating: item.rating,
        views: stat.views,
        purchases: stat.purchases,
      };
    });
  }

  private getFrequentPatterns(products: Product[]): CartPattern[] {
    if (products.length < 2) return [];

    const ids = products.map((product) => product.id);
    const patterns: CartPattern[] = [];

    for (let i = 0; i < ids.length - 1 && patterns.length < 6; i += 1) {
      patterns.push({
        items: [ids[i], ids[i + 1]],
        frequency: Math.max(20, 85 - i * 8),
        confidence: Math.max(0.42, 0.78 - i * 0.05),
      });
    }

    if (ids.length >= 3) {
      patterns.push({ items: [ids[0], ids[1], ids[2]], frequency: 45, confidence: 0.56 });
    }

    return patterns;
  }

  public trackBehavior(productId: number, action: UserBehavior['action']): void {
    const behaviors = this.getBehaviors();

    behaviors.push({
      productId,
      action,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });

    if (behaviors.length > 1000) {
      behaviors.splice(0, behaviors.length - 1000);
    }

    localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(behaviors));
    this.updateProductStats(productId, action);
  }

  private trackPageView(): void {
    const productId = this.extractProductIdFromUrl();
    if (productId) {
      this.trackBehavior(productId, 'view');
    }
  }

  private extractProductIdFromUrl(): number | null {
    const path = window.location.pathname;
    if (path.includes('shop') || path.includes('product')) {
      return null;
    }
    return null;
  }

  private getBehaviors(): UserBehavior[] {
    try {
      return JSON.parse(localStorage.getItem(BEHAVIOR_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private updateProductStats(productId: number, action: UserBehavior['action']): void {
    const stats = this.getProductStats();
    const key = String(productId);
    const current = stats[key] || { views: 0, purchases: 0 };

    if (action === 'view') {
      current.views += 1;
    }

    if (action === 'purchase') {
      current.purchases += 1;
    }

    stats[key] = current;
    this.saveProductStats(stats);
  }

  public getPersonalizedRecommendations(limit: number = 6): Recommendation[] {
    const products = this.getAllProducts();
    const productById = new Map(products.map((p) => [p.id, p]));
    const behaviors = this.getBehaviors();
    const cart = this.getCart();
    const wishlist = this.getWishlist();
    const patterns = this.getFrequentPatterns(products);

    const scoredProducts = new Map<number, { score: number; reasons: string[]; type: Recommendation['type'] }>();

    const recentlyViewed = behaviors
      .filter((behavior) => behavior.action === 'view')
      .slice(-5)
      .map((behavior) => behavior.productId);

    for (const productId of recentlyViewed) {
      const product = productById.get(productId);
      if (!product) continue;

      const similarProducts = products.filter(
        (candidate) => candidate.category === product.category && candidate.id !== product.id
      );

      for (const similar of similarProducts) {
        const current = scoredProducts.get(similar.id) || { score: 0, reasons: [], type: 'similar' as const };
        current.score += 10;
        if (!current.reasons.includes('Son goruntulemelerinize benzer')) {
          current.reasons.push('Son goruntulemelerinize benzer');
        }
        scoredProducts.set(similar.id, current);
      }
    }

    if (cart.length > 0) {
      const cartIds = cart.map((item) => Number(item.id)).filter((id) => Number.isFinite(id));

      for (const pattern of patterns) {
        const hasAny = pattern.items.some((id) => cartIds.includes(id));
        const hasMissing = pattern.items.some((id) => !cartIds.includes(id));

        if (!hasAny || !hasMissing) continue;

        for (const itemId of pattern.items) {
          if (cartIds.includes(itemId)) continue;

          const current = scoredProducts.get(itemId) || {
            score: 0,
            reasons: [],
            type: 'frequently_bought' as const,
          };
          current.score += pattern.confidence * 50;
          if (!current.reasons.includes('Bunu alanlar bunu da aldi')) {
            current.reasons.push('Bunu alanlar bunu da aldi');
          }
          scoredProducts.set(itemId, current);
        }
      }
    }

    if (wishlist.length > 0) {
      const wishlistIds = wishlist.map((item: any) => Number(item.id)).filter((id) => Number.isFinite(id));

      for (const wishlistId of wishlistIds) {
        const product = productById.get(wishlistId);
        if (!product) continue;

        const similarProducts = products.filter(
          (candidate) =>
            candidate.category === product.category &&
            candidate.id !== product.id &&
            !wishlistIds.includes(candidate.id)
        );

        for (const similar of similarProducts) {
          const current = scoredProducts.get(similar.id) || { score: 0, reasons: [], type: 'personalized' as const };
          current.score += 8;
          if (!current.reasons.includes('Favorilerinize benzer')) {
            current.reasons.push('Favorilerinize benzer');
          }
          scoredProducts.set(similar.id, current);
        }
      }
    }

    const trendingProducts = [...products]
      .sort((a, b) => b.purchases / (b.views + 1) - a.purchases / (a.views + 1))
      .slice(0, 3);

    for (const product of trendingProducts) {
      const current = scoredProducts.get(product.id) || { score: 0, reasons: [], type: 'trending' as const };
      current.score += 5;
      if (!current.reasons.includes('Trend urun')) {
        current.reasons.push('Trend urun');
      }
      scoredProducts.set(product.id, current);
    }

    const viewedIds = behaviors.map((behavior) => behavior.productId);
    const cartIds = cart.map((item: any) => Number(item.id)).filter((id: number) => Number.isFinite(id));

    for (const id of [...viewedIds, ...cartIds]) {
      scoredProducts.delete(id);
    }

    return Array.from(scoredProducts.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([productId, data]) => {
        const product = productById.get(productId);
        if (!product) {
          return null;
        }
        return {
          product,
          score: data.score,
          reason: data.reasons[0] || 'Size ozel oneri',
          type: data.type,
        } as Recommendation;
      })
      .filter((item): item is Recommendation => Boolean(item));
  }

  public getFrequentlyBoughtTogether(productId: number, limit: number = 3): Recommendation[] {
    const products = this.getAllProducts();
    const productById = new Map(products.map((p) => [p.id, p]));
    const patterns = this.getFrequentPatterns(products).filter((pattern) => pattern.items.includes(productId));

    const recommendations: Recommendation[] = [];

    for (const pattern of patterns.sort((a, b) => b.confidence - a.confidence)) {
      for (const itemId of pattern.items) {
        if (itemId === productId || recommendations.length >= limit) continue;
        const product = productById.get(itemId);
        if (!product) continue;

        recommendations.push({
          product,
          score: pattern.confidence * 100,
          reason: `${Math.round(pattern.confidence * 100)}% musteri bununla birlikte aldi`,
          type: 'frequently_bought',
        });
      }
    }

    return recommendations;
  }

  public getCartBasedRecommendations(cartItems: any[], limit: number = 4): Recommendation[] {
    const products = this.getAllProducts();
    const productById = new Map(products.map((p) => [p.id, p]));
    const cartIds = cartItems.map((item) => Number(item.id)).filter((id) => Number.isFinite(id));

    const recommendations: Recommendation[] = [];

    for (const cartItemId of cartIds) {
      const productRecommendations = this.getFrequentlyBoughtTogether(cartItemId, 2);

      for (const recommendation of productRecommendations) {
        if (cartIds.includes(recommendation.product.id)) continue;
        if (recommendations.some((item) => item.product.id === recommendation.product.id)) continue;
        recommendations.push(recommendation);
      }
    }

    if (recommendations.length < limit) {
      const cartCategories = new Set(
        cartIds
          .map((id) => productById.get(id)?.category)
          .filter((category): category is string => Boolean(category))
      );

      for (const category of cartCategories) {
        const categoryProducts = products.filter(
          (product) =>
            product.category === category &&
            !cartIds.includes(product.id) &&
            !recommendations.some((item) => item.product.id === product.id)
        );

        for (const product of categoryProducts.slice(0, 2)) {
          if (recommendations.length >= limit) break;
          recommendations.push({
            product,
            score: 50,
            reason: 'Sepetinize uygun',
            type: 'cart_based',
          });
        }
      }
    }

    return recommendations.slice(0, limit);
  }

  public getRecentlyViewed(limit: number = 5): Product[] {
    const products = this.getAllProducts();
    const productById = new Map(products.map((p) => [p.id, p]));
    const behaviors = this.getBehaviors();

    const viewedIds = behaviors
      .filter((behavior) => behavior.action === 'view')
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((behavior) => behavior.productId);

    const uniqueIds = [...new Set(viewedIds)];

    return uniqueIds
      .slice(0, limit)
      .map((id) => productById.get(id))
      .filter((product): product is Product => Boolean(product));
  }

  public getTrendingProducts(limit: number = 6): Product[] {
    const products = this.getAllProducts();
    return [...products]
      .sort((a, b) => {
        const scoreA = (a.purchases * 2 + a.views * 0.1) * a.rating;
        const scoreB = (b.purchases * 2 + b.views * 0.1) * b.rating;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  public getSimilarProducts(productId: number, limit: number = 4): Product[] {
    const products = this.getAllProducts();
    const source = products.find((product) => product.id === productId);
    if (!source) return [];

    return products
      .filter((product) => product.category === source.category && product.id !== productId)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  private getCart(): any[] {
    try {
      return JSON.parse(localStorage.getItem('cvk_cart_v2') || '[]');
    } catch {
      return [];
    }
  }

  private getWishlist(): any[] {
    try {
      return JSON.parse(localStorage.getItem('cvk_wishlist_v1') || '[]');
    } catch {
      return [];
    }
  }

  public clearBehaviors(): void {
    localStorage.removeItem(BEHAVIOR_KEY);
    toast.success('Oneri verileri temizlendi');
  }

  public getStats(): {
    totalBehaviors: number;
    uniqueProductsViewed: number;
    uniqueProductsPurchased: number;
    topCategory: string;
  } {
    const products = this.getAllProducts();
    const productById = new Map(products.map((p) => [p.id, p]));
    const behaviors = this.getBehaviors();

    const viewedProducts = new Set(
      behaviors.filter((behavior) => behavior.action === 'view').map((behavior) => behavior.productId)
    );
    const purchasedProducts = new Set(
      behaviors.filter((behavior) => behavior.action === 'purchase').map((behavior) => behavior.productId)
    );

    const categoryCounts: Record<string, number> = {};

    for (const behavior of behaviors) {
      const product = productById.get(behavior.productId);
      if (!product) continue;
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    }

    const topCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || products[0]?.category || 'doypack';

    return {
      totalBehaviors: behaviors.length,
      uniqueProductsViewed: viewedProducts.size,
      uniqueProductsPurchased: purchasedProducts.size,
      topCategory,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();

export function useRecommendations() {
  return {
    getPersonalized: recommendationEngine.getPersonalizedRecommendations.bind(recommendationEngine),
    getFrequentlyBought: recommendationEngine.getFrequentlyBoughtTogether.bind(recommendationEngine),
    getCartBased: recommendationEngine.getCartBasedRecommendations.bind(recommendationEngine),
    getRecentlyViewed: recommendationEngine.getRecentlyViewed.bind(recommendationEngine),
    getTrending: recommendationEngine.getTrendingProducts.bind(recommendationEngine),
    getSimilar: recommendationEngine.getSimilarProducts.bind(recommendationEngine),
    track: recommendationEngine.trackBehavior.bind(recommendationEngine),
    getStats: recommendationEngine.getStats.bind(recommendationEngine),
    clear: recommendationEngine.clearBehaviors.bind(recommendationEngine),
  };
}

export default recommendationEngine;

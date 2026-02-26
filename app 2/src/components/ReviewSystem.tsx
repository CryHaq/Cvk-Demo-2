import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, Check, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  productId: number;
  userName: string;
  avatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  pros?: string[];
  cons?: string[];
  userLiked?: boolean;
}

interface ReviewSystemProps {
  productId: number;
  productName: string;
}

export default function ReviewSystem({ productId }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: '',
  });

  // Load reviews from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${productId}`);
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      // Demo reviews
      setReviews([
        {
          id: '1',
          productId,
          userName: 'Ahmet Y.',
          rating: 5,
          title: 'Mükemmel kalite!',
          comment: 'Ürün beklediğimden çok daha iyi çıktı. Baskı kalitesi harika, malzeme sağlam. Kesinlikle tekrar sipariş vereceğim.',
          date: '2024-02-15',
          verified: true,
          helpful: 12,
          pros: ['Kaliteli malzeme', 'Hızlı teslimat', 'Güzel baskı'],
          cons: ['Fiyat biraz yüksek'],
        },
        {
          id: '2',
          productId,
          userName: 'Mehmet K.',
          rating: 4,
          title: 'İyi ama teslimat gecikti',
          comment: 'Ürün kalitesi güzel fakat teslimat 2 gün gecikti. Genel olarak memnunum.',
          date: '2024-02-10',
          verified: true,
          helpful: 8,
        },
        {
          id: '3',
          productId,
          userName: 'Ayşe S.',
          rating: 5,
          title: 'Tavsiye ederim',
          comment: 'Firmamız için sipariş verdik, çok beğendik. Müşteri temsilcisi çok ilgiliydi.',
          date: '2024-02-05',
          verified: true,
          helpful: 15,
          pros: ['İlgili müşteri hizmetleri', 'Profesyonel işçilik'],
        },
      ]);
    }
  }, [productId]);

  // Save reviews
  const saveReviews = (updatedReviews: Review[]) => {
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews));
  };

  // Calculate stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0,
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => filterRating ? r.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'highest': return b.rating - a.rating;
        case 'lowest': return a.rating - b.rating;
        case 'helpful': return b.helpful - a.helpful;
        default: return 0;
      }
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const review: Review = {
      id: Date.now().toString(),
      productId,
      userName: 'Siz',
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpful: 0,
      pros: newReview.pros ? newReview.pros.split(',').map(p => p.trim()) : [],
      cons: newReview.cons ? newReview.cons.split(',').map(c => c.trim()) : [],
    };

    saveReviews([review, ...reviews]);
    setShowForm(false);
    setNewReview({ rating: 5, title: '', comment: '', pros: '', cons: '' });
  };

  const handleHelpful = (reviewId: string) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          helpful: r.userLiked ? r.helpful - 1 : r.helpful + 1,
          userLiked: !r.userLiked,
        };
      }
      return r;
    });
    saveReviews(updated);
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Müşteri Yorumları</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(parseFloat(averageRating))
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-900">{averageRating}</span>
            <span className="text-gray-500">({reviews.length} değerlendirme)</span>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#0077be] hover:bg-[#005a8f]"
        >
          Yorum Yaz
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Rating Breakdown */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 mb-4">Puan Dağılımı</h3>
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              onClick={() => setFilterRating(filterRating === stars ? null : stars)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                filterRating === stars ? 'bg-[#0077be]/10' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium w-12">{stars} yıldız</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2">
          {/* Sort */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[#0077be] outline-none"
            >
              <option value="newest">En Yeni</option>
              <option value="highest">En Yüksek Puan</option>
              <option value="lowest">En Düşük Puan</option>
              <option value="helpful">En Faydalı</option>
            </select>
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="text-sm text-[#0077be] hover:underline"
              >
                Filtreyi Temizle
              </button>
            )}
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.userName}</p>
                    {review.verified && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Doğrulanmış Satın Alma
                      </span>
                    )}
                  </div>
                  <span className="ml-auto text-sm text-gray-400">{review.date}</span>
                </div>

                {/* Rating & Title */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                </div>

                {/* Comment */}
                <p className="text-gray-600 mb-3">{review.comment}</p>

                {/* Pros & Cons */}
                {(review.pros?.length || 0 > 0 || review.cons?.length || 0 > 0) && (
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    {(review.pros?.length || 0) > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-700 mb-1">Artılar</p>
                        <ul className="text-sm text-green-600 space-y-1">
                          {review.pros?.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(review.cons?.length || 0) > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-700 mb-1">Eksiler</p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {review.cons?.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      review.userLiked ? 'text-[#0077be]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${review.userLiked ? 'fill-[#0077be]' : ''}`} />
                    Faydalı ({review.helpful})
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
                    <Flag className="w-4 h-4" />
                    Raporla
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[140]"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[141] p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Yorum Yaz</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Puanınız</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= newReview.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                    <input
                      type="text"
                      required
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      placeholder="Örn: Mükemmel ürün!"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:border-[#0077be] outline-none"
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yorumunuz</label>
                    <textarea
                      required
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Deneyimlerinizi paylaşın..."
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:border-[#0077be] outline-none resize-none"
                    />
                  </div>

                  {/* Pros */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artılar (virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      value={newReview.pros}
                      onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                      placeholder="Kaliteli, Hızlı teslimat..."
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:border-[#0077be] outline-none"
                    />
                  </div>

                  {/* Cons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eksiler (virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      value={newReview.cons}
                      onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                      placeholder="Pahalı, ..."
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:border-[#0077be] outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0077be] hover:bg-[#005a8f] py-6"
                  >
                    Yorumu Gönder
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Star, ThumbsUp, MessageCircle, Check, Filter, 
  X, Plus 
} from 'lucide-react';
import { reviewApi, type Review, type ReviewStats } from '../services/reviewApi';
import { useAuth } from '../context/AuthContext';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('newest');

  // Review form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadReviews();
  }, [productId, filterRating, sortBy]);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await reviewApi.getProductReviews(productId, {
      rating: filterRating || undefined,
      sortBy,
    });
    if (result.success) {
      setReviews(result.data || []);
      setStats(result.stats || null);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (rating === 0) {
      setSubmitError('Lütfen bir puan verin');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Lütfen bir başlık girin');
      return;
    }
    if (!comment.trim()) {
      setSubmitError('Lütfen bir yorum yazın');
      return;
    }

    setIsSubmitting(true);
    const result = await reviewApi.createReview({
      productId,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      pros: pros.filter(p => p.trim()),
      cons: cons.filter(c => c.trim()),
    });

    if (result.success) {
      setShowWriteForm(false);
      resetForm();
      loadReviews();
    } else {
      setSubmitError(result.message || 'Yorum gönderilemedi');
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setComment('');
    setPros([]);
    setCons([]);
  };

  const handleHelpful = async (reviewId: string) => {
    await reviewApi.markHelpful(reviewId);
    loadReviews();
  };

  const StarRating = ({ 
    value, 
    onChange, 
    readOnly = false,
    size = 'md'
  }: { 
    value: number; 
    onChange?: (val: number) => void;
    readOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const stars = [1, 2, 3, 4, 5];
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div className="flex gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= (hoverRating || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <button
        onClick={() => setFilterRating(filterRating === star ? null : star)}
        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
          filterRating === star ? 'bg-blue-50' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-1 w-16">
          <span className="font-medium">{star}</span>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#0077be] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Müşteri Yorumları
          {stats && (
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({stats.total} yorum)
            </span>
          )}
        </h3>
        
        {isAuthenticated ? (
          <Button
            onClick={() => setShowWriteForm(!showWriteForm)}
            className="bg-[#0077be] hover:bg-[#005a8f] text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {showWriteForm ? 'İptal' : 'Yorum Yaz'}
          </Button>
        ) : (
          <p className="text-sm text-gray-500">
            Yorum yapmak için giriş yapın
          </p>
        )}
      </div>

      {/* Rating Summary */}
      {stats && stats.total > 0 && (
        <div className="grid md:grid-cols-3 gap-8 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.average}
            </div>
            <StarRating value={Math.round(stats.average)} readOnly size="md" />
            <p className="text-gray-500 mt-2">{stats.total} değerlendirme</p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-3">Puan Dağılımı</h4>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={stats.distribution[star as keyof typeof stats.distribution]}
                  total={stats.total}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showWriteForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-4">{productName} için yorum yazın</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Puanınız</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Başlık</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Mükemmel kalite!"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0077be] outline-none"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Yorumunuz</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0077be] outline-none resize-none"
              />
            </div>

            {/* Pros */}
            <div>
              <label className="block text-sm font-medium mb-2">Artıları (Opsiyonel)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newPro.trim()) {
                        setPros([...pros, newPro.trim()]);
                        setNewPro('');
                      }
                    }
                  }}
                  placeholder="Bir artı ekleyin"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newPro.trim()) {
                      setPros([...pros, newPro.trim()]);
                      setNewPro('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pros.map((pro, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {pro}
                    <button
                      type="button"
                      onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div>
              <label className="block text-sm font-medium mb-2">Eksileri (Opsiyonel)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newCon.trim()) {
                        setCons([...cons, newCon.trim()]);
                        setNewCon('');
                      }
                    }
                  }}
                  placeholder="Bir eksik ekleyin"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newCon.trim()) {
                      setCons([...cons, newCon.trim()]);
                      setNewCon('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cons.map((con, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {con}
                    <button
                      type="button"
                      onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowWriteForm(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-[#0077be] hover:bg-[#005a8f] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Tüm Puanlar</option>
            <option value="5">5 Yıldız</option>
            <option value="4">4 Yıldız</option>
            <option value="3">3 Yıldız</option>
            <option value="2">2 Yıldız</option>
            <option value="1">1 Yıldız</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="newest">En Yeni</option>
            <option value="helpful">En Faydalı</option>
            <option value="highest">En Yüksek Puan</option>
            <option value="lowest">En Düşük Puan</option>
          </select>
        </div>

        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Filtreyi Temizle
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-full flex items-center justify-center text-white font-semibold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <Check className="w-3 h-3" />
                    Doğrulanmış Satın Alma
                  </span>
                )}
              </div>

              {/* Rating & Title */}
              <div className="mb-3">
                <StarRating value={review.rating} readOnly size="sm" />
                <h5 className="font-semibold text-gray-900 dark:text-white mt-2">
                  {review.title}
                </h5>
              </div>

              {/* Comment */}
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {review.comment}
              </p>

              {/* Pros */}
              {review.pros && review.pros.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-green-700 mb-1">Artıları:</p>
                  <div className="flex flex-wrap gap-2">
                    {review.pros.map((pro, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded"
                      >
                        + {pro}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cons */}
              {review.cons && review.cons.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-red-700 mb-1">Eksileri:</p>
                  <div className="flex flex-wrap gap-2">
                    {review.cons.map((con, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-red-50 text-red-700 text-sm rounded"
                      >
                        - {con}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply */}
              {review.reply && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    {review.reply.author} yanıtladı:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {review.reply.comment}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0077be] transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Faydalı ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

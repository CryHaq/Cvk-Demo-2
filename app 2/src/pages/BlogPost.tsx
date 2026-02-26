import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Loader2,
  ChevronRight,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { Page } from '../App';
import { BlogPostSEO } from '../components/SEO';
import { BlogPostSchema, BreadcrumbSchema } from '../components/StructuredData';
import { API_ENDPOINTS } from '@/lib/api';

interface BlogPostType {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  author_bio: string;
  date: string;
  readTime: string;
  category: string;
  category_slug: string;
  tags: string[];
  slug: string;
  views: number;
  likes: number;
}

interface RelatedPost {
  id: number;
  title: string;
  image: string;
  date: string;
  readTime: string;
  slug: string;
}

interface Comment {
  id: number;
  author_name: string;
  content: string;
  date: string;
  parent_id: number | null;
}

interface BlogPostProps {
  slug?: string;
  onNavigate: (page: Page, slug?: string) => void;
}

interface Category {
  category: string;
  slug: string;
}

const API_BASE = API_ENDPOINTS.blog;

const categories: Category[] = [
  { category: 'Ambalaj Tasarımı', slug: 'ambalaj-tasarimi' },
  { category: 'Sürdürülebilirlik', slug: 'surdurulebilirlik' },
  { category: 'Pazarlama', slug: 'pazarlama' },
  { category: 'Üretim', slug: 'uretim' },
  { category: 'Gıda Güvenliği', slug: 'gida-guvenligi' },
];

export default function BlogPost({ slug, onNavigate }: BlogPostProps) {
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comment form
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}?action=get&slug=${postSlug}`);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.post);
        setRelated(data.related || []);
        setComments(data.comments || []);
        setLikeCount(data.post.likes);
        
        // Check if liked from localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setHasLiked(likedPosts.includes(data.post.id));
      } else {
        setError(data.error || 'Makale bulunamadı');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post?.title || '';

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link kopyalandı!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleLike = async () => {
    if (!post || hasLiked) return;
    
    // Optimistic update
    setLikeCount(likeCount + 1);
    setHasLiked(true);
    
    // Save to localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    likedPosts.push(post.id);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    
    // In production: send to API
    // await fetch(`${API_BASE}?action=like&id=${post.id}`, { method: 'POST' });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    
    setIsSubmittingComment(true);
    setCommentError('');
    
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          postId: post.id,
          authorName: commentName,
          authorEmail: commentEmail,
          content: commentContent
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCommentSuccess(true);
        setCommentName('');
        setCommentEmail('');
        setCommentContent('');
        setTimeout(() => setCommentSuccess(false), 5000);
      } else {
        setCommentError(data.error || 'Yorum gönderilemedi');
      }
    } catch (err) {
      setCommentError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f0f7fc] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#0077be] animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full min-h-screen bg-[#f0f7fc] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Makale Bulunamadı'}
          </h2>
          <p className="text-gray-600 mb-4">Aradığınız içerik mevcut değil.</p>
          <Button onClick={() => onNavigate('blog')}>Bloga Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      <BlogPostSEO
        title={post.title}
        description={post.excerpt}
        image={post.image}
        author={post.author}
        publishedTime={new Date(post.date).toISOString()}
      />
      <BlogPostSchema
        title={post.title}
        description={post.excerpt}
        image={post.image}
        author={post.author}
        datePublished={new Date(post.date).toISOString()}
        url={window.location.href}
      />
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: 'https://cvkdijital.com' },
        { name: 'Blog', url: 'https://cvkdijital.com/blog' },
        { name: post.title, url: window.location.href }
      ]} />

      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="cvk-container py-4">
          <button
            onClick={() => onNavigate('blog')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0077be] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Bloga Dön</span>
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] lg:h-[500px]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <button
              onClick={() => onNavigate('blog')}
              className="inline-block px-3 py-1 bg-[#0077be] text-white text-sm font-semibold rounded-full mb-4 hover:bg-[#005a8f] transition-colors"
            >
              {post.category}
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                  {post.author[0]}
                </div>
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-sm text-white/70">{post.author_bio}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.readTime} okuma</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{post.views} görüntülenme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="cvk-container py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article */}
            <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-a:text-[#0077be] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-[#0077be] prose-blockquote:bg-[#f0f7fc] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-ul:list-disc prose-ol:list-decimal"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
                  <Tag className="w-5 h-5 text-gray-400" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Engagement */}
            <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    hasLiked
                      ? 'bg-[#0077be] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>{likeCount}</span>
                </button>
                <a
                  href="#comments"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length} Yorum</span>
                </a>
              </div>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-all ${
                  isBookmarked ? 'bg-[#0077be] text-white' : 'text-gray-400 hover:text-[#0077be]'
                }`}
              >
                <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <span className="text-gray-600 font-medium">Paylaş:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <Link2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-8 p-8 bg-gradient-to-r from-[#f0f7fc] to-white rounded-xl border border-[#0077be]/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#0077be] flex items-center justify-center text-white text-2xl font-bold">
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{post.author}</h3>
                  <p className="text-gray-600 mt-2">{post.author_bio}</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div id="comments" className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Yorumlar ({comments.length})
              </h3>

              {/* Comment Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Yorum Yaz</h4>
                
                {commentSuccess ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>Yorumunuz incelendikten sonra yayınlanacaktır. Teşekkürler!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="Adınız"
                        required
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077be]"
                      />
                      <input
                        type="email"
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        placeholder="E-posta adresiniz"
                        required
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077be]"
                      />
                    </div>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Yorumunuz..."
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077be] resize-none"
                    />
                    {commentError && (
                      <p className="text-red-500 text-sm">{commentError}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="bg-[#0077be] hover:bg-[#005a8f]"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Yorum Gönder
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#0077be] flex items-center justify-center text-white font-medium">
                          {comment.author_name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{comment.author_name}</span>
                            <span className="text-sm text-gray-500">{comment.date}</span>
                          </div>
                          <p className="text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Henüz yorum yok. İlk yorumu siz yazın!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kategoriler</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => onNavigate('blog')}
                      className="flex items-center justify-between w-full py-2 text-gray-600 hover:text-[#0077be] transition-colors"
                    >
                      <span>{cat.category}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Benzer Yazılar</h3>
                <div className="space-y-4">
                  {related.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate('blog-post', item.slug)}
                      className="flex gap-4 group text-left w-full"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 group-hover:text-[#0077be] transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.date} · {item.readTime}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-[#0077be] to-[#00a8e8] rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Bültenimize Abone Olun</h3>
              <p className="text-white/80 text-sm mb-4">
                Yeni makalelerden ilk siz haberdar olun.
              </p>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30 mb-3"
              />
              <Button className="w-full bg-white text-[#0077be] hover:bg-gray-100">
                Abone Ol
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

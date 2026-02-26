import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import type { Page } from '../App';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  category_slug: string;
  tags: string[];
  slug: string;
  views: number;
}

interface Category {
  category: string;
  slug: string;
  count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface BlogProps {
  onNavigate: (page: Page, slug?: string) => void;
}

const API_BASE = API_ENDPOINTS.blog;

const parseBlogQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const pageParam = Number(params.get('page') || '1');

  return {
    category: params.get('category') || 'all',
    query: params.get('q') || '',
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
  };
};

const buildBlogQueryString = (category: string, query: string, page: number) => {
  const params = new URLSearchParams();

  if (category !== 'all') {
    params.set('category', category);
  }

  if (query.trim()) {
    params.set('q', query.trim());
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export default function Blog({ onNavigate }: BlogProps) {
  const initialQuery = parseBlogQuery();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { category: 'Tümü', slug: 'all', count: 0 }
  ]);
  const [activeCategory, setActiveCategory] = useState(initialQuery.category);
  const [searchQuery, setSearchQuery] = useState(initialQuery.query);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(initialQuery.query);
  const [currentPage, setCurrentPage] = useState(initialQuery.page);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Keep local state synced with browser back/forward when staying on blog page
  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/blog')) return;

      const nextQuery = parseBlogQuery();
      setActiveCategory(nextQuery.category);
      setSearchQuery(nextQuery.query);
      setAppliedSearchQuery(nextQuery.query);
      setCurrentPage(nextQuery.page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch posts when filters or pagination changes
  useEffect(() => {
    fetchPosts(currentPage);
  }, [activeCategory, appliedSearchQuery, currentPage]);

  // Reflect active filters in URL query parameters
  useEffect(() => {
    const nextUrl = `${window.location.pathname}${buildBlogQueryString(activeCategory, appliedSearchQuery, currentPage)}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, [activeCategory, appliedSearchQuery, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}?action=categories`);
      const data = await response.json();
      if (data.success) {
        const fetchedCategories: Category[] = data.categories;
        setCategories(fetchedCategories);

        const categoryExists = fetchedCategories.some((category) => category.slug === activeCategory);
        if (!categoryExists) {
          setActiveCategory('all');
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchPosts = async (page: number = 1) => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        action: 'list',
        page: page.toString(),
        limit: '12'
      });
      
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      
      if (appliedSearchQuery) {
        params.append('search', appliedSearchQuery);
      }
      
      const response = await fetch(`${API_BASE}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      // Fallback to empty state
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearchQuery(searchQuery.trim());
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'newsletter', email, name: '' })
      });
      
      if (response.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      }
    } catch (err) {
      console.error('Newsletter error:', err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f7fc]">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#0077be]/30">
        <div className="cvk-container">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-2 bg-[#0077be]/20 rounded-full text-[#00a8e8] text-sm font-medium mb-6">
              Blog
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ambalaj Dünyasından <span className="text-[#00a8e8]">İçgörüler</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Tasarım trendleri, sürdürülebilirlik ipuçları ve sektör haberleri
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Makale ara..."
                className="w-full pl-12 pr-24 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-[#0077be] focus:outline-none focus:bg-white/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#0077be] text-white rounded-lg hover:bg-[#005a8f] transition-colors"
              >
                Ara
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="cvk-container">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-[#0077be] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === cat.slug ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="cvk-container">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-[#0077be] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchPosts()}>Tekrar Dene</Button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory === 'all' ? 'Tüm Makaleler' : categories.find(c => c.slug === activeCategory)?.category}
                  <span className="text-gray-400 font-normal ml-2">({pagination.total})</span>
                </h2>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setAppliedSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="text-[#0077be] hover:underline"
                  >
                    Aramayı Temizle
                  </button>
                )}
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-24">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-gray-600">Farklı bir arama terimi veya kategori deneyin.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, idx) => (
                      <article
                        key={post.id}
                        onClick={() => onNavigate('blog-post', post.slug)}
                        className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
                          idx === 0 && activeCategory === 'all' && !searchQuery ? 'md:col-span-2 lg:col-span-2' : ''
                        }`}
                      >
                        {/* Image */}
                        <div className={`relative overflow-hidden ${
                          idx === 0 && activeCategory === 'all' && !searchQuery ? 'aspect-video' : 'aspect-[4/3]'
                        }`}>
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-[#0077be] text-white text-xs font-semibold rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Meta */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime} okuma
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0077be] transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>

                          {/* Author & Read More */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#0077be] flex items-center justify-center text-white text-sm font-medium">
                                {post.author[0]}
                              </div>
                              <span className="text-sm text-gray-600">{post.author}</span>
                            </div>
                            <span className="flex items-center gap-1 text-[#0077be] font-medium group-hover:gap-2 transition-all">
                              Devamını Oku
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Önceki
                      </Button>
                      <span className="px-4 py-2 text-gray-600">
                        Sayfa {pagination.page} / {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Sonraki
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0077be] to-[#00a8e8]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Blog Yazılarımızı Kaçırmayın
          </h2>
          <p className="text-white/90 mb-8">
            Yeni makalelerden haberdar olmak için bültenimize abone olun.
          </p>
          {subscribed ? (
            <div className="bg-white/20 rounded-xl p-4 text-white">
              ✅ Başarıyla abone oldunuz!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30"
              />
              <Button type="submit" className="bg-white text-[#0077be] hover:bg-gray-100 px-8">
                Abone Ol
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

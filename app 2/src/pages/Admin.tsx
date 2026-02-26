import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS, getAuthToken, clearAuthStorage } from '@/lib/api';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import type { Page } from '../App';
import AdminDashboard from '@/components/AdminDashboard';

interface AdminProps {
  onNavigate: (page: Page, slug?: string) => void;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  likes: number;
  date: string;
}

interface Comment {
  id: number;
  post_title: string;
  author_name: string;
  content: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Stats {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  pendingComments: number;
}

const API_BASE = API_ENDPOINTS.blog;

export default function Admin({ onNavigate }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard' | 'posts' | 'comments' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalViews: 0, totalComments: 0, pendingComments: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Check if admin
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'overview') fetchDashboard();
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'comments') fetchComments();
  }, [activeTab]);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('admin-login');
      return;
    }
    
    // Verify admin status
    try {
      const response = await fetch(`${API_ENDPOINTS.auth}?action=me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!data.success || data.user.role !== 'admin') {
        onNavigate('admin-login');
        return;
      }
      
      setIsLoading(false);
    } catch {
      onNavigate('admin-login');
    }
  };

  const fetchDashboard = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}?action=admin_list&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const totalViews = data.posts.reduce((sum: number, p: BlogPost) => sum + p.views, 0);
        setStats({
          totalPosts: data.pagination.total,
          totalViews,
          totalComments: 0, // Fetch from separate endpoint
          pendingComments: 0,
        });
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({ action: 'admin_list', limit: '50' });
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Veriler yüklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    // In production: fetch from API
    setTimeout(() => {
      setComments([
        { id: 1, post_title: '2024 Ambalaj Tasarım Trendleri', author_name: 'Ahmet Yılmaz', content: 'Çok faydalı bir yazı olmuş, teşekkürler!', date: '19 Şubat 2024', status: 'pending' },
        { id: 2, post_title: 'Doypack Poşetler', author_name: 'Mehmet Kaya', content: 'Fiyat bilgisi alabilir miyim?', date: '18 Şubat 2024', status: 'approved' },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleDeletePost = async (id: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'delete', id })
      });
      
      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter(p => p.id !== id));
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      alert('Silme işlemi başarısız');
    }
  };

  const handleModerateComment = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    try {
      const token = getAuthToken();
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'moderate_comment', commentId: id, action_type: action })
      });
      
      fetchComments();
    } catch (err) {
      console.error('Moderation error:', err);
    }
  };

  const handleLogout = () => {
    clearAuthStorage();
    onNavigate('home');
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && (activeTab === 'dashboard' || activeTab === 'overview')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#0077be] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1a2e] text-white z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0077be] rounded-lg flex items-center justify-center">
              <span className="font-bold">CVK</span>
            </div>
            <div>
              <h1 className="font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">cvkdijital.com</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-[#0077be]' : 'hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Gelişmiş Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#0077be]' : 'hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Blog Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'posts' ? 'bg-[#0077be]' : 'hover:bg-white/10'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Blog Yazıları</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'comments' ? 'bg-[#0077be]' : 'hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Yorumlar</span>
              {stats.pendingComments > 0 && (
                <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingComments}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-[#0077be]' : 'hover:bg-white/10'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Yonetim ekranindan cikmadan siteyi yeni sekmede onizleyin.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Siteyi Onizle
          </Button>
        </div>

        {/* Overview - Advanced Dashboard */}
        {activeTab === 'overview' && (
          <AdminDashboard />
        )}

        {/* Blog Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <Button 
                onClick={() => setActiveTab('posts')}
                className="bg-[#0077be] hover:bg-[#005a8f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Yazı
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#0077be]" />
                  </div>
                  <span className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12%
                  </span>
                </div>
                <p className="text-gray-500 text-sm">Toplam Yazı</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +24%
                  </span>
                </div>
                <p className="text-gray-500 text-sm">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-red-600 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -5%
                  </span>
                </div>
                <p className="text-gray-500 text-sm">Toplam Yorum</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Bekleyen Yorum</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingComments}</p>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Son Yazılar</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-500">{post.category} · {post.views} görüntülenme</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      post.status === 'published' ? 'bg-green-100 text-green-700' :
                      post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status === 'published' ? 'Yayında' :
                       post.status === 'draft' ? 'Taslak' : 'Arşiv'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Posts Management */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Blog Yazıları</h2>
              <Button 
                onClick={() => {/* Open create modal */}}
                className="bg-[#0077be] hover:bg-[#005a8f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Yazı
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Yazı ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077be]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); fetchPosts(); }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077be]"
              >
                <option value="">Tüm Durumlar</option>
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Başlık</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kategori</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Görüntülenme</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tarih</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 text-[#0077be] animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Yazı bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{post.title}</p>
                            <p className="text-sm text-gray-500">/{post.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{post.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            post.status === 'published' ? 'bg-green-100 text-green-700' :
                            post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {post.status === 'published' ? 'Yayında' :
                             post.status === 'draft' ? 'Taslak' : 'Arşiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{post.views}</td>
                        <td className="px-6 py-4 text-gray-600">{post.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onNavigate('blog-post', post.slug)}
                              className="p-2 text-gray-400 hover:text-[#0077be] transition-colors"
                              title="Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Düzenle">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(post.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments Management */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Yorum Moderasyonu</h2>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#0077be] animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Henüz yorum yok
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium text-gray-900">{comment.author_name}</p>
                        <p className="text-sm text-gray-500">{comment.post_title} · {comment.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        comment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        comment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {comment.status === 'approved' ? 'Onaylandı' :
                         comment.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{comment.content}</p>
                    <div className="flex gap-2">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleModerateComment(comment.id, 'approve')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Onayla
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => handleModerateComment(comment.id, 'reject')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reddet
                        </button>
                      )}
                      <button
                        onClick={() => handleModerateComment(comment.id, 'delete')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
            <p className="text-gray-600">Ayarlar bölümü yakında eklenecek.</p>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yazıyı Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={() => handleDeletePost(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

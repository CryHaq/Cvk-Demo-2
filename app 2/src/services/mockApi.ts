/**
 * Mock API Service
 * 
 * BU DOSYA GEÇİCİDİR - Veritabanı eklendiğinde değiştirilecek:
 * 
 * 1. Şu an: localStorage + Mock Data kullanıyor
 * 2. Gelecekte: Gerçek PHP API çağrılarına dönüştürülecek
 * 
 * DEĞİŞTİRİLECEK DOSYALAR:
 * - src/services/mockApi.ts -> src/services/api.ts
 * - localStorage.setItem() -> fetch/axios POST
 * - localStorage.getItem() -> fetch/axios GET
 * 
 * AYNI KALACAKLAR:
 * - TypeScript interface'ler (src/types/*.ts)
 * - React component'lerin kullanım şekli
 * - Error handling yapısı
 */

import type { BlogPost, BlogPostDetail, Comment } from '../types/blog';
import type { ChatSession, ChatMessage } from '../types/chat';

// ==========================================
// MOCK DATA (Veritabanına geçince silinecek)
// ==========================================
const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: '2024 Ambalaj Tasarım Trendleri: Sürdürülebilirlik ve İnovasyon',
    excerpt: 'Günümüzün çevre bilinci yüksek tüketicileri için sürdürülebilir ambalaj çözümleri nasıl tasarlanmalı?',
    slug: '2024-ambalaj-tasarim-trendleri',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    author: 'Ayşe Yılmaz',
    date: '15 Şubat 2024',
    readTime: '5 dk',
    category: 'Ambalaj Tasarımı',
    category_slug: 'ambalaj-tasarimi',
    tags: ['sürdürülebilirlik', 'trendler', 'tasarım'],
    views: 1247,
  },
  {
    id: 2,
    title: 'Doypack Poşetler: Gıda Endüstrisinin Vazgeçilmezi',
    excerpt: 'Doypack poşetler neden gıda sektöründe bu kadar popüler?',
    slug: 'doypack-posetler-gida-endustrisi',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    author: 'Mehmet Kaya',
    date: '12 Şubat 2024',
    readTime: '4 dk',
    category: 'Üretim',
    category_slug: 'uretim',
    tags: ['doypack', 'gıda', 'ambalaj'],
    views: 892,
  },
  {
    id: 3,
    title: 'E-Ticarette Ambalajın Önemi: Müşteri Deneyimi',
    excerpt: 'Online alışverişte ambalaj sadece koruma değil, marka deneyiminin bir parçası.',
    slug: 'eticarette-ambalajin-onemi',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    author: 'Zeynep Demir',
    date: '8 Şubat 2024',
    readTime: '6 dk',
    category: 'Pazarlama',
    category_slug: 'pazarlama',
    tags: ['e-ticaret', 'müşteri deneyimi', 'marka'],
    views: 2156,
  },
];

// ==========================================
// BLOG API
// Şu an: localStorage | Gelecekte: /php/blog.php
// ==========================================
export const BlogAPI = {
  getPosts: async (filters?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{
    posts: BlogPost[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> => {
    // Gelecekte: const response = await fetch('/php/blog.php?action=list');
    // Gelecekte: return response.json();
    
    let posts = JSON.parse(localStorage.getItem('blog_posts') || JSON.stringify(MOCK_BLOG_POSTS));
    
    if (filters?.category && filters.category !== 'all') {
      posts = posts.filter((p: BlogPost) => p.category_slug === filters.category);
    }
    
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      posts = posts.filter((p: BlogPost) => 
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query)
      );
    }
    
    const limit = filters?.limit || 12;
    const page = filters?.page || 1;
    const total = posts.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedPosts = posts.slice(start, start + limit);
    
    return { posts: paginatedPosts, pagination: { page, limit, total, pages } };
  },

  getPost: async (slug: string): Promise<BlogPostDetail | null> => {
    // Gelecekte: const response = await fetch(`/php/blog.php?action=get&slug=${slug}`);
    
    const posts = JSON.parse(localStorage.getItem('blog_posts') || JSON.stringify(MOCK_BLOG_POSTS));
    const post = posts.find((p: BlogPost) => p.slug === slug);
    
    if (post) {
      post.views++;
      localStorage.setItem('blog_posts', JSON.stringify(posts));
      
      return {
        ...post,
        author_bio: 'Ambalaj uzmanı ve sürdürülebilirlik danışmanı.',
        content: `
          <p class="lead">${post.excerpt}</p>
          <h2>Giriş</h2>
          <p>Ambalaj endüstrisi sürekli gelişiyor ve değişiyor. Bu makalede öne çıkan trendleri inceleyeceğiz.</p>
          <h2>Detaylar</h2>
          <p>Burada detaylı içerik yer alacak...</p>
          <blockquote>"Ambalaj sadece bir koruma değil, marka deneyiminin parçasıdır."</blockquote>
          <h2>Sonuç</h2>
          <p>Sürdürülebilir ve inovatif ambalaj çözümleri için CVK Ambalaj yanınızda.</p>
        `,
        related: posts.filter((p: BlogPost) => p.id !== post.id).slice(0, 3),
        meta_title: `${post.title} | CVK Blog`,
        meta_description: post.excerpt,
      };
    }
    
    return null;
  },

  getCategories: async (): Promise<{ category: string; slug: string; count: number }[]> => {
    const posts = JSON.parse(localStorage.getItem('blog_posts') || JSON.stringify(MOCK_BLOG_POSTS));
    const categories = [
      { category: 'Tümü', slug: 'all', count: posts.length },
      { category: 'Ambalaj Tasarımı', slug: 'ambalaj-tasarimi', count: posts.filter((p: BlogPost) => p.category_slug === 'ambalaj-tasarimi').length },
      { category: 'Üretim', slug: 'uretim', count: posts.filter((p: BlogPost) => p.category_slug === 'uretim').length },
      { category: 'Pazarlama', slug: 'pazarlama', count: posts.filter((p: BlogPost) => p.category_slug === 'pazarlama').length },
    ];
    return categories;
  },

  addComment: async (postId: number, data: { authorName: string; authorEmail: string; content: string }): Promise<void> => {
    // Gelecekte: await fetch('/php/blog.php', { method: 'POST', body: JSON.stringify({ action: 'add_comment' }) });
    
    const comments = JSON.parse(localStorage.getItem(`blog_comments_${postId}`) || '[]');
    comments.push({
      id: Date.now(),
      post_id: postId,
      author_name: data.authorName,
      author_email: data.authorEmail,
      content: data.content,
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'pending',
    });
    localStorage.setItem(`blog_comments_${postId}`, JSON.stringify(comments));
  },

  getComments: async (postId: number): Promise<Comment[]> => {
    return JSON.parse(localStorage.getItem(`blog_comments_${postId}`) || '[]')
      .filter((c: Comment) => c.status === 'approved');
  },

  // Admin fonksiyonları
  createPost: async (post: any): Promise<void> => {
    // Gelecekte: await fetch('/php/blog.php', { method: 'POST', body: JSON.stringify({ action: 'create' }) });
    
    const posts = JSON.parse(localStorage.getItem('blog_posts') || JSON.stringify(MOCK_BLOG_POSTS));
    posts.unshift({ ...post, id: Date.now(), views: 0 });
    localStorage.setItem('blog_posts', JSON.stringify(posts));
  },

  updatePost: async (id: number, post: any): Promise<void> => {
    const posts = JSON.parse(localStorage.getItem('blog_posts') || JSON.stringify(MOCK_BLOG_POSTS));
    const index = posts.findIndex((p: BlogPost) => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...post };
      localStorage.setItem('blog_posts', JSON.stringify(posts));
    }
  },

  deletePost: async (id: number): Promise<void> => {
    const posts = JSON.parse(localStorage.getItem('blog_posts') || JSON.stringify(MOCK_BLOG_POSTS));
    localStorage.setItem('blog_posts', JSON.stringify(posts.filter((p: BlogPost) => p.id !== id)));
  },
};

// ==========================================
// CHAT API
// Şu an: localStorage | Gelecekte: /php/chat.php
// ==========================================
export const ChatAPI = {
  startSession: async (userInfo: { name: string; email: string; phone?: string }): Promise<ChatSession> => {
    // Gelecekte: await fetch('/php/chat.php?action=start_session', { method: 'POST' });
    
    const session: ChatSession = {
      id: 'session_' + Date.now(),
      userInfo,
      agent: {
        name: 'AI Destek',
        avatar: '🤖',
        title: 'Yapay Zeka Asistanı',
      },
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    
    localStorage.setItem('chat_current_session', JSON.stringify(session));
    localStorage.setItem(`chat_messages_${session.id}`, JSON.stringify([]));
    
    // Otomatik karşılama mesajı
    setTimeout(() => {
      const messages = JSON.parse(localStorage.getItem(`chat_messages_${session.id}`) || '[]');
      messages.push({
        id: Date.now(),
        sender: 'agent',
        text: `Merhaba ${userInfo.name}! Size nasıl yardımcı olabilirim?`,
        timestamp: new Date().toISOString(),
        agentName: 'AI Destek',
        agentAvatar: '🤖',
      });
      localStorage.setItem(`chat_messages_${session.id}`, JSON.stringify(messages));
    }, 500);
    
    return session;
  },

  sendMessage: async (sessionId: string, text: string): Promise<void> => {
    const messages = JSON.parse(localStorage.getItem(`chat_messages_${sessionId}`) || '[]');
    messages.push({
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
    
    // AI yanıtı simülasyonu
    setTimeout(() => {
      const responses = [
        'Anladım, konuyu inceliyorum...',
        'Size en kısa sürede yardımcı olacağım.',
        'Bu konuda size yardımcı olabilirim.',
        'Lütfen biraz bekleyin, bilgileri kontrol ediyorum.',
      ];
      const updatedMessages = JSON.parse(localStorage.getItem(`chat_messages_${sessionId}`) || '[]');
      updatedMessages.push({
        id: Date.now() + 1,
        sender: 'agent',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        agentName: 'AI Destek',
        agentAvatar: '🤖',
      });
      localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(updatedMessages));
    }, 1500);
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    return JSON.parse(localStorage.getItem(`chat_messages_${sessionId}`) || '[]');
  },

  closeSession: async (sessionId: string): Promise<void> => {
    const session = JSON.parse(localStorage.getItem('chat_current_session') || '{}');
    if (session.id === sessionId) {
      session.status = 'closed';
      localStorage.setItem('chat_current_session', JSON.stringify(session));
    }
  },
};

// ==========================================
// AUTH API
// Şu an: localStorage | Gelecekte: /php/auth.php
// ==========================================
export const AuthAPI = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: any; token?: string; error?: string }> => {
    // Gelecekte: await fetch('/php/auth.php', { method: 'POST', body: JSON.stringify({ action: 'login' }) });
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const token = 'mock_token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      return { success: true, user, token };
    }
    
    return { success: false, error: 'Geçersiz e-posta veya şifre' };
  },

  register: async (userData: any): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: any) => u.email === userData.email)) {
      return { success: false, error: 'Bu e-posta zaten kayıtlı' };
    }
    
    const newUser = { ...userData, id: Date.now(), role: 'customer' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Otomatik login
    const token = 'mock_token_' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    
    return { success: true };
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
  },

  getCurrentUser: (): any | null => {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// ==========================================
// MIGRATION GUIDE
// ==========================================
/*
VERİTABANI GEÇİŞ REHBERİ:

1. Önce PHP API dosyalarını oluştur:
   - php/blog.php
   - php/chat.php
   - php/auth.php

2. Sonra bu dosyadaki fonksiyonları değiştir:

   ÖRNEK:
   
   // ESKİ (Mock):
   getPosts: async () => {
     return JSON.parse(localStorage.getItem('blog_posts'));
   }
   
   // YENİ (API):
   getPosts: async () => {
     const response = await fetch('/php/blog.php?action=list');
     return response.json();
   }

3. Component'lerde değişiklik gerekmez çünkü aynı interface kullanılıyor!

4. localStorage verilerini veritabanına aktar:
   - Admin panelinden "Export Data" butonu
   - Veya SQL import dosyası oluştur
*/

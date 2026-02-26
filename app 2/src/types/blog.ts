/**
 * Blog Type Definitions
 * 
 * Bu interface'ler hem mock API'de hem de gerçek API'de kullanılacak.
 * Veritabanı şemasıyla uyumlu olmalı.
 */

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  category_slug: string;
  tags: string[];
  views: number;
  likes?: number;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  author_bio?: string;
  related?: BlogPost[];
  meta_title?: string;
  meta_description?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_id?: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

// Admin için
export interface BlogPostInput {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  author_bio?: string;
  category: string;
  tags: string[];
  readTime: string;
  status: 'draft' | 'published' | 'archived';
}

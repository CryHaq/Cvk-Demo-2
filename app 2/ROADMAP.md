# CVK Dijital - Geliştirme Yol Haritası

Bu doküman, projenin mevcut durumunu ve veritabanı ekleninceye kadar olan geliştirme planını içerir.

---

## ✅ MEVCUT DURUM (Veritabansız)

### Tamamlanan Frontend Özellikleri

| Özellik | Durum | Teknoloji |
|---------|-------|-----------|
| Lazy Loading | ✅ | React.lazy + Suspense |
| Çoklu Dil (TR/EN) | ✅ | i18next |
| Analytics | ✅ | Google Analytics + Meta Pixel |
| Canlı Destek UI | ✅ | React + localStorage |
| Blog UI | ✅ | React + mock data |
| Auth UI | ✅ | React + localStorage |
| Admin Panel UI | ✅ | React + mock data |
| SEO Meta Tags | ✅ | Dinamik helmet |
| Structured Data | ✅ | JSON-LD |

### Klasör Yapısı
```
src/
├── components/     # UI bileşenleri
├── pages/          # Sayfa bileşenleri
├── contexts/       # React contexts (Cart, Auth, Wishlist)
├── types/          # TypeScript interface'leri ✅
├── services/       # API servisleri ✅
│   └── mockApi.ts  # Şu an: mock/localStorage
│   └── api.ts      # Gelecekte: gerçek API
├── i18n/           # Çeviri dosyaları
└── hooks/          # Custom hooks (gelecekte eklenecek)
```

---

## 🔄 VERİTABANI GEÇİŞ PLANI

### Aşama 1: Backend Hazırlığı (1-2 gün)

#### 1.1 PHP API Dosyaları
```php
/php/
├── config.php          # Veritabanı bağlantı ayarları
├── auth.php            # Login/Register API
├── blog.php            # Blog CRUD API
├── chat.php            # Chat oturum/mesaj API
├── contact.php         # İletişim formu API
├── save_order.php      # Sipariş kaydetme API
└── db_setup.sql        # Veritabanı şeması
```

#### 1.2 MySQL Tabloları
```sql
-- Gerekli tablolar:
1. users              # Kullanıcılar
2. blog_posts         # Blog yazıları
3. blog_comments      # Blog yorumları
4. chat_sessions      # Chat oturumları
5. chat_messages      # Chat mesajları
6. orders             # Siparişler
7. order_items        # Sipariş ürünleri
8. products           # Ürünler (opsiyonel)
```

### Aşama 2: Servis Katmanı Değişikliği (2-3 saat)

**Şu an:**
```typescript
// src/services/mockApi.ts
export const BlogAPI = {
  getPosts: async () => {
    return JSON.parse(localStorage.getItem('posts'));
  }
}
```

**Gelecekte:**
```typescript
// src/services/api.ts
export const BlogAPI = {
  getPosts: async () => {
    const response = await fetch('/php/blog.php?action=list');
    return response.json();
  }
}
```

### Aşama 3: Environment Variables (.env)

```bash
# .env.production (cPanel deploy için)
VITE_API_BASE_URL=/php
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=XXXXXXXXXX
```

---

## 📋 GELİŞTİRME ÖNERİLERİ

### 1. Öncelik: State Management
**Şu an:** React Context (yeterli)
**Gelecekte:** Redux Toolkit veya Zustand (büyük veri için)

```typescript
// Şu an
const { user } = useAuth();

// Gelecekte
const user = useAppSelector(state => state.auth.user);
```

### 2. API Client
**Şu an:** Native fetch
**Gelecekte:** Axios + Interceptor

```typescript
// api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 3. React Query (Önerilir)
**Şu an:** useEffect + useState
**Gelecekte:** TanStack Query

```typescript
// Şu an
const [posts, setPosts] = useState([]);
useEffect(() => {
  fetchPosts().then(setPosts);
}, []);

// Gelecekte
const { data: posts, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: BlogAPI.getPosts
});
```

### 4. Form Yönetimi
**Şu an:** Native React state
**Gelecekte:** React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### 5. Testing
**Şu an:** Yok
**Gelecekte:** Vitest + React Testing Library

```typescript
// __tests__/Blog.test.tsx
import { render, screen } from '@testing-library/react';

test('renders blog posts', async () => {
  render(<Blog />);
  expect(await screen.findByText('Blog')).toBeInTheDocument();
});
```

---

## 🎯 SIRADAKİ ADIMLAR (Öncelik Sırası)

### 1. Hemen Yapılabilir (Veritabanı yok)
- [ ] Dark mode toggle
- [ ] PWA (Progressive Web App)
- [ ] Image gallery/lightbox
- [ ] Toast notifications
- [ ] Loading skeletons

### 2. Veritabanı Gerekli
- [ ] Gerçek canlı destek (agent paneli)
- [ ] Blog yazısı yönetimi (admin)
- [ ] Sipariş takibi (gerçek durum)
- [ ] Kullanıcı adres defteri
- [ ] Ürün stok takibi

### 3. İleri Seviye
- [ ] WebSocket (gerçek zamanlı chat)
- [ ] Server-Side Rendering (SSR)
- [ ] CDN entegrasyonu
- [ ] Ödeme entegrasyonu (iyzico, Stripe)

---

## 🔧 VERİTABANI GEÇİŞİ KONTROL LİSTESİ

```
[ ] PHP dosyaları cPanel'e yüklendi
[ ] MySQL veritabanı oluşturuldu
[ ] db_setup.sql çalıştırıldı
[ ] config.php veritabanı bilgileri güncellendi
[ ] API endpoint'leri test edildi (Postman)
[ ] mockApi.ts -> api.ts değişimi yapıldı
[ ] Build alındı ve test edildi
[ ] Production deploy edildi
```

---

## 📝 NOTLAR

1. **Component'ler aynı kalacak** - Sadece servis katmanı değişecek
2. **TypeScript interface'leri aynı** - BlogPost, ChatMessage vs.
3. **localStorage verileri taşınabilir** - Export/Import scripti yazılabilir
4. **Test kullanıcıları hazır** - mockApi.ts içinde örnek kullanıcılar var

---

## 🆘 DESTEK

Veritabanı geçişi sırasında sorun yaşarsanız:
1. `src/services/mockApi.ts` içindeki MIGRATION GUIDE bölümünü okuyun
2. PHP API dosyalarını `cvk-cpanel/public_html/php/` klasörüne kopyalayın
3. Herhangi bir component'i değiştirmenize gerek yok!

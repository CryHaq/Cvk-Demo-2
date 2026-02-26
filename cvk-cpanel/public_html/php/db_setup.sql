
-- Database Setup Script
-- Run this in phpMyAdmin after creating your database

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `shipping_first_name` varchar(100) NOT NULL,
  `shipping_last_name` varchar(100) NOT NULL,
  `shipping_company` varchar(200) DEFAULT NULL,
  `shipping_vat` varchar(50) DEFAULT NULL,
  `shipping_sdi` varchar(50) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `shipping_province` varchar(100) DEFAULT NULL,
  `shipping_country` varchar(100) NOT NULL DEFAULT 'Türkiye',
  `billing_first_name` varchar(100) DEFAULT NULL,
  `billing_last_name` varchar(100) DEFAULT NULL,
  `billing_company` varchar(200) DEFAULT NULL,
  `billing_vat` varchar(50) DEFAULT NULL,
  `billing_address` text DEFAULT NULL,
  `billing_city` varchar(100) DEFAULT NULL,
  `billing_postal_code` varchar(20) DEFAULT NULL,
  `billing_province` varchar(100) DEFAULT NULL,
  `billing_country` varchar(100) DEFAULT 'Türkiye',
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_cost` decimal(10,2) NOT NULL,
  `vat_amount` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `shipping_method` varchar(50) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_email` (`customer_email`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(11) unsigned NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_options` text DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `message_type` enum('company','agency','reseller','other') NOT NULL DEFAULT 'other',
  `message` text NOT NULL,
  `status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample kit orders table
CREATE TABLE IF NOT EXISTS `sample_kit_orders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `company` varchar(200) NOT NULL,
  `market` varchar(200) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role` (`role`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets table
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BLOG SYSTEM TABLES
-- ============================================

-- Blog posts table
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `author` varchar(200) NOT NULL DEFAULT 'CVK Ambalaj',
  `author_bio` text DEFAULT NULL,
  `category` varchar(200) NOT NULL DEFAULT 'Genel',
  `category_slug` varchar(200) NOT NULL DEFAULT 'genel',
  `tags` json DEFAULT NULL,
  `read_time` varchar(50) DEFAULT '5 dk',
  `views` int(11) unsigned NOT NULL DEFAULT 0,
  `likes` int(11) unsigned NOT NULL DEFAULT 0,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_slug` (`category_slug`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`),
  FULLTEXT KEY `search` (`title`, `excerpt`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog comments table
CREATE TABLE IF NOT EXISTS `blog_comments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int(11) unsigned NOT NULL,
  `author_name` varchar(200) NOT NULL,
  `author_email` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `status` enum('pending','approved','rejected','spam') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `status` (`status`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample blog posts
INSERT INTO `blog_posts` (`title`, `slug`, `excerpt`, `content`, `image`, `author`, `author_bio`, `category`, `category_slug`, `tags`, `read_time`, `status`, `meta_title`, `meta_description`) VALUES
(
  '2024 Ambalaj Tasarım Trendleri: Sürdürülebilirlik ve İnovasyon',
  '2024-ambalaj-tasarim-trendleri',
  'Günümüzün çevre bilinci yüksek tüketicileri için sürdürülebilir ambalaj çözümleri nasıl tasarlanmalı? İşte öne çıkan trendler...',
  '<p class="lead">Ambalaj endüstrisi, son yıllarda sürdürülebilirlik ve çevre dostu çözümler doğrultusunda büyük bir dönüşüm yaşıyor. 2024 yılında bu trendler daha da belirginleşiyor.</p>
  
  <h2>Sürdürülebilirliğin Yükselişi</h2>
  <p>Günümüz tüketicileri, satın aldıkları ürünlerin çevresel etkisini daha fazla sorguluyor. Ambalajlar sadece koruma ve taşıma fonksiyonu gören unsurlar olmaktan çıkıp, markaların sürdürülebilirlik taahhütlerini yansıtan stratejik unsurlar haline geliyor.</p>
  
  <blockquote>"Ambalaj artık bir ürünün değil, bir deneyimin parçası. Tüketiciler, ambalajdan ürüne kadar her aşamada sürdürülebilirlik bekliyor."</blockquote>
  
  <h2>Öne Çıkan Trendler</h2>
  <h3>1. Monomaterial Ambalajlar</h3>
  <p>Farklı malzemelerin bir arada kullanıldığı çok katmanlı ambalajlar, geri dönüşüm sürecinde zorluklar yaratıyor. Monomaterial ambalajlar, geri dönüşümü kolaylaştırarak dairesel ekonomiye katkı sağlıyor.</p>
  
  <h3>2. Minimalist Tasarım</h3>
  <p>"Az daha fazladır" prensibi ambalaj tasarımına da yansıyor. Gereksiz malzeme kullanımını azaltan, basit ve fonksiyonel tasarımlar hem maliyet avantajı sağlıyor hem de çevresel ayak izini düşürüyor.</p>
  
  <h3>3. Akıllı Ambalajlar</h3>
  <p>NFC etiketleri, QR kodlar ve sensörler sayesinde ambalajlar artık "konuşabiliyor". Tüketicilere ürün kökeni, kullanım talimatları ve geri dönüşüm bilgileri sağlıyor.</p>
  
  <h3>4. Biyobazlı Malzemeler</h3>
  <p>Mısır nişastası, şeker kamışı ve mantar kökü gibi yenilenebilir kaynaklardan üretilen ambalaj malzemeleri, petrokimya bazlı plastiklere sürdürülebilir alternatifler sunuyor.</p>
  
  <h2>Sonuç</h2>
  <p>2024 ambalaj tasarım trendleri, sürdürülebilirlik ve inovasyonun kesişim noktasında şekilleniyor. CVK Ambalaj olarak, müşterilerimizin bu dönüşüme ayak uydurmasına destek olmaya devam ediyoruz.</p>',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
  'Ayşe Yılmaz',
  'Ambalaj tasarım uzmanı ve sürdürülebilirlik danışmanı. 10+ yıllık sektör deneyimi.',
  'Ambalaj Tasarımı',
  'ambalaj-tasarimi',
  '["sürdürülebilirlik", "trendler", "tasarım", "inovasyon", "2024"]',
  '5 dk',
  'published',
  '2024 Ambalaj Tasarım Trendleri | CVK Ambalaj',
  '2024 yılının öne çıkan ambalaj tasarım trendleri: Sürdürülebilirlik, minimalist tasarım, akıllı ambalajlar ve biyobazlı malzemeler.'
),
(
  'Doypack Poşetler: Gıda Endüstrisinin Vazgeçilmezi',
  'doypack-posetler-gida-endustrisi',
  'Doypack poşetler neden gıda sektöründe bu kadar popüler? Dayanıklılık, kullanım kolaylığı ve estetik avantajları...',
  '<p class="lead">Doypack poşetler, pratik kullanımı ve üstün koruma özellikleriyle gıda ambalajında devrim yaratıyor. Peki bu ambalaj tipi neden bu kadar tercih ediliyor?</p>
  
  <h2>Doypack Nedir?</h2>
  <p>Doypack, tabanı düz, üstü genellikle fermuarlı veya kilitli olan dik durabilen poşet ambalajlardır. Adını Fransız mucidi Louis Doyen\'dan alır.</p>
  
  <h2>Avantajları</h2>
  <ul>
    <li><strong>Raf verimliliği:</strong> Dik durabilme özelliği sayesinde rafta daha az yer kaplar</li>
    <li><strong>Kullanıcı deneyimi:</strong> Kolay açılıp kapanabilir</li>
    <li><strong>Dayanıklılık:</strong> Çok katmanlı yapısıyla ürünü korur</li>
    <li><strong>Baskı alanı:</strong> Geniş yüzeyi sayesinde etkileyici tasarımlar mümkün</li>
  </ul>
  
  <h2>Kullanım Alanları</h2>
  <p>Kahve, çay, kuruyemiş, granola, pet gıdaları ve daha birçok ürün için ideal çözümdür.</p>',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  'Mehmet Kaya',
  'Gıda ambalaj uzmanı. 15 yıllık sektör tecrübesi.',
  'Üretim',
  'uretim',
  '["doypack", "gıda", "ambalaj", "poşet"]',
  '4 dk',
  'published',
  'Doypack Poşetler | Gıda Ambalaj Çözümleri | CVK',
  'Doypack poşetlerin gıda endüstrisindeki avantajları ve kullanım alanları.'
),
(
  'E-Ticarette Ambalajın Önemi: Müşteri Deneyimi',
  'eticarette-ambalajin-onemi',
  'Online alışverişte ambalaj sadece koruma değil, aynı zamanda marka deneyiminin bir parçası. Başarılı stratejiler...',
  '<p class="lead">E-ticarette ambalaj, ürünü korumanın ötesinde marka deneyiminin kritik bir parçası haline geldi. Unboxing deneyimi, müşteri sadakati için kilit rol oynuyor.</p>
  
  <h2>Unboxing Deneyimi</h2>
  <p>Müşteriler ürünlerini açarken bir "deneyim" yaşamak istiyor. Bu noktada ambalajın tasarımı, kalitesi ve kişiselleştirilmesi büyük önem taşıyor.</p>
  
  <h2>Marka Hikayesi Anlatımı</h2>
  <p>Ambalaj üzerine eklenen QR kodlar, hikaye kartları veya kişiselleştirilmiş notlar, markanızın hikayesini anlatmanın mükemmel yollarıdır.</p>
  
  <h2>Pratik İpuçları</h2>
  <ul>
    <li>Marka renklerinizi tutarlı kullanın</li>
    <li>Kolay açılabilir tasarımlar tercih edin</li>
    <li>Sürdürülebilir malzemeler kullanın</li>
    <li>Kişiselleştirilmiş teşekkür notları ekleyin</li>
  </ul>',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
  'Zeynep Demir',
  'E-ticaret ve dijital pazarlama uzmanı.',
  'Pazarlama',
  'pazarlama',
  '["e-ticaret", "müşteri deneyimi", "marka", "unboxing"]',
  '6 dk',
  'published',
  'E-Ticarette Ambalajın Önemi | CVK Ambalaj',
  'E-ticarette ambalajın müşteri deneyimine etkisi ve başarılı stratejiler.'
),
(
  'Biyobozunur Ambalajlar: Gelecek Burada',
  'biyobozunur-ambalajlar-gelecek',
  'Plastik atık sorununa çözüm olarak biyobozunur ambalajlar hızla yaygınlaşıyor. Teknoloji, malzemeler ve faydalar...',
  '<p class="lead">Plastik kirliliği küresel bir sorun haline gelirken, biyobozunur ambalajlar çevre dostu bir alternatif olarak öne çıkıyor.</p>
  
  <h2>Biyobozunur Nedir?</h2>
  <p>Biyobozunur malzemeler, mikroorganizmalar tarafından belirli bir süre içinde doğal olarak parçalanabilen malzemelerdir. PLA (polilaktik asit), PHA ve selüloz bazlı malzemeler en yaygın örneklerdir.</p>
  
  <h2>Avantajları</h2>
  <ul>
    <li>Petrol bazlı plastiklere alternatif</li>
    <li>Kompostlanabilir</li>
    <li>Daha düşük karbon ayak izi</li>
    <li>Tüketici talebine uygun</li>
  </ul>
  
  <h2>Zorluklar</h2>
  <p>Maliyet, dayanıklılık ve geri dönüşüm altyapısı hala geliştirilmesi gereken alanlar. Ancak teknolojik gelişmeler bu sorunları gidermeye yardımcı oluyor.</p>',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80',
  'Can Yıldız',
  'Çevre mühendisi ve sürdürülebilirlik uzmanı.',
  'Sürdürülebilirlik',
  'surdurulebilirlik',
  '["biyobozunur", "çevre", "inovasyon", "plastik"]',
  '7 dk',
  'published',
  'Biyobozunur Ambalajlar | Çevre Dostu Çözümler | CVK',
  'Biyobozunur ambalajların çevresel faydaları ve sektördeki kullanımı.'
),
(
  'Gıda Güvenliği ve Ambalaj: Bilmeniz Gerekenler',
  'gida-guvenligi-ve-ambalaj',
  'Gıda ambalajları güvenliği nasıl sağlıyor? Bariyer özellikleri, kontaminasyon önleme ve regülasyonlar...',
  '<p class="lead">Gıda ambalajları, ürünleri dış etkenlerden koruyarak güvenliğini sağlarken, raf ömrünü de uzatır. Doğru ambalaj seçimi kritik önem taşır.</p>
  
  <h2>Bariyer Özellikleri</h2>
  <p>Gıda ambalajlarının başlıca görevlerinden biri oksijen, nem ve ışığı kontrol etmektir. Farklı gıdalar farklı bariyer gereksinimlerine sahiptir:</p>
  <ul>
    <li><strong>Snackler:</strong> Nem bariyeri</li>
    <li><strong>Kahve:</strong> Oksijen bariyeri</li>
    <li><strong>Süt ürünleri:</strong> Işık koruması</li>
  </ul>
  
  <h2>Mevzuat ve Standartlar</h2>
  <p>Türkiye\'de gıda ambalajları için TSE ve Gıda Kodeksi düzenlemeleri geçerlidir. Göçürgenlik, miktar ve etiketleme kuralları bu standartlarla belirlenir.</p>',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80',
  'Selin Arslan',
  'Gıda güvenliği uzmanı ve kalite müdürü.',
  'Gıda Güvenliği',
  'gida-guvenligi',
  '["gıda güvenliği", "bariyer", "standartlar", "mevzuat"]',
  '5 dk',
  'published',
  'Gıda Güvenliği ve Ambalaj | CVK Ambalaj',
  'Gıda ambalajlarında güvenlik standartları ve bariyer teknolojileri.'
),
(
  'Minimalist Ambalaj Tasarımı: Az Daha Fazla',
  'minimalist-ambalaj-tasarimi',
  '"Less is more!" Minimalist ambalaj tasarımı nedir, neden tercih edilir ve nasıl uygulanır? Örnekler ve ipuçları...',
  '<p class="lead">Minimalizm, karmaşıklıktan uzaklaşarak sade ve etkili çözümler sunar. Ambalaj tasarımında da bu yaklaşım giderek yaygınlaşıyor.</p>
  
  <h2>Minimalist Tasarımın Prensipleri</h2>
  <ul>
    <li>Gereksiz öğeleri kaldırın</li>
    <li>Beyaz alan kullanın</li>
    <li>Tipografi\'yi vurgulayın</li>
    <li>Kısıtlı renk paleti kullanın</li>
  </ul>
  
  <h2>Neden Minimalist?</h2>
  <p>Minimalist ambalajlar sadece estetik açıdan çekici değil, aynı zamanda maliyet tasarrufu ve sürdürülebilirlik avantajları da sunar. Daha az mürekkep, daha az malzeme kullanımı demektir.</p>
  
  <h2>Başarılı Örnekler</h2>
  <p>Apple, Muji ve Everlane gibi markalar minimalist ambalaj tasarımında öncüdür. Bu markalar, sade ama etkileyici ambalajlarla tüketicilere mesaj verir.</p>',
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=80',
  'Ayşe Yılmaz',
  'Ambalaj tasarım uzmanı ve sürdürülebilirlik danışmanı. 10+ yıllık sektör deneyimi.',
  'Ambalaj Tasarımı',
  'ambalaj-tasarimi',
  '["minimalizm", "tasarım", "estetik", "marka"]',
  '4 dk',
  'published',
  'Minimalist Ambalaj Tasarımı | Az Daha Fazla | CVK',
  'Minimalist ambalaj tasarımı prensipleri ve başarılı uygulama örnekleri.'
);

SET FOREIGN_KEY_CHECKS = 1;

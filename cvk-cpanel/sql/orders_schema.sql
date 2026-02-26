-- CVK Dijital - E-Ticaret Sipariş Tabloları
-- Aşama 1: Temel E-Ticaret Altyapısı

-- Siparişler Ana Tablosu
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    
    -- Fiyatlandırma
    subtotal DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Sipariş Durumu
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_token VARCHAR(255),
    
    -- Kargo Bilgileri
    shipping_company VARCHAR(50),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Teslimat Adresi (JSON olarak saklanacak)
    shipping_address JSON NOT NULL,
    billing_address JSON NOT NULL,
    
    -- Müşteri Notu
    customer_note TEXT,
    admin_note TEXT,
    
    -- Üretim Detayları
    estimated_production_days INT DEFAULT 15,
    production_started_at TIMESTAMP NULL,
    production_completed_at TIMESTAMP NULL,
    
    -- Zaman Damgaları
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sipariş Ürünleri Tablosu
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    
    -- Ürün Bilgileri (Konfigürasyondan gelen)
    product_type VARCHAR(100) DEFAULT 'Stand-Up Pouch',
    size VARCHAR(50) NOT NULL,
    dimensions VARCHAR(50),
    material VARCHAR(100) NOT NULL,
    material_spec VARCHAR(100),
    optional_features VARCHAR(100),
    corner_type VARCHAR(50),
    
    -- Miktar ve Fiyat
    quantity INT NOT NULL,
    graphics_count INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Tasarım Dosyası
    design_file_url VARCHAR(500),
    design_file_name VARCHAR(255),
    
    -- Özel Opsiyonlar
    has_zip BOOLEAN DEFAULT FALSE,
    has_valve BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sipariş Durum Geçmişi (Audit Trail)
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT,
    changed_by_type ENUM('system', 'admin', 'customer') DEFAULT 'system',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ödeme İşlemleri
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    
    -- iyzico/Payment Gateway Bilgileri
    payment_id VARCHAR(255),
    conversation_id VARCHAR(255),
    
    -- İşlem Detayları
    transaction_type ENUM('auth', 'capture', 'refund', 'cancel') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status ENUM('success', 'failure', 'pending') NOT NULL,
    
    -- Hata Bilgileri
    error_code VARCHAR(100),
    error_message TEXT,
    
    -- Raw Response (Debug için)
    gateway_response JSON,
    
    -- Bin/Kart Bilgileri (Maskeli)
    card_first_six VARCHAR(6),
    card_last_four VARCHAR(4),
    installment_count INT DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_payment_id (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- E-posta Bildirim Logları
CREATE TABLE IF NOT EXISTS email_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    user_id INT,
    
    email_type ENUM('order_confirmation', 'payment_received', 'production_started', 'shipped', 'delivered', 'order_cancelled') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    
    -- E-posta Durumu
    status ENUM('queued', 'sent', 'failed', 'opened') DEFAULT 'queued',
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    
    -- Hata Takibi
    error_message TEXT,
    retry_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kupon/İndirim Kodları (Gelecek aşama için hazır)
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount DECIMAL(10,2),
    
    -- Kullanım Limitleri
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    
    -- Geçerlilik
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kullanıcı Kupon Kullanımları
CREATE TABLE IF NOT EXISTS coupon_usages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_coupon (coupon_id, user_id, order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek Veri: İlk sipariş numarası için sequence
-- AUTO_INCREMENT alternatif, daha kontrollü sipariş numarası için

-- Varsayılan kupon ekle (Hoşgeldin indirimi)
INSERT INTO coupons (code, type, value, min_order_amount, max_discount, usage_limit, valid_until, is_active) 
VALUES ('HOSGELDIN10', 'percentage', 10.00, 500.00, 200.00, 100, DATE_ADD(NOW(), INTERVAL 3 MONTH), TRUE);

-- Kullanıcı tablosuna sipariş sayısı ve toplam harcama eklenecek (varsa alter, yoksa yok sayılacak)
-- ALTER TABLE users ADD COLUMN total_orders INT DEFAULT 0 AFTER created_at;
-- ALTER TABLE users ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0.00 AFTER total_orders;

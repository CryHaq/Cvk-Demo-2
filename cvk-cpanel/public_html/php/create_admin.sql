-- ============================================
-- ADMIN KULLANICI OLUŞTURMA
-- ============================================

-- Yöntem 1: Hazır Hash ile (Önerilen)
-- Aşağıdaki şifre: Admin123!
-- E-posta: admin@cvkdijital.com

INSERT INTO users (email, password_hash, first_name, last_name, phone, company, role, is_active, created_at) 
VALUES (
    'admin@cvkdijital.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'Admin',
    'Kullanıcı',
    '+90 555 123 4567',
    'CVK Ambalaj',
    'admin',
    1,
    NOW()
) ON DUPLICATE KEY UPDATE 
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'admin',
    is_active = 1;

-- ============================================
-- Yöntem 2: Kendi Şifrenizi Belirleyin
-- ============================================

-- Adım 1: PHP ile şifre hashleyin:
-- <?php echo password_hash('KENDI_SIFRENIZ', PASSWORD_BCRYPT); ?>

-- Adım 2: Aşağıdaki SQL'de HASH_DEĞERİ kısmını değiştirin:

/*
INSERT INTO users (email, password_hash, first_name, last_name, phone, company, role, is_active, created_at) 
VALUES (
    'admin@cvkdijital.com',
    'HASH_DEĞERİNİ_BURAYA_YAPIŞTIRIN',
    'Admin',
    'Kullanıcı',
    '+90 555 123 4567',
    'CVK Ambalaj',
    'admin',
    1,
    NOW()
);
*/

-- ============================================
-- EKSTRA ADMIN KULLANICILARI
-- ============================================

-- Editör rolü için (sadece blog yönetimi)
/*
INSERT INTO users (email, password_hash, first_name, last_name, phone, company, role, is_active, created_at) 
VALUES (
    'editor@cvkdijital.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Editör',
    'Kullanıcı',
    '+90 555 987 6543',
    'CVK Ambalaj',
    'admin', -- Şimdilik admin, ileride 'editor' eklenebilir
    1,
    NOW()
);
*/

-- ============================================
-- MEVCUT KULLANICIYI ADMİN YAPMA
-- ============================================

-- Belirli bir kullanıcıyı admin yapmak için:
/*
UPDATE users 
SET role = 'admin' 
WHERE email = 'kullanici@example.com';
*/

-- ============================================
-- KONTROL SORGULARI
-- ============================================

-- Tüm admin kullanıcılarını listele:
-- SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE role = 'admin';

-- Admin giriş bilgileri:
-- E-posta: admin@cvkdijital.com
-- Şifre: Admin123!

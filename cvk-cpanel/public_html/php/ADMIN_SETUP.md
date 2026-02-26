# Admin Kullanıcısı Oluşturma Kılavuzu

Bu kılavuz, CVK Dijital Admin Panel'e erişim için admin kullanıcısı oluşturma yöntemlerini açıklar.

## 🚀 Hızlı Başlangıç

### Yöntem 1: SQL ile Admin Oluştur (En Kolay)

1. **phpMyAdmin'e gidin**
2. **Veritabanınızı seçin**
3. **SQL sekmesine tıklayın**
4. **Aşağıdaki SQL'i yapıştırın ve çalıştırın:**

```sql
INSERT INTO users (email, password_hash, first_name, last_name, phone, company, role, is_active, created_at) 
VALUES (
    'admin@cvkdijital.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'Kullanıcı',
    '+90 555 123 4567',
    'CVK Ambalaj',
    'admin',
    1,
    NOW()
);
```

**Varsayılan Giriş Bilgileri:**
- E-posta: `admin@cvkdijital.com`
- Şifre: `Admin123!`

---

### Yöntem 2: Web Formu Kullanarak

1. **Tarayıcınızda şu adresi açın:**
   ```
   https://siteniz.com/php/create_admin.html
   ```

2. **Formu doldurun:**
   - E-posta: Admin e-posta adresi
   - Ad & Soyad: Admin adı
   - Şifre: En az 8 karakter
   - Admin Secret Key: `cvk-admin-2024-secret`

3. **"Admin Oluştur" butonuna tıklayın**

---

### Yöntem 3: API ile (Geliştiriciler için)

**cURL:**
```bash
curl -X POST https://siteniz.com/php/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_admin",
    "email": "admin@cvkdijital.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "Kullanıcı",
    "admin_secret": "cvk-admin-2024-secret"
  }'
```

---

## 🔐 Güvenlik Notları

### 1. Varsayılan Şifreyi Değiştirin

İlk girişten sonra şifrenizi değiştirin:
1. Admin Panel'e giriş yapın
2. Profil ayarlarına gidin
3. Şifre değiştir

### 2. Admin Secret Key'i Değiştirin

Güvenlik için `auth.php` dosyasındaki varsayılan secret key'i değiştirin:

```php
// auth.php dosyasında
$expectedSecret = 'kendi-gizli-anahtariniz-buraya';
```

### 3. create_admin.html Dosyasını Koruyun

Admin oluşturma sayfasını sadece güvenli bir şekilde erişilebilir yapın:

**.htaccess ile IP kısıtlaması:**
```apache
<Files "create_admin.html">
    Order deny,allow
    Deny from all
    Allow from YOUR_IP_ADDRESS
</Files>
```

Veya kullanımdan sonra dosyayı silin.

---

## 🛠️ Sorun Giderme

### "Invalid admin secret" Hatası

Secret key yanlış. Varsayılan: `cvk-admin-2024-secret`

### "Email address already registered" Hatası

Bu e-posta ile kayıtlı bir kullanıcı zaten var. Mevcut kullanıcıyı admin yapın:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@cvkdijital.com';
```

### Admin Panel'e Erişemiyorum

1. Giriş yaptığınızdan emin olun (`/login`)
2. Token'ın geçerli olduğundan emin olun
3. Kullanıcının `role = 'admin'` olduğunu kontrol edin:

```sql
SELECT email, role FROM users WHERE email = 'admin@cvkdijital.com';
```

---

## 📋 Admin Panel Özellikleri

Admin kullanıcıları şunları yapabilir:

- ✅ Blog yazısı oluşturma/düzenleme/silme
- ✅ Yorum moderasyonu (onaylama/reddetme)
- ✅ Blog istatistiklerini görüntüleme
- ✅ Kullanıcıları yönetme (ileride eklenecek)
- ✅ Siparişleri yönetme (ileride eklenecek)

---

## 🔗 Önemli URL'ler

| URL | Açıklama |
|-----|----------|
| `/admin` | Admin Panel |
| `/php/create_admin.html` | Admin oluşturma formu |
| `/php/auth.php` | Kimlik doğrulama API |
| `/php/blog.php` | Blog API |

---

## 📞 Destek

Sorun yaşarsanız:
1. Veritabanı bağlantısını kontrol edin
2. Hata loglarını inceleyin
3. Gerekirse `db_setup.sql` dosyasını tekrar çalıştırın

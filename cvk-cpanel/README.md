# CVK cPanel Deployment (Production Ready)

Bu klasor cPanel uzerinde React SPA + PHP API calistirmak ve WordPress ile birlikte kullanmak icin hazirlanmistir.

## Hedef Yapi
- `public_html/` icinde React build dosyalari (`index.html`, `assets/*`)
- `public_html/php/*` ve `public_html/api/*` icinde backend endpointleri
- `.htaccess` ile:
  - SPA route fallback
  - API/PHP route koruma
  - WordPress core path uyumlulugu
  - gzip/cache/security headers

## Hızlı Kurulum
1. `public_html` altindaki tum dosyalari cPanel `public_html` klasorune yukle.
2. cPanel > MySQL Database Wizard ile DB ve user olustur.
3. `php/db_setup.sql` ve `sql/orders_schema.sql` dosyalarini phpMyAdmin'de calistir.
   - Admin urun/stok yonetimi icin ek olarak: `sql/admin_catalog_schema.sql`
4. cPanel ortam degiskenlerini tanimla (ornek: `.env.cpanel.example`):
   - `DB_HOST`
   - `DB_NAME`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `ADMIN_CREATION_SECRET`
   - `SITE_URL`
5. SSL aktif et (AutoSSL) ve domaini HTTPS'e zorla.

## WordPress ile Birlikte Calisma
Ayrintili dokuman: `WORDPRESS_CPANEL_SETUP.md`

Onerilen model:
- WordPress: `domain.com/wp` veya `blog.domain.com`
- Uygulama: `domain.com` (SPA)
- `.htaccess` WordPress core pathlerini (`wp-admin`, `wp-content`, `wp-json` vb.) gecirir.

## Guvenlik Notlari
- `php/config.php` artik env tabanli calisir.
- `config/`, `middleware/`, `utils/` ve `php/config.php` webden dogrudan erisime kapatildi.
- SQL/MD dosyalari `php/.htaccess` ile dogrudan erisime kapatildi.

## Production Checklist
- [ ] Placeholder sifre/secret yok
- [ ] DB baglanti testi basarili
- [ ] `JWT_SECRET` guclu bir deger
- [ ] `ADMIN_CREATION_SECRET` degistirildi
- [ ] `create_admin.html` kullanildiktan sonra kaldirildi veya IP ile sinirlandi
- [ ] SSL + HSTS aktif
- [ ] Yedekleme planı aktif

## Sonraki Adimlar (Profesyonel Hosting Yol Haritasi)
- Staging/production ayrimi
- Cloudflare + WAF + rate limit
- Loglama ve uptime monitoringu
- SMTP transactional email (SPF/DKIM/DMARC)
- Otomatik deploy (Git + cPanel)

Detayli plan dosyasi: `HOSTING_PRO_ROADMAP.md`

## Yeni API'ler (Database Entegrasyonu)
- `GET/POST /api/orders.php`
  - `action=my`, `action=admin_list`, `action=detail`
  - `action=update_status` (POST, admin)
- `GET/POST /api/admin/catalog.php`
  - `action=snapshot` (GET, admin)
  - `action=save_snapshot` (POST, admin)

# WordPress + CVK SPA (cPanel Uyum Rehberi)

Bu rehber WordPress'i bozmeden mevcut CVK SPA + PHP API yapisini ayni hostta calistirmak icindir.

## Onerilen Mimari

### Secenek A (onerilen)
- `domain.com` -> CVK SPA
- `domain.com/wp` -> WordPress

Avantaj:
- Route cakismasi az
- SEO ve API yonetimi net

### Secenek B
- `domain.com` -> WordPress
- `domain.com/app` -> CVK SPA

Bu durumda SPA build output'unu `/app` altinda servis edin.

## cPanel Adimlari
1. WordPress'i Softaculous ile `/wp` altina kur.
2. CVK dosyalarini `public_html` kokune yukle.
3. `public_html/.htaccess` dosyasini bu repodaki guncel surumle degistir.
4. SSL'i aktif et.

## Route Uyum Kurallari
Guncel `.htaccess` su yollari WordPress'e birakir:
- `wp-admin/*`
- `wp-content/*`
- `wp-includes/*`
- `wp-json/*`
- `wp-login.php`
- `wp-cron.php`
- `xmlrpc.php`

API/PHP yollari SPA fallback'e dusmez:
- `/api/*`
- `/php/*`
- `/config/*`
- `/middleware/*`
- `/utils/*`

## Blog Entegrasyonu (opsiyonel)
WordPress blogunu aktif kullanacaksan:
- `/blog` pathini WordPress'e yonlendir
- SPA tarafinda blog ekranini WordPress REST API'den besle

## WordPress Guvenlik ve Performans
- Permalink: Post name
- Caching plugin: LiteSpeed Cache (cPanel/LiteSpeed ise)
- Security plugin: Wordfence veya iThemes
- XML-RPC gerekmiyorsa kapat
- Admin URL brute force korumasi aktif et

## SMTP ve Mail
Host mail fonksiyonu yerine SMTP onerilir:
- WP Mail SMTP plugin
- SPF, DKIM, DMARC kayitlarini DNS'te aktif et

## Canliya Cikis Kontrol Listesi
- [ ] WordPress admin sifresi guclu
- [ ] CVK API env degerleri set edildi
- [ ] Tum endpointler HTTPS altinda test edildi
- [ ] 404/500 loglari temiz
- [ ] Otomatik yedekleme aktif

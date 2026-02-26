# Hosting Pro Yol Haritasi (cPanel + WordPress + CVK)

Bu plan, projeyi "calisan demo"dan "profesyonel production site" seviyesine tasimak icin hazirlandi.

## Faz 1 - Bugun (Foundation)
- [x] `public_html/.htaccess` production rewrite + cache + security headers
- [x] SPA/API/WordPress route uyumlulugu
- [x] `php/config.php` env tabanli hale getirildi
- [x] `/config`, `/middleware`, `/utils`, kritik `php` dosyalari dis erisime kapatildi

## Faz 2 - Hosting Aktivasyonu
- [ ] Domain DNS -> hosting IP dogrulama
- [ ] AutoSSL aktif etme
- [ ] MySQL database + user olusturma
- [ ] SQL import (`php/db_setup.sql`, `sql/orders_schema.sql`)
- [ ] cPanel env degerlerini tanimlama (`.env.cpanel.example` referansi)
- [ ] SMTP ayarlari (SPF/DKIM/DMARC)

## Faz 3 - WordPress Uretim Entegrasyonu
- [ ] WordPress kurulum lokasyonu secimi (`/wp` onerilir)
- [ ] Permalink + cache plugin + security plugin
- [ ] Gereksiz plugin temizligi
- [ ] Theme/child-theme yedekleme ve guncelleme politikasi

## Faz 4 - Operasyon ve Guvenlik
- [ ] Haftalik otomatik full backup + gunluk DB backup
- [ ] Uptime monitor (UptimeRobot / Better Stack)
- [ ] Error log izleme (4xx/5xx)
- [ ] Rate limit / WAF (Cloudflare onerilir)
- [ ] Admin panel kritik islemlerine audit log

## Faz 5 - Performans ve SEO
- [ ] Core Web Vitals optimizasyonu (LCP/CLS/INP)
- [ ] Gorsel sikistirma + modern formatlar
- [ ] Canonical, robots, sitemap kontrolleri
- [ ] Product/blog structured data

## Canliya Cikis Oncesi Son Kontrol
- [ ] Varsayilan sifre ve secret kalmadi
- [ ] `create_admin.html` kapatildi veya kaldirildi
- [ ] HTTPS zorunlu, mixed content yok
- [ ] Siparis akisi bastan sona test edildi
- [ ] Basarisiz odeme/kargo edge-case testleri gecti

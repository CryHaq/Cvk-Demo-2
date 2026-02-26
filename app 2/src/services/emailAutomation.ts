// CVK Dijital - E-posta Otomasyon Servisi
// Not: Gerçek uygulamada bu bir backend servisi olmalıdır

export interface EmailTemplate {
  id: string;
  subject: string;
  body: string;
  delay: number; // saat cinsinden
}

// E-posta şablonları
export const EMAIL_TEMPLATES = {
  WELCOME: {
    id: 'welcome',
    subject: 'CVK Dijital\'e Hoş Geldiniz! 🎉',
    body: `
      <h1>Merhaba {{firstName}},</h1>
      <p>CVK Dijital ailesine hoş geldiniz! 🎊</p>
      <p>Hemen alışverişe başlayabilir veya özel tekliflerimizi keşfedebilirsiniz.</p>
      <ul>
        <li>🎁 İlk siparişinize özel %10 indirim: HOSGELDIN10</li>
        <li>🚚 500€ üzeri ücretsiz kargo</li>
        <li>⚡ 24 saatte teslimat</li>
      </ul>
      <a href="{{shopUrl}}" style="background: #0077be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Alışverişe Başla</a>
    `,
    delay: 0,
  },
  ABANDONED_CART_1H: {
    id: 'abandoned_cart_1h',
    subject: 'Sepetinizi Unuttunuz mu? 🛒',
    body: `
      <h1>Merhaba {{firstName}},</h1>
      <p>Sepetinizde bekleyen ürünler var! 😊</p>
      <div style="border: 1px solid #eee; padding: 20px; margin: 20px 0;">
        {{cartItems}}
      </div>
      <p><strong>Toplam:</strong> {{total}}</p>
      <a href="{{cartUrl}}" style="background: #0077be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Sepeti Tamamla</a>
      <p style="margin-top: 20px;">🎁 Size özel: Bugün sipariş verirseniz <strong>ücretsiz kargo!</strong></p>
    `,
    delay: 1,
  },
  ABANDONED_CART_24H: {
    id: 'abandoned_cart_24h',
    subject: 'Son 24 Saat: %10 İndirim Fırsatı! ⏰',
    body: `
      <h1>Merhaba {{firstName}},</h1>
      <p>Sepetinizdeki ürünler hala sizi bekliyor!</p>
      <p><strong>Size özel %10 ek indirim kodu:</strong> <code style="background: #f0f7fc; padding: 8px 16px; border-radius: 4px;">SON10</code></p>
      <div style="border: 1px solid #eee; padding: 20px; margin: 20px 0;">
        {{cartItems}}
      </div>
      <a href="{{cartUrl}}" style="background: #0077be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">İndirimi Kullan</a>
      <p style="color: #666; margin-top: 20px;">Bu kod 24 saat içinde geçerlidir.</p>
    `,
    delay: 24,
  },
  POST_PURCHASE: {
    id: 'post_purchase',
    subject: 'Siparişiniz Yolda! 🚚',
    body: `
      <h1>Teşekkürler {{firstName}}! 🙏</h1>
      <p>Siparişiniz başarıyla alındı ve hazırlanıyor.</p>
      <div style="background: #f0f7fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Sipariş No:</strong> {{orderNumber}}</p>
        <p><strong>Tutar:</strong> {{total}}</p>
        <p><strong>Tahmini Teslimat:</strong> {{deliveryDate}}</p>
      </div>
      <p>Siparişinizi takip etmek için:</p>
      <a href="{{trackingUrl}}" style="background: #0077be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Siparişi Takip Et</a>
    `,
    delay: 0,
  },
  REVIEW_REQUEST: {
    id: 'review_request',
    subject: 'Ürünümüz Hakkında Ne Düşünüyorsunuz? ⭐',
    body: `
      <h1>Merhaba {{firstName}},</h1>
      <p>{{productName}} ürünümüzü satın alalı bir hafta oldu.</p>
      <p>Deneyimlerinizi bizimle paylaşır mısınız? Yorumunuz diğer müşterilerimize yardımcı olacaktır.</p>
      <a href="{{reviewUrl}}" style="background: #0077be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Yorum Yap</a>
      <p style="margin-top: 20px;">🎁 Yorum yapan herkese bir sonraki siparişlerinde <strong>%5 indirim!</strong></p>
    `,
    delay: 168, // 1 hafta
  },
  BIRTHDAY: {
    id: 'birthday',
    subject: 'Doğum Gününüz Kutlu Olsun! 🎂',
    body: `
      <h1>Mutlu Yıllar {{firstName}}! 🎉</h1>
      <p>Özel gününüzde sizi kutlarız!</p>
      <div style="background: linear-gradient(135deg, #0077be, #00a8e8); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <h2 style="margin: 0;">Doğum Günü İndirimi</h2>
        <p style="font-size: 48px; margin: 10px 0;">%20</p>
        <p>Kod: <strong>DOGGUN20</strong></p>
      </div>
      <p>Bu kod 7 gün boyunca geçerlidir.</p>
      <a href="{{shopUrl}}" style="background: white; color: #0077be; padding: 12px 24px; text-decoration: none; border-radius: 8px; border: 2px solid #0077be;">Alışverişe Başla</a>
    `,
    delay: 0,
  },
};

// E-posta kuyruğuna ekle
export const queueEmail = (email: string, template: EmailTemplate, data: Record<string, string>) => {
  const queue = JSON.parse(localStorage.getItem('emailQueue') || '[]');
  
  // Template'i verilerle birleştir
  let subject = template.subject;
  let body = template.body;
  
  Object.entries(data).forEach(([key, value]) => {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  queue.push({
    id: Date.now().toString(),
    email,
    subject,
    body,
    scheduledAt: Date.now() + (template.delay * 60 * 60 * 1000),
    sent: false,
    templateId: template.id,
  });
  
  localStorage.setItem('emailQueue', JSON.stringify(queue));
  
  // Gerçek uygulamada burada API çağrısı yapılır
  console.log('📧 E-posta kuyruğa eklendi:', { email, template: template.id, delay: template.delay });
};

// Terk edilmiş sepet kontrolü
export const checkAbandonedCarts = () => {
  const lastCartVisit = localStorage.getItem('lastCartVisit');
  const cartItems = JSON.parse(localStorage.getItem('cvk_cart') || '[]');
  const user = JSON.parse(localStorage.getItem('cvk_user') || '{}');
  const lastEmailSent = localStorage.getItem('lastAbandonedEmail');
  
  if (!lastCartVisit || cartItems.length === 0 || !user.email) return;
  
  const hoursSinceVisit = (Date.now() - parseInt(lastCartVisit)) / (1000 * 60 * 60);
  
  // 1 saat sonra ilk e-posta
  if (hoursSinceVisit >= 1 && hoursSinceVisit < 24) {
    if (lastEmailSent !== '1h') {
      const cartTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const itemsHtml = cartItems.map((item: any) => `
        <div style="display: flex; align-items: center; margin: 10px 0; padding: 10px; border: 1px solid #eee;">
          <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px;">
          <div>
            <p style="margin: 0; font-weight: bold;">${item.name}</p>
            <p style="margin: 5px 0; color: #666;">Adet: ${item.quantity}</p>
            <p style="margin: 0; color: #0077be; font-weight: bold;">€${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      `).join('');
      
      queueEmail(user.email, EMAIL_TEMPLATES.ABANDONED_CART_1H, {
        firstName: user.firstName || 'Değerli Müşterimiz',
        cartItems: itemsHtml,
        total: `€${cartTotal.toFixed(2)}`,
        cartUrl: `${window.location.origin}/#/cart`,
      });
      
      localStorage.setItem('lastAbandonedEmail', '1h');
    }
  }
  
  // 24 saat sonra ikinci e-posta
  if (hoursSinceVisit >= 24) {
    if (lastEmailSent !== '24h') {
      const cartTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const itemsHtml = cartItems.map((item: any) => `
        <div style="display: flex; align-items: center; margin: 10px 0; padding: 10px; border: 1px solid #eee;">
          <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px;">
          <div>
            <p style="margin: 0; font-weight: bold;">${item.name}</p>
            <p style="margin: 5px 0; color: #666;">Adet: ${item.quantity}</p>
            <p style="margin: 0; color: #0077be; font-weight: bold;">€${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      `).join('');
      
      queueEmail(user.email, EMAIL_TEMPLATES.ABANDONED_CART_24H, {
        firstName: user.firstName || 'Değerli Müşterimiz',
        cartItems: itemsHtml,
        total: `€${cartTotal.toFixed(2)}`,
        cartUrl: `${window.location.origin}/#/cart`,
      });
      
      localStorage.setItem('lastAbandonedEmail', '24h');
    }
  }
};

// Hoşgeldin e-postası
export const sendWelcomeEmail = (email: string, firstName: string) => {
  queueEmail(email, EMAIL_TEMPLATES.WELCOME, {
    firstName,
    shopUrl: `${window.location.origin}/#/shop`,
  });
};

// Sipariş sonrası e-posta
export const sendOrderConfirmation = (email: string, orderData: any) => {
  queueEmail(email, EMAIL_TEMPLATES.POST_PURCHASE, {
    firstName: orderData.firstName,
    orderNumber: orderData.orderNumber,
    total: `€${orderData.total.toFixed(2)}`,
    deliveryDate: orderData.estimatedDelivery,
    trackingUrl: `${window.location.origin}/#/order-tracking`,
  });
};

// Yorum isteği e-postası
export const sendReviewRequest = (email: string, productName: string, firstName: string) => {
  queueEmail(email, EMAIL_TEMPLATES.REVIEW_REQUEST, {
    firstName,
    productName,
    reviewUrl: `${window.location.origin}/#/shop`,
  });
};

// Doğum günü e-postası
export const sendBirthdayEmail = (email: string, firstName: string) => {
  queueEmail(email, EMAIL_TEMPLATES.BIRTHDAY, {
    firstName,
    shopUrl: `${window.location.origin}/#/shop`,
  });
};

import { useState } from 'react';
import { FileText, Download, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface PDFQuoteProps {
  product: {
    id: number;
    name: string;
    price: number;
    minOrder: number;
    image: string;
    description?: string;
  };
  quantity?: number;
  options?: {
    size?: string;
    material?: string;
    color?: string;
  };
}

export default function PDFQuote({ product, quantity = 1, options = {} }: PDFQuoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create a simple HTML-based PDF content
    const quoteData = {
      company: 'CVK Dijital',
      date: new Date().toLocaleDateString('tr-TR'),
      quoteNumber: `TK-${Date.now().toString().slice(-8)}`,
      product: {
        name: product.name,
        price: product.price,
        quantity: quantity,
        minOrder: product.minOrder,
        total: product.price * Math.max(quantity, product.minOrder),
        options: options,
      },
    };

    // Generate HTML content for print/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teklif - ${product.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #0077be; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0077be; }
            .tagline { color: #666; font-size: 12px; }
            .quote-info { background: #f0f7fc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .product-section { margin-bottom: 30px; }
            .product-name { font-size: 20px; font-weight: bold; color: #0077be; margin-bottom: 10px; }
            .product-details { background: #f9f9f9; padding: 20px; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .total-section { background: #0077be; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px; }
            .total-price { font-size: 28px; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            .contact-info { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CVK Dijital</div>
            <div class="tagline">Tabela ve Dijital Baskı Çözümleri</div>
          </div>

          <div class="quote-info">
            <div class="info-row">
              <span class="label">Teklif No:</span>
              <span>${quoteData.quoteNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Tarih:</span>
              <span>${quoteData.date}</span>
            </div>
            <div class="info-row">
              <span class="label">Geçerlilik:</span>
              <span>30 gün</span>
            </div>
          </div>

          <div class="product-section">
            <div class="product-name">${product.name}</div>
            <div class="product-details">
              <div class="detail-row">
                <span class="label">Birim Fiyat:</span>
                <span>€${product.price.toFixed(2)}</span>
              </div>
              ${options.size ? `
              <div class="detail-row">
                <span class="label">Boyut:</span>
                <span>${options.size}</span>
              </div>
              ` : ''}
              ${options.material ? `
              <div class="detail-row">
                <span class="label">Malzeme:</span>
                <span>${options.material}</span>
              </div>
              ` : ''}
              ${options.color ? `
              <div class="detail-row">
                <span class="label">Renk:</span>
                <span>${options.color}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Adet:</span>
                <span>${Math.max(quantity, product.minOrder)} adet</span>
              </div>
              <div class="detail-row">
                <span class="label">Minimum Sipariş:</span>
                <span>${product.minOrder} adet</span>
              </div>
            </div>
          </div>

          <div class="total-section">
            <div style="font-size: 14px; margin-bottom: 10px;">Toplam Tutar (KDV Hariç)</div>
            <div class="total-price">€${quoteData.product.total.toFixed(2)}</div>
          </div>

          <div class="contact-info">
            <strong>Sipariş ve Bilgi İçin:</strong><br>
            📞 +90 534 000 00 00<br>
            📧 info@cvkdijital.com<br>
            🌐 www.cvkdijital.com
          </div>

          <div class="footer">
            <p>Bu teklif bilgilendirme amaçlıdır. Kesin fiyat için lütfen bizimle iletişime geçin.</p>
            <p>© 2024 CVK Dijital. Tüm hakları saklıdır.</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }

    setIsGenerating(false);
    setIsGenerated(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsGenerated(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0077be] transition-colors"
      >
        <FileText className="w-4 h-4" />
        <span>PDF Teklif İndir</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120]"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[121] p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {isGenerated ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF Oluşturuldu!</h3>
                    <p className="text-gray-600">
                      Teklif PDF'i yeni sekmede açıldı. İsterseniz yazdırabilir veya kaydedebilirsiniz.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0077be]/10 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#0077be]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">PDF Teklif</h3>
                          <p className="text-sm text-gray-500">Teklifi PDF olarak indirin</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">
                            {Math.max(quantity, product.minOrder)} adet × €{product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Toplam:</span>
                          <span className="font-semibold text-[#0077be]">
                            €{(product.price * Math.max(quantity, product.minOrder)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleGeneratePDF}
                        disabled={isGenerating}
                        className="w-full bg-[#0077be] hover:bg-[#005a8f] text-white py-6"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            PDF Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            PDF Teklif İndir
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        PDF teklif bilgilendirme amaçlıdır. Kesin fiyat için iletişime geçin.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

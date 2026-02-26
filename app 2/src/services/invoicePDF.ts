/**
 * Invoice PDF Service
 * 
 * jsPDF ile profesyonel fatura PDF oluşturma
 * - Sipariş özeti
 - Fatura detayları
 * - Teklif PDF'i
 * - İrsaliye
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from '@/components/Toast';

export interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerCompany?: string;
  customerTaxNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  notes?: string;
}

export interface InvoiceItem {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: {
    size?: string;
    material?: string;
    color?: string;
  };
}

export interface QuoteData {
  quoteNumber: string;
  validUntil: string;
  customerName: string;
  customerEmail: string;
  items: QuoteItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
}

export interface QuoteItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

class InvoicePDFService {
  private primaryColor = '#0077be';
  private secondaryColor = '#1a1a2e';

  /**
   * Fatura PDF'i oluştur
   */
  public generateInvoice(invoice: InvoiceData, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    
    // Logo ve başlık
    this.addHeader(doc, 'FATURA', invoice.orderNumber);
    
    // Firma bilgileri
    this.addCompanyInfo(doc);
    
    // Müşteri bilgileri
    this.addCustomerInfo(doc, invoice, 75);
    
    // Sipariş detayları
    this.addOrderDetails(doc, invoice, 105);
    
    // Ürün tablosu
    this.addItemsTable(doc, invoice.items, 125);
    
    // Toplam özet
    this.addTotals(doc, invoice);
    
    // Footer
    this.addFooter(doc);

    if (download) {
      doc.save(`Fatura_${invoice.orderNumber}.pdf`);
      toast.success('Fatura indirildi!');
    }

    return doc;
  }

  /**
   * Teklif PDF'i oluştur
   */
  public generateQuote(quoteData: QuoteData, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    
    // Logo ve başlık
    this.addHeader(doc, 'FİYAT TEKLİFİ', quoteData.quoteNumber);
    
    // Firma bilgileri
    this.addCompanyInfo(doc);
    
    // Müşteri bilgileri
    this.addQuoteCustomerInfo(doc, quoteData, 75);
    
    // Teklif detayları
    this.addQuoteDetails(doc, quoteData, 100);
    
    // Ürün tablosu
    this.addQuoteItemsTable(doc, quoteData.items, 120);
    
    // Toplam özet
    this.addQuoteTotals(doc, quoteData);
    
    // Teklif şartları
    this.addQuoteTerms(doc, quoteData);
    
    // Footer
    this.addFooter(doc);

    if (download) {
      doc.save(`Teklif_${quoteData.quoteNumber}.pdf`);
      toast.success('Teklif PDF\'i indirildi!');
    }

    return doc;
  }

  /**
   * İrsaliye PDF'i oluştur
   */
  public generateDeliveryNote(invoice: InvoiceData, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    
    // Logo ve başlık
    this.addHeader(doc, 'İRSALİYE', invoice.orderNumber);
    
    // Firma bilgileri
    this.addCompanyInfo(doc);
    
    // Müşteri bilgileri
    this.addCustomerInfo(doc, invoice, 75);
    
    // Teslimat detayları
    doc.setFontSize(12);
    doc.setTextColor(this.secondaryColor);
    doc.text('Teslimat Bilgileri', 15, 105);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text(`Teslimat Adresi: ${invoice.customerAddress}`, 15, 115);
    doc.text(`${invoice.customerCity}`, 15, 122);
    doc.text(`Müşteri: ${invoice.customerName}`, 15, 132);
    doc.text(`Telefon: ${invoice.customerPhone}`, 15, 139);
    
    // Ürün listesi (fiyatsız)
    const deliveryItems = invoice.items.map(item => ({
      ...item,
      unitPrice: 0,
      totalPrice: 0,
    }));
    
    this.addItemsTable(doc, deliveryItems, 150);
    
    // Footer
    this.addFooter(doc);
    
    // İmza alanı
    doc.setFontSize(10);
    doc.setTextColor(this.secondaryColor);
    doc.text('Teslim Eden', 15, doc.internal.pageSize.height - 40);
    doc.text('Teslim Alan', 150, doc.internal.pageSize.height - 40);
    
    doc.setDrawColor('#cccccc');
    doc.line(15, doc.internal.pageSize.height - 35, 70, doc.internal.pageSize.height - 35);
    doc.line(150, doc.internal.pageSize.height - 35, 205, doc.internal.pageSize.height - 35);

    if (download) {
      doc.save(`Irsaliye_${invoice.orderNumber}.pdf`);
      toast.success('İrsaliye indirildi!');
    }

    return doc;
  }

  /**
   * Sipariş özeti PDF'i oluştur
   */
  public generateOrderSummary(invoice: InvoiceData, download: boolean = true): jsPDF {
    const doc = new jsPDF();
    
    // Logo ve başlık
    this.addHeader(doc, 'SİPARİŞ ÖZETİ', invoice.orderNumber);
    
    // Firma bilgileri
    this.addCompanyInfo(doc);
    
    // Sipariş bilgileri
    doc.setFontSize(12);
    doc.setTextColor(this.secondaryColor);
    doc.text('Sipariş Bilgileri', 15, 75);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text(`Sipariş No: ${invoice.orderNumber}`, 15, 85);
    doc.text(`Sipariş Tarihi: ${invoice.orderDate}`, 15, 92);
    doc.text(`Ödeme Yöntemi: ${invoice.paymentMethod}`, 15, 99);
    
    // Müşteri bilgileri
    doc.setFontSize(12);
    doc.setTextColor(this.secondaryColor);
    doc.text('Müşteri', 120, 75);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text(invoice.customerName, 120, 85);
    doc.text(invoice.customerEmail, 120, 92);
    doc.text(invoice.customerPhone, 120, 99);
    
    // Ürün tablosu
    this.addItemsTable(doc, invoice.items, 115);
    
    // Toplam özet
    this.addTotals(doc, invoice);
    
    // Notlar
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setTextColor(this.secondaryColor);
      doc.text('Notlar:', 15, doc.internal.pageSize.height - 60);
      doc.setTextColor('#666666');
      doc.text(invoice.notes, 15, doc.internal.pageSize.height - 53);
    }
    
    // Footer
    this.addFooter(doc);

    if (download) {
      doc.save(`Siparis_Ozeti_${invoice.orderNumber}.pdf`);
      toast.success('Sipariş özeti indirildi!');
    }

    return doc;
  }

  /**
   * Header ekle
   */
  private addHeader(doc: jsPDF, title: string, number: string): void {
    const pageWidth = doc.internal.pageSize.width;
    
    // Arka plan şeridi
    doc.setFillColor(this.primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo alanı (simüle)
    doc.setFontSize(24);
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.text('CVK', 15, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Dijital Ambalaj Çözümleri', 15, 32);
    
    // Başlık
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth - 15, 25, { align: 'right' });
    
    // Numara
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`No: ${number}`, pageWidth - 15, 32, { align: 'right' });
  }

  /**
   * Firma bilgilerini ekle
   */
  private addCompanyInfo(doc: jsPDF): void {
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    
    const companyInfo = [
      'CVK Dijital Ambalaj Çözümleri',
      'İstanbul, Türkiye',
      'info@cvkdijital.com',
      '+90 534 000 00 00',
      'www.cvkdijital.com',
    ];
    
    let y = 55;
    for (const line of companyInfo) {
      doc.text(line, 15, y);
      y += 7;
    }
  }

  /**
   * Müşteri bilgilerini ekle (Fatura)
   */
  private addCustomerInfo(doc: jsPDF, invoice: InvoiceData, startY: number): void {
    // Fatura Adresi
    doc.setFontSize(11);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Fatura Adresi', 15, startY);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    
    let y = startY + 8;
    
    if (invoice.customerCompany) {
      doc.text(invoice.customerCompany, 15, y);
      y += 6;
    }
    
    doc.text(invoice.customerName, 15, y);
    y += 6;
    doc.text(invoice.customerAddress, 15, y);
    y += 6;
    doc.text(`${invoice.customerCity}`, 15, y);
    y += 6;
    doc.text(`E-posta: ${invoice.customerEmail}`, 15, y);
    y += 6;
    doc.text(`Telefon: ${invoice.customerPhone}`, 15, y);
    
    if (invoice.customerTaxNumber) {
      y += 6;
      doc.text(`Vergi No: ${invoice.customerTaxNumber}`, 15, y);
    }
    
    // Teslimat Adresi
    doc.setFontSize(11);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Teslimat Adresi', 105, startY);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    
    y = startY + 8;
    doc.text(invoice.customerName, 105, y);
    y += 6;
    doc.text(invoice.customerAddress, 105, y);
    y += 6;
    doc.text(`${invoice.customerCity}`, 105, y);
  }

  /**
   * Müşteri bilgilerini ekle (Teklif)
   */
  private addQuoteCustomerInfo(doc: jsPDF, quote: QuoteData, startY: number): void {
    doc.setFontSize(11);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Müşteri', 15, startY);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    doc.text(quote.customerName, 15, startY + 8);
    doc.text(quote.customerEmail, 15, startY + 15);
    
    // Teklif detayları
    doc.setFontSize(11);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Teklif Detayları', 105, startY);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    doc.text(`Teklif No: ${quote.quoteNumber}`, 105, startY + 8);
    doc.text(`Geçerlilik: ${quote.validUntil}`, 105, startY + 15);
    doc.text(`Döviz: ${quote.items[0]?.unitPrice ? 'EUR' : 'USD'}`, 105, startY + 22);
  }

  /**
   * Sipariş detayları
   */
  private addOrderDetails(doc: jsPDF, invoice: InvoiceData, startY: number): void {
    doc.setFontSize(11);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Sipariş Detayları', 15, startY);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Sipariş Tarihi: ${invoice.orderDate}`, 15, startY + 8);
    doc.text(`Ödeme Yöntemi: ${invoice.paymentMethod}`, 15, startY + 15);
    doc.text(`Para Birimi: ${invoice.currency}`, 120, startY + 8);
  }

  /**
   * Teklif detayları
   */
  private addQuoteDetails(doc: jsPDF, quote: QuoteData, startY: number): void {
    doc.setFontSize(11);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Teklif Bilgileri', 15, startY);
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Teklif Numarası: ${quote.quoteNumber}`, 15, startY + 8);
    doc.text(`Geçerlilik Tarihi: ${quote.validUntil}`, 15, startY + 15);
    doc.text(`Para Birimi: ${quote.total > 0 ? 'EUR' : 'USD'}`, 120, startY + 8);
  }

  /**
   * Ürün tablosu ekle
   */
  private addItemsTable(doc: jsPDF, items: InvoiceItem[], startY: number): void {
    const tableData = items.map(item => [
      item.name,
      item.options ? `${item.options.size || ''} ${item.options.material || ''}` : '',
      item.quantity.toString(),
      item.unitPrice > 0 ? `€${item.unitPrice.toFixed(2)}` : '-',
      item.totalPrice > 0 ? `€${item.totalPrice.toFixed(2)}` : '-',
    ]);

    (doc as any).autoTable({
      startY,
      head: [['Ürün', 'Özellikler', 'Adet', 'Birim Fiyat', 'Toplam']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: '#ffffff',
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
    });
  }

  /**
   * Teklif ürün tablosu
   */
  private addQuoteItemsTable(doc: jsPDF, items: QuoteItem[], startY: number): void {
    const tableData = items.map(item => [
      item.name,
      item.description,
      item.quantity.toString(),
      `€${item.unitPrice.toFixed(2)}`,
      `€${item.totalPrice.toFixed(2)}`,
    ]);

    (doc as any).autoTable({
      startY,
      head: [['Ürün', 'Açıklama', 'Adet', 'Birim Fiyat', 'Toplam']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: '#ffffff',
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
    });
  }

  /**
   * Toplam özet ekle
   */
  private addTotals(doc: jsPDF, invoice: InvoiceData): void {
    const pageWidth = doc.internal.pageSize.width;
    const startX = pageWidth - 80;
    const startY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    
    // Ara toplam
    doc.text('Ara Toplam:', startX, startY);
    doc.text(`€${invoice.subtotal.toFixed(2)}`, pageWidth - 15, startY, { align: 'right' });
    
    // İndirim
    if (invoice.discountAmount > 0) {
      doc.text('İndirim:', startX, startY + 8);
      doc.text(`-€${invoice.discountAmount.toFixed(2)}`, pageWidth - 15, startY + 8, { align: 'right' });
    }
    
    // Kargo
    doc.text('Kargo:', startX, startY + 16);
    doc.text(`€${invoice.shippingCost.toFixed(2)}`, pageWidth - 15, startY + 16, { align: 'right' });
    
    // KDV
    doc.text(`KDV (%${(invoice.vatRate * 100).toFixed(0)}):`, startX, startY + 24);
    doc.text(`€${invoice.vatAmount.toFixed(2)}`, pageWidth - 15, startY + 24, { align: 'right' });
    
    // Toplam çizgisi
    doc.setDrawColor(this.primaryColor);
    doc.setLineWidth(0.5);
    doc.line(startX, startY + 30, pageWidth - 15, startY + 30);
    
    // Genel Toplam
    doc.setFontSize(12);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('GENEL TOPLAM:', startX, startY + 40);
    doc.text(`€${invoice.total.toFixed(2)}`, pageWidth - 15, startY + 40, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
  }

  /**
   * Teklif toplamları
   */
  private addQuoteTotals(doc: jsPDF, quote: QuoteData): void {
    const pageWidth = doc.internal.pageSize.width;
    const startX = pageWidth - 80;
    const startY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    
    doc.text('Ara Toplam:', startX, startY);
    doc.text(`€${quote.subtotal.toFixed(2)}`, pageWidth - 15, startY, { align: 'right' });
    
    doc.text('KDV (%20):', startX, startY + 8);
    doc.text(`€${quote.vatAmount.toFixed(2)}`, pageWidth - 15, startY + 8, { align: 'right' });
    
    doc.setDrawColor(this.primaryColor);
    doc.setLineWidth(0.5);
    doc.line(startX, startY + 14, pageWidth - 15, startY + 14);
    
    doc.setFontSize(12);
    doc.setTextColor(this.secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('TOPLAM:', startX, startY + 24);
    doc.text(`€${quote.total.toFixed(2)}`, pageWidth - 15, startY + 24, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
  }

  /**
   * Teklif şartları
   */
  private addQuoteTerms(doc: jsPDF, _quoteData: QuoteData): void {
    const startY = (doc as any).lastAutoTable.finalY + 50;
    
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    
    const terms = [
      'Teklif Şartları:',
      '• Fiyatlarımıza KDV dahil değildir.',
      '• Ödeme: Peşin veya vadeli (30 gün)',
      '• Teslimat: Sipariş onayından sonra 7-10 iş günü',
      '• Bu teklif 30 gün geçerlidir.',
      '• Baskı için tasarım dosyası gereklidir (AI, PDF, PSD).',
    ];
    
    let y = startY;
    for (const term of terms) {
      doc.text(term, 15, y);
      y += 6;
    }
  }

  /**
   * Footer ekle
   */
  private addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Footer çizgisi
    doc.setDrawColor('#cccccc');
    doc.setLineWidth(0.3);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
    
    // Footer metni
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text(
      'CVK Dijital Ambalaj Çözümleri | info@cvkdijital.com | +90 534 000 00 00 | www.cvkdijital.com',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
    
    doc.text(
      'Bu belge elektronik olarak oluşturulmuştur.',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  /**
   * Örnek fatura verisi oluştur
   */
  public createSampleInvoice(): InvoiceData {
    return {
      orderNumber: 'CVK-20240220-ABC123',
      orderDate: '20 Şubat 2024',
      customerName: 'Ahmet Yılmaz',
      customerEmail: 'ahmet@example.com',
      customerPhone: '+90 532 123 45 67',
      customerAddress: 'Atatürk Cad. No:123',
      customerCity: 'İstanbul, 34000',
      customerCompany: 'Yılmaz Gıda Ltd. Şti.',
      customerTaxNumber: '1234567890',
      items: [
        {
          id: 1,
          name: 'Stand-Up Poşet',
          description: 'Özel baskılı',
          quantity: 1000,
          unitPrice: 0.45,
          totalPrice: 450.00,
          options: { size: '10x15 cm', material: 'Alüminyum Bariyer' },
        },
        {
          id: 2,
          name: 'Fermuarlı Doypack',
          description: 'Tekrar kapanabilir',
          quantity: 500,
          unitPrice: 0.52,
          totalPrice: 260.00,
          options: { size: '12x18 cm', material: 'Mat BOPP' },
        },
      ],
      subtotal: 710.00,
      vatRate: 0.20,
      vatAmount: 142.00,
      shippingCost: 25.00,
      discountAmount: 0,
      total: 877.00,
      currency: 'EUR',
      paymentMethod: 'Kredi Kartı',
      notes: 'Lütfen baskı dosyalarını siparişten sonra yükleyin.',
    };
  }
}

// Singleton instance
export const invoicePDFService = new InvoicePDFService();

export default invoicePDFService;

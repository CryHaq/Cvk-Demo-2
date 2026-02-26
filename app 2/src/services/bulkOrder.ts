/**
 * Bulk Order Service - Excel/CSV ile Toplu Sipariş
 * 
 * B2B müşteriler için Excel şablonu indirme ve yükleme
 * Özellikler:
 * - Excel şablonu indirme
 * - Excel/CSV dosyası yükleme ve parse etme
 * - Otomatik sepete ekleme
 * - Validasyon
 */

import { toast } from '@/components/Toast';
import * as XLSX from 'xlsx';

export interface BulkOrderItem {
  product_name: string;
  size: string;
  material: string;
  quantity: number;
  custom_note?: string;
  design_file?: string;
}

export interface BulkOrderTemplate {
  headers: string[];
  sampleData: any[][];
}

export interface ParseResult {
  success: boolean;
  items: BulkOrderItem[];
  errors: string[];
  warnings: string[];
  totalRows: number;
}

export interface ProductMapping {
  [key: string]: {
    id: number;
    name: string;
    price: number;
    minOrder: number;
    category: string;
  };
}

// Ürün eşleştirme tablosu
const PRODUCT_MAPPINGS: ProductMapping = {
  'stand-up': { id: 1, name: 'Stand-Up Poşet', price: 0.45, minOrder: 500, category: 'doypack' },
  'standup': { id: 1, name: 'Stand-Up Poşet', price: 0.45, minOrder: 500, category: 'doypack' },
  'stand up': { id: 1, name: 'Stand-Up Poşet', price: 0.45, minOrder: 500, category: 'doypack' },
  'doypack': { id: 1, name: 'Stand-Up Poşet', price: 0.45, minOrder: 500, category: 'doypack' },
  'flat': { id: 2, name: 'Yatay Poşet', price: 0.38, minOrder: 500, category: 'flat' },
  'yatay': { id: 2, name: 'Yatay Poşet', price: 0.38, minOrder: 500, category: 'flat' },
  'zip': { id: 3, name: 'Fermuarlı Doypack', price: 0.52, minOrder: 500, category: 'zip' },
  'fermuar': { id: 3, name: 'Fermuarlı Doypack', price: 0.52, minOrder: 500, category: 'zip' },
  'kraft': { id: 4, name: 'Kraft Kağıt Doypack', price: 0.38, minOrder: 1000, category: 'paper' },
  'kağıt': { id: 4, name: 'Kraft Kağıt Doypack', price: 0.38, minOrder: 1000, category: 'paper' },
  'aluminum': { id: 5, name: 'Alüminyum Lamine Poşet', price: 0.65, minOrder: 500, category: 'aluminum' },
  'alüminyum': { id: 5, name: 'Alüminyum Lamine Poşet', price: 0.65, minOrder: 500, category: 'aluminum' },
  'pencere': { id: 6, name: 'Pencereli Doypack', price: 0.48, minOrder: 500, category: 'doypack' },
  'window': { id: 6, name: 'Pencereli Doypack', price: 0.48, minOrder: 500, category: 'doypack' },
  'recyclable': { id: 7, name: 'Geri Dönüştürülebilir Poşet', price: 0.42, minOrder: 500, category: 'recyclable' },
  'geri dönüşüm': { id: 7, name: 'Geri Dönüştürülebilir Poşet', price: 0.42, minOrder: 500, category: 'recyclable' },
};

// Geçerli boyutlar (gelecekte validasyon için kullanılabilir)
// const VALID_SIZES = [
//   '8x13 cm', '10x15 cm', '12x18 cm', '14x20 cm', '16x22 cm', '18x24 cm',
//   '8x13', '10x15', '12x18', '14x20', '16x22', '18x24',
// ];

// Geçerli malzemeler (gelecekte validasyon için kullanılabilir)
// const VALID_MATERIALS = [
//   'alüminyum bariyer', 'aluminum barrier',
//   'kraft kağıt', 'kraft paper',
//   'mat bopp', 'matte bopp',
//   'mono pe', 'mono pp',
//   'şeffaf', 'clear', 'transparent',
// ];

class BulkOrderService {
  /**
   * Excel şablonu indir
   */
  public downloadTemplate(): void {
    const template = this.generateTemplate();
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      template.headers,
      ...template.sampleData,
    ]);

    // Kolon genişlikleri
    ws['!cols'] = [
      { wch: 25 }, // Ürün Adı
      { wch: 15 }, // Boyut
      { wch: 20 }, // Malzeme
      { wch: 12 }, // Adet
      { wch: 30 }, // Not
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Sipariş Şablonu');
    
    // Bilgi sayfası ekle
    const infoWs = XLSX.utils.aoa_to_sheet([
      ['CVK Dijital - Toplu Sipariş Şablonu'],
      [''],
      ['TALİMATLAR:'],
      ['1. Ürün Adı sütununa aşağıdaki değerlerden birini yazın:'],
      ['   - Stand-Up (Doypack)'],
      ['   - Yatay (Flat)'],
      ['   - Fermuarlı (Zip)'],
      ['   - Kraft Kağıt'],
      ['   - Alüminyum'],
      ['   - Pencereli'],
      ['   - Geri Dönüştürülebilir'],
      [''],
      ['2. Boyut: 8x13 cm, 10x15 cm, 12x18 cm, 14x20 cm, 16x22 cm, 18x24 cm'],
      [''],
      ['3. Malzeme:'],
      ['   - Alüminyum Bariyer'],
      ['   - Kraft Kağıt'],
      ['   - Mat BOPP'],
      ['   - Mono PE'],
      ['   - Mono PP'],
      ['   - Şeffaf'],
      [''],
      ['4. Minimum sipariş miktarları:'],
      ['   - Stand-Up: 500 adet'],
      ['   - Yatay: 500 adet'],
      ['   - Kraft: 1000 adet'],
      ['   - Diğerleri: 500 adet'],
    ]);
    
    infoWs['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, infoWs, 'Talimatlar');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `CVK_Toplu_Siparis_Sablonu_${date}.xlsx`);
    
    toast.success('Şablon indirildi! Talimatları okuyarak doldurun.');
  }

  /**
   * CSV şablonu indir
   */
  public downloadCSVTemplate(): void {
    const headers = ['Urun_Adi', 'Boyut', 'Malzeme', 'Adet', 'Not'];
    const sampleRow = ['Stand-Up', '10x15 cm', 'Alüminyum Bariyer', '1000', 'Logo baskı ön yüzde'];
    
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CVK_Toplu_Siparis_Sablonu_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('CSV şablonu indirildi!');
  }

  /**
   * Excel dosyasını parse et
   */
  public async parseExcel(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
          
          const result = this.processData(jsonData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * CSV dosyasını parse et
   */
  public async parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const data = lines.map(line => line.split(',').map(cell => cell.trim()));
          
          const result = this.processData(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Dosyayı otomatik algıla ve parse et
   */
  public async parseFile(file: File): Promise<ParseResult> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      return this.parseCSV(file);
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      return this.parseExcel(file);
    } else {
      throw new Error('Desteklenmeyen dosya formatı. Lütfen .xlsx, .xls veya .csv kullanın.');
    }
  }

  /**
   * Veriyi işle ve validasyon yap
   */
  private processData(data: any[][]): ParseResult {
    const result: ParseResult = {
      success: true,
      items: [],
      errors: [],
      warnings: [],
      totalRows: 0,
    };

    if (data.length < 2) {
      result.errors.push('Dosya boş veya sadece başlık içeriyor.');
      result.success = false;
      return result;
    }

    // Başlık satırını bul
    const headers = data[0].map((h: string) => h.toString().toLowerCase().trim());
    
    // Kolon indekslerini bul
    const productCol = this.findColumnIndex(headers, ['ürün adı', 'urun adi', 'ürün', 'urun', 'product', 'name', 'ürün_adı']);
    const sizeCol = this.findColumnIndex(headers, ['boyut', 'size', 'ebat', 'ölçü', 'olcu', 'ölçüler', 'olculer']);
    const materialCol = this.findColumnIndex(headers, ['malzeme', 'material', 'malzeme tipi', 'materyal']);
    const quantityCol = this.findColumnIndex(headers, ['adet', 'miktar', 'quantity', 'count', 'miktarı', 'miktari']);
    const noteCol = this.findColumnIndex(headers, ['not', 'note', 'açıklama', 'aciklama', 'yorum', 'comment', 'custom_note']);

    if (productCol === -1) {
      result.errors.push('Ürün Adı kolonu bulunamadı.');
      result.success = false;
    }
    if (sizeCol === -1) {
      result.warnings.push('Boyut kolonu bulunamadı. Varsayılan değerler kullanılacak.');
    }
    if (materialCol === -1) {
      result.warnings.push('Malzeme kolonu bulunamadı. Varsayılan değerler kullanılacak.');
    }
    if (quantityCol === -1) {
      result.errors.push('Adet kolonu bulunamadı.');
      result.success = false;
    }

    if (!result.success) {
      return result;
    }

    // Veri satırlarını işle
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      result.totalRows++;

      if (row.length === 0 || !row[productCol]) {
        continue; // Boş satırı atla
      }

      const productName = row[productCol]?.toString().trim();
      const size = sizeCol !== -1 ? row[sizeCol]?.toString().trim() : '10x15 cm';
      const material = materialCol !== -1 ? row[materialCol]?.toString().trim() : 'Alüminyum Bariyer';
      const quantity = quantityCol !== -1 ? parseInt(row[quantityCol]) : 0;
      const note = noteCol !== -1 ? row[noteCol]?.toString().trim() : '';

      // Validasyon
      const rowNum = i + 1;

      if (!productName) {
        result.errors.push(`Satır ${rowNum}: Ürün adı boş.`);
        continue;
      }

      const productMapping = this.findProductMapping(productName);
      if (!productMapping) {
        result.errors.push(`Satır ${rowNum}: "${productName}" ürünü tanınmadı.`);
        continue;
      }

      if (!quantity || isNaN(quantity) || quantity < 1) {
        result.errors.push(`Satır ${rowNum}: Geçersiz adet.`);
        continue;
      }

      if (quantity < productMapping.minOrder) {
        result.warnings.push(
          `Satır ${rowNum}: "${productName}" için minimum ${productMapping.minOrder} adet gerekli. Mevcut: ${quantity}`
        );
      }

      // Ürün ekle
      result.items.push({
        product_name: productMapping.name,
        size: size || '10x15 cm',
        material: material || 'Alüminyum Bariyer',
        quantity: quantity,
        custom_note: note,
      });
    }

    if (result.items.length === 0) {
      result.success = false;
      result.errors.push('Geçerli ürün bulunamadı.');
    }

    return result;
  }

  /**
   * Kolon indeksini bul
   */
  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => 
        h.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  /**
   * Ürün eşleştirmesini bul
   */
  private findProductMapping(name: string) {
    const lowerName = name.toLowerCase();
    
    // Tam eşleşme dene
    if (PRODUCT_MAPPINGS[lowerName]) {
      return PRODUCT_MAPPINGS[lowerName];
    }

    // Kısmi eşleşme dene
    for (const [key, value] of Object.entries(PRODUCT_MAPPINGS)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Sepete toplu ekle
   */
  public addToCart(items: BulkOrderItem[]): { success: number; failed: number; errors: string[] } {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const cart = JSON.parse(localStorage.getItem('cvk_cart_v2') || '[]');

    for (const item of items) {
      const productMapping = this.findProductMapping(item.product_name);
      
      if (!productMapping) {
        result.failed++;
        result.errors.push(`"${item.product_name}" ürünü sepete eklenemedi.`);
        continue;
      }

      const cartItem = {
        id: productMapping.id,
        name: productMapping.name,
        price: productMapping.price,
        quantity: item.quantity,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        minOrder: productMapping.minOrder,
        options: {
          size: item.size,
          material: item.material,
        },
        notes: item.custom_note || `Boyut: ${item.size}, Malzeme: ${item.material}`,
      };

      // Mevcut ürünü kontrol et
      const existingIndex = cart.findIndex(
        (c: any) => c.id === cartItem.id && 
        JSON.stringify(c.options) === JSON.stringify(cartItem.options)
      );

      if (existingIndex !== -1) {
        cart[existingIndex].quantity += item.quantity;
      } else {
        cart.push(cartItem);
      }

      result.success++;
    }

    localStorage.setItem('cvk_cart_v2', JSON.stringify(cart));
    
    // Event tetikle
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cvk_cart_v2',
      newValue: JSON.stringify(cart),
    }));

    return result;
  }

  /**
   * Şablon oluştur
   */
  private generateTemplate(): BulkOrderTemplate {
    return {
      headers: ['Ürün Adı', 'Boyut', 'Malzeme', 'Adet', 'Not'],
      sampleData: [
        ['Stand-Up', '10x15 cm', 'Alüminyum Bariyer', '1000', 'Logo baskı ön yüzde'],
        ['Fermuarlı', '12x18 cm', 'Mat BOPP', '500', 'Fermuar üstte'],
        ['Kraft', '10x15 cm', 'Kraft Kağıt', '1500', 'Doğal kağıt görünümü'],
      ],
    };
  }

  /**
   * Sipariş özeti oluştur
   */
  public generateOrderSummary(items: BulkOrderItem[]): {
    totalItems: number;
    totalQuantity: number;
    estimatedTotal: number;
    products: string[];
  } {
    let totalQuantity = 0;
    let estimatedTotal = 0;
    const products = new Set<string>();

    for (const item of items) {
      totalQuantity += item.quantity;
      const mapping = this.findProductMapping(item.product_name);
      if (mapping) {
        estimatedTotal += mapping.price * item.quantity;
        products.add(mapping.name);
      }
    }

    return {
      totalItems: items.length,
      totalQuantity,
      estimatedTotal: Math.round(estimatedTotal * 100) / 100,
      products: Array.from(products),
    };
  }
}

// Singleton instance
export const bulkOrderService = new BulkOrderService();

export default bulkOrderService;

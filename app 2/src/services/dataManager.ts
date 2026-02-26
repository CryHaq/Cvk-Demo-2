/**
 * Data Manager Service
 * 
 * Veri yedekleme, dışa aktarma ve içe aktarma işlemleri
 * - Tüm localStorage verilerini JSON olarak dışa aktarma
 * - JSON dosyasından içe aktarma
 * - Otomatik yedekleme
 * - Veri senkronizasyonu
 */

import { toast } from '@/components/Toast';

export interface DataBackup {
  timestamp: number;
  date: string;
  version: string;
  data: {
    [key: string]: any;
  };
  metadata: {
    totalKeys: number;
    totalSize: string;
    browser: string;
    userAgent: string;
  };
}

export interface ExportOptions {
  includeKeys?: string[];
  excludeKeys?: string[];
  encrypt?: boolean;
  password?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface StorageStats {
  totalKeys: number;
  totalSize: number;
  items: StorageItem[];
}

export interface StorageItem {
  key: string;
  size: number;
  type: string;
  lastModified: number;
}

const BACKUP_KEY = 'cvk_auto_backup';
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 saat
const MAX_BACKUPS = 5;

class DataManagerService {
  private autoBackupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startAutoBackup();
  }

  /**
   * Tüm verileri dışa aktar
   */
  public exportAll(options: ExportOptions = {}): DataBackup {
    const data: { [key: string]: any } = {};
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      // Hariç tutulan anahtarları atla
      if (options.excludeKeys?.includes(key)) continue;
      
      // Sadece belirli anahtarları al
      if (options.includeKeys && !options.includeKeys.includes(key)) continue;
      
      try {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      } catch {
        // JSON parse edilemeyenleri string olarak al
        data[key] = localStorage.getItem(key);
      }
    }

    const backup: DataBackup = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      version: '1.0',
      data,
      metadata: {
        totalKeys: Object.keys(data).length,
        totalSize: this.formatBytes(JSON.stringify(data).length),
        browser: navigator.userAgent,
        userAgent: navigator.userAgent,
      },
    };

    return backup;
  }

  /**
   * JSON dosyası olarak indir
   */
  public downloadJSON(filename?: string): void {
    const backup = this.exportAll();
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || `CVK_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success(`${backup.metadata.totalKeys} kayıt dışa aktarıldı.`);
  }

  /**
   * CSV formatında dışa aktar (sadece siparişler için)
   */
  public downloadOrdersCSV(): void {
    const orders = JSON.parse(localStorage.getItem('cvk_mock_orders') || '[]');
    
    if (orders.length === 0) {
      toast.warning('Dışa aktarılacak sipariş bulunamadı.');
      return;
    }

    const headers = [
      'Sipariş No',
      'Müşteri',
      'E-posta',
      'Telefon',
      'Toplam',
      'Durum',
      'Ödeme',
      'Tarih',
    ];

    const rows = orders.map((order: any) => [
      order.order_number,
      order.shipping_address?.full_name || '',
      order.shipping_address?.email || '',
      order.shipping_address?.phone || '',
      order.total_amount,
      order.status,
      order.payment_status,
      new Date(order.created_at).toLocaleDateString('tr-TR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CVK_Siparisler_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success(`${orders.length} sipariş CSV olarak indirildi.`);
  }

  /**
   * JSON dosyasını içe aktar
   */
  public async importFromFile(file: File, merge: boolean = false): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backup: DataBackup = JSON.parse(content);
          const result = this.importData(backup, merge);
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
   * Veriyi içe aktar
   */
  public importData(backup: DataBackup, merge: boolean = false): ImportResult {
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      warnings: [],
    };

    if (!backup.data || typeof backup.data !== 'object') {
      result.success = false;
      result.errors.push('Geçersiz yedek dosyası formatı.');
      return result;
    }

    // Merge değilse tüm veriyi temizle
    if (!merge) {
      this.clearAllData();
    }

    for (const [key, value] of Object.entries(backup.data)) {
      try {
        // Mevcut veriyi kontrol et
        if (merge && localStorage.getItem(key)) {
          // Array'leri birleştir
          const existing = JSON.parse(localStorage.getItem(key) || 'null');
          if (Array.isArray(existing) && Array.isArray(value)) {
            const merged = [...existing, ...value];
            localStorage.setItem(key, JSON.stringify(merged));
            result.imported++;
            continue;
          }
          
          // Object'leri birleştir
          if (typeof existing === 'object' && typeof value === 'object') {
            const merged = { ...existing, ...value };
            localStorage.setItem(key, JSON.stringify(merged));
            result.imported++;
            continue;
          }
          
          result.skipped++;
          continue;
        }

        localStorage.setItem(key, JSON.stringify(value));
        result.imported++;
      } catch (error) {
        result.errors.push(`"${key}" anahtarı içe aktarılamadı.`);
      }
    }

    if (result.imported > 0) {
      toast.success(`${result.imported} kayıt içe aktarıldı.`);
    }
    
    if (result.skipped > 0) {
      toast.info(`${result.skipped} kayıt atlandı (birleştirme modu).`);
    }

    return result;
  }

  /**
   * Otomatik yedekle
   */
  public createAutoBackup(): void {
    const backup = this.exportAll({
      excludeKeys: [BACKUP_KEY], // Yedekleri yedekleme
    });

    // Önceki yedekleri al
    const backups: DataBackup[] = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    
    // Yeni yedek ekle
    backups.push(backup);
    
    // En fazla MAX_BACKUPS kadar tut
    if (backups.length > MAX_BACKUPS) {
      backups.splice(0, backups.length - MAX_BACKUPS);
    }

    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  }

  /**
   * Yedekleri listele
   */
  public getBackups(): DataBackup[] {
    try {
      return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Belirli bir yedeği geri yükle
   */
  public restoreBackup(timestamp: number): boolean {
    const backups = this.getBackups();
    const backup = backups.find(b => b.timestamp === timestamp);
    
    if (!backup) {
      toast.error('Yedek bulunamadı.');
      return false;
    }

    const result = this.importData(backup, false);
    return result.success;
  }

  /**
   * Yedek sil
   */
  public deleteBackup(timestamp: number): void {
    const backups = this.getBackups().filter(b => b.timestamp !== timestamp);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    toast.success('Yedek silindi.');
  }

  /**
   * Tüm verileri temizle
   */
  public clearAllData(): void {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key !== BACKUP_KEY) { // Yedekleri koru
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Depolama istatistikleri
   */
  public getStorageStats(): StorageStats {
    const items: StorageItem[] = [];
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key) || '';
      const size = new Blob([value]).size;
      totalSize += size;

      items.push({
        key,
        size,
        type: this.detectType(value),
        lastModified: Date.now(), // localStorage'da yok, şimdiki zaman kullan
      });
    }

    // Boyuta göre sırala
    items.sort((a, b) => b.size - a.size);

    return {
      totalKeys: items.length,
      totalSize,
      items,
    };
  }

  /**
   * Anahtar sil
   */
  public deleteKey(key: string): void {
    localStorage.removeItem(key);
    toast.success(`"${key}" silindi.`);
  }

  /**
   * Anahtar dışa aktar
   */
  public exportKey(key: string): void {
    const value = localStorage.getItem(key);
    if (!value) {
      toast.error('Veri bulunamadı.');
      return;
    }

    const blob = new Blob([value], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${key}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success('Veri dışa aktarıldı.');
  }

  /**
   * Otomatik yedeklemeyi başlat
   */
  private startAutoBackup(): void {
    // Sayfa kapanırken yedekle
    window.addEventListener('beforeunload', () => {
      this.createAutoBackup();
    });

    // Periyodik yedekleme
    this.autoBackupInterval = setInterval(() => {
      this.createAutoBackup();
    }, BACKUP_INTERVAL);
  }

  /**
   * Veri tipini tespit et
   */
  private detectType(value: string): string {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return 'array';
      if (typeof parsed === 'object') return 'object';
      return typeof parsed;
    } catch {
      return 'string';
    }
  }

  /**
   * Byte formatla
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Servisi durdur
   */
  public destroy(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }
  }
}

// Singleton instance
export const dataManager = new DataManagerService();

// Hook için helper
export function useDataManager() {
  return {
    exportAll: dataManager.exportAll.bind(dataManager),
    downloadJSON: dataManager.downloadJSON.bind(dataManager),
    downloadOrdersCSV: dataManager.downloadOrdersCSV.bind(dataManager),
    importFromFile: dataManager.importFromFile.bind(dataManager),
    importData: dataManager.importData.bind(dataManager),
    createAutoBackup: dataManager.createAutoBackup.bind(dataManager),
    getBackups: dataManager.getBackups.bind(dataManager),
    restoreBackup: dataManager.restoreBackup.bind(dataManager),
    deleteBackup: dataManager.deleteBackup.bind(dataManager),
    clearAllData: dataManager.clearAllData.bind(dataManager),
    getStorageStats: dataManager.getStorageStats.bind(dataManager),
    deleteKey: dataManager.deleteKey.bind(dataManager),
    exportKey: dataManager.exportKey.bind(dataManager),
  };
}

export default dataManager;

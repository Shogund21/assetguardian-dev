
interface OfflineReading {
  id: string;
  equipment_id: string;
  reading_type: string;
  value: number;
  unit: string;
  notes?: string;
  location_notes?: string;
  timestamp: string;
  synced: boolean;
  retry_count: number;
}

interface OfflineEquipment {
  id: string;
  name: string;
  location: string;
  cached_at: string;
}

export class OfflineStorageService {
  private dbName = 'AssetGuardianOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Offline readings store
        if (!db.objectStoreNames.contains('readings')) {
          const readingsStore = db.createObjectStore('readings', { keyPath: 'id' });
          readingsStore.createIndex('equipment_id', 'equipment_id');
          readingsStore.createIndex('synced', 'synced');
          readingsStore.createIndex('timestamp', 'timestamp');
        }
        
        // Equipment cache
        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('cached_at', 'cached_at');
        }
        
        // App state
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' });
        }
      };
    });
  }

  async storeReading(reading: Omit<OfflineReading, 'id' | 'synced' | 'retry_count'>): Promise<string> {
    if (!this.db) await this.initDB();
    
    const offlineReading: OfflineReading = {
      ...reading,
      id: crypto.randomUUID(),
      synced: false,
      retry_count: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['readings'], 'readwrite');
      const store = transaction.objectStore('readings');
      const request = store.add(offlineReading);
      
      request.onsuccess = () => resolve(offlineReading.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsynced(): Promise<OfflineReading[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['readings'], 'readonly');
      const store = transaction.objectStore('readings');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['readings'], 'readwrite');
      const store = transaction.objectStore('readings');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const reading = getRequest.result;
        if (reading) {
          reading.synced = true;
          const putRequest = store.put(reading);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Reading not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async incrementRetryCount(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['readings'], 'readwrite');
      const store = transaction.objectStore('readings');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const reading = getRequest.result;
        if (reading) {
          reading.retry_count = (reading.retry_count || 0) + 1;
          const putRequest = store.put(reading);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Reading not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cacheEquipment(equipment: OfflineEquipment[]): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['equipment'], 'readwrite');
      const store = transaction.objectStore('equipment');
      
      // Clear existing cache
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Add new equipment
        const promises = equipment.map(eq => {
          return new Promise<void>((resolveAdd, rejectAdd) => {
            const addRequest = store.add({
              ...eq,
              cached_at: new Date().toISOString(),
            });
            addRequest.onsuccess = () => resolveAdd();
            addRequest.onerror = () => rejectAdd(addRequest.error);
          });
        });
        
        Promise.all(promises)
          .then(() => resolve())
          .catch(reject);
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  async getCachedEquipment(): Promise<OfflineEquipment[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['equipment'], 'readonly');
      const store = transaction.objectStore('equipment');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getReadingCount(): Promise<number> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['readings'], 'readonly');
      const store = transaction.objectStore('readings');
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedCount(): Promise<number> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['readings'], 'readonly');
      const store = transaction.objectStore('readings');
      const index = store.index('synced');
      const request = index.count(IDBKeyRange.only(false));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorageService();

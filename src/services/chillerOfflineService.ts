// Offline storage service for Chiller Annual Inspections

import { ChillerWizardFormData, PhotoData } from '@/types/chillerWizard';

interface ChillerDraft {
  id: string;
  equipment_id: string | null;
  created_at: string;
  updated_at: string;
  current_step: number;
  form_data: ChillerWizardFormData;
  synced: number; // 0 = false, 1 = true
}

interface ChillerPhoto {
  id: string;
  draft_id: string;
  finding_id: string;
  photo_blob: Blob;
  caption: string | null;
  is_primary: boolean;
  synced: number;
}

interface CachedEquipment {
  id: string;
  name: string;
  location: string;
  type: string | null;
  model: string | null;
  serial_number: string | null;
  cached_at: string;
}

export class ChillerOfflineService {
  private dbName = 'ChillerAnnualOffline';
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
        
        // Chiller drafts store
        if (!db.objectStoreNames.contains('chiller_drafts')) {
          const draftsStore = db.createObjectStore('chiller_drafts', { keyPath: 'id' });
          draftsStore.createIndex('equipment_id', 'equipment_id');
          draftsStore.createIndex('synced', 'synced');
          draftsStore.createIndex('updated_at', 'updated_at');
        }
        
        // Chiller photos store
        if (!db.objectStoreNames.contains('chiller_photos')) {
          const photosStore = db.createObjectStore('chiller_photos', { keyPath: 'id' });
          photosStore.createIndex('draft_id', 'draft_id');
          photosStore.createIndex('finding_id', 'finding_id');
          photosStore.createIndex('synced', 'synced');
        }
        
        // Cached equipment store
        if (!db.objectStoreNames.contains('cached_equipment')) {
          const equipmentStore = db.createObjectStore('cached_equipment', { keyPath: 'id' });
          equipmentStore.createIndex('cached_at', 'cached_at');
        }
        
        // Reference data cache
        if (!db.objectStoreNames.contains('reference_data')) {
          db.createObjectStore('reference_data', { keyPath: 'key' });
        }
      };
    });
  }

  // Draft operations
  async saveDraft(
    draftId: string,
    formData: ChillerWizardFormData,
    currentStep: number
  ): Promise<void> {
    if (!this.db) await this.initDB();
    
    const draft: ChillerDraft = {
      id: draftId,
      equipment_id: formData.equipment_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_step: currentStep,
      form_data: formData,
      synced: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readwrite');
      const store = transaction.objectStore('chiller_drafts');
      
      // Check if draft exists first
      const getRequest = store.get(draftId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          // Update existing
          draft.created_at = existing.created_at;
        }
        const putRequest = store.put(draft);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getDraft(draftId: string): Promise<ChillerDraft | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readonly');
      const store = transaction.objectStore('chiller_drafts');
      const request = store.get(draftId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDrafts(): Promise<ChillerDraft[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readonly');
      const store = transaction.objectStore('chiller_drafts');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedDrafts(): Promise<ChillerDraft[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readonly');
      const store = transaction.objectStore('chiller_drafts');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(0));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markDraftAsSynced(draftId: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readwrite');
      const store = transaction.objectStore('chiller_drafts');
      const getRequest = store.get(draftId);
      
      getRequest.onsuccess = () => {
        const draft = getRequest.result;
        if (draft) {
          draft.synced = 1;
          draft.updated_at = new Date().toISOString();
          const putRequest = store.put(draft);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Draft not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteDraft(draftId: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts', 'chiller_photos'], 'readwrite');
      
      // Delete draft
      const draftsStore = transaction.objectStore('chiller_drafts');
      draftsStore.delete(draftId);
      
      // Delete associated photos
      const photosStore = transaction.objectStore('chiller_photos');
      const photosIndex = photosStore.index('draft_id');
      const request = photosIndex.openCursor(IDBKeyRange.only(draftId));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Photo operations
  async savePhoto(
    draftId: string,
    findingId: string,
    photoData: PhotoData
  ): Promise<void> {
    if (!this.db) await this.initDB();
    if (!photoData.blob) return;
    
    const photo: ChillerPhoto = {
      id: photoData.id,
      draft_id: draftId,
      finding_id: findingId,
      photo_blob: photoData.blob,
      caption: photoData.caption,
      is_primary: photoData.is_primary,
      synced: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_photos'], 'readwrite');
      const store = transaction.objectStore('chiller_photos');
      const request = store.put(photo);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotosForFinding(findingId: string): Promise<ChillerPhoto[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_photos'], 'readonly');
      const store = transaction.objectStore('chiller_photos');
      const index = store.index('finding_id');
      const request = index.getAll(IDBKeyRange.only(findingId));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotosForDraft(draftId: string): Promise<ChillerPhoto[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_photos'], 'readonly');
      const store = transaction.objectStore('chiller_photos');
      const index = store.index('draft_id');
      const request = index.getAll(IDBKeyRange.only(draftId));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(photoId: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_photos'], 'readwrite');
      const store = transaction.objectStore('chiller_photos');
      const request = store.delete(photoId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Equipment cache operations
  async cacheEquipment(equipment: CachedEquipment[]): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_equipment'], 'readwrite');
      const store = transaction.objectStore('cached_equipment');
      
      // Clear existing cache
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Add new equipment
        const now = new Date().toISOString();
        equipment.forEach(eq => {
          store.add({ ...eq, cached_at: now });
        });
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCachedEquipment(): Promise<CachedEquipment[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_equipment'], 'readonly');
      const store = transaction.objectStore('cached_equipment');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Reference data cache
  async cacheReferenceData(key: string, data: unknown): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reference_data'], 'readwrite');
      const store = transaction.objectStore('reference_data');
      const request = store.put({ key, data, cached_at: new Date().toISOString() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedReferenceData<T>(key: string): Promise<T | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reference_data'], 'readonly');
      const store = transaction.objectStore('reference_data');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data as T : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Stats
  async getDraftCount(): Promise<number> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readonly');
      const store = transaction.objectStore('chiller_drafts');
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedCount(): Promise<number> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chiller_drafts'], 'readonly');
      const store = transaction.objectStore('chiller_drafts');
      const index = store.index('synced');
      const request = index.count(IDBKeyRange.only(0));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const chillerOfflineService = new ChillerOfflineService();

/**
 * IndexedDB photo storage for user scrapbook & bouquet photos with automatic image optimization
 */

const DB_NAME = 'kittu_scrapbook_photos_db';
const STORE_NAME = 'memory_photos';
const BOUQUET_STORE = 'bouquet_photos';
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'memoryId' });
      }
      if (!db.objectStoreNames.contains(BOUQUET_STORE)) {
        db.createObjectStore(BOUQUET_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Optimizes and resizes an uploaded image file using HTML5 canvas
 * Prevents localStorage/IndexedDB bloat, keeping images fast, crisp, and lightweight
 */
export function optimizeImageFile(file: File, maxDimension = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}

export async function saveMemoryPhotos(memoryId: string, photos: string[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ memoryId, photos, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save photos to IndexedDB:', err);
    try {
      localStorage.setItem(`photos_${memoryId}`, JSON.stringify(photos));
    } catch {
      // storage full
    }
  }
}

export async function getMemoryPhotos(memoryId: string): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(memoryId);
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.photos)) {
          resolve(req.result.photos);
        } else {
          const local = localStorage.getItem(`photos_${memoryId}`);
          resolve(local ? JSON.parse(local) : []);
        }
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    const local = localStorage.getItem(`photos_${memoryId}`);
    return local ? JSON.parse(local) : [];
  }
}

/**
 * Saves a single bouquet slot photo to IndexedDB
 */
export async function saveBouquetPhoto(slotId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BOUQUET_STORE, 'readwrite');
      const store = tx.objectStore(BOUQUET_STORE);
      store.put({ id: slotId, dataUrl, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save bouquet photo to IndexedDB:', err);
  }
}

/**
 * Saves multiple bouquet slot photos in bulk to IndexedDB
 */
export async function saveAllBouquetPhotos(photosMap: Record<string, string>): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BOUQUET_STORE, 'readwrite');
      const store = tx.objectStore(BOUQUET_STORE);
      for (const [id, dataUrl] of Object.entries(photosMap)) {
        if (dataUrl) {
          store.put({ id, dataUrl, updatedAt: Date.now() });
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save bouquet photos in bulk:', err);
  }
}

/**
 * Retrieves all bouquet slot photos from IndexedDB (merging with any legacy localStorage items)
 */
export async function getAllBouquetPhotos(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // 1. Check legacy localStorage for existing uploads
  try {
    const legacy = localStorage.getItem('kanishka_bouquet_custom_photos');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      Object.assign(result, parsed);
    }
  } catch {
    // safe
  }

  // 2. Read from IndexedDB (takes precedence)
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BOUQUET_STORE, 'readonly');
      const store = tx.objectStore(BOUQUET_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        if (Array.isArray(req.result)) {
          for (const item of req.result) {
            if (item && item.id && item.dataUrl) {
              result[item.id] = item.dataUrl;
            }
          }
        }
        resolve(result);
      };
      req.onerror = () => resolve(result);
    });
  } catch {
    return result;
  }
}

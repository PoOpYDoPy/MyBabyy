/**
 * IndexedDB storage utility for persistent audio files.
 * Allows users to add/download songs from their playlist and keep them permanently
 * stored in the browser without any third-party service or Spotify dependency.
 */

export interface StoredAudioTrack {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  fileBlob: Blob;
  duration: number; // in seconds
  addedAt: number;
}

const DB_NAME = 'kittu_audio_vault_v1';
const STORE_NAME = 'custom_tracks';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Parses track title and artist cleanly from filename
 * e.g. "Taylor Swift - Lover.mp3" -> { artist: "Taylor Swift", title: "Lover" }
 * e.g. "Until I Found You.mp3" -> { artist: "Downloaded Track", title: "Until I Found You" }
 */
export function parseAudioFileName(fileName: string): { title: string; artist: string } {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '').trim();
  
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ');
    const artist = parts[0].trim();
    const title = parts.slice(1).join(' - ').trim();
    return { title: title || nameWithoutExt, artist: artist || 'Custom Song' };
  }

  if (nameWithoutExt.includes('-')) {
    const parts = nameWithoutExt.split('-');
    const artist = parts[0].trim();
    const title = parts.slice(1).join('-').trim();
    return { title: title || nameWithoutExt, artist: artist || 'Custom Song' };
  }

  return {
    title: nameWithoutExt || 'Untitled Track',
    artist: 'My Playlist'
  };
}

/**
 * Computes audio duration in seconds by briefly loading metadata
 */
export function getAudioDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const tempUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = tempUrl;

      const cleanup = () => {
        URL.revokeObjectURL(tempUrl);
      };

      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration) || 0;
        cleanup();
        resolve(dur);
      };

      audio.onerror = () => {
        cleanup();
        resolve(0);
      };

      // Fallback timeout in case metadata event stalls
      setTimeout(() => {
        cleanup();
        resolve(0);
      }, 2000);
    } catch {
      resolve(0);
    }
  });
}

/**
 * Saves an uploaded audio file into IndexedDB
 */
export async function saveAudioFile(file: File): Promise<StoredAudioTrack> {
  const db = await openDB();
  const { title, artist } = parseAudioFileName(file.name);
  const duration = await getAudioDuration(file);

  const track: StoredAudioTrack = {
    id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    artist,
    fileName: file.name,
    fileBlob: file,
    duration,
    addedAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(track);

    request.onsuccess = () => resolve(track);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all stored custom audio tracks from IndexedDB
 */
export async function getAllStoredTracks(): Promise<StoredAudioTrack[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const tracks = (request.result as StoredAudioTrack[]) || [];
        // Sort by addition time
        tracks.sort((a, b) => a.addedAt - b.addedAt);
        resolve(tracks);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error fetching tracks from IndexedDB:', err);
    return [];
  }
}

/**
 * Deletes a stored audio track by ID from IndexedDB
 */
export async function deleteStoredTrack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

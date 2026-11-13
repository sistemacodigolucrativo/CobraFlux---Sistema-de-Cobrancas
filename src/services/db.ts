import type { DemoDatabaseSnapshot } from '../types/domain';
import { createInitialDemoSeed } from './seed';

const DB_NAME = 'GoldenBillingSaaS_DemoDB';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';
const SNAPSHOT_KEY = 'primary_snapshot';
const PREFS_STORAGE_KEY = 'golden_billing_ui_prefs_v1';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível neste ambiente.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Erro ao abrir IndexedDB.'));
  });
}

export async function loadDatabaseSnapshot(): Promise<DemoDatabaseSnapshot> {
  try {
    const db = await openIDB();
    return await new Promise<DemoDatabaseSnapshot>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(SNAPSHOT_KEY);
      req.onsuccess = async () => {
        if (req.result) {
          resolve(req.result as DemoDatabaseSnapshot);
        } else {
          const seed = createInitialDemoSeed();
          await saveDatabaseSnapshot(seed);
          resolve(seed);
        }
      };
      req.onerror = () => reject(req.error ?? new Error('Erro ao ler dados de demonstração.'));
    });
  } catch {
    // Graceful fallback in restricted browser contexts
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SNAPSHOT_KEY) : null;
    if (raw) {
      return JSON.parse(raw) as DemoDatabaseSnapshot;
    }
    const seed = createInitialDemoSeed();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(seed));
    }
    return seed;
  }
}

export async function saveDatabaseSnapshot(snapshot: DemoDatabaseSnapshot): Promise<void> {
  try {
    const db = await openIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(snapshot, SNAPSHOT_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error('Erro ao salvar no IndexedDB.'));
    });
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    }
  }
}

export async function resetDatabaseSnapshot(): Promise<DemoDatabaseSnapshot> {
  const seed = createInitialDemoSeed();
  await saveDatabaseSnapshot(seed);
  return seed;
}

export function loadLocalUiPreferences(): { soundEnabled: boolean; soundVolume: number; reduceMotion: boolean } {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      return { soundEnabled: false, soundVolume: 0.35, reduceMotion: false };
    }
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: Boolean(parsed.soundEnabled),
      soundVolume: typeof parsed.soundVolume === 'number' ? parsed.soundVolume : 0.35,
      reduceMotion: Boolean(parsed.reduceMotion),
    };
  } catch {
    return { soundEnabled: false, soundVolume: 0.35, reduceMotion: false };
  }
}

export function saveLocalUiPreferences(prefs: {
  soundEnabled: boolean;
  soundVolume: number;
  reduceMotion: boolean;
}): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

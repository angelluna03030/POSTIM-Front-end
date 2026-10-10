/**
 * Guarda las capturas en IndexedDB. localStorage tiene un límite de ~5 MB y una
 * sola captura en base64 puede superarlo, así que las imágenes van aquí y los
 * ajustes (livianos) en localStorage.
 */
const DB_NAME = "postim";
const STORE = "images";
const MEDIA = "media";

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        if (!db.objectStoreNames.contains(MEDIA)) db.createObjectStore(MEDIA);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

const tx = async <T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | void) => {
  const db = await openDb();
  return new Promise<T | undefined>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error);
  });
};

export type ImageMap = Record<string, string>;

/** Clave especial para la imagen de fondo personalizada */
export const BG_KEY = "__background__";

export const loadImages = async (): Promise<ImageMap> => {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const out: ImageMap = {};
      const req = db.transaction(STORE, "readonly").objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          out[String(cursor.key)] = cursor.value as string;
          cursor.continue();
        } else resolve(out);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
};

/** Sincroniza la base con el mapa actual: guarda nuevas/cambiadas y borra las que ya no están */
export const syncImages = async (next: ImageMap, prev: ImageMap) => {
  try {
    await tx("readwrite", (store) => {
      for (const [k, v] of Object.entries(next)) if (prev[k] !== v) store.put(v, k);
      for (const k of Object.keys(prev)) if (!(k in next)) store.delete(k);
    });
  } catch {
    // IndexedDB no disponible (modo privado): las imágenes solo viven en memoria
  }
};

// ── Audio del video ──
export interface StoredAudio {
  name: string;
  data: ArrayBuffer;
}

export const saveAudio = async (audio: StoredAudio | null) => {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(MEDIA, "readwrite");
      if (audio) t.objectStore(MEDIA).put(audio, "audio");
      else t.objectStore(MEDIA).delete("audio");
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  } catch {
    // ignorado
  }
};

export const loadAudio = async (): Promise<StoredAudio | null> => {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(MEDIA, "readonly").objectStore(MEDIA).get("audio");
      req.onsuccess = () => resolve((req.result as StoredAudio) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
};

export const STORAGE_KEYS = {
  collection: 'gachapon.collection.v1',
  stats: 'gachapon.stats.v1',
  settings: 'gachapon.settings.v1',
};

export function readJsonStorage(key, fallback, storage = globalThis.localStorage) {
  if (!storage) {
    return fallback;
  }

  try {
    const rawValue = storage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value, storage = globalThis.localStorage) {
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}

export function removeStorageKeys(keys, storage = globalThis.localStorage) {
  if (!storage) {
    return;
  }

  keys.forEach((key) => storage.removeItem(key));
}

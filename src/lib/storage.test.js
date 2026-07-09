import { describe, expect, it } from 'vitest';
import { readJsonStorage, removeStorageKeys, writeJsonStorage } from './storage.js';

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe('storage helpers', () => {
  it('reads and writes JSON values', () => {
    const storage = createMemoryStorage();

    writeJsonStorage('demo', { ok: true }, storage);

    expect(readJsonStorage('demo', {}, storage)).toEqual({ ok: true });
  });

  it('returns fallback for malformed JSON', () => {
    const storage = createMemoryStorage();
    storage.setItem('demo', '{bad');

    expect(readJsonStorage('demo', { ok: false }, storage)).toEqual({ ok: false });
  });

  it('removes scoped keys', () => {
    const storage = createMemoryStorage();
    storage.setItem('a', '1');
    storage.setItem('b', '2');

    removeStorageKeys(['a'], storage);

    expect(storage.getItem('a')).toBeNull();
    expect(storage.getItem('b')).toBe('2');
  });
});

import { useEffect, useState } from 'react';
import { readJsonStorage, writeJsonStorage } from '../lib/storage.js';

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => readJsonStorage(key, fallback));

  useEffect(() => {
    writeJsonStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

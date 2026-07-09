import { useMemo } from 'react';
import { STORAGE_KEYS } from '../lib/storage.js';
import { useLocalStorage } from './useLocalStorage.js';

const emptyStats = {
  totalDraws: 0,
  rarityCounts: {},
};

export function useCollection(items) {
  const [collection, setCollection] = useLocalStorage(STORAGE_KEYS.collection, {});
  const [stats, setStats] = useLocalStorage(STORAGE_KEYS.stats, emptyStats);

  const collectionSummary = useMemo(() => {
    const collectedIds = Object.keys(collection);
    const totalCopies = Object.values(collection).reduce(
      (total, entry) => total + entry.count,
      0,
    );

    return {
      uniqueCollected: collectedIds.length,
      totalItems: items.length,
      totalCopies,
      completionPercent:
        items.length > 0 ? Math.round((collectedIds.length / items.length) * 100) : 0,
    };
  }, [collection, items.length]);

  function addItem(item) {
    const now = new Date().toISOString();
    const duplicate = Boolean(collection[item.id]);

    setCollection((currentCollection) => {
      const currentEntry = currentCollection[item.id];

      return {
        ...currentCollection,
        [item.id]: {
          itemId: item.id,
          count: currentEntry ? currentEntry.count + 1 : 1,
          firstCollectedAt: currentEntry?.firstCollectedAt ?? now,
          lastCollectedAt: now,
        },
      };
    });

    setStats((currentStats) => ({
      totalDraws: (currentStats.totalDraws ?? 0) + 1,
      rarityCounts: {
        ...(currentStats.rarityCounts ?? {}),
        [item.rarity]: (currentStats.rarityCounts?.[item.rarity] ?? 0) + 1,
      },
    }));

    return duplicate;
  }

  function resetCollection() {
    setCollection({});
    setStats(emptyStats);
  }

  return {
    collection,
    stats,
    collectionSummary,
    addItem,
    resetCollection,
  };
}

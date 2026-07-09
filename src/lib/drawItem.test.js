import { describe, expect, it } from 'vitest';
import { drawWeightedItem, getEligibleItems } from './drawItem.js';

describe('drawWeightedItem', () => {
  const items = [
    { id: 'common', weight: 3 },
    { id: 'rare', weight: 1 },
  ];

  it('draws using cumulative weights', () => {
    expect(drawWeightedItem(items, () => 0).id).toBe('common');
    expect(drawWeightedItem(items, () => 0.74).id).toBe('common');
    expect(drawWeightedItem(items, () => 0.99).id).toBe('rare');
  });

  it('ignores zero and negative weights', () => {
    const pool = [
      { id: 'zero', weight: 0 },
      { id: 'negative', weight: -1 },
      { id: 'valid', weight: 2 },
    ];

    expect(getEligibleItems(pool).map((item) => item.id)).toEqual(['valid']);
    expect(drawWeightedItem(pool, () => 0.4).id).toBe('valid');
  });

  it('throws for an empty eligible pool', () => {
    expect(() => drawWeightedItem([{ id: 'bad', weight: 0 }])).toThrow(
      'Cannot draw from an empty item pool.',
    );
  });
});

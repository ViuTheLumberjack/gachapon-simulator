export const RARITY_META = {
  common: {
    label: 'Common',
    className: 'rarity-common',
  },
  uncommon: {
    label: 'Uncommon',
    className: 'rarity-uncommon',
  },
  rare: {
    label: 'Rare',
    className: 'rarity-rare',
  },
  epic: {
    label: 'Epic',
    className: 'rarity-epic',
  },
  legendary: {
    label: 'Legendary',
    className: 'rarity-legendary',
  },
};

export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function getRarityMeta(rarity) {
  return RARITY_META[rarity] ?? {
    label: rarity,
    className: 'rarity-unknown',
  };
}

export function summarizeRarityOdds(items) {
  const totals = RARITY_ORDER.reduce((summary, rarity) => {
    summary[rarity] = 0;
    return summary;
  }, {});

  const totalWeight = items.reduce((sum, item) => {
    totals[item.rarity] = (totals[item.rarity] ?? 0) + item.weight;
    return sum + item.weight;
  }, 0);

  return RARITY_ORDER.map((rarity) => ({
    rarity,
    label: getRarityMeta(rarity).label,
    weight: totals[rarity] ?? 0,
    percent: totalWeight > 0 ? ((totals[rarity] ?? 0) / totalWeight) * 100 : 0,
  })).filter((entry) => entry.weight > 0);
}

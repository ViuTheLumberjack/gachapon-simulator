export function getEligibleItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(
    (item) => Number.isFinite(item.weight) && item.weight > 0,
  );
}

export function drawWeightedItem(items, random = Math.random) {
  const eligibleItems = getEligibleItems(items);

  if (eligibleItems.length === 0) {
    throw new Error('Cannot draw from an empty item pool.');
  }

  const totalWeight = eligibleItems.reduce((total, item) => total + item.weight, 0);
  const target = random() * totalWeight;
  let cumulative = 0;

  for (const item of eligibleItems) {
    cumulative += item.weight;
    if (target < cumulative) {
      return item;
    }
  }

  return eligibleItems[eligibleItems.length - 1];
}

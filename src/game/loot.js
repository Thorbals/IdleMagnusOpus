export function resolveDrops(registry, lootId) {
  const table = registry.get("loot", lootId);
  if (!table) return [];

  return Object.entries(table.entries)
    .filter(([, entry]) => rollChance(entry.chance ?? 100))
    .map(([itemId, entry]) => ({
      itemId,
      qty: rollQuantity(entry.min ?? 1, entry.max ?? 1),
    }));
}

export function resolveNodeDrops(node) {
  return Object.entries(node.drops)
    .filter(([, entry]) => rollChance(entry.chance ?? 100))
    .map(([itemId, entry]) => ({
      itemId,
      qty: rollQuantity(entry.qty ?? 1, entry.qty ?? 1),
    }));
}

function rollChance(chance) {
  return Math.random() * 100 < chance;
}

function rollQuantity(min = 1, max = 1) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + Math.floor(Math.random() * (high - low + 1));
}

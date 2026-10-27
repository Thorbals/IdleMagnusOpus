export function fmt(value) {
  return Math.round(value).toLocaleString("en-US");
}

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function durationLabel(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function itemName(registry, itemId) {
  return registry.get("items", itemId)?.name ?? itemId;
}

export function itemIcon(registry, itemId) {
  return registry.get("items", itemId)?.icon ?? "scrap";
}

export function factionOfEnemy(registry, enemy) {
  return registry.get("factions", enemy.factionId);
}

export function enemiesInArea(registry, area) {
  return area.enemyIds.map((id) => registry.get("enemies", id)).filter(Boolean);
}

export function nodesInArea(registry, area) {
  return area.nodeIds.map((id) => registry.get("nodes", id)).filter(Boolean);
}

export function nodesForSkill(registry, skillId) {
  return registry.all("nodes").filter((node) => node.skillId === skillId);
}

export function recipesForSkill(registry, skillId) {
  return registry.all("recipes").filter((recipe) => recipe.skillId === skillId);
}

export function xpForLevel(level) {
  return level * 250;
}

export function progressPercent(activeAction) {
  if (!activeAction) return 0;
  return Math.max(0, Math.min(100, (activeAction.elapsed / activeAction.durationMs) * 100));
}

export function activeActionLabel(registry, activeAction) {
  if (!activeAction) return "Idle";
  if (activeAction.kind === "node") {
    return registry.get("nodes", activeAction.id)?.name ?? "Gathering";
  }
  return registry.get("recipes", activeAction.id)?.name ?? "Crafting";
}

export function rollChance(chance) {
  return Math.random() * 100 < chance;
}

export function rollQuantity(min = 1, max = 1) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + Math.floor(Math.random() * (high - low + 1));
}

export function resolveDrops(registry, lootId, rng = Math.random) {
  const table = registry.get("loot", lootId);
  if (!table) return [];

  const results = [];
  for (const [itemId, entry] of Object.entries(table.entries)) {
    if (!rollChanceWith(rng, entry.chance ?? 100)) continue;
    const qty = rollQuantityWith(rng, entry.min ?? 1, entry.max ?? 1);
    results.push({ itemId, qty });
  }
  return results;
}

function rollChanceWith(rng, chance) {
  return rng() * 100 < chance;
}

function rollQuantityWith(rng, min = 1, max = 1) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + Math.floor(rng() * (high - low + 1));
}

export function toneClass(tone) {
  if (tone === "good") return "good";
  if (tone === "bad") return "bad";
  if (tone === "loot") return "loot";
  return "";
}

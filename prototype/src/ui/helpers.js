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


export function nodesForSkill(registry, skillId) {
  return registry.all("nodes").filter((node) => node.skillId === skillId);
}

export function recipesForSkill(registry, skillId) {
  return registry.all("recipes").filter((recipe) => recipe.skillId === skillId);
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

import { completeActionOnce } from "./actions.js";

const MAX_OFFLINE_MS = 12 * 60 * 60 * 1000;
const MIN_OFFLINE_MS = 60 * 1000;
const MAX_COMPLETIONS = 5000;

export function applyOfflineProgress(state, registry, now = Date.now()) {
  if (!state.lastSavedAt || !state.activeAction) return null;

  const elapsed = Math.min(now - state.lastSavedAt, MAX_OFFLINE_MS);
  if (elapsed < MIN_OFFLINE_MS) return null;

  const action = state.activeAction;
  const loot = new Map();
  let total = elapsed + action.elapsed;
  let completions = 0;
  let xp = 0;

  while (
    total >= action.durationMs &&
    completions < MAX_COMPLETIONS &&
    (action.repeat || completions === 0)
  ) {
    const result = completeActionOnce(state, registry, action);
    if (!result.ok) break;

    completions += 1;
    xp += result.xp;

    for (const part of result.parts) {
      loot.set(part.itemId, (loot.get(part.itemId) ?? 0) + part.qty);
    }

    total -= action.durationMs;

    if (!action.repeat) break;
  }

  if (completions === 0) return null;

  state.activeAction = action.repeat ? { ...action, elapsed: total } : null;

  state.offlineReport = {
    minutes: Math.floor(elapsed / 60000),
    actions: completions,
    xp,
    loot: [...loot.entries()].map(([itemId, qty]) => {
      const name = registry.get("items", itemId)?.name ?? itemId;
      return `${qty}x ${name}`;
    }),
  };

  state.lastSavedAt = now;

  return state.offlineReport;
}

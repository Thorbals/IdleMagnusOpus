import { addItem, countItem, removeItem } from "./inventory.js";
import { resolveNodeDrops } from "./loot.js";
import { addSkillXp } from "./progression.js";
import { pushLog } from "../state/state.js";

function itemLabel(registry, itemId) {
  return registry.get("items", itemId)?.name ?? itemId;
}

/**
 * Completes one unit of a node or recipe.
 * Returns what was gained so the caller can build a toast or offline report.
 */
export function completeActionOnce(state, registry, action) {
  if (action.kind === "node") {
    const node = registry.get("nodes", action.id);
    if (!node) return { ok: false, parts: [], xp: 0 };

    const drops = resolveNodeDrops(node);
    const parts = [];

    for (const drop of drops) {
      if (addItem(state, registry, drop.itemId, drop.qty)) {
        parts.push(drop);
      } else {
        pushLog(state, `Bank full: lost ${drop.qty}x ${itemLabel(registry, drop.itemId)}.`, "bad");
      }
    }

    addSkillXp(state, registry, node.skillId, node.xp);
    pushLog(state, `Completed ${node.name}.`, "good");

    return { ok: true, parts, xp: node.xp, name: node.name };
  }

  const recipe = registry.get("recipes", action.id);
  if (!recipe) return { ok: false, parts: [], xp: 0 };

  const missing = Object.entries(recipe.inputs).find(
    ([itemId, qty]) => countItem(state, itemId) < qty
  );

  if (missing) {
    pushLog(state, `Missing ${itemLabel(registry, missing[0])}.`, "bad");
    return { ok: false, parts: [], xp: 0, name: recipe.name };
  }

  for (const [itemId, qty] of Object.entries(recipe.inputs)) {
    removeItem(state, itemId, qty);
  }

  const parts = [];
  for (const [itemId, qty] of Object.entries(recipe.outputs)) {
    if (addItem(state, registry, itemId, qty)) {
      parts.push({ itemId, qty });
      pushLog(state, `+${qty} ${itemLabel(registry, itemId)}`, "loot");
    } else {
      pushLog(state, `Bank full: lost ${qty}x ${itemLabel(registry, itemId)}.`, "bad");
    }
  }

  addSkillXp(state, registry, recipe.skillId, recipe.xp);
  pushLog(state, `Crafted ${recipe.name}.`, "good");

  return { ok: true, parts, xp: recipe.xp, name: recipe.name };
}

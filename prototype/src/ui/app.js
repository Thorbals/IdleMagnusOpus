import {
  addItem,
  countItem,
  equipItem,
  removeItem,
  unequipItem,
} from "../game/inventory.js";
import { resolveDrops, resolveNodeDrops } from "../game/loot.js";
import { addSkillXp, skillLevel } from "../game/progression.js";
import { deriveStats, scaleEnemy } from "../game/stats.js";
import {
  loadState,
  pushLog,
  resetState,
  saveState,
  setToast,
} from "../state/state.js";
import { itemName } from "./helpers.js";
import { renderAreas } from "./screens/areas.js";
import { renderBank } from "./screens/bank.js";
import { renderCombat } from "./screens/combat.js";
import { renderHomeBase } from "./screens/homebase.js";
import { renderShop } from "./screens/shop.js";
import { renderSkill } from "./screens/skills.js";
import { renderShell } from "./shell.js";

export function createApp({ registry, state }) {
  const root = document.getElementById("app");
  let lastScreenKey = "";

  function screenContent() {
    switch (state.screen) {
      case "combat":
        return renderCombat(registry, state);
      case "bank":
        return renderBank(registry, state);
      case "shop":
        return renderShop(registry, state);
      case "skill":
        return renderSkill(registry, state);
      case "homebase":
        return renderHomeBase(state);
      case "areas":
      default:
        return renderAreas(registry, state);
    }
  }

  function render({ resetScroll = false } = {}) {
    const screenKey = `${state.screen}:${state.selectedAreaId}:${state.selectedSkillId}`;
    const scroll = root.querySelector(".content")?.scrollTop ?? 0;
    const changed = screenKey !== lastScreenKey;
    lastScreenKey = screenKey;

    root.innerHTML = renderShell(registry, state, screenContent());

    const content = root.querySelector(".content");
    if (content) content.scrollTop = changed || resetScroll ? 0 : scroll;
  }

  function go(screen, options = {}) {
    state.screen = screen;
    if (options.areaId) state.selectedAreaId = options.areaId;
    if (options.skillId) state.selectedSkillId = options.skillId;
    render({ resetScroll: true });
  }

  function selectEnemy(enemyId) {
    const enemy = registry.get("enemies", enemyId);
    if (!enemy) return null;

    const faction = registry.get("factions", enemy.factionId);
    const stats = scaleEnemy(enemy, faction);

    if (!state.combat || state.combat.enemyId !== enemyId || state.combat.hp <= 0) {
      state.combat = { enemyId, hp: stats.hp, maxHp: stats.hp };
    }

    state.selectedEnemyId = enemyId;
    return { enemy, faction, stats };
  }

  function grantLoot(drops) {
    const parts = [];
    for (const drop of drops) {
      addItem(state, registry, drop.itemId, drop.qty);
      pushLog(state, `+${drop.qty} ${itemName(registry, drop.itemId)}`, "loot");
      parts.push(`${drop.qty}x ${itemName(registry, drop.itemId)}`);
    }
    return parts;
  }

  function startAction(kind, id) {
    if (state.activeAction) {
      setToast(state, "Already busy.", "bad");
      render();
      return;
    }

    const category = kind === "node" ? "nodes" : "recipes";
    const def = registry.get(category, id);
    if (!def) return;

    const level = skillLevel(state, def.skillId);
    if (level < def.levelReq) {
      setToast(state, `Requires level ${def.levelReq}.`, "bad");
      render();
      return;
    }

    if (kind === "recipe") {
      const missing = Object.entries(def.inputs).find(
        ([itemId, qty]) => countItem(state, itemId) < qty
      );
      if (missing) {
        setToast(state, `Missing ${itemName(registry, missing[0])}.`, "bad");
        render();
        return;
      }
    }

    state.activeAction = {
      kind,
      id,
      durationMs: def.durationMs,
      elapsed: 0,
      repeat: false,
    };
    pushLog(state, `Started ${def.name}.`, "muted");
    render({ resetScroll: true });
  }

  function completeAction() {
    const action = state.activeAction;
    if (!action) return;

    if (action.kind === "node") {
      const node = registry.get("nodes", action.id);
      const drops = resolveNodeDrops(node);
      const parts = grantLoot(drops);
      addSkillXp(state, registry, node.skillId, node.xp);
      setToast(state, parts.length ? parts.join(", ") : `${node.name} complete`);
      pushLog(state, `Completed ${node.name}.`, "good");
    } else {
      const recipe = registry.get("recipes", action.id);
      const missing = Object.entries(recipe.inputs).find(
        ([itemId, qty]) => countItem(state, itemId) < qty
      );

      if (missing) {
        pushLog(state, `Missing ${itemName(registry, missing[0])}.`, "bad");
        state.activeAction = null;
        return;
      }

      for (const [itemId, qty] of Object.entries(recipe.inputs)) {
        removeItem(state, itemId, qty);
      }

      const parts = [];
      for (const [itemId, qty] of Object.entries(recipe.outputs)) {
        addItem(state, registry, itemId, qty);
        parts.push(`${qty}x ${itemName(registry, itemId)}`);
        pushLog(state, `+${qty} ${itemName(registry, itemId)}`, "loot");
      }

      addSkillXp(state, registry, recipe.skillId, recipe.xp);
      pushLog(state, `Crafted ${recipe.name}.`, "good");
      setToast(state, `Crafted ${parts.join(", ")}`);
    }

    if (state.activeAction?.repeat) {
      state.activeAction.elapsed = 0;
    } else {
      state.activeAction = null;
    }
  }

  function fight(enemyId) {
    const info = selectEnemy(enemyId);
    if (!info) return;

    const { enemy, faction, stats: enemyStats } = info;
    const player = deriveStats(state, registry);
    const combat = state.combat;

    const hitChance = Math.min(95, Math.max(5, player.accuracy));
    const hit = Math.random() * 100 < hitChance;

    if (!hit) {
      pushLog(state, `You miss ${enemy.name}.`, "bad");
    } else {
      const crit = Math.random() * 100 < player.crit;
      const reduction = enemyStats.defense / (enemyStats.defense + 100);
      const raw = player.attack * (crit ? 1.5 : 1);
      const damage = Math.max(1, Math.round(raw * (1 - reduction)));

      combat.hp = Math.max(0, combat.hp - damage);
      pushLog(
        state,
        `${crit ? "Critical! " : ""}You hit ${enemy.name} for ${damage}.`,
        crit ? "loot" : "good"
      );
    }

    if (combat.hp <= 0) {
      const drops = resolveDrops(registry, enemy.lootId);
      const parts = grantLoot(drops);
      addSkillXp(state, registry, "skill.melee", enemy.level * 8);
      pushLog(state, `${enemy.name} goes down.`, "good");
      setToast(state, parts.length ? `Killed ${enemy.name}: ${parts.join(", ")}` : `${enemy.name} down`);
      state.combat = { enemyId, hp: 0, maxHp: combat.maxHp };
      render();
      return;
    }

    const enemyHit = Math.random() * 100 < Math.min(95, enemyStats.accuracy);
    if (enemyHit) {
      const enemyCrit = Math.random() * 100 < enemyStats.crit;
      const reduction = player.defense / (player.defense + 100);
      const raw = enemyStats.attack * (enemyCrit ? 1.5 : 1);
      const damage = Math.max(1, Math.round(raw * (1 - reduction)));
      state.hp = Math.max(0, state.hp - damage);
      pushLog(state, `${enemy.name} hits you for ${damage}.`, "bad");

      if (state.hp <= 0) {
        state.hp = 1;
        state.combat = null;
        state.screen = "areas";
        pushLog(state, "You fall back to the road.", "bad");
        setToast(state, "You were overwhelmed.", "bad");
      }
    } else {
      pushLog(state, `${enemy.name} misses.`, "muted");
    }

    render();
  }

  function buy(offerId) {
    const offer = registry.get("shops", offerId);
    if (!offer) return;

    if (offer.grantsUnlock && state.unlocks.includes(offer.grantsUnlock)) {
      setToast(state, "Already owned.", "bad");
      render();
      return;
    }

    if (state.combatLevel < offer.levelReq) {
      setToast(state, `Requires level ${offer.levelReq}.`, "bad");
      render();
      return;
    }

    if (state.scrap < offer.cost) {
      setToast(state, "Not enough scrap.", "bad");
      render();
      return;
    }

    state.scrap -= offer.cost;

    if (offer.grantsItemId) {
      addItem(state, registry, offer.grantsItemId, offer.grantsItemQty);
      pushLog(state, `Bought ${offer.name}.`, "loot");
    }

    if (offer.grantsUnlock) {
      state.unlocks = [...state.unlocks, offer.grantsUnlock];
      if (offer.grantsUnlock === "autoheal") state.autoheal = true;
      pushLog(state, `Unlocked ${offer.name}.`, "good");
    }

    setToast(state, `Bought ${offer.name}`);
    render();
  }

  function useItem(itemId) {
    const item = registry.get("items", itemId);
    if (!item) return;

    if (item.category === "consumable") {
      if (!removeItem(state, itemId, 1)) return;
      const player = deriveStats(state, registry);
      state.hp = Math.min(player.maxHp, state.hp + 30);
      pushLog(state, `Used ${item.name}. +30 HP.`, "good");
      setToast(state, `Used ${item.name}`);
      render();
      return;
    }

    setToast(state, item.description || `${item.name} is a material.`);
    render();
  }

  function healFromQuickAction() {
    const bandageCount = countItem(state, "item.bandage");
    const foodCount = countItem(state, "item.cooked_meat");
    const itemId = bandageCount > 0 ? "item.bandage" : foodCount > 0 ? "item.cooked_meat" : null;

    if (!itemId) {
      setToast(state, "No healing items.", "bad");
      render();
      return;
    }

    removeItem(state, itemId, 1);
    const player = deriveStats(state, registry);
    state.hp = Math.min(player.maxHp, state.hp + 30);
    pushLog(state, `Used ${itemName(registry, itemId)}. +30 HP.`, "good");
    setToast(state, `Healed with ${itemName(registry, itemId)}`);
    render();
  }

  function placeTile(index) {
    const tiles = [...state.home.tiles];
    const current = tiles[index];
    const selected = state.home.selected;

    if (current !== "empty") {
      tiles[index] = "empty";
      pushLog(state, "Removed structure.", "muted");
    } else if (selected) {
      tiles[index] = selected;
      pushLog(state, `Placed ${selected}.`, "good");
    }

    state.home = { ...state.home, tiles };
    render();
  }

  const CLICK_TARGETS = [
    "[data-nav]",
    "[data-skill]",
    "[data-area]",
    "[data-fight]",
    "[data-node]",
    "[data-recipe]",
    "[data-shop-tab]",
    "[data-buy]",
    "[data-item]",
    "[data-unequip]",
    "[data-build]",
    "[data-tile]",
    "[data-action]",
    "[data-heal]",
    "[data-escape]",
    "[data-cancel-action]",
    "[data-repeat-action]",
  ].join(",");

  function handleNavigation(target) {
    if (target.dataset.nav) {
      go(target.dataset.nav);
      return true;
    }

    if (target.dataset.skill) {
      go("skill", { skillId: target.dataset.skill });
      return true;
    }

    return false;
  }

  function handleAreaSelection(target) {
    if (!target.dataset.area) return false;

    const area = registry.get("areas", target.dataset.area);
    if (!area) return true;

    state.combat = null;
    state.selectedEnemyId = area.enemyIds[0];
    selectEnemy(state.selectedEnemyId);
    go("combat", { areaId: area.id });
    return true;
  }

  function handleCombatControls(target) {
    if (target.dataset.fight) {
      fight(target.dataset.fight);
      return true;
    }

    if (target.dataset.heal !== undefined) {
      healFromQuickAction();
      return true;
    }

    if (target.dataset.escape !== undefined) {
      state.combat = null;
      state.screen = "areas";
      pushLog(state, "You escaped the battle.", "muted");
      setToast(state, "Escaped");
      render({ resetScroll: true });
      return true;
    }

    return false;
  }

  function handleActivityControls(target) {
    if (target.dataset.node) {
      startAction("node", target.dataset.node);
      return true;
    }

    if (target.dataset.recipe) {
      startAction("recipe", target.dataset.recipe);
      return true;
    }

    if (target.dataset.cancelAction !== undefined) {
      state.activeAction = null;
      pushLog(state, "Action cancelled.", "muted");
      render();
      return true;
    }

    if (target.dataset.repeatAction !== undefined) {
      if (state.activeAction) {
        state.activeAction.repeat = !state.activeAction.repeat;
        render();
      }
      return true;
    }

    return false;
  }

  function handleShopControls(target) {
    if (target.dataset.shopTab) {
      state.shopTab = target.dataset.shopTab;
      render();
      return true;
    }

    if (target.dataset.buy) {
      buy(target.dataset.buy);
      return true;
    }

    return false;
  }

  function handleInventoryControls(target) {
    if (target.dataset.item) {
      const action = target.dataset.itemAction;

      if (action === "equip") {
        if (equipItem(state, registry, target.dataset.item)) {
          setToast(state, `Equipped ${itemName(registry, target.dataset.item)}`);
        }
        render();
        return true;
      }

      if (action === "use") {
        useItem(target.dataset.item);
        return true;
      }

      setToast(state, itemName(registry, target.dataset.item));
      render();
      return true;
    }

    if (target.dataset.unequip) {
      const slot = target.dataset.unequip;
      const itemId = state.equipment[slot];

      if (unequipItem(state, registry, slot)) {
        setToast(state, `Unequipped ${itemName(registry, itemId)}`);
      }
      render();
      return true;
    }

    return false;
  }

  function handleHomeBaseControls(target) {
    if (target.dataset.build) {
      state.home = { ...state.home, selected: target.dataset.build };
      render();
      return true;
    }

    if (target.dataset.tile !== undefined) {
      placeTile(Number(target.dataset.tile));
      return true;
    }

    return false;
  }

  function handleTopBarAction(target) {
    if (!target.dataset.action) return false;

    switch (target.dataset.action) {
      case "save":
        saveState(state);
        setToast(state, "Game saved.");
        break;
      case "load": {
        const loaded = loadState(registry);
        if (loaded) {
          state = loaded;
          setToast(state, "Game loaded.");
        } else {
          setToast(state, "No save found.", "bad");
        }
        break;
      }
      case "reset":
        if (window.confirm("Reset all progress?")) {
          state = resetState(registry);
          setToast(state, "Progress reset.");
        }
        break;
      case "autoheal":
        state.autoheal = !state.autoheal;
        setToast(state, `Autoheal ${state.autoheal ? "on" : "off"}.`);
        break;
      default:
        return false;
    }

    render({ resetScroll: true });
    return true;
  }

  function handleClick(event) {
    const target = event.target.closest(CLICK_TARGETS);
    if (!target) return;

    if (handleNavigation(target)) return;
    if (handleAreaSelection(target)) return;
    if (handleCombatControls(target)) return;
    if (handleActivityControls(target)) return;
    if (handleShopControls(target)) return;
    if (handleInventoryControls(target)) return;
    if (handleHomeBaseControls(target)) return;
    handleTopBarAction(target);
  }

  function tick() {
    if (state.toast && Date.now() - state.toast.at > 2800) {
      state.toast = null;
      render();
    }

    if (!state.activeAction) return;

    state.activeAction.elapsed += 100;
    if (state.activeAction.elapsed >= state.activeAction.durationMs) {
      completeAction();
    }
    render();
  }

  root.addEventListener("click", handleClick);
  setInterval(tick, 100);
  render();
}

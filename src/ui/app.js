import { completeActionOnce } from "../game/actions.js";
import {
  addItem,
  countItem,
  equipItem,
  removeItem,
  unequipItem,
} from "../game/inventory.js";
import { resolveDrops } from "../game/loot.js";
import { applyOfflineProgress } from "../game/offline.js";
import { addSkillXp, skillLevel } from "../game/progression.js";
import { calculateDamage, deriveStats, encounterLevel, hitChance, scaleEnemy } from "../game/stats.js";
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
  let autosaveElapsed = 0;

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

  function prepareEnemy(enemyId, start = false) {
    const enemy = registry.get("enemies", enemyId);
    if (!enemy) return null;

    const faction = registry.get("factions", enemy.factionId);
    const area = registry.get("areas", state.selectedAreaId);
    const level = area ? encounterLevel(area, enemy) : enemy.level;
    const stats = scaleEnemy(enemy, faction, level);
    const player = deriveStats(state, registry);
    const sameEnemy = state.combat?.enemyId === enemyId && state.combat.hp > 0;

    if (!sameEnemy) {
      state.combat = {
        enemyId,
        level,
        hp: stats.hp,
        maxHp: stats.hp,
        playerTimer: start ? player.attackInterval : 0,
        enemyTimer: start ? stats.attackInterval : 0,
        eatCooldown: 0,
        running: start,
      };
    } else if (start) {
      state.combat = { ...state.combat, running: true };
    }

    state.selectedEnemyId = enemyId;
    return { enemy, faction, stats, player };
  }

  function selectEnemy(enemyId) {
    return prepareEnemy(enemyId, false);
  }

  function engage(enemyId) {
    if (state.hp <= 0) state.hp = 1;

    const info = prepareEnemy(enemyId, true);
    if (!info) return;

    pushLog(state, `Engaging ${info.enemy.name}.`, "muted");
    render();
  }

  function grantLoot(drops) {
    const parts = [];

    for (const drop of drops) {
      if (addItem(state, registry, drop.itemId, drop.qty)) {
        const name = itemName(registry, drop.itemId);
        pushLog(state, `+${drop.qty} ${name}`, "loot");
        parts.push(`${drop.qty}x ${name}`);
      } else {
        pushLog(state, `Bank full: lost ${drop.qty}x ${itemName(registry, drop.itemId)}.`, "bad");
      }
    }

    return parts;
  }

  function startAction(kind, id) {
    const category = kind === "node" ? "nodes" : "recipes";
    const definition = registry.get(category, id);
    if (!definition) return;

    const level = skillLevel(state, definition.skillId);
    if (level < definition.levelReq) {
      setToast(state, `Requires level ${definition.levelReq}.`, "bad");
      render();
      return;
    }

    if (kind === "recipe") {
      const missing = Object.entries(definition.inputs).find(
        ([itemId, qty]) => countItem(state, itemId) < qty
      );
      if (missing) {
        setToast(state, `Missing ${itemName(registry, missing[0])}.`, "bad");
        render();
        return;
      }
    }

    if (state.activeAction) {
      if (state.activityQueue.length >= 5) {
        setToast(state, "Queue is full.", "bad");
        render();
        return;
      }

      state.activityQueue = [
        ...state.activityQueue,
        { kind, id, durationMs: definition.durationMs, repeat: false },
      ];
      pushLog(state, `Queued ${definition.name}.`, "muted");
      setToast(state, `Queued ${definition.name}`);
      render();
      return;
    }

    state.activeAction = {
      kind,
      id,
      durationMs: definition.durationMs,
      elapsed: 0,
      repeat: false,
    };
    pushLog(state, `Started ${definition.name}.`, "muted");
    render({ resetScroll: true });
  }

  function completeAction() {
    const action = state.activeAction;
    if (!action) return;

    const result = completeActionOnce(state, registry, action);
    const parts = result.parts.map(
      (part) => `${part.qty}x ${itemName(registry, part.itemId)}`
    );

    if (result.ok) {
      setToast(state, parts.length ? parts.join(", ") : `${result.name} complete`);
    } else {
      setToast(state, `${result.name ?? "Action"} stopped.`, "bad");
    }

    if (result.ok && action.repeat) {
      state.activeAction = { ...action, elapsed: 0 };
      return;
    }

    if (state.activityQueue.length > 0) {
      const [next, ...rest] = state.activityQueue;
      state.activityQueue = rest;
      state.activeAction = { ...next, elapsed: 0 };
      const nextDefinition = registry.get(
        next.kind === "node" ? "nodes" : "recipes",
        next.id
      );
      pushLog(state, `Started ${nextDefinition?.name ?? "queued action"}.`, "muted");
      return;
    }

    state.activeAction = null;
  }

  function autoEat(player) {
    if (!state.autoEat || state.hp <= 0) return;
    if (state.hp > player.maxHp * 0.3) return;
    if ((state.combat?.eatCooldown ?? 0) > 0) return;

    const itemId =
      countItem(state, "item.bandage") > 0
        ? "item.bandage"
        : countItem(state, "item.cooked_meat") > 0
          ? "item.cooked_meat"
          : null;

    if (!itemId) return;

    removeItem(state, itemId, 1);
    state.hp = Math.min(player.maxHp, state.hp + 30);
    state.combat = { ...state.combat, eatCooldown: 1.5 };
    pushLog(state, `Auto-used ${itemName(registry, itemId)}. +30 HP.`, "good");
  }

  function handleVictory(enemy, combat) {
    const drops = resolveDrops(registry, enemy.lootId);
    const parts = grantLoot(drops);
    const xp = (combat.level ?? enemy.level) * 8;
    const boss = enemy.role === "boss";

    addSkillXp(state, registry, "skill.melee", xp);

    if (boss) {
      state.clearedAreas = [...new Set([...state.clearedAreas, state.selectedAreaId])];
    }

    state.combat = { ...combat, hp: 0, running: false };
    pushLog(state, `${enemy.name} goes down.`, "good");
    setToast(state, parts.length ? `Killed ${enemy.name}: ${parts.join(", ")}` : `${enemy.name} down`);

    if (state.autoFight && !boss) {
      const area = registry.get("areas", state.selectedAreaId);
      const normalEnemies = area.enemyIds
        .map((id) => registry.get("enemies", id))
        .filter(Boolean);
      const index = normalEnemies.findIndex((entry) => entry.id === enemy.id);
      const next = normalEnemies[(index + 1) % normalEnemies.length];

      if (next) {
        engage(next.id);
        return;
      }
    }

    if (boss) state.autoFight = false;

    state.combatResult = {
      type: "victory",
      enemyName: enemy.name,
      loot: parts,
      xp,
      boss,
    };
  }

  function handleDefeat(enemy, combat) {
    state.hp = 1;
    state.autoFight = false;
    state.combat = { ...combat, hp: 0, running: false };
    state.combatResult = {
      type: "defeat",
      enemyName: enemy.name,
      loot: [],
      xp: 0,
      boss: enemy.role === "boss",
    };
    pushLog(state, `${enemy.name} overwhelms you. You fall back.`, "bad");
  }

  function tickCombat() {
    const combat = state.combat;
    if (!combat?.running) return;

    const enemy = registry.get("enemies", combat.enemyId);
    if (!enemy) return;

    const faction = registry.get("factions", enemy.factionId);
    const area = registry.get("areas", state.selectedAreaId);
    const level = combat.level ?? (area ? encounterLevel(area, enemy) : enemy.level);
    const enemyStats = scaleEnemy(enemy, faction, level);
    const player = deriveStats(state, registry);

    combat.eatCooldown = Math.max(0, (combat.eatCooldown ?? 0) - 0.1);
    combat.playerTimer -= 0.1;
    combat.enemyTimer -= 0.1;

    if (combat.playerTimer <= 0) {
      combat.playerTimer = player.attackInterval;

      const hit = Math.random() * 100 < hitChance(player.accuracy, enemyStats.evasion);
      if (!hit) {
        pushLog(state, `You miss ${enemy.name}.`, "bad");
      } else {
        const crit = Math.random() * 100 < player.critChance;
        const damage = calculateDamage({
          attack: player.attack,
          defense: enemyStats.defense,
          armorPen: player.armorPen,
          critMultiplier: crit ? 1.5 : 1,
        });

        combat.hp = Math.max(0, combat.hp - damage);
        pushLog(
          state,
          `${crit ? "Critical! " : ""}You hit ${enemy.name} for ${damage}.`,
          crit ? "loot" : "good"
        );
      }
    }

    if (combat.hp <= 0) {
      handleVictory(enemy, combat);
      return;
    }

    if (combat.enemyTimer <= 0) {
      combat.enemyTimer = enemyStats.attackInterval;

      const hit = Math.random() * 100 < hitChance(enemyStats.accuracy, player.evasion);
      if (!hit) {
        pushLog(state, `${enemy.name} misses.`, "muted");
      } else {
        const crit = Math.random() * 100 < enemyStats.critChance;
        const damage = calculateDamage({
          attack: enemyStats.attack,
          defense: player.defense,
          armorPen: enemyStats.armorPen,
          critMultiplier: crit ? 1.5 : 1,
        });

        state.hp = Math.max(0, state.hp - damage);
        pushLog(state, `${enemy.name} hits you for ${damage}.`, "bad");

        if (state.hp <= 0) {
          handleDefeat(enemy, combat);
          return;
        }
      }
    }

    autoEat(player);
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
      const added = addItem(state, registry, offer.grantsItemId, offer.grantsItemQty);
      if (!added) {
        state.scrap += offer.cost;
        setToast(state, "Bank is full.", "bad");
        render();
        return;
      }
      pushLog(state, `Bought ${offer.name}.`, "loot");
    }

    if (offer.grantsUnlock) {
      state.unlocks = [...state.unlocks, offer.grantsUnlock];
      if (offer.grantsUnlock === "auto_eat") state.autoEat = true;
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
    "[data-auto-fight]",
    "[data-auto-eat]",
    "[data-area-tab]",
    "[data-result-continue]",
    "[data-result-retreat]",
    "[data-dismiss-offline]",
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

    state.selectedAreaId = area.id;
    state.combat = null;
    state.areaTab = area.enemyIds.length > 0 ? "combat" : "dungeons";
    state.selectedEnemyId = area.enemyIds[0] ?? area.bossIds[0];
    selectEnemy(state.selectedEnemyId);
    go("combat");
    return true;
  }

  function handleAreaTabs(target) {
    if (!target.dataset.areaTab) return false;

    state.areaTab = target.dataset.areaTab;
    render();
    return true;
  }

  function handleCombatControls(target) {
    if (target.dataset.fight) {
      engage(target.dataset.fight);
      return true;
    }

    if (target.dataset.autoFight !== undefined) {
      state.autoFight = !state.autoFight;
      setToast(state, `Auto Fight ${state.autoFight ? "on" : "off"}.`);

      if (state.autoFight && !state.combat?.running) {
        engage(state.selectedEnemyId);
        return true;
      }

      render();
      return true;
    }

    if (target.dataset.autoEat !== undefined) {
      state.autoEat = !state.autoEat;
      setToast(state, `Auto Eat ${state.autoEat ? "on" : "off"}.`);
      render();
      return true;
    }

    if (target.dataset.heal !== undefined) {
      healFromQuickAction();
      return true;
    }

    if (target.dataset.escape !== undefined) {
      state.combat = null;
      state.combatResult = null;
      state.screen = "areas";
      pushLog(state, "You escaped the battle.", "muted");
      setToast(state, "Escaped");
      render({ resetScroll: true });
      return true;
    }

    return false;
  }

  function handleOverlayControls(target) {
    if (target.dataset.resultContinue !== undefined) {
      const result = state.combatResult;
      state.combatResult = null;

      if (result?.type === "defeat") {
        state.combat = null;
        state.screen = "areas";
        render({ resetScroll: true });
      } else {
        render();
      }
      return true;
    }

    if (target.dataset.resultRetreat !== undefined) {
      state.combatResult = null;
      state.combat = null;
      state.screen = "areas";
      render({ resetScroll: true });
      return true;
    }

    if (target.dataset.dismissOffline !== undefined) {
      state.offlineReport = null;
      render();
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
          applyOfflineProgress(loaded, registry);
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
    if (handleAreaTabs(target)) return;
    if (handleCombatControls(target)) return;
    if (handleOverlayControls(target)) return;
    if (handleActivityControls(target)) return;
    if (handleShopControls(target)) return;
    if (handleInventoryControls(target)) return;
    if (handleHomeBaseControls(target)) return;
    handleTopBarAction(target);
  }

  function tick() {
    let dirty = false;

    if (state.toast && Date.now() - state.toast.at > 2800) {
      state.toast = null;
      dirty = true;
    }

    if (state.combat?.running) {
      tickCombat();
      dirty = true;
    }

    if (state.activeAction) {
      state.activeAction.elapsed += 100;
      if (state.activeAction.elapsed >= state.activeAction.durationMs) {
        completeAction();
      }
      dirty = true;
    }

    if (!state.combat?.running && state.hp > 0) {
      const player = deriveStats(state, registry);
      if (state.hp < player.maxHp) {
        state.hp = Math.min(player.maxHp, state.hp + player.hpRegen * 0.1);
        dirty = true;
      }
    }

    autosaveElapsed += 100;
    if (autosaveElapsed >= 30000) {
      saveState(state);
      autosaveElapsed = 0;
    }

    if (dirty) render();
  }

  root.addEventListener("click", handleClick);
  window.addEventListener("beforeunload", () => saveState(state));
  setInterval(tick, 100);
  render();
}

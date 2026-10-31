import { countItem, equipmentForItem } from "../../game/inventory.js";
import { skillLevel } from "../../game/progression.js";
import { deriveStats, encounterLevel, hitChance, scaleEnemy } from "../../game/stats.js";
import { activeActionLabel, durationLabel, esc, fmt, progressPercent } from "../helpers.js";
import { icon } from "../icons.js";

const EQUIP_SLOTS = [
  ["helmet", "Helm"],
  ["body", "Body"],
  ["gloves", "Glove"],
  ["boots", "Boot"],
  ["weapon", "Weapon"],
  ["offhand", "Offhand"],
  ["accessory1", "Acc 1"],
  ["accessory2", "Acc 2"],
];

function percentWidth(current, max) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

function renderFighter({ name, meta, iconName, hp, maxHp, stats, timer, hitChance: displayHitChance, enemy = false }) {
  const width = percentWidth(hp, maxHp);

  return `
    <div class="fighter${enemy ? " enemy" : ""}">
      <div class="fighter-head">
        <div class="portrait">${icon(iconName)}</div>
        <div>
          <div class="fighter-name">${esc(name)}</div>
          <div class="fighter-meta">${esc(meta)}</div>
        </div>
        <div class="fighter-timer">${timer > 0 ? `${timer.toFixed(1)}s` : "READY"}</div>
      </div>
      <div class="hp-bar${enemy ? " enemy" : ""}"><i style="width:${width}%"></i></div>
      <div class="hp-text"><span>HP</span><span>${fmt(hp)} / ${fmt(maxHp)}</span></div>
      <div class="stat-grid">
        <div class="stat"><span>Atk</span><b>${fmt(stats.attack)}</b></div>
        <div class="stat"><span>Def</span><b>${fmt(stats.defense)}</b></div>
        <div class="stat"><span>Hit</span><b>${fmt(displayHitChance ?? stats.hitChance)}%</b></div>
        <div class="stat"><span>Crit</span><b>${fmt(stats.critChance)}%</b></div>
      </div>
    </div>
  `;
}

function renderEnemyRows(registry, state, enemies, area) {
  return enemies
    .map((enemy) => {
      const faction = registry.get("factions", enemy.factionId);
      const level = encounterLevel(area, enemy);
      const stats = scaleEnemy(enemy, faction, level);
      const current = state.combat?.enemyId === enemy.id ? state.combat.hp : stats.hp;
      const width = percentWidth(current, stats.hp);
      const fighting = state.combat?.enemyId === enemy.id && state.combat.running;

      return `
        <div class="enemy-row">
          <div class="row-icon">${icon(enemy.icon)}</div>
          <div class="row-name">
            ${esc(enemy.name)}
            <small>Level ${level} - ${esc(faction.name)}</small>
          </div>
          <div class="mini-hp"><i style="width:${width}%"></i></div>
          <button class="btn ${fighting ? "danger" : "primary"} row-btn" data-fight="${esc(enemy.id)}">
            ${fighting ? "Fighting" : "Fight"}
          </button>
        </div>
      `;
    })
    .join("");
}

function renderBossRows(registry, bosses, area) {
  if (bosses.length === 0) {
    return `<div class="empty-line">No bosses in this area.</div>`;
  }

  return bosses
    .map((enemy) => {
      const faction = registry.get("factions", enemy.factionId);
      const level = encounterLevel(area, enemy);
      return `
        <div class="dungeon-row">
          <div class="row-icon">${icon("star")}</div>
          <div class="row-name">${esc(enemy.name)}<small>Boss - Lv ${level} - ${esc(faction.name)}</small></div>
          <div class="mini-hp"><i style="width:100%"></i></div>
          <button class="btn danger row-btn" data-fight="${esc(enemy.id)}">Enter</button>
        </div>
      `;
    })
    .join("");
}

function renderNodeCards(registry, state, area) {
  return area.nodeIds
    .map((id) => registry.get("nodes", id))
    .filter(Boolean)
    .map((node) => {
      const skill = registry.get("skills", node.skillId);
      const tool = node.toolId ? registry.get("tools", node.toolId) : null;
      const level = skillLevel(state, node.skillId);
      const locked = level < node.levelReq;
      const hasTool = !tool || countItem(state, tool.itemId) > 0;
      const toolSuffix = tool ? ` - ${esc(tool.name)}` : "";
      const active = state.activeAction?.kind === "node" && state.activeAction.id === node.id;

      return `
        <div class="gather-card${active ? " active" : ""}">
          <div class="gather-head">
            <div class="gather-icon">${icon(node.icon)}</div>
            <div>
              <div class="gather-name">${esc(node.name)}</div>
              <div class="gather-meta">${esc(skill.name)} - Lv ${node.levelReq} - ${durationLabel(node.durationMs)}${toolSuffix}</div>
            </div>
          </div>
          <button class="btn" data-node="${esc(node.id)}" ${locked || !hasTool ? "disabled" : ""}>
            ${locked ? `Level ${node.levelReq}` : !hasTool ? `Needs ${esc(tool.name)}` : "Start"}
          </button>
        </div>
      `;
    })
    .join("");
}

function renderEquipmentSlots(registry, state) {
  return EQUIP_SLOTS.map(([slot, label]) => {
    const itemId = state.equipment[slot];
    const definition = itemId ? equipmentForItem(registry, itemId) : null;

    return `
      <div class="equip-slot" ${definition ? `data-unequip="${slot}" title="Unequip ${esc(definition.name)}"` : ""}>
        ${definition ? icon(definition.icon) : ""}
        <span>${esc(label)}</span>
      </div>
    `;
  }).join("");
}

function renderLog(state) {
  return state.logs
    .slice(-10)
    .map((line) => `<div class="log-line"><span class="${line.tone}">&gt;</span> ${esc(line.text)}</div>`)
    .join("");
}

function renderTabs(area, state) {
  const tabs = [
    ["combat", "Combat", area.enemyIds.length],
    ["gathering", "Gathering", area.nodeIds.length],
    ["dungeons", "Dungeons", area.bossIds.length],
  ];

  return `
    <div class="tab-row area-tabs">
      ${tabs
        .map(
          ([id, label, count]) => `
            <button class="tab${state.areaTab === id ? " active" : ""}" data-area-tab="${id}">
              ${label} <span class="tab-count">${count}</span>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderActiveAction(registry, state) {
  if (!state.activeAction) return "";

  const percent = progressPercent(state.activeAction);
  return `
    <div class="inline-action">
      <div class="action-line">
        <span class="action-name">${esc(activeActionLabel(registry, state.activeAction))}</span>
        <span class="action-meta">${Math.round(percent)}%</span>
      </div>
      <div class="progress"><i style="width:${percent}%"></i></div>
      <div class="action-actions">
        <button class="btn small" data-repeat-action>${state.activeAction.repeat ? "Repeat: On" : "Repeat: Off"}</button>
        <button class="btn danger small" data-cancel-action>Cancel</button>
      </div>
    </div>
  `;
}

export function renderCombat(registry, state) {
  const area =
    registry.get("areas", state.selectedAreaId) ?? registry.all("areas")[0];

  const normalEnemies = area.enemyIds
    .map((id) => registry.get("enemies", id))
    .filter(Boolean);

  const bosses = area.bossIds
    .map((id) => registry.get("enemies", id))
    .filter(Boolean);

  const selectedEnemy =
    registry.get("enemies", state.selectedEnemyId) ??
    normalEnemies[0] ??
    bosses[0];

  const enemyFaction = registry.get("factions", selectedEnemy.factionId);
  const selectedLevel = encounterLevel(area, selectedEnemy);
  const enemyStats = scaleEnemy(selectedEnemy, enemyFaction, selectedLevel);
  const combatState =
    state.combat?.enemyId === selectedEnemy.id
      ? state.combat
      : {
          enemyId: selectedEnemy.id,
          hp: enemyStats.hp,
          maxHp: enemyStats.hp,
          playerTimer: 0,
          enemyTimer: 0,
          running: false,
        };

  const playerStats = deriveStats(state, registry);
  const bandages = countItem(state, "item.bandage");
  const food = countItem(state, "item.cooked_meat");

  const factions = area.factionIds
    .map((id) => registry.get("factions", id))
    .filter(Boolean);

  const factionTags = factions
    .map(
      (faction) =>
        `<span class="tag" style="color:${esc(faction.color)}">${esc(faction.name)}</span>`
    )
    .join("");

  const tabs = renderTabs(area, state);
  const activeAction = renderActiveAction(registry, state);

  const combatTab = `
    <section class="panel">
      <div class="panel-title">
        <span>Combat</span>
        <span class="meta">${state.autoFight ? "AUTO ON" : "AUTO OFF"}</span>
      </div>
      <div class="panel-body">
        <div class="faction-desc">${esc(area.description)}</div>

        <div class="combat-controls">
          <button class="btn ${state.autoFight ? "primary" : ""} small" data-auto-fight>
            Auto Fight: ${state.autoFight ? "On" : "Off"}
          </button>
          <button class="btn ${state.autoEat ? "primary" : ""} small" data-auto-eat>
            Auto Eat: ${state.autoEat ? "On" : "Off"}
          </button>
          <button class="btn small" data-heal>Eat Food</button>
          <button class="btn danger small" data-escape>Escape</button>
        </div>

        <div class="duel">
          ${renderFighter({
            name: "Scavenger",
            meta: `Level ${state.combatLevel} - Player`,
            iconName: "survivor",
            hp: state.hp,
            maxHp: playerStats.maxHp,
            stats: playerStats,
            timer: combatState.playerTimer,
            hitChance: hitChance(playerStats.accuracy, enemyStats.evasion),
          })}
          ${renderFighter({
            name: selectedEnemy.name,
            meta: `Level ${selectedLevel} - ${enemyFaction.name}`,
            iconName: selectedEnemy.icon,
            hp: combatState.hp,
            maxHp: combatState.maxHp,
            stats: enemyStats,
            timer: combatState.enemyTimer,
            hitChance: hitChance(enemyStats.accuracy, playerStats.evasion),
            enemy: true,
          })}
        </div>

        <div class="section-h"><span>Enemies</span><span>${normalEnemies.length} in area</span></div>
        ${renderEnemyRows(registry, state, normalEnemies, area)}
      </div>
    </section>
  `;

  const gatheringTab = `
    <section class="panel">
      <div class="panel-title"><span>Gathering</span><span class="meta">${esc(area.name)}</span></div>
      <div class="panel-body">
        ${activeAction}
        <div class="gathering-grid">${renderNodeCards(registry, state, area)}</div>
      </div>
    </section>
  `;

  const dungeonsTab = `
    <section class="panel">
      <div class="panel-title"><span>Dungeons &amp; Raids</span><span class="meta">${bosses.length} available</span></div>
      <div class="panel-body">
        ${renderBossRows(registry, bosses, area)}
      </div>
    </section>
  `;

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Areas / ${esc(area.name)}</div>
        <h1>${esc(area.name)}</h1>
        <div class="page-tags">
          <span class="tag war">${esc(area.type)}</span>
          <span class="tag">Lv ${area.level}</span>
          ${factionTags}
        </div>
      </div>
      <button class="btn" data-nav="areas">Back to Areas</button>
    </div>

    ${tabs}

    <div class="combat-layout">
      <div class="left-stack">
        ${state.areaTab === "gathering" ? gatheringTab : state.areaTab === "dungeons" ? dungeonsTab : combatTab}
      </div>

      <aside class="right-stack">
        <section class="panel">
          <div class="panel-title"><span>Equipment</span><span class="meta">Lv ${state.combatLevel}</span></div>
          <div class="panel-body">
            <div class="equipment-grid">${renderEquipmentSlots(registry, state)}</div>
            <div class="equip-stats">
              <div class="stat"><span>Atk</span><b>${fmt(playerStats.attack)}</b></div>
              <div class="stat"><span>Def</span><b>${fmt(playerStats.defense)}</b></div>
              <div class="stat"><span>Hit</span><b>${fmt(playerStats.hitChance)}%</b></div>
              <div class="stat"><span>Crit</span><b>${fmt(playerStats.critChance)}%</b></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title"><span>Quick Actions</span><span class="meta">Combat</span></div>
          <div class="panel-body quick-actions">
            <button class="btn full small" data-auto-eat>
              Auto Eat: ${state.autoEat ? "On" : "Off"}
            </button>
            <button class="btn full small" data-heal>Eat Food</button>
            <div class="qa-label">Healing items</div>
            <div class="qa-row"><span>Bandage</span><span>${fmt(bandages)}</span></div>
            <div class="qa-row"><span>Cooked Meat</span><span>${fmt(food)}</span></div>
            <button class="btn danger full small" data-escape>Escape Battle</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title"><span>Activity Log</span><span class="meta">Live</span></div>
          <div class="panel-body">
            <div class="log log-tall">${renderLog(state)}</div>
          </div>
        </section>
      </aside>
    </div>
  `;
}

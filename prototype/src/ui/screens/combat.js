import { icon } from "../icons.js";
import { activeActionLabel, durationLabel, esc, fmt, progressPercent } from "../helpers.js";
import { deriveStats, equipmentForItem, scaleEnemy, skillLevel } from "../state.js";

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

function renderFighter({ name, meta, iconName, hp, maxHp, stats, enemy = false }) {
  const percent = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

  return `
    <div class="fighter${enemy ? " enemy" : ""}">
      <div class="fighter-head">
        <div class="portrait">${icon(iconName)}</div>
        <div>
          <div class="fighter-name">${esc(name)}</div>
          <div class="fighter-meta">${esc(meta)}</div>
        </div>
      </div>
      <div class="hp-bar${enemy ? " enemy" : ""}"><i style="width:${percent}%"></i></div>
      <div class="hp-text"><span>HP</span><span>${fmt(hp)} / ${fmt(maxHp)}</span></div>
      <div class="stat-grid">
        <div class="stat"><span>Atk</span><b>${fmt(stats.attack)}</b></div>
        <div class="stat"><span>Def</span><b>${fmt(stats.defense)}</b></div>
        <div class="stat"><span>Acc</span><b>${fmt(stats.accuracy)}%</b></div>
        <div class="stat"><span>Crit</span><b>${fmt(stats.crit)}%</b></div>
      </div>
    </div>
  `;
}

export function renderCombat(registry, state) {
  const areas = registry.all("areas");
  const area = registry.get("areas", state.selectedAreaId) ?? areas[0];
  const enemies = area.enemyIds
    .map((id) => registry.get("enemies", id))
    .filter(Boolean);

  const selectedEnemy =
    registry.get("enemies", state.selectedEnemyId) ??
    enemies.find((enemy) => enemy.role === "normal") ??
    enemies[0];

  const enemyFaction = registry.get("factions", selectedEnemy.factionId);
  const enemyStats = scaleEnemy(selectedEnemy, enemyFaction);
  const combatState =
    state.combat?.enemyId === selectedEnemy.id
      ? state.combat
      : { enemyId: selectedEnemy.id, hp: enemyStats.hp, maxHp: enemyStats.hp };

  const playerStats = deriveStats(state, registry);
  const playerMaxHp = playerStats.maxHp;

  const factions = area.factionIds
    .map((id) => registry.get("factions", id))
    .filter(Boolean);

  const factionTags = factions
    .map(
      (faction) =>
        `<span class="tag" style="color:${esc(faction.color)}">${esc(faction.name)}</span>`
    )
    .join("");

  const enemyRows = enemies
    .map((enemy) => {
      const faction = registry.get("factions", enemy.factionId);
      const stats = scaleEnemy(enemy, faction);
      const current =
        state.combat?.enemyId === enemy.id
          ? state.combat.hp
          : stats.hp;
      const percent = Math.max(0, Math.min(100, (current / stats.hp) * 100));
      const boss = enemy.role === "boss";

      return `
        <div class="enemy-row">
          <div class="row-icon">${icon(enemy.icon)}</div>
          <div class="row-name">
            ${esc(enemy.name)}
            <small>Level ${enemy.level} Â· ${esc(faction.name)}${boss ? " Â· Boss" : ""}</small>
          </div>
          <div class="mini-hp"><i style="width:${percent}%"></i></div>
          <button class="btn ${boss ? "danger" : "primary"} row-btn" data-fight="${esc(enemy.id)}">
            ${boss ? "Boss" : "Fight"}
          </button>
        </div>
      `;
    })
    .join("");

  const bosses = enemies.filter((enemy) => enemy.role === "boss");
  const dungeonRows = bosses
    .map(
      (enemy) => `
        <div class="dungeon-row">
          <div class="row-icon">${icon("star")}</div>
          <div class="row-name">${esc(enemy.name)}<small>Boss Â· Level ${enemy.level}</small></div>
          <div class="mini-hp"><i style="width:100%"></i></div>
          <button class="btn row-btn" data-fight="${esc(enemy.id)}">Enter</button>
        </div>
      `
    )
    .join("");

  const nodeCards = area.nodeIds
    .map((id) => registry.get("nodes", id))
    .filter(Boolean)
    .map((node) => {
      const skill = registry.get("skills", node.skillId);
      const level = skillLevel(state, node.skillId);
      const locked = level < node.levelReq;
      return `
        <div class="gather-card">
          <div class="gather-head">
            <div class="gather-icon">${icon(node.icon)}</div>
            <div>
              <div class="gather-name">${esc(node.name)}</div>
              <div class="gather-meta">${esc(skill.name)} Â· Lv ${node.levelReq} Â· ${durationLabel(node.durationMs)}</div>
            </div>
          </div>
          <button class="btn" data-node="${esc(node.id)}" ${locked ? "disabled" : ""}>
            ${locked ? `Level ${node.levelReq}` : "Start"}
          </button>
        </div>
      `;
    })
    .join("");

  const equipmentSlots = EQUIP_SLOTS.map(([slot, label]) => {
    const itemId = state.equipment[slot];
    const def = itemId ? equipmentForItem(registry, itemId) : null;
    return `
      <div class="equip-slot" ${def ? `data-unequip="${slot}" title="Unequip ${esc(def.name)}"` : ""}>
        ${def ? icon(def.icon) : ""}
        <span>${esc(label)}</span>
      </div>
    `;
  }).join("");

  const logLines = state.logs
    .slice(-8)
    .map((line) => `<div class="log-line"><span class="${line.tone}">&gt;</span> ${esc(line.text)}</div>`)
    .join("");

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

    <div class="combat-layout">
      <div class="left-stack">
        <section class="panel">
          <div class="panel-title"><span>Combat</span><span class="meta">Area Lv ${area.level}</span></div>
          <div class="panel-body">
            <div class="faction-desc">${esc(area.description)}</div>

            <div class="duel">
              ${renderFighter({
                name: "Scavenger",
                meta: `Level ${state.combatLevel} Â· Player`,
                iconName: "survivor",
                hp: state.hp,
                maxHp: playerMaxHp,
                stats: playerStats,
              })}
              ${renderFighter({
                name: selectedEnemy.name,
                meta: `Level ${selectedEnemy.level} Â· ${enemyFaction.name}`,
                iconName: selectedEnemy.icon,
                hp: combatState.hp,
                maxHp: combatState.maxHp,
                stats: enemyStats,
                enemy: true,
              })}
            </div>

            <div class="section-h"><span>Enemies</span><span>${enemies.length} in area</span></div>
            ${enemyRows}

            <div class="section-h"><span>Dungeons &amp; Raids</span><span>${bosses.length} available</span></div>
            ${dungeonRows || `<div class="empty-line">No bosses in this area.</div>`}
          </div>
        </section>

        <section class="panel">
          <div class="panel-title"><span>Gathering</span><span class="meta">${esc(area.name)}</span></div>
          <div class="panel-body">
            ${state.activeAction ? `
              <div class="inline-action">
                <div class="action-line">
                  <span class="action-name">${esc(activeActionLabel(registry, state.activeAction))}</span>
                  <span class="action-meta">${Math.round(progressPercent(state.activeAction))}%</span>
                </div>
                <div class="progress"><i style="width:${progressPercent(state.activeAction)}%"></i></div>
                <div class="action-actions">
                  <button class="btn small" data-repeat-action>${state.activeAction.repeat ? "Repeat: On" : "Repeat: Off"}</button>
                  <button class="btn danger small" data-cancel-action>Cancel</button>
                </div>
              </div>
            ` : ""}
            <div class="gathering-grid">${nodeCards}</div>
          </div>
        </section>
      </div>

      <aside class="right-stack">
        <section class="panel">
          <div class="panel-title"><span>Equipment</span><span class="meta">Lv ${state.combatLevel}</span></div>
          <div class="panel-body">
            <div class="equipment-grid">${equipmentSlots}</div>
            <div class="equip-stats">
              <div class="stat"><span>Atk</span><b>${fmt(playerStats.attack)}</b></div>
              <div class="stat"><span>Def</span><b>${fmt(playerStats.defense)}</b></div>
              <div class="stat"><span>Acc</span><b>${fmt(playerStats.accuracy)}%</b></div>
              <div class="stat"><span>Crit</span><b>${fmt(playerStats.crit)}%</b></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title"><span>Quick Actions</span><span class="meta">Combat</span></div>
          <div class="panel-body quick-actions">
            <button class="btn full small" data-action="autoheal">Bandage Autoheal: ${state.autoheal ? "On" : "Off"}</button>
            <div class="qa-label">Bandage selection</div>
            <select class="qa-select"><option>Cotton Bandage</option></select>
            <button class="btn full small" data-heal>Eat Food</button>
            <div class="qa-label">Food selection</div>
            <select class="qa-select"><option>Cooked Meat</option></select>
            <button class="btn danger full small" data-escape>Escape Battle</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title"><span>Activity Log</span><span class="meta">Live</span></div>
          <div class="panel-body">
            <div class="log">${logLines}</div>
          </div>
        </section>
      </aside>
    </div>
  `;
}

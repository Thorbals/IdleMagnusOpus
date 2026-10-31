import { countItem } from "../../game/inventory.js";
import { skillLevel, xpForLevel } from "../../game/progression.js";

import {
  activeActionLabel,
  durationLabel,
  esc,
  nodesForSkill,
  progressPercent,
  recipesForSkill,
} from "../helpers.js";
import { icon } from "../icons.js";

function renderActionBar(registry, state) {
  const action = state.activeAction;
  if (!action) return "";

  const name = activeActionLabel(registry, action);
  const percent = progressPercent(action);

  return `
    <section class="panel action-bar">
      <div class="panel-title"><span>Active</span><span class="meta">${Math.round(percent)}%</span></div>
      <div class="panel-body">
        <div class="action-line">
          <div class="action-name">${esc(name)}</div>
          <div class="action-meta">${durationLabel(action.durationMs)} -- repeat ${action.repeat ? "on" : "off"}</div>
        </div>
        <div class="progress"><i style="width:${percent}%"></i></div>
        <div class="action-actions">
          <button class="btn small" data-repeat-action>${action.repeat ? "Repeat: On" : "Repeat: Off"}</button>
          <button class="btn danger small" data-cancel-action>Cancel</button>
        </div>
      </div>
    </section>
  `;
}

function renderQueue(registry, state) {
  if (state.activityQueue.length === 0) return "";

  const rows = state.activityQueue
    .map((item) => {
      const definition = registry.get(
        item.kind === "node" ? "nodes" : "recipes",
        item.id
      );
      return `<div class="queue-row"><span>${esc(definition?.name ?? item.id)}</span><span>${esc(item.kind)}</span></div>`;
    })
    .join("");

  return `
    <section class="panel queue-panel">
      <div class="panel-title"><span>Queue</span><span class="meta">${state.activityQueue.length} / 5</span></div>
      <div class="panel-body"><div class="queue-list">${rows}</div></div>
    </section>
  `;
}

function renderDrops(registry, drops) {
  return Object.entries(drops)
    .map(([itemId, drop]) => {
      const item = registry.get("items", itemId);
      return `
        <span class="drop-chip" title="${esc(item?.name ?? itemId)} --- ${drop.chance}%">
          ${icon(item?.icon ?? "scrap")} ${drop.qty ?? 1}x ${esc(item?.name ?? itemId)}
        </span>
      `;
    })
    .join("");
}

function renderNodes(registry, state, skill) {
  const level = skillLevel(state, skill.id);
  const nodes = nodesForSkill(registry, skill.id);

  return nodes
    .map((node) => {
      const locked = level < node.levelReq;
      const tool = node.toolId ? registry.get("tools", node.toolId) : null;
      const hasTool = !tool || countItem(state, tool.itemId) > 0;

      return `
        <div class="list-row">
          <div class="row-icon">${icon(node.icon)}</div>
          <div class="row-main">
            <div class="row-title">${esc(node.name)}</div>
            <div class="row-sub">
              Lv ${node.levelReq} - ${durationLabel(node.durationMs)} - ${node.xp} XP${tool ? ` - ${esc(tool.name)}` : ""}
            </div>
            <div class="row-drops">${renderDrops(registry, node.drops)}</div>
          </div>
          <button class="btn small" data-node="${esc(node.id)}" ${locked || !hasTool ? "disabled" : ""}>
            ${locked ? `Lv ${node.levelReq}` : !hasTool ? `Needs ${esc(tool.name)}` : "Start"}
          </button>
        </div>
      `;
    })
    .join("");
}

function renderRecipes(registry, state, skill) {
  const level = skillLevel(state, skill.id);
  const recipes = recipesForSkill(registry, skill.id);

  return recipes
    .map((recipe) => {
      const locked = level < recipe.levelReq;
      const inputs = Object.entries(recipe.inputs)
        .map(([itemId, qty]) => {
          const item = registry.get("items", itemId);
          return `<span class="input-chip">${icon(item?.icon ?? "scrap")} ${qty}x ${esc(item?.name ?? itemId)}</span>`;
        })
        .join("");
      const outputs = Object.entries(recipe.outputs)
        .map(([itemId, qty]) => {
          const item = registry.get("items", itemId);
          return `<span class="drop-chip">${icon(item?.icon ?? "scrap")} ${qty}x ${esc(item?.name ?? itemId)}</span>`;
        })
        .join("");

      return `
        <div class="list-row">
          <div class="row-icon">${icon(recipe.icon)}</div>
          <div class="row-main">
            <div class="row-title">${esc(recipe.name)}</div>
            <div class="row-sub">Lv ${recipe.levelReq} -- ${durationLabel(recipe.durationMs)} -- ${recipe.xp} XP</div>
            <div class="row-drops">${inputs}<span class="arrow">&rarr;</span>${outputs}</div>
          </div>
          <button class="btn small" data-recipe="${esc(recipe.id)}" ${locked ? "disabled" : ""}>
            ${locked ? `Lv ${recipe.levelReq}` : "Craft"}
          </button>
        </div>
      `;
    })
    .join("");
}

export function renderSkill(registry, state) {
  const skill =
    registry.get("skills", state.selectedSkillId) ??
    registry.all("skills")[0];

  const level = skillLevel(state, skill.id);
  const currentXp = state.skillXp[skill.id] ?? 0;
  const nextXp = xpForLevel(level);
  const percent = Math.min(100, (currentXp / nextXp) * 100);

  let content = "";
  if (skill.actionType === "gathering") {
    content = renderNodes(registry, state, skill);
  } else if (skill.actionType === "crafting") {
    content = renderRecipes(registry, state, skill);
  } else {
    content = `
      <div class="skill-empty">
        <div class="skill-icon">${icon(skill.icon)}</div>
        <p>${esc(skill.description)}</p>
        <div class="perk-row">
          <span class="tag">Lv 25 perk</span>
          <span class="tag">Lv 50 perk</span>
          <span class="tag">Lv 75 perk</span>
          <span class="tag">Lv 99 perk</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">${esc(skill.group)}</div>
        <h1>${esc(skill.name)}</h1>
        <div class="page-tags">
          <span class="tag war">Level ${level}</span>
          <span class="tag">${esc(skill.actionType)}</span>
        </div>
      </div>
    </div>

    ${renderActionBar(registry, state)}
    ${renderQueue(registry, state)}

    <section class="panel">
      <div class="panel-title"><span>${esc(skill.name)}</span><span class="meta">${currentXp} / ${nextXp} XP</span></div>
      <div class="panel-body">
        <div class="xp-row">
          <span>Level ${level}</span>
          <span>${percent.toFixed(0)}%</span>
        </div>
        <div class="progress xp"><i style="width:${percent}%"></i></div>
        <div class="panel-subtitle">${esc(skill.description)}</div>
        <div class="list">${content}</div>
      </div>
    </section>
  `;
}

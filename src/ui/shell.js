import { xpForLevel } from "../game/progression.js";
import { activeActionLabel, esc, fmt, progressPercent } from "./helpers.js";
import { icon } from "./icons.js";

const GROUPS = [
  ["combat", "Combat"],
  ["gathering", "Gathering"],
  ["production", "Production"],
  ["crafting", "Crafting"],
];

function navItem({ active, iconText, label, level, xp, attrs }) {
  return `
    <button class="nav-item${active ? " active" : ""}" ${attrs}>
      <span class="nav-icon">${esc(iconText)}</span>
      <span class="nav-label">
        <span>${esc(label)}</span>
        ${xp !== undefined ? `<span class="nav-xp"><i style="width:${xp}%"></i></span>` : ""}
      </span>
      ${level !== undefined ? `<span class="nav-level">${esc(level)}</span>` : ""}
    </button>
  `;
}

function renderSidebar(registry, state) {
  const mainItems = [
    { page: "areas", label: "Areas", short: "AR" },
    { page: "homebase", label: "Home Base", short: "HB" },
    { page: "bank", label: "Bank", short: "BK" },
    { page: "shop", label: "Shop", short: "SH" },
  ];

  const main = mainItems
    .map((item) =>
      navItem({
        active: state.screen === item.page || (item.page === "areas" && state.screen === "combat"),
        iconText: item.short,
        label: item.label,
        attrs: `data-nav="${item.page}"`,
      })
    )
    .join("");

  const groups = GROUPS.map(([groupId, label]) => {
    const skills = registry.all("skills").filter((skill) => skill.group === groupId);
    if (skills.length === 0) return "";

    const items = skills
      .map((skill) =>
        navItem({
          active: state.screen === "skill" && state.selectedSkillId === skill.id,
          iconText: skill.short,
          label: skill.name,
          level: state.skillLevels[skill.id] ?? 1,
          xp: Math.min(
            100,
            ((state.skillXp[skill.id] ?? 0) / xpForLevel(state.skillLevels[skill.id] ?? 1)) * 100
          ),
          attrs: `data-skill="${skill.id}"`,
        })
      )
      .join("");

    return `<nav class="nav-group"><h3>${esc(label)}</h3>${items}</nav>`;
  }).join("");

  return `
    <aside class="sidebar">
      <div class="logo">
        <h1>Idleness</h1>
        <span>Post-apocalyptic idle</span>
      </div>
      <nav class="nav-group">
        <h3>Main</h3>
        ${main}
      </nav>
      ${groups}
    </aside>
  `;
}

function renderTopBar(state) {
  return `
    <header class="top-bar">
      <div class="currency-row">
        <div class="currency">${icon("scrap")}<span>${fmt(state.scrap)}</span><span class="label">Scrap</span></div>
        <div class="currency">${icon("knife")}<span>${fmt(state.combatLevel)}</span><span class="label">Combat</span></div>
      </div>
      <div class="top-actions">
        <button class="btn small" data-action="save">Save Game</button>
        <button class="btn small" data-action="load">Load Game</button>
        <button class="btn small" data-action="reset">Reset</button>
      </div>
    </header>
  `;
}

function renderActionBar(registry, state) {
  if (!state.activeAction) return "";

  const percent = progressPercent(state.activeAction);
  const queue = state.activityQueue.length;

  return `
    <div class="global-action">
      <div class="global-action-main">
        <span class="global-action-label">${esc(activeActionLabel(registry, state.activeAction))}</span>
        <div class="progress"><i style="width:${percent}%"></i></div>
      </div>
      <span class="global-action-percent">${Math.round(percent)}%</span>
      ${queue > 0 ? `<span class="global-action-queue">${queue} queued</span>` : ""}
      <button class="btn small" data-repeat-action>${state.activeAction.repeat ? "Repeat: On" : "Repeat: Off"}</button>
      <button class="btn danger small" data-cancel-action>Cancel</button>
    </div>
  `;
}

function renderCombatResult(state) {
  const result = state.combatResult;
  if (!result) return "";

  const victory = result.type === "victory";
  const title = victory ? (result.boss ? "Boss Defeated" : "Victory") : "Defeated";
  const loot = result.loot.length
    ? result.loot.map((line) => `<div class="modal-line">${esc(line)}</div>`).join("")
    : `<div class="modal-line muted">No loot.</div>`;

  return `
    <div class="modal-backdrop">
      <section class="panel result-modal">
        <div class="panel-title"><span>${title}</span><span class="meta">${victory ? "Victory" : "Retreat"}</span></div>
        <div class="panel-body">
          <div class="result-enemy">${esc(result.enemyName)}</div>
          ${victory ? `<div class="modal-line">+${result.xp} XP</div>` : `<div class="modal-line muted">You fall back to the road.</div>`}
          <div class="modal-list">${loot}</div>
          <div class="result-actions">
            <button class="btn primary" data-result-continue>${victory ? "Continue" : "Return"}</button>
            ${victory ? `<button class="btn" data-result-retreat>To Areas</button>` : ""}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderOfflineReport(state) {
  const report = state.offlineReport;
  if (!report) return "";

  const loot = report.loot?.length
    ? report.loot.map((line) => `<div class="modal-line">${esc(line)}</div>`).join("")
    : `<div class="modal-line muted">No loot.</div>`;

  return `
    <div class="modal-backdrop">
      <section class="panel result-modal">
        <div class="panel-title"><span>Welcome Back</span><span class="meta">Offline</span></div>
        <div class="panel-body">
          <div class="modal-line">Away for ${fmt(report.minutes)} minutes.</div>
          <div class="modal-line">${fmt(report.actions)} actions completed.</div>
          <div class="modal-line">+${fmt(report.xp)} XP</div>
          <div class="modal-list">${loot}</div>
          <div class="result-actions">
            <button class="btn primary" data-dismiss-offline>Continue</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderToast(state) {
  if (!state.toast) return "";
  return `<div class="toast ${state.toast.tone ?? ""}"><span>${esc(state.toast.text)}</span></div>`;
}

export function renderShell(registry, state, content) {
  return `
    <div class="game-shell">
      ${renderSidebar(registry, state)}
      <main class="main">
        ${renderTopBar(state)}
        ${renderActionBar(registry, state)}
        <div class="content">${content}</div>
      </main>
    </div>
    ${renderCombatResult(state)}
    ${renderOfflineReport(state)}
    ${renderToast(state)}
  `;
}

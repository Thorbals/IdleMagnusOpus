import { icon } from "./icons.js";
import { esc, fmt } from "./helpers.js";

const GROUPS = [
  ["combat", "Combat"],
  ["gathering", "Gathering"],
  ["production", "Production"],
  ["crafting", "Crafting"],
];

function navItem({ active, iconText, label, level, attrs }) {
  return `
    <button class="nav-item${active ? " active" : ""}" ${attrs}>
      <span class="nav-icon">${esc(iconText)}</span>
      <span class="nav-label">${esc(label)}</span>
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
    if (!skills.length) return "";

    const items = skills
      .map((skill) =>
        navItem({
          active: state.screen === "skill" && state.selectedSkillId === skill.id,
          iconText: skill.short,
          label: skill.name,
          level: state.skillLevels[skill.id] ?? 1,
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

function renderToast(state) {
  if (!state.toast) return "";
  return `
    <div class="toast ${state.toast.tone ?? ""}">
      <span>${esc(state.toast.text)}</span>
    </div>
  `;
}

export function renderShell(registry, state, content) {
  return `
    <div class="game-shell">
      ${renderSidebar(registry, state)}
      <main class="main">
        ${renderTopBar(state)}
        <div class="content">${content}</div>
      </main>
    </div>
    ${renderToast(state)}
  `;
}

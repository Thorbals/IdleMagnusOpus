import { homeDefense } from "../../game/settlement.js";
import { esc, fmt } from "../helpers.js";
import { icon } from "../icons.js";

const PALETTE = [
  { id: "road", name: "Road", icon: "brick" },
  { id: "wall", name: "Wall", icon: "shield" },
  { id: "house", name: "House", icon: "crate" },
  { id: "gate", name: "Gate", icon: "key" },
  { id: "farm", name: "Farm", icon: "sprout" },
  { id: "workshop", name: "Workshop", icon: "wrench" },
];

function countdown(ms) {
  if (ms <= 0) return "Incoming!";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function renderHomeBase(state) {
  const home = state.home;
  const defense = homeDefense(state);
  const walls = home.tiles.filter((tile) => tile === "wall" || tile === "gate").length;
  const buildings = home.tiles.filter((tile) =>
    ["house", "workshop", "farm", "building"].includes(tile)
  ).length;

  const palette = PALETTE.map(
    (entry) => `
      <button class="palette-card${home.selected === entry.id ? " active" : ""}" data-build="${entry.id}">
        <span class="palette-icon">${icon(entry.icon)}</span>
        <span>${esc(entry.name)}</span>
      </button>
    `
  ).join("");

  const tiles = home.tiles
    .map((tile, index) => {
      const cls = tile === "empty" ? "tile empty" : `tile ${tile}`;
      return `<button class="${cls}" data-tile="${index}" aria-label="Tile ${index + 1}"></button>`;
    })
    .join("");

  const lastRaid = home.lastRaid
    ? home.lastRaid.won
      ? `Last raid repelled: ${fmt(home.lastRaid.defense)} defense vs ${fmt(home.lastRaid.strength)}.`
      : `Last raid broke through: ${home.lastRaid.destroyed} structures lost.`
    : "No raids yet.";

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Settlement</div>
        <h1>Home Base</h1>
        <div class="page-tags">
          <span class="tag war">Grid 10 x 10</span>
          <span class="tag">${fmt(home.raidsSurvived ?? 0)} raids survived</span>
        </div>
      </div>
    </div>

    <section class="panel">
      <div class="panel-title"><span>Settlement</span><span class="meta">Defense ${fmt(defense)}</span></div>
      <div class="panel-body">
        <div class="hud-row">
          <div class="hud-badge">${icon("wood")} <span>Wood</span> <b>150</b></div>
          <div class="hud-badge">${icon("ore")} <span>Stone</span> <b>120</b></div>
          <div class="hud-badge">${icon("skull")} <span>Regions</span> <b>1 / 6</b></div>
          <div class="hud-badge">${icon("shield")} <span>Walls</span> <b>${walls}</b></div>
          <div class="hud-badge">${icon("crate")} <span>Buildings</span> <b>${buildings}</b></div>
          <div class="hud-badge">${icon("survivor")} <span>Survivors</span> <b>${home.survivors ?? 0}</b></div>
          <div class="hud-badge">${icon("star")} <span>Next raid</span> <b>${countdown(home.nextRaidAt - Date.now())}</b></div>
        </div>

        <div class="raid-row">
          <div class="raid-status">${esc(lastRaid)}</div>
          <button class="btn danger small" data-raid-now>Test Raid</button>
        </div>

        <div class="homebase-layout">
          <aside class="homebase-palette">
            <div class="section-h"><span>Build</span><span>${esc(home.selected)}</span></div>
            ${palette}
            <div class="hint">Pick a card, then click a grid tile. Walls and buildings raise defense.</div>
          </aside>

          <div class="homebase-map">
            <div class="map-grid">${tiles}</div>
            <div class="map-hint">Click a tile to place the selected structure.</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

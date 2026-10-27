import { esc } from "../helpers.js";
import { icon } from "../icons.js";

const PALETTE = [
  { id: "road", name: "Road", icon: "brick" },
  { id: "wall", name: "Wall", icon: "shield" },
  { id: "house", name: "House", icon: "crate" },
  { id: "gate", name: "Gate", icon: "key" },
  { id: "farm", name: "Farm", icon: "sprout" },
  { id: "workshop", name: "Workshop", icon: "wrench" },
];

export function renderHomeBase(state) {
  const palette = PALETTE.map(
    (entry) => `
      <button class="palette-card${state.home.selected === entry.id ? " active" : ""}" data-build="${entry.id}">
        <span class="palette-icon">${icon(entry.icon)}</span>
        <span>${esc(entry.name)}</span>
      </button>
    `
  ).join("");

  const tiles = state.home.tiles
    .map((tile, index) => {
      const cls = tile === "empty" ? "tile empty" : `tile ${tile}`;
      return `<button class="${cls}" data-tile="${index}" aria-label="Tile ${index + 1}"></button>`;
    })
    .join("");

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Settlement</div>
        <h1>Home Base</h1>
        <div class="page-tags">
          <span class="tag war">Grid 10 x 10</span>
          <span class="tag">Build mode</span>
        </div>
      </div>
    </div>

    <section class="panel">
      <div class="panel-title"><span>Settlement</span><span class="meta">Day 12</span></div>
      <div class="panel-body">
        <div class="hud-row">
          <div class="hud-badge">${icon("wood")} <span>Wood</span> <b>150</b></div>
          <div class="hud-badge">${icon("ore")} <span>Stone</span> <b>120</b></div>
          <div class="hud-badge">${icon("skull")} <span>Regions</span> <b>1 / 6</b></div>
          <div class="hud-badge">${icon("shield")} <span>Walls</span> <b>Wood</b></div>
          <div class="hud-badge">${icon("survivor")} <span>Survivors</span> <b>3</b></div>
        </div>

        <div class="homebase-layout">
          <aside class="homebase-palette">
            <div class="section-h"><span>Build</span><span>${esc(state.home.selected)}</span></div>
            ${palette}
            <div class="hint">Pick a card, then click a grid tile.</div>
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

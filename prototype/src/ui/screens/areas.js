import { icon } from "../icons.js";
import { esc } from "../helpers.js";

export function renderAreas(registry, state) {
  const cards = registry
    .all("areas")
    .map((area) => {
      const locked = area.level > state.combatLevel;
      const factions = area.factionIds
        .map((id) => registry.get("factions", id))
        .filter(Boolean);

      const factionTags = factions
        .map(
          (faction) =>
            `<span class="tag" style="color:${esc(faction.color)}">${esc(faction.name)}</span>`
        )
        .join("");

      return `
        <button class="area-card${locked ? " locked" : ""}" data-area="${esc(area.id)}" ${locked ? "disabled" : ""}>
          <div class="area-top">
            <span class="area-icon">${icon(area.icon)}</span>
            <span class="area-level">Lv ${area.level}</span>
          </div>
          <div class="area-name">${esc(area.name)}</div>
          <div class="area-desc">${esc(area.description)}</div>
          <div class="area-tags">
            <span class="tag war">${esc(area.type)}</span>
            ${factionTags}
          </div>
          <div class="area-meta">
            <span>${area.enemyIds.length} foes</span>
            <span>${area.nodeIds.length} nodes</span>
            <span>${locked ? "Locked" : "Enter"}</span>
          </div>
        </button>
      `;
    })
    .join("");

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">World</div>
        <h1>Areas</h1>
        <div class="page-tags">
          <span class="tag war">Combat level ${state.combatLevel}</span>
          <span class="tag">${registry.all("areas").length} regions</span>
        </div>
      </div>
    </div>
    <div class="areas-grid">${cards}</div>
  `;
}

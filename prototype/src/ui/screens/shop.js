import { esc, fmt } from "../helpers.js";
import { icon } from "../icons.js";

const TABS = [
  ["general", "General"],
  ["equipment", "Equipment"],
  ["upgrades", "Upgrades"],
];

export function renderShop(registry, state) {
  const offers = registry.all("shops").filter((offer) => offer.tab === state.shopTab);

  const tabs = TABS.map(
    ([id, label]) => `
      <button class="tab${state.shopTab === id ? " active" : ""}" data-shop-tab="${id}">
        ${esc(label)}
      </button>
    `
  ).join("");

  const cards = offers
    .map((offer) => {
      const owned = Boolean(offer.grantsUnlock) && state.unlocks.includes(offer.grantsUnlock);
      const locked = state.combatLevel < offer.levelReq;
      const affordable = state.scrap >= offer.cost;
      const disabled = owned || locked || !affordable;

      return `
        <div class="shop-card">
          <div class="shop-head">
            <div class="shop-icon">${icon(offer.icon)}</div>
            <div>
              <div class="shop-name">${esc(offer.name)}</div>
              <div class="shop-meta">${esc(offer.group)}${offer.levelReq > 1 ? ` · Lv ${offer.levelReq}` : ""}</div>
            </div>
          </div>

          <div class="shop-desc">${esc(offer.description || "No description.")}</div>

          <div class="shop-foot">
            <div class="cost">${icon("scrap")} <span>${fmt(offer.cost)}</span></div>
            <button
              class="btn ${disabled ? "" : "primary"} small"
              data-buy="${esc(offer.id)}"
              ${disabled ? "disabled" : ""}
            >
              ${owned ? "Owned" : locked ? `Lv ${offer.levelReq}` : affordable ? "Buy" : "No scrap"}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Trade</div>
        <h1>Shop</h1>
        <div class="page-tags">
          <span class="tag war">${fmt(state.scrap)} scrap</span>
          <span class="tag">${offers.length} offers</span>
        </div>
      </div>
    </div>

    <div class="tab-row">${tabs}</div>
    <div class="shop-grid">${cards || `<div class="empty-line">No offers in this tab.</div>`}</div>
  `;
}

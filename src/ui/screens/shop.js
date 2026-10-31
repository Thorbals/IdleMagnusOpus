import { esc, fmt, itemName } from "../helpers.js";
import { icon } from "../icons.js";

const TABS = [
  ["general", "General"],
  ["equipment", "Equipment"],
  ["upgrades", "Upgrades"],
];

const QUANTITIES = [1, 10, 100];

function renderToolbar(state) {
  const modes = [
    ["buy", "Buy"],
    ["sell", "Sell"],
  ];

  return `
    <div class="shop-toolbar">
      <div class="segmented">
        ${modes
          .map(
            ([id, label]) => `
              <button class="btn small${state.shopMode === id ? " primary" : ""}" data-shop-mode="${id}">
                ${label}
              </button>
            `
          )
          .join("")}
      </div>
      <div class="quantity">
        <span>Qty</span>
        ${QUANTITIES.map(
          (qty) => `
            <button class="btn small${state.shopQty === qty ? " primary" : ""}" data-shop-qty="${qty}">
              ${qty}
            </button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderBuy(registry, state) {
  const offers = registry.all("shops").filter((offer) => offer.tab === state.shopTab);

  const cards = offers
    .map((offer) => {
      const owned = Boolean(offer.grantsUnlock) && state.unlocks.includes(offer.grantsUnlock);
      const locked = state.combatLevel < offer.levelReq;
      const qty = offer.repeatable ? state.shopQty : 1;
      const total = offer.cost * qty;
      const affordable = state.scrap >= total;
      const disabled = owned || locked || !affordable;

      return `
        <div class="shop-card">
          <div class="shop-head">
            <div class="shop-icon">${icon(offer.icon)}</div>
            <div>
              <div class="shop-name">${esc(offer.name)}</div>
              <div class="shop-meta">${esc(offer.group)}${offer.levelReq > 1 ? ` - Lv ${offer.levelReq}` : ""}</div>
            </div>
          </div>

          <div class="shop-desc">${esc(offer.description || "No description.")}</div>

          <div class="shop-foot">
            <div class="cost">${icon("scrap")} <span>${fmt(total)}</span></div>
            <button class="btn ${disabled ? "" : "primary"} small" data-buy="${esc(offer.id)}" ${disabled ? "disabled" : ""}>
              ${owned ? "Owned" : locked ? `Lv ${offer.levelReq}` : affordable ? `Buy${qty > 1 ? ` x${qty}` : ""}` : "No scrap"}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  return `<div class="shop-grid">${cards || `<div class="empty-line">No offers in this tab.</div>`}</div>`;
}

function renderSell(registry, state) {
  const stacks = state.bank
    .map((stack) => ({ stack, item: registry.get("items", stack.itemId) }))
    .filter(({ item }) => item && item.value > 0);

  const cards = stacks
    .map(({ stack, item }) => {
      const qty = Math.min(state.shopQty, stack.qty);
      const total = item.value * qty;

      return `
        <div class="shop-card">
          <div class="shop-head">
            <div class="shop-icon">${icon(item.icon)}</div>
            <div>
              <div class="shop-name">${esc(itemName(registry, stack.itemId))}</div>
              <div class="shop-meta">${esc(item.rarity)} - ${fmt(stack.qty)} owned</div>
            </div>
          </div>
          <div class="shop-desc">Sell ${fmt(qty)} for ${fmt(total)} scrap.</div>
          <div class="shop-foot">
            <div class="cost">${icon("scrap")} <span>${fmt(total)}</span></div>
            <button class="btn primary small" data-sell="${esc(stack.itemId)}">Sell${qty > 1 ? ` x${qty}` : ""}</button>
          </div>
        </div>
      `;
    })
    .join("");

  return `<div class="shop-grid">${cards || `<div class="empty-line">Nothing to sell.</div>`}</div>`;
}

export function renderShop(registry, state) {
  const offerCount = registry
    .all("shops")
    .filter((offer) => offer.tab === state.shopTab).length;

  const tabs = TABS.map(
    ([id, label]) => `
      <button class="tab${state.shopTab === id ? " active" : ""}" data-shop-tab="${id}">
        ${esc(label)}
      </button>
    `
  ).join("");

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Trade</div>
        <h1>Shop</h1>
        <div class="page-tags">
          <span class="tag war">${fmt(state.scrap)} scrap</span>
          <span class="tag">${state.shopMode === "sell" ? "Selling" : `${offerCount} offers`}</span>
        </div>
      </div>
    </div>

    ${renderToolbar(state)}
    ${state.shopMode === "buy" ? `<div class="tab-row">${tabs}</div>` : ""}
    ${state.shopMode === "sell" ? renderSell(registry, state) : renderBuy(registry, state)}
  `;
}

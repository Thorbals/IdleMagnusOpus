import { icon } from "../icons.js";
import { equipmentForItem } from "../../game/inventory.js";
import { esc, itemName } from "../helpers.js";

const CAPACITY = 30;

export function renderBank(registry, state) {
  const stacks = state.bank;
  const filled = stacks.length;

  const slots = stacks
    .map((stack) => {
      const item = registry.get("items", stack.itemId);
      if (!item) return "";

      const gear = equipmentForItem(registry, stack.itemId);
      const usable = item.category === "consumable";
      const action = gear ? "equip" : usable ? "use" : "inspect";
      const hint = gear ? "Click to equip" : usable ? "Click to use" : "Material";

      return `
        <button
          class="bank-slot rarity-${esc(item.rarity)}"
          title="${esc(item.name)} — ${hint}"
          data-item="${esc(stack.itemId)}"
          data-item-action="${action}"
        >
          ${icon(item.icon)}
          ${stack.qty > 1 ? `<span class="qty">${stack.qty}</span>` : ""}
          <span class="slot-name">${esc(itemName(registry, stack.itemId))}</span>
        </button>
      `;
    })
    .join("");

  const emptySlots = Array.from(
    { length: Math.max(0, CAPACITY - filled) },
    () => `<div class="bank-slot empty"></div>`
  ).join("");

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Storage</div>
        <h1>Bank</h1>
        <div class="page-tags">
          <span class="tag war">${filled} / ${CAPACITY} slots</span>
          <span class="tag">Click to equip or use</span>
        </div>
      </div>
    </div>

    <section class="panel">
      <div class="panel-title"><span>Inventory</span><span class="meta">${filled} / ${CAPACITY}</span></div>
      <div class="panel-body">
        <div class="bank-grid">${slots}${emptySlots}</div>
      </div>
    </section>
  `;
}

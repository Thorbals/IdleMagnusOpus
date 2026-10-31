import { bankCapacity, equipmentForItem } from "../../game/inventory.js";
import { esc, itemName } from "../helpers.js";
import { icon } from "../icons.js";

export function renderBank(registry, state) {
  const stacks = state.bank;
  const filled = stacks.length;
  const capacity = bankCapacity(state);

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
          title="${esc(item.name)} â€” ${hint}"
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
    { length: Math.max(0, capacity - filled) },
    () => `<div class="bank-slot empty"></div>`
  ).join("");

  return `
    <div class="page-head">
      <div>
        <div class="breadcrumb">Storage</div>
        <h1>Bank</h1>
        <div class="page-tags">
          <span class="tag war">${filled} / ${capacity} slots</span>
          <span class="tag">Click to equip or use</span>
        </div>
      </div>
    </div>

    <section class="panel">
      <div class="panel-title"><span>Inventory</span><span class="meta">${filled} / ${capacity}</span></div>
      <div class="panel-body">
        <div class="bank-grid">${slots}${emptySlots}</div>
      </div>
    </section>
  `;
}

import { pushLog } from "../state/state.js";

export function equipItem(state, registry, itemId) {
  const slot = slotForItem(state, registry, itemId);
  if (!slot || countItem(state, itemId) < 1) return false;

  removeItem(state, itemId, 1);

  const previous = state.equipment[slot];
  if (previous) addItem(state, registry, previous, 1);

  state.equipment = { ...state.equipment, [slot]: itemId };
  const definition = equipmentForItem(registry, itemId);
  pushLog(state, `Equipped ${definition?.name ?? itemId}.`, "good");
  return true;
}

export function unequipItem(state, registry, slot) {
  const itemId = state.equipment[slot];
  if (!itemId) return false;

  addItem(state, registry, itemId, 1);
  state.equipment = { ...state.equipment, [slot]: null };
  return true;
}

export function equipmentForItem(registry, itemId) {
  return registry.all("equipment").find((entry) => entry.itemId === itemId);
}

function slotForItem(state, registry, itemId) {
  const definition = equipmentForItem(registry, itemId);
  if (!definition) return null;

  if (definition.slot !== "accessory") return definition.slot;
  if (!state.equipment.accessory1) return "accessory1";
  if (!state.equipment.accessory2) return "accessory2";
  return "accessory1";
}

export function addItem(state, registry, itemId, qty = 1) {
  if (!registry.has("items", itemId)) return false;

  const existing = state.bank.find((stack) => stack.itemId === itemId);
  if (existing) {
    existing.qty += qty;
    return true;
  }

  if (state.bank.length >= bankCapacity(state)) return false;

  state.bank = [...state.bank, { itemId, qty }];
  return true;
}

export function bankCapacity(state) {
  const tabs = state.unlocks.filter((unlock) => unlock.startsWith("bank_tab_")).length;
  return 30 + tabs * 32;
}

export function removeItem(state, itemId, qty = 1) {
  const existing = state.bank.find((stack) => stack.itemId === itemId);
  if (!existing || existing.qty < qty) return false;

  existing.qty -= qty;
  if (existing.qty <= 0) {
    state.bank = state.bank.filter((stack) => stack !== existing);
  }
  return true;
}

export function countItem(state, itemId) {
  return state.bank.find((stack) => stack.itemId === itemId)?.qty ?? 0;
}

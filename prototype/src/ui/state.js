const SAVE_KEY = "idleness.prototype.save.v1";

const STARTING_LEVELS = {
  "skill.fitness": 12,
  "skill.defense": 9,
  "skill.melee": 14,
  "skill.firearms": 6,
  "skill.explosives": 2,
  "skill.woodcutting": 8,
  "skill.mining": 11,
  "skill.fishing": 7,
  "skill.foraging": 9,
  "skill.hunting": 5,
  "skill.looting": 4,
  "skill.scavenging": 10,
  "skill.animal_care": 3,
  "skill.farming": 4,
  "skill.cooking": 6,
  "skill.forging": 8,
  "skill.tailoring": 5,
  "skill.gunsmithing": 3,
  "skill.tinkering": 4,
  "skill.carpentry": 7,
  "skill.first_aid": 5,
  "skill.masonry": 2,
  "skill.chemistry": 1,
  "skill.electrical": 1,
};

const STARTING_EQUIPMENT = {
  weapon: "item.rusty_knife",
  helmet: "item.patrol_helmet",
  body: "item.scavenger_vest",
  gloves: null,
  boots: "item.worn_boots",
  offhand: null,
  accessory1: "item.gas_mask",
  accessory2: null,
};

const STARTING_BANK = [
  ["item.scrap", 47],
  ["item.wood", 14],
  ["item.stick", 9],
  ["item.coal", 5],
  ["item.copper_ore", 8],
  ["item.cloth", 12],
  ["item.bandage", 3],
  ["item.military_knife", 1],
  ["item.ammo", 123],
  ["item.raw_fish", 2],
];

function makeHome() {
  const tiles = Array.from({ length: 100 }, () => "empty");

  for (let x = 0; x < 10; x += 1) tiles[5 * 10 + x] = "road";
  for (let y = 0; y < 10; y += 1) tiles[y * 10 + 5] = "road";

  tiles[2 * 10 + 2] = "building";
  tiles[2 * 10 + 3] = "building";
  tiles[3 * 10 + 2] = "building";
  tiles[7 * 10 + 7] = "building";
  tiles[7 * 10 + 8] = "building";

  return { tiles, selected: "wall" };
}

export function createState(registry) {
  const skillLevels = {};
  for (const skill of registry.all("skills")) {
    skillLevels[skill.id] = STARTING_LEVELS[skill.id] ?? 1;
  }

  return {
    version: 1,
    scrap: 2480,
    combatLevel: 12,
    hp: 68,
    bank: STARTING_BANK.map(([itemId, qty]) => ({ itemId, qty })),
    equipment: { ...STARTING_EQUIPMENT },
    skillLevels,
    skillXp: {},
    activeAction: null,
    combat: null,
    autoheal: false,
    logs: [
      { text: "You enter Sunken Meadow.", tone: "muted" },
      { text: "Shambler blocks the road.", tone: "bad" },
    ],
    screen: "areas",
    selectedAreaId: "area.sunken_meadow",
    selectedEnemyId: "enemy.shambler",
    selectedSkillId: "skill.mining",
    shopTab: "general",
    unlocks: [],
    home: makeHome(),
    toast: null,
  };
}

export function resetState(registry) {
  localStorage.removeItem(SAVE_KEY);
  return createState(registry);
}

export function saveState(state) {
  const payload = {
    ...state,
    activeAction: null,
    toast: null,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function loadState(registry) {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return null;
    const fresh = createState(registry);
    return {
      ...fresh,
      ...parsed,
      activeAction: null,
      toast: null,
      home: parsed.home ?? fresh.home,
    };
  } catch {
    return null;
  }
}

export function pushLog(state, text, tone = "muted") {
  state.logs = [...state.logs, { text, tone }].slice(-60);
}

export function setToast(state, text, tone = "accent") {
  state.toast = { text, tone, at: Date.now() };
}

export function addItem(state, registry, itemId, qty = 1) {
  if (!registry.has("items", itemId)) return;

  const existing = state.bank.find((stack) => stack.itemId === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    state.bank = [...state.bank, { itemId, qty }];
  }
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

export function equipmentForItem(registry, itemId) {
  return registry.all("equipment").find((entry) => entry.itemId === itemId);
}

export function slotForItem(state, registry, itemId) {
  const def = equipmentForItem(registry, itemId);
  if (!def) return null;

  if (def.slot !== "accessory") return def.slot;
  if (!state.equipment.accessory1) return "accessory1";
  if (!state.equipment.accessory2) return "accessory2";
  return "accessory1";
}

export function equipItem(state, registry, itemId) {
  const slot = slotForItem(state, registry, itemId);
  if (!slot) return false;
  if (countItem(state, itemId) < 1) return false;

  removeItem(state, itemId, 1);

  const previous = state.equipment[slot];
  if (previous) addItem(state, registry, previous, 1);

  state.equipment = { ...state.equipment, [slot]: itemId };
  const def = equipmentForItem(registry, itemId);
  pushLog(state, `Equipped ${def?.name ?? itemId}.`, "good");
  return true;
}

export function unequipItem(state, registry, slot) {
  const itemId = state.equipment[slot];
  if (!itemId) return false;

  addItem(state, registry, itemId, 1);
  state.equipment = { ...state.equipment, [slot]: null };
  return true;
}

const BASE_STATS = {
  attack: 10,
  defense: 10,
  accuracy: 50,
  crit: 5,
  maxHp: 100,
  armorPen: 0,
  attackInterval: 1.2,
  statusResist: 0,
};

export function deriveStats(state, registry) {
  const stats = { ...BASE_STATS };

  for (const itemId of Object.values(state.equipment)) {
    if (!itemId) continue;
    const def = equipmentForItem(registry, itemId);
    if (!def) continue;

    for (const [key, value] of Object.entries(def.stats)) {
      stats[key] = (stats[key] ?? 0) + value;
    }
  }

  return stats;
}

export function scaleEnemy(enemy, faction) {
  const level = enemy.level;
  const boss = enemy.role === "boss" ? 3 : 1;
  const growth = faction.growth;

  const scale = (base, exponent) => Math.round(base * Math.pow(1 + level, exponent) * 100) / 100;

  return {
    hp: Math.round(scale(faction.base.hp, growth.hp) * boss),
    attack: Math.round(scale(faction.base.attack, growth.attack) * boss),
    defense: Math.round(scale(faction.base.defense, growth.defense) * boss),
    accuracy: Math.min(99, Math.round(scale(faction.base.accuracy, growth.accuracy))),
    crit: Math.min(75, Math.round(scale(faction.base.crit, growth.crit))),
    armorPen: Math.min(90, Math.round(scale(faction.base.armorPen, growth.armorPen))),
    attackInterval: faction.base.attackInterval,
  };
}

export function skillLevel(state, skillId) {
  return state.skillLevels[skillId] ?? 1;
}

export function addSkillXp(state, registry, skillId, amount) {
  const level = skillLevel(state, skillId);
  const next = level * 250;
  const current = (state.skillXp[skillId] ?? 0) + amount;

  if (current >= next) {
    state.skillLevels = { ...state.skillLevels, [skillId]: level + 1 };
    state.skillXp = { ...state.skillXp, [skillId]: current - next };
    const skill = registry.get("skills", skillId);
    pushLog(state, `${skill?.name ?? skillId} reached level ${level + 1}.`, "good");
    setToast(state, `${skill?.name ?? "Skill"} level ${level + 1}`);
    if (skill?.group === "combat") state.combatLevel += 1;
  } else {
    state.skillXp = { ...state.skillXp, [skillId]: current };
  }
}

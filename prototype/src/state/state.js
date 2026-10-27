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
  // Timed actions are not persisted yet; reloading starts idle.
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

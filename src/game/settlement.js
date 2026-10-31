import { pushLog, setToast } from "../state/state.js";

const RAID_MIN_MS = 30 * 60 * 1000;
const RAID_MAX_MS = 60 * 60 * 1000;

export function homeDefense(state) {
  const tiles = state.home?.tiles ?? [];
  const walls = tiles.filter((tile) => tile === "wall" || tile === "gate").length;
  const buildings = tiles.filter((tile) =>
    ["house", "workshop", "farm", "building"].includes(tile)
  ).length;

  return walls * 3 + buildings * 2 + (state.home?.survivors ?? 0) * 2 + Math.floor(state.combatLevel / 2);
}

export function scheduleNextRaid(state, now = Date.now()) {
  const delay = RAID_MIN_MS + Math.random() * (RAID_MAX_MS - RAID_MIN_MS);
  state.home = { ...state.home, nextRaidAt: now + delay };
}

export function resolveRaid(state, now = Date.now()) {
  if (!state.home) return null;

  const defense = homeDefense(state);
  const strength =
    10 +
    state.combatLevel +
    Math.floor(state.scrap / 250) +
    Math.floor(Math.random() * 10);
  const won = defense >= strength;
  const damage = Math.max(0, strength - defense);

  let destroyed = 0;

  if (!won) {
    const tiles = [...state.home.tiles];
    const targets = tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => ["house", "workshop", "farm", "building", "wall", "gate"].includes(tile))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, Math.ceil(damage / 10)));

    for (const target of targets) {
      if (tiles[target.index] !== "empty") {
        tiles[target.index] = "empty";
        destroyed += 1;
      }
    }

    state.home = { ...state.home, tiles, lastRaid: { at: now, strength, defense, won, damage, destroyed } };
    pushLog(state, `Raid hit the base: ${destroyed} structures lost.`, "bad");
    setToast(state, `Raid: ${destroyed} structures lost`, "bad");
  } else {
    state.home = {
      ...state.home,
      lastRaid: { at: now, strength, defense, won, damage: 0, destroyed: 0 },
      raidsSurvived: (state.home.raidsSurvived ?? 0) + 1,
    };
    pushLog(state, `Raid repelled. Defense ${defense} vs ${strength}.`, "good");
    setToast(state, "Raid repelled");
  }

  scheduleNextRaid(state, now);
  return state.home.lastRaid;
}

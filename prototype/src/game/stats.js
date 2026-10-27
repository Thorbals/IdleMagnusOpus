import { equipmentForItem } from "./inventory.js";
import { skillBonuses } from "./progression.js";

const BASE_STATS = {
  attack: 10,
  defense: 10,
  accuracy: 50,
  crit: 5,
  maxHp: 100,
  hpRegen: 0.5,
  armorPen: 0,
  attackInterval: 1.2,
  statusResist: 0,
};

export function deriveStats(state, registry) {
  const stats = { ...BASE_STATS };

  for (const itemId of Object.values(state.equipment)) {
    if (!itemId) continue;

    const definition = equipmentForItem(registry, itemId);
    if (!definition) continue;

    for (const [stat, value] of Object.entries(definition.stats)) {
      stats[stat] = (stats[stat] ?? 0) + value;
    }
  }

  for (const [stat, value] of Object.entries(skillBonuses(state))) {
    stats[stat] = (stats[stat] ?? 0) + value;
  }

  return stats;
}

export function scaleEnemy(enemy, faction) {
  const level = enemy.level;
  const bossMultiplier = enemy.role === "boss" ? 3 : 1;
  const growth = faction.growth;

  const scale = (base, exponent) =>
    Math.round(base * Math.pow(1 + level, exponent) * 100) / 100;

  return {
    hp: Math.round(scale(faction.base.hp, growth.hp) * bossMultiplier),
    attack: Math.round(scale(faction.base.attack, growth.attack) * bossMultiplier),
    defense: Math.round(scale(faction.base.defense, growth.defense) * bossMultiplier),
    accuracy: Math.min(99, Math.round(scale(faction.base.accuracy, growth.accuracy))),
    crit: Math.min(75, Math.round(scale(faction.base.crit, growth.crit))),
    armorPen: Math.min(90, Math.round(scale(faction.base.armorPen, growth.armorPen))),
    attackInterval: faction.base.attackInterval,
  };
}

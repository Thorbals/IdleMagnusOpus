import { equipmentForItem } from "./inventory.js";
import { skillBonuses } from "./progression.js";

const BASE_STATS = {
  attack: 10,
  defense: 10,
  accuracy: 50,
  evasion: 25,
  crit: 5,
  maxHp: 100,
  hpRegen: 0.5,
  armorPen: 0,
  attackSpeed: 0,
  attackInterval: 1.2,
  statusResist: 0,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

  stats.hitChance = hitChance(stats.accuracy, stats.evasion);
  stats.critChance = clamp(stats.crit, 0, 75);
  stats.reduction = damageReduction(stats.defense, 0);
  stats.attackInterval = attackInterval(stats.attackSpeed);

  return stats;
}

export function scaleEnemy(enemy, faction, level = enemy.level) {

  const bossMultiplier = enemy.role === "boss" ? 3 : 1;
  const growth = faction.growth;

  const scale = (base, exponent) =>
    Math.round(base * Math.pow(1 + level, exponent) * 100) / 100;

  const stats = {
    hp: Math.round(scale(faction.base.hp, growth.hp) * bossMultiplier),
    attack: Math.round(scale(faction.base.attack, growth.attack) * bossMultiplier),
    defense: Math.round(scale(faction.base.defense, growth.defense) * bossMultiplier),
    accuracy: Math.round(scale(faction.base.accuracy, growth.accuracy)),
    evasion: Math.round(scale(faction.base.evasion ?? 25, growth.evasion ?? 0.5)),
    crit: clamp(Math.round(scale(faction.base.crit, growth.crit)), 0, 75),
    armorPen: Math.min(90, Math.round(scale(faction.base.armorPen, growth.armorPen))),
    attackInterval: faction.base.attackInterval,
  };

  stats.hitChance = hitChance(stats.accuracy, stats.evasion);
  stats.critChance = stats.crit;
  stats.reduction = damageReduction(stats.defense, 0);

  return stats;
}

export function encounterLevel(area, enemy) {
  const boss = enemy.role === "boss";

  if (boss) {
    if (area.type === "dungeon") return area.level + 25;
    if (area.type === "raid") return area.level + 40;
    if (area.type === "stronghold") return area.level + 10;
    return area.level + 5;
  }

  if (area.type === "dungeon") return area.level + 4;
  if (area.type === "raid") return area.level + 6;
  if (area.type === "stronghold") return area.level + 3;
  return area.level + 2;
}

export function hitChance(accuracy, evasion) {
  const total = accuracy + evasion;
  if (total <= 0) return 5;
  return clamp((accuracy / total) * 100, 5, 99);
}

export function damageReduction(defense, armorPen = 0) {
  const effective = Math.max(0, defense * (1 - clamp(armorPen, 0, 90) / 100));
  return clamp(effective / (effective + 100), 0, 0.95);
}

export function calculateDamage({ attack, defense, armorPen = 0, critMultiplier = 1 }) {
  const reduction = damageReduction(defense, armorPen);
  return Math.max(1, Math.round(attack * critMultiplier * (1 - reduction)));
}

export function attackInterval(attackSpeed = 0) {
  return clamp(1.2 / (1 + attackSpeed / 100), 0.5, 5);
}

import { pushLog, setToast } from "../state/state.js";

const COMBAT_BONUSES = {
  "skill.fitness": (level) => ({ maxHp: level * 2, hpRegen: level * 0.05 }),
  "skill.defense": (level) => ({ defense: level * 1.2 }),
  "skill.melee": (level) => ({ attack: level * 1.5, accuracy: level * 0.6 }),
  "skill.firearms": (level) => ({ attack: level * 1.0, accuracy: level * 1.2 }),
  "skill.explosives": (level) => ({ attack: level * 0.8, armorPen: level * 0.4 }),
};

export function xpForLevel(level) {
  return level * 250;
}

export function skillLevel(state, skillId) {
  return state.skillLevels[skillId] ?? 1;
}

export function skillBonuses(state) {
  const bonuses = {};

  for (const [skillId, calculate] of Object.entries(COMBAT_BONUSES)) {
    const level = state.skillLevels[skillId] ?? 1;

    for (const [stat, value] of Object.entries(calculate(level))) {
      bonuses[stat] = (bonuses[stat] ?? 0) + value;
    }
  }

  return bonuses;
}

export function addSkillXp(state, registry, skillId, amount) {
  let level = skillLevel(state, skillId);
  let current = (state.skillXp[skillId] ?? 0) + amount;
  let levelsGained = 0;

  while (current >= xpForLevel(level)) {
    current -= xpForLevel(level);
    level += 1;
    levelsGained += 1;
  }

  state.skillLevels = { ...state.skillLevels, [skillId]: level };
  state.skillXp = { ...state.skillXp, [skillId]: current };

  if (levelsGained === 0) return;

  const skill = registry.get("skills", skillId);
  pushLog(state, `${skill?.name ?? skillId} reached level ${level}.`, "good");
  setToast(state, `${skill?.name ?? "Skill"} level ${level}`);

  if (skill?.group === "combat") {
    state.combatLevel += levelsGained;
  }
}

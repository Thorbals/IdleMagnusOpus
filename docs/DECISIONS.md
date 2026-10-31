# Idleness - Gameplay Decisions

These are the rules the prototype uses until a later balance pass changes them.

## Stats

- Base player stats: attack 10, defense 10, accuracy 50, evasion 25, crit 5%, max HP 100, attack interval 1.2s.
- Accuracy is a rating, not a percent.
- Hit chance = `clamp(accuracy / (accuracy + evasion) * 100, 5, 99)`.
- Crit is stored as a percent. There is no crit rating conversion in the prototype.
- Damage reduction = `defense / (defense + 100)`, capped at 95%.
- Damage = `max(1, round(attack * critMultiplier * (1 - reduction)))`.
- Armor penetration reduces defense before the reduction formula.
- Attack interval = `base / (1 + attackSpeed / 100)`, clamped to 0.5-5.0s.

## Progression

- XP needed for the next level = `level * 250`.
- Skill levels give combat bonuses:
  - Fitness: +2 max HP and +0.05 HP regen per level.
  - Defense: +1.2 defense per level.
  - Melee: +1.5 attack and +0.6 accuracy per level.
  - Firearms: +1.0 attack and +1.2 accuracy per level.
  - Explosives: +0.8 attack and +0.4 armor pen per level.
- Combat level rises when a combat skill levels up.

## Combat

- Combat is an auto-loop with player and enemy attack timers.
- Encounter level = area level + offset:
  - Normal: +2
  - Stronghold: +3
  - Dungeon: +4
  - Raid: +6
- Boss level = area level + offset:
  - Normal: +5
  - Stronghold: +10
  - Dungeon: +25
  - Raid: +40
- Auto Fight continues to the next normal enemy until a boss or defeat.
- Auto Eat consumes a bandage or cooked meat below 30% HP.
- Auto Fight continues after a normal kill; it stops on bosses and defeats.
- Bosses live in the dungeon tab, not the normal enemy list.
- Offline combat is paused.

## Skills

- Gathering and crafting actions can be queued.
- Repeat keeps the same action running.
- Offline progress completes the active action and queue up to a 12-hour cap.

## Content

- Design doc skills are the source of truth: 7 gathering, 7 crafting, 2 passive, 5 combat.
- Masonry, Chemistry, and Electrical are removed from the core skill list.
- Areas separate `enemyIds` (normal) and `bossIds` (bosses).

## Saves

- Prototype save version stays at 1 until the full save migration pass.
- New fields are filled from defaults when loading older saves.

# Idleness - Theme Decision

**Selected theme: Night Market - Steel Blue title**
**Direction: Urban pixel** - dark asphalt panels, steel-blue signage, cyan controls, chunky slot grids, beveled buttons.

Source of truth for tokens: `design/themes/night-market.css`
Visual reference: `design/night-market-swaps.html` (option 03)

---

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--frame` | `#0e0f14` | Outer panel frames, hard outlines |
| `--panel` | `#2a2c35` | Panel bodies |
| `--panel-2` | `#22242c` | Raised/secondary rows |
| `--slot` | `#1a1c23` | Inventory and gear slots |
| `--slot-light` | `#3a3d48` | Inset top-left bevel |
| `--slot-dark` | `#0f1014` | Inset bottom-right bevel |
| `--title` | `#3a5f8a` | Title bars (Steel Blue) |
| `--title-text` | `#eaf2ff` | Title text |
| `--text` | `#e6e6ef` | Primary text |
| `--muted` | `#9a9cae` | Secondary text |
| `--accent` | `#4fe0d0` | Primary buttons, highlights (Cyan) |
| `--accent-2` | `#7ff0e4` | Focus, hover |
| `--accent-text` | `#06201d` | Text on accent |
| `--success` | `#6fae7b` | HP, gains |
| `--danger` | `#d95f4a` | Damage, destructive actions |
| `--info` | `#7fa0b8` | Neutral notices |

Rarity: junk `#6f737c`, common `#c9ccd2`, rare `#5b93c9`, epic `#d8a93f`, guaranteed `#4fae9e`.

Factions: zombies `#7f9c4a`, cannibals `#b5473c`, bandits `#b8863b`, soldiers `#6f8fae`, cultists `#c2652f`, mutants `#8a6fb0`, scavengers `#a08a5a`, directorate `#c9a227`.

---

## Structural rules

- **Panel frame:** 4px solid `--frame`.
- **Controls:** 3px borders with a hard 3px offset shadow.
- **Slots:** 2px border plus inset bevel (light top-left, dark bottom-right).
- **Corner radius:** 0. Pixel corners only.
- **Shadows:** hard offset only, never blur.
- **Title bars:** solid `--title` with `--title-text`; the only large color block on a panel.
- **Button language:** cyan fill, dark text, bevel highlight top-left, shadow bottom-right.
- **No pink or red in chrome.** Red is reserved for damage/danger.

---

## Typography

| Role | Font | Size |
| --- | --- | --- |
| Display / panel titles / buttons | Jersey 10 | 18-30px |
| UI labels and body | Pixelify Sans | 10-14px |
| Numbers, stats, log | VT323 | 16-20px |

---

## Usage

```html
<html data-theme="night-market">
  <link rel="stylesheet" href="design/themes/night-market.css" />
</html>
```

Or apply the class form:

```html
<body class="theme-night-market">
```

All colors and spacing come from tokens. Do not hardcode hex values in components.

---

## Notes

- **Blackout was rejected.** It read too flat and lost the chunky panel language.
- The title color was the only open variable; Steel Blue (`#3a5f8a`) won over teal, green, rust, slate, amber, violet, olive, and cobalt.
- Cyan remains the interaction color across buttons, focus, and highlights.
- Icons are placeholder 12x12 pixel maps rendered as SVG rects. Real art must follow the same grid and outline rules.

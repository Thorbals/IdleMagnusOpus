import { categories } from "./content/categories/index.js";
import { buildRegistry } from "./content/registry.js";
import { createState, loadState } from "./state/state.js";
import { createApp } from "./ui/app.js";

const registry = buildRegistry(categories);

if (registry.errors.length > 0) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="padding:24px;font-family:monospace;color:#e6e6ef;background:#0a0a0d;min-height:100vh">
      <h1 style="color:#d95f4a">Content validation failed</h1>
      <ul>${registry.errors.map((error) => `<li>${error}</li>`).join("")}</ul>
    </div>
  `;
  console.error("[content]", registry.errors);
} else {
  const saved = loadState(registry);
  const state = saved ?? createState(registry);

  const params = new URLSearchParams(window.location.search);
  const screen = params.get("screen");
  const skill = params.get("skill");
  const area = params.get("area");

  if (screen) state.screen = screen;
  if (skill && registry.has("skills", skill)) {
    state.selectedSkillId = skill;
    state.screen = "skill";
  }
  if (area && registry.has("areas", area)) {
    state.selectedAreaId = area;
    state.screen = "combat";
  }

  createApp({ registry, state });
  window.__idleness = { registry, state };
}

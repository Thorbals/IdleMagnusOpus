# Idleness — Reference & Rules

Reference file for project rules and conventions. Apply these to all work in this project.

## Scope

These rules apply to the **entire Idleness project** — every file, language, and change, including new code, edits, refactors, and file organization.

## Purpose

What this project is and what it's for.

---

## Code Quality

Always keep code clean, organized, and maintainable:

- Use clear, consistent naming (variables, functions, classes, files).
- Prefer small, focused functions over large ones.
- Keep related logic together; separate concerns (UI, business logic, data, config).
- Avoid deep nesting; extract early returns or helper functions.
- Remove dead code, unused imports, commented-out blocks, and debug prints unless explicitly asked to keep them.
- Prefer readable code over clever one-liners.
- Add brief comments only where the "why" is non-obvious.
- Match the existing project's style, structure, and conventions when editing existing code.

## Organization by Responsibility

- Group related functions/methods together.
- Put public/API surface near the top or in a clear section.
- Keep helper/private functions close to where they're used or in a dedicated helpers section.
- Separate pure logic from side effects (I/O, network, filesystem) when practical.
- Prefer modules/files that do one main thing.

## Formatting

Enforce consistent formatting:

- Consistent indentation and spacing.
- Logical blank lines between logical sections (imports, constants, classes, functions).
- Keep line length reasonable; break long lines cleanly.
- Sort imports (stdlib → third-party → local) and remove unused ones.
- Prefer explicit over implicit where it improves clarity.

## Writing New Code

- Start with a clear structure (imports → constants/config → main types/functions → entry point).
- Write small, single-responsibility functions.
- Use descriptive names.
- Prefer early returns over deep if/else trees.
- Leave the code in a state ready for the next developer (including future you).

---

## References

- 

## Notes

- 

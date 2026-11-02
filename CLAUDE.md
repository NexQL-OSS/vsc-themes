# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

NexQL Themes is a VS Code color-theme extension. There is no app code — only theme JSON, a small ESM build/validate toolchain, and the extension manifest.

## Build & validate

```bash
npm run compile    # = generate + validate (run after editing src/ or themes/)
npm run validate   # structure + WCAG contrast checks only
make package       # build then produce the .vsix via vsce
make debug         # launch Extension Development Host (or press F5 in VS Code)
```

There is no test framework and no transpile step — `.mjs` runs directly under Node.

## Theme generation model (the main gotcha)

`themes/*.json` are **build outputs**, not source. `npm run generate` (inside `compile`):
- Rewrites every generator-owned color/token key in each `themes/*.json`.
- **Deletes** any `themes/*.json` not registered in `src/directions/index.mjs` (DIRECTIONS) or `src/static-themes.mjs` (STATIC_THEMES).
- Overwrites `package.json` → `contributes.themes` entirely from those two lists.

Consequences:
- Do **not** hand-edit `contributes.themes` in `package.json` — it is regenerated. Register themes in `static-themes.mjs` / `directions/index.mjs` instead.
- Hand-edits to `themes/*.json` survive compile **only** for keys the generator does not emit (see `scripts/merge-theme-customizations.mjs`). Generator-owned keys are always refreshed, so author real changes in `src/`, not the JSON.
- Two theme classes: **DIRECTIONS** (generated from a `DirectionSpec` in `src/directions/`) and **STATIC_THEMES** (hand-authored JSON, listed but not regenerated). All 39 current themes are DIRECTIONS; STATIC_THEMES is empty.

## Validation rules (enforced by `validate`, fails the build)

- Each theme: ≥80 workbench color keys, ≥10 `tokenColors` rules, ≥8 `semanticTokenColors`.
- All color values must be 6- or 8-digit hex (`#RRGGBB` / `#RRGGBBAA`); 8-digit alpha below 0.35 fails the contrast guard.
- `name` in the JSON must equal the `label` in `package.json`; labels must be unique; `uiTheme` ∈ `vs`/`vs-dark`/`hc-black`/`hc-light`.
- Required preview keys come from `PREVIEW_COLOR_KEYS`; contrast pairs from `src/color-keys.mjs` must clear their minimum ratio.

## Conventions

- ESM only (`.mjs`), JSDoc type annotations — no TypeScript, no `.ts` files.
- Commit straight to `main` (solo repo, no PR flow).
- Release is manual and loosely tracked — bump `package.json` version and prepend a `CHANGELOG.md` entry when it matters. (Note: `package.json` version and CHANGELOG headings have drifted historically; don't assume they match.)

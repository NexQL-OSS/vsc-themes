# Changelog

All notable changes to NexQL Themes are documented in this file.

## Unreleased

- Every theme now emits the NexQL extension brand colors, derived from its own palette: `nexql.accent`, `nexql.accentForeground`, `nexql.ribbon.{blue,indigo,purple,magenta,orange,amber}`, `nexql.mode.{read,write,admin}`, `postgres.envProd`, `postgres.envStaging`, `postgres.envDev`. Accent and mode colors are validated against the editor background (WCAG AA).

## 0.1.0

Initial public release — **11 hand-authored themes** with scenario-anchored names, `NexQL` prefix in the picker, and a shared design language: quiet keywords, disciplined spectrum, one reserved accent (magenta for errors only).

### Themes

| Theme | Type |
| --- | --- |
| NexQL Mute Dark | dark |
| NexQL OLED Dark | dark |
| NexQL Ember Dark | dark |
| NexQL Drift Dark | dark |
| NexQL Break of Dawn | light |
| NexQL Claudy Day | light |
| NexQL Claudy Night | dark |
| NexQL Postgres Homage Dark | dark |
| NexQL Postgres Homage Day | light |
| NexQL Sage Day | light |
| NexQL Sage at Night | dark |

### Design

- Calm syntax hierarchy — quiet indigo-gray keywords, merged data amber, desaturated scan colors.
- Magenta (`#E85FBF`) reserved for errors only; never used in high-frequency syntax.
- ~120 curated workbench keys per theme; SQL-first token rules with semantic token coverage.
- WCAG contrast validation on critical foreground/background pairs at compile time.

### Theme highlights

- **NexQL Mute Dark** — flagship dark; warm near-black surfaces, cool→warm syntax ribbon, indigo UI accent (`#8A8CFF`).
- **NexQL OLED Dark** — true-black AMOLED variant (Mute Dark chrome + Break of Dawn syntax, brightened for `#000000` canvas).
- **NexQL Ember Dark** — warmer, higher-contrast dark for long sessions.
- **NexQL Drift Dark** — cool, low-chroma fog-bank dark.
- **NexQL Break of Dawn** — solar-powered light with warm parchment surfaces.
- **NexQL Claudy Day** / **NexQL Claudy Night** — Claude Code–inspired pair (warm parchment light, ink dark).
- **NexQL Postgres Homage Dark** / **NexQL Postgres Homage Day** — Postgres `#336791` homage; slate-blue base, ivory foreground, amber data.
- **NexQL Sage Day** / **NexQL Sage at Night** — sage-green light pair; night is a true dark counterpart with sage-tinted depth ladder.

### Build & tooling

- `npm run compile` — generate theme manifests from `src/static-themes.mjs`, then validate structure and contrast.
- `scripts/merge-theme-customizations.mjs` — compile preserves hand-authored JSON keys not owned by the generator.
- `scripts/generate-previews.mjs` — registers static themes; regenerates generator-owned keys without deleting unrecognized files.
- F5 workflow: `.vscode/launch.json`, `.vscode/tasks.json`, `Makefile` targets (`build`, `package`, `debug`, `git-tag`).
- Pure theme manifest — no `extension.js` or `activationEvents`; `extensionKind: ["workspace", "ui"]` for WSL dev host.
- CI publish on `v*` tag push to VS Code Marketplace and Open VSX.

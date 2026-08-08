---
name: release
description: >-
  Cut a NexQL Core stable or nightly release — compute patch/minor/major version,
  update CHANGELOG, README, website, and all version touchpoints, then optionally
  package the VSIX. Use when the user wants to release, bump version, tag, or
  publish NexQL Core.
disable-model-invocation: true
---

# Release NexQL Core

Work from **`core/`**. Full workflow: [core/.claude/skills/release/SKILL.md](../../core/.claude/skills/release/SKILL.md).

`$ARGUMENTS` may be `patch`, `minor`, `major`, `stable`, `nightly`, an explicit version (`2.4.0`), or a combo (`stable patch`). If omitted, ask channel and bump type.

## Quick reference

### Version rules

| Channel | Minor | Example |
|---------|-------|---------|
| stable | even | `2.2.4`, `2.4.0` |
| nightly | odd | `2.3.5`, `2.5.0` |

Bump: **patch** / **minor** / **major** — logic in `core/scripts/bump-version.js`. Confirm computed version with user; do not assume CHANGELOG heading matches `package.json`.

### Files to update

| Repo | Files |
|------|-------|
| `core/` | `package.json`, `package-lock.json`, `CHANGELOG.md`, `README.md`, `MARKETPLACE.md` |
| `website/` | `src/data/landing-content.ts`, `src/components/SiteHeader.astro`, `src/components/LandingStory.astro`, `src/markup/demo-shell.html` |

### Verify

```bash
cd core
rg -n 'OLD_VERSION' package.json CHANGELOG.md README.md MARKETPLACE.md ../website/src/
```

### Build (optional)

```bash
cd core && make package          # stable
cd core && make package-nightly  # nightly
```

**Do not** commit, tag, push, or publish unless explicitly asked. `make git-tag` auto-pushes — only use when requested.

See [VERSION_SITES.md](../../core/.claude/skills/release/VERSION_SITES.md) for the complete touchpoint list.

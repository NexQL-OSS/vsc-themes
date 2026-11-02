#!/usr/bin/env node
/**
 * Prepares the marketing site (site/, an Astro project) from the theme build outputs:
 *   - writes themes/manifest.json (the public data contract fetched by nexql.astrx.dev)
 *   - copies themes/*.json + manifest.json into site/public/themes/ (served at /themes/<file>.json)
 *   - copies the logo into site/public/assets/
 *   - writes site/src/data/generated/themes.json: one parseThemeSummary() result per theme,
 *     which the Astro pages read at build time so they render with real colours.
 *
 * Fails if the theme count drifts between DIRECTIONS, package.json, themes/ and the manifest.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DIRECTIONS } from "../src/directions/index.mjs";
import { parseThemeSummary } from "../src/site/parse-theme-summary.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_DIR = join(ROOT, "site");
const THEMES_DIR = join(ROOT, "themes");
const PUBLIC_THEMES = join(SITE_DIR, "public/themes");
const PUBLIC_ASSETS = join(SITE_DIR, "public/assets");
const GENERATED_DIR = join(SITE_DIR, "src/data/generated");

const manifest = DIRECTIONS.map((spec) => ({
  label: spec.label,
  filename: spec.filename,
  uiTheme: spec.uiTheme,
}));

// Count guard: every source of truth must agree before anything is published.
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const contributed = pkg.contributes?.themes ?? [];
const onDisk = readdirSync(THEMES_DIR).filter((f) => f.endsWith("-color-theme.json"));
const counts = {
  DIRECTIONS: manifest.length,
  "package.json contributes.themes": contributed.length,
  "themes/*-color-theme.json": onDisk.length,
};
if (new Set(Object.values(counts)).size !== 1) {
  throw new Error(`theme count drift: ${JSON.stringify(counts)}. Run "npm run compile" first.`);
}

writeFileSync(join(THEMES_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const summaries = DIRECTIONS.map((spec) => {
  const themeJson = JSON.parse(readFileSync(join(THEMES_DIR, spec.filename), "utf8"));
  return parseThemeSummary(themeJson, spec);
});

const ids = new Set(summaries.map((t) => t.id));
if (ids.size !== summaries.length) throw new Error("duplicate theme ids from parseThemeSummary");
const unknownFamily = summaries.filter((t) => t.family === "NexQL").map((t) => t.id);
if (unknownFamily.length) throw new Error(`themes without a family: ${unknownFamily.join(", ")} (update familyFromId)`);

// Regenerate the public copy so removed themes do not linger.
rmSync(PUBLIC_THEMES, { recursive: true, force: true });
mkdirSync(PUBLIC_THEMES, { recursive: true });
for (const f of onDisk) cpSync(join(THEMES_DIR, f), join(PUBLIC_THEMES, f));
cpSync(join(THEMES_DIR, "manifest.json"), join(PUBLIC_THEMES, "manifest.json"));

mkdirSync(PUBLIC_ASSETS, { recursive: true });
cpSync(join(ROOT, "nexql-theme-logo.png"), join(PUBLIC_ASSETS, "logo.png"));

mkdirSync(GENERATED_DIR, { recursive: true });
writeFileSync(join(GENERATED_DIR, "themes.json"), `${JSON.stringify(summaries)}\n`);

if (!existsSync(join(GENERATED_DIR, "themes.json"))) throw new Error("failed to write themes.json");
console.log(`site build: ${manifest.length} themes → themes/manifest.json, site/public/themes/, site/src/data/generated/themes.json`);

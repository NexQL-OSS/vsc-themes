/**
 * Theme data for every page. The summaries come from parseThemeSummary(), run by
 * scripts/build-site.mjs (which also guards the theme count), so pages render with
 * the real colours of each theme.
 */
import summaries from "./generated/themes.json";

export interface Theme {
  id: string;
  /** Full name as VS Code shows it, e.g. "NexQL Claudy Day". Used in workbench.colorTheme. */
  name: string;
  /** Name without the "NexQL " prefix. */
  short: string;
  family: string;
  light: boolean;
  filename: string;
  uiTheme: string;
  bg: string;
  fg: string;
  panel: string;
  deep: string;
  border: string;
  muted: string;
  accent: string;
  badge: string;
  badgeFg: string;
  sel: string;
  lineHi: string;
  keyword: string;
  func: string;
  typ: string;
  string: string;
  number: string;
  comment: string;
  tag: string;
  operator: string;
  variable: string;
  property: string;
  constant: string;
  parameter: string;
}

/** Order of the gallery. A family missing from here fails the build below. */
export const FAMILY_ORDER = [
  "Claudy",
  "Sage",
  "Postgres",
  "Ember",
  "Drift",
  "Sentinel",
  "Contrast",
  "Circadian",
  "Cognitive Load",
  "Language-Optimized",
  "Security",
  "Seasonal",
  "Mute",
  "OLED",
  "Paper",
  "Break of Dawn",
] as const;

/** One line on what each family is for. */
export const FAMILY_NOTES: Record<string, string> = {
  Claudy: "Warm clay and parchment, day and night.",
  Sage: "Muted greens with a quiet night variant.",
  Postgres: "Blues taken from the elephant, light and dark.",
  Ember: "Warm amber on charcoal, with a daylight twin.",
  Drift: "Cool slate and mist for long sessions.",
  Sentinel: "Prod, staging and dev, each in its own colour, so you know which database you are in.",
  Contrast: "High contrast for low vision, light and dark.",
  Circadian: "Four themes timed to the hours of the day.",
  "Cognitive Load": "Fewer colours (Zen), one accent (Focus) or the whole spectrum.",
  "Language-Optimized": "Tuned for Rust, Python, web and data-pipeline code.",
  Security: "Redacted and Audit Trail, for reviewing sensitive work.",
  Seasonal: "Aurora, Solstice, Harvest and Bloom.",
  Mute: "The NexQL night palette, the same one used across the NexQL sites.",
  OLED: "True black for OLED screens.",
  Paper: "Bright white, printed-page calm.",
  "Break of Dawn": "A pale morning light theme.",
};

/** Day and night twins, as [family label, day id, night id]. */
const FAMILY_PAIRS: Array<[string, string, string]> = [
  ["Claudy", "claudy-day", "claudy-night"],
  ["Sage", "sage-day", "sage-at-night"],
  ["Postgres", "postgres-homage-day", "postgres-homage-dark"],
  ["Ember", "ember-day", "ember-dark"],
  ["Drift", "drift-day", "drift-dark"],
  ["Sentinel Prod", "sentinel-prod-light", "sentinel-prod"],
  ["Sentinel Staging", "sentinel-staging-light", "sentinel-staging"],
  ["Sentinel Dev", "sentinel-dev-light", "sentinel-dev"],
  ["Contrast", "contrast-light", "contrast-dark"],
  ["Circadian", "high-noon", "midnight-oil"],
  ["Security", "audit-trail", "redacted"],
];

const raw = summaries as unknown as Array<Omit<Theme, "short">>;
const familyRank = (f: string) => {
  const i = (FAMILY_ORDER as readonly string[]).indexOf(f);
  if (i < 0) throw new Error(`Unknown theme family "${f}". Add it to FAMILY_ORDER in src/data/themes.ts.`);
  return i;
};

/** All themes in gallery order: by family, then by the order they are built in. */
export const THEMES: Theme[] = raw
  .map((t, i) => ({ t, i }))
  .sort((a, b) => familyRank(a.t.family) - familyRank(b.t.family) || a.i - b.i)
  .map(({ t }) => ({ ...t, short: t.name.replace(/^NexQL /, "") }));

if (THEMES.length === 0) throw new Error("No themes found. Run `node ../scripts/build-site.mjs` first.");

export const THEME_COUNT = THEMES.length;
export const byId = (id: string) => THEMES.find((t) => t.id === id);

export const FAMILIES = FAMILY_ORDER.map((name) => ({
  name,
  note: FAMILY_NOTES[name] ?? "",
  themes: THEMES.filter((t) => t.family === name),
})).filter((f) => f.themes.length > 0);

export const PAIRS = FAMILY_PAIRS.flatMap(([family, dayId, nightId]) => {
  const day = byId(dayId);
  const night = byId(nightId);
  return day && night ? [{ family, day, night }] : [];
});

/** The theme shown before a visitor picks one. */
export const DEFAULT_THEME = byId("mute-dark") ?? THEMES[0];

export const themeHref = (t: Theme) => `/themes/${t.id}/`;
export const dataHref = (t: Theme) => `/themes/${t.filename}`;
export const settingSnippet = (t: Theme) => `"workbench.colorTheme": "${t.name}"`;

/** The matching day/night twin, if the family ships one. */
export function pairOf(t: Theme): Theme | undefined {
  for (const p of PAIRS) {
    if (p.day.id === t.id) return p.night;
    if (p.night.id === t.id) return p.day;
  }
  return undefined;
}

export function neighbours(t: Theme) {
  const i = THEMES.findIndex((x) => x.id === t.id);
  return { prev: THEMES[(i - 1 + THEMES.length) % THEMES.length], next: THEMES[(i + 1) % THEMES.length] };
}

/** CSS custom properties that carry one theme's colours onto a preview surface. */
export const PREVIEW_KEYS = [
  "bg", "fg", "panel", "deep", "border", "muted", "accent", "badge", "badgeFg", "sel", "lineHi",
  "keyword", "func", "typ", "string", "number", "comment", "tag", "operator", "variable", "property", "constant", "parameter",
] as const;

export function previewStyle(t: Theme): string {
  return PREVIEW_KEYS.map((k) => `--p-${k}:${t[k]}`).join(";");
}

/** Compact record sent to the browser for the live preview. */
export function clientTheme(t: Theme) {
  const out: Record<string, string | boolean> = { id: t.id, name: t.name, short: t.short, family: t.family, light: t.light };
  for (const k of PREVIEW_KEYS) out[k] = t[k];
  return out;
}

/** Name and role of every syntax colour, shown in the legend. */
export const SYNTAX_ROLES = [
  { label: "Keyword", key: "keyword", sample: "SELECT" },
  { label: "Function", key: "func", sample: "SUM()" },
  { label: "Type", key: "typ", sample: "orders" },
  { label: "String", key: "string", sample: "'paid'" },
  { label: "Number", key: "number", sample: "1000" },
  { label: "Property", key: "property", sample: "customer_id" },
  { label: "Operator", key: "operator", sample: "=" },
  { label: "Comment", key: "comment", sample: "-- note" },
] as const;

/** The full palette, grouped for the theme page. */
export const PALETTE_GROUPS: Array<{ title: string; items: Array<{ label: string; key: (typeof PREVIEW_KEYS)[number] }> }> = [
  {
    title: "Workbench",
    items: [
      { label: "Editor background", key: "bg" },
      { label: "Editor foreground", key: "fg" },
      { label: "Side bar", key: "panel" },
      { label: "Activity bar", key: "deep" },
      { label: "Borders", key: "border" },
      { label: "Secondary text", key: "muted" },
      { label: "Accent", key: "accent" },
      { label: "Badge", key: "badge" },
      { label: "Badge text", key: "badgeFg" },
      { label: "Selection", key: "sel" },
      { label: "Line highlight", key: "lineHi" },
    ],
  },
  {
    title: "Syntax",
    items: [
      { label: "Keyword", key: "keyword" },
      { label: "Function", key: "func" },
      { label: "Type", key: "typ" },
      { label: "String", key: "string" },
      { label: "Number", key: "number" },
      { label: "Property", key: "property" },
      { label: "Operator", key: "operator" },
      { label: "Comment", key: "comment" },
      { label: "Table / tag", key: "tag" },
      { label: "Variable", key: "variable" },
      { label: "Constant", key: "constant" },
      { label: "Parameter", key: "parameter" },
    ],
  },
];

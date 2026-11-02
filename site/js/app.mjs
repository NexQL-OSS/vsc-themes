import { parseThemeSummary } from "./parse-theme-summary.mjs";

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SANS = "'Space Grotesk', system-ui, sans-serif";
const DEFAULT_THEME_ID = "claudy-day";

const SQL = [
  [["c", "-- Top customers by lifetime revenue"]],
  [],
  [["k", "WITH "], ["v", "revenue "], ["k", "AS "], ["pun", "("]],
  [["pun", "  "], ["k", "SELECT "], ["p", "customer_id"], ["pun", ", "], ["f", "SUM"], ["pun", "("], ["p", "amount"], ["pun", ") "], ["k", "AS "], ["p", "total"]],
  [["pun", "  "], ["k", "FROM "], ["t", "orders"]],
  [["pun", "  "], ["k", "WHERE "], ["p", "status"], ["o", " = "], ["s", "'paid'"]],
  [["pun", "  "], ["k", "GROUP BY "], ["p", "customer_id"]],
  [["pun", ")"]],
  [["k", "SELECT "], ["v", "c"], ["pun", "."], ["p", "name"], ["pun", ", "], ["v", "r"], ["pun", "."], ["p", "total"], ["pun", ", "], ["v", "c"], ["pun", "."], ["p", "created_at"]],
  [["k", "FROM "], ["t", "customers "], ["k", "AS "], ["v", "c"]],
  [["k", "JOIN "], ["t", "revenue "], ["k", "AS "], ["v", "r"], ["k", " ON "], ["v", "r"], ["pun", "."], ["p", "customer_id"], ["o", " = "], ["v", "c"], ["pun", "."], ["p", "id"]],
  [["k", "WHERE "], ["v", "r"], ["pun", "."], ["p", "total"], ["o", " > "], ["n", "1000"]],
  [["k", "ORDER BY "], ["v", "r"], ["pun", "."], ["p", "total"], ["k", " DESC"]],
  [["k", "LIMIT "], ["n", "10"], ["pun", ";"]],
];

const TS = [
  [["k", "import "], ["pun", "{ "], ["v", "db"], ["pun", " } "], ["k", "from "], ["s", '"./client"'], ["pun", ";"]],
  [],
  [["k", "export async function "], ["f", "topCustomers"], ["pun", "("], ["pa", "min"], ["o", " = "], ["n", "1000"], ["pun", ") {"]],
  [["pun", "  "], ["k", "const "], ["v", "rows"], ["o", " = "], ["k", "await "], ["v", "db"], ["pun", "."], ["f", "query"], ["o", "<"], ["t", "Customer"], ["o", ">"], ["pun", "("]],
  [["pun", "    "], ["f", "sql"], ["s", "`SELECT name, total"]],
  [["s", "       FROM revenue WHERE total > "], ["pun", "${"], ["pa", "min"], ["pun", "}`"], ["pun", ");"]],
  [["pun", "  "], ["k", "return "], ["v", "rows"], ["pun", "."], ["f", "filter"], ["pun", "("], ["pa", "r"], ["o", " => "], ["pa", "r"], ["pun", "."], ["p", "total"], ["o", " > "], ["n", "0"], ["pun", ");"]],
  [["pun", "}"]],
];

const MINI = [
  [["k", "SELECT "], ["p", "name"], ["pun", ", "], ["p", "total"]],
  [["k", "FROM "], ["t", "revenue"]],
  [["k", "WHERE "], ["p", "total"], ["o", " > "], ["n", "1000"]],
  [["k", "ORDER BY "], ["p", "total"], ["k", " DESC"]],
];

const ROLE_MAP = {
  c: "comment",
  k: "keyword",
  f: "func",
  t: "typ",
  s: "string",
  n: "number",
  o: "operator",
  p: "property",
  v: "variable",
  x: "constant",
  g: "tag",
  pa: "parameter",
};

const FAMILY_PAIRS = [
  ["Claudy", "claudy-day", "claudy-night"],
  ["Sage", "sage-day", "sage-at-night"],
  ["Postgres", "postgres-homage-day", "postgres-homage-dark"],
  ["Ember", "ember-day", "ember-dark"],
  ["Drift", "drift-day", "drift-dark"],
  ["Sentinel Prod", "sentinel-prod-light", "sentinel-prod"],
  ["Sentinel Staging", "sentinel-staging-light", "sentinel-staging"],
  ["Sentinel Dev", "sentinel-dev-light", "sentinel-dev"],
  ["Contrast (Accessibility)", "contrast-light", "contrast-dark"],
  ["Circadian (Peak/Midnight)", "high-noon", "midnight-oil"],
  ["Security (Audit/Redacted)", "audit-trail", "redacted"],
];

/** @type {HTMLElement | null} */
let root = null;

/** @type {Array<Record<string, unknown>>} */
let themes = [];

/** @type {string[]} */
let order = [];

const state = {
  activeId: null,
  query: "",
  auto: true,
  file: "sql",
  /** @type {"install" | "setting" | null} */
  copied: null,
};

/** @type {ReturnType<typeof setInterval> | null} */
let tourTimer = null;

/** @type {ReturnType<typeof setTimeout> | null} */
let copyTimer = null;

/**
 * @returns {string}
 */
function activeId() {
  return state.activeId ?? DEFAULT_THEME_ID;
}

/**
 * @returns {Record<string, unknown>}
 */
function currentTheme() {
  return themes.find((t) => t.id === activeId()) ?? themes[0];
}

/**
 * @param {Record<string, unknown>} th
 * @param {string} role
 * @returns {string}
 */
function roleColor(th, role) {
  if (role === "plain") return /** @type {string} */ (th.fg);
  if (role === "pun") return /** @type {string} */ (th.muted);
  const key = ROLE_MAP[role];
  return key ? /** @type {string} */ (th[key] ?? th.fg) : /** @type {string} */ (th.fg);
}

/**
 * @param {Record<string, unknown>} th
 * @param {Array<[string, string]>} toks
 * @param {number} index
 * @param {boolean} showNum
 * @returns {HTMLElement}
 */
function codeLine(th, toks, index, showNum) {
  const row = document.createElement("div");
  row.style.minHeight = "1.62em";
  if (showNum) {
    row.className = "code-line-row";
    row.style.display = "flex";
    row.style.gap = "18px";
    const num = document.createElement("span");
    num.className = "code-line-num";
    num.style.cssText = "width:26px;flex:none;text-align:right;opacity:.45;user-select:none";
    num.style.color = /** @type {string} */ (th.muted);
    num.textContent = String(index + 1);
    row.appendChild(num);
  }

  const code = document.createElement("span");
  code.style.whiteSpace = "pre";
  if (toks?.length) {
    for (const [role, text] of toks) {
      const span = document.createElement("span");
      span.style.color = roleColor(th, role);
      if (role === "c" || role === "t") span.style.fontStyle = "italic";
      span.textContent = text;
      code.appendChild(span);
    }
  } else {
    code.innerHTML = "&nbsp;";
  }
  row.appendChild(code);
  return row;
}

/**
 * @param {Record<string, unknown>} th
 * @param {Array<Array<[string, string]>>} doc
 * @param {boolean} showNum
 * @returns {HTMLElement}
 */
function codeBlock(th, doc, showNum) {
  const wrap = document.createElement("div");
  wrap.className = "code-block";
  doc.forEach((line, i) => wrap.appendChild(codeLine(th, line, i, showNum)));
  return wrap;
}

/**
 * @param {string} color
 * @returns {HTMLElement}
 */
function windowDot(color) {
  const dot = document.createElement("span");
  dot.style.cssText = "width:8px;height:8px;border-radius:50%;display:inline-block";
  dot.style.background = color;
  return dot;
}

/**
 * @param {Record<string, unknown>} th
 * @returns {HTMLElement}
 */
function miniWindow(th) {
  const shell = document.createElement("div");
  shell.style.cssText = `background:${th.bg};border-radius:11px;overflow:hidden;border:1px solid ${th.border}`;

  const bar = document.createElement("div");
  bar.style.cssText = `display:flex;align-items:center;gap:6px;padding:9px 12px;background:${th.panel};border-bottom:1px solid ${th.border}`;
  bar.append(windowDot(/** @type {string} */ (th.tag)), windowDot(/** @type {string} */ (th.number)), windowDot(/** @type {string} */ (th.func)));
  const fname = document.createElement("span");
  fname.style.cssText = `margin-left:auto;font-size:11px;font-family:${MONO}`;
  fname.style.color = /** @type {string} */ (th.muted);
  fname.textContent = "query.sql";
  bar.appendChild(fname);

  const body = document.createElement("div");
  body.style.cssText = `padding:13px 14px;font-family:${MONO};font-size:12.5px;line-height:1.72`;
  body.style.color = /** @type {string} */ (th.fg);
  MINI.forEach((line, i) => body.appendChild(codeLine(th, line, i, false)));

  shell.append(bar, body);
  return shell;
}

/**
 * @param {string} q
 * @returns {Array<Record<string, unknown>>}
 */
function filterThemes(q) {
  const needle = (q || "").toLowerCase();
  let list = themes.slice();
  if (/\bdark\b|\bnight\b/.test(needle)) list = list.filter((t) => !t.light);
  if (/\blight\b|\bday\b/.test(needle)) list = list.filter((t) => t.light);
  const words = new Set(needle.split(/[^a-z0-9]+/));
  for (const token of nameTokens()) {
    if (words.has(token)) {
      list = list.filter((t) => themeWords(t).has(token));
    }
  }
  return list;
}

/** Words that the dark/light filter already handles, or that every theme shares. */
const SHARED_WORDS = new Set(["nexql", "dark", "light", "day", "night", "at", "of"]);

/**
 * @param {Record<string, unknown>} th
 * @returns {Set<string>}
 */
function themeWords(th) {
  return new Set(`${th.family} ${th.name}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

/**
 * Every family and name word in the catalog, so new themes are filterable without code changes.
 * @returns {Set<string>}
 */
function nameTokens() {
  const tokens = new Set();
  for (const th of themes) {
    for (const word of themeWords(th)) if (!SHARED_WORDS.has(word)) tokens.add(word);
  }
  return tokens;
}

function applyCssVars() {
  if (!root) return;
  const th = currentTheme();
  const vars = {
    "--bg": th.bg,
    "--fg": th.fg,
    "--panel": th.panel,
    "--deep": th.deep,
    "--border": th.border,
    "--muted": th.muted,
    "--accent": th.accent,
    "--badge": th.badge,
    "--badgeFg": th.badgeFg,
    "--sel": th.sel,
    "--line": th.lineHi,
    "--kw": th.keyword,
    "--fn": th.func,
    "--str": th.string,
    "--num": th.number,
    "--com": th.comment,
    "--tag": th.tag,
    "--typ": th.typ,
    "--prop": th.property,
  };
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, /** @type {string} */ (value));
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", /** @type {string} */ (th.deep ?? th.bg));
}

function setTheme(id) {
  state.activeId = id;
  state.auto = false;
  render();
}

function prevTheme() {
  const i = order.indexOf(activeId());
  state.activeId = order[(i - 1 + order.length) % order.length];
  state.auto = false;
  render();
}

function nextTheme() {
  const i = order.indexOf(activeId());
  state.activeId = order[(i + 1) % order.length];
  state.auto = false;
  render();
}

function toggleAuto() {
  state.auto = !state.auto;
  render();
}

function tickTour() {
  if (!state.auto) return;
  const i = order.indexOf(activeId());
  state.activeId = order[(i + 1) % order.length];
  render();
}

/**
 * @returns {string}
 */
function settingSnippet() {
  return `"workbench.colorTheme": "${currentTheme().name}"`;
}

/**
 * @param {"install" | "setting"} which
 * @param {string} text
 */
async function copyText(which, text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard may be blocked
  }
  state.copied = which;
  render();
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    state.copied = null;
    render();
  }, 1700);
}

function copyInstall() {
  copyText("install", "ext install ric-v.nexql-themes");
}

function copySetting() {
  // Stop the auto-tour so the theme being copied stays on screen.
  state.auto = false;
  copyText("setting", settingSnippet());
}

/**
 * @param {HTMLElement} mount
 */
function renderHeroEditor(mount) {
  const th = currentTheme();
  mount.replaceChildren();

  const shell = document.createElement("div");
  shell.className = "hero-editor";
  shell.style.border = `1px solid ${th.border}`;
  shell.style.background = /** @type {string} */ (th.bg);

  const titleBar = document.createElement("div");
  titleBar.className = "hero-editor-bar";
  titleBar.style.cssText = `gap:8px;padding:13px 16px;background:${th.panel};border-bottom:1px solid ${th.border}`;
  for (const c of [th.tag, th.number, th.func]) {
    const dot = document.createElement("span");
    dot.style.cssText = "width:11px;height:11px;border-radius:50%;display:inline-block;flex:none";
    dot.style.background = /** @type {string} */ (c);
    titleBar.appendChild(dot);
  }
  const name = document.createElement("span");
  name.className = "hero-editor-name";
  name.style.color = /** @type {string} */ (th.muted);
  name.textContent = /** @type {string} */ (th.name);
  titleBar.appendChild(name);

  const tabs = document.createElement("div");
  tabs.className = "hero-editor-tabs";
  tabs.style.background = /** @type {string} */ (th.panel);
  for (const [id, label] of [
    ["sql", "revenue.sql"],
    ["ts", "api.ts"],
  ]) {
    const on = state.file === id;
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "hero-editor-tab";
    tab.style.cssText = `border-right:1px solid ${th.border};border-top:2px solid ${on ? th.accent : "transparent"};background:${on ? th.bg : "transparent"}`;
    tab.style.color = on ? /** @type {string} */ (th.fg) : /** @type {string} */ (th.muted);
    tab.textContent = label;
    tab.addEventListener("click", () => {
      state.file = id;
      render();
    });
    tabs.appendChild(tab);
  }

  const body = document.createElement("div");
  body.className = "hero-editor-body nx-scroll";
  body.style.color = /** @type {string} */ (th.fg);
  body.appendChild(codeBlock(th, state.file === "sql" ? SQL : TS, true));

  const status = document.createElement("div");
  status.className = "hero-editor-status";
  status.style.background = /** @type {string} */ (th.accent);
  status.style.color = /** @type {string} */ (th.badgeFg);
  status.append(
    Object.assign(document.createElement("span"), { textContent: th.light ? "◐ LIGHT" : "● DARK" }),
    Object.assign(document.createElement("span"), { textContent: /** @type {string} */ (th.family), style: "opacity:.85" }),
  );
  const fileLabel = document.createElement("span");
  fileLabel.className = "hero-editor-status-label";
  fileLabel.textContent = state.file === "sql" ? "SQL · PostgreSQL" : "TypeScript";
  status.appendChild(fileLabel);

  shell.append(titleBar, tabs, body, status);
  mount.appendChild(shell);
}

/**
 * @param {HTMLElement} mount
 */
function renderHeaderThemeSwitcher(mount) {
  const cur = activeId();
  mount.replaceChildren();

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "header-theme-step";
  prev.setAttribute("aria-label", "Previous theme");
  prev.textContent = "‹";
  prev.addEventListener("click", prevTheme);

  const rail = document.createElement("div");
  rail.className = "header-theme-rail nx-scroll";
  rail.setAttribute("role", "listbox");
  rail.setAttribute("aria-label", "Themes");

  /** @type {HTMLButtonElement | null} */
  let activePill = null;

  for (const th of themes) {
    const on = th.id === cur;
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `header-theme-pill${on ? " is-active" : ""}`;
    pill.setAttribute("role", "option");
    pill.setAttribute("aria-selected", on ? "true" : "false");
    pill.title = /** @type {string} */ (th.name);

    const dot = document.createElement("span");
    dot.className = "header-theme-pill-dot";
    dot.style.background = /** @type {string} */ (th.accent);

    const label = document.createElement("span");
    label.className = "header-theme-pill-label";
    label.textContent = /** @type {string} */ (th.name).replace("NexQL ", "");

    pill.append(dot, label);
    pill.addEventListener("click", () => setTheme(/** @type {string} */ (th.id)));
    rail.appendChild(pill);
    if (on) activePill = pill;
  }

  const next = document.createElement("button");
  next.type = "button";
  next.className = "header-theme-step";
  next.setAttribute("aria-label", "Next theme");
  next.textContent = "›";
  next.addEventListener("click", nextTheme);

  mount.append(prev, rail, next);

  if (activePill) {
    requestAnimationFrame(() => {
      activePill.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    });
  }
}

/**
 * @param {HTMLElement} mount
 */
function renderSwatchRail(mount) {
  const cur = activeId();
  mount.replaceChildren();
  const row = document.createElement("div");
  row.className = "swatch-rail nx-scroll";

  for (const th of themes) {
    const on = th.id === cur;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `rail-btn swatch-card${on ? " is-active" : ""}`;
    btn.title = /** @type {string} */ (th.name);
    btn.style.cssText = `background:${th.bg};border:1px solid ${on ? th.accent : th.border};box-shadow:${on ? `0 0 0 2px ${th.accent}` : "none"}`;

    const preview = document.createElement("div");
    preview.style.padding = "12px 12px 10px";
    for (const [w, color] of [
      ["68%", th.keyword],
      ["92%", th.func],
      ["54%", th.string],
    ]) {
      const bar = document.createElement("div");
      bar.style.cssText = `height:6px;width:${w};border-radius:3px;margin-bottom:5px;background:${color}`;
      preview.appendChild(bar);
    }

    const foot = document.createElement("div");
    foot.style.cssText = `display:flex;align-items:center;gap:6px;padding:7px 10px;background:${th.panel};border-top:1px solid ${th.border}`;
    const dot = document.createElement("span");
    dot.style.cssText = `width:9px;height:9px;border-radius:50%;flex:none;background:${th.accent}`;
    const label = document.createElement("span");
    label.style.cssText = `font-size:10.5px;font-family:${SANS};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`;
    label.style.color = /** @type {string} */ (th.fg);
    label.textContent = /** @type {string} */ (th.name).replace("NexQL ", "");
    foot.append(dot, label);
    btn.append(preview, foot);
    btn.addEventListener("click", () => setTheme(/** @type {string} */ (th.id)));
    row.appendChild(btn);
  }

  mount.appendChild(row);
}

/**
 * @param {HTMLElement} mount
 */
function renderGallery(mount) {
  const list = filterThemes(state.query);
  const cur = activeId();
  mount.replaceChildren();

  if (!list.length) {
    const empty = document.createElement("div");
    empty.style.cssText = `padding:56px;text-align:center;font-family:${MONO};border:1px dashed var(--border);border-radius:18px`;
    empty.style.color = "var(--muted)";
    empty.textContent = "0 rows returned. Try SELECT * FROM themes;";
    mount.appendChild(empty);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "gallery-grid";

  for (const th of list) {
    const on = th.id === cur;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "gallery-card";
    const inner = document.createElement("div");
    inner.className = `gallery-card-inner${on ? " is-active" : ""}`;

    const meta = document.createElement("div");
    meta.style.cssText = "display:flex;align-items:center;gap:10px";
    const swatch = document.createElement("span");
    swatch.style.cssText = `width:18px;height:18px;border-radius:6px;flex:none;background:${th.accent};box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)`;
    const text = document.createElement("div");
    text.style.minWidth = "0";
    const title = document.createElement("div");
    title.style.cssText = `font-size:14.5px;font-weight:600;font-family:${SANS};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`;
    title.style.color = "var(--fg)";
    title.textContent = /** @type {string} */ (th.name).replace("NexQL ", "");
    const sub = document.createElement("div");
    sub.style.cssText = `font-size:11.5px;font-family:${MONO}`;
    sub.style.color = "var(--muted)";
    sub.textContent = `${th.family} · ${th.light ? "light" : "dark"}`;
    text.append(title, sub);
    const badge = document.createElement("span");
    badge.style.cssText = `margin-left:auto;font-size:11px;font-weight:700;letter-spacing:.05em;font-family:${MONO};white-space:nowrap;color:${on ? "var(--accent)" : "var(--muted)"}`;
    badge.textContent = on ? "● ACTIVE" : "APPLY →";
    meta.append(swatch, text, badge);
    inner.append(miniWindow(th), meta);
    card.appendChild(inner);
    card.addEventListener("click", () => setTheme(/** @type {string} */ (th.id)));
    grid.appendChild(card);
  }

  mount.appendChild(grid);
}

/**
 * @param {HTMLElement} mount
 */
function renderSyntax(mount) {
  const th = currentTheme();
  mount.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "syntax-layout";

  const codeShell = document.createElement("div");
  codeShell.className = "syntax-code-panel";
  codeShell.style.border = `1px solid ${th.border}`;
  codeShell.style.background = /** @type {string} */ (th.bg);
  const bar = document.createElement("div");
  bar.style.cssText = `display:flex;gap:7px;padding:13px 16px;background:${th.panel};border-bottom:1px solid ${th.border}`;
  for (const c of [th.tag, th.number, th.func]) {
    const dot = document.createElement("span");
    dot.style.cssText = "width:10px;height:10px;border-radius:50%";
    dot.style.background = /** @type {string} */ (c);
    bar.appendChild(dot);
  }
  const codeBody = document.createElement("div");
  codeBody.className = "syntax-code-body nx-scroll";
  codeBody.style.color = /** @type {string} */ (th.fg);
  codeBody.appendChild(codeBlock(th, SQL, false));
  codeShell.append(bar, codeBody);

  const legend = document.createElement("div");
  legend.className = "syntax-legend";
  for (const [label, key] of [
    ["Keyword", "keyword"],
    ["Function", "func"],
    ["Type", "typ"],
    ["String", "string"],
    ["Number", "number"],
    ["Property", "property"],
    ["Operator", "operator"],
    ["Comment", "comment"],
  ]) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:var(--panel);border:1px solid var(--border)";
    const sw = document.createElement("span");
    sw.style.cssText = `width:15px;height:15px;border-radius:4px;flex:none;background:${th[key]}`;
    const name = document.createElement("span");
    name.style.cssText = `font-size:13.5px;font-family:${SANS};font-weight:500`;
    name.style.color = "var(--fg)";
    name.textContent = label;
    const hex = document.createElement("span");
    hex.style.cssText = `margin-left:auto;font-size:12px;font-family:${MONO}`;
    hex.style.color = "var(--muted)";
    hex.textContent = String(th[key]).toUpperCase();
    row.append(sw, name, hex);
    legend.appendChild(row);
  }

  wrap.append(codeShell, legend);
  mount.appendChild(wrap);
}

/**
 * FAMILY_PAIRS whose two themes are both in the manifest.
 * @returns {Array<{ family: string, day: Record<string, unknown>, night: Record<string, unknown> }>}
 */
function familyPairs() {
  const pairs = [];
  for (const [family, dayId, nightId] of FAMILY_PAIRS) {
    const day = themes.find((t) => t.id === dayId);
    const night = themes.find((t) => t.id === nightId);
    if (day && night) pairs.push({ family, day, night });
  }
  return pairs;
}

/**
 * @param {HTMLElement} mount
 */
function renderCompare(mount) {
  mount.replaceChildren();
  const grid = document.createElement("div");
  grid.className = "compare-grid";

  for (const { family, day, night } of familyPairs()) {

    const card = document.createElement("div");
    card.className = "compare-family";
    const head = document.createElement("div");
    head.style.cssText = "display:flex;align-items:baseline;gap:10px;margin-bottom:14px";
    const title = document.createElement("span");
    title.style.cssText = `font-size:19px;font-weight:700;font-family:${SANS}`;
    title.style.color = "var(--fg)";
    title.textContent = family;
    const sub = document.createElement("span");
    sub.style.cssText = `font-size:12px;font-family:${MONO}`;
    sub.style.color = "var(--muted)";
    sub.textContent = day.light === night.light ? "a matched pair" : "day / night";
    head.append(title, sub);

    const panes = document.createElement("div");
    panes.className = "compare-panes";
    for (const th of [day, night]) {
      const tag = th.light ? "LIGHT" : "DARK";
      const pane = document.createElement("button");
      pane.type = "button";
      pane.className = "compare-pane";
      const label = document.createElement("div");
      label.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--panel)";
      const tagEl = document.createElement("span");
      tagEl.style.cssText = `font-size:11px;font-weight:700;letter-spacing:.1em;font-family:${MONO}`;
      tagEl.style.color = "var(--muted)";
      tagEl.textContent = tag;
      const dot = document.createElement("span");
      dot.style.cssText = `margin-left:auto;width:10px;height:10px;border-radius:50%;background:${th.accent}`;
      label.append(tagEl, dot);
      const win = document.createElement("div");
      win.style.padding = "10px";
      win.appendChild(miniWindow(th));
      pane.append(label, win);
      pane.addEventListener("click", () => setTheme(/** @type {string} */ (th.id)));
      panes.appendChild(pane);
    }

    card.append(head, panes);
    grid.appendChild(card);
  }

  mount.appendChild(grid);
}

function render() {
  if (!root || !themes.length) return;
  applyCssVars();

  const th = currentTheme();
  const shortName = /** @type {string} */ (th.name).replace("NexQL ", "");

  const themeNameEls = root.querySelectorAll("[data-theme-name]");
  themeNameEls.forEach((el) => {
    el.textContent = shortName;
  });

  const kindLabel = root.querySelector("[data-kind-label]");
  if (kindLabel) kindLabel.textContent = th.light ? "LIGHT" : "DARK";

  const autoLabel = root.querySelector("[data-auto-label]");
  if (autoLabel) autoLabel.textContent = state.auto ? "On" : "Off";

  const countEl = root.querySelector("[data-theme-count]");
  if (countEl) countEl.textContent = String(filterThemes(state.query).length);

  root.querySelectorAll("[data-theme-total]").forEach((el) => {
    el.textContent = String(themes.length);
  });

  const pairCount = root.querySelector("[data-pair-count]");
  if (pairCount) pairCount.textContent = String(familyPairs().length);

  const copyLabel = root.querySelector("[data-copy-label]");
  if (copyLabel) {
    copyLabel.textContent = state.copied === "install" ? "Copied to clipboard ✓" : "ext install ric-v.nexql-themes";
  }

  const settingLabel = root.querySelector("[data-setting-label]");
  if (settingLabel) {
    settingLabel.textContent = state.copied === "setting" ? "Copied to clipboard ✓" : settingSnippet();
  }

  const queryInput = /** @type {HTMLInputElement | null} */ (root.querySelector("[data-query-input]"));
  if (queryInput && queryInput.value !== state.query) queryInput.value = state.query;

  renderHeaderThemeSwitcher(/** @type {HTMLElement} */ (root.querySelector("#header-theme-switcher")));
  renderHeroEditor(/** @type {HTMLElement} */ (root.querySelector("#hero-editor")));
  renderSwatchRail(/** @type {HTMLElement} */ (root.querySelector("#swatch-rail")));
  renderGallery(/** @type {HTMLElement} */ (root.querySelector("#gallery-grid")));
  renderSyntax(/** @type {HTMLElement} */ (root.querySelector("#syntax-block")));
  renderCompare(/** @type {HTMLElement} */ (root.querySelector("#family-compare")));
}

function wireControls() {
  root?.querySelector("[data-prev-theme]")?.addEventListener("click", prevTheme);
  root?.querySelector("[data-next-theme]")?.addEventListener("click", nextTheme);
  root?.querySelector("[data-toggle-auto]")?.addEventListener("click", toggleAuto);
  root?.querySelector("[data-copy-install]")?.addEventListener("click", copyInstall);
  root?.querySelector("[data-copy-setting]")?.addEventListener("click", copySetting);

  const queryInput = /** @type {HTMLInputElement | null} */ (root?.querySelector("[data-query-input]"));
  queryInput?.addEventListener("input", (e) => {
    state.query = /** @type {HTMLInputElement} */ (e.target).value;
    render();
  });

  const presets = [
    ["SELECT *", "SELECT * FROM themes"],
    ["type = 'dark'", "WHERE type = 'dark'"],
    ["type = 'light'", "WHERE type = 'light'"],
    ["family = 'Claudy'", "WHERE family = 'Claudy'"],
    ["family = 'Sentinel'", "WHERE family = 'Sentinel'"],
    ["family = 'Seasonal'", "WHERE family = 'Seasonal'"],
    ["name LIKE 'Postgres%'", "WHERE name LIKE 'Postgres%'"],
    ["clear", ""],
  ];
  const presetMount = root?.querySelector("[data-query-presets]");
  if (presetMount) {
    presetMount.replaceChildren();
    for (const [label, query] of presets) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shell-btn";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        state.query = query;
        render();
      });
      presetMount.appendChild(btn);
    }
  }
}

async function loadThemes() {
  const specs = await fetch("/themes/manifest.json").then((r) => {
    if (!r.ok) throw new Error(`manifest.json ${r.status}`);
    return r.json();
  });

  themes = await Promise.all(
    specs.map(async (spec) => {
      const json = await fetch(`/themes/${spec.filename}`).then((r) => {
        if (!r.ok) throw new Error(`${spec.filename} ${r.status}`);
        return r.json();
      });
      return parseThemeSummary(json, spec);
    }),
  );

  order = themes.map((t) => /** @type {string} */ (t.id));
  if (!order.includes(activeId())) state.activeId = order[0] ?? null;
}

async function main() {
  root = document.getElementById("nx-root");
  if (!root) throw new Error("#nx-root missing");

  try {
    await loadThemes();
  } catch (err) {
    root.innerHTML = `<p style="padding:2rem;font-family:monospace;color:#e85fbf">Failed to load themes: ${err instanceof Error ? err.message : String(err)}</p>`;
    return;
  }

  wireControls();
  render();
  if (tourTimer) clearInterval(tourTimer);
  tourTimer = setInterval(tickTour, 4200);
}

main();

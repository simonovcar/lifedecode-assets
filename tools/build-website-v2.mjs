// Builds ludo78.js (Website V2) from tools/ludo78.src.js + the functional
// core of ludo77.js, copied verbatim so auth / Supabase / support / XP code
// is byte-identical to production.
//
//   node tools/build-website-v2.mjs          # build ludo78.js
//   node tools/build-website-v2.mjs --check  # verify ludo78.js core == ludo77.js core
//
// Chunks are located by their opening and closing lines (not line numbers),
// so the build fails loudly if ludo77.js is ever edited in a way that moves them.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = readFileSync(join(root, "ludo77.js"), "utf8");
const TEMPLATE = join(root, "tools", "ludo78.src.js");
const OUT = join(root, "ludo78.js");

const LINES = SOURCE.split("\n");

// Returns LINES[from..to] (inclusive) where `from` is the first line that
// starts with `start`, and `to` is the first line at/after it for which
// isEnd(line, index) is true. Throws if either boundary is missing.
function span(name, start, isEnd, extra = 0) {
  const from = LINES.findIndex((l) => l.startsWith(start));
  if (from < 0) throw new Error(`[${name}] start not found: ${start}`);
  const to = LINES.findIndex((l, i) => i >= from && isEnd(l, i));
  if (to < 0) throw new Error(`[${name}] end not found`);
  return LINES.slice(from, to + 1 + extra).join("\n");
}
const is = (text) => (l) => l === text;

const CHUNKS = {
  CORE_READY: span("CORE_READY", "  function ready(fn) {", is("  }")),
  // injectCSS() + buildAuthMotesHtml() + render(); render ends "    }, 250);" then "  }".
  CORE_RENDER: span("CORE_RENDER", "  function injectCSS() {", (l, i) => l === "    }, 250);" && LINES[i + 1] === "  }", 1),
  // loadSupabaseScript() ... bindSupportWidget() + the BACKEND TODO comment block.
  CORE_SYSTEMS: span("CORE_SYSTEMS", "  function loadSupabaseScript() {", (l, i) => l.startsWith("  // ----") && LINES[i - 1].includes("Never commit this key to the repo.")),
  CORE_HEADER: span("CORE_HEADER", "  function bindHeaderScrollState() {", is("  }")),
  CORE_ERROR: span("CORE_ERROR", '  window.addEventListener("error", (event) => {', is("  });")),
  // Presentation pieces reused as-is: shared button + auth modal + support widget CSS, and their markup.
  CSS_LEGACY: span("CSS_BTN", ".ldw_btn,.ldw_linkbtn{", (l) => l.startsWith(".ldw_btn_ghost_sm{")) + "\n" +
    span("CSS_AUTH", "/* Auth modal (functionality untouched", (l) => l.startsWith("@media(max-width:480px){.ldw_support{")),
  HTML_MODALS: span("HTML_MODALS", '<div class="ldw_auth_modal" id="ldw_auth_modal"', (l, i) => l === "</div>" && LINES[i + 1] === "`;")
};

// Markup-only accessibility labels added to the reused modal HTML. IDs,
// classes and structure stay identical, so bind() works unchanged.
const MODAL_A11Y = [
  ['<input class="ldw_input" id="ldw_email" type="email"', '<input class="ldw_input" id="ldw_email" aria-label="Email" type="email"'],
  ['<input class="ldw_input" id="ldw_password" type="password"', '<input class="ldw_input" id="ldw_password" aria-label="Password" type="password"']
];

// Functional chunks that must stay byte-identical to ludo77.js.
const VERBATIM = ["CORE_READY", "CORE_RENDER", "CORE_SYSTEMS", "CORE_HEADER", "CORE_ERROR"];

function build() {
  let out = readFileSync(TEMPLATE, "utf8");
  let modals = CHUNKS.HTML_MODALS;
  for (const [from, to] of MODAL_A11Y) {
    if (!modals.includes(from)) throw new Error("modal a11y anchor missing: " + from);
    modals = modals.replace(from, to);
  }
  // Generated content (tools/build-skin-assets.py): the full-character skin roster.
  const SKIN_ROSTER = readFileSync(join(root, "tools", "generated", "skin-roster.js"), "utf8").trimEnd();
  const values = { ...CHUNKS, HTML_MODALS: modals, SKIN_ROSTER };
  for (const [key, value] of Object.entries(values)) {
    const marker = "/*@@" + key + "@@*/";
    if (!out.includes(marker)) throw new Error("marker missing in template: " + marker);
    out = out.split(marker).join(value);
  }
  if (/\/\*@@[A-Z_]+@@\*\//.test(out)) throw new Error("unreplaced marker left in output");
  writeFileSync(OUT, out);
  console.log("Built", OUT, out.length, "bytes");
}

function check() {
  const built = readFileSync(OUT, "utf8");
  let ok = true;
  for (const key of VERBATIM) {
    const present = built.includes(CHUNKS[key]);
    console.log((present ? "OK   " : "FAIL ") + key + " (" + CHUNKS[key].split("\n").length + " lines)");
    if (!present) ok = false;
  }
  const guard = 'if (path.includes("/terms") || path.includes("/policy") || path.includes("/privacy") || path.includes("/support")) {';
  const guardOk = built.includes(guard) && SOURCE.includes(guard);
  console.log((guardOk ? "OK   " : "FAIL ") + "ROUTE_GUARD");
  if (!guardOk) ok = false;
  // Every ID that bind()/bindSupportWidget()/updateAuthUI() look up must
  // exist in the V2 markup.
  const ids = new Set();
  for (const key of ["CORE_SYSTEMS", "CORE_HEADER"]) {
    for (const m of CHUNKS[key].matchAll(/getElementById\("([^"]+)"\)/g)) ids.add(m[1]);
  }
  const missing = [...ids].filter((id) => !built.includes('id="' + id + '"'));
  console.log((missing.length ? "FAIL " : "OK   ") + "DOM_IDS (" + ids.size + " referenced" + (missing.length ? ", missing: " + missing.join(", ") : "") + ")");
  if (missing.length) ok = false;
  // Pre-deploy reminder (non-fatal): GitHub main is not proof of what is
  // deployed, so every "Available now" roadmap claim must be checked on
  // world.lifedecode.app and marked liveVerified: true before launch.
  const unverified = [...built.matchAll(/\{ status: "live"(?![^\n]*liveVerified: true)[^\n]*title: "([^"]+)"/g)].map((m) => m[1]);
  console.log((unverified.length ? "WARN " : "OK   ") + "LIVE_VERIFIED (" + (unverified.length ? unverified.length + " \"Available now\" claims not yet verified on the live game: " + unverified.join(", ") : "all verified") + ")");
  if (!ok) process.exit(1);
}

if (process.argv.includes("--check")) check();
else { build(); check(); }

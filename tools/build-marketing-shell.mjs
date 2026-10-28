// Build a Website V2 version of the production lifedecode.app shell
// (lifedecode-game/marketing-site) WITHOUT touching the game repo: it reads
// that folder and writes a modified copy somewhere else.
//
//   node tools/build-marketing-shell.mjs --from <lifedecode-game>/marketing-site \
//        --sha <40-char lifedecode-assets commit> --mode staging|release --out <dir>
//        [--script-base <url>]   (local testing only, e.g. http://127.0.0.1:8934/)
//
// Writes <out>.index-html.diff next to <out> for review.
//
// Both modes change exactly two things in index.html: the loader line
// (ludo77.js @main + Date.now() -> ludo78.js pinned to an immutable commit)
// and the <head> SEO / social metadata. "staging" additionally keeps the
// copy out of search engines (noindex meta + X-Robots-Tag, robots.txt
// Disallow, no sitemap, no www redirect) and shows a small STAGING ribbon.
// The tool refuses to run if the production shell no longer matches what it
// expects, so a changed shell gets reviewed by hand instead of patched blind.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const arg = (name) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : null; };
const FROM = arg("from"), SHA = arg("sha"), MODE = arg("mode"), OUT = arg("out"), SCRIPT_BASE = arg("script-base");
function fail(msg) { console.error("ERROR: " + msg); process.exit(1); }
if (!FROM || !OUT || !["staging", "release"].includes(MODE)) fail("usage: --from <marketing-site> --sha <commit> --mode staging|release --out <dir> [--script-base <url>]");
if (!SCRIPT_BASE && !/^[0-9a-f]{40}$/.test(SHA || "")) fail("--sha must be a full 40-character commit SHA (immutable jsDelivr ref)");
if (SCRIPT_BASE && MODE === "release") fail("--script-base is for local testing only, not for a release shell");
if (!existsSync(join(FROM, "index.html"))) fail("no index.html in " + FROM);

const CDN = "https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@" + SHA + "/";
const BASE = SCRIPT_BASE || CDN;
const OG_IMAGE = BASE + "assets/v2/og-website-v2-1200x630.jpg";

// Release metadata. Claims stay within what the page itself says; no counts
// that depend on unverified production state.
const META = {
  title: "LifeDecode World — A free social fantasy world in your browser",
  description: "Explore a strange, hand-painted world, meet ridiculous locals and real players, train in the Dojo and level up your spirit. Free to play, right in your browser.",
  ogTitle: "LifeDecode World",
  ogDescription: "A strange, cozy social world in your browser. Explore, meet ridiculous locals and real players, and level up your spirit. Free to play.",
  ogImageAlt: "LifeDecode World: glowing spirit characters in neon cowboy, ninja, pirate and princess outfits, with the tagline Your life. Your story. Your world."
};

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });
cpSync(FROM, OUT, { recursive: true });

let html = readFileSync(join(OUT, "index.html"), "utf8");
const original = html;
function swap(re, replacement, what) {
  const hits = html.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"));
  if (!hits || hits.length !== 1) fail("production shell changed - expected exactly one " + what + " (found " + (hits ? hits.length : 0) + "); review by hand");
  html = html.replace(re, replacement);
}
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// 1. Loader: pinned ludo78.js; the Date.now() cache-buster is dropped (a commit
//    URL never changes, so browsers and jsDelivr may cache it for good).
swap(/s\.src = "https:\/\/cdn\.jsdelivr\.net\/gh\/simonovcar\/lifedecode-assets@main\/ludo77\.js\?v=" \+ Date\.now\(\);/,
  's.src = "' + BASE + 'ludo78.js";', "ludo77.js loader line");
swap(/    \/\/ Approved homepage redesign, promoted to production\.[\s\S]*?\n(    \(function \(\) \{)/,
  "    // Website V2 (ludo78.js), pinned to an immutable lifedecode-assets commit\n" +
  "    // so the script and its assets/v2 art always come from the same ref.\n" +
  "    // Rollback: restore the previous line,\n" +
  "    //   https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/ludo77.js?v=\" + Date.now()\n" +
  "    // (ludo77.js is unchanged on lifedecode-assets main).\n$1", "loader comment");

// 2. SEO / social metadata.
swap(/<title>[^<]*<\/title>/, "<title>" + META.title + "</title>", "<title>");
swap(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + attr(META.description) + '">', "meta description");
swap(/<meta property="og:title" content="[^"]*">/, '<meta property="og:site_name" content="LifeDecode World">\n  <meta property="og:title" content="' + attr(META.ogTitle) + '">', "og:title");
swap(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + attr(META.ogDescription) + '">', "og:description");
swap(/<meta property="og:image" content="[^"]*">/,
  '<meta property="og:image" content="' + OG_IMAGE + '">\n  <meta property="og:image:type" content="image/jpeg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="' + attr(META.ogImageAlt) + '">', "og:image");
swap(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + attr(META.ogTitle) + '">', "twitter:title");
swap(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + attr(META.ogDescription) + '">', "twitter:description");
swap(/<meta name="twitter:image" content="[^"]*">/, '<meta name="twitter:image" content="' + OG_IMAGE + '">\n  <meta name="twitter:image:alt" content="' + attr(META.ogImageAlt) + '">', "twitter:image");
swap(/<link rel="canonical" href="https:\/\/lifedecode\.app\/">/, '<link rel="canonical" href="https://lifedecode.app/">\n  <meta name="theme-color" content="#03020a">', "canonical link");

if (MODE === "staging") {
  // Never indexed, never mistaken for production. The ribbon sits on <html>
  // because ludo78.js hides every other <body> child when it renders.
  swap(/<meta name="viewport" content="[^"]*">/, (m) => m + '\n  <meta name="robots" content="noindex, nofollow">', "viewport meta");
  swap(/<\/style>\n<\/head>/, '    html::after { content: "STAGING · not lifedecode.app"; position: fixed; left: 50%; bottom: 0; transform: translateX(-50%); z-index: 2147483647; padding: 4px 12px; border-radius: 8px 8px 0 0; background: #f4c76b; color: #140c02; font: 700 11px/1.4 Arial, sans-serif; letter-spacing: .08em; pointer-events: none; }\n  </style>\n</head>', "shell </style></head>");
  writeFileSync(join(OUT, "_headers"), "/*\n  X-Robots-Tag: noindex, nofollow\n");
  writeFileSync(join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");
  for (const f of ["sitemap.xml", "_redirects"]) if (existsSync(join(OUT, f))) rmSync(join(OUT, f));
}
writeFileSync(join(OUT, "index.html"), html);

// Release: index.html must be the only changed file.
if (MODE === "release") {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  const changed = walk(OUT).map((f) => relative(OUT, f)).filter((f) => !readFileSync(join(OUT, f)).equals(readFileSync(join(FROM, f))));
  if (changed.join() !== "index.html") fail("release shell must differ only in index.html, got: " + changed.join(", "));
}
let diff = "";
try { execFileSync("diff", ["-u", join(FROM, "index.html"), join(OUT, "index.html")]); } catch (e) { diff = String(e.stdout || ""); }
const DIFF = OUT.replace(/\/+$/, "") + ".index-html.diff";
writeFileSync(DIFF, diff);
console.log("Built " + MODE + " shell in " + OUT + "\n  loader: " + BASE + "ludo78.js\n  og:image: " + OG_IMAGE +
  "\n  diff: " + DIFF + " (" + diff.split("\n").filter((l) => /^[+-][^+-]/.test(l)).length + " changed lines)" + (original === html ? "\n  WARNING: nothing changed" : ""));

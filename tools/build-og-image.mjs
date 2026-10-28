// Build the Website V2 social preview card (Open Graph / Twitter, 1200x630)
// from the hero key art already in this repo, with the site's own brand
// lockup and fonts. Renders with the pre-installed Playwright Chromium.
//
//   node tools/build-og-image.mjs
//
// Output: assets/v2/og-website-v2-1200x630.jpg (the older un-branded
// assets/v2/og-1200x630.jpg is kept as-is). Needs fonts.googleapis.com;
// without it the card falls back to Georgia/Arial - check the result.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, statSync } from "node:fs";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Inlined: a setContent() page cannot read file:// URLs.
const art = "data:image/webp;base64," + readFileSync(join(root, "assets/v2/keyart-1536.webp")).toString("base64");
const out = join(root, "assets/v2/og-website-v2-1200x630.jpg");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@500;600&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#05061a;}
  .card{position:relative;width:1200px;height:630px;}
  .art{position:absolute;inset:0;background:url("${art}") 62% 40%/cover no-repeat;}
  .shade{position:absolute;inset:0;background:
    linear-gradient(90deg,rgba(5,6,26,.94) 0%,rgba(5,6,26,.82) 30%,rgba(5,6,26,.25) 58%,rgba(5,6,26,0) 72%),
    linear-gradient(0deg,rgba(5,6,26,.7) 0%,rgba(5,6,26,0) 32%);}
  .copy{position:absolute;left:72px;top:0;bottom:0;width:520px;display:flex;flex-direction:column;justify-content:center;}
  .brand{font-family:Cinzel,Georgia,serif;font-weight:700;font-size:62px;letter-spacing:.14em;color:#fff;line-height:1;text-shadow:0 0 28px rgba(180,140,255,.55);}
  .sub{margin-top:12px;font-family:Cinzel,Georgia,serif;font-weight:600;font-size:22px;letter-spacing:.62em;color:#f4c76b;padding-left:4px;}
  .line{margin:34px 0 0;width:120px;height:2px;background:linear-gradient(90deg,#f4c76b,rgba(244,199,107,0));}
  .tag{margin-top:26px;font-family:Inter,Arial,sans-serif;font-weight:600;font-size:30px;line-height:1.3;color:#fff;}
  .micro{margin-top:16px;font-family:Inter,Arial,sans-serif;font-weight:500;font-size:20px;letter-spacing:.04em;color:rgba(232,228,255,.82);}
</style></head><body><div class="card"><div class="art"></div><div class="shade"></div>
<div class="copy"><div class="brand">LIFEDECODE</div><div class="sub">WORLD</div><div class="line"></div>
<div class="tag">Your life. Your story.<br>Your world.</div><div class="micro">Free to play · Right in your browser</div></div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
await page.screenshot({ path: out, type: "jpeg", quality: 86 });
await browser.close();
console.log("Wrote", out, statSync(out).size, "bytes; fonts loaded:", [...new Set(fonts)].join(", ") || "none (fallback)");

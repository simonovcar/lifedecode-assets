// Stress test for the two stage galleries (skins + world): rapid input
// while preview images load slowly, out of order, or fail.
//
//   node tools/qa-gallery-stress.mjs [outDir]
//
// Needs the preview server (python3 -m http.server 8934 from the repo root);
// QA_BASE / QA_PAGE work as in qa-website-v2.mjs. Large preview images are
// served through a throttling route; every animation frame the page records
// how many stage images are visible (not .is-hidden). Each scenario passes
// only if, at every frame, exactly ONE image was visible (no overlap, no
// blank stage), and once settled the stage holds a single loaded image that
// matches the selected thumbnail and the caption.
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = process.env.QA_BASE || "http://127.0.0.1:8934";
const PAGE = process.env.QA_PAGE || "/preview/website-v2.html";
const OUT = process.argv[2] || "qa-stress-out";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844, mobile: true },
  { name: "mobile-360", width: 360, height: 800, mobile: true }
];
const BIG = /\/assets\/v2\/(skins\/[a-z0-9-]+-(1200|600)|world\/loc-[a-z0-9-]+-(320|640|1280))\.webp/;

// Deterministic pseudo-random delays, so a failure can be replayed.
function rng(seed) { return () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); }

const SKIN = { media: ".v2_sk_media", name: "ldv2_sk_name", next: "#ldv2_sk_next", prev: "#ldv2_sk_prev" };
const WORLD = { media: ".v2_stage_media", name: "ldv2_stage_name", next: "#ldv2_stage_next", prev: "#ldv2_stage_prev" };

async function scenario(browser, vp, title, gallery, opts, act) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const rand = rng(opts.seed || 7);
  let n = 0;
  await page.route(BIG, async (route) => {
    const url = route.request().url();
    const i = n++;
    if (opts.fail && opts.fail.test(url)) return route.abort();
    const ms = opts.mode === "reverse" ? Math.max(0, 1600 - i * 90) : Math.floor(rand() * (opts.max || 1200));
    await new Promise((r) => setTimeout(r, ms));
    try { await route.continue(); } catch (e) { /* page moved on */ }
  });
  await page.goto(BASE + PAGE, { waitUntil: "load" });
  const sec = gallery === SKIN ? "#ldv2_spirit" : "#ldv2_world";
  await page.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: "instant", block: "center" }), sec);
  await page.waitForFunction((m) => { const im = document.querySelector(m + " img:not(.is-hidden)"); return im && im.complete && im.naturalWidth > 0; }, gallery.media, { timeout: 15000 });
  // Frame sampler: visible-image count on every frame.
  await page.evaluate((m) => {
    const st = (window.__ldStress = { frames: 0, minVisible: 99, maxVisible: 0, maxImgs: 0 });
    (function tick() {
      const media = document.querySelector(m);
      const vis = media.querySelectorAll(":scope > img:not(.is-hidden)").length;
      st.frames++; st.minVisible = Math.min(st.minVisible, vis); st.maxVisible = Math.max(st.maxVisible, vis);
      st.maxImgs = Math.max(st.maxImgs, media.querySelectorAll(":scope > img").length);
      if (!st.stop) requestAnimationFrame(tick);
    })();
  }, gallery.media);

  let actError = null;
  try { await act(page); } catch (e) { actError = e.message; }

  // Settle: every throttled request answered + the 0.5-0.65 s fade done.
  await page.waitForTimeout((opts.max || 1700) + 1200);
  const res = await page.evaluate(({ m, nameId, isSkin }) => {
    window.__ldStress.stop = true;
    const media = document.querySelector(m);
    const imgs = Array.from(media.querySelectorAll(":scope > img"));
    const vis = imgs.filter((i) => !i.classList.contains("is-hidden"));
    let selected;
    if (isSkin) {
      const panel = Array.from(document.querySelectorAll(".v2_sk_panel")).find((p) => !p.hidden);
      const t = panel && panel.querySelector('.v2_sk_thumb[aria-selected="true"]');
      selected = t && t.getAttribute("data-skin");
    } else {
      const t = document.querySelector('.v2_thumb[aria-selected="true"]');
      selected = t && t.id.replace("ldv2_loc_tab_", "");
    }
    const src = vis[0] ? vis[0].currentSrc || vis[0].src : "";
    const caption = document.getElementById(nameId).textContent;
    return { stats: window.__ldStress, imgsAfter: imgs.length, visibleAfter: vis.length, loaded: !!(vis[0] && vis[0].naturalWidth > 0), selected, src: src.split("/").pop(), matches: !!selected && src.includes(isSkin ? "/" + selected + "-" : "loc-" + selected + "-"), caption };
  }, { m: gallery.media, nameId: gallery.name, isSkin: gallery === SKIN });
  const problems = [];
  if (res.stats.maxVisible > 1) problems.push("overlap: " + res.stats.maxVisible + " images visible at once");
  if (res.stats.minVisible < 1) problems.push("blank stage on some frame");
  if (res.visibleAfter !== 1 || res.imgsAfter !== 1) problems.push("after settle: " + res.imgsAfter + " images, " + res.visibleAfter + " visible");
  if (!res.loaded) problems.push("visible image not loaded");
  if (!res.matches) problems.push("visible image " + res.src + " does not match selection " + res.selected);
  if (opts.check) problems.push(...opts.check(res));
  if (actError) problems.push(actError);
  if (errors.length) problems.push("page errors: " + errors.join(" | "));
  await page.screenshot({ path: `${OUT}/${vp.name}-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.jpg`, type: "jpeg", quality: 70, clip: await page.evaluate((m) => { const r = document.querySelector(m).closest(".v2_sk_stage, .v2_stage").getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(r.width, innerWidth), height: Math.min(r.height, innerHeight - Math.max(0, r.top)) }; }, gallery.media) });
  await ctx.close();
  return { viewport: vp.name, scenario: title, pass: problems.length === 0, problems, frames: res.stats.frames, maxVisible: res.stats.maxVisible, minVisible: res.stats.minVisible, maxImgs: res.stats.maxImgs, final: res.caption + " (" + res.src + ")" };
}

// Fires DOM clicks on a selector N times, `gap` ms apart, inside the page:
// faster and more uniform than driver-level clicks.
const burst = (page, sel, times, gap) => page.evaluate(({ sel, times, gap }) => new Promise((done) => {
  let i = 0;
  (function go() { if (i++ >= times) return done(); document.querySelector(sel).click(); setTimeout(go, gap); })();
}), { sel, times, gap });

const browser = await chromium.launch();
const results = [];
for (const vp of VIEWPORTS) {
  results.push(await scenario(browser, vp, "skins rapid next x24 (random delays)", SKIN, { seed: 11 }, (p) => burst(p, SKIN.next, 24, 35)));
  results.push(await scenario(browser, vp, "skins rapid prev x15 (reverse-order loading)", SKIN, { mode: "reverse" }, (p) => burst(p, SKIN.prev, 15, 30)));
  results.push(await scenario(browser, vp, "skins next/prev zig-zag", SKIN, { seed: 5 }, async (p) => {
    for (let i = 0; i < 10; i++) { await burst(p, SKIN.next, 2, 20); await burst(p, SKIN.prev, 1, 20); }
  }));
  results.push(await scenario(browser, vp, "skins keyboard arrows x20", SKIN, { seed: 3 }, async (p) => {
    await p.focus('#ldv2_sk_panel_wave-1 .v2_sk_thumb[aria-selected="true"]');
    for (let i = 0; i < 20; i++) { await p.keyboard.press(i % 7 === 6 ? "ArrowLeft" : "ArrowRight"); await p.waitForTimeout(25); }
  }));
  results.push(await scenario(browser, vp, "skins wave switching storm", SKIN, { seed: 23 }, async (p) => {
    for (const col of ["wave-2", "wave-3", "wave-1", "wave-3", "wave-2"]) {
      await p.evaluate((c) => document.getElementById("ldv2_sk_col_" + c).click(), col);
      await burst(p, SKIN.next, 3, 30);
    }
  }));
  if (vp.mobile) {
    results.push(await scenario(browser, vp, "skins swipe strip + rapid taps", SKIN, { seed: 31 }, async (p) => {
      await p.evaluate(() => document.getElementById("ldv2_sk_col_wave-3").click());
      await p.waitForTimeout(300);
      for (let i = 0; i < 8; i++) {
        await p.evaluate((k) => { const g = document.querySelector("#ldv2_sk_panel_wave-3 .v2_sk_grid"); g.scrollLeft = k * 90; }, i);
        const id = await p.evaluate((k) => document.querySelectorAll("#ldv2_sk_panel_wave-3 .v2_sk_thumb")[(k * 3) % 22].id, i);
        await p.tap("#" + id);
      }
    }));
  }
  results.push(await scenario(browser, vp, "skins image fails to load", SKIN, { fail: /\/skins\/clockwork-soul-/, max: 300, check: (r) => (r.src === "clockwork-soul-thumb.webp" ? [] : ["expected the thumbnail fallback, got " + r.src]) }, async (p) => {
    await p.click("#ldv2_sk_clockwork-soul");
  }));
  results.push(await scenario(browser, vp, "skins rapid next x30, instant loads", SKIN, { max: 1 }, (p) => burst(p, SKIN.next, 30, 16)));
  // Cross-fade preserved: after one click the outgoing image must pass
  // through intermediate opacity while the new one fades in.
  results.push(await scenario(browser, vp, "skins single click keeps the cross-fade", SKIN, { max: 1 }, async (p) => {
    const seen = await p.evaluate(() => new Promise((done) => {
      const media = document.querySelector(".v2_sk_media");
      const vals = [];
      document.getElementById("ldv2_sk_next").click();
      const t0 = performance.now();
      (function tick() {
        media.querySelectorAll(":scope > img").forEach((im) => vals.push(+getComputedStyle(im).opacity));
        if (performance.now() - t0 < 700) requestAnimationFrame(tick); else done(vals);
      })();
    }));
    if (!seen.some((v) => v > 0.1 && v < 0.9)) throw new Error("no cross-fade frames");
  }));
  results.push(await scenario(browser, vp, "world rapid next x15 (random delays)", WORLD, { seed: 17 }, (p) => burst(p, WORLD.next, 15, 35)));
  results.push(await scenario(browser, vp, "world prev x12 (reverse-order loading)", WORLD, { mode: "reverse" }, (p) => burst(p, WORLD.prev, 12, 30)));
}
await browser.close();
writeFileSync(`${OUT}/stress-report.json`, JSON.stringify(results, null, 2));
for (const r of results) console.log((r.pass ? "PASS " : "FAIL ") + r.viewport.padEnd(13) + r.scenario.padEnd(48) + " frames=" + String(r.frames).padEnd(4) + " visible " + r.minVisible + "-" + r.maxVisible + " | " + (r.pass ? r.final : r.problems.join("; ")));
const failed = results.filter((r) => !r.pass).length;
console.log(failed ? failed + " of " + results.length + " scenarios FAILED" : "All " + results.length + " scenarios passed");
process.exit(failed ? 1 : 0);

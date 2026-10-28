// Headless QA for the Website V2 preview. Requires the static server from
// .claude/launch.json (python -m http.server 8934, run from the repo root)
// and Playwright with Chromium.
//
//   node tools/qa-website-v2.mjs [outDir]
//
// Writes full-page + first-viewport screenshots per viewport into outDir and
// prints a JSON report (console errors, failed requests, overflow, links,
// interaction checks). Network failures to hosts the sandbox blocks (e.g.
// jsDelivr for supabase-js) are reported separately, not hidden.
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

// CommonJS require so a globally installed Playwright resolves too.
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.QA_BASE || "http://127.0.0.1:8934";
const OUT = process.argv[2] || "qa-out";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-768", width: 768, height: 1024, mobile: true },
  { name: "mobile-390", width: 390, height: 844, mobile: true },
  { name: "mobile-360", width: 360, height: 800, mobile: true }
];
const IOS_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 400));
  });
}

const report = { viewports: {}, checks: {} };
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    userAgent: vp.name.startsWith("mobile") ? IOS_UA : undefined
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("requestfailed", (r) => failed.push(r.url().slice(0, 120) + " — " + (r.failure() && r.failure().errorText)));
  page.on("response", (r) => { if (r.status() >= 400) failed.push(r.url().slice(0, 120) + " — HTTP " + r.status()); });

  await page.goto(BASE + "/preview/website-v2.html", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${vp.name}-viewport.png` });
  await scrollThrough(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${vp.name}-full.png`, fullPage: true });

  // Phones: every updates lane must fit the viewport when its chip is active.
  const laneOverflow = await page.evaluate(async () => {
    const out = {};
    for (const chip of document.querySelectorAll(".v2_lane_tab")) {
      if (getComputedStyle(chip).display === "none") break;
      chip.click();
      await new Promise((r) => setTimeout(r, 60));
      const lane = document.getElementById(chip.getAttribute("aria-controls"));
      out[chip.getAttribute("data-status")] = Math.round(lane.scrollWidth - lane.clientWidth) + "px overflow, page scrollWidth " + document.documentElement.scrollWidth;
    }
    const first = document.querySelector(".v2_lane_tab");
    if (first && getComputedStyle(first).display !== "none") first.click();
    return out;
  });
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const imgs = Array.from(document.querySelectorAll("#ldw_app img"));
    const overflowing = Array.from(document.querySelectorAll("#ldw_app *")).filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return false;
      // Elements inside a horizontal scroller (mobile room carousel) or a
      // clipping frame are allowed to extend past the viewport.
      if (el.closest(".v2_locations, .v2_portrait, .v2_finale_art, .v2_hero_art, .v2_atmos, .ldw_hp_field, .v2_locals, .v2_rail, .v2_life, .v2_lane_tabs, .v2_sk_grid, .v2_sk_media")) return false;
      return r.right > window.innerWidth + 1 || r.left < -1;
    }).slice(0, 5).map((el) => el.className || el.tagName);
    return {
      scrollWidth: doc.scrollWidth,
      innerWidth: window.innerWidth,
      pageHeight: doc.scrollHeight,
      webflowHidden: !!document.querySelector(".w-nav") && getComputedStyle(document.querySelector(".w-nav")).display === "none",
      h1Count: document.querySelectorAll("#ldw_app h1").length,
      imagesBroken: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.currentSrc || i.src),
      imagesDeferred: imgs.filter((i) => i.hasAttribute("data-src") && !i.getAttribute("src")).length,
      imagesWithoutAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
      heroImage: (document.querySelector(".v2_hero_art img") || {}).currentSrc || null,
      heroCta: (() => { const a = document.getElementById("ldw_hero_primary_cta"); return a ? { text: a.textContent, href: a.getAttribute("href") } : null; })(),
      iosBadgeVisible: (() => { const b = document.getElementById("ldw_ios_badge"); return !!b && getComputedStyle(b).display !== "none"; })(),
      overflowing,
      version: window.__LD_WORLD_LANDING_LOADED__ === true
    };
  });
  report.viewports[vp.name] = { laneOverflow, ...metrics, errors, failedRequests: [...new Set(failed)] };
  await ctx.close();
}

// Interaction checks at desktop size.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/preview/website-v2.html", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const c = {};

  // Links: every href on the page, grouped.
  c.links = await page.evaluate(() => [...new Set(Array.from(document.querySelectorAll("#ldw_app a[href]")).map((a) => a.getAttribute("href")))]);
  c.brokenAnchors = await page.evaluate(() => Array.from(document.querySelectorAll('#ldw_app a[href^="#"]')).map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))));

  // Keyboard: first Tab lands on the skip link.
  await page.keyboard.press("Tab");
  c.firstTabTarget = await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim());

  // Skin gallery: the verified development catalog (tools/skin-catalog.json)
  // in three collections, catalog rarity, no prices, no legacy starter art,
  // and the preview follows selection.
  const stageState = () => page.evaluate(() => {
    const im = document.querySelector(".v2_sk_media img:not(.is-hidden)") || {};
    const r = document.getElementById("ldv2_sk_rarity");
    return { name: document.getElementById("ldv2_sk_name").textContent, kind: document.getElementById("ldv2_sk_kind").textContent, rarity: r.hidden ? null : r.textContent, count: document.getElementById("ldv2_sk_count").textContent, img: im.currentSrc || "", loaded: im.naturalWidth > 0, focused: document.activeElement && document.activeElement.id };
  });
  const problems = [];
  c.skins = await page.evaluate(() => {
    const sec = document.getElementById("ldv2_spirit");
    return {
      cols: Array.from(sec.querySelectorAll(".v2_sk_col")).map((t) => t.textContent.trim()),
      panels: Array.from(sec.querySelectorAll(".v2_sk_panel")).map((p) => ({ id: p.id, hidden: p.hidden, thumbs: Array.from(p.querySelectorAll(".v2_sk_thumb")).map((t) => ({ id: t.getAttribute("data-skin"), title: t.title, rarity: t.getAttribute("data-rarity") })) })),
      starters: sec.querySelectorAll(".v2_sk_thumb.is-starter").length,
      visibleThumbs: Array.from(sec.querySelectorAll(".v2_sk_thumb")).filter((t) => t.offsetParent).length,
      selected: document.getElementById("ldv2_sk_name").textContent,
      keyArtInSection: sec.querySelectorAll("#ldv2_spirit img[data-ldv2-art]").length,
      oldNames: /Cowboy|Ninja|Pirate|Princess|Crimson Oracle|Luminous Druid|Shadow Harlequin|Starforged Knight|Bone Warden/.test(sec.textContent),
      prices: /\b(250|450)\b|Dust|LifeCoin/i.test(sec.textContent),
      legacyArt: /adultblue3|adultpink3|base-blue|base-rose/.test(sec.innerHTML)
    };
  });
  const catalog = JSON.parse(readFileSync(new URL("./skin-catalog.json", import.meta.url), "utf8")).skins;
  [1, 2, 3].forEach((w) => {
    const want = catalog.filter((k) => k.wave === w);
    const panel = c.skins.panels.find((p) => p.id === "ldv2_sk_panel_wave-" + w);
    if (!panel) { problems.push("missing panel wave-" + w); return; }
    if (panel.thumbs.length !== want.length) problems.push("wave " + w + ": " + panel.thumbs.length + " thumbs, catalog has " + want.length);
    want.forEach((k, i) => {
      const t = panel.thumbs[i] || {};
      if (t.id !== k.id.replace(/_/g, "-") || t.title !== k.name + " · " + k.rarity || t.rarity !== k.rarity.toLowerCase()) problems.push("wave " + w + " #" + (i + 1) + ": got " + JSON.stringify(t) + ", catalog " + k.name + " / " + k.rarity);
    });
  });
  if (c.skins.cols.join("|") !== "Wave 1 11|Wave 2 13|Wave 3 22") problems.push("collection tabs: " + c.skins.cols.join("|"));
  if (c.skins.starters) problems.push("starter thumbnails shown without their real artwork");
  ["oldNames", "prices", "legacyArt"].forEach((f) => { if (c.skins[f]) problems.push(f); });
  if (c.skins.selected !== "Emberborn") problems.push("default selection " + c.skins.selected);
  if (c.skins.visibleThumbs !== 11) problems.push("visible thumbs " + c.skins.visibleThumbs);

  await page.click("#ldv2_sk_void-wanderer");
  await page.waitForTimeout(900);
  c.skinAfterClick = await stageState();
  if (c.skinAfterClick.name !== "Void Wanderer" || c.skinAfterClick.rarity !== "Epic" || c.skinAfterClick.count !== "04 / 11" || !c.skinAfterClick.loaded || !c.skinAfterClick.img.includes("void-wanderer")) problems.push("click: " + JSON.stringify(c.skinAfterClick));
  await page.focus("#ldv2_sk_void-wanderer");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  c.skinAfterArrow = await stageState();
  if (c.skinAfterArrow.name !== "Verdant Keeper" || c.skinAfterArrow.focused !== "ldv2_sk_verdant-keeper") problems.push("arrow: " + JSON.stringify(c.skinAfterArrow));
  await page.click("#ldv2_sk_next");
  await page.waitForTimeout(700);
  c.skinAfterNext = (await stageState()).name;
  if (c.skinAfterNext !== "Frost Revenant") problems.push("next: " + c.skinAfterNext);

  // Collections: tab switch shows that wave, keyboard moves between tabs,
  // prev wraps inside the collection, and each wave remembers its pick.
  await page.click("#ldv2_sk_col_wave-2");
  await page.waitForTimeout(800);
  c.skinWave2 = Object.assign(await stageState(), await page.evaluate(() => ({ visible: Array.from(document.querySelectorAll("#ldv2_sk_panel_wave-2 .v2_sk_thumb img")).filter((i) => i.offsetParent && i.complete && i.naturalWidth).length, otherHidden: document.getElementById("ldv2_sk_panel_wave-1").hidden && document.getElementById("ldv2_sk_panel_wave-3").hidden })));
  if (c.skinWave2.name !== "Plague Lantern" || c.skinWave2.rarity !== "Rare" || c.skinWave2.count !== "01 / 13" || c.skinWave2.kind !== "Wave 2 · Full character skin" || c.skinWave2.visible !== 13 || !c.skinWave2.otherHidden) problems.push("wave 2: " + JSON.stringify(c.skinWave2));
  await page.click("#ldv2_sk_prev");
  await page.waitForTimeout(700);
  c.skinWave2Prev = await stageState();
  if (c.skinWave2Prev.name !== "The Stained Glass Sovereign" || c.skinWave2Prev.rarity !== "Legendary" || c.skinWave2Prev.count !== "13 / 13") problems.push("wave 2 prev: " + JSON.stringify(c.skinWave2Prev));
  await page.focus("#ldv2_sk_col_wave-2");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(800);
  c.skinWave3 = Object.assign(await stageState(), await page.evaluate(() => ({ visible: Array.from(document.querySelectorAll("#ldv2_sk_panel_wave-3 .v2_sk_thumb img")).filter((i) => i.offsetParent && i.complete && i.naturalWidth).length })));
  if (c.skinWave3.name !== "Abyssal Oracle" || c.skinWave3.count !== "01 / 22" || c.skinWave3.focused !== "ldv2_sk_col_wave-3" || c.skinWave3.visible !== 22) problems.push("wave 3: " + JSON.stringify(c.skinWave3));
  await page.click("#ldv2_sk_the-silent-executioner");
  await page.waitForTimeout(800);
  c.skinWave3Pick = await stageState();
  if (c.skinWave3Pick.name !== "The Silent Executioner" || c.skinWave3Pick.rarity !== "Legendary" || c.skinWave3Pick.count !== "22 / 22" || !c.skinWave3Pick.loaded) problems.push("wave 3 pick: " + JSON.stringify(c.skinWave3Pick));
  await page.click("#ldv2_sk_col_wave-1");
  await page.waitForTimeout(800);
  c.skinBackToWave1 = await stageState();
  if (c.skinBackToWave1.name !== "Frost Revenant" || c.skinBackToWave1.count !== "06 / 11") problems.push("back to wave 1: " + JSON.stringify(c.skinBackToWave1));
  c.skinProblems = problems;
  c.roadmap = await page.evaluate(() => Array.from(document.querySelectorAll(".v2_lane")).map((l) => l.getAttribute("data-status") + ":" + l.querySelectorAll(".v2_live_list > li, .v2_lane_list > li").length));

  // World gallery: next button + thumbnail selection update the stage.
  await page.click("#ldv2_stage_next");
  await page.waitForTimeout(900);
  c.galleryAfterNext = await page.evaluate(() => ({ name: document.getElementById("ldv2_stage_name").textContent, count: document.getElementById("ldv2_stage_count").textContent, selected: document.querySelector('.v2_thumb[aria-selected="true"]').id, stageImgs: document.querySelectorAll(".v2_stage_media img").length }));
  await page.click("#ldv2_loc_tab_shadow-arena");
  await page.waitForTimeout(900);
  c.galleryAfterThumb = await page.evaluate(() => ({ name: document.getElementById("ldv2_stage_name").textContent, img: (document.querySelector(".v2_stage_media img:not(.is-hidden)") || {}).currentSrc }));
  await page.focus("#ldv2_loc_tab_shadow-arena");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  c.galleryAfterArrow = await page.evaluate(() => ({ name: document.getElementById("ldv2_stage_name").textContent, focused: document.activeElement.id }));

  // Shadow Arena teaser: choosing the best answer reveals the result.
  await page.click('.v2_choice[data-effect="best"]');
  c.arenaResult = await page.evaluate(() => document.getElementById("ldv2_arena_result").textContent);

  // Auth modal: header Login opens, Escape closes, footer trigger opens too.
  const modalOpen = () => document.getElementById("ldw_auth_modal").classList.contains("open");
  // openLogin() is async (awaits a Supabase session first), so wait on state.
  await page.click("#ldw_login_btn");
  await page.waitForFunction(modalOpen, null, { timeout: 8000 }).catch(() => {});
  c.authOpen = await page.evaluate(() => document.getElementById("ldw_auth_modal").classList.contains("open"));
  c.authStatusText = await page.evaluate(() => document.getElementById("ldw_auth_status").textContent);
  await page.keyboard.press("Escape");
  await page.waitForFunction((fn) => !document.getElementById("ldw_auth_modal").classList.contains("open"), null, { timeout: 3000 }).catch(() => {});
  c.authClosedByEscape = await page.evaluate(() => !document.getElementById("ldw_auth_modal").classList.contains("open"));
  await page.click(".v2_footer_col [data-ldv2-login]");
  await page.waitForFunction(modalOpen, null, { timeout: 8000 }).catch(() => {});
  c.authOpenFromFooter = await page.evaluate(modalOpen);
  c.focusAfterFooterOpen = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.click("#ldw_close_login");
  await page.waitForFunction(() => !document.getElementById("ldw_auth_modal").classList.contains("open"), null, { timeout: 3000 }).catch(() => {});
  c.focusReturnedTo = await page.evaluate(() => document.activeElement && (document.activeElement.textContent || "").trim());

  // Support widget: opens, Escape closes, validation runs without network.
  await page.click("#ldw_support_toggle");
  await page.waitForTimeout(200);
  c.supportOpen = await page.evaluate(() => document.getElementById("ldw_support").classList.contains("open"));
  await page.click("#ldw_support_submit");
  c.supportValidation = await page.evaluate(() => document.getElementById("ldw_support_form_status").textContent);
  await page.keyboard.press("Escape");
  c.supportClosed = await page.evaluate(() => !document.getElementById("ldw_support").classList.contains("open"));

  // Play Now: the click must navigate to the real World URL. The sandbox
  // can't reach world.lifedecode.app, so capture the request instead.
  let worldRequest = null;
  await page.route("https://world.lifedecode.app/**", (route) => { worldRequest = route.request().url(); route.fulfill({ status: 200, contentType: "text/html", body: "<title>world stub</title>" }); });
  await page.click("#ldw_hero_primary_cta");
  await page.waitForTimeout(800);
  c.playNowNavigatedTo = worldRequest;
  c.errors = errors;
  report.checks.desktop = c;
  await ctx.close();
}


// Auth states with a local supabase-js stub (the sandbox cannot reach
// jsDelivr). Mirrors the production client surface the page uses.
const SUPABASE_STUB = `window.supabase = { createClient: function () { return {
  auth: {
    getSession: async function () { return { data: { session: window.__QA_SESSION__ || null } }; },
    onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
    signInWithPassword: async function () { return { data: null, error: { message: "QA stub: invalid login credentials" } }; },
    signUp: async function () { return { error: null }; },
    signOut: async function () { window.__QA_SESSION__ = null; return {}; },
    signInWithOAuth: async function () { return { error: { message: "QA stub" } }; },
    resetPasswordForEmail: async function () { return { error: null }; },
    resend: async function () { return { error: null }; }
  },
  from: function () { return { select: function () { return { eq: function () { return { maybeSingle: async function () { return { data: null }; } }; } }; } }; }
}; } };`;
for (const state of ["loggedOut", "loggedIn"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (state === "loggedIn") {
    await ctx.addInitScript(() => { window.__QA_SESSION__ = { user: { id: "qa-user", email: "qa@example.com" }, access_token: "qa-token" }; });
  }
  await ctx.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: SUPABASE_STUB }));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/preview/website-v2.html", { waitUntil: "load" });
  await page.waitForTimeout(600);
  const t0 = Date.now();
  await page.click("#ldw_login_btn");
  await page.waitForFunction(() => document.getElementById("ldw_auth_modal").classList.contains("open"), null, { timeout: 8000 });
  const openMs = Date.now() - t0;
  const r = await page.evaluate(() => {
    const vis = (id) => { const el = document.getElementById(id); return !!el && el.offsetParent !== null; };
    return {
      headerLabel: document.getElementById("ldw_login_btn").textContent,
      title: document.getElementById("ldw_auth_title").textContent,
      emailFieldVisible: vis("ldw_email"),
      googleVisible: vis("ldw_google_login"),
      logoutVisible: vis("ldw_logout"),
      deleteAccountVisible: vis("ldw_delete_account"),
      deleteAccountHref: document.getElementById("ldw_delete_account").getAttribute("href"),
      openWorldHref: document.getElementById("ldw_buy_premium").getAttribute("href")
    };
  });
  if (state === "loggedOut") {
    await page.fill("#ldw_email", "qa@example.com");
    await page.fill("#ldw_password", "wrongpass");
    await page.click("#ldw_email_login");
    await page.waitForTimeout(300);
    r.loginErrorShown = await page.evaluate(() => document.getElementById("ldw_auth_status").textContent);
    await page.click("#ldw_tab_register");
    r.registerTitle = await page.evaluate(() => document.getElementById("ldw_auth_title").textContent);
  }
  await page.screenshot({ path: `${OUT}/auth-${state}.png` });
  report.checks["auth_" + state] = { ...r, openMs, errors };
  await ctx.close();
}

// Reduced motion: nothing hidden, no motion class.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/preview/website-v2.html", { waitUntil: "load" });
  await page.waitForTimeout(600);
  report.checks.reducedMotion = await page.evaluate(() => ({
    motionClass: document.getElementById("ldw_app").classList.contains("v2-motion"),
    hiddenReveals: Array.from(document.querySelectorAll(".v2_reveal")).filter((el) => getComputedStyle(el).opacity !== "1").length
  }));
  await ctx.close();
}

// Route guard: /support must keep Webflow content and not mount #ldw_app.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/preview/support/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  report.checks.supportGuard = await page.evaluate(() => ({
    appMounted: !!document.getElementById("ldw_app"),
    webflowVisible: getComputedStyle(document.getElementById("webflow_support")).display !== "none"
  }));
  await page.screenshot({ path: `${OUT}/support-guard.png` });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));

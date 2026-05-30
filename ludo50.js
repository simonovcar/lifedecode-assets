(function () {
  "use strict";

  const path = (window.location.pathname || "").toLowerCase();

  // Never touch legal pages. Keeps Google/Supabase verification + policy pages clean.
  if (path.includes("/terms") || path.includes("/policy") || path.includes("/privacy")) {
    console.log("[LD] Legal page detected — LifeDecode landing script skipped.");
    return;
  }

  if (window.__LD_WORLD_LANDING_LOADED__) return;
  window.__LD_WORLD_LANDING_LOADED__ = true;

  const CFG = {
    VERSION: "world-landing-polished-v2",
    ICONIC_URL: "https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/iconic.png?v=world-iconic-wallpaper-v2",
    WORLD_URL: "/world",
    POLICY_URL: "/policy",
    TERMS_URL: "/terms",
    STORAGE_KEY: "ld_world_daily_checkin_v1",
    SUPABASE_URL: "https://nnqiahypfkdoqkclknoe.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucWlhaHlwZmtkb3FrY2xrbm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjU3NTQsImV4cCI6MjA4ODgwMTc1NH0.j6oTDeSKvpx1OhY3yeCY_-Jo5ixmC22jW9VEuTnJ7hc"
  };

  const CSS = `
:root{
  --ld-bg:#03020a;
  --ld-panel:rgba(9,6,24,.68);
  --ld-panel2:rgba(7,4,18,.82);
  --ld-line:rgba(225,158,255,.20);
  --ld-text:#fff7ff;
  --ld-muted:rgba(255,247,255,.74);
  --ld-soft:rgba(255,247,255,.54);
  --ld-pink:#ff55df;
  --ld-purple:#9b5cff;
  --ld-blue:#43d8ff;
  --ld-green:#86ff58;
  --ld-gold:#ffd36a;
}
html,body{margin:0;min-height:100%;background:var(--ld-bg)!important;}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ld-text);overflow-x:hidden;}
body.ld-no-scroll{overflow:hidden;}
#ldw_app,#ldw_app *{box-sizing:border-box;}
#ldw_app{min-height:100svh;position:relative;isolation:isolate;background:#03020a;color:var(--ld-text);}
#ldw_bg{position:fixed;inset:0;z-index:-4;background:#03020a;overflow:hidden;}
#ldw_bg:before{content:"";position:absolute;inset:0;background-image:linear-gradient(180deg,rgba(3,2,10,.18),rgba(3,2,10,.58) 46%,rgba(3,2,10,.94) 96%),radial-gradient(900px 560px at 50% 8%,rgba(201,62,255,.28),transparent 62%),url("${CFG.ICONIC_URL}");background-size:cover,cover,cover;background-position:center,center,center 42%;filter:saturate(1.12) contrast(1.05);opacity:.72;transform:scale(1.018);}
#ldw_bg:after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(3,2,10,.34) 70%,rgba(3,2,10,.88) 100%),linear-gradient(90deg,rgba(3,2,10,.90),transparent 22%,transparent 78%,rgba(3,2,10,.90));}
#ldw_noise{position:fixed;inset:0;z-index:-3;opacity:.09;pointer-events:none;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");}
#ldw_stars{position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.58;}
.ldw_shell{width:min(1360px,calc(100% - 28px));margin:0 auto;padding:16px 0 36px;}
.ldw_top{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border:1px solid rgba(225,158,255,.22);border-radius:26px;background:linear-gradient(180deg,rgba(9,6,24,.76),rgba(5,3,14,.58));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 24px 70px rgba(0,0,0,.38),0 0 60px rgba(170,70,255,.10);}
.ldw_brand{display:flex;flex-direction:column;gap:3px;min-width:0;}
.ldw_brand_main{font-family:Orbitron,Inter,system-ui,sans-serif;font-weight:1000;letter-spacing:.10em;font-size:clamp(20px,3vw,44px);line-height:.9;background:linear-gradient(92deg,#fff,#b9eaff 24%,#a56cff 52%,#ff67e1 82%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 28px rgba(176,79,255,.18);white-space:nowrap;}
.ldw_brand_sub{font-family:Orbitron,Inter,system-ui,sans-serif;font-weight:950;letter-spacing:.28em;font-size:clamp(10px,1.25vw,18px);color:rgba(255,235,255,.82);text-transform:uppercase;}
.ldw_nav{display:flex;align-items:center;gap:9px;flex-wrap:wrap;justify-content:flex-end;}
.ldw_btn,.ldw_linkbtn{border:1px solid rgba(225,158,255,.20);background:linear-gradient(180deg,rgba(18,10,40,.76),rgba(8,5,22,.72));color:var(--ld-text);border-radius:999px;min-height:44px;padding:11px 15px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,filter .16s ease;}
.ldw_btn:hover,.ldw_linkbtn:hover{transform:translateY(-1px);border-color:rgba(245,205,255,.38);filter:brightness(1.08);}
.ldw_btn_primary{background:radial-gradient(120% 150% at 10% 0%,rgba(255,255,255,.24),transparent 36%),linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.74) 54%,rgba(42,214,255,.74));box-shadow:0 18px 46px rgba(160,70,255,.32),0 0 54px rgba(255,71,225,.16);border-color:rgba(255,255,255,.24);}
.ldw_hero{position:relative;min-height:clamp(650px,75svh,900px);margin-top:14px;border:1px solid rgba(225,158,255,.24);border-radius:36px;overflow:hidden;background:linear-gradient(180deg,rgba(9,5,24,.68),rgba(5,3,14,.74));box-shadow:0 34px 110px rgba(0,0,0,.56),0 0 90px rgba(159,72,255,.14);display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:clamp(24px,4vw,52px);}
.ldw_hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(180deg,rgba(3,2,10,.00),rgba(3,2,10,.12) 40%,rgba(3,2,10,.88) 92%),url("${CFG.ICONIC_URL}");background-size:cover;background-position:center 42%;z-index:0;filter:saturate(1.16) contrast(1.05);}
.ldw_hero:after{content:"YEE-HAW • HMPH • ARRR • REALLY?";position:absolute;left:50%;top:24px;transform:translateX(-50%);width:min(760px,92%);padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(4,2,12,.42);color:rgba(255,255,255,.78);font-size:11px;font-weight:1000;letter-spacing:.20em;text-transform:uppercase;box-shadow:0 18px 45px rgba(0,0,0,.30);backdrop-filter:blur(10px);z-index:2;}
.ldw_hero_inner{position:relative;z-index:1;width:min(920px,100%);padding-top:92px;}
.ldw_badge{display:inline-flex;align-items:center;justify-content:center;margin:0 0 14px;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:linear-gradient(135deg,rgba(74,33,145,.62),rgba(255,68,222,.18));color:#fff;font-size:12px;font-weight:1000;letter-spacing:.16em;text-transform:uppercase;box-shadow:0 0 28px rgba(205,72,255,.20);}
.ldw_title{margin:0 auto 14px;font-family:Orbitron,Inter,system-ui,sans-serif;font-size:clamp(38px,7vw,100px);font-weight:1000;line-height:.88;letter-spacing:-.06em;text-shadow:0 0 34px rgba(168,76,255,.38),0 10px 42px rgba(0,0,0,.70);}
.ldw_title span{background:linear-gradient(92deg,#fff 0%,#b8eaff 22%,#a66cff 48%,#ff61df 76%,#fff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ldw_sub{max-width:830px;margin:0 auto;color:rgba(250,245,255,.88);font-size:clamp(15px,1.6vw,21px);line-height:1.48;text-shadow:0 4px 18px rgba(0,0,0,.80);}
.ldw_actions{width:min(760px,100%);margin:26px auto 0;display:grid;gap:14px;justify-items:center;}
.ldw_enter{width:100%;max-width:720px;min-height:92px;border-radius:30px;font-size:clamp(14px,1.6vw,20px);flex-direction:column;line-height:1.2;}
.ldw_enter small{font-size:clamp(10px,1vw,13px);opacity:.78;letter-spacing:.08em;}
.ldw_micro{margin:14px auto 0;color:rgba(255,255,255,.70);font-size:12px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;}
.ldw_grid{margin-top:18px;display:grid;grid-template-columns:1.05fr .95fr;gap:18px;align-items:start;}
.ldw_card{border:1px solid rgba(225,158,255,.18);border-radius:28px;background:linear-gradient(180deg,rgba(10,6,26,.76),rgba(6,4,16,.68));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 24px 70px rgba(0,0,0,.30);overflow:hidden;}
.ldw_card_head{padding:18px 18px 12px;border-bottom:1px solid rgba(255,255,255,.08);}
.ldw_kicker{font-size:11px;font-weight:1000;letter-spacing:.20em;text-transform:uppercase;color:rgba(255,236,255,.52);}
.ldw_card h2{margin:8px 0 0;font-size:clamp(22px,2.6vw,36px);line-height:1.02;letter-spacing:-.04em;}
.ldw_card_body{padding:18px;}
.ldw_features{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.ldw_feature{border:1px solid rgba(255,255,255,.10);border-radius:20px;background:rgba(255,255,255,.045);padding:14px;min-height:118px;}
.ldw_feature b{display:block;font-size:15px;margin-bottom:7px;}
.ldw_feature p{margin:0;color:var(--ld-muted);font-size:13px;line-height:1.42;}
.ldw_checkin_box{display:grid;gap:12px;}
.ldw_textarea{width:100%;min-height:142px;resize:vertical;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.055);color:var(--ld-text);padding:14px;outline:none;font:inherit;line-height:1.45;}
.ldw_textarea:focus{border-color:rgba(255,107,227,.42);box-shadow:0 0 0 4px rgba(155,92,255,.12);}
.ldw_saved{min-height:50px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.04);padding:12px;color:var(--ld-muted);font-size:13px;line-height:1.45;white-space:pre-wrap;}
.ldw_note{color:var(--ld-soft);font-size:12px;line-height:1.45;}
.ldw_accordion{margin-top:18px;border:1px solid rgba(225,158,255,.16);border-radius:24px;background:linear-gradient(180deg,rgba(10,6,25,.62),rgba(6,4,16,.50));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);overflow:hidden;}
.ldw_accordion summary{cursor:pointer;padding:16px 18px;font-weight:1000;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,247,255,.88);}
.ldw_accordion div{padding:0 18px 18px;color:var(--ld-muted);line-height:1.55;font-size:14px;}
.ldw_footer{padding:22px 0 4px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}
.ldw_footer a{color:rgba(245,239,255,.76);text-decoration:none;font-size:11px;font-weight:950;letter-spacing:.13em;text-transform:uppercase;border:1px solid rgba(214,164,255,.14);background:rgba(255,255,255,.035);padding:10px 13px;border-radius:999px;}
.ldw_footer a:hover{color:#fff;border-color:rgba(230,190,255,.30);background:rgba(255,255,255,.07);}
.ldw_auth_modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.62);backdrop-filter:blur(10px);}
.ldw_auth_modal.open{display:flex;}
.ldw_modal_box{width:min(520px,100%);border:1px solid rgba(225,158,255,.22);border-radius:28px;background:linear-gradient(180deg,rgba(12,7,32,.96),rgba(7,4,18,.94));box-shadow:0 34px 100px rgba(0,0,0,.62);overflow:hidden;}
.ldw_modal_head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,.09);}
.ldw_modal_head h3{margin:0;font-size:20px;}
.ldw_modal_body{padding:16px;display:grid;gap:10px;}
.ldw_input{width:100%;min-height:46px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.055);color:var(--ld-text);padding:12px;outline:none;font:inherit;}
.ldw_status{min-height:22px;color:var(--ld-muted);font-size:13px;line-height:1.4;}
@media(max-width:900px){.ldw_top{align-items:flex-start;flex-direction:column}.ldw_nav{justify-content:flex-start}.ldw_grid{grid-template-columns:1fr}.ldw_features{grid-template-columns:1fr}}
@media(max-width:560px){.ldw_shell{width:min(100% - 16px,1360px);padding-top:8px}.ldw_top{border-radius:20px;padding:12px}.ldw_nav{width:100%;display:grid;grid-template-columns:.9fr 1.22fr .9fr;gap:7px}.ldw_btn,.ldw_linkbtn{font-size:9.5px;padding:9px 7px;min-height:42px;letter-spacing:.055em;text-align:center;line-height:1.12;white-space:normal}.ldw_nav #ldw_scroll_checkin{font-size:8.8px;letter-spacing:.015em;white-space:nowrap;padding-left:5px;padding-right:5px}.ldw_hero{min-height:610px;border-radius:24px;padding:92px 12px 22px}.ldw_hero_inner{padding-top:78px}.ldw_hero:before{background-size:auto 66%;background-repeat:no-repeat;background-position:center 64px}.ldw_hero:after{top:15px;font-size:8px;letter-spacing:.11em;padding:8px 10px;width:calc(100% - 30px);line-height:1.25}.ldw_badge{font-size:9px;letter-spacing:.09em;padding:8px 10px;margin-top:0}.ldw_title{font-size:clamp(35px,12vw,56px)}.ldw_sub{font-size:14px}.ldw_enter{min-height:82px;border-radius:24px}.ldw_micro{font-size:10px;line-height:1.45}.ldw_card{border-radius:22px}.ldw_card_body,.ldw_card_head{padding:14px}.ldw_footer a{font-size:10px;padding:9px 11px}}
`;

  const HTML = `
<div id="ldw_bg" aria-hidden="true"></div>
<div id="ldw_noise" aria-hidden="true"></div>
<canvas id="ldw_stars" aria-hidden="true"></canvas>
<div class="ldw_shell">
  <header class="ldw_top">
    <div class="ldw_brand" aria-label="LifeDecode World">
      <div class="ldw_brand_main">LIFEDECODE</div>
      <div class="ldw_brand_sub">WORLD</div>
    </div>
    <nav class="ldw_nav" aria-label="Main navigation">
      <a class="ldw_linkbtn ldw_btn_primary" href="${CFG.WORLD_URL}">Enter World</a>
      <button class="ldw_btn" id="ldw_scroll_checkin" type="button">Daily Check-In</button>
      <button class="ldw_btn" id="ldw_login_btn" type="button">Login</button>
    </nav>
  </header>

  <main>
    <section class="ldw_hero" aria-label="LifeDecode World intro">
      <div class="ldw_hero_inner">
        <div class="ldw_badge">Silly Squad is assembling</div>
        <h1 class="ldw_title"><span>ENTER THE WORLD</span></h1>
        <p class="ldw_sub">A mysterious social world where spirits explore rooms, meet ridiculous NPCs, collect Dust, unlock cosmetics, and slowly become better humans without the boring self-help lecture energy.</p>
        <div class="ldw_actions">
          <a class="ldw_btn ldw_btn_primary ldw_enter" href="${CFG.WORLD_URL}">
            <span>ENTER LIFEDECODE WORLD</span>
            <small>Play, explore, meet NPCs, collect Dust & cause emotional damage</small>
          </a>
          <button class="ldw_btn" id="ldw_hero_checkin" type="button">Do Daily Check-In first</button>
        </div>
        <div class="ldw_micro">No login wall before landing • Privacy & terms stay available • Daily Check-In stays alive</div>
      </div>
    </section>

    <section class="ldw_grid" id="ldw_checkin_section">
      <article class="ldw_card">
        <div class="ldw_card_head">
          <div class="ldw_kicker">Why this world exists</div>
          <h2>Not pay-to-win. Not soulless. Just weird, cozy, iconic progression.</h2>
        </div>
        <div class="ldw_card_body">
          <div class="ldw_features">
            <div class="ldw_feature"><b>🌎 Explore rooms</b><p>Plaza, Brew Haven, Soulcore, Mind Zone and future maps with lore, quests and secrets.</p></div>
            <div class="ldw_feature"><b>👻 Build your spirit</b><p>Cosmetics, sets, identity and style without destroying the actual game balance.</p></div>
            <div class="ldw_feature"><b>🧠 Grow through play</b><p>Daily check-ins, symbolic systems, choices and NPC moments that quietly teach real-life skills.</p></div>
            <div class="ldw_feature"><b>✨ Meet the chaos</b><p>Cowboys, ninjas, pirates, princesses, emotional goblins and probably one NPC with tax issues.</p></div>
          </div>
        </div>
      </article>

      <article class="ldw_card">
        <div class="ldw_card_head">
          <div class="ldw_kicker">Daily Check-In</div>
          <h2>Drop your current state before entering the chaos.</h2>
        </div>
        <div class="ldw_card_body">
          <div class="ldw_checkin_box">
            <textarea class="ldw_textarea" id="ldw_checkin_text" placeholder="How are you really doing today? One sentence is enough. No fake wellness influencer nonsense required."></textarea>
            <button class="ldw_btn ldw_btn_primary" id="ldw_save_checkin" type="button">Save Check-In</button>
            <div class="ldw_saved" id="ldw_saved_checkin">Your last check-in will appear here.</div>
            <div class="ldw_note">Private on this device unless you later connect account sync. This keeps the landing page useful without blocking players behind login.</div>
          </div>
        </div>
      </article>
    </section>

    <details class="ldw_accordion">
      <summary>Privacy, safety and boring-but-important adult paperwork</summary>
      <div>
        LifeDecode World keeps the landing open before login, while Privacy Policy and Terms stay directly accessible. This page is focused on the World, but the important legal links remain visible for visitors, app verification, and general sanity.
      </div>
    </details>
  </main>

  <footer class="ldw_footer" aria-label="Legal footer">
    <a href="${CFG.POLICY_URL}">Privacy Policy</a>
    <a href="${CFG.TERMS_URL}">Terms of Service</a>
    <a href="mailto:simon.ovcar12@gmail.com">Contact</a>
  </footer>
</div>

<div class="ldw_auth_modal" id="ldw_auth_modal" aria-hidden="true">
  <div class="ldw_modal_box" role="dialog" aria-modal="true" aria-label="Login">
    <div class="ldw_modal_head">
      <h3>Login</h3>
      <button class="ldw_btn" id="ldw_close_login" type="button">Close</button>
    </div>
    <div class="ldw_modal_body">
      <div class="ldw_note">Login is optional. Landing stays public, because we are not trying to summon verification demons again.</div>
      <input class="ldw_input" id="ldw_email" type="email" placeholder="Email">
      <input class="ldw_input" id="ldw_password" type="password" placeholder="Password">
      <button class="ldw_btn ldw_btn_primary" id="ldw_email_login" type="button">Login with email</button>
      <button class="ldw_btn" id="ldw_google_login" type="button">Continue with Google</button>
      <div class="ldw_status" id="ldw_auth_status"></div>
    </div>
  </div>
</div>
`;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  function injectFonts() {
    if (!document.getElementById("ldw_fonts")) {
      const link = document.createElement("link");
      link.id = "ldw_fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;800;900&display=swap";
      document.head.appendChild(link);
    }
  }

  function preloadIconicWallpaper() {
    if (document.getElementById("ldw_iconic_preload")) return;
    const link = document.createElement("link");
    link.id = "ldw_iconic_preload";
    link.rel = "preload";
    link.as = "image";
    link.href = CFG.ICONIC_URL;
    document.head.appendChild(link);
  }

  function injectCSS() {
    if (document.getElementById("ldw_style")) return;
    const style = document.createElement("style");
    style.id = "ldw_style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function render() {
    // IMPORTANT:
    // Do NOT reuse #ld_app if Webflow placed it inside another wrapper.
    // If we reuse a nested element and then hide Webflow body children, its parent gets hidden too = white screen.
    let oldNested = document.getElementById("ldw_app") || document.getElementById("ld_app");
    if (oldNested && oldNested.parentElement !== document.body) {
      oldNested.remove();
    }

    let app = document.getElementById("ldw_app");
    if (!app || app.parentElement !== document.body) {
      app = document.createElement("div");
      app.id = "ldw_app";
      document.body.prepend(app);
    }

    app.style.display = "block";
    app.innerHTML = HTML;

    // Hide Webflow default visible sections only on the landing page, without deleting them.
    // Keep our top-level #ldw_app visible.
    Array.from(document.body.children).forEach((el) => {
      if (el === app) return;
      const tag = (el.tagName || "").toUpperCase();
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") return;
      el.setAttribute("data-ldw-hidden", "1");
      el.style.display = "none";
    });
  }

  function getSupabase() {
    if (!window.supabase || !window.supabase.createClient) return null;
    if (!window.__LDW_SUPABASE__) window.__LDW_SUPABASE__ = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
    return window.__LDW_SUPABASE__;
  }

  function bind() {
    const checkin = document.getElementById("ldw_checkin_section");
    const scrollCheckin = () => checkin && checkin.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("ldw_scroll_checkin")?.addEventListener("click", scrollCheckin);
    document.getElementById("ldw_hero_checkin")?.addEventListener("click", scrollCheckin);

    const txt = document.getElementById("ldw_checkin_text");
    const saved = document.getElementById("ldw_saved_checkin");
    function showSaved() {
      try {
        const item = JSON.parse(localStorage.getItem(CFG.STORAGE_KEY) || "null");
        if (item && item.text) saved.textContent = `Last check-in (${item.date}):\n${item.text}`;
      } catch (e) {}
    }
    showSaved();

    document.getElementById("ldw_save_checkin")?.addEventListener("click", () => {
      const value = (txt.value || "").trim();
      if (!value) {
        saved.textContent = "Write at least one honest line first. The void accepts nonsense, but this box does not.";
        return;
      }
      const item = { text: value, date: new Date().toLocaleString() };
      try { localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(item)); } catch (e) {}
      showSaved();
      txt.value = "";
    });

    const modal = document.getElementById("ldw_auth_modal");
    const status = document.getElementById("ldw_auth_status");
    const openLogin = () => { modal.classList.add("open"); document.body.classList.add("ld-no-scroll"); modal.setAttribute("aria-hidden", "false"); };
    const closeLogin = () => { modal.classList.remove("open"); document.body.classList.remove("ld-no-scroll"); modal.setAttribute("aria-hidden", "true"); };
    document.getElementById("ldw_login_btn")?.addEventListener("click", openLogin);
    document.getElementById("ldw_close_login")?.addEventListener("click", closeLogin);
    modal?.addEventListener("click", (e) => { if (e.target === modal) closeLogin(); });

    document.getElementById("ldw_email_login")?.addEventListener("click", async () => {
      const client = getSupabase();
      if (!client) { status.textContent = "Supabase script is not loaded yet."; return; }
      const email = document.getElementById("ldw_email").value.trim();
      const password = document.getElementById("ldw_password").value;
      if (!email || !password) { status.textContent = "Email and password first, boss."; return; }
      status.textContent = "Logging in...";
      const { error } = await client.auth.signInWithPassword({ email, password });
      status.textContent = error ? error.message : "Logged in. You can enter the World now.";
    });

    document.getElementById("ldw_google_login")?.addEventListener("click", async () => {
      const client = getSupabase();
      if (!client) { status.textContent = "Supabase script is not loaded yet."; return; }
      status.textContent = "Opening Google login...";
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/" } });
      if (error) status.textContent = error.message;
    });
  }

  function stars() {
    const canvas = document.getElementById("ldw_stars");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, points = [];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = Array.from({ length: Math.min(90, Math.floor(w / 14)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.7 + .4,
        a: Math.random() * .7 + .2,
        s: Math.random() * .35 + .08
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      points.forEach(p => {
        p.y += p.s;
        if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    tick();
  }

  ready(() => {
    try {
      injectFonts();
      preloadIconicWallpaper();
      injectCSS();
      render();
      bind();
      stars();
      console.log("[LD] World landing loaded:", CFG.VERSION);
    } catch (err) {
      console.error("[LD] World landing failed:", err);
      document.body.innerHTML = '<div style="min-height:100vh;background:#03020a;color:#fff;padding:24px;font-family:Arial,sans-serif"><h1>LifeDecode World</h1><p>Landing failed to load. Check console.</p></div>';
    }
  });
})();

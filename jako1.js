(function () {
  "use strict";

  /*
    LifeDecode landing HARD FIX
    Goal: never white-screen the page.
    - Renders immediately.
    - Does not wait for images, fonts, Supabase, Railway or Make.
    - Does not hide Webflow wrappers/scripts.
    - Supabase + Railway are lazy-loaded only when needed.
  */

  console.log("[LD] landing hard-fix script reached");

  var CFG = {
    VERSION: "lifedecode-app-v9-page-hardfix-no-whitescreen",
    WORLD_URL: "https://world.lifedecode.app/#",
    POLICY_URL: "/policy",
    TERMS_URL: "/terms",
    PREMIUM_URL: "https://lifedecode.app/premium",
    ICONIC_URLS: [
      "/assets/iconic2.png?v=ld-v9",
      "assets/iconic2.png?v=ld-v9",
      "/assets/iconic.png?v=ld-v9",
      "assets/iconic.png?v=ld-v9",
      "https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/iconic2.png?v=ld-v9",
      "https://raw.githubusercontent.com/simonovcar/lifedecode-assets/main/iconic2.png?v=ld-v9"
    ],
    SUPABASE_URL: "https://nnqiahypfkdoqkclknoe.supabase.co",
    SUPABASE_KEY: "sb_publishable_t2Nl119Q73xYsR4Vdrg79Q_v1pC7DAL",
    AUTH_REDIRECT_URL: window.location.origin + window.location.pathname,
    API_BASE_URL: "https://lifedecode-game-production.up.railway.app",
    DAILY_CHECKIN_API_URL: "https://lifedecode-game-production.up.railway.app/api/daily-checkin",
    DAILY_XP: 75,
    CHECKIN_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    STORAGE_KEY: "ld_world_daily_checkin_v1",
    PENDING_XP_KEY: "ld_world_pending_daily_xp_v1",
    LAST_CHECKIN_AWARD_KEY: "ld_world_daily_checkin_last_award_v1"
  };

  var path = String(window.location.pathname || "").toLowerCase();
  if (path.indexOf("/terms") >= 0 || path.indexOf("/policy") >= 0 || path.indexOf("/privacy") >= 0) {
    console.log("[LD] legal page detected, landing skipped");
    return;
  }

  if (window.__LD_PAGE_HARD_FIX_LOADED__) {
    console.log("[LD] landing already loaded, skipping duplicate");
    return;
  }
  window.__LD_PAGE_HARD_FIX_LOADED__ = true;

  function safeStorageGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : raw;
    } catch (e) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDuration(ms) {
    var clean = Math.max(0, Number(ms) || 0);
    var totalMinutes = Math.ceil(clean / 60000);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    if (hours <= 0) return minutes + "m";
    if (minutes <= 0) return hours + "h";
    return hours + "h " + minutes + "m";
  }

  function getStoredLastCheckinAt() {
    try {
      var award = JSON.parse(localStorage.getItem(CFG.LAST_CHECKIN_AWARD_KEY) || "null");
      var raw = award && award.lastAwardAt;
      var time = raw ? new Date(raw).getTime() : 0;
      if (time && Number.isFinite(time)) return time;
    } catch (e) {}

    try {
      var pending = JSON.parse(localStorage.getItem(CFG.PENDING_XP_KEY) || "null");
      if (pending && pending.awarded) {
        var raw2 = pending.lastAwardAt || pending.iso || pending.at;
        var time2 = raw2 ? new Date(raw2).getTime() : 0;
        if (time2 && Number.isFinite(time2)) return time2;
      }
    } catch (e) {}

    return 0;
  }

  function getLocalCooldownInfo() {
    var lastAt = getStoredLastCheckinAt();
    if (!lastAt) return { allowed: true, remainingMs: 0, lastAt: 0 };
    var remainingMs = CFG.CHECKIN_COOLDOWN_MS - (Date.now() - lastAt);
    return { allowed: remainingMs <= 0, remainingMs: Math.max(0, remainingMs), lastAt: lastAt };
  }

  function rememberDailyCheckinAward(text, xp) {
    safeStorageSet(CFG.LAST_CHECKIN_AWARD_KEY, JSON.stringify({
      text: String(text || "").slice(0, 500),
      lastAwardAt: new Date().toISOString(),
      xp: xp || CFG.DAILY_XP
    }));
  }

  function buildLocalCheckinAdvice(text) {
    var clean = String(text || "").trim();
    var lower = clean.toLowerCase();

    var focus = "First: pause. Breathe in for 4, hold for 2, out for 6. Do that three times. Then pick ONE tiny next action. Not ten. One.";
    if (/(anx|panic|strah|nerv|tesn|overwhelm|stres|stress)/i.test(lower)) {
      focus = "Your nervous system sounds overloaded. Breathe slowly, unclench your jaw, drink water, then do one small stabilizing action.";
    } else if (/(sad|žal|zal|depres|empty|praz|lonely|sam|down|slab)/i.test(lower)) {
      focus = "This sounds heavy, not lazy. Lower the bar today: shower, food, fresh air for 5 minutes. Tiny wins still count.";
    } else if (/(angry|jezn|besn|mad|frustr|rage|fuck|kurc)/i.test(lower)) {
      focus = "You sound activated. Do not text, quit, buy, argue, or burn the village yet. Move your body for 2 minutes, then decide.";
    } else if (/(tired|utruj|sleep|spat|exhaust|burn)/i.test(lower)) {
      focus = "Your body is waving a tiny white flag. Make the next task stupidly small, then rest. Biology owns the building.";
    } else if (/(good|dobr|super|happy|mirn|ok|fine|great)/i.test(lower)) {
      focus = "Good. Use the stable mood like a cheat code: do one useful thing now while your brain is cooperating.";
    }

    return "Ria says:\n" + focus + "\n\nTiny mission: write what triggered this mood, choose one next action, then enter the World. +XP is cute, but self-control is the real loot.";
  }

  function injectCSS() {
    if (document.getElementById("ld_page_hardfix_css")) return;

    var css = ''
      + ':root{--ld-bg:#03020a;--ld-text:#fff7ff;--ld-muted:rgba(255,247,255,.76);--ld-pink:#ff55df;--ld-purple:#9b5cff;--ld-blue:#43d8ff;--ld-gold:#ffd36a;--ld-bg-img:url("' + CFG.ICONIC_URLS[0] + '");}'
      + 'html,body{margin:0!important;min-height:100%!important;background:#03020a!important;color:var(--ld-text)!important;}'
      + 'body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;overflow-x:hidden!important;}'
      + '#ldw_app,#ldw_app *{box-sizing:border-box!important;}'
      + '#ldw_app{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:2147483000!important;min-height:100svh!important;color:var(--ld-text)!important;background:#03020a!important;isolation:isolate!important;overflow-x:hidden!important;}'
      + '#ldw_bg{position:fixed!important;inset:0!important;z-index:0!important;background:#03020a!important;pointer-events:none!important;overflow:hidden!important;}'
      + '#ldw_bg:before{content:""!important;position:absolute!important;inset:0!important;background-image:linear-gradient(180deg,rgba(3,2,10,.10),rgba(3,2,10,.40) 48%,rgba(3,2,10,.88) 100%),radial-gradient(900px 560px at 50% 10%,rgba(201,62,255,.30),transparent 62%),var(--ld-bg-img)!important;background-size:cover,cover,cover!important;background-position:center,center,center 42%!important;filter:saturate(1.15) contrast(1.05)!important;opacity:.95!important;transform:scale(1.018)!important;}'
      + '#ldw_bg:after{content:""!important;position:absolute!important;inset:0!important;background:radial-gradient(ellipse at center,transparent 30%,rgba(3,2,10,.35) 70%,rgba(3,2,10,.92) 100%),linear-gradient(90deg,rgba(3,2,10,.90),transparent 23%,transparent 77%,rgba(3,2,10,.90))!important;}'
      + '#ldw_noise{position:fixed!important;inset:0!important;z-index:1!important;pointer-events:none!important;opacity:.08!important;background-image:radial-gradient(circle at 20% 20%,rgba(255,255,255,.16) 0 1px,transparent 1px)!important;background-size:22px 22px!important;}'
      + '#ldw_stars{position:fixed!important;inset:0!important;z-index:2!important;pointer-events:none!important;opacity:.55!important;}'
      + '.ldw_shell{position:relative!important;z-index:3!important;width:min(1360px,calc(100% - 28px))!important;margin:0 auto!important;padding:16px 0 38px!important;}'
      + '.ldw_top{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;padding:14px 16px!important;border:1px solid rgba(225,158,255,.22)!important;border-radius:26px!important;background:linear-gradient(180deg,rgba(9,6,24,.78),rgba(5,3,14,.62))!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;box-shadow:0 24px 70px rgba(0,0,0,.38),0 0 60px rgba(170,70,255,.10)!important;}'
      + '.ldw_brand_main{font-weight:1000!important;letter-spacing:.10em!important;font-size:clamp(22px,3vw,44px)!important;line-height:.9!important;background:linear-gradient(92deg,#fff,#b9eaff 24%,#a56cff 52%,#ff67e1 82%,#fff)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;white-space:nowrap!important;}'
      + '.ldw_brand_sub{font-weight:950!important;letter-spacing:.28em!important;font-size:clamp(10px,1.25vw,18px)!important;color:rgba(255,235,255,.82)!important;text-transform:uppercase!important;}'
      + '.ldw_nav{display:flex!important;align-items:center!important;gap:9px!important;flex-wrap:wrap!important;justify-content:flex-end!important;}'
      + '.ldw_btn,.ldw_linkbtn{border:1px solid rgba(225,158,255,.22)!important;background:linear-gradient(180deg,rgba(18,10,40,.78),rgba(8,5,22,.72))!important;color:var(--ld-text)!important;border-radius:999px!important;min-height:44px!important;padding:11px 15px!important;font-weight:950!important;letter-spacing:.08em!important;text-transform:uppercase!important;font-size:12px!important;text-decoration:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;cursor:pointer!important;transition:transform .16s ease,filter .16s ease!important;}'
      + '.ldw_btn:hover,.ldw_linkbtn:hover{transform:translateY(-1px)!important;filter:brightness(1.08)!important;}'
      + '.ldw_btn_primary{background:radial-gradient(120% 150% at 10% 0%,rgba(255,255,255,.24),transparent 36%),linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.76) 54%,rgba(42,214,255,.74))!important;box-shadow:0 18px 46px rgba(160,70,255,.32),0 0 54px rgba(255,71,225,.16)!important;border-color:rgba(255,255,255,.25)!important;}'
      + '.ldw_hero{position:relative!important;min-height:clamp(650px,75svh,900px)!important;margin-top:14px!important;border:1px solid rgba(225,158,255,.24)!important;border-radius:36px!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(9,5,24,.68),rgba(5,3,14,.74))!important;box-shadow:0 34px 110px rgba(0,0,0,.56),0 0 90px rgba(159,72,255,.14)!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;text-align:center!important;padding:clamp(24px,4vw,52px)!important;}'
      + '.ldw_hero:before{content:""!important;position:absolute!important;inset:0!important;background-image:linear-gradient(180deg,rgba(3,2,10,.02),rgba(3,2,10,.18) 40%,rgba(3,2,10,.90) 92%),var(--ld-bg-img)!important;background-size:cover!important;background-position:center 42%!important;z-index:0!important;filter:saturate(1.16) contrast(1.05)!important;}'
      + '.ldw_hero:after{content:"YEE-HAW • HMPH • ARRR • REALLY?"!important;position:absolute!important;left:50%!important;top:24px!important;transform:translateX(-50%)!important;width:min(760px,92%)!important;padding:10px 14px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.14)!important;background:rgba(4,2,12,.44)!important;color:rgba(255,255,255,.78)!important;font-size:11px!important;font-weight:1000!important;letter-spacing:.20em!important;text-transform:uppercase!important;z-index:2!important;backdrop-filter:blur(10px)!important;}'
      + '.ldw_hero_inner{position:relative!important;z-index:1!important;width:min(920px,100%)!important;padding-top:92px!important;}'
      + '.ldw_badge{display:inline-flex!important;margin:0 0 14px!important;padding:10px 14px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;background:linear-gradient(135deg,rgba(74,33,145,.62),rgba(255,68,222,.18))!important;font-size:12px!important;font-weight:1000!important;letter-spacing:.16em!important;text-transform:uppercase!important;}'
      + '.ldw_title{margin:0 auto 14px!important;font-size:clamp(38px,7vw,100px)!important;font-weight:1000!important;line-height:.88!important;letter-spacing:-.06em!important;text-shadow:0 0 34px rgba(168,76,255,.38),0 10px 42px rgba(0,0,0,.70)!important;}'
      + '.ldw_title span{background:linear-gradient(92deg,#fff 0%,#b8eaff 22%,#a66cff 48%,#ff61df 76%,#fff 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;}'
      + '.ldw_sub{max-width:830px!important;margin:0 auto!important;color:rgba(250,245,255,.88)!important;font-size:clamp(15px,1.6vw,21px)!important;line-height:1.48!important;text-shadow:0 4px 18px rgba(0,0,0,.80)!important;}'
      + '.ldw_actions{width:min(760px,100%)!important;margin:26px auto 0!important;display:grid!important;gap:14px!important;justify-items:center!important;}'
      + '.ldw_enter{width:100%!important;max-width:720px!important;min-height:92px!important;border-radius:30px!important;font-size:clamp(14px,1.6vw,20px)!important;flex-direction:column!important;line-height:1.2!important;}'
      + '.ldw_enter small{font-size:clamp(10px,1vw,13px)!important;opacity:.78!important;letter-spacing:.08em!important;}'
      + '.ldw_micro{margin:14px auto 0!important;color:rgba(255,255,255,.70)!important;font-size:12px!important;font-weight:850!important;letter-spacing:.09em!important;text-transform:uppercase!important;}'
      + '.ldw_grid{margin-top:18px!important;display:grid!important;grid-template-columns:1.05fr .95fr!important;gap:18px!important;align-items:start!important;}'
      + '.ldw_card{border:1px solid rgba(225,158,255,.18)!important;border-radius:28px!important;background:linear-gradient(180deg,rgba(10,6,26,.78),rgba(6,4,16,.70))!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;box-shadow:0 24px 70px rgba(0,0,0,.30)!important;overflow:hidden!important;}'
      + '.ldw_card_head{padding:18px 18px 12px!important;border-bottom:1px solid rgba(255,255,255,.08)!important;}'
      + '.ldw_kicker{font-size:11px!important;font-weight:1000!important;letter-spacing:.20em!important;text-transform:uppercase!important;color:rgba(255,236,255,.52)!important;}'
      + '.ldw_card h2{margin:8px 0 0!important;font-size:clamp(22px,2.6vw,36px)!important;line-height:1.02!important;letter-spacing:-.04em!important;}'
      + '.ldw_card_body{padding:18px!important;}'
      + '.ldw_features{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;}'
      + '.ldw_feature{border:1px solid rgba(255,255,255,.10)!important;border-radius:20px!important;background:rgba(255,255,255,.045)!important;padding:14px!important;min-height:118px!important;}'
      + '.ldw_feature b{display:block!important;font-size:15px!important;margin-bottom:7px!important;}'
      + '.ldw_feature p{margin:0!important;color:var(--ld-muted)!important;font-size:13px!important;line-height:1.42!important;}'
      + '.ldw_checkin_box{display:grid!important;gap:12px!important;}'
      + '.ldw_textarea{width:100%!important;min-height:142px!important;resize:vertical!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:20px!important;background:rgba(255,255,255,.055)!important;color:var(--ld-text)!important;padding:14px!important;outline:none!important;font:inherit!important;line-height:1.45!important;}'
      + '.ldw_saved,.ldw_ai_reply{min-height:72px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:18px!important;background:rgba(255,255,255,.04)!important;padding:12px!important;color:var(--ld-muted)!important;font-size:13px!important;line-height:1.45!important;white-space:pre-wrap!important;}'
      + '.ldw_ai_reply{min-height:92px!important;border-color:rgba(255,85,223,.18)!important;background:linear-gradient(180deg,rgba(255,85,223,.08),rgba(67,216,255,.045))!important;color:rgba(255,247,255,.88)!important;font-size:14px!important;}'
      + '.ldw_note{color:rgba(255,247,255,.54)!important;font-size:12px!important;line-height:1.45!important;}'
      + '.ldw_footer{position:relative!important;z-index:3!important;padding:22px 0 4px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex-wrap:wrap!important;}'
      + '.ldw_footer a{color:rgba(245,239,255,.76)!important;text-decoration:none!important;font-size:11px!important;font-weight:950!important;letter-spacing:.13em!important;text-transform:uppercase!important;border:1px solid rgba(214,164,255,.14)!important;background:rgba(255,255,255,.035)!important;padding:10px 13px!important;border-radius:999px!important;}'
      + '.ldw_auth_modal{position:fixed!important;inset:0!important;z-index:2147483600!important;display:none!important;align-items:center!important;justify-content:center!important;padding:18px!important;background:rgba(2,3,10,.82)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;}'
      + '.ldw_auth_modal.open{display:flex!important;}'
      + '.ldw_modal_box{width:min(760px,calc(100vw - 28px))!important;border:1px solid rgba(225,158,255,.20)!important;border-radius:34px!important;background:linear-gradient(180deg,rgba(12,15,32,.98),rgba(4,6,16,.98))!important;box-shadow:0 34px 110px rgba(0,0,0,.68),0 0 70px rgba(155,92,255,.14)!important;overflow:hidden!important;}'
      + '.ldw_modal_head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:18px!important;padding:26px 30px 8px!important;}'
      + '.ldw_modal_head h3{margin:0!important;font-size:clamp(28px,3vw,40px)!important;line-height:1.04!important;letter-spacing:-.055em!important;font-weight:1000!important;color:#fff!important;}'
      + '.ldw_auth_sub{margin-top:12px!important;color:rgba(255,247,255,.74)!important;font-size:16px!important;line-height:1.5!important;}'
      + '.ldw_modal_body{padding:12px 30px 30px!important;display:grid!important;gap:14px!important;}'
      + '.ldw_input{width:100%!important;min-height:64px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:22px!important;background:rgba(255,255,255,.075)!important;color:var(--ld-text)!important;padding:0 20px!important;outline:none!important;font:inherit!important;font-size:18px!important;font-weight:750!important;}'
      + '.ldw_status{min-height:22px!important;color:rgba(255,247,255,.72)!important;font-size:14px!important;line-height:1.45!important;text-align:center!important;font-weight:650!important;}'
      + '.ldw_hidden{display:none!important;}'
      + '@media(max-width:900px){.ldw_top{align-items:flex-start!important;flex-direction:column!important}.ldw_nav{justify-content:flex-start!important}.ldw_grid{grid-template-columns:1fr!important}.ldw_features{grid-template-columns:1fr!important}}'
      + '@media(max-width:560px){.ldw_shell{width:min(100% - 16px,1360px)!important;padding-top:8px!important}.ldw_top{border-radius:20px!important;padding:12px!important}.ldw_nav{width:100%!important;display:grid!important;grid-template-columns:.9fr 1.22fr .9fr!important;gap:7px!important}.ldw_btn,.ldw_linkbtn{font-size:9.5px!important;padding:9px 7px!important;min-height:42px!important;letter-spacing:.055em!important;text-align:center!important;line-height:1.12!important;white-space:normal!important}.ldw_hero{min-height:610px!important;border-radius:24px!important;padding:92px 12px 22px!important}.ldw_hero:before{background-size:auto 66%!important;background-repeat:no-repeat!important;background-position:center 64px!important}.ldw_hero:after{top:15px!important;font-size:8px!important;letter-spacing:.11em!important;padding:8px 10px!important;width:calc(100% - 30px)!important;line-height:1.25!important}.ldw_badge{font-size:9px!important;letter-spacing:.09em!important;padding:8px 10px!important}.ldw_title{font-size:clamp(35px,12vw,56px)!important}.ldw_sub{font-size:14px!important}.ldw_enter{min-height:82px!important;border-radius:24px!important}.ldw_micro{font-size:10px!important;line-height:1.45!important}.ldw_card{border-radius:22px!important}.ldw_card_body,.ldw_card_head{padding:14px!important}}';

    var style = document.createElement("style");
    style.id = "ld_page_hardfix_css";
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);
  }

  function getHTML() {
    return ''
      + '<div id="ldw_bg" aria-hidden="true"></div>'
      + '<div id="ldw_noise" aria-hidden="true"></div>'
      + '<canvas id="ldw_stars" aria-hidden="true"></canvas>'
      + '<div class="ldw_shell">'
      + '  <header class="ldw_top">'
      + '    <div class="ldw_brand"><div class="ldw_brand_main">LIFEDECODE</div><div class="ldw_brand_sub">WORLD</div></div>'
      + '    <nav class="ldw_nav">'
      + '      <a class="ldw_linkbtn ldw_btn_primary" href="' + CFG.WORLD_URL + '">Enter World</a>'
      + '      <button class="ldw_btn" id="ldw_scroll_checkin" type="button">Daily Check-In</button>'
      + '      <a class="ldw_linkbtn" href="' + CFG.PREMIUM_URL + '">Premium</a>'
      + '      <button class="ldw_btn" id="ldw_login_btn" type="button">Login</button>'
      + '    </nav>'
      + '  </header>'
      + '  <main>'
      + '    <section class="ldw_hero">'
      + '      <div class="ldw_hero_inner">'
      + '        <div class="ldw_badge">Silly Squad is assembling</div>'
      + '        <h1 class="ldw_title"><span>ENTER THE WORLD</span></h1>'
      + '        <p class="ldw_sub">A mysterious social world where spirits explore rooms, meet ridiculous NPCs, collect Dust, unlock cosmetics, and slowly become better humans without the boring self-help lecture energy.</p>'
      + '        <div class="ldw_actions">'
      + '          <a class="ldw_btn ldw_btn_primary ldw_enter" href="' + CFG.WORLD_URL + '"><span>ENTER LIFEDECODE WORLD</span><small>Play, explore, meet NPCs, collect Dust & cause emotional damage</small></a>'
      + '          <button class="ldw_btn" id="ldw_hero_checkin" type="button">Do Daily Check-In first</button>'
      + '          <a class="ldw_btn ldw_btn_primary" href="' + CFG.PREMIUM_URL + '">Unlock Premium with Stripe</a>'
      + '        </div>'
      + '        <div class="ldw_micro">No login wall before landing • Privacy & terms stay available • Daily Check-In stays alive</div>'
      + '      </div>'
      + '    </section>'
      + '    <section class="ldw_grid" id="ldw_checkin_section">'
      + '      <article class="ldw_card">'
      + '        <div class="ldw_card_head"><div class="ldw_kicker">Why this world exists</div><h2>Not pay-to-win. Not soulless. Just weird, cozy, iconic progression.</h2></div>'
      + '        <div class="ldw_card_body"><div class="ldw_features">'
      + '          <div class="ldw_feature"><b>🌎 Explore rooms</b><p>Plaza, Brew Haven, Soulcore, Mind Zone and future maps with lore, quests and secrets.</p></div>'
      + '          <div class="ldw_feature"><b>👻 Build your spirit</b><p>Cosmetics, sets, identity and style without destroying the actual game balance.</p></div>'
      + '          <div class="ldw_feature"><b>🧠 Grow through play</b><p>Daily check-ins, symbolic systems, choices and NPC moments that quietly teach real-life skills.</p></div>'
      + '          <div class="ldw_feature"><b>✨ Meet the chaos</b><p>Cowboys, ninjas, pirates, princesses, emotional goblins and probably one NPC with tax issues.</p></div>'
      + '        </div></div>'
      + '      </article>'
      + '      <article class="ldw_card">'
      + '        <div class="ldw_card_head"><div class="ldw_kicker">Daily Check-In</div><h2>Drop your current state before entering the chaos.</h2></div>'
      + '        <div class="ldw_card_body"><div class="ldw_checkin_box">'
      + '          <textarea class="ldw_textarea" id="ldw_checkin_text" placeholder="How are you really doing today? One sentence is enough."></textarea>'
      + '          <button class="ldw_btn ldw_btn_primary" id="ldw_save_checkin" type="button">Save Check-In + Claim XP</button>'
      + '          <div class="ldw_ai_reply" id="ldw_ai_reply">AI response will appear here after your check-in.</div>'
      + '          <div class="ldw_saved" id="ldw_saved_checkin">Your last check-in will appear here.</div>'
      + '          <div class="ldw_note">Logged-in users get +' + CFG.DAILY_XP + ' XP once every 24 hours. If not logged in, the check-in saves locally and waits for login.</div>'
      + '        </div></div>'
      + '      </article>'
      + '    </section>'
      + '  </main>'
      + '  <footer class="ldw_footer"><a href="' + CFG.POLICY_URL + '">Privacy Policy</a><a href="' + CFG.TERMS_URL + '">Terms of Service</a><a href="mailto:simon.ovcar12@gmail.com">Contact</a></footer>'
      + '</div>'
      + '<div class="ldw_auth_modal" id="ldw_auth_modal" aria-hidden="true">'
      + '  <div class="ldw_modal_box">'
      + '    <div class="ldw_modal_head"><div><h3 id="ldw_auth_title">Login to save your progress</h3><div class="ldw_auth_sub" id="ldw_auth_sub">Connect your LifeDecode account so progress can sync safely.</div></div><button class="ldw_btn" id="ldw_close_login" type="button">Close</button></div>'
      + '    <div class="ldw_modal_body">'
      + '      <input class="ldw_input" id="ldw_email" type="email" autocomplete="email" placeholder="Email">'
      + '      <input class="ldw_input" id="ldw_password" type="password" autocomplete="current-password" placeholder="Password">'
      + '      <button class="ldw_btn ldw_btn_primary" id="ldw_email_login" type="button">Login</button>'
      + '      <button class="ldw_btn ldw_btn_primary" id="ldw_email_signup" type="button">Create account</button>'
      + '      <button class="ldw_btn" id="ldw_google_login" type="button">Continue with Google</button>'
      + '      <button class="ldw_btn" id="ldw_forgot_password" type="button">Forgot password?</button>'
      + '      <a class="ldw_btn ldw_btn_primary" href="' + CFG.PREMIUM_URL + '">Unlock Premium with Stripe</a>'
      + '      <button class="ldw_btn" id="ldw_logout" type="button" style="display:none">Logout</button>'
      + '      <div class="ldw_status" id="ldw_auth_status"></div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }

  function renderNow() {
    injectCSS();

    var app = document.getElementById("ldw_app");
    if (!app) {
      app = document.createElement("div");
      app.id = "ldw_app";
      if (document.body) {
        document.body.insertBefore(app, document.body.firstChild || null);
      } else {
        document.documentElement.appendChild(app);
      }
    }

    app.style.cssText = "display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:2147483000!important;min-height:100svh!important;background:#03020a!important;color:#fff!important;";
    app.innerHTML = getHTML();

    document.documentElement.style.background = "#03020a";
    if (document.body) {
      document.body.style.background = "#03020a";
      document.body.style.display = "block";
      document.body.style.visibility = "visible";
      document.body.style.opacity = "1";
      document.body.classList.remove("ld-no-scroll");
    }

    console.log("[LD] landing rendered:", CFG.VERSION);
  }

  function setWallpaper(url) {
    try {
      document.documentElement.style.setProperty("--ld-bg-img", 'url("' + url + '")');
    } catch (e) {}
  }

  function preloadWallpaperNoBlock() {
    for (var i = 0; i < CFG.ICONIC_URLS.length; i++) {
      (function (url) {
        var img = new Image();
        img.onload = function () {
          if (!window.__LD_WALLPAPER_OK__) {
            window.__LD_WALLPAPER_OK__ = true;
            setWallpaper(url);
            console.log("[LD] wallpaper loaded:", url);
          }
        };
        img.onerror = function () {};
        img.src = url;
      })(CFG.ICONIC_URLS[i]);
    }
  }

  function loadSupabaseScript(cb) {
    if (window.supabase && window.supabase.createClient) {
      cb(true);
      return;
    }

    var existing = document.querySelector('script[src*="@supabase/supabase-js"]');
    if (existing) {
      existing.addEventListener("load", function () { cb(true); }, { once: true });
      existing.addEventListener("error", function () { cb(false); }, { once: true });
      setTimeout(function () { cb(!!(window.supabase && window.supabase.createClient)); }, 4500);
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = function () { cb(true); };
    script.onerror = function () { cb(false); };
    (document.head || document.documentElement).appendChild(script);
  }

  function getSupabase(cb) {
    loadSupabaseScript(function (loaded) {
      if (!loaded || !window.supabase || !window.supabase.createClient) {
        cb(null);
        return;
      }

      if (!window.__LD_PAGE_SUPABASE__) {
        window.__LD_PAGE_SUPABASE__ = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
      }

      cb(window.__LD_PAGE_SUPABASE__);
    });
  }

  function getSession(cb) {
    getSupabase(function (client) {
      if (!client) {
        cb(null, null);
        return;
      }

      client.auth.getSession().then(function (res) {
        var session = res && res.data && res.data.session ? res.data.session : null;
        cb(client, session);
      }).catch(function () {
        cb(client, null);
      });
    });
  }

  function updateAuthUI() {
    var btn = document.getElementById("ldw_login_btn");
    var logoutBtn = document.getElementById("ldw_logout");
    var status = document.getElementById("ldw_auth_status");

    getSession(function (_client, session) {
      if (session && session.user) {
        if (btn) btn.textContent = "Account";
        if (logoutBtn) logoutBtn.style.display = "inline-flex";
        if (status && !status.textContent) status.textContent = "Logged in as " + (session.user.email || "LifeDecode user") + ".";
      } else {
        if (btn) btn.textContent = "Login";
        if (logoutBtn) logoutBtn.style.display = "none";
      }
    });
  }

  function callDailyCheckinServer(text, awardXp, cb) {
    getSession(function (_client, session) {
      var token = session && session.access_token ? session.access_token : "";
      var controller = new AbortController();
      var timeout = setTimeout(function () {
        try { controller.abort(); } catch (e) {}
      }, 25000);

      fetch(CFG.DAILY_CHECKIN_API_URL, {
        method: "POST",
        headers: Object.assign({
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*"
        }, token ? { "Authorization": "Bearer " + token } : {}),
        body: JSON.stringify({
          text: String(text || "").trim(),
          checkin: String(text || "").trim(),
          source: "lifedecode-app-landing",
          npc: "Ria",
          mode: "daily_checkin",
          awardXp: !!awardXp,
          skipAI: !!awardXp,
          skipXp: !awardXp,
          xp: CFG.DAILY_XP,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(timeout);
        var ct = res.headers.get("content-type") || "";
        return (ct.indexOf("application/json") >= 0 ? res.json() : res.text()).then(function (raw) {
          if (!res.ok) throw new Error(raw && raw.error ? raw.error : (typeof raw === "string" ? raw : "Server request failed"));
          cb(null, raw);
        });
      }).catch(function (err) {
        clearTimeout(timeout);
        cb(err);
      });
    });
  }

  function extractReply(data) {
    if (typeof data === "string") return data.trim();
    if (!data || typeof data !== "object") return "";
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        var r = extractReply(data[i]);
        if (r) return r;
      }
      return "";
    }

    var direct = data.reply || data.answer || data.message || data.text || data.output || data.result || data.response || data.content || data.ai || data.body || data.advice || data.ria || "";
    if (direct && typeof direct === "object") return extractReply(direct);
    if (direct) return String(direct).trim();

    var nestedKeys = ["data", "payload", "choices"];
    for (var k = 0; k < nestedKeys.length; k++) {
      var nested = extractReply(data[nestedKeys[k]]);
      if (nested) return nested;
    }

    return "";
  }

  function saveCheckinFlow() {
    var txt = document.getElementById("ldw_checkin_text");
    var saved = document.getElementById("ldw_saved_checkin");
    var aiReply = document.getElementById("ldw_ai_reply");
    var btn = document.getElementById("ldw_save_checkin");
    var value = txt ? String(txt.value || "").trim() : "";

    if (!value) {
      if (saved) saved.textContent = "Write at least one honest line first.";
      if (aiReply) aiReply.textContent = "Write how you feel first, then Ria can answer properly.";
      return;
    }

    var cooldown = getLocalCooldownInfo();
    if (!cooldown.allowed) {
      if (saved) saved.textContent = "Daily Check-In already claimed. Next check-in unlocks in " + formatDuration(cooldown.remainingMs) + ".";
      if (aiReply) aiReply.textContent = "24h timer is active. No second XP farm today, sneaky goblin.";
      return;
    }

    var original = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Ria is decoding...";
    }

    if (saved) saved.textContent = "Saving Check-In...";
    if (aiReply) aiReply.textContent = "Ria is reading your check-in...";

    var item = { text: value, date: new Date().toLocaleString(), iso: new Date().toISOString() };
    safeStorageSet(CFG.STORAGE_KEY, JSON.stringify(item));
    safeStorageSet(CFG.PENDING_XP_KEY, JSON.stringify({
      text: value,
      iso: item.iso,
      xp: CFG.DAILY_XP,
      awarded: false
    }));

    callDailyCheckinServer(value, false, function (aiErr, aiData) {
      var reply = aiErr ? "" : extractReply(aiData);
      if (aiReply) aiReply.textContent = reply || buildLocalCheckinAdvice(value);

      callDailyCheckinServer(value, true, function (xpErr, xpData) {
        var msg = "";
        if (!xpErr && xpData && xpData.ok && xpData.xp && Number(xpData.xp.gained || 0) > 0) {
          var gained = Number(xpData.xp.gained || CFG.DAILY_XP);
          rememberDailyCheckinAward(value, gained);
          safeStorageSet(CFG.PENDING_XP_KEY, JSON.stringify({
            text: value,
            iso: item.iso,
            xp: gained,
            awarded: true,
            lastAwardAt: new Date().toISOString()
          }));
          msg = "+" + gained + " XP added securely by the server.";
        } else if (!xpErr && xpData && xpData.xp && xpData.xp.blocked) {
          msg = "XP already claimed. Come back in " + formatDuration(Number(xpData.xp.remainingMs || 0)) + ".";
        } else {
          msg = "Check-In saved locally. XP server did not confirm award" + (xpErr ? ": " + (xpErr.message || xpErr) : ".") ;
        }

        if (saved) saved.textContent = "Last check-in (" + item.date + "):\n" + value + "\n\n" + msg;
        if (txt) txt.value = "";
        if (btn) {
          btn.disabled = false;
          btn.textContent = original || "Save Check-In + Claim XP";
        }
        updateAuthUI();
      });
    });
  }

  function bindEvents() {
    var goLinks = document.querySelectorAll('#ldw_app a[href="' + CFG.WORLD_URL + '"]');
    for (var i = 0; i < goLinks.length; i++) {
      goLinks[i].addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = CFG.WORLD_URL;
      });
    }

    var section = document.getElementById("ldw_checkin_section");
    var scroll = function () {
      if (section && section.scrollIntoView) section.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    var scrollBtn = document.getElementById("ldw_scroll_checkin");
    if (scrollBtn) scrollBtn.addEventListener("click", scroll);

    var heroCheckin = document.getElementById("ldw_hero_checkin");
    if (heroCheckin) heroCheckin.addEventListener("click", scroll);

    var saveBtn = document.getElementById("ldw_save_checkin");
    if (saveBtn) saveBtn.addEventListener("click", saveCheckinFlow);

    var saved = document.getElementById("ldw_saved_checkin");
    try {
      var item = JSON.parse(safeStorageGet(CFG.STORAGE_KEY, "null"));
      if (item && item.text && saved) {
        saved.textContent = "Last check-in (" + (item.date || item.iso || "saved") + "):\n" + item.text;
      }
    } catch (e) {}

    var modal = document.getElementById("ldw_auth_modal");
    var loginBtn = document.getElementById("ldw_login_btn");
    var closeBtn = document.getElementById("ldw_close_login");
    var status = document.getElementById("ldw_auth_status");

    function openModal() {
      if (!modal) return;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      updateAuthUI();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }

    if (loginBtn) loginBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

    var emailLogin = document.getElementById("ldw_email_login");
    if (emailLogin) emailLogin.addEventListener("click", function () {
      getSupabase(function (client) {
        if (!client) { if (status) status.textContent = "Supabase script could not load."; return; }
        var email = String((document.getElementById("ldw_email") || {}).value || "").trim();
        var password = String((document.getElementById("ldw_password") || {}).value || "");
        if (!email || !password) { if (status) status.textContent = "Email and password first."; return; }
        if (status) status.textContent = "Logging in...";
        client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
          if (status) status.textContent = res.error ? res.error.message : "Logged in. You can enter the World now.";
          updateAuthUI();
        }).catch(function (err) {
          if (status) status.textContent = err.message || String(err);
        });
      });
    });

    var emailSignup = document.getElementById("ldw_email_signup");
    if (emailSignup) emailSignup.addEventListener("click", function () {
      getSupabase(function (client) {
        if (!client) { if (status) status.textContent = "Supabase script could not load."; return; }
        var email = String((document.getElementById("ldw_email") || {}).value || "").trim();
        var password = String((document.getElementById("ldw_password") || {}).value || "");
        if (!email || !password) { if (status) status.textContent = "Email and password first."; return; }
        if (password.length < 8) { if (status) status.textContent = "Password must be at least 8 characters."; return; }
        if (status) status.textContent = "Creating account...";
        client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: CFG.AUTH_REDIRECT_URL } }).then(function (res) {
          if (status) status.textContent = res.error ? res.error.message : "Account created. Verify email if required, then login.";
          updateAuthUI();
        }).catch(function (err) {
          if (status) status.textContent = err.message || String(err);
        });
      });
    });

    var googleBtn = document.getElementById("ldw_google_login");
    if (googleBtn) googleBtn.addEventListener("click", function () {
      getSupabase(function (client) {
        if (!client) { if (status) status.textContent = "Supabase script could not load."; return; }
        if (status) status.textContent = "Opening Google login...";
        client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: CFG.AUTH_REDIRECT_URL } }).then(function (res) {
          if (res.error && status) status.textContent = res.error.message;
        });
      });
    });

    var forgotBtn = document.getElementById("ldw_forgot_password");
    if (forgotBtn) forgotBtn.addEventListener("click", function () {
      getSupabase(function (client) {
        if (!client) { if (status) status.textContent = "Supabase unavailable."; return; }
        var email = String((document.getElementById("ldw_email") || {}).value || "").trim();
        if (!email) { if (status) status.textContent = "Enter your email first."; return; }
        client.auth.resetPasswordForEmail(email, { redirectTo: CFG.AUTH_REDIRECT_URL }).then(function (res) {
          if (status) status.textContent = res.error ? res.error.message : "Password reset email sent.";
        });
      });
    });

    var logoutBtn = document.getElementById("ldw_logout");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      getSupabase(function (client) {
        if (!client) { if (status) status.textContent = "Supabase unavailable."; return; }
        client.auth.signOut().then(function () {
          if (status) status.textContent = "Logged out.";
          updateAuthUI();
        });
      });
    });

    getSupabase(function (client) {
      if (client && client.auth && client.auth.onAuthStateChange && !window.__LD_PAGE_AUTH_LISTENER__) {
        window.__LD_PAGE_AUTH_LISTENER__ = true;
        client.auth.onAuthStateChange(function () { updateAuthUI(); });
      }
      updateAuthUI();
    });
  }

  function stars() {
    var canvas = document.getElementById("ldw_stars");
    if (!canvas) return;

    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;

    var w = 0, h = 0, dpr = 1, points = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth || 1200;
      h = window.innerHeight || 800;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = [];
      var count = Math.min(90, Math.floor(w / 14));
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.7 + 0.4,
          a: Math.random() * 0.7 + 0.2,
          s: Math.random() * 0.35 + 0.08
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.y += p.s;
        if (p.y > h + 8) {
          p.y = -8;
          p.x = Math.random() * w;
        }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    tick();
  }

  function boot() {
    try {
      renderNow();
      bindEvents();
      stars();
      preloadWallpaperNoBlock();

      // If Webflow/interactions later mess with body/app, force visibility back.
      setTimeout(function () {
        var app = document.getElementById("ldw_app");
        if (app) {
          app.style.display = "block";
          app.style.visibility = "visible";
          app.style.opacity = "1";
        }
        if (document.body) {
          document.body.style.display = "block";
          document.body.style.visibility = "visible";
          document.body.style.opacity = "1";
        }
      }, 250);

      setTimeout(function () {
        var app = document.getElementById("ldw_app");
        if (app && !app.innerHTML.trim()) {
          app.innerHTML = '<div style="min-height:100vh;background:#03020a;color:#fff;padding:24px;font-family:Arial,sans-serif"><h1>LifeDecode World</h1><p>Fallback rendered. Main landing markup was empty.</p><p><a style="color:#9ee9ff" href="' + CFG.WORLD_URL + '">Enter World</a></p></div>';
        }
      }, 1000);
    } catch (err) {
      console.error("[LD] hard-fix boot failed:", err);
      try {
        var fallback = document.createElement("div");
        fallback.id = "ldw_app";
        fallback.style.cssText = "min-height:100vh;background:#03020a;color:#fff;padding:24px;font-family:Arial,sans-serif;position:relative;z-index:2147483000";
        fallback.innerHTML = '<h1>LifeDecode World</h1><p>Landing rescue loaded after an error.</p><p>' + escapeHTML(err && err.message ? err.message : err) + '</p><p><a style="color:#9ee9ff" href="' + CFG.WORLD_URL + '">Enter World</a></p>';
        if (document.body) document.body.insertBefore(fallback, document.body.firstChild || null);
      } catch (e) {}
    }
  }

  window.addEventListener("error", function (event) {
    try {
      console.warn("[LD] runtime warning:", event && event.message ? event.message : event);
      var app = document.getElementById("ldw_app");
      if (app) {
        app.style.display = "block";
        app.style.visibility = "visible";
        app.style.opacity = "1";
      }
    } catch (e) {}
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    // Safety: if DOMContentLoaded is weirdly delayed, still try.
    setTimeout(function () {
      if (!document.getElementById("ldw_app") && document.body) boot();
    }, 1200);
  } else {
    boot();
  }
})();

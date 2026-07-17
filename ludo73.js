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
    VERSION: "lifedecode-app-v14-hero-wallpaper-size",
    // Webflow does not serve this repo's files at any relative path (no
    // /assets/, no site root) — only assets uploaded through Webflow's own
    // asset manager get a same-origin URL. So the wallpaper has to be loaded
    // from GitHub directly. jsdelivr is the primary (proper CDN, already
    // used for the landing script itself); raw.githubusercontent.com is the
    // fallback. Both URLs must include the "assets/" path segment — the
    // file lives at assets/iconic2.png in the repo, not at the repo root.
    ICONIC_URL: "https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/assets/iconic2.png?v=lifedecode-iconic-bg-v6",
    ICONIC_FALLBACKS: [
      "https://raw.githubusercontent.com/simonovcar/lifedecode-assets/main/assets/iconic2.png?v=lifedecode-iconic-bg-v6"
    ],
    WORLD_URL: "https://world.lifedecode.app/#",
    POLICY_URL: "/policy",
    TERMS_URL: "/terms",
    PREMIUM_URL: "https://lifedecode.app/premium",
    STORAGE_KEY: "ld_world_daily_checkin_v1",
    PENDING_XP_KEY: "ld_world_pending_daily_xp_v1",
    LAST_CHECKIN_AWARD_KEY: "ld_world_daily_checkin_last_award_v1",
    CHECKIN_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    DAILY_XP: 75,
    API_BASE_URL: "https://lifedecode-game-production.up.railway.app",
    DAILY_CHECKIN_API_URL: "https://lifedecode-game-production.up.railway.app/api/daily-checkin",
    // Support form submissions. This endpoint does not exist on the backend
    // yet — see the server.js handler documented alongside bindSupportWidget()
    // below. Until it's deployed, submissions will correctly surface a real
    // error state instead of a fake success.
    SUPPORT_API_URL: "https://lifedecode-game-production.up.railway.app/api/support-request",
    SUPPORT_SEND_COOLDOWN_MS: 5 * 60 * 1000,
    SUPPORT_LAST_SENT_KEY: "ld_support_last_sent_v1",
    DB_TABLE: "ld_user_state",
    DB_KEY: "world",
    AUTH_REDIRECT_URL: window.location.origin + window.location.pathname,
    SUPABASE_URL: "https://nnqiahypfkdoqkclknoe.supabase.co",
    SUPABASE_KEY: "sb_publishable_t2Nl119Q73xYsR4Vdrg79Q_v1pC7DAL",
    // Support widget contact channels. support@lifedecode.app is the address
    // already published on the real Privacy Policy page, so it's used here
    // for consistency (previously this pointed at a personal address).
    SUPPORT_EMAIL: "support@lifedecode.app",
    // No official Discord invite exists yet — leave empty to keep the button hidden.
    SUPPORT_DISCORD_URL: "",
    // No business WhatsApp number is configured yet. Set this to a full
    // "https://wa.me/<number>" link to enable the WhatsApp action in the
    // support widget — leave empty to keep it hidden.
    SUPPORT_WHATSAPP_URL: ""
  };

  const CSS = `
:root{
  --ld-bg:#03020a;
  --ld-panel:rgba(9,6,24,.68);
  --ld-panel2:rgba(7,4,18,.82);
  --ld-line:rgba(225,158,255,.16);
  --ld-text:#fff7ff;
  --ld-muted:rgba(255,247,255,.72);
  --ld-soft:rgba(255,247,255,.52);
  --ld-pink:#ff55df;
  --ld-purple:#9b5cff;
  --ld-blue:#43d8ff;
  --ld-green:#86ff58;
  --ld-gold:#ffd36a;
  --ld-flame:#ff6a4d;
  --ldw-iconic-image:url("${CFG.ICONIC_URL}");
  --ldw-container:min(1320px, calc(100% - 40px));
  --ldw-hero-container:min(1600px, calc(100% - 48px));
  --ldw-radius-lg:26px;
  --ldw-radius-md:18px;
  --ldw-radius-sm:12px;
  --ldw-header-h:64px;
}
html{scroll-behavior:smooth;scroll-padding-top:calc(var(--ldw-header-h) + 14px);}
html,body{margin:0;min-height:100%;background:var(--ld-bg)!important;}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ld-text);overflow-x:hidden;}
body.ld-no-scroll{overflow:hidden;}
#ldw_app,#ldw_app *{box-sizing:border-box;}
#ldw_app{min-height:100svh;position:relative;isolation:isolate;background:transparent;color:var(--ld-text);display:block!important;visibility:visible!important;opacity:1!important;}
#ldw_bg{position:fixed;inset:0;z-index:0;background:#03020a;overflow:hidden;pointer-events:none;}
#ldw_bg:before{content:"";position:absolute;inset:0;background-image:linear-gradient(180deg,rgba(3,2,10,.10),rgba(3,2,10,.34) 46%,rgba(3,2,10,.84) 96%),radial-gradient(900px 560px at 50% 4%,rgba(201,62,255,.16),transparent 62%);background-size:cover,cover;background-position:center,center;opacity:.95;}
#ldw_bg:after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(3,2,10,.30) 74%,rgba(3,2,10,.86) 100%);}
#ldw_noise{position:fixed;inset:0;z-index:1;opacity:.05;pointer-events:none;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");}
#ldw_stars{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:.5;}

.ldw_container{width:var(--ldw-container);margin:0 auto;}

/* Single controlled gap between every top-level section (hero included).
   This replaces per-section padding as the source of inter-section
   spacing — see the note on .ldw_section below. */
main{display:flex;flex-direction:column;gap:clamp(28px,2.8vw,44px);}

/* Header */
.ldw_header{position:sticky;top:0;z-index:40;width:100%;background:rgba(6,4,16,.42);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.05);transition:background-color .25s ease,border-color .25s ease,box-shadow .25s ease;}
.ldw_header.is-scrolled{background:rgba(6,4,16,.84);border-bottom-color:rgba(225,158,255,.14);box-shadow:0 14px 34px rgba(0,0,0,.30);}
.ldw_header_inner{min-height:var(--ldw-header-h);display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;}
.ldw_brand{display:flex;flex-direction:column;gap:1px;min-width:0;}
.ldw_brand_main{font-family:Orbitron,Inter,system-ui,sans-serif;font-weight:900;letter-spacing:.07em;font-size:clamp(13px,1.3vw,17px);line-height:1;background:linear-gradient(92deg,#fff,#b9eaff 24%,#a56cff 52%,#ff67e1 82%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap;}
.ldw_brand_sub{font-family:Orbitron,Inter,system-ui,sans-serif;font-weight:800;letter-spacing:.36em;font-size:clamp(7px,.7vw,8.5px);color:rgba(255,235,255,.60);text-transform:uppercase;}
.ldw_nav{display:flex;align-items:center;gap:8px;}
.ldw_nav_secondary{display:flex;align-items:center;gap:6px;}
.ldw_btn,.ldw_linkbtn{border:1px solid rgba(225,158,255,.16);background:rgba(255,255,255,.03);color:var(--ld-text);border-radius:999px;min-height:36px;padding:0 14px;font-weight:800;letter-spacing:.03em;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:transform .15s ease,border-color .15s ease,background .15s ease,filter .15s ease;white-space:nowrap;}
.ldw_btn:hover,.ldw_linkbtn:hover{transform:translateY(-1px);border-color:rgba(245,205,255,.32);background:rgba(255,255,255,.07);}
.ldw_btn:focus-visible,.ldw_linkbtn:focus-visible{outline:2px solid rgba(255,255,255,.75);outline-offset:2px;}
.ldw_btn_primary{border-color:rgba(255,255,255,.22);background:linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.80) 55%,rgba(42,214,255,.80));box-shadow:0 10px 26px rgba(160,70,255,.22);font-weight:900;}
.ldw_btn_primary:hover{filter:brightness(1.08);}
.ldw_btn_ghost_sm{min-height:34px;padding:0 12px;font-size:11.5px;background:transparent;}
.ldw_menu_toggle{display:none;width:38px;height:38px;border-radius:11px;border:1px solid rgba(225,158,255,.16);background:rgba(255,255,255,.03);align-items:center;justify-content:center;cursor:pointer;color:var(--ld-text);flex-shrink:0;}
.ldw_menu_toggle svg{width:17px;height:17px;}
.ldw_menu_toggle:focus-visible{outline:2px solid rgba(255,255,255,.75);outline-offset:2px;}
@media(max-width:820px){
  .ldw_menu_toggle{display:inline-flex;}
  .ldw_nav_secondary{position:fixed;top:var(--ldw-header-h);left:0;right:0;flex-direction:column;align-items:stretch;gap:8px;padding:12px 16px 18px;background:rgba(6,4,16,.97);backdrop-filter:blur(18px);border-bottom:1px solid rgba(225,158,255,.14);box-shadow:0 20px 40px rgba(0,0,0,.35);transform:translateY(-6px);opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease;}
  .ldw_nav_secondary.open{opacity:1;transform:translateY(0);pointer-events:auto;}
  .ldw_nav_secondary .ldw_btn,.ldw_nav_secondary .ldw_linkbtn{width:100%;min-height:46px;font-size:13px;}
}
@media(prefers-reduced-motion:reduce){.ldw_header,.ldw_nav_secondary{transition:none;}}

/* Hero */
.ldw_hero{position:relative;width:var(--ldw-hero-container);margin:clamp(14px,2.4vw,22px) auto 0;border-radius:var(--ldw-radius-lg);overflow:hidden;min-height:clamp(460px,76vh,820px);display:flex;align-items:flex-end;justify-content:center;text-align:center;padding:clamp(22px,4vw,52px) clamp(18px,4vw,44px);border:1px solid rgba(225,158,255,.16);box-shadow:0 30px 90px rgba(0,0,0,.45);}
.ldw_hero:before{content:"";position:absolute;inset:0;background-image:var(--ldw-iconic-image);background-size:cover;background-position:center 18%;z-index:0;filter:saturate(1.1) contrast(1.02);}
.ldw_hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,2,10,0) 0%,rgba(3,2,10,.02) 40%,rgba(3,2,10,.60) 78%,rgba(3,2,10,.90) 100%);z-index:0;}
.ldw_hero_inner{position:relative;z-index:1;width:min(680px,100%);}
.ldw_badge{display:inline-flex;align-items:center;justify-content:center;margin:0 0 16px;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(20,10,34,.5);color:#fff;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;backdrop-filter:blur(6px);}
.ldw_title{margin:0 auto 16px;font-family:Orbitron,Inter,system-ui,sans-serif;font-size:clamp(36px,6vw,76px);font-weight:900;line-height:.94;letter-spacing:-.03em;text-shadow:0 10px 34px rgba(0,0,0,.66);}
.ldw_title span{background:linear-gradient(92deg,#fff 0%,#b8eaff 22%,#a66cff 48%,#ff61df 76%,#fff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ldw_sub{max-width:560px;margin:0 auto;color:rgba(250,245,255,.90);font-size:clamp(15px,1.25vw,19px);line-height:1.55;text-shadow:0 3px 14px rgba(0,0,0,.75);}
.ldw_actions{display:flex;flex-wrap:wrap;gap:12px 14px;align-items:center;justify-content:center;margin-top:26px;}
.ldw_enter{min-height:58px;padding:0 34px;border-radius:999px;font-size:16px;}
.ldw_hero_secondary{background:transparent;border:1px solid rgba(255,255,255,.24);min-height:52px;padding:0 24px;font-size:13.5px;}
.ldw_micro{margin:18px auto 0;color:rgba(255,255,255,.62);font-size:12px;font-weight:700;letter-spacing:.06em;}
.ldw_scroll_hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:1;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.85);animation:ldwBounce 2.2s ease-in-out infinite;text-decoration:none;}
.ldw_scroll_hint svg{width:13px;height:13px;}
@keyframes ldwBounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(5px);}}
@media(prefers-reduced-motion:reduce){.ldw_scroll_hint{animation:none;}}
@media(max-width:560px){.ldw_scroll_hint{display:none;}}
/* A landscape 3:2 hero image on a tall narrow box crops too much of its
   width under background-size:cover — shorten the box on phones so more
   of the character lineup stays in frame. */
@media(max-width:640px){.ldw_hero{min-height:clamp(380px,58vh,560px);background-position:center 20%;}.ldw_hero:before{background-position:center 20%;}}
@media(max-width:400px){.ldw_hero{min-height:clamp(360px,54vh,500px);}}

/* Sections — single source of truth for inter-section spacing: a flex gap
   on <main> (below). Per-section top/bottom padding is intentionally zero,
   because that padding was stacking with the OWN internal padding of inner
   card wrappers (.ldw_checkin_card, .ldw_final_cta, .ldw_feature cells,
   .ldw_room/.ldw_npc cards) — previous section's card-padding + this
   section's own padding + next section's own padding was three layers
   deep at some boundaries (measured up to ~100px), which is what kept
   producing large gaps no matter how much the section padding alone was
   trimmed. Only the border-top hairline remains here; the divider costs
   no layout space. */
.ldw_section{padding:0;border-top:1px solid rgba(255,255,255,.05);}
.ldw_section_head{max-width:600px;margin:0 auto clamp(18px,2.4vw,28px);text-align:center;}
.ldw_kicker{font-size:11px;font-weight:900;letter-spacing:.20em;text-transform:uppercase;color:rgba(255,236,255,.50);}
.ldw_section_head h2{margin:9px 0 0;font-family:Orbitron,Inter,system-ui,sans-serif;font-size:clamp(23px,3.1vw,38px);font-weight:850;line-height:1.08;letter-spacing:-.02em;}
.ldw_section_head p{margin:12px 0 0;color:var(--ld-muted);font-size:14px;line-height:1.6;}
.ldw_section_note{margin:16px auto 0;max-width:520px;text-align:center;color:var(--ld-soft);font-size:12.5px;line-height:1.5;}

/* What is LifeDecode World */
.ldw_manifesto{max-width:640px;margin:0 auto clamp(28px,4vw,40px);text-align:center;color:var(--ld-muted);font-size:14.5px;line-height:1.65;}
.ldw_feature_grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:var(--ldw-radius-md);overflow:hidden;}
.ldw_feature{background:rgba(9,6,20,.55);padding:18px 20px;}
.ldw_feature b{display:block;font-size:15px;margin-bottom:8px;}
.ldw_feature p{margin:0;color:var(--ld-muted);font-size:13.5px;line-height:1.55;}
@media(max-width:640px){.ldw_feature_grid{grid-template-columns:1fr;}}

/* Explore the world */
.ldw_rooms{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
.ldw_room{position:relative;border-radius:var(--ldw-radius-md);padding:16px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);overflow:hidden;}
.ldw_room:before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent);}
.ldw_room h3{margin:6px 0 8px;font-size:15.5px;}
.ldw_room p{margin:0;color:var(--ld-muted);font-size:13px;line-height:1.5;}
@media(max-width:900px){.ldw_rooms{grid-template-columns:repeat(2,1fr);}}
@media(max-width:560px){.ldw_rooms{grid-template-columns:1fr;}}

/* Meet the Silly Squad */
.ldw_catchphrases{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0 0;}
.ldw_catchphrase{padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.62);}
.ldw_npcs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:clamp(28px,4vw,36px);}
.ldw_npc{position:relative;border-radius:var(--ldw-radius-md);padding:16px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);}
.ldw_npc:before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent);border-radius:var(--ldw-radius-md) var(--ldw-radius-md) 0 0;}
.ldw_npc_icon{font-size:24px;line-height:1;margin-bottom:10px;}
.ldw_npc h3{margin:0 0 7px;font-size:15px;}
.ldw_npc p{margin:0;color:var(--ld-muted);font-size:12.5px;line-height:1.5;}
@media(max-width:900px){.ldw_npcs{grid-template-columns:repeat(2,1fr);}}
@media(max-width:560px){.ldw_npcs{grid-template-columns:1fr;}}

/* Daily Check-In */
.ldw_checkin_card{max-width:700px;margin:0 auto;border:1px solid rgba(225,158,255,.16);border-radius:var(--ldw-radius-lg);background:linear-gradient(180deg,rgba(10,6,26,.62),rgba(6,4,16,.52));backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:clamp(18px,2.2vw,24px);box-shadow:0 22px 60px rgba(0,0,0,.28);}
.ldw_checkin_box{display:grid;gap:12px;}
.ldw_textarea{width:100%;min-height:120px;resize:vertical;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.05);color:var(--ld-text);padding:13px;outline:none;font:inherit;line-height:1.45;}
.ldw_textarea:focus-visible{border-color:rgba(255,107,227,.42);box-shadow:0 0 0 4px rgba(155,92,255,.12);}
.ldw_save_checkin_btn{min-height:46px;font-size:12.5px;}
.ldw_ai_reply{min-height:80px;border:1px solid rgba(255,85,223,.16);border-radius:16px;background:linear-gradient(180deg,rgba(255,85,223,.07),rgba(67,216,255,.04));padding:13px;color:rgba(255,247,255,.88);font-size:13.5px;line-height:1.5;white-space:pre-wrap;}
.ldw_saved{min-height:44px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.035);padding:11px;color:var(--ld-muted);font-size:12.5px;line-height:1.45;white-space:pre-wrap;}
.ldw_note{color:var(--ld-soft);font-size:11.5px;line-height:1.45;}

/* Cosmetics */
.ldw_cosmetics{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(24px,4vw,40px);align-items:start;}
.ldw_cosmetics_copy h2{margin:9px 0 0;font-family:Orbitron,Inter,system-ui,sans-serif;font-size:clamp(22px,2.8vw,34px);font-weight:850;letter-spacing:-.02em;line-height:1.1;}
.ldw_cosmetics_copy p{margin:12px 0 0;color:var(--ld-muted);font-size:14px;line-height:1.65;max-width:440px;}
.ldw_swatches{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.ldw_swatch{aspect-ratio:1;border-radius:20px;border:1px solid rgba(255,255,255,.10);}
.ldw_swatch:nth-child(1){background:linear-gradient(140deg,var(--ld-blue),transparent);}
.ldw_swatch:nth-child(2){background:linear-gradient(140deg,var(--ld-pink),transparent);}
.ldw_swatch:nth-child(3){background:linear-gradient(140deg,var(--ld-purple),transparent);}
.ldw_swatch:nth-child(4){background:linear-gradient(140deg,var(--ld-green),transparent);}
.ldw_swatch:nth-child(5){background:linear-gradient(140deg,var(--ld-gold),transparent);}
.ldw_swatch:nth-child(6){background:linear-gradient(140deg,var(--ld-flame),transparent);}
@media(max-width:820px){.ldw_cosmetics{grid-template-columns:1fr;}}

/* Legal accordion */
.ldw_accordion{border-top:1px solid rgba(255,255,255,.07);padding-top:18px;max-width:640px;margin:0 auto;}
.ldw_accordion summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:9px;font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,247,255,.66);}
.ldw_accordion summary::-webkit-details-marker{display:none;}
.ldw_accordion summary:before{content:"+";font-size:15px;color:var(--ld-pink);width:14px;}
.ldw_accordion[open] summary:before{content:"–";}
.ldw_accordion div{padding:12px 0 4px;color:var(--ld-muted);line-height:1.6;font-size:13px;}

/* Final CTA */
.ldw_final_cta{position:relative;text-align:center;padding:clamp(28px,4vw,48px) clamp(20px,4vw,40px) clamp(18px,2.4vw,28px);border-radius:var(--ldw-radius-lg);border:1px solid rgba(225,158,255,.18);background:radial-gradient(120% 160% at 50% 0%,rgba(124,60,255,.16),transparent 60%),linear-gradient(180deg,rgba(10,6,26,.7),rgba(6,4,16,.6));overflow:hidden;}
.ldw_final_cta h2{margin:0 auto 10px;max-width:520px;font-family:Orbitron,Inter,system-ui,sans-serif;font-size:clamp(22px,3vw,36px);font-weight:900;letter-spacing:-.02em;line-height:1.12;}
.ldw_final_cta p{margin:0 auto 22px;max-width:440px;color:var(--ld-muted);font-size:14px;line-height:1.55;}

/* Footer */
.ldw_footer{padding:clamp(12px,1.5vw,20px) 0 34px;text-align:center;}
.ldw_footer_tag{margin:0 0 16px;color:var(--ld-soft);font-size:12px;}
.ldw_footer_links{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}
.ldw_footer_links a{color:rgba(245,239,255,.72);text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;border:1px solid rgba(214,164,255,.14);background:rgba(255,255,255,.03);padding:9px 13px;border-radius:999px;}
.ldw_footer_links a:hover{color:#fff;border-color:rgba(230,190,255,.28);background:rgba(255,255,255,.06);}
.ldw_footer_links a:focus-visible{outline:2px solid rgba(255,255,255,.75);outline-offset:2px;}
.ldw_footer_copyright{margin:16px 0 0;color:rgba(255,247,255,.36);font-size:11px;}

/* Auth modal (functionality untouched — visual refresh only) */
.ldw_auth_modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:18px;overflow:hidden;background:radial-gradient(900px 560px at 18% 8%,rgba(255,176,107,.16),transparent 58%),radial-gradient(760px 560px at 84% 14%,rgba(155,92,255,.16),transparent 58%),rgba(2,3,10,.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
.ldw_auth_modal.open{display:flex;}
.ldw_auth_ambient{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;border-radius:30px;}
.ldw_auth_mote{position:absolute;bottom:-10px;border-radius:50%;opacity:0;animation-name:ldwAuthFloat;animation-timing-function:ease-in;animation-iteration-count:infinite;filter:blur(.2px);}
@keyframes ldwAuthFloat{0%{transform:translateY(0) scale(.6);opacity:0;}12%{opacity:.9;}88%{opacity:.22;}100%{transform:translateY(-360px) scale(1.15);opacity:0;}}
.ldw_modal_box{position:relative;width:min(420px,calc(100vw - 28px));max-height:min(92vh,780px);overflow-y:auto;border:1px solid rgba(255,221,170,.22);border-radius:28px;background:linear-gradient(165deg,rgba(24,17,34,.92),rgba(7,7,15,.96));box-shadow:0 30px 90px rgba(0,0,0,.58);scrollbar-width:thin;scrollbar-color:rgba(255,196,107,.4) transparent;}
.ldw_modal_head{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:24px 24px 4px;}
.ldw_modal_head h3{margin:0;font-size:clamp(19px,2.6vw,24px);line-height:1.1;letter-spacing:-.02em;font-weight:900;background:linear-gradient(90deg,#fff,#ffe6c2);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ldw_modal_head .ldw_auth_kicker{margin-bottom:9px;font-size:10.5px;line-height:1;text-transform:uppercase;letter-spacing:.18em;color:#ffd68a;font-weight:900;}
.ldw_modal_head .ldw_auth_sub{margin-top:9px;max-width:600px;color:rgba(255,247,255,.72);font-size:13px;line-height:1.5;font-weight:500;}
.ldw_modal_body{position:relative;z-index:1;padding:8px 24px 24px;display:grid;gap:11px;}
.ldw_auth_tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.05);}
.ldw_auth_tab{border:0;border-radius:12px;min-height:40px;background:transparent;color:rgba(255,247,255,.62);font:inherit;font-size:11.5px;font-weight:900;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:filter .15s ease,color .15s ease,background .15s ease;}
.ldw_auth_tab.active{color:#1a0f00;background:linear-gradient(90deg,#ffe6b3,#ffd68a,#d8c4ff);}
.ldw_auth_tab:hover{filter:brightness(1.06);}
.ldw_input{width:100%;min-height:46px;border:1px solid rgba(255,221,170,.18);border-radius:16px;background:rgba(255,255,255,.06);color:var(--ld-text);padding:0 15px;outline:none;font:inherit;font-size:14px;font-weight:700;transition:border-color .15s ease,box-shadow .15s ease;}
.ldw_input:focus-visible{border-color:rgba(255,196,107,.65);box-shadow:0 0 0 4px rgba(255,196,107,.12);}
.ldw_auth_actions{display:grid;gap:9px;}
.ldw_auth_primary{min-height:46px!important;border-radius:999px!important;font-size:13.5px!important;font-weight:900!important;letter-spacing:0!important;text-transform:none!important;background:linear-gradient(90deg,#ffe6b3,#ffd68a,#d8c4ff)!important;color:#1a0f00!important;border-color:rgba(255,255,255,.28)!important;}
.ldw_auth_google{min-height:46px!important;border-radius:999px!important;background:#fff!important;color:#3c4043!important;border-color:#dadce0!important;text-transform:none!important;font-size:13.5px!important;font-weight:700!important;letter-spacing:0!important;gap:10px!important;}
.ldw_auth_google_icon{width:17px;height:17px;flex-shrink:0;}
.ldw_auth_apple{min-height:46px!important;border-radius:999px!important;background:#000!important;color:#fff!important;border-color:rgba(255,255,255,.14)!important;text-transform:none!important;font-size:13.5px!important;font-weight:700!important;letter-spacing:0!important;gap:10px!important;}
.ldw_auth_apple_icon{width:13px;height:16px;flex-shrink:0;}
.ldw_auth_ghost{min-height:46px!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;text-transform:none!important;font-size:13.5px!important;font-weight:800!important;letter-spacing:0!important;}
.ldw_auth_link{border:0!important;background:transparent!important;min-height:auto!important;padding:4px 6px!important;color:#ffd68a!important;text-transform:none!important;font-size:12.5px!important;letter-spacing:.01em!important;font-weight:900!important;box-shadow:none!important;justify-self:center;}
.ldw_auth_link:hover{text-decoration:underline;transform:none!important;filter:none!important;}
.ldw_auth_divider{display:flex;align-items:center;gap:10px;margin:5px 0 1px;color:rgba(255,255,255,.4);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;}
.ldw_auth_divider:before,.ldw_auth_divider:after{content:"";flex:1;height:1px;background:rgba(255,255,255,.13);}
.ldw_auth_resend{display:none;}
.ldw_status{min-height:20px;color:rgba(255,247,255,.74);font-size:12.5px;line-height:1.45;text-align:center;font-weight:650;}
.ldw_auth_hidden{display:none!important;}
@media(prefers-reduced-motion:reduce){.ldw_auth_mote{animation:none;display:none;}}
@media(max-width:560px){.ldw_auth_modal{align-items:flex-start;padding:10px;}.ldw_modal_box{width:100%;border-radius:22px;margin:8px 0;max-height:96vh;}.ldw_modal_head{padding:20px 18px 4px;}.ldw_modal_body{padding:7px 18px 18px;}}

/* Support widget */
.ldw_support{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:12px;}
.ldw_support_toggle{position:relative;width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.82) 55%,rgba(42,214,255,.82));color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 14px 34px rgba(120,50,255,.30);transition:transform .18s ease,box-shadow .18s ease;flex-shrink:0;}
.ldw_support_toggle:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(120,50,255,.38);}
.ldw_support_toggle:focus-visible{outline:2px solid #fff;outline-offset:3px;}
.ldw_support_toggle svg{width:22px;height:22px;}
.ldw_support_tooltip{position:absolute;right:calc(100% + 10px);top:50%;transform:translateY(-50%) translateX(4px);white-space:nowrap;background:rgba(14,10,24,.95);border:1px solid rgba(225,158,255,.18);color:var(--ld-text);font-size:12px;font-weight:750;padding:7px 12px;border-radius:999px;box-shadow:0 10px 26px rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;}
.ldw_support_toggle:hover .ldw_support_tooltip,.ldw_support_toggle:focus-visible .ldw_support_tooltip{opacity:1;transform:translateY(-50%) translateX(0);}
.ldw_support.open .ldw_support_tooltip{display:none;}
.ldw_support_panel{width:min(360px,calc(100vw - 32px));max-height:min(80vh,600px);overflow-y:auto;border-radius:var(--ldw-radius-md);border:1px solid rgba(225,158,255,.18);background:linear-gradient(165deg,rgba(20,14,32,.97),rgba(6,5,14,.98));box-shadow:0 26px 70px rgba(0,0,0,.5);padding:20px;transform:translateY(8px) scale(.98);opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease;scrollbar-width:thin;scrollbar-color:rgba(255,196,107,.4) transparent;}
.ldw_support.open .ldw_support_panel{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
.ldw_support_head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:4px;}
.ldw_support_panel h3{margin:0;font-size:15px;line-height:1.3;}
.ldw_support_sub{margin:5px 0 16px;color:var(--ld-muted);font-size:12px;line-height:1.5;}
.ldw_support_close{min-height:26px;min-width:26px;padding:0;border-radius:9px;flex-shrink:0;font-size:13px;}
.ldw_support_extra_links{display:grid;gap:8px;margin-bottom:4px;}
.ldw_support_extra_links:empty{display:none;margin:0;}
.ldw_support_extra_links .ldw_btn,.ldw_support_extra_links .ldw_linkbtn{width:100%;min-height:40px;font-size:12px;}
.ldw_support_form{display:grid;gap:13px;}
.ldw_field{display:grid;gap:6px;font-size:12px;color:rgba(255,247,255,.78);font-weight:700;}
.ldw_field em{color:var(--ld-pink);font-style:normal;}
.ldw_field small{color:var(--ld-soft);font-weight:600;text-transform:none;}
.ldw_select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;}
.ldw_select option{background:#140d20;color:#fff;}
.ldw_support_textarea{min-height:96px;}
.ldw_field_error{display:none;color:#ff8ba8;font-size:11px;font-weight:700;}
.ldw_field.has_error .ldw_input,.ldw_field.has_error .ldw_support_textarea{border-color:rgba(255,90,130,.55);}
.ldw_field.has_error .ldw_field_error{display:block;}
.ldw_hp_field{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}
.ldw_support_consent{margin:0;color:var(--ld-soft);font-size:11px;line-height:1.5;}
.ldw_support_consent a{color:#ffd68a;}
.ldw_support_submit{width:100%;min-height:46px;font-size:13px;}
.ldw_support_submit:disabled{opacity:.6;cursor:default;}
.ldw_support_form_status{min-height:18px;font-size:12px;line-height:1.5;font-weight:650;text-align:center;}
.ldw_support_form_status.is-error{color:#ff8ba8;}
.ldw_support_form_status.is-ok{color:#8affc1;}
.ldw_support_done{text-align:center;padding:8px 0 4px;}
.ldw_support_done p{margin:8px 0 0;color:var(--ld-muted);font-size:13px;line-height:1.55;}
@media(prefers-reduced-motion:reduce){.ldw_support_toggle,.ldw_support_panel,.ldw_support_tooltip{transition:none;}}
@media(max-width:480px){.ldw_support{right:12px;bottom:12px;}.ldw_support_toggle{width:48px;height:48px;}.ldw_support_panel{width:calc(100vw - 24px);}}
`;

  const HTML = `
<div id="ldw_bg" aria-hidden="true"></div>
<div id="ldw_noise" aria-hidden="true"></div>
<canvas id="ldw_stars" aria-hidden="true"></canvas>

<header class="ldw_header" id="ldw_header">
  <div class="ldw_container ldw_header_inner">
    <div class="ldw_brand" aria-label="LifeDecode World">
      <div class="ldw_brand_main">LIFEDECODE</div>
      <div class="ldw_brand_sub">WORLD</div>
    </div>
    <nav class="ldw_nav" aria-label="Main navigation">
      <div class="ldw_nav_secondary" id="ldw_nav_secondary">
        <button class="ldw_btn ldw_btn_ghost_sm" id="ldw_scroll_checkin" type="button">Daily Check-In</button>
        <a class="ldw_linkbtn ldw_btn_ghost_sm" id="ldw_premium_nav" href="${CFG.WORLD_URL}">Shop</a>
        <button class="ldw_btn ldw_btn_ghost_sm" id="ldw_login_btn" type="button">Login</button>
      </div>
      <a class="ldw_linkbtn ldw_btn_primary" href="${CFG.WORLD_URL}">Enter World</a>
      <button class="ldw_menu_toggle" id="ldw_menu_toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="ldw_nav_secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
      </button>
    </nav>
  </div>
</header>

<div class="ldw_shell">
  <main>
    <section class="ldw_hero" aria-label="LifeDecode World intro">
      <div class="ldw_hero_inner">
        <div class="ldw_badge">Silly Squad is assembling</div>
        <h1 class="ldw_title"><span>ENTER THE WORLD</span></h1>
        <p class="ldw_sub">A mysterious social world where spirits explore rooms, meet ridiculous NPCs, and slowly become better humans — without the self-help lecture energy.</p>
        <div class="ldw_actions">
          <a class="ldw_btn ldw_btn_primary ldw_enter" href="${CFG.WORLD_URL}">Enter LifeDecode World</a>
          <button class="ldw_btn ldw_hero_secondary" id="ldw_hero_checkin" type="button">Daily Check-In</button>
        </div>
        <div class="ldw_micro">No login wall before landing &bull; Privacy &amp; terms stay available</div>
      </div>
      <a class="ldw_scroll_hint" href="#ldw_what_section" aria-label="Scroll to learn more">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
    </section>

    <section class="ldw_section ldw_container" id="ldw_what_section" aria-label="What is LifeDecode World">
      <div class="ldw_section_head">
        <div class="ldw_kicker">Why this world exists</div>
        <h2>Not pay-to-win. Not soulless. Just weird, cozy, iconic progression.</h2>
      </div>
      <p class="ldw_manifesto">LifeDecode World is a small, strange corner of the internet where your daily choices actually do something. No lecture energy, no forced positivity — just rooms to explore, NPCs with opinions, and a spirit that slowly levels up because you showed up.</p>
      <div class="ldw_feature_grid">
        <div class="ldw_feature"><b>🌎 Explore rooms</b><p>Plaza, Brew Haven, Soulcore, Mind Zone and future maps with lore, quests and secrets.</p></div>
        <div class="ldw_feature"><b>👻 Build your spirit</b><p>Cosmetics, sets, identity and style without destroying the actual game balance.</p></div>
        <div class="ldw_feature"><b>🧠 Grow through play</b><p>Daily check-ins, symbolic systems, choices and NPC moments that quietly teach real-life skills.</p></div>
        <div class="ldw_feature"><b>✨ Meet the chaos</b><p>Cowboys, ninjas, pirates, princesses, emotional goblins and probably one NPC with tax issues.</p></div>
      </div>
    </section>

    <section class="ldw_section ldw_container" aria-label="Explore the world">
      <div class="ldw_section_head">
        <div class="ldw_kicker">The map so far</div>
        <h2>Four rooms. Infinite chaos.</h2>
      </div>
      <div class="ldw_rooms">
        <div class="ldw_room" style="--accent:var(--ld-blue)"><h3>Plaza</h3><p>The first stop. Loud, welcoming, mildly suspicious.</p></div>
        <div class="ldw_room" style="--accent:var(--ld-pink)"><h3>Brew Haven</h3><p>Sit down, order something imaginary, regret a decision out loud.</p></div>
        <div class="ldw_room" style="--accent:var(--ld-purple)"><h3>Soulcore</h3><p>Where the actual character growth quietly happens.</p></div>
        <div class="ldw_room" style="--accent:var(--ld-green)"><h3>Mind Zone</h3><p>For when your brain needs a different kind of chaos.</p></div>
      </div>
      <p class="ldw_section_note">More rooms keep getting added to the map.</p>
    </section>

    <section class="ldw_section ldw_container" aria-label="Meet the Silly Squad">
      <div class="ldw_section_head">
        <div class="ldw_kicker">The usual suspects</div>
        <h2>Meet the Silly Squad</h2>
        <div class="ldw_catchphrases">
          <span class="ldw_catchphrase">Yee-Haw</span>
          <span class="ldw_catchphrase">Hmph.</span>
          <span class="ldw_catchphrase">Arrr! Treasure!</span>
          <span class="ldw_catchphrase">Really?</span>
        </div>
      </div>
      <div class="ldw_npcs">
        <div class="ldw_npc" style="--accent:var(--ld-blue)"><div class="ldw_npc_icon">🤠</div><h3>The Cowboy</h3><p>Rolls in with pure chaotic confidence. Says "Yee-Haw," means nothing by it, ropes you into a quest anyway.</p></div>
        <div class="ldw_npc" style="--accent:var(--ld-flame)"><div class="ldw_npc_icon">🥷</div><h3>The Ninja</h3><p>Says "Hmph" and radiates devastating main-character energy for someone who talks the least.</p></div>
        <div class="ldw_npc" style="--accent:var(--ld-green)"><div class="ldw_npc_icon">🏴‍☠️</div><h3>The Pirate</h3><p>Yells "Arrr! Treasure!" at inappropriate volumes. Financially motivated. Emotionally unavailable.</p></div>
        <div class="ldw_npc" style="--accent:var(--ld-purple)"><div class="ldw_npc_icon">👑</div><h3>The Princess</h3><p>Unimpressed by literally everything. "Really?" is both a greeting and a review of your life choices.</p></div>
      </div>
    </section>

    <section class="ldw_section ldw_container" id="ldw_checkin_section" aria-label="Daily Check-In">
      <div class="ldw_section_head">
        <div class="ldw_kicker">Daily Check-In</div>
        <h2>Drop your current state before entering the chaos.</h2>
      </div>
      <div class="ldw_checkin_card">
        <div class="ldw_checkin_box">
          <textarea class="ldw_textarea" id="ldw_checkin_text" placeholder="How are you really doing today? One sentence is enough. No fake wellness influencer nonsense required."></textarea>
          <button class="ldw_btn ldw_btn_primary ldw_save_checkin_btn" id="ldw_save_checkin" type="button">Save Check-In + Claim XP</button>
          <div class="ldw_ai_reply" id="ldw_ai_reply">AI response will appear here after your check-in.</div>
          <div class="ldw_saved" id="ldw_saved_checkin">Your last check-in will appear here.</div>
          <div class="ldw_note">Logged-in users get +${CFG.DAILY_XP} XP once every 24 hours directly into the same World database state. If not logged in, the check-in saves locally and waits for login.</div>
        </div>
      </div>
    </section>

    <section class="ldw_section ldw_container" aria-label="Cosmetics and identity">
      <div class="ldw_cosmetics">
        <div class="ldw_cosmetics_copy">
          <div class="ldw_kicker">Look the part</div>
          <h2>Build your spirit</h2>
          <p>Cosmetics, sets, identity and style without destroying the actual game balance. Unlock pieces as you play — no shortcuts that quietly ruin the game for everyone else.</p>
        </div>
        <div class="ldw_swatches" aria-hidden="true">
          <div class="ldw_swatch"></div><div class="ldw_swatch"></div><div class="ldw_swatch"></div>
          <div class="ldw_swatch"></div><div class="ldw_swatch"></div><div class="ldw_swatch"></div>
        </div>
      </div>
    </section>

    <section class="ldw_section ldw_container" aria-label="Privacy and legal">
      <details class="ldw_accordion">
        <summary>Privacy, safety and boring-but-important adult paperwork</summary>
        <div>
          LifeDecode World keeps the landing open before login, while Privacy Policy and Terms stay directly accessible. This page is focused on the World, but the important legal links remain visible for visitors, app verification, and general sanity.
        </div>
      </details>
    </section>

    <section class="ldw_section ldw_container">
      <div class="ldw_final_cta">
        <h2>Your spirit is waiting. Kind of impatiently.</h2>
        <p>No pressure. Just a mysterious world, a Daily Check-In, and a princess who is unimpressed by your life choices.</p>
        <a class="ldw_btn ldw_btn_primary ldw_enter" href="${CFG.WORLD_URL}">Enter LifeDecode World</a>
      </div>
    </section>
  </main>

  <footer class="ldw_footer ldw_container" aria-label="Legal footer">
    <p class="ldw_footer_tag">LifeDecode World — enter at your own emotional risk.</p>
    <div class="ldw_footer_links">
      <a href="${CFG.POLICY_URL}">Privacy Policy</a>
      <a href="${CFG.TERMS_URL}">Terms of Service</a>
      <a href="mailto:${CFG.SUPPORT_EMAIL}">Contact</a>
    </div>
    <p class="ldw_footer_copyright">&copy; 2026 LifeDecode World</p>
  </footer>
</div>

<div class="ldw_auth_modal" id="ldw_auth_modal" aria-hidden="true">
  <div class="ldw_modal_box" role="dialog" aria-modal="true" aria-label="LifeDecode account">
    <div class="ldw_auth_ambient" id="ldw_auth_ambient"></div>
    <div class="ldw_modal_head">
      <div>
        <div class="ldw_auth_kicker">&#10024; LifeDecode World</div>
        <h3 id="ldw_auth_title">Welcome back, adventurer</h3>
        <div class="ldw_auth_sub" id="ldw_auth_sub">Sign in to keep your Beans, Dust, and unlocks safe &mdash; or jump in as a guest right now.</div>
      </div>
      <button class="ldw_btn" id="ldw_close_login" type="button">Close</button>
    </div>
    <div class="ldw_modal_body">
      <div class="ldw_auth_tabs" role="tablist" aria-label="Auth tabs">
        <button class="ldw_auth_tab active" id="ldw_tab_login" type="button">Login</button>
        <button class="ldw_auth_tab" id="ldw_tab_register" type="button">Register</button>
      </div>
      <input class="ldw_input" id="ldw_email" type="email" autocomplete="email" placeholder="Email">
      <input class="ldw_input" id="ldw_password" type="password" autocomplete="current-password" placeholder="Password">
      <div class="ldw_auth_actions">
        <button class="ldw_btn ldw_btn_primary ldw_auth_primary" id="ldw_email_login" type="button">Login</button>
        <button class="ldw_btn ldw_btn_primary ldw_auth_primary ldw_auth_hidden" id="ldw_email_signup" type="button">Create account</button>
        <button class="ldw_btn ldw_auth_link" id="ldw_forgot_password" type="button">Forgot password?</button>

        <div class="ldw_auth_divider"><span>or continue with</span></div>

        <button class="ldw_btn ldw_auth_google" id="ldw_google_login" type="button">
          <svg class="ldw_auth_google_icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
        <button class="ldw_btn ldw_auth_apple" id="ldw_apple_login" type="button">
          <svg class="ldw_auth_apple_icon" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#ffffff" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-89.6 123.1-159.5 123.1s-94-44.9-180.4-44.9c-91.1 0-119.7 44.9-191.2 44.9-71.5 0-122.6-65.6-167.4-128.3-58.4-81.5-105.2-208.6-105.2-329.1 0-192.3 124.4-294.2 246.9-294.2 75.4 0 138 41.7 184.5 41.7 41.7 0 110.3-44.9 192.1-44.9 31.6 0 145.4 2.9 222.6 113.1zM560.3 144.4c20.4-22.2 35.4-53.8 35.4-85.4 0-4.5-.4-9.1-1.2-12.8-29.9 1.2-65.2 19.8-87 44.9-19.5 22-37.1 53.4-37.1 84.6 0 5.1.8 10.1 1.2 11.7 2.5.6 6.7 1.2 11.1 1.2 26.9 0 60.7-17.9 77.6-44.2z"/>
          </svg>
          <span>Sign in with Apple</span>
        </button>

        <button class="ldw_btn ldw_auth_ghost" id="ldw_guest_continue" type="button">&#127881; Continue as Guest</button>
        <button class="ldw_btn ldw_auth_link ldw_auth_resend" id="ldw_resend_verify" type="button">Resend verification email</button>
        <a class="ldw_btn ldw_btn_primary ldw_auth_primary" id="ldw_buy_premium" href="${CFG.WORLD_URL}">Open LifeDecode World</a>
        <button class="ldw_btn ldw_auth_ghost" id="ldw_logout" type="button" style="display:none">Logout</button>
      </div>
      <div class="ldw_status" id="ldw_auth_status"></div>
    </div>
  </div>
</div>

<div class="ldw_support" id="ldw_support">
  <div class="ldw_support_panel" id="ldw_support_panel" role="dialog" aria-modal="false" aria-labelledby="ldw_support_title">
    <div class="ldw_support_head">
      <div>
        <h3 id="ldw_support_title">How can we help?</h3>
        <p class="ldw_support_sub">Send us a message and we'll get back to you by email.</p>
      </div>
      <button class="ldw_btn ldw_support_close" id="ldw_support_close" type="button" aria-label="Close support panel">&#10005;</button>
    </div>
    <div class="ldw_support_extra_links" id="ldw_support_extra_links"></div>
    <form class="ldw_support_form" id="ldw_support_form" novalidate>
      <label class="ldw_field" id="ldw_support_email_field" for="ldw_support_email_input">
        <span>Email <em>*</em></span>
        <input class="ldw_input" id="ldw_support_email_input" type="email" name="email" autocomplete="email" required placeholder="you@example.com">
        <span class="ldw_field_error" id="ldw_support_email_error" role="alert"></span>
      </label>
      <label class="ldw_field" id="ldw_support_category_field" for="ldw_support_category">
        <span>What's this about? <em>*</em></span>
        <select class="ldw_input ldw_select" id="ldw_support_category" name="category" required>
          <option value="">Choose a category</option>
          <option value="account">Account / Login</option>
          <option value="billing">Billing / Purchases</option>
          <option value="bug">Bug report</option>
          <option value="checkin">Daily Check-In</option>
          <option value="other">Something else</option>
        </select>
        <span class="ldw_field_error" id="ldw_support_category_error" role="alert"></span>
      </label>
      <label class="ldw_field" for="ldw_support_username">
        <span>Username <small>(optional)</small></span>
        <input class="ldw_input" id="ldw_support_username" type="text" name="username" autocomplete="username" maxlength="60" placeholder="Your in-world name">
      </label>
      <label class="ldw_field" id="ldw_support_message_field" for="ldw_support_message">
        <span>Tell us what's happening <em>*</em></span>
        <textarea class="ldw_input ldw_support_textarea" id="ldw_support_message" name="message" required maxlength="2000" placeholder="The more detail, the faster we can help."></textarea>
        <span class="ldw_field_error" id="ldw_support_message_error" role="alert"></span>
      </label>
      <div class="ldw_hp_field" aria-hidden="true">
        <label for="ldw_support_hp">Leave this field empty</label>
        <input type="text" id="ldw_support_hp" name="company" tabindex="-1" autocomplete="off">
      </div>
      <p class="ldw_support_consent">By sending this, you agree we can use these details to reply to your request. See our <a href="${CFG.POLICY_URL}" target="_blank" rel="noopener">Privacy Policy</a>.</p>
      <button class="ldw_btn ldw_btn_primary ldw_support_submit" id="ldw_support_submit" type="submit">Send message</button>
      <div class="ldw_support_form_status" id="ldw_support_form_status" role="status" aria-live="polite"></div>
    </form>
    <div class="ldw_support_done ldw_auth_hidden" id="ldw_support_done">
      <div style="font-size:26px;">&#10003;</div>
      <p id="ldw_support_done_text">Sent. We'll reply to your email soon.</p>
      <button class="ldw_btn ldw_btn_ghost_sm" id="ldw_support_send_another" type="button" style="margin-top:12px;">Send another message</button>
    </div>
  </div>
  <button class="ldw_support_toggle" id="ldw_support_toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="ldw_support_panel" aria-label="Open support form" aria-describedby="ldw_support_tooltip">
    <span class="ldw_support_tooltip" id="ldw_support_tooltip" role="tooltip">Contact support</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </button>
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

  function setIconicWallpaperUrl(url) {
    try {
      document.documentElement.style.setProperty("--ldw-iconic-image", `url("${url}")`);
    } catch (e) {}
  }

  function testImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function preloadIconicWallpaper() {
    const urls = [CFG.ICONIC_URL].concat(CFG.ICONIC_FALLBACKS || []);
    for (const url of urls) {
      if (!url) continue;
      setIconicWallpaperUrl(url);
      const ok = await testImage(url);
      if (ok) {
        if (!document.getElementById("ldw_iconic_preload")) {
          const link = document.createElement("link");
          link.id = "ldw_iconic_preload";
          link.rel = "preload";
          link.as = "image";
          link.href = url;
          document.head.appendChild(link);
        }
        console.log("[LD] iconic wallpaper loaded:", url);
        return url;
      }
    }
    console.warn("[LD] iconic wallpaper failed on all URLs. Check asset name/path/case in GitHub/Webflow assets.");
    return null;
  }

  function injectCSS() {
    if (document.getElementById("ldw_style")) return;
    const style = document.createElement("style");
    style.id = "ldw_style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Lightweight ambient sparkles for the login modal — pure CSS keyframes,
  // no animation loop/timer. Mirrors the same technique used on the
  // LifeDecode World login panel for visual consistency.
  function buildAuthMotesHtml() {
    const colors = ["#ffd68a", "#ff9ecb", "#b99cff", "#9ee9ff"];
    let html = "";
    for (let i = 0; i < 14; i++) {
      const left = Math.round(Math.random() * 100);
      const delay = (Math.random() * 10).toFixed(2);
      const dur = (8 + Math.random() * 7).toFixed(2);
      const size = (2 + Math.random() * 3).toFixed(1);
      const color = colors[i % colors.length];
      html += '<span class="ldw_auth_mote" style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;background:' + color + ';animation-delay:' + delay + 's;animation-duration:' + dur + 's;"></span>';
    }
    return html;
  }

  function render() {
    // WHITE-SCREEN RESCUE v8:
    // Always create a top-level app directly under body and make it visually independent
    // from Webflow wrappers/interactions. This prevents a hidden parent wrapper from hiding the app.
    let oldNested = document.getElementById("ldw_app") || document.getElementById("ld_app");
    if (oldNested && oldNested.parentElement !== document.body) {
      oldNested.remove();
    }

    let app = document.getElementById("ldw_app");
    if (!app || app.parentElement !== document.body) {
      app = document.createElement("div");
      app.id = "ldw_app";
      document.body.insertBefore(app, document.body.firstChild || null);
    }

    Object.assign(app.style, {
      display: "block",
      visibility: "visible",
      opacity: "1",
      minHeight: "100svh",
      position: "relative",
      zIndex: "2147483000"
    });

    app.innerHTML = HTML;

    const authAmbient = document.getElementById("ldw_auth_ambient");
    if (authAmbient) authAmbient.innerHTML = buildAuthMotesHtml();

    // Hide Webflow default visible sections only after our app exists and has content.
    Array.from(document.body.children).forEach((el) => {
      if (el === app) return;
      const tag = (el.tagName || "").toUpperCase();
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") return;
      el.setAttribute("data-ldw-hidden", "1");
      el.style.display = "none";
    });

    // If any external script/style later hides the body/app, force it back once more.
    setTimeout(() => {
      try {
        document.documentElement.style.background = "#03020a";
        document.body.style.background = "#03020a";
        app.style.display = "block";
        app.style.visibility = "visible";
        app.style.opacity = "1";
      } catch (err) {}
    }, 250);
  }

  function loadSupabaseScript() {
    return new Promise((resolve) => {
      if (window.supabase && window.supabase.createClient) return resolve(true);
      const existing = document.querySelector('script[src*="@supabase/supabase-js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        setTimeout(() => resolve(!!(window.supabase && window.supabase.createClient)), 4500);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function getSupabase() {
    const loaded = await loadSupabaseScript();
    if (!loaded || !window.supabase || !window.supabase.createClient) return null;
    if (!window.__LDW_SUPABASE__) {
      window.__LDW_SUPABASE__ = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return window.__LDW_SUPABASE__;
  }

  async function getSession() {
    const client = await getSupabase();
    if (!client) return { client: null, session: null };
    const { data } = await client.auth.getSession();
    return { client, session: data && data.session ? data.session : null };
  }

  async function callDailyCheckinServer(text, options = {}) {
    const { session } = await getSession();
    const token = session && session.access_token ? session.access_token : "";
    const body = {
      text: String(text || "").trim(),
      checkin: String(text || "").trim(),
      source: "lifedecode-app-landing",
      npc: "Ria",
      mode: "daily_checkin",
      awardXp: options.awardXp !== false,
      skipAI: options.skipAI === true,
      skipXp: options.skipXp === true,
      xp: CFG.DAILY_XP,
      timestamp: new Date().toISOString()
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(options.timeoutMs || 25000));

    try {
      const res = await fetch(CFG.DAILY_CHECKIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const contentType = res.headers.get("content-type") || "";
      const raw = contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        const msg = raw && raw.error ? raw.error : (typeof raw === "string" ? raw : ("Server request failed: " + res.status));
        throw new Error(msg);
      }

      return raw && typeof raw === "object" ? raw : { ok: true, reply: String(raw || "") };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  function getXPForLevel(level) {
    const cleanLevel = Math.max(1, Math.floor(Number(level) || 1));
    if (cleanLevel <= 1) return 0;
    return Math.floor(100 * Math.pow(cleanLevel - 1, 1.35));
  }

  function getLevelFromXP(xp) {
    const cleanXP = Math.max(0, Math.floor(Number(xp) || 0));
    let lvl = 1;
    for (let next = 2; next <= 100; next++) {
      if (cleanXP >= getXPForLevel(next)) lvl = next;
      else break;
    }
    return lvl;
  }

  function extractAIReply(data) {
    if (typeof data === "string") return data.trim();
    if (!data || typeof data !== "object") return "";

    if (Array.isArray(data)) {
      for (const item of data) {
        const nested = extractAIReply(item);
        if (nested) return nested;
      }
      return "";
    }

    const direct = data.reply || data.answer || data.message || data.text || data.output || data.result ||
      data.response || data.content || data.ai || data.body || data.advice || data.ria || "";

    if (direct && typeof direct === "object") return extractAIReply(direct);
    if (direct) return String(direct).trim();

    for (const key of ["data", "payload", "choices"]) {
      const nested = extractAIReply(data[key]);
      if (nested) return nested;
    }

    try {
      const firstChoice = data.choices && data.choices[0] && (data.choices[0].message || data.choices[0].text);
      const nested = extractAIReply(firstChoice);
      if (nested) return nested;
    } catch (e) {}

    return "";
  }

  function buildLocalCheckinAdvice(text) {
    const clean = String(text || "").trim();
    const lower = clean.toLowerCase();

    let focus = "First: pause. Breathe in for 4, hold for 2, out for 6. Do that three times before you make any dramatic little goblin decisions.";
    if (/(anx|panic|strah|nerv|tesn|overwhelm|stres|stress)/i.test(lower)) {
      focus = "Your nervous system sounds overloaded. Do 3 slow breaths, unclench your jaw, drink water, then pick ONE tiny next action. Not ten. One.";
    } else if (/(sad|žal|zal|depres|empty|praz|lonely|sam|down|slab)/i.test(lower)) {
      focus = "This sounds heavy, not lazy. Lower the bar today: shower, food, fresh air for 5 minutes. Tiny wins count. The goblin brain hates that, tragic for him.";
    } else if (/(angry|jezn|besn|mad|frustr|rage|fuck|kurc)/i.test(lower)) {
      focus = "You sound activated. Do not reply, buy, quit, text, or burn the village yet. Move your body for 2 minutes, then decide from a calmer state.";
    } else if (/(tired|utruj|sleep|spat|exhaust|burn)/i.test(lower)) {
      focus = "Your body is waving a tiny white flag. Make the next task stupidly small, then sleep or rest as soon as possible. Productivity is cute, but biology owns the building.";
    } else if (/(good|dobr|super|happy|mirn|ok|fine|great)/i.test(lower)) {
      focus = "Good. Use the stable mood like a cheat code: do one useful thing now while your brain is cooperating for once. Gorgeous. Suspicious, but gorgeous.";
    }

    return "Ria says:\n" + focus + "\n\nTiny mission for today: write down what triggered this mood, choose one next action, and enter the World only after you do that one thing. +XP is cute, but self-control is the real loot.";
  }

  async function requestDailyCheckinAI(text) {
    try {
      const data = await callDailyCheckinServer(text, { awardXp: false, skipXp: true, timeoutMs: 25000 });
      const reply = extractAIReply(data) || data.reply || data.answer || data.message || "";
      return {
        ok: true,
        reply: reply || buildLocalCheckinAdvice(text)
      };
    } catch (err) {
      console.error("[LD] Daily Check-In AI server error:", err);
      return {
        ok: false,
        reply: buildLocalCheckinAdvice(text) + "\n\nNote: Secure server AI endpoint did not return properly, so this fallback kept the check-in alive instead of leaving the user staring into the void like a cursed loading screen."
      };
    }
  }

  function normalizeWorldStateForXP(state, deltaXP) {
    const cleanState = state && typeof state === "object" ? state : {};
    const world = cleanState[CFG.DB_KEY] && typeof cleanState[CFG.DB_KEY] === "object" ? cleanState[CFG.DB_KEY] : {};
    const xpSystem = cleanState.xpSystem && typeof cleanState.xpSystem === "object" ? cleanState.xpSystem : (world.xpSystem && typeof world.xpSystem === "object" ? world.xpSystem : {});
    const oldXP = Math.max(0, Math.floor(Number(cleanState.xp ?? cleanState.exp ?? world.xp ?? xpSystem.xp ?? xpSystem.total ?? 0) || 0));
    const newXP = Math.max(0, oldXP + Math.max(0, Math.floor(Number(deltaXP) || 0)));
    const level = getLevelFromXP(newXP);
    const now = new Date().toISOString();
    const awardLog = xpSystem.awardLog && typeof xpSystem.awardLog === "object" ? xpSystem.awardLog : {};
    const dailyKey = "landing_daily_checkin_" + new Date().toISOString().slice(0, 10);
    awardLog[dailyKey] = { action: "landing_daily_checkin", xp: deltaXP, at: now };
    const nextXPSystem = { ...xpSystem, xp: newXP, total: newXP, level, awardLog, updatedAt: now, lastDailyCheckinAt: now };
    const xpMeta = { total: newXP, level, updatedAt: now, source: "lifedecode-app-daily-checkin" };
    return {
      ...cleanState,
      [CFG.DB_KEY]: { ...world, xpSystem: nextXPSystem, xp: newXP, level, lastDailyCheckin: { at: now, xp: deltaXP, source: "lifedecode.app" } },
      xp: newXP,
      exp: newXP,
      level,
      xpMeta,
      xpSystem: nextXPSystem,
      lastDailyCheckin: { at: now, xp: deltaXP, source: "lifedecode.app" }
    };
  }

  async function awardDailyCheckinXP(text) {
    const { session } = await getSession();
    const now = new Date().toISOString();
    const payload = {
      text,
      date: new Date().toLocaleString(),
      iso: now,
      xp: CFG.DAILY_XP,
      awarded: false,
      user_id: session && session.user ? session.user.id : null
    };

    try { localStorage.setItem(CFG.PENDING_XP_KEY, JSON.stringify(payload)); } catch (e) {}

    const cooldown = await getDailyCheckinCooldownInfo();
    if (!cooldown.allowed) {
      return { ok: false, blocked: true, message: `Daily Check-In is already claimed. Come back in ${formatDuration(cooldown.remainingMs)} for the next +${CFG.DAILY_XP} XP.` };
    }

    if (!session || !session.user || !session.access_token) {
      return { ok: false, queued: true, message: `Saved locally. Login first to claim +${CFG.DAILY_XP} XP in the World.` };
    }

    try {
      const data = await callDailyCheckinServer(text, { awardXp: true, skipAI: true, timeoutMs: 25000 });

      if (data && data.ok && data.xp && data.xp.gained > 0) {
        payload.awarded = true;
        payload.lastAwardAt = data.xp.lastDailyCheckinAt || new Date().toISOString();
        rememberDailyCheckinAward(text);
        try { localStorage.setItem(CFG.PENDING_XP_KEY, JSON.stringify(payload)); } catch (e) {}
        return { ok: true, message: `Daily Check-In saved. +${data.xp.gained || CFG.DAILY_XP} XP added securely by the server.` };
      }

      if (data && data.xp && data.xp.blocked) {
        const remainingMs = Number(data.xp.remainingMs || 0);
        return {
          ok: false,
          blocked: true,
          message: `Daily Check-In is already claimed. Come back in ${formatDuration(remainingMs)} for the next +${CFG.DAILY_XP} XP.`
        };
      }

      return { ok: false, queued: true, message: (data && data.message) || `Check-In saved, but XP was not awarded.` };
    } catch (err) {
      console.warn("[LD] Secure XP endpoint failed:", err);
      return { ok: false, queued: true, message: `Check-In saved locally, but secure XP server failed: ${err.message || err}` };
    }
  }


  function formatDuration(ms) {
    const clean = Math.max(0, Number(ms) || 0);
    const totalMinutes = Math.ceil(clean / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) return minutes + "m";
    if (minutes <= 0) return hours + "h";
    return hours + "h " + minutes + "m";
  }

  function getStoredLastCheckinAt() {
    try {
      const award = JSON.parse(localStorage.getItem(CFG.LAST_CHECKIN_AWARD_KEY) || "null");
      const awardRaw = award && award.lastAwardAt;
      const awardTime = awardRaw ? new Date(awardRaw).getTime() : 0;
      if (awardTime && Number.isFinite(awardTime)) return awardTime;
    } catch (e) {}

    try {
      const pending = JSON.parse(localStorage.getItem(CFG.PENDING_XP_KEY) || "null");
      // Only an already-awarded pending payload counts for the 24h lock.
      // A freshly queued unsent payload must not block its own XP write.
      if (pending && pending.awarded) {
        const pendingRaw = pending.lastAwardAt || pending.iso || pending.at;
        const pendingTime = pendingRaw ? new Date(pendingRaw).getTime() : 0;
        if (pendingTime && Number.isFinite(pendingTime)) return pendingTime;
      }
    } catch (e) {}

    return 0;
  }

  async function getRemoteLastCheckinAt() {
    const { client, session } = await getSession();
    if (!client || !session || !session.user) return 0;
    try {
      const { data } = await client
        .from(CFG.DB_TABLE)
        .select("state")
        .eq("user_id", session.user.id)
        .maybeSingle();
      const state = data && data.state && typeof data.state === "object" ? data.state : {};
      const candidates = [
        state.lastDailyCheckin && state.lastDailyCheckin.at,
        state.world && state.world.lastDailyCheckin && state.world.lastDailyCheckin.at,
        state.xpSystem && state.xpSystem.lastDailyCheckinAt,
        state.world && state.world.xpSystem && state.world.xpSystem.lastDailyCheckinAt
      ];
      for (const raw of candidates) {
        const time = raw ? new Date(raw).getTime() : 0;
        if (time && Number.isFinite(time)) return time;
      }
    } catch (err) {
      console.warn("[LD] Could not read remote daily check-in timer:", err);
    }
    return 0;
  }

  async function getDailyCheckinCooldownInfo() {
    const localAt = getStoredLastCheckinAt();
    const remoteAt = await getRemoteLastCheckinAt();
    const lastAt = Math.max(localAt, remoteAt);
    if (!lastAt) return { allowed: true, lastAt: 0, remainingMs: 0 };
    const remainingMs = CFG.CHECKIN_COOLDOWN_MS - (Date.now() - lastAt);
    return {
      allowed: remainingMs <= 0,
      lastAt,
      remainingMs: Math.max(0, remainingMs)
    };
  }

  function rememberDailyCheckinAward(text) {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(CFG.LAST_CHECKIN_AWARD_KEY, JSON.stringify({
        text: String(text || "").slice(0, 500),
        lastAwardAt: now,
        xp: CFG.DAILY_XP
      }));
    } catch (e) {}
  }

  async function updateAuthUI() {
    const btn = document.getElementById("ldw_login_btn");
    const logoutBtn = document.getElementById("ldw_logout");
    const status = document.getElementById("ldw_auth_status");
    const title = document.getElementById("ldw_auth_title");
    const sub = document.getElementById("ldw_auth_sub");
    const authTabs = document.querySelector(".ldw_auth_tabs");
    const authFields = [
      document.getElementById("ldw_email"),
      document.getElementById("ldw_password"),
      document.getElementById("ldw_email_login"),
      document.getElementById("ldw_email_signup"),
      document.getElementById("ldw_forgot_password"),
      document.getElementById("ldw_google_login"),
      document.getElementById("ldw_apple_login"),
      document.getElementById("ldw_guest_continue"),
      document.getElementById("ldw_resend_verify")
    ];
    const premiumBtn = document.getElementById("ldw_buy_premium");
    const { session } = await getSession();

    if (session && session.user) {
      if (btn) {
        btn.textContent = "Account";
        btn.title = session.user.email || "Logged in";
      }
      if (title) title.textContent = "Your LifeDecode account";
      if (sub) sub.textContent = "Logged in as " + (session.user.email || "LifeDecode user") + ". Enter the World to continue your progress.";
      if (authTabs) authTabs.classList.add("ldw_auth_hidden");
      authFields.forEach((el) => { if (el) el.classList.add("ldw_auth_hidden"); });
      if (premiumBtn) premiumBtn.classList.remove("ldw_auth_hidden");
      if (logoutBtn) {
        logoutBtn.style.display = "inline-flex";
        logoutBtn.classList.remove("ldw_auth_hidden");
      }
      if (status && !status.textContent) status.textContent = "Logged in as " + (session.user.email || "LifeDecode user") + ".";
    } else {
      if (btn) {
        btn.textContent = "Login";
        btn.title = "";
      }
      if (title) title.textContent = "Welcome back, adventurer";
      if (sub) sub.textContent = "Sign in to keep your Beans, Dust, and unlocks safe — or jump in as a guest right now.";
      if (authTabs) authTabs.classList.remove("ldw_auth_hidden");
      if (premiumBtn) premiumBtn.classList.remove("ldw_auth_hidden");
      if (logoutBtn) logoutBtn.style.display = "none";
      // setAuthMode() restores the correct login/register fields when opening the modal.
    }
  }

  async function flushPendingCheckinXP() {
    let pending = null;
    try { pending = JSON.parse(localStorage.getItem(CFG.PENDING_XP_KEY) || "null"); } catch (e) {}
    if (!pending || pending.awarded || !pending.text) return null;
    const { session } = await getSession();
    if (!session || !session.user) return null;
    const result = await awardDailyCheckinXP(pending.text);
    const status = document.getElementById("ldw_auth_status");
    if (status && result && result.ok) status.textContent = result.message;
    return result;
  }

  function bind() {
    const goWorld = (e) => {
      if (e) e.preventDefault();
      document.body.classList.remove("ld-no-scroll");
      window.location.href = CFG.WORLD_URL;
    };
    document.querySelectorAll('a[href="' + CFG.WORLD_URL + '"]').forEach((a) => {
      a.addEventListener("click", goWorld);
    });

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

    document.getElementById("ldw_save_checkin")?.addEventListener("click", async () => {
      const value = (txt.value || "").trim();
      const btn = document.getElementById("ldw_save_checkin");
      const aiReply = document.getElementById("ldw_ai_reply");

      if (!value) {
        saved.textContent = "Write at least one honest line first. The void accepts nonsense, but this box does not.";
        if (aiReply) aiReply.textContent = "Write how you feel first, then Ria can answer properly.";
        return;
      }

      const cooldown = await getDailyCheckinCooldownInfo();
      if (!cooldown.allowed) {
        const waitText = `Daily Check-In already claimed. Next check-in unlocks in ${formatDuration(cooldown.remainingMs)}.`;
        saved.textContent = waitText;
        if (aiReply) aiReply.textContent = "24h timer is active. No second XP farm today, you sneaky little goblin. Come back when the timer resets.";
        return;
      }

      const originalBtnText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Ria is decoding...";
      }

      if (aiReply) aiReply.textContent = "Ria is reading your check-in and preparing advice...";
      saved.textContent = "Saving Check-In + trying to award XP...";

      const item = { text: value, date: new Date().toLocaleString() };
      try { localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(item)); } catch (e) {}

      try {
        const aiTask = requestDailyCheckinAI(value);
        const xpTask = awardDailyCheckinXP(value);
        const [aiResult, xpResult] = await Promise.allSettled([aiTask, xpTask]);

        const finalAI = aiResult.status === "fulfilled" && aiResult.value && aiResult.value.reply
          ? aiResult.value.reply
          : buildLocalCheckinAdvice(value);

        const finalXP = xpResult.status === "fulfilled" && xpResult.value
          ? xpResult.value
          : { message: "Check-In saved locally, but XP write failed before completion." };

        if (aiReply) aiReply.textContent = finalAI;
        showSaved();
        saved.textContent += "\n\n" + (finalXP.message || "");
        txt.value = "";
      } catch (err) {
        console.error("[LD] Daily Check-In save flow failed:", err);
        if (aiReply) aiReply.textContent = buildLocalCheckinAdvice(value);
        showSaved();
        saved.textContent += "\n\nCheck-In saved locally, but the full save flow hit an error.";
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalBtnText || "Save Check-In + Claim XP";
        }
        updateAuthUI();
      }
    });

    const modal = document.getElementById("ldw_auth_modal");
    const status = document.getElementById("ldw_auth_status");
    let authMode = "login";

    function setAuthMode(nextMode) {
      authMode = nextMode === "register" ? "register" : "login";
      const title = document.getElementById("ldw_auth_title");
      const sub = document.getElementById("ldw_auth_sub");
      const tabLogin = document.getElementById("ldw_tab_login");
      const tabRegister = document.getElementById("ldw_tab_register");
      const loginBtn = document.getElementById("ldw_email_login");
      const signupBtn = document.getElementById("ldw_email_signup");
      const forgotBtn = document.getElementById("ldw_forgot_password");
      const resendBtn = document.getElementById("ldw_resend_verify");
      const password = document.getElementById("ldw_password");

      const authTabs = document.querySelector(".ldw_auth_tabs");
      const email = document.getElementById("ldw_email");
      const googleBtn = document.getElementById("ldw_google_login");
      const appleBtn = document.getElementById("ldw_apple_login");
      const guestBtn = document.getElementById("ldw_guest_continue");
      if (authTabs) authTabs.classList.remove("ldw_auth_hidden");
      [email, password, googleBtn, appleBtn, guestBtn].forEach((el) => { if (el) el.classList.remove("ldw_auth_hidden"); });
      if (tabLogin) tabLogin.classList.toggle("active", authMode === "login");
      if (tabRegister) tabRegister.classList.toggle("active", authMode === "register");
      if (loginBtn) loginBtn.classList.toggle("ldw_auth_hidden", authMode !== "login");
      if (signupBtn) signupBtn.classList.toggle("ldw_auth_hidden", authMode !== "register");
      if (forgotBtn) forgotBtn.classList.toggle("ldw_auth_hidden", authMode !== "login");
      if (resendBtn) resendBtn.style.display = authMode === "register" ? "inline-flex" : "none";
      if (password) password.setAttribute("autocomplete", authMode === "register" ? "new-password" : "current-password");
      if (title) title.textContent = authMode === "register" ? "Join the adventure" : "Welcome back, adventurer";
      if (sub) {
        sub.textContent = authMode === "register"
          ? "Create your account, pick a username, and your progress will follow you everywhere."
          : "Sign in to keep your Beans, Dust, and unlocks safe — or jump in as a guest right now.";
      }
      if (status) status.textContent = "";
    }
    const openLogin = async () => {
      if (!modal) return;
      const { session } = await getSession();
      if (!session || !session.user) setAuthMode("login");
      await updateAuthUI();
      modal.classList.add("open");
      document.body.classList.add("ld-no-scroll");
      modal.setAttribute("aria-hidden", "false");
      if (!session || !session.user) setTimeout(() => document.getElementById("ldw_email")?.focus(), 60);
    };
    const closeLogin = () => {
      if (!modal) return;
      modal.classList.remove("open");
      document.body.classList.remove("ld-no-scroll");
      modal.setAttribute("aria-hidden", "true");
    };
    document.getElementById("ldw_login_btn")?.addEventListener("click", openLogin);
    document.getElementById("ldw_close_login")?.addEventListener("click", closeLogin);
    modal?.addEventListener("click", (e) => { if (e.target === modal) closeLogin(); });
    document.getElementById("ldw_tab_login")?.addEventListener("click", () => setAuthMode("login"));
    document.getElementById("ldw_tab_register")?.addEventListener("click", () => setAuthMode("register"));
    document.getElementById("ldw_guest_continue")?.addEventListener("click", closeLogin);

    document.getElementById("ldw_email_login")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase script could not load."; return; }
      const email = document.getElementById("ldw_email").value.trim();
      const password = document.getElementById("ldw_password").value;
      if (!email || !password) { status.textContent = "Email and password first, boss."; return; }
      status.textContent = "Logging in...";
      const loginRes = await client.auth.signInWithPassword({ email, password });
      const data = loginRes && loginRes.data ? loginRes.data : null;
      const error = loginRes ? loginRes.error : null;

      if (!error && data && data.user && data.user.email_confirmed_at === null) {
        await client.auth.signOut();
        status.textContent = "Please verify your email before logging in.";
        return;
      }

      status.textContent = error ? error.message : "Logged in. You can enter the World now.";
      updateAuthUI();
      if (!error) flushPendingCheckinXP();
    });

    document.getElementById("ldw_email_signup")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase script could not load."; return; }
      const email = document.getElementById("ldw_email").value.trim();
      const password = document.getElementById("ldw_password").value;
      if (!email || !password) { status.textContent = "Email and password first, boss."; return; }
      if (password.length < 8) { status.textContent = "Password must be at least 8 characters."; return; }
      status.textContent = "Creating account...";
      const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: CFG.AUTH_REDIRECT_URL } });
      status.textContent = error ? error.message : "Account created. If email confirmation is enabled, confirm email first, then login.";
      updateAuthUI();
    });

    document.getElementById("ldw_logout")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase script could not load."; return; }
      await client.auth.signOut();
      status.textContent = "Logged out.";
      setAuthMode("login");
      updateAuthUI();
    });

    document.getElementById("ldw_google_login")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase script could not load."; return; }
      status.textContent = "Opening Google login...";
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: CFG.AUTH_REDIRECT_URL } });
      if (error) status.textContent = error.message;
    });

    // Same Supabase OAuth architecture as Google above, just a different
    // provider string. If Apple OAuth isn't enabled on the Supabase project
    // yet, signInWithOAuth() returns a normal error (no crash) — shown here
    // as a friendly message instead of a raw Supabase error string.
    document.getElementById("ldw_apple_login")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase script could not load."; return; }
      status.textContent = "Opening Apple login...";
      const { error } = await client.auth.signInWithOAuth({ provider: "apple", options: { redirectTo: CFG.AUTH_REDIRECT_URL } });
      if (error) {
        console.warn("[LD] Apple login error:", error);
        status.textContent = "Apple sign-in isn't available yet — please use Google or Email for now.";
      }
    });


    document.getElementById("ldw_forgot_password")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase unavailable."; return; }

      const email = document.getElementById("ldw_email").value.trim();
      if (!email) { status.textContent = "Enter your email first."; return; }

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: CFG.AUTH_REDIRECT_URL
      });

      status.textContent = error ? error.message : "Password reset email sent.";
    });

    document.getElementById("ldw_resend_verify")?.addEventListener("click", async () => {
      const client = await getSupabase();
      if (!client) { status.textContent = "Supabase unavailable."; return; }

      const email = document.getElementById("ldw_email").value.trim();
      if (!email) { status.textContent = "Enter your email first."; return; }

      const { error } = await client.auth.resend({
        type: "signup",
        email
      });

      status.textContent = error ? error.message : "Verification email sent.";
    });

    getSupabase().then((client) => {
      if (client && client.auth && client.auth.onAuthStateChange && !window.__LDW_AUTH_LISTENER__) {
        window.__LDW_AUTH_LISTENER__ = true;
        client.auth.onAuthStateChange(() => { updateAuthUI(); flushPendingCheckinXP(); });
      }
    });
    updateAuthUI();
  }

  function bindMobileNav() {
    const toggle = document.getElementById("ldw_menu_toggle");
    const nav = document.getElementById("ldw_nav_secondary");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      nav.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    toggle.addEventListener("click", () => {
      nav.classList.contains("open") ? close() : open();
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) close();
    });
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) close();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) close();
    }, { passive: true });
  }

  // Support request delivery — server.js on the existing Railway backend has
  // no email-sending route yet. This POSTs to CFG.SUPPORT_API_URL, which
  // must be added there (see the handler documented right below this
  // function) before submissions actually reach an inbox. Until then this
  // correctly surfaces a real network/404 error instead of faking success.
  async function submitSupportRequest(payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(CFG.SUPPORT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);
      let data = null;
      try { data = await res.json(); } catch (e) {}
      if (!res.ok) {
        const msg = (data && data.error) || `Server returned ${res.status}`;
        throw new Error(msg);
      }
      return data || { ok: true };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  function bindSupportWidget() {
    const root = document.getElementById("ldw_support");
    const toggle = document.getElementById("ldw_support_toggle");
    const panel = document.getElementById("ldw_support_panel");
    const closeBtn = document.getElementById("ldw_support_close");
    const extraLinks = document.getElementById("ldw_support_extra_links");
    const form = document.getElementById("ldw_support_form");
    const doneView = document.getElementById("ldw_support_done");
    const doneText = document.getElementById("ldw_support_done_text");
    const sendAnotherBtn = document.getElementById("ldw_support_send_another");
    const statusEl = document.getElementById("ldw_support_form_status");
    const submitBtn = document.getElementById("ldw_support_submit");
    const emailInput = document.getElementById("ldw_support_email_input");
    const categoryInput = document.getElementById("ldw_support_category");
    const usernameInput = document.getElementById("ldw_support_username");
    const messageInput = document.getElementById("ldw_support_message");
    const hpInput = document.getElementById("ldw_support_hp");
    if (!root || !toggle || !panel || !form) return;

    if (CFG.SUPPORT_WHATSAPP_URL && extraLinks) {
      const wa = document.createElement("a");
      wa.className = "ldw_btn ldw_btn_ghost_sm";
      wa.href = CFG.SUPPORT_WHATSAPP_URL;
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.textContent = "WhatsApp";
      extraLinks.appendChild(wa);
    }
    if (CFG.SUPPORT_DISCORD_URL && extraLinks) {
      const dc = document.createElement("a");
      dc.className = "ldw_btn ldw_btn_ghost_sm";
      dc.href = CFG.SUPPORT_DISCORD_URL;
      dc.target = "_blank";
      dc.rel = "noopener";
      dc.textContent = "Discord";
      extraLinks.appendChild(dc);
    }

    panel.inert = true;

    function onKeydown(e) {
      if (e.key === "Escape") close();
    }
    function onOutsideClick(e) {
      if (!root.contains(e.target)) close({ returnFocus: false });
    }
    function open() {
      root.classList.add("open");
      panel.inert = false;
      toggle.setAttribute("aria-expanded", "true");
      setTimeout(() => (emailInput && !emailInput.value ? emailInput.focus() : closeBtn && closeBtn.focus()), 60);
      document.addEventListener("keydown", onKeydown);
      document.addEventListener("click", onOutsideClick, true);
    }
    function close(opts) {
      const returnFocus = !opts || opts.returnFocus !== false;
      root.classList.remove("open");
      panel.inert = true;
      toggle.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("click", onOutsideClick, true);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", () => {
      root.classList.contains("open") ? close() : open();
    });
    closeBtn?.addEventListener("click", () => close());

    function setFieldError(fieldId, errorId, message) {
      const field = document.getElementById(fieldId);
      const errorEl = document.getElementById(errorId);
      if (!field || !errorEl) return;
      if (message) {
        field.classList.add("has_error");
        errorEl.textContent = message;
      } else {
        field.classList.remove("has_error");
        errorEl.textContent = "";
      }
    }

    function validate() {
      let firstInvalid = null;
      let ok = true;

      const email = (emailInput.value || "").trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        setFieldError("ldw_support_email_field", "ldw_support_email_error", "Enter a valid email address.");
        ok = false;
        firstInvalid = firstInvalid || emailInput;
      } else {
        setFieldError("ldw_support_email_field", "ldw_support_email_error", "");
      }

      if (!categoryInput.value) {
        setFieldError("ldw_support_category_field", "ldw_support_category_error", "Pick a category.");
        ok = false;
        firstInvalid = firstInvalid || categoryInput;
      } else {
        setFieldError("ldw_support_category_field", "ldw_support_category_error", "");
      }

      const message = (messageInput.value || "").trim();
      if (message.length < 10) {
        setFieldError("ldw_support_message_field", "ldw_support_message_error", "A few more details would help (10+ characters).");
        ok = false;
        firstInvalid = firstInvalid || messageInput;
      } else {
        setFieldError("ldw_support_message_field", "ldw_support_message_error", "");
      }

      return { ok, firstInvalid, email, message };
    }

    function getCooldownRemainingMs() {
      try {
        const last = Number(localStorage.getItem(CFG.SUPPORT_LAST_SENT_KEY) || 0);
        if (!last) return 0;
        return Math.max(0, CFG.SUPPORT_SEND_COOLDOWN_MS - (Date.now() - last));
      } catch (e) { return 0; }
    }

    function showDone(message) {
      form.classList.add("ldw_auth_hidden");
      doneView.classList.remove("ldw_auth_hidden");
      if (doneText) doneText.textContent = message;
      setTimeout(() => sendAnotherBtn && sendAnotherBtn.focus(), 30);
    }

    sendAnotherBtn?.addEventListener("click", () => {
      doneView.classList.add("ldw_auth_hidden");
      form.classList.remove("ldw_auth_hidden");
      form.reset();
      statusEl.textContent = "";
      statusEl.className = "ldw_support_form_status";
      setTimeout(() => emailInput && emailInput.focus(), 30);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot: real users never fill this hidden field. Bots that
      // blindly fill every input will — silently pretend success instead
      // of telling them the trick worked.
      if (hpInput && hpInput.value) {
        showDone("Sent. We'll reply to your email soon.");
        return;
      }

      const cooldownMs = getCooldownRemainingMs();
      if (cooldownMs > 0) {
        const mins = Math.ceil(cooldownMs / 60000);
        statusEl.textContent = `You already sent a message recently. Please wait about ${mins} minute${mins === 1 ? "" : "s"} before sending another.`;
        statusEl.className = "ldw_support_form_status is-error";
        return;
      }

      const { ok, firstInvalid, email, message } = validate();
      if (!ok) {
        statusEl.textContent = "Please fix the highlighted fields.";
        statusEl.className = "ldw_support_form_status is-error";
        firstInvalid?.focus();
        return;
      }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      statusEl.textContent = "";
      statusEl.className = "ldw_support_form_status";

      try {
        await submitSupportRequest({
          email,
          category: categoryInput.value,
          username: (usernameInput.value || "").trim().slice(0, 60),
          message,
          page: window.location.href,
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString()
        });
        try { localStorage.setItem(CFG.SUPPORT_LAST_SENT_KEY, String(Date.now())); } catch (e) {}
        showDone(`Sent. We'll reply to ${email} soon.`);
      } catch (err) {
        console.warn("[LD] Support request failed:", err);
        statusEl.textContent = `Couldn't send that (${err.message || "network error"}). Please try again or email us directly at ${CFG.SUPPORT_EMAIL}.`;
        statusEl.className = "ldw_support_form_status is-error";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  // ---------------------------------------------------------------------
  // BACKEND TODO (not deployed by this file): add a POST /api/support-request
  // route to lifedecode-game/server.js, next to the existing
  // /api/daily-checkin route, following the same manual-routing style:
  //
  //   if (req.method === "POST" && url.pathname === "/api/support-request") {
  //     return await handleSupportRequest(req, res);
  //   }
  //
  // async function handleSupportRequest(req, res) {
  //   const body = await readJsonBody(req); // reuse whatever body parser
  //                                          // handleDailyCheckin already uses
  //   const email = safeText(body.email || "", 200);
  //   const category = safeText(body.category || "", 40);
  //   const username = safeText(body.username || "", 60);
  //   const message = safeText(body.message || "", 2000);
  //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !category || message.length < 10) {
  //     res.writeHead(400, { "Content-Type": "application/json" });
  //     return res.end(JSON.stringify({ ok: false, error: "Invalid request." }));
  //   }
  //   // TODO: real rate limiting per IP/email here (this file only has a
  //   // client-side cooldown, which a motivated abuser can bypass).
  //   const RESEND_API_KEY = process.env.LD_RESEND_API_KEY || "";
  //   if (!RESEND_API_KEY) {
  //     res.writeHead(500, { "Content-Type": "application/json" });
  //     return res.end(JSON.stringify({ ok: false, error: "Email service not configured." }));
  //   }
  //   const emailRes = await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       from: "LifeDecode Support <support@lifedecode.app>",
  //       to: "support@lifedecode.app",
  //       reply_to: email,
  //       subject: `[${category}] New support request${username ? " from " + username : ""}`,
  //       text: [
  //         `Customer email: ${email}`,
  //         `Category: ${category}`,
  //         `Username: ${username || "(none)"}`,
  //         `Submitted: ${new Date().toISOString()}`,
  //         `Page: ${safeText(body.page || "", 300)}`,
  //         `User agent: ${safeText(body.userAgent || "", 300)}`,
  //         "",
  //         "Message:",
  //         message
  //       ].join("\n")
  //     })
  //   });
  //   if (!emailRes.ok) {
  //     res.writeHead(502, { "Content-Type": "application/json" });
  //     return res.end(JSON.stringify({ ok: false, error: "Email provider rejected the request." }));
  //   }
  //   res.writeHead(200, { "Content-Type": "application/json" });
  //   res.end(JSON.stringify({ ok: true }));
  // }
  //
  // Required environment variable on Railway: LD_RESEND_API_KEY
  // (or swap the fetch above for whatever provider is actually preferred —
  // the shape of handleSupportRequest is the important part, not Resend
  // specifically). Never commit this key to the repo.
  // ---------------------------------------------------------------------

  function bindHeaderScrollState() {
    const header = document.getElementById("ldw_header");
    if (!header) return;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function stars() {
    const canvas = document.getElementById("ldw_stars");
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

  window.addEventListener("error", (event) => {
    try {
      const app = document.getElementById("ldw_app");
      if (app) {
        app.style.display = "block";
        app.style.visibility = "visible";
        app.style.opacity = "1";
      }
      console.warn("[LD] Landing runtime warning:", event && event.message ? event.message : event);
    } catch (err) {}
  });

  ready(() => {
    try {
      // EMERGENCY BOOT FIX:
      // Render the page first. Do NOT wait for wallpaper/CDN image preloads, because
      // a hanging image request can leave the whole Webflow page white/blank.
      injectFonts();
      injectCSS();
      render();
      bind();
      bindMobileNav();
      bindSupportWidget();
      bindHeaderScrollState();
      stars();
      preloadIconicWallpaper().catch((err) => {
        console.warn("[LD] iconic preload skipped:", err);
      });
      console.log("[LD] World landing loaded:", CFG.VERSION);
    } catch (err) {
      console.error("[LD] World landing failed:", err);
      document.body.innerHTML = '<div style="min-height:100vh;background:#03020a;color:#fff;padding:24px;font-family:Arial,sans-serif"><h1>LifeDecode World</h1><p>Landing failed to load. Check console.</p></div>';
    }
  });
})();

console.log("[LD] ACCOUNT READY FILE PARSED - FINAL PATCH");
console.log("[LD] boot: singleton guard bypassed");
window.__LD_FILE_PARSED__ = true;

(function () {
  window.__LD_Focused_SINGLE_FILE__ = true;


const CFG = {
  VERSION: "LifeDecode AI v1",
  SUPABASE_URL: "https://nnqiahypfkdoqkclknoe.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucWlhaHlwZmtkb3FrY2xrbm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjU3NTQsImV4cCI6MjA4ODgwMTc1NH0.j6oTDeSKvpx1OhY3yeCY_-Jo5ixmC22jW9VEuTnJ7hc",
  MAKE_WEBHOOK_URL: "https://hook.eu1.make.com/1w2h7pe88oqrf42uu0h41e3tazd02v2x",
  MAKE_POLL_URL: "",
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/cNibJ3fc52aMcN4fIPbQY00",
  FREE_PREVIEW_PER_24H: 1,
    XP: { CHECKIN: 120, TRIGGER: 60, RESCUE: 40, JOURNAL: 30, GAME_10: 20, GAME_20: 40 },
    XP_COOLDOWNS: {
    CHECKIN: 12 * 60 * 60 * 1000,
    TRIGGER: 12 * 60 * 60 * 1000,
    RESCUE: 12 * 60 * 60 * 1000,
    JOURNAL: 12 * 60 * 60 * 1000
  },
  
    STORAGE_KEYS: {
    AUTH: "ld_auth_cache_v1",
    GUEST_STATE: "ld_guest_state_v1",
    UI_MODE: "ld_ui_mode_v1",
    TONE_MODE: "ld_tone_mode_v1",
    SCREENSHOT_PREVIEW: "ld_screenshot_preview_v1"
  },

  RANDOM_QUESTIONS: [
    "Why am I always the second option?",
    "Does she actually like me or am I delusional?",
    "Why do I feel empty even when I win?",
    "Why do I keep sabotaging myself?",
    "Am I healing or just distracting myself?",
    "Does he miss me or just miss attention?",
    "Why do I chase people who give me mixed signals?",
    "Am I actually improving or just coping harder?",
    "What truth am I avoiding right now?",
    "Why do I get attached so fast?"
  ],
  OAUTH_REDIRECT_TO: window.location.origin + window.location.pathname
};


  const CSS = `
@keyframes ldShimmer {
  0% { background-position:0% 50%; }
  100% { background-position:100% 50%; }
}

@keyframes ldFloatGlow {
  0% { transform:translate3d(0,0,0) scale(1); opacity:.72; }
  50% { transform:translate3d(0,-6px,0) scale(1.03); opacity:.92; }
  100% { transform:translate3d(0,0,0) scale(1); opacity:.72; }
}

#ld_sheet.ld_game_sheet{
  width:min(1600px, calc(100vw - 4px));
  max-height:min(99svh, 1600px);
}

#ld_sheet.ld_game_sheet .sbd{
  padding:4px;
}

#ld_sheet.ld_game_sheet #ld_game_canvas{
  width:100%;
  height:auto;
  aspect-ratio:16/9;
  min-height:82svh;
  max-height:90svh;
}

.ld_help_icon{
  width:18px;
  height:18px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  font-size:13px;
  font-weight:900;
  line-height:1;
  color:rgba(245,247,255,.96);
}

#ld_badge{
  position:fixed;
  right:14px;
  bottom:14px;
  z-index:70;
  display:flex;
  align-items:center;
  gap:8px;
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(10,12,24,.86);
  color:rgba(233,236,255,.88);
  box-shadow:0 16px 32px rgba(0,0,0,.35);
  backdrop-filter:blur(12px);
}

#ld_btn_help,
#ld_btn_upgrade,
#ld_btn_name{
  white-space:nowrap;
}

.ld_heroart{
  animation:ldFloatGlow 8s ease-in-out infinite;
}

.ld_btn.primary,
.ld_mbtn.active{
  background-size:180% 180%;
  animation:ldShimmer 7s linear infinite;
}

.ld_coach_glow{
  animation:ldFloatGlow 7s ease-in-out infinite;
}

#ld_btn_name,
#ld_btn_help{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.10);
}

#ld_btn_name:hover,
#ld_btn_help:hover{
  background:rgba(255,255,255,.07);
  border-color:rgba(255,255,255,.16);
}

#ld_mmenu_backdrop{
  position:fixed;
  inset:0;
  z-index:95;
  background:rgba(0,0,0,.58);
  backdrop-filter:blur(8px);
  display:none;
}

#ld_mmenu{
  position:fixed;
  left:10px;
  right:10px;
  bottom:calc(84px + env(safe-area-inset-bottom));
  z-index:96;
  display:none;
  max-height:min(70svh, 620px);
  overflow:auto;
  border:1px solid rgba(255,255,255,.12);
  border-radius:24px;
  background:linear-gradient(180deg, rgba(12,14,28,.96), rgba(8,10,20,.92));
  box-shadow:0 28px 80px rgba(0,0,0,.55);
  -webkit-overflow-scrolling:touch;
}

#ld_mmenu .hd{
  position:sticky;
  top:0;
  z-index:2;
  padding:14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg, rgba(12,14,28,.98), rgba(12,14,28,.84));
}

#ld_mmenu .bd{
  padding:10px;
}

.ld_mmenu_nav{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.ld_mmenu_nav button{
  width:100%;
  text-align:left;
  padding:12px;
  border-radius:14px;
  border:1px solid transparent;
  background:transparent;
  color:var(--muted);
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:700;
}

.ld_mmenu_nav button:hover{
  background:rgba(255,255,255,.05);
  color:var(--txt);
}

.ld_mmenu_nav button.active{
  background:rgba(255,255,255,.07);
  border-color:rgba(255,255,255,.12);
  color:var(--txt);
  box-shadow:0 12px 24px rgba(0,0,0,.22);
}

.ld_mmenu_nav small{
  display:block;
  margin-top:2px;
  font-weight:600;
  color:rgba(233,236,255,.55);
}

.ld_mmenu_nav .sep{
  height:1px;
  background:rgba(255,255,255,.08);
  margin:8px 6px;
  border-radius:99px;
}

@media (max-width:860px){
  #ld_mnav .row{
    grid-template-columns:repeat(5,1fr);
  }
}

@media (max-width:430px){
  #ld_mmenu{
    left:8px;
    right:8px;
    bottom:calc(74px + env(safe-area-inset-bottom));
    border-radius:20px;
  }

  #ld_mnav{
    padding:8px 8px calc(10px + env(safe-area-inset-bottom));
  }

  #ld_mnav .row{
    gap:5px;
  }

  .ld_mbtn{
    min-height:50px;
    padding:8px 4px;
    border-radius:14px;
    gap:4px;
  }

  .ld_mbtn span{
    font-size:8px;
    letter-spacing:.05em;
  }
}


:root{
  --bg0:#04050b;
  --bg1:#080b18;
  --panel: rgba(255,255,255,.06);
  --stroke: rgba(255,255,255,.10);
  --txt:#eef2ff;
  --muted:rgba(238,242,255,.72);
  --muted2:rgba(238,242,255,.50);

  --c1:#7a5cff;
  --c2:#38d7ff;
  --c3:#ff4fd8;
  --c4:#79ffb7;

  --danger:#ff5c7a;
  --warn:#ffbe3b;
  --ok:#52ffbf;

  --r1:30px;
  --shadow2: 0 14px 34px rgba(0,0,0,.42);
  --pad: clamp(14px, 2.2vw, 22px);
  --gap: clamp(12px, 1.8vw, 18px);
  --max: 1220px;
  --mobileNavH: 82px;
}
#ld_app, #ld_app *{ box-sizing:border-box; }
#ld_app{
  color:var(--txt);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  line-height:1.25;
}
#ld_bg{
  position:fixed;
  inset:0;
  z-index:-3;
  background:
    radial-gradient(1200px 700px at 16% 10%, rgba(122,92,255,.26), transparent 60%),
    radial-gradient(920px 640px at 84% 16%, rgba(56,215,255,.18), transparent 56%),
    radial-gradient(900px 640px at 58% 82%, rgba(255,79,216,.14), transparent 58%),
    radial-gradient(740px 540px at 12% 88%, rgba(121,255,183,.08), transparent 55%),
    linear-gradient(180deg, #05060d 0%, #090d1d 46%, #060711 100%);
}
#ld_noise{
  position:fixed; inset:0; z-index:-2; pointer-events:none;
  opacity:.10;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}
#ld_glowgrid{
  position:fixed; inset:-10px; z-index:-1; pointer-events:none;
  opacity:.22;
  background:
    linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(80% 60% at 50% 40%, #000 55%, transparent 100%);
}
#ld_particles{
  position:fixed; inset:0; z-index:-1; pointer-events:none;
  opacity:.70;
}
#ld_shell{
  min-height:100svh;
  padding:
    calc(var(--pad) + env(safe-area-inset-top))
    var(--pad)
    calc(var(--pad) + env(safe-area-inset-bottom) + var(--mobileNavH))
    var(--pad);
}
#ld_top{
  position:sticky;
  top:10px;
  z-index:60;
  max-width:var(--max);
  margin:0 auto var(--gap);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:12px 14px;
  border-radius:24px;
  backdrop-filter:blur(24px);
  background:
    linear-gradient(180deg, rgba(11,14,30,.74), rgba(8,10,24,.58));
  border:1px solid rgba(255,255,255,.10);
  box-shadow:
    0 18px 40px rgba(0,0,0,.42),
    inset 0 1px 0 rgba(255,255,255,.05);
}
#ld_brand{
  display:flex;
  align-items:center;
  gap:12px;
  min-width:0;
  flex:1 1 auto;
}

.ld_brandname{
  font-weight:900;
  letter-spacing:-0.03em;
  font-size:17px;
  color:rgba(245,247,255,.98);
  white-space:nowrap;
  line-height:1;
  overflow:hidden;
  text-overflow:ellipsis;
  max-width:190px;
}

#ld_logo{
  width:40px;
  height:40px;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  overflow:hidden;
  flex:0 0 40px;
  background:
    radial-gradient(circle at 25% 20%, rgba(255,255,255,.18), transparent 30%),
    linear-gradient(135deg, rgba(122,92,255,.95) 0%, rgba(87,72,255,.92) 42%, rgba(34,211,238,.88) 100%);
  box-shadow:
    0 8px 20px rgba(64,56,180,.26),
    0 0 0 1px rgba(255,255,255,.10),
    inset 0 1px 0 rgba(255,255,255,.12);
}

#ld_logo::before{
  content:"✦";
  position:relative;
  z-index:2;
  font-size:12px;
  font-weight:800;
  letter-spacing:-0.02em;
  color:#ffffff;
}

#ld_logo::after{
  content:"";
  position:absolute;
  inset:1px;
  border-radius:13px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0)),
    radial-gradient(circle at 80% 100%, rgba(255,255,255,.06), transparent 35%);
  pointer-events:none;
}
#ld_topnav{
  margin-left:auto;
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:nowrap;
  flex:0 0 auto;
}
.ld_dot{
  width:8px; height:8px; border-radius:99px;
  background:rgba(255,255,255,.35);
  box-shadow:0 0 0 2px rgba(255,255,255,.08);
}
.ld_dot.ok{ background:var(--ok); box-shadow:0 0 0 3px rgba(69,255,181,.18), 0 0 22px rgba(69,255,181,.22); }
.ld_dot.warn{ background:var(--warn); box-shadow:0 0 0 3px rgba(255,176,32,.18), 0 0 22px rgba(255,176,32,.20); }
.ld_dot.bad{ background:var(--danger); box-shadow:0 0 0 3px rgba(255,77,109,.18), 0 0 22px rgba(255,77,109,.18); }
.ld_btn{
  border:1px solid var(--stroke);
  background:rgba(255,255,255,.05);
  color:var(--txt);
  border-radius:999px;
  padding:11px 14px;
  font-weight:700;
  letter-spacing:.3px;
  cursor:pointer;
  transition:transform .08s ease, background .15s ease, border-color .15s ease;
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  min-height:42px;
  -webkit-tap-highlight-color:transparent;
}
.ld_pill{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.05);
  color:var(--txt);
  font-weight:800;
  min-height:42px;
}
.ld_btn:hover{ background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.18); }
.ld_btn:active{ transform:translateY(1px); }
.ld_btn.primary{
  background:linear-gradient(135deg, rgba(138,91,255,.85), rgba(34,211,238,.55));
  border-color:rgba(255,255,255,.18);
  box-shadow:0 16px 50px rgba(138,91,255,.18);
}
.ld_btn.ghost{ background:rgba(255,255,255,.03); }
.ld_btn.danger{
  background:linear-gradient(135deg, rgba(255,77,109,.85), rgba(255,61,214,.40));
  border-color:rgba(255,255,255,.18);
}
.ld_icon{ width:18px; height:18px; display:inline-block; opacity:.92; }
#ld_grid{
  max-width:var(--max);
  margin:0 auto;
  display:grid;
  grid-template-columns:300px 1fr 340px;
  gap:var(--gap);
  align-items:start;
}
.ld_panel{
  border:1px solid var(--stroke);
  background:linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.04));
  border-radius:var(--r1);
  box-shadow:var(--shadow2);
  overflow:hidden;
}
.ld_panel .hd{
  padding:14px 16px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background:rgba(0,0,0,.12);
}
.ld_panel .hd .kicker{
  color:rgba(233,236,255,.46);
  letter-spacing:.24em;
  font-size:10px;
  text-transform:uppercase;
  font-weight:800;
}
.ld_panel .hd h3{ margin:6px 0 0; font-size:18px; letter-spacing:.2px; }
.ld_panel .bd{ padding:16px; }
#ld_left .bd{ padding:10px; }
.ld_nav{ display:flex; flex-direction:column; gap:6px; }
.ld_nav button{
  width:100%;
  text-align:left;
  padding:12px;
  border-radius:14px;
  border:1px solid transparent;
  background:transparent;
  color:var(--muted);
  cursor:pointer;
  display:flex; align-items:center; gap:10px;
  font-weight:700;
}
.ld_nav button:hover{ background:rgba(255,255,255,.05); color:var(--txt); }
.ld_nav button.active{
  background:rgba(255,255,255,.07);
  border-color:rgba(255,255,255,.12);
  color:var(--txt);
  box-shadow:0 12px 24px rgba(0,0,0,.22);
}
.ld_nav small{ display:block; margin-top:2px; font-weight:600; color:rgba(233,236,255,.55); }
.ld_nav .sep{ height:1px; background:rgba(255,255,255,.08); margin:8px 6px; border-radius:99px; }
#ld_center .hero{ padding:18px 18px 14px; position:relative; overflow:hidden; }
.ld_heroart{
  position:absolute; inset:-30px -30px auto auto;
  width:380px; height:240px; opacity:.85;
  filter:drop-shadow(0 26px 55px rgba(0,0,0,.40));
  pointer-events:none;
}
.ld_centerTitle{
  font-size:clamp(34px, 4.6vw, 62px);
  margin:2px 0 12px;
  letter-spacing:-0.045em;
  line-height:.98;
  font-weight:800;
  color:rgba(245,247,255,.98);
  max-width:11ch;
  text-wrap:balance;
}

.ld_centerTitle .grad{
  background:linear-gradient(90deg, #7dd3fc 0%, #8b5cf6 48%, #ec4899 100%);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  text-shadow:0 0 24px rgba(139,92,246,.12);
}
.ld_sub{ color:var(--muted); font-size:15px; line-height:1.5; max-width:48ch; }
.ld_actionsRow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px;align-items:stretch;}
.ld_actionsRow .ld_btn{min-height:58px;font-size:15px;font-weight:850;letter-spacing:.01em;border-radius:22px;justify-content:center;}
.ld_actionsRow .ld_btn.primary,.ld_actionsRow .ld_btn.danger{box-shadow:0 16px 36px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.10);}
.ld_actionsRow .ld_btn.ghost{background:linear-gradient(180deg, rgba(14,11,32,.96), rgba(8,7,18,.96));border:1px solid rgba(133,94,255,.20);box-shadow:0 16px 34px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.04);position:relative;overflow:hidden;}
.ld_actionsRow .ld_btn.ghost::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 140% at 0% 0%, rgba(117,76,255,.14), transparent 34%),radial-gradient(120% 140% at 100% 0%, rgba(208,84,255,.10), transparent 32%);pointer-events:none;}
.ld_actionsRow .ld_btn.ghost:hover{border-color:rgba(181,136,255,.30);transform:translateY(-1px);}
.ld_actionsRow .ld_btn[data-open="screenshot"]{grid-column:1 / -1;justify-self:center;width:min(440px,100%);background:linear-gradient(135deg, rgba(116,66,255,.20), rgba(18,12,42,.98));border-color:rgba(189,148,255,.26);box-shadow:0 22px 42px rgba(77,38,185,.20), inset 0 1px 0 rgba(255,255,255,.05);}
.ld_actionsRow .ld_btn[data-open="screenshot"]::after{content:"";position:absolute;inset:0;background:radial-gradient(80% 130% at 50% 0%, rgba(217,132,255,.10), transparent 38%);pointer-events:none;}
@media (min-width:861px){
  .ld_content_tools{display:none !important;}
}
.ld_cards{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:var(--gap);
  padding:0 16px 16px;
}
.ld_card{
  border:1px solid rgba(255,255,255,.10);
  background:rgba(0,0,0,.10);
  border-radius:var(--r1);
  overflow:hidden;
}
.ld_card .top{
  padding:14px 14px 10px;
  display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
}
.ld_badge{
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);
  color:var(--muted);
  padding:8px 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:800;
  display:flex; align-items:center; gap:8px;
  white-space:nowrap;
}
.ld_card h4{ margin:0; font-size:16px; }
.ld_card p{ margin:8px 0 0; color:var(--muted); font-size:13px; line-height:1.35; }
.ld_card .mid{ padding:0 14px 14px; }
.ld_metricRow{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
.ld_metric{
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
  border-radius:18px;
  padding:12px;
}
.ld_metric .t{ color:var(--muted2); font-size:12px; letter-spacing:.12em; text-transform:uppercase; }
.ld_metric .v{ margin-top:6px; font-size:22px; font-weight:900; }
.ld_bar{
  height:10px;
  border-radius:99px;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
  overflow:hidden;
  margin-top:10px;
}
.ld_bar > i{
  display:block;
  height:100%;
  width:30%;
  background:linear-gradient(90deg, var(--c2), var(--c1), var(--c3));
  box-shadow:0 0 28px rgba(34,211,238,.18);
}
.ld_card .btm{
  padding:12px 14px 14px;
  display:flex; gap:10px; flex-wrap:wrap;
  border-top:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.03);
}
.ld_cards{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:var(--gap);
  padding:0 16px 18px;
  align-items:start;
}

.ld_card{
  border:1px solid rgba(255,255,255,.10);
  background:
    linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.028));
  border-radius:30px;
  overflow:hidden;
  box-shadow:
    0 20px 36px rgba(0,0,0,.24),
    inset 0 1px 0 rgba(255,255,255,.04);
}

.ld_card .mid{
  padding:0 14px 16px;
}

.ld_card .btm{
  padding:14px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  border-top:1px solid rgba(255,255,255,.07);
  background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.035));
}

#ld_right .bd{ display:flex; flex-direction:column; gap:var(--gap); }
.ld_sideCard{
  border:1px solid rgba(255,255,255,.10);
  background:rgba(0,0,0,.12);
  border-radius:var(--r1);
  overflow:hidden;
}
.ld_sideCard .h{
  padding:12px 14px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  border-bottom:1px solid rgba(255,255,255,.07);
  color:var(--muted);
  font-weight:800;
  letter-spacing:.12em;
  text-transform:uppercase;
  font-size:11px;
}
.ld_sideCard .c{ padding:14px; }
.ld_big{ font-size:24px; font-weight:950; letter-spacing:-0.5px; }
.ld_small{ color:var(--muted); margin-top:6px; font-size:13px; line-height:1.35; }
.ld_brain{
  width:100%;
  height:160px;
  border-radius:22px;
  border:1px solid rgba(255,255,255,.10);
  background:
    radial-gradient(220px 120px at 20% 25%, rgba(34,211,238,.24), transparent 60%),
    radial-gradient(260px 140px at 80% 30%, rgba(255,61,214,.20), transparent 60%),
    radial-gradient(260px 140px at 60% 80%, rgba(138,91,255,.18), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  overflow:hidden;
  position:relative;
}
.ld_brain svg{ position:absolute; inset:-10px; opacity:.85; }
#ld_sheet_backdrop{
  position:fixed; inset:0; z-index:100;
  background:rgba(0,0,0,.55);
  backdrop-filter:blur(8px);
  display:none;
}
#ld_sheet{
  position:fixed; left:50%; top:50%;
  transform:translate(-50%,-50%);
  width:min(920px, calc(100vw - 22px));
  max-height:min(86svh, 720px);
  overflow:auto;
  z-index:101;
  display:none;
  border:1px solid rgba(255,255,255,.14);
  background:linear-gradient(180deg, rgba(12,14,28,.92), rgba(8,10,20,.88));
  border-radius:26px;
  box-shadow:0 40px 120px rgba(0,0,0,.75);
}
#ld_sheet .shd{
  position:sticky; top:0;
  background:linear-gradient(180deg, rgba(12,14,28,.96), rgba(12,14,28,.70));
  border-bottom:1px solid rgba(255,255,255,.10);
  padding:14px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  z-index:2;
}
#ld_sheet .shd b{
  font-size:14px;
  letter-spacing:.22em;
  text-transform:uppercase;
  color:rgba(233,236,255,.78);
}
#ld_sheet .sbd{ padding:14px; }
.ld_field{
  width:100%;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);
  color:var(--txt);
  border-radius:16px;
  padding:12px;
  outline:none;
  min-height:44px;
}
textarea.ld_field{ min-height:120px; resize:vertical; }
.ld_hint{ color:var(--muted); font-size:12px; line-height:1.35; margin-top:8px; }
.ld_grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.ld_chiprow{ display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.ld_chip{
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  border-radius:999px;
  padding:9px 10px;
  font-weight:800;
  color:rgba(233,236,255,.82);
  cursor:pointer;
  user-select:none;
}
.ld_chip.active{
  background:linear-gradient(135deg, rgba(138,91,255,.55), rgba(34,211,238,.30));
  border-color:rgba(255,255,255,.18);
}
#ld_mnav{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  z-index:60;
  padding:10px 12px calc(12px + env(safe-area-inset-bottom));
  background:
    linear-gradient(180deg, rgba(8,10,20,0), rgba(8,10,20,.78), rgba(5,7,18,.96));
  backdrop-filter:blur(18px);
  border-top:1px solid rgba(255,255,255,.08);
  display:none;
}

#ld_mnav .row{
  display:grid;
  grid-template-columns:repeat(5, minmax(0, 1fr));
  gap:6px;
}

.ld_mbtn{
  border:1px solid rgba(255,255,255,.10);
  background:
    linear-gradient(135deg, rgba(255,255,255,.07), rgba(255,255,255,.025));
  border-radius:16px;
  padding:10px 8px;
  color:rgba(233,236,255,.92);
  font-weight:800;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:5px;
  min-height:54px;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  box-shadow:
    0 10px 24px rgba(0,0,0,.26),
    inset 0 1px 0 rgba(255,255,255,.05);
  overflow:hidden;
}

.ld_mbtn svg{
  flex:0 0 auto;
}

.ld_mbtn span{
  font-size:10px;
  letter-spacing:.08em;
  text-transform:uppercase;
  white-space:nowrap;
  line-height:1;
}
#ld_badge button{
  border:none; background:transparent;
  color:rgba(233,236,255,.55);
  cursor:pointer; font-weight:900; padding:0 4px;
}
.ld_row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.ld_rightalign{ margin-left:auto; }
.ld_hr{ height:1px; background:rgba(255,255,255,.08); margin:12px 0; border-radius:99px; }
.ld_kv{ display:flex; justify-content:space-between; gap:10px; color:var(--muted); font-size:13px; }
.ld_kv b{ color:rgba(233,236,255,.86); }
.ld_out{
  white-space:pre-wrap;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  border-radius:18px;
  padding:12px;
  color:rgba(233,236,255,.88);
  min-height:120px;
}
#ld_ob_backdrop, #ld_auth_backdrop{
  position:fixed; inset:0; z-index:120;
  background:rgba(0,0,0,.62);
  backdrop-filter:blur(10px);
  display:none;
}
#ld_ob, #ld_auth{
  position:fixed; left:50%; top:50%;
  transform:translate(-50%,-50%);
  z-index:121;
  display:none;
  width:min(680px, calc(100vw - 22px));
  max-height:min(88svh, 760px);
  border-radius:26px;
  border:1px solid rgba(255,255,255,.14);
  background:linear-gradient(180deg, rgba(12,14,28,.94), rgba(8,10,20,.90));
  box-shadow:0 40px 120px rgba(0,0,0,.78);
  overflow:hidden;
  flex-direction:column;
}
#ld_ob .hd, #ld_auth .hd{
  padding:14px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  border-bottom:1px solid rgba(255,255,255,.10);
  background:rgba(0,0,0,.12);
  position:sticky; top:0; z-index:2;
}
#ld_ob .hd .kicker, #ld_auth .hd .kicker{
  color:var(--muted2);
  letter-spacing:.22em;
  font-size:11px;
  text-transform:uppercase;
}
#ld_ob .bd, #ld_auth .bd{
  padding:14px;
  overflow:auto;
  -webkit-overflow-scrolling:touch;
  max-height:60svh;
  padding-bottom:calc(16px + env(safe-area-inset-bottom));
}
#ld_ob .ft, #ld_auth .ft{
  padding:12px 14px 14px;
  border-top:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.03);
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  position:sticky; bottom:0; z-index:2;
  padding-bottom:calc(14px + env(safe-area-inset-bottom));
}
.ld_ob_title{ font-size:22px; font-weight:950; letter-spacing:-0.5px; margin:2px 0 6px; }
.ld_ob_sub{ color:var(--muted); line-height:1.45; margin:0 0 10px; }
.ld_ob_cards{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:10px; }
.ld_ob_card{
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  border-radius:18px;
  padding:12px;
}
.ld_ob_card b{ display:block; margin-bottom:6px; }
.ld_ob_card p{ margin:0; color:var(--muted); font-size:13px; line-height:1.35; }
.kicker{
  color:var(--muted2);
  letter-spacing:.22em;
  font-size:11px;
  text-transform:uppercase;
}
.ld_auth_hero{
  border:1px solid rgba(255,255,255,.10);
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border-radius:22px;
  padding:14px;
  margin-bottom:12px;
}
.ld_notice{
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
  border-radius:18px;
  padding:12px;
  color:var(--muted);
  font-size:13px;
  line-height:1.45;
}
.ld_notice strong{ color:var(--txt); }
.ld_auth_tabs{
  display:flex; gap:8px; flex-wrap:wrap; margin:10px 0 12px;
}
.ld_auth_tab{
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  color:var(--txt);
  border-radius:999px;
  padding:10px 12px;
  font-weight:800;
  cursor:pointer;
}
.ld_auth_tab.active{
  background:linear-gradient(135deg, rgba(138,91,255,.55), rgba(34,211,238,.25));
  border-color:rgba(255,255,255,.18);
}
.ld_guest_box{
  margin-top:12px;
  border:1px dashed rgba(255,255,255,.16);
  border-radius:18px;
  padding:14px;
  background:rgba(255,255,255,.03);
}
.ld_warnbox{
  border:1px solid rgba(255,176,32,.25);
  background:rgba(255,176,32,.08);
  color:#ffd891;
  border-radius:16px;
  padding:10px 12px;
  font-size:13px;
}
.ld_goodbox{
  border:1px solid rgba(69,255,181,.20);
  background:rgba(69,255,181,.06);
  color:#baffea;
  border-radius:16px;
  padding:10px 12px;
  font-size:13px;
}
#ld_auth_error{
  display:none;
  margin-top:10px;
}
#ld_auth_loading{
  display:none;
}
@media (max-width:1120px){
  #ld_grid{ grid-template-columns:280px 1fr; }
  #ld_right{ display:none; }
}
@media (max-width:860px){
  #ld_grid{ grid-template-columns:1fr; }
  #ld_left{ display:none; }
  #ld_mnav{ display:block; }

  .ld_cards{
    grid-template-columns:1fr;
    gap:14px;
    padding:0 0 18px;
  }

  .ld_card{
    border-radius:26px;
  }

  #ld_topnav .ld_pill{
    display:none;
  }

  #ld_topnav{
    gap:6px;
    justify-content:flex-end;
    flex:0 0 auto;
    max-width:none;
  }
  .ld_brandname{ font-size:14px; }
  .ld_heroart{ width:320px; height:210px; opacity:.65; }
  #ld_badge{ bottom:calc(12px + env(safe-area-inset-bottom) + var(--mobileNavH)); }
  #ld_ob, #ld_auth{ width:min(560px, calc(100vw - 18px)); }
  .ld_grid2{ grid-template-columns:1fr; }
  #ld_sheet{
    width:calc(100vw - 14px);
    max-height:min(88svh, 820px);
    border-radius:20px;
  }
}
@media (max-width:560px){
  #ld_shell{
    padding:
      calc(8px + env(safe-area-inset-top))
      8px
      calc(84px + env(safe-area-inset-bottom))
      8px;
  }

  #ld_top{
    gap:6px;
    padding:8px;
    border-radius:16px;
    align-items:center;
  }

  #ld_brand{
    min-width:0;
    flex:1 1 auto;
    gap:8px;
  }

  #ld_logo{
    width:34px;
    height:34px;
    border-radius:12px;
    flex:0 0 34px;
  }

  #ld_logo::before{
    font-size:11px;
  }

  .ld_brandname{
    max-width:110px;
    font-size:13px;
    line-height:1;
  }

  #ld_topnav{
    display:flex;
    align-items:center;
    gap:4px;
    flex:0 0 auto;
    max-width:none;
  }

  #ld_btn_name,
  #ld_btn_help,
  #ld_btn_upgrade{
    min-height:36px;
    padding:8px 10px;
    border-radius:999px;
    gap:6px;
    font-size:12px;
  }

  #ld_btn_name span:last-child{
    display:none;
  }

#ld_btn_help{
  width:36px;
  min-width:36px;
  padding:0;
  justify-content:center;
}

#ld_btn_help .ld_help_text{
  display:none;
}

#ld_btn_help .ld_help_icon{
  margin:0;
}

  #ld_btn_upgrade{
    padding:8px 12px;
    font-size:12px;
  }

  .ld_actionsRow .ld_btn,
  .ld_card .btm .ld_btn{
    flex:1 1 100%;
    width:100%;
  }

  .ld_metricRow{
    grid-template-columns:1fr;
  }

  #ld_badge{
    right:8px;
    left:8px;
    bottom:calc(84px + env(safe-area-inset-bottom));
    justify-content:space-between;
  }
}
@media (max-width:430px){
  #ld_ob, #ld_auth{
    width:calc(100vw - 14px);
    border-radius:20px;
  }

#ld_btn_help{
  width:34px;
  min-width:34px;
}

  .ld_ob_title{ font-size:20px; }
  .ld_ob_sub{ font-size:13px; }
  .ld_ob_cards{ grid-template-columns:1fr; gap:8px; }
  .ld_ob_card{ padding:10px; }

  #ld_top{
    padding:7px;
    gap:5px;
  }

  #ld_brand{
    gap:7px;
  }

  #ld_logo{
    width:32px;
    height:32px;
    flex:0 0 32px;
    border-radius:11px;
  }

  .ld_brandname{
    max-width:92px;
    font-size:12px;
  }

  #ld_topnav{
    gap:4px;
  }

  #ld_btn_name,
  #ld_btn_help,
  #ld_btn_upgrade{
    min-height:34px;
    padding:7px 9px;
  }

  #ld_btn_name span:last-child{
    display:none;
  }

  #ld_btn_upgrade{
    padding:7px 10px;
    font-size:11px;
  }
}

.ld_coach_shell{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.ld_coach_head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:12px 14px;
  border:1px solid rgba(255,255,255,.10);
  border-radius:18px;
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(34,211,238,.10), transparent 45%),
    radial-gradient(120% 120% at 100% 0%, rgba(138,91,255,.14), transparent 48%),
    rgba(255,255,255,.04);
}

.ld_coach_headleft{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.ld_coach_label{
  font-size:11px;
  letter-spacing:.20em;
  text-transform:uppercase;
  color:var(--muted2);
  font-weight:800;
}

.ld_coach_title{
  font-size:18px;
  font-weight:900;
  letter-spacing:.2px;
  color:var(--txt);
}

.ld_coach_status{
  border:1px solid rgba(255,255,255,.12);
  border-radius:999px;
  padding:8px 10px;
  background:rgba(255,255,255,.05);
  color:rgba(233,236,255,.88);
  font-size:12px;
  font-weight:800;
  white-space:nowrap;
}

.ld_coach_output{
  position:relative;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  border-radius:26px;
  background:
    radial-gradient(120% 180% at 0% 0%, rgba(56,215,255,.08), transparent 35%),
    radial-gradient(120% 180% at 100% 0%, rgba(122,92,255,.14), transparent 38%),
    radial-gradient(100% 140% at 50% 100%, rgba(255,79,216,.08), transparent 42%),
    linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.03));
  box-shadow:
    0 18px 40px rgba(0,0,0,.30),
    inset 0 1px 0 rgba(255,255,255,.05);
}

.ld_coach_output::before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:3px;
  background:linear-gradient(90deg, var(--c2), var(--c1), var(--c3));
  opacity:.95;
}

.ld_coach_glow{
  position:absolute;
  inset:auto -20% -30% auto;
  width:220px;
  height:220px;
  border-radius:999px;
  background:radial-gradient(circle, rgba(138,91,255,.18), transparent 65%);
  pointer-events:none;
  filter:blur(10px);
}

.ld_coach_body{
  position:relative;
  padding:16px;
}

.ld_coach_text{
  white-space:pre-wrap;
  min-height:280px;
  font-size:14px;
  line-height:1.65;
  color:rgba(241,244,255,.94);
}

.ld_coach_footer{
  display:flex;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  padding-top:12px;
  margin-top:12px;
  border-top:1px solid rgba(255,255,255,.08);
}

.ld_coach_metaItem{
  display:flex;
  flex-direction:column;
  gap:4px;
  min-width:110px;
}

.ld_coach_metaItem .k{
  font-size:11px;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--muted2);
  font-weight:800;
}

.ld_coach_metaItem .v{
  font-size:13px;
  color:rgba(233,236,255,.90);
  font-weight:800;
}

@media (max-width:560px){
  .ld_coach_text{
    min-height:220px;
    font-size:13px;
    line-height:1.55;
  }

  .ld_coach_head{
    padding:10px 12px;
  }

  .ld_coach_title{
    font-size:16px;
  }
}
  
  .ld_game_shell{
  display:flex;
  flex-direction:column;
  gap:14px;
}

.ld_game_top{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:center;
  justify-content:space-between;
}

.ld_game_stats{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.ld_game_stat{
  min-width:110px;
  padding:10px 12px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
}

.ld_game_stat .k{
  font-size:11px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--muted2);
  font-weight:800;
}

.ld_game_stat .v{
  margin-top:6px;
  font-size:18px;
  font-weight:900;
  color:rgba(245,247,255,.96);
}

.ld_game_wrap{
  position:relative;
  width:100%;
  border-radius:26px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  background:
    radial-gradient(120% 140% at 0% 0%, rgba(34,211,238,.10), transparent 40%),
    radial-gradient(120% 140% at 100% 0%, rgba(138,91,255,.16), transparent 44%),
    linear-gradient(180deg, rgba(10,12,24,.96), rgba(8,10,20,.92));
  box-shadow:
    0 24px 60px rgba(0,0,0,.40),
    inset 0 1px 0 rgba(255,255,255,.05);
}


#ld_game_canvas{
  display:block;
  width:100%;
  height:auto;
  aspect-ratio:16/9;
  background:
    linear-gradient(180deg, rgba(20,24,48,1) 0%, rgba(12,16,34,1) 50%, rgba(8,10,20,1) 100%);
}

.ld_game_overlay{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:20px;
  pointer-events:none;
}

.ld_game_overlaybox{
  max-width:320px;
  padding:8px 10px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(6,8,18,.38);
  backdrop-filter:blur(8px);
  box-shadow:0 10px 22px rgba(0,0,0,.24);
}

.ld_game_title{
  font-size:16px;
  font-weight:950;
  letter-spacing:-0.03em;
  color:#fff;
  margin-bottom:8px;
}

.ld_game_sub{
  color:var(--muted);
  line-height:1.3;
  font-size:11px;
}

.ld_game_controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.ld_game_note{
  color:var(--muted);
  font-size:13px;
  line-height:1.45;
}

@media (max-width:560px){
  .ld_game_title{
    font-size:20px;
  }

  .ld_game_stat{
    min-width:unset;
    flex:1 1 calc(50% - 10px);
  }
}

.ld_game_shell_compact{
  gap:10px;
}

.ld_game_top_compact{
  align-items:flex-start;
  gap:8px;
}

.ld_game_stats_compact{
  gap:8px;
}

.ld_game_stats_compact .ld_game_stat{
  min-width:92px;
  padding:8px 10px;
}

.ld_game_stats_compact .ld_game_stat .k{
  font-size:10px;
}

.ld_game_stats_compact .ld_game_stat .v{
  font-size:15px;
  margin-top:4px;
}

.ld_game_wrap_compact{
  min-height:0;
}

.ld_game_bottombar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
}

.ld_game_live{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.ld_game_livebox{
  min-width:90px;
  padding:8px 10px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
}

.ld_game_livebox .k{
  font-size:10px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--muted2);
  font-weight:800;
}

.ld_game_livebox .v{
  margin-top:4px;
  font-size:16px;
  font-weight:900;
  color:rgba(245,247,255,.96);
}

/* ===== TIKTOK / CONTENT MODE ===== */
.ld_content_tools{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
}

.ld_toggle_group{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}

.ld_toggle_btn{
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  color:var(--txt);
  border-radius:999px;
  padding:10px 12px;
  font-weight:800;
  cursor:pointer;
  min-height:40px;
}

.ld_toggle_btn.active{
  background:linear-gradient(135deg, rgba(138,91,255,.55), rgba(34,211,238,.25));
  border-color:rgba(255,255,255,.18);
  box-shadow:0 10px 24px rgba(0,0,0,.22);
}

body.ld_record_mode #ld_left,
body.ld_record_mode #ld_right,
body.ld_record_mode #ld_mnav,
body.ld_record_mode #ld_badge{
  display:none !important;
}

body.ld_record_mode #ld_top{
  max-width:980px;
}

body.ld_record_mode #ld_grid{
  grid-template-columns:1fr !important;
  max-width:980px;
}

body.ld_record_mode #ld_center{
  width:100%;
}

body.ld_record_mode .hero{
  padding:22px 22px 10px !important;
}

body.ld_record_mode .ld_cards{
  grid-template-columns:1fr !important;
}

body.ld_record_mode .ld_card:not(:nth-child(2)){
  display:none !important;
}

body.ld_record_mode .ld_coach_output{
  min-height:420px;
}

body.ld_record_mode .ld_coach_text{
  font-size:18px;
  line-height:1.75;
  min-height:320px;
}

body.ld_record_mode .ld_coach_footer{
  display:none;
}

body.ld_record_mode .ld_heroart{
  opacity:.35;
}

#ld_record_badge{
  display:none;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);
  color:rgba(233,236,255,.90);
  padding:8px 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:900;
}

body.ld_record_mode #ld_record_badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
}

.ld_roast_line{
  margin-top:10px;
  padding:12px 14px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.10);
  background:linear-gradient(135deg, rgba(255,77,109,.12), rgba(138,91,255,.10));
  color:rgba(245,247,255,.96);
  font-weight:800;
  line-height:1.45;
}
  
/* ===== SAFE MOBILE SIMPLIFY PATCH ===== */
@media (max-width:860px){
  #ld_mnav .row{
    grid-template-columns:repeat(5, minmax(0, 1fr));
  }

  #ld_center .hero{
    padding:16px 16px 10px;
  }

  #ld_center .hero .kicker{
    opacity:.85;
  }

  #ld_center .hero .ld_sub{
    font-size:14px;
    max-width:none;
  }

  .ld_actionsRow{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
  }

  .ld_actionsRow .ld_btn[data-open="screenshot"]{
    grid-column:1 / -1;
    width:100%;
    justify-self:stretch;
  }

  .ld_content_tools{
    display:none !important;
  }

  .ld_cards > .ld_card:nth-child(3),
  .ld_cards > .ld_card:nth-child(4){
    display:none;
  }

  .ld_brain{
    height:112px;
  }

  .ld_coach_text{
    min-height:180px;
  }

  #ld_badge{
    display:none;
  }
}

@media (max-width:560px){
  .ld_actionsRow{
    grid-template-columns:1fr;
  }

  .ld_actionsRow .ld_btn[data-open="screenshot"]{
    grid-column:auto;
    width:100%;
  }

  #ld_center .hero{
    padding:14px 14px 8px;
  }

  .ld_centerTitle{
    margin:0 0 10px;
    max-width:9ch;
  }

  .ld_coach_text{
    min-height:150px;
  }

  .ld_card .top{
    padding:12px 12px 8px;
  }

  .ld_card .mid{
    padding:0 12px 12px;
  }

  .ld_card .btm{
    padding:12px;
  }
}


/* ===== LUXURY COSMIC THEME OVERRIDE ===== */
:root{
  --bg0:#030308;
  --bg1:#070613;
  --panel:rgba(12,9,28,.78);
  --stroke:rgba(177,126,255,.18);
  --txt:#f5f1ff;
  --muted:rgba(223,214,245,.78);
  --muted2:rgba(201,187,232,.52);
  --c1:#8e5bff;
  --c2:#c07cff;
  --c3:#ff4fae;
  --c4:#8d79ff;
  --danger:#d93b79;
  --warn:#ffb34d;
  --ok:#9d7cff;
  --r1:28px;
  --shadow2:0 22px 54px rgba(0,0,0,.46);
}
#ld_app{
  background:
    radial-gradient(1200px 680px at 78% 28%, rgba(114,56,255,.20), transparent 48%),
    radial-gradient(800px 520px at 72% 82%, rgba(120,39,171,.16), transparent 48%),
    radial-gradient(700px 500px at 18% 12%, rgba(91,61,214,.12), transparent 42%),
    linear-gradient(180deg, #04040a 0%, #070611 42%, #05040c 100%);
}
#ld_bg{
  background:
    radial-gradient(1200px 680px at 80% 24%, rgba(120,74,255,.24), transparent 42%),
    radial-gradient(780px 520px at 74% 82%, rgba(207,64,255,.12), transparent 44%),
    radial-gradient(760px 520px at 14% 14%, rgba(73,35,150,.16), transparent 40%),
    linear-gradient(180deg, #030308 0%, #060511 48%, #04040a 100%);
}
#ld_noise{ opacity:.08; }
#ld_glowgrid{ opacity:.10; }
#ld_shell::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:-1;
  background-image:
    radial-gradient(1.3px 1.3px at 8% 16%, rgba(255,255,255,.75) 0, transparent 100%),
    radial-gradient(1.2px 1.2px at 18% 34%, rgba(207,186,255,.55) 0, transparent 100%),
    radial-gradient(1.4px 1.4px at 31% 20%, rgba(255,255,255,.62) 0, transparent 100%),
    radial-gradient(1.2px 1.2px at 44% 62%, rgba(209,177,255,.52) 0, transparent 100%),
    radial-gradient(1.4px 1.4px at 58% 14%, rgba(255,255,255,.72) 0, transparent 100%),
    radial-gradient(1.2px 1.2px at 67% 42%, rgba(188,152,255,.48) 0, transparent 100%),
    radial-gradient(1.4px 1.4px at 81% 18%, rgba(255,255,255,.6) 0, transparent 100%),
    radial-gradient(1.1px 1.1px at 90% 30%, rgba(199,171,255,.45) 0, transparent 100%),
    radial-gradient(1.2px 1.2px at 14% 80%, rgba(255,255,255,.56) 0, transparent 100%),
    radial-gradient(1.5px 1.5px at 86% 74%, rgba(255,255,255,.66) 0, transparent 100%);
  opacity:.55;
}
#ld_top{
  background:linear-gradient(180deg, rgba(8,8,18,.92), rgba(8,8,18,.84));
  border:1px solid rgba(171,117,255,.34);
  box-shadow:0 18px 48px rgba(0,0,0,.44), inset 0 0 0 1px rgba(255,255,255,.04), 0 0 28px rgba(123,74,255,.10);
}
#ld_logo{
  background:
    radial-gradient(circle at 35% 28%, rgba(255,255,255,.20), transparent 30%),
    linear-gradient(145deg, #7d42ff 0%, #5723cc 46%, #341066 100%);
  box-shadow:0 12px 28px rgba(92,48,210,.32), 0 0 0 1px rgba(216,190,255,.12), inset 0 1px 0 rgba(255,255,255,.14);
}
.ld_brandname{
  font-weight:800;
  color:#fbf8ff;
}
#ld_btn_name,
#ld_btn_help{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(177,126,255,.16);
}
#ld_btn_upgrade{
  background:linear-gradient(135deg, #7d42ff 0%, #5d2ce8 46%, #8c5fff 100%);
  border:1px solid rgba(220,196,255,.28);
  box-shadow:0 10px 26px rgba(107,54,228,.28), inset 0 1px 0 rgba(255,255,255,.12);
}
.ld_pill,
.ld_badge,
.ld_chip,
.ld_toggle_btn,
.ld_auth_tab,
.ld_game_stat,
.ld_game_livebox,
.ld_metric,
.ld_sideCard,
.ld_coach_head,
.ld_coach_output,
#ld_mmenu,
#ld_sheet,
#ld_ob,
#ld_auth{
  border-color:rgba(170,124,255,.14);
}
.ld_panel,
.ld_card,
.ld_sideCard,
#ld_mmenu,
#ld_sheet,
#ld_ob,
#ld_auth{
  background:linear-gradient(180deg, rgba(10,8,22,.88), rgba(8,7,18,.82));
  box-shadow:0 22px 54px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.03);
}
#ld_center .hero{
  position:relative;
  overflow:hidden;
  border-bottom:1px solid rgba(171,117,255,.10);
  background:
    radial-gradient(560px 320px at 78% 34%, rgba(124,61,255,.22), transparent 42%),
    radial-gradient(320px 220px at 82% 30%, rgba(205,76,255,.18), transparent 38%),
    linear-gradient(180deg, rgba(8,8,18,.28), rgba(8,8,18,0));
}
#ld_center .hero::after{
  content:"";
  position:absolute;
  right:18px;
  top:22px;
  width:240px;
  height:240px;
  border-radius:999px;
  background:
    radial-gradient(circle at 36% 36%, rgba(187,132,255,.42), rgba(96,36,206,.18) 34%, rgba(28,10,58,.02) 60%, transparent 68%);
  box-shadow:0 0 80px rgba(135,72,255,.22), inset -12px -18px 28px rgba(0,0,0,.45);
  opacity:.88;
  pointer-events:none;
}
#ld_center .hero::before{
  content:"";
  position:absolute;
  right:4px;
  top:86px;
  width:310px;
  height:120px;
  border-top:2px solid rgba(156,101,255,.34);
  border-bottom:1px solid transparent;
  border-radius:50%;
  transform:rotate(-19deg);
  opacity:.7;
  pointer-events:none;
}
.ld_heroart{ opacity:.12; filter:blur(1px) saturate(0.8); }
.ld_centerTitle{
  font-size:clamp(38px, 4.8vw, 64px);
  line-height:.95;
  max-width:8.7ch;
  color:#f7f4ff;
}
.ld_centerTitle .grad{
  background:linear-gradient(90deg, #a76dff 0%, #8a52ff 48%, #d25cff 100%);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}
.kicker{ color:rgba(164,111,255,.86); letter-spacing:.20em; }
.ld_sub{ color:rgba(224,216,242,.76); max-width:28ch; }
.ld_btn{
  border:1px solid rgba(173,125,255,.14);
  background:rgba(255,255,255,.025);
}
.ld_btn.primary{
  background:linear-gradient(90deg, #6b3aff 0%, #4d2fd0 55%, #5e4eff 100%);
  box-shadow:0 16px 34px rgba(100,52,228,.24), inset 0 1px 0 rgba(255,255,255,.10);
}
.ld_btn.danger{
  background:linear-gradient(90deg, #8d123d 0%, #c12567 45%, #7f174e 100%);
  box-shadow:0 16px 34px rgba(173,30,88,.20), inset 0 1px 0 rgba(255,255,255,.08);
}
.ld_actionsRow .ld_btn.ghost,
.ld_card .btm .ld_btn.ghost,
.ld_btn.ghost{
  background:linear-gradient(180deg, rgba(12,10,26,.84), rgba(8,7,18,.84));
}
.ld_card .top,
.ld_panel .hd,
.ld_sideCard .h{
  background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
}
.ld_card h4,
.ld_big,
.ld_coach_title{ color:#f7f4ff; }
.ld_card p,
.ld_small,
.ld_hint,
.ld_kv,
.ld_metric .t,
.ld_coach_metaItem .k,
.ld_coach_label{ color:rgba(218,208,240,.66); }
.ld_metric .v,
.ld_coach_metaItem .v,
.ld_kv b{ color:#f2ecff; }
.ld_bar,
.ld_out,
.ld_field,
.ld_notice,
.ld_guest_box,
.ld_ob_card,
.ld_auth_hero{
  background:rgba(255,255,255,.03);
  border-color:rgba(173,125,255,.12);
}
.ld_field:focus,
textarea.ld_field:focus{
  border-color:rgba(179,130,255,.36);
  box-shadow:0 0 0 3px rgba(123,74,255,.14);
}
.ld_coach_output,
.ld_out{
  background:
    radial-gradient(120% 160% at 0% 0%, rgba(104,55,230,.14), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
}
#ld_mnav{
  background:linear-gradient(180deg, rgba(6,6,14,0), rgba(6,6,14,.84), rgba(4,4,10,.98));
  border-top:1px solid rgba(171,117,255,.12);
}
.ld_mbtn{
  border:1px solid rgba(173,125,255,.12);
  background:linear-gradient(180deg, rgba(12,10,24,.92), rgba(8,7,18,.96));
}
.ld_mbtn.active,
.ld_mbtn:hover{
  box-shadow:0 0 0 1px rgba(180,136,255,.20), 0 12px 24px rgba(74,34,182,.22);
}
#ld_mmenu{ background:linear-gradient(180deg, rgba(7,7,16,.98), rgba(8,7,18,.96)); }
#ld_sheet .shd,
#ld_mmenu .hd,
#ld_ob .hd,
#ld_auth .hd{
  background:linear-gradient(180deg, rgba(10,8,22,.98), rgba(10,8,22,.90));
}
#ld_right .bd,
#ld_left .bd,
#ld_center .hero,
.ld_cards{ position:relative; }
@media (max-width:860px){
  #ld_center .hero::after{
    width:180px;
    height:180px;
    right:10px;
    top:48px;
    opacity:.72;
  }
  #ld_center .hero::before{
    width:220px;
    right:-8px;
    top:108px;
    opacity:.52;
  }
  .ld_sub{ max-width:20ch; }
}
@media (max-width:560px){
  #ld_top{
    border-radius:18px;
    padding:8px 10px;
  }
  #ld_center .hero{
    padding:16px 14px 10px;
  }
  .ld_centerTitle{
    font-size:clamp(30px, 10vw, 46px);
    max-width:7.5ch;
  }
  .ld_sub{
    font-size:13px;
    max-width:17ch;
  }
  #ld_center .hero::after{
    width:132px;
    height:132px;
    right:8px;
    top:66px;
    opacity:.64;
  }
  #ld_center .hero::before{
    width:160px;
    top:112px;
    right:-16px;
  }
  .ld_actionsRow{
    gap:8px;
  }
}

/* ===== SCREENSHOT DECODER ===== */
.ld_sd_shell{display:flex;flex-direction:column;gap:14px;}
.ld_sd_hero{position:relative;overflow:hidden;border:1px solid rgba(173,125,255,.14);border-radius:28px;padding:16px;background:radial-gradient(120% 180% at 0% 0%, rgba(104,55,230,.16), transparent 34%),radial-gradient(120% 180% at 100% 0%, rgba(210,92,255,.10), transparent 32%),linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.025));box-shadow:0 18px 40px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04);}
.ld_sd_hero::before{content:"";position:absolute;right:-40px;top:-50px;width:220px;height:220px;border-radius:999px;background:radial-gradient(circle, rgba(167,109,255,.30), rgba(167,109,255,.08) 38%, transparent 68%);filter:blur(8px);pointer-events:none;}
.ld_sd_title{font-size:22px;font-weight:950;letter-spacing:-.04em;color:#f7f4ff;margin:2px 0 8px;}
.ld_sd_sub{color:rgba(224,216,242,.76);font-size:14px;line-height:1.55;max-width:58ch;}
.ld_sd_grid{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);gap:14px;align-items:start;}
.ld_sd_card{border:1px solid rgba(173,125,255,.12);border-radius:24px;background:linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.025));box-shadow:0 16px 36px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.03);overflow:hidden;}
.ld_sd_card .hd{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));}
.ld_sd_card .bd{padding:16px;}
.ld_sd_upload{position:relative;display:flex;align-items:center;justify-content:center;min-height:240px;border:1px dashed rgba(183,136,255,.26);border-radius:24px;background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));overflow:hidden;}
.ld_sd_upload.has-image{border-style:solid;border-color:rgba(183,136,255,.18);min-height:320px;}
.ld_sd_upload input{position:absolute;inset:0;opacity:0;cursor:pointer;z-index:3;}
.ld_sd_uploadInner{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:22px;}
.ld_sd_uploadIcon{width:58px;height:58px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(135deg, rgba(142,91,255,.26), rgba(210,92,255,.18));border:1px solid rgba(255,255,255,.10);box-shadow:0 14px 28px rgba(96,36,206,.22);}
.ld_sd_previewWrap{position:absolute;inset:0;display:none;}
.ld_sd_upload.has-image .ld_sd_previewWrap{display:block;}
.ld_sd_upload.has-image .ld_sd_uploadInner{display:none;}
#ld_sd_preview{width:100%;height:100%;object-fit:contain;background:rgba(6,6,14,.58);}
.ld_sd_tagrow{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}
.ld_sd_tag{padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-size:12px;font-weight:800;color:rgba(237,232,248,.86);}
.ld_sd_output{position:relative;overflow:hidden;border:1px solid rgba(173,125,255,.14);border-radius:26px;background:radial-gradient(120% 160% at 0% 0%, rgba(104,55,230,.16), transparent 34%),radial-gradient(120% 180% at 100% 0%, rgba(210,92,255,.08), transparent 32%),linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.02));min-height:360px;box-shadow:0 18px 42px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04);}
.ld_sd_output::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg, var(--c2), var(--c1), var(--c3));opacity:.95;}
.ld_sd_outputBody{position:relative;padding:18px;display:flex;flex-direction:column;gap:14px;min-height:360px;}
.ld_sd_statusRow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.ld_sd_status{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-size:12px;font-weight:900;color:rgba(245,241,255,.92);}
.ld_sd_result{white-space:pre-wrap;color:rgba(241,244,255,.94);font-size:14px;line-height:1.7;min-height:210px;}
.ld_sd_locked{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px;}
.ld_sd_meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.ld_sd_meta .ld_metric{padding:11px 12px;border-radius:18px;}
.ld_sd_row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
.ld_sd_row .ld_btn{flex:0 0 auto;}
.ld_sd_empty{color:rgba(218,208,240,.66);}
.ld_sd_chiprow{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.ld_sd_chip{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);border-radius:999px;padding:9px 10px;font-weight:800;color:rgba(233,236,255,.82);cursor:pointer;user-select:none;}
.ld_sd_chip.active{background:linear-gradient(135deg, rgba(138,91,255,.55), rgba(210,92,255,.22));border-color:rgba(255,255,255,.18);}
@media (min-width:861px){
  #ld_grid{grid-template-columns:1fr !important;max-width:980px;}
  #ld_left,#ld_right{display:none !important;}
  .ld_cards{grid-template-columns:1fr !important;padding:0 0 18px !important;}
  #ld_center .hero{padding:20px 20px 12px;}
  .ld_actionsRow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
}
@media (max-width:860px){
  .ld_sd_grid{grid-template-columns:1fr;}
  .ld_sd_output,.ld_sd_outputBody{min-height:unset;}
}
@media (max-width:560px){
  .ld_sd_hero{padding:14px;border-radius:22px;}
  .ld_sd_title{font-size:20px;}
  .ld_sd_sub{font-size:13px;}
  .ld_sd_upload{min-height:200px;border-radius:20px;}
  .ld_sd_upload.has-image{min-height:250px;}
  .ld_sd_output{border-radius:22px;}
  .ld_sd_outputBody{padding:14px;}
  .ld_sd_meta{grid-template-columns:1fr;}
  .ld_sd_row .ld_btn{width:100%;flex:1 1 100%;}
}


  `;
  const HTML = `
<div id="ld_bg" aria-hidden="true"></div>
<div id="ld_noise" aria-hidden="true"></div>
<div id="ld_glowgrid" aria-hidden="true"></div>
<canvas id="ld_particles" aria-hidden="true"></canvas>

<div id="ld_shell">
  <div id="ld_top">
    <div id="ld_brand">
      <div id="ld_logo" aria-hidden="true"></div>
      <span class="ld_brandname">LifeDecode</span>
    </div>

    <div id="ld_topnav">
      <div class="ld_pill" title="System status">
        <span class="ld_dot ok" id="ld_status_dot"></span>
        <span id="ld_status_text">READY</span>
      </div>

      <button class="ld_btn ghost compact" id="ld_btn_name" title="Account info">
        <span class="ld_icon" aria-hidden="true">👤</span>
        <span id="ld_name_label">Member</span>
      </button>

      <button class="ld_btn ghost compact" id="ld_btn_help" title="Help / Guide" aria-label="Help">
  <span class="ld_icon ld_help_icon" aria-hidden="true">❓</span>
  <span class="ld_help_text">Help</span>
</button>

      <button class="ld_btn primary compact" id="ld_btn_upgrade">
        <span class="ld_icon" aria-hidden="true">⚡</span>
        Upgrade
      </button>
    </div>
  </div>

  <div id="ld_grid">
    <div class="ld_panel" id="ld_left">
      <div class="hd">
        <div>
          <div class="kicker">NAV</div>
          <h3>Modules</h3>
        </div>
        <div class="ld_badge" id="ld_mode_badge"><span class="ld_dot ok"></span> Account Ready</div>
      </div>
      <div class="bd">
        <div class="ld_nav" id="ld_nav">
         <button data-open="dashboard" class="active">🏠 Home <small>Main daily flow & quick actions</small></button>
<button data-open="checkin">✅ Daily Check-In <small>Free • Streak, XP & daily reset</small></button>
<button data-open="urge">🚨 Emergency Button <small>Free • Calm-down, breathing & reset guide</small></button>
<button data-open="trigger">🧠 Trigger Decoder <small>Free • Analyze patterns & relapse signals</small></button>
<button data-open="screenshot">🖼️ SCREENSHOT DECODER <small>Free preview • Decode chats, mixed signals & hidden intent</small></button>
<button data-open="coach">✨ Coach Output <small>Free / Premium • AI Focused plan</small></button>
<button data-open="minigame">🎮 Focus Jump <small>Premium • LD Orb cyber run</small></button>
<button data-open="archive">🗂 Archive <small>View saved check-ins, triggers, plans & journal</small></button>
<div class="sep"></div>
<button data-open="journal">📓 Journal <small>Premium • Private Focused notes & entries</small></button>
<button data-open="insights">📈 Insights <small>Premium • Trends, behavior & pattern notes</small></button>
<button data-open="tools">🧰 Tools <small>Premium • Export, reload & utilities</small></button>
<button data-open="settings">⚙️ Settings <small>Account, sync & premium status</small></button>
<button data-open="progress">🏆 Progress <small>Premium • Levels, milestones & rewards</small></button>
        </div>
      </div>
    </div>

    <div class="ld_panel" id="ld_center">
      <div class="hero">
        <svg class="ld_heroart" viewBox="0 0 600 380" aria-hidden="true">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#22d3ee" stop-opacity=".85"></stop>
              <stop offset=".5" stop-color="#8a5bff" stop-opacity=".85"></stop>
              <stop offset="1" stop-color="#ff3dd6" stop-opacity=".75"></stop>
            </linearGradient>
            <radialGradient id="rg" cx="50%" cy="40%" r="60%">
              <stop offset="0" stop-color="#ffffff" stop-opacity=".22"></stop>
              <stop offset="1" stop-color="#ffffff" stop-opacity="0"></stop>
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="600" height="380" rx="42" fill="url(#rg)"></rect>
          <path d="M150,340 C220,250 230,160 310,110 C390,60 450,90 500,30" fill="none" stroke="url(#g1)" stroke-width="10" stroke-linecap="round" opacity=".85"></path>
          <path d="M120,330 C200,235 205,145 290,95 C375,45 455,80 520,26" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="4" stroke-linecap="round"></path>
          <g opacity=".8">
            <circle cx="175" cy="300" r="10" fill="#22d3ee"></circle>
            <circle cx="300" cy="150" r="10" fill="#8a5bff"></circle>
            <circle cx="455" cy="92" r="10" fill="#ff3dd6"></circle>
          </g>
        </svg>

        <div class="kicker">Focused DASHBOARD</div>
        <div class="ld_centerTitle">
          Welcome back, <span class="grad" id="ld_name_big">Member</span>.
        </div>
        <div class="ld_sub" id="ld_subline">
         Daily check-ins, calming protocols, trigger decoding, screenshot decoding, and structured 12-hour action plans. Built for self-control, clarity, and momentum.
        </div>

                <div class="ld_actionsRow">
          <button class="ld_btn primary" data-open="checkin">New Check-In</button>
          <button class="ld_btn danger" data-open="urge">Emergency Button</button>
          <button class="ld_btn ghost" data-open="coach">Generate Plan</button>
          <button class="ld_btn ghost" data-open="trigger">Decode Trigger</button>
          <button class="ld_btn ghost" data-open="screenshot">SCREENSHOT DECODER</button>
        </div>

        <div class="ld_content_tools">
          <div class="ld_toggle_group">
            <button class="ld_toggle_btn" id="ld_btn_recordmode" type="button">🎥 Record Mode</button>
          </div>

          <div class="ld_toggle_group" id="ld_tone_group">
            <button class="ld_toggle_btn active" data-tone="savage" type="button">Savage</button>
            <button class="ld_toggle_btn" data-tone="soft" type="button">Soft</button>
            <button class="ld_toggle_btn" data-tone="spiritual" type="button">Spiritual</button>
          </div>

          <div class="ld_toggle_group">
            <button class="ld_toggle_btn" id="ld_btn_random_question" type="button">🔥 Random Brutal Question</button>
          </div>

          <div id="ld_record_badge">
            <span class="ld_dot bad"></span>
            REC MODE
          </div>
        </div>
      </div>

      <div class="ld_cards">
        <div class="ld_card">
          <div class="top">
            <div>
              <div class="kicker">TODAY</div>
              <h4>Daily Check-Ins</h4>
             <p>Check in with how you feel, what is happening, whether it is getting better or worse, and your next small step.</p>
            </div>
            <div class="ld_badge" id="ld_checkin_status_badge"><span class="ld_dot warn"></span> Not done</div>
          </div>

          <div class="mid">
            <div class="ld_metricRow">
              <div class="ld_metric">
                <div class="t">Streak</div>
                <div class="v"><span id="ld_streak">0</span> days</div>
              </div>
              <div class="ld_metric">
                <div class="t">Level</div>
                <div class="v" id="ld_level">Aware Seeker</div>
              </div>
            </div>

            <div class="ld_metric" style="margin-top:10px;">
              <div class="t">XP</div>
              <div class="v"><span id="ld_xp">0</span> / <span id="ld_xp_next">1000</span></div>
              <div class="ld_bar"><i id="ld_xp_bar"></i></div>
            </div>

            <div class="ld_chiprow" id="ld_mood_row">
              <div class="ld_chip" data-mood="OK">OK</div>
              <div class="ld_chip" data-mood="STABLE">STABLE</div>
              <div class="ld_chip" data-mood="ANXIOUS">ANXIOUS</div>
              <div class="ld_chip" data-mood="NUMB">NUMB</div>
              <div class="ld_chip" data-mood="URGES">URGES</div>
            </div>

           <div class="ld_hint" id="ld_checkin_hint">Check in: how you feel, what is going on, whether it is getting better or worse, and your next small step.</div>
          </div>

          <div class="btm">
            <button class="ld_btn" data-open="checkin">Open Check-In</button>
            <button class="ld_btn ghost" data-open="progress">Progress</button>
          </div>
        </div>

        <div class="ld_card">
          <div class="top">
            <div>
              <div class="kicker">COACH OUTPUT</div>
              <h4>Next 12 hours plan</h4>
              <p id="ld_coach_meta">Get a practical AI Focused plan based on your mood, triggers, and current risk level.</p>
            </div>
            <div class="ld_badge"><span class="ld_dot ok"></span> Focused Mode</div>
          </div>

          <div class="mid">
  <div class="ld_coach_shell">
    <div class="ld_coach_head">
      <div class="ld_coach_headleft">
        <div class="ld_coach_label">AI OUTPUT</div>
        <div class="ld_coach_title">Next 12 Hours Battle Plan</div>
      </div>
      <div class="ld_coach_status" id="ld_coach_status_badge">FREE PREVIEW</div>
    </div>

    <div class="ld_coach_output">
      <div class="ld_coach_glow"></div>
      <div class="ld_coach_body">
        <div class="ld_coach_text" id="ld_coach_preview">No plan yet.</div>

        <div class="ld_coach_footer">
          <div class="ld_coach_metaItem">
            <div class="k">Last updated</div>
            <div class="v" id="ld_coach_meta_home">—</div>
          </div>

          <div class="ld_coach_metaItem">
            <div class="k">Saved plans</div>
            <div class="v" id="ld_coach_saved_home">0</div>
          </div>

          <div class="ld_coach_metaItem">
            <div class="k">Mode</div>
            <div class="v" id="ld_coach_mode_home">Focused</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="ld_hint" id="ld_paywall_hint">Some outputs can be locked behind upgrade (Stripe).</div>
</div>

          <div class="btm">
            <button class="ld_btn primary" id="ld_btn_genplan">Generate Plan</button>
            <button class="ld_btn" id="ld_btn_copyplan">Copy</button>
            <button class="ld_btn ghost" id="ld_btn_saveplan">Save</button>
          </div>
        </div>

        <div class="ld_card">
          <div class="top">
            <div>
              <div class="kicker">SCREENSHOT DECODER</div>
              <h4>Decode what the screenshot is really saying</h4>
              <p>Upload a chat screenshot and get a clean preview of the vibe, interest level, red flags, and what to do next.</p>
            </div>
            <div class="ld_badge"><span class="ld_dot ok"></span> Preview + Unlock</div>
          </div>

          <div class="mid">
            <div class="ld_hint">Perfect for mixed signals, cold replies, breadcrumbing, ghosting, manipulation, or “what does this even mean?” moments.</div>
            <div class="ld_hr"></div>
            <div class="ld_out" id="ld_sd_home_tease">Upload a screenshot → get a luxury preview → unlock the full decode with intent, hidden meaning, and reply advice.</div>
          </div>

          <div class="btm">
            <button class="ld_btn primary" data-open="screenshot">SCREENSHOT DECODER</button>
            <button class="ld_btn ghost" id="ld_btn_sd_unlock_home">Unlock Full Decode</button>
          </div>
        </div>

        <div class="ld_card">
          <div class="top">
            <div>
              <div class="kicker">EMERGENCY BUTTON</div>
<h4>Personalized calm reset</h4>
<p>Write what is happening right now and get a sharper AI reset for this exact spike, plus the same 90-second protocol.</p>
            </div>
            <div class="ld_badge" id="ld_urge_badge"><span class="ld_dot ok"></span> Ready</div>
          </div>

          <div class="mid">
            <textarea class="ld_field" id="ld_urge_input" placeholder="What is the emergency right now? Example: intense frustration, panic, urge to text, overthinking, rage, shame..."></textarea>
            <div class="ld_hint">Example: “I am frustrated and feel like exploding because nothing is working.”</div>
            <div class="ld_hr"></div>
            <div class="ld_out" id="ld_urge_text">Write the emergency above, get your personalized reset, then run the 90-second calm protocol.</div>
            <div class="ld_hint">Best flow: write it raw → get AI reset → hit Start Calm Protocol.</div>
          </div>

          <div class="btm">
            <button class="ld_btn primary" id="ld_btn_gen_emergency">Get Personalized Reset</button>
<button class="ld_btn danger" id="ld_btn_startrescue">Start Calm Protocol</button>
<button class="ld_btn" id="ld_btn_stoprescue">Stop</button>
<button class="ld_btn ghost" data-open="urge">Open Emergency</button>
          </div>
        </div>

        
        </div>
      </div>
    </div>

    <div class="ld_panel" id="ld_right">
      <div class="hd">
        <div>
          <div class="kicker">STATUS</div>
          <h3>Control Mode</h3>
        </div>
        <div class="ld_badge"><span class="ld_dot ok"></span> Active</div>
      </div>

      <div class="bd">
        <div class="ld_sideCard">
          <div class="h">Next coach session</div>
          <div class="c">
            <div class="ld_big" id="ld_next_session">Ready anytime</div>
            <div class="ld_small">You can generate a plan anytime. This box becomes more useful once scheduling is wired to your backend.</div>
            <div class="ld_hr"></div>
            <button class="ld_btn primary" style="width:100%;" data-open="coach">Start Session</button>
          </div>
        </div>

        <div class="ld_sideCard">
          <div class="h">Neural insights</div>
          <div class="c">
            <div class="ld_kv"><span>Triggers</span><b id="ld_ins_triggers">—</b></div>
            <div class="ld_kv"><span>Urges</span><b id="ld_ins_urges">—</b></div>
            <div class="ld_kv"><span>Control</span><b id="ld_ins_control">—</b></div>
            <div class="ld_hr"></div>
            <div class="ld_brain" aria-hidden="true"></div>
            <div class="ld_hr"></div>
            <button class="ld_btn" style="width:100%;" data-open="insights">View Insights</button>
          </div>
        </div>

        <div class="ld_sideCard">
          <div class="h">Next milestone</div>
          <div class="c">
            <div class="ld_big"><span id="ld_milestone_days">30</span> days clean</div>
            <div class="ld_small">Milestones are based on your synced account data.</div>
            <div class="ld_hr"></div>
            <button class="ld_btn ghost" style="width:100%;" data-open="progress">See rewards</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="ld_mnav" role="navigation" aria-label="Quick modules">
  <div class="row">
    <button class="ld_mbtn" data-open="dashboard" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M5 10.5V20h14v-9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <span>Home</span>
    </button>

    <button class="ld_mbtn" data-open="checkin" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <span>Check-In</span>
    </button>

    <button class="ld_mbtn" data-open="urge" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z" stroke="currentColor" stroke-width="2"></path>
      </svg>
      <span>Calm</span>
    </button>

    <button class="ld_mbtn" data-open="screenshot" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a1 1 0 0 1-2-2Z" stroke="currentColor" stroke-width="2"></path>
        <path d="M14 4v6h6" stroke="currentColor" stroke-width="2"></path>
      </svg>
      <span>Plan</span>
    </button>

    <button class="ld_mbtn" id="ld_mbtn_menu" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      </svg>
      <span>Menu</span>
    </button>
  </div>
</div>

<div id="ld_mmenu_backdrop" aria-hidden="true"></div>
<div id="ld_mmenu" role="dialog" aria-modal="true" aria-label="Modules menu">
  <div class="hd">
    <div>
      <div class="kicker">NAV</div>
      <h3 style="margin:6px 0 0;">Modules</h3>
    </div>
    <button class="ld_btn ghost compact" id="ld_mmenu_close" type="button">Close</button>
  </div>

  <div class="bd">
    <div class="ld_mmenu_nav" id="ld_mmenu_nav">
      <button data-open="dashboard" class="active">🏠 Home <small>Main daily flow & quick actions</small></button>
      <button data-open="checkin">✅ Daily Check-In <small>Free • Streak, XP & daily reset</small></button>
      <button data-open="urge">🚨 Emergency Button <small>Free • Calm-down, breathing & reset guide</small></button>
      <button data-open="trigger">🧠 Trigger Decoder <small>Free • Analyze patterns & relapse signals</small></button>
      <button data-open="screenshot">🖼️ SCREENSHOT DECODER <small>Free preview • Decode chats, mixed signals & hidden intent</small></button>
      <button data-open="coach">✨ Coach Output <small>Free / Premium • AI action plan</small></button>
      <button data-open="minigame">🎮 Focus Jump <small>Premium • LD Orb cyber run</small></button>
      <button data-open="archive">🗂 Archive <small>View saved check-ins, triggers, plans & journal</small></button>
      <div class="sep"></div>
      <button data-open="journal">📓 Journal <small>Premium • Private notes & entries</small></button>
      <button data-open="insights">📈 Insights <small>Premium • Trends, behavior & pattern notes</small></button>
      <button data-open="tools">🧰 Tools <small>Premium • Export, reload & utilities</small></button>
      <button data-open="settings">⚙️ Settings <small>Account, sync & premium status</small></button>
      <button data-open="progress">🏆 Progress <small>Premium • Levels, milestones & rewards</small></button>
      <button data-open="help">❓ Help <small>Guide, examples & quick instructions</small></button>
    </div>
  </div>
</div>

<div id="ld_badge" aria-label="Version badge">
  <span id="ld_badge_text">LifeDecode AI v1</span>
  <button id="ld_badge_close" aria-label="Hide badge">✕</button>
</div>

<div id="ld_game_fullscreen">
  <button class="ld_btn ghost" id="ld_game_exit">Exit</button>
  <canvas id="ld_game_canvas_full"></canvas>
</div>

<div id="ld_sheet_backdrop" aria-hidden="true"></div>
<div id="ld_sheet" role="dialog" aria-modal="true" aria-label="Module sheet">
  <div class="shd">
    <b id="ld_sheet_title">MODULE</b>
    <div class="ld_row">
      <button class="ld_btn ghost" id="ld_sheet_close">Close</button>
    </div>
  </div>
  <div class="sbd" id="ld_sheet_body"></div>
</div>

<div id="ld_ob_backdrop" aria-hidden="true"></div>
<div id="ld_ob" role="dialog" aria-modal="true" aria-label="Onboarding">
  <div class="hd">
    <div>
      <div class="kicker">WELCOME</div>
      <h3 style="margin:6px 0 0;">LifeDecode Lab</h3>
    </div>
    <button class="ld_btn ghost compact" id="ld_ob_close" title="Skip">Skip</button>
  </div>
  <div class="bd" id="ld_ob_body"></div>
  <div class="ft">
    <div class="ld_hint" id="ld_ob_hint">Your account data will sync from your backend once connected.</div>
    <div class="ld_row ld_rightalign">
      <button class="ld_btn ghost" id="ld_ob_back">Back</button>
      <button class="ld_btn primary" id="ld_ob_next">Next</button>
    </div>
  </div>
</div>

<div id="ld_auth_backdrop" aria-hidden="true"></div>
<div id="ld_auth" role="dialog" aria-modal="true" aria-label="Auth">
  <div class="hd">
    <div>
      <div class="kicker">GET STARTED</div>
      <h3 style="margin:6px 0 0;">Choose how you want to enter</h3>
    </div>
    <button class="ld_btn ghost compact" id="ld_auth_close" title="Close">Close</button>
  </div>
  <div class="bd">
    <div class="ld_auth_hero">
      <div class="ld_ob_title">Best experience = with an account</div>
      <p class="ld_ob_sub">Create an account to sync your streak, XP, check-ins, triggers, coach plans and future premium access across devices.</p>
      <div class="ld_goodbox">
        <strong>Recommended:</strong> account mode gives full sync + real progress history.
      </div>
    </div>

    <div class="ld_auth_tabs">
      <button class="ld_auth_tab active" data-auth-tab="signup">Create account</button>
      <button class="ld_auth_tab" data-auth-tab="login">Login</button>
      <button class="ld_auth_tab" data-auth-tab="guest">Continue as guest</button>
    </div>

    <div id="ld_auth_panel"></div>
    <div class="ld_warnbox" id="ld_auth_error"></div>
    <div class="ld_hint" id="ld_auth_loading">Working...</div>
  </div>
  <div class="ft">
    <div class="ld_hint">Guest mode works too, but account mode is the move if you want the full experience.</div>
  </div>
</div>
`;

 function injectCSS() {
  if (!document.getElementById("ld_font_inter")) {
    const link = document.createElement("link");
    link.id = "ld_font_inter";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }

   
  if (document.getElementById("ld_single_style")) return;

  const style = document.createElement("style");
  style.id = "ld_single_style";
  style.textContent = CSS;
  document.head.appendChild(style);
}

  function renderHTML() {
    let app = document.getElementById("ld_app");
    if (!app) {
      app = document.createElement("div");
      app.id = "ld_app";
      document.body.prepend(app);
    }
    app.innerHTML = HTML;
    return true;
  }

  function startWhenReady() {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
      let app = document.getElementById("ld_app");
      if (!app) {
        app = document.createElement("div");
        app.id = "ld_app";
        document.body.prepend(app);
      }
      if (app) {
        clearInterval(timer);
        injectCSS();
        renderHTML();
        try {
          initLifeDecode();
        } catch (err) {
          console.error("[LD] init crash:", err);
          if (app) {
            app.innerHTML = `
              <div style="min-height:100vh;padding:24px;background:#05060d;color:#eef2ff;font-family:Inter,Arial,sans-serif;">
                <div style="max-width:900px;margin:0 auto;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:20px;background:rgba(255,255,255,.04)">
                  <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.7;margin-bottom:8px">LifeDecode Debug</div>
                  <h2 style="margin:0 0 10px">Init crashed</h2>
                  <p style="opacity:.85;line-height:1.6">Open browser console (F12) and look for <b>[LD] init crash:</b></p>
                  <pre style="white-space:pre-wrap;overflow:auto;background:#0d1020;border:1px solid rgba(255,255,255,.08);padding:14px;border-radius:14px;">${(err && (err.stack || err.message)) || err}</pre>
                </div>
              </div>`;
          }
        }
      } else {
        tries++;
        if (tries >= maxTries) {
          clearInterval(timer);
          console.error("[LD] #ld_app not found. Script stopped.");
        }
      }
    }, 100);
  }

  function initLifeDecode() {
   const CONTENT = {
  recordMode: false,
  tone: "savage"
};

function safeRead(key, def){
  try{
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  }catch(e){ return def; }
}

function safeWrite(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){}
}

CONTENT.recordMode = safeRead(CFG.STORAGE_KEYS.UI_MODE, false);
CONTENT.tone = safeRead(CFG.STORAGE_KEYS.TONE_MODE, "savage") || "savage";

function applyRecordMode(){
  document.body.classList.toggle("ld_record_mode", CONTENT.recordMode);

  const btn = document.getElementById("ld_btn_recordmode");
  if(btn){
    btn.classList.toggle("active", CONTENT.recordMode);
    btn.textContent = CONTENT.recordMode ? "🎥 Exit Record Mode" : "🎥 Record Mode";
  }
}

function applyTone(){
  document.querySelectorAll("#ld_tone_group [data-tone]").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.tone === CONTENT.tone);
  });
}

document.getElementById("ld_btn_recordmode")?.addEventListener("click", ()=>{
  CONTENT.recordMode = !CONTENT.recordMode;
  safeWrite(CFG.STORAGE_KEYS.UI_MODE, CONTENT.recordMode);
  applyRecordMode();
});

document.querySelectorAll("#ld_tone_group [data-tone]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    CONTENT.tone = btn.dataset.tone;
    safeWrite(CFG.STORAGE_KEYS.TONE_MODE, CONTENT.tone);
    applyTone();
  });
});

document.getElementById("ld_btn_random_question")?.addEventListener("click", ()=>{
  const arr = CFG.RANDOM_QUESTIONS || [];
  const q = arr[Math.floor(Math.random()*arr.length)] || "What truth am I avoiding?";

  const el = document.getElementById("ld_coach_preview");
if(el) el.textContent = q;

navigator.clipboard?.writeText(q);
});
    
applyRecordMode();
applyTone();
    if (window.__LD_Focused_INIT__) return;
    window.__LD_Focused_INIT__ = true;

    const $ = (sel, root = document) => {
      try {
        if (typeof root === "string") root = document.querySelector(root) || document;
        return root.querySelector(sel);
      } catch (e) {
        return null;
      }
    };

    const $$ = (sel, root = document) => {
      try {
        if (typeof root === "string") root = document.querySelector(root) || document;
        return Array.from(root.querySelectorAll(sel));
      } catch (e) {
        return [];
      }
    };


    
function openMobileMenu() {
  const backdrop = $("#ld_mmenu_backdrop");
  const menu = $("#ld_mmenu");
  if (!backdrop || !menu) return;
  backdrop.style.display = "block";
  menu.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  const backdrop = $("#ld_mmenu_backdrop");
  const menu = $("#ld_mmenu");
  if (!backdrop || !menu) return;
  backdrop.style.display = "none";
  menu.style.display = "none";
  document.body.style.overflow = "";
}
    
    const now = () => Date.now();
    const uid = () =>
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(16).slice(2) + Date.now().toString(16);

    function fmtDate(ts) {
      try {
        const d = new Date(ts);
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch (e) {
        return "";
      }
    }

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function ymd(d = new Date()) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    function safeGet(k, fallback = null) {
      try {
        const raw = localStorage.getItem(k);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    function safeSet(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    }

    function safeRemove(k) {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    }

    function getSheetEls() {
      return {
        backdrop: $("#ld_sheet_backdrop"),
        sheet: $("#ld_sheet"),
        title: $("#ld_sheet_title"),
        body: $("#ld_sheet_body")
      };
    }

    function getOnboardEls() {
      return {
        backdrop: $("#ld_ob_backdrop"),
        box: $("#ld_ob"),
        body: $("#ld_ob_body"),
        hint: $("#ld_ob_hint"),
        next: $("#ld_ob_next"),
        back: $("#ld_ob_back"),
        close: $("#ld_ob_close")
      };
    }

    function getAuthEls() {
      return {
        backdrop: $("#ld_auth_backdrop"),
        box: $("#ld_auth"),
        panel: $("#ld_auth_panel"),
        error: $("#ld_auth_error"),
        loading: $("#ld_auth_loading"),
        close: $("#ld_auth_close")
      };
    }

    function setStatus(kind, text) {
      const dot = $("#ld_status_dot");
      const t = $("#ld_status_text");
      if (!dot || !t) return;
      dot.classList.remove("ok", "warn", "bad");
      dot.classList.add(kind);
      t.textContent = text;
    }

    const DEFAULT_STATE = {
      v: 5,
      auth: {
        chosen: false,
        mode: null,
        token: "",
        user: null,
        status: "anonymous"
      },
      onboard: { done: false, step: 0, focus: "Focused" },
      profile: { id: null, name: "Member", email: "" },
      premium: { unlocked: false, plan: "free", until: null },
      xp: 0,
      streak: 0,
       xpLocks: {
        checkin: 0,
        trigger: 0,
        rescue: 0,
        journal: 0
      },
          lastCheckInDay: null,
      lastCheckInDayPrevious: null,
      lastMood: null,
      lastTrend: null,
      lastTrigger: null,
      triggers: [],
      urges: { count: 0, last: null, completedRescues: 0 },
      journal: [],
      coach: { lastUpdated: null, preview: "No plan yet.", saved: [] },
      screenshot: {
        lastUpdated: null,
        tone: "Brutal Truth",
        preview: "No decode yet.",
        unlockedText: "",
        lastImageName: "",
        lastImageData: "",
        lastContext: "",
        saved: []
      },
      checkinAi: { lastText: "", lastUpdated: null },
     freePreview: { used: 0, windowStart: 0 },
     screenshotPreview: { used: 0, windowStart: 0 },

      minigame: {
        best: 0,
        last: 0,
        plays: 0,
        rewardsClaimed: {
          score10: false,
          score20: false
        }
      }
    };

    let STATE = clone(DEFAULT_STATE);
    let HAS_SERVER = false;
    let rescueTimer = null;
    let rescueEndsAt = null;
    let AUTH_TAB = "signup";
    let CHECKIN_SAVING = false;
    
    function mergeState(s) {
      const m = {
        ...DEFAULT_STATE,
        ...(s || {}),
        v: 5,
        auth: { ...DEFAULT_STATE.auth, ...((s && s.auth) || {}) },
        onboard: { ...DEFAULT_STATE.onboard, ...((s && s.onboard) || {}) },
        profile: { ...DEFAULT_STATE.profile, ...((s && s.profile) || {}) },
        premium: { ...DEFAULT_STATE.premium, ...((s && s.premium) || {}) },
        urges: { ...DEFAULT_STATE.urges, ...((s && s.urges) || {}) },
        coach: { ...DEFAULT_STATE.coach, ...((s && s.coach) || {}) },
        screenshot: { ...DEFAULT_STATE.screenshot, ...((s && s.screenshot) || {}) },
        checkinAi: { ...DEFAULT_STATE.checkinAi, ...((s && s.checkinAi) || {}) },
                freePreview: { ...DEFAULT_STATE.freePreview, ...((s && s.freePreview) || {}) },
                screenshotPreview: { ...DEFAULT_STATE.screenshotPreview, ...((s && s.screenshotPreview) || {}) },
        minigame: {
          ...DEFAULT_STATE.minigame,
          ...((s && s.minigame) || {}),
          rewardsClaimed: {
            ...DEFAULT_STATE.minigame.rewardsClaimed,
            ...(((s && s.minigame) && s.minigame.rewardsClaimed) || {})
          }
        },
        xpLocks: { ...DEFAULT_STATE.xpLocks, ...((s && s.xpLocks) || {}) }
      };

      m.profile.name = (m.profile.name || "Member").trim() || "Member";
      if (!Array.isArray(m.triggers)) m.triggers = [];
      if (!Array.isArray(m.journal)) m.journal = [];
      if (!Array.isArray(m.coach.saved)) m.coach.saved = [];
      return m;
    }

  async function boot() {
  try {
    setStatus("warn", "LOADING...");
    
    syncNameUI();
    syncFocusUI();
    initParticles();
    bindDelegatedClicks();
updateCheckinHint();
setInterval(updateCheckinHint, 60000);
    
    setStatus("warn", "AUTH LOADING...");

    const supabase = await withTimeout(getSupabaseClient(), 8000, "getSupabaseClient");

    supabase.auth.onAuthStateChange((event, session) => {
  console.log("[LD] auth event:", event);

  if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
    STATE.auth.token = session.access_token || "";
    applyUserToState(session.user);

    setTimeout(async () => {
      try {
        await completeAccountEntry();
        setStatus("ok", "READY");
      } catch (err) {
        console.warn("[LD] auth event handler failed:", err?.message || err);
        setStatus("bad", "AUTH EVENT ERROR");
      }
    }, 0);

    return;
  }

if (event === "SIGNED_OUT") {
  STATE = mergeState(DEFAULT_STATE);
  persistAuthCache();
  clearGuestState();
  renderStats();
  syncNameUI();
  syncFocusUI();
  setStatus("warn", "SIGNED OUT");
}
});

   try {
  await withTimeout(bootstrapAuth(), 5000, "bootstrapAuth");
} catch (err) {
  console.warn("[LD] bootstrapAuth failed:", err?.message || err);
}

if (STATE.auth.mode === "account" && STATE.profile.id) {
  try {
    await withTimeout(loadState(), 5000, "loadState");
  } catch (err) {
    console.warn("[LD] loadState failed:", err?.message || err);
  }

  try {
    await withTimeout(handlePaid(), 3000, "handlePaid");
  } catch (err) {
    console.warn("[LD] handlePaid failed:", err?.message || err);
  }
}

    
syncNameUI();
syncFocusUI();
renderStats();

if (STATE.auth.mode === "account" && STATE.profile.id) {
  setStatus("ok", "READY");
  if (!STATE.onboard.done) openOnboarding(false);
} else if (STATE.auth.mode === "guest") {
  setStatus("ok", "READY");
  if (!STATE.onboard.done) openOnboarding(false);
} else {
  setStatus("warn", "CHOOSE MODE");
  openAuthBox(true);
}

    console.log("[LD] Focused loaded:", CFG.VERSION);
  } catch (err) {
    console.error("[LD] boot error:", err);
    setStatus("bad", "BOOT ERROR");
  }
}
    
    function persistAuthCache() {
      safeSet(CFG.STORAGE_KEYS.AUTH, {
        chosen: !!STATE.auth.chosen,
        mode: STATE.auth.mode || null,
        token: STATE.auth.token || "",
        onboardDone: !!STATE.onboard.done
      });
    }

    function loadAuthCache() {
      const cached = safeGet(CFG.STORAGE_KEYS.AUTH, null);
      if (!cached) return;
      STATE.auth.chosen = !!cached.chosen;
      STATE.auth.mode = cached.mode || null;
      STATE.auth.token = cached.token || "";
      if (cached.onboardDone) STATE.onboard.done = true;
    }

    function persistGuestState() {
      if (STATE.auth.mode !== "guest") return;
      safeSet(CFG.STORAGE_KEYS.GUEST_STATE, STATE);
    }

    function loadGuestState() {
      const cached = safeGet(CFG.STORAGE_KEYS.GUEST_STATE, null);
      if (!cached) return;
      STATE = mergeState(cached);
    }

    function clearGuestState() {
      safeRemove(CFG.STORAGE_KEYS.GUEST_STATE);
    }


let __ldSupabaseClient = null;

async function getSupabaseClient() {
  if (__ldSupabaseClient) return __ldSupabaseClient;

  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase library not loaded on window.");
  }

  __ldSupabaseClient = window.supabase.createClient(
    CFG.SUPABASE_URL,
    CFG.SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  return __ldSupabaseClient;
}

async function getSessionSafe() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session || null;
}

async function getUserSafe() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user || null;
}

  function applyUserToState(user) {
  if (!user) return;
  STATE.auth.user = user;
  STATE.auth.status = "authenticated";
  STATE.auth.mode = "account";
  STATE.auth.chosen = true;
  STATE.profile.id = user.id || null;
  STATE.profile.name = (user.user_metadata?.name || user.name || user.username || STATE.profile.name || "Member").trim();
  STATE.profile.email = user.email || "";
}

async function authRegister(name, email, password) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: CFG.OAUTH_REDIRECT_TO
    }
  });

  if (error) throw new Error(error.message);

  if (data?.session?.access_token) {
    STATE.auth.token = data.session.access_token;
  } else {
    STATE.auth.token = "";
  }

  if (data?.user) {
    applyUserToState(data.user);
  }

  return {
    user: data?.user || null,
    session: data?.session || null,
    needsEmailConfirm: !data?.session
  };
}

async function authLogin(email, password) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw new Error(error.message);

  STATE.auth.token = data?.session?.access_token || "";

  if (data?.user) {
    applyUserToState(data.user);
  }

  return data;
}

async function authOAuth(provider) {
  const supabase = await getSupabaseClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: CFG.OAUTH_REDIRECT_TO
    }
  });

  if (error) throw new Error(error.message);
}

async function authMe() {
  const session = await getSessionSafe();
  const user = await getUserSafe();

  if (!user) throw new Error("No user returned.");

  STATE.auth.token = session?.access_token || "";
  applyUserToState(user);
  return user;
}

async function authLogout() {
  try {
    const supabase = await getSupabaseClient();
    await supabase.auth.signOut();
  } catch (e) {}

  STATE = mergeState(DEFAULT_STATE);
  persistAuthCache();
  clearGuestState();
}

 async function bootstrapAuth() {
  loadAuthCache();

  if (STATE.auth.mode === "guest") {
    STATE.auth.status = "guest";
    loadGuestState();
    STATE = mergeState(STATE);
    return;
  }

  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    const session = data?.session || null;

    if (!session?.user) {
      STATE.auth.status = "anonymous";
      STATE.auth.token = "";
      STATE.auth.user = null;
      return;
    }

    STATE.auth.token = session.access_token || "";
    applyUserToState(session.user);

    STATE.auth.chosen = true;
    STATE.auth.mode = "account";
    STATE.auth.status = "authenticated";
    persistAuthCache();
  } catch (err) {
    console.warn("[LD] auth bootstrap failed:", err?.message || err);
    STATE.auth = clone(DEFAULT_STATE.auth);
    STATE.profile = clone(DEFAULT_STATE.profile);
    persistAuthCache();
  }
}

boot();

async function loadState() {
  if (STATE.auth.mode === "guest") {
    loadGuestState();
    STATE = mergeState(STATE);
    HAS_SERVER = false;
    return;
  }

  if (STATE.auth.mode === "account") {
    try {
      const supabase = await getSupabaseClient();
      const userId = STATE.auth?.user?.id || STATE.profile?.id;

      if (!userId) throw new Error("No authenticated user id.");

      const { data, error } = await supabase
        .from("ld_user_state")
        .select("state, premium_unlocked, premium_plan, premium_until")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        HAS_SERVER = true;

const { error: upsertError } = await supabase.from("ld_user_state").upsert({
  user_id: userId,
  email: STATE.profile.email || null,
  state: getStateForDB(),
  premium_unlocked: !!STATE.premium?.unlocked,
  premium_plan: STATE.premium?.plan || "free",
  premium_until: STATE.premium?.until || null,
  updated_at: new Date().toISOString()
});

        if (upsertError) throw upsertError;
        return;
      }

      HAS_SERVER = true;
      const authKeep = clone(STATE.auth);
      const profileKeep = clone(STATE.profile);

      STATE = mergeState({
        ...(data.state || {}),
        auth: authKeep,
        profile: {
          ...((data.state && data.state.profile) || {}),
          ...profileKeep,
          id: userId,
          email: profileKeep.email || ""
        },
        premium: {
  ...((data.state && data.state.premium) || {}),
  unlocked: !!data.premium_unlocked,
  plan: data.premium_plan || "free",
  until: data.premium_until || null
}
      });

      return;
    } catch (err) {
      console.warn("[LD] state load failed:", err?.message || err);
      HAS_SERVER = false;
      return;
    }
  }

  HAS_SERVER = false;
}

function withTimeout(promise, ms, label = "Operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(label + " timed out")), ms)
    )
  ]);
}
    
    function getStateForDB() {
  const clean = clone(STATE);

  if (clean.auth) {
    clean.auth = {
      chosen: !!STATE.auth?.chosen,
      mode: STATE.auth?.mode || null,
      status: STATE.auth?.status || "anonymous"
    };
  }

  return clean;
}

async function saveState() {
  persistAuthCache();

  if (STATE.auth.mode === "guest") {
    persistGuestState();
    return;
  }

  if (STATE.auth.mode === "account") {
    const supabase = await getSupabaseClient();
    const userId = STATE.auth?.user?.id || STATE.profile?.id;

    if (!userId) throw new Error("No authenticated user id.");

    const payload = {
  user_id: userId,
  email: STATE.profile.email || null,
  state: getStateForDB(),
  premium_unlocked: !!STATE.premium?.unlocked,
  premium_plan: STATE.premium?.plan || "free",
  premium_until: STATE.premium?.until || null,
  updated_at: new Date().toISOString()
};

    const { error } = await supabase.from("ld_user_state").upsert(payload);
    if (error) throw error;
  }
}

    function syncNameUI() {
      let label = "Member";
      if (STATE.auth.mode === "guest") label = "Guest";
      if (STATE.profile.name) label = STATE.profile.name;

      const a = $("#ld_name_label");
      const b = $("#ld_name_big");
      if (a) a.textContent = label;
      if (b) b.textContent = label;
    }

    function syncFocusUI() {
      const sub = $("#ld_subline");
      if (!sub) return;
      const f = STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Focused";
      const map = {
  Focused:
    "Daily check-ins, calming protocols, trigger decoding, screenshot decoding, and structured 12-hour action plans. Built for self-control, clarity, and momentum.",
  Anxiety:
    "Fast calm-down flows, nervous system reset, and structured micro-actions for the next 12 hours.",
  Custom:
    "Pick your own pattern: check-ins, emergency support, decoding, and practical planning for the next 12 hours."
};
      sub.textContent = map[f] || map.Focused;
    }

    function syncAccountModeUI() {
      const badge = $("#ld_mode_badge");
      if (badge) {
        if (STATE.auth.mode === "account") {
          badge.innerHTML = `<span class="ld_dot ok"></span> Account Mode`;
        } else if (STATE.auth.mode === "guest") {
          badge.innerHTML = `<span class="ld_dot warn"></span> Guest Mode`;
        } else {
          badge.innerHTML = `<span class="ld_dot warn"></span> Choose Mode`;
        }
      }
    }

    function getLevel(xp) {
      const tiers = [
        { name: "Aware Seeker", at: 0, next: 1000 },
        { name: "Disciplined Builder", at: 1000, next: 2500 },
        { name: "Loop Breaker", at: 2500, next: 4500 },
        { name: "Self-Master", at: 4500, next: 7000 },
        { name: "Focused Architect", at: 7000, next: 10000 }
      ];
      let cur = tiers[0];
      for (const t of tiers) if (xp >= t.at) cur = t;
      return { name: cur.name, at: cur.at, nextXP: cur.next || cur.at + 3000 };
    }

    function getXpCooldownRemaining(key, cooldownMs) {
      const last = Number(STATE.xpLocks?.[key] || 0);
      if (!last) return 0;
      return Math.max(0, (last + cooldownMs) - now());
    }

    function formatRemaining(ms) {
      const totalSec = Math.ceil(ms / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    }


function getNextCheckinInfo() {
  const nowDate = new Date();
  const next = new Date(nowDate);
  next.setHours(24, 0, 0, 0);

  const diff = Math.max(0, next.getTime() - nowDate.getTime());
  const totalMin = Math.ceil(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  return {
    ms: diff,
    text: `${h}h ${m}m`
  };
}
    

function updateCheckinHint() {
  const homeCheckinHint = $("#ld_checkin_hint");
  if (!homeCheckinHint) return;

  const doneToday = STATE.lastCheckInDay === ymd();
  const nextCheckin = getNextCheckinInfo();

  homeCheckinHint.textContent = doneToday
    ? `Next check-in in ${nextCheckin.text}`
    : `Check-in available now`;
}
    
function getCheckinEntries() {
  return (STATE.journal || []).filter(x => x.type === "checkin");
}

function getJournalEntries() {
  return (STATE.journal || []).filter(x => x.type === "journal");
}

function getSavedPlans() {
  return Array.isArray(STATE.coach?.saved) ? STATE.coach.saved : [];
}

function getSavedTriggers() {
  return Array.isArray(STATE.triggers) ? STATE.triggers : [];
}
    
    async function tryGrantXP(key, amount, cooldownMs, successText) {
      if (!STATE.xpLocks) STATE.xpLocks = {};

      const remaining = getXpCooldownRemaining(key, cooldownMs);

      if (remaining > 0) {
        setStatus("warn", `XP LOCKED • ${formatRemaining(remaining)}`);
        setTimeout(() => setStatus("ok", "READY"), 1400);
        return false;
      }

      STATE.xpLocks[key] = now();
      STATE.xp = Math.max(0, (STATE.xp || 0) + amount);
      await saveState();
      renderStats();

      if (successText) {
        setStatus("ok", successText);
        setTimeout(() => setStatus("ok", "READY"), 1200);
      }

      return true;
    }
    
    async function addXP(amount) {
      STATE.xp = Math.max(0, (STATE.xp || 0) + amount);
      await saveState();
      renderStats();
    }

    function renderStats() {
      const level = getLevel(STATE.xp || 0);

      if ($("#ld_xp")) $("#ld_xp").textContent = String(STATE.xp || 0);
      if ($("#ld_xp_next")) $("#ld_xp_next").textContent = String(level.nextXP);
      if ($("#ld_level")) $("#ld_level").textContent = level.name;
      if ($("#ld_streak")) $("#ld_streak").textContent = String(STATE.streak || 0);

      const xpBar = $("#ld_xp_bar");
      if (xpBar) {
        const pct = clamp(((STATE.xp || 0) - level.at) / Math.max(1, level.nextXP - level.at), 0, 1);
        xpBar.style.width = `${Math.round(pct * 100)}%`;
      }

      const doneToday = STATE.lastCheckInDay === ymd();
      const badge = $("#ld_checkin_status_badge");
      if (badge) {
        badge.innerHTML = doneToday
          ? `<span class="ld_dot ok"></span> Done`
          : `<span class="ld_dot warn"></span> Not done`;
      }

updateCheckinHint();
      
      const coachMeta = $("#ld_coach_meta");
      if (coachMeta) {
        coachMeta.textContent = STATE.coach.lastUpdated
          ? `Updated ${fmtDate(STATE.coach.lastUpdated)}`
          : `Press “Generate Plan” to get your next 12-hour plan.`;
      }

      if ($("#ld_coach_preview")) $("#ld_coach_preview").textContent = STATE.coach.preview || "No plan yet.";
     const coachStatusBadge = $("#ld_coach_status_badge");
if (coachStatusBadge) {
  coachStatusBadge.textContent = isPremium() ? "PREMIUM" : "FREE PREVIEW";
}

const coachMetaHome = $("#ld_coach_meta_home");
if (coachMetaHome) {
  coachMetaHome.textContent = STATE.coach.lastUpdated ? fmtDate(STATE.coach.lastUpdated) : "—";
}

const coachSavedHome = $("#ld_coach_saved_home");
if (coachSavedHome) {
  coachSavedHome.textContent = String((STATE.coach.saved || []).length);
}

const coachModeHome = $("#ld_coach_mode_home");
if (coachModeHome) {
  coachModeHome.textContent = STATE.onboard?.focus || "Focused";
}
      if ($("#ld_last_trigger")) $("#ld_last_trigger").textContent = STATE.lastTrigger ? `Last trigger: ${STATE.lastTrigger}` : "Last trigger: none";

      const tCount = (STATE.triggers || []).length;
      const uCount = STATE.urges && STATE.urges.count ? STATE.urges.count : 0;
      const control = Math.max(0, Math.min(100, 50 + (STATE.streak || 0) - Math.floor(uCount / 2)));

      if ($("#ld_ins_triggers")) $("#ld_ins_triggers").textContent = tCount ? `↓ ${Math.max(0, 20 - Math.min(20, tCount))}%` : "—";
      if ($("#ld_ins_urges")) $("#ld_ins_urges").textContent = uCount ? `↓ ${Math.max(0, 30 - Math.min(30, uCount))}%` : "—";
      if ($("#ld_ins_control")) $("#ld_ins_control").textContent = `↑ ${control}%`;

      const nextMil = Math.max(30, Math.ceil(Math.max(1, STATE.streak || 0) / 30) * 30);
      if ($("#ld_milestone_days")) $("#ld_milestone_days").textContent = String(nextMil);

     const paywall = $("#ld_paywall_hint");
if (paywall) {
  paywall.textContent = isPremium()
    ? "Unlocked: Full Plan + AI Mentor."
    : "Some outputs can be locked behind upgrade (Stripe).";
}

      const badgeText = $("#ld_badge_text");
      if (badgeText) badgeText.textContent = `LD Focused • ${CFG.VERSION}`;
      syncAccountModeUI();
    }

function isPremium() {
  if (!STATE.premium?.unlocked) return false;
  if (!STATE.premium?.until) return false;
  return new Date(STATE.premium.until).getTime() > Date.now();
}

function requirePremium(featureName = "this feature") {
  if (isPremium()) return true;

  openSheet(
    "PREMIUM REQUIRED",
    `
    <div class="ld_grid2">
      <div>
        <div class="ld_panel" style="border-radius:22px;">
          <div class="hd">
            <div>
              <div class="kicker">PREMIUM</div>
              <h3 style="margin:6px 0 0;">Unlock full Focused system</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">This part is locked on the free plan.

Locked feature: ${featureName}

Upgrade to unlock:
• Full AI coach outputs
• Trigger history & deeper insights
• Journal saving
• Progress & milestones
• Premium tools and future Focused modes</div>
            <div class="ld_hr"></div>
            <button class="ld_btn primary" id="ld_paywall_upgrade_now">Upgrade Now</button>
          </div>
        </div>
      </div>

      <div>
        <div class="ld_panel" style="border-radius:22px;">
          <div class="hd">
            <div>
              <div class="kicker">FREE PLAN</div>
              <h3 style="margin:6px 0 0;">What stays free</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">Free users can still use:
• Basic dashboard
• Daily check-in
• 90-second urge rescue
• Trigger Decoder
• Limited coach preview</div>
          </div>
        </div>
      </div>
    </div>
    `
  );

  return false;
}
    
    function initParticles() {
      const c = $("#ld_particles");
      if (!c) return;
      const ctx = c.getContext("2d");
      let W = 0;
      let H = 0;
      let pts = [];

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        W = c.width = Math.floor(window.innerWidth * dpr);
        H = c.height = Math.floor(window.innerHeight * dpr);
        c.style.width = window.innerWidth + "px";
        c.style.height = window.innerHeight + "px";
        const n = Math.floor(Math.min(70, Math.max(26, window.innerWidth / 18)));
        pts = Array.from({ length: n }).map(() => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: (Math.random() * 1.8 + 0.8) * dpr,
          vx: (Math.random() - 0.5) * 0.18 * dpr,
          vy: (Math.random() - 0.5) * 0.18 * dpr,
          t: Math.random() * Math.PI * 2
        }));
      }

      resize();
      window.addEventListener("resize", resize, { passive: true });

      function draw() {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";

        for (const p of pts) {
          p.t += 0.01;
          p.x += p.vx + Math.cos(p.t) * 0.03 * dpr;
          p.y += p.vy + Math.sin(p.t) * 0.03 * dpr;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;

          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18 * dpr);
          g.addColorStop(0, "rgba(34,211,238,.12)");
          g.addColorStop(0.5, "rgba(138,91,255,.08)");
          g.addColorStop(1, "rgba(255,61,214,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 18 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);
    }

   function openSheet(title, html, options = {}) {
  const els = getSheetEls();
  if (!els.backdrop || !els.sheet || !els.title || !els.body) {
    console.error("[LD] sheet elements missing");
    return;
  }

  els.sheet.classList.remove("ld_game_sheet");

  if (options.gameLarge) {
    els.sheet.classList.add("ld_game_sheet");
  }

  els.title.textContent = title;
  els.body.innerHTML = html;
  els.backdrop.style.display = "block";
  els.sheet.style.display = "block";
  document.body.style.overflow = "hidden";
}

   function closeSheet() {
  destroyMiniGame();
  const els = getSheetEls();
  if (!els.backdrop || !els.sheet || !els.body) return;
  els.sheet.classList.remove("ld_game_sheet");
  els.backdrop.style.display = "none";
  els.sheet.style.display = "none";
  els.body.innerHTML = "";
  document.body.style.overflow = "";
}

    function openAuthBox(force = false) {
      const els = getAuthEls();
      if (!force && STATE.auth.mode === "account" && STATE.auth.token) return;
      renderAuthPanel(AUTH_TAB);
      if (!els.backdrop || !els.box) return;
      els.backdrop.style.display = "block";
      els.box.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    function closeAuthBox() {
      const els = getAuthEls();
      if (!els.backdrop || !els.box) return;

      if (!STATE.auth.chosen) return;

      els.backdrop.style.display = "none";
      els.box.style.display = "none";
      document.body.style.overflow = "";
      hideAuthError();
    }

    function showAuthError(msg) {
      const err = $("#ld_auth_error");
      if (!err) return;
      err.style.display = "block";
      err.textContent = msg;
    }

    function hideAuthError() {
      const err = $("#ld_auth_error");
      if (!err) return;
      err.style.display = "none";
      err.textContent = "";
    }

    function setAuthLoading(on, text = "Working...") {
      const el = $("#ld_auth_loading");
      if (!el) return;
      el.style.display = on ? "block" : "none";
      el.textContent = text;
    }

function renderAuthPanel(tab) {
  AUTH_TAB = tab;
  $$(".ld_auth_tab").forEach((x) => x.classList.toggle("active", x.dataset.authTab === tab));
  hideAuthError();

  const panel = $("#ld_auth_panel");
  if (!panel) return;

  if (tab === "signup") {
    panel.innerHTML = `
      <div class="ld_notice">
        <strong>Create account</strong><br>
        Sync streak, XP, journal, triggers and future premium unlocks across devices.
      </div>
      <div class="ld_hr"></div>
      <input class="ld_field" id="ld_signup_name" placeholder="Your name">
      <input class="ld_field" id="ld_signup_email" placeholder="Email">
      <input class="ld_field" id="ld_signup_password" type="password" placeholder="Password (min 6 chars)">
      <div class="ld_row" style="margin-top:12px;">
        <button class="ld_btn primary" id="ld_signup_submit">Create Account</button>
      </div>
      <div class="ld_hr"></div>
      <div class="ld_row">
    <button class="ld_btn" id="ld_google_login" style="display:flex;align-items:center;gap:8px;">
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.1-8l-6.5 5C9.7 39.5 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-4 5.5-7.9 5.5-5.2 0-9.6-3.3-11.1-8l-6.5 5C9.7 39.5 16.3 44 24 44c11.1 0 20-8.9 20-20 0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
  Continue with Google
</button>
      </div>
    `;
    return;
  }

 if (tab === "login") {
  panel.innerHTML = `
    <div class="ld_notice">
      <strong>Login</strong><br>
      Continue where you left off with synced data from your account.
    </div>
    <div class="ld_hr"></div>
    <input class="ld_field" id="ld_login_email" placeholder="Email">
    <input class="ld_field" id="ld_login_password" type="password" placeholder="Password">
    <div class="ld_row" style="margin-top:12px;">
      <button class="ld_btn primary" id="ld_login_submit">Login</button>
    </div>
    <div class="ld_hr"></div>
    <div class="ld_row">
      <button class="ld_btn" id="ld_google_login" style="display:flex;align-items:center;gap:8px;">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.1-8l-6.5 5C9.7 39.5 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-4 5.5-7.9 5.5-5.2 0-9.6-3.3-11.1-8l-6.5 5C9.7 39.5 16.3 44 24 44c11.1 0 20-8.9 20-20 0-1.3-.1-2.3-.4-3.5z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  `;
  return;
}

  panel.innerHTML = `
    <div class="ld_guest_box">
      <div class="ld_ob_title" style="font-size:20px;">Continue as guest</div>
      <p class="ld_ob_sub">You can use the app instantly, but your progress stays on this browser/device only until you create an account.</p>
      <div class="ld_warnbox">
        Guest mode = no real cross-device sync, no proper Focused history in database.
      </div>
      <div class="ld_row" style="margin-top:12px;">
        <button class="ld_btn" id="ld_guest_continue">Continue as Guest</button>
      </div>
    </div>
  `;
}

    function moduleDashboard() {
      closeSheet();
    }

    function openAccountInfo() {
  if (!STATE.auth.chosen || STATE.auth.status === "anonymous") {
    openAuthBox(true);
    return;
  }

  if (STATE.auth.mode === "guest") {
    const should = confirm("You are using Guest Mode.\n\nCreate/Login to sync progress across devices.\n\nPress OK to open account setup, Cancel to stay guest.");
    if (should) openAuthBox(true);
    return;
  }

  alert(
    `Account: ${STATE.profile.name || "Member"}`
    + `${STATE.profile.email ? "\nEmail: " + STATE.profile.email : ""}`
    + `\nPlan: ${STATE.premium.plan || "free"}`
    + `\nUnlocked: ${STATE.premium.unlocked ? "yes" : "no"}`
    + `\nUntil: ${STATE.premium.until || "none"}`
    + `\nPremium active: ${isPremium() ? "YES" : "NO"}`
  );
}

    function updateUrgeBadge(text, kind = "ok") {
      const b = $("#ld_urge_badge");
      if (!b) return;
      b.innerHTML = `<span class="ld_dot ${kind}"></span> ${text}`;
    }

    async function startRescue() {
      if (rescueTimer) return;

      STATE.urges.count = (STATE.urges.count || 0) + 1;
      STATE.urges.last = now();
      await saveState();
      renderStats();

      rescueEndsAt = now() + 90 * 1000;
      setStatus("warn", "RESCUE RUNNING");
      updateUrgeBadge("Running", "warn");

      rescueTimer = setInterval(() => {
        const left = Math.max(0, rescueEndsAt - now());
        const sec = Math.ceil(left / 1000);
        const b = $("#ld_urge_badge");
        if (b) b.innerHTML = `<span class="ld_dot warn"></span> ${sec}s`;
        if (left <= 0) stopRescue(true);
      }, 250);
    }

    async function stopRescue(completed = false) {
      if (rescueTimer) {
        clearInterval(rescueTimer);
        rescueTimer = null;
      }
      rescueEndsAt = null;
      updateUrgeBadge("Ready", "ok");
      setStatus("ok", "READY");

            if (completed) {
        STATE.urges.completedRescues = (STATE.urges.completedRescues || 0) + 1;

        const gotXP = await tryGrantXP(
          "rescue",
          CFG.XP.RESCUE,
          CFG.XP_COOLDOWNS.RESCUE,
          `RESCUE COMPLETE +${CFG.XP.RESCUE} XP`
        );

        if (!gotXP) {
          await saveState();
          renderStats();
        }
      }
    }

    function moduleCheckIn() {
  const doneToday = STATE.lastCheckInDay === ymd();
  const mood = STATE.lastMood || "—";
  const nextCheckin = getNextCheckinInfo();

  openSheet(
    "DAILY CHECK-IN",
    `
      <div class="ld_grid2">
        <div>
          <div class="ld_kv"><span>Status today</span><b>${doneToday ? "Done ✅" : "Not done"}</b></div>
          <div class="ld_kv"><span>Last mood</span><b>${mood}</b></div>
          <div class="ld_kv"><span>Next daily reset</span><b>${doneToday ? `in ${nextCheckin.text}` : "Available now"}</b></div>

          <div class="ld_hr"></div>

          <div class="ld_hint">
  Keep it simple:
  <br>• <strong>How do you feel right now?</strong>
  <br>• <strong>What is going on right now?</strong>
  <br>• <strong>Is it getting better, worse, or staying the same?</strong>
  <br>• <strong>What is the next small step you will do now?</strong>
</div>

          <div class="ld_chiprow" id="ld_sheet_moods">
            ${["OK", "STABLE", "ANXIOUS", "NUMB", "URGES"].map((m) => `<div class="ld_chip ${STATE.lastMood === m ? "active" : ""}" data-mood="${m}">${m}</div>`).join("")}
          </div>

<div class="ld_hr"></div>

<div class="ld_hint">Is it getting better or worse?</div>
<div class="ld_chiprow" id="ld_sheet_trend">
  ${["BETTER", "SAME", "WORSE", "JUST STARTED"].map((t) => `<div class="ld_chip ${STATE.lastTrend === t ? "active" : ""}" data-trend="${t}">${t}</div>`).join("")}
</div>

          <div class="ld_hr"></div>

          <input class="ld_field" id="ld_ci_nextstep" placeholder="What is the next small step you will do now? Example: drink water, shower, leave the room, go outside for 5 minutes, text one person">
          <textarea class="ld_field" id="ld_ci_situation" placeholder="What is going on right now? Example: I woke up anxious, I feel urges tonight, I am mentally overloaded, I feel numb and unmotivated"></textarea>

          <div class="ld_row" style="margin-top:10px;">
            <button class="ld_btn primary" id="ld_ci_save">Save Check-In</button>
            <button class="ld_btn ghost" id="ld_ci_cancel">Cancel</button>
          </div>
        </div>

        <div>
          <div class="ld_panel" style="border-radius:22px;">
            <div class="hd">
              <div>
                <div class="kicker">HOW TO FILL THIS</div>
                <h3 style="margin:6px 0 0;">Keep it stupid simple</h3>
              </div>
            </div>
            <div class="bd">
              <div class="ld_out">Write things that are:
• honest
• simple
• about right now
• easy to act on

GOOD examples:
• I feel anxious and restless after waking up
• I feel numb and keep isolating
• It is getting worse because I keep scrolling
• It just started after a stressful message
• Next step: drink water and leave the room
• Next step: shower and get off the bed

BAD examples:
• My whole life is bad
• I should become perfect
• Everything is wrong
• I do not know maybe something
• Fix everything today

Rule:
Name the state.
Name what is happening.
Choose one small next step.
That is enough.</div>

              <div class="ld_hr"></div>
              <div class="ld_kv"><span>XP for check-in</span><b>+${CFG.XP.CHECKIN}</b></div>
            </div>
          </div>
        </div>
      </div>
    `
  );
}

    function moduleUrge() {
  openSheet(
    "EMERGENCY BUTTON",
    `
    <div class="ld_grid2">
      <div>
        <div class="ld_kv"><span>Status</span><b id="ld_urge_sheet_timer">Ready</b></div>
        <div class="ld_hr"></div>
        <div class="ld_hint">Write the emergency exactly how it feels right now.</div>
        <textarea class="ld_field" id="ld_urge_sheet_input" placeholder="Example: I am furious, overstimulated, panicking, craving, ashamed, or mentally spiraling because..."></textarea>
        <div class="ld_hint">The AI reset should match the exact problem, not give generic breathing fluff.</div>
        <div class="ld_hr"></div>
        <div class="ld_out" id="ld_urge_sheet_out">90-second base protocol:

STEP 1 — INTERRUPT
Say: “I am safe. This is a spike, not a command.”

STEP 2 — BREATHING
Inhale 4 seconds
Hold 2 seconds
Exhale 6 seconds
Repeat for 5 rounds slowly.

STEP 3 — GROUNDING
Name:
• 3 things you can see
• 2 things you can feel
• 1 thing you can hear

STEP 4 — RESET ACTION
Do one immediate action:
• drink water
• stand up
• wash face
• walk for 2 minutes
• move away from the trigger / stressful input

STEP 5 — STABILIZE
Choose one clean next action only.</div>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" id="ld_urge_sheet_generate">Get Personalized Reset</button>
          <button class="ld_btn danger" id="ld_urge_sheet_start">Start Calm Protocol</button>
          <button class="ld_btn" id="ld_urge_sheet_stop">Stop</button>
        </div>
      </div>
      <div>
        <div class="ld_panel" style="border-radius:22px;">
          <div class="hd">
            <div>
              <div class="kicker">PREMIUM SUPPORT</div>
              <h3 style="margin:6px 0 0;">What this is for</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">Use this when you feel:
• panic building
• anxious spiraling
• mental overload
• sudden urge / compulsion
• frustration / rage / emotional chaos

Best use:
1. write what is happening
2. get your personalized AI reset
3. run the 90-second protocol
4. do one clean next move</div>
            <div class="ld_hr"></div>
            <div class="ld_kv"><span>Protocols completed</span><b>${STATE.urges.completedRescues || 0}</b></div>
            <div class="ld_kv"><span>Emergency opens</span><b>${STATE.urges.count || 0}</b></div>
          </div>
        </div>
      </div>
    </div>
  `
  );

  const update = () => {
    const timerEl = $("#ld_urge_sheet_timer");
    if (!timerEl) return;
    if (!rescueTimer || !rescueEndsAt) timerEl.textContent = "Ready";
    else timerEl.textContent = `${Math.ceil(Math.max(0, rescueEndsAt - now()) / 1000)}s`;
  };

  update();
  const localTick = setInterval(update, 300);

  const cleanup = () => clearInterval(localTick);
  $("#ld_sheet_close")?.addEventListener("click", cleanup, { once: true });
  $("#ld_sheet_backdrop")?.addEventListener("click", cleanup, { once: true });
}

    function moduleTrigger() {
      openSheet(
        "TRIGGER DECODER",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_hint">Write it raw. Short is fine.</div>
            <input class="ld_field" id="ld_trig_event" placeholder="What happened? (event)">
            <input class="ld_field" id="ld_trig_feel" placeholder="What did you feel? (emotion/body)">
            <input class="ld_field" id="ld_trig_thought" placeholder="What thought showed up?">
            <input class="ld_field" id="ld_trig_action" placeholder="What did you do / want to do?">
            <div class="ld_hr"></div>
            <div class="ld_hint">Pick a label (optional):</div>
            <div class="ld_chiprow" id="ld_trig_labels">
             ${["Stress", "Boredom", "Lonely", "Angry", "Tired", "Social", "Money", "Alcohol", "Scrolling", "Conflict"].map((x) => `<div class="ld_chip" data-l="${x}">${x}</div>`).join("")}
            </div>
            <div class="ld_hr"></div>
            <div class="ld_row">
              <button class="ld_btn primary" id="ld_trig_save">Save Trigger</button>
              <button class="ld_btn ghost" id="ld_trig_cancel">Cancel</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">OUTPUT</div>
                  <h3 style="margin:6px 0 0;">Clean counter-move</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out" id="ld_trig_out">Fill the fields → save → you’ll get a clean counter-move suggestion.</div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>Triggers logged</span><b>${(STATE.triggers || []).length}</b></div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

   async function callMake(payload) {
  if (!CFG.MAKE_WEBHOOK_URL || CFG.MAKE_WEBHOOK_URL.includes("PASTE_")) {
    throw new Error("Make webhook URL not set.");
  }

  const r = await fetch(CFG.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (r.status === 202 && CFG.MAKE_POLL_URL) {
    const data = await r.json().catch(() => ({}));
    const request_id = data.request_id || payload.request_id;

    for (let i = 0; i < 18; i++) {
      await new Promise((res) => setTimeout(res, 900));
      const pr = await fetch(CFG.MAKE_POLL_URL + "?request_id=" + encodeURIComponent(request_id));
      if (pr.ok) {
        const raw = await pr.text().catch(() => "");
        if (!raw) continue;

        try {
          const pj = JSON.parse(raw);
          if (pj && (pj.reply || pj.result || pj.text)) {
            return pj.reply || pj.result || pj.text;
          }
        } catch (_) {
          return raw.trim();
        }
      }
    }

    throw new Error("Timed out waiting for Make reply.");
  }

  const raw = await r.text().catch(() => "");
  if (!raw) throw new Error("Empty Make response.");

  try {
    const j = JSON.parse(raw);
    return j.reply || j.result || j.text || JSON.stringify(j);
  } catch (_) {
    return raw.trim();
  }
}

async function generateCheckinComment({ mood, trend, situation, nextStep }) {
  const request_id = uid();

  const payload = {
    request_id,
    mode: "LifeDecode Lab",
    type: "checkin_comment",
    user_name: STATE.profile.name || "Member",
    user_id: STATE.profile.id || null,
    focus: STATE.onboard?.focus || "Focused",
    streak: STATE.streak || 0,
    xp: STATE.xp || 0,
    level: getLevel(STATE.xp || 0).name,
    mood: mood || "unknown",
   trend: trend || "",
situation: situation || "",
next_step: nextStep || "",
    premium: isPremium(),
    prompt: `
You are LifeDecode Focused AI.

The user has just completed a daily check-in.

Write a SHORT, sharp, motivating response.
It should feel like a smart AI Focused coach reacting to the check-in.

USER:
- Name: ${STATE.profile.name || "Member"}
- Focus: ${STATE.onboard?.focus || "Focused"}
- Mood: ${mood || "unknown"}
- Trend: ${trend || "unknown"}
- Situation: ${situation || "none"}
- Next step: ${nextStep || "none"}
- Streak: ${STATE.streak || 0}
- XP: ${STATE.xp || 0}
- Level: ${getLevel(STATE.xp || 0).name}

RULES:
- Max 3 short paragraphs
- Max around 60-90 words
- Must include:
  1. short acknowledgment
  2. one smart observation about the emotional state or trend
  3. one practical reinforcement of the next small step
- Tone: supportive, strong, slightly sharp, not cringe
- No therapy disclaimer
- No long essay
- Plain English only
`
  };

  const reply = await callMake(payload);
  return String(reply || "").trim();
}

function buildEmergencyFallback(text) {
  const raw = String(text || "").trim();
  const lower = raw.toLowerCase();

  let focus = "Stabilize first. Do not solve your whole life in an activated state.";
  let moves = [
    "Put distance between yourself and the trigger for 10 minutes.",
    "Do 5 slow rounds of 4-2-6 breathing.",
    "Drink water and stand up immediately.",
    "Choose one tiny next move only."
  ];

  if (lower.includes("frustr") || lower.includes("angry") || lower.includes("rage") || lower.includes("mad")) {
    focus = "This is overload plus blocked control. Your job is to reduce heat before you react.";
    moves = [
      "Do not send the message, argue, or make the decision for 15 minutes.",
      "Stand up, unclench jaw and hands, and exhale longer than you inhale for 90 seconds.",
      "Move your body hard for 60-120 seconds: fast walk, shake arms, wall push, pacing.",
      "Write one sentence: 'What is the clean next move after the heat drops?'"
    ];
  } else if (lower.includes("panic") || lower.includes("anxious") || lower.includes("anxiety") || lower.includes("overthink")) {
    focus = "Your nervous system is treating this like danger. Bring the body down first.";
    moves = [
      "Name 3 things you can see, 2 you can feel, 1 you can hear.",
      "Do 5 rounds of 4-2-6 breathing and drop your shoulders on every exhale.",
      "Move away from screens or the trigger source for 10 minutes.",
      "Pick one safe practical action only: water, walk, wash face, or sit by a window."
    ];
  } else if (lower.includes("urge") || lower.includes("crav") || lower.includes("relapse") || lower.includes("text him") || lower.includes("text her")) {
    focus = "This spike wants fast relief. Delay, reduce access, and survive the wave first.";
    moves = [
      "Create friction now: mute, block, put phone away, leave room, or remove access.",
      "Run the 90-second protocol before any decision.",
      "Say out loud: 'This urge is temporary. I do not have to obey it.'",
      "After the wave drops, choose one clean replacement action for 10 minutes."
    ];
  }

  return `PERSONALIZED RESET:
${focus}

DO THIS NOW:
1. ${moves[0]}
2. ${moves[1]}
3. ${moves[2]}
4. ${moves[3]}

Then hit Start Calm Protocol and finish the full 90 seconds.`;
}

async function generateEmergencySupport(emergencyText) {
  const request_id = uid();
  const payload = {
    request_id,
    mode: "LifeDecode Lab",
    type: "emergency_support",
    user_name: STATE.profile.name || "Member",
    user_id: STATE.profile.id || null,
    focus: STATE.onboard?.focus || "Focused",
    streak: STATE.streak || 0,
    xp: STATE.xp || 0,
    level: getLevel(STATE.xp || 0).name,
    last_mood: STATE.lastMood || null,
    last_trigger: STATE.lastTrigger || null,
    premium: isPremium(),
    emergency_text: emergencyText || "",
    prompt: `
You are LifeDecode Emergency AI.

The user is in an activated emotional state right now and needs a personalized emergency reset.

USER CONTEXT:
- Name: ${STATE.profile.name || "Member"}
- Focus: ${STATE.onboard?.focus || "Focused"}
- Streak: ${STATE.streak || 0}
- XP: ${STATE.xp || 0}
- Level: ${getLevel(STATE.xp || 0).name}
- Last mood: ${STATE.lastMood || "unknown"}
- Last trigger: ${STATE.lastTrigger || "unknown"}
- Emergency: ${emergencyText || "unknown"}

OUTPUT RULES:
- Plain English only
- No therapy disclaimers
- No generic fluff
- Be specific to the exact emergency
- Sound sharp, stabilizing, and practical
- Max around 140-220 words

STRUCTURE EXACTLY LIKE THIS:

WHAT IS HAPPENING:
[2-3 lines max]

DO THIS IN THE NEXT 90 SECONDS:
1. ...
2. ...
3. ...

AFTER THE 90 SECONDS:
- ...
- ...
- ...

DO NOT DO RIGHT NOW:
- ...
- ...

FINAL LINE:
[one short strong closing line]
`
  };

  const reply = await callMake(payload);
  return String(reply || "").trim();
}

async function generateTriggerDecode({ event, feeling, thought, action, label }) {
  const request_id = uid();

  const payload = {
    request_id,
    mode: "LifeDecode Lab",
    type: "trigger_decode",
    user_name: STATE.profile.name || "Member",
    user_id: STATE.profile.id || null,
    focus: STATE.onboard?.focus || "Focused",
    streak: STATE.streak || 0,
    xp: STATE.xp || 0,
    level: getLevel(STATE.xp || 0).name,
    last_mood: STATE.lastMood || null,
    premium: isPremium(),
    tone: getCurrentTone(),
    trigger_label: label || "",
    trigger_event: event || "",
    trigger_feeling: feeling || "",
    trigger_thought: thought || "",
    trigger_action: action || "",
    prompt: `
You are LifeDecode Focused AI.

Your job is to decode ONLY the CURRENT trigger the user just entered.

IMPORTANT:
- Use ONLY the trigger fields from this request.
- Do NOT combine this with older problems, older triggers, old moods, or previous situations unless they are explicitly repeated in this current trigger.
- Treat every trigger entry as a separate isolated event.
- Do NOT merge issues together.
- If the current trigger is small, keep the answer specific and small.
- If the current trigger is unrelated to past entries, ignore all past entries.

CURRENT TRIGGER ONLY:
- Label: ${label || "none"}
- Event: ${event || "none"}
- Feeling: ${feeling || "none"}
- Thought: ${thought || "none"}
- Action / urge: ${action || "none"}

LIGHT CONTEXT:
- User name: ${STATE.profile.name || "Member"}
- Focus mode: ${STATE.onboard?.focus || "Focused"}
- Current streak: ${STATE.streak || 0}
- Current level: ${getLevel(STATE.xp || 0).name}

TASK:
Write a short, sharp trigger decode about THIS specific moment only.

You must explain:
1. what the real pattern is in THIS moment
2. what the mental trap is in THIS moment
3. what the best next move is in the next 5–10 minutes

RULES:
- Plain English only
- Be specific
- Be practical
- No generic therapy fluff
- No motivational essay
- No disclaimers
- Do not mention older triggers
- Do not mention unrelated possible problems
- Do not invent extra backstory

FORMAT EXACTLY LIKE THIS:

PATTERN:
[2-3 short lines]

TRAP:
[2-3 short lines]

NEXT MOVE:
[2-4 short lines]
`
  };

  const reply = await callMake(payload);
  return String(reply || "").trim();
}

function buildTriggerFallbackDecode({ event, feeling, thought, action, label }) {
  return `PATTERN:
${label || "This trigger"} is not random. It looks like your brain linked "${event || "this moment"}" with fast relief.

TRAP:
The thought "${thought || "just once"}" is the dangerous part. It makes the urge sound small and harmless, even when it is the exact doorway into losing control.

NEXT MOVE:
For the next 10 minutes, create friction immediately: put the trigger out of reach, stand up, drink water, and do one clean replacement action instead of negotiating with the loop.`;
}

function showTriggerAiComment(text) {
  openSheet(
    "AI TRIGGER DECODE",
    `
    <div class="ld_panel" style="border-radius:22px;">
      <div class="hd">
        <div>
          <div class="kicker">Focused AI</div>
          <h3 style="margin:6px 0 0;">Trigger decode</h3>
        </div>
      </div>
      <div class="bd">
        <div class="ld_out">${escapeHtml(text)}</div>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" id="ld_trigger_ai_ok">Got it</button>
        </div>
      </div>
    </div>
    `
  );
}
    
function buildCheckinFallbackComment(mood, trend, nextStep) {
  const moodMap = {
    OK: "Solid. You’re stable enough to build momentum.",
    STABLE: "Good. Stable days are where real Focused gets built.",
    ANXIOUS: "Anxiety loves chaos, so structure matters even more today.",
    NUMB: "Numb days are dangerous because they trick you into drifting.",
    URGES: "Good catch. Naming urges early gives you more control."
  };

  return `${moodMap[mood] || "Good move. Checking in instead of drifting already counts."}

${trend === "WORSE" ? "It matters that you caught it before it pulled you deeper." : ""}
${trend === "BETTER" ? "Good. Keep supporting what is already helping." : ""}
${trend === "SAME" ? "Even if it feels flat, naming it gives you more control." : ""}
${trend === "JUST STARTED" ? "Good catch. Early awareness makes the next step easier." : ""}

Now keep it simple: do "${nextStep || "one small clean action"}" next.`;
}

   
    function freePreviewAllowed() {
      const fp = STATE.freePreview || { used: 0, windowStart: 0 };
      const windowMs = 24 * 60 * 60 * 1000;

      if (!fp.windowStart || now() - fp.windowStart > windowMs) {
        fp.windowStart = now();
        fp.used = 0;
      }

      const ok = fp.used < CFG.FREE_PREVIEW_PER_24H;
      return { ok, fp };
    }

    async function commitFreePreviewUse(fp) {
      fp.used += 1;
      STATE.freePreview = fp;
      await saveState();
    }


    function getScreenshotPreviewState() {
      const fp = STATE.screenshotPreview || { used: 0, windowStart: 0 };
      const windowMs = 24 * 60 * 60 * 1000;
      if (!fp.windowStart || now() - fp.windowStart > windowMs) {
        fp.windowStart = now();
        fp.used = 0;
      }
      const ok = fp.used < 1;
      return { ok, fp };
    }

    async function commitScreenshotPreviewUse(fp) {
      fp.used += 1;
      STATE.screenshotPreview = fp;
      await saveState();
    }

    function fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read screenshot."));
        reader.readAsDataURL(file);
      });
    }

    function getScreenshotTone() {
      const active = $("#ld_sd_tone_row .ld_sd_chip.active");
      return active ? active.dataset.tone : (STATE.screenshot?.tone || "Brutal Truth");
    }

    function extractScreenshotPreview(fullText) {
      const raw = String(fullText || "").trim();
      if (!raw) return "No preview available.";
      const lines = raw.split(/\n+/).map((x) => x.trim()).filter(Boolean);
      return lines.slice(0, 7).join("\n");
    }

    function buildScreenshotFallback(context, tone) {
      const ctx = String(context || "this screenshot").trim();
      return `PREVIEW:\nThis screenshot reads like mixed energy, half-clarity and half-avoidance. The vibe is not clean enough to relax into.\n\nREADING:\nSomeone here is leaving emotional room for ambiguity instead of saying things directly. That usually means hesitation, low certainty, or controlled distance.\n\nNEXT MOVE:\nDo not over-explain, chase, or force clarity emotionally. Slow down, protect your energy, and answer in a way that keeps your value intact.\n\nTONE USED:\n${tone || "Brutal Truth"}\n\nCONTEXT:\n${ctx || "General screenshot decode."}`;
    }

    async function generateScreenshotDecode({ imageDataUrl, context, tone, previewOnly }) {
      const request_id = uid();
      const payload = {
        request_id,
        mode: "LifeDecode Lab",
        type: "screenshot_decoder",
        user_name: STATE.profile.name || "Member",
        user_id: STATE.profile.id || null,
        focus: STATE.onboard?.focus || "Focused",
        streak: STATE.streak || 0,
        xp: STATE.xp || 0,
        level: getLevel(STATE.xp || 0).name,
        premium: isPremium(),
        preview_only: !!previewOnly,
        screenshot_context: context || "",
        screenshot_tone: tone || "Brutal Truth",
        screenshot_image: imageDataUrl,
        prompt: `You are LifeDecode Screenshot Decoder AI. Analyze the uploaded screenshot, especially if it is a chat or message screenshot. Read the image itself and combine it with the extra context if provided.\n\nUSER CONTEXT:\n- Name: ${STATE.profile.name || "Member"}\n- Focus mode: ${STATE.onboard?.focus || "Focused"}\n- Tone requested: ${tone || "Brutal Truth"}\n- Extra context: ${context || "none"}\n- Preview only: ${previewOnly ? "yes" : "no"}\n\nGOAL:\nExplain what is really going on in the screenshot in sharp, luxurious, addictive LifeDecode style.\n\nIF PREVIEW ONLY = YES:\nReturn only a short teaser decode that is useful but incomplete.\nKeep it around 80-130 words.\nDo NOT give the full reply suggestion.\nEnd with one line that makes the user want the full unlock.\n\nIF PREVIEW ONLY = NO:\nReturn the full decode using EXACTLY these sections:\nVIBE:\n[2-4 lines]\n\nWHAT THIS ACTUALLY MEANS:\n[3-6 lines]\n\nRED FLAGS OR GREEN FLAGS:\n[3-6 bullet lines]\n\nBEST NEXT MOVE:\n[3-5 lines]\n\nOPTIONAL REPLY:\n[1 concise reply]\n\nRULES:\n- Plain English only\n- No therapy disclaimers\n- No generic filler\n- Be specific to the screenshot\n- Mention if the signal looks warm, cold, avoidant, manipulative, interested, confused, breadcrumbing, or low effort when relevant\n- Sound high-value, sharp, and premium\n- Never say you cannot read the screenshot unless the image is truly unreadable.`
      };
      const reply = await callMake(payload);
      return String(reply || "").trim();
    }

    function moduleScreenshotDecoder() {
      const shot = STATE.screenshot || DEFAULT_STATE.screenshot;
      const previewWindow = getScreenshotPreviewState();
      openSheet(
        "SCREENSHOT DECODER",
        `
        <div class="ld_sd_shell">
          <div class="ld_sd_hero">
            <div class="kicker">Luxury decoder</div>
            <div class="ld_sd_title">SCREENSHOT DECODER</div>
            <div class="ld_sd_sub">Upload a screenshot and get a premium-style decode of the vibe, hidden meaning, interest level, red flags, and your smartest next move. Works best for chats, mixed signals, ghosting energy, breadcrumbing, manipulation, or confusing replies.</div>
            <div class="ld_sd_tagrow">
              <div class="ld_sd_tag">Free preview</div>
              <div class="ld_sd_tag">Full unlock</div>
              <div class="ld_sd_tag">Luxury theme</div>
              <div class="ld_sd_tag">Fast decode</div>
            </div>
          </div>

          <div class="ld_sd_grid">
            <div class="ld_sd_card">
              <div class="hd">
                <div>
                  <div class="kicker">INPUT</div>
                  <h3 style="margin:6px 0 0;">Upload your screenshot</h3>
                </div>
              </div>
              <div class="bd">
                <label class="ld_sd_upload ${shot.lastImageData ? "has-image" : ""}" id="ld_sd_upload_box">
                  <input id="ld_sd_file" type="file" accept="image/png,image/jpeg,image/webp,image/jpg">
                  <div class="ld_sd_uploadInner">
                    <div class="ld_sd_uploadIcon">🖼️</div>
                    <div class="ld_sd_title" style="font-size:18px;margin:0;">Drop or choose a screenshot</div>
                    <div class="ld_sd_sub" style="max-width:34ch;">Best for message screenshots, chats, texts, DMs, Tinder convos, WhatsApp, Telegram, IG, or anything confusing.</div>
                  </div>
                  <div class="ld_sd_previewWrap">
                    <img id="ld_sd_preview" alt="Screenshot preview" src="${escapeHtml(shot.lastImageData || "")}">
                  </div>
                </label>

                <div class="ld_hr"></div>
                <div class="ld_hint">Optional context:</div>
                <textarea class="ld_field" id="ld_sd_context" placeholder="Example: This is a girl I have been talking to for 2 weeks. She suddenly got cold. Tell me what this really means and what I should do next.">${escapeHtml(shot.lastContext || "")}</textarea>

                <div class="ld_hr"></div>
                <div class="ld_hint">Decode tone:</div>
                <div class="ld_sd_chiprow" id="ld_sd_tone_row">
                  ${["Brutal Truth", "Savage", "Calm", "Flirty", "High Value"].map((t) => `<div class="ld_sd_chip ${((shot.tone || "Brutal Truth") === t) ? "active" : ""}" data-tone="${t}">${t}</div>`).join("")}
                </div>

                <div class="ld_hr"></div>
                <div class="ld_sd_row">
                  <button class="ld_btn primary" id="ld_sd_run">Run free preview</button>
                  <button class="ld_btn ghost" id="ld_sd_clear">Clear</button>
                  <button class="ld_btn" id="ld_sd_copy">Copy</button>
                </div>
                <div class="ld_hint" id="ld_sd_hint">Free preview left today: ${Math.max(0, 1 - (previewWindow.fp.used || 0))}. Full decode unlocks the deeper analysis + reply suggestion.</div>
              </div>
            </div>

            <div class="ld_sd_output">
              <div class="ld_sd_outputBody">
                <div class="ld_sd_statusRow">
                  <div class="ld_sd_status"><span class="ld_dot ${isPremium() ? "ok" : "warn"}"></span> ${isPremium() ? "PREMIUM UNLOCKED" : "FREE PREVIEW MODE"}</div>
                  <div class="ld_hint">${shot.lastUpdated ? fmtDate(shot.lastUpdated) : "No decode yet"}</div>
                </div>

                <div class="ld_sd_result" id="ld_sd_result">${escapeHtml(shot.preview || "Upload a screenshot to begin.")}</div>

                <div class="ld_sd_locked" id="ld_sd_locked_box">
                  <div class="ld_notice"><strong>Unlock the full decode</strong><br>Get the deeper intent breakdown, flags, clean next move, and optional reply suggestion.</div>
                  <div class="ld_sd_meta">
                    <div class="ld_metric">
                      <div class="t">Mode</div>
                      <div class="v">${isPremium() ? "Full access" : "Preview + unlock"}</div>
                    </div>
                    <div class="ld_metric">
                      <div class="t">Last file</div>
                      <div class="v" style="font-size:15px;">${escapeHtml(shot.lastImageName || "No image")}</div>
                    </div>
                  </div>
                  <div class="ld_sd_row">
                    <button class="ld_btn primary" id="ld_sd_unlock">Unlock full decode</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        `
      );
    }

    function moduleCoach() {
  openSheet(
    "COACH OUTPUT (12 HOURS)",
    `
    <div class="ld_grid2">
      <div>
        <div class="ld_hint">Describe what’s happening right now (short is fine).</div>
        <textarea class="ld_field" id="ld_coach_input" placeholder="Example: I feel cravings after work. Stress + boredom. I want a strong plan for the next 12 hours."></textarea>

        <div class="ld_hr"></div>

        <div class="ld_hint">Urgency:</div>
        <div class="ld_chiprow" id="ld_urgency_row">
          ${["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((u) => `<div class="ld_chip ${u === "MEDIUM" ? "active" : ""}" data-urgency="${u}">${u}</div>`).join("")}
        </div>

        <div class="ld_hr"></div>

        <div class="ld_hint">Tone:</div>
        <div class="ld_chiprow" id="ld_tone_row">
          ${["Focused", "Savage", "Calm", "Strict", "Supportive"].map((t) => `<div class="ld_chip ${t === "Focused" ? "active" : ""}" data-tone="${t}">${t}</div>`).join("")}
        </div>

        <div class="ld_hr"></div>

        <div class="ld_hint">Plan style:</div>
        <div class="ld_chiprow" id="ld_style_row">
          ${["Reset", "Discipline", "Anti-Relapse", "Calm-Down", "Rebuild"].map((s) => `<div class="ld_chip ${s === "Anti-Relapse" ? "active" : ""}" data-style="${s}">${s}</div>`).join("")}
        </div>

        <div class="ld_hr"></div>

        <div class="ld_row">
          <button class="ld_btn primary" id="ld_coach_gen">Generate Plan</button>
          <button class="ld_btn" id="ld_coach_copy">Copy</button>
          <button class="ld_btn ghost" id="ld_coach_save">Save</button>
        </div>

        <div class="ld_hint" id="ld_coach_lock_hint"></div>
      </div>

     <div>
  <div class="ld_coach_shell">
    <div class="ld_coach_head">
      <div class="ld_coach_headleft">
        <div class="ld_coach_label">AI OUTPUT</div>
        <div class="ld_coach_title">Next 12 Hours Battle Plan</div>
      </div>
      <div class="ld_coach_status">${isPremium() ? "PREMIUM" : "FREE PREVIEW"}</div>
    </div>

    <div class="ld_coach_output">
      <div class="ld_coach_glow"></div>
      <div class="ld_coach_body">
        <div class="ld_coach_text" id="ld_coach_out"></div>

        <div class="ld_coach_footer">
          <div class="ld_coach_metaItem">
            <div class="k">Last updated</div>
            <div class="v">${STATE.coach.lastUpdated ? fmtDate(STATE.coach.lastUpdated) : "—"}</div>
          </div>

          <div class="ld_coach_metaItem">
            <div class="k">Saved plans</div>
            <div class="v">${(STATE.coach.saved || []).length}</div>
          </div>

          <div class="ld_coach_metaItem">
            <div class="k">Mode</div>
            <div class="v">${STATE.onboard?.focus || "Focused"}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  `
  );

  const outEl = $("#ld_coach_out");
  const lockHint = $("#ld_coach_lock_hint");

  if (outEl) outEl.textContent = STATE.coach.preview || "No plan yet.";

  if (lockHint) {
  lockHint.textContent = isPremium()
    ? "Premium active: generated plans can be saved and later viewed in Archive."
    : `Free plan: ${CFG.FREE_PREVIEW_PER_24H} coach preview per 24h. Generated plan is not archived until you press Save.`;
}
}

    function moduleJournal() {
      const items = (STATE.journal || []).slice(0, 20);

      openSheet(
        "JOURNAL",
        `
        <div class="ld_grid2">
          <div>
            <textarea class="ld_field" id="ld_j_text" placeholder="Quick journal entry…"></textarea>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn primary" id="ld_j_save">Save Entry</button>
              <button class="ld_btn ghost" id="ld_j_clear">Clear</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">RECENT</div><h3 style="margin:6px 0 0;">Last entries</h3></div></div>
              <div class="bd">
                <div class="ld_out" id="ld_j_list">${
                  items.length
                    ? items.map((x) => `• ${fmtDate(x.ts)} — ${(x.note || x.a1 || x.text || x.type || "").slice(0, 120)}`).join("\n")
                    : "No entries yet."
                }</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleArchive() {
  const checkins = getCheckinEntries().slice(0, 12);
  const triggers = getSavedTriggers().slice(0, 12);
  const plans = getSavedPlans().slice(0, 12);
  const journalEntries = getJournalEntries().slice(0, 12);

  openSheet(
    "ARCHIVE",
    `
    <div class="ld_grid2">
      <div>
        <div class="ld_panel" style="border-radius:22px; margin-bottom:12px;">
          <div class="hd">
            <div>
              <div class="kicker">VISIBLE TO USER</div>
              <h3 style="margin:6px 0 0;">Actually viewable archive</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_kv"><span>Check-ins</span><b>${checkins.length}</b></div>
            <div class="ld_kv"><span>Triggers</span><b>${triggers.length}</b></div>
            <div class="ld_kv"><span>Saved plans</span><b>${plans.length}</b></div>
            <div class="ld_kv"><span>Journal notes</span><b>${journalEntries.length}</b></div>
          </div>
        </div>

        <div class="ld_panel" style="border-radius:22px;">
          <div class="hd">
            <div>
              <div class="kicker">STATUS GUIDE</div>
              <h3 style="margin:6px 0 0;">What “saved” means</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">Saved = written into STATE and persisted.

Saved but hidden somewhere in state = technically stored, but no visible UI existed before.

Actually viewable by user = stored AND shown here in Archive.</div>
          </div>
        </div>
      </div>

      <div>
        <div class="ld_panel" style="border-radius:22px; margin-bottom:12px;">
          <div class="hd">
            <div>
              <div class="kicker">CHECK-INS</div>
              <h3 style="margin:6px 0 0;">Daily check-in archive</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">${
              checkins.length
                ? checkins.map(x =>
  `• ${fmtDate(x.ts)} — Mood: ${x.mood || "—"}\n  Trend: ${x.trend || "—"}\n  Situation: ${x.situation || x.note || "—"}\n  Next step: ${x.nextStep || x.a1 || "—"}`
).join("\n\n")
                : "No saved check-ins yet."
            }</div>
          </div>
        </div>

        <div class="ld_panel" style="border-radius:22px; margin-bottom:12px;">
          <div class="hd">
            <div>
              <div class="kicker">TRIGGERS</div>
              <h3 style="margin:6px 0 0;">Trigger archive</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">${
              triggers.length
                ? triggers.map(x =>
                    `• ${fmtDate(x.ts)} — ${x.label || "Trigger"}\n  Event: ${x.ev || "—"}\n  Feeling: ${x.feel || "—"}\n  Thought: ${x.th || "—"}\n  Action: ${x.act || "—"}`
                  ).join("\n\n")
                : "No saved triggers yet."
            }</div>
          </div>
        </div>

        <div class="ld_panel" style="border-radius:22px; margin-bottom:12px;">
          <div class="hd">
            <div>
              <div class="kicker">PLANS</div>
              <h3 style="margin:6px 0 0;">Saved coach plans</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">${
              plans.length
                ? plans.map(x =>
                    `• ${fmtDate(x.ts)} — Tone: ${x.tone || "Focused"}\n${x.text || "—"}`
                  ).join("\n\n--------------------\n\n")
                : "No saved plans yet. Generated plans are only archived after pressing Save."
            }</div>
          </div>
        </div>

        <div class="ld_panel" style="border-radius:22px;">
          <div class="hd">
            <div>
              <div class="kicker">JOURNAL</div>
              <h3 style="margin:6px 0 0;">Journal entries</h3>
            </div>
          </div>
          <div class="bd">
            <div class="ld_out">${
              journalEntries.length
                ? journalEntries.map(x =>
                    `• ${fmtDate(x.ts)}\n${x.text || "—"}`
                  ).join("\n\n")
                : "No saved journal entries yet."
            }</div>
          </div>
        </div>
      </div>
    </div>
    `
  );
}
    
    function moduleInsights() {
      const tCount = (STATE.triggers || []).length;
      const uCount = STATE.urges && STATE.urges.count ? STATE.urges.count : 0;
      const resc = STATE.urges && STATE.urges.completedRescues ? STATE.urges.completedRescues : 0;

      openSheet(
        "INSIGHTS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">STATS</div><h3 style="margin:6px 0 0;">Account data</h3></div></div>
              <div class="bd">
                <div class="ld_kv"><span>Streak</span><b>${STATE.streak || 0} days</b></div>
                <div class="ld_kv"><span>XP</span><b>${STATE.xp || 0}</b></div>
                <div class="ld_kv"><span>Triggers logged</span><b>${tCount}</b></div>
                <div class="ld_kv"><span>Urges logged</span><b>${uCount}</b></div>
                <div class="ld_kv"><span>Rescues completed</span><b>${resc}</b></div>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">NOTES</div><h3 style="margin:6px 0 0;">Pattern clues</h3></div></div>
              <div class="bd">
                <div class="ld_out">• If urges spike after meals or after work → pre-plan 1 replacement ritual.
• If boredom is the trigger → schedule friction actions (walk, shower, tidy).
• If loneliness → send one “I’m choosing clean” message before the craving peaks.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleProgress() {
      const level = getLevel(STATE.xp || 0);
      openSheet(
        "PROGRESS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">LEVEL</div><h3 style="margin:6px 0 0;">${level.name}</h3></div></div>
              <div class="bd">
                <div class="ld_kv"><span>Current XP</span><b>${STATE.xp || 0}</b></div>
                <div class="ld_kv"><span>Next level at</span><b>${level.nextXP}</b></div>
                <div class="ld_hr"></div>
                <div class="ld_out">Reward ideas:
• Unlock “Custom Panic Mode”
• Unlock “Daily plan templates”
• Unlock “Mentor voice” (later)</div>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">MILESTONES</div><h3 style="margin:6px 0 0;">Streak</h3></div></div>
              <div class="bd">
                <div class="ld_out">Next big milestone: ${Math.max(30, Math.ceil(Math.max(1, STATE.streak || 0) / 30) * 30)} days clean.
Smaller wins: 1 day, 3 days, 7 days, 14 days.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleTools() {
      openSheet(
        "TOOLS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">UTIL</div><h3 style="margin:6px 0 0;">Quick actions</h3></div></div>
              <div class="bd">
                <button class="ld_btn" style="width:100%;" id="ld_tool_export">Export account state (JSON)</button>
                <div class="ld_hr"></div>
                <button class="ld_btn ghost" style="width:100%;" id="ld_tool_reload">Reload from backend</button>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">SAFETY</div><h3 style="margin:6px 0 0;">Emergency plan</h3></div></div>
              <div class="bd">
                <div class="ld_out">If you feel unsafe or at risk:
1) Step away from the trigger.
2) Contact a trusted person.
3) If immediate danger: call local emergency services.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleSettings() {
      const accountLabel =
        STATE.auth.mode === "account"
          ? "Connected account"
          : STATE.auth.mode === "guest"
          ? "Guest mode"
          : "Not chosen";

      openSheet(
        "SETTINGS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_hint">Account mode settings.</div>
            <div class="ld_hr"></div>

            <div class="ld_kv"><span>Mode</span><b>${accountLabel}</b></div>
            <div class="ld_kv"><span>Name</span><b>${STATE.profile.name || "Member"}</b></div>
            <div class="ld_kv"><span>Email</span><b>${STATE.profile.email || "—"}</b></div>

            <div class="ld_hr"></div>
            <div class="ld_kv"><span>Focus mode</span><b>${STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Focused"}</b></div>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn" id="ld_set_focus">Change focus</button>
            </div>

            <div class="ld_hr"></div>
            <div class="ld_kv"><span>Premium unlock</span><b>${STATE.premium.unlocked ? "YES" : "NO"}</b></div>
            <div class="ld_kv"><span>Plan</span><b>${STATE.premium.plan || "free"}</b></div>

            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn primary" id="ld_set_upgrade">Open Upgrade</button>
              <button class="ld_btn ghost" id="ld_set_auth">Account Options</button>
              ${STATE.auth.mode === "account" ? `<button class="ld_btn danger" id="ld_set_logout">Logout</button>` : ``}
            </div>
          </div>

          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">ABOUT</div><h3 style="margin:6px 0 0;">${CFG.VERSION}</h3></div></div>
              <div class="bd">
                <div class="ld_out">Guest mode = local browser save only.
Account mode = backend/database sync.
This build is now ready for login/signup + synced state.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleHelp() {
      openSheet(
        "HELP / QUICK GUIDE",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">START HERE</div><h3 style="margin:6px 0 0;">What this app does</h3></div></div>
              <div class="bd">
                <div class="ld_out">LifeDecode Lab is a fast system for:
• anxiety spikes and mental overload
• self-control and daily structure
• trigger awareness and pattern decoding
• practical plans for the next 12 hours

Rule: keep it simple.
One clean action beats overthinking.
</div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">EXAMPLES</div><h3 style="margin:6px 0 0;">Copy & paste prompts</h3></div></div>
              <div class="bd">
                <div class="ld_out">• “After work I crave alcohol. Stress + boredom. I need a plan until sleep.”
• “I’m anxious and doomscrolling. I need a calm plan for 2 hours.”
• “I feel lonely and I want to text my ex / relapse. Help me interrupt the loop.”</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
    
function showCheckinAiComment(text) {
  openSheet(
    "AI CHECK-IN COMMENT",
    `
    <div class="ld_panel" style="border-radius:22px;">
      <div class="hd">
        <div>
          <div class="kicker">Focused AI</div>
          <h3 style="margin:6px 0 0;">Quick response</h3>
        </div>
      </div>
      <div class="bd">
        <div class="ld_out">${escapeHtml(text)}</div>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" id="ld_checkin_ai_ok">Got it</button>
        </div>
      </div>
    </div>
    `
  );
}

    let LD_GAME = null;

    function destroyMiniGame() {
      if (LD_GAME && typeof LD_GAME.destroy === "function") {
        LD_GAME.destroy();
      }
      LD_GAME = null;
    }

    async function maybeGrantGameReward(score) {
      if (!STATE.minigame) return;

      let granted = 0;

      if (score >= 10 && !STATE.minigame.rewardsClaimed?.score10) {
        STATE.minigame.rewardsClaimed.score10 = true;
        granted += CFG.XP.GAME_10;
      }

      if (score >= 20 && !STATE.minigame.rewardsClaimed?.score20) {
        STATE.minigame.rewardsClaimed.score20 = true;
        granted += CFG.XP.GAME_20;
      }

      if (granted > 0) {
        STATE.xp = Math.max(0, (STATE.xp || 0) + granted);
        await saveState();
        renderStats();
        setStatus("ok", `GAME REWARD +${granted} XP`);
        setTimeout(() => setStatus("ok", "READY"), 1200);
      } else {
        await saveState();
        renderStats();
      }
    }

    function createFocusJumpGame() {
    const canvas = $("#ld_game_canvas");
  const scoreEl = $("#ld_game_score");
  const bestEl = $("#ld_game_best");
  const playsEl = $("#ld_game_plays");
  const reward10El = $("#ld_game_reward10");
  const reward20El = $("#ld_game_reward20");
  const roastEl = $("#ld_game_roast");
  const overlay = $("#ld_game_overlay");
  const overlayTitle = $("#ld_game_overlay_title");
  const overlaySub = $("#ld_game_overlay_sub");

  if (!canvas) return null;

  const ctx = canvas.getContext("2d");

  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W = 960;
  let H = 540;

  let running = false;
  let raf = null;
  let lastTs = 0;
  let spawnTimer = 0;
  let score = 0;
  let roundStartAt = 0;

  const START_X = 86;
const GROUND_H = 16;

const bird = {
  x: 120,
  y: 320,
  r: 9,
  vy: 0
};

const pipes = [];
const gravity = 260;
const flap = -150;
const speed = 54;
const pipeWidth = 42;
const pipeGap = 520;
const spawnEvery = 3.15;
 
    function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = 16 / 9;
    const cssW = rect.width || canvas.parentElement?.clientWidth || 960;
    const cssH = cssW / ratio;

    canvas.style.height = cssH + "px";
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(DPR, DPR);

    W = cssW;
    H = cssH;
  }

  function updateRewardUI() {
    if (reward10El) {
      reward10El.textContent = STATE.minigame?.rewardsClaimed?.score10
        ? "CLAIMED"
        : `+${CFG.XP.GAME_10}`;
    }
    if (reward20El) {
      reward20El.textContent = STATE.minigame?.rewardsClaimed?.score20
        ? "CLAIMED"
        : `+${CFG.XP.GAME_20}`;
    }
  }

  function updateStats() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (bestEl) bestEl.textContent = String(STATE.minigame?.best || 0);
    if (playsEl) playsEl.textContent = String(STATE.minigame?.plays || 0);
    updateRewardUI();
  }

function resetRound() {
  bird.x = 120;
bird.y = H * 0.58;
  bird.vy = 0;
  pipes.length = 0;
  spawnTimer = 0;
  score = 0;
  lastTs = 0;
  lastGapCenter = null;
  updateStats();
}

  function showOverlay(title, sub) {
    if (!overlay) return;
    overlay.style.display = "flex";
    if (overlayTitle) overlayTitle.textContent = title || "";
    if (overlaySub) overlaySub.textContent = sub || "";
  }

  function hideOverlay() {
    if (!overlay) return;
    overlay.style.display = "none";
  }

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

function playScoreSound() {
  const ctxA = getAudioCtx();
  if (!ctxA) return;

  const nowA = ctxA.currentTime;

  const o1 = ctxA.createOscillator();
  const g1 = ctxA.createGain();

  o1.type = "triangle";
  o1.frequency.setValueAtTime(740, nowA);
  o1.frequency.exponentialRampToValueAtTime(1040, nowA + 0.08);

  g1.gain.setValueAtTime(0.0001, nowA);
  g1.gain.exponentialRampToValueAtTime(0.08, nowA + 0.01);
  g1.gain.exponentialRampToValueAtTime(0.0001, nowA + 0.14);

  o1.connect(g1);
  g1.connect(ctxA.destination);

  o1.start(nowA);
  o1.stop(nowA + 0.15);
}

function playFlapSound() {
  const ctxA = getAudioCtx();
  if (!ctxA) return;

  const nowA = ctxA.currentTime;

  const o1 = ctxA.createOscillator();
  const g1 = ctxA.createGain();

  o1.type = "sine";
  o1.frequency.setValueAtTime(260, nowA);
  o1.frequency.exponentialRampToValueAtTime(180, nowA + 0.05);

  g1.gain.setValueAtTime(0.0001, nowA);
  g1.gain.exponentialRampToValueAtTime(0.03, nowA + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.0001, nowA + 0.06);

  o1.connect(g1);
  g1.connect(ctxA.destination);

  o1.start(nowA);
  o1.stop(nowA + 0.07);
}

function playCrashSound() {
  const ctxA = getAudioCtx();
  if (!ctxA) return;

  const nowA = ctxA.currentTime;

  const o1 = ctxA.createOscillator();
  const g1 = ctxA.createGain();

  o1.type = "sawtooth";
  o1.frequency.setValueAtTime(220, nowA);
  o1.frequency.exponentialRampToValueAtTime(90, nowA + 0.12);

  g1.gain.setValueAtTime(0.0001, nowA);
  g1.gain.exponentialRampToValueAtTime(0.05, nowA + 0.01);
  g1.gain.exponentialRampToValueAtTime(0.0001, nowA + 0.16);

  o1.connect(g1);
  g1.connect(ctxA.destination);

  o1.start(nowA);
  o1.stop(nowA + 0.17);
}

let lastGapCenter = null;
    
function spawnPipe() {
  const minTop = 95;
  const minBottom = 95;
  const playH = H - GROUND_H;

  const minCenter = minTop + pipeGap / 2;
  const maxCenter = playH - minBottom - pipeGap / 2;

  if (lastGapCenter == null) {
    lastGapCenter = playH * 0.5;
  }

  // postopen premik, ne divji random
  const driftStep = (Math.random() - 0.5) * 80;
  let gapCenter = lastGapCenter + driftStep;

  gapCenter = Math.max(minCenter, Math.min(maxCenter, gapCenter));
  lastGapCenter = gapCenter;

  const gapTop = gapCenter - pipeGap / 2;
  const gapBottom = gapCenter + pipeGap / 2;

  const skin = Math.floor(Math.random() * 3);

  pipes.push({
    x: W + 60,
    w: pipeWidth,
    gapTop,
    gapBottom,
    passed: false,
    skin
  });
}
  function getStage() {
  if (score < 5) return "neon-night";
  if (score < 10) return "sunset-palms";
  if (score < 20) return "purple-mountains";
  return "cyber-storm";
}
    
    function drawBackground() {
  const stage = getStage();

  let bg = ctx.createLinearGradient(0, 0, 0, H);

  if (stage === "neon-night") {
    bg.addColorStop(0, "rgba(18,24,58,1)");
    bg.addColorStop(0.55, "rgba(10,14,34,1)");
    bg.addColorStop(1, "rgba(7,9,18,1)");
  } else if (stage === "sunset-palms") {
    bg.addColorStop(0, "rgba(255,120,140,1)");
    bg.addColorStop(0.45, "rgba(122,92,255,1)");
    bg.addColorStop(1, "rgba(12,16,34,1)");
  } else if (stage === "purple-mountains") {
    bg.addColorStop(0, "rgba(100,120,255,1)");
    bg.addColorStop(0.5, "rgba(80,40,140,1)");
    bg.addColorStop(1, "rgba(10,12,24,1)");
  } else {
    bg.addColorStop(0, "rgba(30,40,80,1)");
    bg.addColorStop(0.45, "rgba(15,18,40,1)");
    bg.addColorStop(1, "rgba(5,8,18,1)");
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // grid lines
  ctx.strokeStyle = "rgba(255,255,255,.04)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const y = (H / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // decorative stage elements
  if (stage === "sunset-palms") {
    drawPalm(90, H - GROUND_H - 20, 0.9);
    drawPalm(W - 120, H - GROUND_H - 30, 1.1);
  }

  if (stage === "purple-mountains") {
    drawMountain(40, H - GROUND_H, 220, 130);
    drawMountain(220, H - GROUND_H, 300, 160);
    drawMountain(W - 280, H - GROUND_H, 260, 140);
  }

  if (stage === "cyber-storm") {
    drawLightning(W * 0.75, 60, 5);
  }

  // ambient dots
  for (let i = 0; i < 12; i++) {
    const x = (i * 190 + (Date.now() * 0.02) % 190) % (W + 190) - 95;
    const y = 70 + (i % 4) * 95;
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.beginPath();
    ctx.arc(x, y, 3 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

    function drawPalm(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.strokeStyle = "rgba(20,10,10,.5)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -30, 6, -70);
  ctx.stroke();

  ctx.strokeStyle = "rgba(80,255,180,.28)";
  ctx.lineWidth = 5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(6, -70);
    ctx.quadraticCurveTo(20 * i, -95, 38 * i, -82);
    ctx.stroke();
  }

  ctx.restore();
}

function drawMountain(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.5, y - h);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLightning(x, y, segments = 5) {
  ctx.save();
  ctx.strokeStyle = "rgba(120,220,255,.20)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x;
  let cy = y;
  for (let i = 0; i < segments; i++) {
    cx += (Math.random() - 0.5) * 20;
    cy += 20 + Math.random() * 18;
    ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.restore();
}

  function drawOrbGlow(x, y, r) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.1);
    g.addColorStop(0, "rgba(56,215,255,.34)");
    g.addColorStop(0.45, "rgba(122,92,255,.20)");
    g.addColorStop(1, "rgba(255,79,216,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);

    drawOrbGlow(0, 0, bird.r);

    const orb = ctx.createRadialGradient(-3, -4, 1, 0, 0, bird.r);
    orb.addColorStop(0, "rgba(255,255,255,.98)");
    orb.addColorStop(0.25, "rgba(56,215,255,.98)");
    orb.addColorStop(0.65, "rgba(122,92,255,.96)");
    orb.addColorStop(1, "rgba(255,79,216,.96)");

    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.30)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, bird.r + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

 function drawPipes() {
  pipes.forEach((p) => {
    let grad = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);

    if (p.skin === 0) {
      grad.addColorStop(0, "rgba(56,215,255,.98)");
      grad.addColorStop(0.5, "rgba(122,92,255,.96)");
      grad.addColorStop(1, "rgba(255,79,216,.96)");
    } else if (p.skin === 1) {
      grad.addColorStop(0, "rgba(120,255,220,.96)");
      grad.addColorStop(0.5, "rgba(56,215,255,.94)");
      grad.addColorStop(1, "rgba(122,92,255,.95)");
    } else {
      grad.addColorStop(0, "rgba(255,170,120,.95)");
      grad.addColorStop(0.45, "rgba(255,79,216,.92)");
      grad.addColorStop(1, "rgba(122,92,255,.95)");
    }

    ctx.fillStyle = grad;

    ctx.fillRect(p.x, 0, p.w, p.gapTop);
    ctx.fillRect(p.x, p.gapBottom, p.w, H - GROUND_H - p.gapBottom);

    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(p.x - 5, p.gapTop - 14, p.w + 10, 14);
    ctx.fillRect(p.x - 5, p.gapBottom, p.w + 10, 14);

    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x, 0, p.w, p.gapTop);
    ctx.strokeRect(p.x, p.gapBottom, p.w, H - GROUND_H - p.gapBottom);
  });
}
  function drawGround() {
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fillRect(0, H - GROUND_H, W, GROUND_H);

    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let i = 0; i < W; i += 38) {
      ctx.fillRect(i, H - GROUND_H + 6, 18, 4);
    }
  }

  function drawHUD() {
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.font = "900 16px Inter, sans-serif";
    ctx.fillText("FOCUS JUMP", 18, 30);

    ctx.fillStyle = "rgba(255,255,255,.64)";
    ctx.font = "700 12px Inter, sans-serif";
    ctx.fillText("SPACE / CLICK / TAP", 18, 48);

    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.font = "900 24px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(score), W - 18, 30);
    ctx.textAlign = "left";
  }

  function collidePipe(p) {
    const bx = bird.x;
    const by = bird.y;
    const r = bird.r;

    const hitX = bx + r > p.x && bx - r < p.x + p.w;
    if (!hitX) return false;

    const hitTop = by - r < p.gapTop;
    const hitBottom = by + r > p.gapBottom;
    return hitTop || hitBottom;
  }

  async function endGame() {
    if (!running) return;
    running = false;

playCrashSound();
    
    STATE.minigame.last = score;
    STATE.minigame.plays = (STATE.minigame.plays || 0) + 1;

    let beatBest = false;
    if (score > (STATE.minigame.best || 0)) {
      STATE.minigame.best = score;
      beatBest = true;
    }

    await maybeGrantGameReward(score);
    updateStats();

    showOverlay(
      beatBest ? "New Best Score" : "Game Over",
      `Score: ${score} • Best: ${STATE.minigame.best || 0} • Press Start or tap the canvas to try again.`
    );
  }

  function step(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.032, (ts - lastTs) / 1000);
    lastTs = ts;

   if (running) {
  bird.vy += gravity * dt;
  bird.vy = Math.min(bird.vy, 180);
  bird.y += bird.vy * dt;

  spawnTimer += dt;
  if (spawnTimer >= spawnEvery) {
    spawnTimer = 0;
    spawnPipe();
  }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= speed * dt;

        if (!p.passed && p.x + p.w < bird.x) {
  p.passed = true;
  score += 1;
  playScoreSound();
  scoreFlash = 0.18;
  spawnPopup("+1", bird.x + 30, bird.y - 20);
  updateStats();
}

        if (collidePipe(p)) {
          endGame();
        }

        if (p.x + p.w < -30) {
          pipes.splice(i, 1);
        }
      }

      if (ts - roundStartAt > 1600) {
        if (bird.y - bird.r < 0 || bird.y + bird.r > H - GROUND_H) {
          endGame();
        }
      }
    }

    drawBackground();
    drawPipes();
    drawGround();
    drawBird();
    drawHUD();

    drawScoreFlash(dt);
    drawPopups(dt);
    raf = requestAnimationFrame(step);
  }

function drawScoreFlash(dt) {
  if (scoreFlash <= 0) return;
  scoreFlash -= dt;

  ctx.save();
  ctx.globalAlpha = Math.max(0, scoreFlash * 1.8);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
    
function drawPopups(dt) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y -= 24 * dt;
    p.life -= 0.9 * dt;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.font = "900 18px Inter, sans-serif";
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();

    if (p.life <= 0) popups.splice(i, 1);
  }
}

let popups = [];    
let scoreFlash = 0;
    
function spawnPopup(text, x, y) {
  popups.push({ text, x, y, life: 1 });
}
    
  function flapBird() {
    if (!running) return;
    bird.vy = flap;
     playFlapSound();
  }

    function startGame() {
    resetRound();
    lastGapCenter = null;
    running = true;
    roundStartAt = performance.now();
    bird.vy = flap * 0.34;
    if (roastEl) roastEl.textContent = "Locked in. Try not to embarrass yourself.";
    hideOverlay();
  }

    
  function handleCanvasAction() {
    if (!running) {
      startGame();
      return;
    }
    flapBird();
  }

  function onKey(e) {
    if (e.code === "Space") {
      e.preventDefault();
      handleCanvasAction();
    }
  }

 resize();
resetRound();
updateStats();

showOverlay(
  "Focus Jump",
  "Proper Flappy style: top and bottom pillars with a wide center gap. Tap rhythm, don't spam."
);

  canvas.addEventListener("pointerdown", handleCanvasAction);
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", resize);

  raf = requestAnimationFrame(step);

  return {
    start: startGame,
    flap: flapBird,
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handleCanvasAction);
    }
  };
}

  function moduleMiniGame() {
  openSheet(
    "FOCUS JUMP",
    `
    <div class="ld_game_shell ld_game_shell_compact">
      <div class="ld_game_top ld_game_top_compact">
        <div>
          <div class="kicker">PREMIUM MINI-GAME</div>
          <h3 style="margin:6px 0 0;">Focus Jump</h3>
        </div>

        <div class="ld_game_stats ld_game_stats_compact">
          <div class="ld_game_stat">
            <div class="k">Best</div>
            <div class="v" id="ld_game_best">${STATE.minigame?.best || 0}</div>
          </div>
          <div class="ld_game_stat">
            <div class="k">Reward 10</div>
            <div class="v" id="ld_game_reward10">${STATE.minigame?.rewardsClaimed?.score10 ? "CLAIMED" : `+${CFG.XP.GAME_10}`}</div>
          </div>
          <div class="ld_game_stat">
            <div class="k">Reward 20</div>
            <div class="v" id="ld_game_reward20">${STATE.minigame?.rewardsClaimed?.score20 ? "CLAIMED" : `+${CFG.XP.GAME_20}`}</div>
          </div>
        </div>
      </div>

      <div class="ld_game_wrap ld_game_wrap_compact">
        <canvas id="ld_game_canvas" width="960" height="540"></canvas>

        <div class="ld_game_overlay" id="ld_game_overlay">
          <div class="ld_game_overlaybox">
            <div class="ld_game_title" id="ld_game_overlay_title">Focus Jump</div>
            <div class="ld_game_sub" id="ld_game_overlay_sub">Press Start</div>
          </div>
        </div>
      </div>

<div class="ld_roast_line" id="ld_game_roast">
  Crash the orb and the AI will roast you here.
</div>

      <div class="ld_game_bottombar">
        <div class="ld_game_live">
          <div class="ld_game_livebox">
            <div class="k">Score</div>
            <div class="v" id="ld_game_score">0</div>
          </div>
          <div class="ld_game_livebox">
            <div class="k">Plays</div>
            <div class="v" id="ld_game_plays">${STATE.minigame?.plays || 0}</div>
          </div>
        </div>

        <div class="ld_game_controls">
          <button class="ld_btn primary" id="ld_game_start">Start</button>
          <button class="ld_btn" id="ld_game_flap">Jump / Flap</button>
        </div>
      </div>
    </div>
    `,
    { gameLarge: true }
  );

  destroyMiniGame();
  LD_GAME = createFocusJumpGame();
}
    
  const OPENERS = {
  dashboard: () => moduleDashboard(),
  checkin: () => moduleCheckIn(),
  urge: () => moduleUrge(),
  trigger: () => moduleTrigger(),
  screenshot: () => moduleScreenshotDecoder(),
  coach: () => moduleCoach(),
  minigame: () => moduleMiniGame(),
  archive: () => moduleArchive(),
  journal: () => moduleJournal(),
  insights: () => moduleInsights(),
  progress: () => moduleProgress(),
  tools: () => moduleTools(),
  settings: () => moduleSettings(),
  help: () => moduleHelp()
};

    function setActiveNav(key) {
  $$("#ld_nav button").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
  $$("#ld_mnav .ld_mbtn[data-open]").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
  $$("#ld_mmenu_nav button").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
}

  
   function openModule(key) {
  setActiveNav(key);

const premiumModules = ["journal", "insights", "progress", "tools", "minigame"];

  if (key === "dashboard") {
    closeSheet();
    return;
  }

  if (premiumModules.includes(key) && !isPremium()) {
    requirePremium(key.charAt(0).toUpperCase() + key.slice(1));
    return;
  }

  const fn = OPENERS[key];
  if (fn) fn();
}
    function openUpgrade() {
  if (!CFG.STRIPE_PAYMENT_LINK || CFG.STRIPE_PAYMENT_LINK.includes("PASTE_")) {
    alert("Stripe payment link not set yet.");
    return;
  }

  if (STATE.auth.mode !== "account" || !STATE.profile.id || !STATE.profile.email) {
    alert("First login with your account, then upgrade. Premium is attached to your account.");
    openAuthBox(true);
    return;
  }

  const paymentUrl =
    CFG.STRIPE_PAYMENT_LINK +
    (CFG.STRIPE_PAYMENT_LINK.includes("?") ? "&" : "?") +
    "prefilled_email=" + encodeURIComponent(STATE.profile.email) +
    "&client_reference_id=" + encodeURIComponent(STATE.profile.id);

  window.location.href = paymentUrl;
}

    function obShow() {
      const els = getOnboardEls();
      if (!els.backdrop || !els.box) return;
      els.backdrop.style.display = "block";
      els.box.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    function obHide() {
      const els = getOnboardEls();
      if (!els.backdrop || !els.box) return;
      els.backdrop.style.display = "none";
      els.box.style.display = "none";
      document.body.style.overflow = "";
    }

    function openOnboarding(force = false) {
      if (!force && STATE.onboard && STATE.onboard.done) return;
      if (!STATE.auth.chosen) return;

      STATE.onboard = STATE.onboard || { done: false, step: 0, focus: "Focused" };
      STATE.onboard.step = 0;
      renderOnboard();
      obShow();
    }

    function renderOnboard() {
      const els = getOnboardEls();
      if (!els.body || !els.hint || !els.next || !els.back) return;

      const step = STATE.onboard ? STATE.onboard.step : 0;
      els.back.style.display = step === 0 ? "none" : "inline-flex";
      els.next.textContent = step === 2 ? "Finish" : "Next";

      if (step === 0) {
        const name = (STATE.profile.name || "Member").trim() || "Member";
        els.body.innerHTML = `
          <div class="ld_ob_title">Let’s set this up in 20 seconds.</div>
          <p class="ld_ob_sub">This version is built for accounts and backend sync.</p>
          <div class="ld_hr"></div>
          <div class="ld_hint">Display name:</div>
          <input class="ld_field" id="ld_ob_name" value="${name.replace(/"/g, "&quot;")}" placeholder="Your name">
          <div class="ld_hr"></div>
          <div class="ld_ob_cards">
            <div class="ld_ob_card"><b>✅ Daily Check-In</b><p>Streak + XP. One clean action.</p></div>
            <div class="ld_ob_card"><b>⏱ Urge Rescue</b><p>90 seconds. Break the loop.</p></div>
            <div class="ld_ob_card"><b>✨ 12-Hour Plan</b><p>Simple steps. No overwhelm.</p></div>
          </div>
        `;
        els.hint.textContent = STATE.auth.mode === "account"
          ? "Account mode active • your progress can sync with backend/database."
          : "Guest mode active • progress stays on this device/browser.";
        return;
      }

      if (step === 1) {
        const f = STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Focused";
        els.body.innerHTML = `
          <div class="ld_ob_title">Choose your focus mode</div>
          <p class="ld_ob_sub">This changes wording so it feels natural for the user.</p>
          <div class="ld_chiprow" id="ld_ob_focus">
            ${["Focused", "Anxiety", "Custom"].map((x) => `<div class="ld_chip ${x === f ? "active" : ""}" data-f="${x}">${x}</div>`).join("")}
          </div>
          <div class="ld_hr"></div>
          <div class="ld_out" id="ld_ob_focus_desc"></div>
        `;
        const descEl = $("#ld_ob_focus_desc");
        const setDesc = (mode) => {
          const map = {
            Focused: "Focused = cravings/urges/habits. Focus on removing access + replacing the ritual.",
            Anxiety: "Anxiety = panic/overthinking. Focus on nervous system reset + tiny controllables.",
            Custom: "Custom = same modules, your own framing."
          };
          if (descEl) descEl.textContent = map[mode] || map.Focused;
        };
        setDesc(f);
        els.hint.textContent = "You can change focus anytime in Settings.";
        return;
      }

      els.body.innerHTML = `
        <div class="ld_ob_title">Done. Pick your first action.</div>
        <p class="ld_ob_sub">Rule: one clean step now. Don’t negotiate with the loop.</p>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" id="ld_ob_go_checkin">Start Check-In</button>
          <button class="ld_btn danger" id="ld_ob_go_urge">Start Rescue</button>
          <button class="ld_btn" id="ld_ob_go_coach">Generate Plan</button>
        </div>
      `;
      els.hint.textContent = STATE.auth.mode === "account"
        ? "Server-first app • account sync enabled."
        : "Guest mode • later you can still create an account.";
    }

    async function obFinish() {
      STATE.onboard.done = true;
      persistAuthCache();
      await saveState();
      syncNameUI();
      syncFocusUI();
      obHide();
      setStatus("ok", "READY");
    }

    async function useGuestMode() {
      STATE.auth.chosen = true;
      STATE.auth.mode = "guest";
      STATE.auth.status = "guest";
      STATE.auth.token = "";
      STATE.auth.user = null;
      STATE.profile.id = null;
      STATE.profile.email = "";
      if (!STATE.profile.name || STATE.profile.name === "Member") STATE.profile.name = "Guest";
      persistAuthCache();
      persistGuestState();
      closeAuthBox();
      renderStats();
      syncNameUI();
      syncFocusUI();
      openOnboarding(false);
    }

 async function completeAccountEntry() {
  STATE.auth.chosen = true;
  STATE.auth.mode = "account";
  STATE.auth.status = "authenticated";
  persistAuthCache();
  clearGuestState();

  try {
    await loadState();
  } catch (err) {
    console.warn("[LD] completeAccountEntry loadState failed:", err?.message || err);
  }

  syncNameUI();
  syncFocusUI();
  renderStats();

  const authBoxVisible = $("#ld_auth")?.style.display === "flex";
  if (authBoxVisible) closeAuthBox();

  if (!STATE.onboard.done) openOnboarding(false);
}

    function bindDelegatedClicks() {
      document.addEventListener("click", async (e) => {
       if (e.target.closest("#ld_mbtn_menu")) {
  openMobileMenu();
  return;
}

if (e.target.closest("#ld_mmenu_close, #ld_mmenu_backdrop")) {
  closeMobileMenu();
  return;
}
       const navBtn = e.target.closest("#ld_nav button[data-open], #ld_mnav .ld_mbtn[data-open], #ld_mmenu_nav button[data-open], #ld_center [data-open], #ld_right [data-open], #ld_sheet [data-open]");
if (navBtn) {
  e.preventDefault();
  openModule(navBtn.dataset.open);
  closeMobileMenu();
  return;
}

        if (e.target.closest("#ld_game_start")) {
          LD_GAME?.start?.();
          return;
        }

        if (e.target.closest("#ld_game_flap")) {
          LD_GAME?.flap?.();
          return;
        }
        
        const tabBtn = e.target.closest(".ld_auth_tab");
        if (tabBtn) {
          renderAuthPanel(tabBtn.dataset.authTab);
          return;
        }

        if (e.target.closest("#ld_auth_close")) {
          if (STATE.auth.chosen) closeAuthBox();
          return;
        }

      if (e.target.closest("#ld_google_login")) {
  try {
    hideAuthError();
    setAuthLoading(true, "Redirecting to Google...");
    await authOAuth("google");
  } catch (err) {
    showAuthError(err.message || "Google login failed.");
    setAuthLoading(false);
  }
  return;
}

if (e.target.closest("#ld_checkin_ai_ok, #ld_trigger_ai_ok")) {
  closeSheet();
  return;
}
        

        if (e.target.closest("#ld_signup_submit")) {
  const name = ($("#ld_signup_name")?.value || "").trim();
  const email = ($("#ld_signup_email")?.value || "").trim().toLowerCase();
  const password = ($("#ld_signup_password")?.value || "").trim();

  if (!name || !email || !password) {
    showAuthError("Fill all signup fields first.");
    return;
  }
  if (password.length < 6) {
    showAuthError("Password should be at least 6 characters.");
    return;
  }

  try {
    hideAuthError();
    setAuthLoading(true, "Creating account...");
    const result = await authRegister(name, email, password);

    if (result?.needsEmailConfirm) {
      showAuthError("Account created. Check your email to confirm, then login.");
      setAuthLoading(false);
      return;
    }

    await completeAccountEntry();
    setStatus("ok", "ACCOUNT CREATED");
    setTimeout(() => setStatus("ok", "READY"), 1200);
  } catch (err) {
    showAuthError(err.message || "Signup failed.");
  } finally {
    setAuthLoading(false);
  }
  return;
}

        if (e.target.closest("#ld_login_submit")) {
          const email = ($("#ld_login_email")?.value || "").trim().toLowerCase();
          const password = ($("#ld_login_password")?.value || "").trim();

          if (!email || !password) {
            showAuthError("Fill email and password first.");
            return;
          }

          try {
            hideAuthError();
            setAuthLoading(true, "Logging in...");
            await authLogin(email, password);
            await completeAccountEntry();
            setStatus("ok", "LOGGED IN");
            setTimeout(() => setStatus("ok", "READY"), 1200);
          } catch (err) {
            showAuthError(err.message || "Login failed.");
          } finally {
            setAuthLoading(false);
          }
          return;
        }

        if (e.target.closest("#ld_guest_continue")) {
          await useGuestMode();
          setStatus("warn", "GUEST MODE");
          setTimeout(() => setStatus("ok", "READY"), 1200);
          return;
        }

        if (e.target.closest("#ld_sheet_close, #ld_sheet_backdrop")) {
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_btn_upgrade")) {
          openUpgrade();
          return;
        }

        if (e.target.closest("#ld_paywall_upgrade_now")) {
  openUpgrade();
  return;
}
        
        if (e.target.closest("#ld_btn_help")) {
          openModule("help");
          return;
        }

        if (e.target.closest("#ld_btn_name")) {
  if (typeof openAccountInfo === "function") {
    openAccountInfo();
  } else {
    console.error("[LD] openAccountInfo missing");
  }
  return;
}

        if (e.target.closest("#ld_btn_genplan")) {
          openModule("coach");
          return;
        }

        if (e.target.closest("#ld_btn_copyplan")) {
          try {
            await navigator.clipboard.writeText($("#ld_coach_preview")?.textContent || "");
            setStatus("ok", "COPIED");
            setTimeout(() => setStatus("ok", "READY"), 800);
          } catch (e2) {
            alert("Copy not allowed.");
          }
          return;
        }

        if (e.target.closest("#ld_btn_saveplan")) {
         if (!requirePremium("Saved Coach Plans")) return;
          const text = ($("#ld_coach_preview")?.textContent || "").trim();
          if (!text) return;
          STATE.coach.saved.unshift({ id: uid(), ts: now(), tone: "Focused", text });
          await saveState();
          renderStats();
          setStatus("ok", "SAVED");
          setTimeout(() => setStatus("ok", "READY"), 900);
          return;
        }

        if (e.target.closest("#ld_btn_startrescue")) {
          await startRescue();
          return;
        }

        if (e.target.closest("#ld_btn_stoprescue")) {
          await stopRescue(false);
          return;
        }

        if (e.target.closest("#ld_btn_quicktrigger")) {
  openModule("trigger");
  return;
}

        if (e.target.closest("#ld_badge_close")) {
          const badge = $("#ld_badge");
          if (badge) badge.style.display = "none";
          return;
        }

        if (e.target.closest("#ld_ci_cancel")) {
          closeSheet();
          return;
        }

        const moodSheetChip = e.target.closest("#ld_sheet_moods .ld_chip");
        if (moodSheetChip) {
          $$("#ld_sheet_moods .ld_chip").forEach((x) => x.classList.remove("active"));
          moodSheetChip.classList.add("active");
          STATE.lastMood = moodSheetChip.dataset.mood;
          await saveState();
          renderStats();
          return;
        }

         const trendSheetChip = e.target.closest("#ld_sheet_trend .ld_chip");
if (trendSheetChip) {
  $$("#ld_sheet_trend .ld_chip").forEach((x) => x.classList.remove("active"));
  trendSheetChip.classList.add("active");
  STATE.lastTrend = trendSheetChip.dataset.trend;
  await saveState();
  renderStats();
  return;
}
        
               if (e.target.closest("#ld_ci_save")) {
  if (CHECKIN_SAVING) return;
  CHECKIN_SAVING = true;

  const saveBtn = $("#ld_ci_save");
  if (saveBtn) saveBtn.disabled = true;

  try {
    const day = ymd();
    const already = STATE.lastCheckInDay === day;

  const nextStep = ($("#ld_ci_nextstep")?.value || "").trim();
const situation = ($("#ld_ci_situation")?.value || "").trim();
const trend = STATE.lastTrend || null;
if (!situation && !nextStep) {
  alert("Write what is going on right now or your next small step.");
  return;
}

    const prevDay = STATE.lastCheckInDayPrevious || null;
    STATE.lastCheckInDay = day;

    if (!already) {
      const today = new Date();
      const yest = new Date(today);
      yest.setDate(today.getDate() - 1);
      const yestStr = ymd(yest);

      if (prevDay === yestStr) STATE.streak = (STATE.streak || 0) + 1;
      else STATE.streak = 1;

      STATE.lastCheckInDayPrevious = day;
    }

    STATE.journal.unshift({
  id: uid(),
  ts: now(),
  type: "checkin",
  mood: STATE.lastMood || null,
  trend: STATE.lastTrend || null,
  situation,
  nextStep
});

    let gotXP = false;

    if (!already) {
      gotXP = await tryGrantXP(
        "checkin",
        CFG.XP.CHECKIN,
        CFG.XP_COOLDOWNS.CHECKIN,
        `CHECK-IN SAVED +${CFG.XP.CHECKIN} XP`
      );
    } else {
  await saveState();
  renderStats();
  closeSheet();

  const nextCheckin = getNextCheckinInfo();
  showCheckinAiComment(
    `Today's daily check-in is already completed.

Your update was still saved to your archive.

Next full daily check-in unlocks in ${nextCheckin.text}.`
  );

  setStatus("ok", "CHECK-IN UPDATED");
  setTimeout(() => setStatus("ok", "READY"), 1100);
  return;
}

    if (!already && !gotXP) {
      await saveState();
      renderStats();
    }

    closeSheet();


    try {
      setStatus("warn", "AI COMMENT...");

     const aiText = await generateCheckinComment({
  mood: STATE.lastMood || null,
  trend: STATE.lastTrend || null,
  situation,
  nextStep
});
      STATE.checkinAi.lastText = aiText;
      STATE.checkinAi.lastUpdated = now();
      await saveState();

      showCheckinAiComment(
  `${aiText}

Saved to Archive → Daily check-in archive.`
);
      setStatus("ok", "READY");
    } catch (err) {
      console.warn("[LD] checkin AI comment failed:", err?.message || err);

      const fallbackText = buildCheckinFallbackComment(
  STATE.lastMood || null,
  STATE.lastTrend || null,
  nextStep
);

      STATE.checkinAi.lastText = fallbackText;
      STATE.checkinAi.lastUpdated = now();
      await saveState();

      showCheckinAiComment(
  `${fallbackText}

Saved to Archive → Daily check-in archive.`
);
      setStatus("ok", "READY");
    }

    return;
  } finally {
    CHECKIN_SAVING = false;
    if (saveBtn) saveBtn.disabled = false;
  }
}
        if (e.target.closest("#ld_urge_sheet_start")) {
          await startRescue();
          return;
        }

        if (e.target.closest("#ld_urge_sheet_stop")) {
          await stopRescue(false);
          return;
        }

        const trigLabel = e.target.closest("#ld_trig_labels .ld_chip");
        if (trigLabel) {
          $$("#ld_trig_labels .ld_chip").forEach((x) => x.classList.remove("active"));
          trigLabel.classList.add("active");
          return;
        }

        if (e.target.closest("#ld_trig_cancel")) {
          closeSheet();
          return;
        }

                if (e.target.closest("#ld_trig_save")) {

  const active = $("#ld_trig_labels .ld_chip.active");
  const picked = active ? active.dataset.l : null;

  const ev = ($("#ld_trig_event")?.value || "").trim();
  const feel = ($("#ld_trig_feel")?.value || "").trim();
  const th = ($("#ld_trig_thought")?.value || "").trim();
  const act = ($("#ld_trig_action")?.value || "").trim();

  if (!ev && !feel && !th && !act) {
    alert("Write at least something first.");
    return;
  }

  const summary = picked ? `${picked}: ${ev || "trigger"}` : ev || "trigger";
  STATE.lastTrigger = summary;
  STATE.triggers.unshift({ id: uid(), ts: now(), label: picked, ev, feel, th, act });

  const gotXP = await tryGrantXP(
    "trigger",
    CFG.XP.TRIGGER,
    CFG.XP_COOLDOWNS.TRIGGER,
    `TRIGGER SAVED +${CFG.XP.TRIGGER} XP`
  );

  if (!gotXP) {
    await saveState();
    renderStats();
  }

  closeSheet();

  try {
    setStatus("warn", "AI DECODING...");

    const aiText = await generateTriggerDecode({
      event: ev,
      feeling: feel,
      thought: th,
      action: act,
      label: picked
    });

    await saveState();
    renderStats();

    showTriggerAiComment(
      `${aiText}

Saved to Archive → Trigger archive.`
    );

    setStatus("ok", "READY");
  } catch (err) {
    console.warn("[LD] trigger AI decode failed:", err?.message || err);

    const fallbackText = buildTriggerFallbackDecode({
      event: ev,
      feeling: feel,
      thought: th,
      action: act,
      label: picked
    });

    showTriggerAiComment(
      `${fallbackText}

Saved to Archive → Trigger archive.`
    );

    setStatus("ok", "READY");
  }

  return;
}

        if (e.target.closest("#ld_btn_gen_emergency") || e.target.closest("#ld_urge_sheet_generate")) {
  const fromSheet = !!e.target.closest("#ld_urge_sheet_generate");
  const inputEl = fromSheet ? $("#ld_urge_sheet_input") : $("#ld_urge_input");
  const outEl = fromSheet ? $("#ld_urge_sheet_out") : $("#ld_urge_text");
  const raw = (inputEl?.value || "").trim();

  if (!raw) {
    alert("Write what the emergency is first.");
    return;
  }

  if (outEl) {
    outEl.textContent = "Analyzing your emergency...\n\nBuilding a sharper personalized reset for this exact spike...";
  }

  setStatus("warn", "EMERGENCY AI...");

  try {
    const aiText = await generateEmergencySupport(raw);
    if (outEl) outEl.textContent = aiText;
    STATE.urges.lastText = raw;
    STATE.urges.lastAi = aiText;
    await saveState();
    renderStats();
    setStatus("ok", "READY");
  } catch (err) {
    console.warn("[LD] emergency support failed:", err?.message || err);
    const fallback = buildEmergencyFallback(raw);
    if (outEl) outEl.textContent = fallback;
    STATE.urges.lastText = raw;
    STATE.urges.lastAi = fallback;
    await saveState();
    renderStats();
    setStatus("ok", "READY");
  }

  return;
}

        const toneChip = e.target.closest("#ld_tone_row .ld_chip");
        if (toneChip) {
          $$("#ld_tone_row .ld_chip").forEach((x) => x.classList.remove("active"));
          toneChip.classList.add("active");
          return;
        }

        const sdToneChip = e.target.closest("#ld_sd_tone_row .ld_sd_chip");
        if (sdToneChip) {
          $$("#ld_sd_tone_row .ld_sd_chip").forEach((x) => x.classList.remove("active"));
          sdToneChip.classList.add("active");
          STATE.screenshot.tone = sdToneChip.dataset.tone || "Brutal Truth";
          await saveState();
          return;
        }

        const urgencyChip = e.target.closest("#ld_urgency_row .ld_chip");
if (urgencyChip) {
  $$("#ld_urgency_row .ld_chip").forEach((x) => x.classList.remove("active"));
  urgencyChip.classList.add("active");
  return;
}

const styleChip = e.target.closest("#ld_style_row .ld_chip");
if (styleChip) {
  $$("#ld_style_row .ld_chip").forEach((x) => x.classList.remove("active"));
  styleChip.classList.add("active");
  return;
}
        

        if (e.target.closest("#ld_btn_sd_unlock_home")) {
          openUpgrade();
          return;
        }

        if (e.target.closest("#ld_sd_clear")) {
          STATE.screenshot.lastImageData = "";
          STATE.screenshot.lastImageName = "";
          STATE.screenshot.lastContext = "";
          await saveState();
          const img = $("#ld_sd_preview");
          const box = $("#ld_sd_upload_box");
          const ctxEl = $("#ld_sd_context");
          const resultEl = $("#ld_sd_result");
          if (img) img.src = "";
          if (box) box.classList.remove("has-image");
          if (ctxEl) ctxEl.value = "";
          if (resultEl) resultEl.textContent = "Upload a screenshot to begin.";
          return;
        }

        if (e.target.closest("#ld_sd_copy")) {
          try {
            await navigator.clipboard.writeText($("#ld_sd_result")?.textContent || "");
            setStatus("ok", "COPIED");
            setTimeout(() => setStatus("ok", "READY"), 800);
          } catch (err) {
            alert("Copy not allowed in this browser.");
          }
          return;
        }

        if (e.target.closest("#ld_sd_unlock")) {
          openUpgrade();
          return;
        }

        if (e.target.closest("#ld_sd_run")) {
          const fileInput = $("#ld_sd_file");
          const file = fileInput?.files?.[0] || null;
          const context = ($("#ld_sd_context")?.value || "").trim();
          const tone = getScreenshotTone();
          const resultEl = $("#ld_sd_result");
          const hintEl = $("#ld_sd_hint");

          if (!file && !STATE.screenshot.lastImageData) {
            alert("Upload a screenshot first.");
            return;
          }

          let imageDataUrl = STATE.screenshot.lastImageData || "";
          let imageName = STATE.screenshot.lastImageName || "screenshot";

          if (file) {
            imageDataUrl = await fileToDataUrl(file);
            imageName = file.name || "screenshot";
            STATE.screenshot.lastImageData = imageDataUrl;
            STATE.screenshot.lastImageName = imageName;
            const img = $("#ld_sd_preview");
            const box = $("#ld_sd_upload_box");
            if (img) img.src = imageDataUrl;
            if (box) box.classList.add("has-image");
          }

          STATE.screenshot.lastContext = context;
          STATE.screenshot.tone = tone;
          await saveState();

          const previewState = getScreenshotPreviewState();
          if (!isPremium() && !previewState.ok) {
            if (resultEl) {
              resultEl.textContent = `PREVIEW LOCKED\n\nYou already used today’s free screenshot preview.\nUpgrade to unlock the full decode, deeper intent reading, and optional reply suggestion.`;
            }
            if (hintEl) hintEl.textContent = "Free preview used. Upgrade unlocks full screenshot decoding.";
            return;
          }

          if (resultEl) {
            resultEl.textContent = "Reading screenshot...\n\nScanning tone, energy, mixed signals, subtext, and the cleanest next move.";
          }
          setStatus("warn", "SCREENSHOT AI...");

          try {
            const previewOnly = !isPremium();
            const fullText = await generateScreenshotDecode({ imageDataUrl, context, tone, previewOnly });
            const previewText = previewOnly ? fullText : extractScreenshotPreview(fullText);

            if (!isPremium()) {
              await commitScreenshotPreviewUse(previewState.fp);
            }

            STATE.screenshot.lastUpdated = now();
            STATE.screenshot.preview = previewText;
            STATE.screenshot.unlockedText = isPremium() ? fullText : "";
            await saveState();

            if (resultEl) resultEl.textContent = isPremium() ? fullText : previewText;
            if (hintEl) {
              const used = STATE.screenshotPreview?.used || 0;
              hintEl.textContent = isPremium()
                ? "Premium active: full screenshot decoding is unlocked."
                : `Free preview left today: ${Math.max(0, 1 - used)}. Upgrade for the full decode.`;
            }
            setStatus("ok", "READY");
          } catch (err) {
            console.warn("[LD] screenshot decode failed:", err?.message || err);
            const fallback = buildScreenshotFallback(context, tone);
            STATE.screenshot.lastUpdated = now();
            STATE.screenshot.preview = fallback;
            await saveState();
            if (resultEl) resultEl.textContent = fallback;
            setStatus("ok", "READY");
          }
          return;
        }

        if (e.target.closest("#ld_coach_copy")) {
          try {
            await navigator.clipboard.writeText($("#ld_coach_out")?.textContent || "");
            setStatus("ok", "COPIED");
            setTimeout(() => setStatus("ok", "READY"), 800);
          } catch (e2) {
            alert("Copy not allowed in this browser.");
          }
          return;
        }

        if (e.target.closest("#ld_coach_save")) {
  if (!requirePremium("Saved Coach Plans")) return;
  const activeTone = $("#ld_tone_row .ld_chip.active");
  const tone = activeTone ? activeTone.dataset.tone : "Focused";
  const text = ($("#ld_coach_out")?.textContent || "").trim();
  if (!text) return;

  STATE.coach.saved.unshift({ id: uid(), ts: now(), tone, text });
  await saveState();
  renderStats();

  setStatus("ok", "PLAN SAVED");
  setTimeout(() => setStatus("ok", "READY"), 900);

  openSheet(
    "PLAN SAVED",
    `
    <div class="ld_panel" style="border-radius:22px;">
      <div class="hd">
        <div>
          <div class="kicker">ARCHIVED</div>
          <h3 style="margin:6px 0 0;">Plan saved successfully</h3>
        </div>
      </div>
      <div class="bd">
        <div class="ld_out">This coach plan is now:
• saved to state
• persisted to your account/browser
• visible inside Archive → Saved coach plans</div>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" data-open="archive">Open Archive</button>
        </div>
      </div>
    </div>
    `
  );

  return;
}

        if (e.target.closest("#ld_coach_gen")) {
  const input = ($("#ld_coach_input")?.value || "").trim();
  const activeTone = $("#ld_tone_row .ld_chip.active");
  const activeUrgency = $("#ld_urgency_row .ld_chip.active");
  const activeStyle = $("#ld_style_row .ld_chip.active");

  const tone = activeTone ? activeTone.dataset.tone : "Focused";
  const urgency = activeUrgency ? activeUrgency.dataset.urgency : "MEDIUM";
  const planStyle = activeStyle ? activeStyle.dataset.style : "Anti-Relapse";
  const outEl = $("#ld_coach_out");

  if (!input) {
    alert("Write 1–2 lines about what’s happening first.");
    return;
  }

  const previewState = freePreviewAllowed();

  if (!isPremium() && !previewState.ok) {
    if (outEl) {
      outEl.textContent = `LOCKED: Full Plan + AI Mentor

• You already used today’s free preview.
• Upgrade to unlock unlimited stronger plans.`;
    }
    return;
  }

  const request_id = uid();

  const payload = {
    request_id,
    mode: "LifeDecode Lab",
    type: "coach_plan",
    tone,
    urgency,
    plan_style: planStyle,
    user_name: STATE.profile.name || "Member",
    user_id: STATE.profile.id || null,
    focus: STATE.onboard?.focus || "Focused",
    streak: STATE.streak || 0,
    xp: STATE.xp || 0,
    level: getLevel(STATE.xp || 0).name,
    last_mood: STATE.lastMood || null,
    last_trigger: STATE.lastTrigger || null,
    triggers_count: (STATE.triggers || []).length,
    urges_count: STATE.urges?.count || 0,
    completed_rescues: STATE.urges?.completedRescues || 0,
    premium: isPremium(),
    prompt: `
You are LifeDecode Focused AI.

Write a brutally practical, high-value Focused / self-control / anti-relapse action plan for the NEXT 12 HOURS.

USER CONTEXT:
- Name: ${STATE.profile.name || "Member"}
- Focus: ${STATE.onboard?.focus || "Focused"}
- Tone requested: ${tone}
- Urgency: ${urgency}
- Plan style: ${planStyle}
- Streak: ${STATE.streak || 0}
- XP: ${STATE.xp || 0}
- Level: ${getLevel(STATE.xp || 0).name}
- Last mood: ${STATE.lastMood || "unknown"}
- Last trigger: ${STATE.lastTrigger || "unknown"}
- User message: ${input}

OUTPUT RULES:
- Be sharp, concrete, useful, and emotionally intelligent.
- No generic therapy fluff.
- Write in plain clean English.
- Structure EXACTLY like this:

RISK LEVEL:
[one short line]

WHY YOU FEEL THIS:
[2-4 short lines max]

NEXT 12 HOURS PLAN:
1. ...
2. ...
3. ...
4. ...
5. ...
6. ...

EMERGENCY MOVE IF URGE SPIKES:
- ...
- ...
- ...

DO NOT DO:
- ...
- ...
- ...

MANTRA:
"[one powerful closing line]"

EXTRA RULES:
- Every step must be actionable.
- Include at least:
  • 1 remove-access step
  • 1 body-regulation step
  • 1 replacement activity
  • 1 social/accountability step
  • 1 environment-control step
- If urgency is HIGH or CRITICAL, sound firmer and more commanding.
- If tone is Savage, be brutally honest but still useful.
- If tone is Calm, be grounding and steady.
- If tone is Strict, sound disciplined and corrective.
- If tone is Supportive, sound warm but strong.
`
  };

  setStatus("warn", "GENERATING...");
  if (outEl) {
  outEl.textContent = `Analyzing your state...

Building a sharper 12-hour plan...
Checking mood, trigger pressure, urgency, and Focused direction...`;
}

  try {
    const reply = await callMake(payload);
    const text = String(reply || "").trim() || "No reply.";

    if (!isPremium()) {
      await commitFreePreviewUse(previewState.fp);
    }

    STATE.coach.preview = text;
    STATE.coach.lastUpdated = now();
    await saveState();
    renderStats();

    if (outEl) outEl.textContent = text;

    setStatus("ok", "READY");
  } catch (err) {
    const fallback = `RISK LEVEL:
${urgency}

WHY YOU FEEL THIS:
Your nervous system is looking for fast relief, not real healing.
This is a vulnerable window, not a command you must obey.
You need structure now, not negotiation.

NEXT 12 HOURS PLAN:
1. Remove the trigger from reach for the next 30–60 minutes.
2. Drink water and do 10 slow breaths before touching your phone again.
3. Eat something simple with protein within the next hour.
4. Do one clean replacement task for 10 minutes: walk, shower, tidy, stretch.
5. Send one message to someone or write one honest sentence in your journal: "I am in a risky moment and choosing not to fold."
6. Set a 30-minute reset timer and repeat the next right action instead of thinking too much.

EMERGENCY MOVE IF URGE SPIKES:
- Stand up immediately and change rooms.
- Put distance between you and the trigger.
- Repeat: "This is a wave. I do not need to obey it."

DO NOT DO:
- Do not isolate with the trigger.
- Do not tell yourself "just once."

MANTRA:
"I do not need perfect control. I need one clean move right now."

(Make webhook missing/failed: ${err.message})`;

    if (outEl) outEl.textContent = fallback;
    setStatus("bad", "MAKE ERROR");
    setTimeout(() => setStatus("ok", "READY"), 1500);
  }

  return;
}

        if (e.target.closest("#ld_j_clear")) {
          const inp = $("#ld_j_text");
          if (inp) inp.value = "";
          return;
        }

        if (e.target.closest("#ld_j_save")) {
  if (!requirePremium("Journal")) return;
  const text = ($("#ld_j_text")?.value || "").trim();
  if (!text) return;

  STATE.journal.unshift({ id: uid(), ts: now(), type: "journal", text });

  const gotXP = await tryGrantXP(
    "journal",
    CFG.XP.JOURNAL,
    CFG.XP_COOLDOWNS.JOURNAL,
    `JOURNAL SAVED +${CFG.XP.JOURNAL} XP`
  );

  if (!gotXP) {
    await saveState();
    renderStats();
  }

  openSheet(
    "JOURNAL SAVED",
    `
    <div class="ld_panel" style="border-radius:22px;">
      <div class="hd">
        <div>
          <div class="kicker">ARCHIVED</div>
          <h3 style="margin:6px 0 0;">Journal entry saved successfully</h3>
        </div>
      </div>
      <div class="bd">
        <div class="ld_out">This journal entry is now:
• saved to state
• persisted to your account/browser
• visible inside Archive → Journal entries</div>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" data-open="archive">Open Archive</button>
        </div>
      </div>
    </div>
    `
  );

  return;
}

        if (e.target.closest("#ld_tool_export")) {
         if (!requirePremium("Data Export")) return;
          const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "ld_Focused_state.json";
          a.click();
          URL.revokeObjectURL(a.href);
          return;
        }

        if (e.target.closest("#ld_tool_reload")) {
          setStatus("warn", "RELOADING…");
          await loadState();
          syncNameUI();
          syncFocusUI();
          renderStats();
          setStatus("ok", "READY");
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_set_focus")) {
          openOnboarding(true);
          return;
        }

        if (e.target.closest("#ld_set_upgrade")) {
          openUpgrade();
          return;
        }

        if (e.target.closest("#ld_set_auth")) {
          openAuthBox(true);
          return;
        }

        if (e.target.closest("#ld_set_logout")) {
          const sure = confirm("Logout from your account?");
          if (!sure) return;
          await authLogout();
          renderStats();
          syncNameUI();
          syncFocusUI();
          closeSheet();
          openAuthBox(true);
          setStatus("warn", "LOGGED OUT");
          setTimeout(() => setStatus("ok", "READY"), 1200);
          return;
        }

        const moodMain = e.target.closest("#ld_mood_row .ld_chip");
        if (moodMain) {
          $$("#ld_mood_row .ld_chip").forEach((x) => x.classList.remove("active"));
          moodMain.classList.add("active");
          STATE.lastMood = moodMain.dataset.mood;
          await saveState();
          renderStats();
          return;
        }

        const obFocusChip = e.target.closest("#ld_ob_focus .ld_chip");
        if (obFocusChip) {
          $$("#ld_ob_focus .ld_chip").forEach((x) => x.classList.remove("active"));
          obFocusChip.classList.add("active");
          STATE.onboard.focus = obFocusChip.dataset.f;
          const descEl = $("#ld_ob_focus_desc");
          if (descEl) {
            const map = {
              Focused: "Focused = cravings/urges/habits. Focus on removing access + replacing the ritual.",
              Anxiety: "Anxiety = panic/overthinking. Focus on nervous system reset + tiny controllables.",
              Custom: "Custom = same modules, your own framing."
            };
            descEl.textContent = map[STATE.onboard.focus] || map.Focused;
          }
          return;
        }

        if (e.target.closest("#ld_ob_go_checkin")) {
          await obFinish();
          openModule("checkin");
          return;
        }

        if (e.target.closest("#ld_ob_go_urge")) {
          await obFinish();
          openModule("urge");
          return;
        }

        if (e.target.closest("#ld_ob_go_coach")) {
          await obFinish();
          openModule("coach");
          return;
        }

        if (e.target.closest("#ld_ob_close, #ld_ob_backdrop")) {
          const el = $("#ld_ob_name");
          if (el) STATE.profile.name = (el.value || STATE.profile.name || "Member").trim() || "Member";
          STATE.onboard.done = true;
          persistAuthCache();
          await saveState();
          syncNameUI();
          syncFocusUI();
          obHide();
          return;
        }
      });

      const obEls = getOnboardEls();

      obEls.next?.addEventListener("click", async () => {
        const step = STATE.onboard ? STATE.onboard.step : 0;

        if (step === 0) {
          const el = $("#ld_ob_name");
          if (el) {
            STATE.profile.name = (el.value || "Member").trim() || "Member";
            syncNameUI();
          }
          STATE.onboard.step = 1;
          renderOnboard();
          return;
        }

        if (step === 1) {
          STATE.onboard.step = 2;
          renderOnboard();
          return;
        }

        await obFinish();
      });

      obEls.back?.addEventListener("click", () => {
        const step = STATE.onboard ? STATE.onboard.step : 0;
        STATE.onboard.step = Math.max(0, step - 1);
        renderOnboard();
      });
    }

async function handlePaid() {
  try {
    const u = new URL(window.location.href);
    const paid = u.searchParams.get("ld_paid");
    const plan = u.searchParams.get("ld_plan");
    const paidUid = u.searchParams.get("uid");

    if (paid !== "1") return;

    if (STATE.auth.mode !== "account" || !STATE.profile.id) {
      setStatus("warn", "LOGIN TO CLAIM PREMIUM");
      return;
    }

    if (paidUid && paidUid !== STATE.profile.id) {
      console.warn("[LD] paid uid mismatch");
      setStatus("bad", "PREMIUM CLAIM ERROR");
      return;
    }

    STATE.premium.unlocked = true;
    STATE.premium.plan = plan || "premium";

    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    STATE.premium.until = until.toISOString();

    await saveState();
    await loadState();
    renderStats();

    setStatus("ok", "PAYMENT RECEIVED");
    setTimeout(() => setStatus("ok", "READY"), 1200);

    u.searchParams.delete("ld_paid");
    u.searchParams.delete("ld_plan");
    u.searchParams.delete("uid");
    window.history.replaceState({}, "", u.toString());
  } catch (e) {
    console.warn("[LD] handlePaid failed:", e?.message || e);
  }
}

}
console.log("[LD] bootstrap now outside initLifeDecode");
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startWhenReady);
} else {
  startWhenReady();
}
})();

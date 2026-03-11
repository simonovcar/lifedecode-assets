console.log("[LD] ACCOUNT READY FILE PARSED");
window.__LD_FILE_PARSED__ = true;

(function () {
  if (window.__LD_RECOVERY_SINGLE_FILE__) return;
  window.__LD_RECOVERY_SINGLE_FILE__ = true;

const CFG = {
  VERSION: "LifeDecode AI v1",
  SUPABASE_URL: "https://nnqiahypfkdoqkclknoe.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucWlhaHlwZmtkb3FrY2xrbm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjU3NTQsImV4cCI6MjA4ODgwMTc1NH0.j6oTDeSKvpx1OhY3yeCY_-Jo5ixmC22jW9VEuTnJ7hc",
  MAKE_WEBHOOK_URL: "https://hook.eu1.make.com/1w2h7pe88oqrf42uu0h41e3tazd02v2x",
  MAKE_POLL_URL: "",
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/cNibJ3fc52aMcN4fIPbQY00",
  FREE_PREVIEW_PER_24H: 1,
  XP: { CHECKIN: 120, TRIGGER: 60, RESCUE: 40, JOURNAL: 30 },
  STORAGE_KEYS: {
    AUTH: "ld_auth_cache_v1",
    GUEST_STATE: "ld_guest_state_v1"
  },
  OAUTH_REDIRECT_TO: window.location.origin + window.location.pathname
};

  const CSS = `
:root{
  --bg0:#05060a;
  --bg1:#070916;
  --panel: rgba(255,255,255,.06);
  --stroke: rgba(255,255,255,.10);
  --txt:#e9ecff;
  --muted:rgba(233,236,255,.70);
  --muted2:rgba(233,236,255,.50);
  --c1:#8a5bff;
  --c2:#22d3ee;
  --c3:#ff3dd6;
  --c4:#7CFF6B;
  --danger:#ff4d6d;
  --warn:#ffb020;
  --ok:#45ffb5;
  --r1:28px;
  --shadow2: 0 10px 30px rgba(0,0,0,.40);
  --pad: clamp(14px, 2.2vw, 22px);
  --gap: clamp(12px, 1.8vw, 18px);
  --max: 1220px;
  --mobileNavH: 74px;
}
#ld_app, #ld_app *{ box-sizing:border-box; }
#ld_app{
  color:var(--txt);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  line-height:1.25;
}
#ld_bg{
  position:fixed; inset:0; z-index:-3;
  background:
    radial-gradient(1200px 700px at 18% 12%, rgba(138,91,255,.25), transparent 60%),
    radial-gradient(900px 600px at 80% 18%, rgba(34,211,238,.20), transparent 55%),
    radial-gradient(900px 600px at 55% 82%, rgba(255,61,214,.16), transparent 60%),
    radial-gradient(700px 500px at 18% 88%, rgba(124,255,107,.10), transparent 58%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
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
  position:sticky; top:10px; z-index:60;
  max-width:var(--max);
  margin:0 auto var(--gap);
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:10px 14px;
  border-radius:18px;
  backdrop-filter:blur(22px);
  background:rgba(8,10,22,.45);
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 10px 30px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.04);
}
#ld_brand{ display:flex; align-items:center; gap:10px; min-width:0; }
.ld_brandname{ font-weight:800; letter-spacing:.3px; font-size:15px; color:rgba(233,236,255,.92); white-space:nowrap; }
#ld_logo{
  width:28px; height:28px; border-radius:9px;
  background:
    radial-gradient(circle at 30% 30%, rgba(34,211,238,.95), transparent 62%),
    radial-gradient(circle at 70% 70%, rgba(138,91,255,.90), transparent 62%),
    linear-gradient(135deg,#0b0f2a,#0b0f2a);
  box-shadow:0 0 18px rgba(138,91,255,.35), inset 0 0 12px rgba(255,255,255,.12);
}
#ld_topnav{ margin-left:auto; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ld_btn.compact{ padding:8px 12px; min-height:36px; font-size:13px; }
.ld_pill{
  border:1px solid var(--stroke);
  background:rgba(255,255,255,.04);
  border-radius:999px;
  padding:10px 12px;
  color:var(--muted);
  font-size:13px;
  display:flex; align-items:center; gap:8px;
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
  color:var(--muted2);
  letter-spacing:.22em;
  font-size:11px;
  text-transform:uppercase;
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
  font-size:clamp(26px, 3.2vw, 44px);
  margin:4px 0 10px;
  letter-spacing:-0.6px;
  line-height:1.05;
}
.ld_centerTitle .grad{
  background:linear-gradient(90deg, var(--c2), var(--c1), var(--c3));
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}
.ld_sub{ color:var(--muted); font-size:15px; line-height:1.45; max-width:52ch; }
.ld_actionsRow{ display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
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
  position:fixed; left:0; right:0; bottom:0; z-index:60;
  padding:10px 10px calc(10px + env(safe-area-inset-bottom));
  background:linear-gradient(180deg, rgba(8,10,20,0), rgba(8,10,20,.72), rgba(8,10,20,.84));
  backdrop-filter:blur(14px);
  border-top:1px solid rgba(255,255,255,.10);
  display:none;
}
#ld_mnav .row{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.ld_mbtn{
  border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.05);
  border-radius:18px;
  padding:10px;
  color:rgba(233,236,255,.76);
  font-weight:900;
  display:flex; flex-direction:column; align-items:center; gap:6px;
  min-height:54px;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
}
.ld_mbtn.active{
  background:linear-gradient(135deg, rgba(138,91,255,.50), rgba(34,211,238,.22));
  color:var(--txt);
  border-color:rgba(255,255,255,.18);
}
.ld_mbtn span{ font-size:10px; letter-spacing:.16em; text-transform:uppercase; }
#ld_badge{
  position:fixed;
  right:12px;
  bottom:calc(12px + env(safe-area-inset-bottom) + var(--mobileNavH));
  z-index:40;
  display:flex; align-items:center; gap:10px;
  padding:10px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(0,0,0,.32);
  backdrop-filter:blur(12px);
  color:rgba(233,236,255,.72);
  box-shadow:0 12px 30px rgba(0,0,0,.35);
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
  #ld_top{
    top:6px;
    padding:8px 10px;
    border-radius:14px;
    align-items:flex-start;
  }
  #ld_topnav .ld_pill{ display:none; }
  #ld_topnav{
    gap:6px;
    justify-content:flex-end;
    max-width:58%;
  }
  .ld_brandname{ font-size:14px; }
  .ld_cards{ grid-template-columns:1fr; }
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
      calc(10px + env(safe-area-inset-top))
      10px
      calc(12px + env(safe-area-inset-bottom) + var(--mobileNavH))
      10px;
  }
  #ld_top{
    gap:8px;
    padding:8px;
  }
  #ld_brand{
    min-width:0;
    flex:1 1 auto;
  }
  .ld_brandname{
    max-width:140px;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  #ld_topnav{
    flex:0 0 auto;
    max-width:none;
  }
  #ld_btn_name span:last-child,
  #ld_btn_help,
  #ld_btn_upgrade{
    font-size:12px;
  }
  #ld_btn_name,
  #ld_btn_help,
  #ld_btn_upgrade{
    padding:8px 10px;
    min-height:34px;
  }
  .ld_actionsRow .ld_btn,
  .ld_card .btm .ld_btn{
    flex:1 1 100%;
    width:100%;
  }
  .ld_metricRow{ grid-template-columns:1fr; }
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
  .ld_ob_title{ font-size:20px; }
  .ld_ob_sub{ font-size:13px; }
  .ld_ob_cards{ grid-template-columns:1fr; gap:8px; }
  .ld_ob_card{ padding:10px; }
  #ld_topnav{
    display:grid;
    grid-template-columns:repeat(3, auto);
    gap:6px;
  }
  #ld_btn_name span:last-child{ display:none; }
  #ld_btn_help{ padding-inline:10px; }
  #ld_btn_upgrade{ padding-inline:10px; }
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
      <span class="ld_brandname">LifeDecode Recovery</span>
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

      <button class="ld_btn ghost compact" id="ld_btn_help" title="Help / Guide">
        <span class="ld_icon" aria-hidden="true">❓</span>
        Help
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
         <button data-open="dashboard" class="active">🏠 Dashboard <small>Overview, status & quick actions</small></button>
<button data-open="checkin">✅ Daily Check-In <small>Free • Streak, XP & daily reset</small></button>
<button data-open="urge">⏱ Urge Emergency <small>Free • 90-second rescue flow</small></button>
<button data-open="trigger">🧠 Trigger Decoder <small>Premium • Analyze patterns & relapse signals</small></button>
<button data-open="coach">✨ Coach Output <small>Free / Premium • AI recovery plan</small></button>
<div class="sep"></div>
<button data-open="journal">📓 Journal <small>Premium • Private recovery notes & entries</small></button>
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

        <div class="kicker">RECOVERY DASHBOARD</div>
        <div class="ld_centerTitle">
          Welcome back, <span class="grad" id="ld_name_big">Member</span>.
        </div>
        <div class="ld_sub" id="ld_subline">
          Daily check-ins, fast urge rescue, trigger decoding, and a clean 12-hour plan. Built for accounts and database sync.
        </div>

        <div class="ld_actionsRow">
          <button class="ld_btn primary" data-open="checkin">New Check-In</button>
          <button class="ld_btn danger" data-open="urge">Urge Emergency</button>
          <button class="ld_btn ghost" data-open="trigger">Decode Trigger</button>
          <button class="ld_btn ghost" data-open="coach">Generate Plan</button>
        </div>
      </div>

      <div class="ld_cards">
        <div class="ld_card">
          <div class="top">
            <div>
              <div class="kicker">TODAY</div>
              <h4>Daily Check-Ins</h4>
              <p>One small clean action now. One in 30 minutes. Repeat.</p>
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

            <div class="ld_hint">Tap a mood → then “New Check-In” to log today.</div>
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
              <p id="ld_coach_meta">Get a practical AI recovery plan based on your mood, triggers, and current risk level.</p>
            </div>
            <div class="ld_badge"><span class="ld_dot ok"></span> Recovery Mode</div>
          </div>

          <div class="mid">
            <div class="ld_out" id="ld_coach_preview">No plan yet.</div>
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
              <div class="kicker">URGE EMERGENCY</div>
              <h4>90-second rescue</h4>
              <p>Break the urge loop with a fast reset: regulate, interrupt, and redirect.</p>
            </div>
            <div class="ld_badge" id="ld_urge_badge"><span class="ld_dot ok"></span> Ready</div>
          </div>

          <div class="mid">
            <div class="ld_out" id="ld_urge_text">Step 1 (10s): Name it. “This is an urge, not an order.”
Step 2 (40s): Breathe 4–2–6. Slow.
Step 3 (40s): Do ONE friction action (stand up, water, walk).</div>
            <div class="ld_hint">Hit Start → timer vodi zadevo in da XP po completionu.</div>
          </div>

          <div class="btm">
            <button class="ld_btn danger" id="ld_btn_startrescue">Start Rescue</button>
            <button class="ld_btn" id="ld_btn_stoprescue">Stop</button>
            <button class="ld_btn ghost" data-open="urge">Open Module</button>
          </div>
        </div>

        <div class="ld_card">
          <div class="top">
            <div>
              <div class="kicker">TRIGGER DECODER</div>
              <h4>Decode the pattern</h4>
              <p>Identify what triggered you, how your mind reacted, and what your next clean move should be.</p>
            </div>
            <div class="ld_badge"><span class="ld_dot ok"></span> Fast</div>
          </div>

          <div class="mid">
            <div class="ld_brain" aria-hidden="true">
              <svg viewBox="0 0 640 320">
                <path d="M78,210 C140,110 220,90 270,130 C312,85 385,70 430,120 C520,90 570,160 552,220 C540,265 485,292 430,275 C390,315 280,315 245,270 C175,290 110,260 90,235" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="6" stroke-linecap="round"></path>
                <path d="M110,212 C168,140 215,128 260,155" fill="none" stroke="rgba(34,211,238,.55)" stroke-width="8" stroke-linecap="round"></path>
                <path d="M300,140 C340,110 402,110 450,150" fill="none" stroke="rgba(138,91,255,.50)" stroke-width="8" stroke-linecap="round"></path>
                <path d="M190,238 C270,255 360,250 470,210" fill="none" stroke="rgba(255,61,214,.45)" stroke-width="8" stroke-linecap="round"></path>
              </svg>
            </div>
            <div class="ld_hint" id="ld_last_trigger">Last trigger: none</div>
          </div>

          <div class="btm">
            <button class="ld_btn" data-open="trigger">Analyze</button>
            <button class="ld_btn ghost" id="ld_btn_quicktrigger">Quick log</button>
          </div>
        </div>
      </div>
    </div>

    <div class="ld_panel" id="ld_right">
      <div class="hd">
        <div>
          <div class="kicker">STATUS</div>
          <h3>Recovery Mode</h3>
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
    <button class="ld_mbtn active" data-open="dashboard">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>
      <span>Home</span>
    </button>
    <button class="ld_mbtn" data-open="checkin">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      <span>Check-In</span>
    </button>
    <button class="ld_mbtn" data-open="urge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z" stroke="currentColor" stroke-width="2"></path></svg>
      <span>Rescue</span>
    </button>
    <button class="ld_mbtn" data-open="coach">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a1 1 0 0 1-2-2Z" stroke="currentColor" stroke-width="2"></path><path d="M14 4v6h6" stroke="currentColor" stroke-width="2"></path></svg>
      <span>Plan</span>
    </button>
  </div>
</div>

<div id="ld_badge" aria-label="Version badge">
  <span id="ld_badge_text">LifeDecode AI v1</span>
  <button id="ld_badge_close" aria-label="Hide badge">✕</button>
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
      <h3 style="margin:6px 0 0;">LifeDecode Recovery</h3>
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
    if (document.getElementById("ld_single_style")) return;
    const style = document.createElement("style");
    style.id = "ld_single_style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function renderHTML() {
    const app = document.getElementById("ld_app");
    if (!app) return false;
    app.innerHTML = HTML;
    return true;
  }

  function startWhenReady() {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
      const app = document.getElementById("ld_app");
      if (app) {
        clearInterval(timer);
        injectCSS();
        renderHTML();
        initLifeDecode();
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
    if (window.__LD_RECOVERY_INIT__) return;
    window.__LD_RECOVERY_INIT__ = true;

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
      onboard: { done: false, step: 0, focus: "Recovery" },
      profile: { id: null, name: "Member", email: "" },
      premium: { unlocked: false, plan: "free" },
      xp: 0,
      streak: 0,
      lastCheckInDay: null,
      lastCheckInDayPrevious: null,
      lastMood: null,
      lastTrigger: null,
      triggers: [],
      urges: { count: 0, last: null, completedRescues: 0 },
      journal: [],
      coach: { lastUpdated: null, preview: "No plan yet.", saved: [] },
      freePreview: { used: 0, windowStart: 0 }
    };

    let STATE = clone(DEFAULT_STATE);
    let HAS_SERVER = false;
    let rescueTimer = null;
    let rescueEndsAt = null;
    let AUTH_TAB = "signup";

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
        freePreview: { ...DEFAULT_STATE.freePreview, ...((s && s.freePreview) || {}) }
      };

      m.profile.name = (m.profile.name || "Member").trim() || "Member";
      if (!Array.isArray(m.triggers)) m.triggers = [];
      if (!Array.isArray(m.journal)) m.journal = [];
      if (!Array.isArray(m.coach.saved)) m.coach.saved = [];
      return m;
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

    let __ldSupabasePromise = null;

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

  STATE.auth = clone(DEFAULT_STATE.auth);
  STATE.profile = clone(DEFAULT_STATE.profile);
  STATE.premium = clone(DEFAULT_STATE.premium);
  STATE.onboard.done = false;
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
  } catch (err) {
    console.warn("[LD] auth bootstrap failed:", err?.message || err);
    STATE.auth = clone(DEFAULT_STATE.auth);
    STATE.profile = clone(DEFAULT_STATE.profile);
    persistAuthCache();
  }
}

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
        .select("state, premium_unlocked, premium_plan")
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
          plan: data.premium_plan || "free"
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
      const f = STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery";
      const map = {
        Recovery:
          "Daily check-ins, fast urge rescue, trigger decoding, and a clean 12-hour plan. Built for accounts and database sync.",
        Anxiety:
          "Fast calm-down flows, trigger decoding, and structured micro-actions for the next 12 hours. Built for accounts and database sync.",
        Custom:
          "Pick your own pattern: check-ins, rescue flows, decoding, and clean 12-hour planning. Built for accounts and database sync."
      };
      sub.textContent = map[f] || map.Recovery;
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
        { name: "Recovery Architect", at: 7000, next: 10000 }
      ];
      let cur = tiers[0];
      for (const t of tiers) if (xp >= t.at) cur = t;
      return { name: cur.name, at: cur.at, nextXP: cur.next || cur.at + 3000 };
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

      const coachMeta = $("#ld_coach_meta");
      if (coachMeta) {
        coachMeta.textContent = STATE.coach.lastUpdated
          ? `Updated ${fmtDate(STATE.coach.lastUpdated)}`
          : `Press “Generate Plan” to get your next 12-hour plan.`;
      }

      if ($("#ld_coach_preview")) $("#ld_coach_preview").textContent = STATE.coach.preview || "No plan yet.";
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
        paywall.textContent = STATE.premium.unlocked
          ? "Unlocked: Full Plan + AI Mentor."
          : "Some outputs can be locked behind upgrade (Stripe).";
      }

      const badgeText = $("#ld_badge_text");
      if (badgeText) badgeText.textContent = `LD Recovery • ${CFG.VERSION}`;
      syncAccountModeUI();
    }

function isPremium() {
  return !!STATE.premium?.unlocked;
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
              <h3 style="margin:6px 0 0;">Unlock full recovery system</h3>
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
• Premium tools and future recovery modes</div>
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

    function openSheet(title, html) {
      const els = getSheetEls();
      if (!els.backdrop || !els.sheet || !els.title || !els.body) {
        console.error("[LD] sheet elements missing");
        return;
      }

      els.title.textContent = title;
      els.body.innerHTML = html;
      els.backdrop.style.display = "block";
      els.sheet.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    function closeSheet() {
      const els = getSheetEls();
      if (!els.backdrop || !els.sheet || !els.body) return;
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
        Guest mode = no real cross-device sync, no proper recovery history in database.
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

      alert(`Account: ${STATE.profile.name || "Member"}${STATE.profile.email ? "\nEmail: " + STATE.profile.email : ""}\nPlan: ${STATE.premium.plan || "free"}`);
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
        await addXP(CFG.XP.RESCUE);
        await saveState();
        renderStats();
        setStatus("ok", `RESCUE COMPLETE +${CFG.XP.RESCUE} XP`);
        setTimeout(() => setStatus("ok", "READY"), 1200);
      }
    }

    function moduleCheckIn() {
      const doneToday = STATE.lastCheckInDay === ymd();
      const mood = STATE.lastMood || "—";

      openSheet(
        "DAILY CHECK-IN",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_kv"><span>Status today</span><b>${doneToday ? "Done ✅" : "Not done"}</b></div>
            <div class="ld_kv"><span>Last mood</span><b>${mood}</b></div>
            <div class="ld_hr"></div>
            <div class="ld_hint">Choose mood (optional), add 1–2 actions, then save.</div>
            <div class="ld_chiprow" id="ld_sheet_moods">
              ${["OK", "STABLE", "ANXIOUS", "NUMB", "URGES"].map((m) => `<div class="ld_chip ${STATE.lastMood === m ? "active" : ""}" data-mood="${m}">${m}</div>`).join("")}
            </div>
            <div class="ld_hr"></div>
            <input class="ld_field" id="ld_ci_action1" placeholder="Action #1 (clean + small, doable in 2–5 min)">
            <input class="ld_field" id="ld_ci_action2" placeholder="Action #2 (optional)">
            <textarea class="ld_field" id="ld_ci_note" placeholder="Optional note: what’s the risk today? what’s the win?"></textarea>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn primary" id="ld_ci_save">Save Check-In</button>
              <button class="ld_btn ghost" id="ld_ci_cancel">Cancel</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">QUICK RULE</div>
                  <h3 style="margin:6px 0 0;">One clean action now</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out">If you’re tempted: reduce the problem to a 2-minute step. Then do a friction action (water / walk / message someone).</div>
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
        "URGE EMERGENCY (90s)",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_kv"><span>Timer</span><b id="ld_urge_sheet_timer">Ready</b></div>
            <div class="ld_hr"></div>
            <div class="ld_out">Step 1 (10s): Name it. “This is an urge, not an order.”
Step 2 (40s): Breathe 4–2–6. Slow.
Step 3 (40s): Do ONE friction action (stand up, water, walk).</div>
            <div class="ld_hr"></div>
            <div class="ld_row">
              <button class="ld_btn danger" id="ld_urge_sheet_start">Start Rescue</button>
              <button class="ld_btn" id="ld_urge_sheet_stop">Stop</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">FAST RESET</div>
                  <h3 style="margin:6px 0 0;">What you do next</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out">After 90 seconds: do a “seal action”. Examples: move phone away • drink water • go outside for 2 minutes • message accountability.</div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>Rescues completed</span><b>${STATE.urges.completedRescues || 0}</b></div>
                <div class="ld_kv"><span>Urges logged</span><b>${STATE.urges.count || 0}</b></div>
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
              ${["Stress", "Boredom", "Lonely", "Angry", "Tired", "Social", "Money", "Alcohol", "Scrolling", "Sex"].map((x) => `<div class="ld_chip" data-l="${x}">${x}</div>`).join("")}
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
            const pj = await pr.json().catch(() => null);
            if (pj && (pj.reply || pj.result)) return pj.reply || pj.result;
          }
        }
        throw new Error("Timed out waiting for Make reply.");
      }

      const j = await r.json().catch(() => null);
      if (!j) throw new Error("Invalid Make response.");
      return j.reply || j.result || j.text || JSON.stringify(j);
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

    function moduleCoach() {
      openSheet(
        "COACH OUTPUT (12 HOURS)",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_hint">Describe what’s happening right now (short is fine).</div>
            <textarea class="ld_field" id="ld_coach_input" placeholder="Example: I feel cravings after work. Stress + boredom. I want a plan for the next 12 hours."></textarea>
            <div class="ld_hr"></div>
            <div class="ld_hint">Tone:</div>
            <div class="ld_chiprow" id="ld_tone_row">
              ${["Recovery", "Savage", "Calm", "Strict", "Supportive"].map((t) => `<div class="ld_chip ${t === "Recovery" ? "active" : ""}" data-tone="${t}">${t}</div>`).join("")}
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
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">OUTPUT</div>
                  <h3 style="margin:6px 0 0;">Next 12 hours</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out" id="ld_coach_out"></div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>Last updated</span><b>${STATE.coach.lastUpdated ? fmtDate(STATE.coach.lastUpdated) : "—"}</b></div>
                <div class="ld_kv"><span>Saved plans</span><b>${(STATE.coach.saved || []).length}</b></div>
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
  lockHint.textContent = STATE.premium.unlocked
    ? "Premium active: full 12-hour AI plans, saveable outputs, deeper support."
    : `Free plan: ${CFG.FREE_PREVIEW_PER_24H} coach preview per 24h. Premium unlocks unlimited full plans and saved outputs.`;
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
            <div class="ld_kv"><span>Focus mode</span><b>${STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery"}</b></div>
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
                <div class="ld_out">LifeDecode Recovery is a fast system for:
• urges/cravings (break the loop)
• daily structure (streak + XP)
• trigger awareness (pattern decoding)
• simple plans (next 12 hours)

Rule: keep it short. One clean action > perfect plan.</div>
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

    const OPENERS = {
      dashboard: moduleDashboard,
      checkin: moduleCheckIn,
      urge: moduleUrge,
      trigger: moduleTrigger,
      coach: moduleCoach,
      journal: moduleJournal,
      insights: moduleInsights,
      progress: moduleProgress,
      tools: moduleTools,
      settings: moduleSettings,
      help: moduleHelp
    };

    function setActiveNav(key) {
      $$("#ld_nav button").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
      $$("#ld_mnav .ld_mbtn").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
    }

   function openModule(key) {
  setActiveNav(key);

  const premiumModules = ["trigger", "journal", "insights", "progress", "tools"];

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
      window.location.href = CFG.STRIPE_PAYMENT_LINK;
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

      STATE.onboard = STATE.onboard || { done: false, step: 0, focus: "Recovery" };
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
        const f = STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery";
        els.body.innerHTML = `
          <div class="ld_ob_title">Choose your focus mode</div>
          <p class="ld_ob_sub">This changes wording so it feels natural for the user.</p>
          <div class="ld_chiprow" id="ld_ob_focus">
            ${["Recovery", "Anxiety", "Custom"].map((x) => `<div class="ld_chip ${x === f ? "active" : ""}" data-f="${x}">${x}</div>`).join("")}
          </div>
          <div class="ld_hr"></div>
          <div class="ld_out" id="ld_ob_focus_desc"></div>
        `;
        const descEl = $("#ld_ob_focus_desc");
        const setDesc = (mode) => {
          const map = {
            Recovery: "Recovery = cravings/urges/habits. Focus on removing access + replacing the ritual.",
            Anxiety: "Anxiety = panic/overthinking. Focus on nervous system reset + tiny controllables.",
            Custom: "Custom = same modules, your own framing."
          };
          if (descEl) descEl.textContent = map[mode] || map.Recovery;
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
      await loadState();
      syncNameUI();
      syncFocusUI();
      renderStats();
      closeAuthBox();
      if (!STATE.onboard.done) openOnboarding(false);
    }

    function bindDelegatedClicks() {
      document.addEventListener("click", async (e) => {
        const navBtn = e.target.closest("#ld_nav button[data-open], #ld_mnav .ld_mbtn[data-open], #ld_center [data-open], #ld_right [data-open]");
        if (navBtn) {
          e.preventDefault();
          openModule(navBtn.dataset.open);
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
          openAccountInfo();
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
          STATE.coach.saved.unshift({ id: uid(), ts: now(), tone: "Recovery", text });
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
  if (!requirePremium("Trigger Decoder")) return;
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

        if (e.target.closest("#ld_ci_save")) {
          const day = ymd();
          const already = STATE.lastCheckInDay === day;

          const action1 = ($("#ld_ci_action1")?.value || "").trim();
          const action2 = ($("#ld_ci_action2")?.value || "").trim();
          const note = ($("#ld_ci_note")?.value || "").trim();

          if (!action1 && !note) {
            alert("Write at least one action or note first.");
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
            a1: action1,
            a2: action2,
            note
          });

          if (!already) await addXP(CFG.XP.CHECKIN);
          await saveState();
          renderStats();
          setStatus("ok", already ? "CHECK-IN UPDATED" : `CHECK-IN SAVED +${CFG.XP.CHECKIN} XP`);
          closeSheet();
          setTimeout(() => setStatus("ok", "READY"), 1100);
          return;
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
          if (!requirePremium("Trigger Decoder")) return;
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

          const out = $("#ld_trig_out");
          if (out) {
            out.textContent = `Counter-move (2 min):
• Change state: water + stand up + 10 slow breaths.
• Reduce access: remove the risky thing from reach for 30 minutes.
• Replace: do ONE clean micro-task (shower, walk, message, tidy).
• Script: “I can feel this AND still choose the next right step.”`;
          }

          await addXP(CFG.XP.TRIGGER);
          await saveState();
          renderStats();
          setStatus("ok", `TRIGGER SAVED +${CFG.XP.TRIGGER} XP`);
          setTimeout(() => setStatus("ok", "READY"), 1200);
          return;
        }

        const toneChip = e.target.closest("#ld_tone_row .ld_chip");
        if (toneChip) {
          $$("#ld_tone_row .ld_chip").forEach((x) => x.classList.remove("active"));
          toneChip.classList.add("active");
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
          const tone = activeTone ? activeTone.dataset.tone : "Recovery";
          const text = ($("#ld_coach_out")?.textContent || "").trim();
          if (!text) return;
          STATE.coach.saved.unshift({ id: uid(), ts: now(), tone, text });
          await saveState();
          renderStats();
          setStatus("ok", "SAVED");
          setTimeout(() => setStatus("ok", "READY"), 900);
          return;
        }

        if (e.target.closest("#ld_coach_gen")) {
          const input = ($("#ld_coach_input")?.value || "").trim();
          const activeTone = $("#ld_tone_row .ld_chip.active");
          const tone = activeTone ? activeTone.dataset.tone : "Recovery";
          const outEl = $("#ld_coach_out");

          if (!input) {
            alert("Write 1–2 lines about what’s happening first.");
            return;
          }

          const previewState = freePreviewAllowed();
          if (!STATE.premium.unlocked && !previewState.ok) {
            if (outEl) {
              outEl.textContent = `LOCKED: Full Plan + AI Mentor (Upgrade)

• You already used today’s free preview.
• Tap Upgrade to unlock.`;
            }
            return;
          }

          const request_id = uid();
          const payload = {
            request_id,
            mode: "LifeDecode Recovery",
            tone,
            user_name: STATE.profile.name || "Member",
            user_id: STATE.profile.id || null,
            focus: STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery",
            streak: STATE.streak || 0,
            xp: STATE.xp || 0,
            last_mood: STATE.lastMood || null,
            last_trigger: STATE.lastTrigger || null,
            prompt: `Write a practical next-12-hours plan.

Rules:
- Max 6 steps, each step short and actionable.
- Include 1 “remove access” step, 1 “replacement activity”, 1 “social/accountability” step.
- End with a 1-line mantra.

Context: ${input}`
          };

          setStatus("warn", "GENERATING…");
          if (outEl) outEl.textContent = "Generating…";

          try {
            const reply = await callMake(payload);
            const text = String(reply || "").trim() || "No reply.";

            if (!STATE.premium.unlocked) await commitFreePreviewUse(previewState.fp);

            STATE.coach.preview = text;
            STATE.coach.lastUpdated = now();
            await saveState();
            renderStats();
            if (outEl) outEl.textContent = text;
            setStatus("ok", "READY");
          } catch (err) {
            if (outEl) {
              outEl.textContent = `NEXT 12 HOURS PLAN (fallback)

1) Remove access to the risky thing for 30 minutes.
2) Water + 10 slow breaths.
3) Do ONE 5-minute clean task (shower / walk / tidy).
4) Eat something simple + protein.
5) Message someone: “I’m choosing the next right step.”
6) Set a 30-minute timer and repeat step #3.

Mantra: “Urge ≠ order. I choose the next clean step.”

(Make webhook missing/failed: ${err.message})`;
            }
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
          await addXP(CFG.XP.JOURNAL);
          await saveState();
          renderStats();
          setStatus("ok", `JOURNAL SAVED +${CFG.XP.JOURNAL} XP`);
          setTimeout(() => setStatus("ok", "READY"), 1200);
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_tool_export")) {
         if (!requirePremium("Data Export")) return;
          const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "ld_recovery_state.json";
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
              Recovery: "Recovery = cravings/urges/habits. Focus on removing access + replacing the ritual.",
              Anxiety: "Anxiety = panic/overthinking. Focus on nervous system reset + tiny controllables.",
              Custom: "Custom = same modules, your own framing."
            };
            descEl.textContent = map[STATE.onboard.focus] || map.Recovery;
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

    if (paid === "1") {
      STATE.premium.unlocked = true;
      STATE.premium.plan = plan || "premium";

      await saveState();
      renderStats();

      setStatus("ok", "PAYMENT RECEIVED");
      setTimeout(() => setStatus("ok", "READY"), 1200);

      u.searchParams.delete("ld_paid");
      u.searchParams.delete("ld_plan");
      window.history.replaceState({}, "", u.toString());
    }
  } catch (e) {
    console.warn("[LD] handlePaid failed:", e?.message || e);
  }
}

async function boot() {
  try {
    setStatus("warn", "LOADING...");

    syncNameUI();
    syncFocusUI();
    initParticles();
    bindDelegatedClicks();

    setStatus("warn", "AUTH LOADING...");

    const supabase = await withTimeout(getSupabaseClient(), 8000, "getSupabaseClient");

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[LD] auth event:", event);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          STATE.auth.token = session.access_token || "";
          applyUserToState(session.user);
          await completeAccountEntry();
          setStatus("ok", "LOGGED IN");
          setTimeout(() => setStatus("ok", "READY"), 1200);
        } catch (err) {
          console.warn("[LD] SIGNED_IN handler failed:", err?.message || err);
          setStatus("bad", "AUTH EVENT ERROR");
        }
      }

      if (event === "SIGNED_OUT") {
        STATE.auth = clone(DEFAULT_STATE.auth);
        STATE.profile = clone(DEFAULT_STATE.profile);
        renderStats();
        syncNameUI();
        syncFocusUI();
        setStatus("warn", "SIGNED OUT");
      }
    });

    await bootstrapAuth();

try {
  await loadState();
} catch (err) {
  console.warn("[LD] loadState failed:", err?.message || err);
}

syncNameUI();
syncFocusUI();
renderStats();

    if (!STATE.auth.chosen) {
      setStatus("warn", "CHOOSE MODE");
      openAuthBox(true);
    } else {
      setStatus("ok", "READY");
      if (!STATE.onboard.done) openOnboarding(false);
    }

    console.log("[LD] Recovery loaded:", CFG.VERSION);
  } catch (err) {
    console.error("[LD] boot error:", err);
    setStatus("bad", "BOOT ERROR");
  }
}
    boot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenReady);
  } else {
    startWhenReady();
  }
})();

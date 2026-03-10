<!-- =========================
HEAD (CSS) — paste into Webflow HEAD
========================= -->
<style>
:root{
  --bg0:#05060a;
  --bg1:#070916;
  --panel: rgba(255,255,255,.06);
  --panel2: rgba(255,255,255,.09);
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
  --r2:18px;
  --shadow: 0 14px 50px rgba(0,0,0,.55);
  --shadow2: 0 10px 30px rgba(0,0,0,.40);
  --pad: clamp(14px, 2.2vw, 22px);
  --gap: clamp(12px, 1.8vw, 18px);
  --max: 1220px;
  --navH: 64px;
  --mobileNavH: 74px;
}

#ld_app, #ld_app * { box-sizing: border-box; }

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
  min-height: 100svh;
  padding:
    calc(var(--pad) + env(safe-area-inset-top))
    var(--pad)
    calc(var(--pad) + env(safe-area-inset-bottom) + var(--mobileNavH))
    var(--pad);
}

#ld_top{
  position: sticky; top: 10px; z-index: 60;
  max-width: var(--max);
  margin: 0 auto var(--gap);
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding: 10px 14px;
  border-radius: 18px;
  backdrop-filter: blur(22px);
  background: rgba(8,10,22,.45);
  border:1px solid rgba(255,255,255,.08);
  box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.04);
}

#ld_brand{ display:flex; align-items:center; gap:10px; min-width: 0; }

.ld_brandname{
  font-weight:800; letter-spacing:.3px; font-size:15px;
  color:rgba(233,236,255,.92);
  white-space:nowrap;
}

#ld_logo{
  width:28px; height:28px; border-radius:9px;
  background:
    radial-gradient(circle at 30% 30%, rgba(34,211,238,.95), transparent 62%),
    radial-gradient(circle at 70% 70%, rgba(138,91,255,.90), transparent 62%),
    linear-gradient(135deg,#0b0f2a,#0b0f2a);
  box-shadow: 0 0 18px rgba(138,91,255,.35), inset 0 0 12px rgba(255,255,255,.12);
}

#ld_topnav{ margin-left:auto; display:flex; align-items:center; gap:8px; }

.ld_btn.compact{ padding:8px 12px; min-height:36px; font-size:13px; }

.ld_pill{
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.04);
  border-radius: 999px;
  padding: 10px 12px;
  color: var(--muted);
  font-size: 13px;
  display:flex; align-items:center; gap:8px;
  user-select:none;
}

.ld_dot{
  width:8px; height:8px; border-radius:99px;
  background: rgba(255,255,255,.35);
  box-shadow: 0 0 0 2px rgba(255,255,255,.08);
}
.ld_dot.ok{
  background: var(--ok);
  box-shadow: 0 0 0 3px rgba(69,255,181,.18), 0 0 22px rgba(69,255,181,.22);
}
.ld_dot.warn{
  background: var(--warn);
  box-shadow: 0 0 0 3px rgba(255,176,32,.18), 0 0 22px rgba(255,176,32,.20);
}
.ld_dot.bad{
  background: var(--danger);
  box-shadow: 0 0 0 3px rgba(255,77,109,.18), 0 0 22px rgba(255,77,109,.18);
}

.ld_btn{
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.05);
  color: var(--txt);
  border-radius: 999px;
  padding: 11px 14px;
  font-weight: 700;
  letter-spacing: .3px;
  cursor:pointer;
  transition: transform .08s ease, background .15s ease, border-color .15s ease;
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  min-height: 42px;
  -webkit-tap-highlight-color: transparent;
}
.ld_btn:hover{ background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.18); }
.ld_btn:active{ transform: translateY(1px); }
.ld_btn.primary{
  background: linear-gradient(135deg, rgba(138,91,255,.85), rgba(34,211,238,.55));
  border-color: rgba(255,255,255,.18);
  box-shadow: 0 16px 50px rgba(138,91,255,.18);
}
.ld_btn.ghost{ background: rgba(255,255,255,.03); }
.ld_btn.danger{
  background: linear-gradient(135deg, rgba(255,77,109,.85), rgba(255,61,214,.40));
  border-color: rgba(255,255,255,.18);
}
.ld_icon{ width:18px; height:18px; display:inline-block; opacity:.92; }

#ld_grid{
  max-width: var(--max);
  margin: 0 auto;
  display:grid;
  grid-template-columns: 300px 1fr 340px;
  gap: var(--gap);
  align-items:start;
}

.ld_panel{
  border: 1px solid var(--stroke);
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.04));
  border-radius: var(--r1);
  box-shadow: var(--shadow2);
  overflow:hidden;
}

.ld_panel .hd{
  padding: 14px 16px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(0,0,0,.12);
}

.ld_panel .hd .kicker{
  color: var(--muted2);
  letter-spacing: .22em;
  font-size: 11px;
  text-transform: uppercase;
}

.ld_panel .hd h3{ margin: 6px 0 0; font-size: 18px; letter-spacing: .2px; }
.ld_panel .bd{ padding: 16px; }
#ld_left .bd{ padding: 10px; }

.ld_nav{ display:flex; flex-direction:column; gap:6px; }
.ld_nav button{
  width:100%;
  text-align:left;
  padding: 12px 12px;
  border-radius: 14px;
  border:1px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor:pointer;
  display:flex; align-items:center; gap:10px;
  font-weight: 700;
}
.ld_nav button:hover{ background: rgba(255,255,255,.05); color: var(--txt); }
.ld_nav button.active{
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.12);
  color: var(--txt);
  box-shadow: 0 12px 24px rgba(0,0,0,.22);
}
.ld_nav small{
  display:block;
  margin-top:2px;
  font-weight:600;
  color: rgba(233,236,255,.55);
}
.ld_nav .sep{ height:1px; background: rgba(255,255,255,.08); margin: 8px 6px; border-radius:99px; }

#ld_center .hero{ padding: 18px 18px 14px; position:relative; overflow:hidden; }
.ld_heroart{
  position:absolute; inset:-30px -30px auto auto;
  width: 380px; height: 240px;
  opacity:.85;
  filter: drop-shadow(0 26px 55px rgba(0,0,0,.40));
  pointer-events:none;
}

.ld_centerTitle{
  font-size: clamp(26px, 3.2vw, 44px);
  margin: 4px 0 10px;
  letter-spacing: -0.6px;
  line-height:1.05;
}
.ld_centerTitle .grad{
  background: linear-gradient(90deg, var(--c2), var(--c1), var(--c3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.ld_sub{ color: var(--muted); font-size: 15px; line-height:1.45; max-width: 52ch; }
.ld_actionsRow{ display:flex; flex-wrap:wrap; gap:10px; margin-top: 14px; }

.ld_cards{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap);
  padding: 0 16px 16px;
}

.ld_card{
  border:1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.10);
  border-radius: var(--r1);
  overflow:hidden;
}

.ld_card .top{
  padding: 14px 14px 10px;
  display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
}
.ld_badge{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  color: var(--muted);
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  display:flex; align-items:center; gap:8px;
  white-space:nowrap;
}
.ld_card h4{ margin: 0; font-size: 16px; }
.ld_card p{ margin: 8px 0 0; color: var(--muted); font-size: 13px; line-height:1.35; }
.ld_card .mid{ padding: 0 14px 14px; }

.ld_metricRow{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
.ld_metric{
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  border-radius: 18px;
  padding: 12px;
}
.ld_metric .t{
  color: var(--muted2);
  font-size: 12px;
  letter-spacing:.12em;
  text-transform:uppercase;
}
.ld_metric .v{ margin-top:6px; font-size: 22px; font-weight: 900; }

.ld_bar{
  height: 10px;
  border-radius: 99px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  overflow:hidden;
  margin-top: 10px;
}
.ld_bar > i{
  display:block;
  height:100%;
  width: 30%;
  background: linear-gradient(90deg, var(--c2), var(--c1), var(--c3));
  box-shadow: 0 0 28px rgba(34,211,238,.18);
}

.ld_card .btm{
  padding: 12px 14px 14px;
  display:flex; gap:10px; flex-wrap:wrap;
  border-top: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.03);
}

#ld_right .bd{ display:flex; flex-direction:column; gap: var(--gap); }
.ld_sideCard{
  border:1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.12);
  border-radius: var(--r1);
  overflow:hidden;
}
.ld_sideCard .h{
  padding: 12px 14px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  color: var(--muted);
  font-weight: 800;
  letter-spacing:.12em;
  text-transform:uppercase;
  font-size: 11px;
}
.ld_sideCard .c{ padding: 14px; }
.ld_big{ font-size: 24px; font-weight: 950; letter-spacing:-0.5px; }
.ld_small{ color: var(--muted); margin-top: 6px; font-size: 13px; line-height:1.35; }

.ld_brain{
  width: 100%;
  height: 160px;
  border-radius: 22px;
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
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(8px);
  display:none;
}

#ld_sheet{
  position:fixed; left:50%; top:50%;
  transform: translate(-50%,-50%);
  width:min(920px, calc(100vw - 22px));
  max-height: min(86svh, 720px);
  overflow:auto;
  z-index:101;
  display:none;
  border:1px solid rgba(255,255,255,.14);
  background: linear-gradient(180deg, rgba(12,14,28,.92), rgba(8,10,20,.88));
  border-radius: 26px;
  box-shadow: 0 40px 120px rgba(0,0,0,.75);
}
#ld_sheet .shd{
  position:sticky; top:0;
  background: linear-gradient(180deg, rgba(12,14,28,.96), rgba(12,14,28,.70));
  border-bottom: 1px solid rgba(255,255,255,.10);
  padding: 14px 14px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
}
#ld_sheet .shd b{
  font-size: 14px;
  letter-spacing:.22em;
  text-transform:uppercase;
  color: rgba(233,236,255,.78);
}
#ld_sheet .sbd{ padding: 14px; }

.ld_formrow{ display:flex; gap:10px; flex-wrap:wrap; }
.ld_field{
  width:100%;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  color: var(--txt);
  border-radius: 16px;
  padding: 12px 12px;
  outline:none;
  min-height: 44px;
}
textarea.ld_field{ min-height: 120px; resize: vertical; }

.ld_hint{ color: var(--muted); font-size: 12px; line-height:1.35; margin-top:8px; }
.ld_grid2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.ld_chiprow{ display:flex; flex-wrap:wrap; gap:8px; margin-top: 8px; }
.ld_chip{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  border-radius: 999px;
  padding: 9px 10px;
  font-weight: 800;
  color: rgba(233,236,255,.82);
  cursor:pointer;
  user-select:none;
}
.ld_chip.active{
  background: linear-gradient(135deg, rgba(138,91,255,.55), rgba(34,211,238,.30));
  border-color: rgba(255,255,255,.18);
}

#ld_mnav{
  position:fixed; left:0; right:0; bottom:0; z-index:60;
  padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(8,10,20,0), rgba(8,10,20,.72), rgba(8,10,20,.84));
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(255,255,255,.10);
  display:none;
}
#ld_mnav .row{ display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ld_mbtn{
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.05);
  border-radius: 18px;
  padding: 10px 10px;
  color: rgba(233,236,255,.76);
  font-weight: 900;
  display:flex; flex-direction:column; align-items:center; gap:6px;
  min-height: 54px;
  cursor:pointer;
  -webkit-tap-highlight-color: transparent;
}
.ld_mbtn.active{
  background: linear-gradient(135deg, rgba(138,91,255,.50), rgba(34,211,238,.22));
  color: var(--txt);
  border-color: rgba(255,255,255,.18);
}
.ld_mbtn span{ font-size: 10px; letter-spacing:.16em; text-transform:uppercase; }
.ld_mbtn svg{ opacity:.95; }

#ld_badge{
  position:fixed;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom) + var(--mobileNavH));
  z-index:40;
  display:flex; align-items:center; gap:10px;
  padding: 10px 12px;
  border-radius: 999px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.32);
  backdrop-filter: blur(12px);
  color: rgba(233,236,255,.72);
  box-shadow: 0 12px 30px rgba(0,0,0,.35);
}
#ld_badge button{
  border:none; background: transparent;
  color: rgba(233,236,255,.55);
  cursor:pointer;
  font-weight: 900;
  padding: 0 4px;
}

.ld_row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.ld_rightalign{ margin-left:auto; }
.ld_hr{ height:1px; background: rgba(255,255,255,.08); margin: 12px 0; border-radius:99px; }
.ld_kv{ display:flex; justify-content:space-between; gap:10px; color: var(--muted); font-size: 13px; }
.ld_kv b{ color: rgba(233,236,255,.86); }
.ld_out{
  white-space: pre-wrap;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  border-radius: 18px;
  padding: 12px;
  color: rgba(233,236,255,.88);
  min-height: 120px;
}

/* ===== ONBOARDING ===== */
#ld_ob_backdrop{
  position:fixed; inset:0; z-index:120;
  background: rgba(0,0,0,.62);
  backdrop-filter: blur(10px);
  display:none;
}
#ld_ob{
  position:fixed; left:50%; top:50%;
  transform: translate(-50%,-50%);
  z-index:121;
  display:none;
  width: min(680px, calc(100vw - 22px));
  border-radius: 26px;
  border:1px solid rgba(255,255,255,.14);
  background: linear-gradient(180deg, rgba(12,14,28,.94), rgba(8,10,20,.90));
  box-shadow: 0 40px 120px rgba(0,0,0,.78);
  overflow:hidden;
}
#ld_ob .hd{
  padding: 14px 14px;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  border-bottom: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.12);
}
#ld_ob .hd .kicker{
  color: var(--muted2);
  letter-spacing: .22em;
  font-size: 11px;
  text-transform: uppercase;
}
#ld_ob .bd{ padding: 14px; }
#ld_ob .ft{
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
}

.ld_ob_title{ font-size: 22px; font-weight: 950; letter-spacing:-0.5px; margin: 2px 0 6px; }
.ld_ob_sub{ color: var(--muted); line-height:1.45; margin: 0 0 10px; }
.ld_ob_cards{ display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px; }
.ld_ob_card{
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  border-radius: 18px;
  padding: 12px;
}
.ld_ob_card b{ display:block; margin-bottom:6px; }
.ld_ob_card p{ margin:0; color: var(--muted); font-size: 13px; line-height:1.35; }

@media (max-width: 1120px){
  #ld_grid{ grid-template-columns: 280px 1fr; }
  #ld_right{ display:none; }
}
@media (max-width: 860px){
  #ld_grid{ grid-template-columns: 1fr; }
  #ld_left{ display:none; }
  #ld_mnav{ display:block; }
  #ld_top{ top: 6px; padding: 8px 10px; border-radius: 14px; }
  #ld_topnav .ld_pill{ display:none; }
  .ld_brandname{ font-size:14px; }
  .ld_cards{ grid-template-columns: 1fr; }
  .ld_heroart{ width: 320px; height: 210px; opacity:.65; }
  #ld_badge{ bottom: calc(12px + env(safe-area-inset-bottom) + var(--mobileNavH)); }
  #ld_ob{ width: min(560px, calc(100vw - 18px)); }
}
@media (max-width: 860px){
  .ld_ob_cards{ grid-template-columns: 1fr; }
}

/* ===== v2.3 MOBILE ONBOARDING FIX (iPhone Safari) ===== */
#ld_ob{
  max-height: min(88svh, 760px);
  display: none;
  flex-direction: column;
}
#ld_ob .hd{ position: sticky; top: 0; z-index: 2; }
#ld_ob .bd{
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  max-height: 60svh;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
#ld_ob .ft{
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
}
#ld_ob_backdrop{ touch-action: manipulation; }
@media (max-width: 430px){
  #ld_ob{ width: calc(100vw - 14px); border-radius: 20px; }
  .ld_ob_title{ font-size: 20px; }
  .ld_ob_sub{ font-size: 13px; }
  .ld_ob_cards{ gap: 8px; }
  .ld_ob_card{ padding: 10px; }
}
</style>
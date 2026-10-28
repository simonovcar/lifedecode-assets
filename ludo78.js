(function () {
  "use strict";

  const path = (window.location.pathname || "").toLowerCase();

  // Never touch legal/support pages. Keeps Google/Supabase verification, policy
  // pages, and the App Store Connect Support URL (/support) clean - render()
  // injects a top-level #ldw_app directly under body (see WHITE-SCREEN RESCUE
  // v8), independent of any Webflow wrapper, which otherwise covers whatever
  // Webflow already rendered on these routes shortly after DOMContentLoaded.
  if (path.includes("/terms") || path.includes("/policy") || path.includes("/privacy") || path.includes("/support")) {
    console.log("[LD] Legal/support page detected — LifeDecode landing script skipped.");
    return;
  }

  if (window.__LD_WORLD_LANDING_LOADED__) return;
  window.__LD_WORLD_LANDING_LOADED__ = true;

  // Website V2 assets live next to this script in the repo (assets/v2/...).
  // Resolving them relative to this script's own src means they always come
  // from the same jsDelivr ref (branch, tag or commit) the script itself was
  // loaded from — so pinning the Webflow <script> to a commit also pins the
  // art. Must be read synchronously, while this file is executing.
  const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  const ASSET_BASE = (function () {
    try { if (SCRIPT_SRC) return new URL("./", SCRIPT_SRC).href; } catch (e) {}
    return "https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/";
  })();

  const CFG = {
    VERSION: "lifedecode-app-v17-website-v2",
    // Original full-size wallpaper (unchanged from ludo77.js). V2 no longer
    // preloads it — it is only the last-resort fallback if the optimized
    // assets/v2 images fail to load.
    ICONIC_URL: "https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/assets/iconic2.png?v=lifedecode-iconic-bg-v6",
    ICONIC_FALLBACKS: [
      "https://raw.githubusercontent.com/simonovcar/lifedecode-assets/main/assets/iconic2.png?v=lifedecode-iconic-bg-v6"
    ],
    ART: {
      webp640: ASSET_BASE + "assets/v2/keyart-640.webp",
      webp1024: ASSET_BASE + "assets/v2/keyart-1024.webp",
      webp1536: ASSET_BASE + "assets/v2/keyart-1536.webp",
      jpg1536: ASSET_BASE + "assets/v2/keyart-1536.jpg",
      width: 1536,
      height: 1024
    },
    WORLD_URL: "https://world.lifedecode.app/#",
    POLICY_URL: "/policy",
    TERMS_URL: "/terms",
    SUPPORT_URL: "/support",
    PREMIUM_URL: "https://lifedecode.app/premium",
    // The account modal never deletes anything itself — this is a plain link
    // out to the LifeDecode World deletion pipeline/page, which explains the
    // process and handles it entirely. See lifedecode-game's public/delete-account.html.
    DELETE_ACCOUNT_URL: "https://world.lifedecode.app/delete-account",
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

  // Single source of truth for "how should this visitor play." Nothing else
  // in the file should branch on iOS/Android directly — read ENTRY_CONFIG
  // through Platform.current instead. Store URLs are null on purpose: the
  // iOS app exists in App Store Connect (Apple ID 6797244424, built via
  // Codemagic) but CI has submit_to_testflight/submit_to_app_store both set
  // to false, so it is not actually installable by the public yet. The
  // Android project has no build pipeline at all — com.lifedecode.world in
  // assetlinks.json/server.js is reserved config, not a shipped app. When a
  // real store URL exists, set it here and appAvailable:true — the render
  // logic below already branches on that flag, no UI code needs to change.
  const Platform = (function () {
    function detect() {
      const ua = navigator.userAgent || "";
      const uaPlatform = navigator.platform || "";
      const maxTouch = navigator.maxTouchPoints || 0;
      // iPadOS 13+ reports as "MacIntel" with no touch-point hint in the UA
      // string, so the UA regex alone misses iPads — the platform+touch
      // check catches those without relying on UA sniffing as the only signal.
      if (/iPad|iPhone|iPod/.test(ua) || (uaPlatform === "MacIntel" && maxTouch > 1)) return "ios";
      if (/Android/.test(ua)) return "android";
      return "desktop";
    }
    return { current: detect() };
  })();

  const ENTRY_CONFIG = {
    desktop: { webUrl: CFG.WORLD_URL },
    ios: { webUrl: CFG.WORLD_URL, storeUrl: null, appAvailable: false, comingSoon: true, label: "iPhone" },
    android: { webUrl: CFG.WORLD_URL, storeUrl: null, appAvailable: false, comingSoon: false, label: "Android" }
  };

  // ---------------------------------------------------------------------
  // CONTENT — everything a visitor reads lives here, so copy can be edited
  // without touching layout code.
  //
  // Accuracy rule: only advertise what is live. Every claim below comes
  // from the owner-approved production homepage (ludo77.js) or from the
  // owner directly. lifedecode-game could not be inspected when V2 was
  // written, so anything unconfirmed sits in `pendingVerification` and is
  // NOT rendered. Move an item into `pillars` only once it is live in the
  // game for real players.
  // ---------------------------------------------------------------------
  const CONTENT = {
    hero: {
      eyebrow: ["A social online world", "Play in your browser"],
      tagline: "Your life. Your story. Your world.",
      lede: "Explore strange, cozy rooms, meet ridiculous NPCs and other players, and level up your spirit just by showing up.",
      micro: "No download · No login wall · Sign in to keep your progress"
    },
    prologue: {
      kicker: "Why this world exists",
      quote: "Not pay-to-win. Not soulless. Just weird, cozy, iconic progression.",
      body: "LifeDecode World is a small, strange corner of the internet where your daily choices actually do something. No lecture energy, no forced positivity — just rooms to explore, NPCs with opinions, other players to run into, and a spirit that slowly levels up because you showed up.",
      facts: [
        { title: "Browser-based", text: "Play on desktop or mobile. Nothing to install." },
        { title: "Multiplayer", text: "The rooms are shared with other players." },
        { title: "Grows with you", text: "XP, levels and unlocks that stay with your account." }
      ]
    },
    // `image` is reserved for a real in-game screenshot of the room (an
    // absolute URL, ideally ~1200px wide WebP). While it is null the card
    // shows stylised CSS artwork instead — never a fake screenshot.
    locations: [
      { id: "plaza", name: "Plaza", accent: "#5fe3ff", glow: "rgba(95,227,255,.38)", tag: "The first stop", text: "Loud, welcoming, mildly suspicious. Where most adventures begin.", image: null, imageAlt: "" },
      { id: "brew", name: "Brew Haven", accent: "#f4c76b", glow: "rgba(255,150,120,.36)", tag: "Pull up a chair", text: "Sit down, order something imaginary, regret a decision out loud.", image: null, imageAlt: "" },
      { id: "soulcore", name: "Soulcore", accent: "#b48cff", glow: "rgba(150,100,255,.42)", tag: "The quiet heart", text: "Where the actual character growth quietly happens.", image: null, imageAlt: "" },
      { id: "mind", name: "Mind Zone", accent: "#86ff9e", glow: "rgba(110,255,170,.30)", tag: "Different kind of chaos", text: "For when your brain needs a different kind of chaos.", image: null, imageAlt: "" }
    ],
    locationsNote: "More rooms keep getting added to the map. Room artwork on this page is stylised — not in-game screenshots.",
    // Crop regions are in source pixels of the 1536x1024 key art. Each crop
    // is 4:5 (h = w * 1.25) to match the portrait frame.
    squad: [
      { id: "cowboy", name: "The Cowboy", phrase: "Yee-Haw!", color: "#4aa8ff", crop: { x: 0, y: 40, w: 600 }, alt: "The Cowboy: a glowing blue spirit in a black cowboy hat with a gold sheriff's star, grinning and pointing finger-guns.", text: "Rolls in with pure chaotic confidence. Says \"Yee-Haw,\" means nothing by it, ropes you into a quest anyway." },
      { id: "ninja", name: "The Ninja", phrase: "Hmph.", color: "#ff5a4a", crop: { x: 490, y: 0, w: 540 }, alt: "The Ninja: a masked spirit wreathed in red flame, glaring with glowing orange eyes, a sword hilt over one shoulder.", text: "Says \"Hmph\" and radiates devastating main-character energy for someone who talks the least." },
      { id: "pirate", name: "The Pirate", phrase: "Arrr! Treasure!", color: "#7dff5a", crop: { x: 900, y: 10, w: 620 }, alt: "The Pirate: a cackling green spirit in a skull-and-crossbones hat, tongue out, giving a thumbs-up as gold coins fly past.", text: "Yells \"Arrr! Treasure!\" at inappropriate volumes. Financially motivated. Emotionally unavailable." },
      { id: "princess", name: "The Princess", phrase: "Really?", color: "#c77dff", crop: { x: 560, y: 380, w: 430 }, alt: "The Princess: a violet spirit in a jewelled tiara, chin resting on one hand, looking thoroughly unimpressed.", text: "Unimpressed by literally everything. \"Really?\" is both a greeting and a review of your life choices." }
    ],
    pillars: [
      { icon: "spirit", title: "Build your spirit", text: "Cosmetics, sets, identity and style. Unlock pieces as you play — no shortcuts that quietly ruin the game for everyone else." },
      { icon: "level", title: "Level up by showing up", text: "Earn XP and climb levels through play and daily check-ins. Progress comes from showing up, not from paying to win." },
      { icon: "coin", title: "Beans, Dust & unlocks", text: "Your Beans, Dust and unlocks are tied to your account, so signing in keeps them safe." },
      { icon: "sprout", title: "Grow through play", text: "Daily check-ins, symbolic systems, choices and NPC moments that quietly teach real-life skills." },
      { icon: "people", title: "A shared world", text: "Rooms are shared with other players. Explore together, run into familiar faces, and get dragged into the same chaos." },
      { icon: "device", title: "Play your way", text: "Jump in as a guest in seconds, or create an account with email or Google so your progress follows you across devices." }
    ],
    // NOT RENDERED. Mentioned by the owner, not yet verified against the
    // live game. Confirm each one, then move it into `pillars` (live) or
    // `news` (with an honest status) — never both guessed.
    pendingVerification: [
      "Pets / pet collecting",
      "Player homes and home customization",
      "Minigames and activities",
      "Cinema (screenings / cinema business)",
      "Friends / friendship system",
      "Organizations",
      "Additional careers"
    ],
    // Updates feed. status: "live" | "soon" | "dev" | "ongoing".
    // `date` is optional ISO (YYYY-MM or YYYY-MM-DD) — only set it for things
    // that really happened on that date. Never add player counts or events
    // that have not been announced.
    news: [
      { status: "dev", label: "In development", date: "", title: "Movie Creator", text: "A creative tool for making your own scenes and films inside LifeDecode World is being built. It isn't available in the game yet — we'll post here when it is." },
      { status: "soon", label: "Coming soon", date: "", title: "iPhone app", text: "A native iPhone app is in preparation. Until it lands, LifeDecode World plays right in Safari — no download needed." },
      { status: "ongoing", label: "Ongoing", date: "", title: "New rooms on the map", text: "Plaza, Brew Haven, Soulcore and Mind Zone are open today, and more rooms keep getting added." },
      { status: "live", label: "Live", date: "2026-07", title: "Account controls", text: "Signed-in players can find Delete account in the Account menu. It opens the official LifeDecode World account deletion page, which explains the whole process." }
    ],
    finale: {
      kicker: "Your spirit is waiting",
      title: "Step into LifeDecode World",
      text: "No download, no login wall. Open the world, find the Plaza, and start your story."
    },
    footerTag: "LifeDecode World — enter at your own emotional risk."
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatNewsDate(iso) {
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(iso || ""));
    if (!m) return "";
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[Number(m[2]) - 1] || "";
    return (m[3] ? Number(m[3]) + " " : "") + month + " " + m[1];
  }

  const ICONS = {
    spirit: '<path d="M12 3c3.9 0 7 3.1 7 7v9.2c0 .6-.7 1-1.2.6l-1.6-1.2-1.6 1.2c-.4.3-.9.3-1.2 0L12 18.6l-1.4 1.2c-.4.3-.9.3-1.2 0l-1.6-1.2-1.6 1.2c-.5.4-1.2 0-1.2-.6V10c0-3.9 3.1-7 7-7z"/><circle cx="9.5" cy="10.5" r="1.2"/><circle cx="14.5" cy="10.5" r="1.2"/>',
    level: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z"/><path d="M12 8.5v4.5"/>',
    coin: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    sprout: '<path d="M12 21v-8"/><path d="M12 13c0-4 2.5-6.5 7-7 0 4.5-2.5 7-7 7z"/><path d="M12 15c0-3-2-5-6-5.5 0 3.5 2 5.5 6 5.5z"/>',
    people: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.6 14.2c2.4-.3 4.4 1.2 4.9 4.3"/>',
    device: '<rect x="3" y="4.5" width="13" height="10" rx="1.6"/><path d="M7 18.5h5"/><rect x="16.5" y="9" width="4.5" height="10.5" rx="1.2"/>'
  };

  const SIGILS = {
    plaza: '<circle cx="60" cy="60" r="40"/><circle cx="60" cy="60" r="26"/><path d="M60 14v18M60 88v18M14 60h18M88 60h18"/><path d="M44 60c0-9 7-16 16-16s16 7 16 16"/><path d="M52 60v10M68 60v10M48 70h24"/>',
    brew: '<path d="M34 50h44v22c0 13-10 22-22 22s-22-9-22-22z"/><path d="M78 56h6c6 0 10 4 10 9s-4 9-10 9h-7"/><path d="M48 40c-4-5 4-8 0-14M60 40c-4-5 4-8 0-14M72 40c-4-5 4-8 0-14"/><path d="M30 102h56"/>',
    soulcore: '<circle cx="60" cy="60" r="14"/><ellipse cx="60" cy="60" rx="44" ry="16"/><ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="44" ry="16" transform="rotate(-60 60 60)"/>',
    mind: '<path d="M60 16l40 44-40 44-40-44z"/><path d="M60 34l22 26-22 26-22-26z"/><path d="M20 60h80M60 16v88"/><circle cx="60" cy="60" r="5"/>'
  };

  function iconSvg(name) {
    return '<svg class="v2_icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }

  // One <picture> markup for every use of the key art. All copies share the
  // same srcset + sizes so the browser downloads a single file and reuses it.
  function keyArtPicture(opts) {
    const o = opts || {};
    const a = CFG.ART;
    return '<picture>' +
      '<source type="image/webp" srcset="' + a.webp640 + ' 640w, ' + a.webp1024 + ' 1024w, ' + a.webp1536 + ' 1536w" sizes="100vw">' +
      '<img class="' + esc(o.cls || "") + '" src="' + a.jpg1536 + '" width="' + a.width + '" height="' + a.height + '" alt="' + esc(o.alt || "") + '"' +
      (o.eager ? ' fetchpriority="high" loading="eager"' : ' loading="lazy"') +
      ' decoding="async" data-ldv2-art' + (o.style ? ' style="' + o.style + '"' : '') + '>' +
      '</picture>';
  }

  function cropStyle(crop) {
    return "--x:" + crop.x + ";--y:" + crop.y + ";--w:" + crop.w;
  }

  const PLAY_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>';

  const CSS = `
html{scroll-behavior:smooth;scroll-padding-top:84px;}
html,body{margin:0;min-height:100%;background:#050616!important;}
body{overflow-x:hidden;}
body.ld-no-scroll{overflow:hidden;}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto;}}

#ldw_app{
  --v-bg:#050616;
  --v-bg-2:#0a0b26;
  --v-ink:#f6f3ff;
  --v-muted:rgba(232,228,255,.76);
  --v-soft:rgba(232,228,255,.56);
  --v-line:rgba(170,160,255,.14);
  --v-line-2:rgba(244,199,107,.28);
  --v-violet:#7b4dff;
  --v-violet-deep:#24135a;
  --v-cyan:#5fe3ff;
  --v-gold:#f4c76b;
  --v-magenta:#ff5fd8;
  --v-display:"Cinzel","Cormorant Garamond",Georgia,"Times New Roman",serif;
  --v-sans:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  --v-container:min(1240px,calc(100% - 40px));
  --v-wide:min(1480px,calc(100% - 40px));
  --v-section-pad:clamp(44px,5vw,80px);
  --v-radius:22px;
  --v-radius-sm:14px;
  --v-ease:cubic-bezier(.2,.7,.2,1);
  /* Legacy tokens still used by the shared auth modal + support widget CSS */
  --ld-text:#f6f3ff;
  --ld-muted:rgba(232,228,255,.76);
  --ld-soft:rgba(232,228,255,.56);
  --ld-pink:#ff5fd8;
  --ldw-radius-lg:24px;
  --ldw-radius-md:18px;
  min-height:100svh;
  position:relative;
  background:var(--v-bg);
  color:var(--v-ink);
  font-family:var(--v-sans);
  font-size:16px;
  line-height:1.6;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
  overflow-x:clip;
  display:block!important;visibility:visible!important;opacity:1!important;
}
#ldw_app *,#ldw_app *::before,#ldw_app *::after{box-sizing:border-box;}
#ldw_app h1,#ldw_app h2,#ldw_app h3,#ldw_app p,#ldw_app ul,#ldw_app figure{margin:0;}
#ldw_app ul{padding:0;list-style:none;}
#ldw_app img{max-width:100%;display:block;border:0;}
#ldw_app a{color:inherit;}
#ldw_app button{font-family:inherit;}
#ldw_app :focus-visible{outline:2px solid var(--v-gold);outline-offset:3px;}
#ldw_app .v2_sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}

/* Skip link */
#ldw_app .v2_skip{position:fixed;left:16px;top:-60px;z-index:100;padding:10px 16px;border-radius:10px;background:var(--v-gold);color:#140c02;font-weight:700;font-size:14px;text-decoration:none;transition:top .15s ease;}
#ldw_app .v2_skip:focus{top:12px;}

/* Atmosphere — fixed, non-interactive, cheap (no canvas loop) */
#ldw_app .v2_atmos{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
  background:
    radial-gradient(1100px 700px at 12% -10%,rgba(123,77,255,.20),transparent 60%),
    radial-gradient(900px 640px at 100% 30%,rgba(95,227,255,.07),transparent 60%),
    radial-gradient(1000px 800px at 40% 110%,rgba(150,60,220,.16),transparent 60%),
    linear-gradient(180deg,#050616 0%,#070822 50%,#050616 100%);}
#ldw_app .v2_atmos::before,#ldw_app .v2_atmos::after{content:"";position:absolute;inset:-50px;background-repeat:repeat;}
#ldw_app .v2_atmos::before{background-image:
    radial-gradient(1.2px 1.2px at 20px 30px,rgba(255,255,255,.75),transparent 60%),
    radial-gradient(1px 1px at 140px 80px,rgba(200,220,255,.6),transparent 60%),
    radial-gradient(1.4px 1.4px at 260px 160px,rgba(255,240,210,.65),transparent 60%),
    radial-gradient(1px 1px at 80px 220px,rgba(255,255,255,.5),transparent 60%),
    radial-gradient(1.1px 1.1px at 330px 260px,rgba(190,170,255,.6),transparent 60%);
  background-size:360px 300px;opacity:.55;}
#ldw_app .v2_atmos::after{background-image:
    radial-gradient(1.6px 1.6px at 60px 120px,rgba(255,255,255,.9),transparent 60%),
    radial-gradient(1.3px 1.3px at 300px 40px,rgba(160,230,255,.85),transparent 60%),
    radial-gradient(1.5px 1.5px at 420px 300px,rgba(255,210,150,.8),transparent 60%);
  background-size:520px 420px;opacity:.4;animation:v2Twinkle 7s ease-in-out infinite alternate;}
@keyframes v2Twinkle{from{opacity:.15;}to{opacity:.6;}}

#ldw_app .v2_page{position:relative;z-index:1;}
#ldw_app .v2_container{width:var(--v-container);margin:0 auto;position:relative;}

/* Buttons */
#ldw_app .v2_btn{--h:52px;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:var(--h);padding:0 26px;border-radius:999px;border:1px solid transparent;font:600 15px/1 var(--v-sans);letter-spacing:.02em;text-decoration:none;cursor:pointer;white-space:nowrap;transition:transform .2s var(--v-ease),box-shadow .2s var(--v-ease),background-color .2s ease,border-color .2s ease,color .2s ease;-webkit-tap-highlight-color:transparent;}
#ldw_app .v2_btn svg{width:14px;height:14px;flex-shrink:0;}
#ldw_app .v2_btn_primary{color:#fff;background:linear-gradient(135deg,#7b4dff 0%,#b04dff 42%,#ff5fd8 78%,#ff8ad6 100%);box-shadow:inset 0 0 0 1px rgba(255,226,160,.55),inset 0 1px 0 rgba(255,255,255,.35),0 12px 34px rgba(150,70,255,.35),0 0 0 0 rgba(255,95,216,0);text-shadow:0 1px 2px rgba(60,0,80,.35);}
#ldw_app .v2_btn_primary:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(255,226,160,.8),inset 0 1px 0 rgba(255,255,255,.4),0 16px 42px rgba(150,70,255,.45),0 0 0 6px rgba(255,95,216,.10);}
#ldw_app .v2_btn_ghost{color:var(--v-ink);background:rgba(10,10,40,.38);border-color:rgba(200,190,255,.30);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
#ldw_app .v2_btn_ghost:hover{transform:translateY(-2px);border-color:rgba(244,199,107,.6);color:#fff;background:rgba(20,18,60,.55);}
#ldw_app .v2_btn_lg{--h:58px;padding:0 34px;font-size:16px;}
#ldw_app .v2_btn_sm{--h:40px;padding:0 18px;font-size:13.5px;}
#ldw_app .v2_btn:active{transform:translateY(0);}

/* Header */
#ldw_app .ldw_header{position:fixed;top:0;left:0;right:0;z-index:50;background:linear-gradient(180deg,rgba(5,6,22,.70),rgba(5,6,22,0));border-bottom:1px solid transparent;transition:background-color .3s ease,border-color .3s ease,box-shadow .3s ease,backdrop-filter .3s ease;}
#ldw_app .ldw_header.is-scrolled{background:rgba(6,7,26,.86);border-bottom-color:var(--v-line);box-shadow:0 12px 30px rgba(0,0,0,.30);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
#ldw_app .v2_header_inner{width:var(--v-wide);margin:0 auto;min-height:72px;display:flex;align-items:center;gap:20px;}
#ldw_app .v2_brand{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-decoration:none;line-height:1;margin-right:auto;}
#ldw_app .v2_brand_main{font-family:var(--v-display);font-weight:700;font-size:19px;letter-spacing:.22em;color:#fff;text-shadow:0 0 18px rgba(180,140,255,.45);}
#ldw_app .v2_brand_sub{font-family:var(--v-display);font-weight:600;font-size:10px;letter-spacing:.62em;color:var(--v-gold);padding-left:2px;}
#ldw_app .v2_nav{display:flex;align-items:center;gap:4px;}
#ldw_app .v2_nav a{position:relative;padding:10px 14px;font-size:14px;font-weight:500;color:var(--v-muted);text-decoration:none;border-radius:8px;transition:color .2s ease;}
#ldw_app .v2_nav a::after{content:"";position:absolute;left:14px;right:14px;bottom:4px;height:1px;background:linear-gradient(90deg,transparent,var(--v-gold),transparent);transform:scaleX(0);transition:transform .25s var(--v-ease);}
#ldw_app .v2_nav a:hover{color:#fff;}
#ldw_app .v2_nav a:hover::after{transform:scaleX(1);}
#ldw_app .v2_header_actions{display:flex;align-items:center;gap:10px;}
#ldw_app #ldw_login_btn{min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(200,190,255,.26);background:transparent;color:var(--v-ink);font:500 14px/1 var(--v-sans);cursor:pointer;transition:border-color .2s ease,background-color .2s ease;}
#ldw_app #ldw_login_btn:hover{border-color:rgba(244,199,107,.6);background:rgba(255,255,255,.05);}
@media(max-width:960px){#ldw_app .v2_nav{display:none;}}
@media(max-width:420px){#ldw_app .v2_header_inner{gap:10px;min-height:64px;}#ldw_app .v2_brand_main{font-size:15px;letter-spacing:.16em;}#ldw_app .v2_brand_sub{font-size:8.5px;letter-spacing:.5em;}#ldw_app .v2_header_actions{gap:8px;}#ldw_app #ldw_login_btn{padding:0 12px;font-size:13px;min-height:38px;}#ldw_app .v2_header_play{--h:38px;padding:0 14px;}}

/* Hero */
#ldw_app .v2_hero{position:relative;min-height:clamp(600px,100svh,1100px);display:flex;align-items:flex-end;overflow:hidden;isolation:isolate;}
#ldw_app .v2_hero_art{position:absolute;inset:0;z-index:-2;background:#06071c;}
#ldw_app .v2_hero_art img{width:100%;height:100%;object-fit:cover;object-position:50% 24%;transform-origin:50% 35%;}
#ldw_app .v2_hero_shade{position:absolute;inset:0;z-index:-1;background:
  linear-gradient(180deg,rgba(5,6,22,.62) 0%,rgba(5,6,22,0) 16%,rgba(5,6,22,0) 46%,rgba(5,6,22,.72) 70%,rgba(5,6,22,.96) 88%,#050616 100%),
  radial-gradient(120% 70% at 50% 100%,rgba(5,6,22,.55),transparent 70%);}
#ldw_app .v2_hero_content{width:var(--v-container);margin:0 auto;padding:0 0 clamp(56px,9vh,104px);text-align:center;display:flex;flex-direction:column;align-items:center;}
/* Soft scrim behind the copy so it stays legible over the brightest parts of the art. */
#ldw_app .v2_hero_content{position:relative;z-index:0;}
#ldw_app .v2_hero_content::before{content:"";position:absolute;left:50%;bottom:0;width:min(1100px,120%);height:118%;transform:translateX(-50%);z-index:-1;background:radial-gradient(closest-side,rgba(5,6,22,.62),rgba(5,6,22,.30) 60%,transparent);pointer-events:none;}
#ldw_app .v2_eyebrow{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--v-gold);}
#ldw_app .v2_eyebrow::before,#ldw_app .v2_eyebrow::after{content:"";width:28px;height:1px;background:linear-gradient(90deg,transparent,currentColor);}
#ldw_app .v2_eyebrow::after{transform:scaleX(-1);}
#ldw_app .v2_hero_title{margin-top:18px;font-family:var(--v-display);font-weight:700;font-size:clamp(44px,8.2vw,112px);line-height:.95;letter-spacing:.04em;text-transform:uppercase;color:#fff;text-shadow:0 0 40px rgba(160,110,255,.45),0 6px 30px rgba(0,0,0,.6);}
#ldw_app .v2_hero_title span{display:block;font-size:.52em;letter-spacing:.42em;margin-top:.22em;padding-left:.42em;background:linear-gradient(90deg,#c9b2ff,#ffffff 45%,#f4c76b);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 0 22px rgba(190,140,255,.45));}
#ldw_app .v2_hero_tagline{margin-top:22px;font-family:var(--v-display);font-size:clamp(17px,2vw,24px);font-weight:500;letter-spacing:.08em;color:#fff;}
#ldw_app .v2_hero_lede{margin-top:12px;max-width:560px;color:var(--v-muted);font-size:clamp(15px,1.3vw,17.5px);line-height:1.6;text-shadow:0 2px 14px rgba(0,0,0,.7);}
#ldw_app .v2_hero_actions{margin-top:30px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;}
#ldw_app .v2_hero_micro{margin-top:20px;font-size:12.5px;letter-spacing:.06em;color:var(--v-soft);}
#ldw_app .ldw_app_badge{display:inline-flex;align-items:center;gap:7px;margin-top:14px;color:rgba(255,255,255,.62);font-size:12px;font-weight:600;letter-spacing:.04em;cursor:default;}
#ldw_app .ldw_app_badge::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--v-gold);}
#ldw_app .v2_scroll{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--v-soft);font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;text-decoration:none;}
#ldw_app .v2_scroll i{display:block;width:1px;height:28px;background:linear-gradient(180deg,var(--v-gold),transparent);animation:v2Drip 2.4s ease-in-out infinite;transform-origin:top;}
@keyframes v2Drip{0%{transform:scaleY(0);opacity:0;}30%{opacity:1;}100%{transform:scaleY(1);opacity:0;}}
@media(max-height:720px){#ldw_app .v2_scroll{display:none;}}

/* Desktop hero: left-aligned copy over the darker lower-left of the art so
   all four Silly Squad faces stay visible. */
@media(min-width:1024px){
  #ldw_app .v2_hero_content{width:var(--v-wide);align-items:flex-start;text-align:left;padding-bottom:clamp(64px,11vh,128px);}
  #ldw_app .v2_hero_content > *{max-width:600px;}
  #ldw_app .v2_hero_content::before{left:-12%;bottom:-10%;width:min(900px,80vw);height:130%;transform:none;background:radial-gradient(closest-side at 42% 58%,rgba(5,6,22,.72),rgba(5,6,22,.38) 62%,transparent);}
  #ldw_app .v2_hero_shade{background:
    linear-gradient(90deg,rgba(5,6,22,.70) 0%,rgba(5,6,22,.35) 34%,rgba(5,6,22,0) 58%),
    linear-gradient(180deg,rgba(5,6,22,.62) 0%,rgba(5,6,22,0) 16%,rgba(5,6,22,0) 52%,rgba(5,6,22,.62) 74%,rgba(5,6,22,.97) 88%,#050616 100%);}
  #ldw_app .v2_eyebrow::before{display:none;}
  #ldw_app .v2_eyebrow::after{transform:none;width:44px;background:linear-gradient(90deg,currentColor,transparent);}
  #ldw_app .v2_hero_title{font-size:clamp(56px,5.4vw,92px);}
  #ldw_app .v2_hero_title span{padding-left:0;}
  #ldw_app .v2_hero_lede{max-width:500px;}
  #ldw_app .v2_hero_actions{justify-content:flex-start;}
}

/* Mobile hero: show the art as a framed block instead of cropping a 3:2
   image into a tall phone viewport. */
@media(max-width:720px){
  #ldw_app .v2_hero{min-height:0;display:block;padding-top:64px;background:var(--v-bg);}
  #ldw_app .v2_hero_art{position:relative;inset:auto;height:auto;aspect-ratio:10/9;}
  #ldw_app .v2_hero_art img{object-position:50% 30%;}
  #ldw_app .v2_hero_content::before{display:none;}
  #ldw_app .v2_hero_tagline{font-size:16px;letter-spacing:.04em;margin-top:16px;}
  #ldw_app .v2_hero_actions{margin-top:24px;}
  #ldw_app .v2_hero_shade{top:64px;bottom:auto;height:calc(100vw * .9);background:linear-gradient(180deg,rgba(5,6,22,.35) 0%,rgba(5,6,22,0) 22%,rgba(5,6,22,0) 50%,rgba(5,6,22,.88) 80%,#050616 95%);}
  #ldw_app .v2_hero_content{margin-top:-84px;padding-bottom:40px;}
  #ldw_app .v2_scroll{display:none;}
  #ldw_app .v2_hero_actions{flex-direction:column;align-items:stretch;width:100%;max-width:360px;}
  #ldw_app .v2_eyebrow{font-size:10.5px;letter-spacing:.18em;gap:8px;}
  #ldw_app .v2_eyebrow::before,#ldw_app .v2_eyebrow::after{width:16px;}
}
@media(max-width:480px){#ldw_app .v2_eyebrow_more{display:none;}}

/* Section scaffolding.
   position:relative on every section is load-bearing (see ludo74.js): it
   gives static content its own stacking context, which avoids the Chromium
   paint-drop bug this page hit with fixed background layers. */
#ldw_app .v2_section{position:relative;padding:var(--v-section-pad) 0;}
#ldw_app .v2_head{max-width:720px;margin:0 auto clamp(32px,4vw,56px);text-align:center;}
#ldw_app .v2_kicker{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--v-gold);}
#ldw_app .v2_kicker::before{content:"";width:7px;height:7px;transform:rotate(45deg);border:1px solid currentColor;}
#ldw_app .v2_h2{margin-top:14px;font-family:var(--v-display);font-weight:600;font-size:clamp(30px,4.2vw,54px);line-height:1.08;letter-spacing:.01em;color:#fff;}
#ldw_app .v2_lead{margin-top:16px;color:var(--v-muted);font-size:clamp(15.5px,1.3vw,17.5px);line-height:1.65;}
#ldw_app .v2_rule{display:flex;align-items:center;justify-content:center;gap:14px;width:min(520px,70%);margin:0 auto;color:var(--v-gold);opacity:.7;}
#ldw_app .v2_rule::before,#ldw_app .v2_rule::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(244,199,107,.55));}
#ldw_app .v2_rule::after{transform:scaleX(-1);}
#ldw_app .v2_rule i{width:8px;height:8px;transform:rotate(45deg);border:1px solid currentColor;box-shadow:0 0 12px rgba(244,199,107,.6);}

/* Prologue */
#ldw_app .v2_prologue{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,6vw,96px);align-items:center;}
#ldw_app .v2_quote{margin-top:18px;font-family:var(--v-display);font-weight:500;font-size:clamp(28px,3.6vw,48px);line-height:1.15;color:#fff;}
#ldw_app .v2_quote em{font-style:normal;background:linear-gradient(90deg,#d7c6ff,#f4c76b);-webkit-background-clip:text;background-clip:text;color:transparent;}
#ldw_app .v2_prologue_body{color:var(--v-muted);font-size:clamp(15.5px,1.25vw,17px);line-height:1.75;}
#ldw_app .v2_facts{margin-top:28px;display:grid;gap:0;border-top:1px solid var(--v-line);}
#ldw_app .v2_fact{display:grid;grid-template-columns:150px 1fr;gap:16px;padding:16px 0;border-bottom:1px solid var(--v-line);}
#ldw_app .v2_fact b{font-family:var(--v-display);font-weight:600;font-size:15px;letter-spacing:.06em;color:#fff;}
#ldw_app .v2_fact span{color:var(--v-muted);font-size:15px;}
@media(max-width:880px){#ldw_app .v2_prologue{grid-template-columns:1fr;}#ldw_app .v2_fact{grid-template-columns:1fr;gap:4px;}}

/* Locations */
#ldw_app .v2_locations{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(14px,1.6vw,22px);}
#ldw_app .v2_loc{--accent:#5fe3ff;--glow:rgba(95,227,255,.35);position:relative;display:flex;flex-direction:column;border-radius:var(--v-radius);overflow:hidden;background:#090a24;border:1px solid var(--v-line);box-shadow:0 24px 60px rgba(0,0,0,.35);transition:transform .45s var(--v-ease),border-color .3s ease,box-shadow .45s var(--v-ease);}
#ldw_app .v2_loc:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 45%,transparent);box-shadow:0 34px 80px rgba(0,0,0,.45),0 0 60px -10px var(--glow);}
#ldw_app .v2_loc_art{position:relative;flex:0 0 260px;overflow:hidden;
  background:
    radial-gradient(60% 55% at 50% 48%,var(--glow),transparent 70%),
    radial-gradient(120% 80% at 50% 120%,rgba(5,6,22,1),transparent 60%),
    linear-gradient(160deg,color-mix(in srgb,var(--accent) 16%,#0b0c2c),#07081e 70%);}
#ldw_app .v2_loc_art::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 46px,rgba(255,255,255,.025) 46px 47px),repeating-linear-gradient(0deg,transparent 0 46px,rgba(255,255,255,.02) 46px 47px);mask-image:radial-gradient(70% 60% at 50% 55%,#000,transparent);-webkit-mask-image:radial-gradient(70% 60% at 50% 55%,#000,transparent);}
#ldw_app .v2_loc_art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
#ldw_app .v2_sigil{position:absolute;left:50%;top:48%;width:46%;max-width:150px;transform:translate(-50%,-50%);color:var(--accent);filter:drop-shadow(0 0 14px var(--glow)) drop-shadow(0 0 2px var(--accent));opacity:.92;transition:transform .6s var(--v-ease);}
#ldw_app .v2_loc:hover .v2_sigil{transform:translate(-50%,-54%) scale(1.04);}
#ldw_app .v2_loc_num{position:absolute;top:18px;left:20px;font-family:var(--v-display);font-size:13px;letter-spacing:.2em;color:color-mix(in srgb,var(--accent) 80%,#fff);}
#ldw_app .v2_loc_body{position:relative;flex:1;padding:22px 22px 26px;border-top:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(8,9,30,.9),rgba(6,7,24,.98));}
#ldw_app .v2_loc_body::before{content:"";position:absolute;left:22px;right:22px;top:-1px;height:1px;background:linear-gradient(90deg,var(--accent),transparent);}
#ldw_app .v2_loc_tag{font-size:11.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);}
#ldw_app .v2_loc h3{margin-top:8px;font-family:var(--v-display);font-weight:600;font-size:clamp(22px,1.9vw,27px);letter-spacing:.03em;color:#fff;}
#ldw_app .v2_loc p{margin-top:8px;color:var(--v-muted);font-size:15px;line-height:1.55;}
#ldw_app .v2_note{margin:28px auto 0;max-width:620px;text-align:center;color:var(--v-soft);font-size:13.5px;}
@media(max-width:1080px){#ldw_app .v2_locations{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:620px){
  #ldw_app .v2_locations{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;margin:0 -20px;padding:4px 20px 18px;scrollbar-width:none;}
  #ldw_app .v2_locations::-webkit-scrollbar{display:none;}
  #ldw_app .v2_loc{flex:0 0 80%;scroll-snap-align:center;}
  #ldw_app .v2_loc_art{flex-basis:220px;}
  #ldw_app .v2_loc:hover{transform:none;}
}

/* Squad showcase */
#ldw_app .v2_squad_wrap{position:relative;}
#ldw_app .v2_squad_wrap::before{content:"";position:absolute;inset:-10% -20%;background:radial-gradient(50% 50% at 30% 50%,var(--squad-glow,rgba(74,168,255,.18)),transparent 70%);transition:background .6s ease;pointer-events:none;}
#ldw_app .v2_squad{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:clamp(32px,6vw,88px);align-items:center;}
#ldw_app .v2_portrait{position:relative;aspect-ratio:4/5;max-height:640px;border-radius:28px;overflow:hidden;background:#07081e;border:1px solid var(--v-line-2);box-shadow:0 40px 100px rgba(0,0,0,.5),0 0 0 8px rgba(244,199,107,.04);}
#ldw_app .v2_portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(5,6,22,.85));pointer-events:none;}
#ldw_app .v2_portrait_frame{position:absolute;inset:0;opacity:0;transition:opacity .55s ease,transform .9s var(--v-ease);transform:scale(1.04);}
#ldw_app .v2_portrait_frame.is-active{opacity:1;transform:scale(1);}
#ldw_app .v2_portrait img{position:absolute;max-width:none!important;height:auto;width:calc(1536 / var(--w) * 100%);left:calc(var(--x) / var(--w) * -100%);top:calc(var(--y) / (var(--w) * 1.25) * -100%);}
#ldw_app .v2_portrait_caption{position:absolute;left:24px;right:24px;bottom:20px;z-index:1;display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--v-soft);}
#ldw_app .v2_tabs{margin-top:30px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
#ldw_app .v2_tab{--c:#4aa8ff;position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:16px 18px;border-radius:var(--v-radius-sm);border:1px solid var(--v-line);background:rgba(255,255,255,.025);color:var(--v-ink);text-align:left;cursor:pointer;transition:border-color .25s ease,background-color .25s ease,transform .25s var(--v-ease);}
#ldw_app .v2_tab:hover{background:rgba(255,255,255,.05);transform:translateY(-2px);}
#ldw_app .v2_tab b{font-family:var(--v-display);font-weight:600;font-size:17px;letter-spacing:.03em;}
#ldw_app .v2_tab span{font-size:13px;color:var(--v-soft);letter-spacing:.04em;}
#ldw_app .v2_tab::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:2px;border-radius:2px;background:var(--c);opacity:0;transition:opacity .25s ease;}
#ldw_app .v2_tab[aria-selected="true"]{border-color:color-mix(in srgb,var(--c) 55%,transparent);background:color-mix(in srgb,var(--c) 9%,transparent);}
#ldw_app .v2_tab[aria-selected="true"]::before{opacity:1;}
#ldw_app .v2_tab[aria-selected="true"] span{color:var(--c);}
#ldw_app .v2_squad_panel{margin-top:26px;min-height:120px;}
#ldw_app .v2_squad_panel[hidden]{display:none;}
#ldw_app .v2_squad_panel .v2_phrase{font-family:var(--v-display);font-size:clamp(24px,2.6vw,34px);font-weight:600;line-height:1.1;}
#ldw_app .v2_squad_panel p{margin-top:12px;color:var(--v-muted);font-size:16.5px;line-height:1.7;max-width:520px;}
#ldw_app .v2_squad_copy .v2_h2,#ldw_app .v2_squad_copy .v2_lead{text-align:left;}
@media(max-width:880px){
  #ldw_app .v2_squad{grid-template-columns:1fr;}
  #ldw_app .v2_portrait{max-width:440px;width:100%;margin:0 auto;}
  #ldw_app .v2_squad_copy{text-align:center;}
  #ldw_app .v2_squad_copy .v2_h2,#ldw_app .v2_squad_copy .v2_lead{text-align:center;}
  #ldw_app .v2_squad_panel{text-align:center;}
  #ldw_app .v2_squad_panel p{margin-left:auto;margin-right:auto;}
}
@media(max-width:420px){#ldw_app .v2_tab{padding:13px 14px;}#ldw_app .v2_tab b{font-size:15px;}}

/* Pillars */
#ldw_app .v2_pillars{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--v-line);border:1px solid var(--v-line);border-radius:var(--v-radius);overflow:hidden;}
#ldw_app .v2_pillar{position:relative;padding:clamp(26px,2.6vw,38px);background:linear-gradient(180deg,rgba(10,11,38,.96),rgba(7,8,28,.98));transition:background .35s ease;}
#ldw_app .v2_pillar:hover{background:linear-gradient(180deg,rgba(18,16,56,.98),rgba(9,9,34,.98));}
#ldw_app .v2_pillar_icon{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:14px;color:var(--v-gold);background:radial-gradient(circle at 30% 25%,rgba(244,199,107,.16),rgba(123,77,255,.10));border:1px solid rgba(244,199,107,.25);}
#ldw_app .v2_icon{width:26px;height:26px;}
#ldw_app .v2_pillar h3{margin-top:20px;font-family:var(--v-display);font-weight:600;font-size:20px;letter-spacing:.02em;color:#fff;}
#ldw_app .v2_pillar p{margin-top:10px;color:var(--v-muted);font-size:15px;line-height:1.65;}
@media(max-width:980px){#ldw_app .v2_pillars{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:600px){#ldw_app .v2_pillars{grid-template-columns:1fr;}}

/* News */
#ldw_app .v2_news{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
#ldw_app .v2_news_card{--s:#5fe3ff;position:relative;display:flex;flex-direction:column;padding:26px 24px 28px;border-radius:var(--v-radius);border:1px solid var(--v-line);background:linear-gradient(180deg,rgba(12,12,42,.88),rgba(7,8,26,.92));overflow:hidden;}
#ldw_app .v2_news_card::before{content:"";position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg,var(--s),transparent 80%);}
#ldw_app .v2_news_card[data-status="live"]{--s:#86ff9e;}
#ldw_app .v2_news_card[data-status="soon"]{--s:#f4c76b;}
#ldw_app .v2_news_card[data-status="dev"]{--s:#c79bff;}
#ldw_app .v2_news_card[data-status="ongoing"]{--s:#5fe3ff;}
#ldw_app .v2_news_meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:12px;color:var(--v-soft);}
#ldw_app .v2_status{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;border:1px solid color-mix(in srgb,var(--s) 45%,transparent);background:color-mix(in srgb,var(--s) 10%,transparent);color:var(--s);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}
#ldw_app .v2_status::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor;}
#ldw_app .v2_news_card h3{margin-top:18px;font-family:var(--v-display);font-weight:600;font-size:21px;color:#fff;}
#ldw_app .v2_news_card p{margin-top:10px;color:var(--v-muted);font-size:14.5px;line-height:1.65;}
@media(max-width:1080px){#ldw_app .v2_news{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:600px){#ldw_app .v2_news{grid-template-columns:1fr;}}

/* Finale */
#ldw_app .v2_finale{position:relative;width:var(--v-wide);margin:0 auto;border-radius:32px;overflow:hidden;isolation:isolate;border:1px solid var(--v-line-2);padding:clamp(64px,9vw,128px) 24px;text-align:center;box-shadow:0 40px 120px rgba(0,0,0,.5);}
#ldw_app .v2_finale_art{position:absolute;inset:0;z-index:-2;}
#ldw_app .v2_finale_art img{width:100%;height:100%;object-fit:cover;object-position:50% 40%;filter:saturate(1.1) blur(2px);transform:scale(1.06);}
#ldw_app .v2_finale::after{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(70% 90% at 50% 50%,rgba(5,6,22,.62),rgba(5,6,22,.92) 75%),linear-gradient(180deg,rgba(36,19,90,.35),rgba(5,6,22,.6));}
#ldw_app .v2_finale .v2_h2{font-size:clamp(32px,5vw,64px);}
#ldw_app .v2_finale .v2_lead{max-width:560px;margin-left:auto;margin-right:auto;}
#ldw_app .v2_finale_actions{margin-top:34px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;}
@media(max-width:600px){#ldw_app .v2_finale{border-radius:24px;width:calc(100% - 24px);}#ldw_app .v2_finale_actions{flex-direction:column;align-items:stretch;max-width:340px;margin-left:auto;margin-right:auto;}}

/* Footer */
#ldw_app .ldw_footer{position:relative;margin-top:0;padding:56px 0 36px;border-top:1px solid var(--v-line);background:linear-gradient(180deg,rgba(5,6,22,0),rgba(3,3,14,.9));}
#ldw_app .v2_footer_grid{display:grid;grid-template-columns:1.4fr repeat(3,minmax(0,1fr));gap:32px;}
#ldw_app .v2_footer_brand p{margin-top:14px;max-width:300px;color:var(--v-soft);font-size:14px;line-height:1.6;}
#ldw_app .v2_footer_col h3{font-size:11.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--v-gold);}
#ldw_app .v2_footer_col ul{margin-top:14px;display:grid;gap:4px;}
#ldw_app .v2_footer_col a,#ldw_app .v2_footer_col button{display:inline-block;padding:5px 0;border:0;background:none;color:var(--v-muted);font:400 14.5px/1.5 var(--v-sans);text-decoration:none;cursor:pointer;transition:color .2s ease;}
#ldw_app .v2_footer_col a:hover,#ldw_app .v2_footer_col button:hover{color:#fff;}
#ldw_app .v2_footer_bottom{margin-top:44px;padding-top:22px;border-top:1px solid var(--v-line);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;color:rgba(232,228,255,.42);font-size:12.5px;}
@media(max-width:880px){#ldw_app .v2_footer_grid{grid-template-columns:repeat(3,minmax(0,1fr));}#ldw_app .v2_footer_brand{grid-column:1/-1;}}
@media(max-width:520px){#ldw_app .v2_footer_grid{grid-template-columns:repeat(2,minmax(0,1fr));}#ldw_app .v2_footer_bottom{flex-direction:column;}}

/* Entrance motion — opt-in via .v2-motion (added by JS only when motion is
   allowed and IntersectionObserver exists), so content is never hidden if
   the script's motion layer fails. */
@keyframes v2Settle{from{transform:scale(1.08);}to{transform:scale(1);}}
@keyframes v2Rise{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:none;}}
#ldw_app.v2-motion .v2_hero_art img{animation:v2Settle 2.6s var(--v-ease) both;}
#ldw_app.v2-motion .v2_hero_content > *{animation:v2Rise .9s var(--v-ease) both;}
#ldw_app.v2-motion .v2_hero_content > *:nth-child(2){animation-delay:.08s;}
#ldw_app.v2-motion .v2_hero_content > *:nth-child(3){animation-delay:.16s;}
#ldw_app.v2-motion .v2_hero_content > *:nth-child(4){animation-delay:.24s;}
#ldw_app.v2-motion .v2_hero_content > *:nth-child(n+5){animation-delay:.32s;}
#ldw_app.v2-motion .v2_reveal{opacity:0;transform:translateY(22px);transition:opacity .9s var(--v-ease),transform .9s var(--v-ease);}
#ldw_app.v2-motion .v2_reveal.is-in{opacity:1;transform:none;}
#ldw_app.v2-motion .v2_stagger > *{opacity:0;transform:translateY(22px);transition:opacity .8s var(--v-ease),transform .8s var(--v-ease);}
#ldw_app.v2-motion .v2_stagger.is-in > *{opacity:1;transform:none;}
#ldw_app.v2-motion .v2_stagger.is-in > *:nth-child(2){transition-delay:.08s;}
#ldw_app.v2-motion .v2_stagger.is-in > *:nth-child(3){transition-delay:.16s;}
#ldw_app.v2-motion .v2_stagger.is-in > *:nth-child(4){transition-delay:.24s;}
#ldw_app.v2-motion .v2_stagger.is-in > *:nth-child(5){transition-delay:.32s;}
#ldw_app.v2-motion .v2_stagger.is-in > *:nth-child(6){transition-delay:.40s;}
@media(prefers-reduced-motion:reduce){
  #ldw_app *,#ldw_app *::before,#ldw_app *::after{animation:none!important;transition:none!important;}
  #ldw_app .v2_reveal,#ldw_app .v2_stagger > *{opacity:1!important;transform:none!important;}
}

/* ---- Shared auth modal + support widget (from ludo77.js, unchanged) ---- */
.ldw_btn,.ldw_linkbtn{border:1px solid rgba(225,158,255,.16);background:rgba(255,255,255,.03);color:var(--ld-text);border-radius:999px;min-height:36px;padding:0 14px;font-weight:800;letter-spacing:.03em;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:transform .15s ease,border-color .15s ease,background .15s ease,filter .15s ease;white-space:nowrap;}
.ldw_btn:hover,.ldw_linkbtn:hover{transform:translateY(-1px);border-color:rgba(245,205,255,.32);background:rgba(255,255,255,.07);}
.ldw_btn:focus-visible,.ldw_linkbtn:focus-visible{outline:2px solid rgba(255,255,255,.75);outline-offset:2px;}
.ldw_btn_primary{border-color:rgba(255,255,255,.22);background:linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.80) 55%,rgba(42,214,255,.80));box-shadow:0 10px 26px rgba(160,70,255,.22);font-weight:900;}
.ldw_btn_primary:hover{filter:brightness(1.08);}
.ldw_btn_ghost_sm{min-height:34px;padding:0 12px;font-size:11.5px;background:transparent;}
/* Auth modal (functionality untouched — visual refresh only) */
.ldw_auth_modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:18px;overflow:hidden;background:radial-gradient(900px 560px at 18% 8%,rgba(255,85,223,.14),transparent 58%),radial-gradient(760px 560px at 84% 14%,rgba(155,92,255,.18),transparent 58%),rgba(2,3,10,.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
.ldw_auth_modal.open{display:flex;}
.ldw_auth_ambient{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;border-radius:30px;}
.ldw_auth_mote{position:absolute;bottom:-10px;border-radius:50%;opacity:0;animation-name:ldwAuthFloat;animation-timing-function:ease-in;animation-iteration-count:infinite;filter:blur(.2px);}
@keyframes ldwAuthFloat{0%{transform:translateY(0) scale(.6);opacity:0;}12%{opacity:.9;}88%{opacity:.22;}100%{transform:translateY(-360px) scale(1.15);opacity:0;}}
.ldw_modal_box{position:relative;width:min(420px,calc(100vw - 28px));max-height:min(92vh,780px);overflow-y:auto;border:1px solid rgba(225,158,255,.24);border-radius:var(--ldw-radius-lg);background:linear-gradient(165deg,rgba(24,17,34,.92),rgba(7,7,15,.96));box-shadow:0 30px 90px rgba(0,0,0,.58);scrollbar-width:thin;scrollbar-color:rgba(225,158,255,.4) transparent;}
.ldw_modal_head{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:24px 24px 4px;}
.ldw_modal_head h3{margin:0;font-size:clamp(19px,2.6vw,24px);line-height:1.1;letter-spacing:-.02em;font-weight:900;background:linear-gradient(92deg,#fff,#b9eaff 24%,#a56cff 52%,#ff67e1 82%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ldw_modal_head .ldw_auth_kicker{margin-bottom:9px;font-size:10.5px;line-height:1;text-transform:uppercase;letter-spacing:.18em;color:#ff9ecb;font-weight:900;}
.ldw_modal_head .ldw_auth_sub{margin-top:9px;max-width:600px;color:rgba(255,247,255,.72);font-size:13px;line-height:1.5;font-weight:500;}
.ldw_modal_body{position:relative;z-index:1;padding:8px 24px 24px;display:grid;gap:11px;}
.ldw_auth_tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.05);}
.ldw_auth_tab{border:0;border-radius:12px;min-height:40px;background:transparent;color:rgba(255,247,255,.62);font:inherit;font-size:11.5px;font-weight:900;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:filter .15s ease,color .15s ease,background .15s ease;}
.ldw_auth_tab.active{color:#fff;background:linear-gradient(90deg,rgba(124,60,255,.95),rgba(255,62,222,.85) 55%,rgba(42,214,255,.85));}
.ldw_auth_tab:hover{filter:brightness(1.06);}
.ldw_input{width:100%;min-height:46px;border:1px solid rgba(225,158,255,.20);border-radius:16px;background:rgba(255,255,255,.08);color:var(--ld-text);padding:0 15px;outline:none;font:inherit;font-size:14px;font-weight:700;transition:border-color .15s ease,box-shadow .15s ease;}
.ldw_input:focus-visible{border-color:rgba(255,107,227,.6);box-shadow:0 0 0 4px rgba(155,92,255,.16);}
.ldw_auth_actions{display:grid;gap:9px;}
.ldw_auth_primary{min-height:46px!important;border-radius:999px!important;font-size:13.5px!important;font-weight:900!important;letter-spacing:0!important;text-transform:none!important;background:linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.85) 55%,rgba(42,214,255,.85))!important;box-shadow:0 10px 26px rgba(160,70,255,.28)!important;color:#fff!important;border-color:rgba(255,255,255,.28)!important;}
.ldw_auth_primary:hover{filter:brightness(1.08);}
.ldw_auth_google{min-height:46px!important;border-radius:999px!important;background:#fff!important;color:#3c4043!important;border-color:#dadce0!important;text-transform:none!important;font-size:13.5px!important;font-weight:700!important;letter-spacing:0!important;gap:10px!important;}
.ldw_auth_google_icon{width:17px;height:17px;flex-shrink:0;}
.ldw_auth_apple{min-height:46px!important;border-radius:999px!important;background:#000!important;color:#fff!important;border-color:rgba(255,255,255,.14)!important;text-transform:none!important;font-size:13.5px!important;font-weight:700!important;letter-spacing:0!important;gap:10px!important;}
.ldw_auth_apple_icon{width:13px;height:16px;flex-shrink:0;}
.ldw_auth_ghost{min-height:46px!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;text-transform:none!important;font-size:13.5px!important;font-weight:800!important;letter-spacing:0!important;}
.ldw_danger_zone{display:grid;gap:6px;margin-top:4px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);}
.ldw_auth_danger{min-height:46px!important;border-radius:999px!important;background:rgba(255,107,107,.08)!important;border-color:rgba(255,138,138,.38)!important;color:#ffb4b4!important;text-transform:none!important;font-size:13.5px!important;font-weight:800!important;letter-spacing:0!important;}
.ldw_auth_danger:hover{background:rgba(255,107,107,.18)!important;border-color:rgba(255,138,138,.6)!important;color:#ffc7c7!important;}
.ldw_auth_danger:focus-visible{outline:2px solid #ff9e9e;outline-offset:2px;}
.ldw_danger_zone_text{margin:0;color:rgba(255,196,196,.68);font-size:11.5px;line-height:1.4;font-weight:600;text-align:center;}
.ldw_auth_link{border:0!important;background:transparent!important;min-height:auto!important;padding:4px 6px!important;color:#8be9ff!important;text-transform:none!important;font-size:12.5px!important;letter-spacing:.01em!important;font-weight:900!important;box-shadow:none!important;justify-self:center;}
.ldw_auth_link:hover{text-decoration:underline;transform:none!important;filter:none!important;}
.ldw_auth_divider{display:flex;align-items:center;gap:10px;margin:5px 0 1px;color:rgba(255,255,255,.4);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;}
.ldw_auth_divider:before,.ldw_auth_divider:after{content:"";flex:1;height:1px;background:rgba(255,255,255,.13);}
.ldw_auth_resend{display:none;}
.ldw_status{min-height:20px;color:rgba(255,247,255,.74);font-size:12.5px;line-height:1.45;text-align:center;font-weight:650;}
.ldw_auth_hidden{display:none!important;}
@media(prefers-reduced-motion:reduce){.ldw_auth_mote{animation:none;display:none;}}
@media(max-width:560px){.ldw_auth_modal{align-items:flex-start;padding:10px;}.ldw_modal_box{width:100%;border-radius:22px;margin:8px 0;max-height:96vh;}.ldw_modal_head{padding:20px 18px 4px;}.ldw_modal_body{padding:7px 18px 18px;}}

/* Support widget */
/* pointer-events:none on the container is load-bearing, not decorative:
   .ldw_support_panel stays display:block while "closed" (only opacity:0 +
   its own pointer-events:none), so it's still in flow and inflates this
   flex column's box to ~350x650px — nearly the full viewport on phones.
   Without this, that invisible box silently swallows every tap in that
   band (hero CTA, footer links, anything scrolled under it), which is
   exactly the mobile dead-zone regression this must never reintroduce.
   Re-enable pointer-events explicitly on whatever should stay tappable
   (just the toggle button below); .ldw_support.open already re-enables
   the panel itself once it's actually visible. */
.ldw_support{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:60;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:none;}
.ldw_support_toggle{position:relative;width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:linear-gradient(135deg,rgba(124,60,255,.98),rgba(255,62,222,.82) 55%,rgba(42,214,255,.82));color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 14px 34px rgba(120,50,255,.30);transition:transform .18s ease,box-shadow .18s ease;flex-shrink:0;pointer-events:auto;}
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
/* ---- V2 refinements for the shared modal/widget (visual only) ---- */
#ldw_app .ldw_modal_head h3{font-family:var(--v-display);font-weight:700;letter-spacing:.01em;background:linear-gradient(92deg,#fff,#d7c6ff 45%,#f4c76b);-webkit-background-clip:text;background-clip:text;color:transparent;}
#ldw_app .ldw_modal_head .ldw_auth_kicker{color:var(--v-gold);}
#ldw_app .ldw_modal_box{border-color:rgba(244,199,107,.26);background:linear-gradient(165deg,rgba(18,16,52,.96),rgba(6,7,22,.98));}
#ldw_app .ldw_support_panel h3{font-family:var(--v-display);font-weight:700;letter-spacing:.02em;}
`;

  function buildHTML() {
    const C = CONTENT;
    const W = esc(CFG.WORLD_URL);

    const locations = C.locations.map((l, i) => (
      '<li class="v2_loc" style="--accent:' + esc(l.accent) + ';--glow:' + esc(l.glow) + '">' +
        '<div class="v2_loc_art">' +
          (l.image
            ? '<img src="' + esc(l.image) + '" alt="' + esc(l.imageAlt) + '" loading="lazy" decoding="async">'
            : '<svg class="v2_sigil" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (SIGILS[l.id] || "") + '</svg>') +
          '<span class="v2_loc_num" aria-hidden="true">' + String(i + 1).padStart(2, "0") + '</span>' +
        '</div>' +
        '<div class="v2_loc_body">' +
          '<div class="v2_loc_tag">' + esc(l.tag) + '</div>' +
          '<h3>' + esc(l.name) + '</h3>' +
          '<p>' + esc(l.text) + '</p>' +
        '</div>' +
      '</li>'
    )).join("");

    const frames = C.squad.map((s, i) => (
      '<div class="v2_portrait_frame' + (i === 0 ? ' is-active' : '') + '" data-squad-frame="' + esc(s.id) + '"' + (i === 0 ? '' : ' aria-hidden="true"') + '>' +
        keyArtPicture({ alt: i === 0 ? s.alt : "", style: cropStyle(s.crop) }) +
      '</div>'
    )).join("");

    const tabs = C.squad.map((s, i) => (
      '<button class="v2_tab" type="button" role="tab" id="ldv2_tab_' + esc(s.id) + '" aria-controls="ldv2_panel_' + esc(s.id) + '" aria-selected="' + (i === 0 ? "true" : "false") + '" tabindex="' + (i === 0 ? "0" : "-1") + '" data-squad="' + esc(s.id) + '" style="--c:' + esc(s.color) + '">' +
        '<b>' + esc(s.name) + '</b><span>' + esc(s.phrase) + '</span>' +
      '</button>'
    )).join("");

    const panels = C.squad.map((s, i) => (
      '<div class="v2_squad_panel" role="tabpanel" id="ldv2_panel_' + esc(s.id) + '" aria-labelledby="ldv2_tab_' + esc(s.id) + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<div class="v2_phrase" style="color:' + esc(s.color) + '">&ldquo;' + esc(s.phrase) + '&rdquo;</div>' +
        '<p>' + esc(s.text) + '</p>' +
      '</div>'
    )).join("");

    const pillars = C.pillars.map((p) => (
      '<li class="v2_pillar">' +
        '<span class="v2_pillar_icon">' + iconSvg(p.icon) + '</span>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.text) + '</p>' +
      '</li>'
    )).join("");

    const news = C.news.map((n) => {
      const dateLabel = formatNewsDate(n.date);
      return '<li><article class="v2_news_card" data-status="' + esc(n.status) + '">' +
        '<div class="v2_news_meta"><span class="v2_status">' + esc(n.label) + '</span>' +
          (dateLabel ? '<time datetime="' + esc(n.date) + '">' + esc(dateLabel) + '</time>' : '') +
        '</div>' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<p>' + esc(n.text) + '</p>' +
      '</article></li>';
    }).join("");

    const facts = C.prologue.facts.map((f) => '<li class="v2_fact"><b>' + esc(f.title) + '</b><span>' + esc(f.text) + '</span></li>').join("");

    const quote = esc(C.prologue.quote).replace("Just weird, cozy, iconic progression.", "<em>Just weird, cozy, iconic progression.</em>");

    return `
<a class="v2_skip" href="#ldv2_main">Skip to content</a>
<div class="v2_atmos" aria-hidden="true"></div>

<header class="ldw_header" id="ldw_header">
  <div class="v2_header_inner">
    <a class="v2_brand" href="#ldv2_top" aria-label="LifeDecode World — back to top">
      <span class="v2_brand_main">LIFEDECODE</span>
      <span class="v2_brand_sub">WORLD</span>
    </a>
    <nav class="v2_nav" aria-label="Main navigation">
      <a href="#ldv2_world">The World</a>
      <a href="#ldv2_squad">Silly Squad</a>
      <a href="#ldv2_spirit">Your Story</a>
      <a href="#ldv2_news">Updates</a>
    </nav>
    <div class="v2_header_actions">
      <button id="ldw_login_btn" type="button">Login</button>
      <a class="v2_btn v2_btn_primary v2_btn_sm v2_header_play" href="${W}">Play Now</a>
    </div>
  </div>
</header>

<div class="v2_page">
  <main id="ldv2_main" tabindex="-1">
    <section class="v2_hero" id="ldv2_top" aria-labelledby="ldv2_title">
      <div class="v2_hero_art">${keyArtPicture({ eager: true, alt: "LifeDecode World key art: the Silly Squad — a blue cowboy, a red ninja, a green pirate and a purple princess — glowing in neon against a dark, starry sky." })}</div>
      <div class="v2_hero_shade" aria-hidden="true"></div>
      <div class="v2_hero_content">
        <p class="v2_eyebrow"><span>${esc(C.hero.eyebrow[0])}<span class="v2_eyebrow_more"> &middot; ${esc(C.hero.eyebrow[1])}</span></span></p>
        <h1 class="v2_hero_title" id="ldv2_title">LifeDecode <span>World</span></h1>
        <p class="v2_hero_tagline">${esc(C.hero.tagline)}</p>
        <p class="v2_hero_lede">${esc(C.hero.lede)}</p>
        <div class="v2_hero_actions" id="ldw_hero_actions">
          <a class="v2_btn v2_btn_primary v2_btn_lg" id="ldw_hero_primary_cta" href="${W}">Play Now</a>
          <a class="v2_btn v2_btn_ghost v2_btn_lg" href="#ldv2_world">Explore the World</a>
        </div>
        <span class="ldw_app_badge ldw_auth_hidden" id="ldw_ios_badge" role="status">iPhone app &mdash; coming soon</span>
        <p class="v2_hero_micro">${esc(C.hero.micro)}</p>
      </div>
      <a class="v2_scroll" href="#ldv2_prologue" aria-label="Scroll to learn more">Discover<i aria-hidden="true"></i></a>
    </section>

    <section class="v2_section" id="ldv2_prologue" aria-labelledby="ldv2_prologue_title">
      <div class="v2_container v2_prologue">
        <div class="v2_reveal">
          <div class="v2_kicker">${esc(C.prologue.kicker)}</div>
          <h2 class="v2_quote" id="ldv2_prologue_title">${quote}</h2>
        </div>
        <div class="v2_reveal">
          <p class="v2_prologue_body">${esc(C.prologue.body)}</p>
          <ul class="v2_facts">${facts}</ul>
        </div>
      </div>
    </section>

    <div class="v2_rule" aria-hidden="true"><i></i></div>

    <section class="v2_section" id="ldv2_world" aria-labelledby="ldv2_world_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">Explore LifeDecode World</div>
          <h2 class="v2_h2" id="ldv2_world_title">Four rooms. Infinite chaos.</h2>
          <p class="v2_lead">Every room has its own mood, its own regulars and its own kind of trouble. Wander between them, see who's around, and find your favourite corner.</p>
        </div>
        <ul class="v2_locations v2_stagger" tabindex="0" aria-label="Rooms in LifeDecode World">${locations}</ul>
        <p class="v2_note">${esc(C.locationsNote)}</p>
      </div>
    </section>

    <section class="v2_section v2_squad_wrap" id="ldv2_squad" aria-labelledby="ldv2_squad_title">
      <div class="v2_container v2_squad">
        <figure class="v2_portrait v2_reveal">
          ${frames}
          <figcaption class="v2_portrait_caption"><span>Official key art</span><span id="ldv2_squad_name">${esc(C.squad[0].name)}</span></figcaption>
        </figure>
        <div class="v2_squad_copy v2_reveal">
          <div class="v2_kicker">The usual suspects</div>
          <h2 class="v2_h2" id="ldv2_squad_title">Meet the Silly Squad</h2>
          <p class="v2_lead">Cowboys, ninjas, pirates, princesses — the world's residents have opinions, and they are not shy about sharing them.</p>
          <div class="v2_tabs" role="tablist" aria-label="Silly Squad characters">${tabs}</div>
          ${panels}
        </div>
      </div>
    </section>

    <section class="v2_section" id="ldv2_spirit" aria-labelledby="ldv2_spirit_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">Discover your life</div>
          <h2 class="v2_h2" id="ldv2_spirit_title">Your spirit. Your story.</h2>
          <p class="v2_lead">Shape who you are in the world, level up at your own pace, and share the chaos with everyone else who showed up today.</p>
        </div>
        <ul class="v2_pillars v2_stagger">${pillars}</ul>
      </div>
    </section>

    <section class="v2_section" id="ldv2_news" aria-labelledby="ldv2_news_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">News &amp; updates</div>
          <h2 class="v2_h2" id="ldv2_news_title">What's live. What's next.</h2>
          <p class="v2_lead">LifeDecode World keeps growing. Here's an honest look at what you can play today and what's still being built.</p>
        </div>
        <ul class="v2_news v2_stagger">${news}</ul>
      </div>
    </section>

    <section class="v2_section" aria-labelledby="ldv2_finale_title">
      <div class="v2_finale v2_reveal">
        <div class="v2_finale_art" aria-hidden="true">${keyArtPicture({ alt: "" })}</div>
        <div class="v2_kicker">${esc(C.finale.kicker)}</div>
        <h2 class="v2_h2" id="ldv2_finale_title">${esc(C.finale.title)}</h2>
        <p class="v2_lead">${esc(C.finale.text)}</p>
        <div class="v2_finale_actions">
          <a class="v2_btn v2_btn_primary v2_btn_lg" href="${W}">${PLAY_ARROW}Play Now</a>
          <button class="v2_btn v2_btn_ghost v2_btn_lg" type="button" data-ldv2-login>Log in or create account</button>
        </div>
      </div>
    </section>
  </main>

  <footer class="ldw_footer" aria-label="Site footer">
    <div class="v2_container">
      <div class="v2_footer_grid">
        <div class="v2_footer_brand">
          <a class="v2_brand" href="#ldv2_top" aria-label="LifeDecode World — back to top"><span class="v2_brand_main">LIFEDECODE</span><span class="v2_brand_sub">WORLD</span></a>
          <p>${esc(C.footerTag)}</p>
        </div>
        <div class="v2_footer_col">
          <h3>Play</h3>
          <ul>
            <li><a href="${W}">Play Now</a></li>
            <li><button type="button" data-ldv2-login>Login / Account</button></li>
          </ul>
        </div>
        <div class="v2_footer_col">
          <h3>Explore</h3>
          <ul>
            <li><a href="#ldv2_world">The World</a></li>
            <li><a href="#ldv2_squad">Silly Squad</a></li>
            <li><a href="#ldv2_news">Updates</a></li>
          </ul>
        </div>
        <div class="v2_footer_col">
          <h3>Help &amp; legal</h3>
          <ul>
            <li><a href="${CFG.POLICY_URL}">Privacy Policy</a></li>
            <li><a href="${CFG.TERMS_URL}">Terms of Service</a></li>
            <li><a href="${CFG.SUPPORT_URL}">Support</a></li>
            <li><a href="mailto:${CFG.SUPPORT_EMAIL}">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="v2_footer_bottom">
        <span>&copy; 2026 LifeDecode World</span>
        <span>Privacy Policy and Terms are always available, before and after login.</span>
      </div>
    </div>
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
      <input class="ldw_input" id="ldw_email" aria-label="Email" type="email" autocomplete="email" placeholder="Email">
      <input class="ldw_input" id="ldw_password" aria-label="Password" type="password" autocomplete="current-password" placeholder="Password">
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
        <div class="ldw_danger_zone" id="ldw_delete_account_zone" style="display:none">
          <a class="ldw_btn ldw_auth_danger" id="ldw_delete_account" href="${CFG.DELETE_ACCOUNT_URL}" aria-describedby="ldw_delete_account_desc">Delete account</a>
          <p class="ldw_danger_zone_text" id="ldw_delete_account_desc">Permanently delete your LifeDecode World account and associated data.</p>
        </div>
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
</div>`;
  }

  const HTML = buildHTML();

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  function injectFonts() {
    if (!document.getElementById("ldw_fonts")) {
      ["https://fonts.googleapis.com", "https://fonts.gstatic.com"].forEach((href) => {
        const pre = document.createElement("link");
        pre.rel = "preconnect";
        pre.href = href;
        if (href.includes("gstatic")) pre.crossOrigin = "anonymous";
        document.head.appendChild(pre);
      });
      const link = document.createElement("link");
      link.id = "ldw_fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap";
      document.head.appendChild(link);
    }
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
    const colors = ["#ff6fe0", "#ff9ecb", "#b99cff", "#9ee9ff"];
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
    const deleteAccountZone = document.getElementById("ldw_delete_account_zone");
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
      if (deleteAccountZone) deleteAccountZone.style.display = "grid";
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
      if (deleteAccountZone) deleteAccountZone.style.display = "none";
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

    // Daily Check-In is no longer a homepage marketing CTA (removed from
    // header/hero/landing by design — see redesign notes), so its UI and
    // the bind() wiring that pointed at that UI are gone too. The
    // underlying system (callDailyCheckinServer, awardDailyCheckinXP,
    // requestDailyCheckinAI, getDailyCheckinCooldownInfo, etc.) is left
    // fully intact below, unused-for-now rather than deleted, in case a
    // future surface inside the product wants it again.

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

  // Reads ENTRY_CONFIG for Platform.current and paints the hero CTA once.
  // The only thing that ever varies today is button label + whether the
  // iOS "coming soon" tag shows — both stores are appAvailable:false, so
  // there's nothing to link to yet on any platform (see ENTRY_CONFIG's
  // comment). When a real store URL lands, this is the only function that
  // needs a new branch; nothing else in the file should know what iOS or
  // Android even are.
  function applyPlatformEntry() {
    const entry = ENTRY_CONFIG[Platform.current] || ENTRY_CONFIG.desktop;
    const primary = document.getElementById("ldw_hero_primary_cta");
    if (primary) {
      primary.textContent = Platform.current === "desktop" ? "Play Now" : "Play in Browser";
      primary.href = entry.webUrl;
    }
    const iosBadge = document.getElementById("ldw_ios_badge");
    if (iosBadge && Platform.current === "ios" && entry.comingSoon && !entry.appAvailable) {
      iosBadge.classList.remove("ldw_auth_hidden");
    }
  }

  function bindHeaderScrollState() {
    const header = document.getElementById("ldw_header");
    if (!header) return;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // ---------------------------------------------------------------------
  // V2 presentation layer. Everything below is additive: none of it
  // changes auth, session, Supabase, support or check-in behaviour.
  // ---------------------------------------------------------------------

  // If the optimized assets/v2 art can't load (e.g. the script was served
  // from a ref that predates them), fall back to the original wallpaper
  // that ludo77.js already relies on.
  function bindArtFallback() {
    const fallbacks = [CFG.ICONIC_URL].concat(CFG.ICONIC_FALLBACKS || []);
    document.querySelectorAll("#ldw_app img[data-ldv2-art]").forEach((img) => {
      let attempt = 0;
      function fail() {
        if (attempt >= fallbacks.length) return;
        const picture = img.parentElement;
        if (picture && picture.tagName === "PICTURE") {
          picture.querySelectorAll("source").forEach((s) => s.remove());
        }
        img.removeAttribute("srcset");
        img.src = fallbacks[attempt++];
      }
      img.addEventListener("error", fail);
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
    });
  }

  function bindSquad() {
    const tabs = Array.from(document.querySelectorAll("#ldw_app .v2_tab[data-squad]"));
    const wrap = document.getElementById("ldv2_squad");
    const nameEl = document.getElementById("ldv2_squad_name");
    if (!tabs.length) return;

    function select(tab, focus) {
      const id = tab.getAttribute("data-squad");
      const data = CONTENT.squad.find((s) => s.id === id);
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      document.querySelectorAll("#ldw_app [data-squad-frame]").forEach((frame) => {
        const on = frame.getAttribute("data-squad-frame") === id;
        frame.classList.toggle("is-active", on);
        const img = frame.querySelector("img");
        if (on) frame.removeAttribute("aria-hidden"); else frame.setAttribute("aria-hidden", "true");
        if (img) img.alt = on && data ? data.alt : "";
      });
      if (nameEl && data) nameEl.textContent = data.name;
      if (wrap && data) wrap.style.setProperty("--squad-glow", data.color + "2e");
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  // Secondary login triggers (final CTA, footer) reuse the one real Login
  // button so all auth-modal logic stays in bind(). Escape closes the modal
  // and focus returns to whatever opened it.
  function bindAuthModalExtras() {
    const loginBtn = document.getElementById("ldw_login_btn");
    const modal = document.getElementById("ldw_auth_modal");
    const closeBtn = document.getElementById("ldw_close_login");
    let opener = null;
    document.querySelectorAll("#ldw_app [data-ldv2-login]").forEach((el) => {
      el.addEventListener("click", () => {
        opener = el;
        if (loginBtn) loginBtn.click();
      });
    });
    if (loginBtn) loginBtn.addEventListener("click", () => { if (!opener) opener = loginBtn; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("open") && closeBtn) closeBtn.click();
    });
    if (modal && window.MutationObserver) {
      new MutationObserver(() => {
        if (!modal.classList.contains("open") && opener) {
          const el = opener;
          opener = null;
          try { el.focus({ preventScroll: true }); } catch (err) {}
        }
      }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function bindMotion() {
    const app = document.getElementById("ldw_app");
    if (!app) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    const targets = Array.from(app.querySelectorAll(".v2_reveal, .v2_stagger"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
    app.classList.add("v2-motion");
    // Anything already on screen at boot (deep links, tall viewports) is
    // revealed on the next frame instead of waiting for a scroll.
    requestAnimationFrame(() => {
      const vh = window.innerHeight || 800;
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) el.classList.add("is-in");
      });
    });
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
      applyPlatformEntry();
      bind();
      bindSupportWidget();
      bindHeaderScrollState();
      bindArtFallback();
      bindSquad();
      bindAuthModalExtras();
      bindMotion();
      console.log("[LD] World landing loaded:", CFG.VERSION);
    } catch (err) {
      console.error("[LD] World landing failed:", err);
      document.body.innerHTML = '<div style="min-height:100vh;background:#03020a;color:#fff;padding:24px;font-family:Arial,sans-serif"><h1>LifeDecode World</h1><p>Landing failed to load. Check console.</p></div>';
    }
  });
})();

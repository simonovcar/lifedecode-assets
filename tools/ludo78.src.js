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
/*@@CSS_LEGACY@@*/
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
/*@@HTML_MODALS@@*/`;
  }

  const HTML = buildHTML();

/*@@CORE_READY@@*/

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

/*@@CORE_RENDER@@*/

/*@@CORE_SYSTEMS@@*/

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

/*@@CORE_HEADER@@*/

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

/*@@CORE_ERROR@@*/

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

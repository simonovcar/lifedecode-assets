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
  // Accuracy rule: only advertise what exists. Every system below was
  // confirmed in lifedecode-game source (main @ ecef049, read-only audit,
  // see docs/website-v2/GAME_AUDIT_AND_RECOMMENDATIONS.md) — `src` names
  // the file it was checked against. Source code is not proof of what is
  // deployed: tick each item off on world.lifedecode.app before going live
  // (docs/website-v2/LIVE_VERIFICATION.md). Hidden or unfinished systems
  // (Cards, Cinema, Movie Creator, Organizations) are deliberately absent.
  // ---------------------------------------------------------------------
  const ART = function (name) { return ASSET_BASE + "assets/v2/world/" + name; };

/*@@SKIN_ROSTER@@*/

  const CONTENT = {
    hero: {
      eyebrow: ["Free to play", "A social world in your browser"],
      tagline: "Your life. Your story. Your world.",
      lede: "Explore twenty hand-painted places, meet ridiculous locals and real players, and level up your spirit just by showing up.",
      micro: "Free to play · No download · Optional in-game purchases"
    },
    prologue: {
      kicker: "Why this world exists",
      quote: "Not soulless. Not a lecture. Just a weird, cozy world that grows with you.",
      body: "LifeDecode World is a small, strange corner of the internet where your daily choices actually do something. Rooms to explore, NPCs with opinions, other players to run into — and a spirit that slowly levels up because you showed up.",
      facts: [
        { title: "Free to play", text: "Jump in from any browser. Optional extras can be unlocked with LifeCoins." },
        { title: "Multiplayer", text: "Shared rooms, chat, emotes and friends." },
        { title: "Grows with you", text: "XP, levels, belts and achievements saved to your account." }
      ]
    },
    // Location art = the real scene backgrounds from public/content/maps.js.
    // No players or UI are drawn on them — they are not screenshots.
    world: {
      kicker: "Explore LifeDecode World",
      title: "Twenty places. One very strange world.",
      lead: "Every place has its own mood, its own regulars and its own kind of trouble. Some open straight away — others you'll have to earn.",
      featured: [
        { id: "plaza", name: "Plaza", tag: "The heart of the world", text: "Every road starts here. Brew Haven, Soulcore, Astra's Vault and the path to the Mind Zone are all a short walk away." },
        { id: "brew-haven", name: "Brew Haven", tag: "Fireside café", text: "Drunk Dave holds court by the fire. Brew coffee at the machine to earn Beans — he'll drink it either way." },
        { id: "soulcore", name: "Soulcore", tag: "Starlit sanctum", text: "Nyas waits under the stars, happy to turn your Beans into Soul Dust." },
        { id: "mind-zone", name: "Mind Zone", tag: "Unlocks as you progress", text: "A sunset forest path that opens up as you progress — and it leads somewhere deeper." },
        { id: "path-of-ascension", name: "Path of Ascension", tag: "The Dojo", text: "Master Kaien's training hall. Take trials, fight Shadow Duels and climb the belts." },
        { id: "shadow-arena", name: "Shadow Arena", tag: "Unlocks as you progress", text: "A broken plain beneath a black sun, where The Doubter is waiting for you." },
        { id: "astravault", name: "AstraVault", tag: "Style & cosmetics", text: "Astra's vault of cosmetics. She will size you up in about half a second." },
        { id: "pet-shop", name: "Pet Shop", tag: "Adopt a companion", text: "Sixteen pets, from Rare to Ancient, waiting to follow you around the world." },
        { id: "wonder-of-homes", name: "Wonder of Homes", tag: "The housing district", text: "Mushroom Home, Wizzard Tower and Cloud Nest — pick one and make it yours." },
        { id: "main-street-pizza", name: "Main Street Pizza", tag: "Player-owned business", text: "Order a slice to keep Hunger at bay — or buy the whole restaurant and run it." },
        { id: "bloom-gate", name: "Bloom Gate", tag: "On the edge of the world", text: "A blossom-lined portal under falling petals. Step through and see." },
        { id: "chill-zone", name: "Chill Zone", tag: "Fairy lights & sofas", text: "A fireplace, string lights and somewhere soft to sit. Exactly what it sounds like." }
      ],
      more: ["Inside the Mind Zone", "Ascension Peaks", "Wonder House", "LifeMart", "LifeFactory", "Cloud Nest", "Mushroom Home", "Wizzard Tower"],
      note: "Location artwork from the game. Some places unlock as you progress."
    },
    // Full character skins — the NEW skin system: one complete character
    // sprite replacement per skin, no hat/body overlays. Names, rarity, waves
    // and PNG mappings come from tools/skin-catalog.json (the verified
    // development catalog); tools/build-skin-assets.py turns the owner's
    // original PNGs into assets/v2/skins/ + SKIN_ROSTER above. Prices are
    // deliberately not shown. All 46 skins are enabled in the development
    // build; which are purchasable on the live game is NOT verified (store
    // overrides can change it), so nothing here says "available now". The
    // Base Blue / Base Rose starters appear only once their real artwork
    // (spirit_base_blue.png / spirit_base_rose.png) is built — never the older
    // adultblue3 / adultpink3 sprites. The old Cowboy/Ninja/Pirate/Princess
    // key art is not a skin (hero only).
    skins: {
      kicker: "Full character skins",
      title: "Choose your form",
      lead: "A first look at the new full-character skin system from our development build. Each skin replaces your whole spirit with one complete new form — no separate pieces, no mixing and matching. In the new system every spirit begins as Base Blue or Base Rose, and the collection only gets stranger from there.",
      status: "In development · Not live yet",
      roster: SKIN_ROSTER,
      note: "Original artwork from the development build's skin catalog, shown with its catalog rarity. These skins aren't in the live game yet — we'll announce their release in News & updates."
    },
    adventures: {
      kicker: "Adventures",
      title: "Train hard. Face yourself. Challenge anyone.",
      // Belt names + colours from LD_DOJO_ASCENSION_CONFIG.belts (config.js).
      belts: [
        { name: "White", color: "#f4f4f8" }, { name: "Yellow", color: "#ffe066" }, { name: "Orange", color: "#ffad4d" },
        { name: "Green", color: "#75f0a2" }, { name: "Blue", color: "#8ed1ff" }, { name: "Purple", color: "#c084fc" },
        { name: "Brown", color: "#d6a36a" }, { name: "Red", color: "#ff6b7a" }, { name: "Black", color: "#3a3a4a" },
        { name: "Ascended Black", color: "#d8c4ff" }, { name: "Mythic", color: "#9ee9ff" }
      ],
      dojo: {
        tag: "The Dojo",
        title: "Train with Master Kaien",
        text: "Read his attacks — block, dodge, wait or counter — then strike back in turn-based Shadow Duels. Take on trials against The Doubter, The Urge and The Shame, and climb eleven belts from White to Mythic.",
        quote: "Master Kaien's feedback ranges from ‘acceptable’ to silence. Both are progress."
      },
      // Round 1 of SHADOW_DEMON_WAVES[0] (config.js), verbatim.
      arena: {
        tag: "Shadow Arena",
        title: "Face The Doubter",
        text: "Dodge what it throws at you, and answer its whispers with the response that actually weakens it. A boss fight against the voice in your own head.",
        whisper: "You will never be good enough.",
        prompt: "What actually weakens this voice?",
        options: [
          { text: "Maybe it's right. I should shrink before I fail.", effect: "trap", result: "Trap — that feeds the voice." },
          { text: "I feel the doubt, but I do not need to obey it.", effect: "best", result: "Best answer — The Doubter weakens." },
          { text: "Shut up. You're wrong.", effect: "okay", result: "Okay — it holds the line, barely." }
        ]
      },
      // LD_DUEL_TYPE_META (config.js).
      duels: {
        tag: "Duels & the Arena",
        title: "Challenge anyone",
        text: "Pick a game, send a challenge, and see who's faster. Play for fun, put Soul Dust on the line, or climb the ranked Arena.",
        types: [
          { icon: "🧠", name: "Speed Math" }, { icon: "🌍", name: "Geography" }, { icon: "🐶", name: "Animals" },
          { icon: "🍕", name: "Food" }, { icon: "🎬", name: "Movies" }, { icon: "🎵", name: "Music" },
          { icon: "🔤", name: "Word Duel" }, { icon: "⌨️", name: "Typing Race" }, { icon: "🧩", name: "Memory" }
        ]
      }
    },
    life: {
      kicker: "Make it your life",
      title: "Pets, homes, work — and a pizza place you can own",
      cards: [
        { id: "pets", bg: "pet-shop", title: "Adopt a pet", text: "Sixteen companions from Rare to Ancient. Unlock them as you level up and they follow you everywhere.", sprites: ["pet-helion", "pet-lunyx", "pet-aqua"], alt: "Three LifeDecode pets: Helion, Lunyx and Aqua." },
        { id: "homes", bg: "wonder-of-homes", title: "Own a home", text: "Mushroom Home, Wizzard Tower or Cloud Nest. Each has a Soul Furnace that slowly fills with Soul Dust — and friends can drop by.", sprites: ["soul-furnace"], alt: "The Soul Furnace: a stone furnace glowing with violet crystals." },
        { id: "work", bg: "main-street-pizza", title: "Work & run a business", text: "Clock in at LifeFactory for Soul Dust and XP — or buy Main Street Pizza outright, set the menu prices and collect the takings.", sprites: ["npc-pizza-worker"], alt: "The Main Street Pizza cook, a fiery spirit in a chef's hat holding a pizza." },
        { id: "daily", bg: "soulcore", title: "Daily rituals", text: "Open the Daily Chest on its 30-day reward cycle, grab a snack at LifeMart, and keep your Hunger and Thirst topped up.", sprites: ["daily-chest"], alt: "The LifeDecode Daily Chest, glowing purple." }
      ]
    },
    community: {
      kicker: "A world you share",
      title: "Real players. Ridiculous locals.",
      lead: "Every room is shared. Chat, emote, send friend requests, see who's online and visit each other's homes — while the locals drag everyone into dozens of quests.",
      points: ["Real-time multiplayer rooms", "Chat & emotes", "Friends & online status", "Visit friends' homes", "Dozens of NPC quests", "Day & night secrets"],
      // In-world sprites + lines quoted from quest text in config.js.
      locals: [
        { id: "ria", name: "Ria", place: "The Plaza", color: "#a9c4ff", line: "\u2018Hey, I'm Ria. What's on your mind?\u2019 An AI companion you can actually talk to." },
        { id: "velvyria", name: "Velvyria", place: "The Plaza", color: "#b98cff", line: "Velvyria notes the arrival. She notes everything." },
        { id: "drunk-dave", name: "Drunk Dave", place: "Brew Haven", color: "#7dff5a", line: "‘I said water,’ Dave says, drinking the coffee anyway. ‘I meant coffee. I always mean coffee.’" },
        { id: "kaien", name: "Master Kaien", place: "The Dojo", color: "#c9b8ff", line: "Two words. From Kaien, that's a parade." },
        { id: "nyas", name: "Nyas", place: "Soulcore", color: "#ff9a3d", line: "‘They hum. Bring beans anyway.’" },
        { id: "astra", name: "Astra", place: "AstraVault", color: "#d6b8ff", line: "‘Dave who?’ — Astra, definitively." },
        { id: "sylene", name: "Sylene", place: "Wonder House", color: "#b6d65a", line: "‘I'm pretending to sleep,’ Sylene says, eyes fully open the entire time." },
        { id: "wanderer", name: "The Wanderer", place: "Out in the world", color: "#ff7a5a", line: "The Wanderer heard something. They always hear something." }
      ]
    },
    // Updates & roadmap. Lane meanings:
    //   live   — "Available now". deployedIn = the lifedecode-game commit
    //            the feature was confirmed in AND that GitHub's commit
    //            statuses report as successfully deployed to production
    //            (Railway production + Cloudflare Workers Builds; ecef049 is
    //            the latest main commit, deployed 2026-10-19). That is
    //            deployment evidence, not a hands-on test: set
    //            liveVerified:true only after playing the item on
    //            world.lifedecode.app (build --check warns until then).
    //            Database-level store overrides are not covered by either.
    //   recent — recently added or still rolling out (label per card)
    //   soon   — announced, not playable yet
    //   dev    — implemented or being built in the owner's development
    //            worktree, NOT confirmed public. Owner-verified dev commits
    //            (Oct 2026): Cinema V2.1 2ed45e6, Relationships V1 0134ece,
    //            Mood & Needs V1 7beff92, Movie Creator 3.4 3524bc4 (Phase 4
    //            unfinished, uncommitted). Move to "live" only once players
    //            can really use it. Never add release dates.
    // Part statuses: live | built ("Dev build" = working in the development build) | wip ("In progress").
    updates: {
      kicker: "News & updates",
      title: "A world that keeps growing",
      lead: "What you can play today, what's rolling out, and what's already built behind the scenes.",
      lanes: [
        { status: "live", label: "Available now", hint: "In the live game" },
        { status: "recent", label: "Rolling out", hint: "Improving over time" },
        { status: "soon", label: "Coming soon", hint: "Announced" },
        { status: "dev", label: "In development", hint: "Working in our development build — not public yet" }
      ],
      items: [
        { status: "live", deployedIn: "ecef049", liveVerified: false, title: "Duels & the ranked Arena", text: "Nine duel types, Soul Dust wagers and a ranked ladder." },
        { status: "live", deployedIn: "ecef049", liveVerified: false, title: "Dojo & Shadow Arena", text: "Eleven belts with Master Kaien and a boss fight with The Doubter." },
        { status: "live", deployedIn: "ecef049", liveVerified: false, title: "Homes, pets & businesses", text: "Three homes, sixteen pets and a pizza place you can own." },
        { status: "live", deployedIn: "ecef049", liveVerified: false, title: "Friends & social", text: "Friend requests, online status, chat, emotes and home visits." },
        { status: "live", deployedIn: "ecef049", liveVerified: false, title: "Hunger & Thirst", text: "Keep your spirit fed and watered at LifeMart and Main Street Pizza." },
        { status: "live", deployedIn: "ecef049", liveVerified: false, date: "2026-07", title: "Account controls", text: "Delete your account at any time — from the game's settings or the Account menu here." },
        { status: "recent", label: "Rolling out", title: "A fairer economy", text: "Rewards, purchases and wagers keep moving to server-side checks, so everyone's progress stays fair." },
        { status: "recent", label: "Rolling out", title: "The world keeps growing", text: "Twenty places to explore today, and new corners keep opening up." },
        { status: "soon", label: "Coming soon", title: "iPhone app", text: "A native iPhone app is in preparation. Until then, LifeDecode World plays right in Safari." },
        { status: "dev", title: "Cinema", wide: true, image: "plaza-cinema", imageAlt: "The Cinema on the Plaza, its marquee reading \u201cComing soon\u201d — in-game location art.", text: "A cinema and screening system is built in development, with deeper Movie Creator integration on the way. Its doors on the Plaza aren't open to players yet.", parts: [{ name: "Cinema & screenings", status: "built" }, { name: "Movie Creator integration", status: "wip" }] },
        { status: "dev", title: "Movie Creator", text: "Film creation and editing are built in development. Submission, moderation and public Cinema screenings are still unfinished.", parts: [{ name: "Create & edit films", status: "built" }, { name: "Submit, moderate & screen", status: "wip" }] },
        { status: "dev", title: "Relationships", text: "A broader relationship system, beyond today's friends list, is built in development.", parts: [{ name: "Friends & friend requests", status: "live" }, { name: "Relationships beyond friends", status: "built" }] },
        { status: "dev", title: "Mood & Needs", text: "Energy, Social, Fun and moodlets join Hunger and Thirst in the development build.", parts: [{ name: "Hunger & Thirst", status: "live" }, { name: "Energy, Social & Fun", status: "built" }, { name: "Moodlets", status: "built" }] },
        { status: "dev", title: "Full character skins", text: "Forty-six complete character forms in three collections, each one a whole new spirit, plus the Base Blue and Base Rose starters — built in development.", parts: [{ name: "Skin system & 46-skin catalog", status: "built" }] }
      ],
      note: "Available now means players can use it today. Everything under In development is real, working code in our development build — it moves across only when it ships."
    },
    finale: {
      kicker: "Your spirit is waiting",
      title: "Step into LifeDecode World",
      text: "Free to play, no download, no login wall. Open the world, find the Plaza, and start your story."
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

  const ICON_ARROW_L = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_ARROW_R = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Intrinsic sizes of assets/v2/world sprites (from manifest.json, written
  // by tools/build-world-assets.py) so every <img> reserves its box and the
  // page never shifts while art streams in.
  const SPRITE_SIZES = {
    "daily-chest": [298, 300],
    "demon-doubter": [319, 560],
    "npc-astra": [380, 520],
    "npc-drunk-dave": [369, 520],
    "npc-kaien": [287, 520],
    "npc-nyas": [306, 520],
    "npc-pizza-worker": [284, 420],
    "npc-ria": [360, 520],
    "npc-sylene": [249, 520],
    "npc-velvyria": [356, 520],
    "npc-wanderer": [286, 520],
    "outfit-cowboy-body": [165, 260],
    "outfit-cowboy-hat": [427, 200],
    "outfit-ninja-body": [177, 260],
    "outfit-ninja-hat": [149, 200],
    "outfit-pirate-body": [145, 260],
    "outfit-pirate-hat": [177, 200],
    "outfit-princess-body": [200, 260],
    "outfit-princess-hat": [197, 200],
    "outfit-tree-body": [154, 260],
    "outfit-tree-hat": [164, 200],
    "outfit-void-body": [156, 260],
    "outfit-void-hat": [136, 200],
    "pet-aqua": [161, 300],
    "pet-helion": [204, 300],
    "pet-joylee": [189, 260],
    "pet-kiwi": [189, 260],
    "pet-leonardo": [195, 260],
    "pet-lunyx": [215, 300],
    "pet-madius": [192, 300],
    "pet-riko": [194, 260],
    "soul-furnace": [240, 360]
  };

  // Location art: 3:2 WebP at 320/640/1280w. The Plaza source is narrower
  // than 1280, so its "1280" file is 903x602.
  function worldPicture(id, opts) {
    const o = opts || {};
    return '<img class="' + esc(o.cls || "") + '" src="' + ART("loc-" + id + "-640.webp") + '"' +
      ' srcset="' + ART("loc-" + id + "-320.webp") + ' 320w, ' + ART("loc-" + id + "-640.webp") + ' 640w, ' + ART("loc-" + id + "-1280.webp") + ' 1280w"' +
      ' sizes="' + esc(o.sizes || "100vw") + '" width="1280" height="853" alt="' + esc(o.alt || "") + '"' +
      (o.eager ? ' loading="eager"' : ' loading="lazy"') + ' decoding="async">';
  }

  function spriteImg(name, opts) {
    const o = opts || {};
    const size = SPRITE_SIZES[name] || [400, 400];
    return '<img class="' + esc(o.cls || "") + '" src="' + ART(name + ".webp") + '" width="' + size[0] + '" height="' + size[1] + '" alt="' + esc(o.alt || "") + '" loading="lazy" decoding="async"' + (o.style ? ' style="' + o.style + '"' : '') + '>';
  }

  // Skin gallery labels, shared by the markup and the binder.
  function skinKind(k) { return k.starter ? "Starter form" : "Wave " + k.wave + " · Full character skin"; }
  function skinAlt(k) { return k.name + " — " + (k.starter ? "starter form" : (k.rarity ? k.rarity.toLowerCase() + " " : "") + "full character skin") + ", original game artwork from the development build"; }
  function skinCollections(roster) {
    const cols = [];
    const starters = roster.filter((k) => k.starter);
    if (starters.length) cols.push({ id: "starters", label: "Starter forms", items: starters });
    roster.forEach((k) => {
      if (k.starter) return;
      let c = cols.find((x) => x.wave === k.wave);
      if (!c) { c = { id: "wave-" + k.wave, wave: k.wave, label: "Wave " + k.wave, items: [] }; cols.push(c); }
      c.items.push(k);
    });
    return cols;
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
#ldw_app .v2_head{max-width:880px;margin:0 auto clamp(32px,4vw,56px);text-align:center;}
#ldw_app .v2_kicker{display:inline-flex;align-items:center;gap:12px;font-size:12px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--v-gold);}
#ldw_app .v2_kicker::before{content:"";width:7px;height:7px;transform:rotate(45deg);border:1px solid currentColor;}
#ldw_app .v2_h2{margin-top:14px;font-family:var(--v-display);font-weight:600;font-size:clamp(30px,4.2vw,54px);line-height:1.08;letter-spacing:.01em;color:#fff;}
#ldw_app .v2_lead{margin-top:16px;color:var(--v-muted);font-size:clamp(15.5px,1.3vw,17.5px);line-height:1.65;}

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

/* Shared art helpers */
#ldw_app .v2_note{margin:18px auto 0;max-width:640px;text-align:center;color:var(--v-soft);font-size:13.5px;}
#ldw_app .v2_bgimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
#ldw_app .v2_tag{font-size:11.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--v-gold);}
#ldw_app .v2_h3{margin-top:10px;font-family:var(--v-display);font-weight:600;font-size:clamp(26px,3vw,40px);line-height:1.1;color:#fff;}
#ldw_app .v2_body{margin-top:14px;color:var(--v-muted);font-size:16px;line-height:1.7;}
#ldw_app .v2_iconbtn{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;border:1px solid rgba(220,210,255,.28);background:rgba(8,8,30,.55);color:#fff;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:border-color .2s ease,background-color .2s ease,transform .2s var(--v-ease);}
#ldw_app .v2_iconbtn:hover{border-color:var(--v-gold);background:rgba(20,18,60,.7);transform:translateY(-1px);}
#ldw_app .v2_iconbtn svg{width:18px;height:18px;}

/* Explore the World — cinematic stage + thumbnail rail */
#ldw_app .v2_gallery{width:var(--v-wide);margin:0 auto;display:grid;gap:16px;}
#ldw_app .v2_stage{position:relative;aspect-ratio:21/10;border-radius:30px;overflow:hidden;background:#07081e;border:1px solid var(--v-line-2);box-shadow:0 40px 110px rgba(0,0,0,.5);}
#ldw_app .v2_stage_media{position:absolute;inset:0;}
#ldw_app .v2_stage_media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .6s ease;}
#ldw_app .v2_stage_media img.is-hidden{opacity:0;}
#ldw_app .v2_stage_media::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,6,22,.88) 0%,rgba(5,6,22,.55) 32%,rgba(5,6,22,0) 62%),linear-gradient(0deg,rgba(5,6,22,.75),rgba(5,6,22,0) 45%);pointer-events:none;}
#ldw_app .v2_stage_caption{position:absolute;left:clamp(24px,3.6vw,56px);bottom:clamp(24px,3.6vw,52px);max-width:min(480px,46%);z-index:1;}
#ldw_app .v2_stage_caption .v2_h3{font-size:clamp(30px,3.6vw,52px);}
#ldw_app .v2_stage_caption p{margin-top:12px;color:rgba(240,236,255,.86);font-size:16.5px;line-height:1.65;text-shadow:0 2px 12px rgba(0,0,0,.6);}
#ldw_app .v2_stage_nav{position:absolute;right:clamp(18px,2.4vw,32px);bottom:clamp(18px,2.4vw,32px);z-index:1;display:flex;align-items:center;gap:10px;}
#ldw_app .v2_stage_count{min-width:64px;text-align:center;font-family:var(--v-display);font-size:14px;letter-spacing:.14em;color:rgba(255,255,255,.8);}
#ldw_app .v2_rail{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;}
#ldw_app .v2_thumb{position:relative;display:block;aspect-ratio:3/2;padding:0;border-radius:14px;overflow:hidden;border:1px solid var(--v-line);background:#0a0b26;cursor:pointer;transition:border-color .25s ease,box-shadow .25s ease,transform .25s var(--v-ease);}
#ldw_app .v2_thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.75) brightness(.62);transition:filter .3s ease,transform .6s var(--v-ease);}
#ldw_app .v2_thumb span{position:absolute;left:10px;right:10px;bottom:8px;text-align:left;font:600 12.5px/1.25 var(--v-sans);color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.9);}
#ldw_app .v2_thumb:hover{transform:translateY(-2px);}
#ldw_app .v2_thumb:hover img{filter:saturate(1) brightness(.85);}
#ldw_app .v2_thumb[aria-selected="true"]{border-color:var(--v-gold);box-shadow:0 0 0 1px var(--v-gold),0 12px 30px rgba(244,199,107,.16);}
#ldw_app .v2_thumb[aria-selected="true"] img{filter:none;}
#ldw_app .v2_more{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 10px;margin-top:10px;color:var(--v-soft);font-size:13.5px;}
#ldw_app .v2_more b{font-weight:600;color:var(--v-muted);margin-right:4px;}
#ldw_app .v2_more span{padding:5px 12px;border-radius:999px;border:1px solid var(--v-line);background:rgba(255,255,255,.02);}
@media(max-width:1080px){#ldw_app .v2_rail{grid-template-columns:repeat(4,minmax(0,1fr));}#ldw_app .v2_stage{aspect-ratio:16/9;}}
@media(max-width:700px){
  #ldw_app .v2_gallery{width:calc(100% - 24px);}
  #ldw_app .v2_stage{aspect-ratio:auto;display:flex;flex-direction:column;border-radius:22px;}
  #ldw_app .v2_stage_media{position:relative;inset:auto;aspect-ratio:3/2;}
  #ldw_app .v2_stage_media::after{background:linear-gradient(0deg,rgba(7,8,30,1),rgba(7,8,30,0) 40%);}
  #ldw_app .v2_stage_caption{position:relative;left:auto;bottom:auto;max-width:none;padding:0 20px 8px;margin-top:-28px;}
  #ldw_app .v2_stage_caption p{font-size:15.5px;}
  #ldw_app .v2_stage_nav{position:relative;right:auto;bottom:auto;justify-content:space-between;padding:12px 20px 20px;}
  #ldw_app .v2_rail{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;padding:2px 2px 8px;scrollbar-width:none;}
  #ldw_app .v2_rail::-webkit-scrollbar{display:none;}
  #ldw_app .v2_thumb{flex:0 0 38%;scroll-snap-align:start;}
}

/* Choose your form — full character skin gallery */
#ldw_app .v2_skins_wrap{position:relative;}
#ldw_app .v2_skins_status{margin-top:18px;}
#ldw_app .v2_sk{--g:#8a6bff;--rar-rare:#6cb8ff;--rar-epic:#c08cff;--rar-legendary:#f4c76b;position:relative;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:clamp(18px,2.6vw,36px);align-items:stretch;}
#ldw_app .v2_sk_stage{position:relative;min-height:clamp(560px,52vw,700px);border-radius:30px;overflow:hidden;isolation:isolate;border:1px solid var(--v-line-2);background:#07081e;box-shadow:0 40px 110px rgba(0,0,0,.5);}
#ldw_app .v2_sk_stage::before{content:"";position:absolute;inset:0;z-index:-2;background:radial-gradient(60% 52% at 50% 48%,color-mix(in srgb,var(--g) 42%,transparent),transparent 72%),radial-gradient(90% 60% at 50% 105%,color-mix(in srgb,var(--g) 30%,transparent),transparent 70%),linear-gradient(180deg,#0a0b2a,#05061a);transition:background .6s ease;}
#ldw_app .v2_sk_stage::after{content:"";position:absolute;inset:0;z-index:-1;background-image:radial-gradient(1.2px 1.2px at 12% 18%,rgba(255,255,255,.7),transparent 60%),radial-gradient(1px 1px at 82% 12%,rgba(255,255,255,.5),transparent 60%),radial-gradient(1.4px 1.4px at 70% 64%,rgba(255,255,255,.45),transparent 60%),radial-gradient(1px 1px at 24% 72%,rgba(255,255,255,.4),transparent 60%),radial-gradient(1.2px 1.2px at 46% 30%,rgba(255,255,255,.35),transparent 60%);}
#ldw_app .v2_sk_media{position:absolute;left:0;right:0;top:9%;bottom:21%;}
#ldw_app .v2_sk_media img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:50% 50%;filter:drop-shadow(0 0 34px color-mix(in srgb,var(--g) 55%,transparent)) drop-shadow(0 18px 30px rgba(0,0,0,.45));transition:opacity .45s ease,transform .6s var(--v-ease);}
#ldw_app .v2_sk_media img.is-hidden{opacity:0;transform:translateY(10px) scale(.98);}
#ldw_app .v2_sk_caption{position:absolute;left:clamp(22px,3vw,36px);right:clamp(22px,3vw,36px);bottom:clamp(22px,3vw,32px);}
#ldw_app .v2_sk_caption small{font-size:11.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--v-gold);}
#ldw_app .v2_sk_caption h3{margin-top:6px;font-family:var(--v-display);font-weight:600;font-size:clamp(26px,2.8vw,40px);line-height:1.08;color:#fff;text-shadow:0 0 24px color-mix(in srgb,var(--g) 50%,transparent);}
#ldw_app .v2_sk_nav{position:absolute;right:clamp(16px,2.2vw,24px);top:clamp(16px,2.2vw,24px);display:flex;align-items:center;gap:8px;z-index:1;}
#ldw_app .v2_sk_nav .v2_stage_count{min-width:56px;font-size:13px;}
#ldw_app .v2_sk_side{display:flex;flex-direction:column;gap:14px;min-width:0;}
#ldw_app .v2_sk_legend{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:13px;color:var(--v-soft);}
#ldw_app .v2_sk_legend b{color:#fff;font-weight:700;margin-right:4px;}
#ldw_app .v2_sk_legend .is-starter::before{content:"";display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:50%;background:var(--v-gold);vertical-align:1px;}
#ldw_app .v2_sk_grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px;}
#ldw_app .v2_sk_thumb{--g:#8a6bff;position:relative;display:block;aspect-ratio:2/3;padding:0;border-radius:12px;overflow:hidden;border:1px solid var(--v-line);background:radial-gradient(80% 60% at 50% 55%,color-mix(in srgb,var(--g) 30%,transparent),transparent 75%),#090a24;cursor:pointer;transition:border-color .2s ease,transform .2s var(--v-ease),box-shadow .2s ease;}
#ldw_app .v2_sk_thumb img{position:absolute;inset:6% 6% 4%;width:88%;height:90%;object-fit:contain;transition:transform .35s var(--v-ease),filter .25s ease;filter:saturate(.85) brightness(.85);}
#ldw_app .v2_sk_thumb:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--g) 50%,transparent);}
#ldw_app .v2_sk_thumb:hover img{filter:none;transform:scale(1.05);}
#ldw_app .v2_sk_thumb[aria-selected="true"]{border-color:var(--v-gold);box-shadow:0 0 0 1px var(--v-gold),0 10px 24px color-mix(in srgb,var(--g) 35%,transparent);}
#ldw_app .v2_sk_thumb[aria-selected="true"] img{filter:none;}
#ldw_app .v2_sk [data-rarity="rare"]{--r:var(--rar-rare);}
#ldw_app .v2_sk [data-rarity="epic"]{--r:var(--rar-epic);}
#ldw_app .v2_sk [data-rarity="legendary"]{--r:var(--rar-legendary);}
#ldw_app .v2_sk_thumb[data-rarity]::before{content:"";position:absolute;left:24%;right:24%;bottom:5px;height:2px;border-radius:2px;background:var(--r);opacity:.9;box-shadow:0 0 8px var(--r);}
#ldw_app .v2_sk_rarity{position:absolute;left:clamp(16px,2.2vw,24px);top:clamp(16px,2.2vw,24px);z-index:1;display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;border:1px solid color-mix(in srgb,var(--r) 55%,transparent);background:color-mix(in srgb,var(--r) 14%,rgba(8,8,30,.6));color:var(--r);font:700 11px/1 var(--v-sans);letter-spacing:.18em;text-transform:uppercase;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
#ldw_app .v2_sk_rarity::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--r);box-shadow:0 0 8px var(--r);}
#ldw_app .v2_sk_rarity[hidden]{display:none;}
#ldw_app .v2_sk_key{display:inline-flex;flex-wrap:wrap;gap:6px 14px;}
#ldw_app .v2_sk_key i{font-style:normal;display:inline-flex;align-items:center;gap:6px;}
#ldw_app .v2_sk_key i::before{content:"";width:12px;height:2px;border-radius:2px;background:var(--r);box-shadow:0 0 6px var(--r);}
#ldw_app .v2_sk_cols{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 1px;}
#ldw_app .v2_sk_cols::-webkit-scrollbar{display:none;}
#ldw_app .v2_sk_col{flex-shrink:0;display:inline-flex;align-items:center;gap:9px;padding:10px 16px;border-radius:999px;border:1px solid var(--v-line);background:rgba(255,255,255,.03);color:var(--v-muted);font:600 13.5px/1 var(--v-sans);letter-spacing:.02em;cursor:pointer;transition:border-color .2s ease,background-color .2s ease,color .2s ease;}
#ldw_app .v2_sk_col b{font-weight:700;font-size:11px;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;}
#ldw_app .v2_sk_col:hover{color:#fff;border-color:var(--v-line-2);}
#ldw_app .v2_sk_col[aria-selected="true"]{color:#fff;border-color:color-mix(in srgb,var(--v-gold) 70%,transparent);background:rgba(244,199,107,.1);box-shadow:0 0 0 1px rgba(244,199,107,.25) inset;}
#ldw_app .v2_sk_col[aria-selected="true"] b{background:var(--v-gold);color:#140c02;}
#ldw_app .v2_sk_panel[hidden]{display:none;}
#ldw_app .v2_sk_panel{animation:ldv2SkPanel .45s var(--v-ease);}
@keyframes ldv2SkPanel{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
#ldw_app .v2_sk_thumb.is-starter::after{content:"";position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--v-gold);box-shadow:0 0 6px rgba(244,199,107,.8);}
@media(max-width:1080px){#ldw_app .v2_sk{grid-template-columns:1fr;}#ldw_app .v2_sk_stage{min-height:560px;}#ldw_app .v2_sk_grid{grid-template-columns:repeat(12,minmax(0,1fr));}}
@media(max-width:700px){
  #ldw_app .v2_sk_stage{min-height:0;height:560px;border-radius:24px;}
  #ldw_app .v2_sk_media{top:4%;bottom:36%;}
  #ldw_app .v2_sk_caption{left:20px;right:20px;bottom:80px;}
  #ldw_app .v2_sk_nav{left:20px;right:20px;top:auto;justify-content:space-between;bottom:18px;}
  #ldw_app .v2_sk_grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,auto);grid-template-columns:none;grid-auto-columns:64px;overflow-x:auto;scroll-snap-type:x proximity;margin:0 -20px;padding:2px 20px 10px;scrollbar-width:none;}
  #ldw_app .v2_sk_grid::-webkit-scrollbar{display:none;}
  #ldw_app .v2_sk_thumb{scroll-snap-align:start;}
  #ldw_app .v2_sk_thumb:hover{transform:none;}
  #ldw_app .v2_sk_cols{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(max-content,1fr);gap:6px;}
  #ldw_app .v2_sk_col{justify-content:center;gap:7px;padding:10px 8px;font-size:13px;}
  #ldw_app .v2_sk_rarity{left:16px;top:16px;}
}

/* Adventures — cinematic spreads */
#ldw_app .v2_adv{display:grid;gap:clamp(18px,2.2vw,28px);width:var(--v-wide);margin:0 auto;}
#ldw_app .v2_spread{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);min-height:clamp(460px,44vw,600px);border-radius:30px;overflow:hidden;isolation:isolate;border:1px solid var(--v-line-2);box-shadow:0 34px 100px rgba(0,0,0,.45);background:#07081e;}
#ldw_app .v2_spread_bg{position:absolute;inset:0;z-index:-2;}
#ldw_app .v2_spread_bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,6,22,.94) 0%,rgba(5,6,22,.78) 38%,rgba(5,6,22,.25) 70%,rgba(5,6,22,.45) 100%);}
#ldw_app .v2_spread--flip{grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);}
#ldw_app .v2_spread--flip .v2_spread_bg::after{background:linear-gradient(270deg,rgba(5,6,22,.94) 0%,rgba(5,6,22,.78) 38%,rgba(5,6,22,.25) 70%,rgba(5,6,22,.45) 100%);}
#ldw_app .v2_spread--flip .v2_spread_figure{order:-1;}
#ldw_app .v2_spread_copy{align-self:center;padding:clamp(30px,4.4vw,72px);max-width:620px;}
#ldw_app .v2_spread_figure{position:relative;display:flex;align-items:flex-end;justify-content:center;padding-top:40px;}
#ldw_app .v2_spread_figure img{position:relative;width:auto;height:min(92%,520px);max-width:90%;object-fit:contain;filter:drop-shadow(0 0 40px var(--glow,rgba(170,120,255,.5)));}
#ldw_app .v2_spread_figure::before{content:"";position:absolute;left:50%;bottom:8%;width:70%;height:22%;transform:translateX(-50%);background:radial-gradient(closest-side,var(--glow,rgba(170,120,255,.45)),transparent);filter:blur(10px);}
#ldw_app .v2_quoteline{margin-top:22px;padding-left:16px;border-left:2px solid var(--v-gold);color:rgba(240,236,255,.78);font-style:italic;font-size:15px;}
#ldw_app .v2_belts{margin-top:26px;}
#ldw_app .v2_belts ol{display:flex;gap:5px;margin:0;padding:0;list-style:none;}
#ldw_app .v2_belts li{flex:1;height:10px;border-radius:3px;background:var(--c);box-shadow:0 0 12px color-mix(in srgb,var(--c) 45%,transparent);}
#ldw_app .v2_belts div{display:flex;justify-content:space-between;margin-top:9px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--v-soft);}
#ldw_app .v2_whisper{margin-top:24px;font-family:var(--v-display);font-size:clamp(20px,2vw,26px);line-height:1.3;color:#e9dcff;text-shadow:0 0 24px rgba(160,90,255,.6);}
#ldw_app .v2_whisper_prompt{margin-top:8px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--v-soft);}
#ldw_app .v2_choices{margin-top:14px;display:grid;gap:8px;}
#ldw_app .v2_choice{display:block;width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(190,160,255,.24);background:rgba(20,12,48,.55);color:var(--v-ink);font:500 14.5px/1.45 var(--v-sans);text-align:left;cursor:pointer;transition:border-color .2s ease,background-color .2s ease;}
#ldw_app .v2_choice:hover{border-color:rgba(220,200,255,.55);background:rgba(36,22,80,.65);}
#ldw_app .v2_choice[aria-pressed="true"][data-effect="best"]{border-color:#86ff9e;background:rgba(40,90,60,.35);}
#ldw_app .v2_choice[aria-pressed="true"][data-effect="okay"]{border-color:#f4c76b;background:rgba(90,70,20,.35);}
#ldw_app .v2_choice[aria-pressed="true"][data-effect="trap"]{border-color:#ff7a8a;background:rgba(100,20,40,.35);}
#ldw_app .v2_choice_result{min-height:22px;margin-top:10px;font-size:14px;font-weight:600;color:var(--v-muted);}
#ldw_app .v2_duel_panel{position:relative;border-radius:30px;overflow:hidden;border:1px solid var(--v-line-2);background:radial-gradient(80% 120% at 85% 20%,rgba(95,227,255,.12),transparent 60%),radial-gradient(80% 120% at 10% 90%,rgba(123,77,255,.18),transparent 60%),linear-gradient(180deg,#0b0c2c,#07081e);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:center;padding:clamp(30px,4.4vw,72px);}
#ldw_app .v2_duel_types{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}
#ldw_app .v2_duel_type{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;aspect-ratio:1.5/1;border-radius:16px;border:1px solid var(--v-line);background:rgba(255,255,255,.03);font-size:13.5px;font-weight:600;color:#fff;text-align:center;transition:border-color .25s ease,transform .25s var(--v-ease);}
#ldw_app .v2_duel_type:hover{border-color:rgba(95,227,255,.5);transform:translateY(-2px);}
#ldw_app .v2_duel_type i{font-style:normal;font-size:28px;line-height:1;}
@media(max-width:880px){
  #ldw_app .v2_adv{width:calc(100% - 24px);}
  #ldw_app .v2_spread,#ldw_app .v2_spread--flip{grid-template-columns:1fr;min-height:0;border-radius:24px;}
  #ldw_app .v2_spread_figure,#ldw_app .v2_spread--flip .v2_spread_figure{order:-1;height:300px;padding-top:24px;}
  #ldw_app .v2_spread_figure img{height:100%;}
  #ldw_app .v2_spread_bg::after,#ldw_app .v2_spread--flip .v2_spread_bg::after{background:linear-gradient(180deg,rgba(5,6,22,.2) 0%,rgba(5,6,22,.55) 34%,rgba(5,6,22,.94) 52%,#07081e 100%);}
  #ldw_app .v2_spread_copy{padding:8px 22px 30px;}
  #ldw_app .v2_duel_panel{grid-template-columns:1fr;border-radius:24px;padding:30px 22px;}
}

/* Make it your life — art cards */
#ldw_app .v2_life{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
#ldw_app .v2_life_card{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:480px;border-radius:24px;overflow:hidden;isolation:isolate;border:1px solid var(--v-line);background:#07081e;transition:transform .45s var(--v-ease),border-color .3s ease,box-shadow .45s var(--v-ease);}
#ldw_app .v2_life_card:hover{transform:translateY(-6px);border-color:rgba(244,199,107,.35);box-shadow:0 30px 70px rgba(0,0,0,.45);}
#ldw_app .v2_life_card .v2_bgimg{z-index:-2;filter:brightness(.62) saturate(1.05);transition:transform 1.2s var(--v-ease);}
#ldw_app .v2_life_card:hover .v2_bgimg{transform:scale(1.04);}
#ldw_app .v2_life_card::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(5,6,22,.1) 0%,rgba(5,6,22,.2) 38%,rgba(5,6,22,.9) 64%,#06071c 100%);}
#ldw_app .v2_life_art{position:absolute;left:0;right:0;top:24px;height:52%;display:flex;align-items:flex-end;justify-content:center;pointer-events:none;}
#ldw_app .v2_life_art img{width:auto;height:88%;max-width:86%;object-fit:contain;filter:drop-shadow(0 10px 26px rgba(0,0,0,.55)) drop-shadow(0 0 18px rgba(200,160,255,.35));}
#ldw_app .v2_life_art--row{gap:0;padding:0 6px;}
#ldw_app .v2_life_art--row img{width:30%;height:auto;max-width:none;margin:0 -2.5%;}
#ldw_app .v2_life_art--row img:nth-child(2){width:34%;position:relative;z-index:1;}
#ldw_app .v2_life_copy{position:relative;padding:22px 24px 26px;}
#ldw_app .v2_life_copy h3{font-family:var(--v-display);font-weight:600;font-size:22px;color:#fff;}
#ldw_app .v2_life_copy p{margin-top:10px;color:var(--v-muted);font-size:14.5px;line-height:1.6;}
@media(max-width:1080px){#ldw_app .v2_life{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:600px){#ldw_app .v2_life{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin:0 -20px;padding:4px 20px 16px;scrollbar-width:none;}#ldw_app .v2_life::-webkit-scrollbar{display:none;}#ldw_app .v2_life_card{flex:0 0 82%;scroll-snap-align:center;min-height:440px;}#ldw_app .v2_life_card:hover{transform:none;}}

/* Community + locals */
#ldw_app .v2_comm{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(28px,5vw,80px);align-items:end;margin-bottom:clamp(28px,3.4vw,44px);}
#ldw_app .v2_comm .v2_h2,#ldw_app .v2_comm .v2_lead{text-align:left;}
#ldw_app .v2_points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 22px;}
#ldw_app .v2_points li{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--v-line);color:#fff;font-size:15px;}
#ldw_app .v2_points li::before{content:"";flex:0 0 8px;height:8px;transform:rotate(45deg);border:1px solid var(--v-gold);box-shadow:0 0 10px rgba(244,199,107,.5);}
#ldw_app .v2_locals_wrap{position:relative;}
#ldw_app .v2_locals{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 20px;padding:6px 2px 18px;scrollbar-width:thin;scrollbar-color:rgba(244,199,107,.35) transparent;}
#ldw_app .v2_local{--c:#b98cff;flex:0 0 clamp(220px,22vw,260px);scroll-snap-align:start;display:flex;flex-direction:column;border-radius:22px;border:1px solid var(--v-line);background:radial-gradient(90% 60% at 50% 28%,color-mix(in srgb,var(--c) 24%,transparent),transparent 70%),linear-gradient(180deg,rgba(14,14,46,.9),rgba(7,8,26,.96));overflow:hidden;}
#ldw_app .v2_local_img{height:230px;display:flex;align-items:flex-end;justify-content:center;padding-top:16px;}
#ldw_app .v2_local_img img{width:auto;height:100%;max-width:90%;object-fit:contain;filter:drop-shadow(0 0 22px color-mix(in srgb,var(--c) 60%,transparent));}
#ldw_app .v2_local_body{padding:16px 20px 22px;border-top:1px solid rgba(255,255,255,.06);}
#ldw_app .v2_local small{font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--c);}
#ldw_app .v2_local h3{margin-top:6px;font-family:var(--v-display);font-weight:600;font-size:20px;color:#fff;}
#ldw_app .v2_local p{margin-top:8px;color:var(--v-muted);font-size:14px;line-height:1.55;font-style:italic;}
#ldw_app .v2_locals_nav{display:flex;justify-content:flex-end;gap:10px;margin-top:6px;}
@media(max-width:880px){#ldw_app .v2_comm{grid-template-columns:1fr;align-items:start;}#ldw_app .v2_comm .v2_h2,#ldw_app .v2_comm .v2_lead{text-align:center;}#ldw_app .v2_comm .v2_kicker{display:flex;justify-content:center;}#ldw_app .v2_locals{margin:0 -20px;padding-left:20px;padding-right:20px;}#ldw_app .v2_local{flex-basis:72%;}#ldw_app .v2_locals_nav{display:none;}}
@media(max-width:520px){#ldw_app .v2_points{grid-template-columns:1fr;gap:0;}}

/* News & updates — status board */
#ldw_app .v2_board{position:relative;}
#ldw_app .v2_lane_tabs{display:none;}
#ldw_app .v2_lanes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-areas:"live recent dev dev" "live soon dev dev";grid-template-rows:auto 1fr;gap:16px;align-items:start;align-content:start;}
#ldw_app .v2_lane[data-status="live"]{grid-area:live;}
#ldw_app .v2_lane[data-status="recent"]{grid-area:recent;}
#ldw_app .v2_lane[data-status="soon"]{grid-area:soon;}
#ldw_app .v2_lane[data-status="dev"]{grid-area:dev;grid-row:1 / span 2;}
#ldw_app .v2_lane[data-status="dev"] .v2_lane_list{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;}
#ldw_app .v2_lane[data-status="dev"] .v2_lane_list > li{display:flex;}
#ldw_app .v2_lane[data-status="dev"] .v2_lane_list > li > article{flex:1;}
#ldw_app .v2_news_wide{grid-column:1 / -1;}
#ldw_app .v2_news_wide .v2_news_card--art{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);padding:0;}
#ldw_app .v2_news_wide .v2_news_art{margin:0;aspect-ratio:auto;min-height:100%;}
#ldw_app .v2_news_wide .v2_news_art img{object-position:12% 50%;}
#ldw_app .v2_news_wide .v2_news_art::after{background:linear-gradient(90deg,transparent 55%,rgba(8,9,30,.95));}
#ldw_app .v2_news_wide .v2_news_body{padding:18px 18px 20px;}
#ldw_app .v2_news_wide .v2_news_card--art::before{display:none;}
#ldw_app .v2_lane{--s:#5fe3ff;border-radius:24px;border:1px solid var(--v-line);background:linear-gradient(180deg,color-mix(in srgb,var(--s) 6%,rgba(10,11,36,.9)),rgba(7,8,26,.6));padding:14px;}
#ldw_app .v2_lane[data-status="live"],#ldw_app [data-status="live"]{--s:#86ff9e;}
#ldw_app .v2_lane[data-status="recent"],#ldw_app [data-status="recent"]{--s:#5fe3ff;}
#ldw_app .v2_lane[data-status="soon"],#ldw_app [data-status="soon"]{--s:#f4c76b;}
#ldw_app .v2_lane[data-status="dev"],#ldw_app [data-status="dev"]{--s:#c79bff;}
#ldw_app [data-status="built"]{--s:#d7b8ff;}
#ldw_app [data-status="wip"]{--s:#9a86c8;}
#ldw_app .v2_lane_head{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:6px 8px 14px;}
#ldw_app .v2_lane_head small{font-size:13px;color:var(--v-soft);}
#ldw_app .v2_lane_list{display:grid;gap:10px;}
#ldw_app .v2_live_list{border-radius:16px;border:1px solid var(--v-line);background:rgba(8,9,30,.92);overflow:hidden;}
#ldw_app .v2_live_list li{position:relative;padding:13px 16px 13px 30px;border-bottom:1px solid var(--v-line);}
#ldw_app .v2_live_list li:last-child{border-bottom:0;}
#ldw_app .v2_live_list li::before{content:"";position:absolute;left:14px;top:20px;width:6px;height:6px;border-radius:50%;background:var(--s);box-shadow:0 0 8px var(--s);}
#ldw_app .v2_live_list b{display:block;font-family:var(--v-display);font-weight:600;font-size:15.5px;line-height:1.3;color:#fff;}
#ldw_app .v2_live_list span{display:block;margin-top:3px;color:var(--v-muted);font-size:13.5px;line-height:1.5;}
#ldw_app .v2_live_list time{display:block;margin-top:4px;font-size:11.5px;letter-spacing:.08em;color:var(--v-soft);}
#ldw_app .v2_news_card{position:relative;display:flex;flex-direction:column;padding:18px 18px 20px;border-radius:16px;border:1px solid var(--v-line);background:rgba(8,9,30,.92);overflow:hidden;transition:border-color .25s ease,transform .25s var(--v-ease);}
#ldw_app .v2_news_card:hover{border-color:color-mix(in srgb,var(--s) 40%,transparent);transform:translateY(-2px);}
#ldw_app .v2_news_card::before{content:"";position:absolute;left:0;top:16px;bottom:16px;width:2px;border-radius:2px;background:var(--s);opacity:.8;}
#ldw_app .v2_news_card--art{padding-top:0;}
#ldw_app .v2_news_art{position:relative;margin:0 -18px 14px;aspect-ratio:16/9;overflow:hidden;}
#ldw_app .v2_news_art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
#ldw_app .v2_news_art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(8,9,30,.95));}
#ldw_app .v2_news_card--art::before{top:auto;height:40%;}
#ldw_app .v2_news_meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;font-size:12px;color:var(--v-soft);}
#ldw_app .v2_lane .v2_news_meta .v2_status{display:none;}
#ldw_app .v2_status{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;border:1px solid color-mix(in srgb,var(--s) 45%,transparent);background:color-mix(in srgb,var(--s) 10%,transparent);color:var(--s);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}
#ldw_app .v2_status::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor;}
#ldw_app .v2_news_card h3{margin-top:2px;font-family:var(--v-display);font-weight:600;font-size:18px;line-height:1.25;color:#fff;}
#ldw_app .v2_news_meta:not(:empty) + h3{margin-top:10px;}
#ldw_app .v2_news_card p{margin-top:8px;color:var(--v-muted);font-size:14px;line-height:1.6;}
#ldw_app .v2_parts{margin-top:12px;display:grid;gap:6px;}
#ldw_app .v2_parts li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--v-line);font-size:13px;color:#fff;}
#ldw_app .v2_parts em{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;font-style:normal;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--s);}
#ldw_app .v2_parts em::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;}
#ldw_app .v2_parts li[data-status="wip"] em::before{background:transparent;border:1px solid currentColor;}
@media(max-width:1080px){#ldw_app .v2_lanes{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:"live recent" "live soon" "dev dev";}#ldw_app .v2_lane[data-status="dev"]{grid-row:auto;}}
@media(max-width:700px){
  #ldw_app .v2_lane_tabs{display:flex;gap:8px;overflow-x:auto;margin:0 -20px 14px;padding:2px 20px 6px;scrollbar-width:none;}
  #ldw_app .v2_lane_tabs::-webkit-scrollbar{display:none;}
  #ldw_app .v2_lane_tab{flex-shrink:0;display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;border:1px solid var(--v-line);background:rgba(255,255,255,.03);color:var(--v-muted);font:600 13px/1 var(--v-sans);cursor:pointer;}
  #ldw_app .v2_lane_tab b{font-weight:700;font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;}
  #ldw_app .v2_lane_tab[aria-pressed="true"]{color:#fff;border-color:color-mix(in srgb,var(--s) 60%,transparent);background:color-mix(in srgb,var(--s) 14%,transparent);}
  #ldw_app .v2_lanes{grid-template-columns:1fr;grid-template-areas:none;}
  #ldw_app .v2_lane[data-status]{grid-area:auto;}
  #ldw_app .v2_lane[data-status="dev"]{grid-row:auto;}
  #ldw_app .v2_lane[data-status="dev"] .v2_lane_list{grid-template-columns:minmax(0,1fr);}
  #ldw_app .v2_news_wide .v2_news_card--art{display:flex;flex-direction:column;}
  #ldw_app .v2_news_wide .v2_news_art{aspect-ratio:16/9;min-height:0;}
  #ldw_app .v2_lane{display:none;}
  #ldw_app .v2_lane.is-active{display:block;}
}

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
    const F = C.world.featured;
    const O = C.skins;
    const A = C.adventures;

    const thumbs = F.map((l, i) => (
      '<button class="v2_thumb" type="button" role="tab" id="ldv2_loc_tab_' + esc(l.id) + '" aria-controls="ldv2_stage" aria-selected="' + (i === 0 ? "true" : "false") + '" tabindex="' + (i === 0 ? "0" : "-1") + '" data-loc="' + i + '">' +
        worldPicture(l.id, { sizes: "(max-width:700px) 40vw, 220px", alt: "" }) +
        '<span>' + esc(l.name) + '</span>' +
      '</button>'
    )).join("");

    // Skin gallery: one large preview, collection tabs (starters when their
    // art exists, then Wave 1-3), and one thumbnail tablist per collection.
    const SKIN_IMG = (id, size) => ASSET_BASE + "assets/v2/skins/" + id + "-" + size + ".webp";
    const skinCols = skinCollections(O.roster);
    const firstCol = skinCols.find((c) => c.wave === 1) || skinCols[0];
    const firstSkin = firstCol.items[0];
    const skinThumb = (k) => (
      '<button class="v2_sk_thumb' + (k.starter ? ' is-starter' : '') + '" type="button" role="tab" id="ldv2_sk_' + esc(k.id) + '" aria-controls="ldv2_sk_stage" aria-selected="' + (k === firstSkin ? "true" : "false") + '" tabindex="' + (k === firstSkin ? "0" : "-1") + '" data-skin="' + esc(k.id) + '"' + (k.rarity ? ' data-rarity="' + esc(k.rarity.toLowerCase()) + '"' : '') + ' style="--g:' + esc(k.glow) + '" title="' + esc(k.name + (k.rarity ? " · " + k.rarity : "")) + '">' +
        '<img data-src="' + SKIN_IMG(k.id, "thumb") + '" width="' + k.tw + '" height="' + k.th + '" alt="' + esc(k.name + (k.rarity ? ", " + k.rarity : "")) + '" decoding="async">' +
      '</button>'
    );
    const skinColTabs = skinCols.map((c) => (
      '<button class="v2_sk_col" type="button" role="tab" id="ldv2_sk_col_' + c.id + '" aria-controls="ldv2_sk_panel_' + c.id + '" aria-selected="' + (c === firstCol ? "true" : "false") + '" tabindex="' + (c === firstCol ? "0" : "-1") + '" data-col="' + c.id + '">' + esc(c.label) + ' <b>' + c.items.length + '</b></button>'
    )).join("");
    const skinPanels = skinCols.map((c) => (
      '<div class="v2_sk_panel" role="tabpanel" id="ldv2_sk_panel_' + c.id + '" aria-labelledby="ldv2_sk_col_' + c.id + '"' + (c === firstCol ? '' : ' hidden') + '>' +
        '<div class="v2_sk_grid" role="tablist" aria-label="' + esc(c.label) + ' skins">' + c.items.map(skinThumb).join("") + '</div>' +
      '</div>'
    )).join("");
    const skinStageImg = (k) => '<img src="' + SKIN_IMG(k.id, "1200") + '" srcset="' + SKIN_IMG(k.id, "600") + ' 600w, ' + SKIN_IMG(k.id, "1200") + ' 1200w" sizes="(max-width:700px) 70vw, 420px" width="' + k.w + '" height="' + k.h + '" alt="' + esc(skinAlt(k)) + '" loading="lazy" decoding="async">';
    const skinCount = O.roster.filter((k) => !k.starter).length;
    const skinWaves = skinCols.filter((c) => c.wave).length;

    const belts = A.belts.map((b) => '<li style="--c:' + esc(b.color) + '" title="' + esc(b.name) + '"></li>').join("");

    const choices = A.arena.options.map((o, i) => (
      '<button class="v2_choice" type="button" aria-pressed="false" data-effect="' + esc(o.effect) + '" data-result="' + esc(o.result) + '">' + esc(o.text) + '</button>'
    )).join("");

    const duelTypes = A.duels.types.map((t) => '<li class="v2_duel_type"><i aria-hidden="true">' + t.icon + '</i>' + esc(t.name) + '</li>').join("");

    const life = C.life.cards.map((c) => (
      '<li class="v2_life_card">' +
        worldPicture(c.bg, { cls: "v2_bgimg", sizes: "(max-width:600px) 100vw, (max-width:1080px) 50vw, 25vw", alt: "" }) +
        '<div class="v2_life_art' + (c.sprites.length > 1 ? ' v2_life_art--row' : '') + '" role="img" aria-label="' + esc(c.alt) + '">' +
          c.sprites.map((s) => spriteImg(s, { alt: "" })).join("") +
        '</div>' +
        '<div class="v2_life_copy"><h3>' + esc(c.title) + '</h3><p>' + esc(c.text) + '</p></div>' +
      '</li>'
    )).join("");

    const points = C.community.points.map((p) => '<li>' + esc(p) + '</li>').join("");

    const locals = C.community.locals.map((n) => (
      '<li class="v2_local" style="--c:' + esc(n.color) + '">' +
        '<div class="v2_local_img">' + spriteImg("npc-" + n.id, { alt: n.name }) + '</div>' +
        '<div class="v2_local_body"><small>' + esc(n.place) + '</small><h3>' + esc(n.name) + '</h3><p>' + esc(n.line) + '</p></div>' +
      '</li>'
    )).join("");

    const U = C.updates;
    const statusLabel = { live: "Available", built: "Dev build", wip: "In progress", recent: "Rolling out", soon: "Coming soon", dev: "In development" };
    const updateCard = (n) => {
      const dateLabel = formatNewsDate(n.date);
      return '<li' + (n.wide ? ' class="v2_news_wide"' : '') + '><article class="v2_news_card' + (n.image ? ' v2_news_card--art' : '') + '" data-status="' + esc(n.status) + '">' +
        (n.image ? '<div class="v2_news_art">' + worldPicture(n.image, { sizes: "(max-width:700px) 100vw, 360px", alt: n.imageAlt || "" }) + '</div>' : '') +
        '<div class="v2_news_body">' +
        '<div class="v2_news_meta">' + (n.label ? '<span class="v2_status">' + esc(n.label) + '</span>' : '') +
          (dateLabel ? '<time datetime="' + esc(n.date) + '">' + esc(dateLabel) + '</time>' : '') +
        '</div>' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<p>' + esc(n.text) + '</p>' +
        (n.parts ? '<ul class="v2_parts" aria-label="Status by part">' + n.parts.map((pt) => '<li data-status="' + esc(pt.status) + '"><span>' + esc(pt.name) + '</span><em>' + esc(statusLabel[pt.status] || pt.status) + '</em></li>').join("") + '</ul>' : '') +
        '</div>' +
      '</article></li>';
    };
    const laneTabs = U.lanes.map((l, i) => (
      '<button class="v2_lane_tab" type="button" aria-controls="ldv2_lane_' + esc(l.status) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '" data-status="' + esc(l.status) + '">' + esc(l.label) + ' <b>' + U.items.filter((n) => n.status === l.status).length + '</b></button>'
    )).join("");
    const lanes = U.lanes.map((l, i) => (
      '<div class="v2_lane' + (i === 0 ? ' is-active' : '') + '" id="ldv2_lane_' + esc(l.status) + '" role="region" aria-label="' + esc(l.label) + '" data-status="' + esc(l.status) + '">' +
        '<div class="v2_lane_head"><span class="v2_status">' + esc(l.label) + '</span><small>' + esc(l.hint) + '</small></div>' +
        (l.status === "live"
          ? '<ul class="v2_live_list">' + U.items.filter((n) => n.status === "live").map((n) => {
              const dateLabel = formatNewsDate(n.date);
              return '<li><b>' + esc(n.title) + '</b><span>' + esc(n.text) + '</span>' + (dateLabel ? '<time datetime="' + esc(n.date) + '">' + esc(dateLabel) + '</time>' : '') + '</li>';
            }).join("") + '</ul>'
          : '<ul class="v2_lane_list">' + U.items.filter((n) => n.status === l.status).map(updateCard).join("") + '</ul>') +
      '</div>'
    )).join("");

    const facts = C.prologue.facts.map((f) => '<li class="v2_fact"><b>' + esc(f.title) + '</b><span>' + esc(f.text) + '</span></li>').join("");

    const quote = esc(C.prologue.quote).replace("Just a weird, cozy world that grows with you.", "<em>Just a weird, cozy world that grows with you.</em>");

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
      <a href="#ldv2_spirit">Your Spirit</a>
      <a href="#ldv2_adventures">Adventures</a>
      <a href="#ldv2_community">Community</a>
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
      <div class="v2_hero_art">${keyArtPicture({ eager: true, alt: "LifeDecode World key art: four glowing spirits — a blue cowboy, a red ninja, a green pirate and a violet princess — against a dark, starry sky." })}</div>
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

    <section class="v2_section" id="ldv2_world" aria-labelledby="ldv2_world_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">${esc(C.world.kicker)}</div>
          <h2 class="v2_h2" id="ldv2_world_title">${esc(C.world.title)}</h2>
          <p class="v2_lead">${esc(C.world.lead)}</p>
        </div>
      </div>
      <div class="v2_gallery v2_reveal">
        <div class="v2_stage" id="ldv2_stage" role="tabpanel" aria-labelledby="ldv2_loc_tab_${esc(F[0].id)}">
          <div class="v2_stage_media">${worldPicture(F[0].id, { sizes: "(max-width:1480px) 100vw, 1480px", alt: F[0].name + " — in-game location art" })}</div>
          <div class="v2_stage_caption" aria-live="polite">
            <div class="v2_tag" id="ldv2_stage_tag">${esc(F[0].tag)}</div>
            <h3 class="v2_h3" id="ldv2_stage_name">${esc(F[0].name)}</h3>
            <p id="ldv2_stage_text">${esc(F[0].text)}</p>
          </div>
          <div class="v2_stage_nav">
            <button class="v2_iconbtn" type="button" id="ldv2_stage_prev" aria-label="Previous location">${ICON_ARROW_L}</button>
            <span class="v2_stage_count" id="ldv2_stage_count" aria-hidden="true">01 / ${String(F.length).padStart(2, "0")}</span>
            <button class="v2_iconbtn" type="button" id="ldv2_stage_next" aria-label="Next location">${ICON_ARROW_R}</button>
          </div>
        </div>
        <div class="v2_rail" role="tablist" aria-label="Locations in LifeDecode World">${thumbs}</div>
        <p class="v2_more"><b>Also in the world:</b>${C.world.more.map((m) => "<span>" + esc(m) + "</span>").join("")}</p>
        <p class="v2_note">${esc(C.world.note)}</p>
      </div>
    </section>

    <section class="v2_section v2_skins_wrap" id="ldv2_spirit" aria-labelledby="ldv2_spirit_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">${esc(O.kicker)}</div>
          <h2 class="v2_h2" id="ldv2_spirit_title">${esc(O.title)}</h2>
          <p class="v2_lead">${esc(O.lead)}</p>
          <p class="v2_skins_status" data-status="dev"><span class="v2_status">${esc(O.status)}</span></p>
        </div>
        <div class="v2_sk v2_reveal" style="--g:${esc(firstSkin.glow)}">
          <div class="v2_sk_stage" id="ldv2_sk_stage" role="tabpanel" aria-labelledby="ldv2_sk_${esc(firstSkin.id)}">
            <span class="v2_sk_rarity" id="ldv2_sk_rarity"${firstSkin.rarity ? ' data-rarity="' + esc(firstSkin.rarity.toLowerCase()) + '"' : ' hidden'}>${esc(firstSkin.rarity || "")}</span>
            <div class="v2_sk_media">${skinStageImg(firstSkin)}</div>
            <div class="v2_sk_caption" aria-live="polite">
              <small id="ldv2_sk_kind">${esc(skinKind(firstSkin))}</small>
              <h3 id="ldv2_sk_name">${esc(firstSkin.name)}</h3>
            </div>
            <div class="v2_sk_nav">
              <button class="v2_iconbtn" type="button" id="ldv2_sk_prev" aria-label="Previous skin">${ICON_ARROW_L}</button>
              <span class="v2_stage_count" id="ldv2_sk_count" aria-hidden="true">01 / ${String(firstCol.items.length).padStart(2, "0")}</span>
              <button class="v2_iconbtn" type="button" id="ldv2_sk_next" aria-label="Next skin">${ICON_ARROW_R}</button>
            </div>
          </div>
          <div class="v2_sk_side">
            <div class="v2_sk_legend"><span><b>${skinCount}</b> full skins</span><span><b>${skinWaves}</b> collections</span><span class="v2_sk_key" aria-label="Rarity"><i data-rarity="rare">Rare</i><i data-rarity="epic">Epic</i><i data-rarity="legendary">Legendary</i></span></div>
            <div class="v2_sk_cols" role="tablist" aria-label="Skin collections">${skinColTabs}</div>
            ${skinPanels}
          </div>
        </div>
        <p class="v2_note">${esc(O.note)}</p>
      </div>
    </section>

    <section class="v2_section" id="ldv2_adventures" aria-labelledby="ldv2_adv_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">${esc(A.kicker)}</div>
          <h2 class="v2_h2" id="ldv2_adv_title">${esc(A.title)}</h2>
        </div>
      </div>
      <div class="v2_adv">
        <article class="v2_spread v2_reveal" style="--glow:rgba(170,140,255,.5)" aria-labelledby="ldv2_dojo_title">
          <div class="v2_spread_bg">${worldPicture("path-of-ascension", { cls: "v2_bgimg", sizes: "(max-width:1480px) 100vw, 1480px", alt: "" })}</div>
          <div class="v2_spread_copy">
            <div class="v2_tag">${esc(A.dojo.tag)}</div>
            <h3 class="v2_h3" id="ldv2_dojo_title">${esc(A.dojo.title)}</h3>
            <p class="v2_body">${esc(A.dojo.text)}</p>
            <div class="v2_belts" role="img" aria-label="Eleven Dojo belts, from White to Mythic"><ol>${belts}</ol><div><span>White</span><span>Mythic</span></div></div>
            <p class="v2_quoteline">${esc(A.dojo.quote)}</p>
          </div>
          <div class="v2_spread_figure">${spriteImg("npc-kaien", { alt: "Master Kaien, a robed dojo master wreathed in violet smoke" })}</div>
        </article>

        <article class="v2_spread v2_spread--flip v2_reveal" style="--glow:rgba(150,70,255,.55)" aria-labelledby="ldv2_arena_title">
          <div class="v2_spread_bg">${worldPicture("shadow-arena", { cls: "v2_bgimg", sizes: "(max-width:1480px) 100vw, 1480px", alt: "" })}</div>
          <div class="v2_spread_copy">
            <div class="v2_tag">${esc(A.arena.tag)}</div>
            <h3 class="v2_h3" id="ldv2_arena_title">${esc(A.arena.title)}</h3>
            <p class="v2_body">${esc(A.arena.text)}</p>
            <p class="v2_whisper">&ldquo;${esc(A.arena.whisper)}&rdquo;</p>
            <p class="v2_whisper_prompt" id="ldv2_arena_prompt">${esc(A.arena.prompt)}</p>
            <div class="v2_choices" role="group" aria-labelledby="ldv2_arena_prompt">${choices}</div>
            <p class="v2_choice_result" id="ldv2_arena_result" aria-live="polite"></p>
          </div>
          <div class="v2_spread_figure">${spriteImg("demon-doubter", { alt: "The Doubter, a shadowy demon with a glowing violet core" })}</div>
        </article>

        <article class="v2_duel_panel v2_reveal" aria-labelledby="ldv2_duel_title">
          <div>
            <div class="v2_tag">${esc(A.duels.tag)}</div>
            <h3 class="v2_h3" id="ldv2_duel_title">${esc(A.duels.title)}</h3>
            <p class="v2_body">${esc(A.duels.text)}</p>
          </div>
          <ul class="v2_duel_types" aria-label="Duel types">${duelTypes}</ul>
        </article>
      </div>
    </section>

    <section class="v2_section" id="ldv2_life" aria-labelledby="ldv2_life_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">${esc(C.life.kicker)}</div>
          <h2 class="v2_h2" id="ldv2_life_title">${esc(C.life.title)}</h2>
        </div>
        <ul class="v2_life v2_stagger" tabindex="0" aria-label="Life in LifeDecode World">${life}</ul>
      </div>
    </section>

    <section class="v2_section" id="ldv2_community" aria-labelledby="ldv2_comm_title">
      <div class="v2_container">
        <div class="v2_comm v2_reveal">
          <div>
            <div class="v2_kicker">${esc(C.community.kicker)}</div>
            <h2 class="v2_h2" id="ldv2_comm_title">${esc(C.community.title)}</h2>
            <p class="v2_lead">${esc(C.community.lead)}</p>
          </div>
          <ul class="v2_points">${points}</ul>
        </div>
        <div class="v2_locals_wrap v2_reveal">
          <ul class="v2_locals" id="ldv2_locals" tabindex="0" aria-label="Locals you'll meet in LifeDecode World">${locals}</ul>
          <div class="v2_locals_nav">
            <button class="v2_iconbtn" type="button" data-locals="-1" aria-label="Scroll locals left">${ICON_ARROW_L}</button>
            <button class="v2_iconbtn" type="button" data-locals="1" aria-label="Scroll locals right">${ICON_ARROW_R}</button>
          </div>
        </div>
      </div>
    </section>

    <section class="v2_section" id="ldv2_news" aria-labelledby="ldv2_news_title">
      <div class="v2_container">
        <div class="v2_head v2_reveal">
          <div class="v2_kicker">${esc(U.kicker)}</div>
          <h2 class="v2_h2" id="ldv2_news_title">${esc(U.title)}</h2>
          <p class="v2_lead">${esc(U.lead)}</p>
        </div>
        <div class="v2_board v2_reveal">
          <div class="v2_lane_tabs" role="group" aria-label="Show updates by status">${laneTabs}</div>
          <div class="v2_lanes">${lanes}</div>
        </div>
        <p class="v2_note">${esc(U.note)}</p>
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
            <li><a href="#ldv2_spirit">Your Spirit</a></li>
            <li><a href="#ldv2_adventures">Adventures</a></li>
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
        <span>Free to play. Optional in-game purchases. Privacy Policy and Terms are always available.</span>
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

  // Cross-fades stage images safely under rapid input. Each call is a new
  // request and only the newest may reveal: an older image that finishes
  // loading later is discarded, a not-yet-revealed image is dropped as soon
  // as a newer one is requested, and only the image that was on screen keeps
  // fading out - so exactly one stage image is ever visible and the stage is
  // never blank (the current image stays until its successor has decoded).
  // A failed image retries once with fallbackSrc (if given); if that fails
  // too, the current image simply stays.
  function createStageSwap(media, fadeMs, place) {
    let seq = 0;
    let pending = null;
    const drop = (el) => { if (el && el.parentNode) el.parentNode.removeChild(el); };
    const ready = (img) => new Promise((resolve) => {
      if (img.complete && img.naturalWidth) return resolve(true);
      const done = (ok) => { img.removeEventListener("load", onLoad); img.removeEventListener("error", onError); resolve(ok); };
      const onLoad = () => done(true);
      const onError = () => done(false);
      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);
    }).then((ok) => (ok && img.decode ? img.decode().then(() => true, () => true) : ok));
    return function swap(next, fallbackSrc) {
      const id = ++seq;
      drop(pending);
      pending = next;
      next.classList.add("is-hidden");
      place(next);
      ready(next).then((ok) => {
        if (ok || !fallbackSrc || id !== seq) return ok;
        next.removeAttribute("srcset");
        next.src = fallbackSrc;
        return ready(next);
      }).then((ok) => {
        if (id !== seq) { drop(next); return; }
        pending = null;
        if (!ok) { drop(next); return; }
        Array.from(media.querySelectorAll(":scope > img")).forEach((el) => {
          if (el === next) return;
          if (el.classList.contains("is-hidden")) { drop(el); return; }
          el.classList.add("is-hidden");
          setTimeout(() => drop(el), fadeMs);
        });
        next.classList.remove("is-hidden");
      });
    };
  }

  // Accessible tablist helper: roving tabindex, arrow/Home/End keys.
  function bindTablist(tabs, onSelect) {
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => onSelect(i, false));
      tab.addEventListener("keydown", (e) => {
        let next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next >= 0) { e.preventDefault(); onSelect(next, true); }
      });
    });
  }

  function setSelectedTab(tabs, index, focus) {
    tabs.forEach((t, i) => {
      t.setAttribute("aria-selected", i === index ? "true" : "false");
      t.tabIndex = i === index ? 0 : -1;
    });
    if (focus && tabs[index]) tabs[index].focus();
  }

  // Skin gallery: collection tabs pick a thumbnail tablist; thumbnails and
  // prev/next (within the collection) drive one large cross-faded preview.
  function bindSkinGallery() {
    const byId = {};
    CONTENT.skins.roster.forEach((k) => { byId[k.id] = k; });
    const wrap = document.querySelector("#ldw_app .v2_sk");
    const stage = document.getElementById("ldv2_sk_stage");
    const media = stage && stage.querySelector(".v2_sk_media");
    const nameEl = document.getElementById("ldv2_sk_name");
    const kindEl = document.getElementById("ldv2_sk_kind");
    const rarityEl = document.getElementById("ldv2_sk_rarity");
    const countEl = document.getElementById("ldv2_sk_count");
    const colTabs = Array.from(document.querySelectorAll("#ldw_app .v2_sk_col[data-col]"));
    const panels = colTabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
    const groups = panels.map((p) => (p ? Array.from(p.querySelectorAll(".v2_sk_thumb[data-skin]")) : []));
    if (!media || !groups.some((g) => g.length)) return;
    const img = (id, size) => ASSET_BASE + "assets/v2/skins/" + id + "-" + size + ".webp";
    let col = Math.max(0, colTabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    const picked = groups.map((g) => Math.max(0, g.findIndex((t) => t.getAttribute("aria-selected") === "true")));
    let currentId = groups[col][picked[col]] && groups[col][picked[col]].getAttribute("data-skin");
    let nearView = false;
    const swapStage = createStageSwap(media, 500, (el) => media.appendChild(el));

    // Thumbnails load per collection, and only once the gallery is about a
    // screen away — Chromium's native lazy-load margin would fetch them with the page.
    const loadThumbs = (g) => g.forEach((t) => { const im = t.querySelector("img[data-src]"); if (im && !im.getAttribute("src")) im.src = im.getAttribute("data-src"); });

    function show(index, focus) {
      const tabs = groups[col];
      index = (index + tabs.length) % tabs.length;
      const k = byId[tabs[index].getAttribute("data-skin")];
      setSelectedTab(tabs, index, focus);
      picked[col] = index;
      if (k.id !== currentId) {
        const next = document.createElement("img");
        next.src = img(k.id, "1200");
        next.srcset = img(k.id, "600") + " 600w, " + img(k.id, "1200") + " 1200w";
        next.sizes = "(max-width:700px) 70vw, 420px";
        next.width = k.w; next.height = k.h; next.decoding = "async";
        next.alt = skinAlt(k);
        // Fallback: the thumbnail of the same skin (already on screen).
        swapStage(next, img(k.id, "thumb"));
      }
      currentId = k.id;
      if (wrap) wrap.style.setProperty("--g", k.glow);
      stage.setAttribute("aria-labelledby", tabs[index].id);
      if (nameEl) nameEl.textContent = k.name;
      if (kindEl) kindEl.textContent = skinKind(k);
      if (rarityEl) {
        rarityEl.textContent = k.rarity || "";
        rarityEl.hidden = !k.rarity;
        if (k.rarity) rarityEl.setAttribute("data-rarity", k.rarity.toLowerCase());
      }
      if (countEl) countEl.textContent = String(index + 1).padStart(2, "0") + " / " + String(tabs.length).padStart(2, "0");
    }

    function showCollection(i, focus) {
      setSelectedTab(colTabs, i, focus);
      panels.forEach((p, j) => { if (p) p.hidden = j !== i; });
      col = i;
      if (nearView) loadThumbs(groups[i]);
      show(picked[i], false);
    }

    bindTablist(colTabs, showCollection);
    groups.forEach((g) => bindTablist(g, show));
    colTabs.forEach((t, i) => {
      const warm = () => loadThumbs(groups[i]);
      t.addEventListener("pointerenter", warm, { once: true });
      t.addEventListener("focus", warm, { once: true });
    });
    if ("IntersectionObserver" in window && wrap) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { nearView = true; loadThumbs(groups[col]); io.disconnect(); }
      }, { rootMargin: "900px 0px" });
      io.observe(wrap);
    } else {
      nearView = true;
      loadThumbs(groups[col]);
    }
    // Warm the large preview on hover/focus so selection feels instant.
    groups.forEach((g) => g.forEach((t) => {
      const warm = () => { const pre = new Image(); pre.src = img(t.getAttribute("data-skin"), window.innerWidth <= 700 ? "600" : "1200"); };
      t.addEventListener("pointerenter", warm, { once: true });
      t.addEventListener("focus", warm, { once: true });
    }));
    const prev = document.getElementById("ldv2_sk_prev");
    const nextBtn = document.getElementById("ldv2_sk_next");
    if (prev) prev.addEventListener("click", () => show(picked[col] - 1, false));
    if (nextBtn) nextBtn.addEventListener("click", () => show(picked[col] + 1, false));
  }

  // Explore the World: one stage image swapped in place (cross-faded via a
  // second <img>), driven by the thumbnail tablist and prev/next buttons.
  function bindWorldGallery() {
    const featured = CONTENT.world.featured;
    const tabs = Array.from(document.querySelectorAll("#ldw_app .v2_thumb[data-loc]"));
    const stage = document.getElementById("ldv2_stage");
    const media = stage && stage.querySelector(".v2_stage_media");
    const tag = document.getElementById("ldv2_stage_tag");
    const name = document.getElementById("ldv2_stage_name");
    const text = document.getElementById("ldv2_stage_text");
    const count = document.getElementById("ldv2_stage_count");
    if (!tabs.length || !media) return;
    let current = 0;
    const swapStage = createStageSwap(media, 650, (el) => media.insertBefore(el, media.firstChild));

    function show(index, focus) {
      index = (index + featured.length) % featured.length;
      const loc = featured[index];
      setSelectedTab(tabs, index, focus);
      if (index !== current) {
        const holder = document.createElement("div");
        holder.innerHTML = worldPicture(loc.id, { sizes: "(max-width:1480px) 100vw, 1480px", alt: loc.name + " — in-game location art" });
        const next = holder.firstChild;
        next.loading = "eager";
        swapStage(next, ART("loc-" + loc.id + "-640.webp"));
      }
      current = index;
      stage.setAttribute("aria-labelledby", tabs[index].id);
      if (tag) tag.textContent = loc.tag;
      if (name) name.textContent = loc.name;
      if (text) text.textContent = loc.text;
      if (count) count.textContent = String(index + 1).padStart(2, "0") + " / " + String(featured.length).padStart(2, "0");
    }

    bindTablist(tabs, show);
    const prev = document.getElementById("ldv2_stage_prev");
    const nextBtn = document.getElementById("ldv2_stage_next");
    if (prev) prev.addEventListener("click", () => show(current - 1, false));
    if (nextBtn) nextBtn.addEventListener("click", () => show(current + 1, false));
  }

  // Shadow Arena teaser: the real round-1 choices from SHADOW_DEMON_WAVES.
  function bindArenaChoices() {
    const buttons = Array.from(document.querySelectorAll("#ldw_app .v2_choice"));
    const result = document.getElementById("ldv2_arena_result");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        if (result) result.textContent = btn.getAttribute("data-result") || "";
      });
    });
  }

  // Updates board: all lanes show side by side on wider screens; on phones
  // the status chips switch which single lane is visible.
  function bindUpdateLanes() {
    const chips = Array.from(document.querySelectorAll("#ldw_app .v2_lane_tab"));
    const lanes = Array.from(document.querySelectorAll("#ldw_app .v2_lane"));
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const status = chip.getAttribute("data-status");
        chips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
        lanes.forEach((l) => l.classList.toggle("is-active", l.getAttribute("data-status") === status));
      });
    });
  }

  function bindLocalsNav() {
    const list = document.getElementById("ldv2_locals");
    if (!list) return;
    document.querySelectorAll("#ldw_app [data-locals]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = Number(btn.getAttribute("data-locals")) || 1;
        const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        list.scrollBy({ left: dir * Math.max(240, list.clientWidth * 0.8), behavior: reduce ? "auto" : "smooth" });
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
      bindWorldGallery();
      bindSkinGallery();
      bindArenaChoices();
      bindLocalsNav();
      bindUpdateLanes();
      bindAuthModalExtras();
      bindMotion();
      console.log("[LD] World landing loaded:", CFG.VERSION);
    } catch (err) {
      console.error("[LD] World landing failed:", err);
      document.body.innerHTML = '<div style="min-height:100vh;background:#03020a;color:#fff;padding:24px;font-family:Arial,sans-serif"><h1>LifeDecode World</h1><p>Landing failed to load. Check console.</p></div>';
    }
  });
})();

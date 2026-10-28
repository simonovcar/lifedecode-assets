# LifeDecode Website V2 — Audit & Implementation Plan

> **Correction (after reading `lifedecode-game`):** production is not Webflow. `lifedecode.app` is a Cloudflare Pages shell at `lifedecode-game/marketing-site/index.html`, which loads `ludo77.js` from jsDelivr `@main`. The Webflow references below come from comments in the older ludoNN files. See `GAME_AUDIT_AND_RECOMMENDATIONS.md` §1.

Branch: `feature/website-v2` (from `main` @ `a9e89c1`). `main` is untouched.

## 1. Repository audit (`simonovcar/lifedecode-assets`)

| Item | Finding |
|---|---|
| Default branch | `main`, clean, 188 commits. Latest: `a9e89c1` "Merge redesign/homepage-polish-v77" (2026-09-10). |
| Other branches | `redesign/landing-v9`, `redesign/homepage-polish-v77`, `fix/*-v66..v74` (all merged history). No `feature/website-v2` existed. |
| Contents | `ludo36.js` … `ludo77.js` (versioned homepage scripts), `assets/iconic.png` + `assets/iconic2.png` (byte-identical, 1536×1024, 2.5 MB), `.claude/launch.json` (`python -m http.server 8934`). No build system, no package.json, no CI. |
| Workflow convention | "ludoNN.js rollback workflow": each change is a **new** file; the previous file stays untouched as the rollback. |
| Production script | `ludo77.js` (`VERSION: lifedecode-app-v16-homepage-polish`). |

### How the homepage works (ludo77.js)

* A single IIFE loaded by Webflow custom code from jsDelivr
  (`cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/…`).
* **Route guard**: it exits immediately on any path containing `/terms`, `/policy`, `/privacy` or `/support`. Those pages stay Webflow-native.
* **Takeover render**: it injects `#ldw_app` as the first child of `<body>`, then hides every other body child (`data-ldw-hidden`, `display:none`). That's the "WHITE-SCREEN RESCUE v8" pattern. Webflow's own markup only serves as the SEO/meta shell.
* **Styles**: one injected `<style id="ldw_style">`. Google Fonts are Inter and Orbitron. Some rules are global (`:root` vars, `html/body`, bare `main{}`).
* **Functional systems that must keep working**:
  * Supabase auth (`@supabase/supabase-js@2` from jsDelivr, project `nnqiahypfkdoqkclknoe`, publishable key). It covers email login/register, forgot password, resend verification, Google OAuth, Apple OAuth (degrades gracefully), logout, `onAuthStateChange`, and `detectSessionInUrl` for OAuth/email redirects back to the homepage.
  * The Account modal, which shows **Delete account** linking to `https://world.lifedecode.app/delete-account` (this page never deletes anything itself).
  * The Support widget, which POSTs to `…railway.app/api/support-request` and has a honeypot, client cooldown and validation. Per the inline note, the backend route may not exist yet, so the widget shows a real error, never a fake success.
  * Pending Daily Check-In XP flush on login (`/api/daily-checkin` plus a `ld_user_state` read). The check-in UI was removed from the homepage in v77, but the flush still runs.
  * Play entry: every `a[href="https://world.lifedecode.app/#"]` gets a click handler that sends the visitor to the World.
  * The Platform/ENTRY_CONFIG module: label "Play in Browser" on mobile, plus an "iPhone app — coming soon" tag on iOS.
* **Links**: `/policy`, `/terms`, `/support`, `mailto:support@lifedecode.app`, the World URL and the delete-account URL. `PREMIUM_URL` (`lifedecode.app/premium`) is defined but **not linked** since Shop was removed in v77.

### Limitations of Webflow + jsDelivr

1. Webflow can't serve repo files, so all assets must come from jsDelivr (or raw.githubusercontent as a fallback).
2. `@main` URLs on jsDelivr are cached (up to ~12 h for branch refs). A merge doesn't show up instantly, and a bad merge can't be rolled back instantly without a cache purge.
3. The content is client-rendered. `<title>`, the meta description and Open Graph tags must be set in **Webflow page settings**, because social scrapers don't run JS.
4. The script loads site-wide (that's why `/support` once got taken over). Any new Webflow page that isn't in the guard list gets replaced by the homepage. **`/premium` is not in the guard list.** Check whether that page is currently intended to show the homepage.

### Artwork

Only one authentic piece exists: the "Silly Squad" key art. It shows four characters (Cowboy, Ninja, Pirate, Princess) and the LIFEDECODE WORLD wordmark. There are no gameplay screenshots in this repo.

### Game repository access

`simonovcar/lifedecode-game` was **not accessible** to this session (GitHub: "you don't have access"). Feature claims could not be checked against game code. V2 therefore advertises only:

* claims already on the owner-approved production homepage (ludo77.js), and
* facts the owner stated directly (browser multiplayer; Movie Creator in development).

Features the owner mentioned but that couldn't be verified (pets, homes, minigames, Cinema, friendships, organizations, careers) are **not shown**. They are listed in `CONTENT.pendingVerification` inside `ludo78.js` so they can be enabled after confirmation.

## 2. Design direction

* **Palette**: deep midnight blue `#050616` → rich violet glows. Cyan `#5fe3ff` and gold `#f4c76b` are used sparingly. The existing brand gradient (violet → magenta → cyan) stays for the primary CTA.
* **Typography**: *Cinzel* for display. It matches the classical spaced caps of the wordmark in the key art. *Inter* for body text. Orbitron (sci-fi) is retired from headings.
* **Composition**: a full-bleed cinematic key-art hero, an editorial manifesto, location plates, an interactive character showcase built from crops of the real key art, feature pillars, status-labelled updates, and a closing CTA band.
* **Motion**: a hero "settle" zoom, scroll reveals and a gentle star twinkle. All of it is disabled under `prefers-reduced-motion`. There is no canvas loop and no video.

## 3. Implementation plan

* New file **`ludo78.js`**. `ludo77.js` stays untouched as the rollback.
* The functional core is copied **byte-for-byte** from ludo77.js: auth, Supabase, Support, check-in XP, `render()`, `ready()`, the error handler and the header scroll state. `tools/verify-core.mjs` proves this.
* Presentation is new: HTML, CSS, content model and platform labels. Additive enhancements: Escape-to-close plus focus return on the auth modal, labelled inputs, a skip link, an extra login trigger, and an image fallback to the existing `iconic2.png`.
* CSS is scoped under `#ldw_app`. Remaining globals are only the `html/body` background and scroll-padding, which already exist in v77.
* Optimized derivatives go in `assets/v2/`. The original PNGs are untouched.
* The asset base URL comes from the script's own `src`, so assets load from the same commit and CDN ref as the script.
* Preview harness `preview/website-v2.html`: Webflow-like shell and base CSS, plus a `/support` guard test page.

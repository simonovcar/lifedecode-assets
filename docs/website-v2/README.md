# LifeDecode Website V2 (`ludo78.js`)

Status: **preview only**. This is not deployed. `main` and the production `ludo77.js` are untouched.

See [`AUDIT_AND_PLAN.md`](AUDIT_AND_PLAN.md) for the repository audit and design rationale.

## Files

| Path | Purpose |
|---|---|
| `ludo78.js` | **The deliverable.** A drop-in replacement for `ludo77.js`, loaded the same way and following the same `ludoNN.js` rollback convention. Generated, but committed and readable. |
| `tools/ludo78.src.js` | Hand-edited V2 source: content model, markup, CSS and the presentation JS. |
| `tools/build-website-v2.mjs` | Splices the functional core of `ludo77.js` into the source **verbatim** and writes `ludo78.js`. `--check` re-verifies the build. |
| `tools/qa-website-v2.mjs` | Headless QA: screenshots, overflow, links, auth/support/squad interactions, reduced motion and the `/support` guard. |
| `assets/v2/keyart-{640,1024,1536}.webp`, `keyart-1536.jpg` | Optimized key art: 61–243 KB, down from the 2.5 MB PNG. |
| `assets/v2/og-1200x630.jpg` | Open Graph / social share image (for the Cloudflare Pages shell's `<head>`). |
| `assets/v2/world/*.webp` + `manifest.json` | Polish pass 2: real game art (12 location backgrounds at 320/640/1280w, NPC/pet/outfit/demon/object sprites), built from `lifedecode-game` by `tools/build-world-assets.py`. The manifest records each file's source path and the game commit. |
| `tools/build-world-assets.py` | Rebuilds `assets/v2/world/` from a read-only `lifedecode-game` checkout (`python3 tools/build-world-assets.py ../lifedecode-game`). |
| `docs/website-v2/LIVE_VERIFICATION.md` | Every feature claim on the page, its source evidence, and a checkbox for live verification before deploy. |
| `preview/` | Webflow-like preview harness (see below). Note: production is actually a Cloudflare Pages shell, not Webflow; see Integration. |
| `docs/website-v2/screenshots/` | QA screenshots. |

To change copy, edit `CONTENT` in `tools/ludo78.src.js`, then run the build. Rooms, Silly Squad, pillars and news entries are all data.

```bash
node tools/build-website-v2.mjs
```

## What stays byte-identical to ludo77.js (enforced by the build)

Run the check with:

```bash
node tools/build-website-v2.mjs --check
```

It covers:

* The route guard (`/terms`, `/policy`, `/privacy`, `/support` are skipped) and the `__LD_WORLD_LANDING_LOADED__` double-load guard.
* `ready()`, `injectCSS()` and `render()`. That's the WHITE-SCREEN RESCUE takeover of the Webflow body.
* The entire systems block: `loadSupabaseScript` through `bindSupportWidget`, plus the BACKEND TODO note. That includes Supabase auth (email, Google, Apple, reset, verify, logout), the Account modal with Delete account, pending check-in XP, the support form and the Play Now click handler.
* `bindHeaderScrollState()` and the global error handler.
* All 37 DOM IDs those functions look up exist in the V2 markup.

`CFG` values (Supabase URL/key, Railway API URLs, World, legal and delete-account URLs) are unchanged.

## What's new (presentation only)

The page sections, in order (polish pass 2):

1. **Hero** with the key art (left-aligned copy on desktop).
2. **Prologue / manifesto**: "Not soulless. Not a lecture." The absolute "Not pay-to-win" claim is gone; the page says "Free to play · Optional in-game purchases" instead.
3. **Explore the World**: a cinematic stage plus a 12-thumbnail tablist of **real location art**, and the other 8 locations as chips.
4. **Choose your form** (correction pass 4): the **new full-character skin collection**. That's 2 starter forms (Base Blue, Base Rose) plus 11 skins, shown as a 6-column collection grid with an "In development" status. The skin PNGs aren't reachable from the cloud sandbox, so each plate shows an abstract colour orb until the real art is built (see *Adding the real skin art* below). The old outfit key art appears only in the hero.
5. **Adventures**:
   * a Dojo spread (Master Kaien sprite, real belt colours);
   * a Shadow Arena spread (The Doubter, with the real round-1 choices you can try);
   * a duels panel with the 9 duel types.
6. **Make it your life**: art cards for pets, homes (Soul Furnace), work and business (Main Street Pizza) and daily rituals (Daily Chest). On phones they're a swipeable row.
7. **A world you share**: multiplayer and social points, plus a carousel of **8 real NPCs** (in-world sprites, quoted quest lines).
8. **News & updates — "A world that keeps growing"** (correction pass 4): a compact board with lanes Live · Ongoing · Coming soon · In development. In development spans two columns and holds Cinema (with the facade art), Movie Creator, Relationships, Mood & Needs and Full character skins, each with per-part tags (Live / Dev build / In progress). On phones, chips switch lanes.
9. **Final CTA** and **footer**.

Visual and technical changes:

* **Look**: Cinzel display type plus Inter, a midnight/violet palette with gold and cyan accents, and CSS-only atmosphere. The canvas star loop is gone.
* **CSS scoping**: all V2 CSS is scoped under `#ldw_app`. The only globals are the same `html/body` rules `ludo77.js` already sets.
* **Additive accessibility**:
  * skip link;
  * a single `h1`;
  * labelled sections;
  * keyboard tablist (arrow keys, Home, End);
  * gold `:focus-visible` rings;
  * Escape closes the auth modal, and focus returns to whatever opened it;
  * `aria-label` on the modal's email and password inputs;
  * alt text on every image.
* **Motion**: hero settle and scroll reveals. These are fully disabled under `prefers-reduced-motion`, and content is never hidden if `IntersectionObserver` is missing.
* **Image fallback**: if `assets/v2` images fail to load, the page falls back to the existing `assets/iconic2.png` URLs.
* **Platform labels**: the hero CTA reads "Play Now" on desktop and "Play in Browser" on mobile. The iOS "iPhone app — coming soon" tag is kept.
* **Second login entry**: the final CTA and footer have their own "Log in" triggers. They reuse the real Login button, so no auth logic is duplicated.

### Content accuracy

`lifedecode-game` was not readable from this session, so claims are limited to:

* the owner-approved production homepage copy, and
* facts the owner stated directly.

These are **not shown** until verified: pets, homes, minigames, Cinema, friendships, organizations and careers. They're listed in `CONTENT.pendingVerification`.

**Movie Creator** is shown only as *In development*. **iPhone app** is shown as *Coming soon*.

## Preview locally

Start the server from the repo root. It's the same command as `.claude/launch.json`:

```bash
python3 -m http.server 8934
```

Then open:

* http://localhost:8934/preview/website-v2.html — Website V2
* http://localhost:8934/preview/current-ludo77.html — current production, for side-by-side comparison
* http://localhost:8934/preview/support/ — route-guard test (the Webflow content must stay visible)

Run the QA (needs Playwright and Chromium):

```bash
node tools/qa-website-v2.mjs /tmp/ld-qa
```

### How the preview differs from real Webflow

* `preview/webflow-shell.css` is an *approximation* of Webflow's base stylesheet, not the real file. The live Webflow page, its custom code, and the interactions JS (`webflow.js`) weren't reachable from the build sandbox.
* Scripts load from the local server, so assets resolve to `/assets/v2/...` instead of jsDelivr. The script derives the asset base from its own `src`, so this matches production behaviour.
* Auth needs `https://<origin>/` to be an allowed Supabase redirect URL. Real logins and OAuth only work on `lifedecode.app`, not on `localhost`.

## Adding the real skin art

The new skin PNGs live in the local development worktree. From a machine that has them:

```bash
python3 tools/build-skin-assets.py /path/to/folder-with-skin-pngs
```

Files are matched by name. These are the expected skins, by slug:

`base-blue`, `base-rose`, `emberborn`, `abyssal-tide`, `clockwork-soul`, `void-wanderer`, `verdant-keeper`, `frost-revenant`, `crimson-oracle`, `luminous-druid`, `shadow-harlequin`, `starforged-knight`, `bone-warden`

The tool writes `assets/v2/skins/<slug>.webp` and a `manifest.json` that lists anything missing. Then set `art: true` for each built skin in `CONTENT.skins` (`tools/ludo78.src.js`) and run:

```bash
node tools/build-website-v2.mjs
```

## Integration (when approved) — corrected after reading lifedecode-game

The live homepage is **not** a Webflow page. `lifedecode.app` is a Cloudflare Pages site built from `lifedecode-game/marketing-site/`. Its `index.html` is a small shell that does two things:

1. Loads supabase-js.
2. Injects `…lifedecode-assets@main/ludo77.js?v=<timestamp>` on every path except `/terms`, `/policy` and `/privacy`.

`/support` is a separate static page.

This changes the integration in three ways:

1. **Switching to V2 is a one-line change in the game repo:** `marketing-site/index.html`, `ludo77.js` → `ludo78.js`. Prefer a commit-pinned URL so the script and its `assets/v2` images update together and rollback is exact:

   ```html
   https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@<COMMIT_SHA>/ludo78.js
   ```

   This session never modifies the game repo, so you make that change.
2. **SEO lives in that shell's `<head>`.** Its `<title>` is still the old "LifeDecode AI – Decode what you can't stop thinking about", and its OG image is the square app icon. Suggested replacements:
   * Title: `LifeDecode World — A neon-fantasy social world you play in your browser`
   * Description: `Explore strange, cozy rooms, meet the Silly Squad and other players, and level up your spirit just by showing up. No download — play LifeDecode World in your browser.`
   * OG image: `assets/v2/og-1200x630.jpg` (1200×630).
3. **The preview harness still approximates Webflow.** In production the shell has no Webflow CSS, so the real environment is *simpler* than the preview. The `<body>` takeover in `render()` still works, because the shell body only contains `<noscript>` and scripts.

## Safest deployment procedure

1. Review the preview and screenshots, then approve or request changes. Apply the copy corrections from [`GAME_AUDIT_AND_RECOMMENDATIONS.md`](GAME_AUDIT_AND_RECOMMENDATIONS.md) first.
2. Open a PR from `feature/website-v2` into `main` in `lifedecode-assets`. Merging alone changes nothing live, because the shell still loads `ludo77.js`.
3. Test on a non-production URL first. Either:
   * use a Cloudflare Pages **preview deployment**: push a branch of `lifedecode-game` that changes only `marketing-site/index.html` to the pinned `ludo78.js`, or
   * load `ludo78.js` from the browser console on `lifedecode.app`.

   Test the following there:
   * Login with email and Google, including the OAuth redirect back. The redirect URL must be allowed in Supabase for the preview domain, or test OAuth only on production.
   * Logout.
   * Account → Delete account.
   * The support form.
   * Play Now.
   * `/terms`, `/policy`, `/privacy` and `/support`.
   * iPhone Safari and Android Chrome.
4. Merge the one-line shell change to `lifedecode-game` `main`, which deploys through Cloudflare Pages.
5. **Rollback**: revert that one line back to `ludo77.js`. `ludo77.js` is never modified.

## Known limitations / follow-ups

* **Real location and character art, but no gameplay screenshots yet.** The scene backgrounds contain no players or UI, and the page labels them "Location artwork from the game". Gameplay screenshots still need capturing on the live game with test accounts only (see `GAME_AUDIT_AND_RECOMMENDATIONS.md` §4.6).
* **Source-confirmed is not live-verified.** Every claim was checked against `lifedecode-game` `main` @ `ecef049`. Tick [`LIVE_VERIFICATION.md`](LIVE_VERIFICATION.md) on the live game before deploying.
* **`/premium` isn't in the route guard.** That's inherited from v77. If `lifedecode.app/premium` is a real Webflow page, the landing script replaces it. Confirm the intent before changing the guard.
* **Inherited from v77, intentionally untouched (it's in the verbatim core):**
  * If the supabase-js CDN request fails, `openLogin()` waits for a 4.5 s fallback timeout before the modal appears.
  * The "or continue with" divider stays visible in the logged-in Account view.
* **Removed from the page:** the legal accordion text from v77. The footer keeps all legal and support links, plus a "Privacy Policy and Terms are always available" line.
* **Restored:** v77 intentionally had one Play CTA. V2 restores a final CTA because this brief requested one.
* **Weight:** `ludo78.js` is ~160 KB unminified (roughly 35–40 KB gzipped via jsDelivr). Measured locally, first load is ~780–830 KB, against 2,644 KB for ludo77.js; a full scroll is ~1.95 MB, because all world art lazy-loads. jsDelivr can also serve `ludo78.min.js` automatically.

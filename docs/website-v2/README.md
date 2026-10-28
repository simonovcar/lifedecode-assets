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
| `assets/v2/og-1200x630.jpg` | Open Graph / social share image, for Webflow page settings. |
| `preview/` | Webflow-like preview harness (see below). |
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

The page sections, in order:

1. Hero with the key art.
2. Prologue / manifesto.
3. Explore: four rooms.
4. Meet the Silly Squad: an interactive viewer built from crops of the real key art.
5. Your spirit, your story: six pillars.
6. News & updates, each with an honest status label.
7. Final CTA.
8. Footer.

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

## Webflow integration (when approved)

Nothing in Webflow needs to change structurally. The only change is the script URL in the existing custom-code `<script>` tag.

1. **Script tag**. Replace the current `.../ludo77.js` URL with a **commit-pinned** URL, for example:

   ```html
   <script src="https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@<COMMIT_SHA>/ludo78.js"></script>
   ```

   A commit pin means the script and its `assets/v2` images update atomically, skip jsDelivr's branch cache, and can be rolled back instantly. (`@main/ludo78.js` also works after a merge, but caching makes changes appear with a delay.)

2. **SEO** (Webflow → Page settings for Home; JS-injected meta tags aren't read by social scrapers):
   * Title: `LifeDecode World — A neon-fantasy social world you play in your browser`
   * Meta description: `Explore strange, cozy rooms, meet the Silly Squad and other players, and level up your spirit just by showing up. No download — play LifeDecode World in your browser.`
   * Open Graph image: upload `assets/v2/og-1200x630.jpg` to Webflow Assets (or use its jsDelivr URL). Use the same title and description for OG and Twitter.

3. **Preconnect** (optional, for faster fonts and image loads): add these in the Webflow head code.

   ```html
   <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```

## Safest deployment procedure

1. Review the preview and screenshots, then approve or request changes.
2. Push `feature/website-v2` and open a PR into `main`. This repo has no CI, and nothing loads `ludo78.js` yet, so merging alone changes nothing on the live site.
3. Run a live-domain test without touching Webflow production. Either:
   * use Webflow's **staging** domain (`*.webflow.io`) with the script tag pointed at the commit-pinned `ludo78.js`, or
   * paste a `ludo78.js` `<script>` into the browser console on a private copy of the page.

   Test the following there:
   * Login with email and Google, including the OAuth redirect back to the homepage.
   * Logout.
   * Account → Delete account link.
   * The support form (the backend route may still be missing; it should show an honest error).
   * Play Now → `world.lifedecode.app`.
   * `/terms`, `/policy`, `/privacy` and `/support` stay native.
   * iPhone Safari and Android Chrome.
4. Swap the production script tag to the commit-pinned `ludo78.js` and publish Webflow.
5. **Rollback**: point the script tag back to `ludo77.js` and republish. `ludo77.js` is never modified.

## Known limitations / follow-ups

* **No gameplay screenshots exist** in this repo. Room cards use stylised CSS sigils and are labelled as such. Set `CONTENT.locations[i].image` to a real screenshot URL to replace them.
* **Feature verification is pending.** Grant this workflow read access to `lifedecode-game` (or confirm the features yourself) before enabling anything in `pendingVerification`.
* **`/premium` isn't in the route guard.** That's inherited from v77. If `lifedecode.app/premium` is a real Webflow page, the landing script replaces it. Confirm the intent before changing the guard.
* **Inherited from v77, intentionally untouched (it's in the verbatim core):**
  * If the supabase-js CDN request fails, `openLogin()` waits for a 4.5 s fallback timeout before the modal appears.
  * The "or continue with" divider stays visible in the logged-in Account view.
* **Removed from the page:** the legal accordion text from v77. The footer keeps all legal and support links, plus a "Privacy Policy and Terms are always available" line.
* **Restored:** v77 intentionally had one Play CTA. V2 restores a final CTA because this brief requested one.
* **Script size:** `ludo78.js` is ~130 KB unminified, about 30 KB gzipped via jsDelivr. jsDelivr can also serve `ludo78.min.js` automatically.

# Website V2 — release plan (staging → production → rollback)

Nothing in this document has been executed. Production (`lifedecode.app`, `ludo77.js`), both `main` branches and `lifedecode-game` are untouched.

## 1. How production is wired (evidence, Oct 2026)

| Piece | What it is | Evidence |
|---|---|---|
| `lifedecode.app` homepage | Static shell `lifedecode-game/marketing-site/index.html`. It loads supabase-js, then injects `…/lifedecode-assets@main/ludo77.js?v=Date.now()` on every path except `/terms`, `/policy` and `/privacy` | Shell source in the game repo |
| How that shell is deployed | **Unconfirmed.** GitHub has no Pages check for `marketing-site`, so it may be a separately deployed Pages project | Confirm in Cloudflare → Workers & Pages |
| Game frontend (`public/`) | Cloudflare Worker `lifedecode-game` (`wrangler.jsonc`, assets `./public`) | Check run "Workers Builds: lifedecode-game" on every `main` commit |
| Game server | Railway service `lifedecode-game-production` | Commit status "loyal-achievement – lifedecode-game: Success" on every `main` commit |
| Latest deployed game commit | `ecef049` (2026-10-19), still the head of `main` on 2026-10-28 | GitHub commit statuses: Railway, Workers Builds and Vercel all succeeded |

**Consequence:** any push to `lifedecode-game` `main`, including a one-line shell change, also redeploys the Railway game server (players get disconnected) and the game Worker. Before go-live, either:
* set Railway **Watch Paths** so `marketing-site/**` doesn't trigger a deploy, or
* switch the shell during a quiet period, knowing it restarts the server.

## 2. jsDelivr: pinned commit instead of `@main`

* **Verified:**
  * `lifedecode-assets` is public.
  * GitHub serves every V2 file at the immutable SHA (`raw.githubusercontent.com/…/<SHA>/…`, byte-identical to the commit). Checked for `ludo78.js`, the key art, a skin, a location and `ludo77.js`.
  * The package at that SHA is 37.2 MB, and the largest file is 2.5 MB.
* **Not verified from this sandbox:** jsDelivr itself. The environment's network policy blocks `cdn.jsdelivr.net`.
  * jsDelivr documents `/gh/<user>/<repo>@<commit>/<file>` URLs and per-package size limits. Confirm the current limit; it is commonly cited as 50 MB for GitHub.
  * Verify in a browser, or allow `cdn.jsdelivr.net` in this environment's network settings and I'll check. Each URL should return **200** with the right content type:
    ```
    https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@<SHA>/ludo78.js
    https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@<SHA>/assets/v2/keyart-1536.webp
    https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@<SHA>/assets/v2/skins/emberborn-1200.webp
    https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@<SHA>/assets/v2/og-website-v2-1200x630.jpg
    ```
* `ludo78.js` takes its art from the same ref it was loaded from (`document.currentScript.src`). A pinned script therefore always gets pinned art. Even the injected `<script>` the production shell uses gets a `currentScript`; the local shell QA run covers that path.

**Merging into `main` is not needed, and skipping it is the safer option.**
* Production keeps loading `@main/ludo77.js` exactly as today, and `main`'s package size stays at about 10 MB. A larger `main` is the only way V2 could put `ludo77.js` at risk.
* Rollback is a one-line revert.
* The one obligation: the pinned commit must stay reachable on GitHub. Don't delete or force-push `feature/website-v2`. Better still, push a tag on the release commit, for example `website-v2-rc1`. The URL still uses the SHA, because tags can be moved.
* Merging into `main` can wait until after launch, as housekeeping.

## 3. Staging (isolated; prepared, not deployed)

**Method:** a **separate** Cloudflare Pages project created by Direct Upload. It gets its own `*.pages.dev` URL, with no custom domain, no DNS or zone changes, and no link to the production project or to `lifedecode-game`.

1. Push the release commit and its tag (needs your approval). jsDelivr can only serve commits that are on GitHub.
2. Build the staging shell from a read-only checkout of the game repo:
   ```bash
   node tools/build-marketing-shell.mjs --from /path/to/lifedecode-game/marketing-site --sha <SHA> --mode staging --out /tmp/ld-staging
   ```
   This changes the loader (pinned `ludo78.js`) and the new metadata. It also adds:
   * a `noindex` meta tag and an `X-Robots-Tag` header;
   * a `robots.txt` with `Disallow: /`;
   * a small "STAGING" ribbon.

   It removes the sitemap and `_redirects`. `/terms`, `/policy` and `/support` are copied unchanged.
3. Deploy. Either you run this from a machine logged in with `npx wrangler login`, or you give this environment a Cloudflare API token scoped to *Account → Cloudflare Pages → Edit*, plus the account ID, and allow `api.cloudflare.com`:
   ```bash
   npx wrangler pages project create lifedecode-v2-staging --production-branch staging
   ```
   ```bash
   npx wrangler pages deploy /tmp/ld-staging --project-name lifedecode-v2-staging --branch staging
   ```
   This gives `https://lifedecode-v2-staging.pages.dev`.
4. Staging limits. These are expected, not bugs:
   * **Supabase redirects:** OAuth (Google, Apple) and email links redirect only to allowed URLs. To test them on staging, add `https://lifedecode-v2-staging.pages.dev/**` under Supabase → Auth → URL Configuration → Redirect URLs (a production auth setting; remove it afterwards). Otherwise test email + password on staging and OAuth right after go-live.
   * **Railway API:** the support form and daily check-in call it. CORS uses `LD_ALLOWED_ORIGIN(S)`. If that is `*` or unset they work; otherwise staging requests are refused. Don't change the variable for staging, because that redeploys the game server. Test these right after go-live instead.
   * **Real data:** staging uses the real Supabase project. Use a test account, and never press Delete account with a real one.
5. Teardown:
   ```bash
   npx wrangler pages project delete lifedecode-v2-staging
   ```

## 4. SEO and social metadata (applied by `build-marketing-shell.mjs`)

| Tag | Value |
|---|---|
| `<title>` | LifeDecode World — A free social fantasy world in your browser |
| description | Explore a strange, hand-painted world, meet ridiculous locals and real players, train in the Dojo and level up your spirit. Free to play, right in your browser. |
| og/twitter title | LifeDecode World |
| og/twitter description | A strange, cozy social world in your browser. Explore, meet ridiculous locals and real players, and level up your spirit. Free to play. |
| og/twitter image | `assets/v2/og-website-v2-1200x630.jpg` at the pinned SHA (1200×630, with type, size and alt text) |
| also | `og:site_name`, `theme-color #03020a`; canonical and `og:url` stay `https://lifedecode.app/` |

The copy avoids counts that depend on live state, such as "twenty places". The card is rebuilt with `node tools/build-og-image.mjs`.

## 5. Go-live checklist

1. **Hands-on checks** on world.lifedecode.app with a test account. Tick `liveVerified: true` in `CONTENT.updates` for each, then rebuild. If one fails, edit or remove that item.
   * Duels: 9 types, a Casual wager, Ranked.
   * Dojo trial and belts; Shadow Arena vs The Doubter.
   * Buy or visit a home, adopt a pet, Main Street Pizza.
   * Friend request, chat, emote, online status.
   * Hunger and Thirst.
   * Settings → Delete account opens the confirmation. Don't confirm.
2. Run the build check (it should pass with no `LIVE_VERIFIED` warning), run QA, commit, push and tag. The release SHA is that commit.
3. Run the section-2 jsDelivr checks at that SHA, then test staging (section 3).
4. Note your rollback points:
   * the current Cloudflare deployment of the shell;
   * the current loader line (`@main/ludo77.js?v=" + Date.now()`).
5. Confirm Railway Watch Paths, or pick a quiet period (section 1).
6. In a **clean clone of `lifedecode-game` `origin/main`** (never the development worktree with unpushed Cinema, Relationships, Mood & Needs and Movie Creator commits):
   ```bash
   node /path/to/lifedecode-assets/tools/build-marketing-shell.mjs --from marketing-site --sha <SHA> --mode release --out /tmp/ld-release
   ```
   ```bash
   cp /tmp/ld-release/index.html marketing-site/index.html
   ```
   ```bash
   git diff --stat
   ```
   The diff stat must show exactly one file. Review `/tmp/ld-release.index-html.diff`, then commit and deploy the way the shell is normally deployed.
7. Within 15 minutes, on lifedecode.app:
   * `ludo78.js` and its art load from `@<SHA>` with no 4xx errors;
   * `/terms`, `/policy`, `/privacy` and `/support` are unchanged;
   * www redirects to the apex domain;
   * login with email, Google and Apple, password reset, and logout;
   * Account → Delete account opens `world.lifedecode.app/delete-account`;
   * a test support request arrives;
   * Play Now opens the game;
   * checks on iOS Safari and Android Chrome;
   * the link preview in a social or chat app.
8. Watch for 24 hours: Supabase auth logs, Railway errors on `/api/support-request` and `/api/daily-checkin`, and Cloudflare 4xx/5xx counts.

## 6. Rollback

1. **Instant:** Cloudflare → the shell's project → Deployments → the previous production deployment → *Rollback to this deployment*. No git needed.
2. **Make it stick:** in the clean clone, `git revert <shell commit>` and push. This restores `@main/ludo77.js`, so a later deploy can't bring V2 back by accident. It is a game-repo push, so Watch Paths apply again.
3. **The assets repo needs nothing:** `ludo77.js` was never changed, and `ludo76.js` is still there. Don't delete the V2 commit or tag, and don't force-push.

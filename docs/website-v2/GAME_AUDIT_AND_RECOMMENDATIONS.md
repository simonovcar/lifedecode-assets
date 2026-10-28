# LifeDecode World — gameplay audit for Website V2

Source: `simonovcar/lifedecode-game` `main` @ `ecef049` (2026-10-19). This was a read-only shallow clone with push disabled locally, and nothing in the game repo was modified.

**Important caveat:** this audit shows what exists in `main`. I couldn't confirm that `main` is exactly what is deployed at `world.lifedecode.app`. Your local, uncommitted Movie Creator Phase 4 work is **not** in this repo.

Status: recommendations only. Website V2 (`ludo78.js` @ `35233e6`) has **not** been changed.

---

## 1. How the live homepage is actually served (correction)

The V2 docs assumed Webflow. That's wrong for the current setup:

* `lifedecode.app` is a **Cloudflare Pages** site built from `lifedecode-game/marketing-site/`. The folder contains `index.html`, `/policy`, `/terms`, `/support`, `_redirects`, `sitemap.xml` and `robots.txt`.
* `marketing-site/index.html` is a minimal shell:
  1. It loads `@supabase/supabase-js@2`.
  2. It injects `https://cdn.jsdelivr.net/gh/simonovcar/lifedecode-assets@main/ludo77.js?v=<Date.now()>`, except on `/terms`, `/policy` and `/privacy`.
* `/support` is its own static page and never loads the landing script.
* Consequences for V2:
  * **Deployment** means changing one filename in `lifedecode-game/marketing-site/index.html` (`ludo77.js` → `ludo78.js`, ideally commit-pinned). That's a **game-repo** change, so you make it yourself after approval; I didn't touch it.
  * There's no `/premium` page in `marketing-site/`. `CFG.PREMIUM_URL` probably falls through to the homepage, which explains why v77 removed the Shop link.
  * **SEO lives in that shell.** Its `<title>` is still the old *"LifeDecode AI – Decode what you can't stop thinking about"*, and its `og-image.png` is the square 512 px app icon. Recommendation: update the title and description, and use `assets/v2/og-1200x630.jpg` from this repo.

## 2. What is implemented (verified in code)

### Locations: 20 hand-painted maps (`public/content/maps.js`)
* **Social hubs**: Plaza (a tall scrolling hub with entrances to the other areas), Brew Haven, Chill Zone.
* **Shops and services**: Pet Shop, AstraVault (Astra's outfit vault), LifeMart, Main Street Pizza.
* **Work**: LifeFactory Hall 1.
* **Adventure and growth**:
  * Soulcore;
  * Mind Zone and Inside the Mind Zone (unlocked through play);
  * Shadow Arena (unlocked through play);
  * Ascension Peaks and Path of Ascension, the Dojo;
  * Wonder House and Bloom Gate.
* **Homes**: the Wonder of Homes district, plus the Mushroom Home, Wizzard Tower and Cloud Nest interiors.

Each map has a real background in `public/assets/` (1–4 MB PNGs). A contact sheet was sent with the audit summary.

### Social and multiplayer
* Real-time shared rooms over WebSockets, with chat and emotes.
* Friends and friend requests (logged-in players only).
* Visiting other players' homes; the owner can remove visitors.
* Moderation tools (block/report, blocked-word filtering).
* **Guest mode is an ephemeral demo.** Nothing survives a reload. V2's "sign in to keep your progress" is accurate.

### Games and activities
* **Duels**, player-vs-player challenges in 9 types:
  * Speed Math, Geography, Animals, Food;
  * Movies, Music, Word Duel;
  * Typing Race, Memory.

  Optional Dust wagers, plus a ranked Arena with an Elo leaderboard.
* **Dojo with Master Kaien**: a turn-based "Shadow Duel" (block, dodge, wait, counter) and a 12-belt ladder from White to **Mythic**, with trials and a leaderboard.
* **Shadow Arena**: confront inner demons (The Doubter, The Urge, The Shame and others) by choosing **Accept / Challenge / Ignore**. Each demon has a different right answer. This is the clearest concrete example of the "grow through play" idea.
* **Brew Haven coffee minigame**, which earns Beans.
* **Daily Reward Chest** on a 30-day cycle.

### Story and NPCs
* **68 quest-path tasks** with comic NPC storylines:
  * Drunk Dave's lost coin and cellar;
  * "Kaien Has Questions";
  * Velvyria's riddles;
  * The Wanderer's rumours;
  * waking Sylene in the Wonder House;
  * Astra's back rack.
* NPCs with art in `public/assets/`: Ria, Astra, Kaien, Sylene, Nyas, Drunk Dave, Miles, Velvyria, The Wanderer, plus the Dealer, the Pizza worker and the Wizzard.
* **Ria** runs the AI daily check-in journal, which awards XP.
* **Velvyria Decode** is an AI "oracle".

### Ownership and economy
* **Currencies**: Soul Dust (soft), Beans (coffee money, tradeable for Dust at Soulcore) and LifeCoins (premium, real money).
* **LifeDecode+**: a subscription, sold via Stripe and Google Play. Apple IAP isn't implemented.
* **Pets**: 16 in the Pet Shop (Leonardo, Fabricio, Joylee, Riko, Kiwi, Aqua, Lunyx and others), bought with Dust or LifeCoins. They follow you, and other players can see them.
* **Homes**: Mushroom Home (Dust), Wizzard Tower and Cloud Nest (LifeCoins). Each comes with a **Soul Furnace** that earns Dust passively.
* **Work and business**:
  * LifeFactory shifts (40 Dust + 20 XP, up to 20 a day).
  * **Main Street Pizza** is a *player-ownable business*. You can buy it, set prices, withdraw earnings and resell it.
  * Hunger and Thirst stats are restored with LifeMart and Pizza food.
* **Cosmetics**: outfit sets bought at AstraVault:
  * Soul Cowboy, Shadow Ninja, Astral Pirate and Dark Princess (the four in the key art);
  * plus Tree Emperor and Void Emperor.

### Present but switched off: do not advertise
* **LifeDecode Cards** and **Veyra**, the Cards NPC: `LD_CARDS_FEATURE_VISIBLE = false` and `VEYRA_CONFIG.enabled = false`. Both have been hidden since 2026-10-02.
* **Perks** (Miles' shop): removed.
* **Cinema, Movie Creator, Organizations and careers** don't exist in this repo at all. The Plaza background does show a *Cinema* storefront, so never caption Plaza art as "Cinema".

## 3. Corrections needed in Website V2 copy

| V2 / v77 claim | Reality in code | Recommendation |
|---|---|---|
| "Meet the Silly Squad", described as the world's residents / NPCs | Cowboy, Ninja, Pirate and Princess are **player outfit sets** sold at AstraVault | Reframe as "Dress your spirit" (outfits) and add a separate "Meet the locals" strip with the real NPCs. |
| "Four rooms. Infinite chaos." | 20 locations | Change to "A world of places", with real location art. |
| Room cards with CSS sigils | Real backgrounds exist | Use the real art, labelled "In-game location". |
| "Not pay-to-win" / "not from paying to win" | LifeCoins (real money) buy pets, cosmetics and two homes, and homes generate passive Dust through the Furnace | **Your decision.** Either keep the claim knowingly, or soften it to "Progress comes from playing" and "Cosmetics, pets and homes — no shortcuts to the story". |
| "Plaza, Brew Haven, Soulcore and Mind Zone are open today" (news card) | Many more locations are open | Update the copy. |
| "Grow through play … NPC moments that quietly teach real-life skills" | True | Make it concrete with Shadow Arena (Accept / Challenge / Ignore), the Dojo and Ria's check-in. |
| "Create an account with email or Google" | True; Apple sign-in degrades gracefully | Keep. |

## 4. Recommended Website V2 improvements (not implemented)

1. **Explore the World gallery** built from the real map art.
   * Feature 6–8 locations: Plaza, Brew Haven, Soulcore, Mind Zone, Shadow Arena, AstraVault, Main Street Pizza and Wonder of Homes. Add a "+12 more" line.
   * Optional filter chips: Social · Adventure · Homes · Work.
   * Convert the art to WebP (~1200 px wide, ≈120–200 KB each) under `lifedecode-assets/assets/v2/locations/`, lazy-loaded.
2. **Dress your spirit.** Keep the interactive key-art viewer, but present the four as outfits from Astra's Vault, adding Tree Emperor and Void Emperor.
3. **Meet the locals**: a portrait strip of Kaien, Drunk Dave, Velvyria, Sylene, Astra, Ria and The Wanderer, each with a one-line quest hook taken from the real quest text.
4. **"Things to do" pillars rebuilt from verified systems**:
   * Duel anyone (9 game types, ranked Arena);
   * Train at the Dojo (12 belts to Mythic);
   * Face your inner demons (Shadow Arena);
   * Adopt a pet (16);
   * Own a home (and visit friends');
   * Work, earn and run a business (Factory, Main Street Pizza);
   * Quests with ridiculous NPCs (68 tasks);
   * Friends, chat and emotes.
5. **News & Updates**: keep the honest status labels. Movie Creator stays "In development". Don't list Cards unless you plan to bring it back.
6. **Gameplay screenshots.** The background art has no players, UI or pets in it. For real gameplay shots, capture from `world.lifedecode.app` using **test accounts only**, so no real players' usernames or chat appear. Suggested shots:
   * a busy Plaza with chat bubbles and emotes;
   * a pet following a spirit;
   * a duel in progress;
   * a Dojo fight against Kaien;
   * a Shadow Arena demon choice;
   * a home interior with the Furnace;
   * ordering at Main Street Pizza.

   Save them at 1600 px, convert to WebP, and caption them factually.
7. **Shell/SEO** (game-repo change, yours to make): update the `<title>`, description and OG image in `marketing-site/index.html`, and switch the script to a commit-pinned `ludo78.js` when approved.

Payload note: the real art is heavy (20 × 1–4 MB). It must be converted and lazy-loaded to keep V2's 458 KB first-load budget roughly intact. Only the hero should load eagerly.

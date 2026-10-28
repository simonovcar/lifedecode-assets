# Website V2 — feature claims: source-confirmed vs. live-verified

Everything Website V2 advertises was **confirmed in `lifedecode-game` source** (`main` @ `ecef049`, read-only). None of it has been **verified on the live game**: the build sandbox can't reach `world.lifedecode.app`, and the repo may not match what's deployed.

Before deployment, play through each row on `world.lifedecode.app` (a test account is fine) and tick the last column. If a row fails, edit or remove that line in `CONTENT` (`tools/ludo78.src.js`) and rebuild.

| # | Claim on the page | Where it appears | Source evidence | Live ✓ |
|---|---|---|---|---|
| 1 | Free to play, with optional in-game purchases (LifeCoins, LifeDecode+) | Hero, prologue, finale, footer | Guest mode and free accounts; Stripe/Google Play LifeCoins and subscription (`server.js`, economy audit) | ☐ |
| 2 | Twenty places; the 12 featured locations shown with their real art | Explore the World | `public/content/maps.js` (20 maps) | ☐ |
| 3 | Mind Zone and Shadow Arena unlock as you progress | Gallery tags | `mindZoneUnlocked` / `shadowArenaUnlocked` (`scenes.js`) | ☐ |
| 4 | Plaza links to Brew Haven, Soulcore, Astra's Vault and the Mind Zone path | Plaza caption | Plaza art and transitions (`maps.js`) | ☐ |
| 5 | Drunk Dave in Brew Haven; coffee machine earns Beans | Brew Haven caption, locals | Quest hints, Brew Haven minigame (`config.js`) | ☐ |
| 6 | Nyas in Soulcore trades Beans for Soul Dust | Soulcore caption, locals | Soulcore trade (`scenes.js`), quest hints | ☐ |
| 7 | Full character skins at Astra's Vault (Soul Cowboy, Shadow Ninja, Astral Pirate, Dark Princess; Tree and Void Emperor named). Presented as complete looks, never separate pieces | Choose your form, Updates | **Owner direction (Oct 2026):** the live game uses full skins. Note: shared-repo `cosmetics.js` @ `ecef049` still describes slot-based hat/body items, so the deployed build is ahead of the repo | ☐ |
| 8 | Dojo with Master Kaien: turn-based Shadow Duels (block, dodge, wait, counter); trials vs The Doubter, The Urge and The Shame; 11 belts, White → Mythic | Adventures | `LD_DOJO_DUEL_CONFIG` and `LD_DOJO_ASCENSION_CONFIG` (`config.js`) | ☐ |
| 9 | Shadow Arena vs The Doubter: dodge projectiles and pick responses; the quoted whisper and the three options are round 1 verbatim | Adventures | `SHADOW_BATTLE_CONFIG` and `SHADOW_DEMON_WAVES` (`config.js`) | ☐ |
| 10 | Player duels in 9 types; optional Soul Dust wagers; ranked Arena | Adventures | `LD_DUEL_TYPE_META` (`config.js`), duel wager RPCs, Arena Elo | ☐ |
| 11 | 16 pets, Rare → Ancient, level-gated, and they follow you | Make it your life | `public/content/pets.js` | ☐ |
| 12 | Homes: Mushroom Home, Wizzard Tower and Cloud Nest, each with a Soul Furnace; friends can visit | Make it your life | `public/content/houses.js`, `mpGetCurrentHouseVisitors` (`ui.js`) | ☐ |
| 13 | LifeFactory shifts pay Soul Dust and XP; Main Street Pizza can be bought, priced and its earnings collected | Make it your life | `factoryjobs.js`, `businesses.js`, business RPCs | ☐ |
| 14 | Daily Chest on a 30-day cycle; LifeMart food; Hunger and Thirst | Make it your life | `chest.png` UI, economy audit §5, `ui.js` hunger/thirst | ☐ |
| 15 | Real-time multiplayer rooms, chat, emotes, friends and online status | A world you share | `multiplayer.js`, `ldSocial*` (`ui.js`) | ☐ |
| 16 | Dozens of NPC quests; day/night secrets | A world you share | 52 quest tasks (`config.js`); "late at night" quest hints | ☐ |
| 17 | Locals and their places: Ria and Velvyria (Plaza), Drunk Dave (Brew Haven), Kaien (Dojo), Nyas (Soulcore), Astra (AstraVault), Sylene (Wonder House), The Wanderer | Locals carousel | NPC configs and quest hints; quoted lines are verbatim quest text | ☐ |
| 18 | Ria is an AI companion you can talk to | Locals carousel | `RIA_CONFIG` (`config.js`, Phase 3B) | ☐ |
| 19 | iPhone app: Coming soon | Updates | Owner statement; `ios-app/` exists, TestFlight off | ☐ |
| 20 | Mood & Needs: **Recently added**, with Hunger and Thirst live and Mood in development | Updates | Hunger/Thirst in `ui.js` (Phase 5.8a, "very recent"); no mood system in the shared repo | ☐ |
| 21 | Relationships: **In development**, with Friends & friend requests live and deeper relationships in development | Updates | `ldSocial*` friend system in `ui.js`; nothing beyond friendships in the shared repo | ☐ |
| 22 | Cinema: **In development**; the building stands on the Plaza with a "coming soon" marquee; screenings not open | Updates | Plaza art only; `config.js` says no Enter interaction exists for the Cinema; no cinema code in the shared repo | ☐ |
| 23 | Movie Creator: **In development** | Updates | Owner statement (Phase 4 unfinished); not in the shared repo | ☐ |
| 24 | A fairer economy: **Ongoing** move of rewards, purchases and wagers to server-side checks | Updates | `docs/ECONOMY_AUDIT_2026-09-13.md`, `ECONOMY_PHASE2_IMPLEMENTATION.md`, recent server-authority commits | ☐ |

**Deliberately not advertised:**
* Cards and Veyra: hidden by `LD_CARDS_FEATURE_VISIBLE = false`.
* Cinema, Movie Creator, deeper Relationships and Mood as *live*: they're shown only as In development. Organizations and careers aren't shown at all.
* Unused demon art (Urge/Shame/Void sprites etc.): not wired into the game.
* House-agent sprites: only in the inert `houses.js`.
* Framed card portraits.

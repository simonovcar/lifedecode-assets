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
| 7 | Outfit sets at Astra's Vault: Soul Cowboy (Rare), Shadow Ninja, Astral Pirate, Dark Princess (Epic), Tree and Void Emperor (Mythic robes); hat + body pieces; some sets for Soul Dust, others for LifeCoins | Dress your spirit | `public/content/cosmetics.js` | ☐ |
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
| 19 | iPhone app "coming soon"; Movie Creator "in development" | News, iOS badge | Owner statement; `ios-app/` exists, TestFlight off | ☐ |

**Deliberately not advertised:**
* Cards and Veyra: hidden by `LD_CARDS_FEATURE_VISIBLE = false`.
* Cinema, Movie Creator (as live), Organizations and careers: not in the repo.
* Unused demon art (Urge/Shame/Void sprites etc.): not wired into the game.
* House-agent sprites: only in the inert `houses.js`.
* Framed card portraits.

# Website V2 — feature claims: source-confirmed vs. live-verified

**Live** claims were confirmed in `lifedecode-game` source (`main` @ `ecef049`, read-only). **In development** claims come from the owner's verified local development commits, which aren't on GitHub (`2ed45e6` Cinema V2.1, `0134ece` Relationships V1, `7beff92` Mood & Needs V1, `3524bc4` Movie Creator 3.4) and the new skin system. None of it has been **verified on the live game**: the build sandbox can't reach `world.lifedecode.app`, and the repo may not match what's deployed.

Before deployment, play through each row on `world.lifedecode.app` (a test account is fine) and tick the last column. If a row fails, edit or remove that line in `CONTENT` (`tools/ludo78.src.js`) and rebuild.

| # | Claim on the page | Where it appears | Source evidence | Live ✓ |
|---|---|---|---|---|
| 1 | Free to play, with optional in-game purchases (LifeCoins, LifeDecode+) | Hero, prologue, finale, footer | Guest mode and free accounts; Stripe/Google Play LifeCoins and subscription (`server.js`, economy audit) | ☐ |
| 2 | Twenty places; the 12 featured locations shown with their real art | Explore the World | `public/content/maps.js` (20 maps) | ☐ |
| 3 | Mind Zone and Shadow Arena unlock as you progress | Gallery tags | `mindZoneUnlocked` / `shadowArenaUnlocked` (`scenes.js`) | ☐ |
| 4 | Plaza links to Brew Haven, Soulcore, Astra's Vault and the Mind Zone path | Plaza caption | Plaza art and transitions (`maps.js`) | ☐ |
| 5 | Drunk Dave in Brew Haven; coffee machine earns Beans | Brew Haven caption, locals | Quest hints, Brew Haven minigame (`config.js`) | ☐ |
| 6 | Nyas in Soulcore trades Beans for Soul Dust | Soulcore caption, locals | Soulcore trade (`scenes.js`), quest hints | ☐ |
| 7 | Full character skins (new system): Base Blue and Base Rose starter forms, plus Emberborn, Abyssal Tide, Clockwork Soul, Void Wanderer, Verdant Keeper, Frost Revenant, Crimson Oracle, Luminous Druid, Shadow Harlequin, Starforged Knight and Bone Warden. Each is one complete sprite replacement. Labelled **In development** | Choose your form, Updates | **Owner-confirmed, in the local dev worktree only.** No skin PNGs are reachable from the cloud sandbox: not on any `lifedecode-game` branch on GitHub. Plates show abstract colour orbs until the real PNGs are built with `tools/build-skin-assets.py`. The old Cowboy/Ninja/Pirate/Princess art is no longer presented as skins | ☐ |
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
| 20 | Mood & Needs: Hunger and Thirst **Live**; Energy, Social, Fun and moodlets **Dev build** | Updates (In development) | Hunger/Thirst in shared `main` (`ui.js`). Mood & Needs V1 = owner-verified dev commit `7beff92` (not on GitHub) | ☐ |
| 21 | Relationships: Friends & friend requests **Live**; relationships beyond friends **Dev build** | Updates (In development) | Friend system in shared `main`. Relationships V1 = owner-verified dev commit `0134ece` (not on GitHub) | ☐ |
| 22 | Cinema: cinema and screenings **Dev build**; Movie Creator integration **In progress**; not open to players | Updates (In development) | Cinema V2.1 = owner-verified dev commit `2ed45e6` (not on GitHub). Shared `main` has only the Plaza facade | ☐ |
| 23 | Movie Creator: create and edit films **Dev build**; submission, moderation and public screening **In progress** | Updates (In development) | Phase 3.4 = owner-verified dev commit `3524bc4`; Phase 4 unfinished and uncommitted (not reconstructed) | ☐ |
| 24 | A fairer economy: **Ongoing** move of rewards, purchases and wagers to server-side checks | Updates | `docs/ECONOMY_AUDIT_2026-09-13.md`, `ECONOMY_PHASE2_IMPLEMENTATION.md`, recent server-authority commits | ☐ |

**Deliberately not advertised:**
* Cards and Veyra: hidden by `LD_CARDS_FEATURE_VISIBLE = false`.
* Cinema, Movie Creator, deeper Relationships and Mood as *live*: they're shown only as In development. Organizations and careers aren't shown at all.
* Unused demon art (Urge/Shame/Void sprites etc.): not wired into the game.
* House-agent sprites: only in the inert `houses.js`.
* Framed card portraits.

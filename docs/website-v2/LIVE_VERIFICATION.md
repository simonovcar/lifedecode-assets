# Website V2 — feature claims: source-confirmed vs. live-verified

**Live** claims were confirmed in `lifedecode-game` source (`main` @ `ecef049`, read-only). **In development** claims come from the owner's verified local development commits, which aren't on GitHub (`2ed45e6` Cinema V2.1, `0134ece` Relationships V1, `7beff92` Mood & Needs V1, `3524bc4` Movie Creator 3.4) and the new skin system. None of it has been **verified on the live game**: the build sandbox can't reach `world.lifedecode.app`, and the repo may not match what's deployed.

**Terminology:** the roadmap's *Available now* lane is still only **confirmed in GitHub `main`**, and `main` isn't necessarily what's deployed. Every *Available now* item carries `liveVerified: false`, and `node tools/build-website-v2.mjs --check` prints a `WARN LIVE_VERIFIED` line until each one is checked on world.lifedecode.app and set to `true`.

Before deployment, play through each row on `world.lifedecode.app` (a test account is fine) and tick the last column. If a row fails, edit or remove that line in `CONTENT` (`tools/ludo78.src.js`) and rebuild.

| # | Claim on the page | Where it appears | Source evidence | Live ✓ |
|---|---|---|---|---|
| 1 | Free to play, with optional in-game purchases (LifeCoins, LifeDecode+) | Hero, prologue, finale, footer | Guest mode and free accounts; Stripe/Google Play LifeCoins and subscription (`server.js`, economy audit) | ☐ |
| 2 | Twenty places; the 12 featured locations shown with their real art | Explore the World | `public/content/maps.js` (20 maps) | ☐ |
| 3 | Mind Zone and Shadow Arena unlock as you progress | Gallery tags | `mindZoneUnlocked` / `shadowArenaUnlocked` (`scenes.js`) | ☐ |
| 4 | Plaza links to Brew Haven, Soulcore, Astra's Vault and the Mind Zone path | Plaza caption | Plaza art and transitions (`maps.js`) | ☐ |
| 5 | Drunk Dave in Brew Haven; coffee machine earns Beans | Brew Haven caption, locals | Quest hints, Brew Haven minigame (`config.js`) | ☐ |
| 6 | Nyas in Soulcore trades Beans for Soul Dust | Soulcore caption, locals | Soulcore trade (`scenes.js`), quest hints | ☐ |
| 7 | Full character skins: a gallery of **48 original in-game skin images** (2 starter forms + 46 full skins), each one complete sprite. Labelled **In development** | Choose your form, Updates | Owner-supplied PNGs from the local dev worktree (`LifeDecode-Skins-Part1..6.zip`), optimized by `tools/build-skin-assets.py`. Per-file provenance is in `assets/v2/skins/manifest.json`. **Names:** see *Skin names to confirm* below. **Rarity:** not in the supplied files, so not shown | ☐ |
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


## Skin names to confirm (before release)

Internal filenames don't always match in-game display names, and no skin registry was supplied.

**Confirmed or owner-given (8):**
* Base Blue and Base Rose: `adultblue3.png` / `adultpink3.png`, byte-identical to the game's `ld_char_blue` / `ld_char_pink` player sprites.
* Exact filename matches: Emberborn, Abyssal Tide, Clockwork Soul, Void Wanderer, Verdant Keeper.
* Inferred: **Frost Revenant** from `skin_frost.png`, the only frost skin. ☐ confirm.

**Owner-listed names with no matching file:** Crimson Oracle, Luminous Druid, Shadow Harlequin, Starforged Knight, Bone Warden. One of the files below may be one of these under a different internal name. They are not assigned by guesswork.

**Shown with a name derived from the filename (40):** confirm each, or supply the real display name. Then edit `DISPLAY_NAMES` in `tools/build-skin-assets.py` and rebuild.

| Name shown | Source file | ✓ |
|---|---|---|
| Abyssal Oracle | `skin_abyssal_oracle.png` | ☐ |
| Amethyst Oracle | `skin_amethyst_oracle.png` | ☐ |
| Ancient Grove | `skin_ancient_grove.png` | ☐ |
| Bloodmoon Shogun | `skin_bloodmoon_shogun.png` | ☐ |
| Celestial Ascendant | `skin_celestial_ascendant.png` | ☐ |
| Crimson Count | `skin_crimson_count.png` | ☐ |
| Eclipse Warden | `skin_eclipse_warden.png` | ☐ |
| Hallowveil Harbinger | `skin_hallowveil_harbinger.png` | ☐ |
| Hollow Puppeteer | `skin_hollow_puppeteer.png` | ☐ |
| Jade Emperor Spirit | `skin_jade_emperor_spirit.png` | ☐ |
| Plague Doctor | `skin_plague_doctor.png` | ☐ |
| Plague Lantern | `skin_plague_lantern.png` | ☐ |
| Ronin Spirit | `skin_ronin_spirit.png` | ☐ |
| Sunstone Guardian | `skin_sunstone_guardian.png` | ☐ |
| The Acorn Guardian | `skin_the_acorn_guardian.png` | ☐ |
| The Blossom Dreamer | `skin_the_blossom_dreamer.png` | ☐ |
| The Cinnamon Bandit | `skin_the_cinnamon_bandit.png` | ☐ |
| The Dreadtide Corsair | `skin_the_dreadtide_corsair.png` | ☐ |
| The Fool King | `skin_the_fool_king.png` | ☐ |
| The Gilded Moth | `skin_the_gilded_moth.png` | ☐ |
| The Lantern Judge | `skin_the_lantern_judge.png` | ☐ |
| The Lily Crown Prince | `skin_the_lily_crown_prince.png` | ☐ |
| The Little Dragon Napper | `skin_the_little_dragon_napper.png` | ☐ |
| The Little Lantern Haunt | `skin_the_little_lantern_haunt.png` | ☐ |
| The Mooncap Witch | `skin_the_mooncap_witch.png` | ☐ |
| The Moonmail Courier | `skin_the_moonmail_courier.png` | ☐ |
| The Patchwork Jester | `skin_the_patchwork_jester.png` | ☐ |
| The Pocket Buccaneer | `skin_the_pocket_buccaneer.png` | ☐ |
| The Porcelain Requiem | `skin_the_porcelain_requiem.png` | ☐ |
| The Puddle Pilot | `skin_the_puddle_pilot.png` | ☐ |
| The Red Widow | `skin_the_red_widow.png` | ☐ |
| The Silent Executioner | `skin_the_silent_executioner.png` | ☐ |
| The Smiling Hollow | `skin_the_smiling_hollow.png` | ☐ |
| The Stained Glass Sovereign | `skin_the_stained_glass_sovereign.png` | ☐ |
| The Star Marshal | `skin_the_star_marshal.png` | ☐ |
| The Starwhisper Bunny | `skin_the_starwhisper_bunny.png` | ☐ |
| The Teacup Trickster | `skin_the_teacup_trickster.png` | ☐ |
| The Teacup Winky | `skin_the_teacup_winky.png` | ☐ |
| The Weeping Saint | `skin_the_weeping_saint.png` | ☐ |
| Voidwalker | `skin_voidwalker.png` | ☐ |

"""Build Website V2 full-character skin images from the real skin PNGs.

The new skin system (one complete character sprite per skin, no hat/body
overlays) lives in the owner's local development worktree. The owner
supplied the original PNGs (skin_<internal_id>.png, 1024x1536 RGBA) as
uploads; this tool turns them into web assets. It never invents or
substitutes artwork: a skin without a PNG is simply not built.

    python3 tools/build-skin-assets.py <folder-with-skin-pngs>

Outputs, per skin (slug = internal id with "_" -> "-"):
  assets/v2/skins/<slug>-1200.webp   large preview (trimmed, 1200px tall)
  assets/v2/skins/<slug>-600.webp    preview for phones / 1x screens
  assets/v2/skins/<slug>-thumb.webp  240px-tall thumbnail
  assets/v2/skins/manifest.json      source file, name provenance, sizes
  tools/generated/skin-roster.js     roster spliced into ludo78.js by
                                     tools/build-website-v2.mjs

Display names: internal filenames do not always match in-game display
names. DISPLAY_NAMES holds only names the owner has given; every other
skin falls back to its filename (title-cased) and is flagged
nameSource="filename" so it can be confirmed before release. Rarity is
not included in the uploaded files, so none is shown.
"""
import json
import os
import sys

from PIL import Image

if len(sys.argv) < 2:
    sys.exit(__doc__)
SRC = os.path.abspath(sys.argv[1])
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "assets", "v2", "skins")
GEN = os.path.join(ROOT, "tools", "generated")
os.makedirs(OUT, exist_ok=True)
os.makedirs(GEN, exist_ok=True)

# internal id -> (display name, provenance). Only owner-supplied names.
DISPLAY_NAMES = {
    "emberborn": ("Emberborn", "owner-listed; exact filename match"),
    "abyssal_tide": ("Abyssal Tide", "owner-listed; exact filename match"),
    "clockwork_soul": ("Clockwork Soul", "owner-listed; exact filename match"),
    "verdant_keeper": ("Verdant Keeper", "owner-listed; exact filename match"),
    "frost": ("Frost Revenant", "owner-listed; matched to skin_frost.png (only frost skin) - please confirm"),
    "void_wanderer": ("Void Wanderer", "owner-listed; exact filename match (Part6 upload)"),
}
# Starter forms: the game's base player sprites (ld_char_blue / ld_char_pink in
# lifedecode-game ui.js/scenes.js, byte-identical to the uploaded files),
# named by the owner as Base Blue and Base Rose.
STARTERS = {
    "adultblue3.png": ("base-blue", "Base Blue", "owner-named starter; file identical to game sprite ld_char_blue"),
    "adultpink3.png": ("base-rose", "Base Rose", "owner-named starter; file identical to game sprite ld_char_pink"),
}
# Owner-listed names with no matching file in the upload (reported, never guessed).
UNMATCHED_OWNER_NAMES = ["Crimson Oracle", "Luminous Druid", "Shadow Harlequin", "Starforged Knight", "Bone Warden"]
FEATURED_FIRST = ["emberborn", "abyssal_tide", "clockwork_soul", "void_wanderer", "frost", "verdant_keeper"]


def title_from_id(iid):
    small = {"of", "and"}
    words = iid.split("_")
    return " ".join(w if (w in small and i) else w.capitalize() for i, w in enumerate(words))


def glow_colour(im):
    # Average colour of the most saturated opaque pixels: a backdrop tint
    # sampled from the artwork itself, not picked by hand.
    small = im.copy()
    small.thumbnail((96, 96))
    px = []
    for r, g, b, a in (small.get_flattened_data() if hasattr(small, "get_flattened_data") else small.getdata()):
        if a < 200:
            continue
        mx, mn = max(r, g, b), min(r, g, b)
        if mx < 60:
            continue
        px.append((mx - mn, r, g, b))
    if not px:
        return "#8a6bff"
    px.sort(reverse=True)
    top = px[: max(12, len(px) // 6)]
    r = sum(p[1] for p in top) // len(top)
    g = sum(p[2] for p in top) // len(top)
    b = sum(p[3] for p in top) // len(top)
    return "#%02x%02x%02x" % (r, g, b)


files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".png") and (f.lower().startswith("skin_") or f in STARTERS))
roster, manifest = [], {}
for f in files:
    starter = STARTERS.get(f)
    iid = starter[0].replace("-", "_") if starter else f[5:-4]
    slug = iid.replace("_", "-")
    im = Image.open(os.path.join(SRC, f)).convert("RGBA")
    bbox = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    entry = {}
    for suffix, h, q in (("1200", 1200, 86), ("600", 600, 84), ("thumb", 240, 80)):
        h = min(h, im.height)
        w = round(im.width * h / im.height)
        name = f"{slug}-{suffix}.webp"
        im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, name), "WEBP", quality=q, method=6, alpha_quality=92)
        entry[suffix] = {"file": name, "size": [w, h], "bytes": os.path.getsize(os.path.join(OUT, name))}
    if starter:
        display, source = starter[1], starter[2]
    else:
        display, source = DISPLAY_NAMES.get(iid, (title_from_id(iid), "filename"))
    colour = glow_colour(im)
    manifest[slug] = {"sourceFile": f, "internalId": iid, "name": display, "nameSource": source, "glow": colour, "images": entry}
    roster.append({"id": slug, "name": display, "starter": bool(starter),
                   "nameVerified": bool(starter) or (iid in DISPLAY_NAMES and "confirm" not in source),
                   "glow": colour, "w": entry["1200"]["size"][0], "h": entry["1200"]["size"][1],
                   "tw": entry["thumb"]["size"][0], "th": entry["thumb"]["size"][1]})

order = {iid.replace("_", "-"): i for i, iid in enumerate(FEATURED_FIRST)}
roster.sort(key=lambda s: (0 if s["starter"] else 1, order.get(s["id"], 99), s["name"].lower().removeprefix("the ")))

with open(os.path.join(OUT, "manifest.json"), "w") as fh:
    json.dump({"source": "owner upload (LifeDecode-Skins-Part1..5.zip), local development worktree",
               "unmatchedOwnerNames": UNMATCHED_OWNER_NAMES, "skins": manifest}, fh, indent=2)

with open(os.path.join(GEN, "skin-roster.js"), "w") as fh:
    fh.write("  // GENERATED by tools/build-skin-assets.py - do not edit by hand.\n")
    fh.write("  // nameVerified:false = display name taken from the internal filename;\n")
    fh.write("  // confirm against the game's skin registry before release.\n")
    fh.write("  const SKIN_ROSTER = " + json.dumps(roster, ensure_ascii=False, indent=2).replace("\n", "\n  ") + ";\n")

total = sum(e["bytes"] for m in manifest.values() for e in m["images"].values())
print(f"{len(roster)} skins built, {total / 1024 / 1024:.1f} MB total; verified names: {sum(s['nameVerified'] for s in roster)}; "
      f"filename names: {sum(1 for m in manifest.values() if m['nameSource'] == 'filename')}")

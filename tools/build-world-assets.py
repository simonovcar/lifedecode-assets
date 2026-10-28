"""Build optimized Website V2 "world" assets from the LifeDecode game repo.

Reads original artwork from a read-only checkout of simonovcar/lifedecode-game
(public/assets/) and writes small WebP derivatives into assets/v2/world/ of
this repo. Nothing in the game repo is modified.

    python3 tools/build-world-assets.py [path/to/lifedecode-game]

Every output records its source file in assets/v2/world/manifest.json, along
with the game commit it was built from, so provenance stays auditable.
"""
import json
import os
import subprocess
import sys

from PIL import Image

GAME = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "lifedecode-game"))
SRC = os.path.join(GAME, "public", "assets")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "v2", "world")
os.makedirs(OUT, exist_ok=True)

# Location backgrounds: (output id, source file, focal crop box as fractions
# (left, top, right, bottom) or None for the full frame). Output is 3:2.
# Plaza is cropped to its upper half on purpose: the lower half shows a
# "Cinema — coming soon" storefront, which must not read as a live feature.
LOCATIONS = [
    ("plaza", "plaza.png", (0.02, 0.0, 0.98, 0.385)),
    ("brew-haven", "brew_interior.png", None),
    ("soulcore", "soulcore2.png", None),
    ("mind-zone", "mindzonev2.png", None),
    ("path-of-ascension", "poa5.png", None),
    ("shadow-arena", "shadowarena.png", None),
    ("astravault", "astravault.png", None),
    ("pet-shop", "petshop.png", None),
    ("wonder-of-homes", "wonderofhomes3.png", None),
    ("main-street-pizza", "pizza_interior_main.png", None),
    ("bloom-gate", "bloomgate.png", None),
    ("chill-zone", "chillzone.png", None),
    # The Cinema facade on the Plaza (with its in-world "coming soon" sign),
    # used only on the "In development" Cinema update card.
    ("plaza-cinema", "plaza.png", (0.0, 0.335, 0.70, 0.598)),
]
LOCATION_WIDTHS = (320, 640, 1280)

# Transparent sprites: (output id, source file, output height in px).
SPRITES = [
    # In-world NPC sprites (the unframed versions scenes.js renders, NOT the
    # framed card art in content/cards.js — Cards is hidden in production).
    ("npc-ria", "ria.png", 520),
    ("npc-velvyria", "velvyria2.png", 520),
    ("npc-drunk-dave", "drunkdave2.png", 520),
    ("npc-kaien", "kaien2.png", 520),
    ("npc-nyas", "nyas2.png", 520),
    ("npc-astra", "astra2.png", 520),
    ("npc-sylene", "sylene2.png", 520),
    ("npc-wanderer", "thewanderer2.png", 520),
    ("npc-pizza-worker", "pizza_worker.png", 420),
    # Shadow Arena — The Doubter is the only demon wired into the arena.
    ("demon-doubter", "thedoubter.png", 560),
    # Objects
    ("soul-furnace", "soulfurnace.png", 360),
    ("daily-chest", "chest.png", 300),
    # Pets (content/pets.js)
    ("pet-leonardo", "leonardo.png", 260),
    ("pet-kiwi", "kiwi.png", 260),
    ("pet-joylee", "joylee.png", 260),
    ("pet-riko", "riko.png", 260),
    ("pet-lunyx", "lunyx.png", 300),
    ("pet-helion", "helion.png", 300),
    ("pet-madius", "madius.png", 300),
    ("pet-aqua", "aqua.png", 300),
]


def crop_3x2(im, box):
    w, h = im.size
    if box:
        im = im.crop((round(box[0] * w), round(box[1] * h), round(box[2] * w), round(box[3] * h)))
        w, h = im.size
    target = 3 / 2
    if w / h > target:
        nw = round(h * target)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w / target)
    y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


def game_commit():
    try:
        return subprocess.check_output(["git", "-C", GAME, "rev-parse", "HEAD"], text=True).strip()
    except Exception:
        return "unknown"


manifest = {"sourceRepo": "simonovcar/lifedecode-game", "sourceCommit": game_commit(), "files": {}}
total = 0

for oid, src, box in LOCATIONS:
    im = crop_3x2(Image.open(os.path.join(SRC, src)).convert("RGB"), box)
    for width in LOCATION_WIDTHS:
        w = min(width, im.width) if width == LOCATION_WIDTHS[-1] else width
        out = im.resize((w, round(w * 2 / 3)), Image.LANCZOS)
        name = f"loc-{oid}-{width}.webp"
        out.save(os.path.join(OUT, name), "WEBP", quality=74, method=6)
        size = os.path.getsize(os.path.join(OUT, name))
        total += size
        manifest["files"][name] = {"source": "public/assets/" + src, "size": [out.width, out.height], "bytes": size}

for oid, src, height in SPRITES:
    im = Image.open(os.path.join(SRC, src)).convert("RGBA")
    bbox = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    if im.height > height:
        im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    name = f"{oid}.webp"
    im.save(os.path.join(OUT, name), "WEBP", quality=82, method=6)
    size = os.path.getsize(os.path.join(OUT, name))
    total += size
    manifest["files"][name] = {"source": "public/assets/" + src, "size": [im.width, im.height], "bytes": size}

with open(os.path.join(OUT, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=2)
print(f"{len(manifest['files'])} files, {total / 1024:.0f} KB total, from {manifest['sourceCommit'][:7]}")

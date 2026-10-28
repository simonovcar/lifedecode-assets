"""Build Website V2 full-character skin images from the real skin PNGs.

The new skin system (one complete character sprite per skin) lives in the
owner's local development worktree, not in the shared lifedecode-game repo,
so Website V2 ships with `art: false` plates until the real files exist.

    python3 tools/build-skin-assets.py <folder-with-skin-pngs>

Each PNG is matched to a skin by its file name (case-insensitive; spaces,
dashes and underscores ignored), e.g. "Emberborn.png", "abyssal_tide.png",
"skin-starforged-knight.png". Output: assets/v2/skins/<id>.webp, trimmed and
scaled to 640px tall, plus manifest.json. Then set `art: true` for each
built skin in CONTENT.skins (tools/ludo78.src.js) and rebuild ludo78.js.
Never substitute other artwork for a missing skin.
"""
import json
import os
import re
import sys

from PIL import Image

SKINS = ["base-blue", "base-rose", "emberborn", "abyssal-tide", "clockwork-soul", "void-wanderer",
         "verdant-keeper", "frost-revenant", "crimson-oracle", "luminous-druid", "shadow-harlequin",
         "starforged-knight", "bone-warden"]

if len(sys.argv) < 2:
    sys.exit(__doc__)
SRC = os.path.abspath(sys.argv[1])
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "v2", "skins")
os.makedirs(OUT, exist_ok=True)

norm = lambda v: re.sub(r"[^a-z0-9]", "", v.lower())
files = [f for f in os.listdir(SRC) if f.lower().endswith(".png")]
manifest, missing = {}, []
for sid in SKINS:
    match = [f for f in files if norm(sid) in norm(os.path.splitext(f)[0])]
    if not match:
        missing.append(sid)
        continue
    src = sorted(match, key=len)[0]
    im = Image.open(os.path.join(SRC, src)).convert("RGBA")
    bbox = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    if im.height > 640:
        im = im.resize((round(im.width * 640 / im.height), 640), Image.LANCZOS)
    name = sid + ".webp"
    im.save(os.path.join(OUT, name), "WEBP", quality=84, method=6)
    manifest[name] = {"source": src, "size": [im.width, im.height], "bytes": os.path.getsize(os.path.join(OUT, name))}

with open(os.path.join(OUT, "manifest.json"), "w") as fh:
    json.dump({"files": manifest, "missing": missing}, fh, indent=2)
print(f"built {len(manifest)} skin images; missing: {', '.join(missing) or 'none'}")

"""Downloads creature renders for the ambient aquarium into src/assets/swimmers/.

Sources: every hunt with a verified wiki image (src/data/hunts.json) plus a short list of
iconic fish (src/data/fish.json). Only URLs answering HTTP 200 with an image are kept.
Saved as small transparent WebP named slug(name).webp so fish detail pages can find them.
"""
import io, json, re, sys, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/assets/swimmers"
ICONIC = ["Whale Shark", "Great White Shark", "Phantom Megalodon", "Isonade", "Nessie", "Megalodon",
          "Ancient Megalodon", "Leviathan", "Kraken", "Great Hammerhead Shark", "Orca", "Blue Whale",
          "Narwhal", "Beluga", "Colossal Squid", "Mosslurker", "Dreadfin", "Manta Ray", "Sea Turtle"]
WIDTH = 220

def slug(s: str) -> str:
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", s.lower()))

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    hunts = json.load(open(ROOT / "src/data/hunts.json"))
    fish = {f["name"]: f for f in json.load(open(ROOT / "src/data/fish.json"))}
    todo = {h["name"]: h["image"] for h in hunts if h.get("image")}
    for n in ICONIC:
        if n in fish and fish[n].get("image"):
            todo.setdefault(n, fish[n]["image"])
    ok = 0
    for name, url in todo.items():
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "FischCodex/1.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                if r.status != 200 or not r.headers.get("content-type", "").startswith("image"):
                    continue
                im = Image.open(io.BytesIO(r.read())).convert("RGBA")
            if im.width > WIDTH:
                im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
            im.save(OUT / f"{slug(name)}.webp", "WEBP", quality=72, method=6)
            ok += 1
        except Exception as e:  # skip anything missing; never guess
            print("skip", name, e, file=sys.stderr)
    print(f"saved {ok}/{len(todo)} swimmers")

if __name__ == "__main__":
    main()

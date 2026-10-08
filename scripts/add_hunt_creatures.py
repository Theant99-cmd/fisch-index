"""Point hunt images at the official creature renders on Fischipedia (static.wikitide.net)."""
import json, hashlib
RENDERS = {"Mosslurker Hunt": "Mosslurker.png", "Dreadfin Hunt": "Dreadfin.png",
           "Narwhal Hunt": "Narwhal.png", "Beluga Hunt": "Beluga.png"}
def url(f):
    h = hashlib.md5(f.encode()).hexdigest()
    return f"https://static.wikitide.net/fischwiki/{h[0]}/{h[:2]}/{f}"
p = "src/data/hunts.json"; d = json.load(open(p))
for e in d:
    if e["name"] in RENDERS: e["image"] = url(RENDERS[e["name"]])
json.dump(d, open(p, "w"), ensure_ascii=False, indent=1)

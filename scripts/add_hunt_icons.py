"""Attach an official creature render (static.wikitide.net) to every hunt that lacks one.
Tries '<Creature>.png' then '<Hunt name>.png'; keeps only URLs the wiki image server confirms (HTTP 200).
Also probes '<Fish>.png' for fish (field `image`, null when not found)."""
import json, hashlib, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

def url(f):
    f = f.replace(" ", "_")
    h = hashlib.md5(f.encode()).hexdigest()
    return f"https://static.wikitide.net/fischwiki/{h[0]}/{h[:2]}/{urllib.parse.quote(f)}"

def ok(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, method="HEAD", headers={"User-Agent": "Mozilla/5.0"}), timeout=15)
        return r.status == 200
    except Exception:
        return False

def first(cands):
    for c in cands:
        u = url(c)
        if ok(u):
            return u
    return None

p = "src/data/hunts.json"; d = json.load(open(p))
def hunt(e):
    if e.get("image"): return e["image"]
    base = e["name"].removesuffix(" Hunt")
    return first([f"{base}.png", f"{e['name']}.png", f"{base} Hunt Totem.png", f"{base}.webp"])
with ThreadPoolExecutor(16) as ex:
    for e, img in zip(d, ex.map(hunt, d)): e["image"] = img
json.dump(d, open(p, "w"), ensure_ascii=False, indent=1)
print("hunts", sum(bool(e["image"]) for e in d), "/", len(d))

p = "src/data/fish.json"; f = json.load(open(p))
with ThreadPoolExecutor(32) as ex:
    for e, img in zip(f, ex.map(lambda e: first([f"{e['name']}.png"]), f)): e["image"] = img
json.dump(f, open(p, "w"), ensure_ascii=False, indent=1)
print("fish", sum(bool(e["image"]) for e in f), "/", len(f))

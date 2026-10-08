"""Attach official wiki image URLs (static.wikitide.net) to rods/items/hunts.
Reads saved Fischipedia snapshots in /tmp/scrape; maps each linked wiki page to the
image shown inside its link. Entries without a found image get image=null."""
import json, re, glob, html, urllib.parse

pairs = {}
pat = re.compile(r'<a href="/wiki/([^"#?]+)"[^>]*>\s*<img[^>]+src="(//static\.wikitide\.net/fischwiki/[^"]+)"')
for f in glob.glob('/tmp/scrape/*.html') + glob.glob('/tmp/scrape/*/*.html'):
    s = open(f, encoding='utf-8', errors='ignore').read()
    for page, src in pat.findall(s):
        key = urllib.parse.unquote(html.unescape(page)).replace(' ', '_').lower()
        m = re.match(r'//static\.wikitide\.net/fischwiki/thumb/(\w/\w\w/[^/]+)/', src)
        full = 'https://static.wikitide.net/fischwiki/' + (m.group(1) if m else src.split('fischwiki/')[1])
        if 'Icon_' in full or 'Environment_' in full:
            continue
        pairs.setdefault(key, full)
    # infobox images on individual pages
    for m in re.finditer(r'<link rel="canonical" href="[^"]*/wiki/([^"]+)"', s):
        ib = re.search(r'class="infobox-img".*?src="(//static\.wikitide\.net/fischwiki/thumb/(\w/\w\w/[^/]+)/)', s, re.S)
        if ib:
            pairs[urllib.parse.unquote(m.group(1)).lower()] = 'https://static.wikitide.net/fischwiki/' + ib.group(2)

def key(url):
    return urllib.parse.unquote(url.split('/wiki/')[-1]).replace(' ', '_').lower()

for fn in ['rods', 'items', 'hunts']:
    p = f'src/data/{fn}.json'
    d = json.load(open(p))
    n = 0
    for e in d:
        k = key(e['sourceUrl'])
        e['image'] = pairs.get(k) or pairs.get(e['name'].replace(' ', '_').lower())
        n += bool(e['image'])
    json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
    print(fn, n, '/', len(d))

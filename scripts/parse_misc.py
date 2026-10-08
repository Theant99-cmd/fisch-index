import json, re
from bs4 import BeautifulSoup
W = 'https://fischipedia.org'
def soup(f): return BeautifulSoup(open(f).read(), 'lxml')
def txt(c): return c.get_text(' ', strip=True) if c else ''
def val(s):
    s = s.strip()
    return None if s in ('', '—', '-', 'None', '?') else s

# ---------- FISH ----------
RAR = {'trash':'Trash','common':'Common','uncommon':'Uncommon','unusual':'Unusual','rare':'Rare','legendary':'Legendary',
       'mythic':'Mythic','exotic':'Exotic','secret':'Secret','apex':'Apex','divine-secret':'Divine Secret','relic':'Relic',
       'fragment':'Fragment','gemstone':'Gemstone','seed':'Seed','event':'Limited','special':'Limited','extinct':'Limited'}
s = soup('p_Fish.html')
fish = []
for tab in s.select('table.fish-table'):
    panel = tab.find_parent(attrs={'id': re.compile('^tabber-')})
    group = panel['id'].replace('tabber-', '').replace('_', ' ')
    for r in tab.find_all('tr'):
        cls = (r.get('class') or [''])[0]
        if not cls.startswith('rarity-'): continue
        cs = r.find_all('td')
        if len(cs) < 10: continue
        a = cs[0].find('a')
        for sp in r.find_all('span', style=re.compile('display: ?none')): sp.decompose()
        key = cls[7:]
        fish.append({
            'name': txt(cs[0]), 'rarity': RAR.get(key, key.title()), 'rawRarity': key,
            'group': group, 'limited': group != 'Permanent Fish',
            'weather': val(txt(cs[1])), 'time': val(txt(cs[2])), 'season': val(txt(cs[3])),
            'bait': val(txt(cs[4])), 'region': val(txt(cs[5])),
            'pricePerKg': val(txt(cs[7])), 'avgKg': val(txt(cs[8])), 'avgValue': val(txt(cs[9])),
            'progressSpeed': None, 'counterStat': None, 'weightRange': None,
            'sourceUrl': W + a['href'] if a else W + '/wiki/Fish',
        })
print('fish', len(fish))

# ---------- MUTATIONS (variants) ----------
s = soup('p_Mutations.html')
muts = []
t = s.select('table.fish-table')[0]
for r in t.find_all('tr')[2:]:
    cs = r.find_all('td')
    if len(cs) < 5: continue
    v = re.search(r'([\d.]+)×', txt(cs[4]))
    muts.append({'name': txt(cs[1]), 'type': txt(cs[2]), 'multiplier': v.group(1) + '×' if v else None})
print('mutations', len(muts))

# ---------- ENCHANTS ----------
s = soup('p_Relics.html')
ench = []
for t in s.select('table.wikitable'):
    hdr = [txt(c) for c in t.find('tr').find_all(['th', 'td'])]
    if hdr[:2] != ['Name', 'Effect'] and hdr[:3] != ['Name', 'Type', 'Effect']: continue
    h = t.find_previous(['h2', 'h3', 'h4'])
    cat = txt(h).replace('[edit]', '').strip()
    for r in t.find_all('tr')[1:]:
        cs = r.find_all('td')
        if len(cs) < 2: continue
        ei = hdr.index('Effect')
        lines = [l.strip(' •') for l in cs[ei].get_text('\n', strip=True).replace('•', '\n').split('\n')]
        effect = ' '.join(cs[ei].get_text(' ', strip=True).split())
        a = cs[0].find('a')
        extra = txt(cs[2]) if len(cs) > 2 else ''
        ench.append({'name': txt(cs[0]), 'category': cat, 'effect': effect,
                     'isRelic': 'Relic' in cat or 'Crown' in cat or 'Relic' in hdr[-1],
                     'extra': extra, 'sourceUrl': W + '/wiki/Enchanting'})
print('enchants', len(ench), sorted(set(e['category'] for e in ench)))

# ---------- TOTEMS ----------
s = soup('p_Totems.html')
c = s.select_one('.mw-parser-output')
items = []
for h in c.find_all(['h4']):
    name = txt(h).replace('[edit]', '').strip()
    sec = h.find_previous('h3'); seccat = txt(sec).replace('[edit]','').strip()
    desc, obt = '', []
    n = (h.parent if 'mw-heading' in ' '.join(h.parent.get('class') or []) else h).find_next_sibling()
    while n and n.name not in ('h2', 'h3', 'h4') and 'mw-heading' not in ' '.join(n.get('class') or []):
        if n.name == 'p' and not desc and 'totem' in txt(n).lower(): desc = ' '.join(txt(n).split())
        if n.name == 'ul': obt += [' '.join(txt(li).split()) for li in n.find_all('li')]
        n = n.find_next_sibling()
    desc = re.sub(r'\s*It can be obtained.*$', '', desc)
    items.append({'name': name, 'type': 'Totem', 'category': seccat, 'effect': desc or None,
                  'obtain': obt, 'limited': 'Limited' in seccat or 'Unobtainable' in seccat,
                  'sourceUrl': W + '/wiki/' + name.replace(' ', '_')})
print('totems', len(items))

# ---------- HUNTS ----------
s = soup('p_LE.html')
c = s.select_one('.mw-parser-output')
hunts = []
lines = c.get_text('\n', strip=True).split('\n')
sec = None; seen = set()
for k, ln in enumerate(lines):
    if ln in ('Major Events','Countdown Events','Apex Hunts','Localized Events','Disturbance Spawned Events','Admin Events','Trivia'): sec = ln
    if sec in (None, 'Trivia'): continue
    m = re.match(r'^(.*Hunt)(?:\s+(\d.*))?$', ln)
    if not m or ln == 'Apex Hunts' or m.group(1) in seen: continue
    nm = m.group(1); dur = m.group(2) or (lines[k+1] if k+1 < len(lines) else None)
    if dur and not re.search(r'\d|Until', dur): dur = None
    seen.add(nm)
    hunts.append({'name': nm, 'section': sec, 'duration': dur, 'sourceUrl': W + '/wiki/' + nm.replace(' ', '_')})
for it in items:
    if 'Hunt' in it['name']:
        hunts.append({'name': it['name'].replace(' Totem', ''), 'section': 'Totem-summoned', 'duration': None,
                      'trigger': it['name'], 'sourceUrl': it['sourceUrl']})
print('hunts', len(hunts))
json.dump({'fish': fish, 'mutations': muts, 'enchants': ench, 'items': items, 'hunts': hunts},
          open('misc.json', 'w'), indent=1)

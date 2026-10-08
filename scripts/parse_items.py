# Builds non-totem items from the wiki Items page (snapshot 20261002172020) and
# Accessories page (snapshot 20261004211319); merges with existing totems in items.json.
import json, sys
from bs4 import BeautifulSoup
W = 'https://fischipedia.org'
OUT = sys.argv[1]
def txt(c): return ' '.join(c.get_text(' ', strip=True).split()) if c else ''
def link(cell):
    a = cell.find('a', href=True)
    return W + a['href'] if a and a['href'].startswith('/wiki/') else None
CAT = {'Starter Items': 'Tools', 'Reusable Items': 'Tools', 'Consumables': 'Consumables', 'Consumable Items': 'Consumables',
       'Potions': 'Consumables', 'Skin Crates': 'Consumables', 'Eggs': 'Consumables', 'Quest Items': 'Quest Items',
       'Crafting Ingredients': 'Crafting'}
items = [i for i in json.load(open(OUT)) if i.get('type') == 'Totem']
for i in items: i['group'] = 'Totems'
seen = {i['name'] for i in items}
def add(rec):
    if rec['name'] and rec['name'] not in seen:
        seen.add(rec['name']); items.append(rec)
o = BeautifulSoup(open('Items.html', 'rb').read(), 'lxml').select_one('.mw-parser-output')
section, limited, lastq = None, False, None
for el in o.find_all(['h2', 'h3', 'h4', 'table']):
    if el.name[0] == 'h':
        t = el.get_text(strip=True)
        if el.name == 'h2' and t.startswith('Limited'): limited = True
        if el.name == 'h2' and t in ('Change History', 'Navigation'): break
        section = t; continue
    if section not in CAT: continue
    rows = el.find_all('tr'); head = [txt(c) for c in rows[0].find_all(['th', 'td'])]
    for r in rows[1:]:
        cs = r.find_all(['th', 'td'])
        if section == 'Quest Items' and len(cs) == len(head) - 1 and lastq is not None: cs = [lastq] + cs
        if len(cs) != len(head): continue
        d = dict(zip(head, cs))
        if section == 'Quest Items': lastq = d['Quest']
        if section == 'Quest Items':
            nm = txt(d.get('Item')); obtain = txt(d.get('Obtainment') or d.get('Source'))
            effect = 'Quest: ' + txt(d['Quest']).split(' Main article')[0]; src = link(d['Item'])
        elif section == 'Potions':
            nm = txt(d['Potion']); obtain = txt(d['Obtainment']); src = link(d['Potion'])
            effect = ' — '.join(x for x in [txt(d.get('Effect')), txt(d.get('Note')), ('Duration: ' + txt(d['Duration'])) if d.get('Duration') else ''] if x)
        else:
            key = head[0]; nm = txt(d[key]); src = link(d[key])
            obtain = txt(d.get('Cost/Obtainment') or d.get('Source') or d.get('Obtainment') or d.get('Cost'))
            effect = txt(d.get('Notes') or d.get('Used in'))
            if 'Used in' in d and effect: effect = 'Used in: ' + effect
        add({'name': nm, 'type': section, 'group': CAT[section], 'category': section, 'effect': effect or None,
             'obtain': [obtain] if obtain else [], 'limited': limited, 'sourceUrl': src or f'{W}/wiki/Items'})
a = BeautifulSoup(open('Accessories.html', 'rb').read(), 'lxml').select_one('.mw-parser-output')
tb = [t for t in a.find_all('table') if txt(t.find('tr')).startswith('Accessory')][0]
for r in tb.find_all('tr')[2:]:
    cs = r.find_all(['th', 'td'])
    if len(cs) < 5: continue
    nm, ty, ob, ef, av = cs[:5]
    add({'name': txt(nm), 'type': txt(ty) or 'Accessory', 'group': 'Equipment', 'category': txt(ty) or 'Accessory',
         'effect': txt(ef) or None, 'obtain': [txt(ob)] if txt(ob) else [], 'limited': '✓' not in txt(av) and 'Yes' not in txt(av),
         'sourceUrl': link(nm) or f'{W}/wiki/Accessories'})
json.dump(items, open(OUT, 'w'), indent=1)
from collections import Counter
print(len(items), Counter((i['group'], i['limited']) for i in items))

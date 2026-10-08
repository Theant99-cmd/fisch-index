# Appends rods present in the Fishing_Rods master table (table 17, snapshot 20260925022152)
# but missing from src/data/rods.json. Run from a dir containing rods.html + rods/<slug>.html.
import json, re, os, sys, urllib.parse
from bs4 import BeautifulSoup
W = 'https://fischipedia.org'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'rods.json'
def txt(c): return ' '.join(c.get_text(' ', strip=True).split()) if c else ''
def pct(v):
    m = re.match(r'^(-?[\d,.]+)%', v or ''); return float(m.group(1).replace(',', '')) if m else None
def num(v):
    m = re.match(r'^([+-]?[\d,.]+)', v or ''); return float(m.group(1).replace(',', '')) if m else None
def kg(v):
    if not v: return None
    if v.lower().startswith('inf'): return 'inf'
    return num(v)
rods = json.load(open(OUT)); have = {r['id'] for r in rods}
s = BeautifulSoup(open('rods.html', 'rb').read(), 'lxml')
added = 0
for tr in s.select('table')[17].find_all('tr')[1:]:
    a = tr.find('a', href=True)
    if not a or '/wiki/' not in a['href']: continue
    slug = a['href'].split('/wiki/')[1].split('#')[0]
    if slug in have: continue
    L = dict(zip(['name','location','source','stage','lure','luck','control','resilience','maxKg','obtainable'], [txt(c) for c in tr.find_all(['th','td'])]))
    d, passive = {}, []
    f = f'rods/{slug}.html'
    if os.path.exists(f):
        p = BeautifulSoup(open(f, 'rb').read(), 'lxml')
        ib = p.select_one('.infobox')
        if ib:
            for r in ib.select('.infobox-datarow'):
                h = r.select_one('.data-heading'); c = r.select_one('.data-content')
                if h and c: d[txt(h).split(' Level required')[0].split(' Stages solely')[0]] = txt(c)
        c = p.select_one('.mw-parser-output')
        ah = c.find(id='Ability') if c else None
        if ah:
            n = (ah.parent if 'mw-heading' in ' '.join(ah.parent.get('class') or []) else ah).find_next_sibling()
            while n is not None and 'mw-heading' not in ' '.join(n.get('class') or []) and n.name != 'h2':
                if n.name not in ('style', 'figure'):
                    for li in n.find_all('li'):
                        if not li.find('ul'): passive.append(txt(li))
                    if not n.find('li') and txt(n): passive.append(txt(n))
                n = n.find_next_sibling()
    stage = d.get('Stage') or L.get('stage'); sm = re.search(r'(\d+)', stage or '')
    price = d.get('Price')
    rods.append({
        'id': slug, 'name': L.get('name') or urllib.parse.unquote(slug).replace('_', ' '),
        'journal': d.get('Journal') or L.get('location'), 'source': d.get('Source') or L.get('source'),
        'price': price if price and price != 'N/A' else None, 'level': d.get('Level'),
        'wikiStage': int(sm.group(1)) if sm else None,
        'lure': pct(d.get('Lure Speed') or L.get('lure')), 'luck': pct(d.get('Luck') or L.get('luck')),
        'control': num(d.get('Control') or L.get('control')), 'resilience': pct(d.get('Resilience') or L.get('resilience')),
        'maxKg': kg(d.get('Max Kg') or L.get('maxKg')),
        'disturbance': d.get('Disturbance'), 'lineDist': d.get('Line Dist.'),
        'passives': [x for x in passive if x and not x.startswith('.mw-')][:12],
        'limited': L.get('obtainable', '✓') != '✓' or 'Limited' in (d.get('Journal') or L.get('location') or ''),
        'fromPage': bool(d), 'sourceUrl': f'{W}/wiki/{slug}',
    }); added += 1
json.dump(rods, open(OUT, 'w'), indent=1)
print('added', added, 'total', len(rods))

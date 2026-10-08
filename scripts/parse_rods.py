import json, re, os, urllib.parse
from bs4 import BeautifulSoup
W = 'https://fischipedia.org'
def txt(c): return ' '.join(c.get_text(' ', strip=True).split()) if c else ''

# list table (fallback + limited flag)
s = BeautifulSoup(open('rods.html').read(), 'lxml')
lst = {}
for r in s.select('table')[14].find_all('tr')[2:]:
    cs = [txt(c) for c in r.find_all(['th', 'td'])]
    slug = r.find('a')['href'].split('/wiki/')[1]
    lst[slug] = dict(zip(['name','location','source','stage','lure','luck','control','resilience','maxKg'], cs))

def pct(v):
    m = re.match(r'^(-?[\d,.]+)%', v or '')
    return float(m.group(1).replace(',', '')) if m else None
def num(v):
    m = re.match(r'^([+-]?[\d,.]+)', v or '')
    return float(m.group(1).replace(',', '')) if m else None
def kg(v):
    if not v: return None
    if v.lower().startswith('inf'): return 'inf'
    return num(v)

rods = []
for slug, L in lst.items():
    f = f'rods/{slug}.html'
    d = {}
    ability = None
    passive_lines = []
    src_date = None
    if os.path.exists(f) and os.path.getsize(f) > 5000:
        p = BeautifulSoup(open(f).read(), 'lxml')
        ib = p.select_one('.infobox')
        if ib:
            for r in ib.select('.infobox-datarow'):
                h = r.select_one('.data-heading'); c = r.select_one('.data-content')
                if not h or not c: continue
                key = h.find(string=True, recursive=False) or txt(h)
                key = txt(h).split(' Level required')[0].split(' Stages solely')[0]
                d[key] = txt(c)
        c = p.select_one('.mw-parser-output')
        ah = c.find(id='Ability') if c else None
        if ah:
            n = (ah.parent if 'mw-heading' in ' '.join(ah.parent.get('class') or []) else ah).find_next_sibling()
            while n is not None and 'mw-heading' not in ' '.join(n.get('class') or []) and n.name not in ('h2',):
                if n.name not in ('style', 'figure'):
                    for li in n.find_all('li'):
                        if not li.find('ul'): passive_lines.append(txt(li))
                    if not n.find('li') and txt(n): passive_lines.append(txt(n))
                n = n.find_next_sibling()
    lure_raw = d.get('Lure Speed') or L['lure']
    stage = d.get('Stage') or L['stage']
    sm = re.search(r'(\d+)', stage or '')
    price = d.get('Price')
    rec = {
        'id': slug,
        'name': urllib.parse.unquote(slug).replace('_', ' ') if not L['name'] else L['name'],
        'journal': d.get('Journal') or L['location'],
        'source': d.get('Source') or L['source'],
        'price': price if price and price not in ('N/A',) else None,
        'level': d.get('Level'),
        'wikiStage': int(sm.group(1)) if sm else None,
        'lure': pct(lure_raw), 'luck': pct(d.get('Luck') or L['luck']),
        'control': num(d.get('Control') or L['control']),
        'resilience': pct(d.get('Resilience') or L['resilience']),
        'maxKg': kg(d.get('Max Kg') or L['maxKg']),
        'disturbance': d.get('Disturbance'), 'lineDist': d.get('Line Dist.'),
        'passives': [x for x in passive_lines if x and not x.startswith('.mw-')][:12],
        'limited': L['location'] == 'Limited' or 'Limited' in (d.get('Journal') or ''),
        'fromPage': bool(d),
        'sourceUrl': f'{W}/wiki/{slug}',
    }
    rods.append(rec)
print(len(rods), 'from page:', sum(r['fromPage'] for r in rods), 'limited:', sum(r['limited'] for r in rods))
json.dump(rods, open('rods.json', 'w'), indent=1)

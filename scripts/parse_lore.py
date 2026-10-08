"""Copy lore text from saved Fischipedia pages (/tmp/lore/p/<Page>.html, fetched by fetchall.py)
into src/data/lore.json keyed by wiki page name: intro paragraph, Description section, Trivia bullets.
Pages that weren't archived are simply absent (UI then links to the wiki)."""
import re, html, json, glob, os

def clean(t):
    t = re.sub(r'<(script|style|table|sup)[^>]*>.*?</\1>', '', t, flags=re.S)
    t = html.unescape(re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', t))).strip()
    return re.sub(r'\s+([,.;:!?)])', r'\1', t).replace('( ', '(')

def section(s, name):
    m = re.search(r'<h2[^>]*>.*?id="%s".*?</h2>(.*?)(?=<h2|<div class="printfooter|$)' % name, s, re.S)
    return m.group(1) if m else None

out = {}
for fn in glob.glob('/tmp/lore/p/*.html'):
    page = os.path.basename(fn)[:-5]
    s = open(fn, encoding='utf-8', errors='ignore').read()
    body = s[s.find('mw-parser-output'):]
    e = {}
    p = re.search(r'<p>(.*?)</p>', body, re.S)
    if p and len(clean(p.group(1))) > 20: e['intro'] = clean(p.group(1))
    d = section(s, 'Description')
    if d:
        t = re.sub(r'\s*Bestiary (Entry|Hint)\s*$', '', clean(d)).strip()
        if t: e['description'] = t[:1200]
    tr = section(s, 'Trivia')
    if tr:
        items = [clean(li) for li in re.findall(r'<li>(.*?)</li>', tr, re.S)]
        items = [i for i in items if len(i) > 10][:6]
        if items: e['trivia'] = items
    if e: out[page] = e
json.dump(out, open('src/data/lore.json', 'w'), ensure_ascii=False, indent=1, sort_keys=True)
print(len(out), 'pages with lore')

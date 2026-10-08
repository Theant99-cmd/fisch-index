# Adds recurring-spawn data to hunts.json from each hunt page's wiki countdown widget
# (div.countdown[data-type=recurring], data-period / data-period-offset in seconds since Unix epoch),
# plus infobox Stock and the Narwhal Migration spawn chances.
import json, re, sys
from bs4 import BeautifulSoup
OUT = sys.argv[1]
hunts = json.load(open(OUT))
for h in hunts:
    slug = h['sourceUrl'].split('/wiki/')[1]
    try: s = BeautifulSoup(open(f'hunts/{slug}.html', 'rb').read(), 'lxml')
    except FileNotFoundError: continue
    cd = s.select_one('.countdown[data-type=recurring]')
    if not cd: continue
    h['periodSec'] = int(cd['data-period']); h['offsetSec'] = int(cd.get('data-period-offset') or 0)
    t = ' '.join(s.select_one('.mw-parser-output').get_text(' ', strip=True).split())
    short = h['name'].replace(' Hunt', '')
    m = re.search(r'(\d+)% chance every \d+ hours Duration 15 Minutes A Narwhal Migration has a \d+% chance to spawn as an? ' + re.escape(h['name']), t)
    if m: h['chance'] = int(m.group(1)); h['scheduleNote'] = f"Narwhal Migration every 3 hours; {m.group(1)}% chance it is a {h['name']}"
    st = re.search(r'the ' + re.escape(short) + r' can be caught within its pool,? (?:and has|with) a global stock of ([\d,]+)', t)
    if st: h['stock'] = int(st.group(1).replace(',', ''))
    print(h['name'], h.get('periodSec'), h.get('chance'), h.get('stock'))
json.dump(hunts, open(OUT, 'w'), indent=1)

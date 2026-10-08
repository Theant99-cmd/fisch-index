import sys
from bs4 import BeautifulSoup
s=BeautifulSoup(open(sys.argv[1]).read(),'lxml')
print(s.title.text)
for i,t in enumerate(s.select('table.wikitable, table.fish-table')):
  rows=t.find_all('tr');print(i,t.get('class'),len(rows))
  for r in rows[:4]: print('   ',[c.get_text(' ',strip=True)[:35] for c in r.find_all(['th','td'])])

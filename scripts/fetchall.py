import requests, time, os, sys, gzip, concurrent.futures as cf
S = requests.Session(); S.headers['User-Agent'] = 'Mozilla/5.0 FischCodexBot'

def get(url, tries=5):
    for i in range(tries):
        try:
            r = S.get(url, timeout=60)
            if r.status_code == 200: return r
            if r.status_code == 404: return None
        except Exception:
            pass
        time.sleep(4 * (i + 1))
    return None

def one(page, out):
    if os.path.exists(out) and os.path.getsize(out) > 5000: return 'skip ' + page
    r = get(f'http://web.archive.org/web/2027id_/https://fischipedia.org/wiki/{page}')
    if not r: return 'MISS ' + page
    b = r.content
    if b[:2] == b'\x1f\x8b': b = gzip.decompress(b)
    open(out, 'wb').write(b)
    return f'OK {page} {r.url.split("/web/")[1][:14]} {len(b)}'

if __name__ == '__main__':
    lst, d = sys.argv[1], sys.argv[2]; os.makedirs(d, exist_ok=True)
    pages = [l.strip() for l in open(lst) if l.strip()]
    with cf.ThreadPoolExecutor(int(sys.argv[3]) if len(sys.argv) > 3 else 3) as ex:
        for res in ex.map(lambda p: one(p, f'{d}/{p}.html'), pages): print(res, flush=True)

#!/bin/bash
# usage: fetch.sh PageName outfile
u="https://fischipedia.org/wiki/$1"
ts=$(curl -s -m 30 "https://archive.org/wayback/available?url=fischipedia.org/wiki/$1" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('archived_snapshots',{}).get('closest',{}).get('timestamp',''))")
[ -z "$ts" ] && { echo "MISS $1"; exit 1; }
curl -sL -m 60 --compressed "http://web.archive.org/web/${ts}id_/$u" -o "$2.raw"
if gzip -t "$2.raw" 2>/dev/null; then gunzip -c "$2.raw" > "$2"; else mv "$2.raw" "$2"; fi
rm -f "$2.raw"; echo "OK $1 $ts $(wc -c <"$2")"

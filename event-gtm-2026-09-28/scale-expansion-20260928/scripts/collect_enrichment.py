#!/usr/bin/env python3
"""Small official-page evidence batch. No attendee data, no HTML retained. Python requests + bs4."""
import argparse, hashlib, json, re, time, subprocess, sys
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
import requests
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'batches/enrichment.jsonl'
EVIDENCE=ROOT/'evidence/enrichment'
HEADERS={'User-Agent':'EventGTMResearch/1.0 (public factual research; low rate)'}
ROBOT={}; LAST={}; ROWS=[]
def stamp(): return datetime.now(timezone.utc).isoformat()
def sha(v): return hashlib.sha256(v).hexdigest()
def fetch(url):
 host=urlsplit(url).scheme+'://'+urlsplit(url).netloc
 if host not in ROBOT:
  r=requests.get(host+'/robots.txt',headers=HEADERS,timeout=30)
  rp=RobotFileParser(); rp.parse(r.text.splitlines() if r.status_code==200 else [])
  ROBOT[host]=(rp,r.status_code)
  (EVIDENCE/('robots_'+sha(host.encode())[:16]+'.json')).write_text(json.dumps({'url':host+'/robots.txt','status':r.status_code,'observed_at':stamp(),'content_sha256':sha(r.content),'rules':r.text if r.status_code==200 else None}))
 rp,status=ROBOT[host]
 if status not in (200,404,410): raise RuntimeError('Unverified robots status '+str(status))
 if status==200 and not rp.can_fetch(HEADERS['User-Agent'],url): raise RuntimeError('robots disallowed '+url)
 time.sleep(max(0,1.0-(time.monotonic()-LAST.get(host,0))))
 err=None
 for attempt in range(3):
  try:
   r=requests.get(url,headers=HEADERS,timeout=45); LAST[host]=time.monotonic()
   if r.status_code==429: raise RuntimeError('429 stop; no retry against rate limit')
   if r.status_code>=500 and attempt<2: time.sleep(2**attempt); continue
   r.raise_for_status(); break
  except requests.RequestException as e:
   err=str(e)
   if attempt==2: raise
   time.sleep(2**attempt)
 m={'fetch_id':'fetch_enr_'+sha(url.encode())[:16], 'source_url':url,'final_url':r.url,'observed_at':stamp(),'http_status':r.status_code,'content_sha256':sha(r.content),'bytes':len(r.content),'content_type':r.headers.get('Content-Type'),'robots_status':status,'robots_decision':'allowed' if status==200 else 'robots_absent','attempts':attempt+1,'prior_error':err}
 (EVIDENCE/(m['fetch_id']+'.json')).write_text(json.dumps(m,ensure_ascii=False,indent=2))
 if r.content.startswith(b'%PDF'):
  py='/Users/jirustaroure/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3'
  code='import sys,io,json;from pypdf import PdfReader;print(json.dumps([p.extract_text() for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages]))'
  pages=json.loads(subprocess.check_output([py,'-c',code],input=r.content))
  m['pdf_page_count']=len(pages)
  (EVIDENCE/(m['fetch_id']+'.json')).write_text(json.dumps(m,ensure_ascii=False,indent=2))
  from html import escape
  return BeautifulSoup(''.join('<p>'+escape(x)+'</p>' for x in pages),'html.parser'),m
 return BeautifulSoup(r.content,'html.parser'),m

def add(base,meta,**fields):
 row={**base,**{k:meta[k] for k in ['fetch_id','source_url','observed_at','content_sha256']},'evidence_class':'primary','language':'en','confidence':'high_source_explicit','confidence_explanation':'Named official organizer page; assertion limited to published statement. No independent payment or attendance audit.',**fields}
 if row.get('company_name'):
  raw=row['company_name']
  aliases={'CircleCI horizontal':'CircleCI','ClickHouse (Japan)':'ClickHouse','Nutanix Logo':'Nutanix','LY Corporation (OSS Japan)':'LY Corporation','digital-ocean KCIndia':'DigitalOcean','atlassian':'Atlassian','intuit':'Intuit','splunk a cisco company':'Splunk','tokyo gas':'Tokyo Gas','vultr':'Vultr','ZoZo':'ZOZO','Dragonflydb':'Dragonfly'}
  row['company_name_raw']=raw
  row['company_name']=aliases.get(raw,raw)
  row['company_aliases']=[raw] if raw!=row['company_name'] else []
 identity=json.dumps({k:v for k,v in row.items() if k not in ['observed_at','content_sha256','fetch_id','confidence','confidence_explanation']},sort_keys=True,ensure_ascii=False)
 row['assertion_id']='enr_'+sha(identity.encode())[:20];ROWS.append(row)

def checkpoint(): OUT.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in ROWS))

def main():
 EVIDENCE.mkdir(parents=True,exist_ok=True)
 for year,start,end in [(2024,'2024-02-03','2024-02-04'),(2025,'2025-02-01','2025-02-02'),(2026,'2026-01-31','2026-02-01')]:
  u=f'https://archive.fosdem.org/{year}/about/sponsors/'
  s,m=fetch(u);base={'event_title':f'FOSDEM {year}','event_start':start,'event_end':end,'event_url':f'https://archive.fosdem.org/{year}/','city':'Brussels','country':'Belgium'}
  level=None
  for h in s.select('#main h2'):
   a=h.find('a',href=True)
   if not a: level=h.get_text(' ',strip=True);continue
   block=h.find_next_sibling('div',class_='s-unit'); paragraphs=block.find_all('p') if block else []
   last=paragraphs[-1].get_text(' ',strip=True) if paragraphs else ''
   support='financial_support_explicit' if 'financially' in last else 'in_kind_support_explicit' if any(x in last for x in ['uplink','infrastructure','location','provides']) else 'sponsor_named'
   add(base,m,kind='sponsor_named',company_name=a.get_text(' ',strip=True),company_url=a['href'],role='sponsor',level=level,support_type=support,paid_contract_verified=False,amount=None,locator=('#'+h['id']) if h.get('id') else ('#main h2 a[href='+json.dumps(a['href'])+']; heading='+a.get_text(' ',strip=True)),definition=last)
  checkpoint()
 for slug,start,end,city,country in [('japan','2025-06-16','2025-06-17','Tokyo','Japan'),('india','2025-08-06','2025-08-07','Hyderabad','India')]:
  root=f'https://events.linuxfoundation.org/archive/2025/kubecon-cloudnativecon-{slug}/'
  base={'event_title':f'KubeCon + CloudNativeCon {slug.title()} 2025','event_start':start,'event_end':end,'event_url':root,'city':city,'country':country}
  home,hm=fetch(root)
  add(base,hm,kind='organizer',company_name='Cloud Native Computing Foundation',company_url='https://www.cncf.io/',role='organizer',locator='homepage introductory paragraph',definition='Organizer identifies conference as CNCF flagship event.')
  s,m=fetch(root+'sponsor-list/')
  for bi,block in enumerate(s.select('.wp-block-cgb-sponsors-block'),1):
   h=block.select_one('.sponsors-logos--header');level=h.get_text(' ',strip=True) if h else None
   if not level: continue
   for a in block.select('.sponsors-logo-item a'):
    name=a.get('title','').removeprefix('Go to ').strip()
    if not name: name=(a.img.get('alt','') if a.img else '').removesuffix(' logo')
    role='media_partner' if 'media' in level.lower() else 'community_partner' if 'community' in level.lower() else 'sponsor'
    add(base,m,kind='sponsor_named',company_name=name,company_url=a['href'],role=role,level=level,support_type='named_only',paid_contract_verified=False,amount=None,locator=f'sponsor block {bi}; heading={level}; a[title={json.dumps(a.get("title"))}]',definition='Named in official archived sponsor list under stated heading.')
  checkpoint()
 root='https://2025.pycon.org.au/';s,m=fetch(root+'sponsor/')
 base={'event_title':'PyCon AU 2025','event_start':'2025-09-12','event_end':'2025-09-16','event_url':root,'city':'Melbourne','country':'Australia'}
 names={'valkey':'Valkey','psf':'Python Software Foundation','snowflake':'Snowflake','aws':'AWS','elastic':'Elastic','google':'Google','electron-workshop':'Electron Workshop','kraken':'Kraken','planet-innovation':'Planet Innovation','linux-australia':'Linux Australia'}
 level=None
 for el in s.select('main h2,main p[id]'):
  if el.name=='h2':level=el.get_text(' ',strip=True);continue
  a=el.find('a',href=True);key=el.get('id')
  if key not in names or not a:continue
  add(base,m,kind='organizer' if level=='Auspice' else 'sponsor_named',company_name=names[key],company_url=a['href'],role='auspice' if level=='Auspice' else 'sponsor',level=level,support_type='named_only',paid_contract_verified=False,amount=None,locator='#'+key,definition='Named under official sponsor/auspice heading; organizer collectively acknowledges financial commitment, individual amounts unpublished.')
 checkpoint()
 # Curated non-sponsor assertions: re-fetch and verify required literal evidence.
 config=ROOT/'scripts/enrichment_curated.json'
 if config.exists():
  for entry in json.loads(config.read_text()):
   s,m=fetch(entry['source_url']); body=s.get_text(' ',strip=True)
   for fact in entry['facts']:
    needle=fact.pop('required_text',None)
    if needle and needle.casefold() not in body.casefold(): raise ValueError('Expected evidence absent: '+needle)
    add(entry.get('event',{}),m,**fact)
   checkpoint()
 assert len({r['assertion_id'] for r in ROWS})==len(ROWS)
 print(json.dumps({'rows':len(ROWS),'kinds':{k:sum(r['kind']==k for r in ROWS) for k in sorted({r['kind'] for r in ROWS})}}))
if __name__=='__main__':main()

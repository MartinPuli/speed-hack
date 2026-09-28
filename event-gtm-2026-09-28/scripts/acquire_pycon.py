"""Research-only bounded extraction of publicly linked sponsor directories.
Stores factual names/tiers/URLs and our metadata, not page text or guest lists.
Commercial reuse rights remain pending. Standard library, one request at a time.
"""
import datetime, hashlib, json, time, urllib.request, urllib.parse, re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.headings=[]; self.links=[]; self.h=None; self.a=None; self.buf=[]; self.ab=[]; self.tier=None; self.images=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag in ('h1','h2','h3'): self.h=tag; self.buf=[]
        if tag=='a': self.a=attrs.get('href'); self.ab=[]
        if tag=='img' and self.tier and attrs.get('alt','').endswith(' Logo'):
            self.images.append((self.tier,attrs['alt'][:-5],self.a))
    def handle_data(self, data):
        if self.h: self.buf.append(data)
        if self.a: self.ab.append(data)
    def handle_endtag(self, tag):
        if tag==self.h:
            value=' '.join(''.join(self.buf).split())
            self.headings.append((tag,value)); self.h=None
            if tag=='h2': self.tier=value
        if tag=='a' and self.a:
            self.links.append((self.a,' '.join(''.join(self.ab).split()))); self.a=None

B={'batch':'pycon-official-2022-2026','method':'bounded_public_html_headings_v1','sources':[], 'editions':[], 'attempts':[], 'queue':[]}
def fetch(url):
    started=time.monotonic()
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'GrowthAtlasResearch/0.1 (limited public factual metadata)'}),timeout=30) as r:
            raw=r.read(); final=r.url; status=r.status
        p=Page(); body=raw.decode('utf-8'); p.feed(body); p.raw_links=re.findall(r'<a[^>]*href=[\"\x27]([^\"\x27]*sponsorship/sponsors/[^\"\x27]*)',body)
        B['attempts'].append({'url':url,'status':status,'final_url':final,'bytes_read':len(raw),'elapsed_ms':round((time.monotonic()-started)*1000),'raw_retained':False,'checked_at':NOW})
        return p,final
    except Exception as e:
        B['attempts'].append({'url':url,'status':'error','notes':str(e),'checked_at':NOW}); return None,url

def source(url,title):
    B['sources'].append({'url':url,'title':title,'publisher':'Python Software Foundation','source_type':'organizer_official','language':'en','published_at':None,'checked_at':NOW,'access_method':'public_html_get','reuse_status':'pending_commercial_review','raw_retained':False})

DATES={2022:('2022-04-27','2022-05-03','Salt Lake City','Salt Palace Convention Center'),2023:('2023-04-19','2023-04-27','Salt Lake City','Salt Palace Convention Center'),2024:('2024-05-15','2024-05-23','Pittsburgh','David L. Lawrence Convention Center'),2025:('2025-05-14','2025-05-22','Pittsburgh','David L. Lawrence Convention Center'),2026:('2026-05-13','2026-05-19','Long Beach','Long Beach Convention Center')}
for year,(start,end,city,venue) in DATES.items():
    home=f'https://us.pycon.org/{year}/'
    p,home=fetch(home)
    if not p: continue
    source(home,f'PyCon US {year} official edition')
    # Follow an actual directory link in the observed edition page, never infer sponsor endpoint.
    links=[(u,t) for u,t in p.links if t.strip().lower() in ('sponsors','our sponsors') and 'sponsor' in u]
    if not links and p.raw_links: links=[(p.raw_links[0],'Sponsors')]
    if not links: B['queue'].append({'url':home,'next_action':'Locate sponsors link manually','status':'pending'}); continue
    url=urllib.parse.urljoin(home,links[0][0]); time.sleep(.5)
    sp,url=fetch(url)
    if not sp: continue
    source(url,f'PyCon US {year} sponsor directory')
    tier=None; organizations=[]
    if year<=2024:
        for tier,name,website in sp.images:
            role='community_partner' if 'Community' in tier else 'exhibitor' if 'Startup Row' in tier else 'media_partner' if 'Media' in tier else 'sponsor'
            organizations.append({'name':name,'domain':urllib.parse.urlsplit(website).netloc.lower().removeprefix('www.') if website else None,'website':website,'role':role,'tier':tier,'source_url':url,'locator':f'{tier} > image alt {name} Logo','status':'listed_by_organizer','notes':'Explicit edition-specific alt text; no visual logo recognition or cash amount inferred.'})
    for tag,name in sp.headings:
        if tag=='h2': tier=name
        elif tag=='h3' and tier and name:
            role='sponsor'
            if 'Community' in tier: role='community_partner'
            elif 'Startup Row' in tier: role='exhibitor'
            elif 'Media' in tier: role='media_partner'
            elif 'AV' in tier: role='production_partner'
            matches=[u for u,t in sp.links if t.lower().strip() in (('visit '+name).lower(),name.lower()) and u.startswith('http')]
            domain=urllib.parse.urlsplit(matches[0]).netloc.lower().removeprefix('www.') if matches else None
            organizations.append({'name':name,'domain':domain,'website':matches[0] if matches else None,'role':role,'tier':tier,'source_url':url,'locator':f'{tier} > {name}','status':'listed_by_organizer','notes':'Listing establishes published role, not paid amount, attendance, ROI or active demand.'})
    organizations.append({'name':'Python Software Foundation','domain':'python.org','role':'organizer','tier':None,'source_url':home,'status':'listed_by_organizer'})
    B['editions'].append({'key':f'pycon-us-{year}','title':f'PyCon US {year}','series_name':'PyCon US','url':home,'start_date':start,'end_date':end,'date_precision':'day','city':city,'country':'United States','venue_name':venue,'format':'conference','sector':'software_python','status':'historical_listing','source_urls':[home,url],'field_sources':{k:[home] for k in ('title','start_date','end_date','city','country','venue_name')},'organizations':organizations,'metrics':[],'costs':[],'platform_urls':[],'notes':'Date range includes tutorials and sprints; past listing alone is not verified attendance.'})
    (ROOT/'batches'/'pycon-official.json').write_text(json.dumps(B,ensure_ascii=False,indent=2)+'\n')
    time.sleep(.5)
print(json.dumps({'editions':len(B['editions']),'organizations_roles':sum(len(e['organizations']) for e in B['editions']),'sources':len(B['sources']),'attempts':len(B['attempts'])}))

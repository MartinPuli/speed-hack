"""Public licensed bulk files only. No login, attendee data, or raw HTML retention.
Re-run skips completed batches; --refresh observes a new upstream version.
"""
import requests,json,gzip,hashlib,time,datetime,io,zipfile,re,sys
from pathlib import Path
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
ROOT=Path(__file__).resolve().parents[1]
UA='GrowthXEventResearch/2.0 (public open-data research)'
SESSION=requests.Session(); SESSION.headers['User-Agent']=UA
ROBOTS={}; LAST={}
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(b):return hashlib.sha256(b).hexdigest()
def log(o):
 with (ROOT/'manifests/http-open.jsonl').open('a') as f:f.write(json.dumps(o,ensure_ascii=False)+'\n')
def request(url,check=True):
 host=urlsplit(url).netloc
 if check and host not in ROBOTS:
  ru=urlsplit(url).scheme+'://'+host+'/robots.txt'
  r=SESSION.get(ru,timeout=30);p=RobotFileParser();p.parse(r.text.splitlines() if r.status_code==200 and '<html' not in r.text.lower() else [])
  if r.status_code not in (200,404):raise RuntimeError('robots unresolved '+ru)
  ROBOTS[host]=p
  (ROOT/'manifests'/('robots-'+host+'.txt')).write_text(r.text if r.status_code==200 and '<html' not in r.text.lower() else '# HTTP '+str(r.status_code)+'; no robots rules')
  log({'url':ru,'status':r.status_code,'observed_at':now(),'sha256':sha(r.content),'purpose':'robots'})
 if check and not ROBOTS[host].can_fetch(UA,url):
  log({'url':url,'status':'robots_blocked','observed_at':now()});raise RuntimeError('robots disallow '+url)
 for attempt in range(1,4):
  time.sleep(max(0,1.2-(time.monotonic()-LAST.get(host,0))))
  t=time.monotonic()
  try:
   r=SESSION.get(url,timeout=(20,180),allow_redirects=False);LAST[host]=time.monotonic()
   if r.is_redirect:return request(requests.compat.urljoin(url,r.headers['Location']))
   log({'url':url,'status':r.status_code,'attempt':attempt,'observed_at':now(),'duration_ms':round((time.monotonic()-t)*1000),'bytes':len(r.content),'sha256':sha(r.content),'content_type':r.headers.get('Content-Type')})
   if r.status_code in (429,503):
    delay=max(5,int(r.headers.get('Retry-After','5')) if r.headers.get('Retry-After','5').isdigit() else 30);time.sleep(min(delay,60));continue
   r.raise_for_status();return r
  except requests.exceptions.Timeout as e:
   log({'url':url,'status':'timeout','attempt':attempt,'observed_at':now()});time.sleep(3*attempt)
 raise RuntimeError('retry budget exhausted '+url)
def save(name,rows,meta):
 p=ROOT/'batches'/f'{name}.jsonl.gz'
 with gzip.open(p,'wt',encoding='utf8') as f:
  for x in rows:f.write(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n')
 meta.update({'batch':name,'rows_selected':len(rows),'observed_at':now(),'sha256':sha(p.read_bytes()),'path':str(p.relative_to(ROOT)),'extractor_version':'2.0','privacy':'allowlisted event metadata; no attendees, contact fields, images or raw HTML'})
 (ROOT/'manifests'/f'{name}.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2));print(name,len(rows),flush=True)
def exists(name):return (ROOT/'manifests'/f'{name}.json').exists() and '--refresh' not in sys.argv
START='2021-09-28'
def confs():
 if exists('confs-tech'):return
 u='https://codeload.github.com/tech-conferences/conference-data/zip/refs/heads/main';r=request(u);z=zipfile.ZipFile(io.BytesIO(r.content));rows=[];total=0
 licenses=[n for n in z.namelist() if '/LICENSE' in n.upper()];print('License paths',licenses,flush=True)
 for n in licenses:(ROOT/'manifests'/('confs-tech-'+n.split('/')[-1])).write_bytes(z.read(n))
 for n in sorted(z.namelist()):
  m=re.search(r'/conferences/(20\d\d)/([^/]+)\.json$',n)
  if not m:continue
  records=json.loads(z.read(n));total+=len(records)
  for i,x in enumerate(records):
   if (x.get('startDate') or '')<START:continue
   rows.append({'family':'confs-tech','native_id':sha((x.get('name','')+'|'+x.get('startDate','')+'|'+x.get('city','')).encode())[:24],'title':x['name'],'url':x.get('url'),'start':x.get('startDate'),'end':x.get('endDate'),'city':x.get('city'),'country':x.get('country'),'online':x.get('online'),'language':x.get('locales'),'cfp_url':x.get('cfpUrl'),'cfp_end':x.get('cfpEndDate'),'topics':[m[2]],'category':'technology','source_url':'https://github.com/tech-conferences/conference-data/blob/main/'+n.split('/',1)[1],'locator':f'$[{i}]','evidence_class':'secondary','license':'MIT','batch_url':u})
 save('confs-tech',rows,{'source_url':u,'publisher':'confs.tech community','license':'MIT','upstream_sha256':sha(r.content),'rows_read':total,'selection':'start >= 2021-09-28; all topic files; duplicates retained for downstream union'})
def cs():
 if exists('computer-science'):return
 u='https://conferences-computer.science/data/conferences.json';r=request(u);d=r.json();rows=[]
 for i,x in enumerate(d['editions']):
  if (x.get('event_start') or '')<START:continue
  # timezone is deadline timezone per data dictionary; do NOT assign it to the event.
  rows.append({'family':'computer-science','native_id':x['slug']+':'+str(x['year']),'series_native':x['slug'],'series_title':x['acronym'],'title':x['title'],'url':x.get('url'),'start':x.get('event_start'),'end':x.get('event_end'),'city':x.get('city'),'country':x.get('country'),'online':x.get('online'),'latitude':x.get('lat'),'longitude':x.get('lon'),'geo_precision':'city_centroid_publisher_gazetteer','category':'academic-technology','language':'en','cfp_end':x.get('paper_deadline'),'submitted':x.get('submitted'),'accepted':x.get('accepted'),'source_url':u,'locator':f'$.editions[{i}]','evidence_class':'secondary','license':'CC BY-SA 4.0','batch_url':u})
 save('computer-science',rows,{'source_url':u,'publisher':'Étienne André / conferences.computer.science','license':d['licence'],'license_url':d['licence_url'],'upstream_sha256':sha(r.content),'rows_read':len(d['editions']),'source_generated':d.get('generated'),'selection':'event_start >= 2021-09-28; no deadline timezone reused as event timezone'})
def heritage(year,dataset):
 name=f'heritage-{year}'
 if exists(name):return
 meta=request('https://www.data.gouv.fr/api/1/datasets/'+dataset+'/').json()
 resources=[x for x in meta['resources'] if x['format']=='json' and x['url'].startswith('https://static.data.gouv.fr/')]
 if not resources:raise RuntimeError('No static licensed JSON resource')
 u=resources[0]['url'];r=request(u);d=r.json();print(name,'upstream records',len(d),'first keys',list(d[0]),flush=True)
 # Keep only named factual columns. Original descriptions/images/contact fields are discarded.
 allowed={'uid','slug','canonicalurl','title_fr','title_en','firstdate_begin','firstdate_end','lastdate_begin','lastdate_end','timings','location_uid','location_coordinates','location_name','location_address','location_city','location_countrycode','location_region','location_department','location_postalcode','location_website','attendancemode','status','keywords_fr','category','originagenda_uid','originagenda_title','age_min','age_max','updatedat','conditions_fr','accessibility','accessibility_label_fr','title','url','firstdate','lastdate','location','dates','date_debut','date_fin'}
 rows=[]
 for i,x in enumerate(d):
  obj=x.get('fields',x)
  rows.append({'family':'openagenda-heritage','native_id':str(obj.get('uid',x.get('recordid',i))),'record':{k:v for k,v in obj.items() if k in allowed},'source_url':u,'locator':f'$[{i}]','evidence_class':'primary_aggregated','license':meta['license'],'category':'culture-community','language':'fr','batch_url':u})
 save(name,rows,{'source_url':u,'catalog_url':meta['page'],'publisher':meta['organization']['name'],'license':meta['license'],'upstream_sha256':sha(r.content),'rows_read':len(d),'selection':'all records; dates validated at ingestion; OpenAgenda UID one program announcement, timings NOT exploded','source_modified':resources[0].get('last_modified')})
if __name__=='__main__':
 for fn,args in [(confs,()),(cs,()),(heritage,(2023,'64bf48ef0f6336d5979f7201')),(heritage,(2024,'6691fbc4e33ff438151ff6b6'))]:
  try:fn(*args)
  except Exception as e:print(type(e).__name__,str(e),flush=True);log({'stage':fn.__name__,'args':args,'status':'error','error':str(e),'observed_at':now()})

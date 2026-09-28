"""Deterministic offline consolidation. Inherited DB immutable; numbered migration.
Only normalized observed batches are input. Unknown never becomes zero/false.
"""
import sqlite3,hashlib,json,gzip,csv,re,datetime,unicodedata,time,shutil,collections,sys
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parent/'independent-deep-research-20260928';CUTOFF='2026-09-28'
DB=ROOT/'dataset.sqlite'
def sha(b):return hashlib.sha256(b).hexdigest()
def sid(prefix,*args):return prefix+'_'+sha('|'.join(str(x) for x in args).encode())[:24]
def norm(x):return re.sub(r'[^\w]+','',unicodedata.normalize('NFKD',str(x or '')).casefold())
def js(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))
def urlkey(u):
 if not u:return ''
 p=urlsplit(u);return p.netloc.lower().removeprefix('www.')+p.path.rstrip('/')
def day(x):
 try:return datetime.date.fromisoformat(str(x)[:10]).isoformat()
 except (ValueError,TypeError):return None
COUNTRIES={'US':'United States','USA':'United States','UK':'United Kingdom','GB':'United Kingdom','GR':'Greece','FR':'France','DE':'Germany','IT':'Italy','ES':'Spain','PT':'Portugal','NL':'Netherlands','BE':'Belgium','CH':'Switzerland','AT':'Austria','CZ':'Czech Republic','Czechia':'Czech Republic','PL':'Poland','FI':'Finland','SE':'Sweden','NO':'Norway','DK':'Denmark','IE':'Ireland','CA':'Canada','AU':'Australia','NZ':'New Zealand','CN':'China','JP':'Japan','KR':'South Korea','TW':'Taiwan','HK':'Hong Kong','IN':'India','SG':'Singapore','IL':'Israel','TR':'Turkey','BR':'Brazil','AR':'Argentina','MX':'Mexico','CL':'Chile','CO':'Colombia','ZA':'South Africa','AE':'United Arab Emirates','RU':'Russia','HU':'Hungary','RO':'Romania','RS':'Serbia','SK':'Slovakia','SI':'Slovenia','EE':'Estonia','LV':'Latvia','LT':'Lithuania','LU':'Luxembourg','CY':'Cyprus','MT':'Malta','TH':'Thailand','MY':'Malaysia','ID':'Indonesia','VN':'Vietnam','PH':'Philippines','IS':'Iceland','BG':'Bulgaria','HR':'Croatia','UA':'Ukraine','MA':'Morocco','TN':'Tunisia','EG':'Egypt','SA':'Saudi Arabia','QA':'Qatar','JO':'Jordan','IR':'Iran','PK':'Pakistan','BD':'Bangladesh','NP':'Nepal','LK':'Sri Lanka','KE':'Kenya','NG':'Nigeria','GH':'Ghana','UG':'Uganda','TZ':'Tanzania','RW':'Rwanda','SN':'Senegal','CM':'Cameroon','ET':'Ethiopia','CI':"Côte d’Ivoire",'PE':'Peru','EC':'Ecuador','UY':'Uruguay','CR':'Costa Rica','PA':'Panama','DO':'Dominican Republic','BO':'Bolivia','PR':'Puerto Rico','GE':'Georgia','AM':'Armenia','AZ':'Azerbaijan','KZ':'Kazakhstan','UZ':'Uzbekistan'}
COUNTRIES.update({'U.S.A.':'United States','U.K.':'United Kingdom','Scotland':'United Kingdom','DZ':'Algeria','MO':'Macao','MU':'Mauritius','Korea':None})
def country(x):return COUNTRIES.get(x,x) if x and norm(x) not in ['online','worldwide','global','virtual'] else None
START=time.monotonic()
# Hash complete inherited package before copying anything; no writes under BASE.
lineage={str(p.relative_to(BASE)):sha(p.read_bytes()) for p in sorted(BASE.rglob('*')) if p.is_file() and '__pycache__' not in str(p)}
if DB.exists():DB.unlink()
shutil.copyfile(BASE/'dataset.sqlite',DB)
c=sqlite3.connect(DB);c.row_factory=sqlite3.Row;c.execute('PRAGMA foreign_keys=ON')
c.executescript('''
CREATE TABLE scale_migrations(id TEXT PRIMARY KEY,description TEXT NOT NULL,version TEXT NOT NULL);
INSERT INTO scale_migrations VALUES('001','Preserve 66 inherited tables; add typed provenance and coverage without changing inherited rows','2.0');
CREATE TABLE scale_event_metadata(event_id TEXT PRIMARY KEY REFERENCES event_editions(id),source_family TEXT NOT NULL,native_id TEXT,record_type TEXT NOT NULL,city TEXT,country_normalized TEXT,category TEXT,latitude REAL,longitude REAL,geo_precision TEXT,geo_method TEXT,geo_verification TEXT,source_modified_at TEXT,parent_native_id TEXT,original_data_source TEXT,license TEXT,inherited INTEGER NOT NULL CHECK(inherited IN (0,1)));
CREATE TABLE scale_observations(id TEXT PRIMARY KEY,event_id TEXT NOT NULL REFERENCES event_editions(id),source_id TEXT NOT NULL REFERENCES sources(id),batch TEXT NOT NULL,native_id TEXT,locator TEXT NOT NULL,observed_at TEXT NOT NULL,content_sha256 TEXT NOT NULL,raw_values_json TEXT NOT NULL,dedupe_decision TEXT NOT NULL);
CREATE TABLE scale_batches(id TEXT PRIMARY KEY,path TEXT NOT NULL,sha256 TEXT NOT NULL,rows_read INTEGER NOT NULL,metadata_json TEXT NOT NULL);
CREATE TABLE scale_rejections(id TEXT PRIMARY KEY,batch TEXT NOT NULL,locator TEXT,reason TEXT NOT NULL,record_hash TEXT NOT NULL);
CREATE TABLE scale_event_redirects(id TEXT PRIMARY KEY,alias_event_id TEXT UNIQUE NOT NULL REFERENCES event_editions(id),canonical_event_id TEXT NOT NULL REFERENCES event_editions(id),reason TEXT NOT NULL,evidence_json TEXT NOT NULL);
CREATE TABLE scale_dedupe_candidates(id TEXT PRIMARY KEY,event_a TEXT NOT NULL REFERENCES event_editions(id),event_b TEXT NOT NULL REFERENCES event_editions(id),reason TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE scale_enrichment_observations(id TEXT PRIMARY KEY,entity_table TEXT,entity_id TEXT,source_id TEXT REFERENCES sources(id),payload_json TEXT NOT NULL);
CREATE INDEX scale_event_source ON scale_event_metadata(source_family);
CREATE INDEX scale_geo ON scale_event_metadata(latitude,longitude);
CREATE INDEX scale_observation_event ON scale_observations(event_id);
CREATE INDEX scale_event_date ON event_editions(start_date);
''')
COLS={r[0]:[x[1] for x in c.execute('PRAGMA table_info("'+r[0]+'")')] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'")}
IDS={t:{r[0] for r in c.execute('SELECT '+('event_id' if t=='scale_event_metadata' else 'id')+' FROM "'+t+'"')} for t in COLS}
COUNTS=collections.Counter();REJECTS=collections.Counter();BATCHCOUNTS=collections.defaultdict(collections.Counter)
def add(t,d):
 cols=COLS[t];pk='event_id' if t=='scale_event_metadata' else 'id'
 if d[pk] in IDS[t]:return False
 c.execute('INSERT INTO "'+t+'" ('+','.join('"'+k+'"' for k in cols)+') VALUES ('+','.join('?' for k in cols)+')',[d.get(k) for k in cols]);IDS[t].add(d[pk]);COUNTS[t]+=1;return True
def source(u,family,observed,license,evidence='secondary'):
 s=sid('src',u)
 add('sources',{'id':s,'url':u,'canonical_url':u,'publisher':family,'title':family+' published event metadata','source_type':'public_bulk_dataset' if family!='primary_enrichment' else 'organizer_or_company_page','observed_at':observed,'access_method':'documented_open_api_or_published_file' if family!='primary_enrichment' else 'public_page','reuse_status':license,'extraction_status':'allowlist_facts_extracted'})
 return s
def assertion(table,eid,field,value,src,locator,observed,evidence='secondary',basis='Exact published metadata; publisher not independently corroborated'):
 if value is None or value=='':return
 aid=sid('ast',table,eid,field,src,locator,js(value))
 add('assertions',{'id':aid,'entity_table':table,'entity_id':eid,'field':field,'value_json':js(value),'source_id':src,'locator':locator+' / '+field,'observed_at':observed,'evidence_class':evidence,'confidence_basis':basis,'conflict_status':'not_cross_checked'})
 return aid
EVENTS={r['id']:dict(r) for r in c.execute('SELECT * FROM event_editions')};NATIVE={};EXACT={};BYTITLE=collections.defaultdict(list);BYURL=collections.defaultdict(list)
def index(e,city=None):
 EXACT[(norm(e['title']),e['start_date'],norm(city or e.get('location_raw')))]=e['id'];BYTITLE[(norm(e['title']),e['start_date'])].append(e['id'])
 if e.get('canonical_url'):BYURL[(urlkey(e['canonical_url']),e['start_date'])].append(e['id'])
for e in EVENTS.values():
 add('scale_event_metadata',{'event_id':e['id'],'source_family':'inherited','record_type':'event_edition','country_normalized':country(e['country']),'category':e['sector'] or 'unclassified','inherited':1,'geo_precision':e.get('geo_precision'),'license':'see_inherited_source'})
 index(e)
DECISIONS=json.loads((ROOT/'manifests/identity-decisions.json').read_text())
REDIRECTS={r['alias_event_id']:r['canonical_event_id'] for r in DECISIONS['inherited_redirects']}
for r in DECISIONS['inherited_redirects']:add('scale_event_redirects',{'id':sid('redirect',r['alias_event_id']),'alias_event_id':r['alias_event_id'],'canonical_event_id':r['canonical_event_id'],'reason':r['reason'],'evidence_json':js(r)})
c.execute("INSERT INTO scale_migrations VALUES('002','Canonical view excludes agent-reviewed duplicate inherited identities; physical inherited rows remain immutable','2.1')")
c.execute('CREATE VIEW canonical_event_editions AS SELECT * FROM event_editions WHERE id NOT IN (SELECT alias_event_id FROM scale_event_redirects)')
ALIASES={(r['url_key'],r['date'],norm(r['incoming_title'])):r['canonical_event_id'] for r in DECISIONS['incoming_aliases']}
BASE_COUNTS={t:len(v) for t,v in IDS.items() if not t.startswith('scale_')}
SERIES={};METADATA={r['event_id']:dict(r) for r in c.execute('SELECT * FROM scale_event_metadata')}
def reject(batch,loc,why,x):
 add('scale_rejections',{'id':sid('reject',batch,loc,why),'batch':batch,'locator':loc,'reason':why,'record_hash':sha(js(x).encode())});REJECTS[why]+=1;BATCHCOUNTS[batch]['rejected']+=1

def normalize(x,batch,meta):
 if 'source_record_id' in x:
  v=x.get('venue') or {}; loc=x.get('source_locator') or x.get('source_record_id')
  topics=x.get('keywords') or []
  return {'family':'helsinki_linked_events','native_id':x['source_record_id'],'title':x['title'],'url':x.get('canonical_url'),'start':x.get('start_at'),'end':x.get('end_at'),'city':v.get('city'),'country':v.get('country'),'category':'community-mixed','language':x.get('language'),'latitude':v.get('latitude'),'longitude':v.get('longitude'),'geo_precision':v.get('coordinate_precision') or 'publisher_point_accuracy_unspecified','venue_native':v.get('id'),'venue_name':v.get('name'),'address':v.get('address'),'topics':topics,'source_url':x.get('source_fetch_url') or x['source_url'],'source_record_url':x['source_url'],'source_payload_sha256':x.get('source_payload_sha256'),'country_method':v.get('country_method'),'languages':x.get('languages'),'titles':x.get('titles'),'locator':loc,'observed_at':x.get('extracted_at'),'source_modified_at':x.get('source_modified_at'),'parent_native_id':x.get('super_event_id'),'original_data_source':x.get('original_data_source'),'license':x.get('license'),'status':x.get('status'),'evidence_class':'secondary_municipal_aggregator','record_type':'scheduled_occurrence'}
 return x

def ingest(x,batch,meta,line):
 BATCHCOUNTS[batch]['input']+=1;x=normalize(x,batch,meta);loc=x.get('locator',f'line:{line}');family=x['family'];native=str(x['native_id']);observed=x.get('observed_at') or meta.get('observed_at') or meta.get('extracted_at') or CUTOFF
 start=day(x.get('start'));end=day(x.get('end'))
 if not start or start<'2021-09-28' or start>'2030-12-31':reject(batch,loc,'invalid_or_outside_start_window',x);return
 if not x.get('title'):reject(batch,loc,'missing_title',x);return
 if end and end<start:
  reject(batch,loc,'end_before_start',x);return
 src=source(x['source_url'],family,observed,x.get('license'),x.get('evidence_class'))
 ct=country(x.get('country'));city=x.get('city');location=', '.join(str(i) for i in [x.get('address') or x.get('venue_name') or city,ct] if i) or ('Online' if x.get('online') else None)
 exact=(norm(x['title']),start,norm(city or location));eid=NATIVE.get((family,native));decision='same_native_id' if eid else None
 if not eid and (urlkey(x.get('url')),start,norm(x['title'])) in ALIASES:eid=ALIASES[(urlkey(x.get('url')),start,norm(x['title']))];decision='agent_reviewed_url_date_title_alias'
 if eid in REDIRECTS:eid=REDIRECTS[eid]
 if not eid and family!='helsinki_linked_events' and exact in EXACT:eid=EXACT[exact];decision='same_normalized_title_date_location'
 if eid in REDIRECTS:eid=REDIRECTS[eid]
 if not eid and family!='helsinki_linked_events':
  # Conservative cross-source matching: title+date AND country compatible AND URL equal.
  for candidate in BYTITLE.get((norm(x['title']),start),[]):
   e=EVENTS[candidate]
   if urlkey(e.get('canonical_url')) and urlkey(e.get('canonical_url'))==urlkey(x.get('url')) and (not e.get('country') or not ct or country(e['country'])==ct):eid=candidate;decision='same_title_date_url';break
 new=eid is None
 if new:eid=sid('evt2',family,native);decision='new_entity'
 NATIVE[(family,native)]=eid
 lat,lon=x.get('latitude'),x.get('longitude')
 try:
  lat=float(lat) if lat is not None else None;lon=float(lon) if lon is not None else None
  if lat is None or lon is None or not(-90<=lat<=90 and -180<=lon<=180) or (lat==0 and lon==0):lat=lon=None
 except (ValueError,TypeError):lat=lon=None
 series=None
 if x.get('series_native'):
  series=sid('ser2',family,x['series_native']);add('event_series',{'id':series,'name':x.get('series_title') or x['series_native'],'identity_method':'publisher_explicit_series_identifier','source_id':src})
 venue=None
 if x.get('venue_native'):
  venue=sid('venue2',family,x['venue_native']);add('venues',{'id':venue,'name':x.get('venue_name'),'address':x.get('address'),'city':city,'country':ct,'latitude':str(lat) if lat is not None else None,'longitude':str(lon) if lon is not None else None,'geo_method':'publisher_supplied_point_no_new_geocoding','geo_precision':x.get('geo_precision'),'source_id':src})
 e={'id':eid,'series_id':series,'title':x['title'],'canonical_url':x.get('url'),'start_date':start,'end_date':end,'start_at':x.get('start') if len(str(x.get('start','')))>10 else None,'end_at':x.get('end') if len(str(x.get('end','')))>10 else None,'date_precision':'timestamp' if len(str(x.get('start','')))>10 else 'day','end_semantics':'published_end_no_attendance_inference','status':x.get('status') or 'listed_occurrence_unconfirmed','temporal_bucket':'historical' if start<CUTOFF else 'future_or_current','location_raw':location,'country':ct,'modality':('online' if x.get('online') else ('in_person_or_hybrid_unspecified' if city or venue else None)),'geo_precision':x.get('geo_precision') if lat is not None else 'unlocated','venue_id':venue,'format':'community_occurrence' if family=='helsinki_linked_events' else 'conference','sector':x.get('category'),'topics_json':js(x.get('topics')) if x.get('topics') else None,'language':x.get('language'),'last_verified':observed,'source_id':src,'missing_reasons_json':js({'attendance':'not_observed','sponsor_contract':'not_observed','coordinates':None if lat is not None else 'not_published_or_invalid','timezone':'event_timezone_not_verified'})}
 if new:
  add('event_editions',e);EVENTS[eid]=e;index(e,city)
  m={'event_id':eid,'source_family':family,'native_id':native,'record_type':x.get('record_type','event_edition'),'city':city,'country_normalized':ct,'category':x.get('category'),'latitude':lat,'longitude':lon,'geo_precision':e['geo_precision'],'geo_method':'publisher_supplied_no_new_geocoding' if lat is not None else None,'geo_verification':'range_checked_not_independently_geocoded' if lat is not None else 'unverified','source_modified_at':x.get('source_modified_at'),'parent_native_id':x.get('parent_native_id'),'original_data_source':x.get('original_data_source'),'license':x.get('license'),'inherited':0}
  add('scale_event_metadata',m);METADATA[eid]=m
  BATCHCOUNTS[batch]['new_entities']+=1
 else:BATCHCOUNTS[batch]['merged_observations']+=1
 add('scale_observations',{'id':sid('obs',batch,loc,sha(js(x).encode())),'event_id':eid,'source_id':src,'batch':batch,'native_id':native,'locator':loc,'observed_at':observed,'content_sha256':sha(js(x).encode()),'raw_values_json':js(x),'dedupe_decision':decision})
 # Every asserted material field is retained, including conflicting alternate observations.
 derived={'id','series_id','venue_id','source_id','missing_reasons_json','date_precision','end_semantics','temporal_bucket','last_verified','format','sector','modality','geo_precision','topics_json'}
 for f,v in e.items():
  if f not in derived:assertion('event_editions',eid,f,v,src,loc,observed,('derived' if f=='location_raw' or (f=='country' and ((x.get('country_method') or '').startswith('derived') or x.get('country')!=ct)) else x.get('evidence_class','secondary')))
 for f in ['sector','format','modality','topics_json']:
  assertion('event_editions',eid,f,e[f],src,loc,observed,'derived','Importer mapping from declared source fields; inspect scale_observations.raw_values_json')
 if new:
  for f in ['city','latitude','longitude','geo_precision','source_modified_at','parent_native_id','original_data_source','license']:
   assertion('scale_event_metadata',eid,f,METADATA[eid].get(f),src,loc,observed,x.get('evidence_class','secondary'))
 # Conflicts recorded, never silently overwrite inherited/core values.
 if not new:
  for f in ['title','end_date','country','canonical_url']:
   old=EVENTS[eid].get(f);val=e.get(f)
   if old and val and old!=val:
    add('data_conflicts',{'id':sid('conflict',eid,f,src,val),'entity_table':'event_editions','entity_id':eid,'field':f,'resolution':'retain_existing_canonical_and_all_source_assertions','status':'unreviewed','source_id':src})
 if x.get('cfp_end') and day(x['cfp_end']):
  add('event_deadlines',{'id':sid('deadline',eid,'cfp',x['cfp_end'],src),'event_id':eid,'deadline_type':'call_for_papers','date':day(x['cfp_end']),'date_precision':'day','status':'published_not_reverified_at_organizer','requirements':x.get('cfp_url'),'source_id':src})
 for field in ['submitted','accepted']:
  if x.get(field) is not None:
   add('event_metrics',{'id':sid('metric',eid,field,src),'event_id':eid,'metric':'papers_'+field,'value':str(x[field]),'unit':'papers','denominator':str(x.get('submitted')) if field=='accepted' and x.get('submitted') else None,'period':start[:4],'attribution_method':'secondary_compilation; source may aggregate tracks; NOT attendees or ROI','metric_status':'secondary_reported','source_id':src})
 add('platform_listings',{'id':sid('listing',family,native),'event_id':eid,'platform':family,'native_id':native,'url':x.get('url'),'first_observed':observed,'last_observed':observed,'listing_status':'published_metadata','evidence_method':'bulk_dataset','source_id':src})

for p in sorted((ROOT/'batches').glob('*.jsonl.gz')):
 if p.name.startswith('enrichment'):continue
 batch=p.name[:-9];mf=ROOT/'manifests'/(batch+'.json')
 if not mf.exists():continue
 meta=json.loads(mf.read_text())
 count=0
 with gzip.open(p,'rt') as f:
  for count,line in enumerate(f,1):ingest(json.loads(line),batch,meta,count)
 add('scale_batches',{'id':batch,'path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes()),'rows_read':count,'metadata_json':js(meta)})
 print(batch,dict(BATCHCOUNTS[batch]),flush=True)
# Potential duplicates are review candidates, not automatic identity claims.
for key,ids in BYTITLE.items():
 for a,b in zip(sorted(set(ids)),sorted(set(ids))[1:]):
  if METADATA[a]['source_family']=='helsinki_linked_events' and METADATA[b]['source_family']=='helsinki_linked_events':continue
  add('scale_dedupe_candidates',{'id':sid('candidate',a,b),'event_a':a,'event_b':b,'reason':'same_normalized_title_and_day_other_keys_differ','status':'needs_manual_review'})
# Same title, exact published start/end and same venue are review candidates,
# not automatic merges: separate source IDs may represent republications or parallel offers.
HG=collections.defaultdict(list)
for e in EVENTS.values():
 if METADATA[e['id']]['source_family']=='helsinki_linked_events' and e.get('venue_id'):
  HG[(norm(e['title']),e.get('start_at') or e['start_date'],e.get('end_at') or e['end_date'],e['venue_id'])].append(e['id'])
for key,ids in HG.items():
 for a,b in zip(sorted(ids),sorted(ids)[1:]):add('scale_dedupe_candidates',{'id':sid('candidate',a,b),'event_a':a,'event_b':b,'reason':'same_title_published_start_end_venue_distinct_municipal_ids; '+('timestamp_precision' if len(key[1])>10 else 'day_precision'),'status':'unresolved_not_merged'})
# FTS gives an actual large-corpus retrieval benchmark without embedding charges.
c.execute('CREATE VIRTUAL TABLE scale_event_search USING fts5(event_id UNINDEXED,title,location,topics)')
c.executemany('INSERT INTO scale_event_search VALUES(?,?,?,?)',[(e['id'],e['title'],e.get('location_raw'),e.get('topics_json')) for e in EVENTS.values() if e['id'] not in REDIRECTS])
c.execute('CREATE INDEX scale_assertion_entity_field ON assertions(entity_table,entity_id,field)')
c.commit()
# enrichment module uses same typed helper functions; optional until its batch is delivered.
enrich=ROOT/'scripts/import_enrichment.py'
if enrich.exists():exec(compile(enrich.read_text(),str(enrich),'exec'))
c.execute('DELETE FROM scale_event_search')
c.executemany('INSERT INTO scale_event_search VALUES(?,?,?,?)',[(e['id'],e['title'],e.get('location_raw'),e.get('topics_json')) for e in EVENTS.values() if e['id'] not in REDIRECTS])
c.commit()
counts={t:c.execute('SELECT count(*) FROM "'+t+'"').fetchone()[0] for t in COLS}
manifest={'dataset_version':'scale-expansion-20260928-v2','cutoff':CUTOFF,'historical_start':'2021-09-28','inherited_package':str(BASE),'inherited_file_sha256':lineage,'inherited_table_counts':BASE_COUNTS,'new_table_rows':dict(COUNTS),'table_counts':counts,'batches':{k:dict(v) for k,v in BATCHCOUNTS.items()},'rejections':dict(REJECTS),'new_event_entities':len(EVENTS)-BASE_COUNTS['event_editions'],'inherited_event_entities':BASE_COUNTS['event_editions'],'physical_event_rows':len(EVENTS),'inherited_redirects':len(REDIRECTS),'total_event_entities':len(EVENTS)-len(REDIRECTS),'build_seconds':round(time.monotonic()-START,3),'dedupe_method':'native ID; normalized title+start+location; exact title+start+URL with compatible country; review unresolved title/day pairs','meaning':'Announcements/editions/municipal occurrences, not verified attendance and not a census'}
(ROOT/'manifests/build.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));c.close();print(js({k:manifest[k] for k in ['inherited_event_entities','new_event_entities','total_event_entities','build_seconds']}))

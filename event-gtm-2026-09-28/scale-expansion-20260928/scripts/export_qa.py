"""Full compressed CSV export, map, coverage, lineage and technical checks. Offline."""
import sqlite3,csv,gzip,json,hashlib,collections,datetime,time,re,statistics,ast
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parent/'independent-deep-research-20260928'
c=sqlite3.connect(ROOT/'dataset.sqlite');c.row_factory=sqlite3.Row
manifest=json.loads((ROOT/'manifests/build.json').read_text())
tables=[r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'scale_event_search%' ORDER BY name")]
def js(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))
def sha(b):return hashlib.sha256(b).hexdigest()
def writecsv(path,rows,cols=None):
 rows=iter(rows);first=next(rows,None)
 if first is None and cols is None:return
 cols=cols or list(first)
 with path.open('w',newline='',encoding='utf8') as f:
  w=csv.DictWriter(f,fieldnames=cols);w.writeheader()
  if first is not None:w.writerow(first)
  w.writerows(rows)
checks=[]
def check(name,errors,detail=None):
 errors=list(errors);checks.append({'check':name,'passed':not errors,'error_count':len(errors),'examples':errors[:8],'detail':detail})
export=[]
for t in tables:
 cols=[x[1] for x in c.execute('PRAGMA table_info("'+t+'")')];pk='event_id' if t=='scale_event_metadata' else 'id';n=0;digest=hashlib.sha256()
 p=ROOT/'exports'/(t+'.csv.gz')
 with gzip.open(p,'wt',newline='',encoding='utf8') as f:
  w=csv.writer(f);w.writerow(cols)
  for row in c.execute('SELECT * FROM "'+t+'" ORDER BY "'+pk+'"'):
   vals=['\\N' if x is None else str(x) for x in row];w.writerow(vals);digest.update(js(vals).encode()+b'\n');n+=1
 export.append({'table':t,'rows':n,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes()),'canonical_row_sha256':digest.hexdigest(),'null_encoding':'\\N','path':str(p.relative_to(ROOT))})
errors=[]
for x in export:
 digest=hashlib.sha256();n=0
 with gzip.open(ROOT/x['path'],'rt',newline='',encoding='utf8') as f:
  reader=csv.reader(f);next(reader)
  for row in reader:digest.update(js(row).encode()+b'\n');n+=1
 if n!=x['rows'] or digest.hexdigest()!=x['canonical_row_sha256']:errors.append(x['table'])
check('all compressed CSV exports exact cell/order parity with SQLite',errors,'\\N encodes SQL NULL, empty strings remain empty')
(ROOT/'manifests/exports.json').write_text(json.dumps(export,indent=2))
check('SQLite integrity', [r[0] for r in c.execute('PRAGMA integrity_check') if r[0]!='ok'])
check('physical foreign keys', [list(r) for r in c.execute('PRAGMA foreign_key_check')])
# Every inherited row must remain byte-equivalent at cell level.
c.execute('ATTACH DATABASE ? AS inherited',(str(BASE/'dataset.sqlite'),));errors=[]
for t in manifest['inherited_table_counts']:
 if t.startswith('scale_'):continue
 cols=[r[1] for r in c.execute('PRAGMA main.table_info("'+t+'")')]
 query='SELECT count(*) FROM inherited."'+t+'" b LEFT JOIN main."'+t+'" a ON a.id=b.id WHERE a.id IS NULL OR '+' OR '.join('a."'+k+'" IS NOT b."'+k+'"' for k in cols)
 n=c.execute(query).fetchone()[0]
 if n:errors.append([t,n])
check('all rows inherited from 66 tables preserved unchanged',errors)
check('all inherited package files unchanged',[f for f,h in manifest['inherited_file_sha256'].items() if sha((BASE/f).read_bytes())!=h])
refs={'source_id':'sources','event_id':'event_editions','series_id':'event_series','company_id':'companies','person_id':'people','venue_id':'venues','ticket_id':'ticket_types','package_id':'sponsorship_packages','session_id':'sessions','community_id':'communities','article_id':'news_articles','previous_event_id':'event_editions','next_event_id':'event_editions','from_event_id':'event_editions','to_event_id':'event_editions','run_id':'recommendation_runs','case_id':'evaluation_cases','draft_id':'luma_drafts','concept_id':'event_concepts','term_id':'taxonomy_terms'}
errors=[]
for t in tables:
 cols=[x[1] for x in c.execute('PRAGMA table_info("'+t+'")')]
 for field,target in refs.items():
  if field not in cols:continue
  if field=='run_id' and t=='fetch_attempts':target='crawl_runs'
  n=c.execute(f'SELECT count(*) FROM "{t}" a LEFT JOIN "{target}" b ON a."{field}"=b.id WHERE a."{field}" IS NOT NULL AND a."{field}"!=\'\' AND b.id IS NULL').fetchone()[0]
  if n:errors.append([t,field,target,n])
check('logical foreign keys inherited and new',errors)
errors=[]
for t in tables:
 cols=[x[1] for x in c.execute('PRAGMA table_info("'+t+'")')];pk='event_id' if t=='scale_event_metadata' else 'id'
 if pk not in cols:continue
 if c.execute(f'SELECT count(*)-count(distinct "{pk}") FROM "{t}"').fetchone()[0]:errors.append(t)
check('unique stable primary keys all data tables',errors)
errors=[]
for t in tables:
 cols=[x[1] for x in c.execute('PRAGMA table_info("'+t+'")')]
 for f in cols:
  if f.endswith('_json'):
   for row in c.execute(f'SELECT "{f}" FROM "{t}" WHERE "{f}" IS NOT NULL AND "{f}"!=\'\''):
    try:json.loads(row[0])
    except ValueError:errors.append([t,f])
check('valid JSON cells',errors)
# Polymorphic assertions use metadata.event_id; all other entity tables use id.
errors=[]
for row in c.execute('SELECT DISTINCT entity_table FROM assertions'):
 t=row[0]
 if t not in tables:errors.append([t,'no table']);continue
 pk='event_id' if t=='scale_event_metadata' else 'id'
 n=c.execute(f'SELECT count(*) FROM assertions a LEFT JOIN "{t}" b ON a.entity_id=b."{pk}" WHERE a.entity_table=? AND b."{pk}" IS NULL',(t,)).fetchone()[0]
 if n:errors.append([t,n])
check('polymorphic assertion references',errors)
events=[dict(r) for r in c.execute('''SELECT e.*, m.source_family,m.native_id,m.record_type,m.city,m.country_normalized,m.category,m.latitude,m.longitude,m.geo_method,m.geo_verification,m.source_modified_at,m.parent_native_id,m.inherited,s.url source_url FROM canonical_event_editions e JOIN scale_event_metadata m ON e.id=m.event_id LEFT JOIN sources s ON e.source_id=s.id''')]
errors=[]
for e in events:
 try:
  d=datetime.date.fromisoformat(e['start_date']);end=datetime.date.fromisoformat(e['end_date']) if e['end_date'] else d
  if str(d)<'2021-09-28' or end<d:errors.append(e['id'])
 except (ValueError,TypeError):errors.append(e['id'])
check('dates valid and five-year lower boundary',errors)
check('every edition has metadata row',[] if len(events)==c.execute('SELECT count(*) FROM canonical_event_editions').fetchone()[0] else ['count mismatch'])
check('core event field provenance',[list(r) for r in c.execute("SELECT e.id FROM event_editions e WHERE NOT EXISTS(SELECT 1 FROM assertions a WHERE a.entity_id=e.id AND a.entity_table='event_editions' AND a.field='title') OR NOT EXISTS(SELECT 1 FROM assertions a WHERE a.entity_id=e.id AND a.entity_table='event_editions' AND a.field='start_date')")])
check('source URLs present',[r[0] for r in c.execute("SELECT id FROM sources WHERE url IS NULL OR url NOT LIKE 'http%' ")])
check('source native IDs unique canonical',[list(r) for r in c.execute("SELECT source_family,native_id,count(*) FROM scale_event_metadata WHERE native_id IS NOT NULL GROUP BY source_family,native_id HAVING count(*)>1")])
# Do not require title/day uniqueness for municipal schedules: morning/evening may be separate IDs.
check('no same-source observation duplicated',[list(r) for r in c.execute('SELECT batch,native_id,source_id,locator,count(*) FROM scale_observations GROUP BY batch,native_id,source_id,locator HAVING count(*)>1')])
check('privacy private-client tables empty',[t for t in ['customer_briefs','user_feedback'] if c.execute('SELECT count(*) FROM '+t).fetchone()[0]])
check('no live Luma publication',[r[0] for r in c.execute("SELECT id FROM luma_drafts WHERE luma_event_id IS NOT NULL AND luma_event_id!=''")])
# Inputs are allowlisted. Scan key names, not public professional speakers inherited.
forbidden={'email','phone','attendees','attendee','guest_list','contact_email','contributor_email','contributor_contactname','attendee_name'}
def badkeys(o):
 if isinstance(o,dict):return [k for k,v in o.items() if k.lower() in forbidden]+[b for v in o.values() for b in badkeys(v)]
 if isinstance(o,list):return [b for v in o for b in badkeys(v)]
 return []
errors=[]
for row in c.execute('SELECT id,raw_values_json FROM scale_observations'):
 for k in badkeys(json.loads(row[1])):errors.append([row[0],k])
check('new observation payloads contain no attendee/contact fields',errors,'Professional speaker names inherited remain public professional participation, never attendee lists')
for p in (ROOT/'scripts').glob('*.py'):
 try:ast.parse(p.read_text())
 except SyntaxError as ex:errors.append([str(p),str(ex)])
check('all importer/build scripts parse', [e for e in errors if '.py' in str(e)])
# Public GeoJSON includes NULL geometry whenever there is no valid published coordinate.
features=[];maprows=[];errors=[]
for e in events:
 lat=e['latitude'];lon=e['longitude'];valid=lat is not None and lon is not None and -90<=lat<=90 and -180<=lon<=180 and (lat!=0 or lon!=0)
 if e['country_normalized']=='Finland' and valid and not(59<=lat<=71 and 19<=lon<=32):errors.append([e['id'],'outside_Finland_bbox']);valid=False
 if (lat is None)!=(lon is None):errors.append([e['id'],'partial_coord'])
 props={k:e.get(k) for k in ['id','title','start_date','end_date','status','country_normalized','city','record_type','category','source_family','source_url','canonical_url','last_verified','source_modified_at','geo_precision','geo_method','geo_verification','inherited']}
 props['coordinate_validation']='publisher_value_range_checked_not_surveyed' if valid else 'no_verified_published_coordinate'
 features.append({'type':'Feature','id':e['id'],'geometry':{'type':'Point','coordinates':[lon,lat]} if valid else None,'properties':props})
 maprows.append(dict(props,latitude=lat if valid else None,longitude=lon if valid else None))
check('coordinate pairs ranges and country sanity',errors)
geo={'type':'FeatureCollection','name':'EventGTM published event locations','features':features}
(ROOT/'maps/events.geojson').write_text(js(geo));writecsv(ROOT/'maps/events.csv',maprows)
with gzip.open(ROOT/'maps/events.geojson.gz','wt') as f:json.dump(geo,f,ensure_ascii=False,separators=(',',':'))
with gzip.open(ROOT/'maps/events.csv.gz','wb') as f:f.write((ROOT/'maps/events.csv').read_bytes())
roundtrip=json.loads((ROOT/'maps/events.geojson').read_text());check('GeoJSON event count and ID parity',[] if {f['id'] for f in roundtrip['features']}=={e['id'] for e in events} and len(roundtrip['features'])==len(events) else ['id mismatch'])
# Coverage denominators are corpus/stratum, never world's event universe.
coverage=[];n=len(events)
for dimension,key in [('country','country_normalized'),('city','city'),('category','category'),('platform','source_family'),('record_type','record_type'),('status','status'),('language','language'),('month','start_date')]:
 for val,num in sorted(collections.Counter((e.get(key)[:7] if dimension=='month' else e.get(key)) or 'UNKNOWN' for e in events).items()):coverage.append({'dimension':dimension,'stratum':'all','value':val,'count':num,'denominator':n,'percent':round(100*num/n,3)})
for family in sorted({e['source_family'] for e in events}):
 es=[e for e in events if e['source_family']==family]
 for dim,key in [('country','country_normalized'),('month','start_date')]:
  for val,num in sorted(collections.Counter((e.get(key)[:7] if dim=='month' else e.get(key)) or 'UNKNOWN' for e in es).items()):coverage.append({'dimension':dim,'stratum':family,'value':val,'count':num,'denominator':len(es),'percent':round(100*num/len(es),3)})
writecsv(ROOT/'coverage.csv',coverage)
missing=[]
for family in ['ALL']+sorted({e['source_family'] for e in events}):
 es=events if family=='ALL' else [e for e in events if e['source_family']==family];ids={e['id'] for e in es}
 for field in ['end_date','timezone','country_normalized','city','language','venue_id','latitude','series_id']:
  known=sum(e.get(field) is not None and e.get(field)!='' for e in es);missing.append({'stratum':family,'field':field,'known':known,'missing':len(es)-known,'denominator':len(es),'percent_known':round(100*known/len(es),3)})
 for field,t,where in [('sponsor_named','event_company_roles',"WHERE role='sponsor'"),('audience_metrics','audience_metrics',''),('event_metrics','event_metrics',''),('packages','sponsorship_packages',''),('ticket_types','ticket_types','')]:
  got={r[0] for r in c.execute('SELECT DISTINCT event_id FROM '+t+' '+where)};known=len(ids&got);missing.append({'stratum':family,'field':field,'known':known,'missing':len(es)-known,'denominator':len(es),'percent_known':round(100*known/len(es),3)})
writecsv(ROOT/'missingness.csv',missing)
# Actual SQL benchmark. Queries intentionally mix broad/narrow retrieval; never relevance labels.
bench=[]
for q in ['Python','Kubernetes','AI','DevOps','FOSDEM','Helsinki','startup','cloud']:
 times=[];result=[]
 for repeat in range(10):
  t=time.perf_counter();result=c.execute('SELECT event_id,title,bm25(scale_event_search) rank FROM scale_event_search WHERE scale_event_search MATCH ? ORDER BY rank LIMIT 10',(q,)).fetchall();times.append(1000*(time.perf_counter()-t))
 bench.append({'query':q,'limit':10,'returned':len(result),'p50_ms':round(statistics.median(times),3),'max_ms':round(max(times),3),'runs':10,'candidate_ids':[r['event_id'] for r in result],'human_precision_at_10':None})
(ROOT/'benchmark.json').write_text(json.dumps({'kind':'local_SQLite_FTS5_warm_cache','event_rows':n,'queries':bench,'relevance':'unmeasured; no human labels and no claim of recommendation quality'},indent=2))
# Physical schema and extended dictionary.
(ROOT/'schema.sql').write_text('\n\n'.join(r[0]+';' for r in c.execute("SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'scale_event_search_%' ORDER BY type,name")))
dictionary=[]
for t in tables:
 for r in c.execute('PRAGMA table_info("'+t+'")'):dictionary.append({'table':t,'column':r[1],'storage_type':r[2],'primary_key':r[5],'not_null':r[3],'null_meaning':'unknown/not_collected unless private/proposal table','lineage':'inherited_schema_66' if t in manifest['inherited_table_counts'] else 'migration_001','definition':'See inherited data_dictionary.csv and reports/schema-methods.md; '+r[1].replace('_',' ')})
writecsv(ROOT/'data_dictionary.csv',dictionary)
summary={'all_passed':all(x['passed'] for x in checks),'checks':checks,'events_total':n,'inherited':sum(e['inherited'] for e in events),'new':sum(not e['inherited'] for e in events),'countries_or_territories':len({e['country_normalized'] for e in events if e['country_normalized']}),'historical':sum(e['start_date']<'2026-09-28' for e in events),'future_or_current':sum(e['start_date']>='2026-09-28' for e in events),'with_published_coordinates':sum(f['geometry'] is not None for f in features),'table_count':len(tables),'populated_tables':sum(x['rows']>0 for x in export),'empty_tables':[x['table'] for x in export if not x['rows']],'database_bytes':(ROOT/'dataset.sqlite').stat().st_size,'compressed_csv_bytes':sum(x['bytes'] for x in export)}
(ROOT/'qa-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in summary.items() if k!='checks'},ensure_ascii=False,indent=2))
if not summary['all_passed']:print(json.dumps([x for x in checks if not x['passed']],indent=2));raise SystemExit(1)

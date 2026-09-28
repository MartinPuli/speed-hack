"""Structural research QA. This does not certify factual accuracy or commercial utility."""
import collections,csv,hashlib,json,sqlite3
from pathlib import Path
R=Path(__file__).resolve().parents[1]
db=sqlite3.connect(R/'event-gtm.sqlite');db.row_factory=sqlite3.Row
tables=[x[0] for x in db.execute("SELECT name FROM sqlite_master WHERE type='table'")]
assert len(tables)==66
problems=[];counts={};fields={};ids={}
for t in tables:
 cols=[x[1] for x in db.execute('PRAGMA table_info("'+t+'")')];fields[t]=cols;rows=list(db.execute('SELECT * FROM "'+t+'"'));counts[t]=len(rows);ids[t]={str(x[0]) for x in rows}
 candidates=[p for layer in ('observed','derived','private-schemas') if (p:=R/layer/(t+'.csv')).exists()]
 assert len(candidates)==1,(t,candidates)
 with candidates[0].open() as f:
  reader=csv.DictReader(f);assert reader.fieldnames==cols,t;assert len(list(reader))==len(rows),t
 for row in rows:
  for k in cols:
   if k.endswith('_json') and row[k] is not None:
    try:json.loads(row[k])
    except Exception:problems.append([t,row[0],k,'invalid_json'])
for t in ('assertions','entity_classifications','record_versions','news_entity_links'):
 for row in db.execute('SELECT * FROM '+t):
  if row['entity_table'] not in ids or row['entity_id'] not in ids[row['entity_table']]:problems.append([t,row[0],'dangling_polymorphic_entity'])
for r in db.execute('SELECT * FROM source_snapshots'):
 p=R/r['retained_path'];assert p.exists();assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
retained={r[0] for r in db.execute('SELECT retained_path FROM source_snapshots')}
# Only remove orphan extracts generated in this new research folder, never source or app files.
for p in (R/'evidence').glob('src_*.json'):
 if str(p.relative_to(R)) not in retained:p.unlink()
events=list(db.execute('SELECT * FROM event_editions'));inferred=[];years=collections.Counter();countries=collections.Counter()
for e in events:
 years[(e['start_date'] or 'unknown')[:4]]+=1;countries[e['country'] or 'unknown']+=1
 if e['start_date'] and e['end_date'] and e['start_date']>e['end_date']:problems.append([e['edition_id'],'inverted_dates'])
 extra=json.loads(e['extra_json'] or '{}')
 if extra.get('date_basis',{}).get('year_is_inferred'):inferred.append(e['edition_key'])
 if e['country'] and 'normalizad' in (extra.get('geography_notes') or '').lower():problems.append([e['edition_id'],'inferred_country_in_observed_column'])
assert not db.execute('PRAGMA foreign_key_check').fetchall()
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
assert not problems,problems
counts_by_source_family=list(db.execute('SELECT source_type,count(*) FROM sources GROUP BY source_type'))
summary={'structural_validation':'pass','table_count':66,'csv_sqlite_counts_equal':True,'source_extract_hashes_verified':len(retained),'polymorphic_reference_errors':problems,'counts':counts,'years':dict(years),'countries_observed':dict(countries),'known_country_count':len(countries)-int('unknown' in countries),'inferred_year_editions':inferred,'unique_source_urls':counts['sources'],'access_status_counts':dict(db.execute('SELECT access_status,count(*) FROM sources GROUP BY access_status')),'source_family_counts':dict(counts_by_source_family),'news_origin_clusters':db.execute('SELECT count(DISTINCT cluster_id) FROM news_dedup_clusters').fetchone()[0],'news_original_editorial_pieces':db.execute("SELECT count(*) FROM news_articles WHERE article_type IN ('original_interview','editorial_recap','original_reporting_translation')").fetchone()[0],'active_or_started_announcements':db.execute("SELECT count(*) FROM event_editions WHERE status='announced' AND start_date<='2026-09-28' AND end_date>='2026-09-28'").fetchone()[0],'venue_addresses':db.execute('SELECT count(*) FROM venues WHERE address IS NOT NULL').fetchone()[0],'coordinates':db.execute('SELECT count(*) FROM venues WHERE latitude IS NOT NULL OR longitude IS NOT NULL').fetchone()[0],'limitations':['Non-random documentary sample, not global coverage','Seven speakers only from public professional agendas; no guest lists','Most roles from one Python conference series','No full independent factual audit','No paid API benchmark, invoice, real buyer labels or historical as-of captures','Countries null where source did not establish them']}
(R/'checkpoints'/'qa-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in summary.items() if k not in ('counts','source_family_counts')},ensure_ascii=False,indent=2))

"""Read-only SQLite microbenchmark and evidence-packet size; no LLM or paid tool calls."""
from pathlib import Path
import sqlite3,json,time,statistics,platform,collections
P=Path(__file__).resolve().parents[1];c=sqlite3.connect('file:'+str(P/'dataset.sqlite')+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
queries={
 'future_core':("SELECT id,title,start_date,country,format FROM event_editions WHERE start_date>=? AND start_date<=? ORDER BY start_date",('2026-09-28','2027-03-31')),
 'evidence_3fields':("SELECT a.id,a.entity_id,a.field,a.value_json,a.confidence_basis,s.url FROM assertions a JOIN sources s ON s.id=a.source_id WHERE a.entity_table='event_editions' AND a.entity_id IN (SELECT id FROM event_editions WHERE start_date>=? AND start_date<=? ORDER BY start_date LIMIT 10) AND a.field IN ('title','start_date','location_raw')",('2026-09-28','2027-03-31')),
 'sponsor_repeat_joins':("SELECT co.id,co.name,count(distinct r.event_id) editions FROM companies co JOIN event_company_roles r ON r.company_id=co.id JOIN event_editions e ON e.id=r.event_id WHERE r.role='sponsor' AND e.title LIKE 'PyCon US %' GROUP BY co.id,co.name ORDER BY editions DESC,co.name",())}
out=[]
for name,(sql,params) in queries.items():
 rows=[dict(r) for r in c.execute(sql,params)];times=[]
 for _ in range(5):c.execute(sql,params).fetchall()
 for _ in range(200):
  st=time.perf_counter();c.execute(sql,params).fetchall();times.append((time.perf_counter()-st)*1000)
 times.sort();out.append({'query':name,'rows':len(rows),'samples':200,'warmups':5,'median_ms':statistics.median(times),'p95_ms':times[189],'min_ms':times[0],'max_ms':times[-1],'plan':[tuple(r) for r in c.execute('EXPLAIN QUERY PLAN '+sql,params)]})
# Test lexical retrieval using SQLite FTS5 in a separate temporary in-memory store.
m=sqlite3.connect(':memory:');m.execute('create virtual table docs using fts5(event_id UNINDEXED,title,body)')
events=[dict(e) for e in c.execute('select * from event_editions')]
m.executemany('insert into docs values(?,?,?)',[(e['id'],e['title'],' '.join(e[k] or '' for k in ['sector','format','location_raw'])) for e in events]);fts=[]
for query in ['python','pycon','art OR frieze']:
 st=time.perf_counter();rows=m.execute('select event_id,title,bm25(docs) from docs where docs match ? order by bm25(docs) limit 10',(query,)).fetchall();elapsed=(time.perf_counter()-st)*1000
 fts.append({'query':query,'elapsed_ms_single':elapsed,'rows':[{'id':r[0],'title':r[1],'bm25':r[2]} for r in rows]})
allrows={'events':events,'assertions':[dict(a) for a in c.execute('select * from assertions')]}
core=[dict(r) for r in c.execute(queries['future_core'][0],queries['future_core'][1])][:10]
ids={e['id'] for e in core};ev=[dict(a) for a in c.execute(queries['evidence_3fields'][0],queries['evidence_3fields'][1])]
packet={'purpose':'demonstrate narrow evidence retrieval, not personalized or ranked relevance','cutoff':'2026-09-28','events':core,'assertions':ev,'missing':['budget','availability','audience relevance'],'no_private_data':True}
def size(x):
 s=json.dumps(x,ensure_ascii=False,separators=(',',':'));return {'utf8_bytes':len(s.encode()),'characters':len(s),'tokens_estimate_chars_div4':round(len(s)/4),'token_count_measured':False}
result={'host':{'system':platform.system(),'machine':platform.machine(),'python':platform.python_version(),'sqlite':sqlite3.sqlite_version},'dataset_bytes':(P/'dataset.sqlite').stat().st_size,'timing_scope':'local warm SQLite only; no network, LLM, PostgreSQL, concurrency or production claim','sql':out,'fts5':fts,'context_sizes':{'all_event_and_assertion_rows':size(allrows),'ten_event_evidence_packet':size(packet)},'size_ratio':size(allrows)['utf8_bytes']/size(packet)['utf8_bytes'],'warning':'Smaller packet excludes evidence; relevance, completeness and factual answer quality not evaluated.'}
(P/'phase2/retrieval-benchmark.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));(P/'phase2/evidence-packet-example.json').write_text(json.dumps(packet,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in result.items() if k!='fts5'},indent=2))

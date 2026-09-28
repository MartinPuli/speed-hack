"""Artifact QA, coverage and logical field dictionary. Does not test product demand."""
from build_dataset import ROOT,SCHEMA,cols,layer
import csv,json,re,sqlite3,collections,datetime,hashlib
con=sqlite3.connect(ROOT/'dataset.sqlite');con.row_factory=sqlite3.Row
D={t:[dict(r) for r in con.execute('SELECT * FROM '+t)] for t in SCHEMA}
IDs={t:{r['id'] for r in rows} for t,rows in D.items()}
checks=[]
def check(name,errors):checks.append({'check':name,'passed':not errors,'error_count':len(errors),'examples':errors[:8]})
contract=re.findall(r'^\| `([a-z_]+)\.csv`', (ROOT/'spec/prompt-maestro.md').read_text(),re.M)
check('66 logical tables exactly match master contract',list(set(contract)^set(SCHEMA))+([] if len(SCHEMA)==66 else [len(SCHEMA)]))
check('unique primary keys',[(t,len(r),len(IDs[t])) for t,r in D.items() if len(r)!=len(IDs[t])])
refs={'source_id':'sources','event_id':'event_editions','series_id':'event_series','company_id':'companies','person_id':'people','venue_id':'venues','ticket_id':'ticket_types','package_id':'sponsorship_packages','session_id':'sessions','community_id':'communities','article_id':'news_articles','previous_event_id':'event_editions','next_event_id':'event_editions','from_event_id':'event_editions','to_event_id':'event_editions','run_id':'recommendation_runs','case_id':'evaluation_cases','draft_id':'luma_drafts','concept_id':'event_concepts','term_id':'taxonomy_terms'}
errors=[]
for t,rows in D.items():
    for r in rows:
        for field,target in refs.items():
            actual='crawl_runs' if field=='run_id' and t=='fetch_attempts' else target
            if r.get(field) and r[field] not in IDs[actual]:errors.append([t,r['id'],field,r[field],actual])
        if r.get('entity_table') and r.get('entity_id') and r['entity_id'] not in IDs.get(r['entity_table'],set()):errors.append([t,r['id'],'polymorphic_ref'])
check('referential integrity including polymorphic assertions',errors)
errors=[]
for e in D['event_editions']:
    try:
        start=datetime.date.fromisoformat(e['start_date']);end=datetime.date.fromisoformat(e['end_date']) if e['end_date'] else start
        if end<start:errors.append([e['id'],'end_before_start'])
        if str(start)<'2021-09-28':errors.append([e['id'],'outside_window'])
    except ValueError:errors.append([e['id'],'date_parse'])
check('date validity and historical boundary',errors)
check('SQLite integrity_check',[r[0] for r in con.execute('PRAGMA integrity_check') if r[0]!='ok'])
errors=[]
for t,rows in D.items():
    with (ROOT/'data'/layer(t)/(t+'.csv')).open() as f:
        c=list(csv.DictReader(f))
        if len(c)!=len(rows):errors.append([t,'row_mismatch'])
    for r in rows:
        for k,v in r.items():
            if k.endswith('_json') and v:
                try:json.loads(v)
                except ValueError:errors.append([t,r['id'],k])
check('CSV SQLite parity and valid JSON cells',errors)
check('no fabricated customer or feedback rows',[t for t in ['customer_briefs','user_feedback'] if D[t]])
check('no live Luma event IDs created',[r['id'] for r in D['luma_drafts'] if r.get('luma_event_id')])
# Evidence coverage concerns populated material fields, not derived keys.
evidence={(a['entity_table'],a['entity_id'],a['field']) for a in D['assertions']}
check('event core title/date/location have field evidence',[(e['id'],f) for e in D['event_editions'] for f in ['title','start_date','location_raw'] if e.get(f) and ('event_editions',e['id'],f) not in evidence])
coverage=[]
events=D['event_editions'];n=len(events)
for dimension,key in [('year','start_date'),('territory','country'),('format','format'),('sector','sector'),('temporal_bucket','temporal_bucket'),('source','source_id')]:
    counts=collections.Counter((e[key][:4] if key=='start_date' else e[key]) or 'unknown' for e in events)
    for value,count in sorted(counts.items()):coverage.append({'dimension':dimension,'value':value,'count':count,'denominator':n,'denominator_scope':'collected_editions_only_not_world_universe','percent_of_sample':round(100*count/n,2)})
for f in ['title','start_date','end_date','timezone','location_raw','country','venue_id','series_id']:
    count=sum(bool(e[f]) for e in events);coverage.append({'dimension':'field_completeness','value':f,'count':count,'denominator':n,'denominator_scope':'collected_editions_only','percent_of_sample':round(100*count/n,2)})
for f,table in [('sponsor_evidence','event_company_roles'),('audience','audience_metrics'),('reported_metrics','event_metrics'),('ticket_prices','ticket_types'),('sponsorship_packages','sponsorship_packages')]:
    count=len({r['event_id'] for r in D[table] if r.get('event_id') and (f!='sponsor_evidence' or 'sponsor' in r.get('role',''))});coverage.append({'dimension':'enrichment_completeness','value':f,'count':count,'denominator':n,'denominator_scope':'collected_editions_only','percent_of_sample':round(100*count/n,2)})
with (ROOT/'coverage.csv').open('w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=coverage[0].keys());w.writeheader();w.writerows(coverage)
units={t:unit for t,unit in re.findall(r'^\| `([a-z_]+)\.csv` \| ([^|]+) \|', (ROOT/'spec/prompt-maestro.md').read_text(),re.M)}
numeric=set('amount amount_min amount_max value denominator quantity capacity inventory rank score elapsed_ms duration_ms measured_cost_usd pages_attempted pages_completed pages_failed records_output attempt_number volume data_usd models_usd maps_usd storage_usd human_usd total_usd cost_per_useful_result latitude longitude'.split())
fielddescs={'id':'Clave primaria estable de la fila','source_id':'Fuente exacta que respalda la fila; cada campo puede tener evidencia adicional en assertions','event_id':'Edición concreta; nunca serie o sesión','company_id':'Organización o marca canónica; rol se guarda aparte','start_date':'Fecha local o fecha de calendario declarada, ISO 8601','end_date':'Última fecha incluida; DTEND all-day de iCal se reduce un día','value_json':'Valor del campo en JSON, manteniendo booleano/numérico/lista','observed_at':'Instante o fecha de consulta; no fecha del hecho','valid_from':'Inicio de vigencia documental; NULL cuando no establecido','valid_to':'Fin de vigencia documental; NULL no implica infinito confirmado','published_at':'Fecha publicada por la fuente; no se infiere de consulta','capture_at':'Captura de archivo web; sólo poblada si recuperada','geo_precision':'Precisión y estado del lugar; ningún punto se inventa','status':'Estado atribuido por la fuente o del flujo; no equivale a resultado medido','metric_status':'Anunciado, previsto o resultado reportado; no validación independiente','missing_reasons_json':'Razón explícita de ausencia por campo','confidence_basis':'Justificación cualitativa de evidencia; no probabilidad calibrada','reuse_status':'Acceso y reutilización comercial separados; permiso no se infiere de publicidad'}
with (ROOT/'data_dictionary.csv').open('w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['table','row_represents','field','logical_type','sqlite_storage','unit','required','allowed_values','priority','expected_origin','definition']);w.writeheader()
    for t in SCHEMA:
        for c in cols(t):
            typ='json' if c.endswith('_json') else ('number_or_declared_text' if c in numeric else ('ISO8601_or_documented_partial_date' if c.endswith('_at') or c.endswith('_date') or c in ['valid_from','valid_to','cutoff'] else 'text'))
            w.writerow({'table':t,'row_represents':units.get(t,''),'field':c,'logical_type':typ,'sqlite_storage':'TEXT (lossless research interchange)','unit':'ISO4217 currency in paired field' if c.startswith('amount') else ('paired unit field; never mix definitions' if c=='value' else ''),'required':c=='id','allowed_values':'NULL = unknown/not_obtained; JSON booleans preserve false; zero is not NULL','priority':'critical' if c in ['id','source_id','event_id','start_date','value_json'] else 'context_dependent','expected_origin':'customer_authorized' if layer(t)=='private-schemas' else ('derived_method' if layer(t)=='derived' else ('proposal' if layer(t)=='proposals' else 'published_source_or_acquisition_log')),'definition':fielddescs.get(c,c.replace('_',' ')+' — dentro de la unidad: '+units.get(t,t))})
summary={'checks':checks,'all_passed':all(c['passed'] for c in checks),'event_count':n,'countries_or_territories':len({e['country'] for e in events if e['country']}),'historical_count':sum(e['start_date']<'2026-09-28' for e in events),'future_or_current_count':sum(e['start_date']>='2026-09-28' for e in events),'end_date_max':max(e['end_date'] or e['start_date'] for e in events),'table_count':len(SCHEMA)}
(ROOT/'qa-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False,indent=2))
if not summary['all_passed']:raise SystemExit(1)
# Further artifact checks: no fabricated geography, incompatible money, duplicate cores.
errors=[];seen={}
for e in events:
 key=(re.sub(r'\W+','',e['title'].casefold()),e['start_date'],(e['location_raw'] or '').casefold())
 if key in seen:errors.append([seen[key],e['id']])
 seen[key]=e['id']
check('no exact normalized title date location duplicates',errors)
check('coordinates absent rather than invented',[(r['id'],r['latitude'],r['longitude']) for r in D['venues'] if r['latitude'] or r['longitude']])
errors=[]
for table in ['ticket_price_history','sponsorship_packages','event_costs']:
 for r in D[table]:
  if r.get('currency') and r['currency'] not in ['USD','EUR','AUD','UGX','GBP','MXN','BRL']:errors.append([table,r['id'],'currency'])
  for f in ['amount','amount_min','amount_max']:
   if r.get(f) and float(r[f])<0:errors.append([table,r['id'],'negative_amount'])
check('money has declared supported currency and nonnegative amount',errors)
check('synthetic evaluations have no fabricated human labels',[r['id'] for r in D['recommendation_candidates'] if r['human_label']])
summary['all_passed']=all(c['passed'] for c in checks);summary['checks']=checks
(ROOT/'qa-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
if not summary['all_passed']:raise SystemExit(1)

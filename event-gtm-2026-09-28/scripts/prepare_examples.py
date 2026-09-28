"""Build explicitly hypothetical local proposals and a non-geocoded map export."""
from pathlib import Path
import csv,hashlib,json,sqlite3
R=Path(__file__).resolve().parents[1]
db=sqlite3.connect(R/'event-gtm.sqlite');db.row_factory=sqlite3.Row
def uid(prefix,*x):return prefix+'_'+hashlib.sha256('|'.join(map(str,x)).encode()).hexdigest()[:16]
def j(v):return json.dumps(v,ensure_ascii=False,sort_keys=True)
concept='concept_hypothetical_python_feedback';draft='draft_local_python_feedback'
eids=[r[0] for r in db.execute("SELECT edition_id FROM event_editions WHERE edition_key LIKE 'pycon-us-%'")]
srcs=[r[0] for r in db.execute("SELECT source_id FROM sources WHERE url LIKE '%2024/schedule/sponsor-presentations%' OR url LIKE '%prospectus_feb26%'")]
title='Clínica de herramientas Python: probar un flujo y registrar qué falla'
description='PROPUESTA POR REVISAR. Taller para personas que desarrollan con Python y quieren probar un flujo concreto de una herramienta. Propuesta: 15 minutos de contexto, 35 de prueba guiada, 25 de trabajo sobre problemas y 15 de devolución. Producto, anfitrión, idioma, fecha, zona, modalidad, registro y cupos pendientes. Ninguna empresa ni persona está confirmada como sponsor o speaker.'
pending=['comprador_y_objetivo','producto_real','host_autorizado','fecha','zona_horaria','modalidad_y_lugar','idioma','presupuesto','registro_y_precio','capacidad','permisos_de_medicion']
tables={'event_concepts':[{'concept_id':concept,'brief_id':None,'title':title,'objective':'Hipótesis sintética: obtener feedback de uso; no objetivo aprobado por un cliente','audience':'Propuesta: personas que desarrollan con Python','format':'Propuesta: taller de 90 minutos','proposed_place':None,'proposed_date':None,'rationale':'Precedentes de sesiones técnicas y paquetes publicados; no prueba de éxito del concepto','budget_estimate':None,'pending_json':j(pending),'input_ids_json':j(eids+srcs),'status':'synthetic_research_proposal_not_existing_event'}],
'luma_drafts':[{'draft_id':draft,'concept_id':concept,'title':title,'description':description,'agenda_json':j([{'minutes':15,'activity':'contexto'},{'minutes':35,'activity':'prueba guiada'},{'minutes':25,'activity':'problemas'},{'minutes':15,'activity':'devolución'}]),'supported_fields_json':j({'name':title,'description_md':description,'start_at':None,'timezone':None}),'status':'local_requires_data_not_publishable','version':'1','pending_json':j(pending),'remote_id':None}],
'draft_field_evidence':[],'sponsor_match_scores':[]}
for field,value in [('name',title),('description_md',description),('start_at',None),('timezone',None)]:
 tables['draft_field_evidence'].append({'field_id':uid('df',draft,field),'draft_id':draft,'field':field,'value_json':j(value),'origin':'researcher_proposal_from_precedents' if value else 'pending_human_input','source_ids_json':j(srcs if value else []),'approval_status':'not_approved'})
# Explicit historical affinity, with no commercial score, current interest or invented negatives.
for name in ('NVIDIA','Google','Capital One'):
 c=db.execute('SELECT company_id FROM companies WHERE name=?',(name,)).fetchone()
 if not c:continue
 roles=list(db.execute("SELECT r.role_id,r.edition_id,e.start_date FROM event_company_roles r JOIN event_editions e USING(edition_id) WHERE r.company_id=? AND r.role='sponsor' AND e.edition_key LIKE 'pycon-us-%'",(c[0],)))
 tables['sponsor_match_scores'].append({'match_id':uid('sm',concept,c[0]),'company_id':c[0],'edition_id':None,'concept_id':concept,'cutoff':'2026-09-28','components_json':j({'historical_pycon_sponsor_editions':len(set(x['edition_id'] for x in roles)),'current_budget':None,'category_exclusivity':None,'permission_to_contact':False}),'score':None,'interest_status':'unobserved','missing_json':j(['current_sponsorship_objective','budget','category_fit_for_real_product','channel_and_authorization','agreement']),'method':'research_example_historical_affinity_not_ranked','version':'1','input_ids_json':j([x['role_id'] for x in roles])})
(R/'batches'/'illustrative-examples.json').write_text(json.dumps({'batch':'illustrative-examples','derived_tables':tables},ensure_ascii=False,indent=2)+'\n')
rows=[]
for e in db.execute("SELECT e.*,v.name AS venue_name,v.address FROM event_editions e LEFT JOIN venues v USING(venue_id) WHERE e.start_date>'2026-09-28' ORDER BY e.start_date"):
 roles=list(db.execute("SELECT c.name,r.role FROM event_company_roles r JOIN companies c USING(company_id) WHERE r.edition_id=? AND r.role IN ('organizer','host','portfolio_publisher')",(e['edition_id'],)))
 evidence=[x[0] for x in db.execute("SELECT assertion_id FROM assertions WHERE entity_table='event_editions' AND entity_id=? AND field IN ('city','country','venue_name','start_date')",(e['edition_id'],))]
 rows.append({'edition_id':e['edition_id'],'title':e['title'],'status':e['status'],'start_date':e['start_date'],'end_date':e['end_date'],'timezone':e['timezone'],'city_observed':e['city'],'country_observed':e['country'],'venue_name':e['venue_name'],'address':e['address'],'latitude':None,'longitude':None,'coordinate_status':'not_geocoded; do not render venue pin','map_display_eligible':False,'geographic_precision':e['geographic_precision'],'organizer_or_publisher_json':j([dict(x) for x in roles]),'url':e['url'],'checked_at':e['checked_at'],'total_price':None,'currency':None,'fit':'Illustrative inventory; no confirmed company profile','limitations':'Recheck schedule and exact location; total cost and sponsorship availability unknown','evidence_ids_json':j(evidence)})
with (R/'derived'/'map_candidates.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
print('Wrote',len(rows),'future rows with no invented coordinates; local draft only')

"""Runs in build_dataset namespace. Adds evaluated source metadata and illustrative derived artifacts."""
import time,math,statistics
# Join inventories without claiming that evaluated documentation is extracted event data.
for file,key in [('market-sources.json','sources'),('additional-sources.json','sources'),('nontech-retrieval.json','used_sources')]:
    doc=json.loads((NOTES/file).read_text())
    for row in doc[key]:
        url=row['url'];access=row.get('best_access',row.get('retrieval_status','unknown'))
        sid=source(url,row.get('title'),row.get('publisher',row.get('platform')),row.get('source_type','evaluated_source'),method=access,status=access)
        sr=next(s for s in T['sources'] if s['id']==sid)
        if file=='nontech-retrieval.json':sr['access_method']=access
# Include dated observations from access tests, with uncertainty preserved.
a=json.loads((NOTES/'additional-sources.json').read_text());am={s['id']:s for s in a['sources']}
for x in a['examples']:
    src=am[x['source_ids'][0]];sid=uid('src',src['url'])
    loc=x['venue'];fmt={'meetup-python-edinburgh-2024-09':'community_meeting','10times-easa-2024':'trade_fair','sessionize-addo-2024':'conference','pretix-oew-2024':'workshop','tt-webinar-2023-10':'webinar','humanitix-ra-2023':'conference','stanford-powwow-2023':'cultural_festival','ise-2024':'trade_fair'}[x['id']]
    # Country is only taken from address text; no guessed coordinates or zones.
    start=x['start_date'];end=x.get('end_date')
    eid=event(x['title'],start,end,loc,src['url'],sid,fmt=fmt,sector='technology' if x['id'] in ['meetup-python-edinburgh-2024-09','sessionize-addo-2024','pretix-oew-2024','ise-2024'] else 'other',locator='Dated event body; '+x['evidence_status'],start_at=start+'T'+x['start_time_local']+':00' if x.get('start_time_local') else None,end_at=(end or start)+'T'+x['end_time_local']+':00' if x.get('end_time_local') else None,tz=x.get('timezone_as_published'))
    ev=next(e for e in T['event_editions'] if e['id']==eid);ev['missing_reasons_json']['evidence_status']=x['evidence_status'];ev['end_semantics']='explicit_source_date' if end else 'unknown_end_date'
    listing(eid,src.get('platform','organizer'),src['url'],sid,method='public_page_read' if x['evidence_status'].startswith('read') else 'search_index_only')
    if x.get('organizer'):role(eid,company(x['organizer'],None,sid,'Organizer'),'organizer',sid)
    for p in x.get('ticket_prices_announced',[]):
        tid=add('ticket_types',dict(event_id=eid,name=p['type'],currency=p['currency'],payment_mode='paid'),sid,'Published ticket prices')
        add('ticket_price_history',dict(ticket_id=tid,amount=p['amount'],currency=p['currency'],sale_phase=p['type'],valid_from=p.get('announced_from'),valid_to=p.get('announced_until'),observed_at=OBS,availability='historical_closed'),sid,'Published ticket prices')
    for m in x.get('metrics',[]):
        ms=uid('src',am[m['source_id']]['url']);name=m['name'];unit='visits' if 'visits' in name else ('organizations' if name=='exhibitors' else ('registrations' if name=='registrations' else 'people'))
        add('event_metrics',dict(event_id=eid,metric=name,value=m['value'],unit=unit,period='2024',attribution_method='organizer_registration_system; independent_audit_unknown',metric_status='reported_actual'),ms,'Facts and Figures text / press release; definitions kept separate')
# Explicit source-attributed aliases (no automatic transfer of agreement).
ccr=next((c for c in T['companies'] if c['name'] in ['CCR','Grupo CCR']),None);mot=next((c for c in T['companies'] if c['name']=='Motiva'),None)
if ccr and mot:
    su='https://www.motiva.com.br/en/news/motiva-sera-a-nova-marca-do-grupo-ccr/';ss=source(su,method='web_open')
    add('entity_aliases',dict(entity_table='companies',entity_id=mot['id'],alias='CCR',valid_from='2025-04',equivalence_reason='Published brand change; historical source spelling preserved, agreement continuity not inferred',review_status='reviewed_brand_link; legal_identity_unverified'),ss,'Corporate rebrand announcement')
# Registered queries and bounded failures; no synthetic telemetry for unavailable timings.
nr=json.loads((NOTES/'nontech-retrieval.json').read_text())
for q in nr['search_queries']:add('search_queries',dict(query=q['q'] if isinstance(q,dict) else q,service='web_search',language='mixed_es_pt_fr_en_it',window_start=WINDOW,window_end=OBS,observed_at=OBS,batch_id='nontech-exploration'))
for x in nr['failed_attempts']:add('fetch_attempts',dict(run_id='nontech-web-research',url=x['url'],observed_at=OBS,result='failed',error_class=x['detail'],next_step='bounded_failure; see continuation queue'))
add('crawl_runs',dict(id='nontech-web-research',method='primary_web_search_and_open',extractor_version='curation1',scope='four_series_international',started_at=OBS,finished_at=OBS,pages_failed=8,records_output=24,billing_status='charge_unobservable',closure_reason='57 distinct cited sources:46body_read,11index_only;8 documented failed attempts; success and total attempt counts unavailable'))
# Taxonomy and derived classifications remain identifiable.
for field in ['format','sector','modality']:
    for val in sorted(set(e.get(field,'unknown') for e in T['event_editions'])):
        tid=add('taxonomy_terms',dict(id=uid('term',field,val),category=field,term=val,definition='Exploratory classification; terms not mutually exclusive at source',language='en_or_source',version='1'))
        for e in T['event_editions']:
            if e.get(field)==val:add('entity_classifications',dict(entity_table='event_editions',entity_id=e['id'],term_id=tid,origin='derived',method='title/location heuristic or reviewed series mapping; see build script',version='1',reviewed_at=OBS))
# Required continuation has exact seeds and completion rules, never fabricated cursors.
queue=[
('https://www.python.org/events/python-events/','calendar','global','Python',1,'ready','Two exports fully parsed; 10 RRULE records excluded','Inspect notes/*-recurrence-review.json; expand only bounded occurrences with EXDATE/RDATE semantics','All10 rules audited; compare UIDs, not title only'),
('https://flip.org.br/ed/24a-flip/','organizer','Brazil','culture',1,'access_limited','Six index-only cores','Obtain organizer-authorized export or accessible primary body; no bypass','Each provisional date has body evidence or remains excluded from recommendations'),
('https://pybay.org/','organizer','United States','technology',1,'ready','2026 price/deadline conflict','Recheck dated organizer announcement and registration terms; no purchase','Resolve Sept19/26 vs displayed tickets and refresh each future edition selected'),
('https://2026.pycon.ie/blog/venue-change/','organizer','Ireland','technology',1,'ready','Nov21 confirmed; venueTBA','Read next dated venue announcement; retain both versions','Official venue and timezone, or explicit unknown'),
('https://docs.luma.com/reference/getting-started-with-your-api','platform','global','mixed',2,'credentials_and_plan_required','Docs evaluated; no account API calls','Customer-authorized calendar sandbox; demonstrate read before create','Scope/rights and fields verified; no publication without user instruction'),
('https://www.eventbrite.com/platform/api','platform','global','mixed',2,'access_required','Global search not established; reads429','Organizer-provided export or licensed data agreement','Known authorized event corpus and retention rights'),
('https://partiful.com/terms','platform','global','social_culture',2,'permission_required','Organizer outbound link read; no platform crawler','Seek permitted organizer source or explicit agreement','Commercial use and extraction basis documented'),
('https://archive.org/help/wayback_api.php','archive','global','mixed',2,'rate_limited','One ordinary retry429; zero captures','Resume later from exact PyCon2022 availability query in additional-sources.json','Dated captures for temporal holdout or explicit no capture'),
('https://www.python.org/events/python-events/','organizer_linked_pages','global','technology',2,'ready','652 UID rows already retained','Sort upcoming date then enrich canonical URLs from platform_listings; checkpoint by event_id','35 calendar-future cores rechecked or marked stale; include pricing and venue'),
('https://www.firabarcelona.com/en/our-history/','institution','Spain','trade_fairs',3,'scope_pending','History inspected; not enumerated','Choose territory first, enumerate annual named fairs2021–2026 from official calendars','Reference roster with audited denominator'),
('https://help.humanitix.com/en/articles/8888275-public-api-documentation','platform','global','mixed',3,'customer_permission_required','One public historical page read; no API','Obtain client authorization and applicable retention terms before ingest','Own/shared events and past retention basis documented'),
('https://www.meetup.com/graphql/guide/','platform','global','communities',3,'commercial_permission_required','One historical group page read','Pro approval plus written commercial consent; otherwise public organizer feeds','Scope+cost+retention verified')]
for url,fam,geo,seg,pri,st,cursor,action,done in queue:add('extraction_queue',dict(source_url=url,family=fam,geography=geo,segment=seg,window_start=WINDOW,window_end=OBS,priority=pri,status=st,last_processed=OBS,cursor=cursor,blocking_reason=st if st!='ready' else None,next_action=action,completion_condition=done))
# Local synthetic proposal: never an observed event or a Luma API object.
evidence=[a['id'] for a in T['assertions'] if a['entity_table']=='event_editions' and a['field']=='title' and 'Summer Hack' in str(a['value_json'])]
concept=add('event_concepts',dict(id='concept-python-ai-clinic',title='Clínica de evaluación de aplicaciones de IA con Python',objective='Escenario sintético: aprendizaje y conversaciones cualificadas',audience='Equipos que construyen aplicaciones Python; validar con cliente',format='workshop',rationale='Formato propuesto inspirado en agenda técnica y hackathon observado; demanda local no demostrada',evidence_ids_json=evidence,estimated_budget=2000,currency='USD',pending_decisions_json=['Empresa y geografía','Fecha y zona horaria','Recinto y capacidad','Anfitrión y facilitadores','Registro y precio','Consentimiento y métricas'],status='hypothetical_local_proposal; no_booking_or_publication'))
draft=add('luma_drafts',dict(id='local-draft-python-ai-clinic',concept_id=concept,title='Clínica de evaluación de aplicaciones de IA con Python',description='Propuesta: un taller práctico para definir y probar una evaluación pequeña de una aplicación de IA. Cada equipo saldría con criterios de calidad y un plan de medición. Anfitrión, lugar, fecha, facilitadores y registro pendientes.',agenda_json=[{'minutes':15,'activity':'Objetivo y criterios de evaluación'},{'minutes':45,'activity':'Trabajo guiado en casos propios'},{'minutes':20,'activity':'Revisión entre equipos'},{'minutes':10,'activity':'Siguientes pasos'}],supported_fields_json={'name':'proposed','description_md':'proposed','start_at':'missing_required','timezone':'missing_required','end_at':'pending','geo_address_json':'pending','registration_open':False},local_state='local_content_only; API_payload_invalid_until_required_fields_completed',version='1',pending_decisions_json=['No enviar API','Sin sponsors confirmados','Sin recinto reservado','Sin fecha definitiva']))
for f in ['title','description','agenda_json','supported_fields_json']:
    d=next(x for x in T['luma_drafts'] if x['id']==draft);add('draft_field_evidence',dict(draft_id=draft,field=f,value_json=d[f],origin='hypothetical_editorial_proposal',approval_state='not_approved'))
# Machine-readable competitor index; detailed matrix and exact price caveats in report.
for name,url,category,buyer,availability,price,currency in [
 ('Vendelux','https://vendelux.com/','event_intelligence','field marketing / sales','commercial_demo',None,None),
 ('Pana Events','https://www.pana.space/events','planning_and_discovery','marketing / organizers','mixed_live_and_coming_soon',29,'symbol_$; currency_not_explicit'),
 ('SponsorUnited','https://www.sponsorunited.com/','sponsorship_intelligence','brands / rights holders','commercial_demo',None,None),
 ('Partable','https://partable.ai/events','sponsor_prospecting','organizers','early_access',79,'symbol_$; currency_not_explicit'),
 ('Identyca','https://identyca.io/','organizer_intelligence','organizers','Now intelligence; Next vendors; Soon marketplace',None,None),
 ('Kuration AI','https://kurationai.com/solutions/event-intelligence','extraction_enrichment','sales / organizers','commercial',49,'symbol_$; currency_not_explicit'),
 ('Events Intelligence / HuntEx','https://www.events-intelligence.com/','exhibitor_intelligence','trade_fair_organizers','commercial_service',None,None),
 ('EventoPulse','https://www.eventopulse.com/','event_signals','GTM / organizers','commercial',49,'symbol_$; currency_not_explicit'),
 ('Acirio','https://acirio.com/','sponsor_prospecting','organizers','personal_project_in_development',0,None),
 ('run.events','https://run.events/','event_management','organizers','commercial',4300,'EUR')]:
 ss=source(url,kind='vendor_product',method='provider_page_or_index; detailed_access_in_market_sources')
 add('competitors',dict(name=name,url=url,category=category,buyer=buyer,availability=availability,public_price=price,price_currency=currency,limitations='Provider claims, not tested. Prices differ by period/plan and may be inconsistent. See phase1-market-access.md for exact unit, limitations and feature matrix.'),ss,'Provider product and linked pricing, cited in market report')
# Additional original first-party news observations; dates remain unknown if not established.
for url,title,summary in [
 ('https://www.motiva.com.br/en/news/motiva-sera-a-nova-marca-do-grupo-ccr/','Motiva será a nova marca do Grupo CCR','Anuncia cambio de marca para abril de2025; conservar alias históricos.'),
 ('https://www.motiva.com.br/en/news/motiva-assina-programacao-na-flip-pelo-segundo-ano-consecutivo/','Motiva en Flip2025','Anuncia BRL2millones combinando recursos propios e incentivados para apoyo y activaciones; no fee auditado.'),
 ('https://rodovias.motiva.com.br/riosp/noticias/2026/julho/motiva-assina-a-programacao-oficial-da-flip-pelo-terceiro-ano-co/','Motiva en Flip2026','Retrospectiva declara2792visitas a Casa Flip+Motiva2025; no leads ni ROI.'),
 ('https://media.renault.com/?p=529529','Renault en Roland-Garros2025','Anuncia presentación Renault4Savane4x4Concept y flota187vehículos; no interés en otros eventos.'),
 ('https://press.frieze.com/frieze-london-frieze-masters-2025-end-of-fair/','Frieze2025 end of fair','Recap declara venta DavidZwirner/ChrisOfili por USD700000 en London; no resultado representativo.')]:
 ss=source(url,kind='first_party_news',method='web_open');ar=add('news_articles',dict(source_id=ss,title=title,publisher=urllib.parse.urlparse(url).netloc,url=url,editorial_type='first_party_announcement_or_recap',summary=summary,access_status='body_read; date_not_normalized'))
 add('news_dedup_clusters',dict(article_id=ar,cluster_id=uid('cluster',url),original_article_id=ar,relationship='original_url',independence_basis='first_party; not_independent_corroboration'))
 # Link only editions actually associated with this source's observations.
 eventids={a['entity_id'] for a in T['assertions'] if a.get('source_id')==ss and a.get('entity_table')=='event_editions'}
 eventids|={r['event_id'] for r in T['event_company_roles']+T['event_metrics'] if r.get('source_id')==ss}
 for eid in eventids:add('news_entity_links',dict(article_id=ar,entity_table='event_editions',entity_id=eid,mention_type='source_attributed_event_fact'),ss,'Source observation joins; see original fact locator')

# Presence records are published relationships, not executed paid agreements.
for r in T['event_company_roles']:
 if r['role']=='sponsor':
  e=next(e for e in T['event_editions'] if e['id']==r['event_id'])
  hid=add('sponsorship_history',dict(company_id=r['company_id'],event_id=e['id'],series_id=e.get('series_id'),level=r.get('level'),period=e['start_date'][:4],status='published_sponsor_presence; contract_amount_and_execution_unknown'),r['source_id'],'Sponsor list or explicitly named sponsor; original role row '+r['id'])

  origin=next((a for a in T['assertions'] if a['entity_table']=='event_company_roles' and a['entity_id']==r['id'] and a['field']=='role'),None)
  if origin:
   for a in T['assertions']:
    if a['entity_table']=='sponsorship_history' and a['entity_id']==hid:a['evidence_class']=origin['evidence_class'];a['confidence_basis']=origin['confidence_basis']

# Preserve the exact prior brand string as an alias after a disclosed brand transition.
if ccr and mot:
 add('entity_aliases',dict(entity_table='companies',entity_id=mot['id'],alias='Grupo CCR',valid_from='2025-04',equivalence_reason='Published rebrand link; historical company legal identity and sponsorship transfer are not asserted',review_status='reviewed_brand_transition_only'),ss,'Corporate rebrand announcement')
# Persist the planning scenarios in the requested logical unit-economics schema.
cost_file=ROOT/'phase2'/'cost-model.json'
if cost_file.exists():
 cost_doc=json.loads(cost_file.read_text())
 for sc in cost_doc['scenarios']:
  add('unit_economics_scenarios',dict(id='planning-'+sc['scenario'],volume=sc['flows_per_month'],frequency='monthly',data_usd=sc['search_usd']+sc['models_usd'],models_usd=sc['models_usd'],maps_usd=sc['maps_usd'],storage_usd=sc['r2_usd']+sc['db_usd_low'],human_usd=sc['human_usd_assumed'],total_usd=sc['total_with_human_usd_low'],cost_per_useful_result=None,assumptions_json={'high_total_with_human_usd':sc['total_with_human_usd_high'],'worker_usd_low':sc['app_worker_usd_low'],'worker_usd_high':sc['app_worker_usd_high'],'db_usd_high':sc['db_usd_high'],'source_licence':sc['license_usd'],'input_token_assumptions':'phase2/cost-model.json','prices_observed':OBS,'human_rate_usd_per_hour':40,'map_sessions':sc['flows_per_month'],'search_sessions':sc['flows_per_month']} ,estimate_or_measured='planning_range_not_invoice; useful_result_undefined'))

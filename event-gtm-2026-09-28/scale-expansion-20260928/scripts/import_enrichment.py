"""Executed within build.py after bulk ingestion; no network. Primary facts only."""
p=ROOT/'batches/enrichment.jsonl'
if p.exists():
 rows=[json.loads(line) for line in p.read_text().splitlines() if line.strip()]
 companies=[dict(r) for r in c.execute('SELECT * FROM companies')]
 company_names={norm(r['name']):r['id'] for r in companies};company_domains={urlsplit(r['company_url'] or '').netloc.lower().removeprefix('www.'):r['id'] for r in companies if r['company_url']}
 def co(name,url,src):
  if not name:return None
  dom=urlsplit(url or '').netloc.lower().removeprefix('www.');cid=company_names.get(norm(name))
  # Platform URL hosts are never used as company identity.
  if not cid and dom and dom not in {'github.com','linkedin.com','facebook.com','x.com','twitter.com'}:cid=company_domains.get(dom)
  if not cid:
   cid=sid('co2',dom or norm(name));add('companies',{'id':cid,'name':name,'company_url':url,'domain':dom or None,'source_id':src,'missing_reasons_json':js({'current_sponsor_budget':'unknown','current_interest':'unknown'})})
  company_names[norm(name)]=cid
  if dom:company_domains[dom]=cid
  return cid
 def stripyear(x):return norm(re.sub(r'\b20\d\d\b','',x))
 enrichment_events={}
 for i,x in enumerate(rows):
  src=source(x['source_url'],'primary_enrichment',x['observed_at'],'public_factual_evidence; no general redistribution license established','primary');eid=None;cid=None;entity=None;entityid=None
  add('source_snapshots',{'id':sid('snapshot',src,x.get('content_sha256')),'source_id':src,'original_url':x['source_url'],'observed_at':x['observed_at'],'sha256':x.get('content_sha256'),'availability':'retrieved','retained_material':'normalized facts and locators only','retention_basis':'research_factual_metadata'})
  if x.get('event_title'):
   key=(x['event_title'],x['event_start']);eid=enrichment_events.get(key)
   if not eid:
    for e in EVENTS.values():
     if e['start_date']==x['event_start'] and stripyear(e['title'])==stripyear(x['event_title']) and (not e['country'] or country(e['country'])==country(x.get('country'))):eid=e['id'];break
   if not eid:
    native=x['event_title']+'|'+x['event_start'];o={'family':'primary_enrichment','native_id':native,'title':x['event_title'],'url':x['event_url'],'start':x['event_start'],'end':x.get('event_end'),'city':x.get('city'),'country':x.get('country'),'source_url':x['source_url'],'locator':x['locator'],'observed_at':x['observed_at'],'evidence_class':'primary','language':x.get('language'),'category':'technology','license':'public_factual_evidence_only'}
    ingest(o,'enrichment',{},i);eid=NATIVE[('primary_enrichment',native)]
   enrichment_events[key]=eid
   # Date and title assertions are sourced to official page even when canonical matched.
   for field,val in [('title',x['event_title']),('start_date',x['event_start']),('end_date',x.get('event_end')),('canonical_url',x.get('event_url'))]:assertion('event_editions',eid,field,val,src,x['locator'],x['observed_at'],'primary',x['confidence_explanation'])
  if x.get('company_name'):
   cid=co(x['company_name'],x.get('company_url'),src)
   for field in ['name','company_url']:
    assertion('companies',cid,field,x['company_name'] if field=='name' else x.get('company_url'),src,x['locator'],x['observed_at'],'primary',x['confidence_explanation'])
   for alias in x.get('company_aliases',[]):add('entity_aliases',{'id':sid('alias',cid,alias,src),'entity_table':'companies','entity_id':cid,'alias':alias,'external_system':'organizer_sponsor_logo_label','equivalence_reason':'same linked company website; layout/country suffix removed','review_status':'source_link_verified','source_id':src})
  kind=x['kind']
  if kind in ['sponsor_named','organizer']:
   role=x.get('role') or ('sponsor' if kind=='sponsor_named' else 'organizer')
   # The same company can be named at multiple levels; retain each observed tier.
   entity='event_company_roles';entityid=sid('role2',eid,cid,role,x.get('level'),src)
   add(entity,{'id':entityid,'event_id':eid,'company_id':cid,'role':role,'level':x.get('level'),'relationship_status':(x.get('support_type') or 'published')+'; paid_contract_unverified','source_id':src})
   if role=='sponsor':add('sponsorship_history',{'id':sid('history2',entityid),'company_id':cid,'event_id':eid,'series_id':EVENTS[eid].get('series_id'),'level':x.get('level'),'period':x.get('event_start'),'status':'published_sponsor; contract_and_payment_unverified','source_id':src})
  elif kind in ['audience_metric','audience_profile','outcome_metric']:
   entity='event_metrics' if kind=='outcome_metric' else 'audience_metrics';entityid=sid('metric2',x['assertion_id'])
   add(entity,{'id':entityid,'event_id':eid,'segment':'published_target_roles' if kind=='audience_profile' else None,'metric':x['metric'],'value':js(x['value']) if isinstance(x['value'],(dict,list)) else str(x['value']),'unit':x.get('unit'),'denominator':str(x['denominator']) if x.get('denominator') is not None else None,'period':x.get('event_start'),'method':x.get('definition'),'attribution_method':x.get('definition'),'metric_status':'promoted_audience_not_observed' if kind=='audience_profile' else 'organizer_reported_unverified','source_id':src})
  elif kind=='sponsor_package':
   entity='sponsorship_packages';entityid=sid('package2',x['assertion_id'])
   add(entity,{'id':entityid,'event_id':eid,'name':x['level'],'amount_min':str(x['value']),'amount_max':str(x['value']),'currency':x.get('currency'),'benefits_json':js({'pricing_definition':x['definition'],'tax_status':x.get('tax_status'),'is_transaction':False}),'availability':'historical_closed_offer','source_id':src})
  elif kind=='call_for_sponsors':
   entity='event_deadlines';entityid=sid('deadline2',x['assertion_id'])
   add(entity,{'id':entityid,'event_id':eid,'deadline_type':'sponsor_addon_contract_deadline','date':x['value'],'date_precision':'day','status':x.get('status'),'requirements':x['definition'],'source_id':src})
  elif kind=='company_profile':
   entity='company_profile_history';entityid=sid('profile2',x['assertion_id'])
   add(entity,{'id':entityid,'company_id':cid,'version':'observed_20260928','value_proposition':x['value'],'observed_at':x['observed_at'],'source_id':src})
  elif kind=='company_news':
   entity='news_articles';entityid=sid('news2',x['assertion_id'])
   add(entity,{'id':entityid,'source_id':src,'title':x['value'],'publisher':x['company_name'],'url':x['source_url'],'language':x.get('language'),'published_at':x.get('published_at'),'editorial_type':'company_press_release','summary':x['definition'],'access_status':'retrieved'})
   other=co(x.get('related_company_name'),x.get('related_company_url'),src)
   for coid in [cid,other]:
    if coid:add('news_entity_links',{'id':sid('newslink2',entityid,coid),'article_id':entityid,'entity_table':'companies','entity_id':coid,'mention_type':'announcement_party','source_id':src})
   add('company_signals',{'id':sid('signal2',entityid),'company_id':cid,'signal_type':x['metric'],'fact_date':x.get('published_at'),'fact':x['value'],'hypothesis':'Potential theme fit only; no event interest or marketing budget inferred','source_id':src})
  if entity:
   for k,v in x.items():
    if k not in {'source_url','content_sha256','observed_at','assertion_id','fetch_id','locator'}:assertion(entity,entityid,k,v,src,x['locator'],x['observed_at'],'primary',x['confidence_explanation'])
   add('scale_enrichment_observations',{'id':x['assertion_id'],'entity_table':entity,'entity_id':entityid,'source_id':src,'payload_json':js(x)})
 add('scale_batches',{'id':'enrichment','path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes()),'rows_read':len(rows),'metadata_json':js({'kind_counts':dict(collections.Counter(x['kind'] for x in rows)),'source':'primary pages/reports','no_attendee_data':True})})
 print('enrichment',len(rows),'observations',len(enrichment_events),'events addressed',flush=True)

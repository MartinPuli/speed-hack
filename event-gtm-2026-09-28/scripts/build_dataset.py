"""Build the research export from factual acquisition batches; no app/database access.
All empty logical tables remain explicit. Run again after adding reviewed batches.
"""
from pathlib import Path
import collections, csv, datetime, hashlib, json, re, sqlite3, unicodedata

ROOT=Path(__file__).resolve().parents[1]
CUTOFF='2026-09-28'; VERSION='research-2026-09-28-v1'
def j(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def ident(prefix,*parts): return prefix+'_'+hashlib.sha256('|'.join(map(str,parts)).encode()).hexdigest()[:16]
def norm(s): return ' '.join(unicodedata.normalize('NFKC',s).casefold().split())

# Named relational columns, with lossless supplementary JSON for heterogeneous fields.
SCHEMAS={
'sources':'source_id url publisher title source_type language published_at checked_at access_method access_status reuse_status extraction_status',
'assertions':'assertion_id entity_table entity_id field value_json source_id locator evidence_brief valid_at observed_at evidence_class confidence_reason conflict_status',
'companies':'company_id name domain website description industry products_json markets_json',
'event_series':'series_id name website periodicity',
'event_editions':'edition_id edition_key series_id title url start_date end_date date_precision timezone modality status city country venue_id geographic_precision format sector themes_json languages_json checked_at',
'event_company_roles':'role_id company_id edition_id role tier status source_id',
'sponsor_profiles':'profile_id company_id objectives_json audiences_json categories_json geographies_json proposal_channel decision_process budget currency source_id',
'sponsorship_packages':'package_id edition_id name amount currency unit benefits exclusivity availability valid_at source_id',
'people':'person_id name public_profile source_id',
'participation':'participation_id person_id edition_id company_id role affiliation_at_event status source_id',
'audience_metrics':'metric_id edition_id name value unit denominator segment status source_id',
'event_metrics':'metric_id edition_id company_id name value unit denominator status method source_id',
'event_costs':'cost_id edition_id category name amount currency unit taxes price_type valid_at source_id',
'venues':'venue_id name city country address latitude longitude coordinate_method capacity website source_id',
'distribution_channels':'channel_id company_id name type topic geography access size measured_at source_id',
'competitors':'competitor_id name url category buyer job onboarding geography history refresh integrations api_export public_price commercial_status source_ids_json',
'extraction_queue':'queue_id url source_family scope years priority status cursor blocking_reason next_action stop_condition',
'platform_listings':'listing_id edition_id platform native_id url first_observed last_observed status source_id',
'source_snapshots':'snapshot_id source_id original_url archive_url archived_at observed_at content_type retained_path sha256 retained_material permission',
'crawl_runs':'crawl_id batch method version started_at ended_at attempts completed failed new_editions measured_cost_usd stop_reason',
'fetch_attempts':'attempt_id crawl_id url observed_at status error duration_ms attempt_kind next_action',
'search_queries':'query_id query provider language filters_json geography time_window observed_at batch result_status',
'entity_aliases':'alias_id entity_table entity_id alias system valid_at reason source_id review_status',
'record_versions':'version_id entity_table entity_id version observed_at valid_at source_ids_json reason',
'data_conflicts':'conflict_id entity_table entity_id field values_json source_ids_json status resolution',
'taxonomy_terms':'term_id category term definition parent synonyms_json language version',
'entity_classifications':'classification_id entity_table entity_id term_id origin source_ids_json method version',
'sessions':'session_id edition_id title description track format date time room status source_id',
'session_participants':'link_id session_id person_id company_id role affiliation status source_id',
'ticket_types':'ticket_id edition_id name requirements benefits paid currency source_id',
'ticket_price_history':'price_id ticket_id amount currency taxes observed_at valid_at availability source_id',
'event_status_history':'status_id edition_id previous_status new_status announced_at effective_at reason source_id',
'event_relations':'relation_id from_edition_id to_edition_id type evidence_class source_id',
'venue_spaces':'space_id venue_id name capacity layout services_json valid_at source_id',
'event_space_assignments':'assignment_id edition_id session_id space_id starts_at ends_at status source_id',
'event_assets':'asset_id edition_id type url language published_at rights source_id',
'communities':'community_id name company_id topic geography website source_id',
'community_event_links':'link_id community_id edition_id role period source_id',
'company_profile_history':'profile_id company_id version products_json audiences_json markets_json size observed_at valid_at source_id',
'professional_affiliations':'affiliation_id person_id company_id title valid_at edition_id source_id',
'event_deadlines':'deadline_id edition_id type date precision timezone requirements source_id',
'distribution_metrics':'metric_id channel_id name value unit denominator period method source_id',
'news_articles':'article_id source_id title publisher author url language published_at updated_at article_type independence summary_own event_date access',
'news_entity_links':'link_id article_id entity_table entity_id relation claim valid_at source_id',
'news_dedup_clusters':'membership_id article_id cluster_id probable_origin relation independence evidence',
'company_signals':'signal_id company_id type value event_date geography source_id relevance_hypothesis',
'market_context':'context_id region sector variable value unit period source_id decision_relevance',
'sponsorship_history':'agreement_id company_id edition_id series_id package_id tier period status modality amount currency source_id',
'sponsorship_deliverables':'deliverable_id package_id agreement_id type quantity unit audience deadline criterion source_id',
'sponsorship_observations':'observation_id agreement_id deliverable_id edition_id date observation status metrics_json source_id',
'partner_relationships':'partnership_id company_a_id company_b_id type objective period edition_id source_id',
'sponsorship_renewals':'renewal_id company_id series_id from_edition_id to_edition_id relationship coverage method version cutoff input_ids_json',
'topic_trends':'trend_id topic geography period count denominator coverage method version cutoff input_ids_json',
'audience_overlap':'overlap_id entity_a_id entity_b_id universe numerator denominator value period method version cutoff input_ids_json',
'opportunity_clusters':'cluster_id geography audience topic format period evidence_json missing_json method version cutoff input_ids_json',
'evaluation_cases':'case_id profile_json objective restrictions_json cutoff split label_origin ground_truth_quality',
'recommendation_runs':'run_id case_id cutoff dataset_version method parameters_json model elapsed_ms measured_cost_usd',
'recommendation_candidates':'candidate_id run_id edition_id eligibility components_json score rank evidence_ids_json missing_json explanation human_label',
'sponsor_match_scores':'match_id company_id edition_id concept_id cutoff components_json score interest_status missing_json method version input_ids_json',
'scoring_evaluations':'evaluation_id case_set method baseline metric value sample_size definition limitation',
'unit_economics_scenarios':'scenario_id volume frequency components_json monthly_total_usd useful_fraction cost_per_useful_usd cost_type assumptions_json source_ids_json',
'event_concepts':'concept_id brief_id title objective audience format proposed_place proposed_date rationale budget_estimate pending_json input_ids_json status',
'luma_drafts':'draft_id concept_id title description agenda_json supported_fields_json status version pending_json remote_id',
'draft_field_evidence':'field_id draft_id field value_json origin source_ids_json approval_status',
'customer_briefs':'brief_id tenant_id website objective offer audience geography dates_json budget currency restrictions_json version',
'user_feedback':'feedback_id tenant_id brief_id proposal_id type reason observed_at outcome_json'
}
DERIVED=set('taxonomy_terms entity_classifications sponsorship_renewals topic_trends audience_overlap opportunity_clusters evaluation_cases recommendation_runs recommendation_candidates sponsor_match_scores scoring_evaluations unit_economics_scenarios event_concepts luma_drafts draft_field_evidence'.split())
PRIVATE={'customer_briefs','user_feedback'}
TABLES={k:[] for k in SCHEMAS}; source_by_url={}; source_alias={}; company_by_key={}; edition_by_key={}; source_use=collections.Counter()
def add(table,data,extra=None):
    row={k:data.get(k) for k in SCHEMAS[table].split()}
    surplus={k:v for k,v in data.items() if k not in row}
    if extra: surplus.update(extra)
    row['extra_json']=j(surplus) if surplus else None
    row['missing_reasons_json']=j({k:'not_found_in_consulted_sources' for k,v in row.items() if v is None and k!='extra_json'})
    TABLES[table].append(row);return row
def sid(url): return source_by_url.get(url)
def ensure_source(url):
    if not url:return None
    if url not in source_by_url:register_source({'url':url,'title':None,'access_status':'referenced_not_opened','extraction_status':'reference_only'})
    return sid(url)
def register_source(s):
    url=s.get('url')
    if not url:return
    if url in source_by_url:
        if s.get('source_id'):source_alias[s['source_id']]=sid(url)
        return
    k=ident('src',url);source_by_url[url]=k
    if s.get('source_id'):source_alias[s['source_id']]=k
    access=s.get('access_status') or s.get('status') or s.get('access') or ('read' if s.get('access_method') in ('web_read','web_open','web_opened','web_pdf_read','public_html_get') else 'indexed_only' if s.get('access_method')=='official_search_index' else 'documented_access_unspecified')
    add('sources',{'checked_at':CUTOFF,'access_status':access,'reuse_status':'pending_commercial_review','extraction_status':s.get('extraction_status','facts_extracted' if access in ('read','opened','web_opened') else 'documentation_reviewed'),**s,'source_id':k})
def claim(table,id,field,value,url,locator='Identified edition or section',valid=None,klass='source_statement',note=None):
    if value is None or not url:return
    source=ensure_source(url);source_use[source]+=1
    c=ident('a',table,id,field,j(value),source)
    if any(x['assertion_id']==c for x in TABLES['assertions']):return
    add('assertions',{'assertion_id':c,'entity_table':table,'entity_id':id,'field':field,'value_json':j(value),'source_id':source,'locator':locator,'evidence_brief':note or 'Hecho/etiqueta transcrito de la sección indicada; sin copiar el texto de la página.','valid_at':valid,'observed_at':CUTOFF,'evidence_class':klass,'confidence_reason':'La fuente identifica el campo; no implica corroboración independiente, pago ni éxito comercial.','conflict_status':'not_detected'})
def company(o,url):
    name=o['name'];key=norm(name);dom=o.get('domain');web=o.get('website')
    # Do not equate shortlink host with canonical company domain.
    if dom in ('aka.ms','mdb.link','bit.ly','forms.gle'):dom=None
    if key not in company_by_key:
        cid=ident('org',key);company_by_key[key]=cid
        add('companies',{'company_id':cid,'name':name,'domain':dom,'website':web,'identity_status':'display_name_not_legal_entity_verified','domain_status':'linked_host_not_canonical_ownership_verified' if dom else None})
    cid=company_by_key[key]
    claim('companies',cid,'name',name,url,o.get('locator','Organization label'))
    if dom:claim('companies',cid,'domain',dom,url,'Public organization link; host only')
    if web:claim('companies',cid,'website',web,url,'Public organization link')
    return cid

BATCHES=[]
for f in sorted((ROOT/'batches').glob('*.json')):
    b=json.loads(f.read_text());BATCHES.append((f,b))
    for s in b.get('sources',[]):register_source(s)

for f,b in BATCHES:
    crawl=ident('crawl',f.name);attempts=b.get('attempts',[])
    if attempts or b.get('editions'):
        add('crawl_runs',{'crawl_id':crawl,'batch':f.name,'method':b.get('method','documentary_read_and_fact_transcription'),'version':VERSION,'started_at':CUTOFF,'ended_at':CUTOFF,'attempts':len(attempts),'new_editions':len(b.get('editions',[])),'stop_reason':'bounded research batch closed for integration; not source exhaustion','count_semantics':'documentary summaries except explicitly timed HTTP; new_editions is batch edition keys, not global source novelty'})
    for ix,a in enumerate(attempts):
        add('fetch_attempts',{'attempt_id':ident('fetch',f.name,ix),'crawl_id':crawl,'url':a.get('url'),'observed_at':a.get('checked_at',CUTOFF),'status':str(a.get('status',a.get('result','documented'))),'error':a.get('error'),'duration_ms':a.get('elapsed_ms'),'attempt_kind':'http_measured' if 'elapsed_ms' in a else 'documentary_summary','next_action':a.get('next_action')},a)
    for ix,q in enumerate(b.get('queue',[])):
        add('extraction_queue',{'queue_id':ident('q',f.name,ix),'status':'pending','priority':'P1','years':'2021-09-28/2026-09-28 plus verified future','next_action':q.get('next_action',q.get('task')),'blocking_reason':q.get('blocking_reason',q.get('reason')),**q})
    for s in b.get('sources',[]):
        facts=s.get('facts',[])
        if isinstance(facts,str):facts=[facts]
        for ix,fact in enumerate(facts):
            if isinstance(fact,dict):claim('sources',sid(s['url']),fact['field'],fact.get('value'),s['url'],fact.get('locator',''),klass=fact.get('evidence_class','source_statement'))
            else:claim('sources',sid(s['url']),'documentary_note_'+str(ix),fact,s['url'],klass='researcher_summary_of_provider_statement')
    for e in b.get('editions',[]):
        update=next((u for later_file,later_batch in BATCHES for u in later_batch.get('edition_updates',[]) if u.get('key')==e['key']),None)
        if update:
            e={**e,**update.get('values',{})}
            e['field_sources']={**e.get('field_sources',{}),**update.get('field_sources',{})}
            e['source_urls']=list(dict.fromkeys(e.get('source_urls',[])+update.get('source_urls',[])))
            e['verified_conflicts']=update.get('conflicts',[])
        key=e['key'];eid=ident('evt',key);edition_by_key[key]=eid
        if any(x['edition_id']==eid for x in TABLES['event_editions']):
            raise ValueError('Duplicate edition key must be reviewed: '+key)
        urls=e.get('source_urls') or [e['url']];url=urls[0]
        for u in urls:ensure_source(u)
        series=None
        if e.get('series_name'):
            series=ident('series',norm(e['series_name']))
            if not any(x['series_id']==series for x in TABLES['event_series']):add('event_series',{'series_id':series,'name':e['series_name'],'website':None,'periodicity':None})
            claim('event_series',series,'name',e['series_name'],url)
        venue=None
        if e.get('venue_name'):
            venue=ident('venue',norm(e['venue_name']),e.get('city'),e.get('country'))
            if not any(x['venue_id']==venue for x in TABLES['venues']):
                vu=(e.get('field_sources',{}).get('venue_address') or e.get('field_sources',{}).get('venue_name') or [url])[0]
                add('venues',{'venue_id':venue,'name':e['venue_name'],'city':e.get('city'),'country':e.get('country'),'address':e.get('venue_address'),'coordinate_method':'not_geocoded','source_id':ensure_source(vu)})
            claim('venues',venue,'name',e['venue_name'],url)
            if e.get('venue_address'):
                vu=(e.get('field_sources',{}).get('venue_address') or [url])[0]
                claim('venues',venue,'address',e['venue_address'],vu,'Public venue address')
        record={'edition_id':eid,'edition_key':key,'series_id':series,'title':e['title'],'url':e['url'],'start_date':e.get('start_date'),'end_date':e.get('end_date'),'date_precision':e.get('date_precision'),'timezone':e.get('timezone'),'modality':e.get('modality'),'status':e.get('status'),'city':e.get('city'),'country':e.get('country'),'venue_id':venue,'geographic_precision':'venue_named_no_coordinates' if venue else 'city' if e.get('city') else 'unknown','format':e.get('format'),'sector':e.get('sector'),'checked_at':CUTOFF}
        add('event_editions',record,e)
        fs=e.get('field_sources',{})
        for field in ('title','url','start_date','end_date','timezone','status','city','country','venue_name'):
            klass='researcher_status_interpretation' if field=='status' else 'researcher_inference_of_year' if field in ('start_date','end_date') and e.get('date_basis',{}).get('year_is_inferred') else 'source_statement'
            for u in fs.get(field,[url]):claim('event_editions',eid,field,e.get(field),u,e.get('locator','Edition listing'),e.get('start_date'),klass=klass)
        for category in ('format','sector'):
            value=e.get(category)
            if not value:continue
            tid=ident('term',category,value)
            if not any(x['term_id']==tid for x in TABLES['taxonomy_terms']):add('taxonomy_terms',{'term_id':tid,'category':category,'term':value,'definition':'Clasificación operacional del investigador; no segmentación comercial validada.','language':'en','version':VERSION})
            add('entity_classifications',{'classification_id':ident('cls',eid,tid),'entity_table':'event_editions','entity_id':eid,'term_id':tid,'origin':'researcher_derived','source_ids_json':j([sid(u) for u in urls]),'method':'reading_listing','version':VERSION})
        for o in e.get('organizations',[]):
            ou=o.get('source_url',url);cid=company(o,ou);rid=ident('role',eid,cid,o['role'],o.get('tier'))
            add('event_company_roles',{'role_id':rid,'company_id':cid,'edition_id':eid,'role':o['role'],'tier':o.get('tier'),'status':o.get('status'),'source_id':ensure_source(ou)},o)
            for field in ('role','tier','status'):claim('event_company_roles',rid,field,o.get(field),ou,o.get('locator','Organization role'),e.get('start_date'))
        for ix,m in enumerate(e.get('metrics',[])):
            mid=ident('metric',eid,ix,j(m));mu=m.get('source_url',url)
            audience=any(x in m['name'].lower() for x in ('visitor','attend','went','register','inscrit','participant','audience'))
            table='audience_metrics' if audience else 'event_metrics'
            add(table,{'metric_id':mid,'edition_id':eid,'source_id':ensure_source(mu),**m},m)
            for field in ('name','value','unit','denominator','status'):claim(table,mid,field,m.get(field),mu,m.get('locator','Metric'),e.get('start_date'))
        for u in e.get('platform_urls',[]):
            platform='luma' if 'luma' in u else 'eventbrite' if 'eventbrite' in u else 'partiful' if 'partiful' in u else 'other'
            pa=next((x for x in e.get('platform_access',[]) if x['url']==u),{})
            add('platform_listings',{'listing_id':ident('listing',eid,u),'edition_id':eid,'platform':platform,'url':u,'first_observed':CUTOFF,'last_observed':CUTOFF,'status':pa.get('status','linked_from_edition_source; inspect source access for direct read'),'source_id':ensure_source(u)})
        add('record_versions',{'version_id':ident('ver',eid,VERSION),'entity_table':'event_editions','entity_id':eid,'version':VERSION,'observed_at':CUTOFF,'valid_at':e.get('start_date'),'source_ids_json':j([sid(u) for u in urls]),'reason':'initial_research_observation; not historical capture'})

for f,b in BATCHES:
    for table,rows in b.get('derived_tables',{}).items():
        if table not in DERIVED:raise ValueError('Derived batch cannot inject observed or private data: '+table)
        for row in rows:add(table,row)
    for c in b.get('competitors',[]):
        x={**c,'source_ids_json':j([source_alias.get(s,s) for s in c.get('source_ids',[])])};add('competitors',x)
        for field,refs in c.get('field_sources',{}).items():
            for ref in refs:
                ss=next((s for s in b['sources'] if s.get('source_id')==ref),None)
                if ss:claim('competitors',c['competitor_id'],field,c.get(field),ss['url'],klass='vendor_declaration_not_product_test')
    for ix,p in enumerate(b.get('packages',[])):
        pid=ident('pkg',p['edition_key'],p['name']);eid=edition_by_key[p['edition_key']]
        add('sponsorship_packages',{'package_id':pid,'edition_id':eid,'source_id':ensure_source(p['source_url']),**p})
        for field in ('name','amount','currency','unit','benefits','availability'):claim('sponsorship_packages',pid,field,p.get(field),p['source_url'],p.get('locator','Package'))
        add('event_assets',{'asset_id':ident('asset',eid,p['source_url']),'edition_id':eid,'type':'sponsorship_prospectus','url':p['source_url'],'language':'en','rights':'pending_commercial_review','source_id':sid(p['source_url'])}) if not any(x['asset_id']==ident('asset',eid,p['source_url']) for x in TABLES['event_assets']) else None
    costs=list(b.get('costs',[]))
    for e in b.get('editions',[]):costs.extend({'edition_key':e['key'],**c} for c in e.get('costs',[]))
    for ix,c in enumerate(costs):
        eid=edition_by_key[c['edition_key']];url=c.get('source_url');id=ident('cost',f.name,eid,ix)
        add('event_costs',{'cost_id':id,'edition_id':eid,'source_id':ensure_source(url),'unit':c.get('unit',c.get('basis')),'taxes':c.get('taxes',c.get('tax')),**c})
        for field in ('category','name','amount','currency','unit','taxes','price_type'):claim('event_costs',id,field,c.get(field),url,c.get('locator','Price'))
        if c.get('category')=='ticket':
            tid=ident('ticket',eid,c.get('name',ix));add('ticket_types',{'ticket_id':tid,'edition_id':eid,'name':c.get('name'),'paid':c.get('amount',0)>0,'currency':c.get('currency'),'source_id':sid(url)})
            add('ticket_price_history',{'price_id':ident('price',tid,CUTOFF),'ticket_id':tid,'amount':c.get('amount'),'currency':c.get('currency'),'taxes':c.get('taxes'),'observed_at':CUTOFF,'availability':'historical_tariff','source_id':sid(url)})
    for s in b.get('sessions',[]):
        eid=edition_by_key[s['edition_key']];id=ident('session',eid,s['title']);url=s['source_url']
        add('sessions',{'session_id':id,'edition_id':eid,'source_id':ensure_source(url),**s})
        for field in ('title','date','format','status'):claim('sessions',id,field,s.get(field),url,s.get('locator','Agenda'))
        for name in s.get('speakers',[]):
            person=ident('person',eid,name)
            add('people',{'person_id':person,'name':name,'source_id':sid(url),'identity_scope':'edition_agenda; cross-event homonyms not merged'})
            claim('people',person,'name',name,url,s.get('locator','Agenda'))
            add('session_participants',{'link_id':ident('sp',id,person),'session_id':id,'person_id':person,'role':'speaker','status':'announced_in_agenda','source_id':sid(url)})
            add('participation',{'participation_id':ident('part',eid,person),'person_id':person,'edition_id':eid,'role':'speaker','status':'announced_in_agenda','source_id':sid(url)})
    for d in b.get('deadlines',[]):
        id=ident('deadline',d['edition_key'],d['type']);add('event_deadlines',{'deadline_id':id,'edition_id':edition_by_key[d['edition_key']],'precision':'day','source_id':ensure_source(d['source_url']),**d});claim('event_deadlines',id,'date',d['date'],d['source_url'],d.get('locator','Deadline'))
    for a in b.get('news_articles',[]):
        url=a['url'];id=ident('article',url)
        add('news_articles',{'article_id':id,'source_id':ensure_source(url),**a})
        for field in ('title','published_at','article_type','summary_own'):claim('news_articles',id,field,a.get(field),url,klass='article_metadata_or_researcher_summary')
        add('news_dedup_clusters',{'membership_id':ident('newscl',id),'article_id':id,'cluster_id':a.get('dedup_cluster',id),'probable_origin':a.get('original_url',(a.get('derived_from') or [url])[0]),'relation':a.get('dedup_relation',a.get('article_type')),'independence':a.get('independence'),'evidence':'Publisher/type reviewed; cluster denotes claim origin, not independent reporting count'})
        for key in a.get('edition_keys',[]):
            if key not in edition_by_key:continue
            add('news_entity_links',{'link_id':ident('nl',id,key),'article_id':id,'entity_table':'event_editions','entity_id':edition_by_key[key],'relation':'edition_coverage','source_id':sid(url)})
    for s in b.get('company_signals',[]):
        url=s['source_url'];cid=company({'name':s['company']},url);signal=ident('signal',s['id'])
        add('company_signals',{'signal_id':signal,'company_id':cid,'type':s['signal_type'],'value':s['description_own'],'event_date':s.get('event_date'),'source_id':ensure_source(url),'relevance_hypothesis':'Research cue only; current budget, intent and contact unknown'},s)
        for field,value in [('type',s['signal_type']),('value',s['description_own']),('event_date',s.get('event_date'))]:claim('company_signals',signal,field,value,url,s.get('locator','News'),s.get('event_date'),klass='attributed_company_signal')
    for c in b.get('conflicts',[])+b.get('contradictions',[]):
        refs=c.get('source_urls',[])+([c['source_url']] if c.get('source_url') else [])+[x['source_url'] for x in c.get('claims',[]) if x.get('source_url')]
        add('data_conflicts',{'conflict_id':ident('conflict',j(c)),'entity_table':'event_editions','entity_id':edition_by_key.get(c.get('edition_key')),'field':c.get('field',c.get('kind')),'values_json':j(c.get('values',c.get('claims',[]))),'source_ids_json':j([ensure_source(u) for u in refs]),'status':c.get('status','documented_scope_guard' if c.get('kind') in ('scope_guard','different_denominators_not_contradiction') else 'reviewed_with_limit' if c.get('resolution') else 'pending'),'resolution':c.get('resolution')},c)
    for r in b.get('relations',[]):
        add('event_relations',{'relation_id':ident('rel',j(r)),'from_edition_id':edition_by_key.get(r['from_key']),'to_edition_id':edition_by_key.get(r['to_key']),'type':r['type'],'evidence_class':'explicit_source_statement','source_id':ensure_source(r['source_url'])})
    for u in b.get('edition_updates',[]):
        eid=edition_by_key.get(u['key'])
        if not eid:continue
        for conflict in u.get('conflicts',[]):
            refs=conflict.get('source_urls',u.get('source_urls',[]))
            add('data_conflicts',{'conflict_id':ident('conflict',u['key'],j(conflict)),'entity_table':'event_editions','entity_id':eid,'field':conflict.get('field'),'values_json':j(conflict.get('values',[])),'source_ids_json':j([ensure_source(x) for x in refs]),'status':conflict.get('status','preserved_official_source_disagreement'),'resolution':conflict.get('resolution')},conflict)

# Historical sponsor recurrence, never inferred commercial renewal or negative churn.
editions={e['edition_id']:e for e in TABLES['event_editions']};groups=collections.defaultdict(list)
for role in TABLES['event_company_roles']:
    e=editions[role['edition_id']]
    if role['role']=='sponsor' and e['series_id']:groups[(role['company_id'],e['series_id'])].append(role)
for (cid,series),rs in groups.items():
    rs=sorted(rs,key=lambda r:editions[r['edition_id']]['start_date'] or '')
    for a,b in zip(rs,rs[1:]):
        if a['edition_id']==b['edition_id']:continue
        add('sponsorship_renewals',{'renewal_id':ident('recur',a['role_id'],b['role_id']),'company_id':cid,'series_id':series,'from_edition_id':a['edition_id'],'to_edition_id':b['edition_id'],'relationship':'repeat_listing; renewal_contract_unknown','coverage':'named editions only; absence never negative','method':'exact_normalized_display_name_and_series','version':VERSION,'cutoff':CUTOFF,'input_ids_json':j([a['role_id'],b['role_id']])})

# Evidence snapshots are hashes of retained factual extracts, not hashes of original pages.
for s in TABLES['sources']:
    claims=[a for a in TABLES['assertions'] if a['source_id']==s['source_id']]
    if not claims:continue
    material={'source':s,'assertions':claims,'retention':'factual_extract_and_own_summary_no_original_page'}
    path=ROOT/'evidence'/(s['source_id']+'.json');raw=(j(material)+'\n').encode();path.write_bytes(raw)
    add('source_snapshots',{'snapshot_id':ident('snapshot',s['source_id'],VERSION),'source_id':s['source_id'],'original_url':s['url'],'observed_at':CUTOFF,'content_type':'application/json','retained_path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(raw).hexdigest(),'retained_material':'factual_extract_and_own_summary','permission':'research factual metadata only; commercial rights pending; no archived capture'})

def export():
    dictionary=[];contract={}
    for line in (ROOT/'inputs/prompt-maestro.md').read_text().splitlines():
        match=re.match(r'\| `([a-z_]+)\.csv` \| (.*?) \| (.*?) \|',line)
        if match:contract[match[1]]=(match[2],match[3])
    assert len(SCHEMAS)==66 and set(SCHEMAS)==set(contract),(len(SCHEMAS),set(contract)-set(SCHEMAS))
    dbpath=ROOT/'event-gtm.sqlite'
    if dbpath.exists():dbpath.unlink()
    db=sqlite3.connect(dbpath);db.execute('PRAGMA foreign_keys=ON')
    ids={t:SCHEMAS[t].split()[0] for t in SCHEMAS}
    references={'source_id':'sources','edition_id':'event_editions','series_id':'event_series','company_id':'companies','venue_id':'venues','person_id':'people','session_id':'sessions','ticket_id':'ticket_types','package_id':'sponsorship_packages','article_id':'news_articles','crawl_id':'crawl_runs','term_id':'taxonomy_terms','case_id':'evaluation_cases','run_id':'recommendation_runs','concept_id':'event_concepts','draft_id':'luma_drafts','brief_id':'customer_briefs','channel_id':'distribution_channels'}
    for t,cols in SCHEMAS.items():
        fields=cols.split()+['extra_json','missing_reasons_json'];layer='private-schemas' if t in PRIVATE else 'derived' if t in DERIVED else 'observed';folder=ROOT/layer
        with (folder/(t+'.csv')).open('w',newline='') as out:
            w=csv.DictWriter(out,fieldnames=fields);w.writeheader();w.writerows(TABLES[t])
        defs=[]
        for ix,k in enumerate(fields):
            typ='REAL' if k in ('amount','value','score','latitude','longitude','duration_ms','elapsed_ms','monthly_total_usd','cost_per_useful_usd','useful_fraction') else 'TEXT'
            # Heterogeneous observations keep declared values as strings; no unit conversion.
            if k=='value':typ='TEXT'
            d='"'+k+'" '+typ
            if ix==0:d+=' PRIMARY KEY'
            elif k in references and references[k]!=t:d+=' REFERENCES "'+references[k]+'"("'+ids[references[k]]+'") DEFERRABLE INITIALLY DEFERRED'
            defs.append(d)
            dictionary.append({'table':t,'field':k,'type':'JSON' if k.endswith('_json') else typ,'unit':'record_specific; see unit/currency fields' if k in ('value','amount') else '', 'required':ix==0,'allowed_values':'see README enums; null has missing_reasons_json','priority':'core' if t in ('sources','assertions','event_editions','companies','event_company_roles') else 'enrichment','expected_origin':layer,'definition':contract[t][0]+' — '+k,'table_minimum_contract':contract[t][1]})
        db.execute('CREATE TABLE "'+t+'" ('+','.join(defs)+')')
    db.execute('BEGIN')
    for t,rows in TABLES.items():
        fields=SCHEMAS[t].split()+['extra_json','missing_reasons_json']
        for row in rows:
            vals=[j(row.get(k)) if isinstance(row.get(k),(dict,list)) else row.get(k) for k in fields]
            db.execute('INSERT INTO "'+t+'" VALUES ('+','.join('?' for _ in fields)+')',vals)
    problems=db.execute('PRAGMA foreign_key_check').fetchall();assert not problems,problems
    db.commit();integrity=db.execute('PRAGMA integrity_check').fetchone()[0];assert integrity=='ok'
    counts={t:db.execute('SELECT count(*) FROM "'+t+'"').fetchone()[0] for t in SCHEMAS};db.close()
    with (ROOT/'data_dictionary.csv').open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(dictionary[0]));w.writeheader();w.writerows(dictionary)
    coverage=[]
    for dim in ('year','country','format','sector','status'):
        counter=collections.Counter((e['start_date'][:4] if e['start_date'] else 'unknown') if dim=='year' else e.get(dim) or 'unknown' for e in TABLES['event_editions'])
        coverage.extend({'dimension':dim,'value':k,'editions':v,'universe_denominator':None,'coverage_percent':None} for k,v in sorted(counter.items()))
    with (ROOT/'coverage.csv').open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=['dimension','value','editions','universe_denominator','coverage_percent']);w.writeheader();w.writerows(coverage)
    critical={field:{'present':sum(e.get(field) is not None for e in TABLES['event_editions']),'total':len(TABLES['event_editions'])} for field in ('start_date','end_date','date_precision','timezone','city','country','venue_id','url')}
    stats={'counts':counts,'critical_completeness':critical,'foreign_key_errors':problems,'sqlite_integrity':integrity,'unique_editions':len(editions),'future_announced':sum(bool(e['start_date'] and e['start_date']>CUTOFF and e['status'] in ('announced','future_confirmed')) for e in editions.values()),'sponsor_roles':sum(r['role']=='sponsor' for r in TABLES['event_company_roles']),'source_fact_counts':dict(source_use),'batch_counts':{f.name:len(b.get('editions',[])) for f,b in BATCHES},'empty_tables':[t for t,c in counts.items() if c==0]}
    (ROOT/'checkpoints'/'dataset-stats.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'checkpoints'/'edition-ids.json').write_text(json.dumps(edition_by_key,ensure_ascii=False,indent=2)+'\n')
    print(j(stats))

if __name__=='__main__':export()

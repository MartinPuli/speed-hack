"""Rebuild delivered CSV/SQLite from retained factual observations. No network calls."""
from pathlib import Path
import json,csv,re,hashlib,sqlite3,datetime,collections,urllib.parse,sys
from schema import SCHEMA,cols,layer,DERIVED,PRIVATE,PROPOSED
ROOT=Path(__file__).resolve().parents[1]; NOTES=ROOT/'notes'
OBS='2026-09-28'; WINDOW='2021-09-28'; VERSION='2026-09-28.v1'
T={k:[] for k in SCHEMA}; IDS={k:set() for k in SCHEMA}
def uid(prefix,*values): return prefix+'_'+hashlib.sha256('|'.join(str(v) for v in values).encode()).hexdigest()[:16]
def add(table,row,source_id=None,locator='',evidence_class='published_statement'):
    row={k:v for k,v in row.items() if v is not None}; row.setdefault('id',uid(table,*row.values()))
    if source_id: row['source_id']=source_id
    if row['id'] not in IDS[table]: T[table].append(row);IDS[table].add(row['id'])
    if source_id and table not in ['assertions','sources','news_dedup_clusters']:
        for k,v in row.items():
            if k=='id' or k.endswith('_id') or k.endswith('_ids_json') or k in ['missing_reasons_json','last_verified','observed_at']:continue
            a={'id':uid('as',table,row['id'],k,v,source_id),'entity_table':table,'entity_id':row['id'],'field':k,'value_json':v,'source_id':source_id,'locator':locator,'evidence_paraphrase':'Valor factual normalizado; consultar localizador.','valid_from':row.get('start_date') or row.get('valid_from'),'valid_to':row.get('end_date') or row.get('valid_to'),'observed_at':OBS,'evidence_class':evidence_class,'confidence_basis':'Fuente identificada; no verificación independiente de resultados.','conflict_status':'none_detected'}
            if k in ['temporal_bucket','country','modality','geo_precision','format','sector','topics_json','end_date'] and table=='event_editions':
                a['evidence_class']='deterministic_derivation';a['confidence_basis']='Regla documentada build_dataset.py; revisar clasificación, no verdad del organizador.'
            if a['id'] not in IDS['assertions']:T['assertions'].append(a);IDS['assertions'].add(a['id'])
    return row['id']
def source(url,title=None,publisher=None,kind='organizer_page',published=None,method='public_http',status='facts_extracted',language=None):
    sid=uid('src',url)
    add('sources',dict(id=sid,url=url,canonical_url=url,publisher=publisher or urllib.parse.urlparse(url).netloc,title=title or url,source_type=kind,language=language,published_at=published,observed_at=OBS,access_method=method,reuse_status='public_facts_only; commercial_reuse_not_cleared',extraction_status=status))
    return sid
def company(name,url,sid,locator):
    domain=urllib.parse.urlparse(url or '').netloc.lower().removeprefix('www.')
    # Only reviewed equivalences. No merger of subsidiaries or products by fuzzy names.
    aliases={'edgedb':'Gel','gel':'Gel','auth0 by okta':'Auth0','western governors university (wgu)':'Western Governors University','qube research & technologies limited':'Qube Research & Technologies','the open source initiative':'Open Source Initiative','haystack (by deepset)':'deepset','us digital service':'U.S. Digital Service','devitjobs':'DevITjobs'}
    canonical=aliases.get(name.lower(),name); cid=uid('co',canonical.casefold())
    add('companies',dict(id=cid,name=canonical,domain=domain or None,company_url=url,missing_reasons_json={'description':'not_enriched','current_budget':'not_public','current_interest':'unknown'}),sid,locator)
    if canonical!=name:
        add('entity_aliases',dict(id=uid('alias',cid,name),entity_table='companies',entity_id=cid,alias=name,external_system='organizer_publication',equivalence_reason='Reviewed brand/name normalization; Gel rename supported by corporate announcement.',review_status='reviewed'),sid,locator)
    return cid
def series(name,sid,url=None,method='explicit_named_series'):
    return add('event_series',dict(id=uid('ser',name.casefold()),name=name,url=url,identity_method=method,periodicity='not_extrapolated'),sid,'Nombre de serie')
def iso_date(value):return value[:4]+'-'+value[4:6]+'-'+value[6:8]
COUNTRIES='Angola|Armenia|Costa Rica|Cuba|Ecuador|Equatorial Guinea|Gambia|Hong Kong|Malawi|Panama|Somalia|Argentina|Australia|Austria|Bangladesh|Belgium|Benin|Bolivia|Brazil|Bulgaria|Cameroon|Canada|Chile|China|Colombia|Czech Republic|Denmark|Egypt|Estonia|Ethiopia|Finland|France|Germany|Ghana|Greece|India|Indonesia|Iran|Ireland|Israel|Italy|Japan|Kenya|Latvia|Lithuania|Luxembourg|Malaysia|Mexico|Morocco|Mozambique|Namibia|Nepal|Netherlands|New Zealand|Niger|Nigeria|Norway|Pakistan|Paraguay|Peru|Philippines|Poland|Portugal|Romania|Russia|Rwanda|Saudi Arabia|Senegal|Serbia|Singapore|Slovakia|Slovenia|South Africa|South Korea|Spain|Sri Lanka|Sweden|Switzerland|Taiwan|Tanzania|Thailand|Togo|Tunisia|Turkey|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Venezuela|Vietnam|Zimbabwe'.split('|')
def country(location):
    l=location.lower()
    for term,result in [('usa','United States'),('u.s.','United States'),('uk','United Kingdom'),('england','United Kingdom'),('scotland','United Kingdom'),('españa','Spain'),('uae','United Arab Emirates'),('korea','South Korea'),('the netherlands','Netherlands'),('panamá','Panama'),('kenia','Kenya'),('tansania','Tanzania'),('czechia','Czech Republic'),('méxico','Mexico'),('brasil','Brazil'),('reino unido','United Kingdom'),('francia','France')]:
        if re.search(r'\b'+re.escape(term)+r'\b',l):return result
    for c in sorted(COUNTRIES,key=len,reverse=True):
        if re.search(r'\b'+re.escape(c.lower())+r'\b',l):return c
    return None
def modality(location):
    l=location.lower();online=any(t in l for t in ['online','on line','virtual','zoom'])
    return 'hybrid_inferred' if online and country(location) and not l.startswith('online') else ('online' if online else ('in_person_inferred' if l else 'unknown'))
def form(title,kind=''):
    l=title.lower()
    if 'hack' in l:return 'hackathon'
    if 'workshop' in l or 'taller' in l:return 'workshop'
    if 'sprint' in l:return 'sprint'
    if any(t in l for t in ['pycon','conference','djangocon','euroscipy','pydata','pybay']):return 'conference'
    if kind=='python-user-group':return 'community_meeting'
    return 'other_technical'
def event(title,start,end,location,url,sid,ser=None,fmt=None,sector='technology',status='announced',locator='',start_at=None,end_at=None,tz=None,precision='day',stable_key=None):
    eid=uid('evt',stable_key or (url+'|'+title.casefold()))
    # Collapse only same calendar UID or reviewed exact title/date/location (handled by caller).
    add('event_editions',dict(id=eid,series_id=ser,title=title,canonical_url=url,start_date=start,end_date=end,start_at=start_at,end_at=end_at,timezone=tz,date_precision=precision,end_semantics='inclusive_date; original_ICS_DTEND_is_exclusive' if stable_key and stable_key.startswith('ical|') else 'published_date_range; inclusive_when_explicit',status=status,temporal_bucket='historical' if start<OBS else 'upcoming_or_current',location_raw=location,country=country(location),modality=modality(location),geo_precision='location_text_ungeocoded' if location else 'unknown',format=fmt or form(title),sector=sector,last_verified=OBS,missing_reasons_json={'price':'not_enriched','audience_actual':'not_enriched','sponsor_budget':'not_public','coordinates':'not_geocoded','timezone':'not_published' if not tz else None}),sid,locator)
    return eid
def listing(eid,platform,url,sid,native=None,method='linked_from_source'):
    return add('platform_listings',dict(id=uid('listing',eid,url),event_id=eid,platform=platform,native_id=native,url=url,first_observed=OBS,last_observed=OBS,listing_status='linked_not_fetched' if method=='linked_from_source' else ('index_only' if method=='search_index_only' else 'read_public'),evidence_method=method),sid,'Enlace publicado')
def find_event(name,year=None):
    exact=[e for e in T['event_editions'] if name.lower()==e['title'].lower() and (not year or e['start_date'].startswith(str(year)))]
    a=exact or [e for e in T['event_editions'] if name.lower() in e['title'].lower() and (not year or e['start_date'].startswith(str(year)))]
    if len(a)!=1: raise ValueError(('event_lookup',name,year,[(e['title'],e['start_date']) for e in a]))
    return a[0]['id']
def role(eid,cid,role_name,sid,level=None,locator=''):
    return add('event_company_roles',dict(id=uid('role',eid,cid,role_name),event_id=eid,company_id=cid,role=role_name,level=level,relationship_status='published_in_cited_source; payment_unverified'),sid,locator)

def load_calendars():
    raw=[]
    for f in ['python-events-facts.json','python-user-group-facts.json']:raw+=json.loads((NOTES/f).read_text())
    for x in raw:
        title=x['SUMMARY'];start=iso_date(x['DTSTART']);end=iso_date(x.get('DTEND',x['DTSTART']))
        allday=x.get('DTSTART_params')=='VALUE=DATE'
        if allday and 'DTEND' in x:end=(datetime.date.fromisoformat(end)-datetime.timedelta(days=1)).isoformat()
        url=x['source_url'];sid=source(url,'Python.org published iCal '+x['calendar_kind'],'Python Software Foundation','public_calendar_feed',method='published_ical_export')
        loc='VEVENT UID='+x['UID'];place=x.get('LOCATION','');clean=re.sub(r'\b20[12]\d\b','',title).strip(' -:')
        # Similar names alone do not establish a recurring series. Only repeated exact base + country.
        candidates=[z for z in raw if re.sub(r'\b20[12]\d\b','',z['SUMMARY']).strip(' -:').casefold()==clean.casefold() and country(z.get('LOCATION',''))==country(place)]
        ser=series(clean+' ['+(country(place) or 'unspecified')+']',sid,method='inferred_exact_base_title_and_country; not_verified_periodicity') if len(candidates)>1 else None
        urls=[u.rstrip('.') for u in x.get('description_urls',[])];public_url=urls[0] if urls else x['seed_url']
        st=None;en=None;tz=None
        if 'T' in x['DTSTART']:
            st=start+'T'+x['DTSTART'][9:11]+':'+x['DTSTART'][11:13]+':'+x['DTSTART'][13:15]+('Z' if x['DTSTART'].endswith('Z') else '')
            tz='UTC' if st.endswith('Z') else x.get('DTSTART_params','').removeprefix('TZID=') or None
            rawend=x.get('DTEND','')
            if 'T' in rawend:en=iso_date(rawend)+'T'+rawend[9:11]+':'+rawend[11:13]+':'+rawend[13:15]+('Z' if rawend.endswith('Z') else '')
        eid=event(title,start,end,place,public_url,sid,ser,form(title,x['calendar_kind']),locator=loc,start_at=st,end_at=en,tz=tz,precision='day' if allday else 'second',stable_key='ical|'+x['UID'])
        add('record_versions',dict(id=uid('ver',eid,1),entity_table='event_editions',entity_id=eid,version=1,new_value_json={'feed_created':x.get('CREATED'),'feed_last_modified':x.get('LAST-MODIFIED'),'dtstart_raw':x['DTSTART'],'dtend_raw':x.get('DTEND'),'uid':x['UID']},observed_at=OBS,change_reason='first_observation; feed_metadata_is_not_archival_capture'),sid,loc)
        for u in urls:
            host=urllib.parse.urlparse(u).netloc.lower()
            plat=next((p for p in ['meetup','eventbrite','luma','lu.ma','partiful','pretix','humanitix','sessionize','tickettailor','dice','evand'] if p in host),'organizer_website')
            listing(eid,'Luma' if plat in ['luma','lu.ma'] else plat,u,sid)

def load_sponsors():
    for x in json.loads((NOTES/'sponsors-facts.json').read_text()):
        sid=source(x['source_url'],f'PyCon US {x["year"]} sponsors','PyCon US')
        cid=company(x['name'],x.get('company_url'),sid,x['locator']);eid=find_event('PyCon US '+str(x['year']))
        level=x['level'];r=x['role']
        if 'Community' in level:r='community'
        if level=='Media':r='media_partner'
        if level=='AV Partner':r='production_partner'
        role(eid,cid,r,sid,level,x['locator'])

def manual_enrichment():
    # Historical prices: snapshot today of year-specific source, not contemporaneous quotes.
    for y,prices in [(2024,{'Corporate':750,'Individual':400,'Student':100,'Online':100,'Tutorial':150}),(2025,{'Corporate':800,'Individual':450,'Student':125,'Job Fair Only':30,'Tutorial':150})]:
        url=f'https://us.pycon.org/{y}/attend/information/'+('index.html' if y==2024 else '')
        sid=source(url,f'PyCon US {y} registration information','PyCon US');eid=find_event('PyCon US '+str(y))
        psf=company('Python Software Foundation','https://www.python.org/psf/',sid,'Registration payments section');role(eid,psf,'organizer',sid)
        for name,price in prices.items():
            tid=add('ticket_types',dict(id=uid('ticket',eid,name),event_id=eid,name=name,eligibility=name+' rate; conditions in source',payment_mode='paid',currency='USD'),sid,'Registration prices / tutorial note')
            add('ticket_price_history',dict(ticket_id=tid,amount=price,currency='USD',fees='unknown',taxes='unknown',sale_phase='year_specific_published_rate',observed_at=OBS,valid_from=str(y),availability='historical_not_for_sale'),sid,'Registration prices / tutorial note')
        for name,amount in [('Drury Plaza Hotel',189),('The Westin Pittsburgh',209 if y==2024 else 215)]:
            add('event_costs',dict(event_id=eid,category='hotel_'+name,amount_min=amount,currency='USD',unit='night',taxes='excluded',valid_from=str(y),cost_status='historical_conference_rate; availability_unknown'),sid,'Hotel')
    # Recaps are attributed organizer metrics; 2024 search-index retrieval clearly marked.
    for y,vals in [(2024,[('attendance_total',2991,'people'),('attendance_in_person',2551,'people'),('attendance_online',440,'people'),('countries_represented',95,'countries'),('tickets_sold_lower_bound',2700,'tickets')]),(2025,[('attendance_at_venue',2225,'people'),('countries_represented',58,'countries')])]:
        url=f'https://pycon.blogspot.com/{y}/08/pycon-us-{y}-recap-and-'+('recording.html' if y==2024 else 'recordings.html')
        sid=source(url,f'PyCon US {y} recap','PyCon US','organizer_recap',f'{y}-08-'+('08' if y==2024 else '22'),method='primary_search_index_extract' if y==2024 else 'web_read')
        eid=find_event('PyCon US '+str(y))
        aid=add('news_articles',dict(source_id=sid,title=f'PyCon US {y} recap',publisher='PyCon US',url=url,published_at=f'{y}-08-'+('08' if y==2024 else '22'),editorial_type='organizer_recap',summary='Asistencia reportada por el organizador, sin atribución comercial independiente.',access_status='indexed_extract_full_open_429' if y==2024 else 'public_read'))
        add('news_entity_links',dict(article_id=aid,entity_table='event_editions',entity_id=eid,mention_type='post_event_recap'),sid,'Opening recap')
        add('news_dedup_clusters',dict(article_id=aid,cluster_id=uid('cluster',aid),original_article_id=aid,relationship='original',independence_basis='first_party'))
        for metric,value,unit in vals:add('audience_metrics',dict(event_id=eid,segment=metric,metric=metric,value=value,unit=unit,period=str(y),method='organizer_report; denominator_and_counting_method_not_published',metric_status='reported_actual'),sid,'Recap opening paragraphs')
    # A real domain/brand change changes entity matching but proves no sponsor demand.
    for url,title,pub,date,company_name,co_url,typ,fact,hyp in [
      ('https://www.geldata.com/blog/edgedb-is-now-gel-and-postgres-is-the-future','EdgeDB is now Gel and Postgres is the Future','Gel','2025-02-25','Gel','https://www.geldata.com/','rename','EdgeDB cambió su nombre a Gel; la compañía declara continuidad de equipo y misión.','Consolidar historial EdgeDB/Gel; no inferir presupuesto.'),
      ('https://www.geldata.com/blog/gel-joins-vercel','Gel joins Vercel','Gel','2025-12-02','Gel','https://www.geldata.com/','company_shutdown_team_transition','Gel Data Inc. anuncia su cierre y la incorporación del equipo a Vercel; cese de Gel Cloud anunciado para 31-01-2026.','Excluir como sponsor operativo independiente hasta confirmación; no transferir automáticamente historial a Vercel.')]:
        sid=source(url,title,pub,'company_announcement',date,method='web_read');cid=company(company_name,co_url,sid,'Title and announcement')
        aid=add('news_articles',dict(source_id=sid,title=title,publisher=pub,url=url,published_at=date,editorial_type='company_announcement',summary=fact,access_status='public_read'))
        add('news_entity_links',dict(article_id=aid,entity_table='companies',entity_id=cid,mention_type=typ),sid,'Announcement')
        add('news_dedup_clusters',dict(article_id=aid,cluster_id=uid('cluster',aid),original_article_id=aid,relationship='original',independence_basis='first_party'))
        add('company_signals',dict(company_id=cid,signal_type=typ,fact_date=date,fact=fact,hypothesis=hyp),sid,'Announcement')
    # AI Engine: one edition across a newsletter and Luma; roles explicitly ambiguous in source.
    lu='https://luma.com/edovbkm4';sid=source(lu,'AI Engine: Summer Hack','AI Engine','platform_event',method='web_read')
    eid=event('AI Engine: Summer Hack','2025-08-02','2025-08-03','London, United Kingdom',lu,sid,fmt='hackathon',locator='When / Where; address withheld')
    listing(eid,'Luma',lu,sid,'edovbkm4','public_page_read')
    for name in ['Stripe','ACI.dev','Anthropic','ElevenLabs','Prolific','Crusoe','Incident.io','Requesty','Cogna','Memories.ai','Daytona','Inforcer','Runware','Encore','Firebolt','Quantexa','Manus','Atla','Oneleet']:
        cid=company(name,None,sid,'Sponsors and Partners');role(eid,cid,'sponsor_or_partner',sid,locator='Sponsors and Partners; role not disaggregated')
    for name in ['Dawn Capital','Crane Venture Partners','Chapter One']:
        cid=company(name,None,sid,'Joining forces to host');role(eid,cid,'cohost',sid)
    nurl='https://aienginehack.beehiiv.com/p/join-us-at-ai-engine-summer-hack';nsid=source(nurl,'Join us at AI Engine: Summer Hack!','AI Engine','organizer_newsletter','2025-07-14',method='web_read')
    listing(eid,'organizer_newsletter',nurl,nsid,method='public_page_read')
    add('audience_metrics',dict(event_id=eid,segment='AI builders',metric='planned_hackers',value=150,unit='people',period='2025-08-02/2025-08-03',method='organizer_announcement',metric_status='planned_not_attended'),nsid,'What to expect')
    for name,u in [('Granola','https://www.granola.ai/'),('Encord','https://encord.com/')]:role(eid,company(name,u,nsid,'Sponsors and partners list'),'sponsor_or_partner',nsid)
    aid=add('news_articles',dict(source_id=nsid,title='Join us at AI Engine: Summer Hack!',publisher='AI Engine',url=nurl,published_at='2025-07-14',editorial_type='pre_event_announcement',summary='Hackathon de dos días con dos tracks y apoyo técnico anunciado.',access_status='public_read'))
    add('news_entity_links',dict(article_id=aid,entity_table='event_editions',entity_id=eid,mention_type='pre_event_announcement'),nsid,'Title and What to expect')
    add('news_dedup_clusters',dict(article_id=aid,cluster_id=uid('cluster',aid),original_article_id=aid,relationship='original',independence_basis='organizer newsletter; not independent of Luma listing'))
    # Cultural cross-platform event: organizer source, no Partiful crawler or private guest data.
    gu='https://www.galleryb612.com/post/gallery-b612-metamorphosis-secret-garden';gs=source(gu,'Director’s Note: On Resonance, Transformation, and the Space Between','Gallery B612','organizer_announcement',method='web_read')
    gco=company('Gallery B612','https://www.galleryb612.com/',gs,'Join us')
    for title,date,place in [('Karen Chang: Artist Talk & Reception','2026-04-04','Gallery B612 Pioneer Square, Seattle, WA, USA'),('Jiamin Zhu: Opening Reception','2026-04-11','Gallery B612 SoDo, Seattle, WA, USA'),('O-Jak Watch Party','2026-04-19','Central Cinema, 1411 21st Ave, Seattle, WA 98122, USA')]:
        ev=event(title,date,date,place,gu,gs,fmt='cultural_gathering',sector='arts',locator='Join us / Watch Party')
        role(ev,gco,'organizer',gs)
        if title=='O-Jak Watch Party':listing(ev,'Partiful','https://partiful.com/e/PzdyRvxfLdFEh3HKYYcJ',gs,method='linked_from_source')
    # Prospectuses visually verified; price does not establish an executed sponsorship.
    esurl='https://2023.es.pycon.org/theme/assets/files/pycones2023_patrocinios.pdf';es=source(esurl,'PyConES 2023 Patrocinios','Python España','sponsorship_prospectus',method='pdf_text_and_visual',language='es');esid=find_event('PyCon ES Canarias',2023)
    ps=company('Python España','https://es.python.org/',es,'PDF page 3');role(esid,ps,'organizer',es)
    for name,amount,stand,talk in [('Teide',6000,True,True),('Tamadaba',4500,True,True),('Teneguia',3000,True,False),('Timanfaya',1000,False,False)]:
        pid=add('sponsorship_packages',dict(event_id=esid,name=name,amount_min=amount,amount_max=amount,currency='EUR',benefits_json={'website_logo':True,'stand':stand,'sponsored_talk':talk},availability='historical_offer; not_current_inventory',valid_from='2023'),es,'PDF page 10 (printed 09), visually checked')
        for b,v in [('website_logo',True),('stand',stand),('sponsored_talk',talk)]:add('sponsorship_deliverables',dict(package_id=pid,benefit_type=b,description='included' if v else 'explicitly_not_included'),es,'PDF page 10, column '+name)
    websid=source('https://2023.es.pycon.org/patrocinios/','PyConES 2023 sponsorship','PyConES',method='public_http',language='es')
    add('data_conflicts',dict(entity_table='sponsorship_packages',entity_id=next(p['id'] for p in T['sponsorship_packages'] if p['event_id']==esid and p['name']=='Teide'),field='amount_min',assertion_ids_json=[],resolution='PDF says 6000; website says +6000 and sold out. Preserve PDF offer, do not treat as current quote.',status='unresolved_version_or_range'),websid,'PRECIO Teide')
    for name,price,inventory in [('Patrocinio de Salas',3000,4),('Coffee Breaks',1000,1),('Patrocinio de Becas',500,4),('Streaming',900,4),('Ludoteca',800,1),('Entrevistas',1000,2)]:
        add('sponsorship_packages',dict(event_id=esid,name='Add-on '+name,amount_min=price,amount_max=price,currency='EUR',inventory=inventory,availability='historical_offer; some slots per day; see source',valid_from='2023'),es,'PDF pages 13-14')
    add('audience_metrics',dict(event_id=find_event('PyConEs - Granada'),metric='attendance_lower_bound',segment='all',value=700,unit='people',period='2022',method='next_year_prospectus; +700 vs narrative nearly800',metric_status='reported_actual'),es,'PDF page 7 (printed 06)')
    auurl='https://2025.pycon.org.au/files/Sponsor%20PyCon%20AU%202025%20-%20Prospectus%20v3.pdf';au=source(auurl,'Sponsor PyCon AU 2025 Prospectus v3','PyCon AU','sponsorship_prospectus',method='pdf_text_and_visual',language='en');auid=find_event('PyCon AU',2025)
    for name,amount,space,inventory in [('Digital',3000,None,None),('Startup',3500,'shared',None),('Standard',7000,'2x2m',None),('Gold',10000,'2x2m',5),('Platinum',15000,'3x3m',3),('Diamond',None,'4x4m',1)]:
        pid=add('sponsorship_packages',dict(event_id=auid,name=name,amount_min=amount,amount_max=amount,currency='AUD',benefits_json={'exhibition_space':space,'taxes':'ex_GST','price_status':'quote_required' if amount is None else 'published'},inventory=inventory,availability='historical_offer_not_current_availability',valid_from='2025'),au,'PDF page 12 visually checked')
        if space:add('sponsorship_deliverables',dict(package_id=pid,benefit_type='exhibition_space',description=space),au,'PDF page 12')
    au24=find_event('PyConAU',2024)
    for metric,value,unit in [('registrations_lower_bound',560,'registrations'),('presentations',103,'presentations'),('mean_python_experience_lower_bound',9,'years')]:
        add('audience_metrics',dict(event_id=au24,segment='PyCon AU 2024 audience',metric=metric,value=value,unit=unit,period='2024',method='2025 prospectus; sample size unspecified for experience',metric_status='reported_actual'),au,'PDF pages 8-9')
    for eid,sid,url in [(esid,es,esurl),(auid,au,auurl)]:add('event_assets',dict(event_id=eid,asset_type='sponsorship_prospectus',url=url,rights='commercial_reuse_not_cleared; original_not_redistributed',locator='pages cited per assertion'),sid,'Document')

def nontech():
    f=NOTES/'nontech-facts.json'
    if not f.exists():return
    data=json.loads(f.read_text());data=data.get('events',data) if isinstance(data,dict) else data
    for x in data:
        sid=source(x['source_url'],x.get('source_title'),x.get('publisher'),published=x.get('publication_date'),method=x.get('source_access','unknown'),language=x.get('language'))
        ser=series(x['series'],sid) if x.get('series') else None
        loc=x.get('location','');loc+=(', '+x['country']) if x.get('country') and x['country'] not in loc else ''
        eid=event(x['title'],x['start_date'],x.get('end_date',x['start_date']),loc,x['source_url'],sid,ser,{'FIL Guadalajara':'book_fair','Flip':'literary_festival','Frieze London':'art_fair','Roland-Garros':'tennis_tournament'}.get(x.get('series'),'cultural_event'),x.get('sector','culture'),x.get('status','announced'),'Article dates and location')
        ev=next(e for e in T['event_editions'] if e['id']==eid)
        ev['modality']={'presencial':'in_person','híbrido':'hybrid','online':'online'}.get(x.get('format'),'unknown')
        ev['missing_reasons_json']['evidence_status']=x.get('validation_status')
        for a in T['assertions']:
            if a['entity_id']==eid and a['field']=='modality':
                a['value_json']=ev['modality'];a['confidence_basis']='Curated modality from series source; '+x.get('source_access','unknown')
        if x.get('organizer'):
            of=next((f for f in x.get('facts',[]) if f['field']=='organizer'),{})
            os=source(of.get('source_url',x['source_url']),method=of.get('source_access',x.get('source_access','unknown')))
            role(eid,company(x['organizer'],x.get('organizer_url'),os,of.get('locator','Organizer')),'organizer',os)
        # Material canonical fields point to their own source when different from the date source.
        for a in T['assertions']:
            if a['entity_id']==eid:
                fieldfact=next((f for f in x.get('facts',[]) if f['field']==a['field']),None)
                if fieldfact:a['source_id']=source(fieldfact['source_url'],method=fieldfact.get('source_access','unknown'));a['locator']=fieldfact.get('locator');a['confidence_basis']=fieldfact.get('evidence_status','source_attributed')
        for f in x.get('facts',[]):
            fs=source(f.get('source_url',x['source_url']),method=f.get('source_access','unknown'))
            add('assertions',dict(entity_table='event_editions',entity_id=eid,field=('modality_source_label' if f['field']=='format' else f['field']),value_json=f['value'],source_id=fs,locator=f.get('locator'),evidence_paraphrase=f.get('paraphrase'),observed_at=OBS,evidence_class='published_statement',confidence_basis=f.get('evidence_status','Attributed first-party source'),conflict_status='none_detected'))
        for sp in x.get('sponsors',[]):
            ss=source(sp['source_url'],method=sp.get('source_access','unknown'));cid=company(sp['name'],sp.get('company_url'),ss,sp.get('locator',''))
            rid=role(eid,cid,'sponsor' if 'patrocinador' in sp.get('role','').lower() else 'partner',ss,sp.get('level') or sp.get('role'),sp.get('locator',''))
            for a in T['assertions']:
                if a['entity_table']=='event_company_roles' and a['entity_id']==rid:
                    a['evidence_class']='primary_index_extract' if sp.get('source_access')=='search_index' else 'published_statement'
                    a['confidence_basis']=sp.get('evidence_status','unknown')+'; field_access='+sp.get('source_access','unknown')
        for met in x.get('metrics',[]):
            ms=source(met['source_url'],method=met.get('source_access','unknown'))
            mid=add('event_metrics',dict(event_id=eid,metric=met['name'],value=met['value'],unit=met['unit'],period=x['start_date'][:4],attribution_method=met.get('method'),metric_status=met.get('status','reported')),ms,met.get('locator',''))
            for a in T['assertions']:
                if a['entity_table']=='event_metrics' and a['entity_id']==mid:
                    a['evidence_class']='primary_index_extract' if met.get('source_access')=='search_index' else 'published_statement'
                    a['confidence_basis']=met.get('evidence_status','unknown')+'; field_access='+met.get('source_access','unknown')
        for link in x.get('platform_links',[]):listing(eid,link['platform'],link['url'],sid)

def current_opportunities():
    # Re-check selected upcoming editions, retaining differences with stale directory pages.
    for name,url,venue_name,address,city,co,co_url in [
      ('PyBay 2026','https://pretix.eu/bapya/pybay-2026/','UCSF Mission Bay Conference Center','1675 Owens St, San Francisco, CA 94158, USA','San Francisco','Bay Area Python Association','https://www.bapya.org/'),
      ('PyCon Africa 2026','https://africa.pycon.org/','Speke Resort Munyonyo','Wavamunno Rd, Kampala, Uganda','Kampala','PyCon Uganda and PyCon Africa','https://africa.pycon.org/'),
      ('PyCon NL 2026','https://www.pycon-nl.org/','Jaarbeurs Utrecht','Jaarbeursplein 6, 3521 AL Utrecht, The Netherlands','Utrecht',None,None)]:
        eid=find_event(name);sid=source(url,name+' official current details',method='web_read')
        ev=next(e for e in T['event_editions'] if e['id']==eid)
        vid=add('venues',dict(id=uid('venue',name),name=venue_name,address=address,city=city,country=country(address),geo_precision='published_address_ungeocoded',geo_method='organizer_published; no_geocoding'),sid,'Venue / Practical information')
        ev['venue_id']=vid;ev['geo_precision']='published_address_ungeocoded'
        add('assertions',dict(entity_table='event_editions',entity_id=eid,field='venue_id',value_json=vid,source_id=sid,locator='Venue / Practical information',observed_at=OBS,evidence_class='published_statement',confidence_basis='Organizer address; no reservation verification',conflict_status='none_detected'))
        if co:role(eid,company(co,co_url,sid,'Organizer'),'organizer',sid)
        listing(eid,'pretix' if 'pretix' in url else 'organizer_website',url,sid,method='public_page_read')
        if 'NL' in name:listing(eid,'eventbrite','https://pyconnl26.eventbrite.nl/',sid)
    for name,url,currency,prices in [
      ('PyBay 2026','https://pretix.eu/bapya/pybay-2026/','USD',{'Corporate / Business Regular':375,'Individual / Personal Regular':200,'Student / Academic Regular':40}),
      ('PyCon Africa 2026','https://africa.pycon.org/2026/tickets/','UGX',{'Individual':292500,'Student Regular':214600,'Bulk minimum 5':200000,'Corporate':604500})]:
        eid=find_event(name);sid=source(url,name+' ticket prices',method='web_read')
        for label,amount in prices.items():
            tid=add('ticket_types',dict(event_id=eid,name=label,eligibility=label,payment_mode='paid',currency=currency),sid,'Ticket types')
            add('ticket_price_history',dict(ticket_id=tid,amount=amount,currency=currency,fees='unknown',taxes='unknown',sale_phase='displayed_today',observed_at=OBS,availability='conflicting_expired_deadline; verify_before_purchase' if name=='PyBay 2026' else 'advertised_available; checkout_not_tested'),sid,'Ticket types')
    ireland=find_event('PyCon Ireland 2026');iu='https://2026.pycon.ie/blog/venue-change/';isrc=source(iu,'Update on PyCon Ireland 2026: Venue Change and Extended CFP Deadline','Python Ireland','organizer_update','2026-07-04',method='web_read')
    add('event_status_history',dict(event_id=ireland,previous_status='scheduled_2026-10-17_Trinity_College',new_status='rescheduled_2026-11-21_venue_TBA',announced_at='2026-08-27',effective_at='2026-11-21',reason='Original venue unable to host; date re-confirmed by organizer'),isrc,'Added 2026-08-27')
    add('record_versions',dict(entity_table='event_editions',entity_id=ireland,version=2,previous_value_json={'start_date':'2026-10-17','venue':'Trinity College Dublin'},new_value_json={'start_date':'2026-11-21','venue':'Dublin city centre; TBA'},observed_at=OBS,valid_from='2026-08-27',change_reason='documented_reschedule; source update date not archived capture'),isrc,'Added 2026-08-27')
    add('data_conflicts',dict(entity_table='event_editions',entity_id=ireland,field='start_date',assertion_ids_json=[],resolution='Python.org HTML listing observed Oct17; live iCal and dated organizer update Nov21. Prefer organizer update.',status='resolved_for_current_view; stale_listing_retained'),isrc,'Organizer update vs https://www.python.org/events/python-events/')
    for event_name,date,kind,url in [('PyBay 2026','2026-09-26','regular_ticket_sales_deadline','https://pybay.org/'),('PyCon Ireland 2026','2026-08-30','call_for_proposals_deadline',iu)]:
        sid=source(url,method='web_read');add('event_deadlines',dict(event_id=find_event(event_name),deadline_type=kind,date=date,date_precision='day',status='published_deadline_past_at_observation; verify'),sid,'Deadline statement')
    es24=find_event('PyCon ES 2024');esrc=source('https://2024.es.pycon.org/','PyConES 2024 Vigo','PyConES',method='web_read',language='es')
    ev=next(e for e in T['event_editions'] if e['id']==es24);old=ev['end_date'];ev['end_date']='2024-10-06';ev['end_semantics']='organizer_explicit_inclusive_date; corrected_feed_conflict'
    aold=[a['id'] for a in T['assertions'] if a['entity_id']==es24 and a['field']=='end_date']
    anew=add('assertions',dict(entity_table='event_editions',entity_id=es24,field='end_date',value_json='2024-10-06',source_id=esrc,locator='Hero: 4, 5 y 6 de octubre',observed_at=OBS,evidence_class='published_statement',confidence_basis='Direct dated organizer edition; supersedes ambiguous calendar end',conflict_status='resolved_preferred'))
    add('data_conflicts',dict(entity_table='event_editions',entity_id=es24,field='end_date',assertion_ids_json=aold+[anew],resolution='ICS DTEND 20241006 implies exclusive end Oct5; organizer explicitly includes Oct6. Current view corrected; raw metadata retained.',status='resolved_organizer_preferred'),esrc,'Hero')
    add('record_versions',dict(entity_table='event_editions',entity_id=es24,version=2,previous_value_json={'end_date':old},new_value_json={'end_date':'2024-10-06'},observed_at=OBS,change_reason='manual_source_audit_correction'),esrc,'Hero')
    for person,affiliation,title,when,until in [('Ismael Faro','IBM Research','Python en Quantum+AI.','2024-10-05T10:00:00','2024-10-05T10:45:00'),('Anna Colom','The Data Tank',"Menos hype, más responsabilidad: quién decide qué en el uso de datos y la IA",'2024-10-05T17:30:00','2024-10-05T18:15:00')]:
        pid=add('people',dict(name=person,missing_reasons_json={'professional_url':'not_collected; public professional speaker only'}),esrc,'Keynoters')
        cid=company(affiliation,None,esrc,'Keynoter bio')
        sess=add('sessions',dict(event_id=es24,title=title,format='keynote',start_at=when,end_at=until,agenda_version='website_observed_2026-09-28',status='announced; timezone_not_published'),esrc,'Keynoters schedule')
        add('session_participants',dict(session_id=sess,person_id=pid,company_id=cid,role='speaker',historical_affiliation=affiliation,status='announced'),esrc,'Keynoters schedule and biography')
        add('professional_affiliations',dict(person_id=pid,company_id=cid,role='published_speaker_affiliation',event_id=es24),esrc,'Keynoter bio')

def derive():
    events={r['id']:r for r in T['event_editions']}
    sponsorroles=[r for r in T['event_company_roles'] if r['role']=='sponsor']
    by=collections.defaultdict(list)
    for r in sponsorroles:
        ev=events[r['event_id']]
        if ev.get('series_id'):by[(r['company_id'],ev['series_id'])].append(r)
    for (cid,ser),rs in by.items():
        rs.sort(key=lambda r:events[r['event_id']]['start_date'])
        for a,b in zip(rs,rs[1:]):
            add('sponsorship_renewals',dict(company_id=cid,series_id=ser,previous_event_id=a['event_id'],next_event_id=b['event_id'],previous_level=a.get('level'),next_level=b.get('level'),classification='repeat_presence_observed; contract_renewal_unknown',coverage_basis='year_specific_pages_observed_now; no_negative_inference',method='same canonical company and series in two observed editions',version='1',input_ids_json=[a['id'],b['id']],cutoff=OBS))

def acquisition_metadata():
    attempts=[json.loads(l) for l in (NOTES/'http-attempts.jsonl').read_text().splitlines()]
    for i,a in enumerate(attempts):
        ok=a['status']==200
        add('fetch_attempts',dict(id=uid('fetch',a['url'],a['observed_at'],i),run_id='acquisition-v1',url=a['url'],observed_at=a['observed_at'],result=str(a['status']),error_class=a.get('error'),duration_ms=a['duration_ms'],attempt_number=sum(v['url']==a['url'] for v in attempts[:i+1]),next_step='parsed_or_inspected' if ok else 'review_access_no_bypass'))
        sid=source(a['url'],method=a['method'],status='read_not_necessarily_extracted' if ok else 'failed')
        add('source_snapshots',dict(id=uid('snap',a['url'],a['observed_at']),source_id=sid,original_url=a['url'],observed_at=a['observed_at'],content_type=a.get('content_type'),sha256=a.get('sha256'),availability='read' if ok else 'unavailable',retained_material='factual_metadata_and_hash_only; body_not_redistributed',retention_basis='research_facts; commercial_rights_review_pending'))
    add('crawl_runs',dict(id='acquisition-v1',method='published_iCal_and_selected_organizer_pages',extractor_version='1',scope='international_exploration_not_census',started_at=attempts[0]['observed_at'],finished_at=attempts[-1]['observed_at'],pages_attempted=len(attempts),pages_completed=sum(a['status']==200 for a in attempts),pages_failed=sum(a['status']!=200 for a in attempts),records_output=652,billing_status='no_paid_provider_called; research_tool_charge_unavailable',closure_reason='bounded_exploratory_execution; rights_and_geography_pending'))

def export():
    for table,rows in T.items():
        p=ROOT/'data'/layer(table);p.mkdir(parents=True,exist_ok=True)
        with (p/(table+'.csv')).open('w',newline='') as f:
            w=csv.DictWriter(f,fieldnames=cols(table));w.writeheader()
            for row in rows:
                extra=set(row)-set(cols(table))
                if extra:raise ValueError((table,extra))
                w.writerow({k:json.dumps(v,ensure_ascii=False,separators=(',',':')) if k.endswith('_json') else v for k,v in row.items()})
    db=ROOT/'dataset.sqlite'
    if db.exists():db.unlink()
    con=sqlite3.connect(db);con.execute('PRAGMA foreign_keys=ON')
    # Logical export is intentionally flat/text for lossless interchange; physical proposal is separate.
    for table in SCHEMA:
        con.execute('CREATE TABLE "'+table+'" ('+','.join('"'+c+'" TEXT'+(' PRIMARY KEY' if c=='id' else '') for c in cols(table))+')')
        with (ROOT/'data'/layer(table)/(table+'.csv')).open() as f:
            rows=list(csv.DictReader(f)); con.executemany('INSERT INTO "'+table+'" VALUES ('+','.join('?' for c in cols(table))+')',[[r[c] if r[c]!='' else None for c in cols(table)] for r in rows])
    con.execute('CREATE INDEX assertions_entity ON assertions(entity_table,entity_id,field)');con.execute('CREATE INDEX editions_date ON event_editions(start_date,country)');con.execute('CREATE INDEX role_lookup ON event_company_roles(company_id,event_id)');con.commit();con.close()
    manifest={'version':VERSION,'execution_date':OBS,'historical_window_start':WINDOW,'historical_window_end_exclusive':OBS,'geography':'not_selected; international_stratified_convenience_sample','segment':'not_selected; technology-heavy plus nontech strata','billing':'No paid acquisition commissioned. Tool subscription and agent execution cost not observable.','tables':{t:{'rows':len(T[t]),'layer':layer(t),'file':'data/'+layer(t)+'/'+t+'.csv','state':'populated' if T[t] else 'schema_only','empty_reason':None if T[t] else ('requires_real_authorized_customer_data' if t in PRIVATE else 'not_obtained_in_this_execution')} for t in SCHEMA},'counts':{'event_editions':len(T['event_editions']),'series':len(T['event_series']),'organizations':len(T['companies']),'sponsor_roles':sum(r['role']=='sponsor' for r in T['event_company_roles']),'sponsor_or_partner_roles':sum(r['role']=='sponsor_or_partner' for r in T['event_company_roles']),'sources':len(T['sources']),'assertions':len(T['assertions']),'original_news_articles':len(T['news_dedup_clusters']),'historical_editions':sum(e['start_date']<OBS for e in T['event_editions']),'upcoming_or_current_editions':sum(e['start_date']>=OBS for e in T['event_editions']),'provisional_or_secondary_cores':8,'observed_repeat_presences':len(T['sponsorship_renewals'])},'limitations':['Not exhaustive, no defined territorial universe','No private guests, CRM, actual commercial ROI or human relevance labels','No commercial redistribution rights presumed','Calendar STATUS:CONFIRMED is announcement status, not proof an event occurred','10 recurring rules withheld; not expanded into invented editions'],'closure_reason':'Exploratory acquisition delivered; exact continuation queue remains.'}
    (ROOT/'run_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    print(json.dumps(manifest['counts'],indent=2))

if __name__=='__main__':
    load_calendars();load_sponsors();manual_enrichment();nontech();current_opportunities();exec((ROOT/'scripts'/'cost_model.py').read_text(),globals());exec((ROOT/'scripts'/'complete_dataset.py').read_text(),globals());derive();acquisition_metadata();__import__('benchmark').run(globals());export()

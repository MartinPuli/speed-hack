#!/usr/bin/env python3
"""Public municipal Linked Events collector. Python stdlib only; no attendee data.

60 monthly strata, up to 250 leaf records each by default. This is a bounded,
chronological sample within each month, NOT a census or random representative sample.
Run again with --per-month N to extend existing checkpoints. Never stores raw bodies.
"""
import argparse, calendar, collections, datetime as dt, gzip, hashlib, json, pathlib
import time, urllib.error, urllib.parse, urllib.request, urllib.robotparser, fcntl, os

ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://api.hel.fi/linkedevents/v1/event/'
UA='GrowthX-EventResearch/1.0 (public open-data; no attendee collection)'
LICENSE_URL='https://avoindata.suomi.fi/data/en_GB/dataset/linked-events-tapahtumarajapinta'

def now(): return dt.datetime.now(dt.timezone.utc).isoformat()
def enc(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def sha(b): return hashlib.sha256(b).hexdigest()
def write_json(p,x):
    t=p.with_suffix('.tmp'); t.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def ref(x): return (x or {}).get('@id') if isinstance(x,dict) else x
def value(x):
    if not isinstance(x,dict): return x
    return next((x.get(k) for k in ['en','fi','sv'] if x.get(k)),next(iter(x.values()),None))
def lang(x):
    return next((k for k in ['en','fi','sv'] if isinstance(x,dict) and x.get(k)),next(iter(x or {}),None))
def pace():
    # Shared across optional disjoint-window workers; globally <=1 start/sec.
    with (ROOT/'manifests/helsinki-rate.lock').open('a+') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX);lock.seek(0)
        last=float(lock.read() or '0');time.sleep(max(0,1-(time.time()-last)))
        lock.seek(0);lock.truncate();lock.write(str(time.time()));lock.flush()
        fcntl.flock(lock,fcntl.LOCK_UN)

def check_robots():
    """Real fresh check on each collection run; preserve every previous observation."""
    url='https://api.hel.fi/robots.txt';attempts=[];permitted=False;decision='stop_unknown'
    for attempt in range(2):
        pace();row={'checked_at':now(),'attempt':attempt+1}
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA})
            with urllib.request.urlopen(req,timeout=6) as response:
                body=response.read();row.update(status=response.status,bytes=len(body),sha256=sha(body))
            parser=urllib.robotparser.RobotFileParser();parser.parse(body.decode('utf-8',errors='replace').splitlines())
            permitted=parser.can_fetch(UA,BASE);decision='robots_allow' if permitted else 'robots_deny'
            attempts.append(row);break
        except urllib.error.HTTPError as e:
            row.update(status=e.code,error=str(e));attempts.append(row)
            permitted=e.code in (404,410);decision='robots_missing' if permitted else 'stop_http_error';break
        except Exception as e:
            row.update(status='unknown',error=type(e).__name__+': '+str(e));attempts.append(row)
            if attempt==1:
                permitted='timed out' in str(e).lower() or isinstance(e,TimeoutError)
                decision='explicit_open_api_authorization_robots_timeout_unknown' if permitted else 'stop_unknown'
    outcome={'url':url,'attempts':attempts,'decision':decision,'collection_permitted':permitted,
      'explicit_permission_source':LICENSE_URL,'scope':'documented open API only; no website crawling or access bypass'}
    write_json(ROOT/f'manifests/helsinki-robots-check-{time.time_ns()}-{os.getpid()}.json',outcome)
    if not permitted:raise RuntimeError('Robots check prevents collection: '+decision)

def fetch(url,log):
    for attempt in range(4):
        pace()
        t=time.monotonic(); record={'url':url,'started_at':now(),'attempt':attempt+1}
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
            with urllib.request.urlopen(req,timeout=40) as r:
                body=r.read();record.update(status=r.status,bytes=len(body),sha256=sha(body),elapsed_s=round(time.monotonic()-t,3),finished_at=now())
            with log.open('a') as f:f.write(enc(record)+'\n')
            time.sleep(max(0,1-(time.monotonic()-t)))
            return json.loads(body),record
        except Exception as e:
            record.update(error=type(e).__name__+': '+str(e),status=getattr(e,'code',None),finished_at=now())
            with log.open('a') as f:f.write(enc(record)+'\n')
            if isinstance(e,urllib.error.HTTPError) and e.code not in (429,500,502,503,504):raise
            if attempt==3:raise
            retry=e.headers.get('Retry-After') if isinstance(e,urllib.error.HTTPError) else None
            time.sleep(max(2**(attempt+1),int(retry) if retry and retry.isdigit() else 0))

def normalize(x,url,fr,index):
    v=x.get('location') or {}; point=(v.get('position') or {}).get('coordinates') or []
    lon,lat=(point[0],point[1]) if len(point)>=2 else (None,None)
    precision='source_published_point_accuracy_unspecified'
    if not (isinstance(lat,(float,int)) and isinstance(lon,(float,int)) and -90<=lat<=90 and -180<=lon<=180 and (lat!=0 or lon!=0)):
        lon=lat=None;precision='missing_or_invalid'
    country=v.get('address_country'); country_method='source_address_country' if country else None
    if not country and any('/country:fi/' in d.get('ocd_id','') for d in v.get('divisions',[])):
        country='FI';country_method='derived_from_source_ocd_division'
    name=x.get('name') or {}
    return {'source_record_id':x['id'],'title':value(name),'titles':name,
        'canonical_url':value(x.get('info_url')) or x.get('@id') or BASE+x['id']+'/',
        'start_at':x.get('start_time'),'end_at':x.get('end_time'),'status':x.get('event_status'),
        'source_platform':'helsinki_linked_events','original_data_source':x.get('data_source'),
        'source_url':x.get('@id') or BASE+x['id']+'/', 'source_fetch_url':url,
        'source_locator':f'$.data[{index}]','source_payload_sha256':fr['sha256'],
        'extracted_at':fr['finished_at'],'source_modified_at':x.get('last_modified_time'),
        'language':lang(name),'languages':list(name),'license':'CC-BY-4.0','license_url':LICENSE_URL,
        'evidence_type':'primary_municipal_aggregator','confidence_basis':'published_metadata_not_verified_attendance',
        'venue':{'id':v.get('id'),'source_url':v.get('@id'),'name':value(v.get('name')),
                 'address':value(v.get('street_address')),'city':value(v.get('address_locality')),
                 'country':country,'country_method':country_method,'latitude':lat,'longitude':lon,
                 'coordinate_precision':precision,'coordinate_method':'source_provided_no_new_geocoding'},
        'keywords':[{'id':z.get('id') or ref(z),'name':value(z.get('name'))} for z in x.get('keywords',[])],
        'super_event_id':ref(x.get('super_event')),'super_event_type':x.get('super_event_type')}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--per-month',type=int,default=250);ap.add_argument('--max-pages-per-month',type=int,default=100)
    ap.add_argument('--partitions',type=int,default=1);ap.add_argument('--partition',type=int,default=0)
    ap.add_argument('--summarize-only',action='store_true');args=ap.parse_args()
    if args.summarize_only:
        summarize();return
    assert 0<=args.partition<args.partitions
    for d in ['batches','manifests']:(ROOT/d).mkdir(exist_ok=True)
    # The discovery manifest is preserved. New runs always record a fresh real check.
    check_robots()
    seen=set();summaries=[];log=ROOT/'manifests/helsinki-fetches.jsonl'
    for n in range(60):
        if n%args.partitions != args.partition: continue
        y=2021+(8+n)//12;m=(8+n)%12+1;start=dt.date(y,m,28)
        ey=y+(m==12);em=m%12+1;end=dt.date(ey,em,28);tag=start.isoformat()
        out=ROOT/f'batches/helsinki-{tag}.jsonl.gz';checkpoint=ROOT/f'manifests/helsinki-{tag}.json'
        previous=json.loads(checkpoint.read_text()) if checkpoint.exists() else {}
        existing=[]
        if out.exists():
            with gzip.open(out,'rt') as f:existing=[json.loads(line) for line in f]
            seen.update(x['source_record_id'] for x in existing)
        if len(existing)>=args.per_month:
            summaries.append(previous);continue
        params={'start':str(start),'end':str(end),'page_size':100,'include':'location,keywords','sort':'start_time'}
        url=previous.get('next_url') or BASE+'?'+urllib.parse.urlencode(params)
        rows=existing;stats=collections.Counter(previous.get('excluded',{}));pages=previous.get('pages',0);raw=previous.get('raw_records',0);state=previous
        try:
            while url and len(rows)<args.per_month and pages<args.max_pages_per_month:
                j,fr=fetch(url,log);items=j.get('data',[]);pages+=1;raw+=len(items)
                for index,x in enumerate(items):
                    if len(rows)>=args.per_month: stats['over_quota_in_last_page']+=1;continue
                    if x.get('deleted'):stats['deleted']+=1;continue
                    if x.get('sub_events') or x.get('super_event_type'):stats['parent_series']+=1;continue
                    date=(x.get('start_time') or '')[:10]
                    if not str(start)<=date<str(end):stats['outside_start_window_or_invalid']+=1;continue
                    if not x.get('name'):stats['missing_title']+=1;continue
                    if x['id'] in seen:stats['duplicate_source_id']+=1;continue
                    row=normalize(x,url,fr,index);rows.append(row);seen.add(x['id'])
                # At quota, retain this page as resume cursor: extending the quota
                # re-reads it and ID-dedupes already kept rows instead of losing its tail.
                url=url if len(rows)>=args.per_month else j.get('meta',{}).get('next')
                tmp=out.with_suffix('.tmp')
                with gzip.open(tmp,'wt',encoding='utf-8') as f:
                    for row in rows:f.write(enc(row)+'\n')
                tmp.replace(out)
                state={'source':'Helsinki Linked Events','source_documentation':LICENSE_URL,'window_start_inclusive':str(start),
                  'window_end_exclusive':str(end),'target_records':args.per_month,'kept_leaf_records':len(rows),'raw_records':raw,
                  'excluded':dict(stats),'pages':pages,'server_matching_count':j.get('meta',{}).get('count'),
                  'next_url':url,'batch_path':str(out.relative_to(ROOT)),'batch_sha256':sha(out.read_bytes()),'updated_at':now(),
                  'complete_census':False,'sampling':f'first qualifying {args.per_month} records per rolling month, chronological; configurable',
                  'status':'quota_reached' if len(rows)>=args.per_month else ('exhausted' if not url else 'in_progress')}
                write_json(checkpoint,state)
            summaries.append(state);print(tag,len(rows),'raw',raw,'pages',pages,flush=True)
        except Exception as e:
            print('ERROR',tag,str(e),flush=True);summaries.append({'window_start_inclusive':tag,'error':str(e),'kept_leaf_records':len(rows)})
    suffix=f'-part{args.partition}' if args.partitions>1 else ''
    write_json(ROOT/f'manifests/helsinki-summary{suffix}.json',{'generated_at':now(),'records':len(seen),'strata':summaries,
      'coverage_warning':'Helsinki municipal/community/culture sample, not global and not B2B-tech representative. Listed occurrences do not prove actual attendance.',
      'requested_per_month':args.per_month,'license':'CC-BY-4.0','license_source':LICENSE_URL})
    print('DONE',len(seen),flush=True)

def summarize():
    rows=[];checks=[];strata=[]
    for p in sorted((ROOT/'batches').glob('helsinki-*.jsonl.gz')):
        with gzip.open(p,'rt',encoding='utf-8') as f: rr=[json.loads(line) for line in f]
        rows.extend(rr)
        manifest=ROOT/'manifests'/p.name.replace('.jsonl.gz','.json')
        m=json.loads(manifest.read_text());strata.append(m)
        checks.append({'batch':p.name,'rows':len(rr),'expected_rows':m['kept_leaf_records'],
                       'hash_matches':sha(p.read_bytes())==m['batch_sha256'],'count_matches':len(rr)==m['kept_leaf_records']})
    def counts(fn): return dict(collections.Counter(str(fn(x)) for x in rows))
    ids=[x['source_record_id'] for x in rows]
    errors=[]
    forbidden={'email','telephone','attendees','guests','registrations','provider_contact_info'}
    for x in rows:
        if not '2021-09-28'<=x['start_at'][:10]<'2026-09-28': errors.append('out_of_range:'+x['source_record_id'])
        if x.get('super_event_type'): errors.append('parent:'+x['source_record_id'])
        if x.get('end_at') and x['end_at'][:10]<x['start_at'][:10]: errors.append('end_before_start:'+x['source_record_id'])
        if forbidden.intersection(x) or forbidden.intersection(x.get('venue',{})): errors.append('forbidden_field:'+x['source_record_id'])
        v=x['venue'];lat,lon=v['latitude'],v['longitude']
        if (lat is None)!=(lon is None) or (lat is not None and (not -90<=lat<=90 or not -180<=lon<=180 or lat==lon==0)):errors.append('coordinates:'+x['source_record_id'])
    if len(set(ids))!=len(ids):errors.append('duplicate_source_ids')
    if not all(x['hash_matches'] and x['count_matches'] for x in checks):errors.append('batch_manifest_mismatch')
    fetches=[json.loads(line) for line in (ROOT/'manifests/helsinki-fetches.jsonl').read_text().splitlines()]
    excludes=collections.Counter()
    for m in strata:excludes.update(m['excluded'])
    grouped=collections.defaultdict(list)
    for row in rows:
        if row['venue']['id']:
            grouped[(row['title'].strip().casefold(),row['start_at'],row['venue']['id'])].append(row)
    candidates=[{'match_rule':'same_casefold_title_exact_start_native_venue','automatic_merge':False,
      'start_precision':'datetime' if 'T' in key[1] else 'date_only',
      'source_record_ids':[r['source_record_id'] for r in group],
      'source_urls':[r['source_url'] for r in group],
      'title':group[0]['title'],'start_at':key[1],'end_times':[r.get('end_at') for r in group],'venue_id':key[2]}
      for key,group in grouped.items() if len(group)>1]
    write_json(ROOT/'manifests/helsinki-dedup-candidates.json',{'generated_at':now(),
       'definition':'Potential republications, not adjudicated duplicates; none merged automatically.',
       'groups':candidates})
    summary={'generated_at':now(),'records':len(rows),'unique_source_ids':len(set(ids)),'strata_count':len(strata),
      'quota_reached_strata':sum(x['status']=='quota_reached' for x in strata),
      'strata_with_at_least_250_records':sum(x['kept_leaf_records']>=250 for x in strata),
      'raw_records_in_strata':sum(x['raw_records'] for x in strata),
      'exclusions':dict(excludes),'http_requests_logged':len(fetches),'http_statuses':dict(collections.Counter(str(x.get('status')) for x in fetches)),
      'response_bytes':sum(x.get('bytes',0) for x in fetches),'source_year':counts(lambda x:x['start_at'][:4]),
      'city':counts(lambda x:x['venue']['city']),'original_data_source':counts(lambda x:x['original_data_source']),
      'status':counts(lambda x:x['status']),'null_coordinates':sum(x['venue']['latitude'] is None for x in rows),
      'unresolved_exact_title_start_venue_groups':len(candidates),
      'unresolved_candidate_extra_rows':sum(len(x['source_record_ids'])-1 for x in candidates),
      'parent_link_present':sum(x['super_event_id'] is not None for x in rows),'source_records_are_not_confirmed_attendance':True,
      'complete_census':False,'strata':strata}
    write_json(ROOT/'manifests/helsinki-summary.json',summary)
    write_json(ROOT/'manifests/helsinki-qa.json',{'generated_at':now(),'pass':not errors,'errors':errors,'records':len(rows),'batches':checks})
    print(enc({k:v for k,v in summary.items() if k!='strata'}));print('QA_PASS',not errors)

if __name__=='__main__':main()

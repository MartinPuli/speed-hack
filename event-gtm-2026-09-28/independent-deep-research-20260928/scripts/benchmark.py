"""Offline functional ranking comparison. Synthetic cases, no human relevance labels."""
import json,math,time,collections,re,statistics

def run(b):
 T=b['T'];add=b['add'];ROOT=b['ROOT'];OBS=b['OBS'];uid=b['uid'];events=T['event_editions']
 def tok(s):return re.findall(r'[\w]+',s.casefold())
 docs={e['id']:tok(' '.join(str(e.get(k,'')) for k in ['title','format','sector','location_raw'])) for e in events}
 df=collections.Counter(w for d in docs.values() for w in set(d));idf={w:math.log((1+len(docs))/(1+n))+1 for w,n in df.items()}
 def vec(words):
  c=collections.Counter(words);v={w:n*idf.get(w,1) for w,n in c.items()};norm=math.sqrt(sum(n*n for n in v.values())) or 1
  return {w:n/norm for w,n in v.items()}
 vectors={k:vec(v) for k,v in docs.items()};history=collections.Counter(e.get('series_id') for e in events if e['start_date']<OBS and e.get('series_id'))
 cases=[('dev-python-global','dev','Synthetic Python developer tool company','developers python pycon workshop conference','Attend to learn and meet developers',None,1000,'USD'),('eval-culture-uk','heldout_functional','Synthetic UK arts organizer','art fair frieze gallery culture','Research event format and partners','United Kingdom',500,'GBP'),('eval-python-us','heldout_functional','Synthetic US Python training provider','python training workshop pycon community','Attend and compare workshops','United States',500,'USD')]
 output=[]
 for cid,split,profile,query,objective,geo,budget,currency in cases:
  candidates=[e for e in events if OBS<=e['start_date']<='2027-03-31' and (not geo or e.get('country')==geo)]
  # Unknown total travel cost cannot pass a hard budget test: conditional candidates only.
  add('evaluation_cases',dict(id=cid,title=profile,case_type='synthetic_functional',company_profile_json={'description':profile,'query':query,'website':None},objective=objective,constraints_json={'country':geo,'start':OBS,'end':'2027-03-31','budget':budget,'currency':currency,'unknown_total_cost_policy':'conditional_not_budget_verified'},cutoff=OBS,candidate_universe='same IDs across methods per case',label_origin='none',split=split,ground_truth_quality='no_human_labels; not_demand_validation'))
  qv=vec(tok(query));qs=set(tok(query));rankings={}
  for method in ['keyword_geo_date','profile_tfidf','profile_history_evidence']:
   started=time.perf_counter();scored=[]
   for e in candidates:
    key=len(qs&set(docs[e['id']]))/max(1,len(qs));cos=sum(qv.get(w,0)*v for w,v in vectors[e['id']].items());h=min(history.get(e.get('series_id'),0),5)/5
    rich=int(any(r.get('event_id')==e['id'] for table in ['ticket_types','sponsorship_packages','audience_metrics'] for r in T[table]));score=key if method=='keyword_geo_date' else (cos if method=='profile_tfidf' else 0.8*cos+0.15*h+0.05*rich)
    scored.append((score,e,{'keyword':key,'profile_tfidf':cos,'observed_previous_editions_capped':h,'enrichment_present':rich,'budget_fit':None}))
   scored.sort(key=lambda v:(-v[0],v[1]['start_date'],v[1]['id']));elapsed=(time.perf_counter()-started)*1000
   runid=add('recommendation_runs',dict(id=cid+'--'+method,case_id=cid,cutoff=OBS,dataset_version=b['VERSION'],method=method,parameters_json={'history_weight':.15,'evidence_weight':.05,'profile_weight':.8,'weights':'fixed_before_comparison; uncalibrated'},model_version='none; Python standard library TF-IDF',elapsed_ms=round(elapsed,4),measured_cost_usd=0,billing_status='no_API_call; excludes_machine_and_human_cost'))
   rankings[method]=[e['id'] for _,e,_ in scored[:5]]
   for rank,(score,e,parts) in enumerate(scored,1):
    parts['total']=score
    ev=[a['id'] for a in T['assertions'] if a['entity_id']==e['id'] and a['field'] in ['title','start_date','country']][:4]
    add('recommendation_candidates',dict(run_id=runid,event_id=e['id'],eligibility='conditional; total_budget_and_registration_unverified',score_components_json=parts,rank=rank,evidence_ids_json=ev,missing_fields_json=['total_cost','verified_availability','target_account_presence'],explanation='Functional ordering only. Historical presence adds evidence, not predicted ROI.'))
   output.append({'case':cid,'method':method,'candidates':len(candidates),'elapsed_ms':round(elapsed,4),'top5':[{'event_id':e['id'],'title':e['title'],'score':round(score,5)} for score,e,_ in scored[:5]]})
   add('scoring_evaluations',dict(evaluation_set=cid,method=method,baseline='keyword_geo_date',metric='date_country_constraint_violations',sample_size=len(candidates),value=0,definition='Deterministic date/country prefilter; does not evaluate budget fit',uncertainty='none for predicate; source dates may be stale',limitations='synthetic case; no human relevance labels',measurement_status='measured_functional'))
  for method in ['profile_tfidf','profile_history_evidence']:
   denom=max(1,len(set(rankings[method])|set(rankings['keyword_geo_date'])));jac=len(set(rankings[method])&set(rankings['keyword_geo_date']))/denom
   add('scoring_evaluations',dict(evaluation_set=cid,method=method,baseline='keyword_geo_date',metric='top5_set_jaccard',sample_size=len(candidates),value=jac,definition='Intersection / union of up to five IDs',uncertainty='deterministic in this snapshot',limitations='Ranking change is not relevance improvement',measurement_status='measured_functional'))
  add('scoring_evaluations',dict(evaluation_set=cid,method='all',baseline='keyword_geo_date',metric='precision_at_5',sample_size=0,definition='Relevant human labels / five judged candidates',limitations='No evaluators recruited; no outcome data; no temporal holdout with archival captures',measurement_status='not_measured'))
 hist={}
 for label,start in [('recent_12m','2025-09-28'),('full_60m','2021-09-28')]:
  es={e['id'] for e in events if start<=e['start_date']<OBS};roles=[r for r in T['event_company_roles'] if r['event_id'] in es and r['role']=='sponsor'];hist[label]={'editions':len(es),'sponsor_roles':len(roles),'sponsor_organizations':len({r['company_id'] for r in roles}),'warning':'Extraction depth differs by year; coverage difference not causal utility.'}
 (ROOT/'benchmark-results.json').write_text(json.dumps({'design':'Three predeclared synthetic functional cases, no tuning or relevance ground truth','ranking_runs':output,'history_ablation':hist,'temporal_validation':'invalid_without_pre_cutoff_snapshots; all observations made today'},ensure_ascii=False,indent=2))
 # Export mappable public addresses; geometry unknown is explicit and online excluded.
 examples=[]
 for e in events:
  if not e.get('venue_id'):continue
  v=next(v for v in T['venues'] if v['id']==e['venue_id']);ticketids={t['id'] for t in T['ticket_types'] if t['event_id']==e['id']};ps=[p for p in T['ticket_price_history'] if p['ticket_id'] in ticketids]
  examples.append({'event_id':e['id'],'name':e['title'],'date':e['start_date'],'end_date':e.get('end_date'),'timezone':e.get('timezone'),'status':'upcoming_announced; organizer_rechecked','address':v['address'],'country':v['country'],'latitude':None,'longitude':None,'location_precision':'published_address_ungeocoded','source_url':next(s['url'] for s in T['sources'] if s['id']==v['source_id']),'verified_on':OBS,'prices':[{'amount':p['amount'],'currency':p['currency'],'availability':p['availability']} for p in ps],'fit':'Illustrative developer-event exploration, no actual company profile','limitations':'Travel budget, ticket availability and audience fit require confirmation'})
 p=ROOT/'examples';p.mkdir(exist_ok=True);(p/'map-opportunities.json').write_text(json.dumps(examples,ensure_ascii=False,indent=2))
 import csv
 with (p/'map-opportunities.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=examples[0].keys());w.writeheader();w.writerows({**e,'prices':json.dumps(e['prices'])} for e in examples)
 (p/'map-opportunities.geojson').write_text(json.dumps({'type':'FeatureCollection','features':[{'type':'Feature','geometry':None,'properties':e} for e in examples]},ensure_ascii=False,indent=2))

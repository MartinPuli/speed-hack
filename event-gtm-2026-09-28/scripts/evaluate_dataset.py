"""Functional comparisons over one frozen candidate universe; no relevance claims."""
import collections,csv,hashlib,json,sqlite3,time
from pathlib import Path
R=Path(__file__).resolve().parents[1]
db=sqlite3.connect(R/'event-gtm.sqlite');db.row_factory=sqlite3.Row
events=[dict(x) for x in db.execute('SELECT * FROM event_editions')]
cases=json.loads((R/'inputs/evaluation-cases-frozen.json').read_text())
evidence=collections.defaultdict(list)
for a in db.execute("SELECT entity_id,assertion_id FROM assertions WHERE entity_table='event_editions'"):evidence[a[0]].append(a[1])
history=collections.Counter(e['series_id'] for e in events if e['start_date']<'2026-09-28' and e['status']!='cancelled')
metrics=collections.Counter(x[0] for x in db.execute('SELECT edition_id FROM audience_metrics'))
tables={'evaluation_cases':cases,'recommendation_runs':[],'recommendation_candidates':[],'scoring_evaluations':[]};summaries=[]
methods=['keyword_geo_date','profile_taxonomy_overlap','profile_plus_history_audience']
def uid(prefix,*s):return prefix+'_'+hashlib.sha256('|'.join(map(str,s)).encode()).hexdigest()[:16]
def text(x):return json.dumps(x,ensure_ascii=False,sort_keys=True)
for c in cases:
    p=c['profile_json'];r=c['restrictions_json']
    for method in methods:
        start=time.perf_counter();run=uid('evalrun',c['case_id'],method);ranked=[];ineligible=0
        for e in events:
            reasons=[];date=e['start_date'] or ''
            if e['date_precision']!='day':reasons.append('date_not_precise')
            if date<=c['cutoff'] or date>r['until']:reasons.append('outside_window')
            if e['status']=='cancelled':reasons.append('cancelled')
            if r.get('country') and e['country']!=r['country']:reasons.append('country_not_confirmed_or_mismatch')
            if r.get('city') and e['city']!=r['city']:reasons.append('city_not_confirmed_or_mismatch')
            if reasons:ineligible+=1;continue
            lexical=sum(k.casefold() in e['title'].casefold() for k in p['keywords'])
            # Lightweight semantic proxy, NOT an embedding run or learned similarity model.
            topic=1 if p['sector'] in (e['sector'] or '') else 0
            historic=min(history[e['series_id']],3)/3 if e['series_id'] else 0
            aud=1 if metrics[e['edition_id']] else 0
            components={'lexical_matches':lexical,'taxonomy_overlap':topic,'prior_editions_capped':historic,'audience_record_exists':aud}
            score=lexical if method==methods[0] else 2*topic+lexical*.25 if method==methods[1] else 2*topic+lexical*.25+historic*.15+aud*.05
            missing=['total_participation_cost','inventory_availability','buyer_confirmation','current_status_recheck']
            eligibility='conditional'
            if r.get('total_cost_must_be_known'):eligibility='needs_cost_validation'
            ranked.append((score,e,components,missing,eligibility))
        ranked.sort(key=lambda x:(-x[0],x[1]['start_date'],x[1]['edition_id']))
        for rank,(score,e,components,missing,eligibility) in enumerate(ranked,1):
            tables['recommendation_candidates'].append({'candidate_id':uid('cand',run,e['edition_id']),'run_id':run,'edition_id':e['edition_id'],'eligibility':eligibility,'components_json':text(components),'score':score,'rank':rank,'evidence_ids_json':text(evidence[e['edition_id']]),'missing_json':text(missing),'explanation':'Ranking funcional de investigación. '+('Sin coincidencia textual; no proponer como relevante.' if score==0 else 'Encaje requiere evaluación humana.'),'human_label':None})
        elapsed=(time.perf_counter()-start)*1000
        tables['recommendation_runs'].append({'run_id':run,'case_id':c['case_id'],'cutoff':c['cutoff'],'dataset_version':'research-2026-09-28-v1','method':method,'parameters_json':text({'lexical':1,'taxonomy':2,'history_max':.15,'audience':.05,'tuned_on_test':False}),'model':None,'elapsed_ms':elapsed,'measured_cost_usd':None})
        summaries.append({'case':c['case_id'],'method':method,'candidates':len(ranked),'excluded':ineligible,'top3':[x[1]['edition_key'] for x in ranked[:3]],'zero_match_top3':sum(x[0]==0 for x in ranked[:3]),'budget_feasible_confirmed':0})
for method in methods:
    n=sum(x['method']==method for x in summaries)
    for metric,value,definition in [('date_or_geography_violations',0,'Rows retained respect explicit date and geography filters; unknown geography is excluded when required.'),('commercial_precision_at_3',None,'No independent human labels; not measured.'),('useful_recommendation_cost',None,'No measured utility labels, provider bill or human effort; not measured.')]:
        tables['scoring_evaluations'].append({'evaluation_id':uid('metric',method,metric),'case_set':'8_synthetic_functional_cases','method':method,'baseline':methods[0],'metric':metric,'value':value,'sample_size':n,'definition':definition,'limitation':'Constraint checks do not demonstrate recommendation quality or commercial ROI.'})
roles=[dict(x) for x in db.execute("SELECT r.*, e.start_date, e.edition_key FROM event_company_roles r JOIN event_editions e USING(edition_id) WHERE role='sponsor' AND edition_key LIKE 'pycon-us-%'")]
allnames={r['company_id'] for r in roles};recent={r['company_id'] for r in roles if r['start_date']>='2025'}
counts_by_source=collections.Counter()
for e in events:
    payload=json.loads(e['extra_json'] or '{}');sources=payload.get('source_urls') or [e['url']]
    for u in set(sources):counts_by_source[u]+=1
quality={'events':len(events),'sample_union_increment_over_largest_document':len(events)-max(counts_by_source.values()),'largest_document_editions':max(counts_by_source.values()),'pycon_sponsors_5_years':len(allnames),'pycon_sponsors_2_years':len(recent),'extra_names_in_older_history':len(allnames-recent),'warning':'Exploratory sample counts, not global coverage or sponsorship propensity. Display-name normalization may split brands; no churn inferred.'}
(R/'batches'/'functional-evaluation.json').write_text(json.dumps({'batch':'functional-evaluation','derived_tables':tables},ensure_ascii=False,indent=2)+'\n')
(R/'checkpoints'/'functional-results.json').write_text(json.dumps({'summary':summaries,'coverage_history':quality},ensure_ascii=False,indent=2)+'\n')
print(text(quality));print('Executed',len(tables['recommendation_runs']),'runs;',len(tables['recommendation_candidates']),'candidate evaluations')

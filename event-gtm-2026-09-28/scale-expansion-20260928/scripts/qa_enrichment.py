#!/usr/bin/env python3
import json, collections, re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
rows=[json.loads(x) for x in (R/'batches/enrichment.jsonl').read_text().splitlines()]
assert len(rows)==len({r['assertion_id'] for r in rows})
for r in rows:
 for key in ['source_url','fetch_id','observed_at','content_sha256','locator','evidence_class','definition']:
  assert r.get(key),(r['assertion_id'],key)
 m=json.loads((R/'evidence/enrichment'/f"{r['fetch_id']}.json").read_text())
 assert m['content_sha256']==r['content_sha256']
 assert m['http_status']==200
 assert r['source_url'].startswith('https://')
 assert r['locator'] != '#'
 if r.get('company_name'): assert r.get('company_name_raw')
 if r.get('event_start'): assert r['event_start']<=r['event_end']
 if r['kind']=='sponsor_named':
  assert r['company_name'] and r['level'] and r['company_url']
  assert r['paid_contract_verified'] is False and r['amount'] is None
 if r['kind']=='sponsor_package':assert r['currency']=='AUD' and r['tax_status']=='excluding_GST'
 if r['kind']=='audience_metric' and r['metric']=='attendance_rate':assert 0<=r['value']<=100 and r['denominator'] is None
 assert not any(key in r for key in ['email','phone','attendee_name','contact_name'])
assert len([r for r in rows if r['kind']=='sponsor_named'])==len({(r['event_title'],r['company_name'],r['role'],r['level']) for r in rows if r['kind']=='sponsor_named'})
report={'status':'PASS','assertions':len(rows),'by_kind':dict(collections.Counter(r['kind'] for r in rows)),'sponsor_roles':dict(collections.Counter(r['role'] for r in rows if r['kind']=='sponsor_named')),'editions':len({r['event_title'] for r in rows if r.get('event_title')}),'checks':['unique_assertions','required_provenance','source_hash_linkage','HTTP_success','temporal_order','no_payment_inference','price_currency_tax','rate_semantics','no_personal_contact_fields','unique_relationships']}
(R/'reports/enrichment_qa.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))

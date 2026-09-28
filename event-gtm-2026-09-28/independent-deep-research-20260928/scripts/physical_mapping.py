from schema import SCHEMA
from pathlib import Path
import csv,re
P=Path(__file__).resolve().parents[1]
groups={
 'sources':'sources', 'assertions':'assertions',
 'entities':'companies event_series people venues distribution_channels competitors taxonomy_terms sessions venue_spaces event_assets communities news_articles',
 'event_editions':'event_editions','profiles':'sponsor_profiles company_profile_history',
 'relations':'event_company_roles participation entity_classifications session_participants event_relations event_space_assignments community_event_links professional_affiliations news_entity_links news_dedup_clusters sponsorship_history partner_relationships sponsorship_renewals',
 'measurements':'audience_metrics event_metrics distribution_metrics market_context sponsorship_observations topic_trends audience_overlap sponsor_match_scores',
 'offers + offer_versions':'sponsorship_packages event_costs ticket_types ticket_price_history sponsorship_deliverables',
 'external_ids':'platform_listings','source_snapshots':'source_snapshots','entity_aliases':'entity_aliases',
 'changes':'record_versions data_conflicts event_status_history',
 'jobs + job_steps':'extraction_queue crawl_runs fetch_attempts search_queries',
 'deadlines':'event_deadlines','briefs':'evaluation_cases customer_briefs',
 'runs':'recommendation_runs','candidates':'recommendation_candidates','feedback':'user_feedback',
 'artifacts':'company_signals opportunity_clusters scoring_evaluations unit_economics_scenarios event_concepts luma_drafts',
 'artifacts + assertions':'draft_field_evidence'
}
rows=[]
for target,tables in groups.items():
 for t in tables.split():
  rows.append({'logical_table':t,'physical_target':target,'representation':('typed kind='+t+'; retain logical id in payload and export adapter' if target in ['entities','relations','measurements','artifacts'] else 'typed columns plus schema-validated extension payload'),'foreign_reference_policy':'Composite scope_id,id; arrays/JSON references checked by ingest transaction','history_policy':'Append evidence and versions; current projection does not erase original observations','export_contract':'Regenerate original logical row/ID via view or adapter; adapter not implemented in research','state':'proposed_not_deployed'})
assert len(rows)==66 and {r['logical_table'] for r in rows}==set(SCHEMA)
with (P/'phase2/logical-to-physical.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(sorted(rows,key=lambda r:r['logical_table']))
tables=re.findall(r'CREATE TABLE (\w+)',(P/'phase2/physical-schema.sql').read_text())
(P/'phase2/schema-validation.txt').write_text(f'Logical mapping:66/66, unique, no missing. Proposed physical tables:{len(tables)}. SQL reviewed as design; PostgreSQL execution not performed.\n'+', '.join(tables)+'\n')
print('mapping',len(rows),'physical',len(tables))

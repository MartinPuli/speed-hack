"""Planning arithmetic, not measured billing. USD September 28 2026 tariffs."""
from pathlib import Path
import csv,json,math
P=Path(__file__).resolve().parents[1]
rates={'gpt-6-luna':{'input':.1,'cached_input':.01,'cache_write':.125,'output':.5},'gpt-6-sol':{'input':2,'cached_input':.2,'cache_write':2.5,'output':10},'gpt-6-astra':{'input':10,'cached_input':1,'cache_write':12.5,'output':50}}
def llm(model,ins,outs):return (ins*rates[model]['input']+outs*rates[model]['output'])/1e6
stages=[('profile_parse','gpt-6-luna',4000,500,1),('explanation','gpt-6-sol',12000,2000,1),('draft','gpt-6-sol',8000,1500,1),('search_content_input','gpt-6-sol',6000,0,1),('hard_case_escalation','gpt-6-astra',8000,1000,.1)]
flow_model=sum(llm(m,i,o)*n for _,m,i,o,n in stages)
flow_search=3*.01;retry=1.10;flow=(flow_model+flow_search)*retry
refresh=(llm('gpt-6-sol',8000,1200)+.01+llm('gpt-6-sol',2000,0))*retry
rows=[]
for name,customers,editions,pages,storage,app_low,app_high,db_low,db_high in [('pilot',10,1000,500,2,15,60,25,25),('mvp',100,10000,5000,20,30,150,25,75),('growth',1000,100000,50000,200,150,600,75,250)]:
 flows=customers*4;models=flow_model*retry*flows;search=flow_search*retry*flows;map_cost=30+2.5*math.ceil(max(flows-3000,0)/1000)
 extraction=pages*llm('gpt-6-luna',3000,500)*retry
 # Search is one existing provider path; do not add Exa on top in this baseline.
 r2=max(0,math.ceil(storage-10))*.015
 maps=map_cost # MapTiler Flex fee plus search-session overage above the included 3,000.
 human=(flows*10/60 + pages*.02*1/60)*40
 base= models+search+extraction+r2+maps
 lo=base+app_low+db_low;hi=base+app_high+db_high
 rows.append({'scenario':name,'customers':customers,'catalog_editions_assumed':editions,'flows_per_month':flows,'shared_pages_refreshed_per_month':pages,'models_usd':round(models+extraction,4),'search_usd':round(search,4),'maps_usd':map_cost,'r2_usd':round(r2,4),'db_usd_low':db_low,'db_usd_high':db_high,'app_worker_usd_low':app_low,'app_worker_usd_high':app_high,'tech_total_usd_low':round(lo,2),'tech_total_usd_high':round(hi,2),'human_hours_assumed':round(human/40,2),'human_usd_assumed':round(human,2),'total_with_human_usd_low':round(lo+human,2),'total_with_human_usd_high':round(hi+human,2),'tech_usd_per_flow_low':round(lo/flows,4),'all_in_usd_per_flow_low':round((lo+human)/flows,4),'license_usd':'unknown_excluded; baseline_requires_authorized_sources','useful_result_cost':'not_measured; divide full attributable cost by real accepted results'})
with (P/'phase2/cost-scenarios.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
out={'price_date':'2026-09-28','currency':'USD','type':'planning_estimate_not_invoice','source':'https://developers.openai.com/api/docs/pricing','rates_per_million_tokens':rates,'assumptions':{'processing':'Standard short_context','cache':'No discount assumed; uncached scenario excludes cache_write charge; add surcharge sensitivity separately','output_tokens':'includes assumed reasoning+visible tokens; actual distribution unknown','retry_factor':retry,'pipeline_usage':'not_executed; token counts hypothetical','privacy':'no private data sent; model and account access untested'},'stages':[{'stage':s,'model':m,'input_tokens':i,'output_tokens':o,'frequency_per_flow':n,'cost_usd':llm(m,i,o)*n} for s,m,i,o,n in stages],'flow_model_usd':flow_model,'flow_search_usd':flow_search,'flow_variable_usd_with_retry':flow,'weekly_4_refreshes_usd_per_customer':4*refresh,'daily_30_refreshes_usd_per_customer':30*refresh,'refresh_variable_usd':refresh,'scenarios':rows,'sensitivities':{'extra_10000_sol_output_tokens_usd':.1,'extra_search_calls_10_tool_fee_usd':.1,'human_extra_5_minutes_at_40_usd_per_hour':40*5/60,'licenses_monthly_not_quotes':[0,500,5000],'cache_write_extra_if_all_assumed_input_written_usd_per_flow':sum(i*rates[m]['input']/1e6*n*.25 for _,m,i,o,n in stages)}}
(P/'phase2/cost-model.json').write_text(json.dumps(out,indent=2))
if __name__=='__main__': print(json.dumps(out,indent=2))

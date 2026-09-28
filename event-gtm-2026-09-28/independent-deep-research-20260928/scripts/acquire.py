"""Research acquisition only; factual metadata, no credentials, no app implementation."""
from pathlib import Path
import requests, hashlib, json, time, datetime, re, sys, warnings
from bs4 import BeautifulSoup
warnings.filterwarnings('ignore')
ROOT=Path(__file__).resolve().parents[1]
NOTES=ROOT/'notes'; NOTES.mkdir(exist_ok=True)
RUN='acquisition-v1'
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def fetch(url):
    t=time.perf_counter(); observed=now()
    try:
        r=requests.get(url,timeout=35,headers={'User-Agent':'GrowthAtlasResearch/1.0 (public factual metadata research)'})
        entry={'url':url,'resolved_url':r.url,'observed_at':observed,'status':r.status_code,'duration_ms':round((time.perf_counter()-t)*1000),'sha256':hashlib.sha256(r.content).hexdigest(),'bytes':len(r.content),'content_type':r.headers.get('Content-Type'),'method':'public_http','run_id':RUN}
    except requests.RequestException as e:
        entry={'url':url,'observed_at':observed,'status':'error','error':type(e).__name__,'duration_ms':round((time.perf_counter()-t)*1000),'method':'public_http','run_id':RUN}; r=None
    with (NOTES/'http-attempts.jsonl').open('a') as f: f.write(json.dumps(entry)+'\n')
    return r if r is not None and r.status_code==200 else None
def parse_ics(text):
    text=re.sub(r'\r?\n[ \t]','',text)
    events=[]
    for block in text.split('BEGIN:VEVENT')[1:]:
        obj={}
        for line in block.split('END:VEVENT')[0].splitlines():
            if ':' not in line: continue
            key,value=line.split(':',1)
            base=key.split(';')[0]
            if base in ['UID','SUMMARY','DTSTART','DTEND','LOCATION','URL','STATUS','CREATED','LAST-MODIFIED','RRULE','RECURRENCE-ID']:
                obj[base]=value.replace('\\,',',').replace('\\;',';').replace('\\n',' ').replace('\\\\','\\')
                if ';' in key: obj[base+'_params']=key.split(';',1)[1]
            if base=='DESCRIPTION':
                # Only keep linked public event URLs, not descriptions or personal data.
                obj['description_urls']=re.findall(r'https?://[^\s<>"\\]+',value)
        events.append(obj)
    return events
def calendars():
    for kind in ['python-events','python-user-group']:
        seed='https://www.python.org/events/'+kind+'/'
        r=fetch(seed)
        if r is None: continue
        soup=BeautifulSoup(r.text,'html.parser')
        links=[a['href'] for a in soup.select('a[href]') if a['href'].endswith('.ics')]
        for url in links:
            time.sleep(1)
            r=fetch(url)
            if r is None: continue
            all_events=parse_ics(r.text)
            selected=[]; recurrence=[]
            for e in all_events:
                d=e.get('DTSTART','')[:8]
                if '20210928'<=d:
                    e['source_url']=url; e['seed_url']=seed; e['calendar_kind']=kind
                    if 'RRULE' in e: recurrence.append(e)
                    else: selected.append(e)
            (NOTES/(kind+'-facts.json')).write_text(json.dumps(selected,ensure_ascii=False,indent=2))
            (NOTES/(kind+'-recurrence-review.json')).write_text(json.dumps(recurrence,ensure_ascii=False,indent=2))
            print(json.dumps({'kind':kind,'calendar_total_components':len(all_events),'nonrecurring_in_window':len(selected),'recurring_in_window_not_expanded':len(recurrence),'year_counts':{y:sum(e['DTSTART'].startswith(y) for e in selected) for y in ['2021','2022','2023','2024','2025','2026','2027']}}))
if __name__=='__main__':
    if sys.argv[1:] == ['calendars']: calendars()
    else:
        for url in sys.argv[1:]:
            r=fetch(url)
            if r is None: print(url,'UNAVAILABLE'); continue
            soup=BeautifulSoup(r.text,'html.parser')
            for e in soup(['script','style','nav','footer','header']): e.decompose()
            print(url, soup.get_text(' ',strip=True)[:16000])

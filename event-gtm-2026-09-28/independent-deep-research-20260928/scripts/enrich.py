from acquire import *
from urllib.parse import urlparse

def sponsors():
    rows=[]
    for year in [2022,2023,2024,2025]:
        url=f'https://us.pycon.org/{year}/sponsorship/sponsors/'
        r=fetch(url)
        if r is None: continue
        s=BeautifulSoup(r.text,'html.parser')
        selector='.sponsor-level' if year==2022 else '.sp-level'
        for container in s.select(selector):
            h=container.find('h2') if year==2022 else container.find_previous('h2')
            level=h.get_text(' ',strip=True)
            for card in container.select('.sponsor' if year==2022 else ('.sp' if year==2023 else '.sp-square')):
                img=card.find('img');a=card.find('a',href=True)
                if not img: continue
                name=img.get('alt','').strip()
                if not name: continue
                name=re.sub(r' Logo$','',name)
                rows.append({'year':year,'name':name,'name_original':img.get('alt'),'company_url':a['href'] if a else None,'level':level,'source_url':url,'locator':f'h2={level}; img alt={img.get("alt")}','role':'community' if level=='Community' else ('startup_exhibitor' if 'Startup' in level else ('government_participant' if 'Government' in level else 'sponsor'))})
        time.sleep(1)
    (NOTES/'sponsors-facts.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
    print('Sponsor-page roles',len(rows),'by year',{y:sum(r['year']==y for r in rows) for y in [2022,2023,2024,2025]})
    print('Companies',sorted(set(x['name'] for x in rows)))
if __name__=='__main__': sponsors()

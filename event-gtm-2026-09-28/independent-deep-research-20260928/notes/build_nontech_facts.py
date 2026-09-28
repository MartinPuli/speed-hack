"""Construye hechos curados de fuentes primarias leídas el 2026-09-28; no hace scraping."""
import json
from pathlib import Path

OUT = Path(__file__).parent
events = []

def add(title, start, end, location, country, fmt, sector, series, url, source_title, publisher, pubdate=None, organizer=None, organizer_url=None, status='announced', locator='Cuerpo principal', access='web_open'):
    e = dict(title=title,start_date=start,end_date=end,location=location,country=country,format=fmt,sector=sector,series=series,source_url=url,source_title=source_title,publisher=publisher,publication_date=pubdate,organizer=organizer,organizer_url=organizer_url,status=status,source_access=access,facts=[],sponsors=[],metrics=[],platform_links=[])
    for field,value in [('title',title),('start_date',start),('end_date',end),('location',location)]:
        e['facts'].append(dict(field=field,value=value,source_url=url,locator=locator,paraphrase=f'{field}: {value}.'))
    events.append(e)
    return e

def fact(e,field,value,url,locator,paraphrase=None):
    e['facts'].append(dict(field=field,value=value,source_url=url,locator=locator,paraphrase=paraphrase or str(value)))

def sponsor(e,name,role,url,locator,level=None,company_url=None):
    e['sponsors'].append(dict(name=name,company_url=company_url,role=role,level=level,source_url=url,locator=locator))

def metric(e,name,value,unit,url,locator,status='reported',method='Declaración de la organización; metodología de conteo no publicada en esta fuente.'):
    e['metrics'].append(dict(name=name,value=value,unit=unit,method=method,status=status,source_url=url,locator=locator))

# FIL: fechas, resultados, precios y distinción entre jornadas profesionales y público.
fil_num='https://fil.com.mx/info/numeralia.asp?ids=1'
fil_org='https://fil.com.mx/info/informacion.asp'
fil_data=[
 (2021,'2021-11-27','2021-12-05','https://www.gaceta.udg.mx/prepara-fil-guadalajara-edicion-2021-de-forma-presencial/','Prepara FIL Guadalajara edición 2021 de forma presencial','Gaceta UdeG',None,'híbrido','search_index'),
 (2022,'2022-11-26','2022-12-04','https://www.gaceta.udg.mx/806-mil-805-lectores-se-reencontraron-en-la-fil-guadalajara/','806 mil 805 lectores se reencontraron en la FIL Guadalajara','Gaceta UdeG',None,'presencial','search_index'),
 (2023,'2023-11-25','2023-12-03','https://www.cucsh.udg.mx/noticias/fil-guadalajara-anuncia-su-programa-general-2023','FIL Guadalajara anuncia su Programa General 2023','CUCSH / Universidad de Guadalajara',None,'presencial','search_index'),
 (2024,'2024-11-30','2024-12-08','https://udg.mx/evento/feria-internacional-del-libro-2024-invitado-de-honor-espana','Feria Internacional del Libro 2024, invitado de honor España','Universidad de Guadalajara',None,'presencial','search_index'),
 (2025,'2025-11-29','2025-12-07','https://fil.com.mx/prensa/boletin.asp?id=3186&ids=2','Italia reafirma su compromiso cultural rumbo a la FIL Guadalajara 2026','FIL Guadalajara','2025-04-09','presencial','web_open'),
 (2026,'2026-11-28','2026-12-06','https://fil.com.mx/info/faq.asp','Preguntas frecuentes: FIL 2026','FIL Guadalajara',None,'presencial','web_open'),
]
F={}
for y,s,t,u,st,p,pd,fmt,a in fil_data:
    e=add(f'Feria Internacional del Libro de Guadalajara {y}',s,t,'Guadalajara, Jalisco; Expo Guadalajara','México',fmt,'editorial / cultura','FIL Guadalajara',u,st,p,pd,'Universidad de Guadalajara',fil_org,'announced' if y==2026 else 'reported_held',access=a)
    F[y]=e
    fact(e,'organizer','Universidad de Guadalajara',fil_org,'Bienvenidos a la FIL','La página institucional atribuye la creación de la feria a la Universidad de Guadalajara; entidad organizadora normalizada a nivel de serie.')

u='https://www.gaceta.udg.mx/los-lectores-se-reencontraron-con-la-fil/'
metric(F[2021],'asistencia_presencial_reportada',251900,'asistencias',u,'Balance del 5 de diciembre de 2021')
metric(F[2021],'asistencia_expo_guadalajara_reportada',205000,'asistencias',u,'Desglose por recinto')
metric(F[2021],'profesionales_del_libro',3278,'profesionales',u,'Balance de la edición 35')
fact(F[2021],'status','reported_held',u,'Concluye este domingo / balance','El balance informa cierre y conteos por recinto.')
fact(F[2021],'venue_scope','También CCU, Foro FIL, Hotel Hilton y centros universitarios',u,'Desglose por recinto','El agregado presencial no corresponde sólo a Expo Guadalajara.')
metric(F[2022],'asistencia_reportada',806805,'asistencias',F[2022]['source_url'],'Balance de la edición 2022')
u='https://www.udg.mx/es/noticia/con-mas-de-857-mil-visitantes-fil-2023-rompe-record-de-asistencia?q=es%2Fnoticia%2Fcon-mas-de-857-mil-visitantes-fil-2023-rompe-record-de-asistencia'
metric(F[2023],'asistencia_reportada',857315,'asistencias',u,'Primer párrafo; 3 de diciembre de 2023')
fact(F[2023],'status','reported_held',u,'Balance de nueve días','La universidad comunica el balance de la edición 37.')
for y,att,pro,labels,spons in [(2024,907300,18100,2769,70),(2025,953112,18400,2790,72)]:
    for name,val,unit,row in [('asistencia_reportada',att,'asistencias','Público asistente'),('profesionales_del_libro',pro,'profesionales','Profesionales del libro'),('sellos_editoriales',labels,'sellos','Sellos editoriales'),('patrocinadores_y_auspiciantes',spons,'organizaciones','Patrocinadores y auspiciantes')]:
        metric(F[y],name,val,unit,fil_num,f'Tabla La FIL en números, columna {y}, fila {row}')
    fact(F[y],'status','reported_held',fil_num,f'Numeralia, columna {y}','La organización publica cifras de esta edición.')
u='https://www.fil.com.mx/prensa/boletin.asp?id=3205&ids=1'
fact(F[2025],'ticket_general',{'amount':30,'currency':'MXN','scope':'entrada general; tarifa anunciada'},u,'Venta de boletos, línea 152','La nota del 6 de octubre de 2025 fija el boleto general en 30 MXN.')
fact(F[2025],'ticketing_platform','Boletomóvil',u,'Venta de boletos','Se nombra la plataforma de venta; no se recuperó un enlace de checkout de esa edición.')
fact(F[2025],'attendance_caveat','El balance del último día era una proyección preliminar al cierre', 'https://fil.com.mx/ingles/prensa/boletin.asp?id=3316&ids=','Balance del 7 de diciembre de 2025','La numeralia posterior repite 953112; no se obtuvo auditoría independiente.')
u=F[2026]['source_url']
fact(F[2026],'ticket_general',{'amount':40,'currency':'MXN','scope':'adultos'},u,'FAQ: ¿Cuánto cuesta el boleto?, línea 129')
fact(F[2026],'ticket_discount',{'amount':30,'currency':'MXN','scope':'categorías con descuento enumeradas'},u,'FAQ: ¿Cuánto cuesta el boleto?, línea 130')
fact(F[2026],'ticket_udg_student',{'amount':25,'currency':'MXN','scope':'estudiantes UdeG con credencial vigente'},u,'FAQ: ¿Cuánto cuesta el boleto?, línea 131')
fact(F[2026],'professional_access','Algunas actividades requieren registro y cuota aparte',u,'FAQ: Programa de actividades, líneas 172–179')
fact(F[2026],'guest_of_honor','Italia',u,'FAQ: Invitado de Honor, líneas 188–190')
fact(F[2025],'sponsorship_inventory','Activaciones, espacios y experiencias adaptadas; niveles Platino, Plus y Oro','https://www.fil.com.mx/patro/patro.asp','Patrocinadores FIL 2025','No se extrajeron precios de paquetes ni nombres a partir de logos no leídos.')

# Flip: festival principal, nunca confundir con las fechas de cada Casa o actividad educativa.
flip_dates=[
 (2021,'2021-11-27','2021-12-05','https://flip.org.br/noticias/flip-confirma-as-datas-da-19-ordf-edicao/','Flip confirma as datas da 19ª edição',None,'online','reported_held'),
 (2022,'2022-11-23','2022-11-27','https://institucional.flip.org.br/home-2022/','Home 2022',None,'presencial','reported_held'),
 (2023,'2023-11-22','2023-11-26','https://www.flip.org.br/confira-as-datas-da-21a-flip/','Confira as datas da 21ª Flip','2023-05-24','presencial','reported_held'),
 (2024,'2024-10-09','2024-10-13','https://2024.flip.org.br/','Flip 2024 Home',None,'presencial','reported_held'),
 (2025,'2025-07-30','2025-08-03','https://www.flip.org.br/flip-anuncia-a-data-da-23a-edicao/','Flip anuncia a data da 23ª edição','2025-02-18','presencial','reported_held'),
 (2026,'2026-07-22','2026-07-26','https://flip.org.br/evento/flip-2026/','Flip 2026; cabecera 24ª Flip',None,'presencial','announced')
]
P={}
for y,s,t,u,st,pd,fmt,status in flip_dates:
    e=add(f'Flip — Festa Literária Internacional de Paraty {y}',s,t,'Online; sede de la serie: Paraty, RJ' if y==2021 else 'Paraty, Rio de Janeiro','Brasil',fmt,'literatura / cultura','Flip',u,st,'Flip',pd,'Associação Casa Azul','https://institucional.flip.org.br/',status,locator='Cabecera / anuncio fechado de la edición',access='search_index')
    P[y]=e
    fact(e,'organizer','Associação Casa Azul','https://www.flip.org.br/patronos/','Programa de patronos; identificación de Associação Casa Azul','Identidad institucional normalizada a nivel de serie; la fuente consultada es de 2025.')
fact(P[2021],'date_scope','Sólo Programa Principal; Flipinha se anunció del 22 al 27 de noviembre',P[2021]['source_url'],'Fechas de la 19ª edición')
fact(P[2021],'format','online',P[2025]['source_url'],'Retrospectiva de ediciones 2020–2024','La nota de 2025 confirma que 2020 y 2021 fueron virtuales.')
fact(P[2021],'status','reported_held','https://institucional.flip.org.br/agenda-2021/','Agenda 2021; enlaces a videos','Agenda preservada con grabaciones de las mesas; no se extrajeron asistentes.')
for y in [2022,2023,2024]:
    fact(P[y],'status','reported_held',P[2025]['source_url'],'Retrospectiva de ediciones 2022–2024','La nota de 2025 describe las ediciones presenciales realizadas en noviembre de 2022/2023 y octubre de 2024.')
u='https://arquivos.motiva.com.br/relatorios/ri2023/en/downloads/CCR_RI2023.pdf'
sponsor(P[2023],'Grupo CCR','Patrocinador y socio oficial de movilidad',u,'ESG PERFORMANCE; párrafo In 2023 ... gold sponsor','Oro','https://www.motiva.com.br/')
fact(P[2023],'sponsor_activation','Transporte y programación gratuita sobre cultura, mujeres y clima',u,'ESG PERFORMANCE; proyectos del Instituto CCR')
u='https://www.motiva.com.br/en/news/instituto-ccr-amplia-presenca-na-flip/'
sponsor(P[2024],'Grupo CCR / Instituto CCR','Socio oficial de movilidad y programación Casa CCR',u,'Cuerpo, líneas 23–41',None,'https://www.motiva.com.br/')
metric(P[2024],'transporte_objetivo',2600,'personas',u,'Ações de mobilidade e circularidade; línea 42',status='planned',method='Expectativa declarada, no resultado medido.')
fact(P[2024],'side_event','Casa CCR: 10–12 de octubre, Rua Marechal Deodoro 384; entrada gratuita',u,'Serviço – Programação da Casa CCR, líneas 31–32 y 55–58')
u='https://www.eletronuclear.gov.br/Quem-Somos/Governanca/Documents/Balan%C3%A7os/2024/1.%20RELAT%C3%93RIO%20ADMINISTRA%C3%87%C3%83O%20E%20RESPONSABILIDADE%20SOCIAL%202024.pdf'
sponsor(P[2024],'Eletronuclear','Patrocinador mediante incentivo cultural',u,'Responsabilidade Social; cuatro proyectos incentivados',None,'https://www.eletronuclear.gov.br/')
u='https://www.motiva.com.br/en/news/motiva-assina-programacao-na-flip-pelo-segundo-ano-consecutivo/'
sponsor(P[2025],'Motiva','Patrocinador; socio oficial de movilidad; Casa Flip+Motiva',u,'Cuerpo y Apoio a festivais literários pelo Brasil',None,'https://www.motiva.com.br/')
metric(P[2025],'inversion_apoyo_y_activaciones',2000000,'BRL',u,'Apoio a festivais literários pelo Brasil; línea 94',status='announced',method='Inversión declarada por sponsor; recursos propios e incentivados. No equivale a fee de derechos ni gasto auditado.')
metric(P[2025],'inscripciones_concurso_cuentos_minimo',698,'inscripciones',u,'Concurso revela novas vozes; línea 69',status='reported_lower_bound',method='Sponsor informa más de 698 inscripciones; no asistencia al festival.')
fact(P[2025],'side_event','Casa Flip+Motiva: 31 julio–3 agosto; Rua Marechal Deodoro 384; entrada gratuita',u,'SERVIÇOS; líneas 117–126')
fact(P[2025],'status','reported_held',u,'Pie de fotografía y cuerpo; líneas 31–36','Noticia durante el festival documenta público y comienzo de programación.')
fact(P[2025],'entity_alias','Grupo CCR → Motiva, cambio de marca anunciado para 24 abril 2025','https://www.motiva.com.br/en/news/motiva-sera-a-nova-marca-do-grupo-ccr/','Anuncio del 24 de marzo de 2025','No interpretar dos nombres de marca como dos sponsors independientes.')
u='https://rodovias.motiva.com.br/riosp/noticias/2026/julho/motiva-assina-a-programacao-oficial-da-flip-pelo-terceiro-ano-co/'
sponsor(P[2026],'Instituto Motiva','Apoyo a programación oficial y acceso cultural',u,'Motiva assina a programação oficial da Flip pelo terceiro ano consecutivo',None,'https://www.motiva.com.br/')
metric(P[2025],'visitantes_casa_flip_motiva',2792,'visitas de activación',u,'Retrospectiva 2025, línea 90',method='Sponsor reporta visitantes de su Casa, no de todo el festival; no se especifica deduplicación de personas.')
fact(P[2026],'status_caveat','Fecha pasada; esta extracción sólo obtuvo anuncio y agenda primaria, sin recap primario de cierre',P[2026]['source_url'],'Cabecera y agenda','El estado announced no significa cancelación: celebración efectiva no verificada en este lote.')

# Frieze: London y Masters son entidades distintas aunque muchos comunicados las agrupen.
frieze_data=[
 (2021,'2021-10-13','2021-10-17','https://www.frieze.com/article/galleries-and-programming-frieze-london-and-frieze-masters-2021','Galleries and Programming for Frieze London and Frieze Masters 2021','2021-08-16','announced','search_index'),
 (2022,'2022-10-12','2022-10-16','https://www.frieze.com/article/frieze-london-and-masters-vip-visitor-faqs','Frieze London and Masters VIP Visitor FAQs','2022-09-20','reported_held','search_index'),
 (2023,'2023-10-11','2023-10-15','https://www.frieze.com/article/galleries-and-curators-frieze-london-and-frieze-masters-2023','The Galleries and Curators for Frieze London and Frieze Masters 2023','2023-06-22','announced','web_open'),
 (2024,'2024-10-09','2024-10-13','https://press.frieze.com/frieze-unveils-bold-design-for-frieze-london-2024-and-a-new-curatorial-direction-at-frieze-masters/','Frieze Unveils Bold Design for Frieze London 2024','2024-06-27','announced','web_open'),
 (2025,'2025-10-15','2025-10-19','https://press.frieze.com/frieze-london-frieze-masters-2025-first-details/','Frieze London & Frieze Masters 2025 to Highlight Curatorial Innovation','2025-06-05','reported_held','search_index'),
 (2026,'2026-10-14','2026-10-18','https://press.frieze.com/flfm26-first-details/','Frieze London & Frieze Masters: Six Continents in Dialogue','2026-06-11','announced','search_index')
]
A={}
for y,s,t,u,st,pd,status,acc in frieze_data:
    e=add(f'Frieze London {y}',s,t,"London; The Regent’s Park",'Reino Unido','presencial','arte contemporáneo / mercado del arte','Frieze London',u,st,'Frieze',pd,'Frieze','https://www.frieze.com/',status,access=acc)
    A[y]=e
    fact(e,'date_scope','Incluye jornadas de preview; London se conserva separado de Masters',u,'Fechas de las ferias','La misma fecha de feria no asegura acceso general todos los días.')
u='https://www.frieze.com/bmw-open-work-2021-madeline-hollander'
sponsor(A[2021],'BMW','Colaboración artística BMW Open Work',u,'2021 BMW Open Work; colaboración con BMW',None,'https://www.bmw.com/')
fact(A[2021],'sponsor_activation','Instalación Sunrise/Sunset con faros LED reciclados en el BMW Lounge',u,'Comisión de Madeline Hollander')
u='https://croynielsen.com/fairs/frieze-london-2021/'
fact(A[2021],'status','reported_held',u,'Past fair; installation views','La galería participante conserva vistas de instalación de la edición.')
A[2021]['status']='reported_held'
u='https://www.deutsche-bank.it/news/detail/dbmagazine-il-dietro-le-quinte-delle-fiere-arte-organizzate-da-frieze-nel-2022?language_id=1'
sponsor(A[2022],'Deutsche Bank','Patrocinador global principal',u,'Art:LIVE; Londra 12/16 ottobre','Global Lead Partner','https://www.db.com/')
fact(A[2022],'status','reported_held',u,'Recap del 28 octubre 2022','El sponsor repasa los cuatro encuentros de 2022, incluido Londres.')
u='https://www.frieze.com/article/revealed-highlights-frieze-london-and-frieze-masters-2023?language=en'
sponsor(A[2023],'Stone Island','Socio de la sección Focus',u,'FOCUS; debut of Stone Island','Official Partner of Focus','https://www.stoneisland.com/')
fact(A[2023],'sponsor_change','Inicio de colaboración Stone Island / Focus',u,'FOCUS','El organizador identifica expresamente el debut en 2023; no se infiere baja de otro sponsor.')
metric(A[2023],'galerias_anunciadas_minimo',160,'galerías',A[2023]['source_url'],'Frieze London, línea 55',status='announced_lower_bound',method='Programa anunciado: más de 160 galerías; no asistencia ni ventas.')
for y in [2024,2026]:
    sponsor(A[y],'Deutsche Bank','Patrocinador global principal',A[y]['source_url'],'Global Lead Partner','Global Lead Partner','https://www.db.com/')
sponsor(A[2024],'Stone Island','Apoyo a galerías Focus',A[2024]['source_url'],'Focus: becas a galerías',None,'https://www.stoneisland.com/')
fact(A[2024],'side_program','East End Day 6 octubre y West End Night 10 octubre','https://www.frieze.com/article/east-end-day-and-west-end-night-2024','East End Day and West End Night 2024','Actividades de Frieze Week fuera del intervalo de la feria y algunas con cita previa.')
u='https://press.frieze.com/frieze-london-frieze-masters-2025-end-of-fair/'
sponsor(A[2025],'Deutsche Bank','Patrocinador / colaboración de 22 años',u,'Declaración de Claudio de Sanctis',None,'https://www.db.com/')
fact(A[2025],'status','reported_held',u,'Recap del 19 octubre 2025','El organizador anuncia la conclusión de ambas ferias.')
fact(A[2025],'reported_sale',{'gallery':'David Zwirner','artist':'Chris Ofili','amount':700000,'currency':'USD'},u,'Ventas en Frieze London; línea 42','Venta declarada en recap del organizador, sin auditoría; no es ROI agregado ni venta típica.')
fact(A[2026],'sponsor_activation','Instalación de Studio Lenca en lounges Deutsche Bank',A[2026]['source_url'],'Global Lead Partner','Activación anunciada para 2026.')
sponsor(A[2026],'Stone Island','Apoyo a galerías Focus',A[2026]['source_url'],'Stone Island support since 2023',None,'https://www.stoneisland.com/')
u='https://www.frieze.com/article/jack-obrien-wins-2023-camden-art-centre-emerging-artist-prize-frieze-london'
fact(A[2023],'status','reported_held',u,'Premio anunciado el 11 octubre 2023; fotografía del acto','El organizador documenta el premio de la edición y las galerías participantes.')
A[2023]['status']='reported_held'
u='https://app.frieze.com/article/funds-prizes-collaborations-frieze-london-frieze-masters-2025'
fact(A[2024],'status','reported_held',u,'Fotografía retrospectiva: Nat Faulkner wins ... at Frieze London 2024','El organizador preserva evidencia retrospectiva del premio de 2024.')
A[2024]['status']='reported_held'

# Roland-Garros: ventana total incluye clasificación, compatible con los conteos de estadio.
rg_data=[
 (2022,'2022-05-16','2022-06-05','https://www.rolandgarros.com/en-us/article/roland-garros-innovations-commitments-edition-2022','Roland-Garros: innovations and commitments for 2022','2022-03-16','reported_held','search_index'),
 (2023,'2023-05-22','2023-06-11','https://www.rolandgarros.com/en-us/article/roland-garros-2023-opening-official-ticketing-offers-15-march','Roland-Garros 2023: ticketing opens on 15 march!','2023-03-08','reported_held','search_index'),
 (2024,'2024-05-20','2024-06-09','https://www.emirates.com/media-centre/emirates-is-back-in-action-at-roland-garros-2024/','Emirates is back in action at Roland-Garros 2024','2024-05-17','reported_held','search_index'),
 (2025,'2025-05-19','2025-06-08','https://media.renault.com/?p=529529','Renault 4 Savane 4x4 Concept en première mondiale à Roland-Garros 2025','2025-05-16','reported_held','search_index'),
 (2026,'2026-05-18','2026-06-07','https://www.rolandgarros.com/fr-fr/article/medias-accreditations-presse-radio-photo-tv-roland-garros-2026','Médias : processus d’accréditation pour Roland-Garros 2026','2026-02-09','reported_held','search_index'),
 (2027,'2027-05-17','2027-06-06','https://travel.rolandgarros.com/fr/conditions','Conditions générales de vente billetterie Roland-Garros 2027','2026-05-24','announced','search_index')
]
R={}
for y,s,t,u,st,pd,status,acc in rg_data:
    e=add(f'Roland-Garros {y}',s,t,'Paris; Stade Roland-Garros','Francia','presencial','deporte / tenis','Roland-Garros',u,st,'Renault' if y==2025 else 'Emirates' if y==2024 else 'FFT / Roland-Garros',pd,'Fédération française de tennis','https://www.fft.fr/',status,access=acc)
    R[y]=e
    fact(e,'date_scope','Torneo completo, incluida Opening Week / clasificación',u,'Fechas del torneo','No confundir con las dos semanas del cuadro principal.')
    fact(e,'organizer','Fédération française de tennis','https://www.rolandgarros.com/fr-fr/article/roland-garros-bnp-paribas-renouvellement-partenariat-histoire-2032','Renouvellement entre BNP Paribas et la FFT','Organizador normalizado a nivel de serie.')
u='https://www.rolandgarros.com/en-us/article/figures-record-breaking-stats-roland-garros-2022'
metric(R[2022],'espectadores_reportados',613586,'asistencias',u,'Cifras de la edición; líneas 120–122')
metric(R[2022],'visitantes_activacion_engie',11300,'visitas de stand',u,'Fresque Écologique du Tennis; líneas 90–92')
metric(R[2022],'entradas_reducidas_menores25',21574,'entradas',u,'Roland for all; línea 105')
fact(R[2022],'ticket_under25',{'amount':10,'currency':'EUR','scope':'contingente de menores de 25, no precio general'},u,'Roland for all; línea 105')
sponsor(R[2022],'ENGIE','Patrocinador de la activación Fresque Écologique du Tennis',u,'Fresque Écologique du Tennis',None,'https://www.engie.com/')
u='https://www.renault.fr/renault-mag/thematique-autour-de-renault/renault-devient-partenaire-premium-de-rolandgarros.html'
sponsor(R[2022],'Renault','Patrocinador premium',u,'Anuncio del 2 mayo 2022','Premium','https://www.renault.com/')
fact(R[2022],'sponsor_change','Renault inicia acuerdo de cinco años desde 2022',u,'Renault devient Partenaire Premium','Inicio documentado; no se afirma qué sponsor salió ni se extrapolan activaciones futuras.')
u='https://www.rolandgarros.com/fr-fr/article/chiffres-manquants-finales-messieurs-double-dames-quinzieme-journee-dimanche-11-juin'
metric(R[2023],'espectadores_reportados_minimo',630000,'asistencias',u,'630 000; incluye Opening Week',status='reported_lower_bound')
u='https://media.renault.com/roland-garros-2023-la-marque-renault-monte-au-filet/?lang=fra'
sponsor(R[2023],'Renault','Patrocinador premium',u,'Primeros bullets','Premium','https://www.renault.com/')
metric(R[2023],'flota_anunciada',185,'vehículos',u,'Flota para jugadores y oficiales',status='announced',method='Inventario logístico anunciado por sponsor.')
u='https://www.rolandgarros.com/fr-fr/article/bilan-edition-2024-gilles-moretton-amelie-mauresmo-conference-de-presse'
metric(R[2024],'espectadores_bilan_ultimo_dia',670000,'asistencias',u,'Billetterie mobile; 9 junio 2024',status='reported_at_final_day',method='Declaración en conferencia de cierre; cifra posterior oficial difiere. No se sabe si la diferencia es redondeo, corte temporal o metodología.')
u='https://digital.fft.fr/04-divers/federal/2025/NL%20CLUBS/TI571-Interactif_compressed.pdf'
metric(R[2024],'espectadores_referencia_posterior',675080,'asistencias',u,'ROLAND-GARROS en quelques chiffres',status='reported_later',method='Revista FFT de 2025; conteo referido a 2024. No se documenta si reemplaza la declaración de 670000; conservar ambas observaciones.')
sponsor(R[2024],'Emirates','Aerolínea oficial y patrocinador premium',R[2024]['source_url'],'Subtítulo y primer párrafo','Premium','https://www.emirates.com/')
u='https://media.renault.com/game-5-and-match-renault-electrifies-roland-garros/?lang=eng'
sponsor(R[2024],'Renault','Patrocinador premium',u,'Tercer año consecutivo','Premium','https://www.renault.com/')
metric(R[2024],'flota_anunciada',180,'vehículos',u,'Bullets iniciales',status='announced',method='Inventario logístico anunciado por sponsor.')
sponsor(R[2025],'Renault','Patrocinador premium y transportista oficial',R[2025]['source_url'],'Cuarto año consecutivo','Premium','https://www.renault.com/')
metric(R[2025],'flota_anunciada',187,'vehículos',R[2025]['source_url'],'Transporteur officiel',status='announced',method='Inventario logístico anunciado por sponsor.')
fact(R[2025],'company_launch_signal','Presentación de Renault 4 Savane 4x4 Concept en el stand del torneo',R[2025]['source_url'],'Anuncio del 16 mayo 2025','Relaciona lanzamiento de producto y activación de sponsor; no prueba ventas atribuidas.')
u='https://www.rolandgarros.com/en-us/page/roland-garros-past-editions-2025-coco-gauff-carlos-alcaraz'
fact(R[2025],'status','reported_held',u,'Past editions 2025; finales del 8 junio','Archivo oficial de resultados de 2025.')
u='https://www.rolandgarros.com/fr-fr/article/edition-2026-amelie-mauresmo-bilan-reussites-surprises-conference-de-presse'
metric(R[2026],'espectadores_reportados_minimo',727000,'asistencias',u,'Une édition à la hauteur des espérances; 7 junio 2026',status='reported_lower_bound')
fact(R[2026],'status','reported_held',u,'Conferencia de balance','La directora ofrece balance durante la jornada final.')
u='https://www.rolandgarros.com/fr-fr/article/roland-garros-bnp-paribas-renouvellement-partenariat-histoire-2032'
for y in [2026,2027]:
    sponsor(R[y],'BNP Paribas','Socio histórico; renovación desde 2027',u,'Anuncio del 24 mayo 2026',None,'https://group.bnpparibas/')
fact(R[2027],'sponsor_renewal','Acuerdo prolongado desde 2027 durante al menos cinco años',u,'Introducción','La renovación está anunciada; no se registra como ingreso cobrado ni activación realizada.')

OUT.mkdir(parents=True,exist_ok=True)
retrieval_path=OUT/'nontech-retrieval.json'
if retrieval_path.exists():
    access_by_url={s['url']:s['best_access'] for s in json.loads(retrieval_path.read_text())['used_sources']}
    for e in events:
        e['source_access']=access_by_url.get(e['source_url'],e['source_access'])
        e['validation_status']='primary_body_verified' if e['source_access']=='web_open' else 'provisional_primary_index_only'
        for group in ('facts','sponsors','metrics'):
            for f in e[group]:
                f['source_access']=access_by_url.get(f['source_url'],'search_index')
                # Se abrió parte del PDF, pero el pasaje exacto sólo quedó disponible en el índice.
                if f['source_url'].endswith('TI571-Interactif_compressed.pdf') or 'ELETRONUCLEAR' in f['source_url'].upper() or f['source_url'].endswith('CCR_RI2023.pdf'):
                    f['source_access']='search_index'
                f['evidence_status']='primary_body_verified' if f['source_access']=='web_open' else 'provisional_primary_index_only'
        for m in e['metrics']:
            if m['unit'] in ('asistencias','visitas de stand','visitas de activación'):
                m['method']+=' No se interpreta como personas únicas ni se suma entre eventos.'
(OUT/'nontech-facts.json').write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'events':len(events),'facts':sum(len(x['facts']) for x in events),'sponsor_relations':sum(len(x['sponsors']) for x in events),'metrics':sum(len(x['metrics']) for x in events)},ensure_ascii=False))

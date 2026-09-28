# Lote de eventos diversos — Fase 1

Corte de consulta: **2026-09-28**. Ventana de eventos históricos: **2021-09-28 a 2026-09-28**, más futuros anunciados explícitamente.

El lote entrega **42 ediciones/programas en 38 fuentes primarias abiertas**, con 81 relaciones entre organizaciones y ediciones, 12 métricas y 18 tarifas publicadas. Es una adquisición exploratoria para probar el modelo de evidencia; no es un censo ni demuestra cobertura suficiente de ningún mercado. No se modificó la aplicación.

Archivo de datos: [diverse-events.json](../batches/diverse-events.json). Contiene hechos, fuentes por campo, roles, límites de acceso, ocho candidatos pendientes y la revisión muestral.

## Cobertura y unidad de registro

| Medida | Resultado |
|---|---:|
| Ediciones / programas | 42 |
| Fuentes incorporadas con lectura | 38 |
| Convocatorias históricas, sin prueba de celebración | 26 |
| Anunciados futuros o cursos cuyo periodo cruza el corte | 5 |
| Realizados según relato primario | 10 |
| Cancelados según comunicado oficial | 1 |
| Registros con fecha conocida solo al año | 4 |
| Registros sin ciudad asignada | 9 |
| Registros sin relación explícita de organizador | 5 |
| Ediciones con algún sponsor identificado | 9 |
| Direcciones públicas conservadas con fuente | 10 |
| Revisión manual estratificada de cierre | 8 de 42 |

Hay 16 nombres de ciudad explícitos y fuentes en español, portugués, francés e inglés. Como **agrupación geográfica derivada del investigador**, se cubren África, Asia, Europa, Norteamérica, Sudamérica y Oceanía. Esta clasificación no completa los países faltantes en los registros. Se incluyen comunidades tecnológicas, retail, alumni, actividades literarias, artes, formación, bienestar y deporte; el lote no presupone SF ni B2B.

La unidad no es siempre comparable: hay un festival, actividades hijas, un curso de varias sesiones, una carrera y una categoría competitiva. `parent_edition_key`, `series_name` y las notas preservan esas relaciones cuando se conocen. Los dos talleres de Honduras tienen fechas y ciudades distintas; las dos sesiones de Circular Library comparten enlace Partiful. Una deduplicación por URL exclusivamente fusionaría registros distintos. El curso ECODOC de diez sesiones se guarda como una edición, no como diez eventos.

**Límite:** cuatro programas ACMI solo tienen año; dos sesiones de Circular Library imprimen mes/día y su año se toma del contexto de publicación. En estas últimas, `date_basis.year_is_inferred=true` distingue esa asignación de una fecha completa literal. No se reconstruyeron ediciones por periodicidad.

## Acceso a plataformas: leído frente a enlazado

Las tres fichas Luma se abrieron y leyeron: [Polkadot Nairobi](https://luma.com/n392htif), [Epoch Tour](https://luma.com/epoch) y [Retail Lab](https://luma.com/rw5es9nz?locale=pt). No se recuperaron direcciones reservadas a inscritos ni listas privadas.

**Cinco URLs Partiful distintas se observaron en fuentes primarias abiertas. Sus páginas Partiful no se abrieron en este lote.** Sostienen seis registros porque las sesiones del 22 y 30 de junio de Circular Library comparten enlace.

| Fuente primaria leída | Evento | Enlace observado, destino no validado |
|---|---|---|
| [REDFOOT Productions](https://www.redfoot.productions/events) | Candy Land | [Partiful](https://partiful.com/e/vQdEZ4uHPQmaOAYSBDZp) |
| [Wharton Club NCR](https://www.whartonclubncr.org/pub_outside_penn_20230727) | Pub Outside Penn | [Partiful](https://partiful.com/e/YMto1O8nSh6w0IFrfoS3) |
| [Saint Augustine’s University](https://www.st-aug.edu/event/student-entrepreneurship-passport-program-business-plans-and-the-wonders-of-ai/) | Business Plans and the Wonders of AI | [Partiful](https://partiful.com/e/ukFpgmlahnNC4IwkEy1e) |
| [Circular Library](https://circular-library.com/blogs/news/diy-upcycling-workshop) | DIY Upcycling Workshop | [Partiful](https://partiful.com/e/PMhSYKo12OPh0uqjLolb) |
| [Tezos](https://tezos.com/media-center/2025/howl-camera/) | HOWL.camera Launch Event | [Partiful](https://partiful.com/e/uM8k02XeZRgsN5jEHyfR) |

También quedaron como **enlaces observados**, sin validar contenido del destino, [Eventbrite para SOLUTIONS with/in/sight](https://withinsight-may-2023.eventbrite.com) desde el [boletín HST](https://hst.mit.edu/news-events/twihst/volume-24-number-32) y [Sympla](https://www.sympla.com.br/evento/linguagem-memoria-e-patrimonios-comuns/3176621) desde la [convocatoria municipal de São Paulo](https://prefeitura.sp.gov.br/web/cultura/w/s%C3%A3o-paulo-recebe-workshop-internacional-aberto-ao-p%C3%BAblico-na-biblioteca-m%C3%A1rio-de-andrade). Cada registro incluye `platform_access`.

## Qué aporta evidencia concreta

- **Cancelación y resultado:** la [crónica oficial de Cape Town 2025](https://capetownmarathon.com/cancellation-timeline-of-the-2025-sanlam-cape-town-marathon/) documenta cancelación el 19 de octubre y unos 24.000 inscritos. Eso no acredita 24.000 asistentes ni finishers. El estado es `cancelled`; no se borra el evento.
- **Relación comercial temporal:** la [renovación de Sanlam](https://capetownmarathon.com/sanlam-renews-title-sponsorship/) identifica patrocinio titular hasta 2030 y a Faces como operador. No se conocen desembolso, tarifa contratada ni ROI del sponsor. Las 27.000 inscripciones previstas para 2026 conservan `announced`, aunque exista después una crónica de la carrera.
- **Activación concreta:** [Sunset Yoga](https://www.nationalgallery.sg/sg/en/festivals/Slow-Saturday/Sunset-Yoga-and-Sound-Bath.html) anuncia muestras Hydr-Aid de Moom Health. Se guarda como promesa de un partner; no como entrega cumplida ni patrocinio monetario. Los logos generales del museo no se heredan al taller.
- **Métricas con semántica:** [Polkadot Nairobi](https://luma.com/n392htif) muestra 148 en una etiqueta Went; se registra como contador de interfaz, sin conocer su método. La [crónica 2024 de Cape Town](https://capetownmarathon.com/glenrose-xaba-shatters-records/) describe corredores en la salida; tampoco son inscritos o espectadores. Ninguna cifra se convierte en «éxito» por sí sola.
- **Financiación de proyecto frente a evento:** el [anuncio de HOWL.camera](https://tezos.com/media-center/2025/howl-camera/) atribuye financiación del proyecto a Tezos Foundation. No alcanza para agregar un patrocinio monetario del lanzamiento. La distinción evita inflar el historial comercial de un organizador.

**Inferencia del investigador:** estos ejemplos justifican separar participación corporativa, presupuesto, activaciones prometidas, realización del evento y resultados. El lote no demuestra todavía que ese historial permita predecir retorno ni recomendar a un comprador concreto.

## Revisión estratificada de ocho ediciones

Se reabrieron ocho fuentes para contrastar datos ya guardados, cubriendo cuatro idiomas, seis agrupaciones regionales y distintos estados. Es una selección intencional, no aleatoria ni independiente del emisor. **No se declara auditado el resto del lote.**

| Edición | Campos contrastados | Resultado y correcciones |
|---|---|---|
| [Polkadot Nairobi 2025](https://luma.com/n392htif) | Título, 18/01/2025, organizador, sede, Nairobi/Kenya, contador | Coinciden. Se conservó la dirección pública del venue y el límite metodológico de Went. No se copiaron nombres de asistentes. |
| [Retail Lab 2025](https://luma.com/rw5es9nz?locale=pt) | Fecha, São Paulo/Itaim Bibi, Stamina, sponsors/apoyos, R$1.499, promesa de audiencia | **Corrección:** se retiró `country=Brazil`, porque la ficha leída no escribe país. Dirección exacta sigue pendiente; sponsors y apoyos están separados. |
| [Cape Town Marathon 2025](https://capetownmarathon.com/cancellation-timeline-of-the-2025-sanlam-cape-town-marathon/) | Fecha, cancelación, Green Point, inscritos y rol titular Sanlam | Coinciden. La fuente declara que Sanlam no tomó la decisión de cancelación. No se transforma cancelación en baja asistencia. |
| [Alliance Café 2022](https://www.alliancefr.org/event/alliance-cafe-bienvenue-a-paris-03-02-2022-03-02-2022-941/register) | 03/02/2022, Paris/France, dirección, organizador, gratuidad, acceso | Se ajustó el título al de la ficha y se preservó EUR porque publica 0.0 €. Se añadió la restricción estudiantes/alumni. Las 30 plazas restantes no se usan como aforo. |
| [We Will Slam You With Our Wings 2022](https://www.acmi.net.au/education/projects-partnerships/we-will-slam-you/) | Año, 11 de octubre, apertura, Fed Square Atrium, Melbourne y roles de apoyo | Coinciden. La ciudad está en el relato; país no añadido. Apoyo a la obra no se traduce en importe del acto. |
| [Circular Library, sesión 22/06](https://circular-library.com/blogs/news/diy-upcycling-workshop) | Mes/día, fecha de publicación, $50, partner y enlace Partiful | **Aclaración:** el año 2024 depende del contexto de publicación, ahora marcado como derivado; también se aplicó a la sesión hermana. Dirección del comercio se guarda solo como contexto, no sede confirmada. |
| [Sunset Yoga 2026](https://www.nationalgallery.sg/sg/en/festivals/Slow-Saturday/Sunset-Yoga-and-Sound-Bath.html) | 03/10/2026, venue, tarifas $25/$20, Moom Health, muestras | Coinciden. Futuro anunciado; moneda pendiente, entrega no observada. Dirección de la galería conservada con fuente. |
| [IBERESCENA Tegucigalpa 2025](https://ccetegucigalpa.aecid.es/-/taller-de-formulaci%C3%B3n-de-proyectos-para-iberescena) | Ciudad, sede, 23–24/06, año de la ficha y organizaciones | Coinciden con programación por ciudad. Se conserva contradicción: una sección nombra convocatoria 2023–2024 y la ficha fecha 2025. El cupo global no se duplica en las dos sedes. |

La relectura también conservó diez direcciones explícitas obtenidas en la adquisición. No hay geocodificación ni coordenadas fabricadas. La única dirección comercial no confirmada como venue está aislada en `organizer_location_context`.

## Incertidumbres, acceso y reutilización

- Los registros con fecha pasada y solo convocatoria quedan como `historical_listing`. Una etiqueta de evento pasado o inscripción cerrada no acredita celebración.
- En fuentes institucionales, una dirección general no necesariamente es la sede del evento. Por eso quedan nueve ciudades pendientes/virtuales y múltiples países nulos. Las clasificaciones de formato y sector llevan `classification_origin=researcher_derived_from_description`.
- La página [Temple](https://www.nationalgallery.sg/sg/en/exhibitions/Temple-by-Tuan-Andrew-Nguyen-.html) publica dos comienzos distintos; esa exposición no se incorporó. El taller enlazado tiene una fecha consistente y sí se incorporó.
- El [programa IBERESCENA](https://ccetegucigalpa.aecid.es/-/taller-de-formulaci%C3%B3n-de-proyectos-para-iberescena) contiene referencias de convocatoria de años diferentes. El intervalo general hasta el 27 no se atribuye entero a cada ciudad.
- SESC devolvió 403; MALBA y Stanford, 429; una página MIT pidió login. Se registraron los resultados y no se eludieron controles. Otros fallos fueron cache misses del lector, que no equivalen a una prohibición del editor ni prueban que la URL haya desaparecido. No se adquirieron ediciones únicamente desde snippets.
- `attempts` tiene 63 resultados consolidados de lectura/acceso. **No es un contador de solicitudes HTTP**, porque resume búsquedas, aperturas y casos repetidos. Incluye el fallo de captura de un PDF cuyo texto sí pudo leerse.
- Se guardan metadatos y hechos breves. No se descargaron fotografías, listas de asistentes, perfiles individuales ni textos completos para redistribuir. Las fuentes quedan con reutilización pendiente de revisión; la [página municipal de Buenos Aires](https://buenosaires.gob.ar/semanadelarte/semana-del-arte-2021) muestra un aviso CC 2.5 Argentina, sin extenderlo automáticamente a cada material enlazado.
- `checked_at` indica fecha de lectura del proveedor web. No demuestra que el editor haya actualizado la página ese día, ni equivale a una captura forense reproducible de todo el HTML.

## Inventario adquirido

| Clave | Fecha publicada para la edición | Ciudad | Estado | Procedencia principal |
|---|---|---|---|---|
| polkadot-nairobi-2025-01-18 | 2025-01-18 | Nairobi | historical_listing | [Fuente](https://luma.com/n392htif) |
| epoch-tour-sao-paulo-2025 | 2025-08-08 → 2025-08-10 | São Paulo | historical_listing | [Fuente](https://luma.com/epoch) |
| retail-lab-stamina-2025-10-16 | 2025-10-16 | São Paulo | historical_listing | [Fuente](https://luma.com/rw5es9nz?locale=pt) |
| patrimonio-comum-sao-paulo-2025-10-24 | 2025-10-24 | São Paulo | historical_listing | [Fuente](https://prefeitura.sp.gov.br/web/cultura/w/s%C3%A3o-paulo-recebe-workshop-internacional-aberto-ao-p%C3%BAblico-na-biblioteca-m%C3%A1rio-de-andrade) |
| off-world-zero-2025-11-01 | 2025-11-01 | Singapore | historical_listing | [Fuente](https://www.nationalgallery.sg/sg/en/workshops/Off-World--Painting-Workshop-by-ZERO.html) |
| taller-cccb-barcelona-2024-11 | 2024-11-19 → 2024-11-23 | Barcelona | historical_listing | [Fuente](https://www.cccb.org/es/w/actividades/taller-en-el-cccb-barcelona) |
| cccb-siglo-xviii-2026-2027 | 2026-09-29 → 2027-02-23 | Barcelona | announced | [Fuente](https://www.cccb.org/es/w/actividades/el-siglo-xviii) |
| cccb-divina-comedia-paraiso-2026 | 2026-04-13 → 2026-12-14 | Barcelona | announced | [Fuente](https://www.cccb.org/es/w/actividades/la-divina-comedia-iii-paraiso) |
| cccb-leviatan-2026 | 2026-09-17 → 2026-12-17 | Barcelona | announced | [Fuente](https://www.cccb.org/es/w/actividades/leviatan-de-thomas-hobbes) |
| cape-town-marathon-2025 | 2025-10-19 | Cape Town | cancelled | [Fuente](https://capetownmarathon.com/cancellation-timeline-of-the-2025-sanlam-cape-town-marathon/) |
| cape-town-marathon-2026 | 2026-05-24 | Cape Town | reported_held | [Fuente](https://capetownmarathon.com/most-successful-sanlam-cape-town-marathon-sets-scene-for-majors-status/) |
| cape-town-marathon-2027 | 2027-05-23 | Cape Town | announced | [Fuente](https://capetownmarathon.com/africas1stmajor/) |
| alliance-paris-cine-pierrot-2022 | 2022-01-20 | Paris | historical_listing | [Fuente](https://www.alliancefr.org/event/cine-club-pierrot-le-fou-20-01-2022-20-01-2022-272/register) |
| alliance-paris-litteraire-hassaine-2022 | 2022-01-27 | Paris | historical_listing | [Fuente](https://www.alliancefr.org/event/rencontre-litteraire-en-francais-dans-le-texte-lilia-hassaine-27-01-2022-27-01-2022-273/register) |
| alliance-paris-cafe-2022-02-03 | 2022-02-03 | Paris | historical_listing | [Fuente](https://www.alliancefr.org/event/alliance-cafe-bienvenue-a-paris-03-02-2022-03-02-2022-941/register) |
| hst-graduation-reception-2023 | 2023-05-24 | Cambridge | historical_listing | [Fuente](https://hst.mit.edu/news-events/twihst/volume-24-number-32) |
| mit-tll-metacognition-2023 | 2023-05-10 | Pendiente / virtual | historical_listing | [Fuente](https://hst.mit.edu/news-events/twihst/volume-24-number-32) |
| mit-solutions-algorithms-views-2023 | 2023-05-04 | Cambridge | historical_listing | [Fuente](https://hst.mit.edu/news-events/twihst/volume-24-number-32) |
| mit-patent-law-essentials-2023 | 2023-01-27 | Pendiente / virtual | historical_listing | [Fuente](https://calendar.mit.edu/event/patent_law_essentials_what_scientists_engineers_entrepreneurs_need_to_know_1544) |
| redfoot-candy-land-2025 | 2025-12-19 | Salt Lake City | historical_listing | [Fuente](https://www.redfoot.productions/events) |
| wharton-ncr-pub-outside-penn-2023 | 2023-07-27 | Washington | historical_listing | [Fuente](https://www.whartonclubncr.org/pub_outside_penn_20230727) |
| sau-business-plans-ai-2023 | 2023-03-30 | Raleigh | historical_listing | [Fuente](https://www.st-aug.edu/event/student-entrepreneurship-passport-program-business-plans-and-the-wonders-of-ai/) |
| circular-library-patchwork-2024-06-22 | 2024-06-22 | Pendiente / virtual | historical_listing | [Fuente](https://circular-library.com/blogs/news/diy-upcycling-workshop) |
| circular-library-patchwork-2024-06-30 | 2024-06-30 | Pendiente / virtual | historical_listing | [Fuente](https://circular-library.com/blogs/news/diy-upcycling-workshop) |
| howl-camera-launch-2025 | 2025-02-19 | Los Angeles | historical_listing | [Fuente](https://tezos.com/media-center/2025/howl-camera/) |
| acmi-young-filmmakers-2023 | 2023 | Pendiente / virtual | reported_held | [Fuente](https://www.acmi.net.au/education/projects-partnerships/) |
| acmi-young-filmmakers-2024 | 2024 | Pendiente / virtual | reported_held | [Fuente](https://www.acmi.net.au/education/projects-partnerships/lgbtqia-young-filmmakers/) |
| acmi-young-filmmakers-2025 | 2025 | Pendiente / virtual | historical_listing | [Fuente](https://www.acmi.net.au/education/projects-partnerships/lgbtqia-young-filmmakers/) |
| acmi-wings-launch-2022 | 2022-10-11 | Melbourne | reported_held | [Fuente](https://www.acmi.net.au/education/projects-partnerships/we-will-slam-you/) |
| acmi-ai-game-design-2024 | 2024 | Pendiente / virtual | reported_held | [Fuente](https://www.acmi.net.au/education/projects-partnerships/ai-hackathon/) |
| acmi-ai-game-design-2025 | 2025-11-10 | Pendiente / virtual | historical_listing | [Fuente](https://www.acmi.net.au/education/projects-partnerships/ai-hackathon/) |
| cape-town-marathon-2021 | 2021-10-17 | Cape Town | reported_held | [Fuente](https://capetownmarathon.com/sanlam-cape-town-marathon-marks-return-to-mass-participation-events/) |
| cape-town-marathon-2022 | 2022-10-16 | Cape Town | reported_held | [Fuente](https://capetownmarathon.com/sanlam-cape-town-marathons-revised-route-gets-go-ahead/) |
| cape-town-wheelchair-marathon-2023 | 2023-10-15 | Cape Town | reported_held | [Fuente](https://capetownmarathon.com/schipper-and-rainbow-cooper-victorious-in-sanlam-cape-town-marathon-wheelchair-races/) |
| cape-town-marathon-2024 | 2024-10-20 | Cape Town | reported_held | [Fuente](https://capetownmarathon.com/glenrose-xaba-shatters-records/) |
| buenos-aires-semana-arte-2021 | 2021-10-31 → 2021-11-07 | Buenos Aires | reported_held | [Fuente](https://buenosaires.gob.ar/semanadelarte/semana-del-arte-2021) |
| quincho-polar-2021 | 2021-11-01 | Buenos Aires | historical_listing | [Fuente](https://buenosaires.gob.ar/sites/default/files/media/document/2022/08/17/694513bc7addb3de09142fe05a5f2d1783002955.pdf) |
| quincho-residentes-2021 | 2021-11-02 | Buenos Aires | historical_listing | [Fuente](https://buenosaires.gob.ar/sites/default/files/media/document/2022/08/17/694513bc7addb3de09142fe05a5f2d1783002955.pdf) |
| national-gallery-sunset-yoga-2026 | 2026-10-03 | Singapore | announced | [Fuente](https://www.nationalgallery.sg/sg/en/festivals/Slow-Saturday/Sunset-Yoga-and-Sound-Bath.html) |
| cce-lima-ecodoc-2025 | 2025-11-10 → 2025-11-21 | Lima | historical_listing | [Fuente](https://ccelima.aecid.es/-/ecodoc-taller-de-documentales) |
| iberescena-tegucigalpa-2025 | 2025-06-23 → 2025-06-24 | Tegucigalpa | historical_listing | [Fuente](https://ccetegucigalpa.aecid.es/-/taller-de-formulaci%C3%B3n-de-proyectos-para-iberescena) |
| iberescena-san-pedro-sula-2025 | 2025-06-25 → 2025-06-26 | San Pedro Sula | historical_listing | [Fuente](https://ccetegucigalpa.aecid.es/-/taller-de-formulaci%C3%B3n-de-proyectos-para-iberescena) |

## Cierre de este lote

Se validó el JSON con Python: 42 claves únicas, 38 fuentes sin duplicados, referencias de campos/organizaciones/métricas/precios resueltas, rangos de fechas coherentes, ausencia de estados realizados con fecha futura y ocho claves de muestra existentes. Esta comprobación estructural no reemplaza la verificación factual ni revisa las 34 ediciones fuera de la muestra.

Se detuvo la expansión para integrar y validar el conjunto de la fase. Los ocho candidatos de `queue` son continuación posible, no registros adquiridos. La próxima integración debe conservar tipos de métricas, fechas parciales, países nulos, enlaces no abiertos y relaciones entre actividades; no debe asignar un score de confianza único a partir del volumen de campos llenos.

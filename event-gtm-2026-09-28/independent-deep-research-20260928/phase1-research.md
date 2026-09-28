# Event GTM — síntesis de Fase 1

**Corte de datos: 28 de septiembre de 2026.** Esta ejecución reúne **688 ediciones únicas en el dataset** —650 de fecha pasada y 38 futuras o en curso—, **101 series**, **288 organizaciones**, **320 relaciones etiquetadas como sponsor y 21 sponsor/partner ambiguas**, **diez artículos originales registrados en diez grupos de deduplicación** y **160 fuentes registradas/evaluadas**. Hay fechas de 2021 a 2027 y 72 países o territorios identificados; 127 ediciones carecen de país. No son 160 fuentes íntegramente extraídas: 82 llevan `facts_extracted`; las demás incluyen documentación, lecturas, contenido indexado y fallos. El núcleo tiene título y fecha inicial en el 100 % de las filas, zona horaria en el 28,63 % y país en el 81,54 %. Estos porcentajes describen la muestra, no la cobertura del mundo. [Manifiesto](run_manifest.json), [cobertura](coverage.csv), [fuentes](data/observed/sources.csv), [QA estructural](qa-results.json).

**Recomendación: acotar y validar mediante un servicio manual asistido antes de construir la plataforma completa.** El histórico extraído permite investigar decisiones concretas, pero su diversidad y enriquecimiento no sostienen todavía un recomendador comercial general ni una ventaja extraordinaria. La combinación de prompt, descubrimiento y sponsors ya aparece en ofertas competidoras; la oportunidad por demostrar es resolver mejor una decisión de un comprador delimitado con evidencia y datos autorizados. Los resultados de las comparaciones ejecutadas, sus baselines y limitaciones corresponden a [validation_report.md](validation_report.md); esta síntesis no inventa precisión, mejora ni resultados comerciales pendientes.

## Parámetros confirmados y pendientes

| Parámetro | Estado de esta ejecución |
|---|---|
| Ventana histórica | Desde **2021-09-28**, inclusive, hasta **2026-09-28**, exclusive, según manifiesto. Son 60 meses; 2021 es parcial. |
| Horizonte futuro | Ediciones anunciadas expresamente recuperadas, sin generar periodicidades. La fecha final máxima observada es **2027-11-30**; no es un horizonte comercial elegido. |
| Geografía | Pendiente de decisión. Muestra internacional exploratoria por fuentes accesibles, no censo territorial. |
| Sectores y formatos | Hipótesis B2B pendiente. Tecnología domina; se añadieron cultura, mercado editorial, arte y deporte. Conferencias, comunidades, talleres, ferias, festivales, torneos y otros formatos permanecen diferenciados. |
| Idiomas | Investigación en inglés, español, portugués y francés; alguna evidencia en italiano. Los títulos de calendarios contienen otros idiomas, sin equivaler a búsqueda exhaustiva en ellos. |
| Perfil empresarial | No se recibió brief, URL de empresa cliente, cuentas objetivo, presupuesto ni ubicación elegidos. Las propuestas son ilustrativas. |
| Presupuesto/acceso | Cero adquisiciones pagadas contratadas; presupuesto futuro pendiente. Coste de herramientas y ejecución no observado. Sin cuentas nuevas, compras, contacto comercial ni invitados privados. |
| Herramientas utilizadas | Navegación de investigación, lectura de fuentes públicas, dos exportaciones iCal publicadas por Python.org, scripts locales, CSV/JSON y SQLite. No se probó una API autenticada de proveedor. |
| Límite de fase | Se cierra investigación/extracción exploratoria de Fase 1 con pendientes explícitos. Tarifas actuales de infraestructura, comparación económica de mapas/modelos y ejecución de Fase 2 quedan fuera de este informe. |

Los parámetros responden al [prompt maestro](spec/prompt-maestro.md) y al [manifiesto](run_manifest.json). La recomendación de segmento siguiente es una hipótesis propuesta, no una decisión atribuida al usuario.

## Qué demuestran los datos y qué falta

Dos feeds publicados por [Python.org](https://www.python.org/events/python-events/) aportan **652 ediciones** del corpus, el 94,77 %; **657 ediciones (95,49 %) están clasificadas como tecnología**. Las 101 series no agrupan todo el corpus: 338 ediciones tienen `series_id`. De las 688, 668 conservan estado `announced` y solo 20 `reported_held`. Tener fecha pasada o un `STATUS:CONFIRMED` en iCal no prueba celebración efectiva. [Ediciones](data/observed/event_editions.csv), [cobertura](coverage.csv).

| Dimensión | Resultado del corte | Interpretación |
|---|---|---|
| Año de inicio | 2021: 24; 2022: 103; 2023: 125; 2024: 167; 2025: 159; 2026: 99; 2027: 11 | La distribución refleja recuperación desigual, no evolución de demanda. |
| Fechas y lugar | Fin: 687/688; texto de ubicación: 672/688; país: 561/688; zona horaria: 197/688 | Un lugar escrito no equivale a coordenadas verificadas ni recinto reservado. Solo tres registros enlazan a `venue_id`. |
| Sponsors | 320 roles sponsor, pago no verificado; 21 roles ambiguos separados; evidencia de sponsors en 16 ediciones; 127 pares de presencia repetida derivados | Muchas relaciones concentradas no resuelven la mayoría de los eventos. No sumarlas como 341 acuerdos confirmados; repetición observada no equivale a renovación contractual. |
| Audiencia y resultados | Audiencia en cinco ediciones; métricas reportadas en 14 | No hay cobertura amplia de ICP real, leads, reuniones o ingresos atribuibles. |
| Precios y oferta | Precios de entradas en cinco ediciones; 16 paquetes en dos ediciones; cuatro tarifas históricas de hotel | El precio de entrada no representa el coste total de asistir ni un paquete histórico acredita disponibilidad. |
| Noticias | Diez artículos, diez grupos de deduplicación y dos señales empresariales | Es una prueba limitada de vinculación, no un servicio general de noticias ni corroboración independiente. |
| Evidencia | 21.570 afirmaciones: 16.859 `published_statement`, 4.688 `deterministic_derivation` y 18 `primary_index_extract` | El número de afirmaciones incluye normalización/derivaciones; no son 21.570 hechos corroborados de forma independiente. |

Fuentes de las cifras: [cobertura](coverage.csv), [roles](data/observed/event_company_roles.csv), [afirmaciones](data/observed/assertions.csv), [paquetes](data/observed/sponsorship_packages.csv), [artículos](data/observed/news_articles.csv). Las comprobaciones estructurales del [QA](qa-results.json) pasan; eso no convierte contenido indexado o clasificaciones curatoriales en evidencia primaria leída.

El [benchmark funcional](validation_report.md) ya ejecutado contiene **tres escenarios sintéticos con 31, 2 y 2 candidatos**, sin etiquetas humanas. Compara palabras clave, similitud léxica TF-IDF y una variante con historial, sobre los mismos IDs. Los cambios de ranking no prueban mejora. La comparación de ventana encuentra **118 ediciones/1 rol sponsor en 12 meses frente a 650/319 en 60 meses pasados**, dominada por el enriquecimiento intencional de PyCon US 2022–2025. No demuestra que cinco años predigan mejor; tampoco constituye un backtest temporal válido. El protocolo y los resultados completos permanecen en el informe de validación.

El corpus **conserva incertidumbre**, incluida la evidencia de fechas de seis ediciones Flip recuperada solo del índice, el candidato Stanford también indexado y EASA sustentado en el agregador 10times. Los campos deben revisarse por su fuente y clase de evidencia antes de entrar en recomendaciones. Los índices sirven para localizar fuentes; una fila válida estructuralmente puede seguir siendo provisional. [Lote no tecnológico](notes/phase1-nontech.md), [inventario complementario](phase1-source-inventory.md).

### Hallazgos que sí cambian decisiones

- **El calendario necesita correcciones por edición.** PyCon Ireland 2026 conserva el cambio documentado a 21 de noviembre y recinto pendiente; un listado antiguo mostraba 17 de octubre. Otro conflicto iCal de fin exclusivo se corrigió con evidencia del organizador. Una recomendación puede equivocarse aunque título, país y temática coincidan. [Conflictos](data/observed/data_conflicts.csv), [anuncio del organizador](https://2026.pycon.ie/blog/venue-change/).
- **El historial de identidad evita falsos movimientos.** EdgeDB pasó a Gel; el anuncio posterior dice que Gel Data Inc. cierra y su equipo se incorpora a Vercel. Sirve para bloquear una recomendación de Gel como sponsor independiente hasta verificar su situación, sin transferir su historial automáticamente a Vercel ni reducir el hecho a una adquisición. [Señales](data/observed/company_signals.csv), [anuncio Gel](https://www.geldata.com/blog/gel-joins-vercel).
- **Una relación útil necesita rol, año y oferta.** Los prospectos de [PyCon ES 2023](https://2023.es.pycon.org/theme/assets/files/pycones2023_patrocinios.pdf) y [PyCon AU 2025](https://2025.pycon.org.au/files/Sponsor%20PyCon%20AU%202025%20-%20Prospectus%20v3.pdf) permiten vincular beneficios, precio y edición. No acreditan importes pagados, renovación ni plazas actuales. [Paquetes](data/observed/sponsorship_packages.csv).
- **Fuera de tecnología hay señales accionables, con otra semántica.** FIL distingue público general y profesionales; Motiva describe activaciones de Flip; Renault documenta producto y logística en Roland-Garros. Es evidencia de audiencia y ejecución, sin demostrar intención de financiar otro evento. La muestra cultural/deportiva aporta 24 ediciones de cuatro series y conserva sus limitaciones de acceso. [Informe y fuentes por afirmación](notes/phase1-nontech.md).
- **Resultados parecidos no son intercambiables.** ISE distingue asistentes, registros y visitas, y su PDF aclara que el total ampliado incluye el día anterior. Roland-Garros conserva dos cifras oficiales con distinta publicación, sin asumir que una corrige formalmente la otra. Normalizar denominador y periodo tiene valor; usar el número mayor como señal de calidad no. [Prueba ISE](phase1-source-inventory.md), [prueba Roland-Garros](notes/phase1-nontech.md).

### Cobertura de las familias solicitadas

| Familia | Evidencia disponible | Vacío / causa |
|---|---|---|
| Luma, Eventbrite, Partiful | Documentación, términos y enlaces/páginas concretos; Luma y organizadores aportan hechos | Listados externos en el CSV no significan lectura de todas las páginas de la plataforma. Histórico global y licencia comercial no demostrados. |
| Complementarias | Lecturas puntuales de Meetup, 10times, Sessionize, pretix, Ticket Tailor y Humanitix; API DICE documentada | DICE bloqueado; muestra mínima, APIs propias y permisos condicionados. |
| Organizadores y series | Python/PyCon y cuatro series no tecnológicas, anuncios y recaps | Escasa profundidad fuera de esos grupos; pequeñas organizaciones e idiomas locales infrarrepresentados. |
| Sponsors/expositores | Roles, prospectos y comunicados corporativos | Objetivos actuales, presupuesto disponible, exclusividad y renovación contractual normalmente desconocidos. |
| Recintos/instituciones | Fira/ISE, Stanford y tres recintos estructurados | Cámaras, calendarios municipales, capacidad y disponibilidad casi sin cobertura; falta delimitación geográfica. |
| Comunidades/distribución | Calendarios de comunidades y newsletter pública | Cero filas en canales y métricas de distribución: no se midió alcance accesible ni capacidad de convocatoria. |
| Prensa independiente | Sin corpus estructurado representativo | Predominan fuentes de parte. Falta triangulación local/sectorial; tiempo y ámbito pendientes. |
| Comunicados/anuncios | Gel, organizadores y sponsors | No se recorrieron exhaustivamente PR Newswire, Business Wire ni equivalentes regionales. |
| Publicaciones profesionales | Blogs y newsletter con referencias concretas | LinkedIn/redes no se extrajeron masivamente; no se obtuvo una red profesional histórica. |
| Activos del evento | PDFs de paquetes/resultados y algunos programas | Dos sesiones y dos activos estructurados; mapas de stands, recordings y decks sin cobertura amplia. |
| Archivos históricos | Intento real Wayback registrado | Cero capturas recuperadas; 429. No hay prueba temporal general de qué se sabía antes del evento. |
| Señales empresariales | Dos señales estructuradas de Gel, más hechos en notas no tecnológicas | Sin flujo recurrente ni precisión/recall medidos; noticia no equivale a presupuesto. |
| Contexto de mercado | Contexto institucional puntual | Cero filas en `market_context`; estadísticas, festivos y conflictos regionales pendientes del territorio. |

El estado se apoya en el [manifiesto por tabla](run_manifest.json), el [inventario de fuentes](phase1-source-inventory.md) y el [informe no tecnológico](notes/phase1-nontech.md). Hay investigación competitiva en Markdown aunque `competitors.csv` permanezca vacío en este corte; no se presenta esa tabla como entregada con diez filas. Tampoco están poblados perfiles actuales de sponsors, datos de clientes ni feedback real.

## Acceso sostenible y competencia

La [matriz competitiva detallada](phase1-market-access.md) evalúa los diez proveedores solicitados y separa funciones documentadas, marketing, roadmap y desconocidos. Los cinco solapamientos más cercanos son Vendelux para descubrir eventos B2B; Pana para planificación de Event GTM; Identyca para inteligencia del organizador; SponsorUnited para patrocinio; y EventoPulse para señales/alertas. Es una selección funcional, no una clasificación de calidad. Partable y Acirio también compiten con el flujo de búsqueda de sponsors; Kuration con extracción/enriquecimiento; HuntEx con expositores; run.events con operación y datos del evento propio.

No existe evidencia para afirmar que un prompt, un mapa o una shortlist sean una barrera difícil de copiar. Una posible ventaja dependería de **permisos y datos propios útiles, resolución histórica de entidades, pruebas de calidad y resultados consentidos que mejoren decisiones fuera de la muestra de desarrollo**. Ninguno se sustituye por contar más tablas o publicar scores.

El acceso es una restricción del producto. Luma API requiere Plus y permisos por calendario; el MCP puede descubrir próximos eventos públicos con una cuenta sin Plus, con otro alcance. Eventbrite retiró su búsqueda general antigua; Partiful y 10times restringen extracción/uso comercial; Meetup condiciona el uso comercial de API; Humanitix limita retención de eventos pasados salvo permiso explícito pertinente. No se resolvieron licencias por tener páginas públicas. [Documentación y términos enlazados](phase1-market-access.md), [complementarias](phase1-source-inventory.md).

| Estrategia | Ventaja propuesta | Coste/riesgo pendiente | Decisión de Fase 1 |
|---|---|---|---|
| Construir fuentes propias | Trazabilidad, campos específicos, control del modelo y correcciones | Adquisición, revisión, permisos y mantenimiento; historia pública incompleta | Construir la capa de evidencia y el flujo de trabajo acotado si supera la validación. |
| Comprar/licenciar datos | Posible amplitud, normalización y actualización | Precio contractual, exportación, retención, redistribución, mínimos y calidad aún no comprobados | No comprar por cifras de marketing. Exigir muestra del mismo universo y derechos por uso. |
| Híbrido | Datos autorizados del organizador + fuentes públicas permitidas + licencia para un vacío concreto | Mantener procedencia y vencimiento de derechos por campo | **Opción propuesta para probar**; no se ha firmado ni integrado proveedor alguno. |

## Tres segmentos y elección propuesta

Todas las descripciones de dolor, proceso, horas, comprador y disposición a pagar son **hipótesis que requieren entrevistas**, no hallazgos de clientes reales.

| Segmento | Trabajo y proceso supuesto | Comprador/aprobador y obstáculos | Capacidad de validar |
|---|---|---|---|
| Equipos pequeños de field/demand marketing de software B2B | Elegir eventos para cuentas/audiencias concretas; hoy búsquedas, hojas y redes; decisión mensual/trimestral | Responsable de marketing, con presupuesto aprobado por dirección. Competencia fuerte de Vendelux y procesos internos; necesita datos de audiencia/CRM. | Comparar shortlist contra búsqueda simple y registrar reuniones/opciones aceptadas. El corpus técnico ayuda, pero no demuestra presencia de cuentas objetivo. |
| Organizadores recurrentes de conferencias profesionales o comunidades con patrocinio | Definir paquetes y seleccionar sponsors para la siguiente edición; hoy directorios, históricos y propuestas manuales | Responsable de patrocinios/organizador, aprobación de dirección. Debe aportar paquete, audiencia y derechos de datos; competencia de Partable, Identyca y agencias. | Puede aportar datos propios, corregir afinidad y medir conversaciones, propuestas y renovaciones; feedback más próximo al trabajo entregado. |
| Agencias/organizadores culturales, editoriales y deportivos de ámbito regional | Encontrar marcas afines y diseñar activaciones | Agencia o dirección del evento; aprobación del titular de derechos y marca. Relaciones comerciales, exclusividad y normativa local condicionan la venta. | Casos públicos muestran activaciones concretas; públicos y resultados heterogéneos dificultan ranking y comparación. SponsorUnited es rival relevante en parte del mercado. |

**Recomiendo probar primero el segundo segmento**, con un solo territorio y tipo de evento por elegir, y clientes que aporten audiencia agregada y oferta de patrocinio actuales. El motivo es la posibilidad de cerrar el circuito evidencia → revisión del comprador → resultado consentido, no convertir el sesgo Python en estrategia por defecto. Si no se consiguen esos datos o no hay presupuesto para el trabajo, cambiar el segmento; no compensarlo prometiendo una base global. Vender inicialmente a una sola parte evita depender de que sponsors y organizadores se incorporen simultáneamente a un marketplace.

El ahorro de trabajo debe medirse contra el proceso previo: minutos de investigación, verificación y preparación de cada shortlist, frecuencia real, coste actual de agencias/directorios y correcciones. No hay horas ahorradas observadas en esta ejecución.

### Mercado desde clientes alcanzables y precio a probar

No se estimó TAM con fuentes suficientes. El gasto global en eventos no es el mercado de este software. La fórmula útil para el piloto es **cuentas identificadas y alcanzables × fracción que contrata × ingreso anual por cuenta**, con una lista real pendiente y sin asumir que una organización del dataset es un comprador.

| Escenario ilustrativo, no pronóstico | Cuentas alcanzables supuestas | Clientes pagos supuestos | Ingreso anual por cliente supuesto | Ingreso anual resultante |
|---|---:|---:|---:|---:|
| Piloto comercial acotado | 100 | 10 | 3.000 EUR | 30.000 EUR |
| Servicio especializado | 300 | 30 | 6.000 EUR | 180.000 EUR |
| Escala operativa por comprobar | 500 | 50 | 12.000 EUR | 600.000 EUR |

La proporción del 10 % en los tres ejemplos solo permite visualizar sensibilidad; no procede de una tasa de conversión observada. No son límites de mercado ni ingresos previstos. Revisar número de compradores, presupuesto, duración de contrato, abandono y coste de servir antes de emplearlos para inversión.

Propuestas de precio para entrevistar/probar, **no precios observados de GrowthX ni disposición a pagar demostrada**: piloto asistido de un mes por **500–1.500 EUR**, con un evento y alcance acordado; producto limitado por **99–299 EUR/mes** si la revisión manual puede reducirse; servicio recurrente especializado por **400–1.000 EUR/mes** con entregables y volumen explícitos. No deben sumarse automáticamente. El benchmark competitivo publicado está en [market-access](phase1-market-access.md); una suscripción a un rival no equivale a licencia de sus datos. No se presupuestan aquí tarifas de infraestructura ni margen no medido.

### Cuatro significados de “gratis”

1. **Producto gratuito:** hipótesis de una primera evaluación limitada —un brief y pocas opciones con evidencia—, con límites por frecuencia, fuentes y revisión. Podría financiarse con suscripción o servicio posterior; ninguna vía está decidida. No prometer investigación ilimitada.
2. **Entrada gratuita a eventos:** propiedad de una entrada/actividad/edición. No elimina viajes, dedicación ni coste de patrocinar; la entrada general tampoco garantiza acceso profesional. Ejemplos y categorías se conservan en [precios](data/observed/ticket_price_history.csv) y [lote no tecnológico](notes/phase1-nontech.md).
3. **Fuentes sin pago inicial:** páginas, feeds o demos legibles no equivalen a licencia comercial, conservación indefinida ni mantenimiento gratuito. Los 160 registros de fuente mantienen `commercial_reuse_not_cleared`. [Fuentes](data/observed/sources.csv).
4. **Luma gratuito:** el plan permite organizar eventos con límites y condiciones; API Plus y MCP tienen requisitos diferentes. No sustituye investigación, matching ni permiso para redistribuir datos. [Pricing oficial](https://luma.com/pricing), [MCP](https://help.luma.com/p/mcp), [API](https://docs.luma.com/reference/getting-started-with-your-api).

## Flujo mínimo y servicio manual asistido

**Asistir/patrocinar un evento existente** requiere inventario próximo, restricciones del cliente, audiencia y coste total. **Organizar uno nuevo** requiere capacidad de convocatoria, recursos, fechas/lugar disponibles y oferta concreta. El histórico aporta referencias; no confirma demanda ni disponibilidad del concepto. El MVP propuesto empieza con brief → evidencia → shortlist revisada; el borrador de evento es un entregable secundario, mientras la creación/publicación queda fuera del research.

Desde un website se puede documentar producto, oferta, mercados y afirmaciones de audiencia. Objetivo, presupuesto total, radio de desplazamiento, calendario, cuentas objetivo, capacidad operativa y datos disponibles deben confirmarse con el cliente. Sin URL, un prompt estructurado basta para comenzar con supuestos visibles. No deducir que el texto comercial describe clientes reales ni ingresos.

| Etapa manual | Entregable | Dato obligatorio / alternativa |
|---|---|---|
| Brief con revisión humana | Objetivo y restricciones en una página | Sin presupuesto/geografía: opciones ilustrativas, sin recomendar compra. |
| Investigación dirigida | Universo candidato delimitado, fuentes y fecha de revisión | Evidencia insuficiente se conserva como desconocida; no se rellena con datos de otra edición. |
| Ranking | Cinco opciones explicadas, descartes y preguntas pendientes | Primero fechas, lugar, modalidad, coste y restricciones; luego afinidad, historial y calidad de evidencia. Score no significa probabilidad de ROI. |
| Sponsors | Shortlist con rol/edición previos, señal actual, oferta compatible y razón de inclusión | Separar afinidad, propensión hipotética y disponibilidad confirmada. Sin permiso no hay contacto automatizado. |
| Revisión y seguimiento | Correcciones, opción útil/descartada y razón; después conversación/propuesta/acuerdo | Datos consentidos del cliente, sin inventar etiquetas negativas por ausencia pública. |

Cuando el presupuesto sea una restricción dura y el coste total sea desconocido, el candidato queda en revisión condicional, fuera de la lista aprobada. El benchmark actual no confirma asequibilidad.

Reglas explícitas más búsqueda textual/semántica son la opción inicial a comparar; no hay necesidad demostrada de entrenar un modelo ni sustituir SQLite por un grafo. La evaluación debe mantener universo y restricciones iguales, reservar casos de evaluación y registrar qué aporta cada capa. [Modelo entregado](data_dictionary.csv), [validación](validation_report.md).

El mapa debe ser una vista de la lista: próximos confirmados separados del histórico y conceptos nuevos; online aparte; ciudad aproximada visible; sin inventar coordenadas o distancias. La cobertura geográfica actual impide ubicar con precisión la mayoría de los recintos. La muestra exportable está en [map-opportunities.csv](examples/map-opportunities.csv) y [GeoJSON](examples/map-opportunities.geojson), con recorridos en [product-walkthroughs.md](examples/product-walkthroughs.md). La selección/tarifas de proveedor de mapas y geocodificación quedan pendientes de Fase 2; no se afirma que el mapa comercial esté construido.

Existe un [borrador local ilustrativo](data/proposals/luma_drafts.csv) de clínica de evaluación de aplicaciones de IA con Python, con [procedencia editorial](data/proposals/draft_field_evidence.csv). Faltan fecha, zona horaria, anfitrión, lugar y registro; no es payload válido ni evento creado. La [API de creación Luma](https://docs.luma.com/reference/post_v1-events-create) requiere nombre, inicio y zona horaria; privado no equivale a borrador nativo. Concepto, agenda y posibles sponsors deben seguir etiquetados como propuestas.

### Recorridos trazables y enlaces que aún faltan

| Recorrido | Tramo sustentado | Enlace pendiente |
|---|---|---|
| Empresa → objetivo → evento | Corpus técnico y ediciones futuras permiten contrastar tema/fecha; hay conflictos fechados resueltos | No hay empresa cliente ni objetivo confirmado: no existe recomendación personalizada comercial validada. |
| Evento → audiencia → oferta → sponsor | Roles PyCon y prospectos de dos ediciones; evidencia cultural de activaciones | Unir un paquete **actual** con audiencia real, objetivo del sponsor y presupuesto/disponibilidad. Un sponsor antiguo solo genera candidato. |
| Noticia → señal → oportunidad | EdgeDB/Gel y cierre/transición del equipo, enlazados a identidad histórica | Cambio de decisión propuesto: excluir candidatura independiente hasta comprobarla; impacto comercial no medido. |
| Concepto → borrador Luma | Contenido editorial local y campos marcados pendientes | Aprobación del organizador y datos operativos; ninguna cuenta o publicación creada. |

## Resultados y atribución

Lo público suele aportar anuncio, participación de marca, métricas declaradas y algunos resultados seleccionados. CRM, asistencia individual autorizada, reuniones, pipeline y costes reales deben proceder del cliente/organizador. Las tres medidas siguientes son definiciones de producto propuestas, no resultados obtenidos.

| Medida | Definición propuesta | Datos y límite |
|---|---|---|
| Ingreso originado | Oportunidad creada tras interacción identificada en el evento, según una regla de origen acordada, que posteriormente se cierra | CRM con fechas, cuenta/contacto autorizado, interacción y cierre. Una regla operativa de origen no demuestra causalidad. |
| Ingreso influenciado | Oportunidad previa o multicanal con una interacción relevante documentada dentro de una ventana acordada | Registrar etapa antes/después, rol del contacto y deduplicar oportunidades. No sumar el importe total de la misma venta por cada evento. |
| Retorno incremental | Diferencia frente al resultado que habría ocurrido sin la acción | Requiere contrafactual defendible: asignación aleatoria viable o comparación explícita con supuestos y sesgos. No inferirlo de logos, asistencia o renovación. |

Para quien organiza: asistencia definida, utilidad juzgada, conversaciones y coste por interacción válida; para quien asiste/patrocina: reuniones con cuentas pertinentes y avance de oportunidades; para el organizador que vende patrocinios: propuestas, acuerdos e ingreso contractual; para el sponsor: cumplimiento de entregables y resultados acordados. Un posible ROI económico requiere margen incremental menos costes incrementales dividido por costes incrementales, sin sustituir margen por ingresos brutos. Nada de ello se calculó aquí.

Sin resultados históricos, comenzar con relevancia revisada por compradores, afirmaciones sin evidencia, restricciones incumplidas, tiempo de preparación y aceptaciones explicadas. Con consentimiento, guardar versión mostrada, elección/rechazo, correcciones, conversaciones y resultados a plazo. La ausencia de cliente/feedback real queda explícita en los [esquemas privados](data/private-schemas/customer_briefs.csv).

## Plan propuesto de 30, 60 y 90 días

Los umbrales son **criterios de planificación a discutir**, no estándares externos ni resultados de pilotos. Los responsables son funciones futuras; no se ha contratado equipo ni autorizado contacto a terceros por este documento.

| Plazo | Entregables y responsable | Dependencias | Puerta de decisión propuesta |
|---|---|---|---|
| 0–30 días | Producto/ventas: delimitar comprador y territorio, diez entrevistas autorizadas. Investigación/datos: cerrar el lote futuro y permisos; preparar cinco casos manuales. Responsable de evaluación: rúbrica y casos reservados. | Acceso a compradores y a datos autorizados de al menos dos organizadores; requisitos del brief. | Continuar si al menos tres compradores describen una decisión repetida y dos aportan datos utilizables. Detener automatización comercial de fuentes sin permiso; cambiar segmento si el acceso propio no aparece. |
| 31–60 días | Analista Event GTM: cinco entregas asistidas con registro de minutos/correcciones. Producto: prueba de precio real cuando se autorice. Datos/evaluación: doce briefs consentidos, cuatro de desarrollo y ocho reservados; al menos dos evaluadores por brief, siguiendo el protocolo de validación. | Misma bolsa de candidatos, restricciones iguales y etiquetas humanas reales; presupuesto/paquete vigente. | Buscar al menos dos pilotos pagos de cinco propuestas comparables. Gate de calidad de validación: al menos cuatro de cinco candidatos útiles en seis de ocho briefs, cero afirmaciones críticas sin evidencia/cero violaciones duras y reducción del tiempo humano de al menos 30 %. Reportar incertidumbre de la muestra pequeña. |
| 61–90 días | Ingeniería/datos: automatizar solo pasos estables y permitidos. Producto: renovaciones/uso repetido. Responsable de cliente: capturar conversaciones y acuerdos; finanzas: coste completo medido por entrega. | Validación favorable, datos con retención permitida, coste por flujo medido posteriormente y consentimiento para resultados. | Ampliar si tres clientes vuelven a usar el servicio, la calidad se mantiene y el coste variable cabe en el ingreso contratado. Si no mejora la decisión o exige datos inaccesibles, mantener servicio, pivotar o parar inversión. |

Los acuerdos/ingresos pueden madurar después de 90 días; seguir el ciclo comercial observado sin atribuir fracaso o éxito por un corte arbitrario. El plan de investigación/continuación exacta está en [next_steps.md](next_steps.md). El cálculo de infraestructura y economía del flujo se abordaría en Fase 2, después de cerrar su investigación separada; no se da por realizado.

## Veredicto y diez decisiones abiertas

La evidencia de Fase 1 es **favorable a seguir probando un caso acotado**, pero **mixta e insuficiente para afirmar una ventaja extraordinaria**. Hay un dataset real reutilizable técnicamente, trazabilidad y ejemplos de correcciones útiles. Persisten concentración de fuentes, falta de licencias comerciales, baja completitud de audiencia/paquetes/resultados y ausencia de usuarios que juzguen el valor. Las conclusiones comerciales quedan condicionadas al [informe de validación](validation_report.md), sin convertir un benchmark retrospectivo o sintético en prueba de demanda.

1. ¿Quién decide, quién usa y quién paga por el primer trabajo concreto?
2. ¿Qué territorio, idiomas y formatos definen un universo auditable?
3. ¿La primera decisión será asistir, patrocinar, conseguir sponsors u organizar?
4. ¿Qué objetivo, audiencia y restricciones hacen útil una recomendación?
5. ¿Qué clientes/organizadores pueden aportar datos y derechos de uso, conservación y feedback?
6. ¿Qué fuentes aportan candidatos útiles adicionales frente a la mejor fuente individual?
7. ¿Cuánta historia cambia la decisión frente a información reciente, con el mismo universo y sin fuga temporal?
8. ¿Qué paquetes, costes completos y disponibilidad deben comprobarse antes de ejecutar?
9. ¿Qué precio pagan compradores reales y qué coste medido por entrega lo sostiene?
10. ¿Qué evidencia de conversaciones, acuerdos o resultado incremental justificaría ampliar o abandonar el producto?

**Siguiente lote concreto:** resolver los puntos abiertos de PyBay y PyCon Ireland y revisar las 35 ediciones futuras procedentes de calendario, ordenadas por fecha, contra sus páginas oficiales; conservar precios/registro/lugar desconocidos cuando falten. La reanudación usa IDs y cursores existentes, no reinicia la extracción. [Cola exacta](data/observed/extraction_queue.csv), [procedimiento y gates](next_steps.md). Este cierre no declara completo el histórico mundial ni inicia Fase 2.

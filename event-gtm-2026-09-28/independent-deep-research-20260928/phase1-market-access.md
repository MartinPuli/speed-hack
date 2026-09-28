# Fase 1 — Acceso a plataformas y competencia de Event GTM

Fecha de consulta: **28 de septiembre de 2026**. Alcance internacional exploratorio; geografía y segmento comercial pendientes. Ventana del proyecto: 28-09-2021 a 28-09-2026, más próximos eventos confirmados. Este informe aporta **10 competidores examinados y 3 plataformas prioritarias evaluadas**; no añade ediciones ni personas al dataset principal. Se leyó el [prompt maestro](spec/prompt-maestro.md), incluidas sus 66 tablas lógicas. Las fuentes y estados de recuperación están en [market-sources.json](notes/market-sources.json).

**Resultado:** la ventaja extraordinaria sigue **sin demostrar**. La interfaz conversacional, el ranking por audiencia y el matching de sponsors ya forman parte de ofertas publicadas. Hay oportunidades para competir en evidencia, relaciones históricas y ejecución específica de un segmento, pero requieren medir cobertura, relevancia y mantenimiento con el dataset real. Las condiciones revisadas tampoco permiten asumir un histórico comercial global gratuito de Luma, Eventbrite y Partiful.

## 1. Qué se verificó realmente

Se consultaron documentación, páginas de producto, precios, condiciones y casos publicados por los propios proveedores. No se abrió ninguna cuenta, probó una integración autenticada, compró un plan, contactó a nadie ni ejecutó una demo privada. Una página leída demuestra lo que el proveedor publica; no valida exactitud del dataset, disponibilidad efectiva de cada función ni resultados representativos.

Clases usadas:

- **D — documentación técnica o contractual:** la fuente define comportamiento, acceso o condiciones; no sustituye una prueba autenticada.
- **M — declaración comercial:** función, tamaño o resultado anunciado por el proveedor, sin reproducción independiente.
- **A — anunciado/early access/roadmap:** el propio proveedor señala una disponibilidad futura o limitada.
- **U — no encontrado en páginas revisadas:** desconocido; no significa inexistente.
- **N — ausencia explícita:** solo cuando el proveedor niega la capacidad.

Los precios son observaciones de páginas públicas a la fecha indicada, no cotizaciones aceptadas. Los símbolos `$` se conservan cuando la fuente no precisa moneda. No se cuentan cifras comerciales como registros obtenidos. Las observaciones sobre condiciones son una evaluación operativa del método propuesto, no una conclusión jurídica sobre todos los usos posibles.

## 2. Acceso actual a las plataformas prioritarias

| Plataforma / vía | Verificación y alcance | Histórico, futuro y campos | Decisión de adquisición |
|---|---|---|---|
| **Luma API (D)** | Requiere Plus; clave por calendario y cabecera `x-luma-api-key`. La clave da acceso al calendario correspondiente. [Getting Started](https://docs.luma.com/reference/getting-started-with-your-api). | No es una API documentada de inventario mundial. `Get Event` sí devuelve campos públicos de un evento ajeno conocido por `event_id`, con `access:view`; los gestionados ofrecen detalle adicional. [Get Event](https://docs.luma.com/reference/get_v1-events-get). | Integración autorizada potencial; credencial y plan no disponibles/probados en esta ejecución. No inventar endpoints internos. |
| **Luma listado de calendario (D)** | Por defecto lista eventos gestionados; admite `access=view` para otros eventos listados en ese calendario. Devuelve estos con ubicación reducida a ciudad y omite campos de anfitrión; excluye privados ajenos. [List Events](https://docs.luma.com/reference/get_v1-calendars-events-list). | Filtros `before`, `after`, cursor, orden y plataformas `luma`/`external`. Es útil para backfill de calendarios autorizados, sin demostrar retención completa de cinco años. Misma fuente. | Recorrer calendarios concretos autorizados, conservar cursor y rol de acceso. No convertir capacidad de listar un calendario en cobertura territorial. |
| **Luma MCP (D)** | Cualquier cuenta puede conectar **sin Plus**; OAuth y permisos de la cuenta. Descubrimiento de próximos eventos públicos por tema, lugar y fechas; pasado de eventos propios/asistidos y calendarios gestionados. También crea y modifica eventos. [MCP](https://help.luma.com/p/mcp). | La documentación no ofrece backfill público global. Invitados, contactos, ubicaciones privadas y administración requieren permisos. No se conectó una cuenta ni se midió cobertura. Misma fuente. | Alternativa futura para descubrimiento consentido en vivo. La disponibilidad técnica no concede por sí sola una licencia de reventa del catálogo. |
| **Luma contenido público (D)** | Condiciones: usar interfaces públicamente soportadas; reproducción/reutilización de Site Content limitada salvo permiso escrito o uso bona fide del servicio mediante esas interfaces. [Terms](https://luma.com/terms). | Página pública puede aportar hechos, pero una foto o texto accesible no es un activo libre para republicar. | Investigación puntual y referencias; permiso comercial de un almacén/redistribución a escala pendiente. No asumir que una librería de scraping externa autoriza el uso. |
| **Eventbrite API (D, recuperación parcial)** | La documentación oficial indexada mantiene retirada la búsqueda general desde 12-12-2019. [By date](https://www.eventbrite.com/platform/docs/by-date). La referencia conserva listado paginado por organización y por recinto. [API](https://www.eventbrite.com/platform/new/api). | Organizaciones requieren autenticación y permisos; la referencia describe filtros temporales, estado, serie y recinto. [Organizations](https://www.eventbrite.de/platform/docs/organizations). No se probó acceso a organizaciones ajenas, series o histórico mundial. | Aperturas directas de referencia y marco legal devolvieron 429; se registran, sin insistir ni eludir. Texto oficial recuperado por índice sirve para evaluar, no equivale a API operativa. |
| **Eventbrite condiciones (D, índice oficial)** | Términos fechados 20-08-2025, §13.1: prohíben uso comercial propio del contenido y scraping/crawling/extracción automatizada. [Terms](https://www.eventbrite.co/help/en-ca/articles/251210/eventbrite-terms-of-service/). | Sitio indexado o registro visible no acredita permiso de almacenamiento comercial. Hay términos adicionales de API potencialmente aplicables. | No recomendar crawler general. Usar fuentes originales del organizador o acceso/acuerdo autorizado; verificar términos de API concretos antes de integrar. |
| **Partiful público/privado (D)** | Eventos privados por defecto. Públicos exponen ubicación y pueden ser indexados por buscadores; se envían a Explore. [Public Event](https://help.partiful.com/en-us/articles/15525563-what-is-a-public-event). | Invitados requieren anfitrión, invitación o RSVP autenticado; el anfitrión puede ocultarlos y proteger el evento. [Data protection](https://help.partiful.com/en-us/articles/15525648-how-does-partiful-protect-my-data). No API pública de catálogo/histórico verificada. | No recuperar invitados privados ni convertir “Interested”, RSVP o seguidores en asistencia efectiva. |
| **Partiful condiciones (D)** | Revisión **25-09-2026**. Conditions of Access and Use §11 prohíbe data mining/robots/scraping/extraction y evasión de bloqueos. Commercial Use requiere autorización escrita para explotación comercial. [Terms](https://partiful.com/terms). | Indexación autorizada de eventos públicos por buscadores no es autorización universal de extracción o reutilización. | Scraping comercial directo bloqueado por permisos para esta propuesta. Investigar hechos desde organizadores y conservar el enlace Partiful como referencia; un acuerdo futuro podría cambiar esta decisión. |

**Fallo de recuperación adicional:** `help.luma.com/p/luma-api` agotó la recuperación con timeout/error. No se sustituyó por una afirmación inventada: las condiciones de Plus y clave se verificaron en [Getting Started](https://docs.luma.com/reference/getting-started-with-your-api). Las versiones `.md` de tres páginas de API también fallaron en la herramienta, pero sus versiones HTML oficiales se pudieron leer.

## 3. Luma: costo y diferencia entre preparar y crear

El plan gratuito publica eventos e invitados ilimitados, importación/exportación CSV y hasta 500 invitaciones/newsletters semanales; cobra 5% de plataforma en eventos pagados. Plus aparece a **US$59/mes facturado anualmente**, incluye API, hasta 5.000 envíos semanales y 0% de plataforma; el procesamiento de pagos sigue siendo adicional. Esto no equivale a entrada gratuita ni a fuentes gratuitas para el producto. [Pricing](https://luma.com/pricing).

La API documenta **200 peticiones/minuto por calendario** para claves/OAuth y 500 por organización; un exceso da 429 y bloqueo de un minuto, con `Retry-After`. Es capacidad de tráfico, no permiso para recorrer el universo. [Rate Limits](https://docs.luma.com/reference/rate-limits).

| Acción propuesta | Evidencia y límite |
|---|---|
| Preparar un documento local para copiar | No requiere API; no crea una entidad Luma. Título, descripción y agenda pueden mantenerse como propuesta revisable. |
| Crear por API | `POST /v1/events/create`; requiere `name`, `start_at`, `timezone`. Documenta `description_md`, fin, capacidad, visibilidad, tickets, ubicación o meeting URL, registro y otras opciones. [Create Event](https://docs.luma.com/reference/post_v1-events-create). |
| “Crear borrador” nativo | No se encontró un parámetro/endpoint de borrador en el índice y Create Event revisados. `visibility:private` y `registration_open:false` no deben etiquetarse como borrador: crean un evento real. [Índice](https://docs.luma.com/llms.txt), [Create Event](https://docs.luma.com/reference/post_v1-events-create). |
| Crear con valores omitidos | Registro abierto por defecto; si se omiten tickets crea uno gratuito Standard. `meeting_url` y `geo_address_json` no se combinan. Por eso no enviar datos pendientes “para probar”. [Create Event](https://docs.luma.com/reference/post_v1-events-create). |

**Implicación de producto:** el entregable inicial defendible es un borrador local con campos confirmados, propuestas y decisiones pendientes. La integración nativa solo debe añadirse con cuenta autorizada, condiciones verificadas y confirmación explícita de la acción de crear/publicar. En esta investigación no se ejecutó ninguna escritura.

## 4. Matriz competitiva: trabajo, estado y precio

| Proveedor | Comprador y trabajo principal | Oferta observada / estado | Incorporación, precio y modelo público |
|---|---|---|---|
| **[Vendelux](https://vendelux.com/)** | Field/demand marketing y ventas; seleccionar eventos por ICP, coordinar reuniones y vincular actividad con CRM. | M: inteligencia de asistentes, sponsors, cuentas y eventos; menciona 250.000+ eventos B2B mundiales. Oferta comercial, trial/demo. | Lista/CRM/perfil; Starter, Plus y Enterprise sin importe público. Starter limita insights completos a 20 eventos/mes; Plus añade campañas y créditos. [Precios](https://vendelux.com/pricing). |
| **[Pana Events](https://www.pana.space/events)** | Marketing, sponsors, expositores, organizadores y agencias; ciclo de evento a pipeline. | M/A: prompt, recomendación ICP, presupuestos y planificación; el directorio de 250k+ aparece **Coming soon**. [AI planner](https://www.pana.space/events/ai-event-planner). | Demo/equipo y oferta individual. Página muestra Solo $29/mes, pero múltiples inconsistencias impiden tratarla como cotización fiable. [Pricing](https://www.pana.space/events/pricing). |
| **[SponsorUnited](https://www.sponsorunited.com/)** | Marcas, rights holders, medios y agencias; descubrir y evaluar patrocinios, activaciones y negociación. | M: buscador y asistente IA, evaluación de propuestas, datos de deals y creatividades. Publica 1.100+ organizaciones clientes, no auditadas aquí. | Demo y suscripción; SPND requiere nivel específico y precio por contacto comercial. [Access](https://help.sponsorunited.com/en/articles/10166349-spnd-access). |
| **[Partable](https://partable.ai/events)** | Organizadores que venden patrocinio; búsqueda, investigación, propuestas y pipeline en chat. | **A: Get Early Access**; precio publicado no demuestra disponibilidad general. Métricas 5x/80%/2x no incluyen evaluación reproducida. | Describe brief del evento y audiencia. Outreach **$79/seat/mo**, BYOK custom; anuncia CRM, Apollo, Exa y Firecrawl. Misma página. |
| **[Identyca](https://identyca.io/)** | Organizador de congresos; sponsors, speakers, temas, recintos, fechas y precios. También networking AR y venues. | M: Organizer Intelligence figura **Now**; Vendor Discovery **Next**; marketplace sponsorship **Soon**. Networking solicita pilotos 2026. | Brief por vertical, audiencia, tamaño, ciudad y fechas; demo. Precio de inteligencia no localizado; sede publicada Singapur, consultas globales. Misma página. |
| **[Kuration AI](https://kurationai.com/solutions/event-intelligence)** | Ventas/organizador; convertir URLs y documentos en listas enriquecidas de sponsors, expositores y speakers. | M: extracción multilingüe/multifuente y contactos; declara 90 segundos, no medidos aquí. No es prueba de licencia de fuentes. | Primer listado 20 empresas +1.500 créditos sin tarjeta; Starter **$49/mes**, Pro **$149**, Scale **$499** en posiciones iniciales mostradas. [Pricing](https://kurationai.com/pricing). |
| **[Events Intelligence/HuntEx](https://www.events-intelligence.com/)** | Organizadores de ferias B2B; encontrar expositores con afinidad. | M: base de 850.000+ expositores de miles de ferias globales y data science. Testimonios anónimos; no validan causalidad. | Consulta y servicio ajustado al cliente; precio, trial, API y licencia de exportación no localizados. [Servicios](https://www.events-intelligence.com/services). |
| **[EventoPulse](https://www.eventopulse.com/)** | GTM, organizadores, proveedores y analistas; señales de eventos, empresas, speakers y sponsors. | M: 200k+ eventos, 140k+ expositores, 25k+ speakers, 300+ sponsors; conteos publicados, sin universo ni auditoría. | Free 1 alerta/mes; Signal **$49**, Intelligence **$99**, Pro **$179/mes**; Enterprise custom. [Pricing](https://www.eventopulse.com/pricing/). |
| **[Acirio](https://acirio.com/)** | Organizador que busca sponsors a partir de eventos competidores. | M: escanea URLs, enriquece, puntúa afinidad y prepara emails. Se declara **proyecto personal en desarrollo**, con posibles errores. | Cuenta; se anuncia gratuito y solicita donaciones opcionales. Sin plan pagado obligatorio verificado. Página abierta no devolvió texto; fuente primaria recuperada por índice. |
| **[run.events](https://run.events/)** | Organizadores de conferencias, expos y asociaciones; operación integral y networking. | M: audiencia, agenda, ticketing, check-in, CRM de sponsors/expositores, leads y matchmaking. Producto comercial con casos publicados. | Demo, onboarding y tamaño contratado. Conferencias ≤500 asistentes: **€4.300/5.700/7.100/9.900 al año** por paquete; onboarding **€990**, addons aparte. [Pricing](https://run.events/pricing). |

## 5. Datos, integraciones, actualización y evidencia comercial

| Proveedor | Cobertura e historia: lo que sí y lo que falta | Integración / actualización / clientes |
|---|---|---|
| Vendelux | Global B2B declarado; publica filtros de roles, sector, territorio, cuentas, presupuesto y desempeño previo. Cinco años completos por territorio: U. [Discovery](https://vendelux.com/event-discovery). | Salesforce/HubSpot documentados comercialmente; alertas de eventos/prospectos. API pública y SLA de frescura: U en revisión. Caso **Seqera** publicado, seleccionado por proveedor, no experimento. [Caso](https://vendelux.com/resources/case-studies/seqera). |
| Pana | Audiencia, sponsors, precios, expositores y lugares anunciados; calidad/completitud y tamaño actualmente disponible U. [Planner](https://www.pana.space/events/ai-event-planner). | Página de planes marca Salesforce/Pipedrive y Zoho como roadmap en Business; CSV/webhook y API en tiers. No confundirlo con cada integración operativa. Trial dice 14 días en pricing y 7 en términos. [Términos](https://www.pana.space/events/terms-and-conditions). |
| SponsorUnited | SPND estima precio transaccional, **no ROI**. FAQ 2025: temporadas desde 2021–22 NFL/NBA/NHL, 2022 MLB/MLS, 2022–23 NCAA, 2024 F1; actualización al cierre anual de temporada. No cubre cinco años homogéneos de todo evento. [SPND](https://help.sponsorunited.com/en/articles/10166311-general-spnd-questions). | FAQ declara 45k+ deals estimados; homepage actual menciona $45B+ de datos verificados. Unidades/fechas distintas, no sumar ni tratar como cifra propia. API, reventa y exportación: U; confirmar en contrato. [Homepage](https://www.sponsorunited.com/). |
| Partable | Fuentes de empresa/eventos/CRM anunciadas; años, países, número de eventos, tasas de refresco y fuente por campo U. | HubSpot/Salesforce y proveedores de búsqueda/enriquecimiento anunciados; exportación/API pública, clientes identificables y pruebas de mejora U. [Events](https://partable.ai/events). |
| Identyca | Declara grafo global y benchmark por vertical/ciudad; no publica volumen auditable, antigüedad ni SLA. | Exportación de estrategia anunciada; APIs e integración Luma U. Marketplace y feedback cerrado no disponibles por el simple texto de roadmap. [Sitio](https://identyca.io/). |
| Kuration | Trabaja sobre fuentes que aporta/descubre el usuario, no prueba un histórico precompilado universal. Página AI incluye comparación de listas 2024/2025; ausencia en una lista no confirma baja. [AI](https://kurationai.com/ai). | CSV/Sheets, CRM, API/webhooks/MCP anunciados; refresh programado desde Pro. Enterprise desde $2.500/mes anuncia derechos de reventa: verificar garantías y fuentes en contrato. No se compró. [Pricing](https://kurationai.com/pricing). |
| HuntEx | Datos de expositores, no inventario de asistentes verificados ni rentabilidad comercial. Profundidad temporal y países precisos U. | Extracción/refinamiento y consultoría, sin frecuencia/API pública/cliente nombrado hallados en páginas revisadas. [Servicios](https://www.events-intelligence.com/services). |
| EventoPulse | Historial de booths/sponsors/agenda y señales; años mínimos, denominador y precisión U. [Sitio](https://www.eventopulse.com/). | Precios dicen expresamente **sin integración CRM directa**; CSV/Excel 2k/4k/10k registros/mes según plan y API Enterprise. No confundir narrativa “wire into CRM” con integración nativa. [Pricing](https://www.eventopulse.com/pricing/). |
| Acirio | URLs de competidores: número de páginas soportadas, idiomas, historial y frescura U. Las filas ejemplo no son sponsors validados por esta investigación. | Anuncia exportación a CRM/email; API y conectores específicos U. Declaraciones GDPR no fueron auditadas. [Sitio](https://acirio.com/), [Privacy](https://acirio.com/privacy). |
| run.events | Principalmente datos de eventos del cliente; no se comprobó directorio mundial de eventos ajenos. | API e integración como servicio; revisar alcance, credenciales y contrato. Casos/testimonios de clientes publicados, no benchmark. [API](https://run.events/services/api-integration), [Clientes](https://run.events/testimonials). |

### Comparación explícita de los flujos propuestos

M y A son capacidades publicadas, no probadas. **U no significa que el producto no pueda hacerlo.** “Mapa” requiere evidencia de mapa geográfico de oportunidades; una metáfora “map your ICP” o un mapa interior no basta. “Aprende” exige aprendizaje con resultados, no simplemente almacenarlos.

| Producto | Prompt / website→perfil | Recurrencia | Ranking existentes | Mapa oportunidades | Conceptos nuevos | Luma | Sponsors propios | Personas/audiencia | Resultados | Aprende con resultados |
|---|---|---|---|---|---|---|---|---|---|---|
| Vendelux | Perfil/CRM M; URL U | Alertas M | M | U | RSVP propio M; concepto U | U | M | M | CRM M | U |
| Pana | Prompt M; URL U | U | M/A | U | Plan M; concepto U | U | M | M | M | U |
| SponsorUnited | Chat M; URL U | U | Patrocinios M | U | U | U | M | Audiencia M | Benchmark M | U |
| Partable | Brief chat A; URL U | U | Sponsors A | U | Propuestas sponsor A | U | A | Contactos A | Pipeline A | U |
| Identyca | Brief M; URL U | Feed A | M | U | Plan M | U | M | M/A | M/A | U |
| Kuration | Prompt/URL M | Refresh M | Lista/score M | U | U | U | Prospección M | Contactos M | U | U |
| HuntEx | Brief consultivo M | U | Expositores M | U | U | U | Expositores M | Empresas M | U | U |
| EventoPulse | Búsqueda/report M | Alertas M | M | U | U | U | M | M | Señales/estimación M | U |
| Acirio | URL evento M | U | Sponsors M | U | U | U | M | Contactos M | Estados M | U |
| run.events | U | Eventos propios M | Interno M | U | Gestión M | U | CRM M | M | M | U |

Esta matriz deriva de las fuentes enlazadas en las dos tablas anteriores. El conector Luma MCP es un sustituto parcial adicional: ya permite búsqueda y creación conversacional dentro de sus permisos; no documenta aquí investigación histórica multifuente de sponsors ni perfil comercial completo. [MCP](https://help.luma.com/p/mcp).

## 6. Los cinco rivales más cercanos y lo que implican

La selección siguiente es una **inferencia de solapamiento funcional**, no ranking de calidad ni cuotas de mercado. Cambiaría al elegir un comprador/geografía.

1. **Vendelux — asistir/patrocinar eventos existentes.** Su integración con listas/CRM y selección por cuentas coincide con el centro de valor comercial planteado. La experiencia gratuita tendría que producir información útil que el usuario no obtenga con su trial, redes o búsqueda. Para comparar, usar el mismo brief y universo de eventos, medir novedad útil y falsas afirmaciones, y diferenciar contactos previstos de asistentes confirmados. No es necesario ganarle en tamaño mundial para servir mejor un segmento, pero sí demostrarlo.
2. **Pana — recorrido completo de Event GTM.** Es la mayor colisión con la narrativa “un prompt → plan → ejecución → resultados”. Las marcas Coming soon y contradicciones de pricing impiden dar todas las funciones por entregadas. La próxima prueba debe revisar una cuenta con brief propio y exigir que cada evento/recomendación enlace evidencia. No permite concluir que el mercado está libre ni que Pana ya resolvió el problema.
3. **Identyca — inteligencia para organizar.** Sus módulos se superponen a sponsors, agenda, fecha, venue y precios. El roadmap ayuda a distinguir la propuesta futura de la oferta presente. La defensa no será nombrar más entidades en un grafo, sino mantener hechos útiles y permisos a menor costo por decisión.
4. **SponsorUnited — inteligencia profunda de patrocinios.** Amenaza especialmente una expansión hacia deportes y entretenimiento. Su separación explícita entre precio estimado y ROI es relevante para nuestro modelo. Si se busca ese segmento, será necesaria una fuente mejor o más accesible para un submercado concreto; un motor genérico que reutilice logos públicos no demuestra ventaja.
5. **EventoPulse — señales y alertas asequibles.** Los planes publicados crean una referencia de comparación para una experiencia recurrente de inteligencia; el precio observado no demuestra disposición a pagar por GrowthX. La diferencia propuesta tendría que ser recomendación verificable y trabajo completado por evento, frente a alertas/reportes. No extrapolar el costo de su suscripción a licencia de datos para redistribución.

**Competencia del flujo de sponsors:** Partable y Acirio reducen el valor exclusivo de “URL competidora → sponsors → outreach”; Kuration reduce el valor exclusivo de construir extractores genéricos. Su disponibilidad y calidad siguen pendientes de prueba, pero la promesa funcional ya existe.

## 7. Registro de contradicciones y sobreinterpretaciones evitadas

| Observación | Tratamiento correcto |
|---|---|
| API Luma requiere Plus, MCP no | Son vías distintas, no contradicción. No transferir tarifas ni alcance entre ellas. |
| API key por calendario y get público ajeno | Acceso granular documentado; get por ID no permite enumeración global. |
| Luma creación privada | Evento real con visibilidad restringida; no borrador nativo probado. |
| Eventbrite búsqueda antigua retirada, listas por organización/recinto documentadas | No asumir que los endpoints restantes constituyen un buscador abierto ni probar rutas privadas. |
| Partiful evento indexable y restricción de extracción | Indexabilidad técnica y licencia comercial son preguntas diferentes. |
| Pana 250k en marketing, “Coming soon” en planner | Clasificar directorio como anunciado, sin contar registros disponibles. |
| Pana trial 14 días vs términos 7; nombres de tiers y campos incompletos | Precio/condiciones comerciales pendientes de confirmación; no rellenar Business desde referencias dispersas. [Pricing](https://www.pana.space/events/pricing), [Terms](https://www.pana.space/events/terms-and-conditions). |
| Kuration página de eventos promete 5–6 listas con $49; pricing describe 1 extract+enrichment en resumen | Presupuestar por acciones/créditos documentados y confirmar definición de lista/tamaño, no multiplicar una cifra promocional. [Event intelligence](https://kurationai.com/solutions/event-intelligence), [Pricing](https://kurationai.com/pricing). |
| SponsorUnited precio estimado y cifra agregada de transacciones | No convertir estimación por deal en gasto confirmado ni ROI. Distintos años/universos no son una serie comparable. |
| Demo con sponsors, personas, scores o resultados | Material comercial, no observaciones del dataset histórico. No copiar contactos ficticios como personas reales. |

## 8. Prueba de ventaja: evidencia favorable y adversa

**Evidencia adversa para una ventaja inmediata:** gran parte de las funciones planteadas ya está publicada por competidores; el descubrimiento conversacional sobre Luma existe; datos públicos accesibles no implican licencia comercial; fuentes cerradas y relaciones con organizadores pueden favorecer a incumbentes. No se midió que cinco años de histórico mejoren recomendaciones, patrocinio o ROI. Estas son conclusiones de la revisión, no una prueba de fracaso del producto.

**Hipótesis de ventaja que sí merece probarse:** reunir fuentes de organizadores, recintos, agenda, paquetes y anuncios empresariales puede recuperar relaciones útiles que una sola plataforma omite. Una capa de evidencia por campo y versiones permitiría explicar el cambio entre ediciones y distinguir unknown de negative. Para ser una ventaja comercial necesita cambiar una decisión del cliente; un mayor número de tablas o filas no la demuestra.

| Hipótesis | Evidencia necesaria para sostenerla | Qué la refutaría / estado actual |
|---|---|---|
| Historia multifuente mejora cobertura | Más ediciones/relaciones útiles verificadas que la mejor fuente individual, mismo universo y tiempo de corte | Filas adicionales duplicadas o irrelevantes; aporte comercial todavía sin medir aquí |
| Historia mejora ranking | Jueces reales comparan keyword+fecha+geografía vs historial, con restricciones idénticas y sin fuga temporal | Sin mejora consistente o costo mayor que valor; sin evaluadores reales en esta revisión |
| Sponsors con señales actuales superan “mismo sector” | Shortlists ciegas con evidencia de audiencia/paquete/historial; después, conversaciones y acuerdos autorizados | Afinidad aparente sin interés/presupuesto; ausencia no cuenta como negativo |
| Evidencia produce un borrador mejor | Menos correcciones factuales, más decisiones resueltas y tiempo humano menor frente a prompt+website | Texto más largo pero sin venue, costos o audiencia verificables |
| Acceso y mantenimiento pueden ser rentables | Permisos sostenibles, extracción incremental, costo por recomendación aceptada y por borrador útil | Dependencia de fuentes inaccesibles/licencias incompatibles o alta revisión manual |
| Datos propios constituyen defensa | Feedback y resultados consentidos, cohortes repetidas y mejora fuera de muestra | Datos no exclusivos o demasiado escasos; aún no existen datos de clientes autorizados |

**Veredicto de este subestudio:** evidencia mixta e insuficiente para afirmar una ventaja extraordinaria; evidencia suficiente para rechazar que la mera combinación “IA + prompt + sponsors + mapa” sea por sí misma exclusiva. No se recomienda comprar datos ni construir un marketplace de dos lados antes de elegir el trabajo inicial y validar los datos obtenidos.

## 9. Segmentos y experiencia gratuita: hipótesis de decisión

Tres opciones para probar, **sin declarar B2B como decisión del usuario**: (a) equipos que asisten/patrocinan eventos de un nicho con directorios públicos profundos; (b) organizadores recurrentes que venden paquetes a sponsors y pueden aportar resultados; (c) comunidades/eventos culturales o locales con audiencia propia y necesidades de organización. A favorece comparación objetiva de eventos pero enfrenta a Vendelux; B puede generar datos consentidos de paquetes/resultados, pero exige ventas; C amplía fuera de B2B, con mayor dispersión pública y posible menor presupuesto. Esta comparación es una hipótesis de producto, no demanda observada.

La prueba gratuita podría ser un brief y shortlist acotada con evidencia y un borrador local. Los competidores muestran que hay alternativas gratuitas limitadas —Acirio, una alerta de EventoPulse, primera lista Kuration— y Luma tiene hosting de eventos gratuito. Ninguna de ellas prueba que nuestro costo de investigación, revisión, licencia o soporte sea cero. Tarifas/modelado de infraestructura pertenecen al research de fase 2 y no se han inventado aquí.

## 10. Cola concreta de continuación

| Prioridad | Trabajo siguiente | URL / condición de cierre | Dependencia |
|---|---|---|---|
| P0 | Elegir geografía, audiencia y flujo inicial | Registrar decisión en brief; no escogerla por facilidad de scraping | Usuario/producto |
| P0 | Revisar permisos de uso/retención por fuente del dataset real | Fuentes oficiales del organizador; almacenar metadatos y extractos mínimos con estado de derechos | Investigación de cada fuente |
| P1 | Evaluar Luma MCP con cuenta autorizada en una región elegida | [MCP](https://help.luma.com/p/mcp); comparar eventos públicos futuros recuperados contra universo auditado y registrar faltantes | Cuenta y autorización; no ejecutar escrituras |
| P1 | Verificar API Luma con calendario autorizado | [List Events](https://docs.luma.com/reference/get_v1-calendars-events-list); before/after en ventana de 60 meses, cursor hasta agotamiento, incluidos externos cuando proceda | Plus/credencial del propietario; no comprada |
| P1 | Eventbrite acuerdo/API apropiado | [API](https://www.eventbrite.com/platform/new/api); demostrar acceso real y términos aplicables antes de ampliar | Acceso y permiso; no reintentar crawler |
| P1 | Partiful fuente del organizador o autorización escrita | [Terms](https://partiful.com/terms); cerrar con permiso verificable o excluir extracción directa | No contactar sin instrucción posterior |
| P1 | Comparación con los cinco rivales sobre un brief real | URLs de producto arriba; guardar respuestas con evidencia y derechos, funciones utilizables, campos desconocidos y costo | Acceso a demo autorizado, sin compras asumidas |
| P1 | Resolver inconsistencias Pana/Kuration | Pricing y términos citados; obtener condiciones actuales antes de usar precios para compras o unit economics | Verificación adicional; no aceptación de contratos |
| P2 | Evaluar muestra licenciable de proveedores | SponsorUnited, Vendelux, Kuration, HuntEx; años/geografía/IDs/retención/exportación/reventa/borrado y costo | Acuerdo; presupuesto todavía cero |
| P2 | Cobertura de competidores locales fuera del inglés | Búsquedas por idioma/sector/ciudad elegidos; terminar tras comparar al menos los sustitutos que usa el comprador real | Geografía y segmento |

Preguntas pendientes de mayor impacto: quién paga; dónde opera; si busca asistir/patrocinar u organizar; presupuesto total del evento; tipos de audiencia; fuentes autorizadas disponibles; acceso a CRM/resultados; frecuencia real de decisión; qué mejora hace útil una recomendación; y límite de costo para la primera experiencia gratuita. No se bloqueó esta revisión por esas respuestas, pero sí impiden afirmar personalización o mercado elegido.

## Comprobaciones de entrega

- Investigación limitada a fuentes primarias para las afirmaciones comerciales/técnicas incluidas.
- Los 10 nombres solicitados tienen estado comercial, datos, precio o ausencia explícitamente registrada, y limitaciones.
- No se inventaron usuarios, clientes, eventos, acuerdos, ingresos, benchmarks ni integraciones probadas.
- Fallos técnicos y restricciones de permisos permanecen separados.
- No se guardaron textos completos de sitios, listas privadas, secretos ni contactos personales.
- Las métricas de precisión, ROI, latencia, costo por resultado útil y cobertura de proveedores permanecen **no medidas**.

QA local ejecutada: JSON válido; **47 URLs únicas** en el registro, incluidas cinco recuperaciones fallidas adicionales; las **42 URLs externas citadas** están registradas; IDs únicos; diez filas principales de competidores; ninguna prueba autenticada marcada como realizada. Solo se conservaron metadatos y notas propias. No se midió el costo de herramientas/modelos de esta sesión; compras y contactos externos: cero.

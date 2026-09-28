# Plataformas, acceso histórico y competencia — verificado 2026-09-28

## Conclusión para el producto

La cobertura de cinco años debe construirse con uniones de fuentes autorizadas, no con la expectativa de descargar todo Luma, Eventbrite, Meetup o Partiful. La diferencia comercial defendible sería **evidencia trazable + relevancia para un ICP + decisión y borrador de activación**, y requerirá datos del cliente para medir resultados. Un calendario demuestra una convocatoria; no demuestra asistentes efectivos, contratos, importe pagado ni retorno.

Hay competencia directa que ya ofrece conferencias, sponsors, consulta por empresa y API. La amplitud de tablas no constituye una ventaja competitiva. El benchmark debe medir cobertura histórica comprobada, precisión de entidades, frescura, procedencia, campos vacíos y utilidad humana del shortlist.

## Matriz de APIs y límites observados

| Plataforma | Acceso documentado y alcance | Historia / escala y decisión |
|---|---|---|
| Luma | API JSON requiere **Luma Plus**; claves limitadas a un calendario. La documentación publica el OpenAPI sin autenticación. | Es integración para calendarios autorizados. No se documentó aquí un permiso o endpoint de descarga histórica global. Integrar cuentas de organizadores o exportaciones aportadas por ellos. [Inicio oficial](https://docs.luma.com/reference/getting-started-with-your-api) |
| Eventbrite | Referencia v3 incluye eventos por organización, `time_filter`, estados y series. El antiguo `/events/search/` de búsqueda pública figura cerrado desde el **12-12-2019**. | La landing de desarrolladores sigue hablando de eventos públicos, pero eso no prueba que exista búsqueda masiva libre. Preferir referencia de endpoint y acceso aprobado. OAuth al actuar por otros usuarios. [Referencia](https://www.eventbrite.com/platform/new/api), [OAuth](https://www.eventbrite.com/platform/docs/app-oauth-flow) |
| Meetup | Desde febrero de 2025, acceso mediante GraphQL. Crear consumidores OAuth exige Pro; Pro **no garantiza aprobación**. | No contar una suscripción como licencia automática para construir un archivo global. El acceso se revoca al vencer Pro. [Acceso oficial](https://help.meetup.com/hc/en-us/articles/41453576628749-How-can-I-get-access-to-Meetup-s-API), [Vencimiento](https://help.meetup.com/hc/en-us/articles/41467209211917-What-happens-to-my-API-access-when-my-Meetup-Pro-subscription-expires) |
| Partiful | Términos revisados el 25-09-2026 prohíben scraping/minería sin autorización y restricciones adicionales para competidores y usos comerciales. | **No se recolectó contenido de eventos**. No encontramos en esta revisión una API pública de lectura masiva oficialmente documentada; no equivale a demostrar inexistencia. Pedir acuerdo o usar contenido propio autorizado del organizador. [Términos](https://partiful.com/terms) |
| Sessionize | API de solo lectura JSON/XML/iCalendar. El organizador crea un endpoint con ID único; publica sesiones, speakers, salas y relaciones. Caché de hasta cinco minutos. | Fuente de enriquecimiento de eventos concretos cuyo endpoint fue publicado por el organizador; no se acredita directorio histórico global abierto. Los estados de confirmación y publicación afectan qué datos salen. [Documentación](https://sessionize.com/playbook/api) |
| OpenAgenda | La documentación pide migrar el antiguo `/agendas/{uid}/events.json`, anunciado para retirada a fin de 2025, a API v2. | No implementar un endpoint obsoleto porque todavía figure indexado. Un espejo open data puede ser grande pero obsoleto; respetar la política del host concreto. [Migración](https://developers.openagenda.com/en/evenements/export-json-migration/), [Aviso del export antiguo](https://developers.openagenda.com/en/evenements/export-json/) |
| pretalx | `/api/events/` y schedules versionados, campos multilingües, eventos públicos y endpoints de programa. Autenticación reservada a organizadores/revisores; algunos endpoints son públicos. | Útil para conferencias tech y comunidades y para recuperar cambios de agenda. Software abierto y API pública **no transfieren una licencia general sobre textos/fotos de terceros**. Guardar hechos y atribución; verificar derechos por organizador antes de redistribuir contenido. [Endpoints](https://docs.pretalx.org/api/resources/), [Fundamentos](https://docs.pretalx.org/api/fundamentals/) |

Para Luma, el límite documentado actual es 200 peticiones/minuto por calendario para claves de calendario/OAuth y 500/minuto por organización; `429` bloquea un minuto y publica `Retry-After`. No reutilizar límites de tutoriales externos antiguos. [Límites oficiales](https://docs.luma.com/reference/rate-limits)

Para pretalx, el máximo de página por defecto es 50, configurable por instancia; requests autenticadas limitadas a 360/minuto por usuario. La documentación advierte que expansiones profundas cuestan más y pide cachear y espaciar llamadas. El colector deberá fijar versión API y seguir `next`, respetando `Retry-After`. Son límites de pretalx, **no de Helsinki**. [Fundamentos oficiales](https://docs.pretalx.org/api/fundamentals/)

## Fuentes de cobertura grande realmente investigadas

### Helsinki Linked Events: vía utilizable en esta ejecución

El catálogo nacional oficial describe una API de la ciudad que integra eventos de departamentos municipales y bibliotecas Helmet; búsqueda por fecha, ubicación y palabras clave. Publica licencia **CC BY 4.0** para datos, con excepciones de imágenes de uso exclusivo en contexto del evento. Por eso este lote no descarga ni redistribuye imágenes. [Ficha oficial y licencia](https://avoindata.suomi.fi/data/en_GB/dataset/linked-events-tapahtumarajapinta)

Un GET real a `https://api.hel.fi/linkedevents/v1/event/?start=2021-09-28&end=2026-09-28&page_size=1` devolvió HTTP 200 y `meta.count = 220145`. **Es el conteo de consulta, no filas incorporadas ni conferencias únicas**. Incluye jerarquías y fechas anómalas. Un ejemplo devuelto tenía año `0026`, lo que exige filtro local además del filtro remoto. La consulta parece seleccionar solapamiento temporal y no garantiza que cada inicio esté dentro del intervalo solicitado. [API oficial](https://api.hel.fi/linkedevents/v1/event/)

El importer `scripts/acquire_helsinki.py` solicita ventanas de un mes del 28-09-2021 al 28-09-2026. Excluye padres con subeventos, fechas de inicio fuera de ventana, borrados e IDs ya vistos. La cuota se distribuye mensualmente, pero dentro del mes se toman los primeros registros cronológicos elegibles: es un **muestreo acotado y sesgado por disponibilidad**, no aleatorio. Los manifests contienen los conteos definitivos, descartes, URLs, hashes, cursores y fechas; el total indicado arriba no debe reemplazarlos.

`robots.txt` agotó tiempo dos veces durante descubrimiento. Se registra como **desconocido**, no permitido por robots. La decisión de usar exclusivamente el endpoint se sustenta en su publicación oficial explícita como API open data; no se rastrea el sitio web ni se elude un bloqueo. La publicación de datos no garantiza exactitud ni vigencia de cada ficha.

El campo `data_source` original se conserva separado de `source_platform=helsinki_linked_events`, porque la ciudad agrega distintas fuentes. Coordenadas vienen del lugar publicado, sin geocodificación nueva y con precisión declarada no especificada por la fuente. País derivado de una división territorial `country:fi` queda marcado como derivado, no como dirección textual observada.

### Francia: ciencia y cultura, accesibles conceptualmente pero con bloqueos de host

La ficha oficial de **Fête de la Science 2023** ofrece CSV/JSON/GeoJSON/SHP bajo Open Licence 2.0. El catálogo apunta al export `https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-fete-de-la-science-23/exports/json`. Su existencia permite planificar lotes científicos, pero **no autoriza ignorar robots o controles del host**. Conservarlo en cola si la política de acceso impide descargar. [Catálogo oficial](https://www.data.gouv.fr/datasets/programme-de-la-fete-de-la-science-2023/)

El dataset de Île-de-France vía OpenAgenda figura con Open Licence 2.0, actualización 14-02-2024 y cobertura temporal sin informar: una etiqueta open data no asegura cinco años ni frescura. [Ficha oficial](https://www.data.gouv.fr/datasets/evenements-publics-en-ile-de-france-via-open-agenda)

El catálogo público OpenAgenda en Opendatasoft ofrece exportación, pero el equipo principal observó `Disallow: /api/` en robots, 1.270.942 registros declarados y procesamiento del 08-04-2024 en metadata. Esos son **hallazgos de exploración del equipo**, no incorporaciones. No se ejecutó descarga masiva a través de esa ruta. El host `documentation-resources.opendatasoft.com` contiene un **extract** de demostración y no debe confundirse con el catálogo completo. [Catálogo](https://public.opendatasoft.com/explore/dataset/evenements-publics-openagenda/export/), [Extract de documentación](https://documentation-resources.opendatasoft.com/explore/dataset/evenements-publics-openagenda-extract/export/)

Para JEP, el equipo principal encontró recursos estáticos de data.gouv pero observó robots `Disallow: /resources`; registró el bloqueo y no lo eludió. Estos candidatos no deben sumar al total recolectado. En futuras ampliaciones buscar exportaciones autorizadas por el productor, acuerdos de API o una confirmación pública de uso automatizado del endpoint exacto.

## Competencia: producto comparable frente a infraestructura complementaria

| Producto | Oferta observada en fuente propia | Precio/acceso comprobado y consecuencia |
|---|---|---|
| **Onsite** | Eventos, sponsors con niveles, empresa → apariciones, filtro por ICP y MCP. Su cobertura declarada es de miles de conferencias próximas, releídas mensualmente. | 1.000 créditos/mes gratis con próximos 30 días; Builder US$49/mes por 25.000 créditos y 12 meses futuros; Growth US$149/100.000; Scale US$299/300.000; Business US$499/600.000 y export completo a solicitud. Un registro consume un crédito. Es competidor directo, no un corpus open data. No usar sus listas de asistentes para este proyecto. [Sitio y precios](https://getonsite.dev/) |
| **PredictHQ** | Events API y herramientas de predicción de demanda; filtros geográficos/temporales, cambios y eventos eliminados. | Suscripción condiciona país y fechas sin necesariamente devolver error fuera del permiso; un resultado vacío no prueba ausencia. No se verificó tarifa numérica pública en la página consultada: obtener cotización. Las estimaciones de audiencia deben etiquetarse como estimaciones. [Events API](https://docs.predicthq.com/api/events/search-events), [Pricing](https://www.predicthq.com/pricing) |
| **SponsorUnited** | Inteligencia de sponsors, audiencias, evaluación de propuestas y benchmarks de acuerdos. | SPND ofrece precios estimados de transacción, no contratos públicos verificados. Acceso/precio mediante contacto comercial. Competidor de inteligencia, especialmente deporte y entretenimiento. [Plataforma](https://www.sponsorunited.com/platform), [Definición SPND](https://help.sponsorunited.com/en/articles/10166311-general-spnd-questions), [Acceso/precio](https://help.sponsorunited.com/en/articles/10166349-spnd-access) |
| **Luma** | Operación de calendarios, registros y publicación. | Plus US$59/mes facturado anualmente según vista consultada; 0% comisión de plataforma de eventos pagados frente al 5% de plan gratuito. No confundir comisión de plataforma con coste total de cobro. Es destino de borrador/integración, no fuente de discovery global libre. [Pricing](https://luma.com/pricing) |
| **Sessionize** | CFP, contenido, speakers y agenda. | US$499 + impuestos por **una ocurrencia** profesional; comunidad gratuita sólo bajo condiciones (no marketing/comercial/interna). Bulk con 5+ eventos por año negociado. Complementa agenda, no sustituye evidencia de sponsors. [Precios](https://sessionize.com/pricing) |
| **10times** | Directorio y herramientas de promoción/operación para organizadores. | Página propia ofrece planes de visibilidad y sincronización; eso no acredita licencia de exportación global. No se verificó API pública general de catálogo ni coste de esa licencia. No usar precios de terceros que venden wrappers de scraping como tarifa oficial. [Producto oficial](https://login.10times.com/platform), [Planes de promoción](https://login.10times.com/plans?type=unlimited) |

Todas las capacidades y cifras comerciales anteriores son declaraciones del proveedor verificadas en sus páginas, **no benchmarks independientes**. Un sponsor nombrado en un directorio o una página no acredita pago, exclusividad, disponibilidad ni interés actual en un nuevo evento.

## Arquitectura y costes que sí se pueden presupuestar

1. **Ingesta por fuente**: adaptadores pequeños con allowlist de campos, hashes de respuesta, cursor, rate limit, fecha y licencia. Mantener datos personales de invitados fuera del pipeline. Un registro republicado conserva múltiples fuentes, no múltiples eventos artificiales.
2. **Capas de identidad**: serie → edición → sesión/ocurrencia. Una clase semanal publicada es una ocurrencia válida del estrato comunidad; no equivale a una conferencia ni a una oportunidad B2B. Mantener el tipo visible en denominadores, mapa y shortlist.
3. **Evidencias**: cada assertion necesita fuente y localizador. Distinguir `observed`, `source_reported`, `derived`, `estimated` y `unknown`. El logo no permite derivar gasto. Un aforo no permite derivar asistencia. Un evento histórico no permite inferir que el sponsor siga interesado hoy.
4. **Enriquecimiento selectivo**: deduplicar y filtrar ICP primero; buscar paquetes de patrocinio, noticias y reportes de resultados sólo en candidatos de alta señal. Conservar assertions contradictorias y las fechas de validez.
5. **Generación**: perfil público de empresa → campos solicitados al usuario (objetivo, ICP, región, fecha, presupuesto) → retrieval citado → shortlist → propuesta y draft local. Publicar sólo con autorización específica posterior.

Para una ejecución de 30.000 filas con páginas de 100, el mínimo teórico son 300 peticiones, **antes** de descartes y reintentos. A un máximo autoimpuesto de 1 petición/segundo, el piso es 5 minutos más latencia y procesamiento; no es un benchmark observado ni una promesa de SLA. El manifiesto real permite calcular bytes, segundos, páginas, filas aceptadas por petición y ratio de descarte.

No fijar un coste ficticio de IA por 30.000 registros: la normalización de JSON no necesita LLM. Estimar gasto de inferencia como `documentos_enriquecidos × tokens_entrada × tarifa_entrada + tokens_salida × tarifa_salida`, más búsqueda/licencias y tiempo de revisión. Las tarifas de proveedores se deben fijar al seleccionar proveedor/modelo. Ninguna compra, suscripción o API pagada se activó en esta tarea.

## Benchmark técnico separado de relevancia humana

| Dimensión | Medición reproducible | Estado |
|---|---|---|
| Recolección | HTTP válidos, reintentos, bytes, duración, fuente/mes, raw vs aceptados | Extraer de manifests; no del conteo anunciado por API |
| Identidad | duplicados por ID; candidatos por título+fecha+lugar; falsos merges en revisión | El ID elimina duplicado de fuente, no resuelve todas las republicaciones |
| Datos | FKs, fechas, coordenadas, country derivado, fuentes, integridad CSV/SQLite, campos vacíos | Ejecutar QA del paquete |
| Relevancia ICP | Precision@10 y utilidad 1–5 con evaluadores y ejemplos estratificados por país/tipo | **No medido**; no reemplazarlo con volumen |
| Patrocinio | precisión sponsor nombrado y nivel vs evidencia; tasa de precio/contrato verificable | **No medido** para el lote municipal; no asumir cobertura |
| Impacto de producto | tiempo hasta shortlist, correcciones del usuario, eventos ejecutados, leads con consentimiento, pipeline atribuido | Requiere piloto y datos propios; **no observado** |

Recomendación de piloto: usar Helsinki como **piloto técnico de integración y calidad geográfica** por la API abierta y estructura estable. Para validar Event GTM B2B, elegir por separado un conjunto de conferencias tech con densidad documentada de sponsors y páginas oficiales; la selección geográfica final debe derivar del estrato B2B del paquete consolidado, no del gran volumen municipal finlandés. Así se conserva cobertura internacional sin hacer pasar disponibilidad de datos por oportunidad comercial.

## Reproducción del lote municipal

```sh
python3 scripts/acquire_helsinki.py --per-month 500
```

Desde la raíz de este paquete, ese comando reusa checkpoints existentes y alcanza hasta 500 ocurrencias elegibles por cada ventana mensual. Para continuar a una cuota mayor, cambiar `--per-month`; el cursor conserva la página final y vuelve a leerla deduplicando los IDs ya guardados, de modo que no pierde la cola que excedió la cuota previa. El filtro de inicio local mantiene ventanas disjuntas.

La ejecución acelerada puede usar tres procesos con `--partitions 3 --partition 0`, `--partition 1` y `--partition 2`; cada uno trabaja meses disjuntos. Un lock de archivo global impone como máximo un inicio de request por segundo entre todos los procesos. No lanzar simultáneamente un colector sin particiones y colectores particionados. Los summaries parciales llevan sufijo `partN`; los checkpoints por ventana y los batches son la evidencia autoritativa.

En la primera observación de 25 requests, la latencia media fue aproximadamente 5,6 segundos por página. Esta cifra es diagnóstico de esa muestra y no una garantía de servicio. Se mantiene el SHA256 de cada respuesta y del archivo normalizado, no el body bruto con campos de contacto descartados. Los errores tienen URL, intento, hora y estado; hay hasta cuatro intentos para fallos temporales. Un 401/403 no se reintenta mediante otro medio.

El QA municipal también produce `manifests/helsinki-dedup-candidates.json`: grupos con mismo título normalizado, inicio exacto y lugar nativo. Esos grupos son **candidatos de republicación**, no duplicados adjudicados; no se fusionan por defecto. El conteo de IDs únicos de fuente no debe presentarse como garantía de igual número de eventos físicos distintos. Los registros con precisión de día requieren todavía más cuidado para no colapsar sesiones diferentes.

### Cierre después de interrupción

La colección inicial usó cuota 500 por ventana. Tras una interrupción, se reanudó con cuota 250 para completar las 60 ventanas sin borrar los meses con más datos ya guardados. Por tanto las cuotas finales varían por ventana y **no deben interpretarse como ponderación poblacional**. El command de continuación usado fue `python3 scripts/acquire_helsinki.py --per-month 250 --partitions 3 --partition N`, con N=0,1,2 en procesos distintos y limitador global compartido. El comando `--summarize-only` congela los conteos de la descarga final, verifica hashes y emite candidatos de deduplicación sin fusionarlos.

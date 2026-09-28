# Infraestructura, mapas y costos para Event GTM

Fecha de consulta: **2026-09-28**. Investigación documental; no se contrataron servicios ni se cambió la aplicación. Precios en USD, sin impuestos, descuentos negociados ni promesas de capacidad. Las cifras calculadas son escenarios, no cotizaciones.

## Decisión recomendada

**Mantener TypeScript + PostgreSQL como sistema operativo del producto; usar almacenamiento de objetos para evidencia autorizada y Parquet/DuckDB para análisis histórico fuera de la ruta de usuario. Conservar MapLibre y hacer del mapa una vista secundaria.** Para un piloto, Supabase Pro + dos servicios Railway —Next.js y worker— es una combinación proporcional; R2 resulta útil cuando los archivos y exportaciones justifican otro proveedor. Neon es una alternativa válida de base de datos, pero no presupuestaría ahorro por suspensión mientras pg-boss consulta la misma base continuamente.

**No contratar un vector store separado, un data warehouse ni infraestructura mundial de tiles ahora.** Primero medir recuperación con SQL/FTS, latencia real y cobertura de datos. Para geocodificación mundial persistente, evaluar MapTiler Flex contra un conjunto de direcciones reales y aclarar los derechos de almacenamiento/exportación del uso concreto antes de integrarlo. Mapbox requiere una decisión de producto y licencia propia; su geocodificación temporal no puede alimentar el cache persistente actual.

Estas son **recomendaciones**. Capacidades y tarifas externas se citan junto a cada afirmación; lo observado en el repo y las hipótesis se identifican por separado.

## 1. Qué demuestra el dataset y qué existe en el repo

**Hecho interno al corte final:** 97 ediciones, 259 fuentes, 5.961 afirmaciones y 665 relaciones empresa–edición; 48 países conocidos, 0 zonas horarias y 0 coordenadas. Las 24 comparaciones funcionales siguen siendo sintéticas, sin labels humanos ni outcomes. Es una muestra documental con vacíos de procedencia/cobertura, no evidencia de que haga falta búsqueda vectorial. El gate conserva sus conteos parciales históricos; prevalece el [QA final](../checkpoints/qa-results.json) y el [informe de calidad](../quality_report.md).

**Hechos del código leído:**

- `frontend/package.json` usa `maplibre-gl` 6.9.0. `components/research-dashboard/sf-event-map.tsx` toma por defecto `https://tiles.openfreemap.org/styles/liberty`, conserva atribución y mantiene la lista cuando falla el mapa. Centro, zoom y lenguaje están orientados a SF; cambiar la fuente de tiles no convierte esa UI automáticamente en una vista mundial.
- `lib/server/geocoding/census.ts` tiene una interfaz de proveedor y un adaptador US Census que rechaza resultados fuera de San Francisco, California y el condado `06075`. No cubre expansión global.
- `lib/server/geocoding/cache.ts` persiste resultados con claves que incluyen proveedor, versión, consulta normalizada y versión de fuente; aplica 3 consultas/run, 30/día y una por segundo. Esas cuotas son una decisión actual del producto, no cuotas universales de otro proveedor.

**Inferencia:** conservar las interfaces, trazabilidad, estados inciertos y fallback del mapa tiene más valor que reemplazar el renderizador. Una búsqueda geográfica devuelve una propuesta de ubicación; no demuestra que una edición ocurra allí ni que su patrocinio funcione.

## 2. Dónde debe vivir cada dato

| Capa | Uso recomendado en este producto | Límite que conserva |
|---|---|---|
| PostgreSQL relacional | Tenants, empresas, series, ediciones, roles, fuentes, claims, conflictos, runs/steps, decisiones y permisos | Identidades, restricciones, fechas y relaciones consultables no quedan escondidas en prompts |
| JSONB validado | Payload de proveedor, campos opcionales y snapshots versionados de una decisión | JSON válido no implica contrato de dominio válido; validar y registrar `schema_version` |
| FTS + búsqueda lexical | Títulos, empresas/alias, sectores, fragmentos autorizados; filtros previos de fecha/geo/permisos | La coincidencia textual recupera candidatos; no decide veracidad |
| pgvector, opcional | Recuperar descripciones semánticamente próximas cuando un benchmark muestre faltantes lexicales | Embedding y similitud no son evidencia ni confidence |
| Object storage privado | HTML/PDF autorizado, exportaciones, imágenes permitidas, manifest y hashes | No equivale a permiso para copiar todo lo accesible públicamente |
| Parquet + DuckDB | Históricos congelados, cobertura, deduplicación exploratoria, backtests por fecha y costo | Exportación derivada; no segunda fuente de verdad para la aplicación |

PostgreSQL ofrece índices sobre JSONB; este formato no preserva exactamente espacios, orden de claves ni claves duplicadas. Si interesa probar qué documento se leyó, guardar los bytes originales autorizados y su hash, no reconstruirlo desde JSONB. Evitar un único documento gigante actualizado por todos los workers: las actualizaciones bloquean la fila completa. [JSON de PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html).

Para texto, GIN es el índice preferido por la documentación de full-text search; `pg_trgm` aporta similitud de cadenas y búsquedas tolerantes a diferencias. **Recomendación:** combinar campos estructurados, alias y diccionario lingüístico explícito; no aplicar stemming inglés a todos los nombres internacionales. [Índices FTS](https://www.postgresql.org/docs/current/textsearch-indexes.html), [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html).

pgvector permite búsqueda exacta y aproximada. En índices aproximados, los filtros pueden aplicarse después del recorrido y devolver menos candidatos; las exploraciones iterativas ayudan, pero no hacen innecesario medir recall. **Recomendación:** empezar por SQL elegible y búsqueda exacta en conjuntos pequeños; introducir ANN solo con comparación humana, filtros de tenant y fechas, latencia y costo medidos. [pgvector, documentación del proyecto](https://github.com/pgvector/pgvector).

RLS permite políticas por fila y, habilitado sin política aplicable, deniega por defecto. Superusuarios y roles `BYPASSRLS` la omiten; el propietario normalmente también, salvo `FORCE ROW LEVEL SECURITY`. Las restricciones referenciales tienen excepciones. **Recomendación:** rol de aplicación sin bypass, contexto de tenant limitado a la transacción y pruebas con tenant señuelo en lecturas, workers, exportaciones y URLs de archivos. No confiar solamente en el filtro enviado por el navegador. [Seguridad por filas](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

DuckDB lee/escribe Parquet y empuja proyecciones y filtros al lector. Para este dataset basta un proceso de exportación/analítica con manifest: fecha de corte, consultas, versiones, hashes y política de acceso. La documentación actual distingue concurrencia local y opciones remotas; no es correcto afirmar que DuckDB jamás permite múltiples escritores. Aquí no se necesita agregar DuckLake ni un servidor remoto para analizar 97 ediciones. [Parquet](https://duckdb.org/docs/current/data/parquet/overview), [concurrencia](https://duckdb.org/docs/current/connect/concurrency).

**Recomendación de retención:** guardar `rights_status`, URL/términos/versionado del permiso, `fetched_at`, `valid_at`, hash, extractor y `retention_until`. Si el derecho no permite conservar el documento, mantener referencia y metadatos permitidos. Exportar con un manifest de derechos; un Parquet no pierde las restricciones originales. R2 permite reglas de expiración por edad/prefijo, útiles para ejecutar esta política; no sustituyen una política de borrado en SQL, backups y exports. [Lifecycle de R2](https://developers.cloudflare.com/r2/buckets/object-lifecycles/).

## 3. Dos opciones de infraestructura proporcionales

| Opción | Componentes | A favor | Costos/riesgos que no esconder |
|---|---|---|---|
| **A — preferida para piloto** | Supabase Pro/Postgres; Railway Pro para web y worker; R2 cuando hagan falta archivos históricos | Reduce trabajo inicial si también se aprovecha Auth; SQL sigue siendo portable | Dos procesos consumen recursos aun con pocos usuarios; restore a un punto temporal y ambientes extra no están incluidos en el ejemplo |
| **B — alternativa** | Neon Launch/Postgres; los mismos web/worker y R2 | Separación clara entre base, aplicación y objetos; cómputo medido | Elegir y presupuestar autenticación; polling puede impedir suspensión; tarifa vigente y egress requieren reconfirmación |

Supabase publica Pro a $25/mes, 8 GB de disco incluidos y $0,125/GB adicional; incluye 100.000 MAU de Auth, 250 GB de egress y backups diarios con siete días. Su almacenamiento de archivos incluye 100 GB; puede evitar introducir R2 en un piloto pequeño. PITR es adicional. [Planes Supabase](https://supabase.com/pricing). El cómputo se cobra por hora y los planes pagos aportan $10 de crédito: Micro $0,01344/h, Small $0,0206/h y Medium $0,0822/h. El spend cap no cubre ese cómputo. [Facturación de compute](https://supabase.com/docs/guides/platform/manage-your-usage/compute).

Railway Pro tiene mínimo $20/mes aplicado al consumo, no $20 adicionales a todo consumo. Publica contenedores a $10/GB-mes de RAM, $20/vCPU-mes y $0,05/GB de egress. Se suman web y worker; no se presupuestó una VM de agentes, cuyo tarifario es distinto. [Planes y unidades Railway](https://docs.railway.com/pricing/plans).

R2 Standard publica $0,015/GB-mes, $4,50/millón de operaciones A y $0,36/millón B; incluye 10 GB-mes, un millón A y diez millones B. El egreso directo desde R2 no cobra transferencia; otro servicio intermediario sí podría cobrar. No elegir Infrequent Access automáticamente: tiene recuperación y permanencia mínima. [Tarifas R2](https://developers.cloudflare.com/r2/pricing/).

**Incertidumbre explícita de Neon:** la página actual de pricing devolvió `Unsupported content-type: text/markdown` al lector; el acceso de red del shell tampoco resolvió el dominio. Los anuncios oficiales abiertos documentan Launch $0,106/CU-h desde noviembre de 2025 y storage $0,35/GB-mes; una actualización de diciembre elimina el mínimo de $5 y describe restore history a $0,20/GB-mes. El artículo antiguo conserva $0,14 en otro párrafo: prevalece la reducción posterior para la simulación, pero **no es una confirmación de tarifa contractual actual**. [Reducción de compute](https://neon.com/blog/major-compute-price-reduction-on-neon), [modelo de cobro y actualización](https://neon.com/blog/new-usage-based-pricing), [pricing pendiente de reconfirmación](https://neon.com/pricing).

**Inferencia operativa:** un worker que consulta PostgreSQL con regularidad puede mantener activa la base. No calcular Neon como si todos los periodos sin usuarios fueran cero horas; medir actividad real y conexiones del worker. La documentación del proveedor describe suspensión tras inactividad; eso no es lo mismo que ausencia de usuarios humanos. [Neon sobre suspensión](https://neon.com/blog/new-usage-based-pricing), [pg-boss](https://pgboss.io/).

## 4. Mapas: renderizado, tiles y geocodificación son decisiones distintas

MapLibre GL JS es una biblioteca para renderizar mapas; no incluye un servicio gratuito de tiles ni una API mundial de geocodificación. [Proyecto MapLibre](https://maplibre.org/projects/gl-js/).

| Servicio | Tarifa/cuota documentada relevante | Atribución, retención y límites | Encaje |
|---|---|---|---|
| **OpenFreeMap público + MapLibre** | Tiles sin cobro, sin clave ni límites publicados de vistas/requests | Sin SLA; conservar atribución OpenMapTiles/OSM. No incluye geocoding | Ya usado por el repo; proporcional al piloto con fallback de lista |
| **MapTiler Flex** | $30/mes; 25.000 sesiones, 3.000 sesiones de búsqueda y 500.000 API requests. Exceso: $2,50/1.000 sesiones o $0,15/1.000 requests | El cliente utilizado determina unidad; términos distintos para tiles y resultados de búsqueda | Candidato para tiles o geocoding; medir costo sin confundir sesiones con requests |
| **Mapbox GL JS + geocoding permanente** | Primeras 50.000 cargas web sin cargo; siguiente tramo $5/1.000. Geocoding permanente $5/1.000 en primeras 500.000 consultas | Temporal no se persiste. Permanente permite guardar, pero no implica sublicenciar/distribuir un dataset | Alternativa completa, pendiente de encaje contractual para datos exportables |
| **Nominatim público / tiles públicos OSM** | No tarifa de SaaS ni capacidad contratada | Nominatim máximo 1 request/s, sin autocomplete; restricciones de bulk. Tiles públicos sin SLA, sin descargas masivas/offline | No base de un motor automático global en producción |

Fuentes por fila: [OpenFreeMap](https://openfreemap.org/), [MapTiler pricing](https://www.maptiler.com/cloud/pricing/), [Mapbox pricing](https://www.mapbox.com/pricing), [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/), [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/). Los datos OSM y los servidores que los entregan son cosas distintas; revisar atribución y obligaciones ODbL cuando se cree/distribuya una base derivada. [Licencia OSM](https://www.openstreetmap.org/copyright).

### Contabilidad y derechos que cambian la elección

**MapTiler:** MapLibre directo factura API requests; MapTiler SDK JS o su integración habilitada factura sesiones. Una tesela vectorial representa un request; raster 512 puede representar cuatro. No sumar nuevamente los tiles ya incluidos en una sesión SDK. El batch geocoding cuenta por consulta, no por petición HTTP. La documentación detallada limita la sesión por duración/volumen; el escenario supone sesiones breves sin dividirse. [Sesiones frente a requests](https://docs.maptiler.com/guides/account/sessions-vs-requests/).

El plan gratuito de MapTiler está orientado a pruebas/uso no comercial: 5.000 sesiones y 100.000 requests, con suspensión al superar cuota; no se usa como presupuesto comercial estable. [Planes](https://www.maptiler.com/cloud/pricing/), [condiciones Cloud](https://www.maptiler.com/terms/cloud/).

**MapTiler, permiso de datos:** sus condiciones permiten bulk de geocoding con atribución de la base y uso externo de resultados de búsqueda; restringen bulk de tiles, proxy y cache de contenido cartográfico. **Decisión abierta:** confirmar el encaje de un catálogo multiusuario exportable y qué sobrevive a la terminación antes de prometer retención perpetua o reventa. Registrar la respuesta contractual como evidencia; la excepción para geocoding no habilita exportar mapas. [Condiciones Cloud](https://www.maptiler.com/terms/cloud/), [condiciones generales](https://www.maptiler.com/terms/).

**Mapbox:** geocoding temporal prohíbe cache; `permanent=true` permite conservación indefinida. La documentación requiere tarjeta válida o contrato para ese modo y dice que las respuestas se usan junto a un mapa Mapbox; pricing dirige a ventas y excluye distribución/sublicencia de resultados permanentes. No es un reemplazo transparente de Census + cache + OpenFreeMap. **Decisión abierta:** confirmar plan y derechos para el producto concreto, especialmente CSV/API para clientes. Su límite por defecto documentado es 1.000 requests/minuto; autocomplete puede facturar cada tecla. [Geocoding API](https://docs.mapbox.com/api/search/geocoding/), [pricing](https://www.mapbox.com/pricing), [atribución](https://docs.mapbox.com/help/dive-deeper/attribution/).

**Nominatim público:** la política exige identificación y cache; prohíbe autocomplete y restringe consultas sistemáticas. Trabajos periódicos o de más de un día tienen restricciones adicionales. No presupuestar 50.000 enriquecimientos automáticos recurrentes sobre ese endpoint gratuito. Usar proveedor que autorice la carga o evaluar infraestructura propia cuando exista justificación; el software abierto no elimina costos operativos. [Política oficial](https://operations.osmfoundation.org/policies/nominatim/).

### Expansión global sin inventar geografía

**Recomendación:** mantener separados ubicación observada en fuente, resultado de geocoder y resolución humana. Guardar proveedor/versión/fecha, consulta, candidatos, precisión —país, ciudad, recinto, interpolada— y relación con la edición. País desconocido sigue nulo; normalizar «Allemagne» es distinto de inferir «Cannes → France». Un resultado por sede de organizador no localiza todas sus ediciones. Nunca colocar el centroide urbano como si fuese dirección del evento.

Para validar un proveedor: muestra de 30–50 direcciones reales del dataset y sus faltantes, idiomas/escrituras, recintos homónimos y eventos itinerantes. Medir error de ciudad/país, abstención, precisión útil, conflictos y derechos, además de costo. La lista debe funcionar cuando no haya coordenadas; pedir al usuario confirmar ambigüedades solamente cuando afecten su decisión.

## 5. Escenarios de costo: 100, 1.000 y 10.000 usuarios activos

**Hipótesis propias, no medición del repo ni garantía de escala.** MAU es un número de usuarios; no es una unidad de cobro universal. Para comparar, definimos explícitamente carga por mes y una sola organización/proyecto productivo. Los free tiers se asumen disponibles íntegros para este proyecto.

| Hipótesis | 100 MAU | 1.000 MAU | 10.000 MAU |
|---|---:|---:|---:|
| Aperturas breves de mapa, 6/usuario | 600 | 6.000 | 60.000 |
| Tiles vectoriales nuevos, 20/apertura | 12.000 | 120.000 | 1.200.000 |
| Geocodes únicos de ingesta, no por vista | 500 | 5.000 | 50.000 |
| Disco DB medio, índices incluidos | 1 GB | 10 GB | 50 GB |
| R2 Standard medio | 10 GB-mes | 100 GB-mes | 1.000 GB-mes |
| Operaciones R2 A / B | 5.000 / 50.000 | 50.000 / 500.000 | 500.000 / 5.000.000 |
| RAM media combinada web+worker | 1 GB | 2 GB | 4 GB |
| CPU media combinada web+worker | 0,10 vCPU | 0,25 vCPU | 1 vCPU |
| Egress Railway | 10 GB | 50 GB | 250 GB |
| DB elegida solo para simular | Micro / 0,25 CU | Small / 0,5 CU | Medium / 1 CU |
| Horas de DB activa | 730 | 730 | 730 |
| Cambios retenidos Neon, si restore activo | 1 GB-mes | 5 GB-mes | 20 GB-mes |

El volumen de archivos depende de la política de snapshots, no del MAU: multiplicar HTML, PDF e imágenes puede elevarlo sin un solo usuario nuevo. El tamaño de compute es una hipótesis presupuestaria; no se ha probado que sostenga concurrencia, pg-boss y consultas de esa población.

### Infraestructura sin mapas ni adquisición

| Cálculo mensual | 100 MAU | 1.000 MAU | 10.000 MAU |
|---|---:|---:|---:|
| Supabase Pro + compute + disco | $25,00 | $30,29 | $80,26 |
| Railway Pro, web+worker | $20,00 | $27,50 | $72,50 |
| R2 Standard | $0,00 | $1,35 | $14,85 |
| **A: subtotal conocido** | **$45,00** | **$59,14** | **$167,61** |
| Neon Launch: compute + storage + cambios retenidos, tarifa histórica oficial | $19,90 | $43,19 | $98,88 |
| **B: subtotal conocido con Railway + R2** | **$39,90** | **$72,04** | **$186,23** |

Fórmulas reproducibles: Supabase = `25 + max(0, tarifa_hora × 730 − 10) + max(0, GB_DB − 8) × 0,125`; Railway = `max(20, RAM × 10 + CPU × 20 + egreso × 0,05)`; R2 = `max(0, GB_mes − 10) × 0,015` porque las operaciones propuestas caben en sus franquicias. Neon = `CU × 730 × 0,106 + GB_DB × 0,35 + GB_cambios_retenidos × 0,20`. Se redondea al final. Tarifas: [Supabase compute](https://supabase.com/docs/guides/platform/manage-your-usage/compute), [disco/plan](https://supabase.com/pricing), [Railway](https://docs.railway.com/pricing/plans), [R2](https://developers.cloudflare.com/r2/pricing/), [Neon compute](https://neon.com/blog/major-compute-price-reduction-on-neon), [Neon storage/restore](https://neon.com/blog/new-usage-based-pricing).

**Límites:** A supone egreso de Supabase dentro de 250 GB. B no incluye autenticación ni egress de DB cuyo tarifario vigente no quedó confirmado; su subtotal no es un TCO equivalente. Tampoco se asigna a Launch un SLA de otro plan. Una base pequeña siempre activa puede costar más que su almacenamiento; evitar usar un ejemplo scale-to-zero como promesa de factura mínima.

### Mapas y geocodificación, sumables a cualquiera de los subtotales

| Variante, bajo la carga definida | 100 MAU | 1.000 MAU | 10.000 MAU |
|---|---:|---:|---:|
| OpenFreeMap + coordenadas ya verificadas/autorizadas; **sin servicio geocoder nuevo** | $0 | $0 | $0 |
| OpenFreeMap + MapTiler Flex solo para geocoding* | $30 | $30 | $30 |
| MapLibre directo + tiles MapTiler Flex + geocoding* | $30 | $30 | $142,50 |
| MapTiler SDK JS, sesiones + geocoding separado* | $30 | $30 | $117,50 |
| Mapbox GL JS Map Loads + geocoding permanente* | $2,50 | $25 | $300 |

\* Tarifas calculables, **encaje de retención/exportación pendiente** como se explicó arriba. No autorizan por sí solas un catálogo redistribuible.

MapTiler directo: `30 + max(0, tiles + geocodes − 500.000) / 1.000 × 0,15`. Con SDK: `30 + max(0, sesiones − 25.000) / 1.000 × 2,50`; los geocodes de estos ejemplos caben en la bolsa separada de requests. Mapbox: `max(0, cargas − 50.000) / 1.000 × 5 + geocodes / 1.000 × 5`, válido para estos tramos, **no extrapolar más allá de 100.000 cargas o 500.000 geocodes**. No confundir su plan Map Loads con Map Seats. Fuentes: [MapTiler tarifas](https://www.maptiler.com/cloud/pricing/), [unidades por cliente](https://docs.maptiler.com/guides/account/sessions-vs-requests/), [Mapbox tarifas](https://www.mapbox.com/pricing).

**Resultado práctico del escenario A:** OpenFreeMap + MapTiler para geocoding daría **$75 / $89,14 / $197,61 al mes de componentes modelados**, sujeto a permiso de ese uso. Si se pagan también tiles MapTiler mediante MapLibre directo: **$75 / $89,14 / $310,11**. No presentar esos totales como costo completo del producto.

**Sensibilidad calculada:** en 10.000 MAU, 5 / 20 / 100 tiles por apertura producen 350.000 / 1.250.000 / 6.050.000 requests con geocoding incluido. MapTiler directo daría $30 / $142,50 / $862,50. Pan/zoom y remontar el mapa innecesariamente importan. Medir requests observados; «20» no es una característica prometida por el proveedor. MapTiler SDK reduce esa sensibilidad bajo sus reglas de sesión, a cambio de cambiar la integración actual.

**Fuera de todos los totales:** Exa/Apify u otra adquisición, modelos/embeddings, revisión humana, email, observabilidad paga, ambientes extra, backups independientes/PITR adicionales, alta disponibilidad, restauraciones, soporte, impuestos y tráfico no modelado. El tiempo de verificar evidencia puede dominar estos importes. El siguiente presupuesto comercial debe sumar estas líneas y dividir por recomendaciones útiles **etiquetadas por humanos**, no por respuestas generadas.

## 6. Pruebas que habilitan la elección definitiva

1. **Base y jobs:** matar/reiniciar worker con carga, probar idempotencia y tenant señuelo; medir actividad idle, conexiones y p95/p99. Esto decide compute y si Neon realmente suspende.
2. **Recuperación:** medir FTS/alias contra casos humanos por sector/idioma. Añadir vector solo si mejora recall o precisión útil bajo permisos y fechas, con costo explícito.
3. **Historia:** reconstruir una decisión con exportación y datos disponibles a su fecha; probar restauración de DB y objetos. Copiar Parquet no constituye backup suficiente del sistema.
4. **Geografía:** evaluar la muestra multicultural, separar resultado de geocoder de evidencia original y mantener abstención. Verificar permiso de retención/exportación y atribución antes de persistir respuestas de un proveedor nuevo.
5. **Mapa:** instrumentar apertura, requests, errores y fallback; probar límite de presupuesto sin bloquear lista/dossier. Separar la cuenta/API key de pruebas de producción y restringir orígenes cuando el proveedor lo permita.

**Decisión práctica:** avanzar con Postgres y el MapLibre existente; empezar por Supabase Pro y worker/web separados si aún no hay proveedor elegido, evitando migrar una base operativa solo por esta comparación. Mantener OpenFreeMap con fallback durante validación. Evaluar MapTiler como geocoder mundial persistible y proveedor opcional de tiles; cerrar derechos y benchmark de ubicación antes de activarlo. No adoptar Mapbox temporal para el cache actual, Nominatim público para enriquecimiento recurrente ni pgvector por anticipación.

El registro estructurado de tarifas, fuentes, incertidumbres y cálculos está en [infra-prices.json](../batches/infra-prices.json).

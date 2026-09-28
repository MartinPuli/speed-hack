# Fase 2 — costes y opciones de MVP

Corte de precios: **28 de septiembre de 2026**. Tarifas oficiales en USD salvo otra indicación. No se crearon cuentas, claves, servicios ni geocódigos; ningún precio es factura de GrowthX. El detalle de 26 fuentes, 42 tarifas y reglas de crédito está en [fase2-cost-sources.md](phase2-cost-sources.md); [estructura de precios](notes/phase2-vendor-prices.json), [tarifas OpenAI y fórmulas](phase2/cost-model.json).

**La revisión humana domina el coste del piloto.** El modelo y búsqueda cuestan alrededor de USD0,14 por flujo bajo el pipeline hipotético; diez minutos de revisión a USD40/h agregan USD6,67. No hay aceptación humana observada para dividir por “resultado útil”. El coste/licencia comercial de datos históricos permanece desconocido y fuera de las cifras base.

## Hechos verificados y alternativas

| Componente | Precio comprobado | Decisión para un primer ensayo |
|---|---:|---|
| Base PostgreSQL en Supabase|Free USD0; Pro desde USD25/mes|Ya hay Postgres/worker en la arquitectura del repositorio. Reutilizar la infraestructura configurada; Supabase es referencia pública, no cambio requerido.|
| Neon Launch|USD0,106/CU-h+USD0,35/GB-mes, sin mínimo mensual actual|Merece medir idle/consulta si se elige un backend por consumo. El anuncio viejo de mínimoUSD5 queda supersedido por la página de planes vigente.|
| Cloudflare R2 Standard|USD0,015/GB-mes; tramo free10GB-mes y operaciones|Guardar sólo copias expresamente permitidas. El precio del objeto nunca otorga derecho a retener una fuente. No hubo almacén contratado.|
| Google Geocoding|10.000 eventos facturables free; comienzaUSD5/1.000|La retención general de lat/long se limita a30días. La excepción indefinida aislada por usuario no sustenta un índice permanente compartido.|
| Mapbox Permanent Geocoding|USD5/1.000 primeras500.000; sin free publicado|Permite persistencia bajo limitaciones de uso propio, no distribución/sublicencia general. La disponibilidad exacta requiere confirmar producto/contrato.|
| MapTiler Flex|USD30/mes;25.000 sesiones de mapa,3.000 de búsqueda,500.000 API|Mejor candidato a pequeña prueba con geocodificación por lote y resultados persistentes/exportables con atribución, sujeto a términos. PlanFree es para uso no comercial o I+D.|
| Nominatim público OSMF|Sin tarifa monetaria|No usar como geocoder backend masivo: límite1req/s, sin autocomplete ni búsqueda sistemática de conjuntos; requiere identificación/atribución. Especificación y política oficiales leídas, sin llamadas.|
| Exa Search|USD7/1.000 solicitudes, hasta10 resultados|Puede descubrir URLs que parsers locales no hallan. No usar como fuente de verdad ni sumar al crawler cuando no aporta registros nuevos.|
| Firecrawl Hobby|USD19 mensual o equivalente16/mes anual,5.000créditos;Free1.000|Acelera extracción de páginas autorizadas. JSON añade4créditos/página; parseo PDF cobra por página. Primero probar contra fuentes selectivas y medir edición nueva útil.|
| Luma Plus|USD59/mes facturado anualmente|Necesario para API documentada en el análisis de producto. Preparación manual local evita el plan en el MVP, sin crear un evento real.|

Fuentes y límites por SKU/API: [Supabase](https://supabase.com/pricing), [Neon](https://neon.com/docs/introduction/plans), [R2](https://developers.cloudflare.com/r2/pricing/), [Google Maps](https://developers.google.com/maps/billing-and-pricing/pricing), [Mapbox](https://www.mapbox.com/pricing), [MapTiler](https://www.maptiler.com/cloud/pricing/), [Nominatim](https://operations.osmfoundation.org/policies/nominatim/), [Exa](https://exa.ai/docs/admin/pricing), [Firecrawl](https://www.firecrawl.dev/pricing), [Luma](https://luma.com/pricing). El informe de fuentes distingue tramos progresivos, pagos anuales, límites, atribución, caché, licencias y errores del lector. No se comparan precios de nube como benchmark de rendimiento.

## Modelos y tamaño del trabajo

La documentación actual cobra por millón de tokens. Tarifas Standard de texto: GPT-6 Luna **USD0,10 entrada / USD0,50 salida**; GPT-6 Sol **USD2/10**; GPT-6 Astra **USD10/50**. Entrada con cache hit: USD0,01/0,20/1,00 respectivamente; escritura de caché: USD0,125/2,50/12,50. Web Search API cuesta USD10/1.000 llamadas más tokens de resultados. Embeddings text-embedding-3-small: USD0,02/1M tokens. [Tarifas oficiales OpenAI](https://developers.openai.com/api/docs/pricing), [embeddings](https://developers.openai.com/api/docs/models/text-embedding-3-small).

Escenario por flujo completo: brief4.000/500tokens enLuna; búsqueda3 llamadas y6.000tokens de resultados de entrada Sol; síntesis12.000/2.000 Sol; borrador8.000/1.500 Sol; escalado Astra8.000/1.000 en10%de casos. Aritmética tarifaria: USD0,10065/modelos + USD0,03/búsqueda; factor1,10por reintentos asumidos ⇒ **USD0,143715 por flujo**. Son entradas/salidas hipotéticas no tokenizadas ni ejecutadas. No incluye extracción no autorizada, licencia, mapas, aplicación, impuestos ni revisión humana. Si se usara un paso igual de costoso30veces/mes para la misma empresa, estimación USD1,386; una actualización semanal se estima USD0,185. No se presupone que la interfaz genere borrador nuevo en cada refresco.

## Escenarios mensuales de planificación

Supuestos:10/100/1.000 clientes ×4flujos por mes; catálogos1.000/10.000/100.000 ediciones; actualización500/5.000/50.000 páginas compartidas a3000/500 tokens Luna por página;10min revisión por flujo aUSD40/h y1min para2% de páginas en revisión; MapTiler FlexUSD30, map/search sesiones por flujo. R22/20/200GB mes; DBUSD25/25–75/75–250 y workerUSD15–60/30–150/150–600 son **rangos de presupuesto de planificación**, no cotizaciones ni mediciones. A4.000 sesiones el escenario de crecimiento añadeUSD2,50 por1.000 sesiones de búsqueda sobre el tramo Flex incluido, sumandoUSD32,50.

|Escenario|Flujos/mes|Modelos+extracción y búsqueda|Mapa|BD, worker, almacenamiento|Total tecnológico|Revisión humana|Total mensual ilustrativo|Total inferior por flujo|
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|Piloto,10 clientes|40|USD6,05|USD30|USD40–85|USD76–121|USD273|USD349–394|USD8,73|
|MVP,100 clientes|400|USD60,51|USD30|USD55–225|USD146–316|USD2.733|USD2.879–3.049|USD7,20|
|Crecimiento,1.000 clientes|4.000|USD605,11|USD32,50|USD328–850|USD863–1.488|USD27.333|USD28.196–28.821|USD7,05|

El reparto “modelos+extracción y búsqueda” del cuadro agrega el costo de modelos para adquisición y flujo más el coste de llamadas Web Search; redondeado. No hay tarifa de licencia probada. Las filas sólo son válidas si la organización puede usar las fuentes y retener sus hechos. En la sensibilidad de `cost-model.json`, permisos/licencias se dejan desconocidos; hipotéticamente añadir USD500 o USD5.000/mes aumenta el costo completo en ese importe. No son precios consultados ni se asume capacidad de contratación.

El total por flujo desciende al repartir costes fijos sobre más uso; la revisión humana continúa en USD6,67/flujo, sin escalarse en eficiencia. A crecimiento son683horas/mes de revisión. Por tanto una experiencia gratuita no puede sostener investigación humana ilimitada salvo que haya financiación, límites por usuario o monetización validada. Estos escenarios no constituyen una proyección de demanda.

## Construir, licenciar, combinar

- **Construir adquisición:** adecuado para calendarios y páginas de organizadores accesibles bajo permisos claros; da IDs, conflictos y lineage propios, pero no aporta automáticamente derecho de reventa ni escala universal. Trabajo y revisión dominan antes que bytes almacenados.
- **Licenciar directorios:** podría acortar descubrimiento o agregar historia de sponsors, pero proveedores cotizados requieren comprobar cobertura, año, ID, actualización, exportación, derecho a exhibir/derivar/borrar, uso en embeddings y precio. No se obtuvo cotización ni prueba comparativa y no se recomienda comprar ahora.
- **Combinar:** catalogación autorizada de organizadores, datos de clientes/organizadores consentidos y búsqueda puntual para cubrir vacíos. Desduplicar antes de enriquecer; guardar para cada assertion fuente/rol/acceso. Comprar Exa/Firecrawl sólo cuando una evaluación paralela pruebe mayor dato útil por dólar que parsers permitidos.

## Una economía que se pueda medir

Separar costo de descubrimiento/ingesta compartida, consulta/modelos por flujo, mapa por sesión, geocodificación única, base/worker, revisión humana y licencia. Registrar llamadas, páginas, tokens reales de entrada/salida/cache, error, repetido, coordenadas nuevas, minutos QA, aceptación y resultado. El denominador para “costo por resultado útil” debe ser una recomendación o shortlist que usuario real juzgó útil según rúbrica previa; hoy es **no medido**, no cero.

Atribuir costo de datos compartidos a cohortes/mes sin cobrar de nuevo la misma extracción por cada cliente; mantener sensibilidad a proveedores de precio variable y permisos. Para producto gratuito probar límite de ediciones/evidencias, no eliminar revisión esencial. Revisar tarifas al contratar y cada trimestre: planes, cuota de búsqueda, condiciones de geocoding y términos de contenidos pueden cambiar.

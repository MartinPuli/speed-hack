# Fase 2 — recuperación y arquitectura de consulta

Consulta de fuentes primarias: **2026-09-28**. Alcance: diseño investigado para las **688 ediciones y 66 contratos lógicos de entrega**, sin crear una aplicación, instalar motores, generar embeddings ni aplicar una migración. Las capacidades documentadas se distinguen de las recomendaciones de diseño. No se presentan cifras de latencia, memoria, precisión o coste no medidas.

**Recomendación:** comenzar con filtros relacionales y búsqueda textual; mantener evidencia/versiones separadas de las proyecciones para consulta. Evaluar vectores exactos sobre candidatos filtrados cuando aparezcan fallos de vocabulario. Reservar ANN, una base de grafos o GraphRAG para una necesidad medida. DuckDB/Parquet puede servir a análisis reproducibles. Esta es una decisión proporcional propuesta, no una comparación de rendimiento ganada por un motor.

Los **66 CSV son contratos de intercambio y auditoría**, no una obligación de desplegar 66 tablas de producción ni un motivo para borrarlas. Un esquema físico puede agrupar familias con vistas/exportadores que reconstruyan fielmente IDs, relaciones, estados y procedencia. El DDL y el microbenchmark local se entregan por separado; una medición SQLite/FTS no demuestra latencia de PostgreSQL/pgvector. [Contrato y diccionario actuales](data_dictionary.csv), [validación funcional de Fase 1](validation_report.md).

## Comparación de opciones

| Opción | Capacidad documentada | Cuándo aportaría / cuándo evitarla aquí |
|---|---|---|
| PostgreSQL relacional + FTS | `tsvector`/`tsquery`, normalización por configuración lingüística y búsqueda por lexemas. [Introducción oficial](https://www.postgresql.org/docs/current/textsearch-intro.html). | Base propuesta para fechas, países, estados y relaciones; texto para tema/título. No confundir coincidencia léxica con afinidad comercial. |
| PostgreSQL JSONB | Datos JSON descompuestos e indexables; admite convivencia con columnas relacionales. No preserva orden, espacios ni claves duplicadas del original. [Tipos JSON](https://www.postgresql.org/docs/current/datatype-json.html). | Metadatos heterogéneos y evidencia estructurada; columnas tipadas para filtros críticos. Evitar un único documento enorme y JSONB como copia forense exacta de la fuente. |
| pgvector híbrido | Vecinos exactos por defecto; HNSW/IVFFlat aproximados. La documentación combina FTS con búsqueda vectorial y propone RRF o reranker. [Repositorio oficial](https://github.com/pgvector/pgvector). | Probar cuando sinónimos, idioma o descripciones amplias fallen en FTS. La exactitud del vecino matemático no demuestra relevancia del evento; no activar ANN por el número de CSV. |
| DuckDB + Parquet | Consulta directa de Parquet, selección de columnas y filtros durante lectura; puede omitir bloques mediante estadísticas disponibles. [Documentación](https://duckdb.org/docs/current/data/parquet/overview). | Snapshots de cobertura, cohortes, auditoría y ablaciones. No hace falta duplicar ahora el corpus en otro servicio si SQL local resuelve las preguntas. |
| Grafo explícito | PostgreSQL admite recorridos recursivos con detección de ciclos; Cypher expresa caminos de longitud variable y predicados. [CTE](https://www.postgresql.org/docs/current/queries-with.html), [Cypher](https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-paths/). | Ensayar si predominan preguntas de caminos entre empresa, edición, comunidad y sponsor. Para relaciones conocidas de pocos saltos, comenzar midiendo joins; una base de grafos no convierte un vínculo ambiguo en hecho. |
| Microsoft GraphRAG | Pipeline de entidades/relaciones/claims, comunidades y resúmenes generados; salidas tabulares Parquet y embeddings. [Indexación](https://microsoft.github.io/graphrag/index/overview/). | Preguntas exploratorias sobre corpus narrativos extensos. No regenerar mediante LLM las relaciones ya verificadas del dataset ni adoptar resúmenes como evidencia canónica. |
| Contexto largo | Permite presentar más documentos al modelo, pero capacidad nominal no equivale a recuperación fiable. Estudios originales probaron sensibilidad a posición, longitud y complejidad. [Lost in the Middle, 2023](https://arxiv.org/abs/2307.03172), [RULER, 2024](https://arxiv.org/abs/2404.06654). | Comparar como baseline sobre un paquete acotado de evidencia, midiendo tokens y respuestas. Los resultados de modelos de esos estudios no se extrapolan a modelos de 2026. |

**FTS concreto.** `websearch_to_tsquery` procesa texto de búsqueda con comillas, OR y exclusiones sin errores de sintaxis de consulta; `setweight` permite ponderar campos y `ts_rank_cd` considera proximidad. No elimina la necesidad de consultas SQL parametrizadas. Los pesos son parámetros a validar, no probabilidades. [Controles FTS](https://www.postgresql.org/docs/current/textsearch-controls.html). PostgreSQL recomienda GIN para FTS; se decide índice/plan midiendo el corpus y consultas reales. [Índices](https://www.postgresql.org/docs/current/textsearch-indexes.html). Propuesta: título/alias/taxonomía separados del texto descriptivo; configuración por idioma cuando sea conocido y tratamiento conservador de marcas/identificadores. No aplicar stemming inglés indiscriminadamente al corpus multilingüe.

**Filtros y vectores.** pgvector advierte que ANN filtra después del barrido del índice y puede devolver menos filas; ofrece iterative scans, índices parciales y particiones. Los scans iterativos también tienen límites. Propuesta: comparar primero búsqueda exacta dentro del subconjunto elegible; si se evalúa ANN, medir recall frente a esa referencia bajo los mismos filtros. Combinar posiciones de listas evita sumar directamente distancias y scores de escalas distintas; el método concreto también requiere evaluación. [Filtering, iterative scans y hybrid search](https://github.com/pgvector/pgvector). Este párrafo no afirma resultados medidos aquí.

**DuckDB: precisión sobre concurrencia.** En modo embebido, la documentación limita lectura/escritura a un proceso con varios hilos; múltiples procesos pueden leer sin escritores. La documentación actual también describe Quack en beta y DuckLake con catálogo PostgreSQL: sería incorrecto afirmar que no existe ninguna alternativa multiproceso. Ninguna se adopta en esta propuesta. [Concurrencia oficial](https://duckdb.org/docs/current/connect/concurrency). Para análisis, proponer snapshots inmutables con manifiesto/versiones y conservar tipos, monedas, unidades y nulos; no crear un segundo origen editable de verdad.

**GraphRAG no es simplemente consultar un grafo.** Local search mezcla entidades y fragmentos; global search combina informes de comunidades mediante map-reduce y la propia documentación lo califica como intensivo en recursos. [Query engine](https://microsoft.github.io/graphrag/query/overview/). Puede estudiarse para preguntas como temas transversales de muchos recaps; para recuperar fecha, paquete y sponsor exactos, usar hechos canónicos. No se probó su utilidad, rendimiento o coste con este corpus.

## Diseño propuesto de identidad, evidencia y tiempo

Las siguientes reglas son propuestas propias basadas en los fallos observados en Fase 1; no capacidades atribuidas automáticamente a un motor. [Conflictos](data/observed/data_conflicts.csv), [fuentes](data/observed/sources.csv), [versiones](data/observed/record_versions.csv).

| Elemento | Invariante de diseño |
|---|---|
| Identidad | Mantener `event_id`, `series_id`, `company_id` y IDs de publicación nativos separados. Cambiar título, fecha, plataforma o marca no cambia por sí solo el ID. Las fusiones necesitan alias, evidencia y posibilidad de reversión. |
| Afirmación | Conservar `assertion_id`, entidad/campo, valor, fuente, localizador, clase de evidencia, derivación y conflicto. Una afirmación indexada sigue provisional aunque su texto resulte muy similar a la consulta. |
| Documento recuperable | Proyección pequeña por entidad/edición y ámbito; fragmentos de fuente con `source_id`, `snapshot_id` cuando exista, localizador y hash. No unir paquetes de una edición con sponsors de otra en un bloque indistinguible. |
| Evidencia original | JSONB no reemplaza bytes originales: conservar hash/documento original solo cuando se permita. URL, breve nota propia y localizador pueden bastar cuando no esté permitida retención completa. |
| Índice/embedding | Derivado reemplazable: hash del texto, versión de normalización, modelo/dimensión/versión y fecha de construcción. Una corrección invalida las proyecciones afectadas; no requiere recalcular entidades ajenas. |
| Permisos | Aplicar tenant, acceso y uso autorizado antes de recuperar/generar. Embeddings, cachés y resúmenes deben seguir las mismas restricciones de retención/borrado que su material de origen. |
| Consulta | Registrar brief/versiones, filtros, fecha de corte, IDs candidatos, evidencia utilizada y método. Devolver evidencia y restricciones junto al resultado, no solo texto generado. |

Separar **tiempo del hecho**, **publicación**, **captura**, **observación del sistema** y **vigencia**. Para preguntar qué sabía este sistema en una fecha, usar versiones ya observadas en ese corte; para reconstruir qué podía saberse públicamente antes de un evento, exigir una versión/captura que respalde realmente ese contenido. Una fecha antigua impresa en una página leída hoy no habilita automáticamente sus afirmaciones para un backtest.

El corte temporal debe aplicarse también a resúmenes, relaciones y texto indexado. El evento recomendado puede ocurrir después del corte; lo que no puede proceder del futuro es la evidencia usada para recomendarlo. Como Fase 1 obtuvo cero capturas Wayback, muchos hechos no serán elegibles para una evaluación histórica estricta. Es preferible reconocer ese vacío que rellenarlo con el estado actual. [Límite temporal documentado](validation_report.md).

## Recorrido mínimo de recuperación

1. **Interpretar el brief con revisión.** Producir restricciones tipadas y supuestos visibles; no convertir presupuesto desconocido en cero ni deducir disponibilidad de una descripción.
2. **Formar el universo elegible en SQL.** Permisos, edición, estado, país/radio con precisión conocida, fechas, modalidad y corte. Si precio total es restricción dura y falta, separar el candidato como condicional.
3. **Buscar sobre ese universo.** Baseline textual; variante vectorial solo si existe embedding válido. Mantener los mismos IDs/filtros al comparar y registrar candidatos omitidos.
4. **Ampliar evidencia por IDs.** Traer paquetes, audiencia, relaciones y noticias pertinentes para la edición; calcular agregados con SQL. No pedir al modelo contar sponsors leyendo todo el CSV.
5. **Explicar con un paquete acotado.** Entregar hechos, fuentes, conflictos y faltantes. Un resumen generado es derivado; el texto recuperado es información, no instrucciones para ejecutar acciones.
6. **Registrar y evaluar.** Separar candidatos descubiertos, aprobados, recomendados y aceptados por usuario. Invalidar caché al cambiar versión, permisos o restricciones; limitar su vigencia por fuente/campo.

No se fija aquí un `top-k`, tamaño de fragmento, dimensión vectorial o TTL universal: dependen del tipo de pregunta, evidencia necesaria y resultados medidos. Tampoco se infiere que los 66 archivos quepan —o no quepan— en un contexto concreto sin medir su representación y tokens.

## Qué justificaría añadir complejidad

| Cambio | Prueba necesaria antes de adoptarlo |
|---|---|
| FTS → híbrido | Consultas reservadas con fallos léxicos reales; mejora de relevancia juzgada o recall etiquetado sin violaciones duras ni pérdida de evidencia. |
| Vector exacto → ANN | Latencia/coste exactos insuficientes bajo carga definida; medir recall y candidatos completos con filtros selectivos. No extrapolar un ejemplo del README. |
| SQL → grafo dedicado | Preguntas de caminos repetidas y difíciles de mantener; comparar planes, corrección y operación sobre las mismas relaciones. |
| Recuperación acotada → GraphRAG/contexto largo | Preguntas globales donde aporten respuestas correctas adicionales, con referencias verificables y coste/actualización medidos. |
| CSV/SQLite → DuckDB/Parquet analítico | Necesidad real de scans/repetición/versiones a escala; comprobar paridad, tipos y resultados, sin duplicar estados editables. |

Medir por separado: tiempo de ingestión/indexado, latencia de consulta fría/caliente y extremo a extremo, memoria, tokens, trabajo humano, frescura, errores de filtros y calidad de respuesta. Comparar FTS, híbrido, grafo y contexto largo con corpus/versiones iguales. Los tres casos sintéticos de Fase 1 no aportan etiquetas humanas para decidir relevancia. Este subestudio solo leyó documentación oficial y resúmenes primarios de los dos artículos; **no ejecutó nuevos benchmarks ni aplicó esta arquitectura**.

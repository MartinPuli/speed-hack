# Continuación exacta después de Fase 1

Corte: **2026-09-28**. Este documento permite reanudar lo efectivamente pendiente; no ejecuta compras, contactos, APIs autenticadas ni Fase 2. La referencia del estado es [extraction_queue.csv](data/observed/extraction_queue.csv), con **12 lotes**. Se conservan a continuación sus IDs, URLs, prioridades, filtros, cursores, bloqueo y condición de cierre; las horas y responsables son propuestas de planificación, no trabajo medido ni equipo contratado.

## Lote operativo inmediato

Primero resolver `extraction_queue_3b64295034f0fee8` (PyBay) y `extraction_queue_c4b499e64664f35d` (PyCon Ireland), porque afectan decisiones próximas. Después continuar `extraction_queue_9f92b174dd35be7e`: **35 núcleos futuros de los feeds ya retenidos**, sin añadir ediciones supuestas. Este orden operativo no modifica las prioridades guardadas en el CSV.

1. Cargar `event_editions.csv` y `platform_listings.csv`; seleccionar las ediciones futuras/en curso originadas en los dos feeds, no todos los enlaces por nombre de plataforma.
2. Ordenar por `start_date`, después `id`; abrir la URL canónica publicada por el organizador mediante acceso permitido. Conservar `event_id` aunque cambien fecha o recinto.
3. Revisar fecha, zona, estado, registro/precio, vigencia, modalidad y lugar. No tratar anuncio, venta activa o fecha pasada como asistencia efectiva. Separar revisión técnica y derechos comerciales.
4. Añadir en una ejecución posterior afirmaciones/versiones y conflictos; no sobrescribir la evidencia anterior. Guardar checkpoint por `event_id`, URL, resultado y campos pendientes después de cada registro.
5. Terminar cuando las 35 tengan nueva evidencia o estado explícito `stale`/bloqueado/desconocido; no exigir que desaparezcan todos los vacíos ni sustituirlos con inferencias. Pasar QA y recomputar cobertura antes de recomendar.

**Ventana:** el CSV conserva `2021-09-28`–`2026-09-28` en sus lotes. En el lote de actualización futura, la acción descrita en la propia cola exige el subconjunto futuro a partir del corte; la fecha final máxima del corpus es `2027-11-30`. Registrar esa ventana operativa en la próxima ejecución sin reinterpretar la ventana histórica como un filtro que descarte los futuros. No se modificó el CSV en este cierre.

## Los 12 lotes existentes

`attempts` está vacío en estas filas: significa sin conteo consolidado en la cola, **no cero intentos**. Recuperaciones fallidas concretas están en `fetch_attempts.csv`, `notes/additional-sources.json` y notas por lote. Último punto procesado declarado por la cola: 2026-09-28. No hay cursor remoto de paginación probado salvo que una futura integración lo devuelva; los cursores siguientes son checkpoints descriptivos reales.

### 1. `extraction_queue_8e198ccb3fd4e723`

- **Fuente:** [https://www.python.org/events/python-events/](https://www.python.org/events/python-events/). Familia `calendar`; geografía `global`; segmento `Python`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `1` / `ready`. Bloqueo: `ninguno consignado`.
- **Checkpoint exacto:** `Two exports fully parsed; 10 RRULE records excluded`.
- **Campos a buscar:** UID, RRULE, RDATE, EXDATE, DTSTART/DTEND, zona horaria, ocurrencias limitadas a la ventana; diferencias entre feeds.
- **Siguiente acción guardada:** Inspect notes/*-recurrence-review.json; expand only bounded occurrences with EXDATE/RDATE semantics.
- **Condición de finalización guardada:** All10 rules audited; compare UIDs, not title only.
- **Responsable propuesto / esfuerzo activo estimado:** Ingeniería de datos + revisión de investigador; 4–8 h.

### 2. `extraction_queue_afb442fec94e8146`

- **Fuente:** [https://flip.org.br/ed/24a-flip/](https://flip.org.br/ed/24a-flip/). Familia `organizer`; geografía `Brazil`; segmento `culture`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `1` / `access_limited`. Bloqueo: `access_limited`.
- **Checkpoint exacto:** `Six index-only cores`.
- **Campos a buscar:** Seis fechas núcleo de Flip 2021–2026; fecha, modalidad y estado de celebración por edición. Separar resto de campos provisionales.
- **Siguiente acción guardada:** Obtain organizer-authorized export or accessible primary body; no bypass.
- **Condición de finalización guardada:** Each provisional date has body evidence or remains excluded from recommendations.
- **Responsable propuesto / esfuerzo activo estimado:** Investigación de fuentes en portugués; 2–4 h activas; espera de acceso no estimada.

### 3. `extraction_queue_3b64295034f0fee8`

- **Fuente:** [https://pybay.org/](https://pybay.org/). Familia `organizer`; geografía `United States`; segmento `technology`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `1` / `ready`. Bloqueo: `ninguno consignado`.
- **Checkpoint exacto:** `2026 price/deadline conflict`.
- **Campos a buscar:** Fecha, registro, deadline y precio de PyBay 2026; vigencia y fuente de cada valor. Retener diferencia Sept19/26 sin inventar disponibilidad.
- **Siguiente acción guardada:** Recheck dated organizer announcement and registration terms; no purchase.
- **Condición de finalización guardada:** Resolve Sept19/26 vs displayed tickets and refresh each future edition selected.
- **Responsable propuesto / esfuerzo activo estimado:** Analista de eventos; 1–2 h.

### 4. `extraction_queue_c4b499e64664f35d`

- **Fuente:** [https://2026.pycon.ie/blog/venue-change/](https://2026.pycon.ie/blog/venue-change/). Familia `organizer`; geografía `Ireland`; segmento `technology`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `1` / `ready`. Bloqueo: `ninguno consignado`.
- **Checkpoint exacto:** `Nov21 confirmed; venueTBA`.
- **Campos a buscar:** Fecha vigente de PyCon Ireland 2026, venue, zona horaria, registro y anuncio con fecha. El 21 de noviembre no confirma recinto.
- **Siguiente acción guardada:** Read next dated venue announcement; retain both versions.
- **Condición de finalización guardada:** Official venue and timezone, or explicit unknown.
- **Responsable propuesto / esfuerzo activo estimado:** Analista de eventos; 1–2 h.

### 5. `extraction_queue_d8452f6eaae65a95`

- **Fuente:** [https://docs.luma.com/reference/getting-started-with-your-api](https://docs.luma.com/reference/getting-started-with-your-api). Familia `platform`; geografía `global`; segmento `mixed`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `2` / `credentials_and_plan_required`. Bloqueo: `credentials_and_plan_required`.
- **Checkpoint exacto:** `Docs evaluated; no account API calls`.
- **Campos a buscar:** Eventos del calendario autorizado, IDs, fechas, lugares, visibilidad y paginación; contrastar lectura pública/propiamente gestionada.
- **Siguiente acción guardada:** Customer-authorized calendar sandbox; demonstrate read before create.
- **Condición de finalización guardada:** Scope/rights and fields verified; no publication without user instruction.
- **Responsable propuesto / esfuerzo activo estimado:** Integraciones + responsable de datos/contratos; 2–4 h de prueba una vez habilitado.

### 6. `extraction_queue_dd9bcfbcb5121d6b`

- **Fuente:** [https://www.eventbrite.com/platform/api](https://www.eventbrite.com/platform/api). Familia `platform`; geografía `global`; segmento `mixed`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `2` / `access_required`. Bloqueo: `access_required`.
- **Checkpoint exacto:** `Global search not established; reads429`.
- **Campos a buscar:** Corpus autorizado de organizador, ediciones, fechas y campos exportables; condiciones de retención y uso comercial.
- **Siguiente acción guardada:** Organizer-provided export or licensed data agreement.
- **Condición de finalización guardada:** Known authorized event corpus and retention rights.
- **Responsable propuesto / esfuerzo activo estimado:** Responsable de datos/contratos + integraciones; 2–4 h de evaluación una vez habilitado.

### 7. `extraction_queue_306a467d7fe2d21b`

- **Fuente:** [https://partiful.com/terms](https://partiful.com/terms). Familia `platform`; geografía `global`; segmento `social_culture`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `2` / `permission_required`. Bloqueo: `permission_required`.
- **Checkpoint exacto:** `Organizer outbound link read; no platform crawler`.
- **Campos a buscar:** Hechos de organizador con enlace Partiful, edición, anfitrión, lugar y fecha; permiso explícito si se plantea extracción directa.
- **Siguiente acción guardada:** Seek permitted organizer source or explicit agreement.
- **Condición de finalización guardada:** Commercial use and extraction basis documented.
- **Responsable propuesto / esfuerzo activo estimado:** Investigación + responsable de datos/contratos; 1–3 h de evaluación; espera no estimada.

### 8. `extraction_queue_671d85955019d3d4`

- **Fuente:** [https://archive.org/help/wayback_api.php](https://archive.org/help/wayback_api.php). Familia `archive`; geografía `global`; segmento `mixed`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `2` / `rate_limited`. Bloqueo: `rate_limited`.
- **Checkpoint exacto:** `One ordinary retry429; zero captures`.
- **Campos a buscar:** Disponibilidad, timestamp real de captura, URL original/archivada, hash si se permite y afirmaciones que la captura respalda.
- **Siguiente acción guardada:** Resume later from exact PyCon2022 availability query in additional-sources.json.
- **Condición de finalización guardada:** Dated captures for temporal holdout or explicit no capture.
- **Responsable propuesto / esfuerzo activo estimado:** Investigación histórica; 0,5–1 h de prueba acotada.

### 9. `extraction_queue_9f92b174dd35be7e`

- **Fuente:** [https://www.python.org/events/python-events/](https://www.python.org/events/python-events/). Familia `organizer_linked_pages`; geografía `global`; segmento `technology`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `2` / `ready`. Bloqueo: `ninguno consignado`.
- **Checkpoint exacto:** `652 UID rows already retained`.
- **Campos a buscar:** Fecha/zona, estado, lugar preciso, registro, ticket y costes publicados, deadlines, roles por edición y evidencia accesible; no invitados.
- **Siguiente acción guardada:** Sort upcoming date then enrich canonical URLs from platform_listings; checkpoint by event_id.
- **Condición de finalización guardada:** 35 calendar-future cores rechecked or marked stale; include pricing and venue.
- **Responsable propuesto / esfuerzo activo estimado:** Analista de eventos + QA; 6–12 h para 35 ediciones como hipótesis de planificación.

### 10. `extraction_queue_8d6a54f9c3c7c08a`

- **Fuente:** [https://www.firabarcelona.com/en/our-history/](https://www.firabarcelona.com/en/our-history/). Familia `institution`; geografía `Spain`; segmento `trade_fairs`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `3` / `scope_pending`. Bloqueo: `scope_pending`.
- **Checkpoint exacto:** `History inspected; not enumerated`.
- **Campos a buscar:** Lista nominal anual de ferias, fechas, organizador y recinto; separar capacidad, asistencia e impacto económico agregado.
- **Siguiente acción guardada:** Choose territory first, enumerate annual named fairs2021–2026 from official calendars.
- **Condición de finalización guardada:** Reference roster with audited denominator.
- **Responsable propuesto / esfuerzo activo estimado:** Investigación local + producto; 3–6 h para definir primer universo; extracción posterior por dimensionar.

### 11. `extraction_queue_01ff8eaa9b33daca`

- **Fuente:** [https://help.humanitix.com/en/articles/8888275-public-api-documentation](https://help.humanitix.com/en/articles/8888275-public-api-documentation). Familia `platform`; geografía `global`; segmento `mixed`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `3` / `customer_permission_required`. Bloqueo: `customer_permission_required`.
- **Checkpoint exacto:** `One public historical page read; no API`.
- **Campos a buscar:** Eventos propios/compartidos, fechas, estado y permiso explícito de retención histórica; excluir pedidos/personas no necesarios.
- **Siguiente acción guardada:** Obtain client authorization and applicable retention terms before ingest.
- **Condición de finalización guardada:** Own/shared events and past retention basis documented.
- **Responsable propuesto / esfuerzo activo estimado:** Responsable de datos/contratos + integraciones; 2–4 h una vez autorizado.

### 12. `extraction_queue_29bc37804d7842c4`

- **Fuente:** [https://www.meetup.com/graphql/guide/](https://www.meetup.com/graphql/guide/). Familia `platform`; geografía `global`; segmento `communities`; ventana CSV `2021-09-28` a `2026-09-28`.
- **Prioridad / estado guardados:** `3` / `commercial_permission_required`. Bloqueo: `commercial_permission_required`.
- **Checkpoint exacto:** `One historical group page read`.
- **Campos a buscar:** Grupos/eventos dentro de acceso aprobado, fechas, localización, estado y condiciones comerciales; sin miembros privados.
- **Siguiente acción guardada:** Pro approval plus written commercial consent; otherwise public organizer feeds.
- **Condición de finalización guardada:** Scope+cost+retention verified.
- **Responsable propuesto / esfuerzo activo estimado:** Responsable de datos/contratos + integraciones; 2–4 h una vez autorizado.


## Dependencias y condiciones que no deben confundirse

- **Tiempo pendiente:** revisión de diez reglas recurrentes, páginas canónicas futuras, campos de coste/registro y normalización semántica. Los dos feeds ya se parsearon: no reiniciar por volumen ni llamar a los registros RRULE diez eventos nuevos. Reanudar desde [recurrencias de eventos](notes/python-events-recurrence-review.json) y [recurrencias de grupos](notes/python-user-group-recurrence-review.json); respetar excepciones, zona y UID.
- **Acceso técnico limitado:** Flip, Wayback y algunas páginas devuelven 403/429/timeout. No eludir controles ni repetir indefinidamente. La prueba Wayback concreta fue [PyCon US 2022, objetivo 2022-04-01](https://archive.org/wayback/available?url=us.pycon.org%2F2022%2F&timestamp=20220401); cero capturas obtenidas. Solo una captura real con fecha podría sustentar disponibilidad histórica de sus campos.
- **Credenciales/plan:** Luma API requiere calendario y acceso autorizados; ningún token disponible probado. MCP y API tienen alcances distintos. Antes de cualquier escritura se necesita una instrucción del usuario sobre esa acción; este plan no crea/publica eventos.
- **Permisos/contrato:** Eventbrite, Partiful, Humanitix y Meetup no se desbloquean simplemente esperando o comprando una suscripción. Documentar extracción, conservación, redistribución y borrado para el uso propuesto. 10times tampoco pasa a autorizado porque no figure en la cola de 12 lotes.
- **Ámbito de producto:** Fira/cámaras/universidades y noticias locales requieren territorio y tipo de evento elegidos para construir un denominador. La ausencia de geografía no impidió el corpus exploratorio, pero impide afirmar cobertura exhaustiva.

Los esfuerzos no incluyen plazos de terceros, investigación contractual, adquisición de datos o desarrollo de conectores. No se expresan como coste monetario ni tarifas de infraestructura; deberán medirse sobre el primer lote.

## Pendientes adicionales detectados, aún sin fila propia en la cola

Esta lista distingue nuevos huecos de los doce lotes ya registrados. Deben añadirse como tareas explícitas en la siguiente ejecución autorizada, sin simular que ya están en `extraction_queue.csv`.

| Prioridad propuesta | Fuente/punto exacto | Filtro, campos y reanudación | Fin verificable |
|---|---|---|---|
| Alta | [Stanford 2023](https://events.stanford.edu/event/52nd_annual_stanford_powwow) y [EASA en 10times](https://10times.com/easa) | Una edición por fuente; Stanford requiere cuerpo primario accesible; EASA exige enlace de organizador encontrado mediante la página, sin adivinar endpoint | Estado fuente por campo actualizado o exclusión explícita de recomendaciones; no conteo como primaria verificada si persiste bloqueo |
| Alta | [notes/nontech-retrieval.json](notes/nontech-retrieval.json) y [nontech-facts.json](notes/nontech-facts.json) | Reanudar las observaciones `search_index`: Flip y campos provisionales FFT/CCR; preservar discrepancias y localizadores | Cada afirmación sigue provisional, se corrobora o se retira con motivo; no reemplazar fuente por confianza arbitraria |
| Alta | [Numeralia FIL](https://fil.com.mx/info/numeralia.asp?ids=1) y referencias de sponsors en el lote no tecnológico | Sponsors de cada edición, nivel/rol y años; contador publicado no se convierte en nombres | Inventario nominal autorizado/legible por año o ausencia explícita, sin completar con logos atemporales |
| Media | [Documentación Sessionize](https://sessionize.com/playbook/api) y [evento real revisado](https://sessionize.com/2024-all-day-devops/) | Separar demo ya leída de agenda real; solo endpoint publicado por organizador, sesiones/roles/fechas, dentro de permisos | Una agenda real con origen y configuración conocidos, o `not_obtained`; no enumerar identificadores |
| Media | [API DICE](https://partners-endpoint.dice.fm/graphql/docs/index.html), [pretix](https://docs.pretix.eu/dev/api/fundamentals.html), [Ticket Tailor](https://developers.tickettailor.com/docs/api/ticket-tailor-api/) | Solo corpus propio/autorizado que cubra el segmento elegido; contratos de acceso y campos, sin clientes privados | Prueba de lectura autorizada y permisos por uso, o bloqueo documentado; no asumir catálogo global |
| Media | [market-sources.json](notes/market-sources.json), [informe competitivo](phase1-market-access.md) | Transferir diez proveedores a `competitors.csv` preservando fecha, roadmap y desconocidos, si se amplía el dataset | Diez registros respaldados y QA; hoy la investigación existe en Markdown, esa tabla está vacía |
| Media | Universo local por definir desde Fira/instituciones y fuentes oficiales elegidas | Cámaras, municipios, pequeños eventos, prensa independiente, distribución y contexto de mercado | Roster de referencia explícito por año/territorio y auditoría estratificada; nunca porcentaje del mundo sin denominador |

Las URLs para fuentes nuevas no se inventan antes de seleccionar el ámbito. La investigación de adquisiciones y costes actuales de infraestructura queda expresamente para Fase 2, que este documento no inicia.

## Mantenimiento incremental propuesto

| Información | Frecuencia inicial propuesta | Disparador y regla |
|---|---|---|
| Evento elegido para actuar en los próximos 30 días: fecha, cancelación, registro, deadline y precio | Revisión antes de cada entrega/decisión; diaria solo para cambios críticos cuando el proveedor/permiso lo admita | Anuncio oficial fechado o cambio observado; 404 no significa cancelado. Guardar fecha de revisión y vencimiento por campo. |
| Próximos eventos a 31–180 días | Semanal | Revalidar estado y restricciones; revisión adicional antes de compra/propuesta. |
| Futuro más lejano | Mensual | No generar edición por periodicidad; confirmar cambios y pasar a mayor frecuencia al acercarse. |
| Agenda/sponsors/paquetes activos | Semanal o ante publicación; más cerca del deadline si cambia inventario | Versionar rol/nivel/edición; una desaparición no demuestra baja ni un acuerdo cerrado. |
| Histórico de fechas y roles | Trimestral o por conflicto/nueva fuente | Conservar corrección y validez histórica; no descargar todo de nuevo por consulta de usuario. |
| Señal de empresa usada en shortlist | Antes de cada recomendación, máximo semanal mientras sea candidata activa | Un cierre/cambio de marca puede retirar una candidata; registrar fuente, hecho y supuesto separados. |
| Audiencia y resultados | Tras el evento y al plazo convenido con el cliente | Separar previsto/declarado/medido; CRM y contratos requieren autorización; comparar únicamente definiciones compatibles. |
| Derechos, términos y versiones de API | Antes de incorporar fuente y cuando cambien contrato/interfaz | Si el uso ya no cabe en permiso, detener esa vía; preservar metadatos permitidos y cumplir borrado según contrato. |

Las frecuencias son hipótesis de operación por riesgo de cambio, no SLA demostrado ni acceso concedido. Medir solicitudes, minutos de revisión, cambios útiles y coste en el próximo lote antes de fijar un SLA comercial. Mantener identidad por edición, UID y alias revisados, con fusiones reversibles y fuente original; no fusionar por título parecido.

## Gate de cierre y reanudación

La Fase 1 entrega lo recuperado con [síntesis](phase1-research.md), [cobertura](coverage.csv), [manifiesto](run_manifest.json), [QA](qa-results.json) e [informe de validación](validation_report.md). Sus números deben reconciliarse con CSV y SQLite del mismo corte. Las métricas de benchmark y auditoría pertenecen al último informe; no se anticipan en esta cola.

Para considerar un lote terminado: checkpoint persistido, evidencia/limitación por campo, procedencia y derechos separados, deduplicación revisada, QA sin regresiones y conteos actualizados. Para iniciar recomendaciones comerciales: brief elegido, candidatos revalidados, restricciones críticas completas o explícitamente desconocidas y permiso de uso aplicable. La finalización exploratoria de Fase 1 no certifica un histórico global, licencias de reventa ni demanda pagadora.

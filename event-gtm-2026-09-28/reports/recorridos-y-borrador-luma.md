# Cuatro recorridos trazables y un borrador local

Los perfiles siguientes son **escenarios sintéticos** para inspeccionar el flujo. No son clientes, decisiones reales, pilotos ni resultados observados. Las ediciones y fuentes referenciadas sí forman parte del dataset; las propuestas permanecen en `derived/`.

## 1. Empresa → objetivo → antecedentes → alternativa

Una empresa hipotética de software logístico pide investigar presencia en Singapur antes de marzo de 2027. Su presupuesto total está pendiente. El documento de Deutsche Messe anuncia **Industrial Transformation ASIA-PACIFIC, 21–23/10/2026, Singapur**, y reporta por separado métricas de su edición 2025. [Fuente, páginas 1–2](https://www.hannovermesse.de/files/files/001/media/globale-bilder-downloads/presse/auslandsveranstaltungen/industry-logistic-worldwide-flyer.pdf).

Recorrido consultable: `event_editions.edition_key=itap-2026` → `series_id` → edición 2025 → `event_metrics`/`audience_metrics` → `assertions` → `sources`. El rol registrado de Deutsche Messe en el portfolio es `portfolio_publisher`; no se eleva automáticamente a organizador contractual.

**Salida:** alternativa para investigar si se confirma disponibilidad, encaje de audiencia y costo. No es aprobación para invertir. Falta vigencia actual del anuncio, que tiene posición impresa de marzo de 2026; faltan paquete, costo total y objetivo confirmado. Tampoco hay zona horaria/hora documentadas en este extracto. Las métricas 2025 no son resultados 2026.

## 2. Evento → audiencia → paquete → sponsor potencial

PyCon US 2026 tiene listado de sponsors, prospecto y tarifas. El prospecto describe audiencia técnica y paquetes anuales PSF + PyCon: **no son todos compras aisladas de una edición**. Sus cifras de audiencia son promocionales; no una verificación de asistentes. [Sponsors 2026](https://us.pycon.org/2026/sponsorship/sponsors/), [prospecto, páginas 7 y 9](https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/psf_sponsor_prospectus_feb26-compressed.pdf).

Recorrido: `pycon-us-2026` → `sponsorship_packages` → claims de precio/unidad/beneficios; y `event_company_roles` → NVIDIA, Google o Capital One. `sponsor_match_scores.csv` conserva tres ejemplos de afinidad histórica **sin score ni interés confirmado**. Un precio publicado del paquete no demuestra cuánto pagó una empresa concreta.

**Límite decisivo:** PyCon 2026 ya pasó. La investigación sirve como precedente para un concepto propio o para estudiar la serie. No permite ofrecer ese inventario hoy ni transferir sponsors a una edición futura. Falta el enlace de una oferta vigente y un sponsor que confirme su objetivo y presupuesto.

## 3. Noticia empresarial → señal → hipótesis

La entrevista de Modern Retail conecta las latas Heineken 0.0 del US Open con una expansión posterior al retail y recoge crecimiento de ventas onsite atribuido a la marca. [Entrevista original, 19/08/2025](https://www.modernretail.co/marketing/inside-heinekens-limited-edition-na-beer-campaign-at-the-us-open/).

Recorrido: artículo → `news_entity_links` → `us-open-tennis-2024` y `us-open-tennis-2025` → `company_signals` de expansión de distribución. La hipótesis es que un formato de prueba y distribución puede merecer investigación para una marca comparable. **No es una señal actual de que Heineken busque patrocinar nuestro evento**: tiene más de un año al corte de este estudio. Se desconocen absolutos, margen, inversión y atribución causal.

La corrección de una fecha discrepante de US Open 2025 queda en `data_conflicts`. Conservar la discrepancia evita que una nota secundaria sobrescriba el calendario primario. La lectura de una noticia puede mejorar preguntas y condiciones sin mejorar todavía un ranking medido.

## 4. Concepto propio → borrador para Luma

Se propone, de forma hipotética, una clínica de herramientas Python orientada a feedback. Las sesiones públicas de PyCon 2024 muestran precedentes de demostraciones técnicas de empresas; no prueban demanda ni éxito del concepto nuevo. [Agenda de sponsor presentations](https://us.pycon.org/2024/schedule/sponsor-presentations/index.html).

**Título propuesto:** Clínica de herramientas Python: probar un flujo y registrar qué falla.

**Descripción propuesta:** Taller para personas que desarrollan con Python y quieren probar un flujo concreto de una herramienta. Cada participante trabajaría sobre una tarea y registraría dónde necesita ayuda. La empresa y el organizador deben confirmar producto, audiencia, acceso y forma de recoger feedback antes de abrir el registro.

**Agenda propuesta, 90 minutos:** contexto de la tarea (15), prueba guiada (35), trabajo sobre problemas (25) y devolución (15). Es diseño del investigador, no un programa anunciado.

**Pendientes:** empresa real, comprador, producto, anfitrión autorizado, fecha/hora/zona, idioma, modalidad y lugar, presupuesto, aforo, inscripción/precio y permisos de medición. No hay speakers, sponsors o recinto confirmados. El CTA público solo se redacta al confirmar registro; ahora la acción interna es “completar y revisar”.

Se guardó `concept_hypothetical_python_feedback` en `event_concepts.csv` y `draft_local_python_feedback` en `luma_drafts.csv`. `draft_field_evidence.csv` distingue propuesta creativa y campo pendiente. `customer_briefs.csv` permanece vacío porque no se recibió un brief privado real. El ejemplo tiene `remote_id=null` y no es publicable.

### Campos y caminos de salida

La API REST documenta `name`, `start_at` y `timezone` como obligatorios. El título corresponde a `name`; propuesta, audiencia, idioma y agenda van en `description_md`; no son todos campos estructurados independientes. Lugar y enlace virtual usan `geo_address_json` o `meeting_url`; otros campos incluyen fin, capacidad, visibilidad, registro y tickets. Objetivo comercial, presupuesto y shortlist de sponsors permanecen en el brief privado. [Create Event](https://docs.luma.com/reference/post_v1-events-create).

| Camino | Qué se entrega | Efecto y límite |
|---|---|---|
| Contenido local para copiar | Texto y pendientes revisados | No requiere API. Persona completa campos en Luma. Recomendado para validar tiempo y correcciones. |
| MCP conectado por el usuario | Herramientas documentadas en su cuenta | No exige Plus; no se conectó ni se probó aquí. No equivale a índice histórico global o permiso de backend multicliente. [MCP](https://help.luma.com/p/mcp). |
| REST autorizado | Payload completo, credencial de calendario y aprobación | Requiere Plus según documentación. No se encontró estado de borrador remoto en `create`; evento privado no equivale a borrador. [Acceso REST](https://docs.luma.com/reference/getting-started-with-your-api). |

La aprobación de un texto no autoriza invitar personas ni contactar sponsors. La integración de escritura necesita autorización del efecto concreto, control de duplicados y gestión del resultado incierto después de un fallo. No se realizó ninguna de esas acciones.

## Muestra exportable para mapa

[map_candidates.csv](../derived/map_candidates.csv) conserva las 20 ediciones futuras del lote, con fechas, estado, geografía observada, fuente, responsables o editor del portfolio, precisión y pendientes. **Es inventario ilustrativo, no selección personalizada.**

No se obtuvieron coordenadas verificadas; por tanto no se dibujaron pines. Varias oportunidades solo tienen ciudad. La tabla puede alimentar una geocodificación autorizada posterior, manteniendo respuesta, proveedor, precisión y licencia. Una coordenada de centro urbano se rotularía “ciudad”, nunca “venue”. El CSV deja `map_display_eligible=false` hasta resolver ese paso; las oportunidades siguen siendo legibles como lista. [Comparación de proveedores y derechos](infraestructura-mapas-costos.md).

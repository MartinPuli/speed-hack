# Ejemplos trazables del flujo

Los ejemplos de perfil y evento propio son hipótesis funcionales, no recomendaciones personalizadas. No se eligió empresa, sector, geografía ni presupuesto. Ninguna organización fue contactada.

## Empresa → objetivo → evidencia → oportunidades

**Perfil sintético:** proveedor de formación Python que busca aprendizaje y conversaciones con equipos. Un prompt sin URL puede producir una primera exploración si deja claros objetivo, territorio, fechas y presupuesto. Si se aporta sitio web, se extraen sólo oferta, industria, mercados y audiencia publicados; el cliente confirma ideal de cliente, presupuesto y cuentas. Ingresos y presupuesto de una empresa no se deducen de sus logos.

| Oportunidad observada | Estado y fecha | Lugar publicado | Entrada publicada | Encaje y límite |
|---|---|---|---|---|
|[PyBay 2026](https://pretix.eu/bapya/pybay-2026/)|Anunciada, 3 oct 2026; fuente leída 28 sep|UCSF Mission Bay Conference Center, 1675 Owens St, San Francisco CA 94158|USD 200 individual; USD 375 corporativa; USD 40 estudiante|Tema Python; organiza Bay Area Python Association. La fecha límite del 19/26 sep ya pasó, pero la tienda aún mostraba tickets: disponibilidad sin resolver.|
|[PyCon Africa 2026](https://africa.pycon.org/)|Anunciada, 7–11 oct 2026; leída 28 sep|Speke Resort Munyonyo, Wavamunno Rd, Kampala|UGX 292.500 individual; UGX 604.500 corporativa; otras categorías en [entradas](https://africa.pycon.org/2026/tickets/)|Comunidad y tema Python. Organizan PyCon Uganda y PyCon Africa. No convertir UGX a USD sin cambio fechado ni tomar entrada corporativa por tarifa de patrocinio.|
|[PyCon NL 2026](https://www.pycon-nl.org/)|Anunciada, 15 oct 2026; leída 28 sep|Jaarbeursplein 6, 3521 AL Utrecht|Desconocido; Eventbrite sólo está enlazado|Fecha, tema y dirección publicados. Disponibilidad, entidad jurídica y presupuesto no verificados.|

El archivo `map-opportunities.csv` conserva fuente, fecha, zona horaria cuando la publica y precisión. Estos tres eventos tienen dirección, pero **coordenadas NULL**; `map-opportunities.geojson` utiliza `geometry:null`, nunca el punto ficticio (0,0). Geocodificar requiere permiso y revisión. Los eventos en línea aparecen aparte. Una ubicación aproximada de ciudad se rotula como aproximada y nunca se calcula distancia exacta desde un lugar desconocido.

## Evento → audiencia → oferta → sponsor por investigar

**Oferta histórica real:** el prospecto PyCon AU 2025 lista Standard AUD 7.000 y Gold AUD 10.000 ex GST, ambos con espacio de 2×2m. El mismo documento cita para PyCon AU 2024 más de 560 registros y 103 presentaciones. [Prospecto, páginas 8–12](https://2025.pycon.org.au/files/Sponsor%20PyCon%20AU%202025%20-%20Prospectus%20v3.pdf). No es inventario actual ni tamaño confirmado de la audiencia 2025.

La consulta del SQLite confirma Google (Visionary), Microsoft (Sustainability) y JetBrains (Contributing) como sponsors de PyCon US 2025. Se pueden investigar como candidatos para un evento Python aún por definir, verificando oferta y presencia actual. La relación publicada no prueba interés en Australia, disponibilidad, presupuesto ni patrocinio futuro.

Falta un brief real, audiencia del nuevo evento, exclusividad, paquete vigente e interés autorizado. No se calculó `sponsor_match_score` ficticio para llenar esos vacíos.

## Noticia → señal → cambio de hipótesis

[EdgeDB anunció que pasaría a llamarse Gel](https://www.geldata.com/blog/edgedb-is-now-gel-and-postgres-is-the-future); [Gel anunció el cierre de su compañía y la incorporación del equipo a Vercel](https://www.geldata.com/blog/gel-joins-vercel). La decisión propuesta es revisar Gel como compañía independiente y **no** heredar su historial a Vercel automáticamente. Esto sugiere investigar quién mantiene el producto si resulta pertinente; no demuestra presupuesto para sponsors.

## Concepto → borrador local preparado para Luma

**Propuesta hipotética:** “Clínica de evaluación de aplicaciones de IA con Python”. Como referencia de formato, AI Engine Summer Hack anunció 150 participantes previstos y dos tracks; es un anuncio, no asistencia ni prueba de demanda para este taller. [Boletín del organizador](https://aienginehack.beehiiv.com/p/join-us-at-ai-engine-summer-hack).

**Descripción propuesta para copiar después de confirmar los datos:** “Un taller práctico para definir y probar una evaluación pequeña de una aplicación de IA. Cada equipo saldría con criterios de calidad y un plan de medición. Anfitrión, lugar, fecha, facilitadores y registro pendientes”. Agenda tentativa de 90 minutos: 15 de objetivos, 45 de trabajo guiado, 20 de revisión y 10 de siguientes pasos. Idioma propuesto: español; falta confirmar. La llamada a registrarse queda pendiente hasta existir un enlace real.

No hay fecha/hora/zona, modalidad, recinto, anfitrión, capacidad, precio, facilitadores ni sponsors comprometidos. Presupuesto interno hipotético USD 2.000: recinto 600, facilitación 600, comida 400, materiales 100 y contingencia 300; son supuestos, no cotizaciones. Objetivo interno: aprendizaje y conversaciones con consentimiento; falta definir la métrica. La estrategia y presupuesto internos se conservan aparte de la página pública.

El MVP puede entregar texto local para revisar y copiar sin API. Más adelante, Luma documenta crear evento con `name`, `start_at` y `timezone` obligatorios; Plus cuesta USD 59/mes facturado anualmente. No se verificó un endpoint de borrador nativo. `private` y registro cerrado crean un evento real; omitir opciones abre registro y genera un ticket gratuito predeterminado. [Create Event](https://docs.luma.com/reference/post_v1-events-create), [precio](https://luma.com/pricing). En esta investigación no se llamó la API ni se publicó.

El objeto en `data/proposals/luma_drafts.csv` es un borrador local, sin ID Luma, y requiere los campos pendientes antes de enviar nada. La fuente de cada campo se guarda en `draft_field_evidence`.

# Acceso a fuentes de eventos y preparación para Luma

Fecha de consulta: **2026-09-28**. Ventana objetivo: **2021-09-28 a 2026-09-28**, más próximos eventos confirmados. Este informe evalúa vías de acceso; no constituye un censo global ni una autorización de reutilización. Geografía y segmento comercial siguen pendientes. Los hechos de documentación, las pruebas efectivas y las recomendaciones están separados.

## Conclusión operativa

**Conviene combinar fuentes de organizadores y archivos públicos con conexiones autorizadas de clientes. No hay evidencia de que una única API abierta cubra cinco años de eventos, sponsors y resultados globales.** El MCP actual de Luma facilita descubrir próximos eventos; ello reduce el valor diferencial de una app que solamente genere una lista conversacional. El valor a probar de Growth Atlas está en reconstruir antecedentes entre fuentes, distinguir papeles comerciales, conservar evidencia y convertirla en una decisión y un brief ejecutable.

Para el primer borrador, recomiendo **contenido local preparado para copiar**, sin crear un evento remoto. Una integración posterior deberá respetar permisos del usuario, planes, diferencias entre lectura y escritura y confirmación humana. No se hizo ninguna compra, conexión de cuenta, publicación, invitación ni consulta de listas privadas.

## Plataformas prioritarias

### Luma: distinguir cuatro accesos

| Acceso | Verificación y utilidad | Límite |
|---|---|---|
| Páginas públicas | Se abrió [Moth Hack 2026](https://luma.com/wmrrdpcj): Moth Quantum; programación del 26–27 de septiembre, actividad virtual y exposición en Londres; entrada gratuita declarada. | Es anuncio del anfitrión, no comprobación de celebración ni resultados; consulta individual, sin corpus redistribuido. |
| REST autenticado | Requiere Plus; clave por calendario en `x-luma-api-key`. [Inicio oficial](https://docs.luma.com/reference/getting-started-with-your-api). | Tener clave no concede un índice mundial. |
| Lectura puntual y calendario | `events/get` documenta detalle visible de eventos públicos ajenos (`access:view`); `calendars/events/list` admite cursores y before/after; puede incluir eventos listados de terceros. [Get](https://docs.luma.com/reference/get_v1-events-get), [List](https://docs.luma.com/reference/get_v1-calendars-events-list). | Campos de gestión omitidos; en listados ajenos la localización puede limitarse a ciudad. No se probaron llamadas autenticadas. |
| MCP | Cuenta Luma sin Plus; búsqueda pública por palabra, lugar y fechas; próximos eventos. Historial de eventos propios/asistidos según permisos. Permite gestionar eventos propios. OAuth usa Client ID Metadata Documents, no dynamic registration. [MCP oficial](https://help.luma.com/p/mcp). | Documentación verificada, conexión no ejecutada. No demuestra backfill global ni licencia comercial del corpus. |

La API documenta 200 peticiones/minuto por calendario y 500 por organización; respetar cabeceras y `Retry-After`. [Límites oficiales](https://docs.luma.com/reference/rate-limits).

**Precio observado:** gratis para uso básico; Plus **USD 59/mes facturado anualmente**, equivalente aritmético a USD 708/año. El plan gratuito anuncia comisión de plataforma del 5% en tickets pagos; Plus 0%; procesamiento Stripe aparte. No se verificó el precio mensual sin compromiso anual. [Precios](https://luma.com/pricing).

**Reutilización:** los términos limitan acceso a interfaces públicamente soportadas y restringen reutilización de contenido salvo permiso o usos bona fide mediante esas interfaces. Eso no acredita una licencia para copiar imágenes, descripciones completas o revender una base. [Términos, Acceptable Use e Intellectual Property](https://luma.com/terms). Recomendación: conservar hechos mínimos, URL y procedencia; revisar permisos específicos antes de ampliar retención/comercialización. El acceso técnico no resuelve esa revisión.

### Eventbrite

La referencia oficial indexada sigue marcando `events/search` como retirado desde **2019-12-12**; describe listados por organización y filtros históricos. Las aperturas directas de la referencia devolvieron 429/error; no se ejecutó autenticación ni se validó que una cuenta pueda consultar organizaciones ajenas. [Referencia](https://www.eventbrite.com/platform/new/api).

Los términos oficiales indexados contienen §13 sobre prohibición de scraping y uso comercial de Site Content. La página legal y los artículos devolvieron errores al abrir; esta constatación se registra como **documentación oficial indexada, verificación directa incompleta**, no como permiso para extracción. [Índice legal](https://www.eventbrite.com/corporate/legal/legalterms/), [Términos §13](https://www.eventbrite.co/help/en-ca/articles/251210/eventbrite-terms-of-service/).

**Decisión de adquisición:** detener automatización del catálogo sin vía aprobada; usar enlaces como pistas para buscar evidencia en las webs originales o solicitar exportaciones autorizadas del cliente en una fase futura. Precio de licencia histórica, cuotas actuales y derechos comerciales: **no verificados**. No se recolectó un lote de Eventbrite en este subtrabajo.

### Partiful

Los eventos públicos se indexan y se envían a Explore; son distintos de eventos privados. La documentación de privacidad restringe información de invitados a roles autenticados pertinentes y permite ocultar listas. [Eventos públicos](https://help.partiful.com/en-us/articles/15525563-what-is-a-public-event), [Privacidad de eventos](https://help.partiful.com/en-us/articles/15525648-how-does-partiful-protect-my-data).

Se abrió [Explore](https://partiful.com/explore): contiene eventos de Nueva York, Los Ángeles y SF. Algunas fechas son relativas y las cifras visibles carecen de definición suficiente para contarlas como asistencia. La página incluso distingue recomendaciones externas de eventos propios: descubrimiento no equivale a organización.

Los términos, revisión **2026-09-25**, condicionan explotación comercial a autorización escrita. [Commercial Use](https://partiful.com/terms). No se encontró documentación primaria de una API pública general en las búsquedas realizadas; eso no prueba que no exista alguna integración privada. No se utilizaron clientes no oficiales ni tokens extraídos del navegador. Histórico de cinco años, exportación global y licencia comercial: **pendientes/no demostrados**.

## Fuentes complementarias: acceso comprobado y alcance real

| Fuente | Vía y datos | Historia, precio y decisión |
|---|---|---|
| **Meetup** | GraphQL y OAuth; nuevos consumidores requieren Pro y revisión; pagar no garantiza aprobación. [Acceso](https://help.meetup.com/hc/en-us/articles/41453576628749-How-can-I-get-access-to-Meetup-s-API), [API](https://www.meetup.com/graphql/). | No se probó token ni cobertura histórica global. Integración de comunidades autorizadas; precio concreto pendiente. |
| **10times** | La plataforma anuncia API de intercambio de datos/leads para su dashboard. [Producto](https://login.10times.com/platform). | No se confirmó API abierta de inventario mundial. Los términos §VII restringen acceso automático y uso comercial salvo acuerdo. [Términos](https://10times.com/terms-of-service). No se scrapeó catálogo; licencia/precio/histórico requieren acuerdo. |
| **Sessionize** | Endpoints que publica el organizador para agendas, sesiones, speakers y salas; JSON/XML/iCalendar, lectura sin autenticación. [API](https://sessionize.com/playbook/developers/api). | Útil para enriquecer ediciones identificadas. Acceder solo a endpoints efectivamente publicados/autorizados, sin enumerar IDs. No hay censo global demostrado. El [endpoint de demo](https://sessionize.com/api/v2/jl4ktls0/view/All) respondió JSON; **es sintético, no entra al histórico**. |
| **pretix** | REST con tokens/OAuth y permisos por equipos/organizador/evento. [Conceptos](https://docs.pretix.eu/dev/api/fundamentals.html). | Permite integración con propietarios; no acceso anónimo global. [Recursos](https://docs.pretix.eu/dev/api/) incluyen eventos, fechas de series, items y exportadores. Cobertura/precio dependen del operador; no se autenticó. |
| **Ticket Tailor** | API disponible a usuarios para datos de su box office; claves limitadas a ese box office y permisos. Cursor; máximo 100 resultados/página y 5000 solicitudes/30 minutos documentados. [API](https://developers.tickettailor.com/docs/api/ticket-tailor-api/). | API propia no implica directorio global. Emitir tickets consume un crédito incluso si son gratuitos; aquí no se emiten. [Acceso/coste de emisión](https://help.tickettailor.com/en/articles/4593218-how-do-i-connect-to-the-ticket-tailor-api). Histórico concreto no probado. |
| **Humanitix** | API de lectura de eventos, órdenes, tickets y tags propios/compartidos; `x-api-key`; 200 solicitudes/minuto. [Ayuda oficial](https://help.humanitix.com/en/articles/8888275-public-api-documentation). | No inventario general. Términos API exigen consentimiento y restringen reventa independiente y productos competidores. [PDF, §3–4](https://static.humanitix.com/pdfs/api_terms_of_use.pdf). No se consultaron datos privados. |
| **DICE** | Ticket Holders GraphQL para eventos de un partner; token generado en MIO; datos comerciales/de asistencia sujetos a permisos. [Referencia oficial](https://partners-endpoint.dice.fm/graphql/docs/index.html). | No una API pública global de fans/eventos. No autenticado; precio y retención histórica no publicados en la referencia revisada. Página comercial dio 403. |
| **Internet Archive** | Availability busca captura por URL/fecha; CDX permite consultas del índice de capturas. [APIs](https://archive.org/help/wayback_api.php), [CDX oficial](https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server). | Recuperación por URL original, no catálogo de eventos. Prueba Availability para kubecon.io no accesible en la herramienta. Ninguna captura recuperada aquí; archivo no concede derechos sobre el original. |
| **Ticket Fairy, fuente adicional** | Documenta listado público sin clave, fechas, país, pasado/futuro, cursores y 120 solicitudes/minuto; MCP público. [Desarrolladores](https://www.ticketfairy.com/developers). | Endpoint real solicitado pero no accesible por web; intento Python falló DNS en sandbox. **Documentado, no validado en runtime**. Retención/reutilización comercial y profundidad temporal pendientes. Prioridad alta de siguiente prueba autorizada. |

La referencia de Sessionize expone un matiz: no requerir autenticación no significa que cualquier endpoint sea público; el organizador controla su publicación y puede contener campos privados. El método propuesto sigue el enlace desde la web pública de la edición, nunca adivina identificadores. [Datos y autenticación](https://sessionize.com/playbook/developers/api).

## Preparación para Luma: campos y efectos

La creación REST es `POST /v1/events/create`. La documentación exige `name`, `start_at` y `timezone`; admite estos campos adicionales. No aparece un estado `draft` en el contrato consultado. **Evento privado o registro cerrado no se debe etiquetar como borrador remoto.** [Create Event](https://docs.luma.com/reference/post_v1-events-create).

| Contenido del producto | Campo/destino |
|---|---|
| Título | `name` |
| Propuesta, audiencia, idioma, agenda, CTA | Texto de `description_md` |
| Inicio, fin, zona IANA | `start_at`, `end_at`, `timezone` |
| Presencial o enlace remoto | `geo_address_json` o `meeting_url`, excluyentes |
| Capacidad y espera | `max_capacity`, `waitlist_status` |
| Visibilidad y registro | `visibility`, `registration_open` |
| Entradas | `ticket_types`; gratuitas o pagas; Stripe conectado para pagas |
| Imagen | `cover_url` alojada en CDN Luma |
| Costes internos, sponsor shortlist, objetivo comercial | Brief privado de Growth Atlas |

**Recomendación de contrato local:** `draft_id`, versión, brief, campos propuestos, evidencias por campo y pendientes. Estados: `propuesta_local` → `requiere_datos` → `lista_para_revision` → `aprobada_para_exportar` → `contenido_exportado`. Un hipotético estado `evento_remoto_creado` exige ID real, respuesta comprobada y aprobación previa; no se alcanza en esta investigación. Separar aprobación de contenido y permiso de publicación.

El modelo no debe inventar fecha para satisfacer campos obligatorios, convertir un recinto sugerido en reserva ni trasladar sponsors de un precedente a la propuesta como acuerdos confirmados. Si faltan fecha/zona, puede producir contenido útil y mantener deshabilitada la escritura remota. La aprobación debería fijar un hash de campos; modificaciones posteriores requieren revisión nueva.

| Camino | Coste/fricción conocidos | Uso recomendado |
|---|---|---|
| Copiar contenido local | Sin API Luma; persona revisa/completa en su cuenta. | Primera validación; se puede medir correcciones y tiempo sin publicar durante research. |
| REST autorizado | Plus, secreto por calendario, permisos y mantenimiento del adaptador. | Integración del producto cuando haya necesidad comprobada y autorización de escritura. |
| MCP en asistente del usuario | No requiere Plus según documentación; cuenta y OAuth; alcance ligado al usuario. | Benchmark de la alternativa ya disponible. No asumir que sea licencia para backend multicliente ni importador histórico. |

Las capacidades de MCP están documentadas, pero no se conectó ninguna cuenta ni se enumeraron herramientas en una sesión autenticada. Su propia ayuda orienta las integraciones de producto hacia REST. [MCP, Other Clients y Access and Privacy](https://help.luma.com/p/mcp).

## Ejemplo local, hipotético y no publicable

**Supuesto ilustrativo:** una empresa hipotética ofrece herramientas creativas cuánticas y quiere una sesión de feedback. No es cliente real ni objetivo comercial aprobado.

- Título propuesto: “Laboratorio creativo: probar una idea con herramientas cuánticas”.
- Audiencia propuesta: creadores y desarrolladores principiantes; idioma pendiente.
- Agenda propuesta: introducción 15 min, trabajo guiado 45 min, demostraciones 30 min, feedback 15 min.
- Inspiración documentada: Moth Hack anuncia acceso sin experiencia cuántica y combinación de actividad virtual/exposición. Eso respalda que ese formato ha sido anunciado; no su eficacia. [Referencia](https://luma.com/wmrrdpcj).
- Pendientes bloqueantes de creación: anfitrión autorizado, fecha y zona; modalidad/lugar; precio/capacidad. Sponsors y speakers: ninguno confirmado.
- Brief interno: presupuesto pendiente; métrica propuesta “participantes que completan prueba y feedback”, a validar con comprador.

## Política de adquisición y cola concreta

**Recomendaciones derivadas del análisis:**

1. Priorizar archivos de ediciones de organizadores, prospectos, recaps y agendas públicas; corroborar roles por edición y no reutilizar descripción completa.
2. Conexión autorizada de clientes para paquetes, ventas y resultados; mantenerlos aislados. Nunca poblar asistencia/ROI con seguidores, registros o logos.
3. Luma: benchmark de descubrimiento MCP en cuenta autorizada; comprobar filtros, resultados, frescura y límites con consultas registradas. Sin publicación.
4. Ticket Fairy: validar petición documentada `GET /api/v1/events/listing?section_type=past&from=2021-09-28&to=2026-09-28&sort=start_date&order=asc&size=10`, comprobar términos comerciales y continuar cursores únicamente si la vía es válida. Finalizar al agotarse cursor o imponerse límite real; no inferir universalidad.
5. Sessionize: tomar endpoints publicados de eventos ya identificados por el lote principal y extraer agenda por edición. No incorporar su demo al dataset real.
6. Wayback: reintentar Availability con URL original de una edición desaparecida y fecha relevante; guardar timestamp de captura separado de fecha del evento. Si sigue inaccesible, continuar por fuentes independientes.
7. Eventbrite/10times/Partiful: licencia o acuerdo antes de adquisición masiva comercial. Precio y profundidad no verificados permanecen como bloqueo de acceso, no como tarea resuelta.

**Costes de este subtrabajo:** no se compró ni activó servicio; coste monetario de herramientas no observable desde estos resultados. No se midió coste por registro ni tasa de extracción. El JSON asociado guarda hechos y resultados de pruebas, no archivos íntegros de contenido protegido ni datos de invitados.

**Resultado:** fuentes viables pero heterogéneas, derechos pendientes y ventajas del histórico todavía por demostrar con el dataset integrado. La decisión práctica es validar reconstrucción multifuente y borrador local antes de contratar una base histórica o crear eventos automáticamente.


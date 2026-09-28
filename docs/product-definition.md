# Event GTM — definición del producto (hackathon)

Estado: definición de trabajo para el Startup Speedrun Hackathon, 28 de septiembre de 2026. El hacking termina a las 3:30 PM PDT.

Este documento parte de [`HACKATHON_BUILD_BRIEF.md`](../HACKATHON_BUILD_BRIEF.md) y lo aterriza a lo que ya existe en el repo. Si hay conflicto, manda el brief. La evidencia de fondo está en la [investigación](../event-gtm-2026-09-28/README.md), y el código reutilizado se describe en [growthx-reuse.md](growthx-reuse.md).

## En una línea

**Pega el website de tu empresa. Un equipo autónomo de event growth encuentra las salas correctas, planifica los encuentros adecuados y convierte las oportunidades en acciones.**

## Problema

Los equipos de growth y field marketing deciden a qué eventos ir, dónde hablar o qué patrocinar con poca evidencia. La investigación muestra cuatro cosas:

- **Directorios y fuentes envejecen o se contradicen.** Hay fechas en conflicto entre fuentes oficiales del mismo organizador, y las ediciones pasadas no confirman la siguiente.
- **Un logo en una página de sponsors no es un acuerdo.** No dice cuánto se pagó, qué se obtuvo ni si se renovará.
- **Ninguna API abierta da 5 años de eventos y sponsors.**
  - Luma: la API exige Plus y da acceso por calendario, no un inventario global.
  - Eventbrite: la búsqueda general está retirada desde 2019.
  - Partiful: los términos prohíben el scraping.
- **El costo real es el tiempo humano de investigar y verificar.** La estimación de la investigación es de unos USD 0,14 de modelos y búsqueda frente a unos USD 6,67 de revisión humana por flujo.

Listar eventos ya no diferencia: el MCP de Luma, Vendelux, Pana Events y Onsite ya lo hacen. **El valor está en decidir y ejecutar**: qué hacer con cada oportunidad, por qué, con qué evidencia, qué falta saber y cuál es el siguiente paso.

## Para quién

- **Usuario de la demo:** una startup B2B con un objetivo concreto. Por ejemplo, "conocer compradores de infraestructura de IA en SF este trimestre".
- **Comprador objetivo:** equipos de growth o field marketing con una decisión de eventos próxima y presupuesto real. Es la hipótesis de la investigación y no está validada con clientes.

## Qué es y qué no es

**Es** un workspace proactivo de Event GTM. El usuario da su website y responde un onboarding mínimo. El producto:

- propone un perfil de la empresa para que el usuario lo corrija;
- muestra un mapa vivo de oportunidades;
- activa un equipo de agentes que investiga, prioriza, coordina conversaciones y prepara eventos propios.

Cada oportunidad tiene **razón para actuar, evidencia, responsable, siguiente paso y estado**. El equipo sigue trabajando cuando el usuario se va.

**No es:**
- un directorio de eventos;
- un chat genérico;
- un CRM;
- un predictor de ROI;
- un scraper universal;
- un sistema que gasta dinero o contacta personas sin aprobación.

## Tres trabajos

1. **Ir donde están tus compradores:** eventos próximos a los que vale la pena asistir, hablar o patrocinar.
2. **Crear la sala:** proponer un evento propio o un side event y preparar su página y su brief de ejecución.
3. **Juntar a la gente correcta:** organizadores, cohosts y posibles sponsors. Se abre la conversación por un canal verificado tras aprobación, y el plan se actualiza cuando responden.

## Track y posicionamiento en el hackathon

- **Track principal: Autonomous Organizations.** El producto *es* una organización: un equipo de agentes con roles, herramientas acotadas y tareas persistentes que se pasan trabajo entre sí. Brainbase, que presenta el evento, vende "AI workforce", así que es el track que mejor encaja.
- **Track secundario: Agents That Deploy Infrastructure.** Solo aplica si los agentes realmente despliegan y operan un artefacto para el cliente, por ejemplo la página del evento. No es el caso hoy.
- **Sin track de pagos.** No se agregan pagos sin una transacción real y un flujo de presupuesto.
- **Superficie de coordinación:** la fuente de verdad son los registros de tareas en la base de datos. Si sobra tiempo, un espejo de eventos de tareas en un canal de Slack hace visible la coordinación "vía herramientas" que describe el track.
- **Diseño:** en el panel está Taste Labs. El output tiene que verse curado y compartible, no como una salida genérica de IA.

## Experiencia: cinco pantallas

1. **Bienvenida y cuenta.**
   - Login simple: Google si está listo, email como alternativa.
   - Se puede escribir el website de inmediato.
   - El workspace se persiste antes de lanzar investigación larga.
   - Al volver, el usuario aterriza en su workspace con lo que cambió desde la última visita.
2. **Mini onboarding.**
   - Del website se extraen nombre, producto, audiencia, industria, mercados y señales de marca propuestos. El usuario los corrige.
   - Un campo opcional de objetivo en texto libre.
   - Máximo cuatro preguntas:
     1. Qué resultado importa ahora (clientes, alianzas, contratación, comunidad, lanzamiento).
     2. A quién quiere en la sala.
     3. Ciudades, regiones y fechas.
     4. Presupuesto aproximado.
   - La interfaz distingue lo que dice el website, lo que infiere el modelo y lo que confirma el usuario.
   - Si la extracción falla, el usuario escribe una frase y no se bloquea la entrada.
3. **Mapa vivo de oportunidades.**
   - El mapa ocupa casi toda la pantalla, con una lista sincronizada del **top 3**.
   - Estilo: cálido y editorial, tipo descubrimiento de Luma; no un dashboard enterprise.
4. **Sala de la oportunidad.**
   - Línea de tiempo concisa del trabajo de los agentes, no un muro de chat.
   - Pestañas o secciones compactas: **Plan**, **Personas**, **Evidencia**, **Actividad**.
   - Cada dato lleva fuente y fecha de verificación, y cada sugerencia su siguiente acción.
   - Los desconocidos materiales quedan visibles.
5. **Estudio del evento y borrador para Luma.**
   - Vista previa de la página del evento con la marca de la empresa:
     - portada o gráfico intencional, título y descripción corta;
     - audiencia objetivo, formato y agenda propuesta;
     - host, y fecha, hora y lugar **solo si están confirmados**;
     - CTA.
   - El usuario edita los pocos campos que importan.
   - Al lado, un brief de producción privado: razones, supuestos de presupuesto, cohosts y sponsors posibles, tareas, decisiones pendientes y fuentes.
   - **Preparar para Luma** entrega texto limpio con los campos soportados.
   - El borrador se autoguarda y sigue editable tras cerrar sesión.

### Leyenda del mapa

| Visual | Significado |
|---|---|
| Círculo verde | Evento próximo con fecha y ubicación verificadas en una fuente |
| Círculo ámbar | Oportunidad posible con un dato material por confirmar |
| Círculo violeta | Evento propuesto que la empresa podría organizar; explícitamente un concepto |
| Círculo azul | Plan activo con tareas asignadas o conversación en curso |
| Círculo gris | Edición pasada usada solo como contexto histórico |

**Reglas del mapa:**
- **Semántica visual:**
  - El tamaño es el encaje relativo dentro de la lista corta del usuario, no probabilidad de éxito ni ROI.
  - El color indica estado, no confianza.
  - Cada marcador tiene una etiqueta de texto y un ítem en la lista.
- **Ubicación:**
  - Los eventos online van en la lista, no en coordenadas inventadas.
  - Si solo se conoce la ciudad, se muestra un área a nivel de ciudad marcada "ubicación aproximada". Nunca un pin de recinto inventado.
  - El corpus inicial no trae coordenadas de recinto: los pines precisos requieren un paso real de geocodificación y verificación.
- **Legibilidad:**
  - Los puntos densos se agrupan en clusters; nunca burbujas gigantes superpuestas.
  - Filtros por ciudad, periodo, tipo de evento y presupuesto.
- **Tarjeta al hacer clic:** una sola, excelente, con:
  - título y portada;
  - fecha y ubicación verificadas;
  - por qué importa *para esta empresa*;
  - enlaces de evidencia y desconocidos;
  - gasto esperado si se conoce;
  - una única acción principal: **Explorar plan** o **Crear mi evento**.

## Taste como función del producto

- **El website sirve para dos cosas:** entender el negocio y capturar la identidad visual.
- **Taste Labs Brand API (P1):** extrae logo, paleta, tipografía y otras señales de marca, y puede verificar que se respeten.
  - La extracción puede tardar minutos. Primero se renderizan el mapa y una vista previa neutra, y la marca se aplica cuando llega.
  - Si la API no está disponible, se usa un tema neutro diseñado a propósito, nunca gradientes aleatorios ni assets de marca inventados.
- **Reglas de diseño:**
  - Tipografía: una display fuerte y una de lectura.
  - Paleta sobria y fotografía de eventos o gráficos editoriales creíbles.
  - Pocos controles visibles y estados vacío, carga y error cuidados.
  - Sin métricas falsas, avatares de stock ni burbujas de chat interminables.
- **Resultado esperado:** la vista previa del evento se siente compartible y el mapa se mantiene calmo y legible.

## El equipo autónomo

Cada rol es un trabajador real con herramientas acotadas, estado compartido y la capacidad de pedir trabajo a otro rol. Cuatro prompts renombrados en secuencia no son una organización autónoma.

| Agente | Responsable de | Herramientas | Output |
|---|---|---|---|
| **GTM Lead** | Objetivo, prioridades, asignación y decisiones dentro de la política | Leer el brief y el estado de las oportunidades; crear y asignar tareas; pedir revisión | Decisión y siguientes tareas |
| **Event Scout** | Descubrir candidatos y verificar hechos | Consultar el catálogo; inspeccionar evidencia; pedir un refresh puntual | Candidato verificado o desconocido explícito |
| **Opportunity Strategist** | Elegir entre asistir, patrocinar, hablar u organizar; explicar el encaje | Leer brief, candidatos, historial y restricciones | Propuesta de acción ordenada con razones |
| **Partnerships Agent** | Conversaciones con organizadores, cohosts y sponsors | Leer canales de contacto verificados; redactar outreach; procesar respuestas | Plan de contacto, mensaje propuesto y resumen de la respuesta |
| **Event Producer** | Concepto y ejecución del evento propio | Leer marca, brief e investigación; editar el borrador y las tareas | Borrador local listo para Luma y brief privado |
| **Learning Agent** *(después del MVP)* | Feedback y resultados | Leer decisiones explícitas del usuario y resultados de campañas | Preferencias actualizadas y registro de evaluación |

**Mecánica:**
- **Tareas y despacho:**
  - Un **despachador determinístico** despierta a un agente cuando recibe una tarea o un evento externo relevante.
  - Los agentes se comunican con **registros de tareas tipados**, no con conversaciones privadas imposibles de inspeccionar.
  - Cada tarea lleva `workspace_id`, `opportunity_id`, `assigned_role`, `objective`, `input_refs`, `status`, `result_refs`, `created_at` y `updated_at`.
- **Decisiones y cambios:**
  - Cada decisión guarda la versión del brief, los IDs de evidencia, las razones y la acción.
  - Repetir un job no duplica outreach ni la creación del evento.
  - Un cambio de fecha, presupuesto o respuesta invalida las propuestas que dependen de él y dispara un plan revisado.

Ejemplo de traspaso:

```text
Scout → GTM Lead: E17 confirmado para octubre; precio de patrocinio desconocido.
GTM Lead → Partnerships: verificar paquete y hueco para workshop; tope $2.000.
Partnerships → GTM Lead: el organizador dice que el patrocinio cuesta $5.000; workshop posible.
GTM Lead → Producer: descartar el patrocinio; preparar workshop y side event.
Producer → usuario: borrador de marca, presupuesto y próximas decisiones actualizados.
```

**Límites de las acciones externas:**
- Investigar y redactar es autónomo, dentro de un presupuesto de ejecución pequeño.
- Contactar a una persona real, publicar un evento o gastar dinero requiere una acción aprobada que muestre destinatario, canal, contenido y cuenta.
- Recibir una respuesta sí puede reactivar al equipo automáticamente.
- En la demo se usa un inbox de organizador controlado por el equipo, para que el ciclo sea real, seguro y repetible.
- Las credenciales de envío nunca están al alcance de los agentes de investigación.

**Momento clave de la demo:** llega la respuesta del organizador ("el patrocinio supera tu presupuesto, pero hay un workshop disponible") y el equipo reorganiza el trabajo a la vista del usuario. Es la prueba de autonomía que pide el track.

## Arquitectura mínima

Hay dos capas separadas:

1. **Catálogo compartido de eventos.** Es de solo lectura desde la app y contiene ediciones, series, organizadores, roles, claims, URLs de fuente, fechas y precisión de ubicación. Hoy es `event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite`, leído por `web/lib/server/dataset-repository.ts`.
2. **Workspace privado de la empresa.** Contiene usuarios, perfil, briefs, preferencias, oportunidades, tareas, mensajes, aprobaciones, borradores, feedback y resultados.
   - Tiene que persistir en el servidor: `localStorage` no es una cuenta.
   - Propuesta: una SQLite propia y escribible (`node:sqlite`, igual que el catálogo) fuera del catálogo e ignorada por git, para no tocar los datos de investigación.

Tablas mínimas del workspace: `users`, `workspaces`, `workspace_members`, `company_profiles`, `brief_versions`, `opportunities`, `agent_tasks`, `agent_events`, `contact_channels`, `outreach_threads`, `approval_requests`, `event_drafts` y `feedback`. `event_editions` y `event_claims` se referencian desde el catálogo por ID.

**API:**
- `POST /onboard`, `GET /map`
- `GET /opportunities/:id`, `POST /opportunities/:id/plan`
- `POST /tasks/:id/run`
- `POST /drafts`, `PATCH /drafts/:id`
- `POST /approvals/:id/decision`, `POST /inbound/reply`

El workspace se deriva de la sesión autenticada.

**Reglas para los modelos:**
- Nunca se le pasa el dataset entero a un modelo. Primero se filtra por ciudad, fecha y tipo; luego se traen unos pocos candidatos con sus claims, y recién entonces los agentes explican o planifican.
- Se guardan el valor original, la fuente y la fecha de verificación.
- Si no hay contacto o ubicación usable, se dice y se crea una tarea de verificación.

### Qué existe y qué falta

| Pieza | Estado en el repo |
|---|---|
| Catálogo en SQLite, búsqueda FTS, filtros, paginación | **Existe** en `web/` |
| Mapa MapLibre respetando la precisión, lista, expediente con evidencia, comparación y exportación | **Existe**, reutilizado de GrowthX ([growthx-reuse.md](growthx-reuse.md)) |
| Cuenta, workspace persistente y onboarding desde el website | **Falta** |
| Leyenda de estados (verde/ámbar/violeta/azul/gris) y top 3 personalizado | **Falta**; el mapa actual muestra resultados del catálogo |
| Equipo de agentes, tareas tipadas, despachador y línea de tiempo | **Falta**; es el núcleo del track |
| Respuesta entrante que cambia el plan | **Falta** |
| Estudio del evento y borrador local para Luma | **Falta**; hay un patrón de exportación en `web/lib/drafts/export.ts` |

## Catálogo inicial para la demo (Área de la Bahía)

Estos son los candidatos reales del Área de la Bahía en el dataset con fecha entre octubre de 2026 y marzo de 2027, consultados el 28-sep-2026:

| ID | Fecha | Evento | Ciudad | Fuente | Modalidad |
|---|---|---|---|---|---|
| `evt_9da972220c78ac0f` | 2026-10-03 | PyBay 2026 | San Francisco | inherited · [pybay.org](https://pybay.org/) | presencial (inferida) |
| `evt2_488feb4ea13a8d9c37e22f7a` | 2026-10-14 | FLOCK - The Autonomous-Ops Summit by NeuBird AI | San Francisco | confs-tech · [goflock.ai](https://www.goflock.ai) | sin especificar |
| `evt2_f93ab62e26178df8e9a33f97` | 2026-10-17 | MIT AI Conference | Mountain View | confs-tech · [mitaiconference.org](https://www.mitaiconference.org) | sin especificar |
| `evt2_70e4b620a766798264c91d9c` | 2026-10-27 | SEV0 | San Francisco | confs-tech · [sev0.com](https://sev0.com) | sin especificar |
| `evt2_875de1f6b99c2a50b7e51e6d` | 2026-11-02 | Open Source Analytics Conference | San Francisco | confs-tech · [osacon.io](https://osacon.io) | **online** (va en la lista, no en el mapa) |
| `evt2_4f630a01f3ab3c5276259bfb` | 2026-11-09 | Gerrit User Summit | San Francisco | confs-tech · [gus26.gerritforge.com](https://gus26.gerritforge.com) | sin especificar |
| `evt2_645b6b3ce4f50eebb8c768f8` | 2027-02-09 | Developer Week | Santa Clara | confs-tech · [developerweek.com](https://www.developerweek.com) | sin especificar |
| `evt2_3601dd31ef3c019079c85132` | 2026-10-03 | 35th International Symposium on Software Testing and Analysis (ISSTA 2026, académico) | Oakland | computer-science · [researchr.org](https://conf.researchr.org/home/issta-2026) | sin especificar |

**Cómo usar este catálogo:**
- Todos arrancan en **ámbar**, y ninguno tiene recinto geocodificado.
  - PyBay viene de la investigación heredada, con estado `announced` y dirección publicada sin geocodificar.
  - El resto proviene de listados comunitarios o académicos con estado `listed_occurrence_unconfirmed`. ISSTA solo tiene el centroide de la ciudad; los de confs-tech no tienen ubicación.
- Pasan a **verde** solo cuando el Scout abre la web oficial y confirma fecha y ubicación. Esa verificación real es parte de la demo.
- Ninguno tiene sponsors registrados en el dataset. El historial de sponsors (PyCon US, KubeCon JP/IN, FOSDEM, PyCon AU) sirve para investigar posibles co-sponsors, **no** como prueba de interés.
- En California pero fuera del filtro SF: KubeCon + CloudNativeCon North America (`evt2_dcb2c9c0886e36953b85d667`, Los Ángeles, 26-oct) y PyBeach 2026 (`evt_fa0ae2541f8d36ea`, Santa Monica, 24-oct).
- **Límite del catálogo:** 21.749 ediciones, pero el 81 % son actividades municipales de Helsinki. El estrato tech tiene unas 4.100 y solo 269 son futuras. No se afirma cobertura universal.

## Alcance

**P0, tiene que funcionar en vivo:**
1. El usuario entra, escribe un website, confirma un perfil corto y elige ciudad, objetivo y presupuesto.
2. El mapa muestra una lista corta genuina del catálogo; cada punto con su estado y su fuente correctos.
3. Al hacer clic en un evento se ve por qué encaja y una línea de tiempo visible de tareas de los agentes.
4. Los agentes proponen un side event propio, y el Producer genera un borrador local para Luma, pulido, editable y autoguardado.
5. Llega una respuesta (simulada o real) a un inbox controlado por el equipo; el GTM Lead reasigna trabajo y el plan cambia a la vista.
6. Al recargar, cerrar sesión y volver a entrar, siguen ahí el perfil, la oportunidad, el historial de agentes y el borrador.

**Orden de construcción sugerido:**
1. Workspace persistente y tareas tipadas.
2. Despachador y roles.
3. Línea de tiempo.
4. Carga de la lista corta con estados.
5. Estudio del evento y borrador.
6. Botón y endpoint de respuesta del organizador.
7. Mapa con la leyenda nueva.
8. Onboarding desde el website.
9. Login mínimo.

**P1, solo cuando el P0 sea fiable:**
- Taste Labs Brand API para el perfil y el diseño de la página del evento.
- Email aprobado real al inbox controlado.
- Pines precisos tras geocodificar.
- Deploy en Cloudflare.
- Espejo de tareas en Slack.
- Creación autenticada en Luma.

**Fuera por hoy:**
- scraping universal y afirmaciones de cobertura global;
- outreach masivo;
- predicción de ROI;
- compra de entradas;
- gasto sin supervisión;
- chat genérico;
- CRM completo.

## Guion de demo (~90 s)

1. "Pegamos el website de una startup y le dimos un objetivo a nuestro equipo de event growth: conocer compradores de infraestructura de IA en SF."
2. En el mapa se ven un evento verde verificado y un concepto violeta. Clic en la oportunidad más fuerte: su razón respaldada por la fuente.
3. El GTM Lead asigna tareas distintas a Scout, Partnerships y Producer, y la oportunidad pasa a azul (plan activo). Se abre la vista previa del evento y su texto listo para Luma.
4. Se dispara la respuesta del organizador: el patrocinio supera el presupuesto, pero hay un workshop disponible. Cambian las tareas y la recomendación, y se actualizan el marcador azul y el borrador.
5. Recarga: el equipo, la decisión y el borrador persisten. Cierre: "Este equipo sigue trabajando entre visitas."

## Reglas de honestidad

- Ninguna pantalla dice que se envió un email, que un sponsor se comprometió, que se reservó un recinto o que se creó un evento en Luma, salvo que haya ocurrido.
- Si la respuesta del organizador es simulada, la interfaz lo indica.
- Un evento propio siempre se etiqueta como propuesta, nunca como listado confirmado.
- La API de Luma crea eventos y no documenta un estado de borrador. Por eso el borrador es **local**. "Crear en Luma" necesita las credenciales del usuario, los campos obligatorios de la API, revisión del payload exacto y autorización explícita. Según la revisión documental de la investigación, esos campos son `name`, `start_at` y `timezone`; hay que reconfirmarlos en la [Create Event API](https://docs.luma.com/reference/post_v1-events-create) antes de integrar.
- Las cifras que aparezcan en la demo se leen del manifiesto correspondiente.

## Checklist de aceptación

- [ ] El onboarding dura menos de un minuto y permite corregir los campos inferidos.
- [ ] Un usuario que vuelve aterriza en su workspace guardado.
- [ ] El color y el tamaño de los marcadores tienen significados separados y legibles; no hay coordenadas inventadas.
- [ ] Al menos un evento real del catálogo tiene URL de fuente y fecha de verificación.
- [ ] El evento propio aparece como propuesta, nunca como listado confirmado.
- [ ] Los roles crean y consumen tareas persistidas, y una respuesta entrante cambia la tarea de otro agente y el plan visible.
- [ ] Las ediciones del borrador sobreviven a una recarga y producen un paquete usable para Luma.
- [ ] Ninguna pantalla dice que se envió un email, que un sponsor se comprometió, que se reservó un recinto o que se creó un evento en Luma, salvo que haya ocurrido.

## Decisiones abiertas

- **Proveedor de login:** Google vía Auth.js si las credenciales están listas en 15 min; si no, email como identificador de demo, declarado como tal.
- **Modelo y runtime de agentes:** Claude vía la API de Anthropic en el proceso Node de `web/`, con herramientas acotadas por rol.
- **Consultar a los organizadores:** si los premios son generales o por track, si se admite código previo (hay módulos reutilizados de GrowthX) y cuál es el formato de entrega.
- **Deploy:** hoy la app necesita un proceso Node con acceso a SQLite. Cloudflare Workers requeriría otra capa de datos, por eso es P1.

## Fuentes

- Brief del hackathon: [`HACKATHON_BUILD_BRIEF.md`](../HACKATHON_BUILD_BRIEF.md)
- Evento: [Startup Speedrun Hackathon en Luma](https://luma.com/g42o84ln)
- Prompt original de producto e investigación: [prompt-maestro.md](../event-gtm-2026-09-28/inputs/prompt-maestro.md)
- Resumen de la investigación: [resumen-ejecutivo.md](../event-gtm-2026-09-28/resumen-ejecutivo.md), [validation_report.md](../event-gtm-2026-09-28/independent-deep-research-20260928/validation_report.md), [platforms-competition.md](../event-gtm-2026-09-28/scale-expansion-20260928/reports/platforms-competition.md)
- Luma: [descubrimiento](https://help.luma.com/p/searching-for-events), [Create Event API](https://docs.luma.com/reference/post_v1-events-create), [MCP](https://help.luma.com/p/mcp)
- [Taste Labs Brand API](https://tastelabs.com/api)

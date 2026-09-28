# Prompt maestro de deep research y extracción del dataset para una plataforma de Event GTM

## Objetivo

Realiza un deep research para evaluar y definir una plataforma de Event Go-To-Market. La experiencia deseada es que una empresa describa su necesidad en un prompt, pueda aportar su website y reciba un mapa de los eventos más adecuados para sus objetivos, propuestas de eventos propios, un borrador preparado para Luma y sponsors potencialmente compatibles. El resultado debe permitir decidir qué construir, para quién, con qué datos y cómo diferenciarlo de la competencia.

El encargo combina investigación y extracción de datos reales reutilizables. La prioridad es entregar el dataset verificable que pueda obtenerse, su cobertura, sus vacíos y un procedimiento reproducible para ampliarlo; el informe explica y evalúa esos datos. No basta con recomendar fuentes o describir cómo alguien podría recopilarlos. No es redactar un pitch, crear diapositivas ni construir o publicar la aplicación. Los ejemplos de mapa y borrador para Luma deben servir para evaluar la viabilidad y calidad de la experiencia propuesta.

La investigación debe ser crítica y estar sustentada en fuentes. Buscamos un histórico excepcional por amplitud, profundidad, trazabilidad y utilidad comprobada. La ambición es demostrar con evidencia si este producto puede ser extraordinario: busca tanto hallazgos que lo apoyen como resultados que lo contradigan. No busco una validación automática de la idea ni una lista superficial de herramientas. No presupongas la solución técnica ni que toda la información necesaria sea accesible.

## La idea de producto

Una empresa describe en lenguaje natural qué quiere conseguir y puede ingresar su website. La plataforma identifica sus productos, industria, propuesta de valor, clientes objetivo, mercados y posibles objetivos comerciales. Distingue lo que el sitio confirma de lo que solo puede inferirse, y determina qué información adicional debe aportar la empresa, como presupuesto, objetivos, calendario y cuentas objetivo. Investiga también cómo ofrecer una primera respuesta útil cuando el usuario solo aporta un prompt y no una URL.

Con ese perfil, la plataforma permite:

1. Recibir propuestas diarias o semanales de oportunidades de eventos relevantes, con una explicación de por qué convienen, y explorar las oportunidades presenciales en un mapa geográfico acompañado de una lista priorizada.
2. Pedir un evento sobre un tema u objetivo y recibir un borrador con concepto, audiencia, formato, agenda, posibles colaboradores, sponsors, presupuesto y métricas de éxito, con contenido preparado para crear su página en Luma.
3. Ingresar un evento ya definido y encontrar sponsors compatibles, con evidencia de afinidad y antecedentes de patrocinio.
4. Consultar perfiles conectados de empresas, sponsors, organizadores, eventos y participantes, junto con resultados históricos cuando existan datos fiables.
5. Utilizar los resultados de eventos propios para mejorar futuras recomendaciones.

Analiza por separado dos interpretaciones de recomendar eventos: descubrir eventos existentes a los que asistir o patrocinar, y proponer eventos nuevos que la empresa podría organizar. Determina qué datos, competencia y valor comercial corresponden a cada una.

## Alcance y criterios de evidencia

Parámetros que deben constar al comenzar: fecha de ejecución, geografía, tipos de eventos, sectores, idiomas de búsqueda, ventana histórica, horizonte futuro, presupuesto de adquisición, herramientas disponibles y perfil de empresa si se pretende personalizar ejemplos. Usa las decisiones explícitas del usuario; lo que no esté definido permanece como pendiente. El foco B2B es una hipótesis a evaluar, no una restricción ya aprobada.

La geografía todavía no está definida. Haz un mapa competitivo internacional; no presupongas una ciudad, país o región para el dataset. Si la geografía impide una conclusión concreta, presenta opciones y explica cómo cambia el costo, la cobertura y la oportunidad. Mantén esa decisión explícitamente pendiente.

El objetivo del dataset es reconstruir los últimos cinco años de eventos dentro del alcance que finalmente se elija. Calcula la ventana como los 60 meses anteriores a la fecha de ejecución y declara las fechas. Separa ese histórico del inventario de próximos eventos necesario para recomendar oportunidades futuras.

Aspira a la mayor cobertura posible, pero no afirmes que contiene todos los eventos sin demostrar el universo y la metodología. Define categorías, unidades, exclusiones y cobertura por año, tipo de evento y territorio. Separa las series recurrentes de sus ediciones concretas.

Para cada hallazgo relevante incluye fuente enlazada, fecha, alcance y nivel de certeza. Prioriza webs oficiales, documentación, condiciones de acceso, páginas de producto, precios y evidencia de clientes. Distingue hechos comprobados, declaraciones del proveedor, inferencias e hipótesis. Una funcionalidad no documentada no equivale a una funcionalidad inexistente. No inventes precios, clientes, financiación, tamaño de bases ni resultados.

## Protocolo de ejecución: producir datos, medir cobertura y poder continuar

1. **Definir el universo.** Documenta parámetros confirmados y pendientes. Establece una taxonomía de tipos de evento y sectores; distingue congresos, ferias, meetups, workshops, cenas, encuentros de comunidad, eventos culturales o deportivos y otros formatos que correspondan al alcance. No cambies silenciosamente la petición por un único nicho más fácil. Si falta geografía, avanza en el inventario internacional de fuentes, la estructura de datos y la extracción exploratoria; etiqueta esta última como exploratoria y deja la extracción territorial exhaustiva pendiente de delimitación.
2. **Inventariar y probar fuentes.** Comprueba con páginas o registros concretos qué ofrece cada fuente. Registra acceso público, por API, mediante licencia, mediante cliente o no disponible. Una página encontrada, una fuente evaluada y un registro extraído son tres estados diferentes. Utiliza idiomas locales cuando corresponda y no limites la cobertura a resultados en inglés.
3. **Calibrar una primera muestra diversa.** Incluye diferentes años, tipos de eventos, organizadores, tamaños y fuentes. Comprueba extracción, relaciones y trazabilidad antes de aumentar volumen. Esta muestra es una etapa de control, no el entregable final ni un tope de registros.
4. **Extraer por lotes trazables.** Recorre los segmentos y fuentes definidos. Primero recupera el núcleo del evento y sus fuentes; después organizadores, empresas, sponsors, expositores, speakers, audiencias, paquetes y resultados disponibles. No descartes un evento válido porque falten campos de enriquecimiento. Registra páginas de inicio, paginación o cursores cuando existan y usa las vías de acceso permitidas.
5. **Resolver entidades y ediciones.** Normaliza nombres y dominios, conserva nombres originales y alias y vincula ediciones recurrentes. Revisa coincidencias ambiguas antes de fusionarlas. No conviertas el logo de un sponsor sin año ni contexto en una relación confirmada con todas las ediciones.
6. **Validar y ampliar.** Audita errores y vacíos por fuente y segmento; corrige el método y continúa. Prioriza fuentes que agregan cobertura o evidencia útil, no volumen duplicado. Guarda avances antes de alcanzar límites de tiempo, herramientas o contexto.
7. **Entregar el estado real.** Publica los archivos generados y un manifiesto con cantidades, cobertura, errores, exclusiones y pendientes. Si la ejecución no alcanza para todo el alcance, entrega lo recopilado y una cola exacta de continuación; no sustituyas el trabajo pendiente por una afirmación de completitud.

Dentro de las capacidades de la sesión, recopila todos los registros verificables que puedas del alcance declarado. No te detengas por alcanzar una cifra cómoda de ejemplos. Tampoco prolongues indefinidamente una fuente bloqueada: registra la limitación y continúa con otras accesibles. Si una extracción requiere credenciales, una compra o un acuerdo, documenta ese requisito sin asumir acceso ni contratarlo.

Separa tres capas: datos observados y respaldados; datos derivados con método documentado, como categorías o puntuaciones; y datos que deberá aportar el cliente. Las propuestas de nuevos eventos y los ejemplos sintéticos van fuera de las tablas de eventos observados.

## 1. Competencia y alternativas

Busca competidores directos, parciales y sustitutos en estas categorías:

- Inteligencia y descubrimiento de eventos para equipos de marketing y ventas.
- Recomendación de eventos según perfil de empresa, audiencia o cuentas objetivo.
- Planificación y generación de propuestas de eventos con IA.
- Descubrimiento, inteligencia y matching de sponsors.
- Bases históricas de eventos, sponsors, expositores y participantes.
- Gestión de eventos, comunidades, networking y medición de resultados.
- Agencias, consultoras y procesos manuales que resuelven el mismo problema.

Como puntos de partida, verifica Vendelux, Pana Events, SponsorUnited, Partable, Identyca, Kuration AI, Events Intelligence/HuntEx, EventoPulse, Acirio y run.events. Esta lista no es exhaustiva y no implica que sus capacidades estén verificadas. Amplía la búsqueda con nuevos proveedores y actores locales cuando se defina el mercado.

Entrega una matriz con: empresa y enlace, comprador objetivo, trabajo que resuelve, funcionalidades documentadas, flujo de incorporación de clientes, datos utilizados, cobertura geográfica e histórica, actualización, integraciones, acceso por API o exportación, precio público o ausencia de precio, modelo de negocio, estado comercial y evidencia de clientes.

Compara expresamente si cada producto ofrece: prompt y website de empresa a perfil; recomendaciones recurrentes; descubrimiento y ranking de eventos existentes; mapa geográfico; borradores de eventos nuevos; preparación o integración de páginas de Luma; búsqueda de sponsors para un evento propio; perfiles de participantes; resultados comerciales; y aprendizaje a partir de resultados. Investiga también alternativas gratuitas y límites de sus planes, con verificación actual.

Separa capacidades disponibles, anunciadas y en acceso anticipado. Identifica los cinco competidores más cercanos y explica qué parte de nuestra propuesta ya cubren. La existencia de una página de marketing no demuestra calidad de datos ni adopción.

Concluye con oportunidades de diferenciación respaldadas por evidencia. Evalúa qué impediría a un competidor existente añadir nuestra función principal y qué ventaja podría mantenerse con el tiempo.

## 2. Viabilidad del dataset histórico y futuro

Investiga fuentes reales, no solamente categorías genéricas: webs de organizadores y recintos; directorios sectoriales; cámaras empresariales; asociaciones; universidades; calendarios públicos; plataformas de registro; agendas y PDFs; páginas de sponsors y expositores; informes posteriores al evento; archivos web y proveedores comerciales.

Luma, Eventbrite y Partiful son fuentes prioritarias que deben evaluarse por separado. Busca, extrae y cruza información accesible de esas plataformas y de sus organizadores, calendarios, páginas enlazadas y coberturas externas. Incluye Meetup, 10times, calendarios de congresos y ferias y otros proveedores que aparezcan durante la investigación. Verifica qué permiten hoy: no supongas que una web pública tiene API, que la API da acceso al histórico o que se permite reutilizar comercialmente todo su contenido.

Para cada fuente registra:

- URL, tipos de eventos y geografías cubiertas.
- Años recuperables y disponibilidad de eventos futuros.
- Campos obtenibles y formato: API, exportación, páginas, PDF o acuerdo de datos.
- Precio, límites, frecuencia de actualización y restricciones de almacenamiento y reutilización documentadas.
- Muestra verificable, calidad, duplicados, vacíos y dependencia del proveedor.
- Método viable de incorporación y esfuerzo estimado, con supuestos explícitos.

Compara construir, licenciar y combinar fuentes. Separa acceso público, acceso mediante acuerdo y datos que solo aportarían clientes u organizadores. Evalúa recuperación de páginas desaparecidas y la pérdida de información en ediciones antiguas.

Propón cómo medir cobertura cuando no existe un censo completo: universos de referencia, muestras auditadas por categoría y territorio, solapamiento entre fuentes y límites de las estimaciones. No confundas cantidad de registros con cantidad de eventos únicos.

### Matriz de búsqueda multifuente obligatoria

| Familia | Fuentes iniciales que evaluar | Información que buscar | Comprobación necesaria |
|---|---|---|---|
| Plataformas prioritarias | Luma, Eventbrite y Partiful | Ediciones, anfitriones, calendarios, temas, fechas, lugares, tickets y enlaces públicos relacionados. | Qué se puede descubrir, leer, extraer y conservar realmente; diferencias entre datos públicos y del organizador. |
| Plataformas complementarias | Meetup, 10times, Sessionize, pretix, Ticket Tailor, Humanitix, DICE y plataformas regionales que aparezcan. | Cobertura adicional, comunidades, agendas, modalidades y precios. | Estado actual, adecuación al alcance y rendimiento de registros nuevos; no asumir API abierta. |
| Organizadores y series | Webs oficiales, subdominios y directorios de ediciones, páginas de registro enlazadas. | Archivo de ediciones, programas, coorganizadores, sponsors, speakers, expositores y reportes. | Separar el contenido de cada año y detectar páginas actualizadas para la edición siguiente. |
| Sponsors y expositores | Newsrooms, blogs corporativos, páginas de eventos y casos de clientes. | Patrocinios anunciados, activaciones, objetivos declarados, paquetes, resultados y renovaciones. | Confirmar rol, edición y fuente; un logo sin contexto no identifica un acuerdo. |
| Recintos e instituciones | Centros de convenciones, universidades, asociaciones, cámaras, agencias de promoción y calendarios municipales. | Eventos omitidos por plataformas, capacidad, formato, organizadores y contexto local. | Precisión de fecha y lugar; distinguir capacidad del recinto de asistencia al evento. |
| Comunidades y distribución | Calendarios y webs públicas de comunidades, newsletters con archivo público, hubs, coworkings, incubadoras y aceleradoras. | Meetups, side events, cenas, talleres, audiencias y canales de convocatoria. | Usar material publicado; no entrar en grupos privados ni extraer sus miembros. |
| Prensa independiente | Medios locales, sectoriales y especializados, entrevistas, crónicas y reportajes. | Celebración efectiva, cancelaciones, cambios, sponsors, resultados declarados y contexto. | Identificar fuente original, fecha, independencia y diferencias con notas promocionales. |
| Comunicados y anuncios | Salas de prensa y servicios de distribución de comunicados, por ejemplo PR Newswire, Business Wire o equivalentes locales. | Alianzas, eventos, lanzamientos y patrocinios anunciados. | Etiquetar como declaración de la organización; múltiples republicaciones no son corroboraciones independientes. |
| Publicaciones profesionales | Blogs, newsletters, LinkedIn, publicaciones públicas de organizaciones y cuentas oficiales en otras redes. | Enlaces a eventos, agendas, anuncios y recapitulaciones. | Acceso y reutilización permitidos; no convertir posts, likes o seguidores en asistencia o intención de compra. |
| Activos del evento | PDFs, agendas, prospectos de patrocinio, mapas de stands, memorias, decks y recordings publicados. | Detalle histórico que ya no figura en la página principal. | Fecha y edición, permisos, páginas o marcas de tiempo; corroborar OCR y nombres reconocidos visualmente. |
| Archivos históricos | Internet Archive/Wayback Machine, archivos institucionales y otros repositorios web accesibles. | Versiones anteriores, webs desaparecidas, cambios de sponsors, precios y agenda. | Disponibilidad real y fecha de captura; no asumir que el archivo conserva todas las páginas. |
| Señales empresariales | Webs y comunicados de empresas, registros abiertos pertinentes y fuentes sectoriales. | Lanzamientos, expansión geográfica, alianzas y necesidades comerciales declaradas. | Una señal puede justificar investigar un sponsor, pero no prueba que tenga presupuesto o interés en el evento. |
| Contexto de mercado | Fuentes estadísticas oficiales, asociaciones y calendarios públicos relevantes. | Estacionalidad, concentración sectorial, días festivos y conflictos de calendario. | Usar solo variables que puedan cambiar una decisión; no acumular contexto sin utilidad. |

No es suficiente enumerar estas familias. Entrega URLs concretas, ejemplos recuperados, campos obtenibles, profundidad temporal, calidad, costo y estado de cada intento. Incluye fuentes en los idiomas y dominios locales relevantes. Declara familias sin cobertura y explica si faltan datos, acceso o tiempo.

### Estrategia de descubrimiento y scraping

Diseña y ejecuta, cuando el entorno disponga de las herramientas necesarias, una adquisición reproducible de páginas públicas y fuentes autorizadas. Prefiere APIs documentadas y exportaciones cuando cubran la necesidad; complementa con extracción de HTML, datos estructurados públicos, feeds, sitemaps publicados, archivos de calendario y documentos accesibles. El scraping es un método de adquisición, no una garantía de acceso, calidad o exhaustividad.

Para cada plataforma registra páginas semilla observadas, mecanismos reales de descubrimiento, paginación, filtros, alcance de autenticación si se requiere, campos, limitaciones, antigüedad alcanzable, versión del extractor, errores y punto de reanudación. Verifica los mecanismos antes de usarlos; no inventes endpoints ni patrones de URL. Una API para administrar calendarios propios no implica acceso al inventario global.

Expande la búsqueda en varias direcciones:

1. Ciudad o región + sector + formato + año, con sinónimos en idiomas pertinentes.
2. Nombre de evento + edición + agenda, speakers, sponsors, expositores, resultados o recapitulación.
3. Organizador → todos sus calendarios y ediciones accesibles.
4. Sponsor → eventos y activaciones que la propia empresa documenta.
5. Recinto → calendarios históricos y referencias en prensa.
6. Evento principal → side events y encuentros cercanos, confirmando si hay relación oficial o solo proximidad.
7. Página desaparecida → fuente original archivada, web del organizador, comunicados y prensa que permitan recuperar hechos.
8. Resultado incompleto → búsquedas específicas del dato faltante, priorizadas por su valor para recomendaciones y matching.

Usa índices de búsqueda como descubrimiento, no como inventario completo ni como prueba suficiente de todas las afirmaciones del fragmento. Abre y contrasta la fuente cuando sea accesible. Registra consultas, filtros, fechas y rendimiento en eventos únicos por hora o costo cuando puedas medirlo.

Controla concurrencia y frecuencia, respeta límites documentados, reutiliza caché cuando proceda y guarda checkpoints. Ante errores, aplica reintentos acotados y registra el estado; ante autenticación, CAPTCHA o bloqueos de acceso, utiliza una vía autorizada o deja pendiente la fuente. No eludas esos controles ni recopiles listas privadas de invitados. Distingue acceso técnico, permiso de extracción y permiso de reutilización comercial con evidencia para cada uno.

Conserva únicamente los materiales y extractos que puedas almacenar o reutilizar: URL, fecha, identificador del documento, hash cuando corresponda y evidencia breve. Las noticias deben incorporarse como metadatos, hechos extraídos y resúmenes propios, no como una copia masiva del texto íntegro. Los materiales visuales sirven para ubicar evidencia publicada; no identifiques asistentes mediante reconocimiento facial.

Si el entorno solo permite navegación de investigación y no extracción programática, ejecuta la adquisición verificable que sí permita, declara esa limitación y deja especificado el trabajo de scraping pendiente. No finjas haber ejecutado crawlers ni generado archivos descargables.

### Fuentes oficiales iniciales que deben volver a verificarse

Estas referencias se localizaron al preparar este encargo el 28 de septiembre de 2026. Verifica su vigencia durante la ejecución:

- [Luma: acceso a la API](https://docs.luma.com/reference/getting-started-with-your-api) y [guía de integración](https://help.luma.com/p/luma-api). La documentación consultada exige Luma Plus y describe acceso autorizado a calendarios; no demuestra disponibilidad de un histórico global.
- [Luma: conector MCP y descubrimiento](https://help.luma.com/p/mcp). Investiga alcance y requisitos actuales de búsqueda de eventos públicos, diferenciándolo del acceso a datos propios y del backfill histórico.
- [Eventbrite: referencia oficial de API](https://www.eventbrite.com/platform/new/api). La referencia consultada marca retirada su antigua búsqueda general de eventos. Comprueba alternativas vigentes y acceso real por organización, recinto o serie sin asumir que permiten listar todo el catálogo.
- [Eventbrite: marco de acceso y condiciones](https://www.eventbrite.com/corporate/legal/legalterms/). Verifica las condiciones aplicables al método y al uso propuesto.
- [Partiful: eventos públicos](https://help.partiful.com/en-us/articles/15525563-what-is-a-public-event), [protección de datos](https://help.partiful.com/en-us/articles/15525648-how-does-partiful-protect-my-data) y [condiciones](https://partiful.com/terms). La documentación diferencia eventos públicos y privados. Evalúa las restricciones de extracción y uso comercial; una página indexable no acredita permiso para reutilizar sus datos.

## 2B. Reconstrucción histórica y noticias como evidencia

Reconstruye tanto lo que pasó como lo que puede demostrarse que se sabía antes de cada edición. Conserva cuatro tiempos distintos: fecha del hecho, publicación, captura archivada y consulta actual. Un artículo encontrado hoy sobre un evento antiguo no demuestra que esa información estuviera disponible cuando se habría emitido una recomendación.

Relaciona cada noticia, comunicado o recapitulación con empresas, series y ediciones específicas mediante coincidencias revisables. Conserva el texto del nombre original, la relación atribuida y la evidencia. Etiqueta anuncio previo, cobertura durante el evento, balance posterior, corrección, cancelación y cambio de fecha. Una afirmación futura en un anuncio no se convierte automáticamente en un resultado ocurrido.

Deduplica republicaciones y agrupa artículos que derivan del mismo comunicado. Distingue declaración de parte, publicidad, periodismo independiente y documentación institucional. Registra qué hechos están confirmados, cuáles son atribuciones al organizador y cuáles se contradicen.

Investiga variaciones históricas de audiencia, formatos, precios, agenda, temas, sponsors, espacios y periodicidad. Mide cambios únicamente entre observaciones comparables, conservando denominadores y diferencias de definición. No infieras deserción de un sponsor por no encontrarlo en una página incompleta.

Documenta sesgos: eventos pequeños poco indexados, páginas eliminadas, plataformas recientes, lenguas menos cubiertas, cambios de plataforma, publicación selectiva de resultados positivos y supervivencia de organizadores activos. Evalúa cómo afectan el análisis y qué fuentes los compensan. No atribuyas una caída de actividad a menor demanda sin descartar menor cobertura.

## 3. Modelo de datos y perfiles

Diseña un modelo que conecte empresa, organizador, serie de eventos, edición, sponsor, paquete de patrocinio, expositor, speaker, participante o segmento de audiencia y resultado.

Para cada entidad define campos mínimos, campos deseables, identificadores, relaciones, fuente, fecha de observación, fecha a la que aplica el dato, confianza, permisos de uso y reglas de actualización. Distingue ausencia de evidencia de un valor negativo o cero.

Incluye como mínimo:

- Evento y edición: nombre, fechas, estado, organizador, ubicación o modalidad, sector, temas, formato, audiencia objetivo, tamaño anunciado y asistencia real si está documentada, precios, web y materiales.
- Empresa: dominio, productos, industria, mercados, propuesta de valor, tipos de clientes, objetivos aportados por el usuario, eventos y patrocinios anteriores.
- Sponsor: empresa, categorías y eventos patrocinados, edición y nivel del patrocinio, audiencias buscadas, restricciones declaradas y capacidad presupuestaria únicamente cuando exista evidencia. No conviertas una estimación en presupuesto confirmado.
- Participantes: separa audiencia objetivo, perfiles agregados, registrados, asistentes efectivos, speakers, expositores y personas anunciadas. Usa datos profesionales públicos o datos obtenidos con permisos adecuados; no presupongas acceso a listas privadas ni deduzcas atributos sensibles.
- Resultados: asistencia, registros, reuniones, leads, oportunidades, ingresos atribuidos, satisfacción, renovación de patrocinadores y costos, con definición y procedencia de cada métrica.

Investiga además estos datos de decisión, que no quedan resueltos por un directorio histórico de eventos:

- Demanda actual de la empresa: objetivo prioritario, producto u oferta que quiere impulsar, perfil de comprador por función y tipo de empresa, cuentas objetivo aportadas por el cliente, presupuesto total, fechas posibles y capacidad del equipo para ejecutar. Identifica qué proviene del website y qué requiere respuesta directa del cliente.
- Audiencia real y accesible: composición agregada por industria, función, seniority profesional y tamaño de empresa; correspondencia con clientes objetivo; diferencia entre comunidad total, personas invitadas, registros y asistencia efectiva. No equipares alcance promocional con asistentes disponibles ni con intención de compra.
- Costos y plazos completos: entrada, patrocinio, stand, producción, viajes y dedicación del equipo según el caso; plazos para participar, disponibilidad documentada, restricciones y posibles conflictos de calendario. Distingue tarifas publicadas, cotizaciones actuales y estimaciones.
- Viabilidad de organizar: capacidad y disponibilidad verificable de espacios, formato, anticipación requerida, canales de convocatoria disponibles y capacidad real del anfitrión para atraer la audiencia. Una ubicación sugerida no implica reserva ni disponibilidad.
- Demanda actual del sponsor: objetivos declarados, audiencias y territorios prioritarios, periodos de planificación, proceso y plazo de decisión, canal empresarial público o autorizado para propuestas y restricciones de categoría. Investiga qué puede observarse, qué debe preguntar el organizador y qué seguirá siendo desconocido.
- Oferta de patrocinio del evento: paquetes, precio o rango documentado, beneficios concretos, exclusividad, inventario disponible, alcance demostrable, fechas límite y forma de medir resultados. La compatibilidad exige relacionar esa oferta con el objetivo del sponsor.
- Aprendizaje del producto: propuestas mostradas, aceptadas y rechazadas, motivos aportados por el usuario, correcciones de perfil, conversaciones obtenidas y resultados posteriores. Explica cómo recoger estas señales con permisos adecuados y sin convertir una aceptación inicial en éxito comercial confirmado.

Para cada grupo indica si es imprescindible para una primera recomendación, necesario antes de ejecutar o útil para mejorar después. Identifica propietario, vía de acceso, costo, frescura requerida, evidencia y alternativa cuando falte. Prioriza datos por cuánto cambian la decisión, no por facilidad para acumularlos.

Explica deduplicación de empresas y eventos, cambios de marca, filiales, empresas homónimas, fusiones, reprogramaciones, cancelaciones y eventos recurrentes. Conserva el rol y la afiliación de cada participante en el momento del evento, sin sustituir automáticamente el histórico por su empleo actual.

Propón un esquema relacional inicial y justifica si hace falta un grafo. Incluye un diccionario de datos y un ejemplo de registro claramente etiquetado como real verificado o sintético ilustrativo.

### Contrato de entrega del dataset

Entrega CSV en UTF-8 para tablas y JSON/JSONL cuando haya estructura anidada que lo justifique. Define tipos, valores permitidos, claves primarias y foráneas y reglas de campos ausentes. Los nombres siguientes son el contrato inicial; cualquier simplificación debe conservar la información y las relaciones. Cada tabla debe indicar claramente qué representa una fila.

| Archivo | Una fila representa | Contenido mínimo |
|---|---|---|
| `sources.csv` | Una fuente o documento consultado | Identificador, URL exacta, editor, título, tipo, idioma, fecha de publicación si existe, fecha de consulta, edición a la que se refiere cuando se conoce, vía de acceso, reutilización documentada o pendiente y estado de extracción. |
| `assertions.csv` | Una afirmación sobre un campo de una entidad | Entidad e identificador, campo, valor respaldado, fuente, localizador como sección o página, breve evidencia permitida, fecha de validez, fecha de observación, clase de evidencia, confianza justificada y estado de conflicto. |
| `companies.csv` | Una organización | Identificador estable, nombre, alias, dominio, descripción, industria, productos, mercados y tamaño o rango solo cuando haya evidencia. Organizador, sponsor y expositor son roles, no empresas duplicadas. |
| `event_series.csv` | Una serie recurrente | Identificador, nombre, web, periodicidad observada y organizaciones relacionadas. No generes ediciones futuras a partir de la periodicidad. |
| `event_editions.csv` | Una edición o evento único observado | Identificador, serie si corresponde, título, URL, fechas, zona horaria conocida, modalidad, estado, localización, precisión geográfica, formato, sector, temas, idiomas, acceso, registro y última verificación. |
| `event_company_roles.csv` | Una relación empresa–edición–rol | Empresa, edición, rol, nivel de patrocinio si está documentado, estado anunciado o confirmado según evidencia y periodo aplicable. Conserva roles simultáneos distintos. |
| `sponsor_profiles.csv` | Un perfil documentado de una organización como sponsor | Empresa, objetivos, audiencias, categorías, geografías, canales de propuestas, proceso de decisión y presupuesto únicamente cuando esté documentado. El historial se obtiene de las relaciones con ediciones. |
| `sponsorship_packages.csv` | Un paquete para una edición | Edición, nombre o nivel, beneficios, importe o rango, moneda, exclusividad, inventario y disponibilidad documentados, vigencia, plazos y fuente. |
| `people.csv` | Una persona profesional identificada de forma fiable | Identificador, nombre público y perfil profesional publicado, con los mínimos datos necesarios. No incluyas correos personales, teléfonos privados ni atributos sensibles; no supongas acceso a listados privados. |
| `participation.csv` | Un rol o estado de participación de una persona en una edición | Persona, edición, organización y cargo en ese momento cuando consten, rol y estado: anunciado, registrado o asistente efectivo según la evidencia. Un speaker anunciado no es asistencia confirmada. |
| `audience_metrics.csv` | Una medida o segmento de audiencia de una edición | Edición, segmento, métrica, valor, unidad, denominador si existe, periodo, método y estado previsto o observado. Incluye perfiles agregados cuando no haya participantes individuales accesibles. |
| `event_metrics.csv` | Una métrica de resultado atribuida a una edición y actor | Edición, empresa o actor cuando corresponda, definición, valor, unidad, periodo, método de atribución y carácter estimado, declarado o medido. Mantén distintos asistencia, reuniones, leads, oportunidades, ingresos y renovación. |
| `event_costs.csv` | Un componente de costo documentado | Edición, categoría, importe o rango, moneda, unidad, impuestos o inclusiones conocidos, vigencia y carácter de tarifa, cotización o estimación. Los plazos se registran en `event_deadlines.csv`. |
| `venues.csv` | Un espacio identificado | Identificador, nombre, dirección pública, coordenadas con método y precisión, capacidad por formato si está documentada, web y canal empresarial. La disponibilidad debe asociarse a fechas y una verificación concreta. |
| `distribution_channels.csv` | Un canal documentado de convocatoria | Organización responsable, tipo, tema, geografía, acceso o colaboración documentados, tamaño declarado con fecha y restricciones conocidas. No equipares seguidores con personas alcanzables ni con asistentes. |
| `competitors.csv` | Un competidor o sustituto evaluado | Empresa, categoría, funciones documentadas, estado comercial, comprador, datos, cobertura, integraciones, precio público, fuentes y fecha de revisión. |
| `extraction_queue.csv` | Un lote o tarea de adquisición | Fuente y URL de inicio, segmento, ventana temporal, estado, prioridad, último punto procesado, cursor si existe, bloqueo, intentos y siguiente paso verificable. |

### Tablas adicionales para un histórico profundo y comprobable

Amplía el núcleo con las siguientes tablas. Cada una tiene una unidad de observación distinta y debe resolver una pregunta del producto. No dupliques una entidad para aparentar mayor volumen. Todas las tablas de hechos deben enlazar sus afirmaciones con `sources.csv` y `assertions.csv`; las derivadas deben guardar método, versión, entradas y fecha de corte. Si faltan datos, entrega el esquema, el estado y la fuente necesaria para completarlo.

**Adquisición, identidad y versiones**

| Archivo | Una fila representa | Campos mínimos adicionales |
|---|---|---|
| `platform_listings.csv` | La publicación de una edición en una plataforma | Edición, plataforma, identificador nativo si está publicado, URL, idioma, primera y última observación, estado y vínculo con otras publicaciones de la misma edición. Permite deduplicar Luma, Eventbrite, Partiful y la web oficial. |
| `source_snapshots.csv` | Una versión consultada o captura histórica de una fuente | Fuente, URL original y de archivo si existe, fecha de captura, consulta, tipo de contenido, hash si se pudo calcular, disponibilidad, material retenido y permiso documentado. |
| `crawl_runs.csv` | Una ejecución real de adquisición | Método o extractor, versión, alcance, inicio, fin, límites, páginas intentadas, completadas y fallidas, registros nuevos, costo medido y motivo de cierre. |
| `fetch_attempts.csv` | Un intento de recuperar una fuente | Ejecución, URL, fecha, resultado, clase de error, duración si se midió, número de intento y próximo paso. Sin tokens, cookies ni credenciales. |
| `search_queries.csv` | Una búsqueda de descubrimiento | Consulta, servicio, idioma, filtros, geografía, ventana, fecha, fuentes nuevas encontradas y lote al que alimenta. |
| `entity_aliases.csv` | Una equivalencia de nombre o identificador | Entidad canónica, alias o ID externo, sistema de origen, vigencia conocida, motivo de equivalencia, evidencia y estado de revisión. |
| `record_versions.csv` | Una versión de un registro o campo | Entidad, versión, valor anterior y nuevo o referencia a snapshot, tiempo de validez conocido, tiempo observado, procedencia y motivo de cambio. |
| `data_conflicts.csv` | Un conflicto entre afirmaciones | Entidad, campo, afirmaciones en conflicto, fuentes, fechas, regla aplicada, resolución o estado pendiente y responsable de revisión si lo hubo. |
| `taxonomy_terms.csv` | Un concepto de clasificación | Identificador, categoría, término, definición, padre, sinónimos, idioma y versión. Incluye sectores, formatos, temas, roles y objetivos comerciales. |
| `entity_classifications.csv` | La asignación de una categoría a una entidad | Entidad, término, origen explícito o inferido, evidencia, método, versión y revisión. No convierte una clasificación automática en afirmación de la empresa. |

**Ediciones, agenda, comunidad, espacios y evolución empresarial**

| Archivo | Una fila representa | Campos mínimos adicionales |
|---|---|---|
| `sessions.csv` | Una sesión de la agenda de una edición | Edición, título, descripción breve, tema, track, formato, fecha, horario y espacio cuando consten; versión de la agenda y estado. |
| `session_participants.csv` | Un rol profesional anunciado o verificado en una sesión | Sesión, persona u organización, rol de speaker, moderador o panelista, afiliación histórica, estado y evidencia. |
| `ticket_types.csv` | Una clase de acceso para una edición | Edición, nombre, requisitos, beneficios incluidos, modalidad gratuita o paga, cupo y moneda cuando se conozcan. |
| `ticket_price_history.csv` | Una observación de precio y disponibilidad de un ticket | Ticket, importe, moneda, cargos e impuestos conocidos, fase de venta, fecha de observación y vigencia documentada. No estima demanda a partir de precio solamente. |
| `event_status_history.csv` | Un cambio documentado del estado de una edición | Edición, estado anterior y nuevo, fecha del anuncio, fecha efectiva si consta, motivo declarado y fuente. Incluye cancelación, reprogramación y cambio de modalidad. |
| `event_relations.csv` | Una relación entre dos ediciones o series | Origen, destino, tipo como side event, coorganizado, continuación o proximidad temporal, evidencia y carácter oficial o inferido. Coincidir en ciudad no implica asociación. |
| `venue_spaces.csv` | Un espacio o configuración dentro de un recinto | Recinto, sala o configuración, aforo documentado, disposición, servicios, accesibilidad publicada y vigencia. |
| `event_space_assignments.csv` | El uso anunciado o confirmado de un espacio | Edición o sesión, espacio, intervalo, estado y evidencia. La propuesta de usarlo debe permanecer separada de una asignación real. |
| `event_assets.csv` | Un activo publicado de una edición | Edición, tipo de agenda, prospecto, presentación, mapa o recording, URL, autor, idioma, fecha, derechos conocidos y localizadores de evidencia. |
| `communities.csv` | Una comunidad identificada | Nombre, organización responsable si existe, tema, geografía, web, canales públicos y relación con otras marcas. Una comunidad puede organizar muchas ediciones sin ser una empresa distinta. |
| `community_event_links.csv` | Una relación comunidad–edición | Comunidad, edición, rol de anfitrión, colaborador o difusión, periodo y evidencia. |
| `company_profile_history.csv` | Un estado observado del perfil de una empresa | Empresa, versión, productos, propuesta de valor, audiencias declaradas, mercados y tamaño documentado, fechas de observación y validez. |
| `professional_affiliations.csv` | Una afiliación profesional pública con contexto temporal | Persona, empresa, cargo, fecha o intervalo documentado, edición relacionada si aplica y fuente. No deduzcas una carrera completa de una biografía aislada. |
| `event_deadlines.csv` | Un plazo publicado para una edición | Edición, tipo como registro, convocatoria de speakers o cierre de sponsors, fecha con precisión y zona conocidas, estado, requisitos y fuente. |
| `distribution_metrics.csv` | Una medición publicada o autorizada de un canal | Canal, métrica, valor, unidad, periodo, alcance, método y fuente. Conserva distinción entre suscriptores, impresiones, clics, registros y asistencia atribuida. |

**Noticias, anuncios y señales del mercado**

| Archivo | Una fila representa | Campos mínimos adicionales |
|---|---|---|
| `news_articles.csv` | Una pieza periodística o comunicado | Fuente, título, medio, autor cuando sea público, URL, idioma, fecha de publicación y actualización, tipo editorial, resumen propio, evento o fecha del hecho y acceso. Sin duplicar el texto íntegro protegido. |
| `news_entity_links.csv` | Una relación respaldada entre una pieza y una entidad | Artículo, entidad, tipo de mención, afirmación, periodo y evidencia localizada; diferencia mención incidental de patrocinio o participación. |
| `news_dedup_clusters.csv` | La pertenencia de una pieza a una familia de republicaciones | Artículo, grupo, probable origen, relación de republicación o actualización, evidencia y grado de independencia. |
| `company_signals.csv` | Un hecho empresarial documentado potencialmente relevante | Empresa, tipo de lanzamiento, expansión, alianza, contratación agregada o financiación anunciada, fecha, geografía, fuentes y relevancia hipotética separada del hecho. No supone presupuesto para eventos. |
| `market_context.csv` | Una observación contextual con alcance definido | Región o sector, variable, valor, unidad, periodo, fuente y vínculo explícito con una decisión del producto. No mezcles estadísticas de poblaciones distintas. |

**Acuerdos y ejecución del patrocinio**

| Archivo | Una fila representa | Campos mínimos adicionales |
|---|---|---|
| `sponsorship_history.csv` | Un acuerdo o patrocinio documentado | Empresa, edición o serie, paquete si corresponde, nivel, periodo, estado, modalidad monetaria o en especie cuando se conozca e importe solo con evidencia. Detalla el acuerdo; no duplica sin información el rol de sponsor. |
| `sponsorship_deliverables.csv` | Un beneficio incluido en un paquete o acuerdo | Paquete o acuerdo, tipo, cantidad y unidad si existen, audiencia prometida, plazo y criterio documentado de cumplimiento. |
| `sponsorship_observations.csv` | Evidencia de ejecución de un beneficio o activación | Acuerdo o beneficio, edición, fecha, observación, fuente, estado anunciado o realizado y métricas disponibles. Separa entrega de resultados comerciales. |
| `partner_relationships.csv` | Una alianza organizativa o comercial documentada | Organizaciones, tipo, objetivo declarado, periodo, eventos asociados y evidencia. Compartir un evento no demuestra una alianza. |

**Tablas derivadas y evaluación del valor del producto**

| Archivo | Una fila representa | Campos mínimos adicionales |
|---|---|---|
| `sponsorship_renewals.csv` | Una comparación de continuidad de patrocinio | Empresa, serie, ediciones comparadas, relación observada, cobertura de las fuentes y clasificación renovado, salida confirmada o desconocido. La ausencia de evidencia no cuenta como salida. |
| `topic_trends.csv` | Una medida temporal de un tema | Tema, geografía o sector, periodo, universo observado, conteo deduplicado, normalización, fuentes y cambios de cobertura. |
| `audience_overlap.csv` | Una medida agregada de coincidencia entre audiencias | Entidades comparadas, definición del universo, método, denominador, proporción o conteo, periodo y límites. Utiliza solo datos disponibles y autorizados; no inventes coincidencia individual. |
| `opportunity_clusters.csv` | Una hipótesis de oportunidad por tema y mercado | Región, audiencia, tema, formato, periodo, oferta observada, evidencia de demanda si existe, costos y vacíos. Poca oferta por sí sola no demuestra oportunidad. |
| `evaluation_cases.csv` | Un caso de evaluación independiente | Perfil de empresa o evento, objetivo, restricciones, fecha de corte, candidatos admisibles, origen de etiquetas, división de evaluación y calidad de verdad de referencia. |
| `recommendation_runs.csv` | Una ejecución real de un método de recomendación | Caso, fecha de corte, versión del dataset, método y parámetros, versión del modelo si aplica, tiempo y costo medidos. |
| `recommendation_candidates.csv` | Un candidato evaluado en una ejecución | Ejecución, evento, elegibilidad, componentes del score, ranking, evidencia, datos faltantes, explicación y etiqueta de evaluación si existe. |
| `sponsor_match_scores.csv` | Una evaluación de afinidad sponsor–evento | Empresa, edición o concepto, fecha de corte, criterios, restricciones, historial disponible, score de afinidad, incertidumbres y estado de interés confirmado por separado. |
| `scoring_evaluations.csv` | Una métrica de comparación entre métodos | Conjunto evaluado, método, baseline, métrica, tamaño, definición, intervalo cuando sea calculable, sesgos y limitaciones. |
| `unit_economics_scenarios.csv` | Un escenario de costo de operación | Volumen, frecuencia, fuentes, licencias, extracción, modelos, mapas, almacenamiento, revisión humana, costo por recomendación útil y supuestos. Distingue escenario estimado de costo medido. |

**Propuestas y datos aportados por usuarios: separados del histórico observado**

| Archivo | Una fila representa | Campos mínimos adicionales |
|---|---|---|
| `event_concepts.csv` | Una propuesta nueva generada, todavía no un evento existente | Brief, tema, objetivo, audiencia, formato, lugar y fecha propuestos, justificación, evidencia de referencia, presupuesto estimado y decisiones pendientes. |
| `luma_drafts.csv` | Una versión de contenido preparado para Luma | Concepto, título, descripción, agenda, campos soportados, estado local, versión y decisiones pendientes. Un ID de Luma solo existe si se creó realmente con autorización; este research no publica. |
| `draft_field_evidence.csv` | El origen de un campo del borrador | Borrador, campo, valor, origen como dato del cliente, fuente o sugerencia creativa, evidencia y aprobación pendiente o recibida. |
| `customer_briefs.csv` | Un brief aportado por una empresa | Cliente, website, objetivo, oferta, audiencia, geografía, fechas, presupuesto, restricciones, prioridades y versión. Esquema vacío si no existen clientes reales autorizados. |
| `user_feedback.csv` | Una respuesta real a una propuesta | Brief, propuesta, tipo de aceptación, rechazo o corrección, motivo, fecha y resultado posterior cuando se aporte. No simules feedback como evidencia de demanda. |

Este contrato contiene 66 tablas de datos, adquisición, análisis y producto, además de archivos de documentación y control. Las tablas observadas, derivadas y privadas deben estar diferenciadas en el manifiesto y en el almacenamiento. Un esquema vacío es trabajo de diseño, no datos obtenidos. No presentes las tablas de evaluación como pobladas si todavía no se ejecutó una evaluación.

Organiza la ejecución por capas: primero fuentes y ediciones; después empresas, sponsors, agenda, comunidades, noticias y resultados; luego reconstrucción temporal, análisis y evaluación; por último ejemplos de propuestas y borradores. La amplitud del modelo no debe impedir entregar pronto el primer lote real y ampliarlo sin cambiar los identificadores.

Incluye también `data_dictionary.csv`, con definición, tipo, unidad, obligatoriedad, valores permitidos, prioridad para el producto y origen esperado de cada campo. Adjunta `run_manifest.json`, `coverage.csv`, `quality_report.md` y un README que explique cómo unir y utilizar los archivos. Añade un archivo de alias o fusiones si hubo resolución de entidades.

Para datos propios todavía inexistentes, entrega solamente esquemas vacíos y formularios propuestos: briefs de clientes, cuentas objetivo aportadas por ellos, preferencias, propuestas mostradas, feedback, conversaciones y resultados privados. Explica cómo enlazarlos al dataset público sin publicar información de clientes. No inventes empresas usuarias ni resultados para llenar esos esquemas.

Si una tabla no tiene registros accesibles, entrega su esquema y el motivo. No fabriques filas. Si el entorno no puede adjuntar archivos, entrega bloques exportables completos por lotes, con el manifiesto de qué parte se entregó y qué parte queda pendiente; no llames dataset completo a una vista previa.

### Normalización, trazabilidad y control de calidad

- Utiliza identificadores estables y verifica integridad de relaciones. Conserva URL original y URL canónica cuando difieran. Las organizaciones con dominios distintos no deben fusionarse solo por un nombre parecido.
- Representa fechas en formato inequívoco y conserva precisión y zona horaria solo si se conocen. No inventes día, hora o zona para completar una fecha parcial. Conserva moneda original; cualquier conversión debe documentar fecha, tasa y fuente.
- Distingue cero, falso, vacío y desconocido. Para valores ausentes registra motivo: no publicado, no encontrado, acceso restringido, no aplicable, desactualizado o en conflicto. No rellenes huecos con predicciones dentro de columnas de hechos.
- Cada valor material de un registro debe poder vincularse a su evidencia. Preserva discrepancias entre fuentes, explica cuál usas y por qué; no resuelvas automáticamente que la fecha de consulta más reciente convierte un contenido antiguo en dato actual.
- Diferencia fecha del evento, fecha de publicación, fecha de consulta y fecha de validez de una afirmación. Para archivos web registra además la fecha de la captura.
- Evalúa confiabilidad según autoridad, cercanía al hecho, vigencia y corroboración. No presentes porcentajes de confianza arbitrarios como probabilidades calibradas.
- Comprueba duplicados, relaciones huérfanas, coordenadas inconsistentes, monedas y unidades mezcladas, fechas imposibles y métricas incompatibles, considerando sus definiciones. Revisa una muestra estratificada contra las fuentes e informa tamaño de auditoría, errores encontrados y correcciones.
- Reporta completitud por campo y cobertura por año, territorio, sector, formato y fuente. Mide por separado descubrimiento de eventos y enriquecimiento de sponsors, audiencia y resultados. La cantidad de filas y la cantidad de eventos únicos deben aparecer separadas.
- Solo expresa cobertura porcentual del universo cuando exista un denominador defendible. Si falta, explica qué subconjunto se recorrió, qué fuentes se agotaron y qué segmentos siguen desconocidos.

El manifiesto debe incluir versión, parámetros, fechas, archivos realmente generados, filas por tabla, entidades únicas, fuentes procesadas, fuentes pendientes, duplicados resueltos, errores y motivo de cierre de la ejecución. No declares archivos, extracciones, auditorías o integraciones que no se hayan realizado.

## 4. Resultados, atribución y límites

Investiga qué resultados pueden reconstruirse públicamente y cuáles requieren CRM, registro, encuestas, datos del organizador o acuerdos con sponsors.

No infieras éxito comercial de la presencia de logos, tamaño anunciado, repetición de un evento o publicaciones promocionales. Separa cifras previstas de resultados reales y casos de éxito seleccionados de evidencia representativa.

Define cómo medir el valor para cada usuario: empresa que organiza, empresa que asiste o patrocina, organizador y sponsor. Distingue ingresos originados, ingresos influenciados y retorno incremental; explica los límites de atribución sin prometer causalidad.

Propón cómo empezar cuando falten resultados históricos y qué captura de datos futura permitiría mejorar las recomendaciones.

## 5. Recomendaciones y búsqueda de sponsors

Diseña un mecanismo inicial explicable para relacionar empresas con eventos y eventos con sponsors. Considera afinidad de audiencia, objetivos, geografía, calendario, presupuesto, formato, historial, presencia de cuentas objetivo, exclusividad de categoría y calidad de evidencia.

Separa adecuación estratégica, propensión estimada y disponibilidad confirmada: un patrocinio previo no prueba interés actual ni presupuesto disponible.

Explica cómo obtener un perfil útil desde el website, qué revisar con el cliente y cómo manejar empresas o eventos sin historial. Compara reglas simples, búsqueda semántica y modelos más complejos; recomienda la opción mínima que pueda validarse.

Diseña ejemplos de tres entregables del producto: recomendación semanal de oportunidades con mapa y lista priorizada, borrador de un evento nuevo preparado para Luma y shortlist de sponsors para un evento existente. Cada propuesta debe mostrar evidencia, motivo de encaje, incertidumbre y próximo paso. Los ejemplos hipotéticos deben quedar identificados como tales.

Define métricas de evaluación: relevancia juzgada por usuarios, aceptación, calidad de shortlist, conversión a conversación, patrocinio confirmado, costo por recomendación útil y frescura de datos. Evita evaluar usando información futura que no habría estado disponible al recomendar.

## 6. Del prompt al mapa de eventos

Investiga qué información mínima permite convertir una petición abierta en recomendaciones útiles: objetivo comercial, industria, cliente ideal, ubicación o radio de desplazamiento, fechas, presupuesto y preferencia por asistir, patrocinar u organizar. Propón qué extraer del website, qué preguntar y qué puede permanecer como supuesto visible sin bloquear una primera respuesta.

Define qué significa "los mejores eventos" para cada objetivo. Propón un ranking explicable que primero aplique restricciones obligatorias y después compare afinidad de audiencia, relevancia comercial, costo total estimado, oportunidad temporal, calidad de evidencia y otras señales justificadas. No presentes una puntuación de afinidad como probabilidad de éxito o retorno garantizado.

Investiga la viabilidad de un mapa con filtros y una lista sincronizada. Distingue eventos próximos confirmados, ediciones pasadas utilizadas como referencia y conceptos nuevos todavía propuestos. Separa los eventos online. Define cómo representar ubicaciones aproximadas o pendientes y cómo evitar inventar direcciones, coordenadas, disponibilidad o distancias.

Cada oportunidad del ejemplo debe incluir nombre, estado, fecha y zona horaria cuando estén confirmadas, ubicación con su precisión, organizador, URL de origen, fecha de verificación, precio conocido o desconocido, motivos de encaje y limitaciones. La información de una edición pasada no confirma la fecha ni los sponsors de la siguiente.

Compara proveedores de mapas y geocodificación con fuentes oficiales: cuotas gratuitas, costos por volumen, atribución, almacenamiento permitido, cobertura y dependencia. Recomienda una alternativa proporcional al MVP, sin construir una aplicación como parte de este research.

Entrega una muestra de oportunidades mapeables sustentada en fuentes. Si el entorno puede representar un mapa, acompáñalo con la tabla original; si no, entrega datos exportables para generarlo. Explicita si la muestra es ilustrativa por falta de un perfil empresarial o una geografía definidos. No presentes una selección genérica como personalizada.

## 7. Del concepto al borrador para Luma

Verifica en documentación oficial vigente qué permite Luma respecto de creación y edición de eventos, borradores, acceso por API, autenticación, límites y planes gratuitos o pagos. No presupongas que existe un endpoint de borrador ni que se puede acceder a él gratuitamente. Distingue preparar contenido para copiar manualmente, crear un borrador dentro de una cuenta y publicar un evento.

Identifica los campos que admite realmente Luma y clasifica cuáles son obligatorios, opcionales o externos a la página del evento. Propón un paquete de contenido con título, descripción, propuesta de valor para asistentes, audiencia, agenda, anfitrión, idioma, fecha, horario, zona horaria, lugar o modalidad, registro y llamada a la acción, únicamente en la medida en que esos campos estén soportados. Mantén objetivos internos, presupuesto y estrategia de sponsors en un brief separado cuando no correspondan a la página pública.

El borrador debe distinguir información confirmada de decisiones pendientes. No debe presentar un recinto como reservado, una persona como speaker confirmado, una empresa como sponsor comprometido ni una fecha como definitiva sin evidencia. Los borradores de eventos nuevos son propuestas, no eventos ya existentes.

Entrega un ejemplo de contenido preparado para Luma y la evidencia que respalda su concepto, junto con una lista de datos que el organizador debe completar. El ejemplo puede usar un escenario hipotético claramente identificado; no inventes un evento real para demostrar el flujo.

Compara dos caminos de MVP: contenido listo para copiar en Luma e integración autorizada si existe acceso adecuado. Explica costo, fricción, restricciones y mantenimiento. Durante esta investigación no crees ni publiques eventos, no invites personas y no contactes sponsors.

## 8. Mercado, cliente y negocio

Evalúa quién tiene el dolor más urgente y quién paga: equipos de field marketing, demand generation, alianzas, ventas, organizadores, agencias o sponsors. Compara la venta a una sola parte con un marketplace de dos lados y explica el problema de conseguir oferta y demanda simultáneamente.

Identifica el proceso actual, horas invertidas, gasto existente, frecuencia de uso, objeciones, comprador y aprobador. Propón hipótesis de precio y disposición a pagar, distinguiéndolas de precios observados.

Si estimas mercado, utiliza un cálculo desde número de clientes alcanzables y gasto razonado; muestra supuestos y evita equiparar todo el gasto global en eventos con el mercado de este software.

Propón tres segmentos iniciales y recomienda uno según dolor, acceso a datos, competencia, venta y capacidad de demostrar valor. Evalúa qué datos propios podrían constituir una ventaja sostenible y cuánto costaría generarlos.

Evalúa una experiencia inicial gratuita para el usuario. Separa explícitamente cuatro cuestiones: gratuidad del producto, entradas gratuitas a eventos, fuentes de datos gratuitas y capacidades gratuitas de Luma. No son equivalentes. Compara límites de uso, freemium y otras vías sostenibles de financiar la experiencia, sin asumir que alguna ya está decidida ni que la infraestructura cuesta cero.

## 9. MVP, costos y validación

Recomienda el flujo inicial más valioso y delimita qué funciones postergar. Evalúa si realmente se necesitan cinco años de datos exhaustivos antes de ofrecer valor o si una muestra reciente y relevante basta para validar el producto.

Diseña un plan de 30, 60 y 90 días con entregables, dependencias, responsables por función y criterios de decisión. Incluye una versión con servicio manual asistido para comprobar demanda antes de automatizar.

Estima rangos de costo de datos, extracción, modelos, enriquecimiento, almacenamiento, actualización y revisión humana. Explicita volumen, frecuencia y demás supuestos; separa precios documentados de estimaciones de planificación.

Incluye mapas, geocodificación y acceso a Luma cuando corresponda. Estima el costo por flujo completo —prompt, investigación, ranking, mapa y borrador— y cómo cambia con la actualización diaria o semanal. Identifica qué puede probarse con planes gratuitos y qué límites obligarían a pagar.

Propón entrevistas y experimentos para comprobar demanda, acceso a datos, calidad del matching, disposición a pagar y resultados. Define criterios medibles para continuar, cambiar de segmento o detener la inversión, sin presentar umbrales sugeridos como estándares probados.

## 10. Mantenimiento y continuación del dataset

Define frecuencias de actualización según el cambio esperado y la cercanía del evento: fechas, cancelaciones, registro, precios, paquetes, speakers y sponsors pueden requerir distintas revisiones. Conserva histórico de cambios y registra desapariciones; una página retirada no demuestra por sí sola que un evento se canceló.

Propón un proceso incremental con control de versiones, altas, cambios, fusiones y verificaciones vencidas. Evita reconstruir todo el histórico en cada consulta. Evalúa costo y frescura por campo y justifica qué actualizar diariamente, semanalmente o con menor frecuencia.

Entrega `next_steps.md` con una cola priorizada por impacto en las decisiones del producto, esfuerzo y cobertura faltante. Para cada lote pendiente especifica fuente y URL, filtros, años o fechas, campos buscados, punto de reanudación y condición de finalización. Si hace falta acceso pago o datos de organizadores, distingue ese bloqueo de una tarea pendiente por tiempo.

Un research termina cuando entrega su alcance efectivamente procesado y sus límites; eso no significa que todo el dataset del producto esté completo. Explica qué parte puede resolverse mediante investigación web, cuál requiere adquisición automatizada posterior y cuál depende de acuerdos o datos propios. No presentes estimaciones del trabajo futuro como datos ya obtenidos.

## Entregables finales

Antes de redactar las conclusiones, completa la siguiente validación.

### Pruebas para determinar si el histórico produce una ventaja real

Evalúa estas hipótesis sin presuponer que se cumplirán:

1. **Cobertura incremental:** combinar fuentes recupera ediciones, sponsors y relaciones que no aparecen en la mejor fuente individual dentro del mismo alcance.
2. **Calidad de recomendación:** el histórico, la audiencia y las relaciones permiten proponer eventos más adecuados que una búsqueda simple por tema, ciudad y fecha.
3. **Calidad del matching de sponsors:** las señales históricas y actuales mejoran la pertinencia de una shortlist respecto de buscar empresas del mismo sector o sponsors de un solo competidor.
4. **Valor del borrador:** la investigación permite preparar un evento más específico, viable y sustentado que una propuesta genérica basada únicamente en el website.
5. **Economía y mantenimiento:** obtener esa mejora tiene un costo y una frecuencia de actualización compatibles con la experiencia gratuita o el modelo de ingresos evaluado.
6. **Utilidad de noticias:** agregar noticias y señales de empresas aporta información actual que cambia decisiones útiles, sin confundir visibilidad mediática con interés comercial.

Define casos representativos por empresa, objetivo, presupuesto, región y formato. Separa casos de desarrollo y evaluación antes de ajustar el ranking. Si usas escenarios sintéticos para probar el flujo, etiquétalos como pruebas funcionales; no son evidencia de demanda, precisión comercial o retorno.

Compara al menos una baseline sencilla con el sistema propuesto usando el mismo universo de candidatos y las mismas restricciones. Evalúa búsqueda por palabra clave, geografía y fecha; otra basada en similitud de perfil; y las variantes con historial, audiencia, sponsors y noticias cuando existan esos datos. Documenta los beneficios y el costo incremental de cada capa. No asumas que más variables mejoran el resultado.

Cuando haya evidencia suficiente, realiza una evaluación temporal: utiliza únicamente información demostrablemente disponible antes de la fecha de corte y evalúa con observaciones posteriores reservadas. Una página consultada hoy con contenido retrospectivo no debe filtrarse como información que el sistema habría sabido entonces. Si no puedes reconstruir esa disponibilidad, presenta una evaluación retrospectiva con esa limitación, no una simulación histórica válida.

Para sponsors, un acuerdo observado puede aportar una etiqueta positiva; no observarlo no es una etiqueta negativa fiable. Separa afinidad, contacto, conversación, propuesta y acuerdo cerrado. Para eventos, diferencia relevancia juzgada, asistencia, reuniones y valor comercial. No presentes participación observada como prueba de rentabilidad.

Mide, cuando corresponda y pueda calcularse: proporción de recomendaciones relevantes entre las primeras opciones, candidatos útiles nuevos, diversidad sin perder afinidad, violaciones de presupuesto o fecha, afirmaciones sin evidencia, frescura, correcciones necesarias del borrador, tiempo de preparación y costo por resultado útil. Incluye definiciones, tamaño de muestra, incertidumbre y fallos por segmento; si no hay etiquetas o evaluadores reales, entrega el protocolo y marca la métrica como no medida.

No uses al mismo modelo para generar candidatos, inventar respuestas esperadas y declarar el éxito. Utiliza evidencia independiente, rúbricas revisables y evaluación humana real cuando esté disponible. Proponer entrevistas no autoriza contactar personas durante este research. No fabriques evaluadores, pilotos, testimonios ni disposición a pagar.

Investiga cuánta historia añade valor comparando periodos disponibles —por ejemplo, información reciente frente a varios años— sin borrar el objetivo de construir el histórico de cinco años. Mide también el aporte por fuente y por familia de datos. Señala fuentes caras, redundantes o desactualizadas aunque produzcan muchas filas.

Entrega `validation_report.md` con hipótesis, método, baseline, evidencia, resultado medido o pendiente, limitación y decisión. Concluye con un veredicto sustentado: evidencia favorable, evidencia mixta o insuficiente, o hipótesis contradicha. La conclusión debe explicar qué tendría que cambiar para modificar el veredicto.

### Paquete de entrega

1. Dataset real extraído en archivos reutilizables, con todas las filas recopiladas y las relaciones verificables. Una pequeña selección puede ilustrar el informe, pero no reemplaza los archivos completos obtenidos.
2. Manifiesto de ejecución, README, diccionario de datos, modelo de relaciones, informe de calidad y tabla de cobertura.
3. Inventario evaluado de fuentes, con URLs, acceso, histórico, restricciones, costos y estado efectivo de extracción.
4. Cola de continuación y plan de mantenimiento del histórico de cinco años y de próximos eventos, con límites y datos que todavía requieren acceso.
5. Matriz competitiva enlazada y análisis profundo de los cinco actores más cercanos.
6. Diseño investigado del flujo prompt y website → perfil → ranking y mapa de oportunidades → concepto elegido → borrador para Luma → sponsors compatibles, indicando qué etapas corresponden a eventos existentes y cuáles a eventos propios.
7. Muestra de mapa o datos mapeables, criterios de ranking y trazabilidad de cada oportunidad.
8. Ejemplo de borrador para Luma, campos pendientes y matriz de viabilidad de preparación manual frente a integración, basada en documentación oficial.
9. Cliente inicial, diferenciación, alternativas para una experiencia gratuita, modelo de ingresos, costos y plan de MVP.
10. Registro de supuestos, contradicciones entre fuentes, información no disponible y decisiones pendientes.
11. Informe de validación con comparaciones frente a métodos sencillos y aporte medido o pendiente de cada fuente y familia de datos.
12. Resumen ejecutivo con recomendación argumentada: construir, acotar, cambiar el enfoque o descartar; principal riesgo y evidencia adicional que podría modificar la conclusión.

Organiza los archivos en carpetas de datos observados, datos derivados, esquemas privados, evidencia permitida e informes. Si el entorno lo permite, entrega un ZIP y una base SQLite o equivalente con las relaciones para consulta, además de los CSV; comprueba que contengan lo declarado antes de enlazarlos. No incluyas secretos ni materiales sin permiso de retención. Un mapa es una vista del dataset, no su sustituto.

El resumen debe abrir con números verificables de esta ejecución: ediciones únicas, series, organizaciones, relaciones de patrocinio, artículos originales tras deduplicación, años y territorios cubiertos, fuentes procesadas y completitud de campos críticos. Separa estos conteos de los valores anunciados por proveedores y del tamaño potencial del mercado.

Incluye ejemplos trazables de recorridos completos: empresa → objetivo → evidencia histórica → recomendación; evento → audiencia → oferta de patrocinio → sponsor compatible; noticia empresarial → señal documentada → hipótesis de oportunidad; y concepto propio → campos del borrador para Luma. Si alguno no puede completarse, identifica el enlace faltante sin inventarlo.

Prioriza el trabajo en este orden: acceso y extracción de datos, normalización y evidencia, validación y cobertura, viabilidad del mapa y Luma, comparación competitiva y conclusiones de negocio. Conserva los hallazgos de cada parte, pero no consumas toda la ejecución redactando un análisis comercial y dejes el dataset sin extraer.

Cierra con las diez preguntas de mayor impacto que aún necesitan respuesta y el siguiente lote concreto que conviene procesar. Prefiere identificar una limitación real a inventar completitud.

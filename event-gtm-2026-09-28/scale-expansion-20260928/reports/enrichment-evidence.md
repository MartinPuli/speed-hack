# Enriquecimiento primario de sponsors, audiencia y señales empresariales

Extracción: 2026-09-28 UTC. Skill aplicado: `research`, ejecutado como subagente de investigación delegado; se usó también `pdf` para interpretar tablas de prospectos. Es un estrato pequeño de enriquecimiento técnico y no un censo de eventos o patrocinios.

## Entrega y conteos

`batches/enrichment.jsonl` contiene **162 assertions**: 136 relaciones nombradas (133 sponsors y 3 media partners), 3 organizadores/auspicios, 6 métricas de audiencia, 6 métricas de resultados/sponsors, 5 precios de paquetes, 1 convocatoria histórica, 1 noticia empresarial, 3 perfiles de organizaciones/productos y 1 perfil de audiencia promocionado. Los seis eventos son ediciones de conferencias, no sesiones individuales.

| Edición | Ciudad / país | Relaciones nombradas | Notas |
|---|---|---:|---|
| [FOSDEM 2024](https://archive.fosdem.org/2024/about/sponsors/) | Bruselas / Bélgica | 16 | Niveles y forma explícita de apoyo |
| [FOSDEM 2025](https://archive.fosdem.org/2025/about/sponsors/) | Bruselas / Bélgica | 13 | Niveles y forma explícita de apoyo |
| [FOSDEM 2026](https://archive.fosdem.org/2026/about/sponsors/) | Bruselas / Bélgica | 17 | Niveles y forma explícita de apoyo |
| [KubeCon + CloudNativeCon Japan 2025](https://events.linuxfoundation.org/archive/2025/kubecon-cloudnativecon-japan/sponsor-list/) | Tokio / Japón | 39 | Logos y niveles archivados |
| [KubeCon + CloudNativeCon India 2025](https://events.linuxfoundation.org/archive/2025/kubecon-cloudnativecon-india/sponsor-list/) | Hyderabad / India | 42 | Incluye 3 media partners, excluidos del conteo de sponsors |
| [PyCon AU 2025](https://2025.pycon.org.au/sponsor/) | Melbourne / Australia | 9 | Linux Australia es auspicio aparte |

Se consultaron los CSV heredados: 288 empresas, 688 ediciones y 320 sponsorship_history. No había relaciones de sponsorship_history para estas seis ediciones. PyCon AU 2025 ya está como `evt_46dba274af8639b7`; es enriquecimiento de esa edición, no una nueva edición. Los tres Python devrooms heredados de FOSDEM son subeventos y **no** equivalen al congreso FOSDEM completo; no se les deben imputar todos los sponsors del congreso como si fueran sponsors del devroom. Las empresas pueden repetirse entre ediciones y con las 288 heredadas: 136 relaciones no significa 136 empresas nuevas.

## Definición de la evidencia

Cada fila lleva `assertion_id`, `source_url`, `fetch_id`, `observed_at`, `content_sha256`, `locator`, `evidence_class`, `language`, `confidence` y explicación. Las relaciones además llevan edición/fechas/ciudad/país, nombre y URL de organización, `role`, `level`, `support_type`, `amount=null` y `paid_contract_verified=false`. La fuente institucional primaria respalda lo publicado, no una auditoría independiente. `financial_support_explicit` significa que el organizador afirma apoyo financiero; no certifica pago, importe, contrato o ejecución de contraprestaciones. `in_kind_support_explicit` diferencia infraestructura, conectividad o venue de dinero.

`company_name` normaliza etiquetas de logos como “LY Corporation (OSS Japan)” → “LY Corporation” y “CircleCI horizontal” → “CircleCI”; `company_name_raw` y `company_aliases` conservan lo publicado. Para entity resolution, usar dominio y luego nombre, sin convertir etiquetas gráficas en empresas nuevas. La URL empresarial apunta al destino publicado por la fuente y puede contener UTM históricos. Las uniones no deben basarse exclusivamente en igualdad literal de nombre.

Las métricas tienen `metric`, `value`, `unit`, `denominator`, `definition`, publicación y página PDF. `denominator=null` es desconocido o no aplicable, nunca cero. `kind` permite rutear relaciones, métricas, paquetes, perfiles y noticias sin fingir homogeneidad. Un perfil de audiencia promocionado no es composición observada.

## Audiencia y resultados que sí pueden afirmarse

El [reporte primario Japón, julio de 2025](https://www.cncf.io/wp-content/uploads/2025/07/KubeCon-CloudNativeCon-Japan-2025-Transparency-Report-FINAL.pdf), página 3, reporta **1.502 registros**, **98% de tasa de asistencia** y **471 empresas representadas**. Página 11: **6.065 leads onsite**, promedio **178 por booth** y **42 sponsors únicos**. El [reporte primario India, septiembre de 2025](https://www.cncf.io/wp-content/uploads/2025/09/KubeCon_India25_TransparencyReport.pdf), página 3, reporta **4.017 registros**, **96% de tasa de asistencia** y **1.256 empresas representadas**. Página 11: **19.248 leads**, promedio **494 por booth** y **42 sponsors únicos**.

No se calcula una cifra exacta de asistentes multiplicando registros por un porcentaje redondeado. Tampoco se deduplican leads como personas, ni se interpretan como SQL, conversiones o ingresos. El número de booths utilizado como denominador del promedio no está declarado. Las páginas de logos recuperadas contienen 39 sponsors en Japón y 39 sponsors + 3 medios en India, mientras que los reportes dicen 42 sponsors únicos en cada edición. Se conserva esa diferencia: los reportes incluyen categorías como marketing opportunities y no permiten concluir que las páginas de logos sean exhaustivas. No debe rellenarse la diferencia con sponsors inventados.

## Paquetes y señal empresarial

El [prospecto v4 de PyCon AU 2025](https://2025.pycon.org.au/files/Sponsor%20PyCon%20AU%202025%20-%20Prospectus%20v4.pdf), página 12, publica Digital AUD 3.000, Startup 3.500, Standard 7.000, Gold 10.000 y Platinum 15.000; todos **sin GST** y con posibles descuentos. Se verificó visualmente la asociación columna/precio. Diamond requiere conversación, por lo que no tiene importe inventado. Página 15 da 29 de agosto como plazo para la mayoría de add-ons; es una oportunidad histórica cerrada y no una oferta vigente. Estos precios no se adjudican como gasto a Valkey, Snowflake u otro sponsor.

[Snowflake anunció el 27 de mayo de 2026 una colaboración ampliada con AWS](https://www.snowflake.com/en/news/press-releases/snowflake-expands-aws-collaboration-with-6b-commitment-to-accelerate-enterprise-agentic-ai-adoption/) orientada a adopción empresarial de AI. La noticia vincula dos empresas ya observadas como sponsors y aporta una señal temática reciente. No revela que quieran patrocinar un nuevo meetup ni un presupuesto disponible. El perfil público se limita a su plataforma de datos y AI.

## Dos puntos de partida trazables para el flujo de producto

1. **URL Snowflake:** `https://www.snowflake.com/`. Perfil público AI/data empresarial del comunicado anterior; Gold sponsor de PyCon AU 2025, documentado en [#snowflake](https://2025.pycon.org.au/sponsor/#snowflake). Hipótesis derivada para evaluar: taller de datos/AI para desarrolladores Python en Melbourne, con AWS en shortlist porque aparece en la misma edición y en la colaboración empresarial. Pedir al usuario objetivo concreto, ICP geográfico/sectorial, fecha, presupuesto, capacidad y métricas de éxito. El anuncio de infraestructura no es un presupuesto de eventos.
2. **URL ClickHouse:** `https://clickhouse.com/`. Su [homepage actual](https://clickhouse.com/) declara una base de datos OLAP y ofertas/use cases para analítica en tiempo real, observabilidad, data warehousing y ML/GenAI. Sponsor Silver en [Japón](https://events.linuxfoundation.org/archive/2025/kubecon-cloudnativecon-japan/sponsor-list/) y [India](https://events.linuxfoundation.org/archive/2025/kubecon-cloudnativecon-india/sponsor-list/) en 2025. Hipótesis derivada: laboratorio de observabilidad y analítica SQL para equipos de plataforma, evaluando Tokio e Hyderabad según ICP del usuario; AWS y Google Cloud son candidatos de shortlist por coexistencia documental. No se presume interés actual, permiso para marcas, speakers confirmados ni compromiso comercial.

También se conserva el perfil primario actual de [Valkey](https://valkey.io/), un proyecto open source BSD de datastore, con su relación Platinum de PyCon AU. Valkey es un proyecto/producto; no se debe convertir en una sociedad mercantil por el hecho de aparecer en la columna `company_name`.

Son inputs de ejemplos locales; no se creó evento, no se llamó API Luma y no hubo contacto con sponsors. Las hipótesis y borradores deben ir a tablas derivadas, separadas de estos hechos.

## Reproducción, límites y QA

Ejecutar `python3 scripts/collect_enrichment.py` desde esta carpeta y luego `python3 scripts/qa_enrichment.py`. Requiere `requests`, `beautifulsoup4`; el extractor PDF usa `pypdf` del runtime local configurado en el script (adaptar ruta en otro host). Se guardan metadatos y SHA-256, no HTML bruto ni registros de asistentes. Hay checkpoint tras cada edición/fuente; la ejecución actual reemplaza su propio JSONL de lote, sin tocar el paquete heredado. Hacer copia versionada para preservar snapshots entre ejecuciones de producción. Fuente que falla corta el batch; puede reiniciarse idempotentemente. Hasta 3 intentos de errores de red/5xx, espera exponencial y 1 solicitud/segundo por host; 429 detiene sin evasión. No es aún un scheduler incremental completo de enriquecimiento.

Robots fue 404 para archivos FOSDEM/PyCon y 200 permitiendo las rutas de Linux Foundation/CNCF/Snowflake. Ausencia de robots no es una licencia de contenido: se extrajeron hechos mínimos y enlaces, no se republicaron páginas ni bases completas. `research.redhat.com/robots.txt` respondió 403 durante exploración: se abandonó esa fuente, sin bypass. Las fechas FOSDEM proceden de encabezados y las fechas KubeCon de sus páginas oficiales. PyCon AU fechas heredadas coinciden con el programa de la edición; no se toma el header de navegación actual como fecha del archivo.

QA: unicidad de assertions y relaciones, metadatos fuente/hash, HTTP 200, fechas ordenadas, roles diferenciados, precios/moneda/impuestos, tasas sin precisión inventada y ausencia de campos de contacto personal. Resultado en `reports/enrichment_qa.json`. Los nombres son organizaciones, no una lista de asistentes. Los archivos de hechos no contienen emails ni teléfonos.

Sesgos: seis conferencias open source/tecnología, cuatro países, dos familias dominantes; falta cobertura de otros sectores y pequeños encuentros. Vacíos materiales: gasto pagado, contratos, ROI causal, participantes individuales, interés actual y presupuesto. Ampliación prioritaria: recorrer el catálogo oficial de [reportes CNCF](https://www.cncf.io/reports/) por edición y conservar las definiciones exactas de cada tabla antes de comparar países; después añadir prospectos y archivos de sponsors de más organizadores. Para el piloto de auditoría sponsor/resultados, Japón o India tienen mejores fuentes transparentes que una lista de logos aislada; para un piloto de producto comercial la decisión también requiere ICP y región aportados por el usuario.

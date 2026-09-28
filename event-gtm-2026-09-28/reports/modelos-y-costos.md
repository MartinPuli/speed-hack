# Modelos y costos para extracción y síntesis

Fecha de verificación: **28 de septiembre de 2026**. Investigación documental de fase 2; no se ejecutaron llamadas de inferencia, compras ni benchmarks. Los valores proceden de páginas oficiales abiertas y leídas, no solamente del índice del buscador. El registro normalizado está en [model-prices.json](../batches/model-prices.json).

## Decisión que permiten estos datos

**Recomendación:** evaluar Luna y Flash-Lite para extracción de claims; usar Sol y Sonnet como alternativas para síntesis y adjudicación de casos difíciles, y Astra como candidato adicional si demuestra una mejora que compense su costo. Haiku sirve como otro candidato de extracción. Esto define una prueba, no un ganador. Ninguna fuente de precios demuestra qué modelo identifica mejor una edición, distingue sponsor de expositor o conserva una contradicción en nuestro corpus.

## Tarifas comparables

USD por **un millón de tokens**, API directa, texto, modalidad pagada estándar/global. No son precios de suscripciones de ChatGPT, Codex o Claude Code. Excluyen herramientas, impuestos y acuerdos empresariales. Las columnas de salida incluyen razonamiento cuando se genera; no equivalen solamente a caracteres visibles.

| Modelo/API | Input | Lectura de caché | Output | Batch input / output |
|---|---:|---:|---:|---:|
| GPT-6 Luna | 0,10 | 0,01 | 0,50 | 0,05 / 0,25 |
| GPT-6 Sol | 2,00 | 0,20 | 10,00 | 1,00 / 5,00 |
| GPT-6 Astra | 10,00 | 1,00 | 50,00 | 5,00 / 25,00 |
| Claude Haiku 4.5 | 1,00 | 0,10 | 5,00 | 0,50 / 2,50 |
| Claude Sonnet 5 | 2,00 | 0,20 | 10,00 | 1,00 / 5,00 |
| Gemini 3.5 Flash-Lite | 0,30 | 0,03 | 2,50 | 0,15 / 1,25 |
| Gemini 3.8 Flash — promoción vigente | 0,75 | 0,075 | 3,75 | 0,375 / 1,875 |

**Fuentes por filas:** [OpenAI Pricing](https://developers.openai.com/api/docs/pricing), [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing). OpenAI en esta tabla supone hasta 272.000 tokens de entrada. Las familias Gemini indicadas son modelos de texto/multimodales con salida texto; no las variantes Image/TTS.

### Cargos que cambian el presupuesto

- **OpenAI:** escritura de caché por MTok: Luna **0,125**, Sol **2,50**, Astra **12,50**. No se suma al input de esos mismos tokens: cada token usa la tarifa ordinaria, de escritura o de lectura. GPT-6 hereda el esquema de GPT-5.6+: mínimo cacheable de 1.024 tokens visibles y TTL de 30 minutos tras escritura/reuso. No presupuestar hits sin medirlos. [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching).
- **Contexto largo OpenAI:** superar 272K de entrada aplica 2× a input y caché, y 1,5× a output **en toda la solicitud**. Batch y Flex cuestan 50% de Standard; Fast cuesta 2×. El JSON guarda las filas cortas/largas de Standard y Batch. [Sol](https://developers.openai.com/api/docs/models/gpt-6-sol), [Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra).
- **Anthropic:** escritura por MTok a 5 min / 1 h: Haiku **1,25 / 2,00**; Sonnet **2,50 / 4,00**. Los multiplicadores se acumulan con Batch; las tarifas de caché Batch del JSON se calculan mediante esa regla explícita. Los hits de lotes son best effort. [Caché](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Batch](https://platform.claude.com/docs/en/build-with-claude/batch-processing).
- **Gemini:** almacenamiento de caché por MTok/hora: Flash-Lite **1,00**; Flash **0,50** durante promoción. Lectura Batch: Lite **0,02**, Flash **0,0375**. Se conserva 0,02 tal como está publicado, aunque no sea la mitad exacta de 0,03. [Precios](https://ai.google.dev/gemini-api/docs/pricing). Interactions admite caché implícita; para caché explícita la guía remite a generateContent. [Caché](https://ai.google.dev/gemini-api/docs/caching).
- **Razonamiento:** OpenAI y Anthropic facturan los tokens internos como salida aunque no se vean; Gemini declara la inclusión de thinking en su tarifa output. Calcular con los contadores de uso, sin sumar nuevamente un subconjunto ya incluido en output. [OpenAI](https://developers.openai.com/api/docs/guides/reasoning), [Anthropic](https://platform.claude.com/docs/en/build-with-claude/thinking), [Google](https://ai.google.dev/gemini-api/docs/pricing).

## Vigencia y correcciones de documentación vieja

**Sonnet 5 cuesta 2/10 de forma permanente según la enmienda del 10/08/2026.** El aumento a 3/15 anteriormente previsto para septiembre fue cancelado; no trasladar automáticamente las tarifas de Sonnet 4.5/4.6 al modelo 5. [Changelog oficial](https://www.anthropic.com/news/claude-sonnet-5).

**Gemini 3.8 Flash anuncia el doble desde el 01/01/2027:** Standard 1,50 input / 7,50 output / 0,15 lectura; Batch 0,75 / 3,75 / 0,075; almacenamiento 1,00 por MTok/h. El JSON separa esas filas futuras de las tarifas vigentes. No convertir la promoción en costo permanente. [Precios fechados](https://ai.google.dev/gemini-api/docs/pricing).

Anthropic advierte que el tokenizer nuevo produce aproximadamente 30% más tokens para el mismo texto que la generación anterior, con variación por contenido. Por eso tarifas iguales por MTok no prueban costos iguales por documento. No hemos tokenizado este corpus con cada proveedor. [Nota de tokenizer](https://platform.claude.com/docs/en/about-claude/pricing).

## Capacidades verificadas, sin ranking de calidad

| Modelo | Contexto / salida máxima documentados | Control relevante |
|---|---|---|
| Astra | 1.050.000 / 128.000 | Effort low, medium, high, xhigh, max |
| Sol y Luna | 1.050.000 / 128.000 | También effort none; para herramientas con razonamiento usar Responses |
| Sonnet 5 | 1M / 128K estándar | Thinking adaptativo activado por defecto; effort high predeterminado |
| Haiku 4.5 | 200K / 64K | Extended thinking manual con presupuesto |
| Flash 3.8 | Entrada 1.048.576 / salida 65.536 | Thinking low/medium/high; minimal produce error |
| Flash-Lite 3.5 | Entrada 1.048.576 / salida 65.536 | Thinking soportado |

Los siete admiten salida estructurada y herramientas según sus fichas/guías. Fuentes: [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra), [Sol](https://developers.openai.com/api/docs/models/gpt-6-sol), [Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [Sonnet](https://platform.claude.com/docs/en/models/sonnet-5/overview), [Haiku](https://platform.claude.com/docs/en/models/haiku-4-5/overview), [compatibilidad Claude](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash), [Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).

**Límite importante:** Claude no permite Citations nativas junto a JSON estructurado; esa combinación devuelve 400. Para nuestro esquema, la recomendación es devolver identificadores propios de fuente y localizadores y comprobarlos después. Esto no promete la validación nativa de Citations. [Compatibilidad](https://platform.claude.com/docs/en/build-with-claude/structured-outputs). Un JSON válido puede contener valores incorrectos; Google lo explicita y exige validar valores. [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).

## Exa: búsqueda y extracción tienen otra unidad

| Operación | USD | Unidad |
|---|---:|---|
| Search, hasta 10 resultados | 7 | 1.000 solicitudes |
| Cada resultado que excede los 10 | 1 | 1.000 resultados adicionales |
| Contents | 1 | 1.000 páginas **por tipo de contenido** |
| Resúmenes de página generados | 1 | 1.000 páginas, según tabla del endpoint |
| Deep / Deep-lite | 12 | 1.000 solicitudes, hasta 10 resultados |
| Deep-reasoning | 15 | 1.000 solicitudes, hasta 10 resultados |

Search presenta texto y highlights como parte del producto. Contents se usa sobre URLs conocidas: pedir text y highlights de una URL cuenta dos unidades página-tipo. Evitar cobrar en el modelo de costos una extracción adicional que el flujo no realiza. No confundir /search con la tarifa interna de herramienta dentro de Exa Agent. [Página comercial](https://exa.ai/pricing), [documentación de facturación, modificada 23/09/2026](https://exa.ai/docs/admin/pricing).

**Cálculo aritmético, no experimento:** 100 búsquedas de 10 resultados cuestan 0,70 USD; 1.000 URLs consultadas mediante Contents solo con text cuestan 1 USD. No incluyen posterior lectura por LLM, búsquedas profundas ni resúmenes adicionales. Las cuotas, disponibilidad real y condiciones de reutilización de las fuentes siguen siendo independientes del precio del proveedor.

## Cómo presupuestar el experimento

**Recomendación:** costo de modelo = suma de tokens de input en categorías disjuntas × su tarifa + output facturado × su tarifa; después sumar almacenamiento por tiempo, recuperación web, reintentos y otras herramientas. Dividir los tokens por un millón antes de multiplicar. En Gemini, no interpretar el campo cache_write nulo de nuestro registro como escritura gratuita: no se determinó un cargo separado en esta verificación.

**Escenario hipotético:** 1.000 extracciones con 5.000 tokens ordinarios de entrada y 500 de salida facturada cada una, sin caché, producen 5M input y 0,5M output. Standard daría Luna **0,75 USD**, Flash-Lite **2,75**, Flash **5,625**, Haiku **7,50**, Sol/Sonnet **15** y Astra **75**. Es aritmética sobre tokens supuestos, no costo observado por 1.000 documentos. Si los 5M de entrada de Luna se cobran como escritura de caché sin reuso, el total sería **0,875 USD**.

Antes de elegir, medir por modelo y configuración: claims sustentados/correctos, roles y ediciones mal enlazados, contradicciones preservadas, campos desconocidos correctamente vacíos, costo por claim aceptado y latencia p50/p95. Usar referencias humanas; el desacuerdo entre modelos no decide cuál es correcto. Batch puede convenir a backfills, no a una pantalla interactiva: OpenAI documenta procesamiento asíncrono con ventana de 24 horas. [Batch API](https://developers.openai.com/api/docs/guides/batch).

**Decisión práctica:** mantener adaptadores intercambiables; comenzar la evaluación con extractores baratos y un sintetizador intermedio, conservando Astra como comparación. Elegir después de medir este corpus. La investigación acredita disponibilidad documental y tarifas, no superioridad ni calidad comercial.


# Investigación Event GTM — Growth Atlas

Corte de información: **28 de septiembre de 2026**. Investigación documental reproducible, con muestra exploratoria, dos fases: adquisición/validación de datos y arquitectura/economía. No se modificó la aplicación, no se contactó a organizadores, no se publicaron datos ni se realizaron compras o llamadas pagadas a APIs.

Empiece por [resumen ejecutivo](resumen-ejecutivo.md). Para interpretar la base, lea [calidad](quality_report.md), [validación](validation_report.md), [diccionario de datos](data_dictionary.csv) y este README. Cada conclusión externa tiene enlaces en los informes temáticos; cada afirmación de evento enlaza fuente y localizador en `observed/assertions.csv` y SQLite.

## Contenido

- `event-gtm.sqlite`: fuente consolidada de esta investigación, no base operativa de la app.
- `observed/*.csv`: 66 tablas/capas observadas exportadas de SQLite.
- `derived/*.csv`: evaluaciones, clasificaciones y prototipos derivados; no evidencia factual original.
- `private-schemas/*.csv`: esquemas vacíos explícitos, sin datos personales introducidos.
- `batches/*.json`: unidades de adquisición y fuentes; fecha de corte por lote.
- `evidence/*.json`: extractos factuales concisos propios con URL, localizador y hash; no snapshots íntegros de páginas.
- `reports/`: arquitectura, negocio, competencia, fuentes, modelos, costos y verificaciones.
- `inputs/`: prompt maestro congelado, casos de evaluación, registro de freeze.
- `checkpoints/`: métricas, freeze, resultados funcionales y QA.
- `scripts/`: construcción, evaluación, auditoría y preparación de ejemplos.
- `event-gtm-research.zip`: paquete reproducible sin el propio zip.

## Reproducir

Desde la raíz del repo:

```sh
python3 docs/research/event-gtm-2026-09-28/scripts/build_dataset.py
python3 docs/research/event-gtm-2026-09-28/scripts/evaluate_dataset.py
python3 docs/research/event-gtm-2026-09-28/scripts/build_dataset.py
python3 docs/research/event-gtm-2026-09-28/scripts/prepare_examples.py
python3 docs/research/event-gtm-2026-09-28/scripts/audit_dataset.py
```

La primera compilación deriva candidatos y snapshots; evaluación escribe sus resultados; la segunda incorpora esos resultados al CSV/SQLite; `prepare_examples.py` genera el CSV de candidatos de mapa con campos no geocodificados; el auditor verifica esquemas, conteos, JSON, relaciones y hashes. El archivo `data_dictionary.csv` es la correspondencia de las 66 tablas.

## Semántica que no se debe perder

Una empresa listada como sponsor no significa que pagó, cuánto pagó, qué obtuvo ni que repetiría. “Recurrente” en este corpus quiere decir que aparece listada en más de una edición; no que haya renovado contrato. Una métrica declarada por un organizador no es asistencia verificada ni ROI. La ausencia de fuente o de nombre no es evidencia negativa. El año histórico puede estar inferido solo donde se marca. El estado futuro significa anuncio al corte, no ejecución futura garantizada.

La geografía se conserva a la precisión de la fuente. Hay 49 países desconocidos y ningún recinto con latitud/longitud. `map_candidates.csv` se entrega para inspección y eventual resolución autorizada; no puede mostrarse como puntos geográficos sin geocodificación o confirmación.

Fuentes públicas no implican permiso para copiar, almacenar o revender. Los derechos de uso comercial y retención siguen pendientes. La selección no es aleatoria ni representa el universo global o el segmento final de compra.

# Costos y economía unitaria — hipótesis, no costo medido

Corte tarifario: 2026-09-28. Este documento suma las tarifas oficiales y escenarios publicados en [modelos y costos](reports/modelos-y-costos.md) e [infraestructura](reports/infraestructura-mapas-costos.md). No se ejecutaron llamadas pagadas ni se contrató infraestructura.

## Números que sí se pueden calcular

- 1.000 extracciones hipotéticas con 5.000 tokens de entrada y 500 facturados de salida cada una: Luna USD 0,75; Flash-Lite USD 2,75; Flash USD 5,625; Haiku USD 7,50; Sol/Sonnet USD 15; Astra USD 75. No hay tokenización real de estas páginas.
- 100 búsquedas Exa a 10 resultados: USD 0,70 según tarifas documentadas. Mil URLs por Contents solo con texto: USD 1. No se incluye generación posterior ni reintentos.
- Escenario de infraestructura A (Supabase Pro + compute, Railway web/worker, R2) modela USD 45 / 59,14 / 167,61 mensuales para 100 / 1.000 / 10.000 MAU. Con geocoder MapTiler hipotético, USD 75 / 89,14 / 197,61; términos de exportación/retención requieren confirmación.

## Lo que no se sabe

El costo por dossier útil y por decisión es **desconocido**. La factura real también incluye revisión humana, adquisición y renovación de datos, fallos/reintentos, seguridad, backups, ambientes, soporte y gasto comercial. No existe uso real ni volumen observado; MAU no determina por sí solo el costo.

Medir por expediente: tokens input/output/cache; solicitudes de búsqueda y contenido; minutos de lectura y revisión; llamadas de geocoding; almacenamiento/egress; fallos y repetición; campos corregidos; uso por usuario; decisión que el cliente tomó; utilidad y pago confirmados. Separar costos de investigación histórica y refresh actual.

**Decisión de experimento:** medir primero con 10–20 expedientes y tiempo manual registrado. Comparar costo por expediente aceptado y por decisión que el comprador considera mejor informada. No llamar “ROI” a gasto de infraestructura dividido por recomendaciones generadas.

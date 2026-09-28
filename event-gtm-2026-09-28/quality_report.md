# Informe de calidad de datos

Corte: 2026-09-28. Universo del archivo: muestra documental exploratoria, no un censo del mercado.

## Cobertura del conjunto

- 97 ediciones únicas, 42 series, 380 nombres de empresas y 665 relaciones empresa–edición. De estas relaciones, 410 están etiquetadas como `sponsor` en fuentes consultadas; esto no prueba contrato pagado ni renovación.
- 259 URLs de fuente y 5.961 afirmaciones normalizadas con fuente/localizador; 252 extractos factuales retenidos con hash. Los snapshots son resúmenes de investigación, no capturas originales ni prueba de derechos de redistribución.
- 37 métricas de audiencia y 39 métricas de evento, con denominadores y definiciones heterogéneos. No se combinan para comparar “éxito” sin normalización.
- 30 costos de evento y 12 paquetes de patrocinio; no hay datos suficientes para comparar costo por asistente validado.
- 20 ediciones futuras con anuncio verificado por fuente primaria al corte. Ver [revisión individual](reports/verificacion-futuros-2026-09-28.md). Anuncio vigente no significa disponibilidad ni eficacia.

## Completitud de campos críticos

| Campo | Presente | Falta |
|---|---:|---:|
| URL | 97/97 | 0 |
| Fecha de inicio y precisión | 97/97 | 0 |
| Fecha final | 57/97 | 40 |
| Ciudad | 79/97 | 18 |
| País observado | 48/97 | 49 |
| Recinto enlazado | 60/97 | 37 |
| Zona horaria | 0/97 | 97 |
| Coordenadas | 0/49 recintos | 49 |

No se rellenó geografía ausente por intuición ni se geocodificó el conjunto. Dos años de ediciones históricas de Circular Library son inferencias por contexto y están identificados como tales; no deben usarse como fechas observadas.

## Integridad y límites

Los 66 CSV lógicos coinciden en esquema y conteo con SQLite; integridad SQLite `ok`, claves foráneas sin errores, referencias polimórficas comprobadas, hashes de extractos verificados. Ver [QA automatizado](checkpoints/qa-results.json).

Sesgos conocidos: muestra no aleatoria en sectores y regiones; una serie PyCon concentra buena parte de los roles históricos; fuentes promocionales dominan sobre resultados independientes; nombres de sponsors son evidencia de listado, no de dinero desembolsado; no hay listas de asistentes ni telemetría privada; fechas pasadas no fueron recapturadas históricamente “as of”. Varias fuentes oficiales dieron HTML parcial, indexado o sin parser. Esas filas conservan su estado de acceso.

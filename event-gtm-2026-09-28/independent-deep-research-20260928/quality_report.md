# Calidad, evidencia y límites

Este corpus es exploratorio; no es un censo ni una base comercial licenciada. La observación corresponde al 28 de septiembre de 2026. La ventana histórica es `[2021-09-28, 2026-09-28)` y el inventario futuro alcanza el 30 de noviembre de 2027. Las pruebas estructurales no certifican la verdad de las fuentes.

## Qué cuentan las filas

| Elemento | Conteo | Interpretación |
|---|---:|---|
|Ediciones|688|650 con inicio anterior al corte; 38 actuales o futuras|
|Series|101|97 inferidas por título base y país, y 4 vinculadas explícitamente|
|Organizaciones/marcas|288|No son entidades jurídicas verificadas|
|Roles sponsor explícitos|320|Pago, contrato e interés actual desconocidos|
|Roles sponsor/partner ambiguos|21|Se conservó la ambigüedad de la publicación|
|Artículos originales|10|10 agrupamientos por URL; no representan 10 corroboraciones independientes|
|Afirmaciones por campo|21.570|Incluyen valores publicados y derivados; no son 21.570 hechos verificados de manera independiente|
|Fuentes registradas|160|Incluyen documentación comercial, lecturas, búsquedas indexadas y fallos; no son 160 eventos extraídos|

Ocho núcleos se conservan como provisionales o secundarios: seis ediciones de Flip, Stanford Powwow y EASA. La publicación `STATUS:CONFIRMED` de iCal señala el estado del calendario; por sí sola no prueba que el evento ocurriera. Tampoco las 652 filas de dos feeds implican lectura individual de 652 organizadores.

## Completitud dentro de la muestra

| Campo/enriquecimiento | Ediciones | Parte del corpus |
|---|---:|---:|
|Título y fecha inicial|688|100%|
|Fecha final|687|99,85%|
|Lugar en texto|672|97,67%|
|País identificable en la ubicación|561|81,54%|
|Zona horaria|197|28,63%|
|Recinto con dirección normalizada|3|0,44%|
|Coordenadas verificadas|0|0%|
|Evidencia de rol sponsor|16|2,33%|
|Audiencia en tabla dedicada|5|0,73%|
|Métricas reportadas en tabla dedicada|14|2,03%|
|Tickets/precios normalizados|5|0,73%|
|Paquetes de patrocinio|2|0,29%|

Algunas cifras y precios del lote cultural siguen en `assertions` y aún no se proyectan a tablas específicas; las tasas anteriores miden normalización. `coverage.csv` desglosa año, territorio, sector, formato y fuente. No existe un denominador global: 72 territorios identificados no demuestran buena cobertura en cada uno y 127 ediciones siguen sin país. Estados Unidos (55), Países Bajos (54) y Alemania (54) muestran el sesgo de los feeds técnicos. 2021 y 2026 son años parciales; 2027 contiene sólo ediciones futuras anunciadas.

Los porcentajes siempre usan las 688 filas recopiladas como denominador. No describen la proporción de eventos existentes en el mercado.

## Auditoría dirigida y discrepancias

Se revisaron 12 ediciones técnicas: PyCon US 2024/25, PyCon ES 2022/23/24, PyCon AU 2024/25, AI Engine 2025, PyBay 2026, PyCon Africa 2026, PyCon NL 2026 y PyCon Ireland 2026. La revisión contrastó fechas, precios, unidades, roles y estados con documentos del organizador; no comprobó cada campo de cada edición. No fue una muestra aleatoria, así que no se extrapola una tasa global de error.

- **PyCon ES 2024:** el final exclusivo de iCal habría convertido `DTEND` en el 5 de octubre. El organizador publica el 4, 5 y 6. Se corrigió la fecha final al 6 de octubre y se conservaron el valor original, las afirmaciones y el conflicto resuelto.
- **PyCon Ireland 2026:** la página HTML de Python.org aún mostraba el 17 de octubre; el feed y el anuncio fechado confirman el 21 de noviembre y recinto pendiente. Se guarda el cambio de estado; no se inventó una reserva.
- **PyBay 2026:** la fecha límite del 19/26 de septiembre discrepa entre tienda y sitio. Ambas ya habían pasado al observarla; los tickets visibles no prueban disponibilidad.
- **PyCon ES 2023:** el prospecto dice EUR 6.000 para Teide y el sitio indica “+6.000” y vendido. No se sabe si cambia el alcance o la versión; no se usa como precio actual.
- **PyCon US:** el total 2024 incluye 440 participantes en línea; la cifra 2025 es 2.225 personas en el recinto. No se interpreta como caída porque las definiciones no coinciden.
- **ISE 2024:** el PDF oficial separa 95.396 registros, 73.891 asistentes y visitas acumuladas. Se guardan con unidades distintas.
- **Rol añadido durante la auditoría:** Emirates figura como sponsor explícito en Roland-Garros 2024. Al corregirlo, el total llegó a 320 roles y 193 organizaciones con al menos un rol sponsor.
- **Marca CCR/Motiva:** se enlazó el alias literal `CCR` y `Grupo CCR` con Motiva como transición de marca, sin fusionar entidades ni trasladar acuerdos.

El lote cultural revisó 24 ediciones y 217 observaciones: 174 con cuerpo primario y 43 provisionales. Roland-Garros 2024 conserva 670.000 y 675.080, cifras publicadas por distintas fuentes; no se afirma que la segunda corrija formalmente la primera. Véase [la auditoría no técnica](notes/phase1-nontech.md).

## QA y semántica

`qa-results.json` registra **13 comprobaciones aprobadas**: coincidencia del contrato de 66 tablas; claves; referencias simples y polimórficas; fechas; integridad SQLite; paridad CSV/SQLite; JSON válido; ausencia de brief/feedback de clientes falsos y de ID Luma real; evidencia para título/fecha/lugar; duplicados exactos; coordenadas inventadas; monedas/importes; etiquetas humanas fabricadas. Esto comprueba estructura y coherencia, no precisión comercial. El archivo `data_dictionary.csv` define unidades, orígenes, tipo lógico y significado de NULL.

NULL significa desconocido o no obtenido, nunca cero o “no”. Fecha del evento, publicación, captura, consulta y vigencia son conceptos separados. No hay capturas de Internet Archive recuperadas. Una noticia del organizador no es corroboración independiente. La publicidad de una fuente no concede automáticamente derechos de conservación o reventa; el paquete guarda enlaces, localizadores, hashes y hechos/paráfrasis, sin cuerpos enteros, imágenes ni listas de invitados.

Los IDs iCal se derivan del UID del evento. No se ejecutan fusiones aproximadas; los alias revisados conservan nombres originales. Una serie agrupa ediciones, no repeticiones idénticas. Los 127 pares de presencia repetida no demuestran renovación de contrato.

La adquisición HTTP principal guarda 18 intentos, respuesta, latencia, bytes, hash y fecha. La búsqueda web manual no tiene telemetría de cada petición. Para el lote cultural se registran 57 URLs usadas (46 abiertas, 11 indexadas) y 8 fallos documentados; esas cifras describen fuentes, no el número total de clics ni intentos de red.

La ejecución se cierra tras procesar los dos feeds, integrar los lotes curados y evaluar fuentes. Diez reglas recurrentes no se expandieron para evitar inventar ediciones. La [cola de continuación](data/observed/extraction_queue.csv) define las fuentes, estados y condiciones pendientes. No se afirma haber agotado organizadores, territorios o el universo de los cinco años.

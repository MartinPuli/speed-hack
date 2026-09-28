# Auditoría de integración de Fase 1

Revisión de las 24 ediciones no técnicas integradas, realizada el 28 de septiembre de 2026.

- Se cotejaron los 168 hechos, 21 relaciones, 28 métricas y 24 fechas/estados contra `notes/nontech-facts.json`. Valores, unidades, métodos y estados se conservan.
- Se conservó provisionalidad a nivel de cada assertion/rol/métrica; el acceso abierto a otra sección de la URL no eleva un pasaje indexado.
- Las filas de evento conservan modalidad normalizada; los rótulos originales de “formato” se guardan como observación de origen independiente.
- Emirates de Roland-Garros 2024 está clasificado como sponsor con el rótulo original. El total integrado es 320 roles sponsor explícitos y 193 organizaciones con al menos uno.
- Los nombres `CCR` y `Grupo CCR` se relacionan con Motiva como transición de marca, pero quedan como entidades separadas y los acuerdos no se transfieren.
- La fuente del lote registra 46 cuerpos leídos, 11 páginas indexadas y 8 fallos documentados. La importación no trata 11 páginas indexadas como 11 peticiones de red fallidas.
- Se verificaron las claves foráneas lógicas, paridad de cada celda CSV/SQLite y disponibilidad de las rutas relativas en la entrega. El SQL físico de diseño no se ejecutó contra PostgreSQL.

El QA estructural general tiene 13/13 comprobaciones aprobadas en `qa-results.json`. No se vuelve a muestrear la web; limitaciones y estados de acceso permanecen en `notes/phase1-nontech.md` y `notes/nontech-retrieval.json`.

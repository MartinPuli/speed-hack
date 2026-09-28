# Verificación del primer traslado de GrowthX

Fecha: 28 de septiembre de 2026. Aplicación en `web/`, investigación original conservada.

## Resultado

- `pnpm test`: 17 pruebas aprobadas, sin fallos ni omisiones.
- `pnpm typecheck`: aprobado.
- `pnpm lint`: aprobado.
- `pnpm build`: compilación de producción aprobada.
- `pnpm test:browser`: aprobado contra servidor de desarrollo y servidor de producción en Google Chrome.
- `git diff --check`: sin errores de espacios.

El recorrido de navegador verifica carga paginada sin peticiones de todos los expedientes, apertura de evidencia con fuentes, comparación de dos eventos, filtros desde brief, recuperación del brief después de recargar, exportación de una selección con fuentes, búsqueda vacía, pantalla móvil sin desbordamiento y lista utilizable cuando falla el mapa. En producción se comprobó además que seleccionar un punto del mapa deja accesible su popup y que se puede abrir/cerrar el expediente sin perder la selección.

Las capturas locales de la ejecución se encuentran en `web/test-results/`: `catalog-desktop.png`, `catalog-mobile.png`, `event-dossier.png` y `map-fallback.png`. Los resultados de pruebas no se incluyen en Git.

## Integridad de la base original

Archivo: `event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite`.

- Tamaño antes/después: 338.649.088 bytes.
- Fecha de modificación en nanosegundos antes/después: `1790616800102100691`.
- SHA-256 antes/después: `8e197337639981996c70f9225f0c4e9e7cbca6c358d2bc8ac31e603502b850cc`.

Las tres medidas permanecieron idénticas. La conexión aplica `readOnly: true` y `PRAGMA query_only = ON`.

La respuesta local de health confirmó 21.747 ediciones canónicas, 453 relaciones sponsor y 276 empresas con ese rol. La política temporal conservadora contó 258 inicios inequívocamente futuros al instante de esta prueba; no equivale al conteo de 260 fechas posteriores al día 28, porque las fechas sin zona cercana al corte conservan su incertidumbre. Tampoco verifica disponibilidad comercial.

## Correcciones de integración

- Se separó la selección del mapa de la apertura del expediente para mantener accesibles los eventos que comparten un punto.
- Cancelaciones y reprogramaciones son visibles en lista y comparación.
- No se reutilizó la restricción geográfica SF ni la descarga masiva de dossiers del dashboard anterior.
- La exportación es un brief de investigación local. No publica ni crea un evento Luma.

El alcance y los módulos pendientes quedan en [growthx-reuse.md](growthx-reuse.md).

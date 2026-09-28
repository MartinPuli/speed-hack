# Event GTM

Una base de investigación de eventos con una aplicación para consultar ediciones, comparar alternativas y revisar su evidencia.

La aplicación de `web/` reutiliza selectivamente módulos de [GrowthX / Growth Atlas](https://github.com/Julian0444/GrowthX-for-hackaton). Lee el catálogo existente de investigación en modo de solo lectura. Los archivos originales de `event-gtm-2026-09-28/` conservan su estructura.

## Arrancar la aplicación

Requisitos: Node.js 22.13 o posterior y pnpm 11.8.0. La lectura SQLite utiliza `node:sqlite`, que puede emitir un aviso experimental en Node 22.

```sh
cd web
pnpm install --frozen-lockfile
pnpm dev
```

Abrir <http://localhost:3010>. Este puerto evita interferir con otras aplicaciones locales del usuario.

Si el clon solo contiene la copia comprimida del catálogo, restaurarla primero desde la raíz, sin sustituir una SQLite ya existente:

```sh
gunzip -k event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite.gz
```

La ruta predeterminada es `event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite`. Se puede cambiar con `EVENT_GTM_DATASET_PATH` en `web/.env.local`; consultar `web/.env.example`.

## Qué incluye este traslado

- Búsqueda textual, filtros de fecha, país y segmento, y resultados paginados.
- Expedientes con afirmaciones, fuentes, relaciones empresariales y costos documentados.
- Mapa de las ubicaciones disponibles en la página de resultados, conservando su precisión.
- Brief editable, comparación de hasta tres ediciones y exportación local del brief con la selección.
- Utilidades de fechas, enlaces y validación geográfica extraídas o adaptadas de GrowthX.

La consulta devuelve registros del catálogo, no un ranking comercial validado. El historial de patrocinio no acredita interés en un evento nuevo. Un centro de ciudad no identifica la sede de un evento. La app mantiene visibles datos faltantes y estados de las fuentes.

Este primer traslado no analiza websites automáticamente, no ejecuta un agente ni publica en Luma. El matching de sponsors, generación de conceptos, persistencia compartida y conectores de ejecución son ampliaciones posteriores. El brief guardado en el navegador no sustituye una base operacional multiusuario.

## Verificar y compilar

```sh
cd web
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Las pruebas de integración usan el catálogo local en modo lectura. No regeneran ni modifican el dataset. El build prepara los archivos del worker de MapLibre desde la versión instalada.

Con el servidor activo y Google Chrome instalado, `pnpm test:browser` comprueba búsqueda, expediente, comparación, brief, exportación y móvil. Guarda capturas locales en `web/test-results/`.

La app necesita un proceso Node con acceso al archivo SQLite. Este repositorio no configura despliegue ni almacenamiento operacional persistente en nube. Los tiles del mapa se obtienen de OpenFreeMap; la lista y los expedientes siguen siendo útiles cuando el mapa no está disponible.

## Datos y procedencia

- [Investigación original](event-gtm-2026-09-28/README.md).
- [Definición del producto para el hackathon](docs/product-definition.md), basada en [el brief](HACKATHON_BUILD_BRIEF.md).
- [Prompt original de idea y alcance](event-gtm-2026-09-28/inputs/prompt-maestro.md).
- [Traslado y adaptaciones de GrowthX](docs/growthx-reuse.md).

El catálogo canónico es la vista `canonical_event_editions` de la SQLite de expansión. Las exportaciones históricas CSV/GeoJSON pueden pertenecer a otra versión y no son la fuente de la app. La base pequeña y la investigación independiente no se concatenan automáticamente a la expansión.

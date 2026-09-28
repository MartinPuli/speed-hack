# Extracción selectiva de GrowthX

Implementación autorizada el 28 de septiembre de 2026, después de revisar el plan de reutilización. Origen: `Julian0444/GrowthX-for-hackaton`, revisión local `cf03259`, carpeta `frontend/`. Destino: `web/` de este repositorio.

Se preserva el proyecto de origen. No se trasladan credenciales, bases de GrowthX, datos demo, PostgreSQL, pg-boss ni el dashboard monolítico. La investigación existente de speed-hack se consulta sin escritura.

| Fuente de GrowthX | Destino / adaptación |
|---|---|
| `lib/temporal/event-validity.ts`, `declared-date.ts`, `display-date.ts` | `web/lib/temporal/`: reglas de fechas y tipos mínimos independientes del workflow SF |
| `lib/evidence/calendar.ts`, `source-link.ts` | `web/lib/evidence/`: fecha declarada y enlaces de evidencia adaptados al nuevo contrato |
| `lib/server/scoring/score-utils.ts` | `web/lib/recommendations/score-utils.ts`: funciones puras disponibles para la siguiente fase; no implican ranking activo |
| `components/research-dashboard/sf-event-map.tsx` | `web/components/events/event-map.tsx`: mecanismo MapLibre sin filtro SF, bounds de resultados y precisión explícita |
| `scripts/copy-maplibre-worker.mjs` | Mismo archivo en `web/scripts/`, utilizado por dev/build |
| `onboarding-intake`, `research-brief`, `research-events`, `research-dossier`, `evidence-links` | Módulos de `web/components/`, extraídos y adaptados a un contrato nuevo, consultas paginadas y detalle bajo demanda |
| `lib/research/decision-brief.ts` | `web/lib/drafts/export.ts`: función de clipboard y patrón de composición con fuentes; exportación local de investigación |
| Estilos de research/tokens existentes | `web/app/globals.css` y CSS del mapa, reducidos a las vistas utilizadas |

Los comentarios de los módulos identifican el origen. La extracción de interfaz adapta estructura y comportamiento; no es una copia binaria de todos los componentes.

## Código nuevo necesario

`web/lib/contracts/event-gtm.ts` define el contrato pequeño entre SQLite e interfaz. `web/lib/server/` realiza consultas parametrizadas, usa la vista canónica y resuelve evidencia por ID. Las rutas bajo `web/app/api/` entregan summaries y detalles. La búsqueda aprovecha FTS5 existente; la aplicación no carga todos los expedientes en el navegador.

Los estados de SQLite no se convierten automáticamente a estados de confirmación de GrowthX. `evidence_paraphrase` continúa siendo una paráfrasis. `primary` significa tipo de fuente, no validación humana. Patrocinio y organización permanecen como roles distintos y vinculados a una edición.

`claim-support.ts`, `costs.ts`, el motor completo de elegibilidad y las revisiones PostgreSQL no se copian a ciegas: necesitan contratos de confirmación y composición de costos que esta primera interfaz no implementa. La interfaz muestra los costos documentados como tales y conserva los desconocidos.

## Alcance que queda para la siguiente etapa

Este bloque deja operativa la exploración real del catálogo, brief, comparación, mapa, evidencia y exportación. Todavía no incluye extracción empresarial desde website, matching dinámico de sponsors, generación de conceptos/Luma, agente ejecutor, publicación externa ni persistencia operacional compartida. Estas capacidades requieren implementación y validación propias; no venían terminadas en GrowthX.

La base de 97 eventos podrá aportar enriquecimiento después de resolver identidades, fuentes y discrepancias. La expansión ya hereda la investigación independiente; importarla nuevamente duplicaría información.

# Entrega del backend de agentes

Cierre del 28 de septiembre de 2026. Incluye API, persistencia operacional y worker con cuatro roles. El equipo se encarga de conectar el frontend. Este cierre conserva el diseño existente de `main`.

## Arranque

Desde `web/`, ejecutar la app y el worker en terminales distintas:

```sh
pnpm dev
```

```sh
pnpm worker
```

La API queda en `http://localhost:3010`. Configurar Anthropic en `web/.env.local` según `.env.example`; las credenciales permanecen en servidor. El worker y la app comparten `web/.data/workspace.sqlite`; el catálogo original se abre en modo de solo lectura. Al cerrar esta entrega no se dejó un worker procesando llamadas al proveedor.

## Contrato para la integración

Todas las rutas del workspace requieren la cookie obtenida con `POST /api/demo/session`.

| Ruta | Uso |
|---|---|
| `POST /api/demo/session` | Crea la sesión de demo y devuelve la cookie HTTP-only |
| `POST /api/briefs` | Guarda `{ brief, expectedVersion? }`; el brief usa los campos de `ResearchBrief` |
| `POST /api/runs` | Crea trabajo durable con `{ objective?, opportunityId?, idempotencyKey? }`; responde 202 |
| `GET /api/runs/:id` | Estado del run, tareas, eventos y errores |
| `GET /api/workspace` | Brief, oportunidades y borradores persistidos |
| `PATCH /api/drafts/:id` | Guarda una revisión humana con control de versión |
| `POST /api/inbound/reply` | Guarda una respuesta simulada de forma idempotente y crea trabajo posterior |

Lead selecciona el siguiente rol; Scout consulta hasta tres candidatos y conserva evidencia; Partnerships prepara outreach privado e interpreta respuestas; Producer propone revisiones de borrador. Cada run permite un solo pase de Scout. Las herramientas, tareas derivadas y reintentos tienen límites. Los resultados se aplican de forma atómica al finalizar la tarea y respetan las versiones del brief y del borrador.

Ejemplo de cuerpo para la respuesta simulada con presupuesto de USD 2.000:

```json
{
  "opportunityId": "ID de la oportunidad seleccionada",
  "messageId": "demo-organizer-reply-v1",
  "message": "Sponsorship is USD 5,000. A workshop is available, but its price has not been confirmed.",
  "simulated": true
}
```

Repetir el mismo `messageId` no crea otra tarea. El patrocinio excede el presupuesto; el precio del workshop continúa pendiente. No se envía ningún mensaje ni se publica un evento en Luma.

## Validación y pendientes

- **44/44 tests pasan**, incluidos catálogo, persistencia y runtime. También pasan TypeScript y el build aislado.
- Lead, Scout y Partnerships completaron tareas reales con Anthropic. La respuesta simulada generó correctamente trabajo de Partnerships → Lead → Producer.
- **Producer real queda pendiente**: dos intentos agotaron el tiempo de espera; el siguiente recibió una salida con `stop_reason: max_tokens` sin finalizar con `completeTask`. No se persistió el borrador de esa ejecución. El timeout por llamada quedó en 120 segundos; el límite de salida aún requiere ajuste y validación.
- El lint global conserva 2 errores de enlaces a `/` en `map-first-workspace.tsx` y `onboarding.tsx`, más 4 avisos de imágenes. Esos archivos no se modificaron en este cierre.
- El smoke de navegador pasó con la interfaz anterior, pero no se reejecutó sobre la interfaz actual de Taste. La integración visual queda a cargo del equipo.
- Autenticación multiusuario y despliegue de producción quedan fuera de este corte.

Si una tarea queda en cola, comprobar que `pnpm worker` esté abierto. Un run fallido conserva su error; no se presenta como completado porque una tarea hermana termine después.

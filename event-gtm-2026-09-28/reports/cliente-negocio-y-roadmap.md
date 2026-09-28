# Cliente, propuesta y validación de negocio

**Recomendación de foco:** probar primero con un equipo de growth/field marketing que tenga una decisión de patrocinio próxima, presupuesto real y permiso para compartir propuesta y resultado. La compra a validar es un expediente que reduzca incertidumbre antes de gastar. No prometer una base mundial mejor que la de los competidores ni ROI calculable desde logos.

Es una recomendación del investigador, no una decisión comercial ya tomada. La geografía se elige con ese comprador. El repositorio ya contiene un flujo de evaluación SF; ello reduce trabajo para un piloto en SF, pero no demuestra que sea el mejor mercado internacional. Tampoco obliga a que la métrica sea adopción: recruiting, reuniones u otro resultado solo entran si la compra real los exige.

## Tres segmentos iniciales

| Segmento | Dolor y proceso a comprobar | Acceso a evidencia / competencia | Venta y demostración |
|---|---|---|---|
| Growth / field marketing con próxima inversión | Lista de eventos, propuestas de organizadores, pestañas y hojas de cálculo; necesita comparar antes de aprobar gasto. Horas, frecuencia y gasto: **no medidos aquí**. | Puede aportar presupuestos y resultados propios; información pública sola es incompleta. Compite con Vendelux, Pana y trabajo manual. | Comprador de growth/field marketing; aprobador de presupuesto por identificar. Medir decisión sustentada y tiempo, no ventas atribuibles al software de inmediato. **Primera opción condicionada a conseguir partner.** |
| Organizador con historial y paquetes propios | Busca empresas compatibles y redacta propuestas comerciales. Debe confirmar que el problema es investigación y no distribución/ventas. | Mejor acceso a inventario y datos reales; datos privados necesitan autorización. Compite con herramientas de sponsorship e inteligencia como SponsorUnited/Kuration. | Puede cerrar el circuito de ofertas y acuerdos más directamente. Alternativa si no se consigue acceso por el lado comprador. No presupone que pagará. |
| Agencia que gestiona eventos para varios clientes | Repite investigación y prepara briefs para terceros. | Acceso a varios casos, pero exigencia de permisos, exportación y separación por cliente. | Comprador potencial con frecuencia alta; frecuencia real y precio por validar. Riesgo de servicio a medida que no se vuelve producto. |

Los nombres y capacidades declaradas de esos productos se contrastan en [la matriz competitiva](competencia-y-segmentos.md) y `observed/competitors.csv`. No se probaron sus productos autenticados. Pana anuncia un directorio de 250.000+ eventos como **Coming soon**; no lo tratamos como inventario disponible probado. Luma MCP ya cubre parte de descubrimiento conversacional, por lo que “buscar eventos con IA” no basta como diferenciación. [Pana](https://www.withpana.com/), [Luma MCP](https://help.luma.com/p/mcp).

## Por qué cambiarían, y qué falta para afirmarlo

El expediente debe resolver preguntas concretas: quién organiza esa edición, qué hizo antes, qué se sabe de audiencia, qué empresas participaron y con qué rol, qué incluye el precio y qué debe confirmar el organizador. La decisión queda reabrible con las fuentes exactas que la sustentaron. Ese es el beneficio a medir frente a búsqueda manual y directorios.

No tenemos observaciones de horas ahorradas, uso repetido, precio aceptado ni cierre de venta. La entrevista histórica de Terac del repo es dolor reportado en una entrevista; no demuestra demanda internacional, eficacia del matching ni disposición a pagar. No se contactó a nadie durante este estudio.

La ventaja defendible potencial sería una colección autorizada de **propuestas prometidas → decisiones → gasto → ejecución → resultado**, con definiciones comparables y correcciones. Obtenerla requiere acuerdos y trabajo de revisión. La adquisición pública ayuda a arrancar; no produce automáticamente ese activo. Una tasa de repetición de sponsors es un antecedente, no un sustituto de resultados.

## Precio y acceso gratuito: hipótesis explícitas

Como prueba comercial, proponer un expediente asistido por decisión y contrastar dos precios, por ejemplo **USD 100 y USD 300**. Son hipótesis de entrevista/piloto, no precios de mercado observados ni decisión de tarifario. Medir conversión real a pago y costo humano. Un abono solo se justifica después de observar frecuencia; no extrapolar un informe puntual a retención mensual.

Cuatro gratuidades distintas:

1. **Producto gratuito:** puede ofrecer lectura de un dossier o una investigación limitada; alguien financia cómputo, datos y revisión.
2. **Evento con entrada gratuita:** no implica que viaje, activación o sponsorship cuesten cero.
3. **Fuente legible sin pagar:** no concede licencia para redistribuirla o explotarla comercialmente.
4. **Luma gratuito:** admite usos distintos a REST Plus; su MCP no requiere Plus según ayuda oficial. No elimina costos del backend propio. [Acceso y precios verificados](acceso-fuentes-y-luma.md).

Para un experimento gratuito: una investigación por organización, corpus pequeño compartido, límites de actualización y explicación transparente de vacíos. Comparar con prueba limitada temporal y con servicio pago asistido. No financiarlo suponiendo scraping o geocodificación ilimitados gratis. El costo se detalla en [economía unitaria](costos-y-economia-unitaria.md).

No se estima TAM desde gasto mundial de eventos. Una cuenta desde abajo necesita clientes alcanzables reales × uso observado × precio aceptado. Ejemplo puramente aritmético: 20 clientes × 2 expedientes mensuales × USD 100 = USD 4.000/mes antes de costos. Ninguna de esas tres cantidades está demostrada.

## 30, 60 y 90 días: entregables y puertas de decisión

Los días son horizonte propuesto, no cronograma aprobado ni tickets de implementación. Los umbrales siguientes son criterios sugeridos, no estándares probados.

| Periodo | Responsable por función y entregable | Dependencia | Continuar / cambiar / detener |
|---|---|---|---|
| 0–30 | Producto/ventas: 8–10 entrevistas autorizadas y 3 decisiones reales próximas. Research: expedientes manuales con propuestas aportadas por el cliente. Ingeniería: medir el flujo existente, sin reescribirlo. | Comprador, geografía y permisos; rúbrica de relevancia acordada antes de ver resultados. | Continuar si al menos 2 equipos usan el expediente para una decisión y uno paga o compromete un piloto concreto. Si solo quieren listas gratuitas, revisar la compra. |
| 31–60 | Research/datos: catálogo acotado con historial pertinente. Ingeniería: actualización incremental y trazas, corrección de identidad por edición y campos críticos. Producto: comparación ciega de baseline y expediente con compradores. | Acceso legalmente utilizable y etiquetas reales del primer periodo. | Buscar una mejora práctica preacordada, p. ej. ≥30% menos tiempo sin más errores críticos, en al menos 10 casos. No generalizar estadísticamente desde esa muestra. Cambiar fuente/segmento si el costo humano impide un margen viable. |
| 61–90 | Ingeniería/operación: servicio fiable con límites; producto: uso repetido y primeros resultados autorizados. Comercial: precio y frecuencia reales. Integración Luma solo si exportar contenido manual resulta insuficiente. | Evidencia de demanda y costos medidos; aprobación de cualquier efecto externo. | Escalar si hay repetición pagada, calidad estable y costo por resultado útil compatible con el precio. Detener expansión global si no hay acceso a datos decisivos o los compradores no actúan con el expediente. |

El MVP manual asistido usa el dashboard y documento persistido, revisión humana de fuentes y copia manual a Luma. Se registran minutos por actividad y correcciones. **No requiere cinco años exhaustivos** para comprobar si alguien paga por una decisión mejor. El objetivo de histórico de cinco años se mantiene como adquisición incremental del segmento elegido, con utilidad marginal evaluada; no se abandona ni se convierte en prerrequisito de un catálogo mundial.

Postergar marketplace bilateral, outreach automático, acceso a listas privadas, predicción de ROI, social graph, múltiples agentes autónomos y cobertura universal. El sponsor matching empieza como investigación con motivos y preguntas, no como promesa de obtener sponsors.

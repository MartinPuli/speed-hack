# Validación del valor histórico y del dataset

**Veredicto: evidencia mixta; la ventaja extraordinaria aún no está demostrada.** La ejecución demuestra que combinar fuentes recupera hechos y cambia algunas decisiones de identidad. No mide demanda, superioridad comercial, causalidad ni retorno. Los resultados reproducibles están en `benchmark-results.json`; casos, ejecuciones y candidatos están en CSV/SQLite.

## Diseño de la comparación

Se definieron tres perfiles sintéticos, no clientes: herramienta de desarrollo Python con alcance internacional; organizador de arte británico; proveedor de formación Python estadounidense. El corte fue el 28 de septiembre de 2026 y el horizonte el 31 de marzo de 2027. Los presupuestos de USD 1.000, GBP 500 y USD 500 son valores de prueba, no señales de demanda. Los pesos no se ajustaron después de ver los resultados.

Cada método comparte el mismo universo elegible: 31, 2 y 2 eventos, respectivamente. Cuando falta disponibilidad o coste total, el candidato queda **condicional**. Si se exige un tope de gasto duro, ninguno puede mostrarse como asequible sin ese dato.

- **B0:** coincidencia de palabras, país y fecha.
- **B1:** coseno TF-IDF con perfil y texto de título/formato/sector/lugar. Es similitud léxica local; no se probaron embeddings.
- **B2:** 0,8 × perfil + 0,15 × ediciones previas observadas, topadas en cinco + 0,05 × presencia de enriquecimiento. Pesos arbitrarios para probar funcionalidad; no calibran afinidad. No se simularon audiencia, sponsors ni noticias donde no existen.

## Resultados frente a las hipótesis

| Hipótesis | Comparación y resultado | Decisión |
|---|---|---|
|Cobertura multifuente|Dos feeds Python: 349+303=652 ediciones, sin coincidencias exactas de título/fecha/lugar. En AI Engine 2025, la página Luma lista 19 sponsors/partners y el boletín añade Granola y Encord, para 21 organizaciones.|Aporte incremental observable; no es recall territorial ni demuestra que los dos roles adicionales sean sponsors confirmados. [Luma](https://luma.com/edovbkm4), [boletín](https://aienginehack.beehiiv.com/p/join-us-at-ai-engine-summer-hack).|
|Relevancia del ranking|En el caso internacional cambian los cinco primeros puestos entre B0/B1/B2. En Estados Unidos, B0/B1 puntúan cero a PyBay/PyBeach porque su texto no contiene bien los términos del perfil.|La historia favorece series repetidas como Python Meeting Düsseldorf; puede sobrevalorar frecuencia. Cero violaciones deterministas de fecha/país no significa que un usuario encuentre relevantes los resultados. Calidad humana no medida.|
|Matching de sponsors|320 roles explícitos, 193 organizaciones sponsor, 127 pares de presencia en ediciones repetidas.|No hay etiquetas negativas fiables, interés actual, presupuesto ni comparación ciega. La falta de sponsor en una página no es un negativo. Precisión y recall comercial no medidos.|
|Valor del borrador|Concepto local separa hechos, propuesta, presupuesto hipotético y decisiones pendientes.|Tiempo ahorrado, correcciones y preferencia de un organizador no medidos. No se calificó el texto generado como prueba de su propia calidad.|
|Economía y mantenimiento|Revisión de precios y 18 intentos HTTP instrumentados en adquisición principal.|Tiempo HTTP no equivale a horas totales. Cero compras; coste de herramientas de investigación no observable. Coste por resultado útil no medido.|
|Noticias|El cambio EdgeDB/Gel y cierre de Gel Data Inc. alteran la normalización y la elegibilidad de empresa.|No transferir automáticamente historia a Vercel ni asumir presupuesto. El hecho cambia una hipótesis de búsqueda, sin demostrar más conversiones. [Anuncio](https://www.geldata.com/blog/gel-joins-vercel).|

En los 12 meses recientes hay 118 ediciones recopiladas y 1 rol sponsor; en los 60 meses, 650 ediciones pasadas y 319 roles. La diferencia refleja el enriquecimiento intencional de PyCon US 2022–25; **no prueba que cinco años predigan mejor**. Borrar el pasado eliminaría evidencias ya recopiladas, pero los eventos antiguos necesitan señales actuales antes de recomendarse.

## Métricas que siguen pendientes

Precision@5, nDCG, relevancia juzgada, aceptación, shortlist útil, conversaciones, acuerdos, ingresos, tiempo ahorrado y coste por resultado útil no se midieron. No se reclutaron evaluadores, pilotos ni clientes y no hubo contactos. Las métricas faltantes se dejan NULL/no medidas, nunca como cero de calidad.

No se recuperó ninguna captura de Wayback. Leer hoy una página de una edición pasada no demuestra que el sistema conociera entonces todos sus datos. Por eso esta es una evaluación funcional retrospectiva, no un backtest temporal válido. Hace falta obtener capturas fechadas y reservar observaciones posteriores antes de afirmar rendimiento histórico.

## Protocolo de validación siguiente

Una vez elegido el segmento, usar 12 briefs consentidos: 4 de desarrollo y 8 reservados; pedir a dos evaluadores con experiencia que califiquen relevancia de 0 a 3, respaldo de evidencia, restricciones, frescura y razón de rechazo. Ocultar el método, congelar universo y fecha, y resolver desacuerdos con otra persona. Con esta muestra pequeña, publicar distribuciones e incertidumbre, sin falsa precisión.

Comparar B0, perfil, historia, audiencia/paquetes y noticias por ablación; medir llamadas, minutos humanos, cambios útiles y errores por capa. Para sponsors separar adecuación, contacto, interés confirmado y contrato. No-observado no cuenta como negativo. Umbrales **propuestos para discutir**, no estándares: cero afirmaciones críticas sin respaldo; cero violaciones duras; al menos 4 de los 5 primeros juzgados útiles en 6 de 8 briefs; y 30% menos tiempo humano dentro de un presupuesto aprobado. Si no supera B0 o los datos del cliente no aportan señal, retirar esa capa o cambiar de segmento.

Para atribución, “originado” exige una regla CRM acordada; “influenciado” registra una interacción vinculada y no vuelve a sumar la misma venta; “incremental” requiere un contrafactual razonable, como asignación o comparación cuasiexperimental. Logos, asistencia y visitas no sustituyen esos datos.

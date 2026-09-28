# Informe de validación de hipótesis

## Diseño

Se congelaron ocho casos sintéticos y se compararon tres métodos determinísticos sobre una muestra de 97 ediciones: `keyword_geo_date`, `profile_taxonomy_overlap` y `profile_plus_history_audience`. Son 24 ejecuciones y 126 filas de candidatos al corte final. No se usó un LLM para cambiar scores y no hay evaluación humana de relevancia. El ranking es una comparación funcional de señales disponibles, no un benchmark predictivo.

Los casos preguntan si los filtros de fecha/geografía excluyen de forma consistente, si taxonomía/historial alteran los candidatos y si los datos actuales permiten cumplir intención, presupuesto o audiencia. Resultado decisivo: cero casos con presupuesto factible confirmado; no se pueden demostrar conversiones ni precisión top-k. Una lista ordenada no equivale a una recomendación útil.

## Conclusiones por hipótesis

1. **“Más historial público mejora la recomendación.”** No validada. PyCon añade nombres históricos, pero sin labels humanos, oportunidad vigente ni resultado de gasto; la mayor cobertura no demuestra mejor elección.
2. **“El producto puede informar una decisión de patrocinio.”** Viabilidad técnica parcial: puede reunir afirmaciones públicas, costes anunciados y vacíos en un expediente. Evidencia comercial insuficiente: no hay contratos/paquetes suficientes, disponibilidad confirmada o outcomes atribuibles.
3. **“La señal social/prensa identifica momentum.”** No validada. Hay 21 artículos, 18 clusters de origen y seis señales de empresa; escasos casos, sin etiquetas sobre relevancia o valor para un comprador.
4. **“Luma resuelve todo el flujo de descubrimiento.”** Documentación indica que MCP puede descubrir eventos públicos próximos; la experiencia real, cobertura histórica y permisos deben probarse con usuario. El borrador local no demuestra publicación ni integración real.
5. **“El modelo o multiagente incrementa calidad.”** No probado. No se ejecutaron comparativas de inferencia; la arquitectura recomienda workflow determinístico con adaptador directo, y ampliar solo después de medir casos donde un agente aporta valor.
6. **“El piloto puede sostenerse económicamente.”** No validado. Los precios por token y plataforma son tarifas públicas; faltan tokens medidos, trabajo humano, derechos de datos, uso del cliente, pago y costo por recomendación aceptada.

## Qué sí apoya la evidencia

Es factible prototipar un dossier trazable, mostrar contradicciones y abstenciones, persistir decisiones, y actualizar una pequeña selección futura desde fuentes oficiales. La cobertura al corte aporta ejemplos concretos; la verificación de futuros demostró también que fuentes del mismo organizador discrepan y que los directorios envejecen.

La recomendación es una **prueba pagada asistida y acotada** con una decisión real aportada por un equipo de growth/field marketing. Primero se debe fijar con ese comprador el segmento, geografía, objetivo, rubrica de calidad y acceso a propuestas/outcomes. No lanzar recomendación autónoma ni prometer ROI basándose en este corpus.

## Addendum al checkpoint de fase 1

El archivo [phase-1-gate.md](checkpoints/phase-1-gate.md) preserva conteos provisionales e indica trabajo pendiente porque documenta el corte intermedio. El corte final es el QA aquí incluido: 97 ediciones, 259 fuentes, 5.961 afirmaciones y 20 anuncios futuros revisados. El incremento proviene de noticias, verificación primaria y normalización posterior; no convierte la muestra en representativa.

# Fase 1 — muestra cultural, editorial y deportiva

Fecha de ejecución: **28 de septiembre de 2026**. Ventana histórica: **28 de septiembre de 2021 a 28 de septiembre de 2026**, más ediciones futuras anunciadas expresamente. Investigación exploratoria internacional, con geografía y segmento del producto todavía pendientes. No se construyó la aplicación.

Se entregan **24 ediciones de cuatro series**, con **168 hechos por campo, 21 relaciones de patrocinio/colaboración y 28 métricas**. Son 21 ediciones con fecha pasada y tres futuras confirmadas: Frieze London 2026, FIL Guadalajara 2026 y Roland-Garros 2027. Veinte tienen evidencia de celebración; Flip 2026 conserva estado `announced` porque este lote recuperó agenda y anuncio primarios, pero no un cierre primario. Ese estado no significa cancelación.

Archivos del lote:

- [nontech-facts.json](nontech-facts.json): registros, fuentes y localizadores por campo; formatos y roles conservados.
- [nontech-retrieval.json](nontech-retrieval.json): 67 consultas, 57 URLs usadas, accesos, ocho intentos fallidos y cola de continuación.
- [nontech-qa.json](nontech-qa.json): conteos, nueve comprobaciones y hashes SHA-256.
- [build_nontech_facts.py](build_nontech_facts.py): generación reproducible desde la curación documentada; no descarga ni scrapea sitios.

## Qué se recuperó

| Serie | Territorio | Ediciones | Evidencia útil recuperada |
|---|---|---|---|
| FIL Guadalajara | Guadalajara, México | 2021–2026 | Fechas, sedes, asistencia declarada, profesionales editoriales, cantidad de sponsors, precio 2025/2026 y acceso profesional separado |
| Flip | Paraty, Brasil; edición 2021 online | 2021–2026 | Cambio de calendario, movilidad, casas con programación propia, sponsor con cambio de marca, inversión anunciada y público de una activación |
| Frieze London | Londres, Reino Unido | 2021–2026 | Preview frente a acceso general, galerías, patrocinio de secciones, premios, actividad urbana y una venta declarada |
| Roland-Garros | París, Francia | 2022–2027 | Fechas con clasificación, asistencia, activación de sponsor, flota logística, producto presentado en el evento y renovación futura |

Se buscaron fuentes en español, portugués, francés e inglés; una retrospectiva de Deutsche Bank se recuperó en italiano. No existe aquí un universo territorial para calcular recall. Predominan series grandes con comunicación institucional; la muestra no representa pequeños eventos comunitarios ni África, Asia u Oceanía. Roland-Garros 2021 queda fuera por celebrarse antes del comienzo de la ventana.

**Calidad de acceso:** 46 URLs tuvieron cuerpo abierto y 11 sólo contenido indexado. En el núcleo de las ediciones, 18 están verificadas mediante lectura del cuerpo y seis —las fechas principales de Flip— llevan `provisional_primary_index_only`. De las 217 observaciones entre hechos, relaciones y métricas, 174 tienen cuerpo primario verificado y 43 permanecen provisionales. Abrir parcialmente un PDF no convirtió todos sus campos en verificados: se mantuvieron provisionales el dato 675.080 de FFT, el patrocinio Eletronuclear y el nivel Oro de CCR 2023 cuando no se pudo leer directamente el pasaje correspondiente.

## Hallazgos con valor para el producto

**La audiencia necesita una definición y un ámbito.** FIL publica para 2024/2025, respectivamente, 907.300/953.112 de público asistente y 18.100/18.400 profesionales del libro. La propia tabla permite separar mercado editorial profesional de público general. No permite demostrar personas únicas. La cifra 2025 se presentó como proyección al cierre del último día y luego aparece en la numeralia; no se obtuvo auditoría independiente. [Numeralia oficial](https://fil.com.mx/info/numeralia.asp?ids=1), [balance del último día, contenido indexado](https://fil.com.mx/ingles/prensa/boletin.asp?id=3316&ids=).

**Un precio es específico de edición, categoría y derecho de acceso.** FIL anunció 30 MXN de entrada general en 2025 y publica 40 MXN para adultos en 2026, con otras tarifas para categorías de descuento. Algunas actividades profesionales requieren registro y cuota aparte. Esto evita recomendar una entrada general como si incluyera toda la feria profesional. [Anuncio 2025, sección Venta de boletos](https://www.fil.com.mx/prensa/boletin.asp?id=3205&ids=1), [FAQ 2026](https://fil.com.mx/info/faq.asp).

**Los resultados de activación son más útiles que un logo aislado.** Roland-Garros informa 11.300 visitas al stand de educación ambiental patrocinado por ENGIE en 2022. Motiva informa 2.792 visitantes de Casa Flip+Motiva en 2025. Son señales de formato y alcance de dos activaciones; no son asistencia total, leads cualificados, visitantes únicos ni retorno de inversión. [Cifras Roland-Garros 2022](https://www.rolandgarros.com/en-us/article/figures-record-breaking-stats-roland-garros-2022), [retrospectiva Motiva en anuncio 2026](https://rodovias.motiva.com.br/riosp/noticias/2026/julho/motiva-assina-a-programacao-oficial-da-flip-pelo-terceiro-ano-co/).

**Existe una cifra comercial concreta, con límites.** Motiva anunció 2 millones BRL para apoyar Flip 2025 y realizar activaciones, combinando recursos propios e incentivados. El importe no se trata como tarifa de una cuota de patrocinio ni gasto auditado. La Casa ofrecía entrada gratuita del 31 de julio al 3 de agosto, dentro del festival de cinco días: la gratuidad pertenece a esa actividad. [Comunicado del sponsor](https://www.motiva.com.br/en/news/motiva-assina-programacao-na-flip-pelo-segundo-ano-consecutivo/).

**Los cambios de sponsor necesitan identidad temporal.** CCR anunció el cambio de marca a Motiva para abril de 2025. Se preservan los nombres históricos y la relación de alias; contar ambas marcas como adquisiciones y pérdidas independientes produciría una señal falsa. En Frieze sí aparece una incorporación expresa: Stone Island debutó como socio de Focus en 2023, dando becas a galerías jóvenes; el anuncio 2024 vuelve a describir ese apoyo. No se infiere que otro sponsor haya salido. [Cambio de marca CCR](https://www.motiva.com.br/en/news/motiva-sera-a-nova-marca-do-grupo-ccr/), [Focus 2023](https://www.frieze.com/article/revealed-highlights-frieze-london-and-frieze-masters-2023?language=en), [programa 2024](https://press.frieze.com/frieze-unveils-bold-design-for-frieze-london-2024-and-a-new-curatorial-direction-at-frieze-masters/).

**La señal empresarial puede ser una acción concreta.** Renault anunció la presentación de Renault 4 Savane 4x4 Concept en Roland-Garros 2025, junto con una flota de 187 vehículos para el torneo. Hay evidencia de producto, fecha, sponsor y logística, útil para explicar afinidad histórica; no demuestra que Renault financiaría otro evento. [Comunicado Renault](https://media.renault.com/?p=529529).

**El retorno comercial público es posible, pero selectivo.** El cierre de Frieze 2025 atribuye a David Zwirner una venta de una obra de Chris Ofili por 700.000 USD en Frieze London. Es una declaración en el recap del organizador, no una auditoría ni una muestra representativa de expositores. Se guardó como hecho individual con su atribución, sin convertirla en ROI del evento. [Recap Frieze 2025](https://press.frieze.com/frieze-london-frieze-masters-2025-end-of-fair/).

## Problemas de datos observados

- **Plantillas actualizadas dentro de archivos históricos.** Las páginas de Roland-Garros 2022 y 2023 incluyen una cabecera de 2027. El archivo Frieze London 2024 mezcla la fecha histórica con noticias de 2026. La fecha se obtuvo del artículo de la edición, no de navegación o pie de página. [Artículo RG2022](https://www.rolandgarros.com/en-us/article/roland-garros-innovations-commitments-edition-2022), [archivo Frieze 2024](https://www.frieze.com/fairs/archive/frieze-london/2024).
- **Dos cifras oficiales, sin causa de diferencia demostrada.** El balance del último día de Roland-Garros 2024 dice 670.000; una publicación FFT de 2025 cita 675.080 para 2024. Se preservan ambas observaciones. La diferencia podría corresponder a redondeo, corte temporal o metodología; no se afirma que la segunda sea una corrección formal. El pasaje del PDF permanece provisional por limitación de recuperación. [Balance 2024](https://www.rolandgarros.com/fr-fr/article/bilan-edition-2024-gilles-moretton-amelie-mauresmo-conference-de-presse), [publicación FFT](https://digital.fft.fr/04-divers/federal/2025/NL%20CLUBS/TI571-Interactif_compressed.pdf).
- **Programación vinculada no equivale al evento principal.** Flip tiene casas independientes con calendarios propios; Frieze Week incluye actividades fuera de los días de la feria. Se conservaron como hechos relacionados, sin duplicarlas como otra edición principal. [Casas Flip 2024](https://www.flip.org.br/espacos-parceiros-2024/), [East End Day y West End Night](https://www.frieze.com/article/east-end-day-and-west-end-night-2024).
- **Público objetivo no equivale a lista de personas.** No se recopilaron listas privadas ni datos de asistentes. Los conteos, categorías editoriales y asistencia a activaciones no se convierten en perfiles individuales.

## Validación y límites

Pasaron nueve comprobaciones: claves requeridas, unicidad serie/fecha, fechas válidas y ordenadas, ausencia de futuros marcados como celebrados, URL/localizador/acceso por observación, pertenencia de fuentes al manifiesto, ausencia de enlaces de plataforma inventados, advertencia de no unicidad para asistencia y ausencia de resultados reales en futuras ediciones. Son controles estructurales y de coherencia, además de revisión manual de fuentes; no miden precisión global ni completitud.

`source_access` se conserva por observación. `web_open` describe acceso al cuerpo de la fuente; no significa corroboración independiente ni permiso comercial. `search_index` es evidencia primaria provisional obtenida del índice. Los valores país, sector, serie, formato y nombres canónicos incluyen normalización curatorial. Los estados `announced`, `planned` y límites inferiores en métricas no se mezclan con resultados observados. Ausencia de una relación de sponsor significa **desconocida**, no ausencia del acuerdo.

Los fallos se registraron sin eludir controles: HTTP 403 de Flip, timeouts de fuentes concretas y el PDF CCR de 17,4 MB que excedió el límite de la herramienta. No hubo compras, registro, contactos, publicación ni extracción de Eventbrite o Partiful en este lote. No se midió costo monetario de los tokens/herramientas de la sesión; el gasto de adquisición contratado fue cero.

La continuación exacta está en el manifiesto: cerrar evidencia primaria de Flip 2026 y de campos indexados; obtener un inventario legible y autorizado de sponsors FIL; ampliar a eventos pequeños y territorios ausentes; buscar paquetes y resultados comerciales con metodología. Este lote prueba que se pueden recuperar relaciones y señales útiles fuera de tecnología. **No demuestra ventaja competitiva extraordinaria, disponibilidad de derechos comerciales a escala ni calidad de un recomendador**, que todavía no se ha construido o evaluado.

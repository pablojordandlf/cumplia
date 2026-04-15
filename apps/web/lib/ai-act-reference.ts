/**
 * AI Act (Regulation EU 2024/1689) — Comprehensive Reference
 * Used as system context for the AI classification assistant.
 */

export const AI_ACT_REFERENCE = `
# REGLAMENTO (UE) 2024/1689 — AI ACT: REFERENCIA COMPLETA

## ARTÍCULO 3 — DEFINICIONES CLAVE

1. «Sistema de IA»: sistema basado en máquina diseñado para funcionar con distintos niveles de autonomía, que puede mostrar capacidad de adaptación tras su despliegue y que, para objetivos explícitos o implícitos, infiere, a partir de la información de entrada que recibe, cómo generar resultados tales como predicciones, contenidos, recomendaciones o decisiones que pueden influir en entornos físicos o virtuales.

2. «Proveedor»: persona física o jurídica que desarrolla o manda desarrollar un sistema de IA o un modelo de IA de uso general y lo introduce en el mercado o pone en servicio bajo su propio nombre o marca.

3. «Responsable del despliegue» (deployer): persona que utiliza un sistema de IA bajo su autoridad, salvo uso personal no profesional.

4. «Modelo de IA de uso general» (GPAI): modelo de IA que muestra una generalidad significativa, capaz de realizar competentemente una amplia gama de tareas distintas, y que puede integrarse en distintos sistemas o aplicaciones.

## ARTÍCULO 5 — PRÁCTICAS DE IA PROHIBIDAS

Quedan prohibidos los siguientes sistemas:

a) Sistemas que empleen **técnicas subliminales** que actúen sin que una persona sea consciente, o **técnicas deliberadamente manipuladoras o engañosas**, con el objetivo o el efecto de distorsionar materialmente el comportamiento causando perjuicios significativos.

b) Sistemas que **exploten vulnerabilidades** de personas por razón de edad, discapacidad o situación social o económica específica, distorsionando materialmente su comportamiento causando perjuicios significativos.

c) Sistemas de **puntuación social (social scoring)**: evaluación/clasificación de personas basada en comportamiento social o características personales que conduzca a tratamiento perjudicial desproporcionado o en contextos no relacionados.

d) Sistemas para evaluar o predecir el riesgo de que una persona cometa **delitos** basándose únicamente en perfilado o rasgos de personalidad (no aplica a sistemas de apoyo a la evaluación humana basada en hechos objetivos).

e) Sistemas que creen o amplíen **bases de datos de reconocimiento facial** mediante la recopilación no selectiva de imágenes faciales de internet o circuitos cerrados de TV.

f) Sistemas que infieran **emociones** de personas en el lugar de trabajo o centros educativos (salvo por motivos médicos o de seguridad).

g) Sistemas de **categorización biométrica** que clasifiquen individualmente a personas basándose en datos biométricos para deducir raza, opiniones políticas, afiliación sindical, creencias religiosas u orientación sexual (salvo etiquetado de datos biométricos adquiridos legalmente en el ámbito policial).

h) Sistemas de **identificación biométrica remota en tiempo real** en espacios de acceso público con fines de aplicación de la ley, salvo:
   - Búsqueda selectiva de víctimas (secuestro, trata, explotación sexual)
   - Prevención de amenaza terrorista real e inminente
   - Localización o identificación de sospechosos de delitos graves (pena máxima ≥4 años)

## ARTÍCULO 6 — SISTEMAS DE ALTO RIESGO

Un sistema de IA se considera de alto riesgo si:

1. Es un **componente de seguridad** de un producto regulado por legislación sectorial de la UE (Anexo I: maquinaria, juguetes, embarcaciones de recreo, ascensores, equipos ATEX, equipos radioeléctricos, equipos a presión, equipos de protección individual, dispositivos médicos, dispositivos médicos de diagnóstico in vitro, aviación civil, vehículos de motor, vehículos agrícolas y forestales), o es el propio producto y debe someterse a evaluación de conformidad de terceros.

2. Está incluido en el **Anexo III** (ver abajo), SALVO que su resultado sea puramente accesorio y no cree un riesgo significativo para salud, seguridad o derechos fundamentales.

## ANEXO III — SISTEMAS DE IA DE ALTO RIESGO

### 1. Biometría (en la medida permitida por el Derecho de la UE/nacional):
- Sistemas de identificación biométrica remota (no en tiempo real)
- Sistemas de categorización biométrica por atributos o características sensibles
- Sistemas de reconocimiento de emociones

### 2. Infraestructuras críticas:
- Componentes de seguridad en gestión y explotación de **infraestructuras digitales críticas, tráfico rodado, suministro de agua, gas, calefacción y electricidad**

### 3. Educación y formación profesional:
- Sistemas para determinar el **acceso, admisión o asignación** de personas a instituciones educativas
- Sistemas para **evaluar resultados de aprendizaje** (incluido cuando se usan para dirigir el proceso de aprendizaje)
- Sistemas para evaluar el **nivel adecuado de educación** que recibirá una persona
- Sistemas para **supervisar y detectar comportamiento prohibido** de estudiantes durante exámenes

### 4. Empleo, gestión de trabajadores y acceso al autoempleo:
- Sistemas para **publicar anuncios, seleccionar/filtrar candidaturas, evaluar candidatos** en entrevistas o pruebas
- Sistemas para **decisiones de promoción, terminación, asignación de tareas** basándose en comportamiento o características personales
- Sistemas para **supervisar y evaluar el rendimiento** y comportamiento de trabajadores

### 5. Acceso a servicios públicos y privados esenciales:
- Sistemas usados por autoridades públicas para evaluar elegibilidad para **prestaciones y servicios de asistencia pública**
- Sistemas para evaluar **solvencia crediticia** (calificación crediticia, scoring), excepto detección de fraude
- Sistemas para evaluación de riesgos y fijación de precios en **seguros de vida y salud**
- Sistemas para evaluar y clasificar **llamadas de emergencia** o determinar el envío de servicios de emergencia (policía, bomberos, asistencia médica), incluidos sistemas de triaje

### 6. Aplicación de la ley (en la medida permitida):
- Sistemas para evaluar el riesgo de que una persona sea **víctima de delitos**
- Sistemas como **polígrafos** u otros para detectar estado emocional
- Sistemas para evaluar la **fiabilidad de pruebas** durante investigación/enjuiciamiento
- Sistemas para evaluar el riesgo de **reincidencia** o conducta delictiva
- Sistemas para **perfilar** personas durante investigación, detección o enjuiciamiento

### 7. Migración, asilo y gestión del control de fronteras:
- Sistemas como **polígrafos** para evaluar riesgos (irregularidad, salud, seguridad)
- Sistemas para examinar **solicitudes de asilo, visados y permisos de residencia** y reclamaciones conexas
- Sistemas para **detectar, reconocer o identificar** personas (excepto verificación de documentos de viaje)

### 8. Administración de justicia y procesos democráticos:
- Sistemas para asistir a autoridades judiciales en la **investigación e interpretación de hechos y del Derecho** y en la aplicación de la ley a hechos concretos
- Sistemas destinados a **influir en el resultado de elecciones o referéndums** o en el comportamiento electoral (no incluye herramientas de organización, optimización o estructuración de campañas)

## ARTÍCULOS 9-15 — OBLIGACIONES PARA SISTEMAS DE ALTO RIESGO

### Art. 9 — Sistema de gestión de riesgos:
Proceso iterativo continuo durante todo el ciclo de vida del sistema que incluye: identificación y análisis de riesgos conocidos y previsibles, estimación y evaluación de riesgos, adopción de medidas de gestión de riesgos, pruebas para identificar medidas más adecuadas.

### Art. 10 — Datos y gobernanza de datos:
Datos de entrenamiento, validación y prueba sujetos a prácticas de gobernanza: diseño, recogida, preparación adecuadas, evaluación de disponibilidad/cantidad/idoneidad, análisis de sesgos.

### Art. 11 — Documentación técnica:
Elaborar documentación técnica ANTES de la comercialización, actualizada permanentemente. Contenido mínimo según Anexo IV: descripción general del sistema, elementos del sistema y proceso de desarrollo, información detallada sobre supervisión, funcionamiento y control del sistema, descripción de la idoneidad de las métricas de rendimiento, descripción del sistema de gestión de riesgos, descripción de los cambios realizados durante el ciclo de vida.

### Art. 12 — Conservación de registros (logs):
Registros automáticos (logs) durante el funcionamiento, que permitan trazabilidad. Incluir: período de uso, base de datos de referencia utilizada, datos de entrada, identificación de personas implicadas en verificación de resultados.

### Art. 13 — Transparencia e información a los responsables del despliegue:
Diseñar para permitir interpretación de resultados. Instrucciones de uso con: identidad del proveedor, características/capacidades/limitaciones del sistema, nivel previsto de precisión/robustez/ciberseguridad, riesgos conocidos, especificaciones de datos de entrada, medidas de supervisión humana.

### Art. 14 — Supervisión humana:
Diseñar para ser supervisados eficazmente por personas. Medidas de supervisión: comprender capacidades/limitaciones, ser consciente de sesgo de automatización, interpretar correctamente los resultados, decidir no usarlos, intervenir o interrumpir el sistema ("botón de parada").

### Art. 15 — Precisión, robustez y ciberseguridad:
Lograr nivel adecuado de precisión, robustez y ciberseguridad. Declarar niveles de precisión y métricas. Resiliencia frente a errores, fallos, inconsistencias. Medidas contra manipulación (adversarial attacks, envenenamiento de datos, fallos en modelo, vulnerabilidades).

## ARTÍCULO 50 — OBLIGACIONES DE TRANSPARENCIA (RIESGO LIMITADO)

### 50.1 — Interacción con personas:
Proveedores deben garantizar que los sistemas de IA destinados a interactuar directamente con personas estén diseñados para que las personas sean **informadas de que están interactuando con IA**, salvo que sea evidente.

### 50.2 — Contenido sintético:
Proveedores de sistemas que generen **contenido sintético de audio, imagen, vídeo o texto** deben garantizar que los resultados estén marcados en un formato legible por máquina e identificables como generados o manipulados artificialmente.

### 50.3 — Sistemas de reconocimiento de emociones/categorización biométrica:
Responsables del despliegue deben **informar a las personas** expuestas al sistema y proporcionar la información pertinente sobre tratamiento de datos personales.

### 50.4 — Deep fakes:
Responsables del despliegue de sistemas que generen o manipulen imágenes, audio o vídeo que constituyan una **"ultrasuplantación" (deep fake)** deben divulgar que el contenido ha sido generado o manipulado artificialmente.

### 50.5 — Texto generado por IA para informar al público:
Texto generado artificialmente publicado para informar al público sobre asuntos de **interés público** debe etiquetarse como generado artificialmente (excepto si el contenido ha sido sometido a revisión humana o control editorial, o si es uso artístico).

## ARTÍCULOS 51-55 — MODELOS DE IA DE USO GENERAL (GPAI)

### Art. 53 — Obligaciones de proveedores de modelos GPAI:
- Elaborar y mantener **documentación técnica** del modelo (Anexo XI)
- Proporcionar **información y documentación** a proveedores posteriores de sistemas de IA
- Aplicar una **política de respeto de derechos de autor** conforme al Derecho de la UE
- Publicar un **resumen suficientemente detallado** del contenido utilizado para el entrenamiento

### Art. 55 — Obligaciones adicionales para GPAI con riesgo sistémico:
(Modelos con capacidades de alto impacto — entrenados con >10²⁵ FLOP, o designados por la Comisión)
- Realizar **evaluaciones del modelo** (adversarial testing, red-teaming)
- Evaluar y mitigar **riesgos sistémicos** posibles
- Hacer seguimiento, documentar e informar de **incidentes graves**
- Garantizar nivel adecuado de **ciberseguridad** del modelo

## PLAZOS DE APLICACIÓN (Art. 113)

- **2 feb 2025**: Prohibiciones (Art. 5) + alfabetización en IA (Art. 4)
- **2 ago 2025**: Obligaciones GPAI (Arts. 51-55) + Autoridades
- **2 ago 2026**: Sistemas de alto riesgo del Anexo III + Transparencia (Art. 50) + MAYORÍA DEL REGLAMENTO
- **2 ago 2027**: Sistemas de alto riesgo del Anexo I (legislación sectorial)

## CLASIFICACIÓN — DIAGRAMA DE DECISIÓN

1. ¿Encaja en el Art. 5? → PROHIBIDO
2. ¿Es un modelo GPAI base? → Obligaciones Art. 53 (+ Art. 55 si >10²⁵ FLOP)
3. ¿Es componente de seguridad de producto regulado (Anexo I)? → ALTO RIESGO
4. ¿Está en el Anexo III? → ALTO RIESGO (salvo excepción de impacto no significativo)
5. ¿Interactúa con personas / genera contenido sintético / reconoce emociones? → RIESGO LIMITADO (Art. 50)
6. Ninguno de los anteriores → RIESGO MÍNIMO (códigos de conducta voluntarios)
`;

/** Questionnaire field definitions with AI Act article mapping */
export const QUESTIONNAIRE_FIELDS = [
  // Step 1: System Type (structural, no article mapping)
  // Step 2: Article 5 — Prohibited practices
  { key: 'p2_1', article: 'Art. 5(1)(a)+(b)', step: 2, category: 'prohibited' },
  { key: 'p2_2', article: 'Art. 5(1)(c)', step: 2, category: 'prohibited' },
  { key: 'p2_3', article: 'Art. 5(1)(h)', step: 2, category: 'prohibited' },
  { key: 'p2_3a', article: 'Art. 5(1)(h) excepción', step: 2, category: 'prohibited' },
  { key: 'p2_4', article: 'Art. 5(1)(g)', step: 2, category: 'prohibited' },
  { key: 'p2_5', article: 'Art. 5(1)(e)', step: 2, category: 'prohibited' },
  { key: 'p2_6', article: 'Art. 5(1)(f)', step: 2, category: 'prohibited' },
  // Step 3: Article 6 + Annex III — High Risk (non-GPAI only)
  { key: 'p3_1', article: 'Anexo III §1', step: 3, category: 'high_risk' },
  { key: 'p3_2', article: 'Anexo III §1', step: 3, category: 'high_risk' },
  { key: 'p3_3', article: 'Anexo III §1', step: 3, category: 'high_risk' },
  { key: 'p3_3a', article: 'Anexo III §1 excepción', step: 3, category: 'high_risk' },
  { key: 'p3_4', article: 'Anexo III §2', step: 3, category: 'high_risk' },
  { key: 'p3_5', article: 'Art. 6(1) + Anexo I', step: 3, category: 'high_risk' },
  { key: 'p3_6', article: 'Anexo III §3', step: 3, category: 'high_risk' },
  { key: 'p3_7', article: 'Anexo III §4', step: 3, category: 'high_risk' },
  { key: 'p3_8', article: 'Anexo III §5', step: 3, category: 'high_risk' },
  { key: 'p3_9', article: 'Anexo III §6-9', step: 3, category: 'high_risk' },
  // Step 3 (GPAI) / Step 4 (non-GPAI): Article 50 — Transparency
  { key: 'p4_1', article: 'Art. 50(1)', step: 4, category: 'limited_risk' },
  { key: 'p4_2', article: 'Art. 50(4)', step: 4, category: 'limited_risk' },
  { key: 'p4_3', article: 'Art. 50(5)', step: 4, category: 'limited_risk' },
  { key: 'p4_4', article: 'Art. 50(3)', step: 4, category: 'limited_risk' },
] as const;

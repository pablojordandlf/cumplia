# Requisitos de Documentación del AI Act - CumplIA

> **Fecha:** Marzo 2025  
> **Versión:** 1.0  
> **Aplicabilidad:** Sistemas de Alto Riesgo (Anexo III) y GPAI con Riesgo Sistémico

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Anexo IV - Documentación Técnica](#2-anexo-iv---documentación-técnica)
3. [Artículo 26 - Obligaciones del Desplegador](#3-artículo-26---obligaciones-del-desplegador)
4. [Artículo 27 - FRIA (Evaluación de Impacto)](#4-artículo-27---fria-evaluación-de-impacto)
5. [Artículo 50 - Obligaciones de Transparencia](#5-artículo-50---obligaciones-de-transparencia)
6. [Cronograma de Aplicabilidad](#6-cronograma-de-aplicabilidad)
7. [Plantillas CumplIA](#7-plantillas-cumplia)

---

## 1. Resumen Ejecutivo

El Reglamento de la UE sobre Inteligencia Artificial (2024/1689) establece obligaciones de documentación específicas según el tipo de sistema y el rol de la entidad (proveedor o desplegador).

### Tipos de Documentos Obligatorios

| Tipo de Sistema | Documentos Requeridos | Plazo |
|-----------------|----------------------|-------|
| **Alto Riesgo** (Anexo III) | Documentación Técnica (Anexo IV), FRIA, Registros, Transparencia | 2 ago 2026 |
| **GPAI con Riesgo Sistémico** | Evaluación de Riesgos, Documentación Técnica | 2 ago 2025 |
| **GPAI General** | Resumen de Documentación Técnica | 2 ago 2025 |

### Roles y Responsabilidades

| Rol | Definición (Art. 3) | Documentación Principal |
|-----|---------------------|------------------------|
| **Proveedor** | Desarrolla o comercializa sistemas de IA | Anexo IV completo |
| **Desplegador (Deployer)** | Usa sistemas de IA bajo su autoridad | FRIA, Registros, Transparencia |
| **Distribuidor** | Comercializa sin modificar | Declaración de conformidad |
| **Importador** | Introduce en UE desde terceros países | Verificación de documentación |

---

## 2. Anexo IV - Documentación Técnica

### 2.1 Aplicabilidad

**Obligado:** Proveedores de sistemas de alto riesgo (Art. 11)

**Contenido Mínimo Obligatorio:**

#### Sección A: Información General
- Nombre y datos de contacto del proveedor
- Nombre comercial del sistema
- Descripción del propósito previsto
- Instrucciones de uso

#### Sección B: Descripción del Sistema
- Arquitectura técnica
- Versiones de software/hardware
- Dependencias de otros sistemas
- Datos de entrenamiento, validación y prueba

#### Sección C: Sistema de Gestión de Riesgos (Art. 9)
- Análisis de riesgos conocidos y predecibles
- Medidas de mitigación implementadas
- Evaluación de riesgos residuales

#### Sección D: Cambios Sustanciales (Art. 12)
- Criterios para determinar cambios sustanciales
- Procedimiento de notificación de cambios

#### Sección E: Homologación (Cuando aplique)
- Referencias a estándares aplicados
- Resultados de pruebas y certificaciones

#### Sección F: Sistema de Calidad
- Descripción del sistema de gestión de calidad
- Procedimientos de control de cambios

### 2.2 Formato de Entrega

- **Idioma:** Idioma oficial de la autoridad competente (EN o idioma nacional)
- **Formato:** Digital preferente (PDF/A para archivado)
- **Accesibilidad:** Disponible para autoridades durante 10 años
- **Actualización:** Mantener versión actualizada ante cambios sustanciales

---

## 3. Artículo 26 - Obligaciones del Desplegador

### 3.1 Documentación del Desplegador

#### 3.1.1 Declaración de Uso (Art. 26.1)

El desplegador debe mantener:

```
REGISTRO DE IMPLEMENTACIÓN
├── Información del sistema
│   ├── Nombre y versión
│   ├── Proveedor
│   └── Fecha de implementación
├── Contexto de uso
│   ├── Finalidad específica
│   ├── Ámbito geográfico
│   └── Usuarios afectados
└── Medidas implementadas
    ├── Supervisión humana
    ├── Salvaguardas técnicas
    └── Formación del personal
```

#### 3.1.2 Sistema de Supervisión (Art. 26.2)

- **Logs automáticos:** Eventos de funcionamiento (Art. 26.5)
- **Revisión periódica:** Mínimo anual del funcionamiento
- **Detección de incidentes:** Procedimiento de notificación a autoridades
- **Retención:** Logs conservados mínimo 6 meses

#### 3.1.3 Formación (Art. 26.6)

Documentación de:
- Programas de formación para personal relevante
- Contenidos sobre riesgos y limitaciones del sistema
- Registros de participación y evaluación

### 3.2 Registros de Funcionamiento (Art. 26.5)

Datos a registrar automáticamente:

| Evento | Descripción | Retención |
|--------|-------------|-----------|
| Input/Output | Datos de entrada y salida | 6 meses |
| Decisiones automatizadas | Resultados que afectan a personas | 6 meses |
| Excepciones | Fallos o comportamientos anómalos | 6 meses |
| Intervención humana | Casos de override manual | 6 meses |

### 3.3 Notificación de Incidentes (Art. 26.10)

**Qué documentar:**
- Descripción del incidente
- Relación con el sistema de IA
- Personas/entidades afectadas
- Medidas correctivas tomadas

**Timing:** Notificación inmediata a proveedor, evaluación de notificación a autoridad

---

## 4. Artículo 27 - FRIA (Evaluación de Impacto)

### 4.1 Cuándo es Obligatoria

**FRIA obligatoria para sistemas de alto riesgo que:**
1. Pertenezcan a área de empleo (gestión de trabajadores)
2. Afecten a acceso a servicios esenciales (crédito, seguros, justicia)
3. Se usen en gestión de migración/asilo/fronteras
4. Afecten a menores de edad
5. Afecten a personas con discapacidad

### 4.2 Contenido del FRIA

#### Sección 1: Descripción del Sistema
```
1.1. Propósito previsto y contexto de uso
1.2. Categorías de personas afectadas
1.3. Decisiones automatizadas que se tomarán
```

#### Sección 2: Análisis de Derechos Fundamentales
```
2.1. Derechos potencialmente afectados
    ├── Protección de datos (GDPR)
    ├── No discriminación (Tratado UE)
    ├── Derechos laborales
    ├── Acceso a la justicia
    └── Libertad de expresión

2.2. Impactos identificados
    ├── Positivos
    ├── Negativos
    └── Riesgos residuales
```

#### Sección 3: Medidas de Mitigación
```
3.1. Medidas técnicas implementadas
3.2. Medidas organizativas
3.3. Supervisión humana efectiva
3.4. Mecanismos de apelación
```

#### Sección 4: Consulta
```
4.1. Consulta a trabajadores/sindicatos
4.2. Consulta a autoridades competentes
4.3. Documentación de aportaciones recibidas
```

#### Sección 5: Conclusión
```
5.1. Balance riesgo-beneficio
5.2. Decisiones sobre implementación
5.3. Plan de revisión
```

### 4.3 Proceso de FRIA

```
FASE 1: Preparación (Semanas 1-2)
├── Identificación de stakeholders
├── Revisión de documentación técnica
└── Definición de alcance

FASE 2: Evaluación (Semanas 3-6)
├── Análisis de impactos
├── Identificación de riesgos
└── Propuesta de medidas

FASE 3: Consulta (Semanas 7-10)
├── Consulta interna
├── Consulta externa
└── Integración de feedback

FASE 4: Finalización (Semanas 11-12)
├── Elaboración de informe
├── Aprobación por dirección
└── Publicación (resumen)
```

### 4.4 Actualización del FRIA

**Revisar FRIA cuando:**
- Cambios sustanciales del sistema
- Incidentes relevantes
- Nuevos riesgos identificados
- Cambios en el contexto de uso

---

## 5. Artículo 50 - Obligaciones de Transparencia

### 5.1 Aplicabilidad

**Obligaciones de transparencia para:**

| Sistema | Obligación | Destinatario |
|---------|-----------|--------------|
| Chatbots/IA conversacional | Informar que es IA | Usuarios finales |
| Emotion recognition | Informar + explicar | Personas expuestas |
| Biometría remota | Informar + registro | Personas + autoridad |
| Deepfakes | Etiquetado como artificial | Destinatarios del contenido |
| Alto riesgo en empleo | Información detallada | Trabajadores + representantes |

### 5.2 Notificación a Empleados (Alto Riesgo Laboral)

#### 5.2.1 Contenido Mínimo (Art. 50 + Anexo III)

```
NOTIFICACIÓN DE IMPLEMENTACIÓN DE SISTEMA DE IA

1. IDENTIFICACIÓN DEL SISTEMA
   - Nombre del sistema de IA
   - Proveedor y versión
   - Área de aplicación (reclutamiento, evaluación, etc.)

2. PROPOSITO Y FUNCIONAMIENTO
   - Finalidad del sistema
   - Decisiones que automatiza
   - Criterios de evaluación

3. DERECHOS DE LOS TRABAJADORES
   - Derecho a no ser sometido a decisiones puramente automatizadas (GDPR)
   - Derecho a obtener intervención humana
   - Derecho a expresar su punto de vista
   - Derecho a impugnar decisiones

4. SUPERVISIÓN HUMANA
   - Quién supervisa el sistema
   - Cómo se pueden revisar decisiones
   - Procedimiento de apelación

5. MEDIDAS DE PROTECCIÓN
   - Medidas contra sesgos de género/raza/edad
   - Protección de datos personales
   - Confidencialidad

6. FECHA DE IMPLEMENTACIÓN
   - Fecha prevista de entrada en funcionamiento
   - Duración del período de prueba (si aplica)

7. CONTACTO
   - Persona/departamento responsable
   - Canal para dudas o reclamaciones
```

#### 5.2.2 Formato y Timing

- **Formato:** Escrito (digital o físico)
- **Timing:** "A más tardar en el momento de la primera interacción"
- **Periodicidad:** Actualizar ante cambios relevantes
- **Idioma:** Idioma del país (ES para España)
- **Accesibilidad:** Adaptado a necesidades de trabajadores con discapacidad

#### 5.2.3 Consulta a Representantes

**Antes de la implementación:**
- Consulta previa a representantes legales de los trabajadores
- Información suficiente para evaluar impacto
- Plazo razonable para aportaciones
- Consideración de feedback recibido

### 5.3 Formación en Alfabetización IA (Art. 4)

Aunque no es documentación en sí, debe documentarse:
- Programas de formación realizados
- Participantes y fechas
- Contenidos cubiertos
- Evaluación de competencias adquiridas

---

## 6. Cronograma de Aplicabilidad

### 6.1 Fechas Clave

| Fecha | Obligaciones Activas | Documentación Requerida |
|-------|---------------------|------------------------|
| **2 ago 2024** | Publicación reglamento | Preparación |
| **2 feb 2025** | Prohibiciones (Art. 5) | - |
| **2 ago 2025** | GPAI + Riesgo Sistémico | Doc. técnica GPAI |
| **2 ago 2026** | Alto riesgo (nuevos) | Todo (Anexo IV, FRIA, etc.) |
| **2 ago 2027** | Alto riesgo (existentes) | Migración a cumplimiento |

### 6.2 Preparación Recomendada

```
2025 Q1-Q2: AUDITORÍA
├── Inventario de sistemas de IA
├── Clasificación por nivel de riesgo
├── Identificación de gaps documentales
└── Plan de remediación

2025 Q3-Q4: IMPLEMENTACIÓN
├── Desarrollo de documentación pendiente
├── Capacitación del personal
├── Pruebas de procesos
└── Ajustes finales

2026 Q1-Q2: VALIDACIÓN
├── Revisión por terceros (si aplica)
├── Alineación con autoridades
├── Publicación de resúmenes
└── Sistemas listos para auditoría
```

---

## 7. Plantillas CumplIA

### 7.1 Estructura de Generación

```typescript
interface DocumentTemplate {
  id: string;
  name: string;
  legalBasis: 'ANNEX_IV' | 'ARTICLE_26' | 'ARTICLE_27' | 'ARTICLE_50';
  applicability: {
    roles: ('provider' | 'deployer' | 'distributor' | 'importer')[];
    riskLevels: ('high' | 'limited' | 'minimal' | 'unacceptable')[];
    sectors: string[];
  };
  requiredFields: FormField[];
  sections: Section[];
  outputs: ('pdf' | 'docx' | 'json')[];
}
```

### 7.2 Mapeo Documento → Sección Legal

| Documento CumplIA | Base Legal | Plan Requerido |
|-------------------|-----------|----------------|
| Documentación Técnica | Anexo IV | Professional+ |
| FRIA | Art. 27 | Professional+ |
| Registro de Implementación | Art. 26 | Starter+ |
| Notificación a Trabajadores | Art. 50 | Starter+ |
| Declaración de Conformidad | Art. 48 | Professional+ |
| Política de Uso de IA | Interna | Starter+ |
| Informe de Auditoría | Art. 74 | Professional+ |

### 7.3 Campos Dinámicos por Documento

#### Documentación Técnica (Anexo IV)
```yaml
fields:
  - system_name: string
  - provider_name: string
  - intended_purpose: text
  - architecture_description: text
  - training_data_summary: text
  - risk_mitigation_measures: array
  - conformity_assessment: file
  - quality_management: text
```

#### FRIA (Art. 27)
```yaml
fields:
  - system_description: text
  - affected_rights: multiselect
    options:
      - data_protection
      - non_discrimination
      - labor_rights
      - access_to_justice
  - impact_assessment: text
  - mitigation_measures: array
  - consultation_summary: text
  - conclusion: text
```

#### Notificación Trabajadores (Art. 50)
```yaml
fields:
  - employee_categories: array
  - implementation_date: date
  - system_purpose: text
  - automated_decisions: text
  - human_oversight_contact: string
  - appeal_procedure: text
  - data_protection_measures: text
```

---

## 8. Referencias

### Legislación
- Reglamento (UE) 2024/1689 del Parlamento Europeo y del Consejo
- Directrices AESIA (Agencia Española de Supervisión de IA)
- EDPB Guidelines on AI and GDPR

### Recursos
- [artificialintelligenceact.eu](https://artificialintelligenceact.eu)
- [digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu)
- [aesia.gob.es](https://aesia.gob.es)

---

## 9. Historial de Versiones

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 2025-03-15 | Documento inicial | CumplIA Legal Team |

---

*Documento generado por CumplIA - Tu Asesor de Cumplimiento del AI Act*

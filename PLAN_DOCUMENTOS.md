# Plan de Implementación - Documentos AI Act

## Estado Actual

### Problemas Identificados
1. ✅ Error al cargar documentos (falta organizationId)
2. ✅ Falta endpoint /api/v1/documents/types
3. ✅ Referencias Enterprise por limpiar
4. ✅ Plan names inconsistentes (free/pro/business vs starter/essential/professional)

### Estructura Existente
- `lib/document-generator.ts` - Generador PDF con 5 tipos de documentos
- `app/api/v1/documents/route.ts` - API para crear/listar documentos
- Componentes UI existentes para mostrar documentos

## Documentos AI Act a Implementar

### 1. Registro de Sistemas de IA (Annex IV)
**Requisitos legales (investigando):**
- Lista completa de sistemas de IA de la organización
- Propósito de cada sistema
- Datos de entrenamiento utilizados
- Métricas de rendimiento
- Medidas de mitigación de riesgos

### 2. Evaluación de Impacto en Derechos Fundamentales (FRIA - Art. 27)
**Requisitos legales (investigando):**
- Descripción del sistema y su uso previsto
- Duración y frecuencia de funcionamiento
- Categorías de personas afectadas
- Derechos fundamentales potencialmente afectados
- Riesgos identificados
- Medidas de mitigación
- Supervisión humana prevista

### 3. Política de Uso de IA
**Contenido sugerido:**
- Principios de uso responsable
- Sistemas autorizados/prohibidos
- Supervisión humana
- Protección de datos
- Procedimientos de revisión

### 4. Aviso a Empleados
**Contenido sugerido:**
- Sistemas de IA utilizados en el workplace
- Derechos de los empleados
- Proceso de supervisión humana
- Contacto DPO

### 5. Aviso a Candidatos
**Contenido sugerido:**
- Uso de IA en procesos de selección
- Derechos ARCO
- Contacto para ejercer derechos

## Plan de Trabajo

### Fase 1: Fix Errores (En curso)
- [ ] Fix API documents con organizationId
- [ ] Crear endpoint /types
- [ ] Limpiar Enterprise references
- [ ] Unificar plan names

### Fase 2: Investigación AI Act (En curso)
- [ ] Requisitos Annex IV
- [ ] Requisitos Art. 27 FRIA
- [ ] Requisitos Art. 50 transparencia
- [ ] Plantillas oficiales

### Fase 3: Diseño UI/UX (Pendiente)
- [ ] Rediseñar página /documents
- [ ] Wizard de generación de documentos
- [ ] Preview de documentos
- [ ] Formularios de personalización

### Fase 4: Implementación PDF (Pendiente)
- [ ] Mejorar templates existentes con requisitos legales
- [ ] Personalización con datos de empresa
- [ ] Generación DOCX además de PDF
- [ ] Storage y descarga

### Fase 5: QA y Testing (Pendiente)
- [ ] Test end-to-end
- [ ] Verificación legal de contenido
- [ ] UX testing

## Datos Necesarios para Generación

### Datos de Organización (de use_cases o perfil)
- Nombre de la empresa
- Sector/industria
- Tamaño de la empresa
- DPO contacto
- Responsable de cumplimiento

### Datos de Casos de Uso
- Nombre del sistema
- Nivel de riesgo (prohibited/high/limited/minimal)
- Clasificación AI Act
- Descripción del uso
- Datos procesados

### Datos Específicos por Documento
- **FRIA**: Riesgos identificados, medidas mitigación
- **Registro**: Todos los sistemas registrados
- **Política**: Principios específicos de la empresa
- **Avisos**: Sistemas que afectan a empleados/candidatos

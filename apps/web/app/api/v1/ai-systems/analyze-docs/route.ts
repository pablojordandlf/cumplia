import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const VALID_SECTORS = [
  'finance', 'healthcare', 'education', 'government', 'retail',
  'technology', 'entertainment', 'manufacturing', 'transportation', 'other',
] as const;

const VALID_ROLES = ['provider', 'deployer', 'distributor', 'importer'] as const;

const EXTRACTION_SYSTEM_PROMPT = `Eres un experto en análisis documental de sistemas de IA según el Reglamento (UE) 2024/1689 (AI Act). Tu tarea es extraer información estructurada de documentos técnicos o fichas de sistemas de inteligencia artificial.

INSTRUCCIONES DE EXTRACCIÓN:

1. NOMBRE (name): Busca el nombre oficial del sistema, producto o proyecto de IA. Puede aparecer como título del documento, nombre del producto, nombre del proyecto, cabecera principal, etc.

2. DESCRIPCIÓN (description): Extrae o resume en 1-3 frases el propósito principal y funcionalidad del sistema. Sé concreto y técnico.

3. SECTOR: Elige exactamente uno de los siguientes valores según el dominio de aplicación del sistema:
   - finance: banca, seguros, inversiones, pagos, crédito, auditoría financiera, fintech
   - healthcare: medicina, diagnóstico clínico, hospitales, farmacia, salud mental, bienestar, telemedicina
   - education: enseñanza, aprendizaje automático educativo, universidades, formación profesional, e-learning
   - government: administración pública, justicia, defensa, seguridad nacional, servicios públicos, registro civil
   - retail: comercio electrónico, tiendas físicas, logística, cadena de suministro, distribución comercial
   - technology: software empresarial, TI, telecomunicaciones, ciberseguridad, cloud computing, plataformas digitales
   - entertainment: medios de comunicación, videojuegos, streaming, música, arte generativo, redes sociales
   - manufacturing: industria, producción automatizada, control de calidad, robótica industrial, mantenimiento predictivo
   - transportation: movilidad urbana, vehículos autónomos, aviación, ferroviario, gestión de tráfico, logística
   - other: cualquier otro sector no contemplado arriba

4. ROL AI ACT (ai_act_role): Elige exactamente uno según el Art. 3 del AI Act:
   - provider: la organización DESARROLLA o encarga desarrollar el sistema (es el fabricante/creador); el documento es una ficha técnica o manual del sistema propio
   - deployer: la organización USA o IMPLANTA el sistema en sus procesos o frente a usuarios finales; el documento describe la adopción de una herramienta de terceros
   - distributor: la organización DISTRIBUYE o revende el sistema desarrollado por terceros en el mercado
   - importer: la organización IMPORTA el sistema desde fuera de la UE para comercializarlo en el mercado europeo

5. IS_POC (is_poc):
   - true: el documento menciona piloto, PoC, MVP, prototipo, prueba de concepto, fase de validación, proof of concept, demostración técnica, entorno de pre-producción
   - false: el documento menciona producción, despliegue real, versión estable, usuarios reales en producción, en explotación, go-live
   - null: no se puede determinar con certeza razonable

6. PROVEEDOR (provider): nombre de la empresa u organización que ha desarrollado o suministra el sistema (no quien lo usa). Puede aparecer como "Desarrollado por", "Proveedor", "Fabricante", nombre de empresa en cabecera o pie de documento.

7. AI OWNER (ai_owner): nombre de la persona responsable del sistema. Puede aparecer como AI Owner, Responsable del sistema, Product Owner, Project Manager, Director del proyecto, Responsable técnico, Persona de contacto principal.

8. VERSIÓN (version): número o nombre de versión si aparece explícitamente (ej: v1.2, versión 3.0, Release 2024.1).

9. CONFIANZA (confidence):
   - high: documentación detallada y completa; la mayoría de campos se determinan con certeza directa del texto
   - medium: información parcial; algunos campos se infieren o están incompletos; documento genérico o escueto
   - low: documentación muy escasa, ambigua o no relacionada con un sistema de IA concreto

REGLAS CRÍTICAS:
- No inventes información que no esté explícita o muy claramente implícita en el documento.
- Si un campo no se puede determinar con certeza razonable, usa null (excepto sector y ai_act_role que deben inferirse siempre que sea posible).
- Devuelve ÚNICAMENTE el objeto JSON válido, sin texto adicional, sin explicaciones previas, sin bloques de código markdown ni comillas adicionales.`;

const EXTRACTION_USER_PROMPT = `Analiza los documentos adjuntos y extrae la información del sistema de IA. Devuelve exclusivamente este objeto JSON (sin texto adicional):

{
  "name": "nombre del sistema de IA o null",
  "description": "descripción en 1-3 frases o null",
  "sector": "finance|healthcare|education|government|retail|technology|entertainment|manufacturing|transportation|other o null",
  "ai_act_role": "provider|deployer|distributor|importer o null",
  "is_poc": true/false/null,
  "provider": "nombre del proveedor/desarrollador o null",
  "ai_owner": "nombre del responsable del sistema o null",
  "version": "versión si se menciona o null",
  "confidence": "high|medium|low"
}`;

type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const SUPPORTED_IMAGE_TYPES: SupportedImageType[] = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
];

function isSupportedImageType(type: string): type is SupportedImageType {
  return SUPPORTED_IMAGE_TYPES.includes(type as SupportedImageType);
}

interface ExtractedDocData {
  name: string | null;
  description: string | null;
  sector: string | null;
  ai_act_role: string | null;
  is_poc: boolean | null;
  provider: string | null;
  ai_owner: string | null;
  version: string | null;
  confidence: 'high' | 'medium' | 'low';
}

function sanitizeExtractedData(raw: Record<string, unknown>): ExtractedDocData {
  const sector = typeof raw.sector === 'string' && VALID_SECTORS.includes(raw.sector as typeof VALID_SECTORS[number])
    ? raw.sector
    : null;

  const ai_act_role = typeof raw.ai_act_role === 'string' && VALID_ROLES.includes(raw.ai_act_role as typeof VALID_ROLES[number])
    ? raw.ai_act_role
    : null;

  return {
    name: typeof raw.name === 'string' ? raw.name.trim() || null : null,
    description: typeof raw.description === 'string' ? raw.description.trim() || null : null,
    sector,
    ai_act_role,
    is_poc: typeof raw.is_poc === 'boolean' ? raw.is_poc : null,
    provider: typeof raw.provider === 'string' ? raw.provider.trim() || null : null,
    ai_owner: typeof raw.ai_owner === 'string' ? raw.ai_owner.trim() || null : null,
    version: typeof raw.version === 'string' ? raw.version.trim() || null : null,
    confidence: raw.confidence === 'high' || raw.confidence === 'medium' ? raw.confidence : 'low',
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const fileEntries = formData.getAll('files');

    if (!fileEntries.length) {
      return NextResponse.json({ success: false, error: 'No se han proporcionado archivos.' }, { status: 400 });
    }

    const files = fileEntries.filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'Los archivos recibidos no son válidos.' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, error: `Máximo ${MAX_FILES} archivos por análisis.` },
        { status: 400 }
      );
    }

    // Build Anthropic content blocks
    type ContentBlock =
      | { type: 'text'; text: string }
      | { type: 'image'; source: { type: 'base64'; media_type: SupportedImageType; data: string } }
      | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } };

    const contentBlocks: ContentBlock[] = [];
    let hasPdf = false;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `El archivo "${file.name}" supera el límite de 10 MB.` },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();

      if (file.type === 'application/pdf') {
        hasPdf = true;
        const base64 = Buffer.from(buffer).toString('base64');
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        });
      } else if (isSupportedImageType(file.type)) {
        const base64 = Buffer.from(buffer).toString('base64');
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: file.type, data: base64 },
        });
      } else {
        // Treat as plain text (txt, md, csv, etc.)
        const text = Buffer.from(buffer).toString('utf-8');
        contentBlocks.push({
          type: 'text',
          text: `--- Contenido del archivo: ${file.name} ---\n\n${text}`,
        });
      }
    }

    contentBlocks.push({ type: 'text', text: EXTRACTION_USER_PROMPT });

    const extraHeaders: Record<string, string> = hasPdf
      ? { 'anthropic-beta': 'pdfs-2024-09-25' }
      : {};

    const response = await client.messages.create(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: contentBlocks as any }],
      },
      { headers: extraHeaders }
    );

    const rawText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    // Strip markdown code fences and trim
    const stripped = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      // Fallback: try to extract JSON object from response if there is surrounding text
      const jsonMatch = stripped.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { success: false, error: 'No se pudo interpretar la respuesta del modelo. Intenta con otro documento.' },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'No se pudo interpretar la respuesta del modelo. Intenta con otro documento.' },
          { status: 422 }
        );
      }
    }

    const extracted = sanitizeExtractedData(parsed);

    return NextResponse.json({ success: true, data: extracted });
  } catch (error) {
    console.error('Error in analyze-docs:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

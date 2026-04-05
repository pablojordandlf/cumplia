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

const EXTRACTION_PROMPT = `Analiza el contenido de los documentos adjuntos y extrae la información sobre el sistema de IA que describen.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin texto adicional, sin markdown, sin bloques de código):

{
  "name": "nombre del sistema de IA (string, null si no se encuentra)",
  "description": "descripción del sistema (string, null si no se encuentra)",
  "sector": "uno de: finance, healthcare, education, government, retail, technology, entertainment, manufacturing, transportation, other (null si no se puede determinar)",
  "ai_act_role": "uno de: provider, deployer, distributor, importer (null si no se puede determinar)",
  "is_poc": true o false (null si no se puede determinar — true si el doc menciona PoC, piloto, prueba de concepto, prototipo),
  "provider": "nombre del proveedor/empresa que desarrolla el sistema (null si no se encuentra)",
  "ai_owner": "nombre del responsable, AI Owner o persona a cargo del sistema (null si no se encuentra)",
  "version": "versión del sistema si se menciona (null si no se encuentra)",
  "confidence": "high si la documentación es clara y detallada, medium si hay información parcial, low si la documentación es escasa"
}

Reglas:
- Para sector: infiere el más apropiado según el contexto del sistema descrito.
- Para ai_act_role: provider = desarrolla el sistema; deployer = lo usa/despliega; distributor = lo distribuye; importer = lo importa desde fuera de la UE.
- Para is_poc: si el documento menciona que es un proyecto piloto, PoC, MVP, prototipo o prueba de concepto → true. Si menciona producción, despliegue real → false.
- No inventes información que no esté en el documento.
- Si un campo no se puede determinar con razonable certeza, usa null.`;

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

    contentBlocks.push({ type: 'text', text: EXTRACTION_PROMPT });

    const extraHeaders: Record<string, string> = hasPdf
      ? { 'anthropic-beta': 'pdfs-2024-09-25' }
      : {};

    const response = await client.messages.create(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: contentBlocks as any }],
      },
      { headers: extraHeaders }
    );

    const rawText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    // Strip possible markdown code fences
    const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { success: false, error: 'No se pudo interpretar la respuesta del modelo. Intenta con otro documento.' },
        { status: 422 }
      );
    }

    const extracted = sanitizeExtractedData(parsed);

    return NextResponse.json({ success: true, data: extracted });
  } catch (error) {
    console.error('Error in analyze-docs:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

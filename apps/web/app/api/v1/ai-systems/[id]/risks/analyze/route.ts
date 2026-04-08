import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface RouteParams {
  params: Promise<{ id: string }>;
}

const RISK_ANALYSIS_SYSTEM_PROMPT = `Eres un experto en gestión de riesgos de sistemas de IA según el Reglamento (UE) 2024/1689 (AI Act). Tu tarea es analizar un sistema de IA concreto y determinar cuáles de sus factores de riesgo registrados le aplican.

Se te proporcionará:
1. La información del sistema de IA
2. La lista de factores de riesgo ya registrados para ese sistema (extraídos de la plantilla aplicada)

Tu misión es:
- Analizar la información del sistema
- Para CADA factor de riesgo de la lista, determinar si aplica o no a este sistema concreto
- Si la información es insuficiente para valorar algún factor importante, hacer PREGUNTAS CONCRETAS al usuario (máximo 3-4 preguntas por turno)
- Cuando tengas suficiente información, emitir el análisis final en formato estructurado

IMPORTANTE: Debes evaluar ÚNICAMENTE los factores de riesgo de la lista proporcionada. No puedes añadir ni eliminar factores.

Cuando tengas suficiente información, incluye un bloque JSON con este formato EXACTO:

<risk_analysis>
{
  "complete": true,
  "applicable": [
    {
      "catalog_risk_id": "UUID_DEL_RIESGO",
      "risk_name": "Nombre del riesgo",
      "reason": "Por qué aplica a este sistema",
      "probability": "low|medium|high|critical",
      "impact": "low|medium|high|critical",
      "notes": "Observaciones o medidas de mitigación sugeridas"
    }
  ],
  "not_applicable": [
    {
      "catalog_risk_id": "UUID_DEL_RIESGO",
      "risk_name": "Nombre del riesgo",
      "reason": "Por qué NO aplica"
    }
  ]
}
</risk_analysis>

CRÍTICO PARA EL JSON:
- El bloque <risk_analysis> DEBE incluir TODOS los factores de riesgo de la lista, cada uno en "applicable" o "not_applicable"
- Antes del bloque JSON escribe únicamente 2-3 líneas de resumen (no más)
- El JSON debe estar completo y bien formado — no lo trunces bajo ningún concepto
- Responde siempre en español.`;

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access
    const { data: system, error: systemError } = await supabase
      .from('use_cases')
      .select('id, name, description, sector, ai_act_level, classification_data, status, organization_id')
      .eq('id', aiSystemId)
      .single();

    if (systemError || !system) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 });
    }

    // Check access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', system.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      const { data: ownerCheck } = await supabase
        .from('use_cases')
        .select('user_id')
        .eq('id', aiSystemId)
        .eq('user_id', user.id)
        .single();
      if (!ownerCheck) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const body = await request.json();
    // Strip any client-side fields before passing to Anthropic SDK
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> =
      (body.messages ?? []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content),
      }));

    // Fetch risks already registered for this system (from the applied template)
    const { data: systemRisks } = await supabase
      .from('use_case_risks')
      .select(`
        id,
        catalog_risk_id,
        catalog_risk:catalog_risk_id(
          id, risk_number, name, description, domain, subdomain, criticality, ai_act_article
        )
      `)
      .eq('use_case_id', aiSystemId)
      .order('created_at', { ascending: true });

    const hasTemplateRisks = systemRisks && systemRisks.length > 0;

    type CatalogRisk = {
      id: string;
      risk_number: number;
      name: string;
      description: string;
      domain: string;
      subdomain: string | null;
      criticality: string;
      ai_act_article: string;
    };

    let risksForContext: CatalogRisk[];

    if (hasTemplateRisks) {
      risksForContext = systemRisks
        .map(r => r.catalog_risk as unknown as CatalogRisk)
        .filter(Boolean);
    } else {
      // Fallback: use full catalog filtered by AI act level (when no template applied)
      const relevantLevels = system.ai_act_level === 'high_risk'
        ? ['high_risk', 'limited_risk']
        : system.ai_act_level === 'limited_risk' || system.ai_act_level === 'minimal_risk'
          ? ['limited_risk', 'minimal_risk']
          : ['high_risk', 'limited_risk', 'minimal_risk'];

      const { data: catalog } = await supabase
        .from('risk_catalog')
        .select('id, risk_number, name, description, domain, subdomain, criticality, ai_act_article, ai_act_level')
        .in('ai_act_level', relevantLevels)
        .eq('is_active', true)
        .order('risk_number');

      risksForContext = (catalog ?? []) as unknown as CatalogRisk[];
    }

    // Build system context
    const classificationData = system.classification_data as Record<string, unknown> | null;
    const riskListLabel = hasTemplateRisks
      ? `## FACTORES DE RIESGO A EVALUAR (plantilla aplicada — ${risksForContext.length} factores)`
      : '## CATÁLOGO DE RIESGOS DISPONIBLES';

    const systemContext = `
## SISTEMA DE IA A ANALIZAR

**Nombre:** ${system.name}
**Sector:** ${system.sector || 'No especificado'}
**Nivel AI Act:** ${system.ai_act_level || 'Sin clasificar'}
**Estado:** ${system.status || 'draft'}
**Descripción:** ${system.description || 'No disponible'}
${classificationData ? `**Datos de clasificación adicionales:** ${JSON.stringify(classificationData, null, 2)}` : ''}

${riskListLabel}

${risksForContext.map(r => `### [${r.id}] #${r.risk_number} - ${r.name}
- **Dominio:** ${r.domain} > ${r.subdomain || 'General'}
- **Criticidad:** ${r.criticality}
- **Artículo AI Act:** ${r.ai_act_article}
- **Descripción:** ${r.description}`).join('\n\n') || 'Sin factores de riesgo registrados'}`;

    const fullSystemPrompt = `${RISK_ANALYSIS_SYSTEM_PROMPT}\n\n${systemContext}`;

    const initialUserMessage = {
      role: 'user' as const,
      content: `Analiza el sistema "${system.name}" y determina cuáles de los ${risksForContext.length} factores de riesgo registrados le aplican. Si necesitas más información, pregúntame.`,
    };
    const conversationMessages = messages.length === 0
      ? [initialUserMessage]
      : [initialUserMessage, ...messages];

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: fullSystemPrompt,
      messages: conversationMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          console.error('Risk analysis streaming error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in AI risk analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

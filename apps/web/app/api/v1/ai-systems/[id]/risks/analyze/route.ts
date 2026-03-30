import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface RouteParams {
  params: Promise<{ id: string }>;
}

const RISK_ANALYSIS_SYSTEM_PROMPT = `Eres un experto en gestión de riesgos de sistemas de IA según el Reglamento (UE) 2024/1689 (AI Act). Tu tarea es ayudar a completar el análisis de riesgos de un sistema concreto.

Se te proporcionará:
1. La información del sistema de IA
2. El catálogo de riesgos disponibles

Tu misión es:
- Analizar la información del sistema
- Determinar qué riesgos del catálogo son aplicables
- Si la información es insuficiente para valorar algún riesgo importante, hacer PREGUNTAS CONCRETAS al usuario (máximo 3-4 preguntas por turno)
- Cuando tengas suficiente información, emitir el análisis final en formato estructurado

IMPORTANTE: Cuando tengas suficiente información para completar el análisis (o el usuario haya respondido a tus preguntas), incluye un bloque JSON con este formato EXACTO:

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
      "reason": "Por qué NO aplica"
    }
  ]
}
</risk_analysis>

Antes del bloque JSON, explica brevemente el razonamiento. Responde siempre en español.`;

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
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = body.messages ?? [];

    // Fetch risk catalog filtered by relevant levels
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

    // Build system context
    const classificationData = system.classification_data as Record<string, any> | null;
    const systemContext = `
## SISTEMA DE IA A ANALIZAR

**Nombre:** ${system.name}
**Sector:** ${system.sector || 'No especificado'}
**Nivel AI Act:** ${system.ai_act_level || 'Sin clasificar'}
**Estado:** ${system.status || 'draft'}
**Descripción:** ${system.description || 'No disponible'}
${classificationData ? `**Datos de clasificación adicionales:** ${JSON.stringify(classificationData, null, 2)}` : ''}

## CATÁLOGO DE RIESGOS DISPONIBLES

${catalog?.map(r => `### [${r.id}] #${r.risk_number} - ${r.name}
- **Dominio:** ${r.domain} > ${r.subdomain || 'General'}
- **Criticidad:** ${r.criticality}
- **Artículo AI Act:** ${r.ai_act_article}
- **Descripción:** ${r.description}`).join('\n\n') ?? 'Sin riesgos en el catálogo'}`;

    const fullSystemPrompt = `${RISK_ANALYSIS_SYSTEM_PROMPT}\n\n${systemContext}`;

    // If no messages yet, start with an initial analysis request
    const conversationMessages = messages.length === 0
      ? [{ role: 'user' as const, content: `Analiza el sistema "${system.name}" y determina qué factores de riesgo del catálogo le aplican. Si necesitas más información, pregúntame.` }]
      : messages;

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { AI_ACT_REFERENCE } from '@/lib/ai-act-reference';

const client = new Anthropic();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function buildOrgContext(orgData: {
  orgName: string;
  systems: any[];
  risks: any[];
  obligations: any[];
}): string {
  const { orgName, systems, risks, obligations } = orgData;

  const systemsSummary = systems.map(s => {
    const sysRisks = risks.filter(r => r.use_case_id === s.id);
    const sysObligations = obligations.filter(o => o.use_case_id === s.id);
    const openRisks = sysRisks.filter(r => r.status !== 'mitigated').length;
    const completedObs = sysObligations.filter(o => o.is_completed).length;

    return [
      `- "${s.name}" (${s.ai_act_level ?? 'sin clasificar'})`,
      s.sector ? `  Sector: ${s.sector}` : null,
      s.status ? `  Estado: ${s.status}` : null,
      s.description ? `  Descripción: ${s.description.slice(0, 200)}` : null,
      `  Riesgos: ${sysRisks.length} total, ${openRisks} abiertos`,
      `  Obligaciones: ${sysObligations.length} total, ${completedObs} completadas`,
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const highRiskSystems = systems.filter(s => s.ai_act_level === 'high_risk');
  const prohibitedSystems = systems.filter(s => s.ai_act_level === 'prohibited');
  const totalObligations = obligations.length;
  const completedObligations = obligations.filter(o => o.is_completed).length;
  const totalRisks = risks.length;
  const mitigatedRisks = risks.filter(r => r.status === 'mitigated').length;

  return `
# DATOS DE LA ORGANIZACIÓN: "${orgName}"

## Resumen ejecutivo
- Total de sistemas de IA registrados: ${systems.length}
- Sistemas de alto riesgo: ${highRiskSystems.length}
- Sistemas prohibidos: ${prohibitedSystems.length}
- Obligaciones: ${completedObligations}/${totalObligations} completadas (${totalObligations > 0 ? Math.round(completedObligations / totalObligations * 100) : 0}%)
- Riesgos: ${mitigatedRisks}/${totalRisks} mitigados (${totalRisks > 0 ? Math.round(mitigatedRisks / totalRisks * 100) : 0}%)

## Sistemas de IA registrados
${systemsSummary || '(Ningún sistema registrado aún)'}
`.trim();
}

const SYSTEM_PROMPT = `Eres el asistente de cumplimiento de CumplIA, experto en el Reglamento (UE) 2024/1689 de Inteligencia Artificial (AI Act).

Respondes siempre en español, de forma concisa y útil. Tu rol es ayudar al usuario a entender el estado de cumplimiento de su organización.

${AI_ACT_REFERENCE}

Se te proporcionará el contexto de la organización del usuario con sus sistemas de IA, riesgos y obligaciones. Usa estos datos para responder preguntas específicas sobre:
- Qué sistemas de IA tiene la organización y su clasificación
- Estado de cumplimiento de obligaciones
- Riesgos abiertos y mitigados
- Recomendaciones de cumplimiento según el AI Act
- Plazos y próximos pasos

Si el usuario pregunta algo que no está en los datos, indícalo claramente. No inventes datos.
Sé conciso y directo. Usa listas y formato cuando sea útil.`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const messages: Message[] = body.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 });
  }

  // Get user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 });
  }

  const orgId = membership.organization_id;
  const orgName = (membership.organizations as any)?.name ?? 'Mi Organización';

  // Fetch systems first to get IDs, then fetch related data in parallel
  const systemsRes = await supabase
    .from('use_cases')
    .select('id, name, description, sector, status, ai_act_level, confidence_score')
    .eq('organization_id', orgId)
    .is('deleted_at', null);

  const systemIds = systemsRes.data?.map(s => s.id) ?? [];

  const [risksRes, obligationsRes] = systemIds.length > 0
    ? await Promise.all([
        supabase
          .from('use_case_risks')
          .select('id, use_case_id, status, probability, impact, residual_risk_score, mitigation_measures, responsible_person, due_date')
          .in('use_case_id', systemIds),
        supabase
          .from('use_case_obligations')
          .select('id, use_case_id, obligation_key, obligation_title, is_completed, completed_at')
          .in('use_case_id', systemIds),
      ])
    : [{ data: [] }, { data: [] }];

  const orgContext = buildOrgContext({
    orgName,
    systems: systemsRes.data ?? [],
    risks: risksRes.data ?? [],
    obligations: obligationsRes.data ?? [],
  });

  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${orgContext}`;

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: fullSystemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
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
        console.error('Chat streaming error:', err);
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
}

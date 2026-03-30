import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { AI_ACT_REFERENCE } from '@/lib/ai-act-reference';

const client = new Anthropic();

// ── Chat mode: streaming conversation ────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `Eres un experto en el Reglamento (UE) 2024/1689 de Inteligencia Artificial (AI Act). Respondes siempre en español, de forma concisa y directa.

${AI_ACT_REFERENCE}

Cuando el usuario te describa un sistema, debes:
1. Hacer preguntas concretas para entender bien el sistema (máximo 3-4 preguntas antes de clasificar). NO DES NADA POR HECHO — si hay ambigüedad, PREGUNTA.
2. Una vez tengas suficiente información, clasificar e incluir un bloque JSON:
<classification>
{
  "level": "prohibited|high_risk|limited_risk|minimal_risk",
  "confidence": "high|medium|low",
  "articles": ["Art. 5", "Anexo III §4"],
  "obligations": ["Obligación 1", "Obligación 2"]
}
</classification>`;

// ── Auto-fill mode: fill the questionnaire ───────────────────────────────────

const AUTOFILL_SYSTEM_PROMPT = `Eres un experto en clasificación de sistemas de IA según el AI Act (Reglamento UE 2024/1689).

${AI_ACT_REFERENCE}

Tu tarea es analizar la descripción de un sistema de IA y responder un cuestionario con "yes" o "no" para cada pregunta.

IMPORTANTE:
- Si la descripción NO proporciona suficiente información para responder una pregunta con confianza, responde "unclear" para esa pregunta.
- No asumas nada que no esté explícitamente indicado.
- Sé conservador: si hay la más mínima duda, marca "unclear".

Las preguntas del cuestionario son:
- systemType: ¿Qué tipo de sistema es? Valores posibles: "gpai_model" (modelo base), "gpai_sr" (GPAI con riesgo sistémico, >10²⁵ FLOP), "gpai_system" (sistema completo sobre GPAI), "specific_purpose" (finalidad específica)
- isSubliminal: ¿Usa técnicas subliminales o manipuladoras? (Art. 5.1.a)
- exploitsVulnerabilities: ¿Explota vulnerabilidades de grupos específicos? (Art. 5.1.b)
- isSocialScoring: ¿Realiza puntuación social por autoridades? (Art. 5.1.c)
- isRealTimeBiometric: ¿Identificación biométrica remota en tiempo real en espacios públicos para fines policiales? (Art. 5.1.h)
- isBiometricIdentification: ¿Identificación/verificación biométrica? (Anexo III §1)
- isCriticalInfrastructure: ¿Gestiona infraestructura crítica? (Anexo III §2)
- isEducationVocational: ¿Evaluación/acceso educativo? (Anexo III §3)
- isEmployment: ¿Empleo/RRHH (selección, promoción, supervisión)? (Anexo III §4)
- isAccessToServices: ¿Acceso a servicios esenciales (crédito, seguros, servicios públicos)? (Anexo III §5)
- isLawEnforcement: ¿Aplicación de la ley? (Anexo III §6)
- isMigrationAsylum: ¿Migración/asilo/fronteras? (Anexo III §7)
- isJusticeDemocratic: ¿Justicia/procesos democráticos? (Anexo III §8)
- isSafetyComponent: ¿Componente de seguridad de producto regulado por Anexo I? (Art. 6.1)
- interactsWithHumans: ¿Interactúa con personas (chatbot, asistente)? (Art. 50.1)
- isEmotionRecognition: ¿Reconoce emociones con biometría? (Art. 50.3)
- isBiometricCategorization: ¿Categoriza personas por biometría? (Art. 50.3)
- generatesDeepfakes: ¿Genera contenido sintético (deepfakes)? (Art. 50.4)

Responde SOLO con un JSON válido, sin texto adicional:
{
  "answers": {
    "systemType": "specific_purpose",
    "isSubliminal": "no",
    ...
  },
  "unclear_fields": ["fieldKey1", "fieldKey2"],
  "unclear_questions": ["¿El sistema toma decisiones sobre acceso a crédito o solo hace recomendaciones?", "..."],
  "confidence": "high|medium|low",
  "reasoning": "Breve justificación de la clasificación"
}`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const mode: 'chat' | 'autofill' = body.mode ?? 'chat';

  if (mode === 'autofill') {
    return handleAutofill(body);
  }
  return handleChat(body);
}

async function handleChat(body: any) {
  const messages: Message[] = body.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 });
  }

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: CHAT_SYSTEM_PROMPT,
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
        console.error('Streaming error:', err);
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

async function handleAutofill(body: any) {
  const { systemName, systemDescription, sector } = body;
  if (!systemName && !systemDescription) {
    return NextResponse.json({ error: 'systemName or systemDescription required' }, { status: 400 });
  }

  const prompt = [
    systemName && `Nombre del sistema: ${systemName}`,
    systemDescription && `Descripción: ${systemDescription}`,
    sector && `Sector: ${sector}`,
  ].filter(Boolean).join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: AUTOFILL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
    }
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Autofill error:', err);
    return NextResponse.json({ error: err.message ?? 'AI error' }, { status: 500 });
  }
}

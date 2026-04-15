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
- p2_3a solo se incluye si p2_3 es "yes". p3_3a solo se incluye si p3_3 es "yes".

Las preguntas del cuestionario son:

PASO 1 — Tipo de sistema:
- systemType: Valores posibles: "gpai_base" (modelo GPAI base), "gpai_systemic" (modelo GPAI con riesgo sistémico, >10²⁵ FLOP), "specific" (sistema con finalidad definida), "multipurpose" (sistema con múltiples usos)

PASO 2 — Prácticas Prohibidas (Art. 5):
- p2_1: ¿El sistema influye en el comportamiento sin que las personas sean conscientes, o explota sus vulnerabilidades para perjudicarlas? (Art. 5.1.a+b)
- p2_2: ¿El sistema puntúa o clasifica a personas por su comportamiento para conceder/denegar beneficios en contextos no relacionados? (Art. 5.1.c — social scoring)
- p2_3: ¿El sistema identifica personas a distancia en tiempo real en espacios públicos mediante biometría, con fines de vigilancia policial? (Art. 5.1.h)
- p2_3a: (solo si p2_3=yes) ¿Opera exclusivamente bajo autorización judicial para búsqueda de víctimas, prevención de terrorismo inminente o localización de sospechosos de delitos graves?
- p2_4: ¿El sistema deduce raza, ideología, religión u orientación sexual a partir de datos biométricos? (Art. 5.1.g)
- p2_5: ¿El sistema recopila masivamente imágenes de rostros para crear bases de datos de reconocimiento facial? (Art. 5.1.e)
- p2_6: ¿El sistema detecta o infiere emociones de empleados o estudiantes en contexto laboral o educativo? (Art. 5.1.f)

PASO 3 — Sistemas de Alto Riesgo / Anexo III (solo si systemType no es gpai_base ni gpai_systemic):
- p3_1: ¿El sistema realiza identificación biométrica remota en diferido (no en tiempo real)? (Anexo III §1)
- p3_2: ¿El sistema categoriza personas por características biométricas para inferir atributos sensibles? (Anexo III §1)
- p3_3: ¿El sistema detecta, reconoce o verifica emociones? (Anexo III §1)
- p3_3a: (solo si p3_3=yes) ¿Se usa exclusivamente con finalidad médica o de seguridad debidamente documentada?
- p3_4: ¿El sistema gestiona o controla infraestructura crítica? (Anexo III §2)
- p3_5: ¿El sistema es componente de seguridad de un producto regulado por legislación sectorial UE (Anexo I)? (Art. 6.1)
- p3_6: ¿El sistema determina acceso a educación, formación profesional, o evalúa rendimiento académico? (Anexo III §3)
- p3_7: ¿El sistema interviene en reclutamiento, selección, evaluación o gestión de personas en el empleo? (Anexo III §4)
- p3_8: ¿El sistema evalúa la elegibilidad para servicios públicos, prestaciones, créditos, seguros u otros servicios esenciales? (Anexo III §5)
- p3_9: ¿El sistema apoya decisiones en aplicación de la ley, gestión migratoria, asilo, fronteras, administración de justicia o procesos democráticos? (Anexo III §6-9)

PASO 4 — Transparencia (Art. 50) — aplica a todos los tipos:
- p4_1: ¿El sistema interactúa directamente con personas sin que sea evidente que están ante una IA? (Art. 50.1)
- p4_2: ¿El sistema genera contenido sintético de imagen, audio o vídeo que representa personas, lugares o eventos reales? (Art. 50.4)
- p4_3: ¿El sistema genera textos sobre asuntos de interés público sin revelar que son generados por IA? (Art. 50.5)
- p4_4: ¿El sistema detecta o infiere emociones de personas fuera del ámbito laboral/educativo prohibido? (Art. 50.3)

Responde SOLO con un JSON válido, sin texto adicional:
{
  "answers": {
    "systemType": "specific",
    "p2_1": "no",
    "p2_2": "no",
    "p2_3": "no",
    "p2_4": "no",
    "p2_5": "no",
    "p2_6": "no",
    "p3_1": "no",
    "p3_2": "no",
    "p3_3": "no",
    "p3_4": "no",
    "p3_5": "no",
    "p3_6": "no",
    "p3_7": "no",
    "p3_8": "no",
    "p3_9": "no",
    "p4_1": "no",
    "p4_2": "no",
    "p4_3": "no",
    "p4_4": "no"
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

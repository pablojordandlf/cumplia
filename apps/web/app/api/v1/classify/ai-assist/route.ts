import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres un experto en el Reglamento (UE) 2024/1689 de Inteligencia Artificial (AI Act). Tu tarea es ayudar a clasificar sistemas de IA según el nivel de riesgo que establece el Reglamento.

Niveles de riesgo del AI Act:
- **PROHIBIDO** (Art. 5): Sistemas de puntuación social, manipulación subliminal, identificación biométrica en tiempo real en espacios públicos para fines policiales (con excepciones), categorización biométrica por características sensibles, scraping masivo de imágenes faciales, inferencia de emociones en trabajo/educación, explotación de vulnerabilidades.
- **ALTO RIESGO** (Anexo III): Infraestructuras críticas, educación y formación, empleo y RRHH, servicios esenciales (crédito, seguros), aplicación de la ley, migración y asilo, administración de justicia, biometría. También componentes de seguridad en sistemas según Anexo I.
- **RIESGO LIMITADO** (Art. 50): Chatbots y sistemas conversacionales, sistemas que generan contenido sintético (deepfakes, imágenes/video/audio IA-generado), reconocimiento de emociones, categorización biométrica.
- **RIESGO MÍNIMO**: Todo lo demás (sistemas de recomendación, filtros de spam, IA en videojuegos, etc.).

Obligaciones principales por nivel:
- Prohibido: no puede usarse en la UE
- Alto riesgo: documentación técnica, registro de logs, supervisión humana, gestión de riesgos, evaluación de conformidad, registro en base de datos UE
- Riesgo limitado: informar que es IA, etiquetar contenido sintético
- Riesgo mínimo: códigos de conducta voluntarios

Cuando el usuario te describa un sistema, debes:
1. Hacer preguntas concretas para entender bien el sistema (máximo 3-4 preguntas antes de clasificar)
2. Una vez tengas suficiente información, proporcionar:
   - Nivel de riesgo clasificado
   - Justificación legal citando artículos concretos del AI Act
   - Las 3-5 obligaciones más importantes que aplican
   - Confianza en la clasificación (alta/media/baja)

Responde siempre en español. Sé conciso y directo. Si el sistema encaja claramente en una categoría, clasifica directamente sin hacer demasiadas preguntas.

Al final de tu clasificación, incluye un bloque JSON estructurado así (exactamente, sin markdown adicional alrededor del JSON):
<classification>
{
  "level": "prohibited|high_risk|limited_risk|minimal_risk",
  "confidence": "high|medium|low",
  "articles": ["Art. 5", "Anexo III"],
  "obligations": ["Obligación 1", "Obligación 2"]
}
</classification>`;

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
  const messages: Message[] = body.messages;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 });
  }

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
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

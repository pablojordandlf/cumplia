import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * API Route: POST /api/classify
 * Clasifica un caso de uso usando el motor AI Act
 * Requiere autenticación
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener datos del request
    const body = await request.json();
    const { useCaseId, name, description, sector } = body;

    if (!useCaseId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: useCaseId, name' },
        { status: 400 }
      );
    }

    // Verificar que el caso de uso pertenece al usuario
    const { data: useCase, error: fetchError } = await supabase
      .from('use_cases')
      .select('*')
      .eq('id', useCaseId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !useCase) {
      return NextResponse.json(
        { error: 'Use case not found or access denied' },
        { status: 404 }
      );
    }

    // Clasificación AI Act basada en reglas/keywords
    const classification = classifyUseCase(name, description || '', sector || 'general');

    // Actualizar el caso de uso en Supabase
    const { data: updatedUseCase, error: updateError } = await supabase
      .from('use_cases')
      .update({
        ai_act_level: classification.level,
        confidence_score: classification.confidence,
        classification_reason: classification.reasoning,
        classification_data: {
          articles: classification.articles,
          obligations: classification.obligations,
          keywords_matched: classification.keywordsMatched,
          timestamp: new Date().toISOString()
        },
        status: 'classified',
        updated_at: new Date().toISOString()
      })
      .eq('id', useCaseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating use case:', updateError);
      return NextResponse.json(
        { error: 'Failed to update use case' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      useCase: updatedUseCase,
      classification
    });

  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Motor de clasificación AI Act
 * Basado en keywords y reglas según el Reglamento UE 2024/1689
 */
function classifyUseCase(
  name: string,
  description: string,
  sector: string
): ClassificationResult {
  const text = `${name} ${description}`.toLowerCase();
  const words = text.split(/\s+/);

  // Keywords por categoría
  const prohibitedKeywords = [
    'subliminal', 'manipulación', 'manipulacion', 'vulnerabilidad',
    'vulnerability', 'explotar', 'exploit', 'puntuación social',
    'social scoring', 'biométrico remoto', 'remote biometric',
    'tiempo real', 'real time', 'espacio público', 'public space',
    'emociones', 'emotions', 'reconocimiento facial', 'facial recognition'
  ];

  const highRiskKeywords = [
    'crítico', 'critico', 'critical', 'infraestructura', 'infrastructure',
    'educación', 'educacion', 'education', 'empleo', 'employment', 'job',
    'trabajo', 'trabajador', 'worker', 'salud', 'health', 'médico', 'medico',
    'medical', 'justicia', 'justice', 'judicial', 'legal', 'seguridad pública',
    'public safety', 'frontera', 'border', 'migración', 'migration',
    'crédito', 'credito', 'credit', 'préstamo', 'prestamo', 'loan',
    'selección personal', 'recruitment', 'contratación', 'hiring',
    'evaluación', 'evaluation', 'assessment', 'acceso', 'acceso esencial',
    'servicio público', 'public service', 'biométrico', 'biometric'
  ];

  const limitedRiskKeywords = [
    'chatbot', 'asistente virtual', 'virtual assistant', 'chat',
    'interacción', 'interaction', 'emociones', 'emotions', 'sentimiento',
    'sentiment', 'deepfake', 'generado ia', 'ai generated', 'sintético',
    'synthetic'
  ];

  const minimalRiskKeywords = [
    'juego', 'game', 'entretenimiento', 'entertainment', 'spam',
    'filtrar', 'filter', 'recomendación', 'recommendation', 'ecommerce',
    'tienda', 'shop', 'personalización', 'personalization'
  ];

  // Contar matches
  const prohibitedCount = countMatches(text, prohibitedKeywords);
  const highRiskCount = countMatches(text, highRiskKeywords);
  const limitedRiskCount = countMatches(text, limitedRiskKeywords);
  const minimalRiskCount = countMatches(text, minimalRiskKeywords);

  const matchedKeywords = {
    prohibited: getMatchedKeywords(text, prohibitedKeywords),
    highRisk: getMatchedKeywords(text, highRiskKeywords),
    limitedRisk: getMatchedKeywords(text, limitedRiskKeywords),
    minimalRisk: getMatchedKeywords(text, minimalRiskKeywords)
  };

  // Lógica de clasificación por prioridad
  let result: ClassificationResult;

  if (prohibitedCount >= 2 || (prohibitedCount >= 1 && text.includes('manipulación'))) {
    result = {
      level: 'prohibited',
      confidence: Math.min(0.95, 0.6 + prohibitedCount * 0.1),
      reasoning: 'Detectadas prácticas prohibidas según Art. 5 del AI Act: manipulación subliminal, explotación de vulnerabilidades, puntuación social o identificación biométrica remota en tiempo real.',
      articles: ['Art. 5'],
      obligations: ['Prohibición absoluta', 'No se puede desplegar en UE'],
      keywordsMatched: matchedKeywords.prohibited
    };
  } else if (highRiskCount >= 2 || ['healthcare', 'justice', 'education', 'employment'].includes(sector)) {
    result = {
      level: 'high_risk',
      confidence: Math.min(0.9, 0.5 + highRiskCount * 0.08),
      reasoning: 'Sistema de IA de alto riesgo según Art. 6 del AI Act. Afecta sectores críticos: salud, justicia, educación, empleo, infraestructura esencial o gestión de servicios públicos.',
      articles: ['Art. 6', 'Art. 8-15'],
      obligations: [
        'Sistema de gestión de riesgos (Art. 9)',
        'Datos de entrenamiento de calidad (Art. 10)',
        'Documentación técnica (Art. 11)',
        'Registro de actividad (Art. 12)',
        'Transparencia e información (Art. 13)',
        'Supervisión humana (Art. 14)',
        'Exactitud, robustez, seguridad (Art. 15)',
        'Conformidad CE antes de comercialización'
      ],
      keywordsMatched: matchedKeywords.highRisk
    };
  } else if (limitedRiskCount >= 1) {
    result = {
      level: 'limited_risk',
      confidence: Math.min(0.85, 0.4 + limitedRiskCount * 0.15),
      reasoning: 'Sistema de IA de riesgo limitado según Art. 50 del AI Act. Requiere transparencia: el usuario debe saber que está interactuando con IA.',
      articles: ['Art. 50'],
      obligations: [
        'Informar al usuario que interactúa con IA',
        'Indicar claramente contenido generado por IA',
        'Para deepfakes: revelar que es sintético'
      ],
      keywordsMatched: matchedKeywords.limitedRisk
    };
  } else {
    result = {
      level: 'minimal_risk',
      confidence: 0.7,
      reasoning: 'Sistema de IA de riesgo mínimo según el AI Act. No se aplican obligaciones específicas más allá del código de conducta voluntario.',
      articles: ['Art. 52', 'Art. 95'],
      obligations: [
        'Código de conducta voluntario (recomendado)',
        'Buenas prácticas de desarrollo'
      ],
      keywordsMatched: matchedKeywords.minimalRisk
    };
  }

  return result;
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter(kw => text.includes(kw)).length;
}

function getMatchedKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter(kw => text.includes(kw));
}

interface ClassificationResult {
  level: 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk';
  confidence: number;
  reasoning: string;
  articles: string[];
  obligations: string[];
  keywordsMatched: string[];
}

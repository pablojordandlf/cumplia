import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper para autenticación
async function getAuthenticatedClient() {
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
            // Server Component context
          }
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  return { supabase, session };
}

// GET /api/catalog - Listar catálogo de casos de uso predefinidos
export async function GET(request: NextRequest) {
  try {
    const { supabase, session } = await getAuthenticatedClient();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('use_case_catalog')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    if (sector && sector !== 'all') {
      query = query.eq('sector', sector);
    }

    const { data: catalog, error } = await query;

    if (error) {
      console.error('Error fetching catalog:', error);
      return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
    }

    // Fallback: if no data in DB, return example use cases
    if (!catalog || catalog.length === 0) {
      const fallbackExamples = [
        {
          id: 'example-1',
          name: 'Sistema de Detección de Fraude',
          description: 'Sistema de IA que analiza transacciones financieras en tiempo real para detectar patrones sospechosos y prevenir fraudes.',
          sector: 'finance',
          typical_ai_act_level: 'high_risk',
          template_data: { keywords: ['fraude', 'transacciones', 'finanzas'] }
        },
        {
          id: 'example-2',
          name: 'Chatbot de Atención al Cliente',
          description: 'Asistente virtual para responder consultas frecuentes y guiar a clientes a través de procesos básicos.',
          sector: 'finance',
          typical_ai_act_level: 'limited_risk',
          template_data: { keywords: ['chatbot', 'atención', 'cliente'] }
        },
        {
          id: 'example-3',
          name: 'Evaluación Automatizada de Crédito',
          description: 'Sistema que evalúa solicitudes de préstamo basándose en datos financieros y comportamiento crediticio.',
          sector: 'finance',
          typical_ai_act_level: 'high_risk',
          template_data: { keywords: ['crédito', 'evaluación', 'riesgo'] }
        },
        {
          id: 'example-4',
          name: 'Sistema de Evaluación de Candidatos',
          description: 'IA para screening de CVs y evaluación inicial de candidatos en procesos de selección.',
          sector: 'employment',
          typical_ai_act_level: 'high_risk',
          template_data: { keywords: ['empleo', 'reclutamiento', 'cv'] }
        },
        {
          id: 'example-5',
          name: 'Asistente Virtual Médico',
          description: 'Chatbot para triaje inicial y orientación sobre síntomas antes de consultar con un médico.',
          sector: 'healthcare',
          typical_ai_act_level: 'limited_risk',
          template_data: { keywords: ['salud', 'triaje', 'síntomas'] }
        },
        {
          id: 'example-6',
          name: 'Detección de Cáncer con IA',
          description: 'Sistema de diagnóstico médico asistido por IA para análisis de imágenes médicas.',
          sector: 'healthcare',
          typical_ai_act_level: 'high_risk',
          template_data: { keywords: ['salud', 'diagnóstico', 'imágenes'] }
        }
      ];
      
      // Filter by sector if specified
      const filtered = sector && sector !== 'all' 
        ? fallbackExamples.filter(item => item.sector === sector)
        : fallbackExamples;
      
      return NextResponse.json({ catalog: filtered.slice(0, limit) });
    }

    return NextResponse.json({ catalog });

  } catch (error) {
    console.error('Error in GET /api/catalog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

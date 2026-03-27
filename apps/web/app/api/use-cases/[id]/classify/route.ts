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

// POST /api/use-cases/[id]/classify - Guardar clasificación AI Act
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, session } = await getAuthenticatedClient();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('use_cases')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      ai_act_level, 
      confidence, 
      reasoning, 
      applicable_articles,
      wizard_answers 
    } = body;

    const updateData: Record<string, any> = {
      ai_act_level,
      confidence_score: confidence,
      classification_reason: Array.isArray(reasoning) ? reasoning.join('. ') : reasoning,
      classification_data: {
        applicable_articles: applicable_articles || [],
        reasoning: Array.isArray(reasoning) ? reasoning : [reasoning],
        wizard_answers: wizard_answers || {},
      },
      status: ai_act_level === 'prohibited' ? 'non_compliant' : 'classified',
      updated_at: new Date().toISOString(),
    };

    const { data: useCase, error } = await supabase
      .from('use_cases')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error saving classification:', error);
      return NextResponse.json({ error: 'Failed to save classification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      useCase: {
        id: useCase.id,
        ai_act_level: useCase.ai_act_level,
        confidence_score: useCase.confidence_score,
        status: useCase.status,
      }
    });

  } catch (error) {
    console.error('Error in POST /api/use-cases/[id]/classify:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

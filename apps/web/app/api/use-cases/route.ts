import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/use-cases - Listar casos de uso del usuario
export async function GET(request: NextRequest) {
  try {
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
              // Server Component context - can be ignored
            }
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sector = searchParams.get('sector');
    const ai_act_level = searchParams.get('ai_act_level');

    let query = supabase
      .from('use_cases')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (sector) query = query.eq('sector', sector);
    if (ai_act_level) query = query.eq('ai_act_level', ai_act_level);

    const { data: useCases, error } = await query;

    if (error) {
      console.error('Error fetching use cases:', error);
      return NextResponse.json({ error: 'Failed to fetch use cases' }, { status: 500 });
    }

    return NextResponse.json({ useCases });

  } catch (error) {
    console.error('Error in GET /api/use-cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/use-cases - Crear nuevo caso de uso
export async function POST(request: NextRequest) {
  try {
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
              // Server Component context - can be ignored
            }
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, sector } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: useCase, error } = await supabase
      .from('use_cases')
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        sector: sector?.trim() || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating use case:', error);
      return NextResponse.json({ error: 'Failed to create use case' }, { status: 500 });
    }

    return NextResponse.json({ useCase }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/use-cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

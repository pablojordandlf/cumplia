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

    return NextResponse.json({ catalog });

  } catch (error) {
    console.error('Error in GET /api/catalog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

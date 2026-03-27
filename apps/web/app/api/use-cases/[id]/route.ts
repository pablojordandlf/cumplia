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

// GET /api/use-cases/[id] - Obtener sistema de IA específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, session } = await getAuthenticatedClient();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: useCase, error } = await supabase
      .from('use_cases')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    return NextResponse.json({ useCase });

  } catch (error) {
    console.error('Error in GET /api/use-cases/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/use-cases/[id] - Actualizar sistema de IA
export async function PATCH(
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
    const { name, description, sector, status, is_poc, custom_fields } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (sector !== undefined) updateData.sector = sector?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (is_poc !== undefined) updateData.is_poc = is_poc;
    if (custom_fields !== undefined) updateData.custom_fields = custom_fields;

    const { data: useCase, error } = await supabase
      .from('use_cases')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating use case:', error);
      return NextResponse.json({ error: 'Failed to update use case' }, { status: 500 });
    }

    return NextResponse.json({ useCase });

  } catch (error) {
    console.error('Error in PATCH /api/use-cases/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/use-cases/[id] - Eliminar sistema de IA
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, session } = await getAuthenticatedClient();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('use_cases')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting use case:', error);
      return NextResponse.json({ error: 'Failed to delete use case' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/use-cases/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

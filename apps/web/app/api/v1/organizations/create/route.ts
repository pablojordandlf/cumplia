import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Client for auth operations (uses anon key with RLS)
    const supabase = await createClient();
    
    // Admin client for DB operations (bypasses RLS)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    // Check if user already has an organization
    const { data: existingMembership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json(
        { message: 'Ya perteneces a una organización activa' },
        { status: 400 }
      );
    }

    // Parse request body
    const { name, size, industry, country, plan = 'professional' } = await request.json();

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { message: 'El nombre de la organización es obligatorio (mínimo 2 caracteres)' },
        { status: 400 }
      );
    }

    if (!country || typeof country !== 'string') {
      return NextResponse.json(
        { message: 'El país es obligatorio' },
        { status: 400 }
      );
    }

    // Create organization using admin client (bypasses RLS)
    const { data: organization, error: orgError } = await adminSupabase
      .from('organizations')
      .insert({
        name: name.trim(),
        slug: generateSlug(name.trim()),
        owner_id: user.id,
        plan_name: plan,
        settings: {
          size: size || null,
          industry: industry || null,
          country: country,
          max_ai_systems: getMaxAiSystems(plan),
          max_users: getMaxUsers(plan),
        },
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { message: 'Error al crear la organización', error: orgError.message },
        { status: 500 }
      );
    }

    // Create owner membership using admin client
    const { error: memberError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        role: 'owner',
        status: 'active',
      });

    if (memberError) {
      console.error('Error creating membership:', memberError);
      // Rollback: delete organization
      await adminSupabase.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json(
        { message: 'Error al asignar membresía', error: memberError.message },
        { status: 500 }
      );
    }

    // Update user metadata with organization info
    await supabase.auth.updateUser({
      data: {
        organization_id: organization.id,
        organization_role: 'owner',
      },
    });

    return NextResponse.json({
      message: 'Organización creada exitosamente',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        role: 'owner',
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error.message },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function getMaxAiSystems(plan: string): number {
  switch (plan) {
    case 'free':
    case 'starter':
      return 1;
    case 'professional':
      return 15;
    case 'business':
    case 'enterprise':
      return -1; // Unlimited
    default:
      return 15;
  }
}

function getMaxUsers(plan: string): number {
  switch (plan) {
    case 'free':
    case 'starter':
      return 1;
    case 'professional':
      return 3;
    case 'business':
      return 10;
    case 'enterprise':
      return -1; // Unlimited
    default:
      return 3;
  }
}

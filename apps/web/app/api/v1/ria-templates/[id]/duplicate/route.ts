import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/supabase/get-user-role';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const permCheck = await requirePermission(supabase, user.id, 'templates:manage');
    if (!permCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Sin permisos para gestionar plantillas' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const { data: source, error: sourceError } = await supabase
      .from('ria_form_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (sourceError || !source) {
      return NextResponse.json({ success: false, error: 'Plantilla origen no encontrada' }, { status: 404 });
    }

    // Verify user can access the source template: must be system template or belong to their org
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!source.is_system && source.organization_id !== membership?.organization_id) {
      return NextResponse.json({ success: false, error: 'Plantilla origen no encontrada' }, { status: 404 });
    }

    const { data: newTemplate, error: insertError } = await supabase
      .from('ria_form_templates')
      .insert({
        name: name.trim(),
        description: source.description,
        is_system: false,
        is_default: false,
        organization_id: membership?.organization_id ?? null,
        created_by: user.id,
        structure: source.structure,
        classification_rules: source.classification_rules,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: 'Error al duplicar la plantilla' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newTemplate }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

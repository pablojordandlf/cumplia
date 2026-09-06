import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: aiSystem } = await supabase
      .from('use_cases')
      .select('organization_id')
      .eq('id', aiSystemId)
      .single();

    if (!aiSystem) {
      return NextResponse.json({ success: false, error: 'Sistema no encontrado' }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', aiSystem.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ success: false, error: 'Sistema no encontrado' }, { status: 404 });
    }

    const { data: assignment } = await supabase
      .from('ai_system_ria_assignments')
      .select('template_id, ria_form_templates(*)')
      .eq('ai_system_id', aiSystemId)
      .single();

    if (assignment?.ria_form_templates) {
      return NextResponse.json({ success: true, data: assignment.ria_form_templates });
    }

    const { data: defaultTemplate } = await supabase
      .from('ria_form_templates')
      .select('*')
      .eq('is_default', true)
      .order('is_system', { ascending: false })
      .limit(1)
      .single();

    if (defaultTemplate) {
      return NextResponse.json({ success: true, data: defaultTemplate });
    }

    const { data: systemTemplate } = await supabase
      .from('ria_form_templates')
      .select('*')
      .eq('is_system', true)
      .limit(1)
      .single();

    return NextResponse.json({ success: true, data: systemTemplate ?? null });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: aiSystem } = await supabase
      .from('use_cases')
      .select('organization_id')
      .eq('id', aiSystemId)
      .single();

    if (!aiSystem) {
      return NextResponse.json({ success: false, error: 'Sistema no encontrado' }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', aiSystem.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ success: false, error: 'Sistema no encontrado' }, { status: 404 });
    }

    const { template_id } = await request.json();
    if (!template_id) {
      return NextResponse.json({ success: false, error: 'template_id es obligatorio' }, { status: 400 });
    }

    const { data: template, error: templateError } = await supabase
      .from('ria_form_templates')
      .select('id')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
    }

    const { error: upsertError } = await supabase
      .from('ai_system_ria_assignments')
      .upsert(
        { ai_system_id: aiSystemId, template_id },
        { onConflict: 'ai_system_id' }
      );

    if (upsertError) {
      return NextResponse.json({ success: false, error: 'Error al asignar la plantilla' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { ai_system_id: aiSystemId, template_id } });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

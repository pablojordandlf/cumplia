import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/supabase/get-user-role';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
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

    const { data: template, error: fetchError } = await supabase
      .from('ria_form_templates')
      .select('id, organization_id, is_system')
      .eq('id', id)
      .single();

    if (fetchError || !template) {
      return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
    }

    const { data: userMembership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!template.is_system && template.organization_id !== userMembership?.organization_id) {
      return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
    }

    // Clear the default flag from ALL templates accessible to this org
    // (both org-specific ones and the system template) so only one can be default at a time.
    if (template.organization_id) {
      await supabase
        .from('ria_form_templates')
        .update({ is_default: false })
        .eq('organization_id', template.organization_id)
        .eq('is_default', true);
    }
    // Always unset the system template default, regardless of what we're setting.
    await supabase
      .from('ria_form_templates')
      .update({ is_default: false })
      .is('organization_id', null)
      .eq('is_default', true);

    const { error: setError } = await supabase
      .from('ria_form_templates')
      .update({ is_default: true })
      .eq('id', id);

    if (setError) {
      return NextResponse.json(
        { success: false, error: 'Error al establecer la plantilla por defecto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

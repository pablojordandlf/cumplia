import { createClient } from '@/lib/supabase/server';
import { getUserRoleInOrg } from '@/lib/supabase/get-user-role';
import { hasPermission } from '@/lib/permissions';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateRiaTemplatePayload } from '@/types/ria-form-template';
import type { MemberRole } from '@/types/organization';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: template, error } = await supabase
      .from('ria_form_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) {
      return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
    }

    // Verify the user is a member of the organization that owns this template
    const role = await getUserRoleInOrg(supabase, user.id, template.organization_id);
    if (!role) {
      return NextResponse.json({ success: false, error: 'Sin acceso a esta plantilla' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: template });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch template first to know which org owns it
    const { data: existing, error: fetchError } = await supabase
      .from('ria_form_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
    }

    // Check permission in the template's own organization
    const role = await getUserRoleInOrg(supabase, user.id, existing.organization_id);
    if (!role || !hasPermission(role as MemberRole, 'templates:manage')) {
      return NextResponse.json({ success: false, error: 'Sin permisos para gestionar plantillas' }, { status: 403 });
    }

    if (existing.is_system) {
      return NextResponse.json(
        { success: false, error: 'Las plantillas del sistema no se pueden modificar' },
        { status: 403 }
      );
    }

    const body: UpdateRiaTemplatePayload = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() ?? null;
    if (body.structure !== undefined) updateData.structure = body.structure;
    if (body.classification_rules !== undefined) updateData.classification_rules = body.classification_rules;

    if (body.is_default === true) {
      const { error: clearError } = await supabase
        .from('ria_form_templates')
        .update({ is_default: false })
        .eq('organization_id', existing.organization_id)
        .eq('is_default', true);

      if (clearError) {
        return NextResponse.json({ success: false, error: 'Error al actualizar plantilla por defecto' }, { status: 500 });
      }

      updateData.is_default = true;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, data: existing });
    }

    const { data: updated, error: updateError } = await supabase
      .from('ria_form_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Error al actualizar la plantilla' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch template first to know which org owns it
    const { data: existing, error: fetchError } = await supabase
      .from('ria_form_templates')
      .select('id, organization_id, is_system, is_default')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: 'Plantilla no encontrada' }, { status: 404 });
    }

    // Check permission in the template's own organization
    const role = await getUserRoleInOrg(supabase, user.id, existing.organization_id);
    if (!role || !hasPermission(role as MemberRole, 'templates:manage')) {
      return NextResponse.json({ success: false, error: 'Sin permisos para gestionar plantillas' }, { status: 403 });
    }

    if (existing.is_system) {
      return NextResponse.json(
        { success: false, error: 'Las plantillas del sistema no se pueden eliminar' },
        { status: 403 }
      );
    }

    if (existing.is_default) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar la plantilla por defecto. Establece otra como predeterminada primero.' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('ria_form_templates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: 'Error al eliminar la plantilla' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

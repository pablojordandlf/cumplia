import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/supabase/get-user-role';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateRiaTemplatePayload } from '@/types/ria-form-template';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const orgId = membership?.organization_id;

    let query = supabase
      .from('ria_form_templates')
      .select('*')
      .order('is_system', { ascending: false })
      .order('is_default', { ascending: false })
      .order('name');

    if (orgId) {
      query = query.or(`is_system.eq.true,organization_id.eq.${orgId}`);
    } else {
      query = query.eq('is_system', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: 'Error al cargar plantillas' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: templates });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const permCheck = await requirePermission(supabase, user.id, 'templates:manage');
    if (!permCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Sin permisos para gestionar plantillas' }, { status: 403 });
    }

    const body: CreateRiaTemplatePayload = await request.json();
    const { name, description, structure, classification_rules, source_template_id } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'El nombre es obligatorio' }, { status: 400 });
    }

    let finalStructure = structure;
    let finalRules = classification_rules;

    if (source_template_id) {
      const { data: source, error: sourceError } = await supabase
        .from('ria_form_templates')
        .select('structure, classification_rules')
        .eq('id', source_template_id)
        .single();

      if (sourceError || !source) {
        return NextResponse.json({ success: false, error: 'Plantilla origen no encontrada' }, { status: 404 });
      }

      finalStructure = structure ?? source.structure;
      finalRules = classification_rules ?? source.classification_rules;
    }

    if (!finalStructure || !finalRules) {
      return NextResponse.json(
        { success: false, error: 'La estructura y las reglas de clasificación son obligatorias' },
        { status: 400 }
      );
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: template, error: insertError } = await supabase
      .from('ria_form_templates')
      .insert({
        name: name.trim(),
        description: description?.trim() ?? null,
        is_system: false,
        is_default: false,
        organization_id: membership?.organization_id ?? null,
        created_by: user.id,
        structure: finalStructure,
        classification_rules: finalRules,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: 'Error al crear la plantilla' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

// app/api/v1/risks/templates/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the template to duplicate
    const { data: template, error: fetchError } = await supabase
      .from('risk_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Only custom templates can be duplicated
    if (template.is_system) {
      return NextResponse.json(
        { error: 'System templates cannot be directly duplicated. Create a custom template instead.' },
        { status: 400 }
      );
    }

    // Call the duplicate_template function which handles RLS properly
    const { data, error: duplicateError } = await supabase.rpc('duplicate_template', {
      p_template_id: id,
      p_user_id: user.id,
    });

    if (duplicateError) {
      console.error('Error duplicating template via RPC:', duplicateError);
      return NextResponse.json(
        { error: duplicateError.message || 'Failed to duplicate template' },
        { status: 500 }
      );
    }

    const newTemplateId = data;

    // Fetch the new template with items
    const { data: newTemplateWithItems, error: fetchNewError } = await supabase
      .from('risk_templates')
      .select(`
        *,
        items:risk_template_items(id, catalog_risk_id)
      `)
      .eq('id', newTemplateId)
      .single();

    if (fetchNewError) {
      console.error('Error fetching new template:', fetchNewError);
      return NextResponse.json(
        { error: 'Template duplicated but failed to fetch result' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        template: newTemplateWithItems,
        message: `Template duplicated successfully as "${newTemplateWithItems.name}"`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error duplicating template:', error);
    return NextResponse.json(
      { error: 'Unexpected error duplicating template' },
      { status: 500 }
    );
  }
}

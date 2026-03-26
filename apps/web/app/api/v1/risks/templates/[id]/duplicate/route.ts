// app/api/v1/risks/templates/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get all risk items from the original template
    const { data: items, error: itemsError } = await supabase
      .from('risk_template_items')
      .select('*')
      .eq('template_id', id);

    if (itemsError) {
      console.error('Error fetching template items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch template items' },
        { status: 500 }
      );
    }

    // Create the duplicated template with "Copy of" prefix
    const newTemplateName = `Copy of ${template.name}`;
    const { data: newTemplate, error: createError } = await supabase
      .from('risk_templates')
      .insert({
        name: newTemplateName,
        description: template.description ? `Copy: ${template.description}` : null,
        ai_act_level: template.ai_act_level,
        is_system: false,
        is_default: false,
        is_active: true,
        applies_to_levels: template.applies_to_levels || [],
        excluded_systems: template.excluded_systems || [],
        included_systems: template.included_systems || [],
        organization_id: template.organization_id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (createError || !newTemplate) {
      console.error('Error creating duplicate template:', createError);
      return NextResponse.json(
        { error: 'Failed to create duplicate template' },
        { status: 500 }
      );
    }

    // Duplicate all risk items
    if (items && items.length > 0) {
      const newItems = items.map(item => ({
        template_id: newTemplate.id,
        risk_id: item.risk_id,
      }));

      const { error: itemsCreateError } = await supabase
        .from('risk_template_items')
        .insert(newItems);

      if (itemsCreateError) {
        console.error('Error creating duplicate items:', itemsCreateError);
        // Clean up the created template if items fail
        await supabase
          .from('risk_templates')
          .delete()
          .eq('id', newTemplate.id);

        return NextResponse.json(
          { error: 'Failed to duplicate template items' },
          { status: 500 }
        );
      }
    }

    // Fetch the new template with items
    const { data: newTemplateWithItems, error: fetchNewError } = await supabase
      .from('risk_templates')
      .select(`
        *,
        items:risk_template_items(id, risk_id)
      `)
      .eq('id', newTemplate.id)
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
        message: `Template duplicated successfully as "${newTemplateName}"`
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

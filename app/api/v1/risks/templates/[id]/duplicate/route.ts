// app/api/v1/risks/templates/[id]/duplicate/route.ts
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { supabase, session };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, session } = await getAuthenticatedClient();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        { error: 'System templates cannot be duplicated. Create a custom template instead.' },
        { status: 400 }
      );
    }

    // Verify ownership - user_id or organization_id match
    if (template.user_id !== session.user.id && template.organization_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to duplicate this template' },
        { status: 403 }
      );
    }

    // Create the new template
    const { data: newTemplate, error: createError } = await supabase
      .from('risk_templates')
      .insert({
        name: `Copy of ${template.name}`,
        description: template.description ? `Copy: ${template.description}` : null,
        ai_act_level: template.ai_act_level,
        is_default: false,
        is_system: false,
        organization_id: template.organization_id,
        user_id: session.user.id,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating duplicate template:', createError);
      return NextResponse.json(
        { error: 'Failed to create duplicate template' },
        { status: 500 }
      );
    }

    // Fetch the original template items
    const { data: items, error: itemsError } = await supabase
      .from('risk_template_items')
      .select('*')
      .eq('template_id', id);

    if (itemsError) {
      console.error('Error fetching template items:', itemsError);
      // Continue anyway - template was created but items weren't copied
    }

    // Copy the items to the new template
    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        template_id: newTemplate.id,
        catalog_risk_id: item.catalog_risk_id,
        is_required: item.is_required,
      }));

      const { error: insertItemsError } = await supabase
        .from('risk_template_items')
        .insert(itemsToInsert);

      if (insertItemsError) {
        console.error('Error copying template items:', insertItemsError);
        // Continue anyway - template was created
      }
    }

    // Fetch the complete new template with items
    const { data: fullNewTemplate, error: fetchNewError } = await supabase
      .from('risk_templates')
      .select(`
        *,
        items:risk_template_items(id, catalog_risk_id, is_required)
      `)
      .eq('id', newTemplate.id)
      .single();

    if (fetchNewError) {
      console.error('Error fetching new template:', fetchNewError);
      return NextResponse.json(
        { 
          template: newTemplate,
          message: 'Template duplicated but could not fetch complete result'
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        template: fullNewTemplate,
        message: `Template "${template.name}" duplicated as "${newTemplate.name}"`
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

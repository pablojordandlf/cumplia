// app/api/v1/risks/templates/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/risks/templates
 * Returns all risk templates (system defaults + user created)
 * Supports filtering by ai_act_level
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const aiActLevel = searchParams.get('ai_act_level');
    const includeSystem = searchParams.get('include_system') !== 'false';

    let query = supabase
      .from('risk_templates')
      .select(`
        *,
        items:risk_template_items(
          id,
          catalog_risk_id,
          is_required,
          risk:catalog_risk_id(
            id,
            risk_number,
            name,
            domain,
            criticality
          )
        )
      `)
      .order('is_system', { ascending: false })
      .order('name');

    // Filter by AI Act level if provided
    // Check if ai_act_level matches OR if applies_to_levels contains the level
    if (aiActLevel) {
      query = query.or(`ai_act_level.eq.${aiActLevel},applies_to_levels.cs.{${aiActLevel}}`);
    }

    // Filter out system templates if not requested
    if (!includeSystem) {
      query = query.eq('is_system', false);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching risk templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    // Count risks per template
    const templatesWithCount = templates?.map(t => ({
      ...t,
      risk_count: t.items?.length || 0
    }));

    return NextResponse.json({ templates: templatesWithCount });
  } catch (error) {
    console.error('Error in templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/risks/templates
 * Create a new custom risk template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      ai_act_level,
      risk_ids,
      applies_to_levels,
      excluded_systems,
      included_systems
    } = body;

    // Validation
    if (!name || !ai_act_level) {
      return NextResponse.json(
        { error: 'Name and ai_act_level are required' },
        { status: 400 }
      );
    }

    if (!risk_ids || !Array.isArray(risk_ids) || risk_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one risk must be selected' },
        { status: 400 }
      );
    }

    // Get user's active organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'No active organization found for user' },
        { status: 403 }
      );
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('risk_templates')
      .insert({
        name,
        description,
        ai_act_level,
        is_default: false,
        is_system: false,
        is_active: true,
        created_by: user.id,
        organization_id: membership.organization_id,
        applies_to_levels: applies_to_levels || [ai_act_level],
        excluded_systems: excluded_systems || [],
        included_systems: included_systems || []
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating template:', templateError);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    // Add template items
    const items = risk_ids.map((riskId: string) => ({
      template_id: template.id,
      catalog_risk_id: riskId,
      is_required: true
    }));

    const { error: itemsError } = await supabase
      .from('risk_template_items')
      .insert(items);

    if (itemsError) {
      console.error('Error adding template items:', itemsError);
      // Rollback template creation
      await supabase.from('risk_templates').delete().eq('id', template.id);
      return NextResponse.json(
        { error: 'Failed to add risks to template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error in create template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

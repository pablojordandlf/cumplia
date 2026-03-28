// app/api/v1/risks/templates/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/supabase/get-user-role';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/risks/templates/[id]
 * Get a specific template with all its risks
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: template, error } = await supabase
      .from('risk_templates')
      .select(`
        *,
        items:risk_template_items(
          id,
          catalog_risk_id,
          is_required,
          risk:catalog_risk_id(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching template:', error);
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in get template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/risks/templates/[id]
 * Update a template (custom or system for applicability only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const permCheck = await requirePermission(supabase, user.id, 'templates:manage');
    if (!permCheck.allowed) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners and admins can manage templates.' },
        { status: 403 }
      );
    }

    // Check if template exists
    const { data: existingTemplate, error: checkError } = await supabase
      .from('risk_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
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
      included_systems,
      is_active
    } = body;

    // For system templates, only allow updating applicability fields and is_active
    if (existingTemplate.is_system) {
      const systemUpdateData: Record<string, unknown> = {};
      
      if (applies_to_levels !== undefined) systemUpdateData.applies_to_levels = applies_to_levels;
      if (excluded_systems !== undefined) systemUpdateData.excluded_systems = excluded_systems;
      if (included_systems !== undefined) systemUpdateData.included_systems = included_systems;
      if (is_active !== undefined) systemUpdateData.is_active = is_active;

      if (Object.keys(systemUpdateData).length === 0) {
        return NextResponse.json(
          { error: 'System templates can only modify applicability fields (applies_to_levels, excluded_systems, included_systems, is_active)' },
          { status: 403 }
        );
      }

      const { error: updateError } = await supabase
        .from('risk_templates')
        .update(systemUpdateData)
        .eq('id', id)
        .select();

      if (updateError) {
        console.error('Error updating system template:', updateError);
        return NextResponse.json(
          { error: 'Failed to update template' },
          { status: 500 }
        );
      }
    } else {
      // For custom templates, check ownership and organization membership
      if (existingTemplate.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized to modify this template' },
          { status: 403 }
        );
      }

      // Verify user has editor role in the template's organization
      if (existingTemplate.organization_id) {
        const { data: membership, error: membershipError } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', existingTemplate.organization_id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (membershipError || !membership) {
          return NextResponse.json(
            { error: 'Not authorized to modify this template - not an organization member' },
            { status: 403 }
          );
        }

        const allowedRoles = ['owner', 'admin'];
        if (!allowedRoles.includes(membership.role)) {
          return NextResponse.json(
            { error: 'Not authorized - editor role required' },
            { status: 403 }
          );
        }
      }

      // Update template
      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (ai_act_level) updateData.ai_act_level = ai_act_level;
      if (applies_to_levels !== undefined) updateData.applies_to_levels = applies_to_levels;
      if (excluded_systems !== undefined) updateData.excluded_systems = excluded_systems;
      if (included_systems !== undefined) updateData.included_systems = included_systems;
      if (is_active !== undefined) updateData.is_active = is_active;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('risk_templates')
          .update(updateData)
          .eq('id', id)
          .select();

        if (updateError) {
          console.error('Error updating template:', updateError);
          return NextResponse.json(
            { error: 'Failed to update template' },
            { status: 500 }
          );
        }
      }

      // Update template items if risk_ids provided
      if (risk_ids && Array.isArray(risk_ids)) {
        // Delete existing items
        await supabase
          .from('risk_template_items')
          .delete()
          .eq('template_id', id);

        // Insert new items
        const items = risk_ids.map((riskId: string) => ({
          template_id: id,
          catalog_risk_id: riskId,
          is_required: true
        }));

        const { error: itemsError } = await supabase
          .from('risk_template_items')
          .insert(items);

        if (itemsError) {
          console.error('Error updating template items:', itemsError);
          return NextResponse.json(
            { error: 'Failed to update template risks' },
            { status: 500 }
          );
        }
      }
    }

    // Fetch updated template
    const { data: updatedTemplate, error: fetchError } = await supabase
      .from('risk_templates')
      .select(`
        *,
        items:risk_template_items(
          id,
          catalog_risk_id,
          is_required,
          risk:catalog_risk_id(*)
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Template updated but failed to fetch' },
        { status: 200 }
      );
    }

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error('Error in update template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/risks/templates/[id]
 * Delete a custom template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const permCheck = await requirePermission(supabase, user.id, 'templates:manage');
    if (!permCheck.allowed) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners and admins can delete templates.' },
        { status: 403 }
      );
    }

    // Check if template exists and is not a system template
    const { data: existingTemplate, error: checkError } = await supabase
      .from('risk_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system templates' },
        { status: 403 }
      );
    }

    if (existingTemplate.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this template' },
        { status: 403 }
      );
    }

    // Verify user has editor role in the template's organization
    if (existingTemplate.organization_id) {
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', existingTemplate.organization_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Not authorized to delete this template - not an organization member' },
          { status: 403 }
        );
      }

      const allowedRoles = ['owner', 'admin', 'editor'];
      if (!allowedRoles.includes(membership.role)) {
        return NextResponse.json(
          { error: 'Not authorized - editor role required' },
          { status: 403 }
        );
      }
    }

    // Delete template (cascade will delete items)
    const { error: deleteError } = await supabase
      .from('risk_templates')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting template:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

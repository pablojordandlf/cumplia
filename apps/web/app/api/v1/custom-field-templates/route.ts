import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/supabase/get-user-role';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/custom-field-templates
 * Returns all custom field templates for the authenticated user
 * Supports filtering by applies_to level
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
    const appliesTo = searchParams.get('applies_to');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
      .from('custom_field_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by applies_to level if provided
    if (appliesTo) {
      query = query.eq('applies_to', appliesTo);
    }

    // Filter out inactive templates unless requested
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching custom field templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: templates || [] });
  } catch (error) {
    console.error('Error in custom field templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/custom-field-templates
 * Create a new custom field template
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
    const { name, description, applies_to, field_definitions } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Name must be less than 255 characters' },
        { status: 400 }
      );
    }

    if (!applies_to) {
      return NextResponse.json(
        { error: 'applies_to is required' },
        { status: 400 }
      );
    }

    const validAppliesTo = ['global', 'prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'gpai_model', 'gpai_system', 'gpai_sr', 'unclassified'];
    if (!validAppliesTo.includes(applies_to)) {
      return NextResponse.json(
        { error: 'Invalid applies_to value' },
        { status: 400 }
      );
    }

    if (!field_definitions || !Array.isArray(field_definitions) || field_definitions.length === 0) {
      return NextResponse.json(
        { error: 'At least one field definition is required' },
        { status: 400 }
      );
    }

    // Check permission: only owner/admin can manage custom field templates
    const permCheck = await requirePermission(supabase, user.id, 'templates:manage');
    if (!permCheck.allowed) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners and admins can create templates.' },
        { status: 403 }
      );
    }

    // Validate each field definition
    const validTypes = ['text', 'textarea', 'url', 'email', 'number'];
    for (const field of field_definitions) {
      if (!field.id || !field.key || !field.label || !field.type) {
        return NextResponse.json(
          { error: 'Each field must have id, key, label, and type' },
          { status: 400 }
        );
      }
      if (!validTypes.includes(field.type)) {
        return NextResponse.json(
          { error: `Invalid field type: ${field.type}. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('custom_field_templates')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        applies_to,
        field_definitions,
        is_active: true
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating custom field template:', templateError);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error in create custom field template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/custom-field-templates/[id]
 * Returns a single custom field template by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: template, error } = await supabase
      .from('custom_field_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching custom field template:', error);
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in get custom field template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/custom-field-templates/[id]
 * Update a custom field template
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, applies_to, field_definitions, is_active } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 }
        );
      }
      if (name.length > 255) {
        return NextResponse.json(
          { error: 'Name must be less than 255 characters' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (applies_to !== undefined) {
      const validAppliesTo = ['global', 'prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'gpai_model', 'gpai_system', 'gpai_sr', 'unclassified'];
      if (!validAppliesTo.includes(applies_to)) {
        return NextResponse.json(
          { error: 'Invalid applies_to value' },
          { status: 400 }
        );
      }
      updateData.applies_to = applies_to;
    }

    if (field_definitions !== undefined) {
      if (!Array.isArray(field_definitions) || field_definitions.length === 0) {
        return NextResponse.json(
          { error: 'At least one field definition is required' },
          { status: 400 }
        );
      }

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
            { error: `Invalid field type: ${field.type}` },
            { status: 400 }
          );
        }
      }
      updateData.field_definitions = field_definitions;
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update template
    const { data: template, error } = await supabase
      .from('custom_field_templates')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      console.error('Error updating custom field template:', error);
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in update custom field template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/custom-field-templates/[id]
 * Soft delete a custom field template (set is_active to false)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Soft delete: set is_active to false
    const { data: template, error } = await supabase
      .from('custom_field_templates')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      console.error('Error deleting custom field template:', error);
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Template deactivated successfully',
      template 
    });
  } catch (error) {
    console.error('Error in delete custom field template API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
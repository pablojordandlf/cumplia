// app/api/v1/ai-systems/[id]/risks/[riskId]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string; riskId: string }>;
}

/**
 * PUT /api/v1/ai-systems/[id]/risks/[riskId]
 * Update a specific risk assessment
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId, riskId } = await params;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this AI system
    const { data: system, error: systemError } = await supabase
      .from('use_cases')
      .select('id, user_id')
      .eq('id', aiSystemId)
      .single();

    if (systemError || !system) {
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    if (system.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this system' },
        { status: 403 }
      );
    }

    // Verify risk belongs to this system
    const { data: existingRisk, error: riskError } = await supabase
      .from('ai_system_risks')
      .select('*')
      .eq('id', riskId)
      .eq('ai_system_id', aiSystemId)
      .single();

    if (riskError || !existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      applicable,
      probability,
      impact,
      mitigation_measures,
      responsible_person,
      due_date,
      notes
    } = body;

    // Calculate residual risk score if both probability and impact provided
    let residual_risk_score = existingRisk.residual_risk_score;
    if (probability && impact) {
      const levels: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4
      };
      const score = levels[probability] * levels[impact];
      // Map 1-16 to 1-10
      if (score <= 2) residual_risk_score = score;
      else if (score <= 4) residual_risk_score = 3;
      else if (score <= 6) residual_risk_score = 5;
      else if (score <= 9) residual_risk_score = 7;
      else residual_risk_score = 10;
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (applicable !== undefined) updateData.applicable = applicable;
    if (probability !== undefined) updateData.probability = probability;
    if (impact !== undefined) updateData.impact = impact;
    if (residual_risk_score !== undefined) updateData.residual_risk_score = residual_risk_score;
    if (mitigation_measures !== undefined) updateData.mitigation_measures = mitigation_measures;
    if (responsible_person !== undefined) updateData.responsible_person = responsible_person;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (notes !== undefined) updateData.notes = notes;

    // Set completed_at if status changed to mitigated
    if (status === 'mitigated' && existingRisk.status !== 'mitigated') {
      updateData.completed_at = new Date().toISOString();
    } else if (status && status !== 'mitigated') {
      updateData.completed_at = null;
    }

    const { data: updatedRisk, error: updateError } = await supabase
      .from('ai_system_risks')
      .update(updateData)
      .eq('id', riskId)
      .select(`
        *,
        catalog_risk:catalog_risk_id(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating risk:', updateError);
      return NextResponse.json(
        { error: 'Failed to update risk' },
        { status: 500 }
      );
    }

    return NextResponse.json({ risk: updatedRisk });
  } catch (error) {
    console.error('Error in update risk API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/ai-systems/[id]/risks/[riskId]
 * Remove a specific risk from the system
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId, riskId } = await params;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this AI system
    const { data: system, error: systemError } = await supabase
      .from('use_cases')
      .select('id, user_id')
      .eq('id', aiSystemId)
      .single();

    if (systemError || !system) {
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    if (system.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this system' },
        { status: 403 }
      );
    }

    // Delete the risk
    const { error: deleteError } = await supabase
      .from('ai_system_risks')
      .delete()
      .eq('id', riskId)
      .eq('ai_system_id', aiSystemId);

    if (deleteError) {
      console.error('Error deleting risk:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete risk' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Risk deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete risk API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

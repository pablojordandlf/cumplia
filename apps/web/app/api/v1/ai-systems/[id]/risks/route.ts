// app/api/v1/ai-systems/[id]/risks/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/ai-systems/[id]/risks
 * Get all risks for a specific AI system
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId } = await params;
    
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
      .select('id, user_id, ai_act_level')
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
        { error: 'Not authorized to view this system' },
        { status: 403 }
      );
    }

    // Get risks with catalog data
    const { data: risks, error } = await supabase
      .from('ai_system_risks')
      .select(`
        *,
        catalog_risk:catalog_risk_id(*)
      `)
      .eq('ai_system_id', aiSystemId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching system risks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch risks' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const total = risks?.length || 0;
    const assessed = risks?.filter(r => 
      r.status === 'assessed' || r.status === 'mitigated' || r.status === 'accepted'
    ).length || 0;
    const mitigated = risks?.filter(r => r.status === 'mitigated').length || 0;
    const criticalOpen = risks?.filter(r => 
      (r.status === 'identified' || r.status === 'assessed') && 
      r.catalog_risk?.criticality === 'critical'
    ).length || 0;

    return NextResponse.json({
      risks: risks || [],
      summary: {
        total,
        assessed,
        mitigated,
        completion_percentage: total > 0 ? Math.round((mitigated / total) * 100) : 0,
        critical_open: criticalOpen
      },
      ai_act_level: system.ai_act_level
    });
  } catch (error) {
    console.error('Error in get system risks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ai-systems/[id]/risks
 * Apply a template to create risks for an AI system
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: aiSystemId } = await params;
    
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
      .select('id, user_id, ai_act_level')
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

    // Don't allow risk management for prohibited systems
    if (system.ai_act_level === 'prohibited') {
      return NextResponse.json(
        { error: 'Risk management not available for prohibited systems' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { template_id, action } = body;

    if (action === 'clear') {
      // Clear all existing risks for this system
      const { error: deleteError } = await supabase
        .from('ai_system_risks')
        .delete()
        .eq('ai_system_id', aiSystemId);

      if (deleteError) {
        console.error('Error clearing risks:', deleteError);
        return NextResponse.json(
          { error: 'Failed to clear risks' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'All risks cleared' });
    }

    if (!template_id) {
      return NextResponse.json(
        { error: 'template_id is required' },
        { status: 400 }
      );
    }

    // Get template items
    const { data: templateItems, error: templateError } = await supabase
      .from('risk_template_items')
      .select('catalog_risk_id')
      .eq('template_id', template_id);

    if (templateError || !templateItems || templateItems.length === 0) {
      return NextResponse.json(
        { error: 'Template not found or empty' },
        { status: 404 }
      );
    }

    // Clear existing risks first
    await supabase
      .from('ai_system_risks')
      .delete()
      .eq('ai_system_id', aiSystemId);

    // Create new risks from template
    const newRisks = templateItems.map(item => ({
      ai_system_id: aiSystemId,
      catalog_risk_id: item.catalog_risk_id,
      template_id: template_id,
      status: 'identified',
      probability: null,
      impact: null,
      residual_risk_score: null,
      mitigation_measures: null,
      responsible_person: null,
      due_date: null,
      notes: null
    }));

    const { data: createdRisks, error: createError } = await supabase
      .from('ai_system_risks')
      .insert(newRisks)
      .select(`
        *,
        catalog_risk:catalog_risk_id(*)
      `);

    if (createError) {
      console.error('Error creating risks from template:', createError);
      return NextResponse.json(
        { error: 'Failed to create risks from template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Created ${createdRisks?.length || 0} risks from template`,
      risks: createdRisks
    }, { status: 201 });
  } catch (error) {
    console.error('Error in create system risks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

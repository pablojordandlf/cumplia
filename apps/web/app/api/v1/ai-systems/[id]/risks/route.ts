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

    // Verify user has access to this AI system through organization membership
    const { data: system, error: systemError } = await supabase
      .from('use_cases')
      .select('id, organization_id, ai_act_level')
      .eq('id', aiSystemId)
      .single();

    if (systemError || !system) {
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    // Check organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', system.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Not authorized to view this system' },
        { status: 403 }
      );
    }

    // Get risks with catalog data
    const { data: risks, error } = await supabase
      .from('use_case_risks')
      .select(`
        *,
        catalog_risk:catalog_risk_id(*)
      `)
      .eq('use_case_id', aiSystemId)
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

    // Verify user has editor access to this AI system through organization membership
    const { data: system, error: systemError } = await supabase
      .from('use_cases')
      .select('id, organization_id, ai_act_level')
      .eq('id', aiSystemId)
      .single();

    if (systemError || !system) {
      return NextResponse.json(
        { error: 'AI system not found' },
        { status: 404 }
      );
    }

    // Check organization membership with editor permissions
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', system.organization_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Not authorized to view this system' },
        { status: 403 }
      );
    }

    // Only editors, admins, and owners can modify risks
    const allowedRoles = ['owner', 'admin', 'editor'];
    if (!allowedRoles.includes(membership.role)) {
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
    const { template_id, catalog_risk_ids, action } = body;

    if (action === 'clear') {
      // Clear all existing risks for this system
      const { error: deleteError } = await supabase
        .from('use_case_risks')
        .delete()
        .eq('use_case_id', aiSystemId);

      if (deleteError) {
        console.error('Error clearing risks:', deleteError);
        return NextResponse.json(
          { error: 'Failed to clear risks' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'All risks cleared' });
    }

    // Handle creation of individual risks from catalog
    if (catalog_risk_ids && Array.isArray(catalog_risk_ids) && catalog_risk_ids.length > 0) {
      // Verify all catalog risks exist
      const { data: existingRisks, error: catalogError } = await supabase
        .from('risk_catalog')
        .select('id')
        .in('id', catalog_risk_ids);

      if (catalogError) {
        console.error('Error fetching catalog risks:', catalogError);
        return NextResponse.json(
          { error: 'Failed to verify catalog risks' },
          { status: 500 }
        );
      }

      const validCatalogIds = existingRisks?.map(r => r.id) || [];
      const invalidIds = catalog_risk_ids.filter(id => !validCatalogIds.includes(id));
      
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid catalog risk IDs: ${invalidIds.join(', ')}` },
          { status: 400 }
        );
      }

      // Check for existing risks to avoid duplicates
      const { data: existingSystemRisks, error: existingError } = await supabase
        .from('use_case_risks')
        .select('catalog_risk_id')
        .eq('use_case_id', aiSystemId)
        .in('catalog_risk_id', validCatalogIds);

      if (existingError) {
        console.error('Error checking existing risks:', existingError);
        return NextResponse.json(
          { error: 'Failed to check existing risks' },
          { status: 500 }
        );
      }

      const existingCatalogIds = existingSystemRisks?.map(r => r.catalog_risk_id) || [];
      const newCatalogIds = validCatalogIds.filter(id => !existingCatalogIds.includes(id));

      if (newCatalogIds.length === 0) {
        return NextResponse.json(
          { error: 'All selected risks already exist for this system' },
          { status: 400 }
        );
      }

      // Create new risks - by default they don't apply
      const newRisks = newCatalogIds.map(catalogRiskId => ({
        use_case_id: aiSystemId,
        catalog_risk_id: catalogRiskId,
        template_id: null,
        status: 'not_applicable',
        applicable: false,
        probability: null,
        impact: null,
        residual_risk_score: null,
        mitigation_measures: null,
        responsible_person: null,
        due_date: null,
        notes: null
      }));

      const { data: createdRisks, error: createError } = await supabase
        .from('use_case_risks')
        .insert(newRisks)
        .select(`
          *,
          catalog_risk:catalog_risk_id(*)
        `);

      if (createError) {
        console.error('Error creating individual risks:', createError);
        return NextResponse.json(
          { error: 'Failed to create risks' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Created ${createdRisks?.length || 0} new risks`,
        risks: createdRisks
      }, { status: 201 });
    }

    if (!template_id) {
      return NextResponse.json(
        { error: 'template_id or catalog_risk_ids is required' },
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
      .from('use_case_risks')
      .delete()
      .eq('use_case_id', aiSystemId);

    // Create new risks from template - by default they don't apply
    const newRisks = templateItems.map(item => ({
      use_case_id: aiSystemId,
      catalog_risk_id: item.catalog_risk_id,
      template_id: template_id,
      status: 'not_applicable',
      applicable: false,
      probability: null,
      impact: null,
      residual_risk_score: null,
      mitigation_measures: null,
      responsible_person: null,
      due_date: null,
      notes: null
    }));

    const { data: createdRisks, error: createError } = await supabase
      .from('use_case_risks')
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

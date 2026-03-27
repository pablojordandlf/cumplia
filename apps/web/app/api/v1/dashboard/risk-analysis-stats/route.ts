import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/dashboard/risk-analysis-stats
 * Get risk analysis completion stats by risk level
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

    // Get organization IDs for this user
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const orgIds = orgMembers?.map(m => m.organization_id) || [];

    // Build filter: user's systems + org systems
    let query = supabase
      .from('use_cases')
      .select('id, ai_act_level, risk_analysis_completed');

    if (orgIds.length > 0) {
      query = query.or(
        `user_id.eq.${user.id},organization_id.in.(${orgIds.join(',')})`
      );
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data: userSystems, error: systemsError } = await query;

    if (systemsError) {
      console.error('Error fetching user systems:', systemsError);
      return NextResponse.json(
        { error: 'Failed to fetch systems' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      total_high_risk: 0,
      completed_high_risk: 0,
      total_limited_risk: 0,
      completed_limited_risk: 0,
      total_minimal_risk: 0,
      completed_minimal_risk: 0
    };

    userSystems?.forEach((system: any) => {
      if (system.ai_act_level === 'high_risk') {
        stats.total_high_risk++;
        if (system.risk_analysis_completed) {
          stats.completed_high_risk++;
        }
      } else if (system.ai_act_level === 'limited_risk') {
        stats.total_limited_risk++;
        if (system.risk_analysis_completed) {
          stats.completed_limited_risk++;
        }
      } else if (system.ai_act_level === 'minimal_risk') {
        stats.total_minimal_risk++;
        if (system.risk_analysis_completed) {
          stats.completed_minimal_risk++;
        }
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in risk-analysis-stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

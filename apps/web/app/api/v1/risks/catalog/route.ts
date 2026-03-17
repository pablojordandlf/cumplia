// app/api/v1/risks/catalog/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/risks/catalog
 * Returns all risks from the MIT AI Risk Repository catalog
 * Supports filtering by domain, criticality, ai_act_level, and timing
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const criticality = searchParams.get('criticality');
    const aiActLevel = searchParams.get('ai_act_level');
    const timing = searchParams.get('timing');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('risk_catalog')
      .select('*')
      .eq('is_active', true)
      .order('risk_number', { ascending: true });

    // Apply filters
    if (domain) {
      query = query.eq('domain', domain);
    }
    if (criticality) {
      query = query.eq('criticality', criticality);
    }
    if (aiActLevel) {
      query = query.eq('ai_act_level', aiActLevel);
    }
    if (timing) {
      query = query.eq('timing', timing);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: risks, error } = await query;

    if (error) {
      console.error('Error fetching risk catalog:', error);
      return NextResponse.json(
        { error: 'Failed to fetch risk catalog' },
        { status: 500 }
      );
    }

    return NextResponse.json({ risks });
  } catch (error) {
    console.error('Error in risk catalog API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

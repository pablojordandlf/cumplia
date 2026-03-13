import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const aiActLevel = searchParams.get('ai_act_level');
    const sector = searchParams.get('sector');

    let query = supabase
      .from('risk_catalog')
      .select('*')
      .order('created_at', { ascending: true });

    if (aiActLevel) {
      query = query.eq('ai_act_level', aiActLevel);
    }
    if (sector) {
      query = query.contains('sector_tags', [sector]);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching risks:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching risks' },
      { status: 500 }
    );
  }
}

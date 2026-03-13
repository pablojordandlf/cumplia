import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const aiActLevel = searchParams.get('ai_act_level');
    const category = searchParams.get('category');

    let query = supabase
      .from('control_catalog')
      .select('*')
      .order('created_at', { ascending: true });

    if (aiActLevel) {
      query = query.eq('ai_act_level', aiActLevel);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching controls:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching controls' },
      { status: 500 }
    );
  }
}

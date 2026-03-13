import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const sector = searchParams.get('sector');

    let query = supabase
      .from('use_case_catalog')
      .select('*')
      .order('name', { ascending: true });

    if (sector) {
      query = query.eq('sector', sector);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching catalog' },
      { status: 500 }
    );
  }
}

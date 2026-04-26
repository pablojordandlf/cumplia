import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FIELDS = [
  'system_purpose', 'intended_users', 'deployment_context',
  'architecture_description', 'training_data_description', 'training_methodology',
  'accuracy_metrics', 'robustness_measures', 'known_limitations',
  'risk_management_summary', 'version', 'change_log',
  'human_oversight_measures', 'stop_mechanism',
];

function calcCompleteness(doc: Record<string, any>): number {
  const filled = FIELDS.filter(f => doc[f] && String(doc[f]).trim().length > 0).length;
  return Math.round((filled / FIELDS.length) * 100);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the user belongs to the organization that owns this system
  const { data: system } = await supabase
    .from('use_cases')
    .select('organization_id')
    .eq('id', id)
    .single();

  if (!system) return NextResponse.json({ error: 'System not found' }, { status: 404 });

  const { data: orgMembership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', system.organization_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!orgMembership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const { data, error } = await supabase
    .from('technical_documentation')
    .select('*')
    .eq('use_case_id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[technical-docs] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ doc: data ?? null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the user belongs to the organization that owns this system
  const { data: system } = await supabase
    .from('use_cases')
    .select('organization_id')
    .eq('id', id)
    .single();

  if (!system) return NextResponse.json({ error: 'System not found' }, { status: 404 });

  const { data: orgMembership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', system.organization_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!orgMembership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const body = await request.json();
  const allowed = Object.fromEntries(
    Object.entries(body).filter(([k]) => FIELDS.includes(k))
  );
  const completeness_score = calcCompleteness({ ...allowed });

  const { data: existing } = await supabase
    .from('technical_documentation')
    .select('id')
    .eq('use_case_id', id)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from('technical_documentation')
      .update({ ...allowed, completeness_score, updated_at: new Date().toISOString() })
      .eq('use_case_id', id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('technical_documentation')
      .insert({ use_case_id: id, ...allowed, completeness_score })
      .select()
      .single();
  }

  if (result.error) {
    console.error('[technical-docs] PUT error:', result.error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  return NextResponse.json({ doc: result.data });
}

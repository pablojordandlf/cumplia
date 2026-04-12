import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 404 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') ?? '0');
  const entityType = url.searchParams.get('entity_type');

  let query = supabase
    .from('audit_log')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[audit/GET] DB error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit log' }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'No organization' }, { status: 404 });
  }

  const body = await request.json();
  const { action, entity_type, entity_id, entity_name, details } = body;

  if (!action || !entity_type) {
    return NextResponse.json({ error: 'action and entity_type required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('audit_log')
    .insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type,
      entity_id: entity_id ?? null,
      entity_name: entity_name ?? null,
      details: details ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error('[audit/POST] DB error:', error);
    return NextResponse.json({ error: 'Failed to create audit log entry' }, { status: 500 });
  }

  return NextResponse.json(data);
}

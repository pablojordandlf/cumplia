import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ComplianceReportData } from '@/lib/pdf/compliance-report';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch system
  const { data: system, error: systemError } = await supabase
    .from('use_cases')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (systemError || !system) {
    return NextResponse.json({ error: 'System not found' }, { status: 404 });
  }

  // Fetch obligations
  const { data: obligations } = await supabase
    .from('use_case_obligations')
    .select('id, obligation_key, obligation_title, is_completed, completed_at')
    .eq('use_case_id', id);

  // Fetch risks
  const { data: risks } = await supabase
    .from('use_case_risks')
    .select(`
      id, status, probability, impact, residual_risk_score,
      mitigation_measures, responsible_person, due_date,
      catalog_risk:risk_catalog(name, domain, criticality)
    `)
    .eq('use_case_id', id);

  // Fetch organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const orgName = (membership?.organizations as any)?.name ?? 'Mi Organización';

  const reportData: ComplianceReportData = {
    system,
    obligations: obligations ?? [],
    risks: (risks ?? []).map((r: any) => ({
      ...r,
      catalog_risk: Array.isArray(r.catalog_risk) ? r.catalog_risk[0] : r.catalog_risk,
    })),
    organization: { name: orgName },
    generatedAt: new Date().toISOString(),
  };

  try {
    // Dynamic import to avoid SSR issues with ESM
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { ComplianceReportPDF } = await import('@/lib/pdf/compliance-report');
    const React = (await import('react')).default;

    const element = React.createElement(ComplianceReportPDF, { data: reportData }) as any;
    const buffer = await renderToBuffer(element);

    const filename = `informe-cumplimiento-${system.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 });
  }
}

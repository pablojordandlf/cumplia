import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePDF, uploadToStorage } from '../../../../../lib/document-generator';
import { randomUUID } from 'crypto';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Pro documents require Pro plan
const PRO_DOCUMENTS = ['systems_register', 'fria', 'candidate_notice'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, use_case_id, form_data, organization_data } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['ai_policy', 'employee_notice', 'systems_register', 'fria', 'candidate_notice'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user session from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();
    
    // Verify user and get user data
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Get user's organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role, org_id')
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('Membership error:', membershipError);
      return NextResponse.json(
        { error: 'Forbidden: User is not a member of any organization' },
        { status: 403 }
      );
    }

    const organizationId = membership.org_id;

    // Get organization details separately
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, plan_name')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error('Organization error:', orgError);
      return NextResponse.json(
        { error: 'Forbidden: Organization not found' },
        { status: 403 }
      );
    }
    
    const plan = organization?.plan_name || 'free';

    // Check Pro requirement
    if (PRO_DOCUMENTS.includes(type) && plan === 'free') {
      return NextResponse.json(
        { 
          error: 'Pro plan required',
          code: 'PRO_REQUIRED',
          message: `The document type '${type}' requires a Pro subscription. Please upgrade your plan.`
        },
        { status: 403 }
      );
    }

    // Fetch use case if ID provided
    let useCases: Array<{id: string; name: string; riskLevel: any; classification?: string}> = [];
    if (use_case_id) {
      const { data: useCase, error: useCaseError } = await supabase
        .from('use_cases')
        .select('id, name, ai_act_level, ai_act_classification, description')
        .eq('id', use_case_id)
        .eq('user_id', user.id)
        .single();

      if (!useCaseError && useCase) {
        useCases = [{
          id: useCase.id,
          name: useCase.name,
          riskLevel: useCase.ai_act_level || 'unknown',
          classification: useCase.ai_act_classification || useCase.description,
        }];
      }
    }

    // Generate document ID
    const documentId = randomUUID();
    const generatedAt = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Use provided organization name from form or fallback to DB
    const orgName = organization_data?.name || organization?.name || 'Organización';

    // Generate document title based on type
    const titles: Record<string, string> = {
      ai_policy: 'Política de Uso de IA',
      employee_notice: 'Notificación a Empleados',
      systems_register: 'Registro de Sistemas de IA',
      fria: 'Evaluación de Impacto (FRIA)',
      candidate_notice: 'Notificación a Candidatos',
    };

    // Prepare document data
    const documentData = {
      type: type as any,
      title: titles[type] || 'Documento de Cumplimiento',
      organizationId,
      organizationName: orgName,
      useCases: useCases.length > 0 ? useCases : undefined,
      generatedAt,
      // Include form data for enhanced generation
      formData: form_data || {},
    };

    // Generate PDF
    const pdfBytes = await generatePDF(documentData as any);

    // Upload to Supabase Storage
    const { path: storagePath, publicUrl } = await uploadToStorage(
      pdfBytes,
      organizationId,
      documentId
    );

    // Save document record to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        organization_id: organizationId,
        type,
        title: titles[type] || 'Documento de Cumplimiento',
        pdf_url: publicUrl,
        content_json: {
          created_by: user.id,
          use_case_id: use_case_id || null,
          form_data: form_data || {},
          organization_data: organization_data || {},
          generatedAt,
          storagePath,
          status: 'completed',
        },
      });

    if (dbError) {
      console.error('Error saving document to database:', dbError);
      // Don't fail the request, the PDF is already generated
    }

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        type,
        title: titles[type] || 'Documento de Cumplimiento',
        downloadUrl: publicUrl,
        storagePath,
        generatedAt,
        status: 'completed',
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

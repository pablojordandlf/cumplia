import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePDF, uploadToStorage, DocumentData } from '@/lib/document-generator';
import { randomUUID } from 'crypto';

// Pro documents require Pro plan
const PRO_DOCUMENTS = ['systems_register', 'fria', 'candidate_notice'];

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, organizationId, useCaseIds } = body;

    // Validate required fields
    if (!type || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and organizationId are required' },
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

    // Get user's organization membership and plan
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role, organizations!inner(id, name, subscription_plan)')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Forbidden: User is not a member of this organization' },
        { status: 403 }
      );
    }

    // Handle Supabase nested query result - organizations might be array or object
    const organization = Array.isArray(membership.organizations) 
      ? membership.organizations[0] 
      : membership.organizations;
    const plan = organization?.subscription_plan || 'free';

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

    // Fetch use cases if IDs provided
    let useCases: DocumentData['useCases'] = [];
    if (useCaseIds && useCaseIds.length > 0) {
      const { data: cases, error: casesError } = await supabase
        .from('use_cases')
        .select('id, name, risk_level, classification')
        .in('id', useCaseIds)
        .eq('organization_id', organizationId);

      if (!casesError && cases) {
        useCases = cases.map((c: any) => ({
          id: c.id,
          name: c.name,
          riskLevel: c.risk_level,
          classification: c.classification,
        }));
      }
    }

    // Generate document ID
    const documentId = randomUUID();
    const generatedAt = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Prepare document data
    const documentData: DocumentData = {
      type,
      title: title || `Documento ${type}`,
      organizationId,
      organizationName: organization.name,
      useCases,
      generatedAt,
    };

    // Generate PDF
    const pdfBytes = await generatePDF(documentData);

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
        created_by: user.id,
        type,
        title: title || `Documento ${type}`,
        storage_path: storagePath,
        public_url: publicUrl,
        status: 'completed',
        metadata: {
          useCases: useCaseIds || [],
          generatedAt,
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
        title: title || `Documento ${type}`,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: organizationId' },
        { status: 400 }
      );
    }

    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify organization membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error fetching documents', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents: documents || [] }, { status: 200 });

  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

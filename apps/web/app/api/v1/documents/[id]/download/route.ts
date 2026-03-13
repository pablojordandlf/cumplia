import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSignedUrl } from '@/lib/document-generator';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: document id' },
        { status: 400 }
      );
    }

    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Fetch document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this document's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', document.organization_id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this document' },
        { status: 403 }
      );
    }

    // Create signed URL for secure download (expires in 1 hour)
    const signedUrl = await createSignedUrl(document.storage_path, 3600);

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      format,
      document: {
        id: document.id,
        type: document.type,
        title: document.title,
        status: document.status,
        createdAt: document.created_at,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// Assume helper functions for XML parsing and domain validation are available
// import { parseSamlMetadata } from '@/lib/sso/samlParser';
// import { is_valid_sso_domain, is_domain_available } from '@/lib/supabase/helpers';

// Mock XML parsing and domain validation for demonstration
const parseSamlMetadata = async (xml: string) => {
  const metadata = {
    entity_id: 'mock-entity-id',
    sso_url: 'https://mock-sso.com/entity/sso',
    certificate: '-----BEGIN CERTIFICATE-----\nMOCK_CERT\n-----END CERTIFICATE-----',
  };
  if (xml.includes('invalid')) {
    throw new Error('Invalid XML format');
  }
  return metadata;
};

const is_valid_sso_domain = (domain: string): boolean => {
  const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  return !publicDomains.includes(domain.toLowerCase());
};

const is_domain_available = async (supabase: any, domain: string, organizationId: string, excludeProviderId?: string): Promise<boolean> => {
  // Check if the domain is already used by *another* provider in the same organization
  // For this example, we'll assume it's always available if it passes personal validation
  return true;
};


interface SSProviderRequestBody {
  name?: string;
  provider_type?: 'saml' | 'oidc';
  metadata_xml?: string;
  metadata_url?: string;
  domains?: string[];
  attribute_mapping?: object;
  auto_provision?: boolean;
  default_role?: string;
  is_active?: boolean;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string; providerId: string }> }) {
  const { id: organizationId, providerId } = await params;
  const supabase = await createClient();

  try {
    // Ensure the logged-in user has permission to view this provider within the organization.
    // Supabase RLS policies should handle this if set up correctly.

    const { data, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('id', providerId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'SSO provider not found for this organization' }, { status: 404 });

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error('Error fetching SSO provider:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch SSO provider' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; providerId: string }> }) {
  const { id: organizationId, providerId } = await params;
  const supabase = await createClient();
  const body: SSProviderRequestBody = await request.json();

  try {
    // Ensure the logged-in user has permission to update this provider.
    // Authorization check here.

    let updateData: any = {};
    let parsedMetadata = null;

    // Prepare update data, only including fields that are present in the request body
    if (body.name !== undefined) updateData.name = body.name;
    if (body.provider_type !== undefined) updateData.provider_type = body.provider_type;
    if (body.metadata_xml !== undefined) {
        updateData.metadata_xml = body.metadata_xml;
        // If XML is provided, re-parse to update entity_id, sso_url, certificate
        parsedMetadata = await parseSamlMetadata(body.metadata_xml);
        updateData.entity_id = parsedMetadata.entity_id;
        updateData.sso_url = parsedMetadata.sso_url;
        updateData.certificate = parsedMetadata.certificate;
    }
    if (body.metadata_url !== undefined) {
        updateData.metadata_url = body.metadata_url;
        // Logic to fetch and parse from URL would go here if implemented
        // For now, assume it's not directly updatable via PUT without re-fetching logic
        return NextResponse.json({ success: false, error: 'Updating via metadata URL not fully implemented in this example' }, { status: 501 });
    }
    if (body.domains !== undefined) {
      // Validate new domains
      for (const domain of body.domains) {
        if (!is_valid_sso_domain(domain)) {
          return NextResponse.json({ success: false, error: `Domain "${domain}" is not a valid SSO domain.` }, { status: 400 });
        }
        // Check if domain is available, excluding the current provider
        if (!await is_domain_available(supabase, domain, organizationId, providerId)) {
          return NextResponse.json({ success: false, error: `Domain "${domain}" is already in use by another SSO provider in this organization.` }, { status: 409 });
        }
      }
      updateData.domains = body.domains;
    }
    if (body.attribute_mapping !== undefined) updateData.attribute_mapping = body.attribute_mapping;
    if (body.auto_provision !== undefined) updateData.auto_provision = body.auto_provision;
    if (body.default_role !== undefined) updateData.default_role = body.default_role;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Perform the update
    const { data, error } = await supabase
      .from('sso_providers')
      .update(updateData)
      .eq('id', providerId)
      .eq('organization_id', organizationId)
      .select(); // Added select to return updated data

    if (error) throw error;
    
    // Check if any row was updated
    if (!data || data.length === 0) {
        return NextResponse.json({ success: false, error: 'SSO provider not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: data[0] }); // Return the updated provider

  } catch (error: any) {
    console.error('Error updating SSO provider:', error);
    if (error.message.includes('Invalid XML format')) {
      return NextResponse.json({ success: false, error: 'Failed to parse SAML metadata XML.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update SSO provider' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; providerId: string }> }) {
  const { id: organizationId, providerId } = await params;
  const supabase = await createClient();

  try {
    // Ensure the logged-in user has permission to delete this provider.
    // Authorization check.

    const { error } = await supabase
      .from('sso_providers')
      .delete()
      .eq('id', providerId)
      .eq('organization_id', organizationId); // Ensure we only delete within the correct organization

    if (error) throw error;

    // Supabase delete returns no data on success, just checks for error.
    // We can infer success if no error was thrown.
    return NextResponse.json({ success: true, data: { message: 'SSO provider deleted successfully' } });

  } catch (error) {
    console.error('Error deleting SSO provider:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete SSO provider' }, { status: 500 });
  }
}

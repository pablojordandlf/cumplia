import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
// Assume helper functions for XML parsing and domain validation are available
// import { parseSamlMetadata } from '@/lib/sso/samlParser';
// import { is_valid_sso_domain, is_domain_available } from '@/lib/supabase/helpers';

// Mock XML parsing and domain validation for demonstration
const parseSamlMetadata = async (xml: string) => {
  // In a real scenario, this would parse the XML and extract entity_id, sso_url, certificate, etc.
  // For simplicity, we'll mock based on a common structure.
  const metadata = {
    entity_id: 'mock-entity-id',
    sso_url: 'https://mock-sso.com/entity/sso',
    certificate: '-----BEGIN CERTIFICATE-----\nMOCK_CERT\n-----END CERTIFICATE-----',
  };
  // Simulate potential errors during parsing
  if (xml.includes('invalid')) {
    throw new Error('Invalid XML format');
  }
  return metadata;
};

const is_valid_sso_domain = (domain: string): boolean => {
  // Disallow common public domains
  const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  return !publicDomains.includes(domain.toLowerCase());
};

const is_domain_available = async (supabase: any, domain: string, organizationId: string): Promise<boolean> => {
  // Check if the domain is already used by another provider in the same organization
  // For this example, we'll assume it's always available if it passes personal validation
  return true;
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const organizationId = params.id;
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('Error fetching SSO providers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch SSO providers' }, { status: 500 });
  }
}

interface SSProviderRequestBody {
  name: string;
  provider_type: 'saml' | 'oidc';
  metadata_xml?: string;
  metadata_url?: string;
  domains: string[];
  attribute_mapping?: object; // Example type
  auto_provision: boolean;
  default_role: string;
  is_active: boolean;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const organizationId = params.id;
  const supabase = createRouteHandlerClient({ cookies });
  const body: SSProviderRequestBody = await request.json();

  // Basic Validation
  if (!body.name || !body.provider_type || (!body.metadata_xml && !body.metadata_url) || !body.domains || body.domains.length === 0) {
    return NextResponse.json({ success: false, error: 'Missing required fields: name, provider_type, (metadata_xml or metadata_url), domains' }, { status: 400 });
  }

  try {
    let { entity_id, sso_url, certificate } = { entity_id: '', sso_url: '', certificate: '' };

    // Get SSO details
    if (body.metadata_xml) {
      const parsed = await parseSamlMetadata(body.metadata_xml);
      entity_id = parsed.entity_id;
      sso_url = parsed.sso_url;
      certificate = parsed.certificate;
    } else if (body.metadata_url) {
      // Fetch metadata from URL and parse
      // This would require a fetch call and then parsing
      // For simplicity, we'll skip fetching and parsing from URL here,
      // assuming XML is provided directly or handled in a separate step.
      return NextResponse.json({ success: false, error: 'Metadata URL fetching not implemented in this example' }, { status: 501 });
    }

    // Validate domains
    for (const domain of body.domains) {
      if (!is_valid_sso_domain(domain)) {
        return NextResponse.json({ success: false, error: `Domain "${domain}" is not a valid SSO domain.` }, { status: 400 });
      }
      // Check if domain is already available for this organization
      if (!await is_domain_available(supabase, domain, organizationId)) {
        return NextResponse.json({ success: false, error: `Domain "${domain}" is already in use by another SSO provider in this organization.` }, { status: 409 });
      }
    }
    
    // Ensure RLS is handled by Supabase policies for organization ownership.
    // The user making the request must have permissions to add SSO providers to this organization.

    const providerData = {
      organization_id: organizationId,
      name: body.name,
      provider_type: body.provider_type,
      metadata_xml: body.metadata_xml || null,
      metadata_url: body.metadata_url || null,
      entity_id: entity_id || null, // Might be different for OIDC (e.g., issuer URL)
      sso_url: sso_url || null,     // Might be different for OIDC (e.g., authorization endpoint)
      certificate: certificate || null, // Not typically used for OIDC
      domains: body.domains,
      attribute_mapping: body.attribute_mapping || {},
      auto_provision: body.auto_provision || false,
      default_role: body.default_role || 'member',
      is_active: body.is_active || false,
    };

    const { data, error } = await supabase
      .from('sso_providers')
      .insert([providerData]);

    if (error) throw error;

    return NextResponse.json({ success: true, data: { id: data?.[0]?.id, ...providerData } }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating SSO provider:', error);
    // More specific error handling for XML parsing, domain validation etc.
    if (error.message.includes('Invalid XML format')) {
      return NextResponse.json({ success: false, error: 'Failed to parse SAML metadata XML.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to create SSO provider' }, { status: 500 });
  }
}

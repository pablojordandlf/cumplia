import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Assume helper function `is_valid_sso_domain` is available
// import { is_valid_sso_domain } from '@/lib/supabase/helpers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ success: false, error: 'Domain parameter is required' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Check if the domain is valid and if an active SSO provider is configured for it.
    // This requires querying the 'sso_providers' table.
    // The 'domains' column is likely an array of strings.

    // Example query:
    // const { data: ssoProvider, error } = await supabase
    //   .from('sso_providers')
    //   .select('*')
    //   .eq('is_active', true)
    //   .contains('domains', [domain]) // Check if the domain is in the array
    //   .limit(1) // We only need one provider for the domain
    //   .maybeSingle();

    // Mocking the query result for demonstration
    let ssoProvider = null;
    if (domain === 'example.com') {
      ssoProvider = {
        id: 'provider-1',
        organization_id: 'org-1',
        name: 'ExampleCorp SSO',
        provider_type: 'saml',
        domains: ['example.com'],
        is_active: true,
      };
    } else if (domain === 'anothercorp.org') {
      ssoProvider = {
        id: 'provider-2',
        organization_id: 'org-2',
        name: 'AnotherCorp OIDC',
        provider_type: 'oidc',
        domains: ['anothercorp.org'],
        is_active: true,
      };
    }

    if (ssoProvider && ssoProvider.is_active) {
      // Optionally, you might want to check against a list of disallowed public domains
      // using a helper like `is_valid_sso_domain(domain)` if it's not handled by the provider query itself.
      // For this endpoint, we're strictly checking for *configured* SSO providers.

      return NextResponse.json({
        success: true,
        data: {
          hasSSO: true,
          providerInfo: {
            id: ssoProvider.id,
            name: ssoProvider.name,
            type: ssoProvider.provider_type,
          },
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          hasSSO: false,
        },
      });
    }
  } catch (error) {
    console.error('Error checking domain for SSO:', error);
    return NextResponse.json({ success: false, error: 'An error occurred while checking domain SSO status' }, { status: 500 });
  }
}

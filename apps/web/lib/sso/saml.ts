/**
 * SAML Utilities for SSO
 * Functions to parse and validate SAML metadata
 */

import { SAMLMetadata } from '@/types/sso';

/**
 * Parse SAML metadata XML to extract key information
 */
export function parseSAMLMetadata(xml: string): SAMLMetadata | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error('XML parsing error:', parseError.textContent);
      return null;
    }

    // Extract Entity ID
    const entityDescriptor = doc.querySelector('EntityDescriptor');
    const entityId = entityDescriptor?.getAttribute('entityID') || '';

    // Extract SingleSignOnService URL
    const ssoService = doc.querySelector('SingleSignOnService[Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"], SingleSignOnService[Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"]');
    const ssoUrl = ssoService?.getAttribute('Location') || '';

    // Extract X509 Certificate
    const certificateElement = doc.querySelector('X509Certificate');
    let certificate = certificateElement?.textContent || '';
    
    // Clean up certificate formatting
    certificate = certificate.replace(/\s+/g, '').trim();
    
    // Extract SingleLogoutService URL (optional)
    const logoutService = doc.querySelector('SingleLogoutService');
    const logoutUrl = logoutService?.getAttribute('Location') || undefined;

    if (!entityId || !ssoUrl || !certificate) {
      console.error('Missing required SAML metadata fields');
      return null;
    }

    return {
      entityId,
      ssoUrl,
      certificate,
      logoutUrl,
    };
  } catch (error) {
    console.error('Error parsing SAML metadata:', error);
    return null;
  }
}

/**
 * Validate SAML metadata XML structure
 */
export function validateSAMLMetadata(xml: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { valid: false, error: 'XML parsing failed. Please check the format.' };
    }

    // Check for required elements
    const entityDescriptor = doc.querySelector('EntityDescriptor');
    if (!entityDescriptor) {
      return { valid: false, error: 'Missing EntityDescriptor element' };
    }

    const entityId = entityDescriptor.getAttribute('entityID');
    if (!entityId) {
      return { valid: false, error: 'Missing entityID attribute' };
    }

    const ssoService = doc.querySelector('SingleSignOnService');
    if (!ssoService) {
      return { valid: false, error: 'Missing SingleSignOnService element' };
    }

    const certificate = doc.querySelector('X509Certificate');
    if (!certificate || !certificate.textContent?.trim()) {
      return { valid: false, error: 'Missing X509Certificate element' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid XML format' };
  }
}

/**
 * Generate Service Provider metadata for Supabase
 */
export function generateServiceProviderMetadata(
  spEntityId: string,
  acsUrl: string,
  sloUrl?: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${spEntityId}">
  <SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acsUrl}" index="0" isDefault="true"/>
    ${sloUrl ? `<SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${sloUrl}"/>` : ''}
  </SPSSODescriptor>
</EntityDescriptor>`;
}

/**
 * Format certificate for display
 */
export function formatCertificate(cert: string): string {
  // Remove existing formatting
  const cleanCert = cert.replace(/-----BEGIN CERTIFICATE-----/g, '')
                        .replace(/-----END CERTIFICATE-----/g, '')
                        .replace(/\s+/g, '');
  
  // Add line breaks every 64 characters
  const formatted = cleanCert.match(/.{1,64}/g)?.join('\n') || cleanCert;
  
  return `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----`;
}

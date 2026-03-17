/**
 * SSO Types for CumplIA
 * Defines TypeScript interfaces for SSO/SAML authentication
 */

export type SSOProviderType = 'saml' | 'oidc';

export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface SSOAttributeMapping {
  email?: string;
  first_name?: string;
  last_name?: string;
  groups?: string;
  [key: string]: string | undefined;
}

export interface SSOProvider {
  id: string;
  organization_id: string;
  name: string;
  provider_type: SSOProviderType;
  metadata_xml?: string;
  metadata_url?: string;
  entity_id?: string;
  sso_url?: string;
  certificate?: string;
  domains: string[];
  attribute_mapping: SSOAttributeMapping;
  auto_provision: boolean;
  default_role: MemberRole;
  is_active: boolean;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SSOSession {
  id: string;
  user_id: string;
  organization_id: string;
  provider_id: string;
  saml_request_id?: string;
  auth_state?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
  consumed_at?: string;
}

export interface SSOProviderFormData {
  name: string;
  provider_type: SSOProviderType;
  metadata_xml?: string;
  metadata_url?: string;
  domains: string[];
  attribute_mapping?: SSOAttributeMapping;
  auto_provision: boolean;
  default_role: MemberRole;
}

export interface SSODomainCheckResult {
  hasSSO: boolean;
  provider?: {
    id: string;
    name: string;
    organization_id: string;
  };
}

export interface SAMLMetadata {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  logoutUrl?: string;
}

export interface SSOLoginResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

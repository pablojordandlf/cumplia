/**
 * Domain utilities for SSO
 * Functions to extract and validate domains from emails
 */

// List of public email domains that should not be used for SSO
export const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'ymail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'aol.com',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'qq.com',
  '163.com',
  '126.com',
  'foxmail.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'hey.com',
  'fastmail.com',
];

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return null;
  
  return parts[1];
}

/**
 * Check if domain is a public email provider (not suitable for SSO)
 */
export function isPublicDomain(domain: string): boolean {
  if (!domain) return true;
  return PUBLIC_EMAIL_DOMAINS.includes(domain.toLowerCase().trim());
}

/**
 * Validate domain format
 */
export function validateDomainFormat(domain: string): { valid: boolean; error?: string } {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain is required' };
  }

  const trimmedDomain = domain.trim().toLowerCase();

  if (trimmedDomain.length === 0) {
    return { valid: false, error: 'Domain cannot be empty' };
  }

  // Basic domain validation regex
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
  
  if (!domainRegex.test(trimmedDomain)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  // Check for public domain
  if (isPublicDomain(trimmedDomain)) {
    return { valid: false, error: 'Public email domains cannot be used for SSO' };
  }

  return { valid: true };
}

/**
 * Parse comma-separated domain string into array
 */
export function parseDomains(domainsString: string): string[] {
  if (!domainsString) return [];
  
  return domainsString
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(d => d.length > 0);
}

/**
 * Format domains array for display
 */
export function formatDomains(domains: string[]): string {
  if (!domains || domains.length === 0) return '';
  return domains.join(', ');
}

/**
 * Check if email belongs to allowed domains
 */
export function emailMatchesDomains(email: string, domains: string[]): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;
  
  return domains.some(d => d.toLowerCase() === domain);
}

'use client';

import { useState, useCallback } from 'react';
import { SSOLoginResponse, SSODomainCheckResult } from '@/types/sso';

interface UseSSOReturn {
  isLoading: boolean;
  error: string | null;
  checkDomain: (email: string) => Promise<SSODomainCheckResult | null>;
  initiateSSO: (email: string) => Promise<SSOLoginResponse>;
  handleSSOCallback: (params: URLSearchParams) => Promise<SSOLoginResponse>;
}

export function useSSO(): UseSSOReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if email domain has SSO configured
   */
  const checkDomain = useCallback(async (email: string): Promise<SSODomainCheckResult | null> => {
    if (!email || !email.includes('@')) return null;

    try {
      const domain = email.split('@')[1];
      const response = await fetch(`/api/v1/auth/check-domain?domain=${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check domain');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error checking domain:', err);
      return null;
    }
  }, []);

  /**
   * Initiate SSO login flow
   */
  const initiateSSO = useCallback(async (email: string): Promise<SSOLoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/sso/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to initiate SSO';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // If there's a redirect URL, navigate to it
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return { success: true, redirectUrl: data.redirectUrl };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SSO initiation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle SSO callback from identity provider
   */
  const handleSSOCallback = useCallback(async (params: URLSearchParams): Promise<SSOLoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/sso/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: params.get('code'),
          state: params.get('state'),
          SAMLResponse: params.get('SAMLResponse'),
          RelayState: params.get('RelayState'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'SSO authentication failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SSO callback failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    checkDomain,
    initiateSSO,
    handleSSOCallback,
  };
}

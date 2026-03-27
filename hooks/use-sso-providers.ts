'use client';

import { useState, useCallback } from 'react';
import { SSOProvider, SSOProviderFormData, SAMLMetadata } from '@/types/sso';
import { parseSAMLMetadata } from '@/lib/sso/saml';

interface UseSSOProvidersReturn {
  providers: SSOProvider[];
  isLoading: boolean;
  error: string | null;
  getProviders: (organizationId: string) => Promise<void>;
  createProvider: (organizationId: string, data: SSOProviderFormData) => Promise<SSOProvider | null>;
  updateProvider: (organizationId: string, providerId: string, data: Partial<SSOProviderFormData>) => Promise<SSOProvider | null>;
  deleteProvider: (organizationId: string, providerId: string) => Promise<boolean>;
  parseMetadata: (xml: string) => SAMLMetadata | null;
}

export function useSSOProviders(): UseSSOProvidersReturn {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch SSO providers for an organization
   */
  const getProviders = useCallback(async (organizationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/sso-providers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SSO providers');
      }

      const data = await response.json();
      setProviders(data.providers || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch providers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new SSO provider
   */
  const createProvider = useCallback(async (
    organizationId: string,
    data: SSOProviderFormData
  ): Promise<SSOProvider | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/sso-providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create provider');
      }

      // Update local state
      setProviders(prev => [...prev, result.provider]);
      return result.provider;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create provider';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing SSO provider
   */
  const updateProvider = useCallback(async (
    organizationId: string,
    providerId: string,
    data: Partial<SSOProviderFormData>
  ): Promise<SSOProvider | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/sso-providers/${providerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update provider');
      }

      // Update local state
      setProviders(prev => prev.map(p => p.id === providerId ? result.provider : p));
      return result.provider;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update provider';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete an SSO provider
   */
  const deleteProvider = useCallback(async (
    organizationId: string,
    providerId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/sso-providers/${providerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete provider');
      }

      // Update local state
      setProviders(prev => prev.filter(p => p.id !== providerId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete provider';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Parse SAML metadata XML
   */
  const parseMetadata = useCallback((xml: string): SAMLMetadata | null => {
    return parseSAMLMetadata(xml);
  }, []);

  return {
    providers,
    isLoading,
    error,
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    parseMetadata,
  };
}

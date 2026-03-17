'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  Organization,
  Member,
  OrganizationLimits,
  OrganizationUsage,
  PLAN_LIMITS,
} from '@/types/organization';

interface OrganizationContextType {
  organization: Organization | null;
  members: Member[];
  usage: OrganizationUsage | null;
  limits: OrganizationLimits | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  members: [],
  usage: null,
  limits: null,
  isLoading: true,
  error: null,
  refresh: async () => {},
});

export const useOrganization = () => useContext(OrganizationContext);

// Hook for simple usage without provider
export function useOrganizationSimple(organizationId?: string) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [usage, setUsage] = useState<OrganizationUsage | null>(null);
  const [limits, setLimits] = useState<OrganizationLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch organization
      const orgRes = await fetch(`/api/v1/organizations/${organizationId}`);
      if (!orgRes.ok) throw new Error('Error al cargar organización');
      const orgData: Organization = await orgRes.json();
      setOrganization(orgData);

      // Fetch members
      const membersRes = await fetch(`/api/v1/organizations/${organizationId}/members`);
      if (!membersRes.ok) throw new Error('Error al cargar miembros');
      const membersData: Member[] = await membersRes.json();
      setMembers(membersData);

      // Fetch usage
      const usageRes = await fetch(`/api/v1/organizations/${organizationId}/usage`);
      if (!usageRes.ok) throw new Error('Error al cargar uso');
      const usageData: OrganizationUsage = await usageRes.json();
      setUsage(usageData);

      // Set limits from plan
      setLimits(PLAN_LIMITS[orgData.plan]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    organization,
    members,
    usage,
    limits,
    loading,
    error,
    refresh: fetchData,
  };
}

interface OrganizationProviderProps {
  children: React.ReactNode;
  organizationId?: string;
}

export function OrganizationProvider({ children, organizationId }: OrganizationProviderProps) {
  const { organization, members, usage, limits, loading, error, refresh } =
    useOrganizationSimple(organizationId);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        members,
        usage,
        limits,
        isLoading: loading,
        error,
        refresh,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

'use client';

import * as React from 'react';
import type { Organization, Member, OrganizationLimits, OrganizationUsage } from '@/types/organization';
import { PLAN_LIMITS } from '@/types/organization';

interface OrganizationContextType {
  organization: Organization | null;
  members: Member[];
  usage: OrganizationUsage | null;
  limits: OrganizationLimits | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const OrganizationContext = React.createContext<OrganizationContextType>({
  organization: null,
  members: [],
  usage: null,
  limits: null,
  isLoading: true,
  error: null,
  refresh: async () => {},
});

export { OrganizationContext };

export const useOrganization = () => React.useContext(OrganizationContext);

// Hook for simple usage without provider
export function useOrganizationSimple(organizationId?: string) {
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [usage, setUsage] = React.useState<OrganizationUsage | null>(null);
  const [limits, setLimits] = React.useState<OrganizationLimits | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orgRes = await fetch(`/api/v1/organizations/${organizationId}`);
      if (!orgRes.ok) throw new Error('Error al cargar organización');
      const orgData: Organization = await orgRes.json();
      setOrganization(orgData);

      const membersRes = await fetch(`/api/v1/organizations/${organizationId}/members`);
      if (!membersRes.ok) throw new Error('Error al cargar miembros');
      const membersData: Member[] = await membersRes.json();
      setMembers(membersData);

      const usageRes = await fetch(`/api/v1/organizations/${organizationId}/usage`);
      if (!usageRes.ok) throw new Error('Error al cargar uso');
      const usageData: OrganizationUsage = await usageRes.json();
      setUsage(usageData);

      setLimits(PLAN_LIMITS[orgData.plan]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  React.useEffect(() => {
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
  const orgData = useOrganizationSimple(organizationId);

  const value = {
    organization: orgData.organization,
    members: orgData.members,
    usage: orgData.usage,
    limits: orgData.limits,
    isLoading: orgData.loading,
    error: orgData.error,
    refresh: orgData.refresh,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

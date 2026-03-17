
// hooks/use-organization.ts

import { useState, useEffect, createContext, useContext } from 'react';
import { Organization, OrganizationUsageStats } from '@/types/organization'; // Assuming these types are defined
import { Role } from '@/types/roles';

// Placeholder for actual organization and usage data types
// interface Organization {
//   id: string;
//   name: string;
//   slug: string;
//   plan: 'starter' | 'professional' | 'business' | 'enterprise';
//   owner_id: string;
//   seats_total: number;
//   seats_used: number;
//   // ... other properties
// }

// interface OrganizationUsageStats {
//   ai_systems_count: number;
//   users_count: number;
//   documents_monthly_count: number;
// }

// Define the context type
interface OrganizationContextType {
  organization: Organization | null;
  members: any[]; // Replace 'any[]' with actual member type
  usage: OrganizationUsageStats | null;
  limits: any | null; // Replace 'any' with actual limits type
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default value
const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  members: [],
  usage: null,
  limits: null,
  isLoading: true,
  error: null,
});

// Custom hook to provide the organization context
export const useOrganization = () => useContext(OrganizationContext);

// Provider component to fetch and manage organization data
export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [usage, setUsage] = useState<OrganizationUsageStats | null>(null);
  const [limits, setLimits] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for fetching current organization ID (e.g., from auth context or URL params)
  const currentOrganizationId = 'current-org-id'; // Replace with actual logic to get org ID

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, you would fetch organization details, members, usage, and limits from your API
        // Example using placeholders (replace with actual API calls):
        
        // 1. Fetch Organization Details
        const orgResponse = await fetch(`/api/v1/organizations/${currentOrganizationId}`);
        if (!orgResponse.ok) throw new Error('Failed to fetch organization');
        const orgData: Organization = await orgResponse.json();
        setOrganization(orgData);

        // 2. Fetch Organization Members
        const membersResponse = await fetch(`/api/v1/organizations/${currentOrganizationId}/members`);
        if (!membersResponse.ok) throw new Error('Failed to fetch members');
        const membersData = await membersResponse.json();
        setMembers(membersData);

        // 3. Fetch Usage Stats
        const usageResponse = await fetch(`/api/v1/organizations/${currentOrganizationId}/usage`);
        if (!usageResponse.ok) throw new Error('Failed to fetch usage stats');
        const usageData: OrganizationUsageStats = await usageResponse.json();
        setUsage(usageData);

        // 4. Fetch Plan Limits (this might be static or fetched)
        // Assuming limits are derived from organization.plan and PLAN_LIMITS constant,
        // or fetched if they are dynamic per organization.
        // For now, we'll set it based on the organization's plan.
        // const limitsResponse = await fetch(`/api/v1/organizations/${currentOrganizationId}/limits`);
        // if (!limitsResponse.ok) throw new Error('Failed to fetch limits');
        // const limitsData = await limitsResponse.json();
        // setLimits(limitsData);
        // For simplicity, let's mock limits based on organization plan
        const mockLimits = PLAN_LIMITS[orgData.plan]; // Assuming PLAN_LIMITS is imported or globally available
        setLimits(mockLimits);

      } catch (err: any) {
        console.error('Error fetching organization data:', err);
        setError(err.message || 'Failed to load organization data.');
        setOrganization(null);
        setMembers([]);
        setUsage(null);
        setLimits(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentOrganizationId) {
      fetchOrganizationData();
    } else {
      // If no organization selected/available, reset state
      setOrganization(null);
      setMembers([]);
      setUsage(null);
      setLimits(null);
      setIsLoading(false);
    }
  }, [currentOrganizationId]); // Re-fetch if currentOrganizationId changes

  const contextValue: OrganizationContextType = {
    organization,
    members,
    usage,
    limits,
    isLoading,
    error,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
};


// lib/usage-limits.ts

import { Plan } from '@/types/plans'; // Assuming Plan type exists

interface PlanLimits {
  max_ai_systems: number;
  max_users: number;
  max_documents_monthly: number;
  features: string[];
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  starter: {
    max_ai_systems: 1,
    max_users: 1, // Only owner
    max_documents_monthly: 0,
    features: ['basic_compliance', 'risk_classification']
  },
  professional: {
    max_ai_systems: 15,
    max_users: 3,
    max_documents_monthly: -1, // unlimited
    features: ['full_fria', 'risk_management', 'evidence_registry', 'document_export']
  },
  business: {
    max_ai_systems: -1, // unlimited
    max_users: 10,
    max_documents_monthly: -1,
    features: ['ai_assistant', 'advanced_risk_management', 'evidence_registry', 'custom_templates', 'multi_department']
  },
  enterprise: {
    max_ai_systems: -1,
    max_users: -1,
    max_documents_monthly: -1,
    features: ['all', 'sso', 'sla', 'dedicated_manager']
  }
};

// Mock interfaces for organization data, replace with actual types defined elsewhere
interface OrganizationUsage {
  ai_systems_count: number;
  users_count: number;
  documents_monthly_count: number;
}

interface Organization {
  id: string;
  plan: Plan;
  seats_total: number;
  // ... other organization properties
}

// Placeholder for fetching organization data - replace with actual API call or hook
const fetchOrganizationData = async (organizationId: string): Promise<{ organization: Organization | null, usage: OrganizationUsage | null }> => {
  // This is a mock function. In a real app, you would fetch this from your backend.
  console.warn('fetchOrganizationData is a mock function. Replace with actual implementation.');
  // Simulate fetching data
  const mockOrg: Organization = {
    id: organizationId,
    plan: 'professional', // default to professional for mock
    seats_total: 5,
  };
  const mockUsage: OrganizationUsage = {
    ai_systems_count: 10,
    users_count: 3,
    documents_monthly_count: 50,
  };
  return { organization: mockOrg, usage: mockUsage };
};

// Check if organization can create a new AI system
export const checkAILimit = async (organizationId: string): Promise<boolean> => {
  const { organization, usage } = await fetchOrganizationData(organizationId);
  if (!organization || !usage) return false; // Cannot check if data is missing

  const limits = PLAN_LIMITS[organization.plan];
  // -1 indicates unlimited
  if (limits.max_ai_systems === -1) return true;

  return usage.ai_systems_count < limits.max_ai_systems;
};

// Check if organization can invite a new user
export const checkUserLimit = async (organizationId: string): Promise<boolean> => {
  const { organization, usage } = await fetchOrganizationData(organizationId);
  if (!organization || !usage) return false; // Cannot check if data is missing

  // Check against total seats purchased, if seats_total is not -1 (unlimited)
  if (organization.seats_total === -1) return true; // Unlimited seats

  return usage.users_count < organization.seats_total;
};

// Get current usage statistics for an organization
export const getUsageStats = async (organizationId: string): Promise<OrganizationUsage | null> => {
  const { usage } = await fetchOrganizationData(organizationId);
  return usage;
};

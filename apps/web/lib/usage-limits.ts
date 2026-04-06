import { OrganizationPlan } from '@/types/organization';

interface PlanLimits {
  max_ai_systems: number;
  max_users: number;
  max_documents_monthly: number;
  features: string[];
}

// Plan limits - April 2026
// Evalúa (starter), Cumple (professional), Protege (business), Lidera (enterprise)
export const PLAN_LIMITS: Record<OrganizationPlan, PlanLimits> = {
  starter: {
    max_ai_systems: 3,
    max_users: 1,
    max_documents_monthly: 0,
    features: ['basic_compliance', 'risk_classification']
  },
  professional: {
    max_ai_systems: 15,
    max_users: 3,
    max_documents_monthly: -1,
    features: ['full_fria', 'risk_management', 'evidence_registry', 'document_export', 'ai_assistant']
  },
  business: {
    max_ai_systems: 50,
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

// Organization usage interface
interface OrganizationUsage {
  ai_systems_count: number;
  users_count: number;
  documents_monthly_count: number;
}

interface Organization {
  id: string;
  plan: OrganizationPlan;
  seats_total: number;
}

// Check if organization can create a new AI system
export const checkAILimit = async (organizationId: string): Promise<boolean> => {
  // Use the API to check limit
  try {
    const response = await fetch(`/api/v1/organizations/${organizationId}/limits`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.canCreateAISystem;
  } catch {
    return false;
  }
};

// Check if organization can invite a new user
export const checkUserLimit = async (organizationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/v1/organizations/${organizationId}/limits`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.canInviteUser;
  } catch {
    return false;
  }
};

// Get current usage statistics for an organization
export const getUsageStats = async (organizationId: string): Promise<OrganizationUsage | null> => {
  try {
    const response = await fetch(`/api/v1/organizations/${organizationId}/usage`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.usage;
  } catch {
    return null;
  }
};

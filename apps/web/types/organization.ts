export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type MemberStatus = 'active' | 'pending' | 'invited';
export type OrganizationPlan = 'starter' | 'professional' | 'business' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: OrganizationPlan;
  seatsTotal: number;
  seatsUsed: number;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Contexto del usuario actual
  currentUserRole?: MemberRole;
}

export interface Member {
  id: string;
  organizationId: string;
  userId?: string | null;
  email: string;
  name?: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy?: string;
  inviteToken?: string;
  inviteExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationLimits {
  maxAiSystems: number;
  maxUsers: number;
  maxDocumentsMonthly: number;
  features: string[];
}

export interface OrganizationUsage {
  aiSystems: number;
  users: number;
  documentsThisMonth: number;
}

export interface InvitePayload {
  email: string;
  role: MemberRole;
}

export interface UpdateRolePayload {
  role: MemberRole;
}

// Plan limits configuration
export const PLAN_LIMITS: Record<OrganizationPlan, OrganizationLimits> = {
  starter: {
    maxAiSystems: 1,
    maxUsers: 1,
    maxDocumentsMonthly: 0,
    features: ['basic_compliance', 'risk_classification'],
  },
  professional: {
    maxAiSystems: 15,
    maxUsers: 3,
    maxDocumentsMonthly: -1,
    features: [
      'full_fria',
      'risk_management',
      'evidence_registry',
      'document_export',
    ],
  },
  business: {
    maxAiSystems: -1,
    maxUsers: 10,
    maxDocumentsMonthly: -1,
    features: [
      'ai_assistant',
      'advanced_risk_management',
      'evidence_registry',
      'custom_templates',
      'multi_department',
    ],
  },
  enterprise: {
    maxAiSystems: -1,
    maxUsers: -1,
    maxDocumentsMonthly: -1,
    features: [
      'all',
      'sso',
      'sla',
      'dedicated_manager',
    ],
  },
};

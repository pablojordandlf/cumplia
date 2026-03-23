export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

// Aligned with database member_status ENUM: ('active', 'invited', 'suspended', 'removed')
export type MemberStatus = 'active' | 'invited' | 'suspended' | 'removed';

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

// Updated Member interface - removed invitation fields (moved to pending_invitations table)
export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  name?: string;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

// New PendingInvitation interface - matches pending_invitations table schema
export interface PendingInvitation {
  id: string;
  organizationId: string;
  invitedBy: string;
  email: string;
  name?: string;
  role: MemberRole;
  inviteToken: string;
  inviteExpiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
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
  name?: string;
}

export interface UpdateRolePayload {
  role: MemberRole;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: ['*'], // All permissions
  admin: ['*'], // All permissions except delete organization
  editor: [
    'ai_systems:read',
    'ai_systems:create',
    'ai_systems:update',
    'ai_systems:delete',
    'risks:read',
    'risks:analyze',
    'obligations:read',
    'obligations:manage',
    'evidences:read',
    'evidences:create',
    'members:read',
  ],
  viewer: [
    'ai_systems:read',
    'risks:read',
    'obligations:read',
    'evidences:read',
    'reports:read',
  ],
};

// Helper function to check if a role has a specific permission
export function hasPermission(role: MemberRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
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

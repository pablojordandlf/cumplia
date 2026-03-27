import { MemberRole } from '@/types/organization';

// Re-export MemberRole for convenience
export type { MemberRole };

// Permission definitions
export type Permission = 
  | 'ai_systems:read'
  | 'ai_systems:create'
  | 'ai_systems:update'
  | 'ai_systems:delete'
  | 'risks:read'
  | 'risks:analyze'
  | 'obligations:read'
  | 'obligations:manage'
  | 'evidences:read'
  | 'evidences:create'
  | 'evidences:delete'
  | 'members:read'
  | 'members:invite'
  | 'members:remove'
  | 'members:update_role'
  | 'organization:read'
  | 'organization:update'
  | 'organization:delete'
  | 'templates:manage'
  | 'reports:read'
  | 'reports:generate';

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  owner: [
    'ai_systems:read', 'ai_systems:create', 'ai_systems:update', 'ai_systems:delete',
    'risks:read', 'risks:analyze',
    'obligations:read', 'obligations:manage',
    'evidences:read', 'evidences:create', 'evidences:delete',
    'members:read', 'members:invite', 'members:remove', 'members:update_role',
    'organization:read', 'organization:update',
    'templates:manage',
    'reports:read', 'reports:generate',
  ],
  admin: [
    'ai_systems:read', 'ai_systems:create', 'ai_systems:update', 'ai_systems:delete',
    'risks:read', 'risks:analyze',
    'obligations:read', 'obligations:manage',
    'evidences:read', 'evidences:create', 'evidences:delete',
    'members:read', 'members:invite', 'members:remove', 'members:update_role',
    'organization:read', 'organization:update',
    'templates:manage',
    'reports:read', 'reports:generate',
  ],
  editor: [
    'ai_systems:read', 'ai_systems:create', 'ai_systems:update', 'ai_systems:delete',
    'risks:read', 'risks:analyze',
    'obligations:read', 'obligations:manage',
    'evidences:read', 'evidences:create',
    'members:read',
    'organization:read',
    'reports:read', 'reports:generate',
  ],
  viewer: [
    'ai_systems:read',
    'risks:read',
    'obligations:read',
    'evidences:read',
    'organization:read',
    'reports:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: MemberRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: MemberRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: MemberRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: MemberRole): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

/**
 * Check if user can manage members (invite, remove, update roles)
 */
export function canManageMembers(role: MemberRole): boolean {
  return hasPermission(role, 'members:invite');
}

/**
 * Check if user can edit AI systems
 */
export function canEditSystems(role: MemberRole): boolean {
  return hasPermission(role, 'ai_systems:update');
}

/**
 * Check if user can create AI systems
 */
export function canCreateSystems(role: MemberRole): boolean {
  return hasPermission(role, 'ai_systems:create');
}

/**
 * Check if user can analyze risks
 */
export function canAnalyzeRisks(role: MemberRole): boolean {
  return hasPermission(role, 'risks:analyze');
}

/**
 * Check if user can manage evidences (upload/delete)
 */
export function canManageEvidences(role: MemberRole): boolean {
  return hasPermission(role, 'evidences:create');
}

/**
 * Check if user is read-only (viewer)
 */
export function isReadOnly(role: MemberRole): boolean {
  return role === 'viewer';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: MemberRole): string {
  const names: Record<MemberRole, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Visualizador',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: MemberRole): string {
  const descriptions: Record<MemberRole, string> = {
    owner: 'Control total de la organización y sus miembros',
    admin: 'Puede gestionar miembros, configuración y todos los recursos',
    editor: 'Puede crear, editar y gestionar sistemas de IA y sus riesgos',
    viewer: 'Solo puede visualizar información, sin permisos de edición',
  };
  return descriptions[role];
}

/**
 * Get available roles that a user can assign based on their role
 */
export function getAssignableRoles(userRole: MemberRole): MemberRole[] {
  const hierarchy: Record<MemberRole, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  };

  const userLevel = hierarchy[userRole];
  
  return (Object.keys(hierarchy) as MemberRole[]).filter(
    role => hierarchy[role] <= userLevel
  );
}

/**
 * Check if a user can assign a specific role
 */
export function canAssignRole(userRole: MemberRole, targetRole: MemberRole): boolean {
  const assignable = getAssignableRoles(userRole);
  return assignable.includes(targetRole);
}

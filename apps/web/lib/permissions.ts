import { MemberRole } from '@/types/organization';

// Permission actions available in the system
export type Permission =
  | 'read:organization'
  | 'update:organization'
  | 'delete:organization'
  | 'read:members'
  | 'invite:member'
  | 'update:member:role'
  | 'delete:member'
  | 'read:ai_systems'
  | 'create:ai_system'
  | 'update:ai_system'
  | 'delete:ai_system'
  | 'read:risks'
  | 'create:risk'
  | 'update:risk'
  | 'read:documents'
  | 'generate:document'
  | 'read:reports'
  | 'export:reports';

// Define the permissions matrix as described in the design doc
const PERMISSIONS: Record<MemberRole, Record<Permission, boolean>> = {
  'owner': {
    'read:organization': true,
    'update:organization': true,
    'delete:organization': true,
    'read:members': true,
    'invite:member': true,
    'update:member:role': true,
    'delete:member': true,
    'read:ai_systems': true,
    'create:ai_system': true,
    'update:ai_system': true,
    'delete:ai_system': true,
    'read:risks': true,
    'create:risk': true,
    'update:risk': true,
    'read:documents': true,
    'generate:document': true,
    'read:reports': true,
    'export:reports': true,
  },
  'admin': {
    'read:organization': true,
    'update:organization': true,
    'delete:organization': false,
    'read:members': true,
    'invite:member': true,
    'update:member:role': true,
    'delete:member': true,
    'read:ai_systems': true,
    'create:ai_system': true,
    'update:ai_system': true,
    'delete:ai_system': true,
    'read:risks': true,
    'create:risk': true,
    'update:risk': true,
    'read:documents': true,
    'generate:document': true,
    'read:reports': true,
    'export:reports': true,
  },
  'editor': {
    'read:organization': false,
    'update:organization': false,
    'delete:organization': false,
    'read:members': true,
    'invite:member': false,
    'update:member:role': false,
    'delete:member': false,
    'read:ai_systems': true,
    'create:ai_system': true,
    'update:ai_system': true,
    'delete:ai_system': false,
    'read:risks': true,
    'create:risk': true,
    'update:risk': true,
    'read:documents': true,
    'generate:document': false,
    'read:reports': true,
    'export:reports': false,
  },
  'viewer': {
    'read:organization': false,
    'update:organization': false,
    'delete:organization': false,
    'read:members': true,
    'invite:member': false,
    'update:member:role': false,
    'delete:member': false,
    'read:ai_systems': true,
    'create:ai_system': false,
    'update:ai_system': false,
    'delete:ai_system': false,
    'read:risks': true,
    'create:risk': false,
    'update:risk': false,
    'read:documents': true,
    'generate:document': false,
    'read:reports': true,
    'export:reports': false,
  },
};

// Helper to check if a user has a specific permission within an organization context
export const hasPermission = (
  role: MemberRole | null | undefined,
  action: Permission
): boolean => {
  if (!role) return false;
  return PERMISSIONS[role]?.[action] || false;
};

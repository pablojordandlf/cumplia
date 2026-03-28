import { SupabaseClient } from '@supabase/supabase-js';
import { hasPermission, Permission } from '@/lib/permissions';
import { MemberRole } from '@/types/organization';

/**
 * Fetches the current user's role in their active organization.
 * Returns null if the user has no active membership.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberRole | null> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.role as MemberRole;
}

/**
 * Fetches the current user's role within a specific organization.
 */
export async function getUserRoleInOrg(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<MemberRole | null> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single();

  if (error || !data) return null;
  return data.role as MemberRole;
}

/**
 * Checks whether the current user has the given permission in their org.
 * Returns { allowed: true } or { allowed: false, status: 403 }.
 */
export async function requirePermission(
  supabase: SupabaseClient,
  userId: string,
  permission: Permission
): Promise<{ allowed: true; role: MemberRole } | { allowed: false; status: 403 }> {
  const role = await getUserRole(supabase, userId);
  if (!role || !hasPermission(role, permission)) {
    return { allowed: false, status: 403 };
  }
  return { allowed: true, role };
}

import { createClient } from '@/lib/supabase/server';
import { MemberRole } from '@/types/organization';

export async function getCurrentContext(request: Request): Promise<{
  user: { id: string; email?: string } | null;
  organizationId: string | null;
  role: MemberRole | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get organization ID from header or query param
  const organizationId = request.headers.get('X-Organization-Id') || 
    new URL(request.url).searchParams.get('organizationId');

  let role: MemberRole | null = null;

  if (user && organizationId) {
    // Fetch the user's role in this organization
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (member) {
      role = member.role as MemberRole;
    }
  }

  return {
    user: user ? { id: user.id, email: user.email || undefined } : null,
    organizationId,
    role,
  };
}

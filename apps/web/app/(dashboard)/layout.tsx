'use client';

import { AdminLayout } from "./layouts/AdminLayout";
import { ComplianceLayout } from "./layouts/ComplianceLayout";
import { AuditorLayout } from "./layouts/AuditorLayout";
import { ViewerLayout } from "./layouts/ViewerLayout";
import { useAuthReady, fetchUserOrganization } from "@/lib/auth-helpers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationContext } from "@/hooks/use-organization";
import type { MemberRole } from "@/types/organization";
import { FloatingChat } from "@/components/floating-chat";
import { SidebarProvider } from "@/contexts/sidebar-context";

export const dynamic = 'force-dynamic';

type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isReady } = useAuthReady();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('');
  const [orgPlan, setOrgPlan] = useState<string>('starter');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) { router.push('/login'); return; }

    const loadUserRole = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        if (error || !data) {
          console.error('Failed to fetch user organization:', error);
          setUserRole('viewer');
          setIsLoading(false);
          return;
        }
        setUserRole((data.role as UserRole) || 'viewer');
        setOrgId(data.organizationId);
        setOrgName(data.organization?.name ?? '');
        setOrgPlan(data.organization?.plan_name ?? 'starter');
      } catch (err) {
        console.error('Error loading user role:', err);
        setUserRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserRole();
  }, [isReady, user, router]);

  if (isLoading || !userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Provide OrganizationContext so usePermissions() works across all dashboard pages
  const orgContextValue = {
    organization: orgId ? {
      id: orgId,
      name: orgName,
      slug: '',
      ownerId: '',
      plan: orgPlan as any,
      seatsTotal: 0,
      seatsUsed: 0,
      createdAt: '',
      updatedAt: '',
      currentUserRole: userRole as MemberRole,
    } : null,
    members: [],
    usage: null,
    limits: null,
    isLoading: false,
    error: null,
    refresh: async () => {},
  };

  // Map owner/editor to the layout system
  const layoutRole = userRole === 'owner' || userRole === 'admin' ? 'admin' : userRole;

  const LayoutComponent = layoutRole === 'admin' ? AdminLayout
    : layoutRole === 'editor' ? ComplianceLayout
    : ViewerLayout;

  return (
    <SidebarProvider>
      <OrganizationContext.Provider value={orgContextValue}>
        <LayoutComponent>{children}</LayoutComponent>
        <FloatingChat />
      </OrganizationContext.Provider>
    </SidebarProvider>
  );
}

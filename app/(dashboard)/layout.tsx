'use client';

import type { Metadata } from "next";
import { DashboardSidebar, MobileBottomNav } from "@/components/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { AdminLayout } from "./layouts/AdminLayout";
import { ComplianceLayout } from "./layouts/ComplianceLayout";
import { AuditorLayout } from "./layouts/AuditorLayout";
import { ViewerLayout } from "./layouts/ViewerLayout";
import { useAuthReady, fetchUserOrganization } from "@/lib/auth-helpers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

// Role type definition
type UserRole = 'admin' | 'compliance_officer' | 'auditor' | 'viewer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout - Main layout wrapper with role-based routing
 * 
 * Routes to different layouts based on user role:
 * - admin → AdminLayout (full featured)
 * - compliance_officer → ComplianceLayout (risk-focused)
 * - auditor → AuditorLayout (report-focused)
 * - viewer → ViewerLayout (minimal, read-only)
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isReady } = useAuthReady();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isReady || !user) {
      setIsLoading(false);
      return;
    }

    const loadUserRole = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        
        if (error || !data) {
          console.error('Failed to fetch user organization:', error);
          setUserRole('viewer'); // Default to viewer on error
          setIsLoading(false);
          return;
        }

        const role = (data.role as UserRole) || 'viewer';
        setUserRole(role);
      } catch (err) {
        console.error('Error loading user role:', err);
        setUserRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, [isReady, user]);

  if (isLoading || !userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Route based on role
  switch (userRole) {
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;
    case 'compliance_officer':
      return <ComplianceLayout>{children}</ComplianceLayout>;
    case 'auditor':
      return <AuditorLayout>{children}</AuditorLayout>;
    case 'viewer':
      return <ViewerLayout>{children}</ViewerLayout>;
    default:
      return <ViewerLayout>{children}</ViewerLayout>;
  }
}

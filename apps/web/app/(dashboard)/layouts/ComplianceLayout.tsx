import { ReactNode } from "react";
import { DashboardSidebar, MobileBottomNav } from "@/components/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";

interface ComplianceLayoutProps {
  children: ReactNode;
}

/**
 * ComplianceLayout - Risk-focused sidebar
 * - Risk Dashboard (primary)
 * - Assessments
 * - Reports
 * - Audit Trail
 */
export function ComplianceLayout({ children }: ComplianceLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <DashboardNavbar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 pt-16 lg:pt-16 lg:pl-64 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}

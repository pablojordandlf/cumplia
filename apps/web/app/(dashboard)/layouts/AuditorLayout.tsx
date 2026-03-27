import { ReactNode } from "react";
import { DashboardSidebar, MobileBottomNav } from "@/components/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";

interface AuditorLayoutProps {
  children: ReactNode;
}

/**
 * AuditorLayout - Report-focused sidebar
 * - Report Reader (primary)
 * - Evidence
 * - Audit Trail
 * - (Read-only access to assessments)
 */
export function AuditorLayout({ children }: AuditorLayoutProps) {
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

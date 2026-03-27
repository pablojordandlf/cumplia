import { ReactNode } from "react";
import { DashboardNavbar } from "@/components/dashboard-navbar";

interface ViewerLayoutProps {
  children: ReactNode;
}

/**
 * ViewerLayout - Minimal sidebar (Dashboard only, read-only)
 * - Risk Summary Dashboard
 * - No navigation to other modules
 * - Read-only badge displayed
 */
export function ViewerLayout({ children }: ViewerLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      {/* No sidebar for viewer role */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 pt-16 pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}

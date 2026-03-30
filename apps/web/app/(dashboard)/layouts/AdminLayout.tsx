import { ReactNode } from "react";
import { DashboardSidebar, MobileBottomNav } from "@/components/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * AdminLayout - Full featured sidebar + all options
 * - Dashboard
 * - Sistemas de IA
 * - Formación
 * - Templates (Admin only)
 * - Configuración
 * - User Management
 * - Custom Fields
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900 pt-16 lg:pt-16 lg:pl-64 pb-16 lg:pb-0 min-h-screen">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

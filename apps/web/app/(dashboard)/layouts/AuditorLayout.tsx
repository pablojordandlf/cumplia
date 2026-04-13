import { type ReactNode } from "react";
import { DashboardSidebar, MobileBottomNav } from "@/components/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { MainContent } from "@/components/ui/main-content";

interface AuditorLayoutProps {
  children: ReactNode;
}

export function AuditorLayout({ children }: AuditorLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <MainContent>{children}</MainContent>
      </div>
      <MobileBottomNav />
    </div>
  );
}

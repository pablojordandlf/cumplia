import type { Metadata } from "next";
import { DashboardSidebar, MobileBottomNav } from "@/components/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <DashboardNavbar />
      {/* 
        Main content area:
        - pt-16 on mobile: space for fixed header
        - lg:pt-16 on desktop: space for navbar
        - lg:pl-64 on desktop: space for fixed sidebar
        - pb-16 on mobile: space for bottom nav
      */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 pt-16 lg:pt-16 lg:pl-64 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}

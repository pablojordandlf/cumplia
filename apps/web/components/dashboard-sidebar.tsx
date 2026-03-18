"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings,
  GraduationCap,
  Settings2,
  Shield,
  LogOut,
  Menu,
  X
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sistemas de IA",
    href: "/dashboard/inventory",
    icon: FolderKanban,
  },
  {
    title: "Formación",
    href: "/dashboard/guia",
    icon: GraduationCap,
  },
  {
    title: "Templates",
    href: "/dashboard/admin",
    icon: Settings2,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function SidebarContent({ 
  pathname, 
  onNavigate,
  isMobile = false 
}: { 
  pathname: string | null; 
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col h-full", isMobile ? "bg-white" : "bg-white border-r")}>
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2" onClick={onNavigate}>
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">CumplIA</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="px-4 py-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Dashboard solo activo en ruta exacta, otros items activos en subrutas también
            const isActive = item.href === '/dashboard' 
              ? pathname === item.href 
              : pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-7 w-7 text-blue-600" />
          <span className="text-lg font-bold">CumplIA</span>
        </Link>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SidebarContent 
              pathname={pathname} 
              onNavigate={handleNavigate}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 min-h-screen bg-white border-r flex flex-col fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}

// Mobile-only bottom navigation for quick access
export function MobileBottomNav() {
  const pathname = usePathname();
  
  // Solo mostrar ítems principales en la barra inferior
  const bottomNavItems = navItems.slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 safe-area-pb">
      <ul className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          // Dashboard solo activo en ruta exacta
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">
                  {item.title === "Sistemas de IA" ? "Sistemas" : item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

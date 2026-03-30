"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { fetchUserOrganization } from "@/lib/auth-helpers";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  GraduationCap,
  Settings2,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  AlertCircle,
  BarChart3,
  FileText,
  Users,
  Eye,
  CalendarClock,
  CheckSquare,
  History,
} from "lucide-react";

type UserRole = 'admin' | 'compliance_officer' | 'auditor' | 'viewer';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: UserRole[]; // If undefined, visible to all roles
}

// All available navigation items
const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Riesgo",
    href: "/dashboard/risk",
    icon: AlertCircle,
    roles: ['compliance_officer', 'auditor', 'admin'],
  },
  {
    title: "Evaluaciones",
    href: "/dashboard/assessments",
    icon: BarChart3,
    roles: ['compliance_officer', 'auditor', 'admin'],
  },
  {
    title: "Reportes",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ['compliance_officer', 'auditor', 'admin'],
  },
  {
    title: "Sistemas de IA",
    href: "/dashboard/inventory",
    icon: FolderKanban,
    roles: ['admin'],
  },
  {
    title: "Timeline regulatorio",
    href: "/dashboard/timeline",
    icon: CalendarClock,
  },
  {
    title: "Mi trabajo",
    href: "/dashboard/my-work",
    icon: CheckSquare,
  },
  {
    title: "Actividad",
    href: "/dashboard/activity",
    icon: History,
    roles: ['admin'],
  },
  {
    title: "Formación",
    href: "/dashboard/guia",
    icon: GraduationCap,
    roles: ['admin'],
  },
  {
    title: "Templates",
    href: "/dashboard/admin",
    icon: Settings2,
    roles: ['admin'],
  },
  {
    title: "Usuarios",
    href: "/dashboard/settings/users",
    icon: Users,
    roles: ['admin'],
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ['admin'],
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        if (!error && data) {
          const raw = data.role as string;
          const mapped: UserRole =
            raw === 'owner' || raw === 'admin' ? 'admin'
            : raw === 'editor' ? 'compliance_officer'
            : 'viewer';
          setUserRole(mapped);
        } else {
          setUserRole('viewer');
        }
      } catch {
        setUserRole('viewer');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Filter nav items based on user role
  const filteredNavItems = allNavItems.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles) return true;
    // If roles specified, only show if user's role is in the list
    return userRole && item.roles.includes(userRole);
  });

  return (
    <div className={cn("flex flex-col h-full", isMobile ? "bg-white" : "bg-white border-r border-[#E8ECEB]")}>
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={onNavigate}>
          <Shield className="h-8 w-8 text-[#E09E50]" />
          <span className="text-xl font-bold text-[#2D3E4E]">CumplIA</span>
        </Link>
      </div>

      {/* Role Badge (if not admin) */}
      {userRole && userRole !== 'admin' && !isLoading && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5DFB3]/30 border border-[#E09E50]/30">
            <Eye className="h-4 w-4 text-[#E09E50]" />
            <span className="text-xs font-medium text-[#B8860B]">
              {userRole === 'viewer' && 'Solo lectura'}
              {userRole === 'auditor' && 'Auditor'}
              {userRole === 'compliance_officer' && 'Cumplimiento'}
            </span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="px-4 py-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
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
                      ? "bg-[#E09E50]/10 text-[#E09E50]"
                      : "text-[#7a8a92] hover:bg-[#E8ECEB] hover:text-[#2D3E4E]"
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

      {/* Profile & Logout */}
      <div className="p-4 border-t space-y-1">
        <Link
          href="/dashboard/settings/profile"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
            pathname === '/dashboard/settings/profile'
              ? "bg-[#E09E50]/10 text-[#E09E50]"
              : "text-[#7a8a92] hover:bg-[#E8ECEB] hover:text-[#2D3E4E]"
          )}
        >
          <User className="h-5 w-5" />
          Mi Perfil
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#C92A2A] hover:bg-[#FFE8E8] hover:text-[#C92A2A] transition-colors w-full"
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E8ECEB] z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-7 w-7 text-[#E09E50]" />
          <span className="text-lg font-bold text-[#2D3E4E]">CumplIA</span>
        </Link>
        
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent side="left" className="p-0 w-3/4 sm:max-w-sm">
            <SidebarContent 
              pathname={pathname} 
              onNavigate={handleNavigate}
              isMobile={true}
            />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 min-h-screen bg-white border-r border-[#E8ECEB] flex flex-col fixed left-0 top-0 bottom-0 z-30">
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        if (!error && data) {
          setUserRole((data.role as UserRole) || 'viewer');
        } else {
          setUserRole('viewer');
        }
      } catch {
        setUserRole('viewer');
      }
    };

    loadUserRole();
  }, []);

  // Filter and limit nav items for mobile bottom nav
  const bottomNavItems = allNavItems
    .filter((item) => {
      // If no roles specified, show to everyone
      if (!item.roles) return true;
      // If roles specified, only show if user's role is in the list
      return userRole && item.roles.includes(userRole);
    })
    .slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8ECEB] z-40 safe-area-pb">
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
                    ? "text-[#E09E50]"
                    : "text-[#7a8a92] hover:text-[#2D3E4E]"
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchUserOrganization } from "@/lib/auth-helpers";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  GraduationCap,
  Settings2,
  LogOut,
  Menu,
  User,
  AlertCircle,
  BarChart3,
  FileText,
  Users,
  Eye,
  CalendarClock,
  CheckSquare,
  History,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { CumpliaLogo, Logomark } from "@/components/ui/cumplia-logo";

type UserRole = "admin" | "compliance_officer" | "auditor" | "viewer";

interface SubItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

interface NavLink {
  type: "link";
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

interface NavGroup {
  type: "group";
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  items: SubItem[];
}

type NavEntry = NavLink | NavGroup;

const navEntries: NavEntry[] = [
  {
    type: "link",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "link",
    title: "Inventario IA",
    href: "/dashboard/inventory",
    icon: FolderKanban,
    roles: ["admin"],
  },
  {
    type: "link",
    title: "Gestión de Riesgos",
    href: "/dashboard/risk",
    icon: AlertCircle,
    roles: ["compliance_officer", "auditor", "admin"],
  },
  {
    type: "link",
    title: "Compliance",
    href: "/dashboard/assessments",
    icon: BarChart3,
    roles: ["compliance_officer", "auditor", "admin"],
  },
  {
    type: "link",
    title: "Documentación",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ["compliance_officer", "auditor", "admin"],
  },
  {
    type: "link",
    title: "Mi trabajo",
    href: "/dashboard/my-work",
    icon: CheckSquare,
  },
  {
    type: "link",
    title: "Actividad",
    href: "/dashboard/activity",
    icon: History,
    roles: ["admin"],
  },
  {
    type: "group",
    title: "Recursos",
    icon: BookOpen,
    items: [
      {
        title: "Timeline regulatorio",
        href: "/dashboard/timeline",
        icon: CalendarClock,
      },
      {
        title: "Formación",
        href: "/dashboard/guia",
        icon: GraduationCap,
        roles: ["admin"],
      },
    ],
  },
  {
    type: "group",
    title: "Configuración",
    icon: Settings,
    roles: ["admin"],
    items: [
      { title: "General", href: "/dashboard/settings", icon: Settings },
      {
        title: "Usuarios",
        href: "/dashboard/settings/members",
        icon: Users,
      },
      { title: "Templates", href: "/dashboard/admin", icon: Settings2 },
    ],
  },
];

// Flat list for mobile bottom nav
const flatNavItems = navEntries.flatMap(
  (
    entry
  ): Array<{
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: UserRole[];
  }> => {
    if (entry.type === "link") {
      return [
        {
          title: entry.title,
          href: entry.href,
          icon: entry.icon,
          roles: entry.roles,
        },
      ];
    }
    return entry.items.map((item) => ({
      title: item.title,
      href: item.href,
      icon: item.icon,
      roles: item.roles ?? entry.roles,
    }));
  }
);

function isLinkActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-[#0B1C3D] text-[#F0EEE8] border-none text-xs font-medium shadow-lg"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  isMobile = false,
}: {
  pathname: string | null;
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const collapsed = isMobile ? false : isCollapsed;

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { data, error } = await fetchUserOrganization();
        if (!error && data) {
          const raw = data.role as string;
          const mapped: UserRole =
            raw === "owner" || raw === "admin"
              ? "admin"
              : raw === "editor"
              ? "compliance_officer"
              : "viewer";
          setUserRole(mapped);
        } else {
          setUserRole("viewer");
        }
      } catch {
        setUserRole("viewer");
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

  const canSeeEntry = (entry: NavEntry): boolean => {
    if (!userRole) return false;
    if (entry.roles && !entry.roles.includes(userRole)) return false;
    if (entry.type === "group") {
      return entry.items.some(
        (item) => !item.roles || item.roles.includes(userRole)
      );
    }
    return true;
  };

  const visibleSubItems = (group: NavGroup): SubItem[] => {
    if (!userRole) return [];
    return group.items.filter(
      (item) => !item.roles || item.roles.includes(userRole)
    );
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full bg-[#FAFAF8]",
          !isMobile && "border-r border-[#E3DFD5]"
        )}
      >
        {/* Header: logo + toggle */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-[#E3DFD5] flex-shrink-0",
            collapsed ? "justify-between px-3" : "justify-between px-5"
          )}
        >
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="inline-flex flex-shrink-0"
          >
            {collapsed ? (
              <Logomark size={30} variant="light" />
            ) : (
              <CumpliaLogo markSize={30} wordSize={22} variant="light" />
            )}
          </Link>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D] transition-colors flex-shrink-0"
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Role badge (expanded only) */}
        {!collapsed && userRole && userRole !== "admin" && !isLoading && (
          <div className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8FF47]/10 border border-[#0B1C3D]/15">
              <Eye className="h-4 w-4 text-[#0B1C3D]" />
              <span className="text-xs font-medium text-[#0B1C3D]">
                {userRole === "viewer" && "Solo lectura"}
                {userRole === "auditor" && "Auditor"}
                {userRole === "compliance_officer" && "Cumplimiento"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 py-3",
            collapsed ? "px-2 overflow-y-auto" : "px-3 overflow-y-auto"
          )}
        >
          <ul className="space-y-0.5">
            {navEntries.map((entry) => {
              if (!canSeeEntry(entry)) return null;

              if (entry.type === "link") {
                const Icon = entry.icon;
                const active = isLinkActive(entry.href, pathname);

                if (collapsed) {
                  return (
                    <li key={entry.href}>
                      <NavTooltip label={entry.title}>
                        <Link
                          href={entry.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center justify-center h-10 rounded-lg transition-colors",
                            active
                              ? "bg-[#0B1C3D]/[0.07] text-[#0B1C3D]"
                              : "text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D]"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Link>
                      </NavTooltip>
                    </li>
                  );
                }

                return (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-[#0B1C3D]/[0.07] text-[#0B1C3D]"
                          : "text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D]"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{entry.title}</span>
                    </Link>
                  </li>
                );
              }

              // NavGroup
              const GroupIcon = entry.icon;
              const subItems = visibleSubItems(entry);
              const groupActive = subItems.some((item) =>
                isLinkActive(item.href, pathname)
              );

              if (collapsed) {
                return (
                  <li key={entry.title} className="pt-1">
                    <div className="border-t border-[#E3DFD5] mb-1" />
                    <NavTooltip label={entry.title}>
                      <Link
                        href={subItems[0]?.href ?? "#"}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center justify-center h-10 rounded-lg transition-colors",
                          groupActive
                            ? "bg-[#0B1C3D]/[0.07] text-[#0B1C3D]"
                            : "text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D]"
                        )}
                      >
                        <GroupIcon className="h-5 w-5" />
                      </Link>
                    </NavTooltip>
                  </li>
                );
              }

              // Expanded group
              return (
                <li key={entry.title} className="pt-3">
                  <div className="flex items-center gap-2 px-3 pb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B9BB4]/60 whitespace-nowrap">
                      {entry.title}
                    </span>
                    <div className="flex-1 h-px bg-[#E3DFD5]" />
                  </div>
                  <ul className="space-y-0.5">
                    {subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const subActive = isLinkActive(subItem.href, pathname);
                      return (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            onClick={onNavigate}
                            className={cn(
                              "flex items-center gap-3 pl-5 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                              subActive
                                ? "bg-[#0B1C3D]/[0.07] text-[#0B1C3D]"
                                : "text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D]"
                            )}
                          >
                            <SubIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{subItem.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: profile & logout */}
        <div
          className={cn(
            "border-t border-[#E3DFD5] py-3 flex-shrink-0 space-y-0.5",
            collapsed ? "px-2" : "px-3"
          )}
        >
          {collapsed ? (
            <>
              <NavTooltip label="Mi Perfil">
                <Link
                  href="/dashboard/settings/profile"
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-center h-10 rounded-lg transition-colors",
                    isLinkActive("/dashboard/settings/profile", pathname)
                      ? "bg-[#0B1C3D]/[0.07] text-[#0B1C3D]"
                      : "text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D]"
                  )}
                >
                  <User className="h-5 w-5" />
                </Link>
              </NavTooltip>
              <NavTooltip label="Cerrar sesión">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-full rounded-lg text-[#C92A2A] hover:bg-[#FFE8E8] transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </NavTooltip>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/settings/profile"
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isLinkActive("/dashboard/settings/profile", pathname)
                    ? "bg-[#0B1C3D]/[0.07] text-[#0B1C3D]"
                    : "text-[#8B9BB4] hover:bg-[#E3DFD5] hover:text-[#0B1C3D]"
                )}
              >
                <User className="h-5 w-5 shrink-0" />
                <span className="truncate">Mi Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#C92A2A] hover:bg-[#FFE8E8] hover:text-[#C92A2A] transition-colors w-full"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isCollapsed } = useSidebar();

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#FAFAF8] border-b border-[#E3DFD5] z-40 flex items-center justify-between px-4">
        <Link href="/" className="inline-flex">
          <CumpliaLogo markSize={30} wordSize={22} variant="light" />
        </Link>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent side="left" className="p-0 w-3/4 sm:max-w-sm">
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              isMobile={true}
            />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30",
          "transition-[width] duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
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
          setUserRole((data.role as UserRole) || "viewer");
        } else {
          setUserRole("viewer");
        }
      } catch {
        setUserRole("viewer");
      }
    };

    loadUserRole();
  }, []);

  const bottomNavItems = flatNavItems
    .filter((item) => {
      if (!item.roles) return true;
      return userRole && item.roles.includes(userRole);
    })
    .slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3DFD5] z-40 safe-area-pb">
      <ul className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href, pathname);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
                  active
                    ? "text-[#0B1C3D]"
                    : "text-[#8B9BB4] hover:text-[#0B1C3D]"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">
                  {item.title === "Inventario IA"
                    ? "Inventario"
                    : item.title === "Gestión de Riesgos"
                    ? "Riesgos"
                    : item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

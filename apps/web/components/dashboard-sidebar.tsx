"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings,
  LayoutTemplate,
  Shield,
  GraduationCap
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Casos de Uso",
    href: "/dashboard/inventory",
    icon: FolderKanban,
  },
  {
    title: "Plantillas",
    href: "/dashboard/inventory/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Formación",
    href: "/dashboard/guia",
    icon: GraduationCap,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">CumplIA</span>
        </Link>
      </div>
      
      <nav className="px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
    </aside>
  );
}
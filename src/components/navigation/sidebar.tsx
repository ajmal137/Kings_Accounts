"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  FileSpreadsheet,
  Scale,
  Settings,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/types/auth";

const NAV_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Consignments",
    href: "/consignments",
    icon: Truck,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: ScrollText,
  },
  {
    label: "Masters",
    href: "/masters",
    icon: Scale,
  },
  {
    label: "Accounting",
    href: "/accounting",
    icon: FileSpreadsheet,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: Scale,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export type SidebarProps = {
  firmName: string;
  userRole: UserRole;
  className?: string; // Added className prop
};

export function SidebarContent({ firmName, userRole, className }: SidebarProps) {
  const pathname = usePathname();
  const links =
    userRole === "ADMIN"
      ? NAV_LINKS
      : NAV_LINKS.filter((link) => link.href !== "/settings");

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          KINGS TRANSPORTS
        </p>
        <h1 className="text-xl font-semibold text-slate-900">{firmName}</h1>
        <p className="text-xs text-slate-500">Goods Transport Agency</p>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">GST Notice</p>
        <p>
          GTA services supplied to registered recipients are taxable under RCM
          unless opted for FCM.
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ firmName, userRole }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white/95 px-4 py-6 lg:flex lg:flex-col">
      <SidebarContent firmName={firmName} userRole={userRole} />
    </aside>
  );
}


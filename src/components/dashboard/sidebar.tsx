"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  User,
  Search,
  AlertTriangle,
  ListChecks,
  Trash2,
  Bell,
  FileText,
  PhoneOff,
  Settings,
  LogOut,
  Bot,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
  { name: "Scan", href: "/dashboard/scan", icon: Search },
  { name: "Exposures", href: "/dashboard/exposures", icon: AlertTriangle },
  { name: "Manual Review", href: "/dashboard/manual-review", icon: MousePointerClick },
  { name: "Whitelist", href: "/dashboard/whitelist", icon: ListChecks },
  { name: "Removals", href: "/dashboard/removals", icon: Trash2 },
  { name: "AI Shield", href: "/dashboard/ai-protection", icon: Bot },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Do Not Call", href: "/dashboard/dnc", icon: PhoneOff },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Executive Dashboard", href: "/dashboard/executive", icon: TrendingUp },
  { name: "User Management", href: "/dashboard/admin", icon: Users },
];

// Roles that can see admin navigation
const ADMIN_ROLES = ["ADMIN", "LEGAL", "SUPER_ADMIN"];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Check if user has admin role
  const userRole = (session?.user as { role?: string })?.role || "USER";
  const isAdmin = ADMIN_ROLES.includes(userRole);

  return (
    <div className="flex h-full flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <Shield className="h-8 w-8 text-emerald-500" />
        <span className="text-xl font-bold text-white">GhostMyData</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </div>
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-500/10 text-purple-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Upgrade Banner - shows for FREE users only */}
      <UpgradeBanner variant="sidebar" />

      {/* User section */}
      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

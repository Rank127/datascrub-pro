"use client";

import { useEffect, useState } from "react";
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
  TrendingUp,
  Headphones,
  Brain,
  Briefcase,
  Building2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
  { name: "Scan", href: "/dashboard/scan", icon: Search, tourId: "scan-nav" },
  { name: "Exposures", href: "/dashboard/exposures", icon: AlertTriangle, tourId: "exposures-nav" },
  { name: "Whitelist", href: "/dashboard/whitelist", icon: ListChecks },
  { name: "Removals", href: "/dashboard/removals", icon: Trash2, tourId: "removals-nav" },
  { name: "AI Shield", href: "/dashboard/ai-protection", icon: Bot },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Support", href: "/dashboard/support", icon: Headphones },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Do Not Call", href: "/dashboard/dnc", icon: PhoneOff },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, tourId: "settings-nav" },
];

// Corporate admin link — shown for users who manage a corporate account (customers, not GhostMyData staff)
const corporateAdminLink = {
  name: "My Corporate Plan",
  href: "/dashboard/corporate-admin",
  icon: Building2,
};

const adminNavigation = [
  { name: "Admin Dashboard", href: "/dashboard/executive", icon: TrendingUp },
  { name: "Mastermind", href: "/dashboard/mastermind", icon: Brain },
  { name: "Corporate", href: "/dashboard/corporate", icon: Briefcase },
];

// Roles that can see admin navigation
const ADMIN_ROLES = ["ADMIN", "LEGAL", "SUPER_ADMIN"];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCorporateAdmin, setIsCorporateAdmin] = useState(false);

  // Check if user has admin role
  const userRole = (session?.user as { role?: string })?.role || "USER";
  const isAdmin = ADMIN_ROLES.includes(userRole);

  // Check if user is a corporate account admin
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/corporate/admin")
        .then((res) => res.ok ? setIsCorporateAdmin(true) : setIsCorporateAdmin(false))
        .catch(() => setIsCorporateAdmin(false));
    }
  }, [session?.user?.id]);

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
              data-tour={item.tourId}
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

        {/* Corporate Admin Link — for corporate customers, not GhostMyData staff */}
        {isCorporateAdmin && (() => {
          const isActive = pathname === corporateAdminLink.href || pathname.startsWith(corporateAdminLink.href + "/");
          return (
            <Link
              href={corporateAdminLink.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <corporateAdminLink.icon className="h-5 w-5" />
              {corporateAdminLink.name}
            </Link>
          );
        })()}

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
      <UpgradeBanner />

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

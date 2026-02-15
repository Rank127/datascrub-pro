"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Prevent hydration mismatch with Radix UI dropdown IDs
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Fetch unread alert count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/alerts");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch alert count:", error);
      }
    };

    if (session?.user) {
      fetchUnreadCount();
      // Refresh count every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-slate-400"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link href="/dashboard/alerts">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User menu - only render after mount to prevent Radix ID hydration mismatch */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-500">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-slate-400">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-700 focus:text-white">
                <Link href="/dashboard/profile">My Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-700 focus:text-white">
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-500/10 text-emerald-500">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  );
}

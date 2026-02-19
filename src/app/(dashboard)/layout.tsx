"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";
import { FirstRemovalCelebration } from "@/components/dashboard/first-removal-celebration";
import { IdleTimeout } from "@/components/dashboard/idle-timeout";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isExecutive = pathname === "/dashboard/executive";

  if (isExecutive) {
    return (
      <SessionProvider>
        <div className="min-h-screen bg-slate-950">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <IdleTimeout />
        </div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="flex h-screen bg-slate-950">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <Sidebar />
        </div>

        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <OnboardingTour>{children}</OnboardingTour>
            <FirstRemovalCelebration />
            <IdleTimeout />
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

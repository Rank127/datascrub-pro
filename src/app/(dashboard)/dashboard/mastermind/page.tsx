"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MastermindOrgChart } from "@/components/dashboard/mastermind/org-chart";
import { AdvisorPanel } from "@/components/dashboard/mastermind/advisor-panel";

const ADMIN_ROLES = ["ADMIN", "LEGAL", "SUPER_ADMIN"];

export default function MastermindPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role || "USER";
  if (!ADMIN_ROLES.includes(userRole)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mastermind Advisory Council</h1>
        <p className="text-slate-400 mt-1">
          5-Layer Organism Model — 75 modern minds powering every decision
        </p>
      </div>

      <MastermindOrgChart />
      <AdvisorPanel />
    </div>
  );
}

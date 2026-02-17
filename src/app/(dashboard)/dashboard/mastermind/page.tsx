"use client";

import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { MastermindOrgChart } from "@/components/dashboard/mastermind/org-chart";
import { AdvisorPanel } from "@/components/dashboard/mastermind/advisor-panel";

export default function MastermindPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mastermind Advisory Council</h1>
        <p className="text-slate-400 mt-1">
          Board + C-Suite + 14 Divisions — 240+ minds powering every decision
        </p>
      </div>

      <MastermindOrgChart />
      <AdvisorPanel />
    </div>
  );
}

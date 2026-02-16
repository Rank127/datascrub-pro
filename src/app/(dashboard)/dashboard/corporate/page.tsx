"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CorporateSection } from "@/components/dashboard/executive/corporate-section";
import type { CorporateMetrics } from "@/lib/executive/types";

export default function CorporateDashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<CorporateMetrics | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCorporateData();
  }, []);

  const fetchCorporateData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/executive-stats", {
        cache: "no-store",
      });

      if (response.status === 403 || response.status === 401) {
        setError("You don't have permission to access this page.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setMetrics(data.corporate);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading corporate dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-slate-900/50 border-slate-800 max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Access Denied</h2>
            <p className="text-slate-400">{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchCorporateData()}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-violet-500/20 bg-violet-500/5">
      <CorporateSection data={metrics} />
    </div>
  );
}

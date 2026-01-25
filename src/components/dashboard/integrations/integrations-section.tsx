"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VercelSection } from "./vercel-section";
import { StripeSection } from "./stripe-section";
import { AnalyticsSection } from "./analytics-section";
import { DatabaseSection } from "./database-section";
import { ServicesStatus } from "./services-status";
import {
  VercelIntegrationResponse,
  StripeIntegrationResponse,
  AnalyticsIntegrationResponse,
  DatabaseIntegrationResponse,
  ServicesIntegrationResponse,
} from "@/lib/integrations/types";
import {
  Cloud,
  CreditCard,
  BarChart3,
  Database,
  Plug,
} from "lucide-react";
import { toast } from "sonner";

interface IntegrationsData {
  vercel: VercelIntegrationResponse | null;
  stripe: StripeIntegrationResponse | null;
  analytics: AnalyticsIntegrationResponse | null;
  database: DatabaseIntegrationResponse | null;
  services: ServicesIntegrationResponse | null;
}

interface LoadingState {
  vercel: boolean;
  stripe: boolean;
  analytics: boolean;
  database: boolean;
  services: boolean;
}

export function IntegrationsSection() {
  const [data, setData] = useState<IntegrationsData>({
    vercel: null,
    stripe: null,
    analytics: null,
    database: null,
    services: null,
  });

  const [loading, setLoading] = useState<LoadingState>({
    vercel: true,
    stripe: true,
    analytics: true,
    database: true,
    services: true,
  });

  const [activeTab, setActiveTab] = useState("vercel");

  // Fetch data for a specific integration
  const fetchIntegration = useCallback(
    async (integration: keyof IntegrationsData) => {
      setLoading((prev) => ({ ...prev, [integration]: true }));

      try {
        const response = await fetch(`/api/admin/integrations/${integration}`);

        if (response.status === 403) {
          toast.error("Access denied. SUPER_ADMIN required.");
          return;
        }

        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch ${integration} data`);
        }

        const result = await response.json();
        setData((prev) => ({ ...prev, [integration]: result }));
      } catch (error) {
        console.error(`[Integrations] Error fetching ${integration}:`, error);
        toast.error(`Failed to load ${integration} data`);
      } finally {
        setLoading((prev) => ({ ...prev, [integration]: false }));
      }
    },
    []
  );

  // Fetch all integrations on mount
  useEffect(() => {
    fetchIntegration("vercel");
    fetchIntegration("stripe");
    fetchIntegration("analytics");
    fetchIntegration("database");
    fetchIntegration("services");
  }, [fetchIntegration]);

  // Refresh function for individual integrations
  const refreshIntegration = useCallback(
    (integration: keyof IntegrationsData) => {
      fetchIntegration(integration);
      toast.success(`Refreshing ${integration} data...`);
    },
    [fetchIntegration]
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger
            value="vercel"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 gap-2"
          >
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Vercel</span>
          </TabsTrigger>
          <TabsTrigger
            value="stripe"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Stripe</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="database"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 gap-2"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 gap-2"
          >
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vercel" className="mt-6">
          <VercelSection
            data={data.vercel}
            loading={loading.vercel}
            onRefresh={() => refreshIntegration("vercel")}
          />
        </TabsContent>

        <TabsContent value="stripe" className="mt-6">
          <StripeSection
            data={data.stripe}
            loading={loading.stripe}
            onRefresh={() => refreshIntegration("stripe")}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsSection
            data={data.analytics}
            loading={loading.analytics}
            onRefresh={() => refreshIntegration("analytics")}
          />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <DatabaseSection
            data={data.database}
            loading={loading.database}
            onRefresh={() => refreshIntegration("database")}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <ServicesStatus
            data={data.services}
            loading={loading.services}
            onRefresh={() => refreshIntegration("services")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

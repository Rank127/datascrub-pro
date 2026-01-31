"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Cloud,
  Database,
  CreditCard,
  Mail,
  Shield,
  Search,
  Bug,
  Bot,
  MessageSquare,
  BarChart3,
  Globe,
  Server,
  Activity,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceHealthItem {
  name: string;
  category: "deployment" | "database" | "payments" | "email" | "data" | "ai" | "analytics";
  status: "healthy" | "warning" | "critical" | "error" | "not_configured";
  message: string;
  icon: React.ReactNode;
  percentUsed?: number;
  recommendation?: string;
  dashboardUrl?: string;
  actionLabel?: string;
}

interface OperationsOverviewProps {
  className?: string;
}

export function OperationsOverview({ className }: OperationsOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<ServiceHealthItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const healthItems: ServiceHealthItem[] = [];

    try {
      // Fetch all integration statuses in parallel
      const [vercelRes, databaseRes, stripeRes, servicesRes, analyticsRes, bingRes] = await Promise.all([
        fetch("/api/admin/integrations/vercel").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/admin/integrations/database").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/admin/integrations/stripe").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/admin/integrations/services").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/admin/integrations/analytics").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/admin/integrations/bing").then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      // Vercel
      if (vercelRes) {
        const lastDeploy = vercelRes.deployments?.[0];
        let status: ServiceHealthItem["status"] = "healthy";
        let message = "No recent deployments";

        if (lastDeploy) {
          if (lastDeploy.state === "ERROR") {
            status = "error";
            message = "Last deployment failed";
          } else if (lastDeploy.state === "BUILDING") {
            status = "warning";
            message = "Deployment in progress";
          } else if (lastDeploy.state === "READY") {
            status = "healthy";
            message = "Last deployment successful";
          } else {
            status = "warning";
            message = `Status: ${lastDeploy.state}`;
          }
        }

        healthItems.push({
          name: "Vercel",
          category: "deployment",
          status: vercelRes.configured ? status : "not_configured",
          message: vercelRes.configured ? message : "Not configured",
          icon: <Cloud className="h-4 w-4" />,
          dashboardUrl: "https://vercel.com/ghostmydata/datascrub-pro",
          actionLabel: "View Deployments",
        });
      }

      // Database (Supabase)
      if (databaseRes) {
        let status: ServiceHealthItem["status"] = "healthy";
        let message = "Connected";

        if (databaseRes.connectionStatus === "error") {
          status = "error";
          message = "Connection failed";
        } else if (databaseRes.connectionStatus === "degraded") {
          status = "warning";
          message = `Degraded (${databaseRes.latencyMs}ms latency)`;
        } else if (databaseRes.latencyMs > 500) {
          status = "warning";
          message = `High latency (${databaseRes.latencyMs}ms)`;
        } else {
          message = `Healthy (${databaseRes.latencyMs}ms)`;
        }

        healthItems.push({
          name: "Supabase Database",
          category: "database",
          status: databaseRes.configured ? status : "not_configured",
          message: databaseRes.configured ? message : "Not configured",
          icon: <Database className="h-4 w-4" />,
          dashboardUrl: "https://supabase.com/dashboard",
          actionLabel: "Open Dashboard",
        });
      }

      // Stripe
      if (stripeRes) {
        let status: ServiceHealthItem["status"] = "healthy";
        let message = "Connected";

        if (stripeRes.subscriptionStats) {
          const pastDue = stripeRes.subscriptionStats.pastDue || 0;
          if (pastDue > 0) {
            status = "warning";
            message = `${pastDue} past due subscription${pastDue > 1 ? 's' : ''}`;
          } else {
            message = `${stripeRes.subscriptionStats.active} active subscriptions`;
          }
        }

        healthItems.push({
          name: "Stripe Payments",
          category: "payments",
          status: stripeRes.configured ? status : "not_configured",
          message: stripeRes.configured ? message : "Not configured",
          icon: <CreditCard className="h-4 w-4" />,
          dashboardUrl: "https://dashboard.stripe.com",
          actionLabel: "Open Dashboard",
        });
      }

      // External Services
      if (servicesRes) {
        // Resend
        if (servicesRes.resend) {
          const rl = servicesRes.resend.rateLimit;
          healthItems.push({
            name: "Resend Email",
            category: "email",
            status: servicesRes.resend.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.resend.status === "error" ? "error" : "not_configured",
            message: servicesRes.resend.message || "Unknown",
            icon: <Mail className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            recommendation: rl?.recommendation,
            dashboardUrl: "https://resend.com/overview",
            actionLabel: "View Usage",
          });
        }

        // HIBP
        if (servicesRes.hibp) {
          const rl = servicesRes.hibp.rateLimit;
          healthItems.push({
            name: "Have I Been Pwned",
            category: "data",
            status: servicesRes.hibp.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.hibp.status === "error" ? "error" : "not_configured",
            message: servicesRes.hibp.message || "Unknown",
            icon: <Shield className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            dashboardUrl: "https://haveibeenpwned.com/API/Key",
            actionLabel: "Manage API Key",
          });
        }

        // LeakCheck
        if (servicesRes.leakcheck) {
          const rl = servicesRes.leakcheck.rateLimit;
          healthItems.push({
            name: "LeakCheck",
            category: "data",
            status: servicesRes.leakcheck.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.leakcheck.status === "error" ? "error" : "not_configured",
            message: servicesRes.leakcheck.message || "Unknown",
            icon: <Search className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            recommendation: rl?.recommendation,
            dashboardUrl: "https://leakcheck.io/dashboard",
            actionLabel: "Buy Credits",
          });
        }

        // ScrapingBee
        if (servicesRes.scrapingbee) {
          const rl = servicesRes.scrapingbee.rateLimit;
          healthItems.push({
            name: "ScrapingBee",
            category: "data",
            status: servicesRes.scrapingbee.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.scrapingbee.status === "error" ? "error" : "not_configured",
            message: servicesRes.scrapingbee.message || "Unknown",
            icon: <Bug className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            recommendation: rl?.recommendation,
            dashboardUrl: "https://app.scrapingbee.com/account",
            actionLabel: "Upgrade Plan",
          });
        }

        // Redis
        if (servicesRes.redis) {
          const rl = servicesRes.redis.rateLimit;
          healthItems.push({
            name: "Redis / Upstash",
            category: "database",
            status: servicesRes.redis.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.redis.status === "error" ? "error" : "not_configured",
            message: servicesRes.redis.message || "Unknown",
            icon: <Server className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            dashboardUrl: "https://console.upstash.com",
            actionLabel: "Open Console",
          });
        }

        // Anthropic
        if (servicesRes.anthropic) {
          const rl = servicesRes.anthropic.rateLimit;
          healthItems.push({
            name: "Claude AI",
            category: "ai",
            status: servicesRes.anthropic.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.anthropic.status === "error" ? "error" : "not_configured",
            message: servicesRes.anthropic.message || "Unknown",
            icon: <Bot className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            dashboardUrl: "https://console.anthropic.com/settings/billing",
            actionLabel: "Manage Billing",
          });
        }

        // Twilio
        if (servicesRes.twilio) {
          const rl = servicesRes.twilio.rateLimit;
          healthItems.push({
            name: "Twilio SMS",
            category: "email",
            status: servicesRes.twilio.status === "connected"
              ? (rl?.status === "critical" ? "critical" : rl?.status === "warning" ? "warning" : "healthy")
              : servicesRes.twilio.status === "error" ? "error" : "not_configured",
            message: servicesRes.twilio.message || "Unknown",
            icon: <MessageSquare className="h-4 w-4" />,
            percentUsed: rl?.percentUsed,
            recommendation: rl?.recommendation,
            dashboardUrl: "https://console.twilio.com/us1/billing/manage-billing/billing-overview",
            actionLabel: "Add Funds",
          });
        }
      }

      // Google Analytics
      if (analyticsRes) {
        healthItems.push({
          name: "Google Analytics",
          category: "analytics",
          status: analyticsRes.configured ? "healthy" : "not_configured",
          message: analyticsRes.configured
            ? `${analyticsRes.activeUsers?.dau || 0} daily active users`
            : "Not configured",
          icon: <BarChart3 className="h-4 w-4" />,
          dashboardUrl: "https://analytics.google.com",
          actionLabel: "View Analytics",
        });
      }

      // Bing Webmaster
      if (bingRes) {
        healthItems.push({
          name: "Bing Webmaster",
          category: "analytics",
          status: bingRes.configured ? "healthy" : "not_configured",
          message: bingRes.configured
            ? `${bingRes.crawlStats?.inIndex || 0} pages indexed`
            : "Not configured",
          icon: <Globe className="h-4 w-4" />,
          dashboardUrl: "https://www.bing.com/webmasters",
          actionLabel: "View SEO",
        });
      }

      setServices(healthItems);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch operations overview:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllStatus();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchAllStatus(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalServices = services.filter(s => s.status === "critical" || s.status === "error");
  const warningServices = services.filter(s => s.status === "warning");
  const healthyServices = services.filter(s => s.status === "healthy");
  const notConfigured = services.filter(s => s.status === "not_configured");

  const getStatusIcon = (status: ServiceHealthItem["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "critical":
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBg = (status: ServiceHealthItem["status"]) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      case "critical":
      case "error":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-slate-500/10 border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <Card className={cn("bg-slate-900/50 border-slate-800", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Operations Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
            <span className="ml-2 text-slate-400">Loading service status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-slate-900/50 border-slate-800", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          Operations Overview <span className="text-xs text-slate-500 ml-2">v2</span>
          {criticalServices.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {criticalServices.length} Critical
            </Badge>
          )}
          {warningServices.length > 0 && (
            <Badge variant="outline" className="ml-2 border-amber-500/50 text-amber-400">
              {warningServices.length} Warning
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllStatus(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-2xl font-bold text-emerald-400">{healthyServices.length}</div>
            <div className="text-xs text-emerald-400/80">Healthy</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-2xl font-bold text-amber-400">{warningServices.length}</div>
            <div className="text-xs text-amber-400/80">Warning</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-2xl font-bold text-red-400">{criticalServices.length}</div>
            <div className="text-xs text-red-400/80">Critical</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/20 text-center">
            <div className="text-2xl font-bold text-slate-400">{notConfigured.length}</div>
            <div className="text-xs text-slate-400/80">Not Set</div>
          </div>
        </div>

        {/* Critical & Error Services */}
        {criticalServices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-400 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Needs Immediate Attention
            </h4>
            <div className="space-y-2">
              {criticalServices.map((service, idx) => (
                <a
                  key={idx}
                  href={service.dashboardUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-3 rounded-lg border block cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all",
                    getStatusBg(service.status)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {service.icon}
                      <span className="text-sm font-medium text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1">
                        {service.actionLabel || "Fix Now"}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                      {getStatusIcon(service.status)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{service.message}</p>
                  {service.recommendation && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {service.recommendation}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Warning Services */}
        {warningServices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Warnings - Click to take action
            </h4>
            <div className="space-y-2">
              {warningServices.map((service, idx) => (
                <a
                  key={idx}
                  href={service.dashboardUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-3 rounded-lg border block cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all",
                    getStatusBg(service.status)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {service.icon}
                      <span className="text-sm font-medium text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.percentUsed !== undefined && (
                        <span className="text-xs text-amber-400">{service.percentUsed}% used</span>
                      )}
                      <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded flex items-center gap-1">
                        {service.actionLabel || "View"}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                      {getStatusIcon(service.status)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{service.message}</p>
                  {service.recommendation && (
                    <p className="text-xs text-amber-400 mt-1">{service.recommendation}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* All Services Grid (collapsed) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">All Services</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {services.map((service, idx) => (
              service.dashboardUrl ? (
                <a
                  key={idx}
                  href={service.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 rounded-lg border flex items-center gap-2 hover:ring-1 hover:ring-slate-500 transition-all cursor-pointer group",
                    getStatusBg(service.status)
                  )}
                >
                  {service.icon}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{service.name}</div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {getStatusIcon(service.status)}
                </a>
              ) : (
                <div
                  key={idx}
                  className={cn(
                    "p-2 rounded-lg border flex items-center gap-2",
                    getStatusBg(service.status)
                  )}
                >
                  {service.icon}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{service.name}</div>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
              )
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

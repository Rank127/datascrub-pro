"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Search,
  Trash2,
  Check,
  RefreshCw,
  PartyPopper,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

const alertTypeConfig: Record<
  string,
  { icon: typeof Bell; color: string; bgColor: string }
> = {
  NEW_EXPOSURE: {
    icon: AlertTriangle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  REMOVAL_COMPLETED: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  SCAN_COMPLETED: {
    icon: Search,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  REMOVAL_FAILED: {
    icon: Trash2,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  FIRST_REMOVAL_MILESTONE: {
    icon: PartyPopper,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAsRead = async (alertId: string) => {
    // Optimistic update
    setAlerts(
      alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );

    try {
      const response = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        // Revert on error
        setAlerts(
          alerts.map((a) => (a.id === alertId ? { ...a, isRead: false } : a))
        );
      }
    } catch {
      // Revert on error
      setAlerts(
        alerts.map((a) => (a.id === alertId ? { ...a, isRead: false } : a))
      );
    }
  };

  const markAllAsRead = async () => {
    setUpdating(true);
    // Optimistic update
    const previousAlerts = [...alerts];
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));

    try {
      const response = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (!response.ok) {
        // Revert on error
        setAlerts(previousAlerts);
      }
    } catch {
      // Revert on error
      setAlerts(previousAlerts);
    } finally {
      setUpdating(false);
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;


  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Stay informed about new exposures and removal updates"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-slate-600"
              onClick={() => {
                setLoading(true);
                fetchAlerts();
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="border-slate-600"
                onClick={markAllAsRead}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Mark all as read
              </Button>
            )}
          </div>
        }
      />

      {/* Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="p-3 bg-emerald-500/10 rounded-full">
            <Bell className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-slate-400">
              {alerts.length} total notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <p className="text-red-400">{error}</p>
              <Button
                variant="link"
                className="text-red-400 p-0 h-auto"
                onClick={() => {
                  setLoading(true);
                  fetchAlerts();
                }}
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Alerts</CardTitle>
          <CardDescription className="text-slate-400">
            Notifications about your data protection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : alerts.length === 0 ? (
            <EmptyState
              icon={<Bell className="mx-auto h-12 w-12 text-slate-600 mb-4" />}
              title="No alerts yet"
              description="You'll be notified when there are updates about your data"
            />
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const config =
                  alertTypeConfig[alert.type] || alertTypeConfig.NEW_EXPOSURE;
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                      alert.isRead
                        ? "bg-slate-700/20"
                        : "bg-slate-700/50 hover:bg-slate-700/60"
                    }`}
                    onClick={() => !alert.isRead && markAsRead(alert.id)}
                  >
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-medium ${
                            alert.isRead ? "text-slate-300" : "text-white"
                          }`}
                        >
                          {alert.title}
                        </h4>
                        {!alert.isRead && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

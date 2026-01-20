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
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

// Mock alerts for development
const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "NEW_EXPOSURE",
    title: "New Exposure Found",
    message: "Your email was found in a new data broker listing on Spokeo",
    isRead: false,
    metadata: JSON.stringify({ source: "SPOKEO", exposureId: "exp1" }),
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: "2",
    type: "REMOVAL_COMPLETED",
    title: "Removal Completed",
    message: "Your data has been successfully removed from WhitePages",
    isRead: false,
    metadata: JSON.stringify({ source: "WHITEPAGES", removalId: "rem1" }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "3",
    type: "SCAN_COMPLETED",
    title: "Scan Completed",
    message: "Your full scan completed. Found 12 new exposures across 8 sources.",
    isRead: true,
    metadata: JSON.stringify({ scanId: "scan1", exposuresFound: 12 }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "4",
    type: "NEW_EXPOSURE",
    title: "Critical Exposure Detected",
    message: "Your data was found on a dark web forum. Immediate action recommended.",
    isRead: true,
    metadata: JSON.stringify({ source: "DARK_WEB_FORUM", exposureId: "exp2" }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
];

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
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading alerts
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = (alertId: string) => {
    setAlerts(
      alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 1000 * 60 * 60) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours}h ago`;
    }
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400">
            Stay informed about new exposures and removal updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={markAllAsRead}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">
                No alerts yet
              </h3>
              <p className="text-slate-500 mt-1">
                You&apos;ll be notified when there are updates
              </p>
            </div>
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
                    onClick={() => markAsRead(alert.id)}
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
                        {formatDate(alert.createdAt)}
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

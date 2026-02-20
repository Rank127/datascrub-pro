"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, X, Loader2 } from "lucide-react";

interface Recommendation {
  id: string;
  userId: string;
  promoType: string;
  reason: string;
  confidence: number;
  agentId: string;
  status: string;
  couponCode: string;
  expiresAt: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    plan: string;
  };
}

export function PromoRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo-recommendations");
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch {
      // Silently fail — widget is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  async function handleAction(id: string, action: "approve" | "decline") {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/promo-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, recommendationId: id }),
      });
      if (res.ok) {
        setRecommendations((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // Silently fail
    } finally {
      setActionLoading(null);
    }
  }

  const promoTypeColor: Record<string, string> = {
    DISCOUNT: "bg-emerald-500/20 text-emerald-400",
    URGENCY: "bg-amber-500/20 text-amber-400",
    WIN_BACK: "bg-blue-500/20 text-blue-400",
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Promo Recommendations
          {recommendations.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 ml-auto">
              {recommendations.length} pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No pending recommendations
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-800/30 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-xs text-slate-300 truncate">
                      {rec.user.email}
                    </p>
                    <Badge className="text-[10px] px-1.5 py-0 bg-slate-700 text-slate-300 shrink-0">
                      {rec.user.plan}
                    </Badge>
                  </div>
                  <Badge
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${promoTypeColor[rec.promoType] || "bg-slate-700 text-slate-300"}`}
                  >
                    {rec.promoType}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {rec.reason}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                    <span>via {rec.agentId}</span>
                    <span>Code: {rec.couponCode}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAction(rec.id, "approve")}
                      disabled={actionLoading === rec.id}
                      className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      {actionLoading === rec.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(rec.id, "decline")}
                      disabled={actionLoading === rec.id}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                      title="Decline"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

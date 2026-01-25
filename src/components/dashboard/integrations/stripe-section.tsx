"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationCard, MetricDisplay } from "./integration-card";
import { StripeIntegrationResponse } from "@/lib/integrations/types";
import {
  CreditCard,
  DollarSign,
  Users,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface StripeSectionProps {
  data: StripeIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StripeSection({ data, loading, onRefresh }: StripeSectionProps) {
  if (loading) {
    return (
      <IntegrationCard
        title="Stripe"
        icon={CreditCard}
        status="loading"
        message="Loading payment data..."
      />
    );
  }

  if (!data?.configured) {
    return (
      <IntegrationCard
        title="Stripe"
        icon={CreditCard}
        status="not_configured"
        message={data?.error || "Configure STRIPE_SECRET_KEY to enable"}
      >
        <div className="text-sm text-slate-400 p-4 bg-slate-800/50 rounded-lg">
          <p className="font-medium mb-2">Required Environment Variables:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>STRIPE_SECRET_KEY</li>
            <li>STRIPE_PUBLISHABLE_KEY</li>
            <li>STRIPE_WEBHOOK_SECRET</li>
          </ul>
        </div>
      </IntegrationCard>
    );
  }

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="Stripe"
        icon={CreditCard}
        status="connected"
        message="Payment processing active"
      >
        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
          </a>
        </div>

        {/* Balance */}
        {data.balance && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MetricDisplay
              label="Available Balance"
              value={formatCurrency(data.balance.available)}
              variant="success"
            />
            <MetricDisplay
              label="Pending Balance"
              value={formatCurrency(data.balance.pending)}
              variant="default"
            />
          </div>
        )}

        {/* Revenue */}
        {data.revenue && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricDisplay
              label="Today"
              value={formatCurrency(data.revenue.today)}
              variant={data.revenue.today > 0 ? "success" : "default"}
            />
            <MetricDisplay
              label="This Week"
              value={formatCurrency(data.revenue.week)}
              variant={data.revenue.week > 0 ? "success" : "default"}
            />
            <MetricDisplay
              label="This Month"
              value={formatCurrency(data.revenue.month)}
              variant={data.revenue.month > 0 ? "success" : "default"}
            />
            <MetricDisplay
              label="All Time"
              value={formatCurrency(data.revenue.total)}
            />
          </div>
        )}

        {/* Subscription Stats */}
        {data.subscriptionStats && (
          <div className="grid grid-cols-4 gap-4">
            <MetricDisplay
              label="Active"
              value={data.subscriptionStats.active}
              variant="success"
            />
            <MetricDisplay
              label="Trialing"
              value={data.subscriptionStats.trialing}
              variant="default"
            />
            <MetricDisplay
              label="Past Due"
              value={data.subscriptionStats.pastDue}
              variant={data.subscriptionStats.pastDue > 0 ? "warning" : "default"}
            />
            <MetricDisplay
              label="Canceled"
              value={data.subscriptionStats.canceled}
              variant={data.subscriptionStats.canceled > 0 ? "danger" : "default"}
            />
          </div>
        )}
      </IntegrationCard>

      {/* Recent Transactions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentCharges.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent transactions</p>
            ) : (
              data.recentCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        charge.status === "succeeded"
                          ? "bg-emerald-500/10"
                          : charge.status === "failed"
                          ? "bg-red-500/10"
                          : "bg-amber-500/10"
                      }`}
                    >
                      {charge.status === "succeeded" ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : charge.status === "failed" ? (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      ) : (
                        <Minus className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        {charge.description || "Payment"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {charge.customerEmail || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        charge.status === "succeeded"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {formatCurrency(charge.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(charge.created)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Customers */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Recent Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentCustomers.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent customers</p>
            ) : (
              data.recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-white">
                      {customer.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDate(customer.created)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

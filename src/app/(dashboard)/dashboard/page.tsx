"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RiskScore } from "@/components/dashboard/risk-score";
import { ExposureCard } from "@/components/dashboard/exposure-card";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import {
  AlertTriangle,
  Search,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Mock data for development
const mockStats = {
  totalExposures: 47,
  activeExposures: 23,
  removedExposures: 18,
  whitelistedItems: 6,
  pendingRemovals: 12,
  riskScore: 68,
};

const mockRecentExposures = [
  {
    id: "1",
    source: "SPOKEO" as const,
    sourceName: "Spokeo - People Search",
    sourceUrl: "https://spokeo.com",
    dataType: "COMBINED_PROFILE" as const,
    dataPreview: "J*** D** - 123 M*** St, City",
    severity: "HIGH" as const,
    status: "ACTIVE" as const,
    isWhitelisted: false,
    firstFoundAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    source: "HAVEIBEENPWNED" as const,
    sourceName: "Have I Been Pwned - LinkedIn Breach",
    sourceUrl: null,
    dataType: "EMAIL" as const,
    dataPreview: "j***@g***.com",
    severity: "CRITICAL" as const,
    status: "ACTIVE" as const,
    isWhitelisted: false,
    firstFoundAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    source: "LINKEDIN" as const,
    sourceName: "LinkedIn Profile",
    sourceUrl: "https://linkedin.com",
    dataType: "USERNAME" as const,
    dataPreview: "@johndoe",
    severity: "LOW" as const,
    status: "WHITELISTED" as const,
    isWhitelisted: true,
    firstFoundAt: new Date("2024-01-05"),
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-slate-400">
            Here&apos;s an overview of your data exposure
          </p>
        </div>
        <Link href="/dashboard/scan">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Search className="mr-2 h-4 w-4" />
            Start New Scan
          </Button>
        </Link>
      </div>

      {/* Upgrade Banner - shows for FREE users only */}
      <UpgradeBanner variant="card" />

      {/* Risk Score and Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Risk Score Card */}
        <Card className="bg-slate-800/50 border-slate-700 md:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center justify-center py-6">
            <RiskScore score={mockStats.riskScore} size="md" />
          </CardContent>
        </Card>

        {/* Active Exposures */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Exposures
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mockStats.activeExposures}
            </div>
            <div className="flex items-center text-xs text-red-400">
              <TrendingUp className="mr-1 h-3 w-3" />
              +5 from last scan
            </div>
          </CardContent>
        </Card>

        {/* Removed */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Successfully Removed
            </CardTitle>
            <Trash2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mockStats.removedExposures}
            </div>
            <div className="flex items-center text-xs text-emerald-400">
              <TrendingDown className="mr-1 h-3 w-3" />
              3 this week
            </div>
          </CardContent>
        </Card>

        {/* Whitelisted */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Whitelisted
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mockStats.whitelistedItems}
            </div>
            <p className="text-xs text-slate-500">
              Accounts you want to keep
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Removals Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Removal Progress</CardTitle>
          <CardDescription className="text-slate-400">
            {mockStats.pendingRemovals} removal requests in progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Data Brokers</span>
              <span className="text-white">8/12 completed</span>
            </div>
            <Progress value={66} className="h-2 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Breach Notifications</span>
              <span className="text-white">5/7 completed</span>
            </div>
            <Progress value={71} className="h-2 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Social Media</span>
              <span className="text-white">3/5 completed</span>
            </div>
            <Progress value={60} className="h-2 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Exposures */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Recent Exposures</CardTitle>
            <CardDescription className="text-slate-400">
              Latest data exposures found in your scans
            </CardDescription>
          </div>
          <Link href="/dashboard/exposures">
            <Button variant="ghost" className="text-emerald-500 hover:text-emerald-400">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRecentExposures.map((exposure) => (
            <ExposureCard
              key={exposure.id}
              {...exposure}
              onWhitelist={() => console.log("Whitelist", exposure.id)}
              onUnwhitelist={() => console.log("Unwhitelist", exposure.id)}
              onRemove={() => console.log("Remove", exposure.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

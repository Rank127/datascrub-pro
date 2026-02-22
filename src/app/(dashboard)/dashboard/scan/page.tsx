"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Globe,
  AlertTriangle,
  Crown,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { UpgradeCta } from "@/components/dashboard/upgrade-cta";
import { getBrokerCount } from "@/lib/removers/data-broker-directory";
import { trackScanStarted, trackScanCompleted } from "@/components/analytics/google-analytics";
import { ScanComparisonWidget } from "@/components/dashboard/scan-comparison-widget";

const TOTAL_KNOWN_BROKERS = getBrokerCount();

interface Scan {
  id: string;
  type: string;
  status: string;
  exposuresFound: number;
  sourcesChecked: number;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  possiblyStuck?: boolean;
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<"QUICK" | "FULL">("FULL");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    exposuresFound: number;
    sourcesChecked: number;
    scanId: string;
    severityCounts?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    userPlan?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [profileCompleteness, setProfileCompleteness] = useState<{
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasAddress: boolean;
    hasDob: boolean;
    isComplete: boolean;
    loading: boolean;
  }>({ hasName: false, hasEmail: false, hasPhone: false, hasAddress: false, hasDob: false, isComplete: false, loading: true });
  const { plan: _plan, isFreePlan } = useSubscription();

  useEffect(() => {
    fetchRecentScans();
    fetchProfileCompleteness();
  }, []);

  const fetchProfileCompleteness = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        const p = data.profile;
        if (p) {
          const hasName = !!p.fullName?.trim();
          const hasEmail = Array.isArray(p.emails) && p.emails.length > 0;
          const hasPhone = Array.isArray(p.phones) && p.phones.length > 0;
          const hasAddress = Array.isArray(p.addresses) && p.addresses.length > 0;
          const hasDob = !!p.dateOfBirth;
          setProfileCompleteness({
            hasName,
            hasEmail,
            hasPhone,
            hasAddress,
            hasDob,
            isComplete: hasName && (hasEmail || hasPhone) && hasAddress && hasDob,
            loading: false,
          });
        } else {
          setProfileCompleteness(prev => ({ ...prev, loading: false }));
        }
      } else {
        setProfileCompleteness(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setProfileCompleteness(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchRecentScans = async () => {
    try {
      const response = await fetch("/api/scan/status");
      if (response.ok) {
        const data = await response.json();
        setRecentScans(data.scans || []);
      }
    } catch (err) {
      console.error("Failed to fetch scans:", err);
      toast.error("Failed to load scan history");
    } finally {
      setLoadingScans(false);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setError("");
    setRequiresUpgrade(false);
    setProfileIncomplete(false);
    setScanResult(null);
    setScanProgress(0);

    // Track scan started
    trackScanStarted(scanType);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      // 4-minute client timeout — server has 5 min max, so if we hit this the scan likely stalled
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4 * 60 * 1000);

      const response = await fetch("/api/scan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: scanType }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Scan failed");
        if (data.requiresUpgrade) {
          setRequiresUpgrade(true);
        }
        if (data.profileIncomplete) {
          setProfileIncomplete(true);
        }
        return;
      }

      const data = await response.json();
      setScanProgress(100);
      setScanResult(data);

      // Track scan completed
      trackScanCompleted(scanType, data.exposuresFound, data.sourcesChecked);

      fetchRecentScans();
    } catch (err) {
      clearInterval(progressInterval);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Scan is taking longer than expected. Check back in a few minutes — your results will appear here.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "IN_PROGRESS":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  // Determine recommended plan based on exposure severity
  const getRecommendedPlan = () => {
    if (!scanResult?.severityCounts) return null;
    const { critical, high, medium, low } = scanResult.severityCounts;
    const totalExposures = critical + high + medium + low;

    if (totalExposures === 0) return null;

    // Recommend Enterprise for critical/high severity or many exposures
    if (critical > 0 || high >= 3 || totalExposures >= 10) {
      return {
        plan: "ENTERPRISE",
        title: "Enterprise Protection Recommended",
        reason: critical > 0
          ? `You have ${critical} critical exposure${critical !== 1 ? 's' : ''} that require immediate attention.`
          : high >= 3
          ? `You have ${high} high-severity exposures that put your identity at serious risk.`
          : `With ${totalExposures} exposures found, you need comprehensive protection.`,
        features: [
          "Automated removal from 2,000+ data brokers",
          "AI Shield protection from AI training data",
          "Priority removal processing",
          "Dedicated support & removal verification",
          "Dark web monitoring",
        ],
        price: "$22.50/mo",
        originalPrice: "$49.99/month",
        savings: "55% OFF — Billed annually at $269.95. 30-day money-back guarantee",
        cta: "Protect My Data Now",
        urgency: critical > 0 ? "URGENT: Your data is at critical risk" : "Your identity is at high risk",
      };
    }

    // Recommend Pro for medium/low severity
    return {
      plan: "PRO",
      title: "Pro Protection Recommended",
      reason: high > 0
        ? `You have ${high} high-severity exposure${high !== 1 ? 's' : ''} that should be addressed.`
        : `We found ${totalExposures} exposure${totalExposures !== 1 ? 's' : ''} of your personal data.`,
      features: [
        "Automated removal requests",
        "Monthly monitoring scans",
        "Email & form opt-out automation",
        "Removal tracking dashboard",
      ],
      price: "$9.99/mo",
      originalPrice: "$19.99/month",
      savings: "50% OFF — Billed annually at $119.88. 30-day money-back guarantee",
      cta: "Start Removing My Data",
      urgency: high > 0 ? "Act now to protect your privacy" : "Take control of your data",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Scan"
        description="Scan the web to find where your personal data is exposed"
      />

      {/* Scan Type Selection */}
      <div className={`grid gap-4 ${isFreePlan ? "md:grid-cols-1 max-w-xl" : "md:grid-cols-2"}`}>
        {/* Quick Scan - Only show for paid plans */}
        {!isFreePlan && (
          <Card
            className={`cursor-pointer transition-all ${
              scanType === "QUICK"
                ? "border-emerald-500 bg-emerald-500/10"
                : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
            }`}
            onClick={() => !isScanning && setScanType("QUICK")}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-white">Quick Scan</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Check breach databases for your email addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Have I Been Pwned check
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Breach database monitoring
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-slate-600" />
                  Data broker search
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-slate-600" />
                  Social media scan
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        <Card
          className={`cursor-pointer transition-all ${
            scanType === "FULL"
              ? "border-emerald-500 bg-emerald-500/10"
              : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
          }`}
          onClick={() => !isScanning && setScanType("FULL")}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-white">Full Scan</CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                {isFreePlan ? "Free Plan" : "Recommended"}
              </Badge>
            </div>
            <CardDescription className="text-slate-400">
              Comprehensive search across all data sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                Have I Been Pwned check
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                2,000+ data source searches
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                Social media scanning
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-purple-500" />
                Dark web monitoring (Enterprise)
              </li>
            </ul>
            {isFreePlan && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-400 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  See your full exposure, then upgrade to remove your data automatically
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan Button / Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {requiresUpgrade && (
                  <Link
                    href="/pricing"
                    className="ml-2 text-emerald-400 hover:text-emerald-300 underline"
                  >
                    View Plans
                  </Link>
                )}
                {profileIncomplete && (
                  <Link
                    href="/dashboard/profile"
                    className="ml-2 text-emerald-400 hover:text-emerald-300 underline font-medium"
                  >
                    Go to Profile
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isScanning ? (
            <div className="space-y-5">
              {/* Patience message */}
              <div className="text-center space-y-3 py-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 animate-pulse">
                  <Search className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Deep Scan in Progress
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  We&apos;re checking 50+ data broker sites, breach databases, and public records for your personal information. This thorough scan typically takes 1–3 minutes.
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Scanning...</span>
                  <span className="text-slate-400 text-sm">{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2 bg-slate-700" />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking data brokers, breach databases, and social media...</span>
              </div>
            </div>
          ) : scanResult ? (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-2">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Scan Complete
                  </h3>
                  <p className="text-slate-400">
                    Found {scanResult.exposuresFound} exposures across{" "}
                    {scanResult.sourcesChecked} sources
                  </p>
                </div>

                {/* Severity breakdown */}
                {scanResult.severityCounts && scanResult.exposuresFound > 0 && (
                  <div className="flex justify-center gap-3 flex-wrap">
                    {scanResult.severityCounts.critical > 0 && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        {scanResult.severityCounts.critical} Critical
                      </Badge>
                    )}
                    {scanResult.severityCounts.high > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {scanResult.severityCounts.high} High
                      </Badge>
                    )}
                    {scanResult.severityCounts.medium > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {scanResult.severityCounts.medium} Medium
                      </Badge>
                    )}
                    {scanResult.severityCounts.low > 0 && (
                      <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                        {scanResult.severityCounts.low} Low
                      </Badge>
                    )}
                  </div>
                )}

                {/* Max Exposure Warning */}
                {scanResult.exposuresFound > 0 && (
                  <div className="mx-auto max-w-lg p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <span className="font-semibold text-orange-300">Your Data Exposure is Significant</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">
                      We found your data on <strong className="text-white">{scanResult.exposuresFound} sites</strong> out of <strong className="text-white">{TOTAL_KNOWN_BROKERS.toLocaleString()}+</strong> known data broker sites.
                      {isFreePlan
                        ? " Without protection, your data stays exposed and continues to spread."
                        : " We're actively working to remove your data from these sites."}
                    </p>
                    {isFreePlan && (
                      <>
                        <p className="text-xs text-slate-400 mb-1">
                          Removing your data manually would take ~{Math.round(scanResult.exposuresFound * 0.75)} hours — contacting {scanResult.exposuresFound} sites individually.
                        </p>
                        <p className="text-xs text-orange-400/80 mb-2">
                          Each day your data stays listed, it can be accessed, sold, and re-shared across new databases.
                        </p>
                      </>
                    )}
                    {(() => {
                      const lastScan = recentScans.find(s => s.status === "COMPLETED" && s.id !== scanResult.scanId);
                      if (lastScan) {
                        const daysSince = Math.floor((Date.now() - new Date(lastScan.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSince > 7) {
                          return (
                            <p className="text-xs text-amber-400 mb-2">
                              Your last scan was {daysSince} days ago. New exposures may have appeared since then.
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(1, (scanResult.exposuresFound / TOTAL_KNOWN_BROKERS) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{scanResult.exposuresFound} found</span>
                      <span>{TOTAL_KNOWN_BROKERS.toLocaleString()}+ known sites</span>
                    </div>
                    {isFreePlan && (
                      <Link href="/dashboard/checkout" className="block mt-3">
                        <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                          <Shield className="mr-2 h-4 w-4" />
                          Upgrade to remove your data automatically
                        </Button>
                      </Link>
                    )}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Link href="/dashboard/exposures">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      View Exposures
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-slate-600"
                    onClick={() => setScanResult(null)}
                  >
                    New Scan
                  </Button>
                </div>
              </div>

              {/* Upgrade Recommendation for FREE users */}
              {isFreePlan && scanResult.exposuresFound > 0 && (() => {
                const recommendation = getRecommendedPlan();
                if (!recommendation) return null;
                const showUrgency = scanResult.severityCounts &&
                  (scanResult.severityCounts.critical > 0 || scanResult.severityCounts.high >= 3);

                return (
                  <UpgradeCta
                    badge="Recommended for you"
                    icon={<Crown className={`h-5 w-5 ${recommendation.plan === "ENTERPRISE" ? "text-purple-400" : "text-emerald-400"}`} />}
                    title={recommendation.title}
                    description={
                      <>
                        {showUrgency && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">{recommendation.urgency}</span>
                          </div>
                        )}
                        <p>{recommendation.reason}</p>
                        <div className="mt-2">
                          {recommendation.originalPrice && (
                            <span className="text-sm text-slate-500 line-through mr-2">{recommendation.originalPrice}</span>
                          )}
                          <span className="text-2xl font-bold text-white">{recommendation.price}</span>
                          <p className="text-sm text-emerald-400">{recommendation.savings}</p>
                        </div>
                        {recommendation.plan === "PRO" ? (
                          <p className="text-sm text-slate-400 mt-3">
                            Or get maximum protection with{" "}
                            <Link href="/dashboard/checkout?plan=ENTERPRISE" className="text-purple-400 hover:text-purple-300 underline">
                              Enterprise — dark web monitoring, family plan &amp; more
                            </Link>
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 mt-3">
                            Or{" "}
                            <Link href="/dashboard/checkout?plan=PRO" className="text-emerald-400 hover:text-emerald-300 underline">
                              start with Pro at $9.99/mo
                            </Link>
                          </p>
                        )}
                      </>
                    }
                    features={recommendation.features}
                    ctaText={<><Shield className="mr-2 h-4 w-4" />{recommendation.cta}</>}
                    ctaHref={`/dashboard/checkout?plan=${recommendation.plan}`}
                    colorScheme={recommendation.plan === "ENTERPRISE" ? "purple" : "emerald"}
                  />
                );
              })()}
            </div>
          ) : (
            <div className="text-center space-y-4">
              {/* Profile completeness banner */}
              {!profileCompleteness.loading && !profileCompleteness.hasEmail && (
                <div className="mx-auto max-w-lg p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span className="font-semibold text-red-300">Profile required before scanning</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    We only scan information from your profile. Add at least your email address to get started.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasName ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasName
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <UserCircle className="h-3.5 w-3.5 text-red-400" />}
                      Full name
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-3.5 w-3.5 text-red-400" />
                      Email address <span className="text-red-400 text-xs">(required)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasPhone ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasPhone
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <Phone className="h-3.5 w-3.5 text-red-400" />}
                      Phone number
                    </div>
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasAddress ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasAddress
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <MapPin className="h-3.5 w-3.5 text-red-400" />}
                      Home address
                    </div>
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasDob ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasDob
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <Calendar className="h-3.5 w-3.5 text-red-400" />}
                      Date of birth
                    </div>
                  </div>
                  <Link href="/dashboard/profile">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Complete Your Profile
                    </Button>
                  </Link>
                </div>
              )}
              {!profileCompleteness.loading && profileCompleteness.hasEmail && !profileCompleteness.isComplete && (
                <div className="mx-auto max-w-lg p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <span className="font-semibold text-amber-300">Add more info for better results</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    The more info you provide, the more exposures we can find. Add missing details to your{" "}
                    <Link href="/dashboard/profile" className="text-emerald-400 hover:underline font-medium">
                      profile
                    </Link>.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasName ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasName
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <UserCircle className="h-3.5 w-3.5 text-amber-400" />}
                      Full name
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Email address
                    </div>
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasPhone ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasPhone
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <Phone className="h-3.5 w-3.5 text-amber-400" />}
                      Phone number
                    </div>
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasAddress ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasAddress
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <MapPin className="h-3.5 w-3.5 text-amber-400" />}
                      Home address
                    </div>
                    <div className={`flex items-center gap-2 ${profileCompleteness.hasDob ? "text-emerald-400" : "text-slate-400"}`}>
                      {profileCompleteness.hasDob
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : <Calendar className="h-3.5 w-3.5 text-amber-400" />}
                      Date of birth
                    </div>
                  </div>
                </div>
              )}
              {!profileCompleteness.loading && profileCompleteness.isComplete && (
                <div className="mx-auto max-w-lg flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Profile complete — ready for best scan results</span>
                </div>
              )}
              {profileCompleteness.hasEmail ? (
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={startScan}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Start {scanType === "QUICK" ? "Quick" : "Full"} Scan
                </Button>
              ) : !profileCompleteness.loading ? (
                <Button
                  size="lg"
                  className="bg-slate-600 cursor-not-allowed opacity-50"
                  disabled
                >
                  <Search className="mr-2 h-5 w-5" />
                  Complete Profile to Scan
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Comparison Widget — shows after at least one scan */}
      {recentScans.length > 0 && <ScanComparisonWidget />}

      {/* Recent Scans */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Scans</CardTitle>
          <CardDescription className="text-slate-400">
            Your scan history and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingScans ? (
            <LoadingSpinner className="flex items-center justify-center py-8" />
          ) : recentScans.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No scans yet. Start your first scan above.
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(scan.status)}
                    <div>
                      <p className="font-medium text-white">
                        {scan.type} Scan
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(scan.createdAt).toLocaleDateString()} at{" "}
                        {new Date(scan.createdAt).toLocaleTimeString()}
                      </p>
                      {scan.possiblyStuck && (
                        <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          This scan may have stalled. Try starting a new one.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {scan.exposuresFound} exposures
                    </p>
                    <p className="text-xs text-slate-400">
                      {scan.sourcesChecked} sources checked
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

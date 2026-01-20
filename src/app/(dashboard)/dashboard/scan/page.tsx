"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";

interface Scan {
  id: string;
  type: string;
  status: string;
  exposuresFound: number;
  sourcesChecked: number;
  progress: number;
  createdAt: string;
  completedAt: string | null;
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<"QUICK" | "FULL">("FULL");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    exposuresFound: number;
    sourcesChecked: number;
    scanId: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const response = await fetch("/api/scan/status");
      if (response.ok) {
        const data = await response.json();
        setRecentScans(data.scans || []);
      }
    } catch (err) {
      console.error("Failed to fetch scans:", err);
    } finally {
      setLoadingScans(false);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setError("");
    setScanResult(null);
    setScanProgress(0);

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
      const response = await fetch("/api/scan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: scanType }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Scan failed");
        return;
      }

      const data = await response.json();
      setScanProgress(100);
      setScanResult(data);
      fetchRecentScans();
    } catch (err) {
      clearInterval(progressInterval);
      setError("An error occurred. Please try again.");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Scan</h1>
        <p className="text-slate-400">
          Scan the web to find where your personal data is exposed
        </p>
      </div>

      {/* Scan Type Selection */}
      <div className="grid gap-4 md:grid-cols-2">
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
                Recommended
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
                8+ data broker searches
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
          </CardContent>
        </Card>
      </div>

      {/* Scan Button / Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isScanning ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Scanning...</span>
                <span className="text-slate-400">{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-2 bg-slate-700" />
              <p className="text-sm text-slate-500 text-center">
                Checking data brokers, breach databases, and social media...
              </p>
            </div>
          ) : scanResult ? (
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
          ) : (
            <div className="text-center space-y-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={startScan}
              >
                <Search className="mr-2 h-5 w-5" />
                Start {scanType === "QUICK" ? "Quick" : "Full"} Scan
              </Button>
              <p className="text-sm text-slate-500">
                Make sure you&apos;ve completed your{" "}
                <Link href="/dashboard/profile" className="text-emerald-500 hover:underline">
                  profile
                </Link>{" "}
                before scanning
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
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

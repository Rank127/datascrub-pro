"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Landmark,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  Shield,
  Info,
  HelpCircle,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";

interface DropSubmission {
  id: string;
  status: string;
  submittedAt: string | null;
  dropConfId: string | null;
  brokersAtSubmit: number | null;
}

interface ProfileReadiness {
  hasFullName: boolean;
  hasDOB: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  isReady: boolean;
  missingFields: string[];
}

interface DropStats {
  totalExposures: number;
  dropCoveredExposures: number;
  directHandledExposures: number;
  caRegisteredBrokerCount: number;
}

interface DropInfo {
  title: string;
  description: string;
  eligibility: string;
  complianceDeadline: string;
  penalty: string;
}

interface DropData {
  submission: DropSubmission | null;
  readiness: ProfileReadiness;
  stats: DropStats;
  dropPortalUrl: string;
  info: DropInfo;
}

export default function DropPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DropData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [confId, setConfId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDropData();
  }, []);

  const fetchDropData = async () => {
    setError(null);
    try {
      const response = await fetch("/api/drop");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch DROP data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("DROP fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load DROP data");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSubmission = async (status: "SUBMITTED" | "CONFIRMED" | "REVOKED") => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(confId.trim() ? { dropConfId: confId.trim() } : {}),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update DROP status");
      }

      toast.success(
        status === "SUBMITTED"
          ? "DROP submission recorded"
          : status === "CONFIRMED"
            ? "DROP submission confirmed"
            : "DROP submission revoked"
      );
      setShowConfirmForm(false);
      setConfId("");
      fetchDropData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="flex items-center justify-center py-24" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="California DROP"
          description="Delete Request and Opt-out Platform"
        />
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-white mb-2">Failed to Load</h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <Button
                onClick={() => {
                  setLoading(true);
                  fetchDropData();
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const hasActiveSubmission =
    data.submission?.status === "SUBMITTED" || data.submission?.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      <PageHeader
        title="California DROP"
        description="Delete Request and Opt-out Platform — one request covers ~530 CA-registered data brokers"
      />

      {/* Section 1: DROP Status Card */}
      <Card className={`border ${hasActiveSubmission ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/50 border-slate-700"}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-amber-400" />
            {hasActiveSubmission ? "DROP Submission Active" : "Submit to California DROP"}
          </CardTitle>
          <CardDescription>
            {hasActiveSubmission
              ? "Your DROP deletion request is on file with the California Privacy Protection Agency"
              : "Submit a free deletion request that covers all CA-registered data brokers"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasActiveSubmission ? (
            <>
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">
                    DROP {data.submission!.status === "CONFIRMED" ? "Confirmed" : "Submitted"}
                  </div>
                  {data.submission!.submittedAt && (
                    <div className="text-sm text-slate-400">
                      Submitted: {new Date(data.submission!.submittedAt).toLocaleDateString()}
                    </div>
                  )}
                  {data.submission!.dropConfId && (
                    <div className="text-sm text-slate-400">
                      Confirmation ID: {data.submission!.dropConfId}
                    </div>
                  )}
                  {data.submission!.brokersAtSubmit && (
                    <div className="text-sm text-slate-400">
                      Covered {data.submission!.brokersAtSubmit} CA-registered brokers at time of submission
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {data.submission!.status === "SUBMITTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmForm(true)}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    Add Confirmation ID
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRecordSubmission("REVOKED")}
                  disabled={submitting}
                  className="text-slate-400 hover:text-red-400"
                >
                  Revoke Submission
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-300">
                California&apos;s DELETE Act (SB 362) created a free portal where you can submit a single deletion request
                that covers all ~530 data brokers registered with the state. This is the most powerful single action you can take
                to remove your data from people-search sites and data aggregators.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={data.dropPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Submit to DROP Portal
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmForm(true)}
                  className="border-slate-600"
                >
                  I&apos;ve Already Submitted
                </Button>
              </div>
            </>
          )}

          {/* Confirm form */}
          {showConfirmForm && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
              <Label htmlFor="confId" className="text-white">
                DROP Confirmation ID (optional)
              </Label>
              <Input
                id="confId"
                placeholder="Enter your DROP confirmation ID"
                value={confId}
                onChange={(e) => setConfId(e.target.value)}
                className="bg-slate-900 border-slate-700"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleRecordSubmission(confId.trim() ? "CONFIRMED" : "SUBMITTED")
                  }
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Record Submission"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmForm(false);
                    setConfId("");
                  }}
                  className="border-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Profile Readiness */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-400" />
            Profile Readiness for DROP
          </CardTitle>
          <CardDescription>
            DROP requires your full name, date of birth, and at least one contact method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ReadinessItem label="Full Name" ready={data.readiness.hasFullName} />
            <ReadinessItem label="Date of Birth" ready={data.readiness.hasDOB} />
            <ReadinessItem
              label="Phone Number"
              ready={data.readiness.hasPhone}
              optional={data.readiness.hasEmail}
            />
            <ReadinessItem
              label="Email Address"
              ready={data.readiness.hasEmail}
              optional={data.readiness.hasPhone}
            />
          </div>
          {!data.readiness.isReady && (
            <div className="mt-4">
              <Link href="/dashboard/profile">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Complete Your Profile
                </Button>
              </Link>
            </div>
          )}
          {data.readiness.isReady && (
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              Your profile is ready for DROP submission
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Coverage Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Coverage Breakdown
          </CardTitle>
          <CardDescription>
            How DROP and GhostMyData work together to protect your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              label="Total Active Exposures"
              value={data.stats.totalExposures}
              color="text-white"
            />
            <StatCard
              label="DROP-Covered Brokers"
              value={data.stats.dropCoveredExposures}
              color="text-amber-400"
              sublabel={`of ${data.stats.caRegisteredBrokerCount} CA-registered`}
            />
            <StatCard
              label="GhostMyData Direct"
              value={data.stats.directHandledExposures}
              color="text-emerald-400"
              sublabel="handled via CCPA email"
            />
          </div>
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                <strong className="text-white">DROP + GhostMyData = Comprehensive Coverage.</strong>{" "}
                DROP handles CA-registered brokers with a single request. GhostMyData handles the remaining
                brokers directly via individual CCPA/privacy emails, plus ongoing monitoring and re-removal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: FAQ */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-sky-400" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FaqItem
            question="What is California DROP?"
            answer="DROP (Delete Request and Opt-out Platform) is a free service created by California's DELETE Act (SB 362). It lets consumers submit one deletion request that is sent to all ~530 data brokers registered with the California Attorney General. The consumer portal launched January 1, 2026."
          />
          <FaqItem
            question="Am I eligible to use DROP?"
            answer="DROP is primarily for California residents, but many data brokers honor DROP requests regardless of state residency since they process all requests through the same system. We recommend submitting even if you're not in California."
          />
          <FaqItem
            question="How long does it take?"
            answer="Data brokers have until August 1, 2026 to comply with DROP requests. After that deadline, brokers face penalties of $200 per day per unfulfilled request. Many major brokers are already processing requests ahead of the deadline."
          />
          <FaqItem
            question="Does DROP replace GhostMyData?"
            answer="No — they complement each other. DROP covers CA-registered brokers only. GhostMyData handles hundreds of additional brokers not on the CA registry, provides ongoing monitoring for re-listing, automated re-removal, and tracks your privacy score over time."
          />
          <FaqItem
            question="What information does DROP need?"
            answer="DROP requires your full legal name, date of birth, and at least one contact method (phone or email). Make sure your GhostMyData profile is complete — we'll check your readiness above."
          />

          <div className="pt-4 border-t border-slate-700">
            <Link
              href="/blog/california-drop-system-delete-request-platform"
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
            >
              Read our full guide to the California DROP system
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <strong className="text-white">Phase 2 Coming Spring 2026:</strong>{" "}
              When the DROP API launches, GhostMyData will be able to submit DROP requests on your behalf
              as an authorized agent — no manual portal visit needed. We&apos;ll notify you when this is available.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReadinessItem({
  label,
  ready,
  optional,
}: {
  label: string;
  ready: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {ready ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : optional ? (
        <CheckCircle className="h-5 w-5 text-slate-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-400" />
      )}
      <span className={ready ? "text-white" : optional ? "text-slate-500" : "text-red-300"}>
        {label}
        {!ready && optional && " (optional — other contact method provided)"}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  sublabel,
}: {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h4 className="font-medium text-white mb-1">{question}</h4>
      <p className="text-sm text-slate-400">{answer}</p>
    </div>
  );
}

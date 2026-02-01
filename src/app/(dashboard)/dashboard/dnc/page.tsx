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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  PhoneOff,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
  Info,
  Shield,
  Lightbulb,
  Ban,
  Vote,
  Heart,
  ClipboardList,
  Smartphone,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface DNCRegistration {
  id: string;
  phoneNumber: string;
  status: string;
  registeredAt: string | null;
  verifiedAt: string | null;
  phoneType: string;
}

interface DNCStats {
  total: number;
  pending: number;
  submitted: number;
  verified: number;
  failed: number;
}

interface DNCInfo {
  registryUrl: string;
  phoneNumber: string;
  description: string;
  benefits: string[];
  limitations: string[];
}

interface DNCData {
  registrations: DNCRegistration[];
  stats: DNCStats;
  info: DNCInfo;
}

export default function DNCPage() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [data, setData] = useState<DNCData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneType, setPhoneType] = useState<string>("MOBILE");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isPlanEnterprise = plan === "ENTERPRISE";

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      }
    };
    fetchPlan();
  }, []);

  useEffect(() => {
    if (plan === "ENTERPRISE") {
      fetchDNCData();
    } else if (plan !== null) {
      setLoading(false);
    }
  }, [plan]);

  const fetchDNCData = async () => {
    try {
      const response = await fetch("/api/dnc");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch DNC data");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("DNC fetch error:", error);
      toast.error("Failed to load DNC data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/dnc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: newPhone, phoneType }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add phone number");
      }

      toast.success("Phone number added successfully");
      setNewPhone("");
      setShowAddForm(false);
      fetchDNCData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add phone number");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/dnc/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit registration");
      }

      toast.success(result.message || "Registration submitted");
      fetchDNCData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/dnc/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify");
      }

      toast.success(result.isRegistered ? "Number is on DNC registry" : "Number not found on registry");
      fetchDNCData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this registration?")) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/dnc/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete");
      }

      toast.success("Registration removed");
      fetchDNCData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "SUBMITTED":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "FAILED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "Verified on Registry";
      case "SUBMITTED":
        return "Submitted - Pending Verification";
      case "PENDING":
        return "Pending Submission";
      case "FAILED":
        return "Failed";
      default:
        return status;
    }
  };

  // Show upgrade prompt for non-Enterprise users
  if (!isPlanEnterprise) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Do Not Call Registry</h1>
          <p className="text-slate-400 mt-1">
            Register your phone numbers on the National Do Not Call Registry
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
                <PhoneOff className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Enterprise Feature
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Do Not Call Registry registration is available exclusively for
                Enterprise plan subscribers. Reduce unwanted telemarketing calls
                by registering your phone numbers.
              </p>
              <Link href="/dashboard/settings?tab=billing">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Upgrade to Enterprise
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Do Not Call Registry</h1>
          <p className="text-slate-400 mt-1">
            Register your phone numbers to reduce telemarketing calls
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Phone Number
        </Button>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="text-sm text-slate-400">Total</div>
              <div className="text-2xl font-bold text-white">{data.stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="text-sm text-slate-400">Pending</div>
              <div className="text-2xl font-bold text-yellow-500">{data.stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="text-sm text-slate-400">Submitted</div>
              <div className="text-2xl font-bold text-blue-500">{data.stats.submitted}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="text-sm text-slate-400">Verified</div>
              <div className="text-2xl font-bold text-emerald-500">{data.stats.verified}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="text-sm text-slate-400">Failed</div>
              <div className="text-2xl font-bold text-red-500">{data.stats.failed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Phone Form */}
      {showAddForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add Phone Number</CardTitle>
            <CardDescription>
              Enter a phone number to register on the Do Not Call Registry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPhone} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Phone Type</Label>
                  <Select value={phoneType} onValueChange={setPhoneType}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILE">Mobile</SelectItem>
                      <SelectItem value="LANDLINE">Landline</SelectItem>
                      <SelectItem value="VOIP">VoIP</SelectItem>
                      <SelectItem value="UNKNOWN">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Phone Number"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Registrations List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Registered Numbers
          </CardTitle>
          <CardDescription>
            Phone numbers registered or pending registration on the DNC registry
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.registrations && data.registrations.length > 0 ? (
            <div className="space-y-4">
              {data.registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(reg.status)}
                    <div>
                      <div className="font-medium text-white">{reg.phoneNumber}</div>
                      <div className="text-sm text-slate-400">
                        {reg.phoneType} • {getStatusText(reg.status)}
                      </div>
                      {reg.verifiedAt && (
                        <div className="text-xs text-slate-500">
                          Verified: {new Date(reg.verifiedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reg.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmit(reg.id)}
                        disabled={actionLoading === reg.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {actionLoading === reg.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    )}
                    {reg.status === "SUBMITTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(reg.id)}
                        disabled={actionLoading === reg.id}
                        className="border-slate-700"
                      >
                        {actionLoading === reg.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(reg.id)}
                      disabled={actionLoading === reg.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <PhoneOff className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p>No phone numbers registered yet</p>
              <p className="text-sm">Add a phone number to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {data?.info && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5" />
              About the Do Not Call Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400">{data.info.description}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {data.info.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Limitations
                </h4>
                <ul className="space-y-1">
                  {data.info.limitations.map((limitation, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-yellow-500">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700">
              <a
                href={data.info.registryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
              >
                Visit DoNotCall.gov
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-400 text-sm">
                Call: {data.info.phoneNumber}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workarounds for Exempt Callers */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Workarounds for Exempt Callers
          </CardTitle>
          <CardDescription className="text-slate-300">
            The DNC registry doesn&apos;t stop political calls, charities, or surveys. Here&apos;s how to reduce them anyway.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Political Calls */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Vote className="h-5 w-5 text-blue-400" />
              <h4 className="font-semibold text-white">Political Calls</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Ask to be removed</strong> - When you answer, say &quot;Please add me to your do-not-call list.&quot; They must comply.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Contact campaigns directly</strong> - Visit their website and submit opt-out requests.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Check state registries</strong> - Some states (like Indiana, Missouri) have separate political call restrictions.</span>
              </li>
            </ul>
          </div>

          {/* Charity Calls */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-pink-400" />
              <h4 className="font-semibold text-white">Charity Calls</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Request their internal DNC list</strong> - Charities must maintain their own do-not-call lists and honor removal requests.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Report persistent callers</strong> - File complaints with your state attorney general if they ignore requests.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Check for paid solicitors</strong> - Third-party telemarketers calling for charities ARE subject to DNC rules.</span>
              </li>
            </ul>
          </div>

          {/* Survey Calls */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-5 w-5 text-purple-400" />
              <h4 className="font-semibold text-white">Survey Calls</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Identify disguised sales calls</strong> - &quot;Surveys&quot; that pitch products are illegal. Report to FTC.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Opt out of market research</strong> - Register at <a href="https://www.surveyoptout.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">SurveyOptOut.com</a> to reduce legitimate survey calls.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Request removal</strong> - Ask legitimate survey companies to add you to their exclusion list.</span>
              </li>
            </ul>
          </div>

          {/* General Tips */}
          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <h4 className="font-semibold text-white">Universal Call Blocking Tips</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <Ban className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Use call blocking apps</strong> - Nomorobo, Hiya, RoboKiller, or Truecaller</span>
                </p>
                <p className="flex items-start gap-2">
                  <Ban className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Enable carrier blocking</strong> - AT&T Call Protect, Verizon Call Filter, T-Mobile Scam Shield</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <Ban className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Silence unknown callers</strong> - iPhone/Android can auto-silence non-contacts</span>
                </p>
                <p className="flex items-start gap-2">
                  <Flag className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Report violations</strong> - File complaints at <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">ReportFraud.ftc.gov</a></span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

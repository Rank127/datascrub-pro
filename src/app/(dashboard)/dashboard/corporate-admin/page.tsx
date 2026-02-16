"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Mail,
  QrCode,
  CreditCard,
  Plus,
  RefreshCw,
  X,
  Download,
  Send,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Upload,
} from "lucide-react";

type Tab = "team" | "onboarding" | "billing";

interface SeatInfo {
  id: string;
  seatNumber: number;
  status: string;
  qrCode: string;
  onboardedAt: string | null;
  userName: string | null;
  userEmail: string | null;
  userId: string | null;
  lastScanAt: string | null;
  removalCount: number;
}

interface InviteInfo {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

interface InvoiceInfo {
  id: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  dueDate: number | null;
  createdAt: number;
  hostedUrl: string | null;
  pdfUrl: string | null;
}

interface AccountData {
  account: {
    id: string;
    name: string;
    tier: string;
    tierName: string;
    maxSeats: number;
    status: string;
    createdAt: string;
  };
  seats: SeatInfo[];
  invites: InviteInfo[];
  invoices: InvoiceInfo[];
  stats: {
    totalSeats: number;
    activeSeats: number;
    pendingInvites: number;
    totalRemovals: number;
  };
}

export default function CorporateAdminPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("team");

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkResult, setBulkResult] = useState<{ invited: number; skipped: string[]; errors: string[] } | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/corporate/admin");
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch {
      setError("Failed to load corporate account data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch("/api/corporate/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const json = await res.json();
      if (json.success) {
        setInviteEmail("");
        setShowInviteModal(false);
        fetchData();
      } else {
        alert(json.error || "Failed to send invite");
      }
    } catch {
      alert("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) return;

    setInviting(true);
    try {
      const res = await fetch("/api/corporate/bulk-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const json = await res.json();
      setBulkResult(json);
      fetchData();
    } catch {
      alert("Failed to send bulk invites");
    } finally {
      setInviting(false);
    }
  };

  const handleGenerateQR = async (seatId: string) => {
    setGeneratingQR(true);
    try {
      const res = await fetch("/api/corporate/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId }),
      });
      const json = await res.json();
      if (json.success && json.qrCode) {
        // Download QR code
        const link = document.createElement("a");
        link.download = `seat-${seatId}-qr.png`;
        link.href = json.qrCode;
        link.click();
      } else {
        alert(json.error || "Failed to generate QR code");
      }
    } catch {
      alert("Failed to generate QR code");
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/corporate/reports?action=generate");
      const json = await res.json();
      if (json.report) {
        const blob = new Blob([JSON.stringify(json.report, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      alert("Failed to generate report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error || "No corporate account found"}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "team" as Tab, label: "Team", icon: Users },
    { id: "onboarding" as Tab, label: "Onboarding", icon: QrCode },
    { id: "billing" as Tab, label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-violet-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">{data.account.name}</h1>
            <p className="text-slate-400">
              {data.account.tierName} Plan — {data.stats.activeSeats}/{data.stats.totalSeats} seats active
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 text-sm transition-colors"
        >
          <FileText className="w-4 h-4" />
          Compliance Report
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Seats", value: data.stats.totalSeats, color: "text-violet-400" },
          { label: "Active", value: data.stats.activeSeats, color: "text-emerald-400" },
          { label: "Pending Invites", value: data.stats.pendingInvites, color: "text-amber-400" },
          { label: "Total Removals", value: data.stats.totalRemovals, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Team Tab */}
      {activeTab === "team" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Team Members</h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Employee</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Onboarded</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Removals</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.seats.map((seat) => (
                  <tr key={seat.id} className="border-b border-slate-800/50 last:border-0">
                    <td className="px-4 py-3 text-sm text-slate-500">{seat.seatNumber}</td>
                    <td className="px-4 py-3">
                      {seat.userName ? (
                        <div>
                          <p className="text-sm text-white">{seat.userName}</p>
                          <p className="text-xs text-slate-400">{seat.userEmail}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          seat.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : seat.status === "INVITED"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {seat.status === "ACTIVE" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {seat.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {seat.onboardedAt
                        ? new Date(seat.onboardedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {seat.userId ? seat.removalCount : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {!seat.userName && (
                        <button
                          onClick={() => handleGenerateQR(seat.id)}
                          disabled={generatingQR}
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboarding Tab */}
      {activeTab === "onboarding" && (
        <div className="space-y-6">
          {/* QR Generation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">QR Code Onboarding</h3>
                <p className="text-sm text-slate-400">
                  Generate QR codes for employees to scan and activate their seats
                </p>
              </div>
              <button
                onClick={async () => {
                  setGeneratingQR(true);
                  try {
                    const unassigned = data.seats.filter(
                      (s) => !s.userName && s.status === "INVITED"
                    );
                    for (const seat of unassigned.slice(0, 10)) {
                      await handleGenerateQR(seat.id);
                    }
                  } finally {
                    setGeneratingQR(false);
                  }
                }}
                disabled={generatingQR}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {generatingQR ? "Generating..." : "Download All QR Codes"}
              </button>
            </div>
          </div>

          {/* CSV Bulk Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Bulk Invite</h3>
                <p className="text-sm text-slate-400">
                  Paste email addresses (one per line or comma-separated)
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
            </div>
          </div>

          {/* Pending Invites */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pending Invites</h3>
            {data.invites.filter((i) => i.status === "PENDING").length === 0 ? (
              <p className="text-sm text-slate-400">No pending invites</p>
            ) : (
              <div className="space-y-2">
                {data.invites
                  .filter((i) => i.status === "PENDING")
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm text-white">{invite.email}</p>
                        <p className="text-xs text-slate-400">
                          {invite.isExpired
                            ? "Expired"
                            : `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await fetch("/api/corporate/invite", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: invite.email }),
                            });
                            fetchData();
                          }}
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Plan</p>
                <p className="text-white font-medium">
                  Corporate {data.account.tierName}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className={`font-medium ${
                  data.account.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {data.account.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Since</p>
                <p className="text-white">
                  {new Date(data.account.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Seats</p>
                <p className="text-white">
                  {data.stats.activeSeats} / {data.stats.totalSeats} active
                </p>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Invoice History</h3>
            {data.invoices.length === 0 ? (
              <p className="text-sm text-slate-400">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {data.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-sm text-white">
                        ${(invoice.amountDue / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(invoice.createdAt * 1000).toLocaleDateString()} —{" "}
                        {invoice.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {invoice.hostedUrl && (
                        <a
                          href={invoice.hostedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          View
                        </a>
                      )}
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="employee@company.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"
            >
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Invitation
            </button>
          </div>
        </div>
      )}

      {/* Bulk Invite Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Bulk Invite</h3>
              <button onClick={() => { setShowBulkModal(false); setBulkResult(null); }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {bulkResult ? (
              <div className="space-y-3">
                <p className="text-emerald-400">{bulkResult.invited} invitations sent</p>
                {bulkResult.skipped.length > 0 && (
                  <div>
                    <p className="text-sm text-amber-400 mb-1">Skipped:</p>
                    {bulkResult.skipped.map((s, i) => (
                      <p key={i} className="text-xs text-slate-400">{s}</p>
                    ))}
                  </div>
                )}
                {bulkResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm text-red-400 mb-1">Errors:</p>
                    {bulkResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-slate-400">{e}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setShowBulkModal(false); setBulkResult(null); }}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">
                    Email Addresses (one per line or comma-separated)
                  </label>
                  <textarea
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder={"john@company.com\njane@company.com\nalice@company.com"}
                    rows={6}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 text-sm font-mono"
                  />
                </div>
                <button
                  onClick={handleBulkInvite}
                  disabled={inviting || !bulkEmails.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Invitations
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

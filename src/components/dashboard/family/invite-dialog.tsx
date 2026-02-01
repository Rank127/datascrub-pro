"use client";

import { useState } from "react";
import { UserPlus, Mail, Loader2, QrCode, Download, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteDialog({ open, onOpenChange, onSuccess }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "qr">("email");

  // QR code state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/family/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      onSuccess();
    } catch (error) {
      console.error("Error sending invitation:", error);
      const message = error instanceof Error ? error.message : "Failed to send invitation";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    setQrLoading(true);
    setError("");

    try {
      const response = await fetch("/api/family/qr-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: 300 }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate QR code");
      }

      setQrCode(result.qrCode);
      setQrUrl(result.inviteUrl);
      toast.success("QR code generated! Share it with your family member.");
    } catch (error) {
      console.error("Error generating QR code:", error);
      const message = error instanceof Error ? error.message : "Failed to generate QR code";
      setError(message);
      toast.error(message);
    } finally {
      setQrLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.download = "family-invite-qr.png";
    link.href = qrCode;
    link.click();
    toast.success("QR code downloaded");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setEmail("");
      setError("");
      setQrCode(null);
      setQrUrl(null);
      setCopied(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-500" />
            Invite Family Member
          </DialogTitle>
          <DialogDescription>
            Add a family member to your Enterprise plan via email or QR code.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "qr")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="family@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  {error && activeTab === "email" && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}
                </div>

                <FeaturesList />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            <div className="py-4 space-y-4">
              {!qrCode ? (
                <>
                  <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                    <QrCode className="h-12 w-12 mx-auto text-slate-500 mb-3" />
                    <p className="text-slate-400 text-sm mb-4">
                      Generate a QR code that anyone can scan to join your family plan
                    </p>
                    <Button onClick={generateQRCode} disabled={qrLoading}>
                      {qrLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  </div>
                  {error && activeTab === "qr" && (
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* QR Code Display */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <img
                        src={qrCode}
                        alt="Family Invite QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={downloadQRCode}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyInviteLink}>
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Instructions */}
                  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm">
                    <p className="text-slate-300 mb-2 font-medium">How to use:</p>
                    <ol className="space-y-1 text-slate-400 list-decimal list-inside">
                      <li>Print or display this QR code</li>
                      <li>Family member scans with their phone</li>
                      <li>They sign in or create an account</li>
                      <li>They&apos;re automatically added to your plan</li>
                    </ol>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setQrCode(null);
                      setQrUrl(null);
                    }}
                  >
                    Generate Another QR Code
                  </Button>
                </div>
              )}

              <FeaturesList />
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FeaturesList() {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm">
      <p className="text-slate-300 mb-2">What they&apos;ll get:</p>
      <ul className="space-y-1 text-slate-400">
        <li className="flex items-center gap-2">
          <span className="text-emerald-500">✓</span> Full Enterprise features
        </li>
        <li className="flex items-center gap-2">
          <span className="text-emerald-500">✓</span> Their own separate account
        </li>
        <li className="flex items-center gap-2">
          <span className="text-emerald-500">✓</span> Private scans & data
        </li>
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Shield,
  Smartphone,
} from "lucide-react";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type SetupStep = "initial" | "qr" | "verify" | "backup" | "complete";

interface SetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<SetupStep>("initial");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const resetDialog = () => {
    setStep("initial");
    setSetupData(null);
    setVerificationCode("");
    setMessage(null);
    setCopiedSecret(false);
    setCopiedBackup(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    onOpenChange(isOpen);
  };

  const startSetup = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/account/2fa/setup", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to start 2FA setup",
        });
        return;
      }

      setSetupData(data);
      setStep("qr");
    } catch {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setMessage({
        type: "error",
        text: "Please enter a 6-digit code",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/account/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Invalid verification code",
        });
        return;
      }

      setStep("backup");
    } catch {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const copyBackupCodes = async () => {
    if (setupData?.backupCodes) {
      const text = setupData.backupCodes.join("\n");
      await navigator.clipboard.writeText(text);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const text = `DataScrub 2FA Backup Codes
Generated: ${new Date().toLocaleDateString()}

${setupData.backupCodes.join("\n")}

Keep these codes safe! Each code can only be used once.`;

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "datascrub-2fa-backup-codes.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const completeSetup = () => {
    onComplete();
    handleClose(false);
  };

  const renderStep = () => {
    switch (step) {
      case "initial":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Add an extra layer of security to your account using an
                authenticator app like Google Authenticator or Authy.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {message && (
                <div className="p-3 rounded-lg flex items-center gap-2 text-sm bg-red-500/20 text-red-300 border border-red-500/30">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {message.text}
                </div>
              )}

              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-slate-200">What you&apos;ll need:</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-500" />
                    An authenticator app on your phone
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    A safe place to store backup codes
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={startSetup}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </DialogFooter>
          </>
        );

      case "qr":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">Scan QR Code</DialogTitle>
              <DialogDescription className="text-slate-400">
                Scan this QR code with your authenticator app, or enter the
                secret key manually.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {setupData?.qrCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-200 text-sm">
                  Or enter this key manually:
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-700/50 px-3 py-2 rounded text-sm font-mono text-slate-300 break-all">
                    {setupData?.secret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copySecret}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0"
                  >
                    {copiedSecret ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep("verify")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next
              </Button>
            </DialogFooter>
          </>
        );

      case "verify":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">
                Verify Your Setup
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the 6-digit code from your authenticator app to verify
                setup.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {message && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                    message.type === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0" />
                  )}
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-slate-200">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="bg-slate-700/50 border-slate-600 text-white text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("qr")}
                disabled={isLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </DialogFooter>
          </>
        );

      case "backup":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Save Your Backup Codes
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Save these backup codes in a safe place. You can use each code
                once if you lose access to your authenticator app.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setupData?.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/50 px-3 py-2 rounded text-center text-slate-300"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyBackupCodes}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {copiedBackup ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Codes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-300">
                These codes will only be shown once. Make sure to save them now!
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={completeSetup}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              >
                I&apos;ve Saved My Codes
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

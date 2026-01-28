"use client";

import { useState } from "react";
import { UserPlus, Mail, Loader2 } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-500" />
            Invite Family Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to add a family member to your Enterprise plan.
            They&apos;ll receive an email with a link to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
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
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>

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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

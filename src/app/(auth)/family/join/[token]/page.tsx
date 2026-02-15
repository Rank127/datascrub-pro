"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Users, Shield, CheckCircle, XCircle, Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationDetails } from "@/lib/family/types";

export default function JoinFamilyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/family/invite/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load invitation");
          return;
        }

        setInvitation(data.invitation);
      } catch (_err) {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/family/invite/${token}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to accept invitation");
        return;
      }

      setSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 2000);
    } catch (_err) {
      setError("Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired invitation
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white">Invalid Invitation</CardTitle>
            <CardDescription className="text-slate-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              This invitation link may have expired or been cancelled.
              Please ask the family owner to send a new invitation.
            </p>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-white">Welcome to the Family!</CardTitle>
            <CardDescription className="text-slate-400">
              You&apos;ve successfully joined the family plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              You now have access to all Enterprise features.
              Redirecting to your dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - prompt to login or register
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-white">Family Plan Invitation</CardTitle>
            <CardDescription className="text-slate-400">
              {invitation?.familyOwnerName || invitation?.familyOwnerEmail} has invited you to join their GhostMyData family plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Enterprise Features Included</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Unlimited privacy scans
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Automatic data removal
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Dark web monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Daily monitoring
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm text-slate-400">
                Sign in or create an account to accept
              </p>
              <Button
                className="w-full"
                onClick={() => signIn(undefined, { callbackUrl: `/family/join/${token}` })}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href={`/register?callbackUrl=/family/join/${token}`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Link>
              </Button>
            </div>

            {invitation?.isExpired && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <p className="text-sm text-amber-400">
                  This invitation has expired. Please ask for a new invitation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email mismatch
  if (invitation && session.user?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-amber-400" />
            </div>
            <CardTitle className="text-white">Wrong Account</CardTitle>
            <CardDescription className="text-slate-400">
              This invitation was sent to a different email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Invitation for:</span>
                <span className="text-white font-medium">{invitation.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Signed in as:</span>
                <span className="text-white font-medium">{session.user?.email}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 text-center">
              Please sign in with the email address the invitation was sent to.
            </p>
            <Button
              className="w-full"
              onClick={() => signIn(undefined, { callbackUrl: `/family/join/${token}` })}
            >
              Sign In with Different Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired invitation
  if (invitation?.isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-amber-400" />
            </div>
            <CardTitle className="text-white">Invitation Expired</CardTitle>
            <CardDescription className="text-slate-400">
              This invitation has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              Please ask {invitation.familyOwnerName || invitation.familyOwnerEmail} to send a new invitation.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready to accept
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-emerald-400" />
          </div>
          <CardTitle className="text-white">Join Family Plan</CardTitle>
          <CardDescription className="text-slate-400">
            {invitation?.familyOwnerName || invitation?.familyOwnerEmail} has invited you to join their GhostMyData family plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Shield className="h-5 w-5" />
              <span className="font-medium">What you&apos;ll get:</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Unlimited privacy scans
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Automatic data removal from 400+ sites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Dark web monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Daily monitoring for new exposures
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Priority support
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-400">
            <p>
              By accepting, you&apos;ll join {invitation?.familyOwnerName || invitation?.familyOwnerEmail}&apos;s family plan.
              You&apos;ll get your own separate account with private scans and data.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/dashboard">
                Decline
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

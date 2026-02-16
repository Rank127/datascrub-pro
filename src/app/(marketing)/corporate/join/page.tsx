"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, Building2, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface InviteInfo {
  companyName: string;
  adminName: string | null;
  email: string;
  status: string;
  isExpired: boolean;
  tier: string;
}

export default function CorporateJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <CorporateJoinContent />
    </Suspense>
  );
}

function CorporateJoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch invite details
  useEffect(() => {
    if (!token) {
      setError("No invitation token provided");
      setLoading(false);
      return;
    }

    fetch(`/api/corporate/invite/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvite(data);
          if (data.status !== "PENDING" || data.isExpired) {
            setError(
              data.isExpired
                ? "This invitation has expired."
                : "This invitation is no longer valid."
            );
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load invitation");
        setLoading(false);
      });
  }, [token]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated" && token) {
      router.push(`/register?callbackUrl=/corporate/join?token=${token}`);
    }
  }, [authStatus, token, router]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    setError(null);

    try {
      const res = await fetch(`/api/corporate/invite/${token}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setError(data.error || "Failed to accept invitation");
      }
    } catch {
      setError("Failed to accept invitation. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to {invite?.companyName}!
          </h1>
          <p className="text-slate-400">
            Your seat has been activated. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-violet-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">
            Corporate Plan Invitation
          </h1>
        </div>

        {error && !invite ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : invite ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8 text-violet-400" />
              <div>
                <p className="text-lg font-semibold text-white">
                  {invite.companyName}
                </p>
                <p className="text-sm text-slate-400">
                  Invited by {invite.adminName || "the account admin"}
                </p>
              </div>
            </div>

            {error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}

            {session?.user && (
              <p className="text-sm text-slate-400 mb-4">
                Accepting as <span className="text-white">{session.user.email}</span>
              </p>
            )}

            <button
              onClick={handleAccept}
              disabled={accepting || invite.isExpired || invite.status !== "PENDING"}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

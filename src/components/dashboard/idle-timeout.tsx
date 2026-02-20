"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";

const IDLE_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes — show warning
const LOGOUT_GRACE_MS = 60 * 1000; // 1 minute grace period (total: 15 min per NIST 800-63B)
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

export function IdleTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [loggingOut, setLoggingOut] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    setLoggingOut(true);
    // Call signOut, but force-redirect after 2s as a fallback in case it stalls
    signOut({ callbackUrl: "/?reason=idle" }).catch(() => {});
    setTimeout(() => {
      window.location.href = "/?reason=idle";
    }, 2000);
  }, [clearAllTimers]);

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true);
    setSecondsLeft(60);

    const start = Date.now();
    countdownInterval.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, Math.ceil((LOGOUT_GRACE_MS - elapsed) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      }
    }, 1000);

    logoutTimer.current = setTimeout(handleLogout, LOGOUT_GRACE_MS);
  }, [handleLogout]);

  const resetIdleTimer = useCallback(() => {
    // Don't reset if warning is showing — user must click "Stay Logged In"
    if (showWarning) return;

    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(startWarningCountdown, IDLE_TIMEOUT_MS);
  }, [showWarning, startWarningCountdown]);

  const handleStayLoggedIn = useCallback(async () => {
    // Verify the session is still alive before resetting
    try {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (!session?.user) {
        // Session already expired — redirect to login
        window.location.href = "/login?reason=expired";
        return;
      }
    } catch {
      // Can't verify — redirect to be safe
      window.location.href = "/login?reason=expired";
      return;
    }

    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(60);
    // Restart idle timer fresh
    idleTimer.current = setTimeout(startWarningCountdown, IDLE_TIMEOUT_MS);
  }, [clearAllTimers, startWarningCountdown]);

  useEffect(() => {
    // Start idle timer on mount
    resetIdleTimer();

    // Listen for user activity
    const handler = () => resetIdleTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }

    return () => {
      clearAllTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handler);
      }
    };
  }, [resetIdleTimer, clearAllTimers]);

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="bg-slate-800 border-slate-700 text-white sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            {loggingOut ? "Logging Out..." : "Session Timeout Warning"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {loggingOut ? (
              "Redirecting you to the login page..."
            ) : secondsLeft > 0 ? (
              <>
                You&apos;ve been inactive for a while. For your security, you&apos;ll be
                automatically logged out in{" "}
                <span className="text-amber-400 font-semibold">{secondsLeft} seconds</span>.
              </>
            ) : (
              "Your session has expired. Redirecting..."
            )}
          </DialogDescription>
        </DialogHeader>
        {!loggingOut && secondsLeft > 0 && (
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Log Out Now
            </Button>
            <Button
              onClick={handleStayLoggedIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Stay Logged In
            </Button>
          </DialogFooter>
        )}
        {(loggingOut || secondsLeft <= 0) && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

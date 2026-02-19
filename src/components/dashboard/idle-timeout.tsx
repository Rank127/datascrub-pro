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
import { Clock } from "lucide-react";

const IDLE_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes — show warning
const LOGOUT_GRACE_MS = 60 * 1000; // 1 minute grace period (total: 15 min per NIST 800-63B)
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

export function IdleTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
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
    signOut({ callbackUrl: "/?reason=idle" });
  }, [clearAllTimers]);

  const resetIdleTimer = useCallback(() => {
    // Don't reset if warning is showing — user must click "Stay Logged In"
    if (showWarning) return;

    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(60);

      // Start countdown
      const start = Date.now();
      countdownInterval.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, Math.ceil((LOGOUT_GRACE_MS - elapsed) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          if (countdownInterval.current) clearInterval(countdownInterval.current);
        }
      }, 1000);

      // Auto-logout after grace period
      logoutTimer.current = setTimeout(handleLogout, LOGOUT_GRACE_MS);
    }, IDLE_TIMEOUT_MS);
  }, [showWarning, handleLogout]);

  const handleStayLoggedIn = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(60);
    // Restart idle timer fresh
    idleTimer.current = setTimeout(() => {
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
    }, IDLE_TIMEOUT_MS);
  }, [clearAllTimers, handleLogout]);

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
        className="bg-slate-800 border-slate-700 text-white sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            You&apos;ve been inactive for a while. For your security, you&apos;ll be
            automatically logged out in{" "}
            <span className="text-amber-400 font-semibold">{secondsLeft} seconds</span>.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}

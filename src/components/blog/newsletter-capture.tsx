"use client";

import { useState, FormEvent } from "react";

interface NewsletterCaptureProps {
  source?: string;
}

export function NewsletterCapture({ source = "blog" }: NewsletterCaptureProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setEmail("");

      // Track with PostHog if available
      try {
        const posthog = (window as unknown as { posthog?: { capture: (event: string, properties: Record<string, string>) => void } }).posthog;
        posthog?.capture("newsletter_subscribed", { source });
      } catch {
        // PostHog not available, ignore
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-8 bg-slate-800/50 rounded-2xl border border-emerald-500/20 text-center">
        <div className="text-3xl mb-3">&#10003;</div>
        <h3 className="text-xl font-bold text-white mb-2">
          You&apos;re subscribed!
        </h3>
        <p className="text-slate-400">
          We&apos;ll send you the latest privacy tips and data removal guides.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Get Privacy Tips in Your Inbox
        </h3>
        <p className="text-slate-400 text-sm">
          Weekly tips on protecting your personal data. No spam. Unsubscribe anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? "Subscribing..." : "Get Privacy Tips"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

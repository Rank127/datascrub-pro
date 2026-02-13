"use client";

import { useState } from "react";
import { MISSION_MAPPINGS, getAllInvocations, getAllPlaybooks } from "@/lib/mastermind";

interface MastermindResponse {
  advice: string;
  advisors: string[];
  protocol: string[];
  keyInsight: string;
  queriesRemaining: number;
}

export function AdvisorPanel() {
  const [question, setQuestion] = useState("");
  const [selectedMission, setSelectedMission] = useState<string>("");
  const [selectedInvocation, setSelectedInvocation] = useState<string>("");
  const [response, setResponse] = useState<MastermindResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invocations = getAllInvocations().filter((inv) => inv.mode === "single").slice(0, 8);
  const playbooks = getAllPlaybooks();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/admin/mastermind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          mission: selectedMission || undefined,
          invocation: selectedInvocation || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const data: MastermindResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickAction(q: string) {
    setQuestion(q);
  }

  function handlePlaybook(playbookId: string) {
    const pb = playbooks.find((p) => p.id === playbookId);
    if (pb) {
      setQuestion(pb.promptOptions.scenario || pb.description);
      setSelectedMission(pb.promptOptions.mission || "");
      setSelectedInvocation(
        pb.promptOptions.invocation || ""
      );
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h2 className="text-lg font-bold text-white mb-4">
        Ask the Advisory Council
      </h2>

      {/* Quick Actions */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Quick Actions
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "How can we increase conversion from Free to Pro?",
            "What's our competitive position vs DeleteMe?",
            "Run a pre-mortem on our current strategy",
            "How should we optimize our AI agent costs?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => handleQuickAction(q)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              {q.length > 40 ? q.substring(0, 40) + "..." : q}
            </button>
          ))}
        </div>
      </div>

      {/* Playbooks */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Playbooks
        </div>
        <div className="flex flex-wrap gap-2">
          {playbooks.map((pb) => (
            <button
              key={pb.id}
              onClick={() => handlePlaybook(pb.id)}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs transition-colors"
            >
              {pb.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question input */}
        <div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a strategic question..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Mission domain */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-500 mb-1 block">
              Mission Domain (optional)
            </label>
            <select
              value={selectedMission}
              onChange={(e) => {
                setSelectedMission(e.target.value);
                setSelectedInvocation("");
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="">Auto-select</option>
              {MISSION_MAPPINGS.map((m) => (
                <option key={m.domain} value={m.domain}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Invocation shortcut */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-500 mb-1 block">
              Invocation Command (optional)
            </label>
            <select
              value={selectedInvocation}
              onChange={(e) => {
                setSelectedInvocation(e.target.value);
                setSelectedMission("");
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="">None</option>
              {invocations.map((inv) => (
                <option key={inv.trigger} value={inv.trigger}>
                  {inv.trigger} — {inv.description.substring(0, 50)}
                </option>
              ))}
              <option value="Board Meeting">Board Meeting — Full Nucleus</option>
              <option value="Safety Council">Safety Council — Risk Review</option>
              <option value="Growth War Room">Growth War Room — Revenue Sprint</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-semibold rounded-lg text-sm transition-colors"
        >
          {loading ? "Consulting the Council..." : "Ask the Mastermind Council"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mt-6 space-y-4">
          {/* Key Insight */}
          {response.keyInsight && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Key Insight
              </div>
              <p className="text-white text-sm font-medium">
                {response.keyInsight}
              </p>
            </div>
          )}

          {/* Advice */}
          <div className="p-4 bg-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Advisory Response
            </div>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {response.advice}
            </div>
          </div>

          {/* Advisors */}
          {response.advisors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Advisors consulted:</span>
              {response.advisors.map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Protocol */}
          {response.protocol.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Protocol steps:</span>
              {response.protocol.map((step) => (
                <span
                  key={step}
                  className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs"
                >
                  {step}
                </span>
              ))}
            </div>
          )}

          {/* Remaining queries */}
          <p className="text-xs text-slate-600">
            {response.queriesRemaining} queries remaining today
          </p>
        </div>
      )}
    </div>
  );
}

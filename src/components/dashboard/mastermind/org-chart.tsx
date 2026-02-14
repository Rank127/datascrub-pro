"use client";

import { useState, useEffect } from "react";

type TabId = "layers" | "missions" | "principles" | "headcount";

interface OrgLayer {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  roles: Array<{ title: string; desc: string }>;
  principles: Array<{ mind: string; insight: string }>;
  relevantAgents: string[];
}

interface Mission {
  domain: string;
  label: string;
  description: string;
  keyAdvisorIds: string[];
  agentIds: string[];
}

interface MastermindData {
  layers: OrgLayer[];
  missions: Mission[];
}

export function MastermindOrgChart() {
  const [activeTab, setActiveTab] = useState<TabId>("layers");
  const [expandedLayer, setExpandedLayer] = useState<string | null>("nucleus");
  const [data, setData] = useState<MastermindData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/mastermind/data")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const layers = data?.layers ?? [];
  const missions = data?.missions ?? [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "layers", label: "The 5 Layers" },
    { id: "missions", label: "Mission Teams" },
    { id: "principles", label: "Core Principles" },
    { id: "headcount", label: "Headcount Model" },
  ];

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-700 rounded" />
          <div className="h-40 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-amber-400 border-b-2 border-amber-400 bg-slate-800/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "layers" && (
          <div className="space-y-3">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="border border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedLayer(expandedLayer === layer.id ? null : layer.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{layer.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{layer.name}</h3>
                      <p className="text-slate-400 text-sm">{layer.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-slate-500 text-sm">
                    {expandedLayer === layer.id ? "▼" : "▶"}
                  </span>
                </button>

                {expandedLayer === layer.id && (
                  <div className="border-t border-slate-700 p-4 bg-slate-800/30">
                    <p className="text-slate-300 text-sm mb-4">{layer.description}</p>

                    {/* Roles */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Roles
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {layer.roles.map((role) => (
                          <div
                            key={role.title}
                            className="bg-slate-900/50 rounded p-3"
                          >
                            <div className="text-white text-sm font-medium">
                              {role.title}
                            </div>
                            <div className="text-slate-400 text-xs mt-1">
                              {role.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Principles */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Key Minds & Insights
                      </h4>
                      <div className="space-y-2">
                        {layer.principles.map((p) => (
                          <div
                            key={p.mind}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-amber-400 font-semibold whitespace-nowrap">
                              {p.mind}:
                            </span>
                            <span className="text-slate-300 italic">
                              {p.insight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relevant agents */}
                    {layer.relevantAgents.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Mapped Agents
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {layer.relevantAgents.map((agentId) => (
                            <span
                              key={agentId}
                              className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs"
                            >
                              {agentId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "missions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => (
              <div
                key={mission.domain}
                className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
              >
                <h3 className="text-white font-semibold text-sm">
                  {mission.label}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {mission.description}
                </p>
                <div className="mt-3">
                  <div className="text-xs text-slate-500 mb-1">Key Minds:</div>
                  <div className="flex flex-wrap gap-1">
                    {mission.keyAdvisorIds.slice(0, 4).map((id) => (
                      <span
                        key={id}
                        className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs"
                      >
                        {id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
                {mission.agentIds.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-500 mb-1">Agents:</div>
                    <div className="flex flex-wrap gap-1">
                      {mission.agentIds.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "principles" && (
          <div className="space-y-6">
            {[
              {
                layer: "Technology",
                question: "How to Build",
                color: "text-blue-400",
                minds: "Jensen Huang, Wenfeng, Karpathy, LeCun, Amodei, Altman, Musk",
              },
              {
                layer: "Strategic",
                question: "How to Position",
                color: "text-purple-400",
                minds: "Jensen Huang, Nadella, Carlsen, Dalio, Buffett, Cook, El-Erian",
              },
              {
                layer: "Commercial",
                question: "How to Sell & Grow",
                color: "text-emerald-400",
                minds: "Hormozi, Brunson, Patel, Voss, Gary Vee, MrBeast, Cardone",
              },
              {
                layer: "Human",
                question: "How to Lead",
                color: "text-pink-400",
                minds: "Nadella, Peterson, Zelenskyy, Van Edwards, Fridman, Rogan, Clooney",
              },
              {
                layer: "Wisdom",
                question: "How to Decide",
                color: "text-amber-400",
                minds: "Harari, Han, Bostrom, Singer, Cowen, Acemoglu, Hinton",
              },
            ].map((principle) => (
              <div key={principle.layer} className="flex items-start gap-4">
                <div className="w-32 flex-shrink-0">
                  <div className={`font-bold ${principle.color}`}>
                    {principle.layer}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {principle.question}
                  </div>
                </div>
                <div className="text-slate-300 text-sm">{principle.minds}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "headcount" && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              The organism model scales from 1 person to 1,000 without changing structure.
              Layers expand, not multiply.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { stage: "Solo (1-3)", nucleus: "1 person = all roles", missions: "2-3 priorities", agents: "AI does the rest" },
                { stage: "Team (4-15)", nucleus: "3-5 architects", missions: "5-7 active missions", agents: "24 AI agents" },
                { stage: "Scale (15+)", nucleus: "5 architects + board", missions: "All 10 domains staffed", agents: "AI fleet + human oversight" },
              ].map((model) => (
                <div
                  key={model.stage}
                  className="border border-slate-700 rounded-lg p-4"
                >
                  <h3 className="text-amber-400 font-semibold text-sm mb-3">
                    {model.stage}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Nucleus:</span>{" "}
                      <span className="text-slate-300">{model.nucleus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Missions:</span>{" "}
                      <span className="text-slate-300">{model.missions}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">AI Layer:</span>{" "}
                      <span className="text-slate-300">{model.agents}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

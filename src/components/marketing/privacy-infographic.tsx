"use client";

import { Shield, Database, AlertTriangle, Eye, Lock, Users } from "lucide-react";

export function DataBrokerInfographic() {
  const stats = [
    { value: "4,000+", label: "Data brokers in the US", icon: Database },
    { value: "$200B", label: "Industry annual revenue", icon: Shield },
    { value: "50+", label: "Sites with your data", icon: Eye },
    { value: "1,500+", label: "Data points per person", icon: Users },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700">
      <h3 className="text-2xl font-bold text-white text-center mb-8">
        The Data Broker Industry by the Numbers
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full mb-3">
              <stat.icon className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
      <p className="text-center text-slate-500 text-sm mt-6">
        Source: Industry research, 2026
      </p>
    </div>
  );
}

export function DataExposureInfographic() {
  const exposureTypes = [
    { type: "Data Brokers", percentage: 85, description: "People-search sites selling your info" },
    { type: "Breach Databases", percentage: 64, description: "Your data in known breaches" },
    { type: "Social Media", percentage: 72, description: "Public profile information" },
    { type: "Dark Web", percentage: 23, description: "Data being traded by criminals" },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700">
      <h3 className="text-2xl font-bold text-white text-center mb-2">
        Where Is Your Data Exposed?
      </h3>
      <p className="text-slate-400 text-center mb-8">
        Percentage of people with data exposed on each source type
      </p>
      <div className="space-y-6">
        {exposureTypes.map((item) => (
          <div key={item.type}>
            <div className="flex justify-between mb-2">
              <span className="text-slate-300 font-medium">{item.type}</span>
              <span className="text-emerald-400 font-semibold">{item.percentage}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IdentityTheftInfographic() {
  const risks = [
    { icon: AlertTriangle, title: "15M", subtitle: "Americans affected yearly", color: "text-red-500" },
    { icon: Shield, title: "$52B", subtitle: "Annual losses to fraud", color: "text-orange-500" },
    { icon: Lock, title: "200+", subtitle: "Hours to recover", color: "text-yellow-500" },
    { icon: Users, title: "1 in 3", subtitle: "Will be victims", color: "text-emerald-500" },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-red-500/5 to-slate-900/50 rounded-2xl border border-red-500/20">
      <h3 className="text-2xl font-bold text-white text-center mb-2">
        Identity Theft: The Growing Crisis
      </h3>
      <p className="text-slate-400 text-center mb-8">
        Why protecting your personal data matters
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {risks.map((risk) => (
          <div key={risk.title} className="text-center">
            <div className={`inline-flex p-3 bg-slate-800 rounded-full mb-3`}>
              <risk.icon className={`h-6 w-6 ${risk.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{risk.title}</div>
            <div className="text-sm text-slate-400">{risk.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RemovalProcessInfographic() {
  const steps = [
    { step: 1, title: "Scan", description: "We search 50+ data sources", time: "2 min" },
    { step: 2, title: "Find", description: "Identify all your exposures", time: "Instant" },
    { step: 3, title: "Remove", description: "Submit opt-out requests", time: "1-7 days" },
    { step: 4, title: "Monitor", description: "Continuous protection", time: "Ongoing" },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-500/5 to-slate-900/50 rounded-2xl border border-emerald-500/20">
      <h3 className="text-2xl font-bold text-white text-center mb-8">
        How GhostMyData Works
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {steps.map((item, index) => (
          <div key={item.step} className="flex items-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 mx-auto border-2 border-emerald-500">
                <span className="text-2xl font-bold text-emerald-400">{item.step}</span>
              </div>
              <div className="text-white font-semibold mb-1">{item.title}</div>
              <div className="text-sm text-slate-400 mb-1">{item.description}</div>
              <div className="text-xs text-emerald-400">{item.time}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block w-12 h-0.5 bg-emerald-500/30 mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

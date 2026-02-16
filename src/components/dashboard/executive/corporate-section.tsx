"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  QrCode,
  FileBarChart,
  Swords,
  TrendingUp,
  Rocket,
  Check,
  X,
  Zap,
  Heart,
  CircleDollarSign,
  ArrowRight,
  Clock,
  Shield,
  ScanLine,
  UserPlus,
  BarChart3,
  FileText,
  Receipt,
  CalendarClock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { CorporateMetrics } from "@/lib/executive/types";
import {
  CORPORATE_TIERS,
  CORPORATE_FEATURES,
  FAMILY_ADDON_PRICE,
  ENTERPRISE_PER_SEAT_MONTHLY,
  type CorporateTier,
} from "@/lib/corporate/types";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCentsWhole(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// --- A) Plan Overview ---
function PlanOverview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Corporate Plan Tiers</h3>
      </div>
      <p className="text-sm text-slate-400">
        All tiers include full Enterprise features per seat. No family sub-members &mdash; corporate seats are individual.
        Per-seat floor: {formatCents(FAMILY_ADDON_PRICE)}/yr ({formatCents(1000)}/mo).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {CORPORATE_TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </div>
  );
}

function TierCard({ tier }: { tier: CorporateTier }) {
  const isPopular = tier.id === "CORP_25";
  return (
    <Card className={`bg-slate-800/60 border-slate-700 relative ${isPopular ? "ring-2 ring-violet-500" : ""}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-violet-500 text-white text-xs">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <span>{tier.name}</span>
          <Badge variant="outline" className="border-violet-500/50 text-violet-300">
            {tier.maxSeats} seats
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-2xl font-bold text-white">{formatCentsWhole(tier.annualPrice)}<span className="text-sm font-normal text-slate-400">/year</span></p>
          <p className="text-sm text-slate-400">{formatCents(tier.perSeatMonthly)}/seat/mo</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">{tier.savingsVsEnterprise}% off vs Enterprise</span>
        </div>
        <div className="text-xs text-slate-500 pt-1">
          vs {formatCents(ENTERPRISE_PER_SEAT_MONTHLY)}/seat/mo individual
        </div>
        <div className="border-t border-slate-700 pt-3 space-y-1.5">
          {tier.features.slice(0, 5).map((f) => (
            <div key={f} className="flex items-start gap-2 text-xs text-slate-300">
              <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
          {tier.features.length > 5 && (
            <p className="text-xs text-violet-400">+{tier.features.length - 5} more</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- B) Feature Matrix ---
function FeatureMatrix() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Feature Matrix</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 py-2 px-3 font-medium">Feature</th>
              <th className="text-center text-slate-400 py-2 px-3 font-medium">Small (10)</th>
              <th className="text-center text-slate-400 py-2 px-3 font-medium">Medium (25)</th>
              <th className="text-center text-slate-400 py-2 px-3 font-medium">Large (50)</th>
              <th className="text-center text-slate-400 py-2 px-3 font-medium">XL (100)</th>
            </tr>
          </thead>
          <tbody>
            {CORPORATE_FEATURES.map((feature) => (
              <tr key={feature.name} className="border-b border-slate-800">
                <td className="text-slate-300 py-2 px-3">{feature.name}</td>
                <FeatureCell value={feature.corp10} />
                <FeatureCell value={feature.corp25} />
                <FeatureCell value={feature.corp50} />
                <FeatureCell value={feature.corp100} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureCell({ value }: { value: boolean | "addon" }) {
  if (value === true) {
    return <td className="text-center py-2 px-3"><Check className="h-4 w-4 text-emerald-400 mx-auto" /></td>;
  }
  if (value === "addon") {
    return <td className="text-center py-2 px-3"><Badge className="bg-amber-500/20 text-amber-300 text-xs">Add-on</Badge></td>;
  }
  return <td className="text-center py-2 px-3"><X className="h-4 w-4 text-slate-600 mx-auto" /></td>;
}

// --- C) Family Add-on ---
function FamilyAddon() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Family Add-on</h3>
      </div>
      <Card className="bg-slate-800/60 border-slate-700 max-w-md">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{formatCentsWhole(FAMILY_ADDON_PRICE)}<span className="text-sm font-normal text-slate-400">/year</span></p>
              <p className="text-sm text-slate-400">{formatCents(1000)}/mo per add-on seat</p>
            </div>
            <Badge className="bg-violet-500/20 text-violet-300">56% off Enterprise</Badge>
          </div>
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Full Enterprise features at Pro price</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Separate tracking per family member</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <span>No additional family sub-members</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Available as an add-on to any corporate tier. Intended for employees who want family coverage at the corporate rate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- D) QR Onboarding Flow ---
function QrOnboarding() {
  const steps = [
    {
      icon: QrCode,
      title: "Generate QR Codes",
      description: "Admin generates unique QR codes per seat or bulk company codes via the corporate dashboard.",
    },
    {
      icon: ScanLine,
      title: "Employee Scans",
      description: "Employee scans QR code with phone camera. Links to pre-authenticated onboarding page.",
    },
    {
      icon: UserPlus,
      title: "Fill Personal Data",
      description: "Employee provides name, emails, phone numbers, and addresses for privacy scanning.",
    },
    {
      icon: BarChart3,
      title: "Admin Tracks Progress",
      description: "Corporate admin sees real-time status per seat: invited, onboarded, active, scan complete.",
    },
  ];

  const statuses = [
    { label: "Invited", color: "bg-slate-500" },
    { label: "Onboarded", color: "bg-blue-500" },
    { label: "Active", color: "bg-emerald-500" },
    { label: "Scan Complete", color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">QR-Code Onboarding Flow</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <Card key={step.title} className="bg-slate-800/60 border-slate-700">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-sm">
                  {i + 1}
                </div>
                <step.icon className="h-5 w-5 text-violet-400" />
              </div>
              <h4 className="font-medium text-white">{step.title}</h4>
              <p className="text-sm text-slate-400">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-400">Seat status badges:</span>
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-xs text-slate-300">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- E) Quarterly Report Concept ---
function QuarterlyReports() {
  const reportSections = [
    "Seats active vs total capacity",
    "Removals completed per employee",
    "Exposure trends (new vs resolved)",
    "Compliance status (CCPA/GDPR)",
    "Cost per removal analysis",
    "Executive summary with recommendations",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileBarChart className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Quarterly Compliance Report</h3>
      </div>
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-400 mb-4">
            Each corporate account receives an automated quarterly report covering:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {reportSections.map((section) => (
              <div key={section} className="flex items-start gap-2 text-sm text-slate-300">
                <FileText className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                <span>{section}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- F) Net 30 Invoice Billing ---
function Net30Billing() {
  const timeline = [
    {
      icon: Receipt,
      day: "Day 0",
      title: "Invoice Created & Sent",
      description: "Stripe invoice generated with Net 30 terms. Sent automatically to company admin email.",
    },
    {
      icon: CalendarClock,
      day: "Day 1-29",
      title: "Payment Window",
      description: "Customer can pay via hosted invoice link (card, ACH, wire). Stripe tracks status automatically.",
    },
    {
      icon: Mail,
      day: "Day 25",
      title: "Reminder Sent",
      description: "Stripe auto-sends payment reminder 5 days before due date.",
    },
    {
      icon: AlertCircle,
      day: "Day 30+",
      title: "Overdue Handling",
      description: "If unpaid, account suspended. Stripe marks invoice overdue and sends final notice.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Net 30 Invoice Billing</h3>
        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Stripe Invoicing</Badge>
      </div>
      <p className="text-sm text-slate-400">
        Corporate accounts at 50+ seats use Net 30 invoice billing via Stripe. Invoices are created, sent, and tracked automatically.
        Smaller tiers pay upfront via standard checkout.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {timeline.map((step) => (
          <Card key={step.day} className="bg-slate-800/60 border-slate-700">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <step.icon className="h-5 w-5 text-violet-400" />
                <Badge variant="outline" className="border-violet-500/50 text-violet-300 text-xs">
                  {step.day}
                </Badge>
              </div>
              <h4 className="font-medium text-white">{step.title}</h4>
              <p className="text-sm text-slate-400">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="pt-6">
          <h4 className="font-medium text-white mb-3">Billing Service Capabilities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Create Stripe customer per corporate account",
              "Generate Net 30 invoices with line items",
              "Automatic invoice finalization and sending",
              "Family add-on seats as separate line items",
              "Hosted payment page (card, ACH, wire)",
              "Auto-activate account on payment",
              "Auto-suspend on overdue (30+ days)",
              "Invoice history and PDF downloads",
            ].map((cap) => (
              <div key={cap} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- G) Competitive Positioning ---
function CompetitivePositioning() {
  const competitors = [
    {
      name: "DeleteMe",
      model: "Custom quotes",
      perSeatPrice: "Not public",
      keyDifference: "We're transparent pricing",
    },
    {
      name: "Optery",
      model: "$3.50-$21/seat tiers",
      perSeatPrice: "Core $3.50 / Ultimate $21",
      keyDifference: "We include dark web at all tiers",
    },
    {
      name: "Incogni",
      model: "$199/yr/seat",
      perSeatPrice: "$16.58/mo",
      keyDifference: "We're cheaper at 25+ seats",
    },
    {
      name: "Kanary",
      model: "Business tier",
      perSeatPrice: "~$14.99/mo",
      keyDifference: "We have QR onboarding",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Swords className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Competitive Positioning</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 py-2 px-3 font-medium">Competitor</th>
              <th className="text-left text-slate-400 py-2 px-3 font-medium">Pricing Model</th>
              <th className="text-left text-slate-400 py-2 px-3 font-medium">Per-Seat Price</th>
              <th className="text-left text-slate-400 py-2 px-3 font-medium">Our Advantage</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.name} className="border-b border-slate-800">
                <td className="text-white font-medium py-2 px-3">{c.name}</td>
                <td className="text-slate-300 py-2 px-3">{c.model}</td>
                <td className="text-slate-300 py-2 px-3">{c.perSeatPrice}</td>
                <td className="text-emerald-400 py-2 px-3">{c.keyDifference}</td>
              </tr>
            ))}
            <tr className="bg-violet-500/10">
              <td className="text-violet-300 font-bold py-2 px-3">GhostMyData</td>
              <td className="text-violet-300 py-2 px-3">Transparent tiers</td>
              <td className="text-violet-300 py-2 px-3">$10.00-$16.66/mo</td>
              <td className="text-violet-300 py-2 px-3">Full stack + QR + dark web</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- G) Revenue Projections ---
function RevenueProjections() {
  const scenarios = [
    {
      label: "5 accounts at Medium (25-seat)",
      accounts: 5,
      tierPrice: 399900,
      arr: 5 * 399900,
    },
    {
      label: "10 mixed accounts",
      accounts: 10,
      tierPrice: 0,
      arr: 3 * 199900 + 4 * 399900 + 2 * 699900 + 1 * 1199900,
    },
    {
      label: "20 accounts (growth target)",
      accounts: 20,
      tierPrice: 0,
      arr: 8 * 199900 + 6 * 399900 + 4 * 699900 + 2 * 1199900,
    },
  ];

  const avgDealSize = Math.round(
    (199900 + 399900 + 699900 + 1199900) / 4
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CircleDollarSign className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Revenue Projections</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s) => (
          <Card key={s.label} className="bg-slate-800/60 border-slate-700">
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCentsWhole(s.arr)}</p>
              <p className="text-xs text-slate-500">Annual Recurring Revenue</p>
              <p className="text-xs text-slate-500">
                {formatCentsWhole(Math.round(s.arr / 12))}/mo MRR
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Average Deal Size</p>
            <p className="text-xl font-bold text-white">{formatCentsWhole(avgDealSize)}<span className="text-sm font-normal text-slate-400">/year</span></p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Per-Seat Floor</p>
            <p className="text-xl font-bold text-white">{formatCents(1000)}<span className="text-sm font-normal text-slate-400">/mo ({formatCentsWhole(12000)}/yr)</span></p>
            <p className="text-xs text-slate-500 mt-1">Nobody gets Enterprise below this price</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- H) Current Status / Launch Checklist ---
function LaunchStatus({ data }: { data?: CorporateMetrics }) {
  const totalAccounts = data?.totalAccounts ?? 0;
  const totalSeats = data?.totalSeats ?? 0;
  const activeSeats = data?.activeSeats ?? 0;

  const checklist = [
    { label: "Database models created", done: true },
    { label: "Pricing structure finalized", done: true },
    { label: "Admin review dashboard", done: true },
    { label: "Net 30 invoice billing service", done: true },
    { label: "Create Stripe products & prices", done: false },
    { label: "Build public corporate landing page", done: false },
    { label: "Build corporate checkout flow", done: false },
    { label: "Build QR onboarding flow", done: false },
    { label: "Build corporate admin dashboard", done: false },
    { label: "Quarterly report automation", done: false },
    { label: "Sales outreach templates", done: false },
  ];

  const completedCount = checklist.filter(c => c.done).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Rocket className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Launch Status</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-white">{totalAccounts}</p>
            <p className="text-sm text-slate-400">Corporate Accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-white">{totalSeats}</p>
            <p className="text-sm text-slate-400">Total Seats</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-white">{activeSeats}</p>
            <p className="text-sm text-slate-400">Active Seats</p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center justify-between">
            <span>Go-Live Checklist</span>
            <Badge variant="outline" className="border-violet-500/50 text-violet-300">
              {completedCount}/{checklist.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              {item.done ? (
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
              )}
              <span className={`text-sm ${item.done ? "text-slate-300" : "text-slate-500"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Export ---
export function CorporateSection({ data }: { data?: CorporateMetrics }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Building2 className="h-6 w-6 text-violet-400" />
          Corporate Plan Review
        </h2>
        <p className="text-sm text-slate-400">
          Internal review only &mdash; not visible to customers. Approve pricing and features before public launch.
        </p>
      </div>

      <PlanOverview />
      <FeatureMatrix />
      <FamilyAddon />
      <QrOnboarding />
      <QuarterlyReports />
      <Net30Billing />
      <CompetitivePositioning />
      <RevenueProjections />
      <LaunchStatus data={data} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  CheckCircle,
  X,
  AlertTriangle,
  Users,
  QrCode,
  BarChart3,
  Globe,
  Lock,
  Bot,
  RefreshCw,
  FileText,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Scale,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQSchema } from "@/components/seo/structured-data";
import { AnimatedSection, AnimatedCard } from "@/components/marketing/animated-sections";
import {
  CORPORATE_TIERS,
  CORPORATE_FEATURES,
  ENTERPRISE_PER_SEAT_MONTHLY,
} from "@/lib/corporate/types";

export const metadata: Metadata = {
  title: "Corporate Plans - Employee Data Privacy Protection",
  description:
    "Protect your employees from social engineering, spear phishing, and regulatory risk. Corporate data removal plans starting at $16.66/seat/mo. CCPA/GDPR automated compliance.",
  keywords: [
    "corporate data removal",
    "employee privacy protection",
    "CCPA compliance for businesses",
    "employee data broker removal",
    "corporate privacy plan",
    "business data removal service",
    "enterprise data privacy",
    "employee PII protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/corporate",
  },
  openGraph: {
    title: "Corporate Plans - Employee Data Privacy Protection | GhostMyData",
    description:
      "Protect your workforce from exposed personal data. Corporate plans from $16.66/seat/mo with automated CCPA/GDPR compliance.",
    url: "https://ghostmydata.com/corporate",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Corporate Plans - Employee Data Privacy",
      },
    ],
  },
};

const problemStats = [
  {
    icon: AlertTriangle,
    stat: "98%",
    label: "Social Engineering Risk",
    description:
      "of successful cyberattacks begin with social engineering using publicly available employee data.",
  },
  {
    icon: Scale,
    stat: "$7,500",
    label: "Regulatory Exposure",
    description:
      "per incident in CCPA fines. Employee data on broker sites creates compliance liability for employers.",
  },
  {
    icon: Lock,
    stat: "80%",
    label: "Credential Stuffing",
    description:
      "of data breaches involve stolen credentials. Exposed employee info fuels targeted attacks.",
  },
  {
    icon: ShieldCheck,
    stat: "4x",
    label: "Executive Targeting",
    description:
      "more likely for C-suite and senior leadership to be targeted using data from broker sites.",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: BarChart3,
    title: "Choose Your Plan",
    description:
      "Select a transparent tier based on team size. No hidden fees, no per-feature upsells.",
  },
  {
    step: 2,
    icon: QrCode,
    title: "Onboard in Minutes",
    description:
      "Distribute unique QR codes or upload a CSV. Employees activate their own accounts — zero IT overhead.",
  },
  {
    step: 3,
    icon: LayoutDashboard,
    title: "Monitor & Report",
    description:
      "Track removal progress across your entire team from the admin dashboard. Quarterly compliance reports included.",
  },
];

const employeeFeatures = [
  {
    icon: Globe,
    title: "Automated Data Removal",
    description:
      "We find and remove employee data from 2,100+ data broker sites automatically.",
  },
  {
    icon: Shield,
    title: "Dark Web Monitoring",
    description:
      "Continuous scanning for leaked credentials and PII on dark web marketplaces.",
  },
  {
    icon: Bot,
    title: "AI Shield",
    description:
      "Deepfake defense and AI-powered identity protection across 50+ data sources.",
  },
  {
    icon: RefreshCw,
    title: "Weekly Re-scanning",
    description:
      "Automated weekly checks ensure removed data stays gone. Re-submissions triggered instantly.",
  },
  {
    icon: FileText,
    title: "CCPA/GDPR Requests",
    description:
      "Automated compliance requests filed on behalf of each employee. Audit-ready documentation.",
  },
  {
    icon: LayoutDashboard,
    title: "Personal Dashboard",
    description:
      "Each employee gets their own privacy dashboard to track scan results and removal status.",
  },
];

const competitors = [
  {
    name: "GhostMyData",
    perSeat: "From $10/mo",
    transparentPricing: true,
    darkWeb: true,
    qrOnboarding: true,
    highlight: true,
  },
  {
    name: "DeleteMe",
    perSeat: "$8-12/mo",
    transparentPricing: false,
    darkWeb: false,
    qrOnboarding: false,
    highlight: false,
  },
  {
    name: "Optery",
    perSeat: "Custom quote",
    transparentPricing: false,
    darkWeb: false,
    qrOnboarding: false,
    highlight: false,
  },
  {
    name: "Incogni",
    perSeat: "$6-12/mo",
    transparentPricing: true,
    darkWeb: false,
    qrOnboarding: false,
    highlight: false,
  },
  {
    name: "Kanary",
    perSeat: "Custom quote",
    transparentPricing: false,
    darkWeb: false,
    qrOnboarding: false,
    highlight: false,
  },
];

const personas = [
  {
    icon: Users,
    title: "HR Directors",
    description:
      "Protect employee PII as a benefit. Reduce social engineering risk. Demonstrate duty of care with quarterly compliance reports.",
  },
  {
    icon: ShieldCheck,
    title: "CISOs",
    description:
      "Shrink the attack surface by removing exposed employee data that fuels spear phishing, credential stuffing, and pretexting attacks.",
  },
  {
    icon: Scale,
    title: "Compliance Officers",
    description:
      "Automate CCPA/GDPR data removal requests at scale. Audit-ready trails for every employee, every broker, every request.",
  },
];

const faqs = [
  {
    question: "How does employee onboarding work?",
    answer:
      "Each employee receives a unique QR code or invite link. They scan it, create their account, and their privacy protection starts immediately. For larger teams, you can upload a CSV to generate all invites at once. Zero IT overhead required.",
  },
  {
    question: "Do you offer Net 30 invoice billing?",
    answer:
      "Yes. Our Large (50-seat) and XL (100-seat) plans include Net 30 invoice billing via Stripe Invoicing. You receive a detailed invoice and have 30 days to pay. Smaller plans are billed by credit card annually.",
  },
  {
    question: "Is SSO/SAML available?",
    answer:
      "SSO/SAML is included with our Large and XL plans. For Medium plans, it's available as an add-on. We support all major identity providers including Okta, Azure AD, and Google Workspace.",
  },
  {
    question: "What compliance reports do you provide?",
    answer:
      "All corporate plans include quarterly compliance reports covering: number of active data removal requests, broker response rates, completion metrics, and audit trails. Large and XL plans include full compliance audit trails suitable for SOC 2 and regulatory reporting.",
  },
  {
    question: "Can we run a pilot program first?",
    answer:
      "Absolutely. Our Small (10-seat) plan is perfect for pilot programs. Start with a small team, measure the impact, and scale up when you're ready. Contact sales@ghostmydata.com to discuss pilot options.",
  },
  {
    question: "How is this different from individual Enterprise plans?",
    answer:
      "Corporate plans include everything in Enterprise plus: admin dashboard with team-wide analytics, QR-code onboarding, quarterly compliance reports, per-seat tracking, and volume discounts up to 56% off individual pricing.",
  },
  {
    question: "What data sources do you cover?",
    answer:
      "We scan and remove data from 2,100+ data broker sites including Spokeo, WhitePages, BeenVerified, and hundreds more. We also monitor the dark web for leaked credentials and PII.",
  },
  {
    question: "How long does the removal process take?",
    answer:
      "Most data broker sites process removal requests within 2-4 weeks. Some are faster. Our system automatically follows up on pending requests and re-submits if data reappears. You can track progress for every employee in real time.",
  },
  {
    question: "Can employees see their own dashboard?",
    answer:
      "Yes. Every employee gets their own personal privacy dashboard where they can see scan results, removal status, and dark web alerts. Admins get a separate team-wide dashboard with aggregate metrics.",
  },
  {
    question: "What happens if we need more seats than 100?",
    answer:
      "Contact sales@ghostmydata.com for custom sizing. We offer tailored plans for organizations of any size with custom pricing, dedicated account management, and SLA guarantees.",
  },
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPriceDecimal(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CorporatePage() {
  return (
    <>
      <FAQSchema faqs={faqs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* ── A) Hero ── */}
        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
              <Building2 className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Corporate Plans</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Protect Your People.{" "}
              <span className="text-violet-400">Protect Your Business.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Exposed employee data fuels social engineering, spear phishing, and regulatory risk.
              GhostMyData removes your team&apos;s personal information from 2,100+ data broker sites
              so attackers can&apos;t weaponize it.
            </p>
          </div>
        </AnimatedSection>

        {/* Trust Bar */}
        <AnimatedSection>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="h-5 w-5 text-violet-400" />
              <span className="text-sm font-medium">2,100+ data sources scanned</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle className="h-5 w-5 text-violet-400" />
              <span className="text-sm font-medium">SOC 2 infrastructure</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle className="h-5 w-5 text-violet-400" />
              <span className="text-sm font-medium">CCPA/GDPR automated</span>
            </div>
          </div>
        </AnimatedSection>

        {/* Hero CTAs */}
        <AnimatedSection>
          <div className="flex flex-wrap justify-center gap-4 mb-24">
            <a href="mailto:sales@ghostmydata.com?subject=Corporate%20Plan%20Inquiry">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-lg">
                <Mail className="h-5 w-5 mr-2" />
                Talk to Sales
              </Button>
            </a>
            <a href="#pricing">
              <Button variant="outline" className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10 px-8 py-3 text-lg">
                See Pricing
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
          </div>
        </AnimatedSection>

        {/* ── B) The Problem ── */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Employee Data Privacy Matters
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Your employees&apos; exposed personal data is an open door for attackers and a liability for your organization.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {problemStats.map((item, index) => (
            <AnimatedCard key={item.label} delay={(index + 1) * 100 as 100 | 200 | 300}>
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl h-full">
                <item.icon className="h-8 w-8 text-violet-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
                <div className="text-sm font-semibold text-violet-300 mb-3">{item.label}</div>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* ── C) How It Works ── */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Get your entire team protected in three simple steps.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {howItWorks.map((item, index) => (
            <AnimatedCard key={item.title} delay={(index + 1) * 100 as 100 | 200 | 300}>
              <div className="relative p-8 bg-slate-800/50 border border-slate-700 rounded-2xl h-full text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-500/20 rounded-full mb-4">
                  <span className="text-xl font-bold text-violet-400">{item.step}</span>
                </div>
                <item.icon className="h-10 w-10 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* ── D) Pricing Tiers ── */}
        <div id="pricing" className="scroll-mt-24">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Transparent Corporate Pricing
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Volume discounts up to 56% off individual Enterprise pricing.
                Every seat gets full Enterprise features.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {CORPORATE_TIERS.map((tier, index) => {
              const isPopular = tier.id === "CORP_25";
              const isSalesAssisted = tier.id === "CORP_50" || tier.id === "CORP_100";

              return (
                <AnimatedCard key={tier.id} delay={(index + 1) * 100 as 100 | 200 | 300}>
                  <div
                    className={`relative p-6 rounded-2xl h-full flex flex-col ${
                      isPopular
                        ? "bg-violet-500/10 border-2 border-violet-500 ring-2 ring-violet-500"
                        : "bg-slate-800/50 border border-slate-700"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-violet-400 rounded-full text-sm font-semibold text-white shadow-lg">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-semibold rounded-full">
                          {tier.savingsVsEnterprise}% OFF
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">Up to {tier.maxSeats} seats</p>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                            {formatPriceDecimal(tier.perSeatMonthly)}
                          </span>
                          <span className="text-slate-400">/seat/mo</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {formatPrice(tier.annualPrice)}/year billed annually
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          vs {formatPriceDecimal(ENTERPRISE_PER_SEAT_MONTHLY)}/seat individual Enterprise
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isSalesAssisted ? (
                      <a
                        href={`mailto:sales@ghostmydata.com?subject=${encodeURIComponent(`Corporate ${tier.name} Plan (${tier.maxSeats} seats) Inquiry`)}`}
                      >
                        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Sales
                        </Button>
                      </a>
                    ) : (
                      <Link href="/register">
                        <Button
                          className={`w-full ${
                            isPopular
                              ? "bg-violet-600 hover:bg-violet-700 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-white"
                          }`}
                        >
                          Get Started
                        </Button>
                      </Link>
                    )}
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          <AnimatedSection>
            <p className="text-center text-sm text-slate-500 mb-24">
              Need custom sizing?{" "}
              <a
                href="mailto:sales@ghostmydata.com?subject=Custom%20Corporate%20Plan%20Inquiry"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Contact sales
              </a>{" "}
              for tailored plans beyond 100 seats.
            </p>
          </AnimatedSection>
        </div>

        {/* ── E) Feature Matrix ── */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Feature Comparison
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Every plan includes full Enterprise features per seat. Higher tiers unlock admin and compliance tools.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="overflow-x-auto mb-24">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-4 pr-4 text-sm font-semibold text-slate-300 min-w-[200px]">Feature</th>
                  {CORPORATE_TIERS.map((tier) => (
                    <th
                      key={tier.id}
                      className={`py-4 px-4 text-sm font-semibold text-center min-w-[100px] ${
                        tier.id === "CORP_25" ? "text-violet-300" : "text-slate-300"
                      }`}
                    >
                      {tier.name}
                      <div className="text-xs font-normal text-slate-500">{tier.maxSeats} seats</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CORPORATE_FEATURES.map((feature) => (
                  <tr key={feature.name} className="border-b border-slate-800">
                    <td className="py-3 pr-4 text-sm text-slate-400">{feature.name}</td>
                    {(["corp10", "corp25", "corp50", "corp100"] as const).map((key) => (
                      <td key={key} className="py-3 px-4 text-center">
                        {feature[key] === true ? (
                          <CheckCircle className="h-5 w-5 text-violet-400 mx-auto" />
                        ) : feature[key] === "addon" ? (
                          <span className="inline-block px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-medium rounded-full">
                            Add-on
                          </span>
                        ) : (
                          <X className="h-5 w-5 text-slate-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>

        {/* ── F) What Every Employee Gets ── */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Every Employee Gets
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Each seat includes the full GhostMyData Enterprise experience.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {employeeFeatures.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={(index % 3 + 1) * 100 as 100 | 200 | 300}>
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl h-full">
                <feature.icon className="h-8 w-8 text-violet-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* ── G) Competitive Comparison ── */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How We Compare
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              GhostMyData is the only corporate data removal service with transparent pricing,
              dark web monitoring, and QR-code onboarding included.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="overflow-x-auto mb-24">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-4 pr-4 text-sm font-semibold text-slate-300 min-w-[140px]">Provider</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-300 text-center min-w-[120px]">Per-Seat Price</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-300 text-center min-w-[120px]">Transparent Pricing</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-300 text-center min-w-[100px]">Dark Web</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-300 text-center min-w-[120px]">QR Onboarding</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp) => (
                  <tr
                    key={comp.name}
                    className={`border-b border-slate-800 ${
                      comp.highlight ? "bg-violet-500/5" : ""
                    }`}
                  >
                    <td className={`py-3 pr-4 text-sm font-medium ${comp.highlight ? "text-violet-300" : "text-slate-400"}`}>
                      {comp.name}
                      {comp.highlight && (
                        <span className="ml-2 text-xs text-violet-400">(You are here)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400 text-center">{comp.perSeat}</td>
                    <td className="py-3 px-4 text-center">
                      {comp.transparentPricing ? (
                        <CheckCircle className="h-5 w-5 text-violet-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {comp.darkWeb ? (
                        <CheckCircle className="h-5 w-5 text-violet-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {comp.qrOnboarding ? (
                        <CheckCircle className="h-5 w-5 text-violet-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>

        {/* ── H) Who This Is For ── */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for Security-Conscious Organizations
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {personas.map((persona, index) => (
            <AnimatedCard key={persona.title} delay={(index + 1) * 100 as 100 | 200 | 300}>
              <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl h-full text-center">
                <persona.icon className="h-10 w-10 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{persona.title}</h3>
                <p className="text-slate-400">{persona.description}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* ── I) FAQ ── */}
        <AnimatedSection>
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── J) Final CTA ── */}
        <AnimatedSection>
          <div className="bg-violet-500/10 rounded-2xl border border-violet-500/20 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Protect Your Team?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Join organizations that trust GhostMyData to remove exposed employee data
              and reduce their attack surface.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:sales@ghostmydata.com?subject=Corporate%20Plan%20Inquiry">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-lg">
                  <Mail className="h-5 w-5 mr-2" />
                  Talk to Sales
                </Button>
              </a>
              <Link href="/register">
                <Button variant="outline" className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10 px-8 py-3 text-lg">
                  Start Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Search,
  Trash2,
  Eye,
  Lock,
  CheckCircle,
  ArrowRight,
  Globe,
  Database,
  AlertTriangle,
  ShieldCheck,
  RefreshCcw,
  BadgeCheck,
} from "lucide-react";
import { AnimatedSection, AnimatedCard } from "@/components/marketing/animated-sections";

// Dynamic imports for below-the-fold sections
const TestimonialsSection = dynamic(
  () => import("@/components/marketing/testimonials-section").then(mod => ({ default: mod.TestimonialsSection })),
  { loading: () => <div className="h-96 bg-slate-900/50" /> }
);

const LeadMagnetSection = dynamic(
  () => import("@/components/marketing/lead-magnet-section").then(mod => ({ default: mod.LeadMagnetSection })),
  { loading: () => <div className="h-64" /> }
);

const FAQSection = dynamic(
  () => import("@/components/marketing/faq-section").then(mod => ({ default: mod.FAQSection })),
  { loading: () => <div className="h-96" /> }
);

const VideoExplainerSection = dynamic(
  () => import("@/components/marketing/video-explainer-section").then(mod => ({ default: mod.VideoExplainerSection })),
  { loading: () => <div className="h-96" /> }
);

export const metadata: Metadata = {
  title: "GhostMyData - Remove Your Data From The Web",
  description:
    "Remove your personal data from data brokers, breach databases, and the dark web. Automated privacy protection with 98% success rate. Free scan.",
  keywords: [
    "data removal service",
    "remove personal data from internet",
    "data broker removal",
    "privacy protection",
    "personal data removal",
    "delete my data online",
    "opt out of data brokers",
    "Spokeo removal",
    "WhitePages removal",
    "BeenVerified removal",
    "people search removal",
    "identity protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com",
  },
  openGraph: {
    title: "GhostMyData - Remove Your Data From The Web",
    description:
      "Find and remove your data from data brokers, breach databases, and the dark web. Start your free scan today.",
    url: "https://ghostmydata.com",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData - Personal Data Removal Service",
      },
    ],
  },
};

const features = [
  {
    icon: Search,
    title: "Find Your Data",
    description:
      "We scan data brokers, breach databases, and the dark web. We find where your info is exposed.",
  },
  {
    icon: Trash2,
    title: "Auto Removal",
    description:
      "We send opt-out requests for you. We also send CCPA and GDPR requests on your behalf.",
  },
  {
    icon: Eye,
    title: "24/7 Monitoring",
    description:
      "We watch for new exposures all day. You get alerts when your data shows up.",
  },
  {
    icon: Lock,
    title: "Encrypted & Secure",
    description:
      "Your data is locked with AES-256. We never share it with anyone.",
  },
];

const dataSources = [
  { name: "Spokeo", type: "Data Broker" },
  { name: "WhitePages", type: "Data Broker" },
  { name: "BeenVerified", type: "Data Broker" },
  { name: "Have I Been Pwned", type: "Breach Database" },
  { name: "Dark Web Forums", type: "Dark Web" },
  { name: "LinkedIn", type: "Social Media" },
  { name: "Facebook", type: "Social Media" },
  { name: "And 2,100+ more...", type: "" },
];

const stats = [
  { value: "200M+", label: "Data points scanned" },
  { value: "2,100+", label: "Data sources" },
  { value: "98%", label: "Removal success rate" },
  { value: "24/7", label: "Monitoring" },
];

const trustBadges = [
  { icon: ShieldCheck, label: "256-bit Encryption" },
  { icon: RefreshCcw, label: "30-Day Money Back" },
  { icon: BadgeCheck, label: "CCPA/GDPR Compliant" },
  { icon: Lock, label: "SOC 2 Certified" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        {/* Floating decorative icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-[10%] animate-float opacity-20">
            <Shield className="h-12 w-12 text-emerald-400" />
          </div>
          <div className="absolute top-1/3 right-[12%] animate-float animation-delay-500 opacity-15">
            <Lock className="h-10 w-10 text-blue-400" />
          </div>
          <div className="absolute bottom-1/3 left-[15%] animate-float animation-delay-300 opacity-15">
            <Eye className="h-10 w-10 text-emerald-300" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-8 animate-fade-in">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-400">
                Your privacy, protected
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up animation-delay-100">
              Your Personal Data Is Being{" "}
              <span className="text-gradient-emerald-bright">
                Sold Right Now
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
              Data brokers are profiting from your personal information. GhostMyData
              finds where you&apos;re exposed and removes your data automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 hover:scale-105 text-lg px-8 animate-glow-pulse transition-transform"
                >
                  See My Exposed Data Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 hover:border-emerald-500/50 text-lg px-8 transition-colors"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="text-sm text-slate-500 mt-4 animate-fade-in animation-delay-400">
              No credit card required. See your exposed data in 60 seconds.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-slate-800 animate-fade-in-up animation-delay-500">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-slate-400">
                  <badge.icon className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection>
        <section className="border-y border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Data Is Everywhere
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Right now, your info is being bought and sold. It&apos;s in breaches.
              It&apos;s on the dark web.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          <AnimatedCard delay={100}>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow h-full">
              <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-4">
                <Database className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Data Brokers
              </h3>
              <p className="text-slate-400">
                Over 4,000 brokers sell your info. They have your name, address,
                phone, and more.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow h-full">
              <div className="p-3 bg-red-500/10 rounded-lg w-fit mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Data Breaches
              </h3>
              <p className="text-slate-400">
                Billions of records are leaked. Your email and passwords may
                already be out there.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow h-full">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
                <Globe className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Dark Web
              </h3>
              <p className="text-slate-400">
                Your info is sold on the dark web. Criminals use it for identity
                theft.
              </p>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How GhostMyData Works
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                We find and remove your data from hundreds of sites. It&apos;s automatic.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={feature.title} delay={(index + 1) * 100 as 100 | 200 | 300 | 400}>
                <div className="relative p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow h-full">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Video Explainer Section - Dynamically Loaded */}
      <VideoExplainerSection />

      {/* Data Sources Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              We Monitor 2,100+ Data Sources
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From major data brokers to breach databases and dark web forums.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dataSources.map((source, index) => (
            <AnimatedCard key={source.name} delay={(index % 4 + 1) * 100 as 100 | 200 | 300 | 400}>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center card-hover-glow">
                <div className="font-medium text-white">{source.name}</div>
                {source.type && (
                  <div className="text-xs text-slate-500 mt-1">{source.type}</div>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Testimonials Section - Dynamically Loaded */}
      <TestimonialsSection />

      {/* Lead Magnet Section - Dynamically Loaded */}
      <LeadMagnetSection />

      {/* Pricing Preview */}
      <AnimatedSection>
        <section className="bg-slate-900/50 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-slate-400">
                Start with a free scan. Upgrade when you&apos;re ready.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free */}
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow">
                <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-white mb-4">
                  $0<span className="text-sm font-normal text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["1 scan per month", "Basic exposure report", "Manual removal guides"].map(
                    (feature) => (
                      <li key={feature} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {feature}
                      </li>
                    )
                  )}
                </ul>
                <Link href="/register">
                  <Button variant="outline" className="w-full border-slate-600">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Pro */}
              <div className="relative p-6 bg-emerald-500/10 rounded-xl border-2 border-emerald-500 animate-border-glow glow-emerald scale-105">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full text-xs font-semibold text-white shadow-lg glow-emerald-sm">
                  Most Popular
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">Pro</h3>
                  <span className="px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-full">50% OFF</span>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-slate-500 line-through">$19.99/month</div>
                  <div className="text-3xl font-bold text-white">
                    $9.99<span className="text-sm font-normal text-slate-400">/mo</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Billed annually at $119.88</div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "10 scans per month",
                    "Automated removal requests",
                    "Continuous monitoring",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 animate-glow-pulse">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Enterprise */}
              <div className="relative p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">Enterprise</h3>
                  <span className="px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-full">55% OFF</span>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-slate-500 line-through">$49.99/month</div>
                  <div className="text-3xl font-bold text-white">
                    $22.50<span className="text-sm font-normal text-slate-400">/mo</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Billed annually at $269.95</div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Unlimited scans",
                    "Dark web monitoring",
                    "AI Shield (deepfake defense)",
                    "Do Not Call registration",
                    "Custom removal requests",
                    "Family plan (5 profiles)",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant="outline" className="w-full border-slate-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ Section - Dynamically Loaded */}
      <FAQSection />

      {/* CTA Section */}
      <AnimatedSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float animation-delay-500" />
              <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/5 rounded-full blur-xl animate-float animation-delay-300" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Every Minute, Your Data Is Being Exploited
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                Data brokers are profiting from your personal information right now.
                See exactly where you&apos;re exposed — completely free.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-slate-100 hover:scale-105 text-lg px-8 transition-transform"
                >
                  Find My Exposed Data Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-wrap justify-center gap-6 mt-6 text-white/70 text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Free scan
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Results in 60 seconds
                </span>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}

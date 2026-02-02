import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Search, AlertTriangle, FileText, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeFromPage } from "@/content/pages";

export const metadata: Metadata = {
  title: removeFromPage.meta.title,
  description: removeFromPage.meta.description,
  keywords: removeFromPage.meta.keywords,
  alternates: {
    canonical: "https://ghostmydata.com/remove-from",
  },
  openGraph: {
    title: removeFromPage.meta.title,
    description: removeFromPage.meta.description,
    url: "https://ghostmydata.com/remove-from",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Data Broker Removal Guides",
      },
    ],
  },
};

const brokers = [
  {
    name: "Spokeo",
    slug: "spokeo",
    description: "Popular people search site with 12+ billion records",
    difficulty: "Easy",
    time: "3-5 days",
  },
  {
    name: "WhitePages",
    slug: "whitepages",
    description: "One of the largest people search directories",
    difficulty: "Medium",
    time: "24-48 hours",
  },
  {
    name: "BeenVerified",
    slug: "beenverified",
    description: "Background check and people search service",
    difficulty: "Easy",
    time: "24 hours",
  },
  {
    name: "Intelius",
    slug: "intelius",
    description: "Comprehensive background check provider",
    difficulty: "Medium",
    time: "7-14 days",
  },
  {
    name: "PeopleFinder",
    slug: "peoplefinder",
    description: "Public records and people search database",
    difficulty: "Easy",
    time: "3-5 days",
  },
  {
    name: "TruePeopleSearch",
    slug: "truepeoplesearch",
    description: "Free people search with detailed profiles",
    difficulty: "Easy",
    time: "24-72 hours",
  },
  {
    name: "Radaris",
    slug: "radaris",
    description: "People search with property and court records",
    difficulty: "Hard",
    time: "7-30 days",
  },
  {
    name: "FastPeopleSearch",
    slug: "fastpeoplesearch",
    description: "Quick people lookup with public records",
    difficulty: "Easy",
    time: "24-48 hours",
  },
  {
    name: "MyLife",
    slug: "mylife",
    description: "Reputation management and people search",
    difficulty: "Hard",
    time: "7-14 days",
  },
  {
    name: "USSearch",
    slug: "ussearch",
    description: "Background check and people finder service",
    difficulty: "Medium",
    time: "5-7 days",
  },
];

export default function RemoveFromPage() {
  // Get content sections
  const heroSection = removeFromPage.sections.find(s => s.id === "hero");
  const howBrokersWorkSection = removeFromPage.sections.find(s => s.id === "how-brokers-work");
  const risksSection = removeFromPage.sections.find(s => s.id === "risks");
  const processSection = removeFromPage.sections.find(s => s.id === "our-process");
  const whyUsSection = removeFromPage.sections.find(s => s.id === "why-ghostmydata");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {heroSection?.title || "Remove Your Information from Data Brokers"}
        </h1>
        <div className="text-lg text-slate-300 max-w-3xl mx-auto space-y-4">
          {heroSection?.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Skip the Manual Work
        </h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Instead of manually opting out of each site, let GhostMyData automatically
          remove your data from 2,100+ data brokers with one click.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Search className="mr-2 h-5 w-5" />
            Start Your Free Scan
          </Button>
        </Link>
      </div>

      {/* How Data Brokers Work Section */}
      {howBrokersWorkSection && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{howBrokersWorkSection.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <FileText className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Public Records</h3>
              <p className="text-slate-400">Property records show where you live. Court docs show legal history. Voter rolls have your contact info.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <Eye className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Online Activity</h3>
              <p className="text-slate-400">Social media shares your details. Shopping sites track you. Sign-ups leak your email.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <Shield className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Third-Party Data</h3>
              <p className="text-slate-400">Brokers buy data from other firms. Credit card firms sell data. Stores share what you buy.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <Search className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">People-Search Sites</h3>
              <p className="text-slate-400">Anyone can search your name. They find your address fast. Your phone is public.</p>
            </div>
          </div>
        </div>
      )}

      {/* Risks Section */}
      {risksSection && (
        <div className="mb-16 p-8 bg-red-500/5 rounded-2xl border border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <h2 className="text-2xl font-bold text-white">{risksSection.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Identity Theft</h3>
              <p className="text-slate-400">Thieves use your data to open cards in your name. They file fake tax returns. They break into your accounts.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Stalking</h3>
              <p className="text-slate-400">Stalkers find targets on people-search sites. Your address shouldn&apos;t be online for all to see.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Scams</h3>
              <p className="text-slate-400">Scammers use your details to sound real. They name your family to trick you.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Unwanted Contact</h3>
              <p className="text-slate-400">Telemarketers buy your number. Junk mail piles up. Your data fuels constant spam.</p>
            </div>
          </div>
        </div>
      )}

      {/* Broker Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {brokers.map((broker) => (
          <Link
            key={broker.slug}
            href={`/remove-from/${broker.slug}`}
            className="group p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                {broker.name}
              </h3>
              <span className={`px-2 py-1 rounded text-xs ${
                broker.difficulty === "Easy"
                  ? "bg-green-500/10 text-green-400"
                  : broker.difficulty === "Medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {broker.difficulty}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-3">{broker.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Processing: {broker.time}
              </span>
              <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-slate-800/30 rounded-xl">
          <div className="text-4xl font-bold text-emerald-400 mb-2">4,000+</div>
          <div className="text-slate-400">Data Brokers Exist</div>
        </div>
        <div className="text-center p-6 bg-slate-800/30 rounded-xl">
          <div className="text-4xl font-bold text-emerald-400 mb-2">50+</div>
          <div className="text-slate-400">Average Sites Per Person</div>
        </div>
        <div className="text-center p-6 bg-slate-800/30 rounded-xl">
          <div className="text-4xl font-bold text-emerald-400 mb-2">100+</div>
          <div className="text-slate-400">Hours to Remove Manually</div>
        </div>
      </div>

      {/* Our Process Section */}
      {processSection && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{processSection.title}</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: 1, title: "Scan", desc: "We scan 200+ data broker sites for your information" },
              { step: 2, title: "Request", desc: "We submit removal requests to every site" },
              { step: 3, title: "Follow Up", desc: "We track and follow up on every request" },
              { step: 4, title: "Verify", desc: "We confirm your data is actually removed" },
              { step: 5, title: "Monitor", desc: "We continuously monitor for new exposures" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold">
                  {step}
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why GhostMyData Section */}
      {whyUsSection && (
        <div className="mb-16 p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">{whyUsSection.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Wide Coverage", desc: "We cover 200+ data broker sites. We check the big ones and small ones too." },
              { title: "Fully Automated", desc: "Set it up once. We do the rest 24/7." },
              { title: "Proven Results", desc: "We beat industry averages. We've helped thousands." },
              { title: "Clear Reports", desc: "See what we do in your dashboard. Track progress in real-time." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center p-8 bg-slate-800/30 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Don&apos;t Have Time for Manual Removal?
        </h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          GhostMyData automates the entire process. One scan, continuous protection.
          Every day you wait, your data spreads further. Take control of your privacy now.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

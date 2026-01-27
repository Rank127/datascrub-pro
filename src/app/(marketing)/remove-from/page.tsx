import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Data Broker Removal Guides - How to Remove Your Personal Information",
  description:
    "Step-by-step guides to remove your personal information from data brokers like Spokeo, WhitePages, BeenVerified, and more. Free opt-out instructions.",
  keywords: [
    "data broker removal",
    "opt out of data brokers",
    "remove personal information",
    "spokeo removal",
    "whitepages removal",
    "beenverified removal",
    "people search removal",
    "data broker opt out",
    "remove my information from internet",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from",
  },
  openGraph: {
    title: "Data Broker Removal Guides - Remove Your Personal Information",
    description:
      "Free step-by-step guides to remove your data from 50+ data brokers. Learn how to opt out and protect your privacy.",
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Data Broker Removal Guides
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Step-by-step instructions to remove your personal information from the
          most common data brokers and people search sites.
        </p>
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

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Don&apos;t Have Time for Manual Removal?
        </h2>
        <p className="text-slate-400 mb-6">
          GhostMyData automates the entire process. One scan, continuous protection.
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

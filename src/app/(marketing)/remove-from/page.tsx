import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Search, AlertTriangle, FileText, Eye, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeFromPage } from "@/content/pages";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { getAllBrokerPages, getTotalBrokerPageCount } from "@/lib/broker-pages/broker-page-data";

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

const faqs = [
  {
    question: "What is a data broker?",
    answer:
      "Data brokers are companies that collect, aggregate, and sell personal information from public records, online activity, purchase history, and other sources. They compile detailed profiles including your name, address, phone number, email, relatives, and more. The data broker industry generates over $200 billion annually by selling this information to marketers, employers, landlords, and anyone willing to pay.",
  },
  {
    question: "How many data brokers have my information?",
    answer:
      "The average person appears on 50+ data broker sites. Your information spreads through data broker networks as they buy and sell data from each other, creating a web of exposure that grows over time. Even if you remove yourself from one site, your data often reappears because brokers continuously re-acquire information from public records and other sources.",
  },
  {
    question: "Is it legal for data brokers to sell my data?",
    answer:
      "In most US states, yes. Data brokers operate in a largely unregulated space. However, laws like CCPA (California), VCDPA (Virginia), and CPA (Colorado) give residents the right to opt out of data sales. The EU's GDPR provides stronger protections for European residents. Federal regulation in the US remains limited, which is why proactive removal is so important.",
  },
  {
    question: "How long does data broker removal take?",
    answer:
      "It varies by broker. Easy removals (like USPhonebook) take 24-48 hours. Medium-difficulty brokers (like WhitePages or Intelius) take 3-14 days. Hard removals (like Arrests.org or Radaris) can take 7-30 days. Manual removal from all brokers would take 100+ hours of your time. GhostMyData automates this process so you don't have to spend that time.",
  },
  {
    question: "Will my data reappear after removal?",
    answer:
      "Yes, data brokers continuously collect new data from public records, online activity, and other brokers. Your information can reappear within weeks or months after removal. That's why ongoing monitoring is essential. GhostMyData provides continuous monitoring to catch and remove reappearing listings automatically.",
  },
  {
    question: "Can I remove my data from all brokers at once?",
    answer:
      "Manual removal requires visiting each broker individually, navigating different opt-out processes, and waiting for each request to be processed. There is no single opt-out form that covers all brokers. GhostMyData automates this process, submitting removal requests to 2,100+ data brokers simultaneously and monitoring for reappearances.",
  },
];

// Category display order for the hub page
const CATEGORY_ORDER = [
  "People Search", "Background Check", "Phone Lookup", "Court Records",
  "B2B Data", "Marketing Data", "Property Records", "Financial Data",
  "AI Facial Recognition", "AI Training", "AI Image & Video", "AI Voice",
  "Employment Data", "Tenant Screening", "Vehicle Data", "Insurance Data",
  "Healthcare", "Genealogy", "International", "Voter & Political Data",
  "Location Tracking", "Legal Records", "Data Broker",
];

export default function RemoveFromPage() {
  const allBrokers = getAllBrokerPages();
  const totalCount = getTotalBrokerPageCount();

  // Group brokers by category
  const grouped = new Map<string, typeof allBrokers>();
  for (const broker of allBrokers) {
    const existing = grouped.get(broker.category) ?? [];
    existing.push(broker);
    grouped.set(broker.category, existing);
  }

  // Sort categories by defined order
  const sortedCategories = [...grouped.keys()].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  // Get content sections
  const heroSection = removeFromPage.sections.find(s => s.id === "hero");
  const howBrokersWorkSection = removeFromPage.sections.find(s => s.id === "how-brokers-work");
  const risksSection = removeFromPage.sections.find(s => s.id === "risks");
  const processSection = removeFromPage.sections.find(s => s.id === "our-process");
  const whyUsSection = removeFromPage.sections.find(s => s.id === "why-ghostmydata");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Data Broker Removal Guides", url: "https://ghostmydata.com/remove-from" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Data Broker Removal Guides",
          description: "Step-by-step guides to remove your personal information from data brokers",
          numberOfItems: totalCount,
          itemListElement: allBrokers.slice(0, 100).map((broker, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `Remove from ${broker.name}`,
            url: `https://ghostmydata.com/remove-from/${broker.slug}`,
          })),
        }) }}
      />
      <FAQSchema faqs={faqs} />
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

      {/* Broker Grid — grouped by category */}
      {sortedCategories.map(category => {
        const categoryBrokers = grouped.get(category)!;
        return (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">{category}</h2>
            <p className="text-slate-500 text-sm mb-6">{categoryBrokers.length} removal {categoryBrokers.length === 1 ? "guide" : "guides"}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {categoryBrokers.map((broker) => (
                <Link
                  key={broker.slug}
                  href={`/remove-from/${broker.slug}`}
                  className="group p-5 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate mr-2">
                      {broker.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                      broker.difficulty === "Easy"
                        ? "bg-green-500/10 text-green-400"
                        : broker.difficulty === "Medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {broker.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2 line-clamp-2">{broker.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Processing: {broker.time}
                    </span>
                    <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-8 mb-16">
        <div className="text-center p-6 bg-slate-800/30 rounded-xl">
          <div className="text-4xl font-bold text-emerald-400 mb-2">{totalCount}+</div>
          <div className="text-slate-400">Step-by-Step Guides</div>
        </div>
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
              { title: "Hands-Free", desc: "Set it up once. We handle the rest so you don't have to." },
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

      {/* FAQ Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions About Data Brokers
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Understanding how data brokers work is the first step to protecting your privacy.
            Here are answers to the most common questions about data broker removal.
          </p>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
            >
              <summary className="flex items-center gap-3 p-6 cursor-pointer list-none hover:bg-slate-800/80 transition-colors">
                <HelpCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-lg font-semibold text-white flex-1">{faq.question}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-6 pb-6 pt-0 ml-8">
                <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

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

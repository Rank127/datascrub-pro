import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Data Broker Removal Statistics 2026 | GhostMyData",
  description:
    "Real data broker removal statistics from GhostMyData's operations. See success rates, average removal times, and broker response data based on thousands of removal requests.",
  keywords: [
    "data broker removal statistics",
    "data removal success rate",
    "data broker response time",
    "data removal service results",
    "privacy removal statistics 2026",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-statistics",
  },
  openGraph: {
    title: "Data Broker Removal Statistics 2026 | GhostMyData",
    description:
      "Real data broker removal statistics based on thousands of removal requests. See which brokers respond fastest and our overall success rates.",
    url: "https://ghostmydata.com/data-removal-statistics",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Data Removal Statistics",
      },
    ],
  },
};

const faqs = [
  {
    question: "How are these data removal statistics calculated?",
    answer:
      "Our statistics are calculated from real removal requests processed through GhostMyData's platform. Success rates reflect confirmed removals, and timing data is measured from request submission to confirmed completion.",
  },
  {
    question: "How often are the statistics updated?",
    answer:
      "Statistics are updated hourly based on live operational data from our removal pipeline. The numbers you see reflect our actual performance across all active removal requests.",
  },
  {
    question: "What counts as a successful removal?",
    answer:
      "A successful removal means the data broker has confirmed deletion of the user's personal information, or our verification scan confirms the listing has been removed from the broker's site.",
  },
  {
    question: "Why do some brokers have lower success rates?",
    answer:
      "Some data brokers have complex opt-out processes, require additional verification, or have longer processing times. Our system automatically follows up and retries with different methods when initial requests aren't successful.",
  },
  {
    question: "How does GhostMyData compare to other removal services?",
    answer:
      "GhostMyData scans 2,100+ data brokers — more than any other service. Our AI-powered agents automate the entire process, from submission to verification, resulting in faster and more thorough removals.",
  },
  {
    question: "Can I see my own removal statistics?",
    answer:
      "Yes! Every GhostMyData user has a personal dashboard showing their individual removal progress, including which brokers have been contacted, response status, and completion rates.",
  },
];

interface StatsData {
  overview: {
    totalRemovals: number;
    completedRemovals: number;
    successRate: number;
    avgCompletionHours: number;
    totalBrokersTracked: number;
  };
  statusDistribution: {
    completed: number;
    pending: number;
    submitted: number;
    inProgress: number;
  };
  severityDistribution: Record<string, number>;
  removalMethods: Record<string, number>;
  topBrokers: { name: string; successRate: number; completedRemovals: number }[];
  worstBrokers: { name: string; successRate: number; completedRemovals: number }[];
}

async function getStats(): Promise<StatsData | null> {
  try {
    const res = await fetch(`${APP_URL}/api/public/stats`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DataRemovalStatisticsPage() {
  const stats = await getStats();

  const totalRemovals = stats?.overview.totalRemovals ?? 0;
  const successRate = stats?.overview.successRate ?? 0;
  const avgHours = stats?.overview.avgCompletionHours ?? 0;
  const brokersTracked = stats?.overview.totalBrokersTracked ?? 0;

  const avgDays = avgHours > 0 ? Math.round(avgHours / 24) : 0;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          {
            name: "Data Removal Statistics",
            url: "https://ghostmydata.com/data-removal-statistics",
          },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
              Live Operational Data
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-6 mb-6">
              Data Broker Removal Statistics
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real performance data from GhostMyData&apos;s removal pipeline.
              These numbers come from actual removal requests — not estimates.
            </p>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  {totalRemovals.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Total Removals Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  {successRate}%
                </div>
                <div className="text-gray-400 text-sm">Overall Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  {avgDays > 0 ? `${avgDays} days` : "—"}
                </div>
                <div className="text-gray-400 text-sm">Avg Completion Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  {brokersTracked > 0 ? `${brokersTracked}+` : "2,100+"}
                </div>
                <div className="text-gray-400 text-sm">Brokers Tracked</div>
              </div>
            </div>
          </div>
        </section>

        {/* Removal Method Breakdown */}
        {stats?.removalMethods && Object.keys(stats.removalMethods).length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-3xl font-bold text-white text-center mb-4">
                Removal Requests by Method
              </h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                How removal requests are submitted across different opt-out methods
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {Object.entries(stats.removalMethods).map(([method, count]) => {
                  const total = Object.values(stats.removalMethods).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div
                      key={method}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                    >
                      <div className="text-2xl font-bold text-white mb-1">
                        {pct}%
                      </div>
                      <div className="text-gray-400 text-sm mb-3 capitalize">
                        {method.toLowerCase().replace(/_/g, " ")}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-gray-500 text-xs mt-2">
                        {count.toLocaleString()} requests
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Top Brokers Tables */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Fastest Responding */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Top 10 Highest Success Rate Brokers
                </h2>
                {stats?.topBrokers && stats.topBrokers.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-2 text-left text-gray-400 text-sm font-medium">
                          Broker
                        </th>
                        <th className="py-2 text-right text-gray-400 text-sm font-medium">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topBrokers.map((broker, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-3 text-white">{broker.name}</td>
                          <td className="py-3 text-right">
                            <span className="text-emerald-400 font-semibold">
                              {broker.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">Data loading...</p>
                )}
              </div>

              {/* Slowest Responding */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Top 10 Lowest Success Rate Brokers
                </h2>
                {stats?.worstBrokers && stats.worstBrokers.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-2 text-left text-gray-400 text-sm font-medium">
                          Broker
                        </th>
                        <th className="py-2 text-right text-gray-400 text-sm font-medium">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.worstBrokers.map((broker, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-3 text-white">{broker.name}</td>
                          <td className="py-3 text-right">
                            <span className="text-red-400 font-semibold">
                              {broker.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">Data loading...</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Exposure Severity */}
        {stats?.severityDistribution &&
          Object.keys(stats.severityDistribution).length > 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-6xl">
                <h2 className="text-3xl font-bold text-white text-center mb-4">
                  Exposure Severity Distribution
                </h2>
                <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                  Breakdown of data exposures by severity level across all scans
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {Object.entries(stats.severityDistribution).map(
                    ([severity, count]) => {
                      const colorMap: Record<string, string> = {
                        CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
                        HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                        MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
                        LOW: "text-green-400 bg-green-500/10 border-green-500/20",
                      };
                      const colors =
                        colorMap[severity] ||
                        "text-gray-400 bg-gray-500/10 border-gray-500/20";
                      return (
                        <div
                          key={severity}
                          className={`rounded-xl p-6 text-center border ${colors}`}
                        >
                          <div className="text-2xl font-bold mb-1">
                            {count.toLocaleString()}
                          </div>
                          <div className="text-sm opacity-80">{severity}</div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </section>
          )}

        {/* Year in Review */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              What Our Data Reveals
            </h2>
            <div className="space-y-6 text-gray-300">
              <p>
                Data brokers are a growing challenge for personal privacy. Our
                operational data shows that the average person appears on dozens
                of data broker sites, often without their knowledge. Each
                exposure creates a vector for spam, scams, identity theft, and
                unwanted contact.
              </p>
              <p>
                Through our AI-powered removal pipeline, we&apos;ve observed that
                most data brokers comply with removal requests within 7-14 days
                when properly formatted and submitted through the correct
                channels. However, some brokers require multiple follow-ups and
                escalation before completing removal.
              </p>
              <p>
                Our 24 AI agents continuously monitor for re-listings — because
                data brokers frequently re-add information from public records
                and other sources. Ongoing monitoring, not just one-time removal,
                is essential for lasting privacy protection.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              See Your Own Removal Statistics
            </h2>
            <p className="text-gray-300 mb-8">
              Start a free scan to discover where your data is exposed. Our AI
              agents will handle the removal process for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Free Scan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

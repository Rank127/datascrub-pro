import type { Metadata } from "next";
import Link from "next/link";
import { Shield, AlertTriangle, ArrowRight } from "lucide-react";

const levelConfig = {
  low: {
    label: "Low Risk",
    color: "text-green-400",
    bgColor: "bg-green-500",
    description:
      "Your privacy practices are solid. Keep it up and stay vigilant as new threats emerge.",
  },
  medium: {
    label: "Medium Risk",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500",
    description:
      "Your personal data has moderate exposure. Taking action now can prevent bigger issues down the road.",
  },
  high: {
    label: "High Risk",
    color: "text-orange-400",
    bgColor: "bg-orange-500",
    description:
      "Your personal data is significantly exposed online. Immediate action is recommended to reduce your risk.",
  },
  critical: {
    label: "Critical Risk",
    color: "text-red-400",
    bgColor: "bg-red-500",
    description:
      "Your privacy is severely compromised. Your data is likely available on multiple broker sites and breach databases.",
  },
} as const;

type Level = keyof typeof levelConfig;

function parseParams(searchParams: Record<string, string | string[] | undefined>) {
  const rawScore = parseInt(String(searchParams.score || "50"), 10);
  const score = Math.max(0, Math.min(100, isNaN(rawScore) ? 50 : rawScore));

  const rawLevel = String(searchParams.level || "");
  const level: Level = (["low", "medium", "high", "critical"] as const).includes(
    rawLevel as Level
  )
    ? (rawLevel as Level)
    : "medium";

  return { score, level };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { score, level } = parseParams(params);
  const info = levelConfig[level];

  return {
    title: `I scored ${score}/100 on the Privacy Score Quiz | GhostMyData`,
    description: `My privacy risk level is ${info.label}. Take the free 2-minute quiz to discover your own privacy score and find out how exposed your data is.`,
    alternates: {
      canonical: `https://ghostmydata.com/privacy-score/results?score=${score}&level=${level}`,
    },
    openGraph: {
      title: `I scored ${score}/100 on the Privacy Score Quiz`,
      description: `My privacy risk level is ${info.label}. How exposed is YOUR data? Take the free quiz to find out.`,
      url: `https://ghostmydata.com/privacy-score/results?score=${score}&level=${level}`,
      type: "website",
      images: [
        {
          url: `/og/privacy-score?score=${score}&level=${level}`,
          width: 1200,
          height: 630,
          alt: `Privacy Score: ${score}/100 - ${info.label}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `I scored ${score}/100 on the Privacy Score Quiz`,
      description: `My risk level: ${info.label}. Take the free quiz to check yours.`,
      images: [`/og/privacy-score?score=${score}&level=${level}`],
    },
  };
}

export default async function PrivacyScoreResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { score, level } = parseParams(params);
  const info = levelConfig[level];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            {/* Score Card */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${info.bgColor}/20 mb-4`}
                >
                  {level === "critical" || level === "high" ? (
                    <AlertTriangle className={`h-10 w-10 ${info.color}`} />
                  ) : (
                    <Shield className={`h-10 w-10 ${info.color}`} />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Privacy Score:{" "}
                  <span className={info.color}>{score}</span>
                </h1>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${info.bgColor}/20 ${info.color}`}
                >
                  {info.label}
                </div>
              </div>

              {/* Score Bar */}
              <div className="mb-6">
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${info.bgColor}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Critical</span>
                  <span>Safe</span>
                </div>
              </div>

              <p className="text-slate-400 text-center mb-6">
                {info.description}
              </p>

              <div className="space-y-3">
                <Link href="/privacy-score" className="block">
                  <button className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    Take the Quiz Yourself
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/register" className="block">
                  <button className="w-full px-4 py-3 border border-slate-600 hover:border-slate-500 text-white font-medium rounded-lg transition-colors">
                    Start Free Scan
                  </button>
                </Link>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                This score was calculated using the GhostMyData Privacy Score
                Quiz. Want to find out how exposed your data really is?
              </p>
              <Link
                href="/privacy-score"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm mt-2 transition-colors"
              >
                Take the free 2-minute quiz
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

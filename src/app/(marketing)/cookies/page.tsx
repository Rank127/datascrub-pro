import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | GhostMyData",
  description:
    "Learn about the cookies GhostMyData uses, why we use them, and how to manage your cookie preferences. We respect your privacy.",
  keywords: [
    "cookie policy",
    "cookies",
    "privacy",
    "tracking",
    "analytics cookies",
    "data removal service",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/cookies",
  },
  openGraph: {
    title: "Cookie Policy | GhostMyData",
    description:
      "Learn about the cookies GhostMyData uses, why we use them, and how to manage your preferences.",
    url: "https://ghostmydata.com/cookies",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const cookieCategories = [
  {
    category: "Strictly Necessary",
    description:
      "These cookies are required for our site to work. They handle login sessions, security tokens, and CSRF protection. You cannot disable them.",
    cookies: [
      {
        name: "next-auth.session-token",
        provider: "GhostMyData",
        purpose: "Keeps you signed in",
        duration: "Session",
      },
      {
        name: "__Host-next-auth.csrf-token",
        provider: "GhostMyData",
        purpose: "Prevents cross-site request forgery",
        duration: "Session",
      },
      {
        name: "next-auth.callback-url",
        provider: "GhostMyData",
        purpose: "Stores redirect URL after login",
        duration: "Session",
      },
    ],
  },
  {
    category: "Analytics",
    description:
      "These cookies help us understand how visitors use our site so we can improve the experience. They collect anonymous usage data.",
    cookies: [
      {
        name: "_ga, _ga_*",
        provider: "Google Analytics",
        purpose: "Tracks anonymous page views and user journeys",
        duration: "2 years",
      },
      {
        name: "ph_*",
        provider: "PostHog",
        purpose: "Product analytics for feature usage tracking",
        duration: "1 year",
      },
    ],
  },
  {
    category: "Marketing",
    description:
      "These cookies help us measure the effectiveness of our advertising and understand how visitors arrive at our site.",
    cookies: [
      {
        name: "_clck, _clsk",
        provider: "Microsoft Clarity",
        purpose: "Session recording and heatmaps for UX improvement",
        duration: "1 year",
      },
      {
        name: "_fbp",
        provider: "Meta (Facebook)",
        purpose: "Conversion tracking for ad campaigns",
        duration: "90 days",
      },
    ],
  },
];

const browserLinks = [
  { name: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
  { name: "Mozilla Firefox", url: "https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" },
  { name: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
  { name: "Microsoft Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
];

export default function CookiePolicyPage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
        <p className="text-slate-400 text-lg mb-8">
          Last updated: February 15, 2026
        </p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-300 text-lg">
              This Cookie Policy explains what cookies are, how GhostMyData uses them,
              and how you can control them. We keep things simple and transparent — just
              like everything else we do.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
            <p className="text-slate-400 mb-4">
              Cookies are small text files stored on your device when you visit a website.
              They help sites remember your preferences, keep you signed in, and understand
              how you use the site. Cookies are standard across the web and are used by
              virtually all websites.
            </p>
            <p className="text-slate-400">
              Cookies can be &quot;session&quot; cookies (deleted when you close your browser) or
              &quot;persistent&quot; cookies (stay on your device for a set time or until you delete them).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Cookies We Use</h2>
            <p className="text-slate-400 mb-6">
              We organize our cookies into three categories based on their purpose:
            </p>

            {cookieCategories.map((cat) => (
              <div key={cat.category} className="mb-8">
                <h3 className="text-xl font-medium text-white mb-3">{cat.category}</h3>
                <p className="text-slate-400 mb-4">{cat.description}</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Cookie</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Provider</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Purpose</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-400">
                      {cat.cookies.map((cookie) => (
                        <tr key={cookie.name} className="border-b border-slate-800">
                          <td className="py-3 px-4 font-mono text-xs text-slate-300">{cookie.name}</td>
                          <td className="py-3 px-4">{cookie.provider}</td>
                          <td className="py-3 px-4">{cookie.purpose}</td>
                          <td className="py-3 px-4">{cookie.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How to Manage Cookies</h2>
            <p className="text-slate-400 mb-4">
              You can control and delete cookies through your browser settings. Here&apos;s how
              in the most popular browsers:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              {browserLinks.map((browser) => (
                <li key={browser.name}>
                  <strong className="text-slate-300">{browser.name}:</strong>{" "}
                  <a
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Cookie settings guide
                  </a>
                </li>
              ))}
            </ul>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">Note:</strong> Blocking strictly necessary
                cookies may prevent you from logging in or using our service. Analytics and
                marketing cookies can be disabled without affecting core functionality.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Do Not Track</h2>
            <p className="text-slate-400">
              We honor Do Not Track (DNT) signals from your browser. When we detect a DNT
              signal, we disable analytics and marketing cookies for your session.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p className="text-slate-400">
              We may update this Cookie Policy from time to time. Changes will be posted on
              this page with an updated date. For significant changes, we&apos;ll notify you
              through our website or email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Questions?</h2>
            <p className="text-slate-400 mb-4">
              Have questions about our use of cookies? Contact us:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300">
                <strong>Privacy:</strong>{" "}
                <a
                  href="mailto:privacy@ghostmydata.com"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  privacy@ghostmydata.com
                </a>
              </p>
            </div>
            <p className="text-slate-400 mt-4">
              For more about how we handle your data, see our{" "}
              <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                Privacy Policy
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

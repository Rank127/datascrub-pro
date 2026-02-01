import type { Metadata } from "next";
import { privacyPage } from "@/content/pages";

export const metadata: Metadata = {
  title: privacyPage.meta.title,
  description: privacyPage.meta.description,
  keywords: privacyPage.meta.keywords,
  alternates: {
    canonical: "https://ghostmydata.com/privacy",
  },
  openGraph: {
    title: privacyPage.meta.title,
    description: privacyPage.meta.description,
    url: "https://ghostmydata.com/privacy",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Privacy Policy",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  // Get SEO content sections
  const introSection = privacyPage.sections.find(s => s.id === "intro");
  const commitmentSection = privacyPage.sections.find(s => s.id === "commitment");
  const neverDoSection = privacyPage.sections.find(s => s.id === "what-we-dont-do");

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">{introSection?.title || "Privacy Policy"}</h1>
        <p className="text-slate-400 text-lg mb-8">
          Last updated: January 20, 2026
        </p>

        {/* SEO-Optimized Introduction */}
        <div className="mb-8 space-y-4">
          {introSection?.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-lg text-slate-300">{para}</p>
          ))}
        </div>

        {/* Commitment Section for SEO */}
        {commitmentSection && (
          <div className="mb-8 p-6 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
            <h2 className="text-xl font-bold text-white mb-4">{commitmentSection.title}</h2>
            <div className="text-slate-300 space-y-4">
              {commitmentSection.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* What We Never Do - Important for trust */}
        {neverDoSection && (
          <div className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">{neverDoSection.title}</h2>
            <div className="text-slate-300 space-y-4">
              {neverDoSection.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        <div className="prose prose-invert prose-slate max-w-none space-y-8">

          <section className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-300 text-lg">
              Privacy matters to us. That&apos;s why we exist. This policy tells you how we use your data.
              We protect your info just like we help you remove it from other sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. What We Collect</h2>

            <h3 className="text-xl font-medium text-white mb-3">1.1 Info You Give Us</h3>
            <p className="text-slate-400 mb-4">
              To help remove your data, we collect what you share:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Account Info:</strong> Email, name, and password (we hash it for safety)</li>
              <li><strong className="text-slate-300">Scan Info:</strong> Emails, phones, addresses, and names you want us to search</li>
              <li><strong className="text-slate-300">Sensitive Info (Optional):</strong> Birthday, SSN for dark web scans. SSNs are hashed right away. We never store them in plain text.</li>
              <li><strong className="text-slate-300">Payment Info:</strong> Stripe handles your card. We don&apos;t store card numbers.</li>
              <li><strong className="text-slate-300">Support Messages:</strong> When you email us</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">1.2 Info We Get Automatically</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Usage Data:</strong> Pages you visit and features you use</li>
              <li><strong className="text-slate-300">Device Info:</strong> Browser, OS, and IP address</li>
              <li><strong className="text-slate-300">Cookies:</strong> Only for login. No ads or tracking.</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">1.3 Info from Scans</h3>
            <p className="text-slate-400 mb-4">
              When we scan for you, we may find your data on:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Data broker sites</li>
              <li>Breach databases</li>
              <li>Dark web</li>
              <li>Public records and social media</li>
            </ul>
            <p className="text-slate-400 mt-4">
              We only collect this to show you where your data is. Then we help remove it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Info</h2>
            <p className="text-slate-400 mb-4">We only use your info for:</p>

            <h3 className="text-xl font-medium text-white mb-3">2.1 Our Service</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Scanning sites to find your data</li>
              <li>Sending opt-out requests for you</li>
              <li>Sending CCPA/GDPR deletion requests</li>
              <li>Watching for new exposures</li>
              <li>Helping you with support</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">2.2 Your Account</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Setting up and running your account</li>
              <li>Processing your payments</li>
              <li>Sending you scan results and updates</li>
              <li>Keeping your account safe</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">2.3 Making Things Better</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Learning how to improve (using data with no names)</li>
              <li>Building new features</li>
              <li>Keeping the service secure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Who We Share With</h2>
            <p className="text-slate-400 mb-4">
              <strong className="text-emerald-400">We never sell your data. Ever.</strong> We only share it when:
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.1 You Ask Us To</h3>
            <p className="text-slate-400 mb-6">
              When we send removal requests, we share the minimum info needed with data brokers.
              This is how we remove your data for you.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.2 Our Partners</h3>
            <p className="text-slate-400 mb-4">We use trusted services:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Stripe:</strong> Payments</li>
              <li><strong className="text-slate-300">Vercel:</strong> Hosting</li>
              <li><strong className="text-slate-300">Supabase:</strong> Database</li>
              <li><strong className="text-slate-300">Resend:</strong> Emails</li>
              <li><strong className="text-slate-300">Have I Been Pwned:</strong> Breach checks</li>
            </ul>
            <p className="text-slate-400 mb-6">
              They must protect your data. They can only use it to help us serve you.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.3 Legal Requests</h3>
            <p className="text-slate-400">
              We may share data if the law requires it. We&apos;ll tell you if we can.
              We push back on requests that go too far.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Keep You Safe</h2>
            <p className="text-slate-400 mb-4">
              We use strong security to protect your data:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Storage:</strong> AES-256 encryption locks your data</li>
              <li><strong className="text-slate-300">Transfer:</strong> HTTPS keeps data safe in transit</li>
              <li><strong className="text-slate-300">Passwords:</strong> We hash them with bcrypt</li>
              <li><strong className="text-slate-300">SSNs:</strong> Hashed right away. Never stored in plain text.</li>
              <li><strong className="text-slate-300">Access:</strong> Staff only see what they need</li>
              <li><strong className="text-slate-300">Hosting:</strong> SOC 2 Type II compliant</li>
              <li><strong className="text-slate-300">Testing:</strong> Regular security checks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. How Long We Keep Data</h2>
            <p className="text-slate-400 mb-4">Here&apos;s how long we keep things:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Account Data:</strong> While active, plus 30 days after you delete</li>
              <li><strong className="text-slate-300">Scan Results:</strong> 12 months to track removals</li>
              <li><strong className="text-slate-300">Removal Records:</strong> 24 months for records</li>
              <li><strong className="text-slate-300">Payment Records:</strong> 7 years (tax law)</li>
              <li><strong className="text-slate-300">Logs:</strong> 90 days, then auto-deleted</li>
            </ul>
            <p className="text-slate-400 mt-4">
              Want your data gone? Delete your account. We&apos;ll remove your info within 30 days.
              Some data we must keep by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>

            <h3 className="text-xl font-medium text-white mb-3">6.1 Everyone Gets These</h3>
            <p className="text-slate-400 mb-4">No matter where you live, you can:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>See and download your data</li>
              <li>Fix wrong info</li>
              <li>Delete your account</li>
              <li>Export your data</li>
              <li>Stop marketing emails</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">6.2 California (CCPA)</h3>
            <p className="text-slate-400 mb-4">California folks also get:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Know what data we have and how we use it</li>
              <li>Delete your data</li>
              <li>Stop data sales (we don&apos;t sell anyway)</li>
              <li>No punishment for using your rights</li>
              <li>Fix wrong data</li>
              <li>Limit use of sensitive data</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">6.3 Europe (GDPR)</h3>
            <p className="text-slate-400 mb-4">EU folks also get:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>See your data</li>
              <li>Fix wrong data</li>
              <li>Delete your data</li>
              <li>Stop processing</li>
              <li>Move your data</li>
              <li>Say no to processing</li>
              <li>Take back consent</li>
              <li>Complain to authorities</li>
            </ul>
            <p className="text-slate-400">
              We process your data to run our service, with your consent, and to keep things safe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Kids</h2>
            <p className="text-slate-400">
              Our service is for adults 18 and up. We don&apos;t collect kids&apos; data on purpose.
              If we find out we have a child&apos;s info, we delete it. Tell us if you think a child signed up.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Transfers</h2>
            <p className="text-slate-400">
              Your data may move to other countries. We use legal safeguards to protect it.
              By using our service, you agree to this.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies</h2>
            <p className="text-slate-400 mb-4">We only use cookies we need:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Login Cookies:</strong> Keep you signed in</li>
              <li><strong className="text-slate-300">Session Cookies:</strong> Remember your session</li>
              <li><strong className="text-slate-300">Security Cookies:</strong> Stop attacks</li>
            </ul>
            <p className="text-slate-400 mt-4">
              No ad cookies. No tracking. We honor Do Not Track.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Policy Changes</h2>
            <p className="text-slate-400">
              We may update this policy. We&apos;ll post changes here with a new date. For big changes, we&apos;ll email you.
              If you keep using our service, you agree to the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-400 mb-4">
              Questions? Want to use your rights? Reach out:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300">
                <strong>Privacy:</strong>{" "}
                <a href="mailto:privacy@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  privacy@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300 mt-2">
                <strong>DPO:</strong>{" "}
                <a href="mailto:dpo@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  dpo@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300 mt-2">
                <strong>Support:</strong>{" "}
                <a href="mailto:support@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  support@ghostmydata.com
                </a>
              </p>
            </div>
            <p className="text-slate-400 mt-4">
              We reply within 30 days.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

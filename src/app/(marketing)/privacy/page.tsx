import type { Metadata } from "next";
import Link from "next/link";
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
          Last updated: February 15, 2026
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
              <li><strong className="text-slate-300">Cookies:</strong> Session cookies, analytics cookies, and marketing pixels. See our <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300 underline">Cookie Policy</Link> for full details.</li>
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
            <h2 className="text-2xl font-semibold text-white mb-4">3. Legal Basis for Processing (GDPR Art. 6)</h2>
            <p className="text-slate-400 mb-4">
              We process your data under these legal bases, as defined in GDPR Article 6:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Contract Performance (Art. 6(1)(b)):</strong> Processing needed to provide our data removal service to you</li>
              <li><strong className="text-slate-300">Consent (Art. 6(1)(a)):</strong> For optional features like marketing emails and analytics cookies. We obtain consent through clear opt-in mechanisms (e.g., checkbox on registration, cookie consent banner for EU visitors).</li>
              <li><strong className="text-slate-300">Legitimate Interest (Art. 6(1)(f)):</strong> For security monitoring, fraud prevention, and service improvement</li>
              <li><strong className="text-slate-300">Legal Obligation (Art. 6(1)(c)):</strong> For tax records, legal requests, and regulatory compliance</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">3.1 Sensitive Data (GDPR Art. 9)</h3>
            <p className="text-slate-400 mb-4">
              When you optionally provide sensitive data such as Social Security Numbers for dark web monitoring, we process this under:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Explicit Consent (Art. 9(2)(a)):</strong> You explicitly opt in before providing sensitive information. SSNs are immediately hashed (SHA-256 with unique salt) and the plaintext is never stored.</li>
              <li><strong className="text-slate-300">Substantial Public Interest (Art. 9(2)(g)):</strong> Processing necessary for identity theft prevention and protection of individuals against data broker exploitation</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">3.2 Automated Decision-Making (GDPR Art. 22)</h3>
            <p className="text-slate-400 mb-4">
              Our service uses AI-assisted automation for scan processing, ticket routing, and removal request optimization. These automated processes assist our service delivery but do not produce legal or similarly significant effects on users. No decisions about your account status, plan features, or data access are made solely by automated means without human oversight. You may contact us at any time to request human review of any automated decision.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.3 Data Protection Impact Assessment</h3>
            <p className="text-slate-400">
              We conduct Data Protection Impact Assessments (DPIAs) as required by GDPR Article 35 for processing activities that are likely to result in a high risk to individuals, including our data scanning and removal operations involving sensitive personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. AI Usage Disclosure</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                We use AI agents internally to improve our service. Here is how:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
                <li><strong className="text-slate-300">Scan Automation:</strong> AI helps identify your data across broker sites faster</li>
                <li><strong className="text-slate-300">Ticket Processing:</strong> AI assists with support ticket routing and resolution</li>
                <li><strong className="text-slate-300">Compliance Monitoring:</strong> AI monitors data broker compliance with removal requests</li>
              </ul>
              <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <p className="text-emerald-300 font-medium mb-2">What We Never Do With AI:</p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>We never share your personal data with AI model training</li>
                  <li>All AI processing uses encrypted, ephemeral sessions</li>
                  <li>Your data is never used to train or fine-tune AI models</li>
                  <li>AI outputs are reviewed by human staff for quality</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Who We Share With</h2>
            <p className="text-slate-400 mb-4">
              <strong className="text-emerald-400">We never sell your data. Ever.</strong> We only share it when:
            </p>

            <h3 className="text-xl font-medium text-white mb-3">5.1 You Ask Us To</h3>
            <p className="text-slate-400 mb-6">
              When we send removal requests, we share the minimum info needed with data brokers.
              This is how we remove your data for you.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">5.2 Our Subprocessors</h3>
            <p className="text-slate-400 mb-4">We use trusted services to run our platform. Each subprocessor is contractually bound to protect your data:</p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Subprocessor</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Purpose</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Data Processed</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Vercel</td>
                    <td className="py-3 px-4">Hosting &amp; CDN</td>
                    <td className="py-3 px-4">All application data</td>
                    <td className="py-3 px-4">US (AWS)</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">AWS (via Neon/Supabase)</td>
                    <td className="py-3 px-4">Database hosting</td>
                    <td className="py-3 px-4">Account &amp; scan data (encrypted)</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Stripe</td>
                    <td className="py-3 px-4">Payment processing</td>
                    <td className="py-3 px-4">Payment info, email</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Anthropic</td>
                    <td className="py-3 px-4">AI processing (ephemeral)</td>
                    <td className="py-3 px-4">Anonymized service data only</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Resend</td>
                    <td className="py-3 px-4">Transactional email</td>
                    <td className="py-3 px-4">Email address, name</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">LeakCheck</td>
                    <td className="py-3 px-4">Breach monitoring</td>
                    <td className="py-3 px-4">Hashed email/credentials</td>
                    <td className="py-3 px-4">EU</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Upstash (Redis)</td>
                    <td className="py-3 px-4">Caching &amp; rate limiting</td>
                    <td className="py-3 px-4">Session tokens, rate limit counters</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">PostHog</td>
                    <td className="py-3 px-4">Product analytics</td>
                    <td className="py-3 px-4">Anonymous usage events</td>
                    <td className="py-3 px-4">US/EU</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Sentry</td>
                    <td className="py-3 px-4">Error monitoring</td>
                    <td className="py-3 px-4">Error logs (no PII)</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Google Analytics</td>
                    <td className="py-3 px-4">Web analytics</td>
                    <td className="py-3 px-4">Anonymized usage data (IP anonymization enabled)</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">Microsoft Clarity</td>
                    <td className="py-3 px-4">UX analytics (session recording, heatmaps)</td>
                    <td className="py-3 px-4">Anonymized interaction data</td>
                    <td className="py-3 px-4">US</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-medium text-white mb-3">5.3 Legal Requests</h3>
            <p className="text-slate-400">
              We may share data if the law requires it. We&apos;ll tell you if we can.
              We push back on requests that go too far.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. How We Keep You Safe</h2>
            <p className="text-slate-400 mb-4">
              We use strong security to protect your data:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Storage:</strong> AES-256-GCM authenticated encryption with unique initialization vectors per operation</li>
              <li><strong className="text-slate-300">Transfer:</strong> TLS 1.3 encrypted connections (HSTS enforced)</li>
              <li><strong className="text-slate-300">Passwords:</strong> Hashed with bcrypt (cost factor 12). Never stored in plain text.</li>
              <li><strong className="text-slate-300">SSNs:</strong> SHA-256 hashed with unique salt. Never stored in plain text.</li>
              <li><strong className="text-slate-300">Access:</strong> Staff only see what they need (least privilege). Role-based access control with full audit logging.</li>
              <li><strong className="text-slate-300">Hosting:</strong> SOC 2 Type II compliant infrastructure (Vercel/AWS)</li>
              <li><strong className="text-slate-300">Testing:</strong> Automated vulnerability scanning and code review on every deployment. See our <Link href="/vulnerability-disclosure" className="text-emerald-400 hover:text-emerald-300 underline">Vulnerability Disclosure Policy</Link>.</li>
              <li><strong className="text-slate-300">Monitoring:</strong> 24/7 security monitoring with Sentry (PII excluded)</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">6.1 Breach Notification</h3>
            <p className="text-slate-400">
              In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours per GDPR Article 33. Where the breach is likely to result in a high risk to you, we will also notify affected users without undue delay per GDPR Article 34. For California residents, we will provide notification as required by Cal. Civ. Code &sect; 1798.82.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. How Long We Keep Data</h2>
            <p className="text-slate-400 mb-4">Here are our specific retention timelines:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Data Type</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">While Active</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">After Cancellation</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Account Data</td>
                    <td className="py-3 px-4">Duration of account</td>
                    <td className="py-3 px-4">Deleted within 30 days</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Scan Results</td>
                    <td className="py-3 px-4">12 months rolling</td>
                    <td className="py-3 px-4">Deleted within 30 days</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Removal Records</td>
                    <td className="py-3 px-4">24 months</td>
                    <td className="py-3 px-4">Anonymized after 90 days</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Payment Records</td>
                    <td className="py-3 px-4">Duration of account</td>
                    <td className="py-3 px-4">7 years (tax law requirement)</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-300">Server Logs</td>
                    <td className="py-3 px-4">90 days</td>
                    <td className="py-3 px-4">Auto-deleted</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">Support Conversations</td>
                    <td className="py-3 px-4">Duration of account</td>
                    <td className="py-3 px-4">Deleted within 30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 mt-4">
              Want your data gone? Delete your account. We&apos;ll remove your info within 30 days.
              Some data we must keep by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>

            <h3 className="text-xl font-medium text-white mb-3">8.1 Everyone Gets These</h3>
            <p className="text-slate-400 mb-4">No matter where you live, you can:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>See and download your data</li>
              <li>Fix wrong info</li>
              <li>Delete your account</li>
              <li>Export your data</li>
              <li>Stop marketing emails</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">8.2 California (CCPA/CPRA)</h3>
            <p className="text-slate-400 mb-4">
              Under the California Consumer Privacy Act (Cal. Civ. Code &sect; 1798.100-1798.199) and the California Privacy Rights Act, California residents have these rights:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li><strong className="text-slate-300">Right to Know (&sect; 1798.100):</strong> Know what data we have and how we use it</li>
              <li><strong className="text-slate-300">Right to Delete (&sect; 1798.105):</strong> Request deletion of your personal information</li>
              <li><strong className="text-slate-300">Right to Opt-Out (&sect; 1798.120):</strong> Opt out of data sales (we don&apos;t sell anyway)</li>
              <li><strong className="text-slate-300">Right to Non-Discrimination (&sect; 1798.125):</strong> No punishment for exercising your rights</li>
              <li><strong className="text-slate-300">Right to Correct (&sect; 1798.106):</strong> Fix inaccurate personal information</li>
              <li><strong className="text-slate-300">Right to Limit (&sect; 1798.121):</strong> Limit use of sensitive personal information</li>
            </ul>
            <p className="text-slate-400 mb-4">
              To exercise your CCPA rights, email <a href="mailto:privacy@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">privacy@ghostmydata.com</a>. We respond within 45 days.
            </p>
            <p className="text-slate-400 mb-6">
              <strong className="text-slate-300">Authorized Agents:</strong> You may designate an authorized agent to exercise your CCPA rights on your behalf. To do so, the agent must provide a signed, written authorization from you, and we may require you to verify your identity directly with us before processing the request.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">8.3 Europe (GDPR)</h3>
            <p className="text-slate-400 mb-4">
              Under the General Data Protection Regulation, EU/EEA residents have these rights:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li><strong className="text-slate-300">Right of Access (Art. 15):</strong> Obtain a copy of your personal data</li>
              <li><strong className="text-slate-300">Right to Rectification (Art. 16):</strong> Correct inaccurate data</li>
              <li><strong className="text-slate-300">Right to Erasure (Art. 17):</strong> Request deletion of your data</li>
              <li><strong className="text-slate-300">Right to Restrict Processing (Art. 18):</strong> Limit how we use your data</li>
              <li><strong className="text-slate-300">Right to Data Portability (Art. 20):</strong> Receive your data in a portable format</li>
              <li><strong className="text-slate-300">Right to Object (Art. 21):</strong> Object to processing based on legitimate interest</li>
              <li><strong className="text-slate-300">Right Not to Be Subject to Automated Decisions (Art. 22):</strong> Object to decisions based solely on automated processing that significantly affect you</li>
              <li><strong className="text-slate-300">Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw consent at any time</li>
              <li><strong className="text-slate-300">Right to Lodge a Complaint (Art. 77):</strong> File a complaint with your supervisory authority</li>
            </ul>
            <p className="text-slate-400 mb-4">
              We process your data to run our service, with your consent, and to keep things safe.
              Our Data Protection Officer can be reached at <a href="mailto:dpo@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">dpo@ghostmydata.com</a>. We respond within 30 days per GDPR Article 12.
            </p>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 mb-6">
              <p className="text-slate-300 text-sm mb-2"><strong>EU Representative (GDPR Art. 27):</strong></p>
              <p className="text-slate-400 text-sm">
                As we are established outside the EU/EEA, our EU Data Protection Representative can be contacted at{" "}
                <a href="mailto:eu-representative@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">eu-representative@ghostmydata.com</a>.
                EU/EEA residents may contact our representative for any matters relating to the processing of their personal data.
              </p>
            </div>

            <h3 className="text-xl font-medium text-white mb-3">8.4 Canada (PIPEDA)</h3>
            <p className="text-slate-400 mb-4">
              Under Canada&apos;s Personal Information Protection and Electronic Documents Act, Canadian residents have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Access your personal information held by us</li>
              <li>Challenge the accuracy and completeness of your data</li>
              <li>Withdraw consent for data collection (subject to legal limitations)</li>
              <li>File a complaint with the Privacy Commissioner of Canada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Children&apos;s Privacy (COPPA)</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                Our service is for adults 18 and older. We do not knowingly collect personal information from children under 18. In compliance with the Children&apos;s Online Privacy Protection Act (COPPA):
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2">
                <li>We do not knowingly collect data from anyone under 13</li>
                <li>We do not target or market to children</li>
                <li>If we learn we have collected data from a child, we delete it immediately</li>
                <li>Parents or guardians who believe their child has provided data to us should contact us at <a href="mailto:privacy@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">privacy@ghostmydata.com</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Data Transfers</h2>
            <p className="text-slate-400 mb-4">
              Your data may be transferred to and processed in the United States. We protect international transfers through:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Subprocessor agreements requiring equivalent data protection</li>
              <li>Technical safeguards including encryption in transit and at rest</li>
            </ul>
            <p className="text-slate-400 mt-4">
              By using our service, you acknowledge that your data will be processed in the United States, where our servers and subprocessors are located.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Cookies &amp; Tracking</h2>
            <p className="text-slate-400 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li><strong className="text-slate-300">Strictly Necessary:</strong> Login sessions, security tokens, CSRF protection</li>
              <li><strong className="text-slate-300">Analytics:</strong> PostHog, Google Analytics (anonymized usage patterns)</li>
              <li><strong className="text-slate-300">Marketing:</strong> Microsoft Clarity, conversion tracking pixels</li>
            </ul>
            <p className="text-slate-400">
              We honor Do Not Track (DNT) and Global Privacy Control (GPC) signals from your browser. When we detect either signal, we disable non-essential analytics and marketing cookies for your session. For full details on each cookie, how to manage them, and your choices, see our <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300 underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Policy Changes</h2>
            <p className="text-slate-400">
              We may update this policy. We&apos;ll post changes here with a new date. For big changes, we&apos;ll email you 30 days in advance.
              If you keep using our service, you agree to the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p className="text-slate-400 mb-4">
              Questions? Want to use your rights? Reach out:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-3">
              <div>
                <p className="text-slate-300 font-medium">GhostMyData (operated by Rank127 LLC)</p>
                <p className="text-slate-400 text-sm">A Delaware limited liability company</p>
                <p className="text-slate-400 text-sm">8 The Green, Suite A, Dover, DE 19901, United States</p>
              </div>
              <p className="text-slate-300">
                <strong>Privacy:</strong>{" "}
                <a href="mailto:privacy@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  privacy@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300">
                <strong>DPO:</strong>{" "}
                <a href="mailto:dpo@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  dpo@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300">
                <strong>Support:</strong>{" "}
                <a href="mailto:support@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  support@ghostmydata.com
                </a>
              </p>
            </div>
            <p className="text-slate-400 mt-4">
              We reply within 30 days. For CCPA requests, we respond within 45 days as required by law.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Shield, Lock, Server, Eye, Key, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { securityPage } from "@/content/pages";

export const metadata: Metadata = {
  title: securityPage.meta.title,
  description: securityPage.meta.description,
  keywords: securityPage.meta.keywords,
  alternates: {
    canonical: "https://ghostmydata.com/security",
  },
  openGraph: {
    title: securityPage.meta.title,
    description: securityPage.meta.description,
    url: "https://ghostmydata.com/security",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Security",
      },
    ],
  },
};

const securityFeatures = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "We lock all your data with AES-256. Banks use this same lock. Your info stays safe even at rest.",
  },
  {
    icon: Server,
    title: "Safe Servers",
    description: "Our servers meet SOC 2 rules. We block attacks. We back up data. We spread it across regions for safety.",
  },
  {
    icon: Key,
    title: "Password Safety",
    description: "We hash passwords with bcrypt. This makes them very hard to crack. Hackers can't brute force their way in.",
  },
  {
    icon: Eye,
    title: "SSN Safety",
    description: "We hash your SSN right away. We never store it as plain text. We never log it or send it in the clear.",
  },
];

const certifications = [
  "TLS 1.3 encrypted connections",
  "HTTPS everywhere (HSTS enabled)",
  "SOC 2 Type II compliant hosting",
  "PCI-DSS compliant payment processing",
  "Regular penetration testing",
  "24/7 security monitoring",
];

export default function SecurityPage() {
  // Get content sections for SEO-optimized intro text
  const heroSection = securityPage.sections.find(s => s.id === "hero");
  const encryptionSection = securityPage.sections.find(s => s.id === "encryption");

  return (
    <div className="py-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
            <Shield className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {heroSection?.title || "Security at GhostMyData"}
          </h1>
          <div className="text-lg text-slate-300 max-w-3xl mx-auto space-y-4">
            {heroSection?.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* SEO Content Section */}
        {encryptionSection && (
          <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">{encryptionSection.title}</h2>
            <div className="text-slate-300 space-y-4">
              {encryptionSection.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <feature.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Security Practices */}
        <div className="max-w-4xl mx-auto space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Data Protection</h2>
            <div className="prose prose-invert prose-slate max-w-none space-y-6">
              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-emerald-500" />
                  Encryption Standards
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">At Rest:</strong> We lock all stored data with AES-256. Each user gets their own key.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">In Transit:</strong> Data moving between you and us uses TLS 1.3. This is the best lock for data in motion.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Key Safety:</strong> We keep keys away from the data they lock. We swap them out often.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-emerald-500" />
                  Authentication Security
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Password Hashing:</strong> We use bcrypt to hash passwords. Cracking them takes a very long time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Sessions:</strong> We use safe cookies that expire fast. We end sessions if we see odd activity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Login Limits:</strong> We limit login tries. This stops hackers from guessing passwords.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-emerald-500" />
                  Sensitive Data Handling
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">SSN Safety:</strong> We hash your SSN right away with SHA-256. We add a unique salt. We never store, log, or keep the plain text.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Less Is More:</strong> We only gather what we need. We never ask for extra info.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Auto Delete:</strong> We delete temp data and logs on a set schedule.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Infrastructure Security</h2>
            <div className="prose prose-invert prose-slate max-w-none space-y-6">
              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5 text-emerald-500" />
                  Hosting & Network
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Cloud Servers:</strong> We use top cloud hosts with SOC 2 rules. This means strict safety checks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Attack Blocks:</strong> We block DDoS attacks. This keeps our service up and running.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Network Walls:</strong> Databases sit in private zones. They have no direct web access.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Backup Regions:</strong> We copy data across zones. If one fails, others take over.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-500" />
                  Monitoring & Auditing
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">24/7 Watch:</strong> We watch all systems day and night. We look for threats and issues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Event Logs:</strong> We log all safety events. These logs can&apos;t be changed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Threat Alerts:</strong> Our systems spot odd activity fast. They send alerts right away.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Expert Tests:</strong> Outside experts test our systems often. They hunt for weak spots.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Application Security</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">OWASP Rules:</strong> We follow OWASP safety rules. This blocks common attacks like SQL injection and XSS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Input Checks:</strong> We check and clean all user input. This stops injection attacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">CSP Headers:</strong> Strict headers block cross-site scripting. Bad code can&apos;t run on our pages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Code Scans:</strong> We scan our code for weak spots. We patch issues right away.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Safe Coding:</strong> We review code for safety. We run auto tests before we deploy.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Payment Safety</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                Stripe handles all payments. They have the top safety rating in the industry.
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">No Card Storage:</strong> We never store card numbers. All payment data goes to Stripe.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Extra Checks:</strong> We support 3D Secure for added safety when you pay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Fraud Blocks:</strong> Stripe uses smart tech to spot and stop bad charges.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Compliance & Certifications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">{cert}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">If Things Go Wrong</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                We have a plan for security events. Here is how we handle them:
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Fast Action:</strong> Our safety team is ready to act day and night.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Quick Notice:</strong> We tell you within 72 hours if a breach hits your data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Deep Dives:</strong> We dig into what went wrong. We share reports on big events.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Learn and Fix:</strong> We use each event to get better. Lessons shape our practices.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Found a Bug?</h2>
            <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20">
              <p className="text-slate-300 mb-4">
                We value safety reports. If you find a security bug, please tell us:
              </p>
              <p className="text-slate-300">
                <strong>Safety Team:</strong>{" "}
                <a href="mailto:security@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  security@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-400 mt-4 text-sm">
                Please give us time to fix the issue before you share it. We don&apos;t take legal action against good faith reports.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Questions?</h2>
            <p className="text-slate-400">
              Have questions about our safety practices? Email us at{" "}
              <a href="mailto:security@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                security@ghostmydata.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

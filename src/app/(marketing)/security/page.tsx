import type { Metadata } from "next";
import Link from "next/link";
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
    description: "All data encrypted at rest using AES-256-GCM authenticated encryption with unique initialization vectors per operation.",
  },
  {
    icon: Server,
    title: "SOC 2 Infrastructure",
    description: "Hosted on SOC 2 Type II certified infrastructure (Vercel/AWS). DDoS protection, multi-region redundancy, and automated backups.",
  },
  {
    icon: Key,
    title: "Password Safety",
    description: "Passwords hashed with bcrypt (cost factor 12). Rate-limited login attempts prevent brute-force attacks.",
  },
  {
    icon: Eye,
    title: "SSN Safety",
    description: "SSNs hashed immediately with SHA-256 plus unique salt. Never stored, logged, or transmitted in plain text.",
  },
];

const complianceBadges = [
  { name: "SOC 2 Type II", description: "Hosted on SOC 2 Type II certified infrastructure (Vercel/AWS)" },
  { name: "PCI-DSS", description: "Payment processing via Stripe (PCI-DSS Level 1 certified)" },
  { name: "GDPR", description: "Full compliance for EU/EEA users" },
  { name: "CCPA/CPRA", description: "California privacy law compliance" },
  { name: "TLS 1.3", description: "Latest transport layer encryption" },
  { name: "HSTS", description: "HTTP Strict Transport Security enforced" },
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
                    <span><strong className="text-slate-300">At Rest:</strong> AES-256-GCM authenticated encryption with unique initialization vectors per operation. Encryption keys stored as environment secrets, isolated from application data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">In Transit:</strong> TLS 1.3 for all connections. HSTS headers enforced. No fallback to older TLS versions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Key Safety:</strong> Encryption keys stored as environment secrets, separate from application data and database. Access restricted to the production runtime environment.</span>
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
                    <span><strong className="text-slate-300">Password Hashing:</strong> bcrypt with cost factor 12. Resistant to brute-force and rainbow table attacks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Password Requirements:</strong> Minimum 8 characters required. Passwords hashed immediately and never stored in plain text.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Sessions:</strong> Secure, HttpOnly cookies with short expiration. Sessions invalidated on suspicious activity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Two-Factor Authentication:</strong> Optional TOTP-based 2FA with 10 backup codes. Compatible with Google Authenticator, Authy, and other authenticator apps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Login Rate Limiting:</strong> Failed login attempts are rate-limited to prevent credential stuffing and brute-force attacks.</span>
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
                    <span><strong className="text-slate-300">SSN Protection:</strong> SHA-256 hashed with unique salt immediately on input. Plain text never stored, logged, or transmitted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Data Minimization:</strong> We only collect data necessary for your removal requests. No unnecessary data gathering.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Auto-Deletion:</strong> Temporary data and server logs deleted on schedule (90-day maximum retention).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">PII Masking:</strong> All personally identifiable information is masked in error logs and monitoring systems.</span>
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
                  Hosting &amp; Network
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Cloud Servers:</strong> Hosted on Vercel (SOC 2 Type II certified) with strict physical and logical access controls provided by the infrastructure layer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">DDoS Protection:</strong> Automated mitigation keeps our service running during volumetric and application-layer attacks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Network Isolation:</strong> Databases in private subnets with no direct internet access. All traffic passes through edge proxies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Multi-Region:</strong> Data replicated across availability zones. Automatic failover if any region goes down.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-500" />
                  Monitoring &amp; Auditing
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">24/7 Monitoring:</strong> Continuous monitoring via Sentry (configured with sendDefaultPii: false to protect your privacy).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Comprehensive Audit Logs:</strong> All security events logged with 30+ action types. Logs retained for 365 days.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Anomaly Detection:</strong> Automated systems detect unusual patterns and alert the security team immediately.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Security Testing:</strong> Automated vulnerability scanning and code review on every deployment. We welcome responsible security research via our <Link href="/vulnerability-disclosure" className="text-emerald-400 hover:text-emerald-300 underline">Vulnerability Disclosure Policy</Link>.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Employee Security</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">NDAs Required:</strong> All employees and contractors sign non-disclosure agreements before accessing any systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Least Privilege:</strong> Staff only access data required for their role. Access reviewed quarterly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Offboarding:</strong> Access revoked immediately on termination. All credentials rotated.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Security Training:</strong> Ongoing security awareness training for all team members.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Background Checks:</strong> All staff pass background checks before hire.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Application Security</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">OWASP Top 10:</strong> We follow OWASP security guidelines to prevent SQL injection, XSS, CSRF, and other common attacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Input Validation:</strong> All user input is validated and sanitized before processing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">CSP Headers:</strong> Content Security Policy headers prevent cross-site scripting and code injection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Dependency Scanning:</strong> Automated scanning for known vulnerabilities in all dependencies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Code Review:</strong> All code reviewed for security before deployment. Automated testing on every commit.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Payment Safety</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                Stripe handles all payments. They are PCI-DSS Level 1 certified — the highest level of payment security.
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">No Card Storage:</strong> We never store, process, or transmit card numbers. All payment data goes directly to Stripe.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">3D Secure:</strong> We support 3D Secure 2 for additional cardholder verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Fraud Detection:</strong> Stripe Radar uses machine learning to detect and block fraudulent transactions.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Compliance &amp; Certifications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceBadges.map((badge) => (
                <div
                  key={badge.name}
                  className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-300 font-medium">{badge.name}</span>
                    <p className="text-slate-500 text-xs mt-1">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Subprocessor Security</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                All our subprocessors are contractually bound to maintain equivalent security standards. For the full list of subprocessors and what data they process, see our{" "}
                <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">Privacy Policy</Link>.
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Data Processing Agreements (DPAs) with all subprocessors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Regular security assessment of subprocessor practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Encrypted data transfer to and from all subprocessors</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Incident Response</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                We have a documented incident response plan tested regularly:
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">24/7 Response:</strong> Our security team is available around the clock to respond to incidents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">72-Hour Notification:</strong> We notify affected users within 72 hours of confirming a breach (per GDPR Art. 33 and state breach notification laws).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Root Cause Analysis:</strong> Every incident gets a thorough post-mortem with documented findings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Continuous Improvement:</strong> Lessons from each incident drive security enhancements.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Vulnerability Disclosure</h2>
            <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20">
              <p className="text-slate-300 mb-4">
                We value security researchers who help us protect our users. If you find a security vulnerability, please report it responsibly.
              </p>
              <p className="text-slate-300 mb-4">
                <strong>Security Team:</strong>{" "}
                <a href="mailto:security@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  security@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-400 mb-4 text-sm">
                We acknowledge reports within 5 business days and do not take legal action against researchers acting in good faith.
              </p>
              <Link href="/vulnerability-disclosure" className="text-emerald-400 hover:text-emerald-300 underline text-sm">
                Read our full Vulnerability Disclosure Policy
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Questions?</h2>
            <p className="text-slate-400">
              Have questions about our security practices? Email us at{" "}
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

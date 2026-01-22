import type { Metadata } from "next";
import { Shield, Lock, Server, Eye, Key, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Security - Bank-Level Data Protection",
  description:
    "GhostMyData uses AES-256 encryption, SOC 2 compliant infrastructure, and industry-leading security to protect your data.",
  keywords: [
    "data security",
    "AES-256 encryption",
    "SOC 2 compliance",
    "secure data removal",
    "privacy security",
    "encrypted data storage",
    "secure personal data",
    "cybersecurity",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/security",
  },
  openGraph: {
    title: "Security - GhostMyData",
    description:
      "Bank-level security with AES-256 encryption, SOC 2 compliance, and 24/7 monitoring to protect your data.",
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
    description: "All personal data is encrypted at rest using military-grade AES-256 encryption, the same standard used by banks and government agencies.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Hosted on SOC 2 Type II compliant infrastructure with DDoS protection, automatic backups, and geographic redundancy.",
  },
  {
    icon: Key,
    title: "Password Protection",
    description: "Passwords are hashed using bcrypt with high cost factors, making brute-force attacks computationally infeasible.",
  },
  {
    icon: Eye,
    title: "Zero Plain-Text SSN",
    description: "Social Security Numbers are immediately hashed upon entry and never stored, logged, or transmitted in plain text.",
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
  return (
    <div className="py-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
            <Shield className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Security at GhostMyData
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            We protect your data with the same intensity we use to remove it from the internet.
            Your privacy and security are the foundation of everything we do.
          </p>
        </div>

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
                    <span><strong className="text-slate-300">At Rest:</strong> All personal data stored in our database is encrypted using AES-256 encryption with unique encryption keys per user.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">In Transit:</strong> All data transmitted between your browser and our servers is protected by TLS 1.3, the latest and most secure transport layer protocol.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Key Management:</strong> Encryption keys are stored separately from encrypted data and rotated regularly according to industry best practices.</span>
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
                    <span><strong className="text-slate-300">Password Hashing:</strong> We use bcrypt with a cost factor of 12, making password cracking attempts extremely time-consuming.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Session Management:</strong> Secure, HTTP-only cookies with short expiration times and automatic session invalidation on suspicious activity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Rate Limiting:</strong> Aggressive rate limiting on authentication endpoints to prevent brute-force attacks.</span>
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
                    <span><strong className="text-slate-300">SSN Protection:</strong> Social Security Numbers are immediately hashed using SHA-256 with a unique salt. The plain-text SSN is never stored, logged, or retained in memory beyond the initial processing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Data Minimization:</strong> We only collect information necessary to provide our services. We never ask for more than we need.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Automatic Purging:</strong> Temporary data and logs are automatically purged according to our retention policy.</span>
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
                    <span><strong className="text-slate-300">Cloud Infrastructure:</strong> Hosted on enterprise-grade cloud infrastructure with SOC 2 Type II certification, ensuring strict security controls and auditing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">DDoS Protection:</strong> Automatic DDoS mitigation protects our services from volumetric and application-layer attacks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Network Isolation:</strong> Database servers are isolated in private subnets with no direct internet access.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Geographic Redundancy:</strong> Data is replicated across multiple availability zones for disaster recovery.</span>
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
                    <span><strong className="text-slate-300">24/7 Monitoring:</strong> Continuous monitoring of all systems for security anomalies and performance issues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Audit Logging:</strong> Comprehensive logging of all security-relevant events with tamper-proof storage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Intrusion Detection:</strong> Automated systems detect and alert on suspicious activities in real-time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Penetration Testing:</strong> Regular third-party security assessments and penetration tests.</span>
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
                  <span><strong className="text-slate-300">OWASP Compliance:</strong> Our application is built following OWASP security guidelines, protecting against common vulnerabilities like SQL injection, XSS, and CSRF.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Input Validation:</strong> All user inputs are validated and sanitized to prevent injection attacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Content Security Policy:</strong> Strict CSP headers prevent cross-site scripting and data injection attacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Dependency Scanning:</strong> Automated scanning for vulnerabilities in third-party dependencies with immediate patching.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Secure Development:</strong> Security-focused code reviews and automated security testing in our CI/CD pipeline.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Payment Security</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                All payment processing is handled by Stripe, a PCI-DSS Level 1 certified payment processor—the highest level of certification in the payment industry.
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">No Card Storage:</strong> We never store credit card numbers on our servers. All payment data goes directly to Stripe.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">3D Secure:</strong> Support for additional cardholder authentication where available.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Fraud Detection:</strong> Stripe&apos;s machine learning-based fraud detection protects against unauthorized transactions.</span>
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
            <h2 className="text-3xl font-bold text-white mb-6">Incident Response</h2>
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 mb-4">
                We maintain a comprehensive incident response plan to handle security events:
              </p>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Rapid Response:</strong> Dedicated security team ready to respond to incidents 24/7.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">User Notification:</strong> Commitment to notify affected users within 72 hours of discovering a confirmed breach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Root Cause Analysis:</strong> Thorough investigation of all incidents with published post-mortems for significant events.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-300">Continuous Improvement:</strong> Lessons learned are incorporated into our security practices.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Report a Vulnerability</h2>
            <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20">
              <p className="text-slate-300 mb-4">
                We take security seriously and appreciate responsible disclosure of vulnerabilities. If you discover a security issue, please report it to us:
              </p>
              <p className="text-slate-300">
                <strong>Security Team:</strong>{" "}
                <a href="mailto:security@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  security@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-400 mt-4 text-sm">
                We request that you give us reasonable time to address the issue before public disclosure. We do not pursue legal action against security researchers who act in good faith.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Questions?</h2>
            <p className="text-slate-400">
              If you have questions about our security practices or would like more information, please contact us at{" "}
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

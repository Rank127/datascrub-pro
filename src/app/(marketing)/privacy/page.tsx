import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - How We Protect Your Data",
  description:
    "How GhostMyData protects your data. AES-256 encryption, never sell your data, CCPA and GDPR compliant. Read our full privacy policy.",
  keywords: [
    "GhostMyData privacy policy",
    "data protection policy",
    "privacy terms",
    "GDPR compliance",
    "CCPA compliance",
    "data security",
    "personal data protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy - GhostMyData",
    description:
      "Our commitment to protecting your privacy. AES-256 encryption, zero data selling, full GDPR/CCPA compliance.",
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
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400 text-lg mb-8">
          Last updated: January 20, 2026
        </p>
        <div className="prose prose-invert prose-slate max-w-none space-y-8">

          <section className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-300 text-lg">
              At GhostMyData, we understand that privacy is paramount—it&apos;s why our service exists. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our personal data
              removal service. We are committed to protecting your privacy with the same rigor we apply to removing
              your data from third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-medium text-white mb-3">1.1 Information You Provide Directly</h3>
            <p className="text-slate-400 mb-4">
              To provide our data removal services, we collect information you voluntarily provide:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Account Information:</strong> Email address, name, and password (stored as a secure hash)</li>
              <li><strong className="text-slate-300">Personal Identifiers for Scanning:</strong> Email addresses, phone numbers, physical addresses, names, aliases, and usernames you want us to search for</li>
              <li><strong className="text-slate-300">Sensitive Identifiers (Optional):</strong> Date of birth, Social Security Number (SSN), and other identifiers for comprehensive dark web monitoring. SSNs are cryptographically hashed immediately upon receipt and never stored in plain text.</li>
              <li><strong className="text-slate-300">Payment Information:</strong> Billing details processed securely by Stripe. We do not store credit card numbers on our servers.</li>
              <li><strong className="text-slate-300">Communications:</strong> Any messages you send to our support team</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">1.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Usage Data:</strong> Pages visited, features used, scan history, and interaction patterns</li>
              <li><strong className="text-slate-300">Device Information:</strong> Browser type, operating system, device identifiers, and IP address</li>
              <li><strong className="text-slate-300">Cookies:</strong> Essential cookies for authentication and session management. We do not use advertising or tracking cookies.</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">1.3 Information from Third-Party Sources</h3>
            <p className="text-slate-400 mb-4">
              When performing scans on your behalf, we may retrieve information about you from:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Data broker websites and people-search engines</li>
              <li>Breach notification databases (e.g., Have I Been Pwned)</li>
              <li>Dark web monitoring services</li>
              <li>Public records and social media platforms</li>
            </ul>
            <p className="text-slate-400 mt-4">
              This information is collected solely to show you where your data is exposed and to facilitate its removal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-400 mb-4">We use your information exclusively for the following purposes:</p>

            <h3 className="text-xl font-medium text-white mb-3">2.1 Service Delivery</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Scanning data sources to identify where your personal information appears</li>
              <li>Submitting automated opt-out and removal requests to data brokers</li>
              <li>Generating and sending CCPA/GDPR deletion requests on your behalf</li>
              <li>Monitoring for new exposures and alerting you to threats</li>
              <li>Providing customer support and responding to inquiries</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">2.2 Account Management</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Creating and maintaining your account</li>
              <li>Processing payments and managing subscriptions</li>
              <li>Sending transactional emails (scan results, removal confirmations, account updates)</li>
              <li>Authenticating your identity and preventing fraud</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">2.3 Service Improvement</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Analyzing usage patterns to improve our service (using aggregated, anonymized data)</li>
              <li>Developing new features and data source integrations</li>
              <li>Ensuring security and preventing abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Share Your Information</h2>
            <p className="text-slate-400 mb-4">
              <strong className="text-emerald-400">We do not sell your personal information. Ever.</strong> We share your
              information only in the following limited circumstances:
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.1 With Your Consent</h3>
            <p className="text-slate-400 mb-6">
              When you authorize us to submit removal requests, we share the minimum necessary information with data
              brokers to verify your identity and process the removal. This is the core function of our service.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.2 Service Providers</h3>
            <p className="text-slate-400 mb-4">We use trusted third-party services to operate our platform:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li><strong className="text-slate-300">Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
              <li><strong className="text-slate-300">Vercel:</strong> Hosting infrastructure</li>
              <li><strong className="text-slate-300">Supabase:</strong> Database hosting (with encryption at rest)</li>
              <li><strong className="text-slate-300">Resend:</strong> Transactional email delivery</li>
              <li><strong className="text-slate-300">Have I Been Pwned:</strong> Breach database monitoring</li>
            </ul>
            <p className="text-slate-400 mb-6">
              These providers are contractually obligated to protect your data and use it only for the services they provide to us.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">3.3 Legal Requirements</h3>
            <p className="text-slate-400">
              We may disclose information if required by law, subpoena, court order, or government request. We will
              notify you of such requests when legally permitted and will challenge requests we believe are overly
              broad or inappropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p className="text-slate-400 mb-4">
              We implement comprehensive security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Encryption at Rest:</strong> All personal data is encrypted using AES-256 encryption</li>
              <li><strong className="text-slate-300">Encryption in Transit:</strong> All connections use TLS 1.3 (HTTPS)</li>
              <li><strong className="text-slate-300">Password Security:</strong> Passwords are hashed using bcrypt with appropriate cost factors</li>
              <li><strong className="text-slate-300">SSN Protection:</strong> Social Security Numbers are immediately hashed using SHA-256 with a unique salt and are never stored or logged in plain text</li>
              <li><strong className="text-slate-300">Access Controls:</strong> Strict role-based access controls limit employee access to user data</li>
              <li><strong className="text-slate-300">Infrastructure Security:</strong> Hosted on SOC 2 Type II compliant infrastructure</li>
              <li><strong className="text-slate-300">Regular Audits:</strong> Periodic security assessments and penetration testing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
            <p className="text-slate-400 mb-4">We retain your data according to the following schedule:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Account Data:</strong> Retained while your account is active and for 30 days after deletion request</li>
              <li><strong className="text-slate-300">Scan Results:</strong> Retained for 12 months to track removal progress and detect re-listings</li>
              <li><strong className="text-slate-300">Removal Request Records:</strong> Retained for 24 months for compliance documentation</li>
              <li><strong className="text-slate-300">Payment Records:</strong> Retained as required by tax and financial regulations (typically 7 years)</li>
              <li><strong className="text-slate-300">Server Logs:</strong> Automatically deleted after 90 days</li>
            </ul>
            <p className="text-slate-400 mt-4">
              You may request deletion of your account and associated data at any time. Upon deletion, we will remove
              your personal information within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Privacy Rights</h2>

            <h3 className="text-xl font-medium text-white mb-3">6.1 Rights for All Users</h3>
            <p className="text-slate-400 mb-4">Regardless of your location, you have the right to:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">6.2 California Residents (CCPA/CPRA)</h3>
            <p className="text-slate-400 mb-4">California residents have additional rights under the California Consumer Privacy Act:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Right to know what personal information is collected and how it&apos;s used</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
              <li>Right to non-discrimination for exercising your rights</li>
              <li>Right to correct inaccurate personal information</li>
              <li>Right to limit use of sensitive personal information</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">6.3 European Residents (GDPR)</h3>
            <p className="text-slate-400 mb-4">If you are in the European Economic Area, you have rights under the General Data Protection Regulation:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
              <li>Right of access to your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-slate-400">
              Our legal basis for processing your data is: (a) performance of a contract when providing our services,
              (b) your consent for optional features, and (c) legitimate interests for security and service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Children&apos;s Privacy</h2>
            <p className="text-slate-400">
              GhostMyData is not intended for use by individuals under the age of 18. We do not knowingly collect
              personal information from children. If we learn that we have collected personal information from a
              child under 18, we will promptly delete that information. If you believe a child has provided us
              with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
            <p className="text-slate-400">
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place for such transfers, including Standard Contractual Clauses
              approved by the European Commission where applicable. By using our service, you consent to the
              transfer of your information to the United States and other countries where our service providers operate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
            <p className="text-slate-400 mb-4">We use only essential cookies necessary for the functioning of our service:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Authentication Cookies:</strong> To keep you logged in securely</li>
              <li><strong className="text-slate-300">Session Cookies:</strong> To maintain your session state</li>
              <li><strong className="text-slate-300">Security Cookies:</strong> To prevent cross-site request forgery and other attacks</li>
            </ul>
            <p className="text-slate-400 mt-4">
              We do not use advertising cookies, tracking pixels, or third-party analytics that track you across websites.
              We respect Do Not Track browser signals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-slate-400">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by
              posting the new policy on this page with an updated &quot;Last updated&quot; date, and for significant changes,
              we will send you an email notification. Your continued use of our service after any changes indicates
              your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-400 mb-4">
              If you have questions about this Privacy Policy, wish to exercise your privacy rights, or have concerns
              about our data practices, please contact us:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300">
                <strong>Privacy Inquiries:</strong>{" "}
                <a href="mailto:privacy@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  privacy@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300 mt-2">
                <strong>Data Protection Officer:</strong>{" "}
                <a href="mailto:dpo@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  dpo@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300 mt-2">
                <strong>General Support:</strong>{" "}
                <a href="mailto:support@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  support@ghostmydata.com
                </a>
              </p>
            </div>
            <p className="text-slate-400 mt-4">
              We will respond to all privacy-related inquiries within 30 days, or sooner as required by applicable law.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 text-lg mb-8">
            Last updated: January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="text-slate-400 mb-4">
              GhostMyData collects personal information that you voluntarily provide to us when you register for an account,
              use our services, or contact us for support. This includes:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Contact information (name, email address)</li>
              <li>Personal identifiers you choose to scan for (emails, phone numbers, addresses)</li>
              <li>Account credentials (securely hashed)</li>
              <li>Payment information (processed by Stripe)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-400 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Provide and maintain our data removal services</li>
              <li>Scan for your personal information across data brokers and breach databases</li>
              <li>Submit removal requests on your behalf</li>
              <li>Send you alerts about new data exposures</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our services and develop new features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
            <p className="text-slate-400 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>All data is encrypted at rest using AES-256 encryption</li>
              <li>All connections are secured with HTTPS/TLS</li>
              <li>Sensitive data like SSN is hashed and never stored in plain text</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Retention</h2>
            <p className="text-slate-400">
              We retain your personal information for as long as your account is active or as needed to provide you services.
              You can request deletion of your account and associated data at any time through your account settings or by
              contacting our support team.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <p className="text-slate-400 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
            <p className="text-slate-400">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                privacy@ghostmydata.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

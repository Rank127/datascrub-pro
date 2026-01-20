export default function TermsPage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 text-lg mb-8">
            Last updated: January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-400">
              By accessing or using GhostMyData, you agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-400 mb-4">
              GhostMyData provides personal data discovery and removal services, including:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Scanning data broker websites for your personal information</li>
              <li>Monitoring breach databases for compromised credentials</li>
              <li>Automated submission of data removal requests</li>
              <li>Ongoing monitoring for new data exposures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p className="text-slate-400 mb-4">
              By using our service, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Provide accurate and truthful information about yourself</li>
              <li>Only request removal of your own personal data</li>
              <li>Not use our service for any illegal purposes</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized account access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Service Limitations</h2>
            <p className="text-slate-400 mb-4">
              While we strive to provide effective data removal services, we cannot guarantee:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Complete removal of all personal data from all sources</li>
              <li>Prevention of future data collection by third parties</li>
              <li>Specific timeframes for data removal completion</li>
              <li>Availability of the service at all times</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Payment</h2>
            <p className="text-slate-400 mb-4">
              Paid subscriptions are billed on a recurring basis. You may cancel your subscription at any time,
              and your access will continue until the end of the current billing period. Refunds are provided
              in accordance with our refund policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p className="text-slate-400">
              All content, features, and functionality of GhostMyData are owned by us and are protected by
              international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-400">
              GhostMyData shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
            <p className="text-slate-400">
              We reserve the right to modify these terms at any time. We will notify users of any material changes
              via email or through the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact</h2>
            <p className="text-slate-400">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                legal@ghostmydata.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

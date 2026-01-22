import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - User Agreement",
  description:
    "GhostMyData Terms of Service. Read our user agreement covering service usage, subscription terms, data removal authorization, privacy rights, and legal terms.",
  keywords: [
    "GhostMyData terms of service",
    "user agreement",
    "service terms",
    "legal terms",
    "subscription terms",
    "data removal terms",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/terms",
  },
  openGraph: {
    title: "Terms of Service - GhostMyData",
    description:
      "Read our terms of service covering data removal authorization, subscription billing, and user responsibilities.",
    url: "https://ghostmydata.com/terms",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Terms of Service",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-slate-400 text-lg mb-8">
          Last updated: January 20, 2026
        </p>
        <div className="prose prose-invert prose-slate max-w-none space-y-8">

          <section className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-300 text-lg">
              Please read these Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) carefully before using the GhostMyData
              website and services. By accessing or using our service, you agree to be bound by these Terms. If you
              disagree with any part of the Terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Definitions</h2>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">&quot;Service&quot;</strong> refers to the GhostMyData website, applications, and all related services</li>
              <li><strong className="text-slate-300">&quot;User,&quot; &quot;You,&quot; &quot;Your&quot;</strong> refers to any individual or entity that accesses or uses the Service</li>
              <li><strong className="text-slate-300">&quot;We,&quot; &quot;Us,&quot; &quot;Our,&quot; &quot;Company&quot;</strong> refers to GhostMyData and its operators</li>
              <li><strong className="text-slate-300">&quot;Personal Data&quot;</strong> refers to any information relating to an identified or identifiable individual</li>
              <li><strong className="text-slate-300">&quot;Subscription&quot;</strong> refers to a paid plan that provides access to premium features</li>
              <li><strong className="text-slate-300">&quot;Data Broker&quot;</strong> refers to third-party companies that collect and sell personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-400 mb-4">
              GhostMyData provides personal data discovery and removal services designed to help you take control of your
              online privacy. Our services include:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Scanning data broker websites, breach databases, dark web sources, and social media platforms to identify where your personal information is exposed</li>
              <li>Automated submission of opt-out requests to data brokers</li>
              <li>Generation and sending of CCPA, GDPR, and other privacy law-based deletion requests</li>
              <li>Continuous monitoring for new data exposures</li>
              <li>Alerts and reports about your online data exposure status</li>
            </ul>
            <p className="text-slate-400">
              The Service acts as your authorized agent for the purpose of submitting data removal requests on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Eligibility</h2>
            <p className="text-slate-400 mb-4">To use our Service, you must:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Be the owner of the personal information you submit for scanning and removal, or be legally authorized to act on behalf of the owner</li>
              <li>Not be prohibited from using the Service under applicable laws</li>
              <li>Provide accurate and complete information during registration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Account Registration and Security</h2>

            <h3 className="text-xl font-medium text-white mb-3">4.1 Account Creation</h3>
            <p className="text-slate-400 mb-4">
              To access certain features of the Service, you must create an account. You agree to provide accurate,
              current, and complete information during registration and to update such information to keep it accurate,
              current, and complete.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">4.2 Account Security</h3>
            <p className="text-slate-400 mb-4">You are responsible for:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
              <li>Using a strong, unique password for your account</li>
            </ul>
            <p className="text-slate-400">
              We reserve the right to suspend or terminate accounts that we reasonably believe have been compromised or
              are being used in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. User Responsibilities and Representations</h2>
            <p className="text-slate-400 mb-4">By using our Service, you represent and warrant that:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>All personal information you provide is your own, or you have proper authorization to provide it</li>
              <li>You will only request removal of data that belongs to you or that you are authorized to manage</li>
              <li>You will not use the Service for any fraudulent, illegal, or unauthorized purposes</li>
              <li>You will not attempt to interfere with or disrupt the Service or its infrastructure</li>
              <li>You will not attempt to circumvent any security measures or access controls</li>
              <li>You will not use automated tools to access the Service except as expressly permitted</li>
              <li>You will not impersonate another person or entity</li>
              <li>You will comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Authorization and Agency</h2>
            <p className="text-slate-400 mb-4">
              By using the Service to submit data removal requests, you hereby authorize GhostMyData to act as your
              authorized agent for the following purposes:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Submit opt-out requests to data brokers on your behalf</li>
              <li>Send CCPA, GDPR, and other privacy-related requests using your information</li>
              <li>Communicate with third parties as necessary to process your removal requests</li>
              <li>Verify your identity with data brokers when required for removal processing</li>
            </ul>
            <p className="text-slate-400">
              This authorization remains in effect while you maintain an active account and may be revoked by
              deleting your account or contacting us in writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Subscription Plans and Billing</h2>

            <h3 className="text-xl font-medium text-white mb-3">7.1 Free and Paid Plans</h3>
            <p className="text-slate-400 mb-4">
              We offer both free and paid subscription plans. Free plans provide limited access to our services,
              while paid plans (&quot;Pro&quot; and &quot;Enterprise&quot;) offer additional features including automated removal
              requests, continuous monitoring, and priority support.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">7.2 Billing and Payment</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Paid subscriptions are billed in advance on a recurring monthly or annual basis</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Prices are listed in US dollars unless otherwise specified</li>
              <li>You authorize us to charge your payment method for all fees associated with your subscription</li>
              <li>We may change pricing with 30 days&apos; notice; existing subscriptions will be honored until renewal</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">7.3 Cancellation and Refunds</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>You may cancel your subscription at any time through your account settings or by contacting support</li>
              <li>Upon cancellation, you will retain access to paid features until the end of your current billing period</li>
              <li><strong className="text-slate-300">30-Day Money-Back Guarantee:</strong> If you are not satisfied with our service, you may request a full refund within 30 days of your initial subscription purchase by contacting support@ghostmydata.com</li>
              <li>Refund requests made after 30 days from the initial purchase are not eligible for a refund</li>
              <li>We do not provide prorated refunds for partial billing periods outside the 30-day guarantee window</li>
              <li>Refunds are processed within 5-10 business days and returned to the original payment method</li>
              <li>If you believe you were charged in error, contact us within 30 days of the charge</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">7.4 Free Trial</h3>
            <p className="text-slate-400">
              We may offer free trials of paid features. At the end of the trial period, you will be automatically
              enrolled in a paid subscription unless you cancel before the trial ends. We will notify you before
              any charges are made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Service Limitations and Disclaimers</h2>

            <h3 className="text-xl font-medium text-white mb-3">8.1 No Guarantee of Results</h3>
            <p className="text-slate-400 mb-4">
              While we strive to provide effective data removal services, we cannot and do not guarantee:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Complete removal of all your personal data from all sources</li>
              <li>That data brokers will comply with removal requests within any specific timeframe</li>
              <li>That removed data will not reappear on data broker sites in the future</li>
              <li>Prevention of future data collection by third parties</li>
              <li>Detection of all instances where your data may appear online</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">8.2 Third-Party Dependencies</h3>
            <p className="text-slate-400 mb-4">
              Our Service depends on third-party data sources and data brokers. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>The accuracy of information provided by third-party sources</li>
              <li>Data broker compliance with removal requests</li>
              <li>Changes to data broker opt-out processes that may affect our service</li>
              <li>Temporary or permanent unavailability of third-party services</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">8.3 Service Availability</h3>
            <p className="text-slate-400">
              We strive to maintain high availability but do not guarantee uninterrupted access to the Service.
              We may suspend or restrict access to the Service for maintenance, updates, or other operational reasons.
              We will endeavor to provide advance notice of planned maintenance when possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Intellectual Property</h2>

            <h3 className="text-xl font-medium text-white mb-3">9.1 Our Intellectual Property</h3>
            <p className="text-slate-400 mb-4">
              The Service and its original content, features, and functionality are owned by GhostMyData and are
              protected by international copyright, trademark, patent, trade secret, and other intellectual property
              laws. This includes but is not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>The GhostMyData name, logo, and branding</li>
              <li>Website design, text, graphics, and user interfaces</li>
              <li>Software, algorithms, and underlying technology</li>
              <li>Data removal methodologies and processes</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">9.2 Limited License</h3>
            <p className="text-slate-400">
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the
              Service for your personal, non-commercial use in accordance with these Terms. This license does not
              include the right to copy, modify, distribute, sell, or lease any part of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Prohibited Activities</h2>
            <p className="text-slate-400 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Use the Service to remove data belonging to someone else without proper authorization</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its systems</li>
              <li>Use automated scripts, bots, or other means to access the Service without permission</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use the Service for any illegal, fraudulent, or harmful purpose</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Harass, abuse, or harm other users or our staff</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Resell or commercially exploit the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Limitation of Liability</h2>
            <p className="text-slate-400 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED</li>
              <li>WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM</li>
              <li>WE ARE NOT LIABLE FOR DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO YOUR ACCOUNT, DATA BREACHES AT THIRD-PARTY SERVICES, OR ACTIONS OF DATA BROKERS</li>
            </ul>
            <p className="text-slate-400">
              Some jurisdictions do not allow the exclusion of certain warranties or limitations on liability, so some
              of the above limitations may not apply to you. In such cases, our liability will be limited to the
              maximum extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Indemnification</h2>
            <p className="text-slate-400">
              You agree to indemnify, defend, and hold harmless GhostMyData, its officers, directors, employees,
              agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or expenses
              (including reasonable attorneys&apos; fees) arising out of or related to: (a) your use of the Service;
              (b) your violation of these Terms; (c) your violation of any rights of another party; (d) any content
              you submit through the Service; or (e) your violation of any applicable laws or regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Termination</h2>

            <h3 className="text-xl font-medium text-white mb-3">13.1 Termination by You</h3>
            <p className="text-slate-400 mb-4">
              You may terminate your account at any time by using the account deletion feature in your settings or
              by contacting our support team. Upon termination, your right to use the Service will immediately cease.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">13.2 Termination by Us</h3>
            <p className="text-slate-400 mb-4">
              We may suspend or terminate your account and access to the Service immediately, without prior notice
              or liability, for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Breach of these Terms</li>
              <li>Fraudulent, illegal, or abusive activity</li>
              <li>Non-payment of fees</li>
              <li>Request by law enforcement or government agencies</li>
              <li>Extended periods of inactivity</li>
              <li>Discontinuation of the Service</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">13.3 Effect of Termination</h3>
            <p className="text-slate-400">
              Upon termination, all licenses and rights granted to you will immediately cease. We may retain certain
              information as required by law or for legitimate business purposes. Sections of these Terms that by
              their nature should survive termination shall survive, including ownership provisions, warranty
              disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Dispute Resolution</h2>

            <h3 className="text-xl font-medium text-white mb-3">14.1 Informal Resolution</h3>
            <p className="text-slate-400 mb-4">
              Before filing any formal dispute, you agree to contact us first and attempt to resolve the dispute
              informally by sending a written notice to legal@ghostmydata.com. We will attempt to resolve the
              dispute within 30 days.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">14.2 Arbitration Agreement</h3>
            <p className="text-slate-400 mb-4">
              If informal resolution fails, any dispute arising from these Terms or your use of the Service shall
              be resolved through binding arbitration administered by the American Arbitration Association (AAA)
              under its Consumer Arbitration Rules. The arbitration will be conducted in English, and judgment on
              the award may be entered in any court of competent jurisdiction.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">14.3 Class Action Waiver</h3>
            <p className="text-slate-400 mb-4">
              YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND
              NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. If this class action waiver is found to be
              unenforceable, then the entirety of this arbitration provision shall be null and void.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">14.4 Exceptions</h3>
            <p className="text-slate-400">
              Notwithstanding the above, either party may seek injunctive or other equitable relief in any court of
              competent jurisdiction to prevent infringement of intellectual property rights. Small claims court
              actions are also exempt from the arbitration requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Governing Law</h2>
            <p className="text-slate-400">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
              United States, without regard to its conflict of law provisions. You agree to submit to the personal
              and exclusive jurisdiction of the courts located within Delaware for any disputes not subject to
              arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Changes to Terms</h2>
            <p className="text-slate-400 mb-4">
              We reserve the right to modify these Terms at any time. When we make material changes:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>We will post the updated Terms on this page with a new &quot;Last updated&quot; date</li>
              <li>We will notify you via email at least 30 days before material changes take effect</li>
              <li>Your continued use of the Service after changes take effect constitutes acceptance of the new Terms</li>
              <li>If you do not agree to the modified Terms, you must stop using the Service and may cancel your subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">17. General Provisions</h2>

            <h3 className="text-xl font-medium text-white mb-3">17.1 Entire Agreement</h3>
            <p className="text-slate-400 mb-4">
              These Terms, together with our Privacy Policy and any other legal notices published on the Service,
              constitute the entire agreement between you and GhostMyData regarding your use of the Service.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.2 Severability</h3>
            <p className="text-slate-400 mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited
              or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force
              and effect.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.3 Waiver</h3>
            <p className="text-slate-400 mb-4">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such
              right or provision.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.4 Assignment</h3>
            <p className="text-slate-400 mb-4">
              You may not assign or transfer these Terms or your rights hereunder without our prior written consent.
              We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.5 Force Majeure</h3>
            <p className="text-slate-400">
              We shall not be liable for any failure or delay in performing our obligations where such failure or
              delay results from circumstances beyond our reasonable control, including but not limited to natural
              disasters, war, terrorism, riots, government actions, or internet service failures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">18. Contact Information</h2>
            <p className="text-slate-400 mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300">
                <strong>Legal Inquiries:</strong>{" "}
                <a href="mailto:legal@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  legal@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300 mt-2">
                <strong>General Support:</strong>{" "}
                <a href="mailto:support@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  support@ghostmydata.com
                </a>
              </p>
            </div>
          </section>

          <section className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20">
            <p className="text-slate-300">
              By using GhostMyData, you acknowledge that you have read, understood, and agree to be bound by these
              Terms of Service. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

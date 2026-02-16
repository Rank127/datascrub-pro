import type { Metadata } from "next";
import { termsPage } from "@/content/pages";

export const metadata: Metadata = {
  title: termsPage.meta.title,
  description: termsPage.meta.description,
  keywords: termsPage.meta.keywords,
  alternates: {
    canonical: "https://ghostmydata.com/terms",
  },
  openGraph: {
    title: termsPage.meta.title,
    description: termsPage.meta.description,
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
  // Get SEO content sections
  const introSection = termsPage.sections.find(s => s.id === "intro");
  const serviceSection = termsPage.sections.find(s => s.id === "service-description");

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">{introSection?.title || "Terms of Service"}</h1>
        <p className="text-slate-400 text-lg mb-8">
          Last updated: February 15, 2026
        </p>

        {/* SEO-Optimized Introduction */}
        <div className="mb-8 space-y-4">
          {introSection?.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-lg text-slate-300">{para}</p>
          ))}
        </div>

        {/* Service Description for SEO */}
        {serviceSection && (
          <div className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">{serviceSection.title}</h2>
            <div className="text-slate-300 space-y-4">
              {serviceSection.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        <div className="prose prose-invert prose-slate max-w-none space-y-8">

          <section className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-300 text-lg">
              Please read these Terms of Service carefully. By using GhostMyData, you agree to these Terms.
              If you don&apos;t agree, please don&apos;t use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Definitions</h2>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">&quot;Service&quot;</strong> means the GhostMyData website, applications, and all related tools and features</li>
              <li><strong className="text-slate-300">&quot;User,&quot; &quot;You,&quot; &quot;Your&quot;</strong> means anyone who uses our Service</li>
              <li><strong className="text-slate-300">&quot;We,&quot; &quot;Us,&quot; &quot;Our&quot;</strong> means GhostMyData, a service operated by Rank127 LLC, a Delaware limited liability company with its principal address at 8 The Green, Suite A, Dover, DE 19901, United States</li>
              <li><strong className="text-slate-300">&quot;Personal Data&quot;</strong> means info that can identify you</li>
              <li><strong className="text-slate-300">&quot;Subscription&quot;</strong> means a paid plan</li>
              <li><strong className="text-slate-300">&quot;Data Broker&quot;</strong> means any company, website, or service that collects, aggregates, and sells or licenses personal information about consumers, including people-search sites, background check services, and data aggregators</li>
              <li><strong className="text-slate-300">&quot;Family Group&quot;</strong> means an Enterprise subscription shared with up to 5 family members</li>
              <li><strong className="text-slate-300">&quot;Custom Removal&quot;</strong> means a user-initiated removal request for a specific URL or site not covered by automated scanning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. What We Do</h2>
            <p className="text-slate-400 mb-4">
              GhostMyData finds and removes your personal data online. We help you protect your privacy.
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>We scan data broker sites, breach databases, and the dark web to find your data</li>
              <li>We send opt-out requests to data brokers for you</li>
              <li>We send CCPA and GDPR deletion requests on your behalf</li>
              <li>We watch for new exposures</li>
              <li>We send you alerts and reports</li>
            </ul>
            <p className="text-slate-400">
              We act as your authorized agent. We submit removal requests on your behalf under applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Service Tiers</h2>
            <p className="text-slate-400 mb-4">We offer three service tiers:</p>

            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-2">Free Plan ($0/month)</h3>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-sm">
                  <li>One-time privacy scan</li>
                  <li>Up to 3 manual removal requests per month</li>
                  <li>Access to step-by-step removal guides</li>
                  <li>Basic exposure report</li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-2">Pro Plan</h3>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-sm">
                  <li>Unlimited automated removal requests</li>
                  <li>Continuous monitoring and re-removal</li>
                  <li>Priority processing</li>
                  <li>Breach monitoring</li>
                  <li>Real-time dashboard</li>
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-2">Enterprise Plan</h3>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-sm">
                  <li>Everything in Pro</li>
                  <li>Dark web monitoring</li>
                  <li>Family plans (up to 5 members)</li>
                  <li>Do Not Call registration</li>
                  <li>AI Shield protection (60+ additional sources)</li>
                  <li>Priority support</li>
                </ul>
              </div>
            </div>
            <p className="text-slate-400 mt-4 text-sm">
              Feature availability may change. We&apos;ll notify you 30 days before removing features from your current plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Who Can Use Our Service</h2>
            <p className="text-slate-400 mb-4">To use our Service, you must:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Be able to enter a legal agreement</li>
              <li>Own the data you submit, or have permission to act for the owner</li>
              <li>Not be banned by law from using this Service</li>
              <li>Give us true and complete info when you sign up</li>
              <li>Reside in a country where our service is available (primarily US, with GDPR-compliant service for EU users)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Account</h2>

            <h3 className="text-xl font-medium text-white mb-3">5.1 Creating an Account</h3>
            <p className="text-slate-400 mb-4">
              You need an account to use some features. Give us true info when you sign up.
              Keep your info up to date.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">5.2 Electronic Signatures (E-SIGN Act)</h3>
            <p className="text-slate-400 mb-4">
              By creating an account, you consent to transact with us electronically pursuant to the Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. &sect; 7001 et seq.). You agree that your electronic acceptance of these Terms constitutes a valid, binding agreement equivalent to a handwritten signature. You may withdraw this consent by deleting your account.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">5.3 Keeping It Safe</h3>
            <p className="text-slate-400 mb-4">You must:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Keep your password secret</li>
              <li>Take charge of all actions on your account</li>
              <li>Tell us right away if someone else gets in</li>
              <li>Use a strong, unique password (minimum 8 characters)</li>
            </ul>
            <p className="text-slate-400">
              We may close accounts that are hacked or break these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Promises</h2>
            <p className="text-slate-400 mb-4">By using our Service, you promise that:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>The info you give us is yours, or you have permission to share it</li>
              <li>You only ask us to remove data that is yours</li>
              <li>You won&apos;t use our Service for fraud or illegal acts</li>
              <li>You won&apos;t try to break or hack our Service</li>
              <li>You won&apos;t try to get around our security</li>
              <li>You won&apos;t use bots or scripts without our okay</li>
              <li>You won&apos;t pretend to be someone else</li>
              <li>You will follow all laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Authorization Scope</h2>
            <p className="text-slate-400 mb-4">
              When you use our Service, you authorize us to act on your behalf. Specifically, you let us:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Submit opt-out and deletion requests to data brokers using your personal information</li>
              <li>Submit CCPA, GDPR, and other privacy law requests on your behalf</li>
              <li>Communicate with data brokers and third-party sites to process your removals</li>
              <li>Verify your identity when data brokers require it</li>
              <li>Monitor public sources for re-appearance of your data</li>
            </ul>
            <p className="text-slate-400 mb-4">
              This authorization lasts while your account is active. Delete your account to revoke it.
            </p>
            <p className="text-slate-400 mb-4">
              <strong className="text-slate-300">CCPA Authorized Agent:</strong> By creating an account and initiating removal requests, you designate GhostMyData as your authorized agent under CCPA &sect; 1798.185(a)(7) to submit data deletion requests to data brokers on your behalf. This authorization constitutes your signed, written permission as defined by the California Attorney General&apos;s regulations.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">7.1 What We Don&apos;t Do</h3>
            <p className="text-slate-400 mb-4">Our authorization scope does not include:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Removing content from social media platforms (Facebook, Instagram, X, LinkedIn, etc.)</li>
              <li>Removing government records (court filings, arrest records, property deeds)</li>
              <li>Removing content you posted yourself on forums or websites</li>
              <li>Removing news articles or journalistic content</li>
              <li>Any action requiring your government-issued identification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Family Plans</h2>
            <p className="text-slate-400 mb-4">
              Enterprise subscribers can create a Family Group to share benefits:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li><strong className="text-slate-300">Group Size:</strong> Up to 5 family members plus the owner (6 total)</li>
              <li><strong className="text-slate-300">Invitations:</strong> The owner invites members via email. Invitations expire after 7 days.</li>
              <li><strong className="text-slate-300">Member Access:</strong> Family members get Enterprise-level features through the group</li>
              <li><strong className="text-slate-300">Owner Responsibility:</strong> The group owner is responsible for payment and managing membership</li>
              <li><strong className="text-slate-300">Data Separation:</strong> Each member has their own account. Members cannot see each other&apos;s data.</li>
              <li><strong className="text-slate-300">Removal:</strong> The owner can remove members at any time. Removed members revert to the Free plan.</li>
            </ul>
            <p className="text-slate-400">
              If the owner cancels their Enterprise subscription, all family members lose Enterprise access at the end of the billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Custom Removal Requests</h2>
            <p className="text-slate-400 mb-4">
              Pro and Enterprise users can submit custom removal requests for specific URLs:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li><strong className="text-slate-300">Scope:</strong> Data broker sites, people-search engines, and background check services</li>
              <li><strong className="text-slate-300">Exclusions:</strong> Social media profiles, government databases, court records, news articles, and content you posted yourself</li>
              <li><strong className="text-slate-300">Processing:</strong> Custom requests are reviewed and processed within 5 business days</li>
              <li><strong className="text-slate-300">Limits:</strong> Up to 100 custom requests per month for Pro users, 250 for Enterprise. Requests exceeding these thresholds may be queued for the next billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Plans and Billing</h2>

            <h3 className="text-xl font-medium text-white mb-3">10.1 Free and Paid Plans</h3>
            <p className="text-slate-400 mb-4">
              We have free and paid plans. Free plans have limits. Paid plans (Pro and Enterprise)
              give you more features like auto removal and priority support.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">10.2 How Billing Works</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Paid plans bill monthly or yearly in advance</li>
              <li>We use Stripe for secure payments (PCI-DSS Level 1 compliant)</li>
              <li>Prices are in US dollars</li>
              <li>You let us charge your card for your plan</li>
              <li>We give 30 days&apos; notice before price changes</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">10.3 Canceling and Refunds</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Cancel any time in settings or by email</li>
              <li>You keep access until your paid period ends</li>
              <li><strong className="text-emerald-400">30-Day Money Back Guarantee:</strong> Request a full refund within 30 days of your first payment. No questions asked.</li>
              <li>After 30 days, we don&apos;t give refunds for the current period</li>
              <li>No partial refunds after the 30-day window</li>
              <li>Refunds take 5-10 business days to process</li>
              <li>Think we charged you wrong? Tell us within 30 days</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">10.4 Auto-Renewal Disclosure (FTC Negative Option Rule)</h3>
            <p className="text-slate-400 mb-4">
              In compliance with the FTC&apos;s Negative Option Rule (16 CFR Part 425):
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>All paid subscriptions automatically renew at the end of each billing period at the then-current price</li>
              <li>You will receive an email reminder at least 7 days before each renewal</li>
              <li>You can cancel at any time through your account settings or by emailing support — cancellation takes effect at the end of the current billing period</li>
              <li>We provide a simple, accessible cancellation mechanism at the same level of ease as sign-up</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">10.5 Free Trials</h3>
            <p className="text-slate-400">
              We may offer free trials. Your paid plan starts when the trial ends. Cancel before then to avoid charges.
              We&apos;ll let you know before we charge you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. What We Can&apos;t Promise</h2>

            <h3 className="text-xl font-medium text-white mb-3">11.1 No Guarantee of Results</h3>
            <p className="text-slate-400 mb-4">
              We work hard to remove your data. But we can&apos;t promise:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>That we&apos;ll remove all your data from every site</li>
              <li>That data brokers will act by a certain date</li>
              <li>That your data won&apos;t show up again later</li>
              <li>That we&apos;ll stop future data collection</li>
              <li>That we&apos;ll find every place your data appears</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">11.2 Other Sites</h3>
            <p className="text-slate-400 mb-4">
              We rely on other sites and data brokers. We&apos;re not in charge of:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>How accurate their info is</li>
              <li>Whether they follow our removal requests</li>
              <li>If they change how opt-outs work</li>
              <li>If their sites go down</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">11.3 Uptime</h3>
            <p className="text-slate-400">
              We try to stay online all the time. But we may go down for updates or fixes.
              We&apos;ll try to warn you before planned work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Our Property</h2>

            <h3 className="text-xl font-medium text-white mb-3">12.1 What We Own</h3>
            <p className="text-slate-400 mb-4">
              We own our Service and all its parts. This is protected by law. We own:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>The GhostMyData name and logo</li>
              <li>Our website design and graphics</li>
              <li>Our software and code</li>
              <li>Our removal methods</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">12.2 Your License</h3>
            <p className="text-slate-400">
              You can use our Service for yourself. You can&apos;t copy, change, share, or sell any part of it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Don&apos;t Do This</h2>
            <p className="text-slate-400 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Remove someone else&apos;s data without their okay</li>
              <li>Try to hack our Service</li>
              <li>Use bots or scripts without asking</li>
              <li>Break or slow down our Service</li>
              <li>Take apart or copy our code</li>
              <li>Do anything illegal or harmful</li>
              <li>Send viruses or malware</li>
              <li>Harass users or staff</li>
              <li>Break any laws</li>
              <li>Resell our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Limits on What We Owe</h2>
            <p className="text-slate-400 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>WE PROVIDE THE SERVICE &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED</li>
              <li>WE DISCLAIM ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>OUR TOTAL LIABILITY IS LIMITED TO THE GREATER OF (A) $100 OR (B) THE TOTAL FEES PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM</li>
              <li>WE ARE NOT LIABLE FOR THIRD-PARTY ACTIONS INCLUDING DATA BROKER NON-COMPLIANCE OR DATA BREACHES AT THIRD-PARTY SERVICES</li>
            </ul>
            <p className="text-slate-400 mb-4">
              <strong className="text-slate-300">Exception:</strong> These limitations do not apply to liability arising from our gross negligence, willful misconduct, or fraud.
            </p>
            <p className="text-slate-400">
              Some jurisdictions don&apos;t allow these limitations. If that applies to you, our liability is limited to the maximum extent permitted by your local law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. You Protect Us</h2>
            <p className="text-slate-400">
              You agree to indemnify, defend, and hold harmless GhostMyData and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys&apos; fees) arising from: (a) your breach of these Terms, (b) your violation of any law, or (c) your misuse of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Ending Your Account</h2>

            <h3 className="text-xl font-medium text-white mb-3">16.1 You Can Leave</h3>
            <p className="text-slate-400 mb-4">
              Delete your account any time in settings or by emailing support. Your access stops right away.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">16.2 We Can End It</h3>
            <p className="text-slate-400 mb-4">
              We may close your account if you:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Break these Terms</li>
              <li>Do something illegal or abusive</li>
              <li>Don&apos;t pay</li>
              <li>Get flagged by law enforcement</li>
              <li>Have an inactive account for 12 or more consecutive months (we will email you 30 days before terminating an inactive account)</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">16.3 What Happens After</h3>
            <p className="text-slate-400">
              When your account ends, you lose access. We may keep some data as the law requires.
              Some parts of these Terms still apply after you leave (Sections 12, 14, 15, 17, and 18).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">17. Disputes</h2>

            <h3 className="text-xl font-medium text-white mb-3">17.1 Talk to Us First</h3>
            <p className="text-slate-400 mb-4">
              Have a problem? Email legal@ghostmydata.com first. We&apos;ll try to fix it within 30 days.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.2 Binding Arbitration</h3>
            <p className="text-slate-400 mb-4">
              If we can&apos;t resolve the dispute informally, you agree that any dispute, claim, or controversy arising from these Terms or the Service will be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration will take place in Delaware or remotely, at your choice.
            </p>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                <strong>30-Day Opt-Out:</strong> You may opt out of this arbitration clause by sending written notice to legal@ghostmydata.com within 30 days of first accepting these Terms. Your notice must include your name, email, and a clear statement that you reject arbitration. If you opt out, disputes will be resolved in state or federal courts in Delaware.
              </p>
            </div>

            <h3 className="text-xl font-medium text-white mb-3">17.3 Class Action Waiver</h3>
            <p className="text-slate-400 mb-4">
              YOU AND GHOSTMYDATA AGREE THAT DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS ONLY. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR REPRESENTATIVE PROCEEDING. If a court finds this waiver unenforceable, this entire arbitration section is void and disputes will proceed in court.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.4 Exceptions</h3>
            <p className="text-slate-400">
              Either of us can go to court to protect intellectual property rights. Small claims court is also available for qualifying disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">18. Governing Law &amp; Geographic Scope</h2>
            <p className="text-slate-400 mb-4">
              Delaware law governs these Terms without regard to conflict-of-law principles. If we go to court, exclusive jurisdiction lies with the state and federal courts located in Delaware.
            </p>
            <p className="text-slate-400">
              Our Service is primarily designed for users in the United States. For EU/EEA users, we provide GDPR-compliant data processing. We make no representations that the Service is appropriate for use in other jurisdictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">19. Changes to Terms</h2>
            <p className="text-slate-400 mb-4">
              We may change these Terms. When we make big changes:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>We&apos;ll update this page with a new date</li>
              <li>We&apos;ll email you 30 days before big changes</li>
              <li>If you keep using our Service, you agree to the new Terms</li>
              <li>If you don&apos;t agree, stop using our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">20. General Rules</h2>

            <h3 className="text-xl font-medium text-white mb-3">20.1 Full Agreement</h3>
            <p className="text-slate-400 mb-4">
              These Terms, together with our Privacy Policy and Cookie Policy, are the full agreement between us.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">20.2 If Part Is Invalid</h3>
            <p className="text-slate-400 mb-4">
              If a court strikes down part of these Terms, the rest still applies.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">20.3 We Can Wait</h3>
            <p className="text-slate-400 mb-4">
              If we don&apos;t enforce a rule right away, we can still enforce it later.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">20.4 You Can&apos;t Transfer</h3>
            <p className="text-slate-400 mb-4">
              You can&apos;t give your account to someone else. We can transfer our business.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">20.5 Things Beyond Our Control</h3>
            <p className="text-slate-400">
              We&apos;re not liable if something breaks due to disasters, wars, or internet outages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">21. Contact Us</h2>
            <p className="text-slate-400 mb-4">
              Questions? Reach out:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-3">
              <div>
                <p className="text-slate-300 font-medium">GhostMyData (operated by Rank127 LLC)</p>
                <p className="text-slate-400 text-sm">8 The Green, Suite A, Dover, DE 19901, United States</p>
              </div>
              <p className="text-slate-300">
                <strong>Legal:</strong>{" "}
                <a href="mailto:legal@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  legal@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300">
                <strong>Support:</strong>{" "}
                <a href="mailto:support@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  support@ghostmydata.com
                </a>
              </p>
            </div>
          </section>

          <section className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20">
            <p className="text-slate-300">
              By using GhostMyData, you agree to these Terms. If you don&apos;t agree, please don&apos;t use our Service.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

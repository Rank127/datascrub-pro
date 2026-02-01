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
          Last updated: January 20, 2026
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
              <li><strong className="text-slate-300">&quot;Service&quot;</strong> means the GhostMyData website and apps</li>
              <li><strong className="text-slate-300">&quot;User,&quot; &quot;You,&quot; &quot;Your&quot;</strong> means anyone who uses our Service</li>
              <li><strong className="text-slate-300">&quot;We,&quot; &quot;Us,&quot; &quot;Our&quot;</strong> means GhostMyData</li>
              <li><strong className="text-slate-300">&quot;Personal Data&quot;</strong> means info that can identify you</li>
              <li><strong className="text-slate-300">&quot;Subscription&quot;</strong> means a paid plan</li>
              <li><strong className="text-slate-300">&quot;Data Broker&quot;</strong> means sites that collect and sell your info</li>
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
              We act as your agent. We submit removal requests for you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Who Can Use Our Service</h2>
            <p className="text-slate-400 mb-4">To use our Service, you must:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Be able to enter a legal agreement</li>
              <li>Own the data you submit, or have permission to act for the owner</li>
              <li>Not be banned by law from using this Service</li>
              <li>Give us true and complete info when you sign up</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Your Account</h2>

            <h3 className="text-xl font-medium text-white mb-3">4.1 Creating an Account</h3>
            <p className="text-slate-400 mb-4">
              You need an account to use some features. Give us true info when you sign up.
              Keep your info up to date.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">4.2 Keeping It Safe</h3>
            <p className="text-slate-400 mb-4">You must:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Keep your password secret</li>
              <li>Take charge of all actions on your account</li>
              <li>Tell us right away if someone else gets in</li>
              <li>Use a strong, unique password</li>
            </ul>
            <p className="text-slate-400">
              We may close accounts that are hacked or break these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Promises</h2>
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
            <h2 className="text-2xl font-semibold text-white mb-4">6. You Authorize Us</h2>
            <p className="text-slate-400 mb-4">
              When you use our Service, you let us act for you. We can:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Send opt-out requests to data brokers for you</li>
              <li>Send CCPA and GDPR requests using your info</li>
              <li>Talk to other sites to process your removals</li>
              <li>Verify who you are when data brokers ask</li>
            </ul>
            <p className="text-slate-400">
              This lasts while your account is active. Delete your account to stop it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Plans and Billing</h2>

            <h3 className="text-xl font-medium text-white mb-3">7.1 Free and Paid Plans</h3>
            <p className="text-slate-400 mb-4">
              We have free and paid plans. Free plans have limits. Paid plans (Pro and Enterprise)
              give you more features like auto removal and priority support.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">7.2 How Billing Works</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Paid plans bill monthly or yearly in advance</li>
              <li>We use Stripe for secure payments</li>
              <li>Prices are in US dollars</li>
              <li>You let us charge your card for your plan</li>
              <li>We give 30 days&apos; notice before price changes</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">7.3 Canceling and Refunds</h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Cancel any time in settings or by email</li>
              <li>You keep access until your paid period ends</li>
              <li><strong className="text-slate-300">30-Day Money Back:</strong> Ask for a full refund within 30 days of your first payment</li>
              <li>After 30 days, we don&apos;t give refunds</li>
              <li>No partial refunds after the 30-day window</li>
              <li>Refunds take 5-10 business days</li>
              <li>Think we charged you wrong? Tell us within 30 days</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">7.4 Free Trials</h3>
            <p className="text-slate-400">
              We may offer free trials. Your paid plan starts when the trial ends. Cancel before then to avoid charges.
              We&apos;ll let you know before we charge you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. What We Can&apos;t Promise</h2>

            <h3 className="text-xl font-medium text-white mb-3">8.1 No Guarantee of Results</h3>
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

            <h3 className="text-xl font-medium text-white mb-3">8.2 Other Sites</h3>
            <p className="text-slate-400 mb-4">
              We rely on other sites and data brokers. We&apos;re not in charge of:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>How accurate their info is</li>
              <li>Whether they follow our removal requests</li>
              <li>If they change how opt-outs work</li>
              <li>If their sites go down</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">8.3 Uptime</h3>
            <p className="text-slate-400">
              We try to stay online all the time. But we may go down for updates or fixes.
              We&apos;ll try to warn you before planned work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Our Property</h2>

            <h3 className="text-xl font-medium text-white mb-3">9.1 What We Own</h3>
            <p className="text-slate-400 mb-4">
              We own our Service and all its parts. This is protected by law. We own:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>The GhostMyData name and logo</li>
              <li>Our website design and graphics</li>
              <li>Our software and code</li>
              <li>Our removal methods</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">9.2 Your License</h3>
            <p className="text-slate-400">
              You can use our Service for yourself. You can&apos;t copy, change, share, or sell any part of it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Don&apos;t Do This</h2>
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
            <h2 className="text-2xl font-semibold text-white mb-4">11. Limits on What We Owe</h2>
            <p className="text-slate-400 mb-4">
              AS MUCH AS THE LAW ALLOWS:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>WE GIVE THE SERVICE &quot;AS IS&quot; WITH NO WARRANTIES</li>
              <li>WE DON&apos;T PROMISE IT WILL WORK PERFECTLY FOR YOU</li>
              <li>WE&apos;RE NOT LIABLE FOR INDIRECT OR SPECIAL DAMAGES</li>
              <li>THE MOST WE OWE YOU IS WHAT YOU PAID US IN THE PAST 12 MONTHS</li>
              <li>WE&apos;RE NOT LIABLE FOR HACKS, DATA BREACHES, OR WHAT DATA BROKERS DO</li>
            </ul>
            <p className="text-slate-400">
              Some places don&apos;t allow these limits. If that&apos;s you, we limit our liability as much as your laws allow.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. You Protect Us</h2>
            <p className="text-slate-400">
              If we get sued because of something you did, you agree to cover our costs. This includes legal fees.
              This applies if you break these Terms, break the law, or hurt someone through our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Ending Your Account</h2>

            <h3 className="text-xl font-medium text-white mb-3">13.1 You Can Leave</h3>
            <p className="text-slate-400 mb-4">
              Delete your account any time in settings or by emailing support. Your access stops right away.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">13.2 We Can End It</h3>
            <p className="text-slate-400 mb-4">
              We may close your account if you:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Break these Terms</li>
              <li>Do something illegal or abusive</li>
              <li>Don&apos;t pay</li>
              <li>Get flagged by law enforcement</li>
              <li>Don&apos;t use your account for a long time</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">13.3 What Happens After</h3>
            <p className="text-slate-400">
              When your account ends, you lose access. We may keep some data as the law requires.
              Some parts of these Terms still apply after you leave.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Disputes</h2>

            <h3 className="text-xl font-medium text-white mb-3">14.1 Talk to Us First</h3>
            <p className="text-slate-400 mb-4">
              Have a problem? Email legal@ghostmydata.com first. We&apos;ll try to fix it within 30 days.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">14.2 Arbitration</h3>
            <p className="text-slate-400 mb-4">
              If we can&apos;t fix it, we use arbitration through the AAA. A neutral person decides.
              No court trial.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">14.3 No Class Actions</h3>
            <p className="text-slate-400 mb-4">
              YOU CAN ONLY SUE US ON YOUR OWN. NO CLASS ACTIONS. If a court says this is invalid,
              then this whole section is void.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">14.4 Exceptions</h3>
            <p className="text-slate-400">
              Either of us can go to court to protect IP rights. Small claims court is also okay.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Governing Law</h2>
            <p className="text-slate-400">
              Delaware law governs these Terms. If we go to court, it will be in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Changes to Terms</h2>
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
            <h2 className="text-2xl font-semibold text-white mb-4">17. General Rules</h2>

            <h3 className="text-xl font-medium text-white mb-3">17.1 Full Agreement</h3>
            <p className="text-slate-400 mb-4">
              These Terms plus our Privacy Policy are the full deal between us.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.2 If Part Is Invalid</h3>
            <p className="text-slate-400 mb-4">
              If a court strikes down part of these Terms, the rest still applies.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.3 We Can Wait</h3>
            <p className="text-slate-400 mb-4">
              If we don&apos;t enforce a rule right away, we can still enforce it later.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.4 You Can&apos;t Transfer</h3>
            <p className="text-slate-400 mb-4">
              You can&apos;t give your account to someone else. We can transfer our business.
            </p>

            <h3 className="text-xl font-medium text-white mb-3">17.5 Things Beyond Our Control</h3>
            <p className="text-slate-400">
              We&apos;re not liable if something breaks due to disasters, wars, or internet outages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">18. Contact Us</h2>
            <p className="text-slate-400 mb-4">
              Questions? Reach out:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-300">
                <strong>Legal:</strong>{" "}
                <a href="mailto:legal@ghostmydata.com" className="text-emerald-400 hover:text-emerald-300">
                  legal@ghostmydata.com
                </a>
              </p>
              <p className="text-slate-300 mt-2">
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

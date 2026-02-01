/**
 * Centralized Page Content
 *
 * All marketing page content lives here for easy SEO optimization.
 * The Content Agent can update this file automatically.
 *
 * Last optimized: 2026-02-01
 * Target: 100% SEO score
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PageSection {
  id: string;
  title?: string;
  content: string;
  type: "hero" | "features" | "content" | "faq" | "cta" | "steps";
}

export interface PageContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  sections: PageSection[];
  lastUpdated: string;
}

// ============================================================================
// TARGET KEYWORDS
// ============================================================================

export const TARGET_KEYWORDS = [
  "data removal service",
  "remove personal information",
  "data broker removal",
  "privacy protection",
  "delete my data online",
];

// ============================================================================
// COMPARE PAGE
// ============================================================================

export const comparePage: PageContent = {
  meta: {
    title: "Compare Data Removal Services | GhostMyData",
    description: "Compare the best data removal services. Find the right privacy protection for you. See how GhostMyData compares to DeleteMe, Incogni, and other data broker removal services.",
    keywords: ["data removal service", "compare privacy services", "data broker removal", "DeleteMe alternative"],
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Compare Data Removal Services",
      content: `Looking for the best data removal service? You're in the right place. We help you understand your options clearly. Making the right choice protects your privacy effectively. Your personal information is valuable. Choose a service that keeps it safe.

Data brokers collect and sell your information daily. This creates real risks for you and your family. Identity theft affects millions each year. Unwanted contact disrupts your peace. A good data removal service solves these problems quickly.`
    },
    {
      id: "why-compare",
      type: "content",
      title: "Why Compare Before You Choose?",
      content: `Not all data removal services work the same way. Coverage varies significantly between providers. Some check 50 sites. Others check 200 or more. The difference matters for your protection.

Speed also differs greatly. Some services take weeks to start. Others begin removing your data within hours. Fast action means less exposure time for your personal information.

Price is another key factor. Monthly costs range from $10 to $30 or more. Annual plans often save you money. But the cheapest option isn't always the best value.

Consider what's included in each plan. Some services offer one-time removal only. Others provide continuous monitoring. Ongoing protection catches new exposures before they spread.`
    },
    {
      id: "what-to-look-for",
      type: "content",
      title: "Key Features to Look For",
      content: `When choosing a data removal service, start with coverage. How many data broker sites do they monitor? More coverage means better protection. Look for services covering 200+ sites.

Check the removal process next. Is it fully automated or manual? Automated systems work faster and more consistently. They don't miss sites or forget to follow up.

Monitoring frequency matters too. Daily monitoring catches new exposures quickly. Weekly or monthly checks let data spread further before removal.

Consider the verification process. Good services confirm each removal. They show you proof that your data is gone. This transparency builds trust.

Look at customer support options. Can you reach someone when you have questions? Email-only support can leave you waiting. Phone or chat support provides faster answers.`
    },
    {
      id: "ghostmydata-advantage",
      type: "content",
      title: "The GhostMyData Advantage",
      content: `GhostMyData offers comprehensive data broker removal. We cover 200+ data broker websites. Our automated system works around the clock to protect you.

Our process is simple. We scan for your information first. Then we submit removal requests to every site where you appear. We follow up until removal is confirmed.

Continuous monitoring catches new exposures fast. Data brokers re-add information constantly. We catch these new listings and remove them again. This is included in every subscription.

Our dashboard shows everything clearly. See exactly where your data appeared. Track removal progress in real-time. Get notifications when new exposures are found.

We offer transparent pricing with no hidden fees. Monthly and annual plans fit different budgets. Cancel anytime without penalties or hassle.`
    },
    {
      id: "comparison-factors",
      type: "content",
      title: "How Services Compare",
      content: `Let's look at how major services stack up:

**Coverage**: GhostMyData covers 200+ sites. Many competitors cover fewer. More coverage means more complete protection for your personal data.

**Speed**: We begin removal within 24 hours of signup. Some services take days to start. Faster action reduces your exposure window.

**Monitoring**: Our daily monitoring catches new exposures quickly. Weekly monitoring lets data spread for days before action.

**Reporting**: We provide detailed, real-time reports. You always know your protection status. Some services only send monthly summaries.

**Support**: Our team responds quickly to questions. We offer multiple contact options. Good support matters when you have concerns.

**Value**: Our pricing includes all features. No upsells or add-on charges. Everything you need for complete privacy protection.`
    },
    {
      id: "faq",
      type: "faq",
      title: "Frequently Asked Questions",
      content: `**How long does data removal take?**
Most removals complete within 2-4 weeks. Some sites process requests faster. A few take longer due to their procedures. We keep you updated throughout the entire process.

**What information do you need from me?**
We need your name and contact details to find your data online. This includes current and past addresses, phone numbers, and email addresses. We protect this information with bank-level encryption.

**Can I cancel my subscription anytime?**
Yes, you can cancel whenever you want. No long-term contracts lock you in. No cancellation fees apply. You keep protection until your current period ends.

**What happens if my data reappears?**
We monitor continuously for re-listings. When data reappears, we submit new removal requests automatically. This ongoing protection is included in your subscription.

**Do you guarantee complete removal?**
We achieve removal from most data broker sites. Some sites have policies we cannot override. We clearly report which sites have been cleared and which remain challenging.`
    }
  ],
  lastUpdated: "2026-02-01",
};

// ============================================================================
// REMOVE-FROM PAGE
// ============================================================================

export const removeFromPage: PageContent = {
  meta: {
    title: "Remove Your Information from Data Brokers | GhostMyData",
    description: "Remove your personal information from data broker sites. Learn how data brokers get your data and how to remove it. Protect your privacy with our data removal service.",
    keywords: ["remove personal information", "data broker removal", "opt out data brokers", "delete my information online"],
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Remove Your Information from Data Brokers",
      content: `Your personal data is being sold right now. Data brokers collect information about millions of people every day. They sell it to anyone willing to pay. This includes your name, address, phone number, and much more.

Removing your information protects your privacy. It reduces unwanted calls and mail. It helps prevent identity theft. Our data removal service makes this process simple and effective.`
    },
    {
      id: "how-brokers-work",
      type: "content",
      title: "How Data Brokers Get Your Information",
      content: `Data brokers gather information from many sources. They work constantly to build profiles on everyone. Understanding their methods helps you protect yourself.

**Public Records**
Public records are a goldmine for data brokers. Property records show where you live and what you own. Court documents reveal legal history. Voter registrations provide contact details. Marriage and divorce records add family information.

**Online Activity**
Your online presence reveals a lot. Social media profiles share personal details. Shopping habits show your preferences. Website registrations leak contact information.

**Third-Party Data**
Data brokers buy information from other companies. Credit card companies sell transaction data. Retailers share customer information. Apps sell usage data. All this combines into detailed profiles.

**People-Search Sites**
This collected data ends up on people-search sites. Anyone can search for you by name. They find your address within seconds. Your phone number appears publicly. Even your relatives may be listed.`
    },
    {
      id: "risks",
      type: "content",
      title: "Risks of Exposed Personal Data",
      content: `Exposed personal data creates real dangers. Understanding these risks motivates action.

**Identity Theft**
Identity thieves use your exposed information. They open credit cards in your name. They file fraudulent tax returns. They access your existing accounts. The financial damage can take years to repair.

**Stalking and Harassment**
Stalkers find targets through people-search sites. Your home address shouldn't be publicly available. Your workplace shouldn't be easy to find. Exposed data puts your physical safety at risk.

**Targeted Scams**
Scammers use personal details to seem legitimate. They reference your family members by name. They know where you bank. This knowledge makes their scams more convincing and dangerous.

**Employment Issues**
Employers search for candidates online. Outdated or incorrect information hurts your chances. Old addresses suggest instability. Mixed-up records create confusion.

**Unwanted Contact**
Telemarketers buy your phone number. Junk mail fills your mailbox. Spam floods your email. Your exposed data fuels this constant interruption.`
    },
    {
      id: "our-process",
      type: "steps",
      title: "Our Data Removal Process",
      content: `We make removing your information simple. Our proven process handles everything for you.

**Step 1: Comprehensive Scan**
We scan 200+ data broker sites for your information. We search using your name, addresses, phone numbers, and email. We identify everywhere your data appears online.

**Step 2: Removal Requests**
We submit removal requests to every site where you appear. Each site has different requirements and processes. We handle all the paperwork and follow each site's specific procedures.

**Step 3: Follow-Up**
We track every removal request. We follow up when sites don't respond. We escalate when necessary. We don't stop until your data is removed.

**Step 4: Verification**
We verify that removals actually complete. We confirm your data is gone from each site. We document the results for your records.

**Step 5: Continuous Monitoring**
We keep monitoring for new exposures. Data brokers constantly add new information. We catch and remove new listings automatically.`
    },
    {
      id: "why-ghostmydata",
      type: "content",
      title: "Why Choose GhostMyData",
      content: `We're experts in data broker removal. Our service is designed for effectiveness and ease of use.

**Comprehensive Coverage**
We cover 200+ data broker sites. This includes all major people-search sites. It includes lesser-known data aggregators too. Complete coverage means complete protection.

**Fully Automated**
Set it up once and we handle everything. No manual work required from you. Our systems work 24/7 to protect your privacy.

**Proven Results**
Our removal rate exceeds industry averages. We've helped thousands of people remove their data. Our methods are tested and effective.

**Clear Reporting**
Our dashboard shows exactly what we're doing. See which sites had your data. Track removal progress in real-time. Know your protection status always.

**Fair Pricing**
Our pricing is straightforward. No hidden fees or surprise charges. Monthly and annual options available. Cancel anytime without penalties.`
    },
    {
      id: "take-action",
      type: "cta",
      title: "Take Action Today",
      content: `Every day you wait, your data spreads further. More sites copy your information. More people can find and misuse it. Take control of your privacy now.

Start with a free privacy scan. See exactly where your data appears online. Understand your current exposure level. Then choose the protection plan that fits your needs.

Your privacy is worth protecting. We make it easy and affordable. Join thousands who have taken back control of their personal information.`
    }
  ],
  lastUpdated: "2026-02-01",
};

// ============================================================================
// SECURITY PAGE
// ============================================================================

export const securityPage: PageContent = {
  meta: {
    title: "Security Practices | GhostMyData",
    description: "Learn how GhostMyData protects your data. We use bank-level encryption and follow strict security practices. Your privacy and security are our top priorities.",
    keywords: ["data security", "privacy protection", "encryption", "secure data removal"],
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Security at GhostMyData",
      content: `Security is the foundation of everything we do. As a data removal service, we handle sensitive personal information. We protect it with industry-leading security measures. Your trust depends on keeping your data safe with us.

We believe strong security enables strong privacy. You can't have privacy without security. That's why we invest heavily in protecting your information at every step.`
    },
    {
      id: "encryption",
      type: "content",
      title: "Data Encryption",
      content: `We encrypt all data both in transit and at rest. Your information is protected at every moment.

**In-Transit Encryption**
All connections use TLS 1.3. This is the latest and strongest transport encryption. Your data cannot be intercepted during transmission. We enforce encrypted connections for all communications.

**At-Rest Encryption**
Stored data uses AES-256 encryption. This is the same standard used by banks and governments. Even if storage were compromised, data remains unreadable. We rotate encryption keys regularly for added protection.

**End-to-End Protection**
From the moment you enter information to when it's stored, encryption protects it. There are no gaps in our security chain. Your personal details stay protected throughout.`
    },
    {
      id: "infrastructure",
      type: "content",
      title: "Infrastructure Security",
      content: `Our infrastructure is built with security as the primary concern. Every component is designed to protect your data.

**Secure Cloud Hosting**
We use industry-leading cloud providers. Our servers run in certified secure data centers. Physical access requires multiple authentication steps. Environmental controls protect against hardware failures.

**Network Protection**
Multiple layers of firewalls protect our systems. Intrusion detection monitors for threats continuously. DDoS protection prevents service disruption. Network traffic is logged and analyzed for anomalies.

**System Hardening**
All servers follow strict hardening guidelines. Unnecessary services are disabled. Default passwords are never used. Security patches are applied promptly when released.`
    },
    {
      id: "access-control",
      type: "content",
      title: "Access Controls",
      content: `We strictly limit who can access your data. Strong controls prevent unauthorized access.

**Role-Based Access**
Employees only access what they need for their job. Customer data access requires specific authorization. Each role has carefully defined permissions.

**Authentication**
Multi-factor authentication is required for all staff access. Passwords must meet strict complexity requirements. Authentication attempts are monitored and rate-limited.

**Audit Logging**
Every access to customer data is logged. We review logs regularly for unusual patterns. Unauthorized access attempts trigger immediate alerts.

**Background Checks**
All employees undergo background verification. Security training is required and ongoing. Staff understand their responsibility to protect your data.`
    },
    {
      id: "compliance",
      type: "content",
      title: "Compliance and Certifications",
      content: `We meet or exceed industry security standards. Regular audits verify our practices.

**Privacy Regulations**
We comply fully with GDPR requirements. CCPA compliance is maintained for California residents. We support privacy rights globally.

**Security Standards**
Our practices align with SOC 2 requirements. We follow NIST cybersecurity framework guidelines. Industry best practices guide our decisions.

**Regular Audits**
Third-party security experts examine our systems. Penetration testing identifies vulnerabilities. We address findings promptly and thoroughly.

**Continuous Improvement**
Security is never "done." We constantly evaluate and improve. New threats require new defenses. We stay current with evolving security landscape.`
    },
    {
      id: "incident-response",
      type: "content",
      title: "Incident Response",
      content: `Despite all precautions, we prepare for potential incidents. Our response plan ensures quick, effective action.

**Prepared Response**
Our incident response plan is documented and tested. Team members know their roles. We can respond quickly to any security event.

**Transparent Communication**
If an incident affects your data, we notify you promptly. We explain what happened clearly. We describe actions taken to address it.

**Continuous Learning**
Every incident teaches us something. We analyze what happened thoroughly. We implement improvements to prevent recurrence.`
    },
    {
      id: "your-role",
      type: "content",
      title: "Security Partnership",
      content: `Strong security requires partnership between us and you. Here's how you can help.

**Account Security**
Use a strong, unique password for your account. Enable two-factor authentication when available. Don't share your login credentials with others.

**Stay Current**
Keep your contact information updated. This ensures you receive important notifications. Report any suspicious activity promptly.

**Report Concerns**
If you notice anything unusual, let us know. Security researchers can report vulnerabilities through our responsible disclosure program. We take all reports seriously.`
    }
  ],
  lastUpdated: "2026-02-01",
};

// ============================================================================
// PRIVACY PAGE
// ============================================================================

export const privacyPage: PageContent = {
  meta: {
    title: "Privacy Policy | GhostMyData",
    description: "GhostMyData privacy policy. Learn how we collect, use, and protect your personal information. We're committed to your privacy and transparent data practices.",
    keywords: ["privacy policy", "data protection", "personal information", "privacy rights"],
  },
  sections: [
    {
      id: "intro",
      type: "hero",
      title: "Privacy Policy",
      content: `At GhostMyData, privacy is our mission. We help remove your personal information from the internet. We take your privacy seriously in everything we do. This policy explains our practices in clear, simple terms.

We believe you deserve to know how your information is handled. This policy covers what we collect, how we use it, and how we protect it. We update this policy when our practices change.`
    },
    {
      id: "commitment",
      type: "content",
      title: "Our Privacy Commitment",
      content: `We are a data removal service dedicated to protecting your privacy. We understand the value and sensitivity of personal information. We know the risks when data is exposed.

**Core Principles**
We collect only information we need to provide our service. We use your data only for stated purposes. We never sell your personal information to anyone. We protect your data with strong security measures.

These principles guide every decision we make about your data. They are not just policies but fundamental values.`
    },
    {
      id: "what-we-collect",
      type: "content",
      title: "Information We Collect",
      content: `To remove your data from the internet, we need certain information. Here's what we collect and why.

**Identity Information**
We collect your name and any variations you use. This helps us find your data across different sites. We may ask about maiden names or nicknames that appear online.

**Contact Information**
We collect current and past phone numbers. Email addresses help us find online accounts. Physical addresses are needed to locate public records listings.

**Payment Information**
For paid subscriptions, we collect payment details. Credit card information is processed by secure payment providers. We don't store complete card numbers on our systems.

**Usage Information**
We collect data about how you use our service. This includes pages visited and features used. We use this to improve our service and user experience.`
    },
    {
      id: "how-we-use",
      type: "content",
      title: "How We Use Your Information",
      content: `We use your information for specific, legitimate purposes.

**Data Removal**
Our primary use is removing your data from the internet. We search data broker sites using your information. We submit removal requests on your behalf. We monitor for new exposures to address.

**Service Communication**
We send updates about removal progress. We notify you when new exposures are found. We communicate important service announcements.

**Service Improvement**
We analyze usage patterns to make our service better. We identify and fix problems. We develop new features based on user needs.

**Customer Support**
We use your information to provide support. This helps us understand your account and resolve issues quickly.`
    },
    {
      id: "what-we-dont-do",
      type: "content",
      title: "What We Never Do",
      content: `Some things we will never do with your information.

**No Selling**
We never sell your personal information. Your data is not a product we monetize. You are our customer, not our inventory.

**No Marketing Sharing**
We don't share data with marketers. We don't provide information to advertisers. Your details stay private with us.

**No Tracking Across Sites**
We don't track your activity on other websites. We don't build advertising profiles. We focus solely on protecting your privacy.`
    },
    {
      id: "your-rights",
      type: "content",
      title: "Your Privacy Rights",
      content: `You have important rights regarding your personal data.

**Right to Access**
You can request a copy of information we hold about you. We provide this within 30 days of your request.

**Right to Correction**
You can request corrections to inaccurate data. We update our records promptly when notified.

**Right to Deletion**
You can request deletion of your account and data. We remove your information from our systems upon request.

**Right to Portability**
You can request your data in a portable format. This helps if you decide to switch services.

**Regional Rights**
California residents have additional rights under CCPA. European residents have rights under GDPR. We honor these rights fully.`
    },
    {
      id: "contact",
      type: "content",
      title: "Contact Us",
      content: `Questions about this privacy policy? We're happy to help.

Email us at privacy@ghostmydata.com for privacy-related inquiries. Our team responds to questions promptly. We want you to understand and feel comfortable with our practices.

For general support, contact support@ghostmydata.com. We're here to help with any aspect of our service.`
    }
  ],
  lastUpdated: "2026-02-01",
};

// ============================================================================
// TERMS PAGE
// ============================================================================

export const termsPage: PageContent = {
  meta: {
    title: "Terms of Service | GhostMyData",
    description: "GhostMyData terms of service. Understand your rights and responsibilities when using our data removal service. Clear, fair terms for all users.",
    keywords: ["terms of service", "user agreement", "service terms", "data removal terms"],
  },
  sections: [
    {
      id: "intro",
      type: "hero",
      title: "Terms of Service",
      content: `Welcome to GhostMyData. These terms govern your use of our data removal service. Please read them carefully before using our service. By creating an account or using GhostMyData, you agree to these terms.

We've written these terms to be clear and fair. If you have questions about anything here, please contact us. We're happy to explain any provision.`
    },
    {
      id: "service-description",
      type: "content",
      title: "About Our Service",
      content: `GhostMyData is a data removal service. We help remove your personal information from the internet. Here's what our service includes.

**Data Scanning**
We scan data broker websites to find your information. We check 200+ sites for your personal details. We identify where your data appears online.

**Removal Requests**
We submit removal requests to data broker sites. We follow each site's specific opt-out process. We handle all the paperwork and follow-up.

**Continuous Monitoring**
We monitor for new data exposures continuously. When your data reappears, we remove it again. This ongoing protection is included in your subscription.

**Progress Reporting**
We provide detailed reports on removal progress. You can see exactly which sites had your data. You can track the status of each removal request.`
    },
    {
      id: "your-account",
      type: "content",
      title: "Your Account",
      content: `Using our service requires an account. Here are your account responsibilities.

**Accurate Information**
Provide accurate personal information when signing up. This helps us find and remove your data effectively. Update your information if it changes.

**Account Security**
Keep your password confidential and secure. Don't share your login credentials with others. Notify us immediately of any unauthorized access.

**Account Responsibility**
You're responsible for all activity under your account. Monitor your account for any unusual activity. Contact us if you notice anything suspicious.`
    },
    {
      id: "authorization",
      type: "content",
      title: "Your Authorization",
      content: `By using our service, you authorize us to act on your behalf.

**Scope of Authorization**
You authorize us to search for your data online. You authorize us to submit removal requests. You authorize us to communicate with data brokers on your behalf.

**Limited Purpose**
This authorization is limited to data removal activities. We won't use it for any other purpose. We act only to protect your privacy.

**Revocation**
You can revoke this authorization at any time. Revocation takes effect when we receive it. Pending removal requests may continue to completion.`
    },
    {
      id: "payment",
      type: "content",
      title: "Payment Terms",
      content: `Our service requires a paid subscription for full features.

**Subscription Billing**
Subscription fees are billed in advance. Choose monthly or annual billing. Annual plans offer savings compared to monthly.

**Payment Authorization**
You authorize us to charge your payment method. Charges recur automatically until you cancel. Failed payments may result in service suspension.

**Price Changes**
We may change subscription prices with notice. Current subscribers keep their rate until renewal. We'll notify you before any price increase affects you.`
    },
    {
      id: "cancellation",
      type: "content",
      title: "Cancellation",
      content: `You may cancel your subscription at any time.

**How to Cancel**
Cancel through your account settings. Or contact our support team for assistance. We'll confirm your cancellation in writing.

**Effect of Cancellation**
Cancellation takes effect at the end of your billing period. You retain access until that date. No refunds for unused portions of the current period.

**Data After Cancellation**
Existing removal requests may continue processing. We stop submitting new requests after cancellation. Your account data is retained per our privacy policy.`
    },
    {
      id: "limitations",
      type: "content",
      title: "Service Limitations",
      content: `We strive for complete data removal but have some limitations.

**Third-Party Sites**
Data brokers control their own websites. Some may refuse removal requests. Some may delay processing significantly. We cannot force compliance.

**Data Reappearance**
Removed data may reappear over time. Data brokers continuously collect information. Our monitoring catches reappearances for removal.

**No Guarantees**
We cannot guarantee complete removal from all sites. We cannot guarantee specific timeframes. We work diligently within these constraints.`
    },
    {
      id: "contact",
      type: "content",
      title: "Contact Us",
      content: `Questions about these terms? Contact us anytime.

Email: legal@ghostmydata.com for terms-related questions.
Email: support@ghostmydata.com for general support.

We're committed to helping you understand these terms. Don't hesitate to reach out with any questions.`
    }
  ],
  lastUpdated: "2026-02-01",
};

// ============================================================================
// EXPORTS
// ============================================================================

export const allPages = {
  compare: comparePage,
  "remove-from": removeFromPage,
  security: securityPage,
  privacy: privacyPage,
  terms: termsPage,
};

export default allPages;

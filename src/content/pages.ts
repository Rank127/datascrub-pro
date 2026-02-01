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
    description: "See how GhostMyData keeps your data safe. We use strong encryption for our data removal service. Your privacy protection is our priority.",
    keywords: ["data security", "privacy protection", "encryption", "secure data removal", "data removal service"],
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Security at GhostMyData",
      content: `Our data removal service keeps your info safe. This is our core promise. We use strong tools to guard your data. You can trust us to do this right.

Good security makes privacy protection work. One needs the other. We put a lot of care into keeping your data safe. When you remove personal information with us, it stays protected.`
    },
    {
      id: "encryption",
      type: "content",
      title: "How We Lock Your Data",
      content: `Our data removal service locks all data when it moves and when it sits. Your info stays safe at all times. This is key to privacy protection.

**Data in Motion**
We use TLS 1.3 for all links. This is the best lock for data in motion. No one can grab your data as it moves. When we remove personal information for you, it travels safely.

**Data at Rest**
Stored data uses AES-256. Banks use this same lock. If someone got to our drives, they still can't read it. We swap out keys often to stay safe.

**Full Coverage**
From the time you type to when we store it, locks guard your data. There are no weak spots. Your details stay safe the whole way. Our data broker removal process is fully encrypted.`
    },
    {
      id: "infrastructure",
      type: "content",
      title: "Safe Servers",
      content: `We built our systems with safety first. Each part guards your data.

**Cloud Hosting**
We use top cloud hosts. Our servers sit in safe data hubs. Getting in takes many checks. Backup systems handle any failures.

**Network Guards**
Many walls block bad actors. We watch for threats all day. DDoS shields keep us online. We log and check all traffic.

**Locked Down Servers**
All servers follow strict rules. Extra services are off. We never use default keys. We apply fixes fast when they come out.`
    },
    {
      id: "access-control",
      type: "content",
      title: "Who Can See Your Data",
      content: `Very few people can see your data. Tight rules stop bad access.

**Job-Based Access**
Staff only see what they need for work. Seeing user data needs a sign-off. Each job has set limits.

**Login Checks**
Staff must use two-step login. Passwords must be strong. We watch and limit login tries.

**Access Logs**
We log every look at user data. We check logs for odd patterns. Bad access tries set off alerts.

**Staff Vetting**
All staff pass background checks. Safety training is ongoing. Staff know they must guard your data.`
    },
    {
      id: "compliance",
      type: "content",
      title: "Rules We Follow",
      content: `We meet or beat industry safety rules. Regular checks prove this.

**Privacy Laws**
We follow GDPR fully. We meet CCPA rules too. We support privacy rights worldwide.

**Safety Standards**
We align with SOC 2 rules. NIST guides our choices. Best practices shape what we do.

**Regular Checks**
Outside experts test our systems. They hunt for weak spots. We fix issues fast.

**Always Getting Better**
Safety work never ends. We keep improving. New threats need new defenses. We stay current.`
    },
    {
      id: "incident-response",
      type: "content",
      title: "If Something Goes Wrong",
      content: `We plan for problems. Our response is fast and clear.

**Ready to Act**
Our plan is written and tested. Team members know their jobs. We can act fast on any issue.

**Clear Updates**
If an issue hits your data, we tell you right away. We explain what happened. We describe what we did to fix it.

**Learn and Improve**
Every issue teaches us. We dig into what went wrong. We make changes to stop it next time.`
    },
    {
      id: "your-role",
      type: "content",
      title: "Your Part in Safety",
      content: `Good safety needs teamwork. Here is how you can help.

**Your Account**
Pick a strong password. Use one you don't use elsewhere. Turn on two-step login if you can. Keep your login to yourself.

**Stay in Touch**
Keep your contact info current. This helps us reach you with alerts. Tell us if you see anything odd.

**Report Issues**
Let us know if something seems wrong. Security experts can report bugs to us. We take all reports seriously.`
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
    description: "See how GhostMyData handles your data. Our data removal service keeps it safe. Read our simple privacy policy for privacy protection details.",
    keywords: ["privacy policy", "data protection", "personal information", "privacy rights", "data removal service"],
  },
  sections: [
    {
      id: "intro",
      type: "hero",
      title: "Privacy Policy",
      content: `Privacy is why our data removal service exists. We remove personal information from the web. We guard your privacy protection in all we do. This policy is clear and simple.

You should know how we handle your data. We tell you what we gather. We tell you how we use it. We tell you how we keep it safe. Our data broker removal process respects your rights.`
    },
    {
      id: "commitment",
      type: "content",
      title: "Our Promise to You",
      content: `We help remove your data from the web. We know your info is valuable. We know what can happen when data gets out.

**Our Core Rules**
We only gather what we need. We only use it for our service. We never sell your data. We lock it down tight.

These rules guide all we do. They are not just words. They are who we are.`
    },
    {
      id: "what-we-collect",
      type: "content",
      title: "What We Gather",
      content: `To remove your data, we need some info. Here is what we gather and why.

**Your Name**
We gather your name and other names you use. This helps us find your data on many sites. We may ask for past names too.

**Contact Info**
We gather phone numbers, old and new. Email helps us find accounts. Addresses help us find public records.

**Payment Info**
For paid plans, we gather billing details. Card data goes to safe payment sites. We don't store full card numbers.

**Usage Info**
We see how you use our service. This means pages you visit and tools you use. We use this to make our service better.`
    },
    {
      id: "how-we-use",
      type: "content",
      title: "How We Use Your Info",
      content: `We use your info for clear reasons.

**Data Removal**
Our main job is removing your data. We search data broker sites. We send removal requests for you. We watch for new issues.

**Talking to You**
We send updates on removal progress. We alert you to new exposures. We share important news.

**Making Things Better**
We look at how people use our service. We find and fix problems. We build new features.

**Support**
We use your info to help you. This helps us fix issues fast.`
    },
    {
      id: "what-we-dont-do",
      type: "content",
      title: "What We Never Do",
      content: `Some things we will never do.

**No Selling**
We never sell your info. We don't make money from your data. You are our customer, not our product.

**No Ad Sharing**
We don't share data with ad firms. We don't give info to marketers. Your details stay with us.

**No Tracking**
We don't track you on other sites. We don't build ad profiles. We only focus on your privacy.`
    },
    {
      id: "your-rights",
      type: "content",
      title: "Your Rights",
      content: `You have key rights over your data.

**See Your Data**
You can ask for a copy of your info. We send it within 30 days.

**Fix Errors**
You can ask us to fix wrong data. We update our records when you tell us.

**Delete Your Data**
You can ask us to delete your account. We remove your info when you ask.

**Move Your Data**
You can get your data in a file you can use. This helps if you want to switch.

**Local Laws**
California has CCPA rules. Europe has GDPR rules. We follow both fully.`
    },
    {
      id: "contact",
      type: "content",
      title: "Get in Touch",
      content: `Have questions? We are glad to help.

Email privacy@ghostmydata.com for privacy questions. We reply quickly. We want you to feel good about our practices.

For other help, email support@ghostmydata.com. We are here for you.`
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

// Blog Post Generator
// Generates SEO-optimized blog posts on privacy and security topics
// Expanded: 120+ topic templates across 8 categories

export type BlogCategory =
  | "data-broker"
  | "privacy"
  | "security"
  | "dark-web"
  | "guide"
  | "comparison"
  | "state-privacy"
  | "legal";

export interface BlogTopic {
  title: string;
  slug: string;
  keywords: string[];
  category: BlogCategory;
  priority: number;
}

export interface GeneratedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keywords: string[];
  metaDescription: string;
  estimatedReadTime: number;
}

// ============================================================================
// DATA BROKER REMOVAL GUIDES — 50 brokers (priority 10)
// ============================================================================
const DATA_BROKERS = [
  // Original 15
  { name: "Spokeo", slug: "spokeo" },
  { name: "WhitePages", slug: "whitepages" },
  { name: "BeenVerified", slug: "beenverified" },
  { name: "Intelius", slug: "intelius" },
  { name: "PeopleFinder", slug: "peoplefinder" },
  { name: "TruePeopleSearch", slug: "truepeoplesearch" },
  { name: "FastPeopleSearch", slug: "fastpeoplesearch" },
  { name: "Radaris", slug: "radaris" },
  { name: "USSearch", slug: "ussearch" },
  { name: "PeopleLooker", slug: "peoplelooker" },
  { name: "Instant Checkmate", slug: "instant-checkmate" },
  { name: "ThatsThem", slug: "thatsthem" },
  { name: "FamilyTreeNow", slug: "familytreenow" },
  { name: "MyLife", slug: "mylife" },
  { name: "ZabaSearch", slug: "zabasearch" },
  // New 35 high-search-volume brokers
  { name: "TruthFinder", slug: "truthfinder" },
  { name: "CheckPeople", slug: "checkpeople" },
  { name: "Nuwber", slug: "nuwber" },
  { name: "PeekyYou", slug: "peekyou" },
  { name: "Pipl", slug: "pipl" },
  { name: "SearchPeopleFree", slug: "searchpeoplefree" },
  { name: "CocoFinder", slug: "cocofinder" },
  { name: "ClustrMaps", slug: "clustrmaps" },
  { name: "ZoomInfo", slug: "zoominfo" },
  { name: "USPhonebook", slug: "usphonebook" },
  { name: "SmartBackgroundChecks", slug: "smartbackgroundchecks" },
  { name: "Arrests.org", slug: "arrests-org" },
  { name: "AnyWho", slug: "anywho" },
  { name: "YellowPages", slug: "yellowpages" },
  { name: "CyberBackgroundChecks", slug: "cyberbackgroundchecks" },
  { name: "SearchQuarry", slug: "searchquarry" },
  { name: "PublicDataCheck", slug: "publicdatacheck" },
  { name: "FreePeopleSearch", slug: "freepeoplesearch" },
  { name: "AdvancedBackgroundChecks", slug: "advancedbackgroundchecks" },
  { name: "PublicRecordsNow", slug: "publicrecordsnow" },
  { name: "SpyFly", slug: "spyfly" },
  { name: "PrivateEye", slug: "privateeye" },
  { name: "PeopleConnect", slug: "peopleconnect" },
  { name: "National Public Data", slug: "nationalpublicdata" },
  { name: "Classmates", slug: "classmates" },
  { name: "Addresses.com", slug: "addresses" },
  { name: "Acxiom", slug: "acxiom" },
  { name: "LexisNexis", slug: "lexisnexis" },
  { name: "Epsilon", slug: "epsilon" },
  { name: "Oracle Data Cloud", slug: "oracle-data-cloud" },
  { name: "Experian", slug: "experian" },
  { name: "Equifax", slug: "equifax" },
  { name: "TransUnion", slug: "transunion" },
  { name: "Verisk", slug: "verisk" },
  { name: "CoreLogic", slug: "corelogic" },
];

// ============================================================================
// PRIVACY GUIDES (priority 8)
// ============================================================================
const PRIVACY_TOPICS = [
  // Original 8
  { topic: "Email", slug: "email" },
  { topic: "Phone Number", slug: "phone-number" },
  { topic: "Home Address", slug: "home-address" },
  { topic: "Social Media", slug: "social-media" },
  { topic: "Financial Data", slug: "financial-data" },
  { topic: "Medical Records", slug: "medical-records" },
  { topic: "Children's Online", slug: "childrens-online" },
  { topic: "Work From Home", slug: "work-from-home" },
  // New 12
  { topic: "Smart Home Device", slug: "smart-home-device" },
  { topic: "Location Tracking", slug: "location-tracking" },
  { topic: "Online Shopping", slug: "online-shopping" },
  { topic: "Dating App", slug: "dating-app" },
  { topic: "Job Search", slug: "job-search" },
  { topic: "Browser and Search", slug: "browser-search" },
  { topic: "Cloud Storage", slug: "cloud-storage" },
  { topic: "IoT and Wearable", slug: "iot-wearable" },
  { topic: "Gaming", slug: "gaming" },
  { topic: "Travel and Airline", slug: "travel-airline" },
  { topic: "Real Estate", slug: "real-estate" },
  { topic: "Student and Education", slug: "student-education" },
];

// ============================================================================
// SECURITY THREAT GUIDES (priority 7)
// ============================================================================
const SECURITY_THREATS = [
  // Original 8
  { threat: "Identity Theft", slug: "identity-theft" },
  { threat: "Phishing Attacks", slug: "phishing-attacks" },
  { threat: "SIM Swapping", slug: "sim-swapping" },
  { threat: "Account Takeover", slug: "account-takeover" },
  { threat: "Doxxing", slug: "doxxing" },
  { threat: "Stalking", slug: "stalking" },
  { threat: "Data Breaches", slug: "data-breaches" },
  { threat: "Social Engineering", slug: "social-engineering" },
  // New 8
  { threat: "Credential Stuffing", slug: "credential-stuffing" },
  { threat: "Deepfake Scams", slug: "deepfake-scams" },
  { threat: "Romance Scams", slug: "romance-scams" },
  { threat: "Ransomware", slug: "ransomware" },
  { threat: "Synthetic Identity Fraud", slug: "synthetic-identity-fraud" },
  { threat: "Smishing (SMS Phishing)", slug: "smishing" },
  { threat: "Business Email Compromise", slug: "business-email-compromise" },
  { threat: "AI-Powered Scams", slug: "ai-powered-scams" },
];

// ============================================================================
// DARK WEB GUIDES (priority 9)
// ============================================================================
const DATA_TYPES = [
  // Original 6
  { type: "Email Address", slug: "email-address" },
  { type: "Password", slug: "password" },
  { type: "Credit Card", slug: "credit-card" },
  { type: "Social Security Number", slug: "ssn" },
  { type: "Phone Number", slug: "phone-number" },
  { type: "Personal Information", slug: "personal-info" },
  // New 6
  { type: "Driver's License", slug: "drivers-license" },
  { type: "Medical Records", slug: "medical-records" },
  { type: "Bank Account Details", slug: "bank-account" },
  { type: "Home Address", slug: "home-address" },
  { type: "Login Credentials", slug: "login-credentials" },
  { type: "Tax Return Information", slug: "tax-return" },
];

// ============================================================================
// COMPETITOR COMPARISON ARTICLES (priority 9)
// ============================================================================
const COMPETITORS = [
  { name: "DeleteMe", slug: "deleteme" },
  { name: "Incogni", slug: "incogni" },
  { name: "Optery", slug: "optery" },
  { name: "Kanary", slug: "kanary" },
  { name: "Privacy Duck", slug: "privacy-duck" },
  { name: "Privacy Bee", slug: "privacy-bee" },
  { name: "OneRep", slug: "onerep" },
  { name: "Removaly", slug: "removaly" },
];

// ============================================================================
// STATE PRIVACY GUIDES (priority 8)
// ============================================================================
const STATE_GUIDES = [
  { state: "California", slug: "california", law: "CCPA/CPRA" },
  { state: "Texas", slug: "texas", law: "TDPSA" },
  { state: "New York", slug: "new-york", law: "SHIELD Act" },
  { state: "Florida", slug: "florida", law: "FDBR" },
  { state: "Virginia", slug: "virginia", law: "VCDPA" },
  { state: "Colorado", slug: "colorado", law: "CPA" },
  { state: "Connecticut", slug: "connecticut", law: "CTDPA" },
  { state: "Oregon", slug: "oregon", law: "OCPA" },
  { state: "Montana", slug: "montana", law: "MCDPA" },
  { state: "Utah", slug: "utah", law: "UCPA" },
  { state: "Indiana", slug: "indiana", law: "ICDPA" },
  { state: "Tennessee", slug: "tennessee", law: "TIPA" },
  { state: "Iowa", slug: "iowa", law: "ICDPA" },
  { state: "Delaware", slug: "delaware", law: "DPDPA" },
  { state: "New Jersey", slug: "new-jersey", law: "NJDPA" },
  { state: "Illinois", slug: "illinois", law: "BIPA" },
  { state: "Pennsylvania", slug: "pennsylvania", law: "BIPA" },
  { state: "Georgia", slug: "georgia", law: "Privacy laws" },
  { state: "Ohio", slug: "ohio", law: "Privacy laws" },
  { state: "Washington", slug: "washington", law: "MHPDA" },
];

// ============================================================================
// LEGAL & RIGHTS GUIDES (priority 8)
// ============================================================================
const LEGAL_TOPICS: BlogTopic[] = [
  {
    title: "How to File a CCPA Data Deletion Request: Step-by-Step Guide",
    slug: "how-to-file-ccpa-deletion-request",
    keywords: ["CCPA deletion request", "California data rights", "CCPA opt out", "delete my data California"],
    category: "legal",
    priority: 9,
  },
  {
    title: "GDPR vs CCPA: Which Privacy Law Protects You Better?",
    slug: "gdpr-vs-ccpa-comparison-2026",
    keywords: ["GDPR vs CCPA", "privacy law comparison", "data protection rights", "European vs American privacy"],
    category: "legal",
    priority: 8,
  },
  {
    title: "Your Right to Be Forgotten: How to Exercise It in 2026",
    slug: "right-to-be-forgotten-guide-2026",
    keywords: ["right to be forgotten", "right to erasure", "delete personal data online", "GDPR erasure"],
    category: "legal",
    priority: 9,
  },
  {
    title: "Can Data Brokers Legally Sell Your Information? Here's What the Law Says",
    slug: "can-data-brokers-legally-sell-your-data",
    keywords: ["data broker laws", "is selling personal data legal", "data broker regulations", "privacy law data brokers"],
    category: "legal",
    priority: 9,
  },
  {
    title: "How to Send a Cease and Desist to a Data Broker",
    slug: "cease-and-desist-data-broker-template",
    keywords: ["cease and desist data broker", "data broker letter template", "stop data broker", "legal action data broker"],
    category: "legal",
    priority: 8,
  },
  {
    title: "What Happens When a Data Broker Ignores Your Removal Request",
    slug: "data-broker-ignores-removal-request",
    keywords: ["data broker won't remove data", "data broker ignoring request", "escalate data removal", "report data broker"],
    category: "legal",
    priority: 8,
  },
  {
    title: "Children's Data Privacy: COPPA and Beyond in 2026",
    slug: "childrens-data-privacy-coppa-2026",
    keywords: ["COPPA", "children's privacy online", "kids data protection", "minors data removal"],
    category: "legal",
    priority: 8,
  },
  {
    title: "Data Broker Registration Laws: Which States Require It?",
    slug: "data-broker-registration-laws-by-state",
    keywords: ["data broker registration", "state data broker laws", "California data broker registry", "Vermont data broker"],
    category: "legal",
    priority: 7,
  },
  {
    title: "How to Report a Data Broker to the FTC",
    slug: "how-to-report-data-broker-ftc",
    keywords: ["report data broker FTC", "FTC complaint data broker", "federal data broker complaint", "FTC privacy complaint"],
    category: "legal",
    priority: 7,
  },
  {
    title: "Employee Privacy Rights: Can Your Employer Track Your Data?",
    slug: "employee-privacy-rights-data-tracking",
    keywords: ["employee privacy rights", "employer data tracking", "workplace privacy", "employee monitoring laws"],
    category: "legal",
    priority: 7,
  },
];

// ============================================================================
// HOW-TO GUIDES — actionable content (priority 8-9)
// ============================================================================
const HOW_TO_GUIDES: BlogTopic[] = [
  {
    title: "How to Google Yourself and Find What Data Brokers Have on You",
    slug: "how-to-google-yourself-find-data-brokers",
    keywords: ["google yourself", "find my data online", "what data brokers have on me", "search for personal information"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Remove Your Phone Number from the Internet",
    slug: "remove-phone-number-from-internet",
    keywords: ["remove phone number internet", "delete phone number online", "phone number privacy", "stop spam calls"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Remove Your Home Address from People Search Sites",
    slug: "remove-home-address-people-search-sites",
    keywords: ["remove address internet", "hide home address online", "address privacy", "people search address removal"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Create an Anonymous Email Address in 2026",
    slug: "create-anonymous-email-2026",
    keywords: ["anonymous email", "private email address", "email privacy", "burner email"],
    category: "guide",
    priority: 8,
  },
  {
    title: "How to Remove Old Photos of Yourself from the Internet",
    slug: "remove-old-photos-from-internet",
    keywords: ["remove photos internet", "delete old pictures online", "image removal Google", "right to be forgotten photos"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Complete Guide to Freezing Your Credit at All 3 Bureaus",
    slug: "freeze-credit-all-three-bureaus-guide",
    keywords: ["credit freeze", "freeze credit Equifax", "freeze credit Experian", "credit freeze TransUnion"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Set Up a VPN for Maximum Privacy in 2026",
    slug: "vpn-setup-privacy-guide-2026",
    keywords: ["VPN privacy", "best VPN setup", "VPN guide 2026", "online privacy VPN"],
    category: "guide",
    priority: 7,
  },
  {
    title: "How to Opt Out of Data Broker Sites in Bulk: The Complete Playbook",
    slug: "opt-out-data-brokers-bulk-guide",
    keywords: ["opt out data brokers", "bulk data removal", "remove data all brokers", "data broker opt out list"],
    category: "guide",
    priority: 10,
  },
  {
    title: "How to Lock Down Your Social Media Privacy Settings",
    slug: "lock-down-social-media-privacy-settings",
    keywords: ["social media privacy settings", "Facebook privacy", "Instagram privacy", "lock down social media"],
    category: "guide",
    priority: 8,
  },
  {
    title: "How to Use a Password Manager: Beginner's Guide",
    slug: "password-manager-beginners-guide-2026",
    keywords: ["password manager guide", "best password manager", "how to use password manager", "password security"],
    category: "guide",
    priority: 7,
  },
  {
    title: "How to Check If Your Identity Has Been Stolen",
    slug: "check-if-identity-stolen-signs",
    keywords: ["identity theft signs", "how to check identity theft", "identity stolen what to do", "identity theft detection"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Remove Yourself from Data Broker Sites for Free",
    slug: "remove-from-data-brokers-free",
    keywords: ["free data removal", "remove data brokers free", "opt out free", "DIY data removal"],
    category: "guide",
    priority: 10,
  },
];

// ============================================================================
// TOPIC GENERATION
// ============================================================================

/**
 * Get existing blog post slugs from the blog posts array + DB
 */
export async function getExistingBlogSlugs(): Promise<string[]> {
  try {
    const { getAllSlugs } = await import("@/lib/blog/blog-service");
    return await getAllSlugs();
  } catch (error) {
    console.error("[SEO Agent] Failed to get existing blog slugs:", error);
    return [];
  }
}

/**
 * Generate list of potential blog topics not yet covered
 * Returns 120+ possible topics, filtered by what already exists
 */
export async function generateTopicIdeas(): Promise<BlogTopic[]> {
  const existingSlugs = await getExistingBlogSlugs();
  const existingSet = new Set(existingSlugs);
  const year = new Date().getFullYear();
  const ideas: BlogTopic[] = [];

  function addIfNew(topic: BlogTopic) {
    if (!existingSet.has(topic.slug)) {
      ideas.push(topic);
    }
  }

  // --- Data broker removal guides (50 brokers, priority 10) ---
  for (const broker of DATA_BROKERS) {
    addIfNew({
      title: `How to Remove Yourself from ${broker.name}`,
      slug: `how-to-remove-yourself-from-${broker.slug}`,
      keywords: [
        `remove from ${broker.name.toLowerCase()}`,
        `${broker.name.toLowerCase()} opt out`,
        `delete ${broker.name.toLowerCase()} profile`,
        `${broker.name.toLowerCase()} removal guide`,
      ],
      category: "data-broker",
      priority: 10,
    });
  }

  // --- Competitor comparison articles (priority 9) ---
  for (const comp of COMPETITORS) {
    addIfNew({
      title: `GhostMyData vs ${comp.name}: Which Data Removal Service Is Better?`,
      slug: `ghostmydata-vs-${comp.slug}-comparison`,
      keywords: [
        `ghostmydata vs ${comp.name.toLowerCase()}`,
        `${comp.name.toLowerCase()} alternative`,
        `${comp.name.toLowerCase()} review`,
        `best data removal service`,
      ],
      category: "comparison",
      priority: 9,
    });
  }

  // --- Dark web guides (12 topics, priority 9) ---
  for (const { type, slug: typeSlug } of DATA_TYPES) {
    addIfNew({
      title: `What to Do If Your ${type} Is Found on the Dark Web`,
      slug: `what-to-do-${typeSlug}-dark-web`,
      keywords: [
        `dark web ${type.toLowerCase()}`,
        `${type.toLowerCase()} leaked`,
        `${type.toLowerCase()} breach response`,
      ],
      category: "dark-web",
      priority: 9,
    });
  }

  // --- State privacy guides (20 states, priority 8) ---
  for (const { state, slug: stateSlug, law } of STATE_GUIDES) {
    addIfNew({
      title: `${state} Data Privacy Rights: How to Remove Your Data Under ${law}`,
      slug: `${stateSlug}-data-privacy-rights-${year}`,
      keywords: [
        `${state.toLowerCase()} privacy rights`,
        `${law} data removal`,
        `${state.toLowerCase()} data broker law`,
        `remove data ${state.toLowerCase()}`,
      ],
      category: "state-privacy",
      priority: 8,
    });
  }

  // --- Privacy guides (20 topics, priority 8) ---
  for (const { topic, slug: topicSlug } of PRIVACY_TOPICS) {
    addIfNew({
      title: `Complete Guide to ${topic} Privacy in ${year}`,
      slug: `${topicSlug}-privacy-guide-${year}`,
      keywords: [
        `${topic.toLowerCase()} privacy`,
        `protect ${topic.toLowerCase()}`,
        `${topic.toLowerCase()} security ${year}`,
      ],
      category: "privacy",
      priority: 8,
    });
  }

  // --- Legal guides (10 topics, priority 7-9) ---
  for (const topic of LEGAL_TOPICS) {
    addIfNew(topic);
  }

  // --- How-to guides (12 topics, priority 7-10) ---
  for (const topic of HOW_TO_GUIDES) {
    addIfNew(topic);
  }

  // --- Security threat guides (16 topics, priority 7) ---
  for (const { threat, slug: threatSlug } of SECURITY_THREATS) {
    addIfNew({
      title: `How to Protect Yourself from ${threat}`,
      slug: `protect-yourself-from-${threatSlug}`,
      keywords: [
        `${threat.toLowerCase()} protection`,
        `prevent ${threat.toLowerCase()}`,
        `${threat.toLowerCase()} security`,
      ],
      category: "security",
      priority: 7,
    });
  }

  // Sort by priority (highest first)
  return ideas.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate blog post outline for a topic
 */
export function generateBlogOutline(topic: BlogTopic): string[] {
  const outlines: Record<string, string[]> = {
    "data-broker": [
      "Introduction - What is {source} and why your data is there",
      "Step-by-step removal process",
      "What information {source} collects",
      "How long removal takes",
      "How to verify removal",
      "Preventing future listings",
      "Alternative: Use GhostMyData for automated removal",
    ],
    privacy: [
      "Introduction - Why {topic} privacy matters",
      "Current threats to {topic} privacy",
      "Best practices for protection",
      "Tools and settings to configure",
      "Common mistakes to avoid",
      "How GhostMyData helps protect your {topic}",
    ],
    security: [
      "What is {threat} and how it works",
      "Warning signs to watch for",
      "Immediate steps if you're targeted",
      "Prevention strategies",
      "Tools and services for protection",
      "How GhostMyData monitors for {threat}",
    ],
    "dark-web": [
      "How {data-type} ends up on the dark web",
      "Immediate actions to take",
      "Securing your accounts",
      "Long-term protection measures",
      "Monitoring for future breaches",
      "How GhostMyData's dark web monitoring helps",
    ],
    comparison: [
      "Introduction - Why choosing the right data removal service matters",
      "Feature comparison (broker coverage, speed, automation)",
      "Pricing breakdown",
      "Broker database size comparison",
      "User experience and support",
      "Verdict: Which service is right for you?",
    ],
    "state-privacy": [
      "Overview of privacy laws in this state",
      "Your specific rights under the law",
      "How to exercise your data deletion rights",
      "Which data brokers operate in this state",
      "Step-by-step: Filing a complaint with the AG",
      "How GhostMyData automates removals under this law",
    ],
    legal: [
      "Overview of the legal framework",
      "Who is covered and what's protected",
      "Step-by-step process",
      "Common pitfalls and how to avoid them",
      "Templates and resources",
      "When to seek professional help",
    ],
    guide: [
      "Introduction - Why this matters",
      "Prerequisites and what you'll need",
      "Step-by-step walkthrough",
      "Common mistakes to avoid",
      "Advanced tips",
      "How GhostMyData can help automate this",
    ],
  };

  return outlines[topic.category] || outlines.guide;
}

/**
 * Log generated blog topic to database for review
 */
export async function logBlogIdea(topic: BlogTopic): Promise<void> {
  try {
    console.log(`[SEO Agent] New blog idea: ${topic.title}`);
    console.log(`  - Slug: ${topic.slug}`);
    console.log(`  - Keywords: ${topic.keywords.join(", ")}`);
    console.log(`  - Category: ${topic.category}`);
    console.log(`  - Priority: ${topic.priority}`);
  } catch (error) {
    console.error("[SEO Agent] Failed to log blog idea:", error);
  }
}

/**
 * Get top priority blog topics to generate
 */
export async function getTopBlogIdeas(
  limit: number = 5
): Promise<BlogTopic[]> {
  const ideas = await generateTopicIdeas();
  return ideas.slice(0, limit);
}

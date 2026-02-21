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
  | "legal"
  | "scam"
  | "tool-review"
  | "platform-privacy"
  | "ai-privacy";

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
  // New brokers from Incogni's 85+ list that we don't cover
  { name: "NuMLookup", slug: "numlookup" },
  { name: "VoterRecords", slug: "voterrecords" },
  { name: "PeopleWhiz", slug: "peoplewhiz" },
  { name: "SpyDialer", slug: "spydialer" },
  { name: "411Locate", slug: "411locate" },
  { name: "FastBackgroundCheck", slug: "fastbackgroundcheck" },
  { name: "NeighborWho", slug: "neighborwho" },
  { name: "PrivateRecords.net", slug: "privaterecords" },
  { name: "USAPeopleSearch", slug: "usapeoplesearch" },
  { name: "Innovis", slug: "innovis" },
  { name: "HomeMetry", slug: "homemetry" },
  { name: "BlockShopper", slug: "blockshopper" },
  { name: "GoLookUp", slug: "golookup" },
  { name: "Social Catfish", slug: "social-catfish" },
  { name: "PeopleSearchNow", slug: "peoplesearchnow" },
  { name: "OpenPublicRecords", slug: "openpublicrecords" },
  { name: "NumBerville", slug: "numberville" },
  { name: "SageStream", slug: "sagestream" },
  { name: "Persopo", slug: "persopo" },
  { name: "IDTrue", slug: "idtrue" },
  { name: "InfoTracer", slug: "infotracer" },
  { name: "StateRecords", slug: "staterecords" },
  { name: "OfficialUSA", slug: "officialusa" },
  { name: "TrueCaller", slug: "truecaller" },
  { name: "ArrestFacts", slug: "arrestfacts" },
  { name: "BackgroundAlert", slug: "backgroundalert" },
  { name: "BackgroundCheckRun", slug: "backgroundcheckrun" },
  { name: "RedPlum", slug: "redplum" },
  { name: "PublicDataUSA", slug: "publicdatausa" },
  { name: "Ownerly", slug: "ownerly" },
  { name: "SearchPublicRecords", slug: "searchpublicrecords" },
  { name: "Rehold", slug: "rehold" },
  { name: "OKCaller", slug: "okcaller" },
  { name: "CallTruth", slug: "calltruth" },
  { name: "KiwiSearches", slug: "kiwisearches" },
  { name: "LocatePeople", slug: "locatepeople" },
  { name: "PeopleByName", slug: "peoplebyname" },
  { name: "PublicDataCheck", slug: "publicdatacheck-opt-out" },
];

// ============================================================================
// SCAM & FRAUD ARTICLES (priority 9) — Incogni has 20+ of these
// ============================================================================
const SCAM_ARTICLES: BlogTopic[] = [
  {
    title: "Amazon Scam Texts: How to Spot and Stop Them in 2026",
    slug: "amazon-scam-texts-how-to-spot-stop",
    keywords: ["amazon scam text", "fake amazon text", "amazon text message scam", "amazon order scam"],
    category: "scam",
    priority: 9,
  },
  {
    title: "UPS Text Scam: How to Identify Fake Delivery Notifications",
    slug: "ups-text-scam-fake-delivery-notifications",
    keywords: ["UPS text scam", "fake delivery text", "UPS scam message", "package delivery scam"],
    category: "scam",
    priority: 9,
  },
  {
    title: "PayPal Scams: How to Protect Your Account in 2026",
    slug: "paypal-scams-protect-your-account",
    keywords: ["PayPal scam", "PayPal phishing", "fake PayPal email", "PayPal fraud"],
    category: "scam",
    priority: 9,
  },
  {
    title: "Cash App Scams: The Most Common Schemes and How to Avoid Them",
    slug: "cash-app-scams-how-to-avoid",
    keywords: ["Cash App scam", "Cash App fraud", "fake Cash App payment", "Cash App money flip scam"],
    category: "scam",
    priority: 9,
  },
  {
    title: "Geek Squad Scam Emails: How to Spot Fake Renewal Notices",
    slug: "geek-squad-scam-emails-fake-renewal",
    keywords: ["Geek Squad scam", "fake Geek Squad email", "Geek Squad renewal scam", "Best Buy scam"],
    category: "scam",
    priority: 9,
  },
  {
    title: "Venmo Scams: How to Protect Yourself from Payment Fraud",
    slug: "venmo-scams-protect-payment-fraud",
    keywords: ["Venmo scam", "Venmo phishing", "Venmo fraud", "fake Venmo payment"],
    category: "scam",
    priority: 8,
  },
  {
    title: "Telegram Scams: How to Stay Safe on the Messaging App",
    slug: "telegram-scams-stay-safe",
    keywords: ["Telegram scam", "Telegram fraud", "Telegram phishing", "fake Telegram bot"],
    category: "scam",
    priority: 8,
  },
  {
    title: "Wells Fargo Text Scam: How to Spot Fake Bank Alerts",
    slug: "wells-fargo-text-scam-fake-bank-alerts",
    keywords: ["Wells Fargo scam text", "fake bank text", "bank text scam", "Wells Fargo phishing"],
    category: "scam",
    priority: 8,
  },
  {
    title: "USPS Text Scam: How to Identify Fake Postal Service Messages",
    slug: "usps-text-scam-fake-postal-messages",
    keywords: ["USPS text scam", "USPS fake text", "postal scam text", "fake USPS tracking"],
    category: "scam",
    priority: 8,
  },
  {
    title: "How Scammers Get Your Personal Information (And How to Stop Them)",
    slug: "how-scammers-get-your-personal-information",
    keywords: ["how scammers get info", "scammer personal data", "stop scammers", "protect personal information"],
    category: "scam",
    priority: 10,
  },
  {
    title: "Toll Road Text Scam: How to Spot Fake E-ZPass and SunPass Texts",
    slug: "toll-road-text-scam-ezpass-sunpass",
    keywords: ["toll road scam text", "E-ZPass scam", "SunPass scam", "fake toll text"],
    category: "scam",
    priority: 9,
  },
  {
    title: "Medicare Scam Calls: How to Stop Them for Good",
    slug: "medicare-scam-calls-how-to-stop",
    keywords: ["Medicare scam calls", "stop Medicare calls", "Medicare phone scam", "fake Medicare call"],
    category: "scam",
    priority: 8,
  },
  {
    title: "Snapchat Scams: How to Protect Your Account and Privacy",
    slug: "snapchat-scams-protect-account-privacy",
    keywords: ["Snapchat scam", "Snapchat phishing", "Snapchat hack", "Snapchat fraud"],
    category: "scam",
    priority: 7,
  },
  {
    title: "Health Insurance Scam Calls: How to Stop Them",
    slug: "health-insurance-scam-calls-how-to-stop",
    keywords: ["health insurance scam calls", "stop insurance calls", "fake insurance call", "unwanted health calls"],
    category: "scam",
    priority: 8,
  },
  {
    title: "What to Do If a Scammer Has Your Phone Number",
    slug: "what-to-do-scammer-has-your-phone-number",
    keywords: ["scammer has phone number", "phone number compromised", "scammer phone", "protect phone number"],
    category: "scam",
    priority: 9,
  },
  {
    title: "How to Identify a Fake Text Message (With Examples)",
    slug: "how-to-identify-fake-text-message",
    keywords: ["fake text message", "identify scam text", "smishing examples", "spot fake text"],
    category: "scam",
    priority: 9,
  },
  {
    title: "What Happens If You Answer a Spam Call? Here's the Truth",
    slug: "what-happens-if-you-answer-spam-call",
    keywords: ["answer spam call", "what happens spam call", "robocall danger", "spam call risk"],
    category: "scam",
    priority: 8,
  },
  {
    title: "Number Spoofing: What It Is and How to Stop It",
    slug: "number-spoofing-what-it-is-how-to-stop",
    keywords: ["number spoofing", "caller ID spoofing", "stop spoofed calls", "fake caller ID"],
    category: "scam",
    priority: 8,
  },
];

// ============================================================================
// PLATFORM PRIVACY GUIDES (priority 8) — "How to Make [Platform] Private"
// ============================================================================
const PLATFORM_PRIVACY: BlogTopic[] = [
  {
    title: "How to Make Your Instagram Account Private (Complete Guide)",
    slug: "how-to-make-instagram-private",
    keywords: ["make Instagram private", "Instagram privacy settings", "private Instagram account", "Instagram security"],
    category: "platform-privacy",
    priority: 8,
  },
  {
    title: "How to Make Your Facebook Account Private in 2026",
    slug: "how-to-make-facebook-private",
    keywords: ["make Facebook private", "Facebook privacy settings", "Facebook security", "lock down Facebook"],
    category: "platform-privacy",
    priority: 8,
  },
  {
    title: "How to Make Your X (Twitter) Account Private",
    slug: "how-to-make-twitter-x-private",
    keywords: ["make Twitter private", "X privacy settings", "Twitter security", "protected tweets"],
    category: "platform-privacy",
    priority: 8,
  },
  {
    title: "How to Make Your TikTok Account Private",
    slug: "how-to-make-tiktok-private",
    keywords: ["make TikTok private", "TikTok privacy settings", "TikTok security", "private TikTok"],
    category: "platform-privacy",
    priority: 8,
  },
  {
    title: "How to Make Your LinkedIn Profile Private",
    slug: "how-to-make-linkedin-private",
    keywords: ["LinkedIn private", "LinkedIn privacy settings", "hide LinkedIn profile", "LinkedIn anonymous"],
    category: "platform-privacy",
    priority: 9,
  },
  {
    title: "How to Make Your Venmo Account Private",
    slug: "how-to-make-venmo-private",
    keywords: ["Venmo private", "Venmo privacy settings", "hide Venmo transactions", "Venmo security"],
    category: "platform-privacy",
    priority: 8,
  },
  {
    title: "How to Make Your Snapchat Account Private",
    slug: "how-to-make-snapchat-private",
    keywords: ["Snapchat private", "Snapchat privacy settings", "Snapchat security", "lock Snapchat"],
    category: "platform-privacy",
    priority: 7,
  },
  {
    title: "How to Make Your Pinterest Account Private",
    slug: "how-to-make-pinterest-private",
    keywords: ["Pinterest private", "Pinterest privacy settings", "hide Pinterest profile", "Pinterest security"],
    category: "platform-privacy",
    priority: 7,
  },
  {
    title: "How to Delete Your X (Twitter) Account Permanently",
    slug: "how-to-delete-twitter-x-account",
    keywords: ["delete Twitter account", "delete X account", "deactivate Twitter", "remove Twitter"],
    category: "platform-privacy",
    priority: 8,
  },
  {
    title: "How to Delete Your Gmail Account Without Losing Everything",
    slug: "how-to-delete-gmail-account-safely",
    keywords: ["delete Gmail account", "remove Gmail", "Google account deletion", "Gmail privacy"],
    category: "platform-privacy",
    priority: 8,
  },
];

// ============================================================================
// STOP SPAM GUIDES (priority 9) — High search volume
// ============================================================================
const STOP_SPAM_GUIDES: BlogTopic[] = [
  {
    title: "How to Stop Spam Calls on iPhone (2026 Guide)",
    slug: "how-to-stop-spam-calls-iphone",
    keywords: ["stop spam calls iPhone", "block spam calls iPhone", "iPhone spam filter", "silence unknown callers"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Stop Spam Calls on Android (2026 Guide)",
    slug: "how-to-stop-spam-calls-android",
    keywords: ["stop spam calls Android", "block spam calls Android", "Android call filter", "spam protection Android"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Stop Spam Texts: The Complete 2026 Guide",
    slug: "how-to-stop-spam-texts-complete-guide",
    keywords: ["stop spam texts", "block spam texts", "spam text messages", "unwanted text messages"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Stop Spam Emails in Gmail, Outlook, and Yahoo",
    slug: "how-to-stop-spam-emails-gmail-outlook-yahoo",
    keywords: ["stop spam emails", "block spam Gmail", "spam filter Outlook", "reduce spam"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Stop Junk Mail: Physical Mail Privacy Guide",
    slug: "how-to-stop-junk-mail-physical-privacy",
    keywords: ["stop junk mail", "opt out junk mail", "stop physical spam", "DMAchoice"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Best Free Spam Call Blockers for iPhone in 2026",
    slug: "best-free-spam-call-blockers-iphone",
    keywords: ["spam call blocker iPhone", "free call blocker", "best spam filter iPhone", "block robocalls"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Best Free Spam Call Blockers for Android in 2026",
    slug: "best-free-spam-call-blockers-android",
    keywords: ["spam call blocker Android", "free call blocker Android", "best spam filter Android", "block robocalls Android"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Why Am I Getting So Many Spam Calls? (And How to Stop Them)",
    slug: "why-getting-so-many-spam-calls",
    keywords: ["why spam calls", "too many spam calls", "spam call increase", "random calls"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Block No Caller ID Calls on iPhone",
    slug: "how-to-block-no-caller-id-iphone",
    keywords: ["block no caller ID", "block unknown calls iPhone", "no caller ID block", "silence unknown callers"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Potential Spam Calls: What They Are and How to Handle Them",
    slug: "potential-spam-calls-what-they-are",
    keywords: ["potential spam call", "spam likely call", "scam likely", "spam risk call"],
    category: "guide",
    priority: 8,
  },
];

// ============================================================================
// "WHAT CAN SOMEONE DO" ARTICLES (priority 9) — High search volume
// ============================================================================
const WHAT_SOMEONE_CAN_DO: BlogTopic[] = [
  {
    title: "What Can Someone Do with Your Phone Number? More Than You Think",
    slug: "what-can-someone-do-with-your-phone-number",
    keywords: ["what can someone do phone number", "phone number danger", "phone number exposed", "phone number privacy"],
    category: "security",
    priority: 9,
  },
  {
    title: "What Can Someone Do with Your IP Address?",
    slug: "what-can-someone-do-with-your-ip-address",
    keywords: ["what can someone do IP address", "IP address danger", "IP address exposed", "IP privacy"],
    category: "security",
    priority: 9,
  },
  {
    title: "What Can Someone Do with Your Name and Address?",
    slug: "what-can-someone-do-with-name-and-address",
    keywords: ["what can someone do name address", "name address danger", "doxxing name address", "personal info exposed"],
    category: "security",
    priority: 9,
  },
  {
    title: "What Can Someone Do with Your Email Address?",
    slug: "what-can-someone-do-with-your-email",
    keywords: ["what can someone do email", "email address danger", "email exposed risk", "email privacy"],
    category: "security",
    priority: 9,
  },
  {
    title: "Can Someone Steal Your Identity with Just Your Name and Date of Birth?",
    slug: "can-someone-steal-identity-name-date-of-birth",
    keywords: ["steal identity name DOB", "identity theft birthday", "name and birthday danger", "identity theft risk"],
    category: "security",
    priority: 8,
  },
  {
    title: "What Can Someone Do with Your Social Security Number?",
    slug: "what-can-someone-do-with-your-ssn",
    keywords: ["what can someone do SSN", "SSN stolen", "social security number danger", "SSN identity theft"],
    category: "security",
    priority: 9,
  },
  {
    title: "What If Someone Uses Your Address Without Permission?",
    slug: "someone-uses-your-address-without-permission",
    keywords: ["someone using my address", "address fraud", "unauthorized address use", "mail fraud"],
    category: "security",
    priority: 8,
  },
];

// ============================================================================
// BACKGROUND CHECK GUIDES (priority 8) — Incogni has 6+ of these
// ============================================================================
const BACKGROUND_CHECK_GUIDES: BlogTopic[] = [
  {
    title: "What Shows Up on a Background Check? Complete Breakdown",
    slug: "what-shows-up-on-background-check",
    keywords: ["what shows background check", "background check results", "background check information", "background check records"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Run a Background Check on Yourself (Free and Paid)",
    slug: "how-to-run-background-check-on-yourself",
    keywords: ["background check yourself", "self background check", "check my background", "personal background check"],
    category: "guide",
    priority: 9,
  },
  {
    title: "Incorrect Information on Your Background Check? Here's What to Do",
    slug: "incorrect-information-background-check",
    keywords: ["wrong background check", "incorrect background check", "dispute background check", "background check error"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Can You Pass a Background Check with a Misdemeanor?",
    slug: "pass-background-check-with-misdemeanor",
    keywords: ["background check misdemeanor", "misdemeanor job", "criminal record background", "misdemeanor employment"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Is a Background Check Legal Without Your Permission?",
    slug: "is-background-check-legal-without-permission",
    keywords: ["background check without consent", "unauthorized background check", "background check laws", "FCRA background"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Do Arrests Show Up on Background Checks?",
    slug: "do-arrests-show-up-background-checks",
    keywords: ["arrests background check", "arrest record background", "pending charges background", "arrest vs conviction"],
    category: "guide",
    priority: 8,
  },
];

// ============================================================================
// AI & LLM PRIVACY (priority 9) — Emerging high-value topic
// ============================================================================
const AI_PRIVACY_TOPICS: BlogTopic[] = [
  {
    title: "How to Remove Yourself from OpenAI and Other AI Training Data",
    slug: "remove-yourself-from-openai-ai-training",
    keywords: ["remove from OpenAI", "AI training data opt out", "ChatGPT data removal", "AI privacy"],
    category: "ai-privacy",
    priority: 10,
  },
  {
    title: "Is Your Data Being Used to Train AI? How to Find Out and Opt Out",
    slug: "is-your-data-training-ai-opt-out",
    keywords: ["AI training data", "opt out AI training", "data used by AI", "AI data collection"],
    category: "ai-privacy",
    priority: 9,
  },
  {
    title: "LinkedIn Is Using Your Data to Train AI: How to Opt Out",
    slug: "linkedin-ai-training-opt-out",
    keywords: ["LinkedIn AI training", "LinkedIn data AI", "LinkedIn opt out AI", "LinkedIn privacy"],
    category: "ai-privacy",
    priority: 9,
  },
  {
    title: "AI-Powered Scams in 2026: Deepfakes, Voice Cloning, and How to Protect Yourself",
    slug: "ai-powered-scams-deepfakes-voice-cloning-2026",
    keywords: ["AI scam", "deepfake scam", "voice cloning scam", "AI fraud"],
    category: "ai-privacy",
    priority: 9,
  },
  {
    title: "How Data Brokers Feed AI Systems: The Privacy Risk Nobody's Talking About",
    slug: "data-brokers-feed-ai-systems-privacy-risk",
    keywords: ["data brokers AI", "AI personal data", "data broker AI training", "privacy risk AI"],
    category: "ai-privacy",
    priority: 9,
  },
  {
    title: "The Best AI Privacy Settings to Change Right Now",
    slug: "best-ai-privacy-settings-change-now",
    keywords: ["AI privacy settings", "ChatGPT privacy", "AI data settings", "AI opt out"],
    category: "ai-privacy",
    priority: 8,
  },
  {
    title: "Google AI Overview Is Showing Your Personal Data: Here's What to Do",
    slug: "google-ai-overview-personal-data-what-to-do",
    keywords: ["Google AI overview personal data", "Google AI privacy", "AI search personal info", "Google AI data"],
    category: "ai-privacy",
    priority: 9,
  },
];

// ============================================================================
// REGULATORY & TIMELY CONTENT (priority 10) — High-value topical articles
// ============================================================================
const REGULATORY_TOPICS: BlogTopic[] = [
  {
    title: "California DROP System: The New Delete Request Platform Explained",
    slug: "california-drop-system-delete-request-platform",
    keywords: ["California DROP", "DELETE Act", "California data deletion", "DROP platform data brokers"],
    category: "legal",
    priority: 10,
  },
  {
    title: "New State Privacy Laws in 2026: What You Need to Know",
    slug: "new-state-privacy-laws-2026",
    keywords: ["new privacy laws 2026", "state privacy laws", "data privacy legislation", "privacy law updates"],
    category: "legal",
    priority: 10,
  },
  {
    title: "The FTC's New Rules on Data Brokers: What Changes for You",
    slug: "ftc-new-rules-data-brokers-2026",
    keywords: ["FTC data broker rules", "FTC privacy", "federal data broker regulation", "FTC enforcement"],
    category: "legal",
    priority: 9,
  },
  {
    title: "Is Selling Personal Data Legal? State-by-State Breakdown in 2026",
    slug: "is-selling-personal-data-legal-state-breakdown",
    keywords: ["selling personal data legal", "data broker laws by state", "personal data sale law", "data broker regulation"],
    category: "legal",
    priority: 9,
  },
];

// ============================================================================
// PRIVACY TOOL & BROWSER REVIEWS (priority 7) — Informational traffic
// ============================================================================
const PRIVACY_TOOL_REVIEWS: BlogTopic[] = [
  {
    title: "Best Private Browsers for Privacy in 2026 (Tested & Ranked)",
    slug: "best-private-browsers-privacy-2026",
    keywords: ["best private browser", "privacy browser", "secure browser 2026", "browser privacy"],
    category: "tool-review",
    priority: 8,
  },
  {
    title: "Best Private Search Engines That Don't Track You",
    slug: "best-private-search-engines-no-tracking",
    keywords: ["private search engine", "search engine no tracking", "DuckDuckGo alternative", "private search"],
    category: "tool-review",
    priority: 8,
  },
  {
    title: "Best Disposable Email Services for Privacy in 2026",
    slug: "best-disposable-email-services-privacy",
    keywords: ["disposable email", "temporary email", "burner email service", "anonymous email"],
    category: "tool-review",
    priority: 7,
  },
  {
    title: "Is Private Browsing Really Private? The Truth About Incognito Mode",
    slug: "is-private-browsing-really-private-truth",
    keywords: ["is private browsing private", "incognito mode safe", "private browsing myth", "incognito tracking"],
    category: "tool-review",
    priority: 8,
  },
  {
    title: "Best DNS Services for Privacy and Security in 2026",
    slug: "best-dns-services-privacy-security",
    keywords: ["best DNS privacy", "secure DNS", "DNS over HTTPS", "private DNS service"],
    category: "tool-review",
    priority: 7,
  },
  {
    title: "Is Brave Browser Safe? Complete Privacy Review",
    slug: "is-brave-browser-safe-privacy-review",
    keywords: ["Brave browser safe", "Brave privacy", "Brave browser review", "Brave vs Chrome"],
    category: "tool-review",
    priority: 7,
  },
  {
    title: "ProtonMail Review: Is It Worth Switching for Privacy?",
    slug: "protonmail-review-worth-switching-privacy",
    keywords: ["ProtonMail review", "ProtonMail privacy", "encrypted email", "ProtonMail vs Gmail"],
    category: "tool-review",
    priority: 7,
  },
  {
    title: "Apple Hide My Email: How It Works and How to Use It",
    slug: "apple-hide-my-email-how-it-works",
    keywords: ["Apple Hide My Email", "iCloud email privacy", "Apple email masking", "private email Apple"],
    category: "tool-review",
    priority: 7,
  },
];

// ============================================================================
// COMPETITOR STANDALONE REVIEWS (priority 8) — Capture "X review" searches
// ============================================================================
const COMPETITOR_REVIEWS: BlogTopic[] = [
  {
    title: "DeleteMe Review 2026: Is It Worth $129/Year?",
    slug: "deleteme-review-worth-it-2026",
    keywords: ["DeleteMe review", "DeleteMe worth it", "DeleteMe 2026", "DeleteMe pros cons"],
    category: "comparison",
    priority: 8,
  },
  {
    title: "Incogni Review 2026: Pros, Cons, and Our Honest Take",
    slug: "incogni-review-pros-cons-2026",
    keywords: ["Incogni review", "Incogni worth it", "Incogni 2026", "Incogni pros cons"],
    category: "comparison",
    priority: 8,
  },
  {
    title: "Optery Review 2026: Is the Most Transparent Service the Best?",
    slug: "optery-review-transparent-best-2026",
    keywords: ["Optery review", "Optery worth it", "Optery 2026", "Optery pros cons"],
    category: "comparison",
    priority: 8,
  },
  {
    title: "Kanary Review 2026: Y Combinator Backed but Is It Good?",
    slug: "kanary-review-2026",
    keywords: ["Kanary review", "Kanary worth it", "Kanary 2026", "Kanary data removal"],
    category: "comparison",
    priority: 8,
  },
  {
    title: "OneRep Review 2026: Can You Trust It After the Krebs Investigation?",
    slug: "onerep-review-krebs-investigation-2026",
    keywords: ["OneRep review", "OneRep safe", "OneRep Krebs", "OneRep controversy"],
    category: "comparison",
    priority: 8,
  },
  {
    title: "Aura Review 2026: Data Removal, Identity Theft Protection, and More",
    slug: "aura-review-data-removal-2026",
    keywords: ["Aura review", "Aura data removal", "Aura identity protection", "Aura worth it"],
    category: "comparison",
    priority: 8,
  },
];

// ============================================================================
// COMPREHENSIVE GUIDES — Linkable assets (priority 10)
// ============================================================================
const LINKABLE_ASSET_TOPICS: BlogTopic[] = [
  {
    title: "How to Disappear from the Internet Completely: The Ultimate Guide",
    slug: "how-to-disappear-from-internet-completely",
    keywords: ["disappear from internet", "remove yourself internet", "erase digital footprint", "delete online presence"],
    category: "guide",
    priority: 10,
  },
  {
    title: "The Complete Guide to Removing Your Digital Footprint in 2026",
    slug: "remove-digital-footprint-complete-guide-2026",
    keywords: ["remove digital footprint", "digital footprint removal", "erase digital trail", "online privacy cleanup"],
    category: "guide",
    priority: 10,
  },
  {
    title: "How to Remove Your Personal Information from Google Search Results",
    slug: "remove-personal-information-google-search",
    keywords: ["remove from Google", "Google search removal", "remove personal info Google", "Google privacy"],
    category: "guide",
    priority: 10,
  },
  {
    title: "How Many Times Has Your Name Been Googled? Here's How to Check",
    slug: "how-many-times-name-googled-check",
    keywords: ["name googled how many times", "who googled me", "check if someone googled me", "name search frequency"],
    category: "guide",
    priority: 8,
  },
  {
    title: "How to Remove Mugshots from the Internet (2026 Legal Guide)",
    slug: "remove-mugshots-from-internet-legal-guide",
    keywords: ["remove mugshots", "mugshot removal", "delete mugshot internet", "mugshot websites"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Make Your Phone Number Unsearchable",
    slug: "make-phone-number-unsearchable",
    keywords: ["unsearchable phone number", "hide phone number", "phone number not findable", "phone privacy"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Remove Negative Information About Yourself from the Internet",
    slug: "remove-negative-information-internet",
    keywords: ["remove negative info internet", "delete bad info online", "online reputation repair", "remove negative search results"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Find All Accounts Linked to Your Email Address",
    slug: "find-all-accounts-linked-to-email",
    keywords: ["find accounts linked email", "accounts connected email", "email linked accounts", "find old accounts"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Find Accounts Linked to Your Phone Number",
    slug: "find-accounts-linked-to-phone-number",
    keywords: ["find accounts phone number", "accounts linked phone", "phone number accounts", "find old accounts phone"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Is Doxxing Illegal? The Law in Every US State",
    slug: "is-doxxing-illegal-every-us-state",
    keywords: ["is doxxing illegal", "doxxing laws", "doxxing state law", "doxxing legal consequences"],
    category: "legal",
    priority: 9,
  },
  {
    title: "How to Remove an Image from Google Search Results",
    slug: "remove-image-from-google-search",
    keywords: ["remove image Google", "delete photo Google search", "Google image removal", "remove picture from Google"],
    category: "guide",
    priority: 9,
  },
  {
    title: "How to Make Your Phone Impossible to Track",
    slug: "make-phone-impossible-to-track",
    keywords: ["phone impossible to track", "stop phone tracking", "phone privacy", "prevent phone tracking"],
    category: "guide",
    priority: 8,
  },
  {
    title: "Is Someone Tracking You with an AirTag? How to Find Out",
    slug: "someone-tracking-airtag-how-to-find-out",
    keywords: ["AirTag tracking", "find hidden AirTag", "AirTag stalking", "AirTag detection"],
    category: "security",
    priority: 8,
  },
  {
    title: "No Caller ID vs Unknown Caller: What's the Difference?",
    slug: "no-caller-id-vs-unknown-caller-difference",
    keywords: ["no caller ID vs unknown", "unknown caller meaning", "no caller ID meaning", "blocked number types"],
    category: "guide",
    priority: 7,
  },
];

// ============================================================================
// EMAIL MANAGEMENT GUIDES (priority 7-8) — High search volume
// ============================================================================
const EMAIL_MANAGEMENT: BlogTopic[] = [
  {
    title: "How to Delete All Promotions in Gmail at Once",
    slug: "delete-all-promotions-gmail",
    keywords: ["delete promotions Gmail", "clear Gmail promotions", "bulk delete Gmail", "Gmail cleanup"],
    category: "guide",
    priority: 7,
  },
  {
    title: "How to Unsubscribe from Emails in Bulk on Gmail",
    slug: "unsubscribe-emails-bulk-gmail",
    keywords: ["unsubscribe Gmail bulk", "mass unsubscribe Gmail", "Gmail unsubscribe", "stop email subscriptions"],
    category: "guide",
    priority: 7,
  },
  {
    title: "How to Block an Email Address on Gmail, Outlook, and Yahoo",
    slug: "how-to-block-email-address-all-providers",
    keywords: ["block email address", "block emails Gmail", "block emails Outlook", "block sender"],
    category: "guide",
    priority: 7,
  },
  {
    title: "How to Clear Your Gmail Inbox Fast (2026 Guide)",
    slug: "clear-gmail-inbox-fast-guide",
    keywords: ["clear Gmail inbox", "clean Gmail", "Gmail inbox zero", "organize Gmail"],
    category: "guide",
    priority: 7,
  },
  {
    title: "How to Stop Getting Spam Texts from Email Addresses",
    slug: "stop-spam-texts-from-email-addresses",
    keywords: ["spam texts from email", "stop email spam texts", "email to SMS spam", "block email texts"],
    category: "guide",
    priority: 7,
  },
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
// DATA REMOVAL TIMELINE ARTICLES — Board Meeting Priority 4 (priority 11)
// ============================================================================
const DATA_REMOVAL_TIMELINE_TOPICS: BlogTopic[] = [
  {
    title: "How Long Does Data Removal Actually Take? A Complete Timeline",
    slug: "how-long-data-removal-takes-complete-timeline",
    keywords: ["how long data removal takes", "data removal timeline", "data broker removal time", "opt out how long", "CCPA removal timeline"],
    category: "guide",
    priority: 11,
  },
  {
    title: "Data Broker Response Times: What to Expect After Requesting Removal",
    slug: "data-broker-response-times-what-to-expect",
    keywords: ["data broker response time", "removal request response", "opt out waiting time", "when will my data be removed", "data removal waiting period"],
    category: "guide",
    priority: 11,
  },
  {
    title: "CCPA vs GDPR Removal Timelines: How Fast Must Companies Delete Your Data?",
    slug: "ccpa-vs-gdpr-removal-timelines-comparison",
    keywords: ["CCPA removal timeline", "GDPR deletion timeline", "data deletion deadline", "how fast CCPA removal", "GDPR 30 day rule"],
    category: "legal",
    priority: 11,
  },
  {
    title: "Why Your Data Removal Is Taking So Long (And What We Do About It)",
    slug: "why-data-removal-takes-so-long-what-we-do",
    keywords: ["data removal slow", "why removal takes long", "data broker stalling", "speed up data removal", "removal not working"],
    category: "guide",
    priority: 11,
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

  // --- Data removal timeline articles (4 topics, priority 11) ---
  for (const topic of DATA_REMOVAL_TIMELINE_TOPICS) {
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

  // --- Scam & fraud articles (18 topics, priority 7-10) ---
  for (const topic of SCAM_ARTICLES) {
    addIfNew(topic);
  }

  // --- Platform privacy guides (10 topics, priority 7-9) ---
  for (const topic of PLATFORM_PRIVACY) {
    addIfNew(topic);
  }

  // --- Stop spam guides (10 topics, priority 8-9) ---
  for (const topic of STOP_SPAM_GUIDES) {
    addIfNew(topic);
  }

  // --- "What can someone do" articles (7 topics, priority 8-9) ---
  for (const topic of WHAT_SOMEONE_CAN_DO) {
    addIfNew(topic);
  }

  // --- Background check guides (6 topics, priority 8-9) ---
  for (const topic of BACKGROUND_CHECK_GUIDES) {
    addIfNew(topic);
  }

  // --- AI privacy topics (7 topics, priority 8-10) ---
  for (const topic of AI_PRIVACY_TOPICS) {
    addIfNew(topic);
  }

  // --- Regulatory & timely content (4 topics, priority 9-10) ---
  for (const topic of REGULATORY_TOPICS) {
    addIfNew(topic);
  }

  // --- Privacy tool reviews (8 topics, priority 7-8) ---
  for (const topic of PRIVACY_TOOL_REVIEWS) {
    addIfNew(topic);
  }

  // --- Competitor standalone reviews (6 topics, priority 8) ---
  for (const topic of COMPETITOR_REVIEWS) {
    addIfNew(topic);
  }

  // --- Comprehensive linkable asset guides (14 topics, priority 7-10) ---
  for (const topic of LINKABLE_ASSET_TOPICS) {
    addIfNew(topic);
  }

  // --- Email management guides (5 topics, priority 7) ---
  for (const topic of EMAIL_MANAGEMENT) {
    addIfNew(topic);
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
    scam: [
      "What is this scam and how does it work",
      "Real examples of this scam (with screenshots if possible)",
      "Red flags: How to spot this scam instantly",
      "What to do if you've been targeted",
      "How to report the scam",
      "How to protect yourself going forward (including reducing your data exposure)",
    ],
    "platform-privacy": [
      "Why privacy on this platform matters",
      "Step-by-step: How to change your privacy settings",
      "What each privacy setting actually controls",
      "Hidden settings most people miss",
      "What data this platform still collects even with private settings",
      "How data brokers get your info from social media — and how to stop it",
    ],
    "tool-review": [
      "What this tool/service does and who it's for",
      "Key features and privacy benefits",
      "Limitations and privacy concerns",
      "How to set it up for maximum privacy",
      "Alternatives worth considering",
      "Our verdict: Is it worth using?",
    ],
    "ai-privacy": [
      "How AI systems collect and use your data",
      "Where your data ends up in AI training pipelines",
      "Step-by-step: How to opt out or remove your data",
      "What the law says about AI and your personal data",
      "What's coming next in AI privacy regulation",
      "How GhostMyData monitors for AI-related data exposure",
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
 * Get top priority blog topics to generate.
 * Within each priority tier, topics are shuffled so successive runs
 * try different topics instead of always hitting the same failures.
 */
export async function getTopBlogIdeas(
  limit: number = 5
): Promise<BlogTopic[]> {
  const ideas = await generateTopicIdeas();

  // Group by priority, shuffle within each tier, then flatten
  const byPriority = new Map<number, BlogTopic[]>();
  for (const idea of ideas) {
    const group = byPriority.get(idea.priority) || [];
    group.push(idea);
    byPriority.set(idea.priority, group);
  }

  const shuffled: BlogTopic[] = [];
  const priorities = [...byPriority.keys()].sort((a, b) => b - a); // highest first
  for (const p of priorities) {
    const group = byPriority.get(p)!;
    // Fisher-Yates shuffle within the priority tier
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
    shuffled.push(...group);
  }

  return shuffled.slice(0, limit);
}

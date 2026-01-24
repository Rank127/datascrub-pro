// Data broker contact information for removal requests
// This directory contains opt-out URLs and contact emails for major data brokers

export interface DataBrokerInfo {
  name: string;
  optOutUrl?: string;
  optOutEmail?: string;
  privacyEmail?: string;
  removalMethod: "FORM" | "EMAIL" | "BOTH" | "MONITOR";
  estimatedDays: number; // Estimated time to process removal
  notes?: string;
}

export const DATA_BROKER_DIRECTORY: Record<string, DataBrokerInfo> = {
  // ==========================================
  // MAJOR PEOPLE SEARCH SITES (Tier 1)
  // ==========================================
  SPOKEO: {
    name: "Spokeo",
    optOutUrl: "https://www.spokeo.com/optout",
    optOutEmail: "customercare@spokeo.com",
    privacyEmail: "privacy@spokeo.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
    notes: "Requires verification via email link",
  },
  WHITEPAGES: {
    name: "WhitePages",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    optOutEmail: "support@whitepages.com",
    privacyEmail: "privacy@whitepages.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
    notes: "May require phone verification",
  },
  BEENVERIFIED: {
    name: "BeenVerified",
    optOutUrl: "https://www.beenverified.com/opt-out/",
    optOutEmail: "privacy@beenverified.com",
    privacyEmail: "privacy@beenverified.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  INTELIUS: {
    name: "Intelius",
    optOutUrl: "https://www.intelius.com/optout",
    optOutEmail: "privacy@intelius.com",
    privacyEmail: "privacy@intelius.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEFINDER: {
    name: "PeopleFinder",
    optOutUrl: "https://www.peoplefinder.com/optout",
    privacyEmail: "privacy@peoplefinder.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  TRUEPEOPLESEARCH: {
    name: "TruePeopleSearch",
    optOutUrl: "https://www.truepeoplesearch.com/removal",
    privacyEmail: "privacy@truepeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 1,
    notes: "Usually processes within 24 hours",
  },
  RADARIS: {
    name: "Radaris",
    optOutUrl: "https://radaris.com/control/privacy",
    optOutEmail: "privacy@radaris.com",
    privacyEmail: "privacy@radaris.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "May require multiple follow-ups",
  },
  FASTPEOPLESEARCH: {
    name: "FastPeopleSearch",
    optOutUrl: "https://www.fastpeoplesearch.com/removal",
    privacyEmail: "privacy@fastpeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 1,
    notes: "Automated removal usually quick",
  },
  USSEARCH: {
    name: "USSearch",
    optOutUrl: "https://www.ussearch.com/opt-out/",
    privacyEmail: "privacy@ussearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PIPL: {
    name: "Pipl",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "May require extensive verification",
  },

  // ==========================================
  // PEOPLE SEARCH SITES (Tier 2)
  // ==========================================
  INSTANTCHECKMATE: {
    name: "Instant Checkmate",
    optOutUrl: "https://www.instantcheckmate.com/opt-out/",
    privacyEmail: "privacy@instantcheckmate.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Part of the same network as BeenVerified",
  },
  PEOPLELOOKER: {
    name: "PeopleLooker",
    optOutUrl: "https://www.peoplelooker.com/opt-out",
    privacyEmail: "privacy@peoplelooker.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEFINDERS: {
    name: "PeopleFinders",
    optOutUrl: "https://www.peoplefinders.com/opt-out",
    privacyEmail: "privacy@peoplefinders.com",
    removalMethod: "FORM",
    estimatedDays: 10,
  },
  THATSTHEM: {
    name: "ThatsThem",
    optOutUrl: "https://thatsthem.com/optout",
    privacyEmail: "privacy@thatsthem.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  PUBLICRECORDSNOW: {
    name: "PublicRecordsNow",
    optOutUrl: "https://www.publicrecordsnow.com/optout",
    privacyEmail: "privacy@publicrecordsnow.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FAMILYTREENOW: {
    name: "FamilyTreeNow",
    optOutUrl: "https://www.familytreenow.com/optout",
    privacyEmail: "privacy@familytreenow.com",
    removalMethod: "FORM",
    estimatedDays: 2,
    notes: "Relatively quick removal process",
  },
  MYLIFE: {
    name: "MyLife",
    optOutUrl: "https://www.mylife.com/ccpa/index.pubview",
    optOutEmail: "privacy@mylife.com",
    privacyEmail: "privacy@mylife.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use the CCPA data request form - may require identity verification",
  },
  CLUSTRMAPS: {
    name: "ClustrMaps",
    optOutUrl: "https://clustrmaps.com/bl/opt-out",
    privacyEmail: "privacy@clustrmaps.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  ADDRESSES: {
    name: "Addresses.com",
    optOutUrl: "https://www.addresses.com/optout",
    privacyEmail: "privacy@addresses.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  ADVANCED_PEOPLE_SEARCH: {
    name: "Advanced People Search",
    optOutUrl: "https://www.advancedpeoplesearch.com/optout",
    privacyEmail: "privacy@advancedpeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },

  // ==========================================
  // BACKGROUND CHECK SITES
  // ==========================================
  TRUTHFINDER: {
    name: "TruthFinder",
    optOutUrl: "https://www.truthfinder.com/opt-out/",
    privacyEmail: "privacy@truthfinder.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Requires email confirmation",
  },
  CHECKPEOPLE: {
    name: "CheckPeople",
    optOutUrl: "https://www.checkpeople.com/opt-out",
    privacyEmail: "privacy@checkpeople.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CYBERBACKGROUNDCHECKS: {
    name: "CyberBackgroundChecks",
    optOutUrl: "https://www.cyberbackgroundchecks.com/removal",
    privacyEmail: "support@cyberbackgroundchecks.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  PUBLICDATACHECK: {
    name: "PublicDataCheck",
    optOutUrl: "https://members.publicdatacheck.com/optout",
    privacyEmail: "privacy@publicdatacheck.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SEARCHPEOPLEFREE: {
    name: "SearchPeopleFree",
    optOutUrl: "https://www.searchpeoplefree.com/opt-out",
    privacyEmail: "privacy@searchpeoplefree.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  FREEPEOPLESEARCH: {
    name: "FreePeopleSearch",
    optOutUrl: "https://freepeoplesearch.com/optout",
    privacyEmail: "privacy@freepeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  SEARCHQUARRY: {
    name: "SearchQuarry",
    optOutUrl: "https://www.searchquarry.com/opt-out",
    privacyEmail: "privacy@searchquarry.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // ADDRESS/PHONE LOOKUP SITES
  // ==========================================
  ANYWHO: {
    name: "AnyWho",
    optOutUrl: "https://www.anywho.com/opt-out",
    privacyEmail: "privacy@anywho.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  YELLOWPAGES: {
    name: "YellowPages",
    optOutUrl: "https://www.yellowpages.com/members/suppression",
    privacyEmail: "privacy@yellowpages.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use the suppression request form to remove personal listings",
  },
  INFOSPACE: {
    name: "InfoSpace",
    privacyEmail: "privacy@infospace.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NUWBER: {
    name: "Nuwber",
    optOutUrl: "https://nuwber.com/removal/link",
    privacyEmail: "privacy@nuwber.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  REVERSEPHONELOOKUP: {
    name: "ReversePhoneLookup",
    optOutUrl: "https://www.reversephonelookup.com/remove-listing/",
    privacyEmail: "privacy@reversephonelookup.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  SPYDIALER: {
    name: "SpyDialer",
    optOutUrl: "https://www.spydialer.com/optout.aspx",
    privacyEmail: "privacy@spydialer.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  CALLTRUTH: {
    name: "CallTruth",
    optOutUrl: "https://www.calltruth.com/opt-out",
    privacyEmail: "privacy@calltruth.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  USPHONEBOOK: {
    name: "USPhonebook",
    optOutUrl: "https://www.usphonebook.com/opt-out",
    privacyEmail: "privacy@usphonebook.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },

  // ==========================================
  // PROPERTY/PUBLIC RECORDS SITES
  // ==========================================
  NEIGHBOR_WHO: {
    name: "Neighbor.Who",
    optOutUrl: "https://www.neighborwho.com/removal",
    privacyEmail: "privacy@neighborwho.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  HOMEMETRY: {
    name: "Homemetry",
    optOutUrl: "https://homemetry.com/control/privacy",
    privacyEmail: "privacy@homemetry.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  BLOCKSHOPPER: {
    name: "BlockShopper",
    optOutUrl: "https://blockshopper.com/optout",
    privacyEmail: "privacy@blockshopper.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  OWNERLY: {
    name: "Ownerly",
    optOutUrl: "https://www.ownerly.com/opt-out/",
    privacyEmail: "privacy@ownerly.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  REHOLD: {
    name: "Rehold",
    optOutUrl: "https://rehold.com/optout",
    privacyEmail: "privacy@rehold.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // EMAIL/IDENTITY SEARCH
  // ==========================================
  VOTERRECORDS: {
    name: "VoterRecords",
    optOutUrl: "https://voterrecords.com/opt-out",
    privacyEmail: "privacy@voterrecords.com",
    removalMethod: "FORM",
    estimatedDays: 10,
    notes: "Voter registration records may be public by law in some states",
  },
  EMAILSHERLOCK: {
    name: "EmailSherlock",
    optOutUrl: "https://www.emailsherlock.com/opt-out",
    privacyEmail: "privacy@emailsherlock.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  EMAILFINDER: {
    name: "EmailFinder",
    optOutUrl: "https://www.emailfinder.com/opt-out",
    privacyEmail: "privacy@emailfinder.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  HUNTER_IO: {
    name: "Hunter.io",
    optOutUrl: "https://hunter.io/opt-out",
    privacyEmail: "privacy@hunter.io",
    removalMethod: "FORM",
    estimatedDays: 5,
    notes: "Business email finder - opt out for personal emails",
  },

  // ==========================================
  // PROFESSIONAL/BUSINESS BROKERS
  // ==========================================
  ZOOMINFO: {
    name: "ZoomInfo",
    optOutUrl: "https://www.zoominfo.com/update/remove",
    privacyEmail: "privacy@zoominfo.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "B2B data broker - submit removal request with your email to opt out",
  },
  LUSHA: {
    name: "Lusha",
    optOutUrl: "https://privacy.lusha.com/hc/en-us/requests/new",
    privacyEmail: "privacy@lusha.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Submit a privacy request to remove your data from Lusha",
  },
  APOLLO: {
    name: "Apollo.io",
    optOutUrl: "https://www.apollo.io/privacy-policy/remove-my-information",
    privacyEmail: "privacy@apollo.io",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  ROCKETREACH: {
    name: "RocketReach",
    optOutUrl: "https://rocketreach.co/opt-out",
    privacyEmail: "privacy@rocketreach.co",
    removalMethod: "FORM",
    estimatedDays: 10,
  },
  LEADIQ: {
    name: "LeadIQ",
    optOutUrl: "https://leadiq.com/privacy-center",
    privacyEmail: "privacy@leadiq.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use Privacy Center to submit a data deletion request",
  },
  COGNISM: {
    name: "Cognism",
    optOutUrl: "https://www.cognism.com/do-not-sell-my-data",
    privacyEmail: "privacy@cognism.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CLEARBIT: {
    name: "Clearbit",
    optOutUrl: "https://claim.clearbit.com/claim",
    privacyEmail: "privacy@clearbit.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
    notes: "Use the Clearbit claim form to request data removal",
  },
  FULLCONTACT: {
    name: "FullContact",
    optOutUrl: "https://platform.fullcontact.com/your-privacy-choices",
    privacyEmail: "privacy@fullcontact.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use 'Your Privacy Choices' form to opt out of data collection",
  },

  // ==========================================
  // MARKETING DATA BROKERS
  // ==========================================
  ACXIOM: {
    name: "Acxiom",
    optOutUrl: "https://isapps.acxiom.com/optout/optout.aspx",
    privacyEmail: "privacy@acxiom.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "One of the largest data brokers",
  },
  ORACLE_DATACLOUD: {
    name: "Oracle Data Cloud",
    optOutUrl: "https://www.oracle.com/marketingcloud/opt-status.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Use the Oracle Marketing Cloud opt-out status page to submit removal request",
  },
  EPSILON: {
    name: "Epsilon",
    optOutUrl: "https://www.epsilon.com/us/consumer-preference-center",
    privacyEmail: "privacy@epsilon.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Use the Consumer Preference Center to opt out of marketing data",
  },
  EXPERIAN_MARKETING: {
    name: "Experian Marketing",
    optOutUrl: "https://www.experian.com/privacy/opt-out-form",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EQUIFAX_MARKETING: {
    name: "Equifax Marketing",
    optOutUrl: "https://myprivacy.equifax.com/personal-info",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Use MyPrivacy portal to opt out of Equifax marketing",
  },
  LEXISNEXIS: {
    name: "LexisNexis",
    optOutUrl: "https://optout.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Large data aggregator - comprehensive removal available",
  },

  // ==========================================
  // BREACH DATABASES
  // ==========================================
  HAVEIBEENPWNED: {
    name: "Have I Been Pwned",
    privacyEmail: "support@haveibeenpwned.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "HIBP does not remove data - they document breaches. The breach data exists at the original source.",
  },
  DEHASHED: {
    name: "DeHashed",
    optOutUrl: "https://www.dehashed.com/remove",
    privacyEmail: "support@dehashed.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  LEAKCHECK: {
    name: "LeakCheck",
    optOutUrl: "https://leakcheck.io/removal",
    privacyEmail: "support@leakcheck.io",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SNUSBASE: {
    name: "Snusbase",
    privacyEmail: "support@snusbase.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // ==========================================
  // SOCIAL MEDIA (Mostly Manual)
  // ==========================================
  LINKEDIN: {
    name: "LinkedIn",
    optOutUrl: "https://www.linkedin.com/help/linkedin/answer/63",
    privacyEmail: "privacy@linkedin.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Account must be deleted manually through settings",
  },
  FACEBOOK: {
    name: "Facebook",
    optOutUrl: "https://www.facebook.com/help/delete_account",
    privacyEmail: "privacy@fb.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Account deletion requires 30-day waiting period",
  },
  TWITTER: {
    name: "Twitter/X",
    optOutUrl: "https://twitter.com/settings/deactivate",
    privacyEmail: "privacy@twitter.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Deactivation required before permanent deletion",
  },
  INSTAGRAM: {
    name: "Instagram",
    optOutUrl: "https://www.instagram.com/accounts/remove/request/permanent/",
    privacyEmail: "privacy@instagram.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TIKTOK: {
    name: "TikTok",
    optOutUrl: "https://www.tiktok.com/setting/account",
    privacyEmail: "privacy@tiktok.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  REDDIT: {
    name: "Reddit",
    optOutUrl: "https://www.reddit.com/settings/account",
    privacyEmail: "privacy@reddit.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PINTEREST: {
    name: "Pinterest",
    optOutUrl: "https://www.pinterest.com/settings/privacy/",
    privacyEmail: "privacy@pinterest.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YOUTUBE: {
    name: "YouTube",
    optOutUrl: "https://support.google.com/accounts/answer/32046",
    privacyEmail: "privacy@google.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Requires deleting Google account or removing YouTube data specifically",
  },
  SNAPCHAT: {
    name: "Snapchat",
    optOutUrl: "https://accounts.snapchat.com/accounts/delete_account",
    privacyEmail: "privacy@snap.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DISCORD: {
    name: "Discord",
    optOutUrl: "https://support.discord.com/hc/en-us/articles/212500837",
    privacyEmail: "privacy@discord.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // AI TRAINING & DEEPFAKE PROTECTION
  // ==========================================
  LAION_AI: {
    name: "LAION AI Dataset",
    optOutUrl: "https://haveibeentrained.com/",
    privacyEmail: "contact@laion.ai",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Check if your images are in LAION-5B dataset used to train Stable Diffusion and other AI models",
  },
  STABILITY_AI: {
    name: "Stability AI",
    optOutUrl: "https://stability.ai/opt-out",
    privacyEmail: "legal@stability.ai",
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Opt out of Stable Diffusion training - honors Spawning Do Not Train registry",
  },
  OPENAI: {
    name: "OpenAI",
    optOutUrl: "https://privacy.openai.com/policies",
    privacyEmail: "privacy@openai.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Request data deletion and opt out of training via privacy portal",
  },
  MIDJOURNEY: {
    name: "Midjourney",
    optOutUrl: "https://docs.midjourney.com/docs/terms-of-service",
    privacyEmail: "privacy@midjourney.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Contact support to opt out of image training",
  },
  META_AI: {
    name: "Meta AI",
    optOutUrl: "https://www.facebook.com/help/contact/540404257914453",
    privacyEmail: "privacy@fb.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Opt out of Meta AI training for Facebook and Instagram data",
  },
  GOOGLE_AI: {
    name: "Google AI Training",
    optOutUrl: "https://myaccount.google.com/data-and-privacy",
    privacyEmail: "privacy@google.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Manage AI training settings in Google account privacy settings",
  },
  LINKEDIN_AI: {
    name: "LinkedIn AI Training",
    optOutUrl: "https://www.linkedin.com/mypreferences/d/settings/data-for-generative-ai-improvement",
    privacyEmail: "privacy@linkedin.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Opt out of LinkedIn using your data for AI training",
  },
  ADOBE_AI: {
    name: "Adobe Firefly/AI",
    optOutUrl: "https://www.adobe.com/go/privacy_your_choices",
    privacyEmail: "privacy@adobe.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Only analyzes content submitted to Adobe Stock - opt out via privacy page",
  },
  AMAZON_AI: {
    name: "Amazon AI Training",
    optOutUrl: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GXPU3YPMBZQRWZK2",
    privacyEmail: "privacy@amazon.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Opt out of Amazon using your data for AI improvements",
  },

  // ==========================================
  // FACIAL RECOGNITION DATABASES
  // ==========================================
  CLEARVIEW_AI: {
    name: "Clearview AI",
    optOutUrl: "https://clearview.ai/privacy/requests",
    privacyEmail: "privacy@clearview.ai",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Large facial recognition database used by law enforcement - opt out removes your face from searches",
  },
  PIMEYES: {
    name: "PimEyes",
    optOutUrl: "https://pimeyes.com/en/opt-out-request",
    privacyEmail: "privacy@pimeyes.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Face search engine - submit opt-out to remove your face from search results",
  },
  FACECHECK_ID: {
    name: "FaceCheck.ID",
    optOutUrl: "https://facecheck.id/fc/optout",
    privacyEmail: "support@facecheck.id",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Facial recognition search engine - opt out to prevent face matching",
  },
  SOCIAL_CATFISH: {
    name: "Social Catfish",
    optOutUrl: "https://socialcatfish.com/opt-out/",
    privacyEmail: "privacy@socialcatfish.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Reverse image and identity search - includes facial recognition",
  },
  TINEYE: {
    name: "TinEye",
    optOutUrl: "https://tineye.com/removal",
    privacyEmail: "support@tineye.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Reverse image search engine - can request image removal",
  },
  YANDEX_IMAGES: {
    name: "Yandex Images",
    optOutUrl: "https://yandex.com/support/images/troubleshooting.html",
    privacyEmail: "privacy@support.yandex.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Yandex reverse image search - request removal via support",
  },

  // ==========================================
  // AI VOICE CLONING PROTECTION
  // ==========================================
  ELEVENLABS: {
    name: "ElevenLabs",
    optOutUrl: "https://elevenlabs.io/privacy",
    privacyEmail: "privacy@elevenlabs.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "AI voice cloning service - request voice sample removal",
  },
  RESEMBLE_AI: {
    name: "Resemble AI",
    optOutUrl: "https://www.resemble.ai/privacy",
    privacyEmail: "privacy@resemble.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Voice cloning platform - contact for voice data removal",
  },
  MURF_AI: {
    name: "Murf AI",
    optOutUrl: "https://murf.ai/privacy",
    privacyEmail: "privacy@murf.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "AI voice generator - opt out of voice training",
  },

  // ==========================================
  // ADDITIONAL PEOPLE SEARCH SITES
  // ==========================================
  ZABASEARCH: {
    name: "ZabaSearch",
    optOutUrl: "https://www.zabasearch.com/block_records/",
    privacyEmail: "privacy@zabasearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Free people search - requires verification",
  },
  PEEKYOU: {
    name: "PeekYou",
    optOutUrl: "https://www.peekyou.com/about/contact/optout/",
    privacyEmail: "privacy@peekyou.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  BEEN_VERIFIED_PEOPLE: {
    name: "Been Verified People Search",
    optOutUrl: "https://www.beenverifiedpeople.com/optout",
    privacyEmail: "privacy@beenverifiedpeople.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PUBLICRECORDS360: {
    name: "PublicRecords360",
    optOutUrl: "https://www.publicrecords360.com/optout.html",
    privacyEmail: "privacy@publicrecords360.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PERSOPO: {
    name: "Persopo",
    optOutUrl: "https://www.persopo.com/opt-out",
    privacyEmail: "privacy@persopo.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SMARTBACKGROUNDCHECKS: {
    name: "Smart Background Checks",
    optOutUrl: "https://www.smartbackgroundchecks.com/optout",
    privacyEmail: "privacy@smartbackgroundchecks.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  LOCATEFAMILY: {
    name: "LocateFamily",
    optOutUrl: "https://www.locatefamily.com/removal.html",
    privacyEmail: "privacy@locatefamily.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEWISE: {
    name: "PeopleWise",
    optOutUrl: "https://www.peoplewise.com/optout",
    privacyEmail: "privacy@peoplewise.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLESEARCHNOW: {
    name: "PeopleSearchNow",
    optOutUrl: "https://www.peoplesearchnow.com/opt-out",
    privacyEmail: "privacy@peoplesearchnow.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  PEOPLEBYNAME: {
    name: "PeopleByName",
    optOutUrl: "https://www.peoplebyname.com/remove.php",
    privacyEmail: "privacy@peoplebyname.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  VIRTORY: {
    name: "Virtory",
    optOutUrl: "https://www.virtory.com/opt-out",
    privacyEmail: "privacy@virtory.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  VERICORA: {
    name: "Vericora",
    optOutUrl: "https://vericora.com/ng/optout",
    privacyEmail: "privacy@vericora.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  GLADIKNOW: {
    name: "GladIKnow",
    optOutUrl: "https://gladiknow.com/opt-out",
    privacyEmail: "privacy@gladiknow.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  IDENTITYPI: {
    name: "IdentityPI",
    optOutUrl: "https://www.identitypi.com/optout",
    privacyEmail: "privacy@identitypi.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  QUICKPEOPLETRACE: {
    name: "QuickPeopleTrace",
    optOutUrl: "https://www.quickpeopletrace.com/optout",
    privacyEmail: "privacy@quickpeopletrace.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // COURT RECORDS & LEGAL
  // ==========================================
  JUDYRECORDS: {
    name: "JudyRecords",
    optOutUrl: "https://www.judyrecords.com/record-removal",
    privacyEmail: "privacy@judyrecords.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Court records search - removal may be limited by public records laws",
  },
  UNICOURT: {
    name: "UniCourt",
    optOutUrl: "https://unicourt.com/removal-request",
    privacyEmail: "privacy@unicourt.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Legal data platform - requires identity verification",
  },
  COURTRECORDS_ORG: {
    name: "CourtRecords.org",
    optOutUrl: "https://courtrecords.org/optout",
    privacyEmail: "privacy@courtrecords.org",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  ARRESTFACTS: {
    name: "ArrestFacts",
    optOutUrl: "https://arrestfacts.com/ng/control/privacy",
    privacyEmail: "privacy@arrestfacts.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CRIMINALSEARCHES: {
    name: "CriminalSearches",
    optOutUrl: "https://www.criminalsearches.com/optout",
    privacyEmail: "privacy@criminalsearches.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  MUGSHOTS_COM: {
    name: "Mugshots.com",
    optOutUrl: "https://www.mugshots.com/removal.html",
    privacyEmail: "removal@mugshots.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "May require payment for expedited removal",
  },
  INSTANTARREST: {
    name: "InstantArrest",
    optOutUrl: "https://www.instantarrest.com/optout",
    privacyEmail: "privacy@instantarrest.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PUBLICPOLICERECORD: {
    name: "PublicPoliceRecord",
    optOutUrl: "https://publicpolicerecord.com/optout",
    privacyEmail: "privacy@publicpolicerecord.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // REAL ESTATE & PROPERTY RECORDS
  // ==========================================
  PROPERTYSHARK: {
    name: "PropertyShark",
    optOutUrl: "https://www.propertyshark.com/mason/info/Opt-Out",
    privacyEmail: "privacy@propertyshark.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ZILLOW: {
    name: "Zillow",
    optOutUrl: "https://www.zillow.com/z/data-privacy/",
    privacyEmail: "privacy@zillow.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Remove owner info from property listings",
  },
  REDFIN: {
    name: "Redfin",
    optOutUrl: "https://www.redfin.com/about/privacy-policy",
    privacyEmail: "privacy@redfin.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALTOR_COM: {
    name: "Realtor.com",
    optOutUrl: "https://www.realtor.com/privacy-notice/",
    privacyEmail: "privacy@realtor.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRULIA: {
    name: "Trulia",
    optOutUrl: "https://www.trulia.com/privacy",
    privacyEmail: "privacy@trulia.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOUSEVALUES: {
    name: "HouseValues",
    optOutUrl: "https://www.housevalues.com/optout",
    privacyEmail: "privacy@housevalues.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  ADDRESSREPORT: {
    name: "AddressReport",
    optOutUrl: "https://www.addressreport.com/removal",
    privacyEmail: "privacy@addressreport.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  LANDWATCH: {
    name: "LandWatch",
    optOutUrl: "https://www.landwatch.com/privacy",
    privacyEmail: "privacy@landwatch.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // BUSINESS & PROFESSIONAL DATA
  // ==========================================
  SEAMLESS_AI: {
    name: "Seamless.AI",
    optOutUrl: "https://www.seamless.ai/privacy-policy",
    privacyEmail: "privacy@seamless.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DATANYZE: {
    name: "Datanyze",
    optOutUrl: "https://www.datanyze.com/privacy-policy",
    privacyEmail: "privacy@datanyze.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UPLEAD: {
    name: "UpLead",
    optOutUrl: "https://www.uplead.com/privacy-policy/",
    privacyEmail: "privacy@uplead.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SNOV_IO: {
    name: "Snov.io",
    optOutUrl: "https://snov.io/privacy-policy",
    privacyEmail: "gdpr@snov.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FINDTHATLEADS: {
    name: "FindThatLead",
    optOutUrl: "https://findthatlead.com/en/privacy",
    privacyEmail: "privacy@findthatlead.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  VOILANORBERT: {
    name: "VoilaNorbert",
    optOutUrl: "https://www.voilanorbert.com/privacy",
    privacyEmail: "privacy@voilanorbert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ADAPT_IO: {
    name: "Adapt.io",
    optOutUrl: "https://adapt.io/privacy-policy",
    privacyEmail: "privacy@adapt.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CONTACTOUT: {
    name: "ContactOut",
    optOutUrl: "https://contactout.com/optout",
    privacyEmail: "privacy@contactout.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SIGNALHIRE: {
    name: "SignalHire",
    optOutUrl: "https://www.signalhire.com/privacy-policy",
    privacyEmail: "privacy@signalhire.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WIZA: {
    name: "Wiza",
    optOutUrl: "https://wiza.co/privacy-policy",
    privacyEmail: "privacy@wiza.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  OVERLOOP: {
    name: "Overloop",
    optOutUrl: "https://overloop.com/privacy-policy",
    privacyEmail: "privacy@overloop.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SALESLOFT: {
    name: "SalesLoft",
    optOutUrl: "https://salesloft.com/privacy-notice/",
    privacyEmail: "privacy@salesloft.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  AEROLEADS: {
    name: "AeroLeads",
    optOutUrl: "https://aeroleads.com/privacy-policy",
    privacyEmail: "privacy@aeroleads.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GETPROSPECT: {
    name: "GetProspect",
    optOutUrl: "https://getprospect.com/privacy-policy",
    privacyEmail: "privacy@getprospect.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // PHONE & ADDRESS LOOKUP
  // ==========================================
  WHITEPAGES_PREMIUM: {
    name: "WhitePages Premium",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    privacyEmail: "privacy@whitepages.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PHONEBOOKS_COM: {
    name: "PhoneBooks.com",
    optOutUrl: "https://www.phonebooks.com/optout",
    privacyEmail: "privacy@phonebooks.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  ADDRESSES_COM: {
    name: "Addresses.com",
    optOutUrl: "https://www.addresses.com/optout.php",
    privacyEmail: "privacy@addresses.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  PHONELOOKUP: {
    name: "PhoneLookup",
    optOutUrl: "https://www.phonelookup.com/opt-out",
    privacyEmail: "privacy@phonelookup.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  PHONEOWNER: {
    name: "PhoneOwner",
    optOutUrl: "https://phoneowner.com/page/optout",
    privacyEmail: "privacy@phoneowner.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  SYNC_ME: {
    name: "Sync.ME",
    optOutUrl: "https://sync.me/optout/",
    privacyEmail: "privacy@sync.me",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Caller ID and spam blocking app - remove your info",
  },
  HIYA: {
    name: "Hiya",
    optOutUrl: "https://hiya.com/optout",
    privacyEmail: "privacy@hiya.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  TRUECALLER: {
    name: "Truecaller",
    optOutUrl: "https://www.truecaller.com/unlisting",
    privacyEmail: "privacy@truecaller.com",
    removalMethod: "FORM",
    estimatedDays: 1,
    notes: "Unlist from Truecaller directory - usually instant",
  },
  MR_NUMBER: {
    name: "Mr. Number",
    optOutUrl: "https://mrnumber.com/remove",
    privacyEmail: "privacy@mrnumber.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLERIDTEST: {
    name: "CallerIDTest",
    optOutUrl: "https://calleridtest.com/opt-out",
    privacyEmail: "privacy@calleridtest.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  OLDPHONEBOOK: {
    name: "OldPhoneBook",
    optOutUrl: "https://www.oldphonebook.com/opt-out",
    privacyEmail: "privacy@oldphonebook.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MARKETING & ADVERTISING DATA
  // ==========================================
  LIVERAMP: {
    name: "LiveRamp",
    optOutUrl: "https://liveramp.com/opt_out/",
    privacyEmail: "privacy@liveramp.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Major data broker for advertising - opt out of identity graph",
  },
  TAPAD: {
    name: "Tapad",
    optOutUrl: "https://www.tapad.com/privacy-policy",
    privacyEmail: "privacy@tapad.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  NEUSTAR: {
    name: "Neustar",
    optOutUrl: "https://www.home.neustar/privacy/opt-out",
    privacyEmail: "privacy@team.neustar",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  NIELSEN: {
    name: "Nielsen",
    optOutUrl: "https://www.nielsen.com/us/en/legal/privacy-statement/digital-measurement-privacy-statement/",
    privacyEmail: "privacy.department@nielsen.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
  },
  LOTAME: {
    name: "Lotame",
    optOutUrl: "https://www.lotame.com/about-lotame/privacy/opt-out/",
    privacyEmail: "privacy@lotame.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DATALOGIX: {
    name: "Datalogix (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  BLUEKAI: {
    name: "BlueKai (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  INFOGROUP: {
    name: "Infogroup (Data.com)",
    optOutUrl: "https://www.infogroup.com/privacy-policy",
    privacyEmail: "privacy@infogroup.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRANSUNION: {
    name: "TransUnion Marketing",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  COMSCORE: {
    name: "comScore",
    optOutUrl: "https://www.comscore.com/About/Privacy-Policy",
    privacyEmail: "privacy@comscore.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // DATING & RELATIONSHIP SEARCH
  // ==========================================
  DATING_BACKGROUND: {
    name: "DatingBackground",
    optOutUrl: "https://www.datingbackground.com/opt-out",
    privacyEmail: "privacy@datingbackground.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  MATCHDOTCOM_LOOKUP: {
    name: "Match.com Background Check",
    optOutUrl: "https://www.match.com/help/privacy.aspx",
    privacyEmail: "privacy@match.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DATESEARCHSITE: {
    name: "DateSearchSite",
    optOutUrl: "https://www.datesearchsite.com/optout",
    privacyEmail: "privacy@datesearchsite.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  ROMANCESCAMS: {
    name: "RomanceScams",
    optOutUrl: "https://romancescams.org/removal",
    privacyEmail: "privacy@romancescams.org",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // FINANCIAL & INSURANCE DATA
  // ==========================================
  EXPERIAN_CONSUMER: {
    name: "Experian Consumer",
    optOutUrl: "https://www.experian.com/privacy/opt-out-form",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EQUIFAX_CONSUMER: {
    name: "Equifax Consumer",
    optOutUrl: "https://myprivacy.equifax.com/personal-info",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TRANSUNION_CONSUMER: {
    name: "TransUnion Consumer",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CHEXSYSTEMS: {
    name: "ChexSystems",
    optOutUrl: "https://www.chexsystems.com/security-freeze",
    privacyEmail: "privacy@fnis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  INNOVIS: {
    name: "Innovis",
    optOutUrl: "https://www.innovis.com/securityFreeze/index",
    privacyEmail: "privacy@innovis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  NCTUE: {
    name: "NCTUE",
    optOutUrl: "https://www.nctue.com/Consumers",
    privacyEmail: "privacy@nctue.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "National Consumer Telecom & Utilities Exchange",
  },
  SAGESTREAM: {
    name: "SageStream",
    optOutUrl: "https://www.sagestreamllc.com/",
    privacyEmail: "privacy@sagestreamllc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // VEHICLE & DRIVING RECORDS
  // ==========================================
  VEHICLEHISTORY: {
    name: "VehicleHistory.com",
    optOutUrl: "https://www.vehiclehistory.com/privacy-policy",
    privacyEmail: "privacy@vehiclehistory.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CARFAX: {
    name: "CARFAX",
    optOutUrl: "https://www.carfax.com/company/privacy-policy",
    privacyEmail: "privacy@carfax.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  AUTOCHECK: {
    name: "AutoCheck",
    optOutUrl: "https://www.autocheck.com/consumers/privacy",
    privacyEmail: "privacy@experian.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DRIVINGRECORDS: {
    name: "DrivingRecords",
    optOutUrl: "https://www.drivingrecords.com/optout",
    privacyEmail: "privacy@drivingrecords.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // GENEALOGY & FAMILY HISTORY
  // ==========================================
  ANCESTRY: {
    name: "Ancestry",
    optOutUrl: "https://support.ancestry.com/s/article/Removing-Public-Records-from-Ancestry",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Request removal of public records from Ancestry.com",
  },
  MYHERITAGE: {
    name: "MyHeritage",
    optOutUrl: "https://www.myheritage.com/privacy-policy",
    privacyEmail: "privacy@myheritage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  FINDAGRAVE: {
    name: "FindAGrave",
    optOutUrl: "https://www.findagrave.com/cgi-bin/fg.cgi?page=privacyPolicy",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BILLIONGRAVES: {
    name: "BillionGraves",
    optOutUrl: "https://billiongraves.com/privacy",
    privacyEmail: "privacy@billiongraves.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ARCHIVES_COM: {
    name: "Archives.com",
    optOutUrl: "https://www.archives.com/privacy",
    privacyEmail: "privacy@archives.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GENEALOGYBANK: {
    name: "GenealogyBank",
    optOutUrl: "https://www.genealogybank.com/privacy",
    privacyEmail: "privacy@genealogybank.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEWSPAPERS_COM: {
    name: "Newspapers.com",
    optOutUrl: "https://www.newspapers.com/privacy",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // INTERNATIONAL DATA BROKERS
  // ==========================================
  CANADA411: {
    name: "Canada411",
    optOutUrl: "https://www.canada411.ca/privacy/",
    privacyEmail: "privacy@yp.ca",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Canadian phone directory",
  },
  UK_192: {
    name: "192.com (UK)",
    optOutUrl: "https://www.192.com/optout/",
    privacyEmail: "dataprotection@192.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "UK people search and electoral roll",
  },
  INFOBEL: {
    name: "Infobel (International)",
    optOutUrl: "https://www.infobel.com/en/privacy",
    privacyEmail: "privacy@infobel.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "International phone directory",
  },
  YASNI: {
    name: "Yasni (Germany)",
    optOutUrl: "https://www.yasni.de/opt-out",
    privacyEmail: "privacy@yasni.de",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "German people search engine",
  },
  WEBMII: {
    name: "WebMii",
    optOutUrl: "https://webmii.com/privacy",
    privacyEmail: "privacy@webmii.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PIPL_UK: {
    name: "Pipl UK",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  FOREBEARS: {
    name: "Forebears",
    optOutUrl: "https://forebears.io/privacy",
    privacyEmail: "privacy@forebears.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Surname and genealogy database",
  },

  // ==========================================
  // EDUCATIONAL & PROFESSIONAL LICENSES
  // ==========================================
  NATIONAL_STUDENT_CLEARINGHOUSE: {
    name: "National Student Clearinghouse",
    optOutUrl: "https://www.studentclearinghouse.org/students/optional-block-request/",
    privacyEmail: "privacy@studentclearinghouse.org",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Educational record database",
  },
  VERIFYED: {
    name: "VerifyEd",
    optOutUrl: "https://www.verifyed.io/privacy",
    privacyEmail: "privacy@verifyed.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LICENSE_LOOKUP: {
    name: "LicenseLookup",
    optOutUrl: "https://www.licenselookup.com/optout",
    privacyEmail: "privacy@licenselookup.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // HEALTHCARE DATA
  // ==========================================
  HEALTHGRADES: {
    name: "Healthgrades",
    optOutUrl: "https://www.healthgrades.com/content/patient-rights",
    privacyEmail: "privacy@healthgrades.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Doctor reviews and healthcare provider info",
  },
  VITALS: {
    name: "Vitals",
    optOutUrl: "https://www.vitals.com/privacy",
    privacyEmail: "privacy@vitals.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ZOCDOC: {
    name: "Zocdoc",
    optOutUrl: "https://www.zocdoc.com/about/privacypolicy",
    privacyEmail: "privacy@zocdoc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DOXIMITY: {
    name: "Doximity",
    optOutUrl: "https://www.doximity.com/privacy",
    privacyEmail: "privacy@doximity.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Physician network",
  },
  NPPES: {
    name: "NPPES (NPI Registry)",
    optOutUrl: "https://nppes.cms.hhs.gov/",
    privacyEmail: "customerservice@nppes.cms.hhs.gov",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "National Provider Identifier - medical provider registry",
  },

  // ==========================================
  // LOCATION & TRACKING
  // ==========================================
  FOURSQUARE: {
    name: "Foursquare",
    optOutUrl: "https://foursquare.com/legal/privacy",
    privacyEmail: "privacy@foursquare.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SAFEGRAPH: {
    name: "SafeGraph",
    optOutUrl: "https://www.safegraph.com/privacy-policy",
    privacyEmail: "privacy@safegraph.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Location data broker",
  },
  MOBILEWALLA: {
    name: "Mobilewalla",
    optOutUrl: "https://www.mobilewalla.com/privacy-policy",
    privacyEmail: "privacy@mobilewalla.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Mobile device and location data",
  },
  XMODE: {
    name: "X-Mode (Outlogic)",
    optOutUrl: "https://www.outlogic.io/privacy-policy",
    privacyEmail: "privacy@outlogic.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  GRAVY_ANALYTICS: {
    name: "Gravy Analytics",
    optOutUrl: "https://gravyanalytics.com/privacy/",
    privacyEmail: "privacy@gravyanalytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PLACER_AI: {
    name: "Placer.ai",
    optOutUrl: "https://www.placer.ai/privacy-policy",
    privacyEmail: "privacy@placer.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // ADDITIONAL REQUESTED BROKERS
  // ==========================================
  OURSTATES: {
    name: "OurStates.org",
    optOutUrl: "https://ourstates.org/optout",
    privacyEmail: "privacy@ourstates.org",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "State records aggregator - opt out to remove your listing",
  },
  IDCRAWL: {
    name: "IDCrawl",
    optOutUrl: "https://www.idcrawl.com/opt-out",
    privacyEmail: "privacy@idcrawl.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Free people search engine - request removal via opt-out form",
  },
  REALTYHOP: {
    name: "RealtyHop",
    optOutUrl: "https://www.realtyhop.com/privacy",
    privacyEmail: "privacy@realtyhop.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Real estate platform - request removal of owner information",
  },
  SHOWCASE: {
    name: "Showcase.com",
    optOutUrl: "https://www.showcase.com/privacy",
    privacyEmail: "privacy@showcase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Real estate listings - request owner info removal",
  },

  // ==========================================
  // MORE PEOPLE SEARCH SITES
  // ==========================================
  INFOFREE: {
    name: "InfoFree",
    optOutUrl: "https://www.infofree.com/opt-out",
    privacyEmail: "privacy@infofree.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CENTEDA: {
    name: "Centeda",
    optOutUrl: "https://centeda.com/ng/control/privacy",
    privacyEmail: "privacy@centeda.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CUBIB: {
    name: "Cubib",
    optOutUrl: "https://cubib.com/optout.php",
    privacyEmail: "privacy@cubib.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  KWOLD: {
    name: "Kwold",
    optOutUrl: "https://www.kwold.com/optout",
    privacyEmail: "privacy@kwold.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NEWENGLANDFACTS: {
    name: "NewEnglandFacts",
    optOutUrl: "https://newenglandfacts.com/ng/control/privacy",
    privacyEmail: "privacy@newenglandfacts.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  OFFICIALUSA: {
    name: "OfficialUSA",
    optOutUrl: "https://www.officialusa.com/opt-out/",
    privacyEmail: "privacy@officialusa.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PUB360: {
    name: "Pub360",
    optOutUrl: "https://www.pub360.com/optout",
    privacyEmail: "privacy@pub360.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PROFILEENGINE: {
    name: "ProfileEngine",
    optOutUrl: "https://profileengine.com/optout",
    privacyEmail: "privacy@profileengine.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PUBLICINFOSERVICES: {
    name: "PublicInfoServices",
    optOutUrl: "https://www.publicinfoservices.com/opt-out/",
    privacyEmail: "privacy@publicinfoservices.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEBACKGROUNDCHECK: {
    name: "PeopleBackgroundCheck",
    optOutUrl: "https://www.peoplebackgroundcheck.com/optout",
    privacyEmail: "privacy@peoplebackgroundcheck.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PRIVATERECORDS: {
    name: "PrivateRecords",
    optOutUrl: "https://www.privaterecords.net/optout",
    privacyEmail: "privacy@privaterecords.net",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEWHIZ: {
    name: "PeopleWhiz",
    optOutUrl: "https://www.peoplewhiz.com/optout",
    privacyEmail: "privacy@peoplewhiz.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SEARCHBUG: {
    name: "SearchBug",
    optOutUrl: "https://www.searchbug.com/peoplefinder/optout.aspx",
    privacyEmail: "privacy@searchbug.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SPYTOX: {
    name: "Spytox",
    optOutUrl: "https://www.spytox.com/opt-out",
    privacyEmail: "privacy@spytox.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  STATERECORDS: {
    name: "StateRecords.org",
    optOutUrl: "https://staterecords.org/optout",
    privacyEmail: "privacy@staterecords.org",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  UNITEDSTATESPHONEBOOK: {
    name: "UnitedStatesPhoneBook",
    optOutUrl: "https://www.unitedstatesphonebook.com/contact.php",
    privacyEmail: "privacy@unitedstatesphonebook.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  USA_PEOPLE_SEARCH: {
    name: "USA-People-Search",
    optOutUrl: "https://www.usa-people-search.com/manage",
    privacyEmail: "privacy@usa-people-search.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  USATRACE: {
    name: "USATrace",
    optOutUrl: "https://www.usatrace.com/optout",
    privacyEmail: "privacy@usatrace.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  VERIPAGES: {
    name: "VeriPages",
    optOutUrl: "https://veripages.com/page/optout",
    privacyEmail: "privacy@veripages.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WELLNUT: {
    name: "Wellnut",
    optOutUrl: "https://www.wellnut.com/optout.html",
    privacyEmail: "privacy@wellnut.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE PHONE & CALLER ID
  // ==========================================
  CALLERSMART: {
    name: "CallerSmart",
    optOutUrl: "https://www.callersmart.com/opt-out",
    privacyEmail: "privacy@callersmart.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLERCENTER: {
    name: "CallerCenter",
    optOutUrl: "https://callercenter.com/optout",
    privacyEmail: "privacy@callercenter.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NUMBERGURU: {
    name: "NumberGuru",
    optOutUrl: "https://www.numberguru.com/optout",
    privacyEmail: "privacy@numberguru.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NUMBERVILLE: {
    name: "NumberVille",
    optOutUrl: "https://www.numberville.com/opt-out",
    privacyEmail: "privacy@numberville.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PHONEVALIDATOR: {
    name: "PhoneValidator",
    optOutUrl: "https://www.phonevalidator.com/optout",
    privacyEmail: "privacy@phonevalidator.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WHOCALLEDME: {
    name: "WhoCalledMe",
    optOutUrl: "https://whocalledme.com/optout",
    privacyEmail: "privacy@whocalledme.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WHOCALLSME: {
    name: "WhoCallsMe",
    optOutUrl: "https://whocallsme.com/optout",
    privacyEmail: "privacy@whocallsme.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WHYCALL: {
    name: "WhyCall",
    optOutUrl: "https://www.whycall.com/opt-out",
    privacyEmail: "privacy@whycall.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLERID411: {
    name: "CallerID411",
    optOutUrl: "https://callerid411.com/optout",
    privacyEmail: "privacy@callerid411.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FREECALLERIDSEARCH: {
    name: "FreeCallerIDSearch",
    optOutUrl: "https://freecalleridsearch.com/optout",
    privacyEmail: "privacy@freecalleridsearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE PROPERTY & REAL ESTATE
  // ==========================================
  HOMES_COM: {
    name: "Homes.com",
    optOutUrl: "https://www.homes.com/privacy-policy/",
    privacyEmail: "privacy@homes.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  HOMESNAP: {
    name: "Homeснap",
    optOutUrl: "https://www.homesnap.com/privacy",
    privacyEmail: "privacy@homesnap.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  MOVOTO: {
    name: "Movoto",
    optOutUrl: "https://www.movoto.com/privacy/",
    privacyEmail: "privacy@movoto.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  OPENDOOR: {
    name: "Opendoor",
    optOutUrl: "https://www.opendoor.com/privacy",
    privacyEmail: "privacy@opendoor.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ESTATELY: {
    name: "Estately",
    optOutUrl: "https://www.estately.com/privacy",
    privacyEmail: "privacy@estately.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  XOME: {
    name: "Xome",
    optOutUrl: "https://www.xome.com/privacy",
    privacyEmail: "privacy@xome.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FORECLOSURE_COM: {
    name: "Foreclosure.com",
    optOutUrl: "https://www.foreclosure.com/privacy/",
    privacyEmail: "privacy@foreclosure.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LOOPNET: {
    name: "LoopNet",
    optOutUrl: "https://www.loopnet.com/privacy-policy/",
    privacyEmail: "privacy@loopnet.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE PROFESSIONAL DATA
  // ==========================================
  KASPR: {
    name: "Kaspr",
    optOutUrl: "https://www.kaspr.io/privacy-policy",
    privacyEmail: "privacy@kaspr.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DROPCONTACT: {
    name: "Dropcontact",
    optOutUrl: "https://www.dropcontact.com/privacy",
    privacyEmail: "gdpr@dropcontact.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ANYMAILFINDER: {
    name: "AnyMailFinder",
    optOutUrl: "https://anymailfinder.com/privacy",
    privacyEmail: "privacy@anymailfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILHUNTER: {
    name: "EmailHunter",
    optOutUrl: "https://emailhunter.co/privacy",
    privacyEmail: "privacy@emailhunter.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FINDYMAIL: {
    name: "Findymail",
    optOutUrl: "https://findymail.com/privacy",
    privacyEmail: "privacy@findymail.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SKRAPP: {
    name: "Skrapp",
    optOutUrl: "https://skrapp.io/privacy",
    privacyEmail: "privacy@skrapp.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TOMBA: {
    name: "Tomba.io",
    optOutUrl: "https://tomba.io/privacy",
    privacyEmail: "privacy@tomba.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NYMERIA: {
    name: "Nymeria",
    optOutUrl: "https://www.nymeria.io/privacy",
    privacyEmail: "privacy@nymeria.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PROSPECTLINKER: {
    name: "ProspectLinker",
    optOutUrl: "https://prospectlinker.com/privacy",
    privacyEmail: "privacy@prospectlinker.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SWORDFISH: {
    name: "Swordfish",
    optOutUrl: "https://swordfish.ai/privacy",
    privacyEmail: "privacy@swordfish.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE MARKETING DATA BROKERS
  // ==========================================
  THETRADEDESK: {
    name: "The Trade Desk",
    optOutUrl: "https://www.thetradedesk.com/general/privacy",
    privacyEmail: "privacy@thetradedesk.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PUBMATIC: {
    name: "PubMatic",
    optOutUrl: "https://pubmatic.com/legal/opt-out/",
    privacyEmail: "privacy@pubmatic.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  MAGNITE: {
    name: "Magnite (Rubicon)",
    optOutUrl: "https://www.magnite.com/legal/consumer-online-profile-and-opt-out/",
    privacyEmail: "privacy@magnite.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  OPENX: {
    name: "OpenX",
    optOutUrl: "https://www.openx.com/privacy-center/",
    privacyEmail: "privacy@openx.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CRITEO: {
    name: "Criteo",
    optOutUrl: "https://www.criteo.com/privacy/",
    privacyEmail: "privacy@criteo.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  VIANT: {
    name: "Viant",
    optOutUrl: "https://www.viantinc.com/privacy-policy/",
    privacyEmail: "privacy@viantinc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ADSRVR: {
    name: "AdSrvr",
    optOutUrl: "https://adsrvr.org/opt-out/",
    privacyEmail: "privacy@adsrvr.org",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EYEOTA: {
    name: "Eyeota",
    optOutUrl: "https://www.eyeota.com/privacy-policy",
    privacyEmail: "privacy@eyeota.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE COURT & CRIMINAL RECORDS
  // ==========================================
  CRIMINALWATCHDOG: {
    name: "CriminalWatchDog",
    optOutUrl: "https://www.criminalwatchdog.com/optout",
    privacyEmail: "privacy@criminalwatchdog.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  DOCKETBIRD: {
    name: "DocketBird",
    optOutUrl: "https://www.docketbird.com/privacy",
    privacyEmail: "privacy@docketbird.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PACERMONITOR: {
    name: "PacerMonitor",
    optOutUrl: "https://www.pacermonitor.com/privacy",
    privacyEmail: "privacy@pacermonitor.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TRELLIS_LAW: {
    name: "Trellis Law",
    optOutUrl: "https://trellis.law/privacy",
    privacyEmail: "privacy@trellis.law",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COURTLISTENER: {
    name: "CourtListener",
    optOutUrl: "https://www.courtlistener.com/removal/",
    privacyEmail: "privacy@free.law",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Free law project - honors removal requests",
  },
  DOCKETALARM: {
    name: "Docket Alarm",
    optOutUrl: "https://www.docketalarm.com/privacy",
    privacyEmail: "privacy@docketalarm.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE GENEALOGY & OBITUARY
  // ==========================================
  LEGACY_COM: {
    name: "Legacy.com",
    optOutUrl: "https://www.legacy.com/privacy/",
    privacyEmail: "privacy@legacy.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Obituary and memorial site",
  },
  TRIBUTES_COM: {
    name: "Tributes.com",
    optOutUrl: "https://www.tributes.com/privacy",
    privacyEmail: "privacy@tributes.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ECHOVITA: {
    name: "Echovita",
    optOutUrl: "https://www.echovita.com/privacy",
    privacyEmail: "privacy@echovita.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EVERHERE: {
    name: "EverHere",
    optOutUrl: "https://www.everhere.com/privacy",
    privacyEmail: "privacy@everhere.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FOLD3: {
    name: "Fold3",
    optOutUrl: "https://www.fold3.com/privacy",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Military records - owned by Ancestry",
  },
  FINDMYPAST: {
    name: "Findmypast",
    optOutUrl: "https://www.findmypast.com/privacy",
    privacyEmail: "privacy@findmypast.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE INTERNATIONAL BROKERS
  // ==========================================
  SPOKEO_UK: {
    name: "Spokeo UK",
    optOutUrl: "https://www.spokeo.co.uk/optout",
    privacyEmail: "privacy@spokeo.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CHECKPEOPLE_UK: {
    name: "CheckPeople UK",
    optOutUrl: "https://checkpeople.co.uk/optout",
    privacyEmail: "privacy@checkpeople.co.uk",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PERSONLOOKUP_UK: {
    name: "PersonLookup UK",
    optOutUrl: "https://personlookup.co.uk/opt-out",
    privacyEmail: "privacy@personlookup.co.uk",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  WHITEPAGES_AU: {
    name: "White Pages Australia",
    optOutUrl: "https://www.whitepages.com.au/opt-out",
    privacyEmail: "privacy@sensis.com.au",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PAGESJAUNES: {
    name: "PagesJaunes (France)",
    optOutUrl: "https://www.pagesjaunes.fr/infoslegales",
    privacyEmail: "cnil@solocal.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DASTELEFONBUCH: {
    name: "DasTelefonbuch (Germany)",
    optOutUrl: "https://www.dastelefonbuch.de/Datenschutz",
    privacyEmail: "datenschutz@telefonbuch.de",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PAGINEBIANCHE: {
    name: "PagineBianche (Italy)",
    optOutUrl: "https://www.paginebianche.it/privacy",
    privacyEmail: "privacy@paginebianche.it",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  GUIALOCAL: {
    name: "GuiaLocal (Spain)",
    optOutUrl: "https://www.guialocal.com/privacy",
    privacyEmail: "privacy@guialocal.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // INSURANCE & RISK DATA
  // ==========================================
  LN_RISK_SOLUTIONS: {
    name: "LexisNexis Risk Solutions",
    optOutUrl: "https://risk.lexisnexis.com/consumer-and-data-access-policies",
    privacyEmail: "privacy@lexisnexisrisk.com",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Insurance risk scoring database - affects premiums",
  },
  VERISK: {
    name: "Verisk",
    optOutUrl: "https://www.verisk.com/privacy-policies/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CLUE_REPORT: {
    name: "C.L.U.E. Report",
    optOutUrl: "https://consumer.risk.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Insurance claims history database",
  },
  ISO_CLAIMS: {
    name: "ISO ClaimSearch",
    optOutUrl: "https://www.verisk.com/privacy-policies/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },

  // ==========================================
  // EMAIL VERIFICATION SERVICES
  // ==========================================
  ZEROBOUNCE: {
    name: "ZeroBounce",
    optOutUrl: "https://www.zerobounce.net/privacy-policy/",
    privacyEmail: "privacy@zerobounce.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEVERBOUNCE: {
    name: "NeverBounce",
    optOutUrl: "https://neverbounce.com/privacy-policy",
    privacyEmail: "privacy@neverbounce.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  KICKBOX: {
    name: "Kickbox",
    optOutUrl: "https://kickbox.com/privacy",
    privacyEmail: "privacy@kickbox.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DEBOUNCE: {
    name: "DeBounce",
    optOutUrl: "https://debounce.io/privacy-policy/",
    privacyEmail: "privacy@debounce.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLISTVERIFY: {
    name: "EmailListVerify",
    optOutUrl: "https://emaillistverify.com/privacy-policy",
    privacyEmail: "privacy@emaillistverify.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CLEAROUT: {
    name: "Clearout",
    optOutUrl: "https://clearout.io/privacy-policy",
    privacyEmail: "privacy@clearout.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // DEVICE & IDENTITY GRAPHS
  // ==========================================
  DRAWBRIDGE: {
    name: "Drawbridge",
    optOutUrl: "https://www.drawbridge.com/privacy",
    privacyEmail: "privacy@drawbridge.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CROSSWISE: {
    name: "Crosswise",
    optOutUrl: "https://www.crosswise.com/privacy",
    privacyEmail: "privacy@crosswise.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IQVIA: {
    name: "IQVIA",
    optOutUrl: "https://www.iqvia.com/about-us/privacy",
    privacyEmail: "privacy@iqvia.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Healthcare and pharmaceutical data",
  },
  ID5: {
    name: "ID5",
    optOutUrl: "https://id5.io/privacy",
    privacyEmail: "privacy@id5.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SHAREDID: {
    name: "SharedID",
    optOutUrl: "https://sharedid.org/opt-out",
    privacyEmail: "privacy@prebid.org",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE PEOPLE SEARCH & BACKGROUND CHECK
  // ==========================================
  USSEARCHINFO: {
    name: "USSearchInfo",
    optOutUrl: "https://www.ussearchinfo.com/opt-out",
    privacyEmail: "privacy@ussearchinfo.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FREEPHONETRACER: {
    name: "FreePhoneTracer",
    optOutUrl: "https://www.freephonetracer.com/optout",
    privacyEmail: "privacy@freephonetracer.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FINDPEOPLESEARCH: {
    name: "FindPeopleSearch",
    optOutUrl: "https://www.findpeoplesearch.com/optout",
    privacyEmail: "privacy@findpeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLESMART: {
    name: "PeopleSmart",
    optOutUrl: "https://www.peoplesmart.com/optout",
    privacyEmail: "privacy@peoplesmart.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEFINDERPRO: {
    name: "PeopleFinderPro",
    optOutUrl: "https://www.peoplefinderpro.com/optout",
    privacyEmail: "privacy@peoplefinderpro.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  DATAVERIA: {
    name: "Dataveria",
    optOutUrl: "https://dataveria.com/ng/control/privacy",
    privacyEmail: "privacy@dataveria.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CYBERCHECK: {
    name: "CyberCheck",
    optOutUrl: "https://www.cybercheck.com/optout",
    privacyEmail: "privacy@cybercheck.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  INFOTRACER: {
    name: "InfoTracer",
    optOutUrl: "https://infotracer.com/optout",
    privacyEmail: "privacy@infotracer.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  COCOFINDER: {
    name: "CocoFinder",
    optOutUrl: "https://cocofinder.com/optout",
    privacyEmail: "privacy@cocofinder.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  USPHONELOOKUP: {
    name: "USPhoneLookup",
    optOutUrl: "https://www.usphonelookup.com/optout",
    privacyEmail: "privacy@usphonelookup.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  EASYBACKGROUNDCHECKS: {
    name: "EasyBackgroundChecks",
    optOutUrl: "https://www.easybackgroundchecks.com/optout",
    privacyEmail: "privacy@easybackgroundchecks.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  UNMASK: {
    name: "Unmask",
    optOutUrl: "https://unmask.com/opt-out",
    privacyEmail: "privacy@unmask.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  REVEALNAME: {
    name: "RevealName",
    optOutUrl: "https://www.revealname.com/optout",
    privacyEmail: "privacy@revealname.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  INFORMATION_COM: {
    name: "Information.com",
    optOutUrl: "https://www.information.com/optout",
    privacyEmail: "privacy@information.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  BACKGROUNDALERT: {
    name: "BackgroundAlert",
    optOutUrl: "https://www.backgroundalert.com/optout",
    privacyEmail: "privacy@backgroundalert.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  DOBSEARCH: {
    name: "DOBSearch",
    optOutUrl: "https://www.dobsearch.com/optout",
    privacyEmail: "privacy@dobsearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NEIGHBOR_REPORT: {
    name: "NeighborReport",
    optOutUrl: "https://neighbor.report/optout",
    privacyEmail: "privacy@neighbor.report",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NUMERLOOKUP: {
    name: "NumerLookup",
    optOutUrl: "https://www.numerlookup.com/optout",
    privacyEmail: "privacy@numerlookup.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  VALIDNUMBER: {
    name: "ValidNumber",
    optOutUrl: "https://validnumber.com/opt-out",
    privacyEmail: "privacy@validnumber.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SEARCHPUBLICRECORDS: {
    name: "SearchPublicRecords",
    optOutUrl: "https://www.searchpublicrecords.com/optout",
    privacyEmail: "privacy@searchpublicrecords.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE CALLER ID & PHONE APPS
  // ==========================================
  SHOWCALLER: {
    name: "Showcaller",
    optOutUrl: "https://showcaller.app/optout",
    privacyEmail: "privacy@showcaller.app",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  EYECON: {
    name: "Eyecon",
    optOutUrl: "https://www.eyecon.com/privacy",
    privacyEmail: "privacy@eyecon.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GETCONTACT: {
    name: "GetContact",
    optOutUrl: "https://getcontact.com/en/manage",
    privacyEmail: "privacy@getcontact.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLAPP: {
    name: "CallApp",
    optOutUrl: "https://www.callapp.com/privacy",
    privacyEmail: "privacy@callapp.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WHOSCALL: {
    name: "Whoscall",
    optOutUrl: "https://whoscall.com/privacy",
    privacyEmail: "privacy@gogolook.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DRUPE: {
    name: "Drupe",
    optOutUrl: "https://www.drupeapp.com/privacy",
    privacyEmail: "privacy@drupeapp.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SHOWCALLERID: {
    name: "ShowCallerID",
    optOutUrl: "https://showcallerid.com/optout",
    privacyEmail: "privacy@showcallerid.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  REVERSEMOBILE: {
    name: "ReverseMobile",
    optOutUrl: "https://www.reversemobile.com/optout",
    privacyEmail: "privacy@reversemobile.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE B2B & SALES INTELLIGENCE
  // ==========================================
  LEADFEEDER: {
    name: "Leadfeeder",
    optOutUrl: "https://www.leadfeeder.com/privacy/",
    privacyEmail: "privacy@leadfeeder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LEADGENIUS: {
    name: "LeadGenius",
    optOutUrl: "https://www.leadgenius.com/privacy",
    privacyEmail: "privacy@leadgenius.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DEMANDBASE: {
    name: "Demandbase",
    optOutUrl: "https://www.demandbase.com/privacy-policy/",
    privacyEmail: "privacy@demandbase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SIXSENSE: {
    name: "6sense",
    optOutUrl: "https://6sense.com/privacy-policy/",
    privacyEmail: "privacy@6sense.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BOMBORA: {
    name: "Bombora",
    optOutUrl: "https://bombora.com/privacy-policy/",
    privacyEmail: "privacy@bombora.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DISCOVERORG: {
    name: "DiscoverOrg (ZoomInfo)",
    optOutUrl: "https://www.zoominfo.com/about-zoominfo/privacy-center",
    privacyEmail: "privacy@zoominfo.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DUNS_BRADSTREET: {
    name: "Dun & Bradstreet",
    optOutUrl: "https://www.dnb.com/utility-pages/privacy-policy.html",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOOVERS: {
    name: "Hoovers (D&B)",
    optOutUrl: "https://www.dnb.com/utility-pages/privacy-policy.html",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INSIDEVIEW: {
    name: "InsideView",
    optOutUrl: "https://www.insideview.com/privacy-policy/",
    privacyEmail: "privacy@insideview.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CLEARBIT_ENRICHMENT: {
    name: "Clearbit Enrichment",
    optOutUrl: "https://clearbit.com/privacy",
    privacyEmail: "privacy@clearbit.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE ADTECH & DATA EXCHANGES
  // ==========================================
  MEDIAMATH: {
    name: "MediaMath",
    optOutUrl: "https://www.mediamath.com/privacy-policy/",
    privacyEmail: "privacy@mediamath.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  AMOBEE: {
    name: "Amobee",
    optOutUrl: "https://www.amobee.com/trust/privacy-guidelines/",
    privacyEmail: "privacy@amobee.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  ADROLL: {
    name: "AdRoll",
    optOutUrl: "https://www.adroll.com/ccpa/optout",
    privacyEmail: "privacy@adroll.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  QUANTCAST: {
    name: "Quantcast",
    optOutUrl: "https://www.quantcast.com/opt-out/",
    privacyEmail: "privacy@quantcast.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SHARETHROUGH: {
    name: "Sharethrough",
    optOutUrl: "https://www.sharethrough.com/privacy-center/",
    privacyEmail: "privacy@sharethrough.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TRIPLELIFT: {
    name: "TripleLift",
    optOutUrl: "https://triplelift.com/consumer-opt-out/",
    privacyEmail: "privacy@triplelift.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  APPNEXUS: {
    name: "AppNexus (Xandr)",
    optOutUrl: "https://www.xandr.com/privacy/platform-privacy-policy/",
    privacyEmail: "privacy@xandr.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  INDEX_EXCHANGE: {
    name: "Index Exchange",
    optOutUrl: "https://www.indexexchange.com/privacy/",
    privacyEmail: "privacy@indexexchange.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SOVRN: {
    name: "Sovrn",
    optOutUrl: "https://www.sovrn.com/privacy-policy/",
    privacyEmail: "privacy@sovrn.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SPOTX: {
    name: "SpotX (Magnite)",
    optOutUrl: "https://www.magnite.com/legal/consumer-online-profile-and-opt-out/",
    privacyEmail: "privacy@magnite.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE REAL ESTATE & PROPERTY
  // ==========================================
  REMAX: {
    name: "RE/MAX",
    optOutUrl: "https://www.remax.com/privacy-policy",
    privacyEmail: "privacy@remax.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CENTURY21: {
    name: "Century 21",
    optOutUrl: "https://www.century21.com/privacy-policy",
    privacyEmail: "privacy@century21.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COLDWELLBANKER: {
    name: "Coldwell Banker",
    optOutUrl: "https://www.coldwellbanker.com/privacy-policy",
    privacyEmail: "privacy@coldwellbanker.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  KELLER_WILLIAMS: {
    name: "Keller Williams",
    optOutUrl: "https://www.kw.com/privacy-policy",
    privacyEmail: "privacy@kw.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COMPASS_RE: {
    name: "Compass Real Estate",
    optOutUrl: "https://www.compass.com/privacy/",
    privacyEmail: "privacy@compass.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  HOMELIGHT: {
    name: "HomeLight",
    optOutUrl: "https://www.homelight.com/privacy-policy",
    privacyEmail: "privacy@homelight.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  OFFERPAD: {
    name: "Offerpad",
    optOutUrl: "https://www.offerpad.com/privacy-policy/",
    privacyEmail: "privacy@offerpad.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SUNDAE: {
    name: "Sundae",
    optOutUrl: "https://sundae.com/privacy-policy/",
    privacyEmail: "privacy@sundae.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE INTERNATIONAL
  // ==========================================
  PIPL_INTERNATIONAL: {
    name: "Pipl International",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  ZLOOKUP: {
    name: "ZLookup (India)",
    optOutUrl: "https://www.zlookup.com/optout",
    privacyEmail: "privacy@zlookup.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  TRUECALLER_IN: {
    name: "Truecaller India",
    optOutUrl: "https://www.truecaller.com/unlisting",
    privacyEmail: "privacy@truecaller.com",
    removalMethod: "FORM",
    estimatedDays: 1,
  },
  JUSTDIAL: {
    name: "JustDial (India)",
    optOutUrl: "https://www.justdial.com/privacy",
    privacyEmail: "privacy@justdial.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SULEKHA: {
    name: "Sulekha (India)",
    optOutUrl: "https://www.sulekha.com/privacy",
    privacyEmail: "privacy@sulekha.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  YELLOWPAGES_CA: {
    name: "Yellow Pages Canada",
    optOutUrl: "https://www.yellowpages.ca/privacy",
    privacyEmail: "privacy@yp.ca",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  WHITEPAGES_NZ: {
    name: "White Pages New Zealand",
    optOutUrl: "https://whitepages.co.nz/privacy",
    privacyEmail: "privacy@yellow.co.nz",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  HEROLD_AT: {
    name: "Herold (Austria)",
    optOutUrl: "https://www.herold.at/datenschutz/",
    privacyEmail: "datenschutz@herold.at",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  LOCAL_CH: {
    name: "local.ch (Switzerland)",
    optOutUrl: "https://www.local.ch/en/privacy",
    privacyEmail: "privacy@localsearch.ch",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  GOUDEN_GIDS: {
    name: "Gouden Gids (Netherlands)",
    optOutUrl: "https://www.goudengids.nl/privacy/",
    privacyEmail: "privacy@goudengids.nl",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // TENANT & RENTAL SCREENING
  // ==========================================
  RENTBUREAU: {
    name: "RentBureau (Experian)",
    optOutUrl: "https://www.experian.com/rentbureau/rental-payment-opt-out.html",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Rental payment history database",
  },
  CORELOGIC_RENTAL: {
    name: "CoreLogic Rental",
    optOutUrl: "https://www.corelogic.com/privacy-policy/",
    privacyEmail: "privacy@corelogic.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALPAGE: {
    name: "RealPage",
    optOutUrl: "https://www.realpage.com/privacy-policy/",
    privacyEmail: "privacy@realpage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Tenant screening and property management",
  },
  ONSITE_RESIDENT: {
    name: "On-Site Resident Services",
    optOutUrl: "https://www.on-site.com/privacy-policy",
    privacyEmail: "privacy@on-site.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRANSUNION_RENTAL: {
    name: "TransUnion Rental Screening",
    optOutUrl: "https://www.mysmartmove.com/privacy-policy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // EMPLOYMENT & HR DATA
  // ==========================================
  THEWORKNUMBER: {
    name: "The Work Number (Equifax)",
    optOutUrl: "https://theworknumber.com/employee-data-report",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Employment and income verification database",
  },
  HIRERIGHT: {
    name: "HireRight",
    optOutUrl: "https://www.hireright.com/legal/privacy-policy",
    privacyEmail: "privacy@hireright.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  STERLING: {
    name: "Sterling Background Check",
    optOutUrl: "https://www.sterlingcheck.com/privacy-policy/",
    privacyEmail: "privacy@sterlingcheck.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CHECKR: {
    name: "Checkr",
    optOutUrl: "https://checkr.com/privacy-policy",
    privacyEmail: "privacy@checkr.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  GOODHIRE: {
    name: "GoodHire",
    optOutUrl: "https://www.goodhire.com/privacy-policy",
    privacyEmail: "privacy@goodhire.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ACCURATE_BG: {
    name: "Accurate Background",
    optOutUrl: "https://www.accurate.com/privacy-policy/",
    privacyEmail: "privacy@accurate.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // SOCIAL & DATING
  // ==========================================
  BUMBLE_LOOKUP: {
    name: "Bumble Profile Search",
    optOutUrl: "https://bumble.com/en/privacy",
    privacyEmail: "privacy@team.bumble.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HINGE_LOOKUP: {
    name: "Hinge Profile Search",
    optOutUrl: "https://hinge.co/privacy",
    privacyEmail: "privacy@hinge.co",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  OKCUPID_LOOKUP: {
    name: "OkCupid Profile Search",
    optOutUrl: "https://www.okcupid.com/legal/privacy",
    privacyEmail: "privacy@okcupid.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PLENTYOFFISH: {
    name: "Plenty of Fish",
    optOutUrl: "https://pofhq.com/privacy/",
    privacyEmail: "privacy@pof.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TINDER_LOOKUP: {
    name: "Tinder Profile Search",
    optOutUrl: "https://policies.tinder.com/privacy",
    privacyEmail: "privacy@gotinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // DATA ENRICHMENT SERVICES
  // ==========================================
  PEOPLE_DATA_LABS: {
    name: "People Data Labs",
    optOutUrl: "https://www.peopledatalabs.com/opt-out",
    privacyEmail: "privacy@peopledatalabs.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "B2B data enrichment platform",
  },
  CORESIGNAL: {
    name: "Coresignal",
    optOutUrl: "https://coresignal.com/privacy-policy/",
    privacyEmail: "privacy@coresignal.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PROXYCURL: {
    name: "Proxycurl",
    optOutUrl: "https://nubela.co/proxycurl/privacy-policy",
    privacyEmail: "privacy@nubela.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REVELIO_LABS: {
    name: "Revelio Labs",
    optOutUrl: "https://www.reveliolabs.com/privacy-policy/",
    privacyEmail: "privacy@reveliolabs.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DIFFBOT: {
    name: "Diffbot",
    optOutUrl: "https://www.diffbot.com/privacy-policy/",
    privacyEmail: "privacy@diffbot.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // ADDITIONAL PEOPLE SEARCH SITES
  // ==========================================
  IDTRUE: {
    name: "IDTrue",
    optOutUrl: "https://www.idtrue.com/optout",
    privacyEmail: "privacy@idtrue.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  LOOKUPUK: {
    name: "LookUpUK",
    optOutUrl: "https://www.lookup.uk/optout",
    privacyEmail: "privacy@lookup.uk",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PEEPSEARCH: {
    name: "PeepSearch",
    optOutUrl: "https://www.peepsearch.com/optout",
    privacyEmail: "privacy@peepsearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  RECORDSFINDER: {
    name: "RecordsFinder",
    optOutUrl: "https://recordsfinder.com/optout.php",
    privacyEmail: "privacy@recordsfinder.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PUBLICRECORDCENTER: {
    name: "PublicRecordCenter",
    optOutUrl: "https://www.publicrecordcenter.com/optout",
    privacyEmail: "privacy@publicrecordcenter.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SEARCHSYSTEMS: {
    name: "SearchSystems",
    optOutUrl: "https://www.searchsystems.net/contact.php",
    privacyEmail: "privacy@searchsystems.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PERSONSEARCH: {
    name: "PersonSearch.com",
    optOutUrl: "https://www.personsearch.com/optout",
    privacyEmail: "privacy@personsearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  ARKANSASVOTERS: {
    name: "ArkansasVoters.com",
    optOutUrl: "https://arkansasvoters.com/optout",
    privacyEmail: "privacy@arkansasvoters.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FLORIDAVOTERS: {
    name: "FloridaVoters.com",
    optOutUrl: "https://floridavoters.com/optout",
    privacyEmail: "privacy@floridavoters.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  OHIOVOTERS: {
    name: "OhioVoters.com",
    optOutUrl: "https://ohiovoters.com/optout",
    privacyEmail: "privacy@ohiovoters.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE BACKGROUND SCREENING
  // ==========================================
  FIRST_ADVANTAGE: {
    name: "First Advantage",
    optOutUrl: "https://fadv.com/privacy-policy/",
    privacyEmail: "privacy@fadv.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Employment background screening company",
  },
  INTELLICORP: {
    name: "IntelliCorp",
    optOutUrl: "https://www.intellicorp.net/privacy-policy",
    privacyEmail: "privacy@intellicorp.net",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TALENTWISE: {
    name: "TalentWise",
    optOutUrl: "https://www.sterlingcheck.com/privacy-policy/",
    privacyEmail: "privacy@talentwise.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INFOMART: {
    name: "InfoMart",
    optOutUrl: "https://www.infomart-usa.com/privacy-policy/",
    privacyEmail: "privacy@infomart-usa.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SJV_ASSOCIATES: {
    name: "SJV Associates",
    optOutUrl: "https://www.sjvassoc.com/privacy",
    privacyEmail: "privacy@sjvassoc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE DATA AGGREGATORS
  // ==========================================
  TOWER_DATA: {
    name: "TowerData",
    optOutUrl: "https://www.towerdata.com/privacy-policy",
    privacyEmail: "privacy@towerdata.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Email intelligence and data append services",
  },
  NEXTROLL: {
    name: "NextRoll",
    optOutUrl: "https://www.nextroll.com/privacy",
    privacyEmail: "privacy@nextroll.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PERMUTIVE: {
    name: "Permutive",
    optOutUrl: "https://permutive.com/privacy/",
    privacyEmail: "privacy@permutive.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ADADYN: {
    name: "Adadyn",
    optOutUrl: "https://www.adadyn.com/privacy-policy/",
    privacyEmail: "privacy@adadyn.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INTENTIQ: {
    name: "IntentIQ",
    optOutUrl: "https://www.intentiq.com/privacy-policy/",
    privacyEmail: "privacy@intentiq.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // PHONE TRACKING & CARRIER LOOKUP
  // ==========================================
  CARRIERLOOKUP: {
    name: "CarrierLookup",
    optOutUrl: "https://www.carrierlookup.com/privacy",
    privacyEmail: "privacy@carrierlookup.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FREECARRIERLOOKUP: {
    name: "FreeCarrierLookup",
    optOutUrl: "https://freecarrierlookup.com/optout.php",
    privacyEmail: "privacy@freecarrierlookup.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  TEXTMAGIC: {
    name: "TextMagic",
    optOutUrl: "https://www.textmagic.com/privacy-policy",
    privacyEmail: "privacy@textmagic.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TEXTEM: {
    name: "TextEm",
    optOutUrl: "https://www.textem.net/privacy",
    privacyEmail: "privacy@textem.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NUMVERIFY: {
    name: "NumVerify",
    optOutUrl: "https://numverify.com/privacy",
    privacyEmail: "privacy@numverify.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE INTERNATIONAL BROKERS
  // ==========================================
  TELOFONO_BLANCO: {
    name: "Telefono Blanco (Mexico)",
    optOutUrl: "https://www.telefonoblanco.mx/privacy",
    privacyEmail: "privacy@telefonoblanco.mx",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_BR: {
    name: "Paginas Amarelas (Brazil)",
    optOutUrl: "https://www.paginasamarelas.com.br/privacidade",
    privacyEmail: "privacidade@paginasamarelas.com.br",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TELELISTAS: {
    name: "TeleListas (Brazil)",
    optOutUrl: "https://www.telelistas.net/privacidade",
    privacyEmail: "privacidade@telelistas.net",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  ENIRO: {
    name: "Eniro (Sweden)",
    optOutUrl: "https://www.eniro.se/integritetspolicy",
    privacyEmail: "privacy@eniro.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  HITTA_SE: {
    name: "Hitta.se (Sweden)",
    optOutUrl: "https://www.hitta.se/om/integritetspolicy",
    privacyEmail: "privacy@hitta.se",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  KRAK_DK: {
    name: "Krak (Denmark)",
    optOutUrl: "https://www.krak.dk/privatlivspolitik",
    privacyEmail: "privacy@krak.dk",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DEGULESIDER_NO: {
    name: "De Gule Sider (Norway)",
    optOutUrl: "https://www.gulesider.no/personvern",
    privacyEmail: "personvern@gulesider.no",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // ADDITIONAL DATA BROKERS - EXPANDED v1.18.0
  // ==========================================

  // Skip Tracing & Collections Data
  TRANSUNION_TRUELOOK: {
    name: "TransUnion TrueLook",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  EQUIFAX_WORKFORCE: {
    name: "Equifax Workforce Solutions",
    optOutUrl: "https://www.equifax.com/privacy/opt-out/",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  EXPERIAN_MARKETING_SKIP: {
    name: "Experian Marketing Services",
    optOutUrl: "https://www.experian.com/privacy/opting_out",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  ACCURINT_LEXISNEXIS: {
    name: "Accurint (LexisNexis)",
    optOutUrl: "https://optout.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TRACERS_INFO: {
    name: "Tracers Information",
    optOutUrl: "https://www.tracers.com/consumer-privacy/",
    privacyEmail: "privacy@tracers.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IRB_SEARCH: {
    name: "IRB Search",
    optOutUrl: "https://www.irbsearch.com/optout",
    privacyEmail: "privacy@irbsearch.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  TLOXP: {
    name: "TLOxp (TransUnion)",
    optOutUrl: "https://www.tlo.com/privacy",
    privacyEmail: "privacy@tlo.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SKIPMAX: {
    name: "SkipMax",
    optOutUrl: "https://skipmax.com/privacy",
    privacyEmail: "support@skipmax.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SKIP_SMASHER: {
    name: "SkipSmasher",
    optOutUrl: "https://skipsmasher.com/privacy-policy",
    privacyEmail: "privacy@skipsmasher.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BATCH_SKIP_TRACING: {
    name: "BatchSkipTracing",
    optOutUrl: "https://batchskiptracing.com/privacy",
    privacyEmail: "privacy@batchskiptracing.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Automotive & Vehicle Data
  CARFAX_OWNER: {
    name: "Carfax Owner Data",
    optOutUrl: "https://www.carfax.com/company/privacy",
    privacyEmail: "privacy@carfax.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUTOCHECK_EXPERIAN: {
    name: "AutoCheck (Experian)",
    optOutUrl: "https://www.autocheck.com/privacy",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  VINAUDIT: {
    name: "VinAudit",
    optOutUrl: "https://www.vinaudit.com/privacy",
    privacyEmail: "privacy@vinaudit.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  POLK_AUTOMOTIVE: {
    name: "Polk Automotive (IHS Markit)",
    optOutUrl: "https://ihsmarkit.com/about/privacy.html",
    privacyEmail: "privacy@ihsmarkit.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  JD_POWER_DATA: {
    name: "J.D. Power Data Services",
    optOutUrl: "https://www.jdpower.com/privacy",
    privacyEmail: "privacy@jdpower.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  VEHICLEHISTORY_COM: {
    name: "VehicleHistory.com",
    optOutUrl: "https://www.vehiclehistory.com/privacy",
    privacyEmail: "privacy@vehiclehistory.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CLEARVIN: {
    name: "ClearVin",
    optOutUrl: "https://www.clearvin.com/privacy",
    privacyEmail: "support@clearvin.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUMPER_VEHICLE: {
    name: "Bumper Vehicle History",
    optOutUrl: "https://www.bumper.com/privacy",
    privacyEmail: "privacy@bumper.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  EPICVIN: {
    name: "EpicVIN",
    optOutUrl: "https://epicvin.com/privacy",
    privacyEmail: "privacy@epicvin.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FAXVIN: {
    name: "FaxVIN",
    optOutUrl: "https://www.faxvin.com/privacy",
    privacyEmail: "support@faxvin.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Insurance & Risk Data
  LEXISNEXIS_CLUE: {
    name: "LexisNexis C.L.U.E.",
    optOutUrl: "https://consumer.risk.lexisnexis.com/request",
    privacyEmail: "consumer.advocate@lexisnexisrisk.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  VERISK_ISO: {
    name: "Verisk ISO ClaimSearch",
    optOutUrl: "https://www.verisk.com/privacy/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MIB_GROUP: {
    name: "MIB Group (Medical Info Bureau)",
    optOutUrl: "https://www.mib.com/consumer_information.html",
    privacyEmail: "infoline@mib.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  MILLIMAN_INTELLISCRIPT: {
    name: "Milliman IntelliScript",
    optOutUrl: "https://www.rxhistories.com/",
    privacyEmail: "intelliscript@milliman.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  A_PLUS_INSURANCE: {
    name: "A-PLUS Property Insurance",
    optOutUrl: "https://www.aplusconsumer.com/",
    privacyEmail: "aplus@verisk.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CHOICEPOINT_INSURANCE: {
    name: "ChoicePoint Insurance",
    optOutUrl: "https://www.lexisnexis.com/en-us/privacy/privacy-policy.page",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRANSUNION_INSURANCE: {
    name: "TransUnion Insurance Solutions",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EXPERIAN_INSURANCE: {
    name: "Experian Insurance Services",
    optOutUrl: "https://www.experian.com/privacy/opting_out",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  FENRIS_DIGITAL: {
    name: "Fenris Digital",
    optOutUrl: "https://www.fenrisdigital.com/privacy",
    privacyEmail: "privacy@fenrisdigital.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CAPE_ANALYTICS: {
    name: "Cape Analytics",
    optOutUrl: "https://capeanalytics.com/privacy/",
    privacyEmail: "privacy@capeanalytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Healthcare & Medical Data
  IQVIA_DATA: {
    name: "IQVIA Healthcare Data",
    optOutUrl: "https://www.iqvia.com/about-us/privacy",
    privacyEmail: "privacy@iqvia.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HEALTHGRADES_DATA: {
    name: "Healthgrades Provider Data",
    optOutUrl: "https://www.healthgrades.com/content/privacy-policy",
    privacyEmail: "privacy@healthgrades.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  DOXIMITY_DATA: {
    name: "Doximity Physician Database",
    optOutUrl: "https://www.doximity.com/privacy",
    privacyEmail: "privacy@doximity.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  WEBMD_PROVIDER: {
    name: "WebMD Provider Directory",
    optOutUrl: "https://www.webmd.com/about-webmd-policies/privacy-policy",
    privacyEmail: "privacy@webmd.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  VITALS_DIRECTORY: {
    name: "Vitals.com",
    optOutUrl: "https://www.vitals.com/about/privacy",
    privacyEmail: "privacy@vitals.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ZOCDOC_LISTINGS: {
    name: "Zocdoc Provider Listings",
    optOutUrl: "https://www.zocdoc.com/privacy",
    privacyEmail: "privacy@zocdoc.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  REALSELF_DIRECTORY: {
    name: "RealSelf Provider Directory",
    optOutUrl: "https://www.realself.com/privacy",
    privacyEmail: "privacy@realself.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CASTLIGHT_HEALTH: {
    name: "Castlight Health",
    optOutUrl: "https://www.castlighthealth.com/privacy/",
    privacyEmail: "privacy@castlighthealth.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SHARECARE_DATA: {
    name: "Sharecare",
    optOutUrl: "https://www.sharecare.com/privacy-policy",
    privacyEmail: "privacy@sharecare.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  DEFINITIVE_HC: {
    name: "Definitive Healthcare",
    optOutUrl: "https://www.definitivehc.com/privacy-policy",
    privacyEmail: "privacy@definitivehc.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // B2B & Professional Data
  ZOOMINFO_B2B: {
    name: "ZoomInfo",
    optOutUrl: "https://www.zoominfo.com/about-zoominfo/privacy-manage-profile",
    privacyEmail: "privacy@zoominfo.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DUNSANDBRADSREET: {
    name: "Dun & Bradstreet",
    optOutUrl: "https://www.dnb.com/utility-pages/privacy-policy.html",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOOVERS_DNB: {
    name: "Hoovers (D&B)",
    optOutUrl: "https://www.hoovers.com/privacy",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INFOGROUP_DATA: {
    name: "Infogroup (Data.com)",
    optOutUrl: "https://www.data.com/privacy",
    privacyEmail: "privacy@infogroup.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  LEAD411: {
    name: "Lead411",
    optOutUrl: "https://www.lead411.com/privacy-policy/",
    privacyEmail: "privacy@lead411.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DISCOVER_ORG: {
    name: "DiscoverOrg",
    optOutUrl: "https://discoverorg.com/privacy-policy/",
    privacyEmail: "privacy@discoverorg.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SEAMLESS_AI_B2B: {
    name: "Seamless.AI",
    optOutUrl: "https://seamless.ai/privacy",
    privacyEmail: "privacy@seamless.ai",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  LUSHA_DATA: {
    name: "Lusha",
    optOutUrl: "https://www.lusha.com/opt-out/",
    privacyEmail: "privacy@lusha.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  APOLLO_IO: {
    name: "Apollo.io",
    optOutUrl: "https://www.apollo.io/privacy-policy/remove-info",
    privacyEmail: "privacy@apollo.io",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CLEARBIT_DATA: {
    name: "Clearbit",
    optOutUrl: "https://clearbit.com/privacy",
    privacyEmail: "privacy@clearbit.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SLINTEL: {
    name: "Slintel (6sense)",
    optOutUrl: "https://6sense.com/privacy-policy/",
    privacyEmail: "privacy@6sense.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COGNISM_B2B: {
    name: "Cognism",
    optOutUrl: "https://www.cognism.com/privacy-policy",
    privacyEmail: "privacy@cognism.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CONTACTOUT_B2B: {
    name: "ContactOut",
    optOutUrl: "https://contactout.com/optout",
    privacyEmail: "privacy@contactout.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  HUNTER_IO_B2B: {
    name: "Hunter.io",
    optOutUrl: "https://hunter.io/privacy-policy",
    privacyEmail: "privacy@hunter.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  VOILANORBERT_B2B: {
    name: "VoilaNorbert",
    optOutUrl: "https://www.voilanorbert.com/privacy",
    privacyEmail: "privacy@voilanorbert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ROCKETREACH_B2B: {
    name: "RocketReach",
    optOutUrl: "https://rocketreach.co/privacy",
    privacyEmail: "privacy@rocketreach.co",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  SNOV_IO_B2B: {
    name: "Snov.io",
    optOutUrl: "https://snov.io/privacy-policy",
    privacyEmail: "privacy@snov.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UPLEAD_B2B: {
    name: "UpLead",
    optOutUrl: "https://www.uplead.com/privacy-policy/",
    privacyEmail: "privacy@uplead.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DATANYZE_B2B: {
    name: "Datanyze",
    optOutUrl: "https://www.datanyze.com/privacy-policy",
    privacyEmail: "privacy@datanyze.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SALESINTEL: {
    name: "SalesIntel",
    optOutUrl: "https://salesintel.io/privacy-policy/",
    privacyEmail: "privacy@salesintel.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Consumer Marketing Data
  ACXIOM_ABOUTTHEDATA: {
    name: "Acxiom AboutTheData",
    optOutUrl: "https://www.acxiom.com/optout",
    privacyEmail: "consumeradvo@acxiom.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  ORACLE_MARKETING: {
    name: "Oracle Data Cloud",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EPSILON_DATA: {
    name: "Epsilon Data Management",
    optOutUrl: "https://www.epsilon.com/us/privacy-policy",
    privacyEmail: "privacy@epsilon.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  LIVERAMP_DATA: {
    name: "LiveRamp Data Services",
    optOutUrl: "https://liveramp.com/opt_out/",
    privacyEmail: "privacy@liveramp.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  NIELSEN_IQ: {
    name: "NielsenIQ Consumer Data",
    optOutUrl: "https://nielseniq.com/global/en/legal/privacy-policy/",
    privacyEmail: "privacy@nielseniq.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  LOTAME_DATA: {
    name: "Lotame",
    optOutUrl: "https://www.lotame.com/about-lotame/privacy/opt-out/",
    privacyEmail: "privacy@lotame.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  COMSCORE_DATA: {
    name: "Comscore",
    optOutUrl: "https://www.comscore.com/About/Privacy-Policy",
    privacyEmail: "privacy@comscore.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TAPAD_DATA: {
    name: "Tapad (Experian)",
    optOutUrl: "https://www.tapad.com/privacy",
    privacyEmail: "privacy@tapad.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  DRAWBRIDGE_MARKETING: {
    name: "Drawbridge (LinkedIn)",
    optOutUrl: "https://www.linkedin.com/legal/privacy-policy",
    privacyEmail: "privacy@drawbridge.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRUTHSET: {
    name: "Truthset",
    optOutUrl: "https://truthset.com/privacy/",
    privacyEmail: "privacy@truthset.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Retail & Shopping Data
  CATALINA_DATA: {
    name: "Catalina Marketing",
    optOutUrl: "https://www.catalina.com/privacy-policy/",
    privacyEmail: "privacy@catalina.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IBOTTA_DATA: {
    name: "Ibotta Consumer Data",
    optOutUrl: "https://home.ibotta.com/privacy/",
    privacyEmail: "privacy@ibotta.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  FETCH_REWARDS: {
    name: "Fetch Rewards",
    optOutUrl: "https://fetch.com/privacy-policy/",
    privacyEmail: "privacy@fetch.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  RAKUTEN_DATA: {
    name: "Rakuten Consumer Data",
    optOutUrl: "https://www.rakuten.com/privacy.htm",
    privacyEmail: "privacy@rakuten.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CARDLYTICS: {
    name: "Cardlytics",
    optOutUrl: "https://www.cardlytics.com/privacy/",
    privacyEmail: "privacy@cardlytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SHOPKICK_DATA: {
    name: "Shopkick",
    optOutUrl: "https://www.shopkick.com/privacy",
    privacyEmail: "privacy@shopkick.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  INMARKET_DATA: {
    name: "InMarket",
    optOutUrl: "https://inmarket.com/privacy/",
    privacyEmail: "privacy@inmarket.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PLACED_FOURSQUARE: {
    name: "Placed (Foursquare)",
    optOutUrl: "https://foursquare.com/privacy/",
    privacyEmail: "privacy@foursquare.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  AFFINITY_SOLUTIONS: {
    name: "Affinity Solutions",
    optOutUrl: "https://www.affinitysolutions.com/privacy",
    privacyEmail: "privacy@affinitysolutions.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  NUMERATOR_DATA: {
    name: "Numerator",
    optOutUrl: "https://www.numerator.com/privacy/",
    privacyEmail: "privacy@numerator.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Location & Geospatial Data
  SAFEGRAPH_DATA: {
    name: "SafeGraph",
    optOutUrl: "https://www.safegraph.com/privacy-policy",
    privacyEmail: "privacy@safegraph.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PLACER_AI_LOCATION: {
    name: "Placer.ai",
    optOutUrl: "https://www.placer.ai/privacy-policy/",
    privacyEmail: "privacy@placer.ai",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  GRAVY_ANALYTICS_LOCATION: {
    name: "Gravy Analytics",
    optOutUrl: "https://gravyanalytics.com/privacy-policy/",
    privacyEmail: "privacy@gravyanalytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UNACAST_DATA: {
    name: "Unacast",
    optOutUrl: "https://www.unacast.com/privacy",
    privacyEmail: "privacy@unacast.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CUEBIQ_DATA: {
    name: "Cuebiq",
    optOutUrl: "https://www.cuebiq.com/privacy-policy/",
    privacyEmail: "privacy@cuebiq.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  VERASET_DATA: {
    name: "Veraset",
    optOutUrl: "https://veraset.com/privacy/",
    privacyEmail: "privacy@veraset.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEARMEDIA: {
    name: "Near Media",
    optOutUrl: "https://near.com/privacy/",
    privacyEmail: "privacy@near.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  GROUNDTRUTH_DATA: {
    name: "GroundTruth",
    optOutUrl: "https://www.groundtruth.com/privacy-policy/",
    privacyEmail: "privacy@groundtruth.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  REVEAL_MOBILE: {
    name: "Reveal Mobile",
    optOutUrl: "https://revealmobile.com/privacy/",
    privacyEmail: "privacy@revealmobile.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  XMODE_DATA: {
    name: "X-Mode Social",
    optOutUrl: "https://xmode.io/privacy-policy/",
    privacyEmail: "privacy@xmode.io",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // Identity Resolution & Enrichment
  FULLCONTACT_IDENTITY: {
    name: "FullContact",
    optOutUrl: "https://www.fullcontact.com/privacy/",
    privacyEmail: "privacy@fullcontact.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PIPL_ENTERPRISE: {
    name: "Pipl Enterprise",
    optOutUrl: "https://pipl.com/privacy-policy/",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PEOPLEDATALABS: {
    name: "People Data Labs",
    optOutUrl: "https://www.peopledatalabs.com/privacy",
    privacyEmail: "privacy@peopledatalabs.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  VERSIUM_DATA: {
    name: "Versium",
    optOutUrl: "https://versium.com/privacy/",
    privacyEmail: "privacy@versium.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TOWERDATA: {
    name: "TowerData",
    optOutUrl: "https://www.towerdata.com/privacy-policy",
    privacyEmail: "privacy@towerdata.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BIGDBM: {
    name: "BigDBM",
    optOutUrl: "https://bigdbm.com/privacy/",
    privacyEmail: "privacy@bigdbm.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ZEROBOUNCE_DATA: {
    name: "ZeroBounce",
    optOutUrl: "https://www.zerobounce.net/privacy",
    privacyEmail: "privacy@zerobounce.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEVERBOUNCE_DATA: {
    name: "NeverBounce",
    optOutUrl: "https://neverbounce.com/privacy-policy",
    privacyEmail: "privacy@neverbounce.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  KICKBOX_DATA: {
    name: "Kickbox",
    optOutUrl: "https://kickbox.com/privacy/",
    privacyEmail: "privacy@kickbox.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILAGE: {
    name: "Emailage (LexisNexis)",
    optOutUrl: "https://www.lexisnexis.com/en-us/privacy/privacy-policy.page",
    privacyEmail: "privacy@emailage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Financial & Alternative Credit Data
  CHEXSYSTEMS_CREDIT: {
    name: "ChexSystems",
    optOutUrl: "https://www.chexsystems.com/web/chexsystems/consumerdebit/page/home/optout",
    privacyEmail: "consumer@chexsystems.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CERTEGY_CHECK: {
    name: "Certegy Check Services",
    optOutUrl: "https://www.askcertegy.com/optout",
    privacyEmail: "consumer@certegy.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TELECHECK: {
    name: "TeleCheck",
    optOutUrl: "https://www.firstdata.com/telecheck/",
    privacyEmail: "privacy@telecheck.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  NCTUE_UTILITY: {
    name: "NCTUE Utility Exchange",
    optOutUrl: "https://www.nctue.com/Consumers",
    privacyEmail: "privacy@nctue.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CLARITY_SERVICES: {
    name: "Clarity Services (Experian)",
    optOutUrl: "https://www.clarityservices.com/consumer-info/",
    privacyEmail: "consumer@clarityservices.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  FACTORTRUST: {
    name: "FactorTrust (TransUnion)",
    optOutUrl: "https://www.factortrust.com/consumer-request/",
    privacyEmail: "privacy@factortrust.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SRS_TENANT: {
    name: "SRS (Tenant Screening)",
    optOutUrl: "https://www.saferent.com/privacy/",
    privacyEmail: "privacy@saferent.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  INNOVIS_DATA: {
    name: "Innovis Data Solutions",
    optOutUrl: "https://www.innovis.com/personal/securityFreeze",
    privacyEmail: "privacy@innovis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PRBC_CREDIT: {
    name: "PRBC (Payment Reporting)",
    optOutUrl: "https://www.prbc.com/consumers/",
    privacyEmail: "privacy@prbc.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SAGESTREAM_CREDIT: {
    name: "SageStream",
    optOutUrl: "https://www.sagestreamllc.com/consumer-assistance/",
    privacyEmail: "privacy@sagestreamllc.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // Employment & Workforce Data
  THE_WORK_NUMBER: {
    name: "The Work Number (Equifax)",
    optOutUrl: "https://www.theworknumber.com/employees/",
    privacyEmail: "privacy@theworknumber.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  ADP_VERIFICATION: {
    name: "ADP Verification Services",
    optOutUrl: "https://www.adp.com/privacy.aspx",
    privacyEmail: "privacy@adp.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PAYCHEX_DATA: {
    name: "Paychex Data Services",
    optOutUrl: "https://www.paychex.com/privacy",
    privacyEmail: "privacy@paychex.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TALENTIQ: {
    name: "TalentIQ (iCIMS)",
    optOutUrl: "https://www.icims.com/legal/privacy-notice/",
    privacyEmail: "privacy@icims.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  HIBOB_DATA: {
    name: "HiBob",
    optOutUrl: "https://www.hibob.com/privacy-policy/",
    privacyEmail: "privacy@hibob.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GREENHOUSE_DATA: {
    name: "Greenhouse Recruiting",
    optOutUrl: "https://www.greenhouse.io/privacy-policy",
    privacyEmail: "privacy@greenhouse.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LEVER_DATA: {
    name: "Lever (Employ Inc.)",
    optOutUrl: "https://www.lever.co/privacy-policy/",
    privacyEmail: "privacy@lever.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SMARTRECRUITERS: {
    name: "SmartRecruiters",
    optOutUrl: "https://www.smartrecruiters.com/legal/privacy-policy/",
    privacyEmail: "privacy@smartrecruiters.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  JOBVITE_DATA: {
    name: "Jobvite",
    optOutUrl: "https://www.jobvite.com/privacy-policy/",
    privacyEmail: "privacy@jobvite.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WORKDAY_DATA: {
    name: "Workday",
    optOutUrl: "https://www.workday.com/en-us/company/about-workday/privacy.html",
    privacyEmail: "privacy@workday.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Legal & Court Records
  PACER_RECORDS: {
    name: "PACER (Federal Courts)",
    optOutUrl: "https://pacer.uscourts.gov/",
    privacyEmail: "pacer@uscourts.gov",
    removalMethod: "EMAIL",
    estimatedDays: 60,
  },
  COURTLINK_LN: {
    name: "CourtLink (LexisNexis)",
    optOutUrl: "https://www.lexisnexis.com/en-us/privacy/privacy-policy.page",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  WESTLAW_COURT: {
    name: "Westlaw Court Records",
    optOutUrl: "https://legal.thomsonreuters.com/en/privacy",
    privacyEmail: "privacy@thomsonreuters.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  COURTRECORDS_LEGAL: {
    name: "CourtRecords.org",
    optOutUrl: "https://courtrecords.org/privacy",
    privacyEmail: "privacy@courtrecords.org",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  JUDYRECORDS_LEGAL: {
    name: "JudyRecords",
    optOutUrl: "https://www.judyrecords.com/privacy",
    privacyEmail: "support@judyrecords.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UNIQUECOURT: {
    name: "UniqueCourt",
    optOutUrl: "https://uniquecourt.com/privacy",
    privacyEmail: "support@uniquecourt.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DOCKETBIRD_LEGAL: {
    name: "Docketbird",
    optOutUrl: "https://www.docketbird.com/privacy",
    privacyEmail: "support@docketbird.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COURTLISTENER_LEGAL: {
    name: "CourtListener (Free Law Project)",
    optOutUrl: "https://www.courtlistener.com/terms/",
    privacyEmail: "info@free.law",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  JUSTIA_DOCKETS: {
    name: "Justia Dockets",
    optOutUrl: "https://www.justia.com/privacy-policy/",
    privacyEmail: "privacy@justia.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BLOOMBERG_LAW: {
    name: "Bloomberg Law Records",
    optOutUrl: "https://www.bloombergindustry.com/privacy-policy/",
    privacyEmail: "privacy@bloombergindustry.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Property & Real Estate Data
  CORELOGIC_PROPERTY: {
    name: "CoreLogic Property",
    optOutUrl: "https://www.corelogic.com/privacy-policy/",
    privacyEmail: "privacy@corelogic.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ATTOM_DATA: {
    name: "ATTOM Data Solutions",
    optOutUrl: "https://www.attomdata.com/privacy/",
    privacyEmail: "privacy@attomdata.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  FIRST_AMERICAN_DATA: {
    name: "First American Data",
    optOutUrl: "https://www.firstam.com/privacy-policy/",
    privacyEmail: "privacy@firstam.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  BLACK_KNIGHT_DATA: {
    name: "Black Knight (ICE)",
    optOutUrl: "https://www.blackknightinc.com/privacy-policy/",
    privacyEmail: "privacy@blackknightinc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REONOMY_DATA: {
    name: "Reonomy",
    optOutUrl: "https://www.reonomy.com/privacy/",
    privacyEmail: "privacy@reonomy.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REALTYTRACK: {
    name: "RealtyTrac (ATTOM)",
    optOutUrl: "https://www.realtytrac.com/privacy/",
    privacyEmail: "privacy@realtytrac.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PROPERTYSHARK_REALTY: {
    name: "PropertyShark",
    optOutUrl: "https://www.propertyshark.com/info/privacy/",
    privacyEmail: "privacy@propertyshark.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LANDGRID: {
    name: "Landgrid",
    optOutUrl: "https://landgrid.com/privacy",
    privacyEmail: "privacy@landgrid.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REGRID: {
    name: "Regrid",
    optOutUrl: "https://regrid.com/privacy",
    privacyEmail: "privacy@regrid.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REALPAGE_DATA: {
    name: "RealPage Data Services",
    optOutUrl: "https://www.realpage.com/privacy-policy/",
    privacyEmail: "privacy@realpage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Voter & Political Data
  L2_VOTER_DATA: {
    name: "L2 Political",
    optOutUrl: "https://l2-data.com/privacy/",
    privacyEmail: "privacy@l2-data.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ARISTOTLE_VOTER: {
    name: "Aristotle Voter Files",
    optOutUrl: "https://aristotle.com/privacy-policy/",
    privacyEmail: "privacy@aristotle.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CATALIST_DATA: {
    name: "Catalist",
    optOutUrl: "https://catalist.us/privacy/",
    privacyEmail: "privacy@catalist.us",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TARGET_SMART: {
    name: "TargetSmart",
    optOutUrl: "https://targetsmart.com/privacy-policy/",
    privacyEmail: "privacy@targetsmart.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  NATIONBUILDER: {
    name: "NationBuilder",
    optOutUrl: "https://nationbuilder.com/privacy",
    privacyEmail: "privacy@nationbuilder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NGPVAN: {
    name: "NGP VAN (EveryAction)",
    optOutUrl: "https://www.ngpvan.com/privacy-policy/",
    privacyEmail: "privacy@ngpvan.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  I360_DATA: {
    name: "i360",
    optOutUrl: "https://www.i-360.com/privacy/",
    privacyEmail: "privacy@i-360.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DATA_TRUST: {
    name: "Data Trust",
    optOutUrl: "https://www.data-trust.com/privacy/",
    privacyEmail: "privacy@data-trust.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  VOTERBASE: {
    name: "VoterBase",
    optOutUrl: "https://voterbase.com/privacy",
    privacyEmail: "privacy@voterbase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  POLITICAL_DATA: {
    name: "Political Data Inc",
    optOutUrl: "https://politicaldata.com/privacy/",
    privacyEmail: "privacy@politicaldata.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Social Media Aggregators
  SOCIAL_CATFISH_AGG: {
    name: "Social Catfish",
    optOutUrl: "https://socialcatfish.com/opt-out/",
    privacyEmail: "privacy@socialcatfish.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  BRANDYOURSELF: {
    name: "BrandYourself",
    optOutUrl: "https://brandyourself.com/privacy-policy",
    privacyEmail: "privacy@brandyourself.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SOCIALBAKERS: {
    name: "Socialbakers (Emplifi)",
    optOutUrl: "https://emplifi.io/legal/privacy-policy",
    privacyEmail: "privacy@emplifi.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SOCIAL_MENTION: {
    name: "Social Mention",
    optOutUrl: "https://socialmention.com/about/",
    privacyEmail: "info@socialmention.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BRANDWATCH: {
    name: "Brandwatch",
    optOutUrl: "https://www.brandwatch.com/legal/privacy-policy/",
    privacyEmail: "privacy@brandwatch.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SPRINKLR_DATA: {
    name: "Sprinklr",
    optOutUrl: "https://www.sprinklr.com/privacy/",
    privacyEmail: "privacy@sprinklr.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  NETBASE_QUID: {
    name: "NetBase Quid",
    optOutUrl: "https://netbasequid.com/privacy-policy/",
    privacyEmail: "privacy@netbasequid.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOOTSUITE_DATA: {
    name: "Hootsuite Insights",
    optOutUrl: "https://www.hootsuite.com/legal/privacy",
    privacyEmail: "privacy@hootsuite.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TALKWALKER: {
    name: "Talkwalker",
    optOutUrl: "https://www.talkwalker.com/privacy",
    privacyEmail: "privacy@talkwalker.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SYSOMOS: {
    name: "Sysomos",
    optOutUrl: "https://www.meltwater.com/en/privacy",
    privacyEmail: "privacy@meltwater.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Phone & Communication Data
  TWILIO_LOOKUP: {
    name: "Twilio Lookup",
    optOutUrl: "https://www.twilio.com/legal/privacy",
    privacyEmail: "privacy@twilio.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  NUMVERIFY_PHONE: {
    name: "Numverify",
    optOutUrl: "https://numverify.com/privacy",
    privacyEmail: "privacy@apilayer.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EKATA_DATA: {
    name: "Ekata (Mastercard)",
    optOutUrl: "https://ekata.com/privacy-policy/",
    privacyEmail: "privacy@ekata.com",
    removalMethod: "FORM",
    estimatedDays: 21,
  },
  TELESIGN_DATA: {
    name: "TeleSign",
    optOutUrl: "https://www.telesign.com/privacy-policy/",
    privacyEmail: "privacy@telesign.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  MARCHEX_DATA: {
    name: "Marchex",
    optOutUrl: "https://www.marchex.com/privacy-policy/",
    privacyEmail: "privacy@marchex.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CALLRAIL_DATA: {
    name: "CallRail",
    optOutUrl: "https://www.callrail.com/privacy/",
    privacyEmail: "privacy@callrail.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  INVOCA_DATA: {
    name: "Invoca",
    optOutUrl: "https://www.invoca.com/legal/privacy-policy/",
    privacyEmail: "privacy@invoca.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DIALOGTECH: {
    name: "DialogTech (Invoca)",
    optOutUrl: "https://www.invoca.com/legal/privacy-policy/",
    privacyEmail: "privacy@dialogtech.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  RINGBA_DATA: {
    name: "Ringba",
    optOutUrl: "https://www.ringba.com/privacy/",
    privacyEmail: "privacy@ringba.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CONVIRZA_DATA: {
    name: "Convirza",
    optOutUrl: "https://www.convirza.com/privacy-policy/",
    privacyEmail: "privacy@convirza.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // International People Search - Asia Pacific
  PIPL_APAC: {
    name: "Pipl Asia Pacific",
    optOutUrl: "https://pipl.com/privacy-policy/",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  WHITEPAGES_AUSTRALIA: {
    name: "White Pages Australia",
    optOutUrl: "https://www.whitepages.com.au/privacy",
    privacyEmail: "privacy@whitepages.com.au",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YELLOWPAGES_AU: {
    name: "Yellow Pages Australia",
    optOutUrl: "https://www.yellowpages.com.au/privacy",
    privacyEmail: "privacy@sensis.com.au",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  LOCALSEARCH_AU: {
    name: "Localsearch Australia",
    optOutUrl: "https://www.localsearch.com.au/privacy",
    privacyEmail: "privacy@localsearch.com.au",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TRUELOCAL_AU: {
    name: "TrueLocal Australia",
    optOutUrl: "https://www.truelocal.com.au/privacy",
    privacyEmail: "privacy@truelocal.com.au",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  WHITEPAGES_NEWZEALAND: {
    name: "White Pages New Zealand",
    optOutUrl: "https://whitepages.co.nz/privacy",
    privacyEmail: "privacy@whitepages.co.nz",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YELLOWPAGES_NZ: {
    name: "Yellow Pages New Zealand",
    optOutUrl: "https://yellow.co.nz/privacy",
    privacyEmail: "privacy@yellow.co.nz",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  FINDA_NZ: {
    name: "Finda New Zealand",
    optOutUrl: "https://www.finda.co.nz/privacy",
    privacyEmail: "privacy@finda.co.nz",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  JUSTDIAL_IN: {
    name: "JustDial India",
    optOutUrl: "https://www.justdial.com/Privacy-Policy",
    privacyEmail: "privacy@justdial.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SULEKHA_IN: {
    name: "Sulekha India",
    optOutUrl: "https://www.sulekha.com/privacy-policy",
    privacyEmail: "privacy@sulekha.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // International People Search - Latin America
  PAGINASAMARILLAS_MX: {
    name: "Paginas Amarillas Mexico",
    optOutUrl: "https://www.paginasamarillas.com.mx/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.mx",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  SECCIONAMARILLA_MX: {
    name: "Seccion Amarilla Mexico",
    optOutUrl: "https://www.seccionamarilla.com.mx/privacidad",
    privacyEmail: "privacidad@seccionamarilla.com.mx",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TELELISTAS_BR: {
    name: "TeleListas Brazil",
    optOutUrl: "https://www.telelistas.net/privacidade",
    privacyEmail: "privacidade@telelistas.net",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  LISTASAMARILLAS_BR: {
    name: "Listas Amarillas Brazil",
    optOutUrl: "https://www.listasamarillas.com.br/privacidade",
    privacyEmail: "privacidade@listasamarillas.com.br",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_AR: {
    name: "Paginas Amarillas Argentina",
    optOutUrl: "https://www.paginasamarillas.com.ar/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.ar",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_CL: {
    name: "Paginas Amarillas Chile",
    optOutUrl: "https://www.paginasamarillas.cl/privacidad",
    privacyEmail: "privacidad@paginasamarillas.cl",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_CO: {
    name: "Paginas Amarillas Colombia",
    optOutUrl: "https://www.paginasamarillas.com.co/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.co",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_PE: {
    name: "Paginas Amarillas Peru",
    optOutUrl: "https://www.paginasamarillas.com.pe/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.pe",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CIUDAD_CL: {
    name: "Ciudad.cl Chile",
    optOutUrl: "https://www.ciudad.cl/privacidad",
    privacyEmail: "privacidad@ciudad.cl",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  GUIAMAIS_BR: {
    name: "Guia Mais Brazil",
    optOutUrl: "https://www.guiamais.com.br/privacidade",
    privacyEmail: "privacidade@guiamais.com.br",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // International People Search - Middle East & Africa
  YELLOWPAGES_ZA: {
    name: "Yellow Pages South Africa",
    optOutUrl: "https://www.yellowpages.co.za/privacy",
    privacyEmail: "privacy@yellowpages.co.za",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  WHITEPAGES_ZA: {
    name: "White Pages South Africa",
    optOutUrl: "https://www.whitepages.co.za/privacy",
    privacyEmail: "privacy@whitepages.co.za",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YELLOWPAGES_AE: {
    name: "Yellow Pages UAE",
    optOutUrl: "https://www.yellowpages.ae/privacy",
    privacyEmail: "privacy@yellowpages.ae",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YELLOWPAGES_SA: {
    name: "Yellow Pages Saudi Arabia",
    optOutUrl: "https://www.yellowpages.com.sa/privacy",
    privacyEmail: "privacy@yellowpages.com.sa",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YELLOWPAGES_EG: {
    name: "Yellow Pages Egypt",
    optOutUrl: "https://www.yellowpages.com.eg/privacy",
    privacyEmail: "privacy@yellowpages.com.eg",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  D144_EG: {
    name: "D144 Egypt",
    optOutUrl: "https://www.d144.com.eg/privacy",
    privacyEmail: "privacy@d144.com.eg",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  BEBEO_SA: {
    name: "Bebeo Saudi Arabia",
    optOutUrl: "https://www.bebeo.sa/privacy",
    privacyEmail: "privacy@bebeo.sa",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_NG: {
    name: "Yellow Pages Nigeria",
    optOutUrl: "https://www.yellowpages.ng/privacy",
    privacyEmail: "privacy@yellowpages.ng",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  BUSINESSLIST_KE: {
    name: "Business List Kenya",
    optOutUrl: "https://www.businesslist.co.ke/privacy",
    privacyEmail: "privacy@businesslist.co.ke",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_MA: {
    name: "Yellow Pages Morocco",
    optOutUrl: "https://www.yellowpages.ma/privacy",
    privacyEmail: "privacy@yellowpages.ma",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // Specialty Data Providers
  DATALOGIX_ORACLE: {
    name: "Datalogix (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  MERKLE_DATA: {
    name: "Merkle Data",
    optOutUrl: "https://www.merkle.com/privacy",
    privacyEmail: "privacy@merkle.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CROSSIX: {
    name: "Crossix (Veeva)",
    optOutUrl: "https://www.veeva.com/privacy/",
    privacyEmail: "privacy@crossix.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HEALTHVERITY: {
    name: "HealthVerity",
    optOutUrl: "https://healthverity.com/privacy-policy/",
    privacyEmail: "privacy@healthverity.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  KOMODO_HEALTH: {
    name: "Komodo Health",
    optOutUrl: "https://www.komodohealth.com/privacy",
    privacyEmail: "privacy@komodohealth.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SYMPHONY_HEALTH: {
    name: "Symphony Health (IQVIA)",
    optOutUrl: "https://www.iqvia.com/about-us/privacy",
    privacyEmail: "privacy@symphonyhealth.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PULSEPOINTLIFE: {
    name: "PulsePoint Life Sciences",
    optOutUrl: "https://www.pulsepoint.com/privacy-policy",
    privacyEmail: "privacy@pulsepoint.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ADTHEORENT: {
    name: "AdTheorent",
    optOutUrl: "https://www.adtheorent.com/privacy-policy/",
    privacyEmail: "privacy@adtheorent.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DIGITALENVOY: {
    name: "Digital Envoy",
    optOutUrl: "https://www.digitalenvoy.com/privacy-policy/",
    privacyEmail: "privacy@digitalenvoy.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  MAXMIND: {
    name: "MaxMind",
    optOutUrl: "https://www.maxmind.com/en/privacy-policy",
    privacyEmail: "privacy@maxmind.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // ADDITIONAL DATA BROKERS - v1.19.0 (1000 MILESTONE)
  // ==========================================

  // Additional Background Check Services
  GOODHIRE_BG: {
    name: "GoodHire",
    optOutUrl: "https://www.goodhire.com/privacy/",
    privacyEmail: "privacy@goodhire.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CRIMCHECK: {
    name: "CrimCheck",
    optOutUrl: "https://www.crimcheck.com/privacy/",
    privacyEmail: "privacy@crimcheck.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  VERIFIED_FIRST: {
    name: "Verified First",
    optOutUrl: "https://www.verifiedfirst.com/privacy/",
    privacyEmail: "privacy@verifiedfirst.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ORANGE_TREE: {
    name: "Orange Tree Employment Screening",
    optOutUrl: "https://www.orangetreescreening.com/privacy/",
    privacyEmail: "privacy@orangetreescreening.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ASURINT: {
    name: "Asurint",
    optOutUrl: "https://www.asurint.com/privacy/",
    privacyEmail: "privacy@asurint.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Additional Consumer Data Providers
  INFUTOR_DATA: {
    name: "Infutor Data Solutions",
    optOutUrl: "https://www.infutor.com/privacy/",
    privacyEmail: "privacy@infutor.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  WEBBULA: {
    name: "Webbula",
    optOutUrl: "https://webbula.com/privacy/",
    privacyEmail: "privacy@webbula.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DATAAXLE: {
    name: "Data Axle (formerly Infogroup)",
    optOutUrl: "https://www.data-axle.com/privacy/",
    privacyEmail: "privacy@data-axle.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  THROTLE: {
    name: "Throtle",
    optOutUrl: "https://throtle.io/privacy/",
    privacyEmail: "privacy@throtle.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SEMCASTING: {
    name: "Semcasting",
    optOutUrl: "https://semcasting.com/privacy/",
    privacyEmail: "privacy@semcasting.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Additional Real Estate & Property
  LISTHUB: {
    name: "ListHub",
    optOutUrl: "https://www.listhub.com/privacy/",
    privacyEmail: "privacy@listhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEBOT: {
    name: "Homebot",
    optOutUrl: "https://homebot.ai/privacy/",
    privacyEmail: "privacy@homebot.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  QUANTARIUM: {
    name: "Quantarium",
    optOutUrl: "https://www.quantarium.com/privacy/",
    privacyEmail: "privacy@quantarium.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOUSECANARY: {
    name: "HouseCanary",
    optOutUrl: "https://www.housecanary.com/privacy/",
    privacyEmail: "privacy@housecanary.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEUNION: {
    name: "HomeUnion",
    optOutUrl: "https://www.homeunion.com/privacy/",
    privacyEmail: "privacy@homeunion.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Additional Phone & Identity
  WHITECALLER: {
    name: "WhiteCaller",
    optOutUrl: "https://whitecaller.com/privacy/",
    privacyEmail: "support@whitecaller.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PHONEBOOK_OF_THE_WORLD: {
    name: "Phonebook of the World",
    optOutUrl: "https://phonebookoftheworld.com/privacy/",
    privacyEmail: "support@phonebookoftheworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CALLER_ID_SERVICE: {
    name: "CallerID Service",
    optOutUrl: "https://calleridservice.com/privacy/",
    privacyEmail: "support@calleridservice.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PHONEINFO: {
    name: "PhoneInfo",
    optOutUrl: "https://phoneinfo.io/privacy/",
    privacyEmail: "privacy@phoneinfo.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PHONEDETECTIVE: {
    name: "Phone Detective",
    optOutUrl: "https://www.phonedetective.com/privacy/",
    privacyEmail: "privacy@phonedetective.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // Additional International - Europe
  INFOBEL_EU: {
    name: "Infobel Europe",
    optOutUrl: "https://www.infobel.com/privacy/",
    privacyEmail: "privacy@infobel.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EUROPAGES: {
    name: "Europages",
    optOutUrl: "https://www.europages.com/privacy/",
    privacyEmail: "privacy@europages.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  KOMPASS_EU: {
    name: "Kompass Europe",
    optOutUrl: "https://www.kompass.com/privacy/",
    privacyEmail: "privacy@kompass.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  HOTFROG_EU: {
    name: "Hotfrog Europe",
    optOutUrl: "https://www.hotfrog.com/privacy/",
    privacyEmail: "privacy@hotfrog.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CYLEX_EU: {
    name: "Cylex Europe",
    optOutUrl: "https://www.cylex.com/privacy/",
    privacyEmail: "privacy@cylex.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Additional Business Intelligence
  OWLER_DATA: {
    name: "Owler",
    optOutUrl: "https://www.owler.com/privacy/",
    privacyEmail: "privacy@owler.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CRUNCHBASE_DATA: {
    name: "Crunchbase",
    optOutUrl: "https://www.crunchbase.com/privacy/",
    privacyEmail: "privacy@crunchbase.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PITCHBOOK: {
    name: "PitchBook",
    optOutUrl: "https://pitchbook.com/privacy/",
    privacyEmail: "privacy@pitchbook.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CB_INSIGHTS: {
    name: "CB Insights",
    optOutUrl: "https://www.cbinsights.com/privacy/",
    privacyEmail: "privacy@cbinsights.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PRIVCO: {
    name: "PrivCo",
    optOutUrl: "https://www.privco.com/privacy/",
    privacyEmail: "privacy@privco.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Additional Professional Directories
  AVVO_LEGAL: {
    name: "Avvo",
    optOutUrl: "https://www.avvo.com/privacy/",
    privacyEmail: "privacy@avvo.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  MARTINDALE: {
    name: "Martindale-Hubbell",
    optOutUrl: "https://www.martindale.com/privacy/",
    privacyEmail: "privacy@martindale.com",
    removalMethod: "FORM",
    estimatedDays: 21,
  },
  FINDLAW_DIR: {
    name: "FindLaw Directory",
    optOutUrl: "https://www.findlaw.com/privacy/",
    privacyEmail: "privacy@findlaw.com",
    removalMethod: "FORM",
    estimatedDays: 21,
  },
  LAWYERS_COM: {
    name: "Lawyers.com",
    optOutUrl: "https://www.lawyers.com/privacy/",
    privacyEmail: "privacy@lawyers.com",
    removalMethod: "FORM",
    estimatedDays: 21,
  },
  JUSTIA_DIR: {
    name: "Justia Lawyer Directory",
    optOutUrl: "https://www.justia.com/privacy/",
    privacyEmail: "privacy@justia.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // Additional Advertising Data
  THE_TRADE_DESK_DATA: {
    name: "The Trade Desk",
    optOutUrl: "https://www.thetradedesk.com/privacy/",
    privacyEmail: "privacy@thetradedesk.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  BIDSWITCH: {
    name: "BidSwitch (IPONWEB)",
    optOutUrl: "https://www.bidswitch.com/privacy/",
    privacyEmail: "privacy@bidswitch.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SAMBA_TV: {
    name: "Samba TV",
    optOutUrl: "https://www.samba.tv/privacy/",
    privacyEmail: "privacy@samba.tv",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  VIZIO_INSCAPE: {
    name: "Vizio Inscape",
    optOutUrl: "https://www.vizio.com/privacy/",
    privacyEmail: "privacy@vizio.com",
    removalMethod: "FORM",
    estimatedDays: 21,
  },
  AUTOMATIC_TV: {
    name: "Automatic (TV Data)",
    optOutUrl: "https://automatic.com/privacy/",
    privacyEmail: "privacy@automatic.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Additional Retail Data
  SHOPPERTRACK: {
    name: "ShopperTrak",
    optOutUrl: "https://www.shoppertrak.com/privacy/",
    privacyEmail: "privacy@shoppertrak.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PRICESPIDER: {
    name: "PriceSpider",
    optOutUrl: "https://www.pricespider.com/privacy/",
    privacyEmail: "privacy@pricespider.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BAZAARVOICE: {
    name: "Bazaarvoice",
    optOutUrl: "https://www.bazaarvoice.com/privacy/",
    privacyEmail: "privacy@bazaarvoice.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  POWER_REVIEWS: {
    name: "PowerReviews",
    optOutUrl: "https://www.powerreviews.com/privacy/",
    privacyEmail: "privacy@powerreviews.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  YOTPO_DATA: {
    name: "Yotpo",
    optOutUrl: "https://www.yotpo.com/privacy/",
    privacyEmail: "privacy@yotpo.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // DARK WEB MONITORING SERVICES
  // ==========================================
  SPYCLOUD: {
    name: "SpyCloud",
    optOutUrl: "https://spycloud.com/consumer-portal/",
    privacyEmail: "privacy@spycloud.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web breach monitoring and identity exposure alerts",
  },
  RECORDED_FUTURE: {
    name: "Recorded Future",
    optOutUrl: "https://www.recordedfuture.com/privacy-policy",
    privacyEmail: "privacy@recordedfuture.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence including dark web monitoring",
  },
  DARKOWL: {
    name: "DarkOwl",
    optOutUrl: "https://www.darkowl.com/privacy",
    privacyEmail: "privacy@darkowl.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web intelligence and data exposure monitoring",
  },
  FLASHPOINT: {
    name: "Flashpoint",
    optOutUrl: "https://flashpoint.io/privacy-policy/",
    privacyEmail: "privacy@flashpoint.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web threat intelligence platform",
  },
  INTEL471: {
    name: "Intel 471",
    optOutUrl: "https://intel471.com/privacy-policy",
    privacyEmail: "privacy@intel471.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Underground cyber intelligence",
  },
  SIXGILL: {
    name: "Sixgill",
    optOutUrl: "https://www.cybersixgill.com/privacy-policy/",
    privacyEmail: "privacy@cybersixgill.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Deep and dark web threat intelligence",
  },
  KELA: {
    name: "KELA Cyber Intelligence",
    optOutUrl: "https://ke-la.com/privacy-policy/",
    privacyEmail: "privacy@ke-la.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Targeted dark web monitoring",
  },
  DIGITAL_SHADOWS: {
    name: "Digital Shadows (ReliaQuest)",
    optOutUrl: "https://www.reliaquest.com/privacy-policy/",
    privacyEmail: "privacy@digitalshadows.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Digital risk protection and dark web monitoring",
  },
  ZEROFOX: {
    name: "ZeroFox",
    optOutUrl: "https://www.zerofox.com/privacy-policy/",
    privacyEmail: "privacy@zerofox.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "External threat intelligence and dark web monitoring",
  },
  CYBERINT: {
    name: "Cyberint",
    optOutUrl: "https://cyberint.com/privacy-policy/",
    privacyEmail: "privacy@cyberint.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence and dark web monitoring",
  },
  CONSTELLA: {
    name: "Constella Intelligence",
    optOutUrl: "https://constella.ai/privacy-policy/",
    privacyEmail: "privacy@constella.ai",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity exposure and dark web breach detection",
  },
  SOCRADAR: {
    name: "SOCRadar",
    optOutUrl: "https://socradar.io/privacy-policy/",
    privacyEmail: "privacy@socradar.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Extended threat intelligence with dark web coverage",
  },

  // ==========================================
  // BREACH NOTIFICATION & LEAK DATABASES
  // ==========================================
  BREACHSENSE: {
    name: "BreachSense",
    optOutUrl: "https://breachsense.io/privacy",
    privacyEmail: "privacy@breachsense.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Credential breach monitoring",
  },
  LEAKPEEK: {
    name: "LeakPeek",
    optOutUrl: "https://leakpeek.com/privacy",
    privacyEmail: "privacy@leakpeek.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Data leak search engine",
  },
  LEAKIX: {
    name: "LeakIX",
    optOutUrl: "https://leakix.net/privacy",
    privacyEmail: "privacy@leakix.net",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Internet-wide data leak detection",
  },
  INTELLIGENCE_X: {
    name: "Intelligence X",
    optOutUrl: "https://intelx.io/privacy-policy",
    privacyEmail: "privacy@intelx.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web and breach data search engine",
  },
  NUCLEON: {
    name: "Nucleon Cyber",
    optOutUrl: "https://nucleon.io/privacy",
    privacyEmail: "privacy@nucleon.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked credentials monitoring",
  },
  SCYLLA_SH: {
    name: "Scylla.sh",
    optOutUrl: "https://scylla.sh/privacy",
    privacyEmail: "privacy@scylla.sh",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Breach database search",
  },
  HASHES_ORG: {
    name: "Hashes.org",
    optOutUrl: "https://hashes.org/privacy.php",
    privacyEmail: "privacy@hashes.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Password hash database",
  },
  WELEAKINFO: {
    name: "WeLeakInfo (Successor)",
    optOutUrl: "https://weleakinfo.to/privacy",
    privacyEmail: "privacy@weleakinfo.to",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Breach compilation database",
  },
  BREACHDIRECTORY: {
    name: "BreachDirectory",
    optOutUrl: "https://breachdirectory.org/privacy",
    privacyEmail: "privacy@breachdirectory.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Free breach checking service",
  },
  LEAKBASE: {
    name: "LeakBase",
    optOutUrl: "https://leakbase.io/privacy",
    privacyEmail: "privacy@leakbase.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Data breach compilation",
  },

  // ==========================================
  // PASTE SITE MONITORS
  // ==========================================
  PASTEBIN_MONITOR: {
    name: "Pastebin Monitor",
    optOutUrl: "https://pastebin.com/doc_privacy_statement",
    privacyEmail: "privacy@pastebin.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Primary paste site - often used for leaked data",
  },
  GHOSTBIN_MONITOR: {
    name: "Ghostbin Monitor",
    optOutUrl: "https://ghostbin.com/privacy",
    privacyEmail: "privacy@ghostbin.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Anonymous paste site monitoring",
  },
  DPASTE_MONITOR: {
    name: "Dpaste Monitor",
    optOutUrl: "https://dpaste.com/privacy",
    privacyEmail: "privacy@dpaste.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Developer paste site",
  },
  HASTEBIN_MONITOR: {
    name: "Hastebin Monitor",
    optOutUrl: "https://hastebin.com/privacy",
    privacyEmail: "privacy@hastebin.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fast paste site monitoring",
  },
  PASTECODE_MONITOR: {
    name: "Pastecode Monitor",
    optOutUrl: "https://pastecode.io/privacy",
    privacyEmail: "privacy@pastecode.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Code paste site monitoring",
  },
  JUSTPASTE_MONITOR: {
    name: "JustPaste.it Monitor",
    optOutUrl: "https://justpaste.it/privacy",
    privacyEmail: "privacy@justpaste.it",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Anonymous paste site",
  },
  CONTROLC_MONITOR: {
    name: "ControlC Monitor",
    optOutUrl: "https://controlc.com/privacy",
    privacyEmail: "privacy@controlc.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Text sharing site",
  },
  CODEPAD_MONITOR: {
    name: "Codepad Monitor",
    optOutUrl: "https://codepad.org/privacy",
    privacyEmail: "privacy@codepad.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Code execution paste site",
  },
  IDEONE_MONITOR: {
    name: "Ideone Monitor",
    optOutUrl: "https://ideone.com/privacy",
    privacyEmail: "privacy@ideone.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Online compiler and paste site",
  },
  SLEXY_MONITOR: {
    name: "Slexy Monitor",
    optOutUrl: "https://slexy.org/privacy",
    privacyEmail: "privacy@slexy.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Syntax highlighting paste site",
  },

  // ==========================================
  // DARK WEB MARKETPLACE MONITORS
  // ==========================================
  DARKMARKET_MONITOR: {
    name: "Dark Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors dark web marketplaces for stolen data listings",
  },
  GENESIS_MARKET_MONITOR: {
    name: "Genesis Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bot marketplace monitoring for stolen credentials",
  },
  RUSSIAN_MARKET_MONITOR: {
    name: "Russian Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Russian-language dark web markets",
  },
  EXPLOIT_FORUM_MONITOR: {
    name: "Exploit Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian cybercrime forum monitoring",
  },
  XSS_FORUM_MONITOR: {
    name: "XSS Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian hacking forum monitoring",
  },
  BREACHFORUMS_MONITOR: {
    name: "BreachForums Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Data breach trading forum",
  },
  RAIDFORUMS_SUCCESSOR_MONITOR: {
    name: "RaidForums Successor Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors successors to RaidForums",
  },
  NULLED_FORUM_MONITOR: {
    name: "Nulled Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cracking forum monitoring",
  },
  CRACKED_FORUM_MONITOR: {
    name: "Cracked Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hacking community monitoring",
  },
  SINISTER_FORUM_MONITOR: {
    name: "Sinister Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Underground forum monitoring",
  },
  DREAD_FORUM_MONITOR: {
    name: "Dread Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web Reddit-style forum",
  },
  ALPHABAY_MONITOR: {
    name: "AlphaBay Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major dark web marketplace monitoring",
  },
  VERSUS_MARKET_MONITOR: {
    name: "Versus Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },
  KINGDOM_MARKET_MONITOR: {
    name: "Kingdom Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },
  BOHEMIA_MARKET_MONITOR: {
    name: "Bohemia Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },

  // ==========================================
  // CREDENTIAL MONITORING SERVICES
  // ==========================================
  FIREFOX_MONITOR: {
    name: "Firefox Monitor",
    optOutUrl: "https://monitor.firefox.com/privacy",
    privacyEmail: "privacy@mozilla.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mozilla's breach notification service",
  },
  GOOGLE_PASSWORD_CHECKUP: {
    name: "Google Password Checkup",
    optOutUrl: "https://passwords.google.com/",
    privacyEmail: "privacy@google.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google's credential breach detection",
  },
  APPLE_SECURITY_RECOMMENDATIONS: {
    name: "Apple Security Recommendations",
    optOutUrl: "https://support.apple.com/privacy",
    privacyEmail: "privacy@apple.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Apple's password security monitoring",
  },
  IDENTITY_GUARD: {
    name: "Identity Guard",
    optOutUrl: "https://www.identityguard.com/privacy-policy",
    privacyEmail: "privacy@identityguard.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity theft protection with dark web monitoring",
  },
  LIFELOCK: {
    name: "LifeLock (Norton)",
    optOutUrl: "https://www.lifelock.com/legal/privacy-policy",
    privacyEmail: "privacy@lifelock.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity theft protection service",
  },
  IDENTITYFORCE: {
    name: "IdentityForce",
    optOutUrl: "https://www.identityforce.com/privacy-policy",
    privacyEmail: "privacy@identityforce.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity protection and dark web monitoring",
  },
  AURA_IDENTITY: {
    name: "Aura Identity",
    optOutUrl: "https://www.aura.com/legal/privacy-policy",
    privacyEmail: "privacy@aura.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "All-in-one identity protection",
  },
  EXPERIAN_DARK_WEB: {
    name: "Experian Dark Web Scan",
    optOutUrl: "https://www.experian.com/privacy/",
    privacyEmail: "privacy@experian.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Experian's dark web surveillance",
  },
  TRANSUNION_DARK_WEB: {
    name: "TransUnion Dark Web Monitoring",
    optOutUrl: "https://www.transunion.com/privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "TransUnion's dark web monitoring",
  },
  EQUIFAX_DARK_WEB: {
    name: "Equifax Dark Web Monitoring",
    optOutUrl: "https://www.equifax.com/privacy/",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Equifax's dark web monitoring",
  },
  MCAFEE_IDENTITY: {
    name: "McAfee Identity Protection",
    optOutUrl: "https://www.mcafee.com/consumer/privacy.html",
    privacyEmail: "privacy@mcafee.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "McAfee's identity and dark web monitoring",
  },
  BITDEFENDER_IDENTITY: {
    name: "Bitdefender Digital Identity",
    optOutUrl: "https://www.bitdefender.com/privacy/",
    privacyEmail: "privacy@bitdefender.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bitdefender's identity protection",
  },
  NORTON_DARK_WEB: {
    name: "Norton Dark Web Monitoring",
    optOutUrl: "https://www.norton.com/privacy",
    privacyEmail: "privacy@nortonlifelock.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Norton's dark web surveillance",
  },
  AVAST_BREACHGUARD: {
    name: "Avast BreachGuard",
    optOutUrl: "https://www.avast.com/privacy-policy",
    privacyEmail: "privacy@avast.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Avast's data breach monitoring",
  },

  // ==========================================
  // DARK WEB SEARCH ENGINES
  // ==========================================
  AHMIA_SEARCH: {
    name: "Ahmia Search Engine",
    optOutUrl: "https://ahmia.fi/policy/",
    privacyEmail: "privacy@ahmia.fi",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tor hidden services search engine",
  },
  TORCH_SEARCH: {
    name: "Torch Search Engine",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web search engine",
  },
  NOTEVIL_SEARCH: {
    name: "NotEvil Search",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tor network search engine",
  },
  HAYSTAK_SEARCH: {
    name: "Haystak Search",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web indexed content search",
  },
  DARKSEARCH_IO: {
    name: "DarkSearch.io",
    optOutUrl: "https://darksearch.io/privacy",
    privacyEmail: "privacy@darksearch.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web search API",
  },
  ONION_SEARCH: {
    name: "Onion Search Engine",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Onion sites indexer",
  },

  // ==========================================
  // STEALER LOG MONITORS
  // ==========================================
  REDLINE_STEALER_MONITOR: {
    name: "RedLine Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors for RedLine stealer log dumps",
  },
  RACCOON_STEALER_MONITOR: {
    name: "Raccoon Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Raccoon stealer malware logs",
  },
  VIDAR_STEALER_MONITOR: {
    name: "Vidar Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Vidar stealer log dumps",
  },
  AZORULT_MONITOR: {
    name: "AZORult Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "AZORult malware log monitoring",
  },
  TAURUS_STEALER_MONITOR: {
    name: "Taurus Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Taurus stealer log dumps",
  },
  LUMMA_STEALER_MONITOR: {
    name: "Lumma Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Lumma stealer credentials monitoring",
  },
  TITAN_STEALER_MONITOR: {
    name: "Titan Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Titan stealer log monitoring",
  },
  STEALC_MONITOR: {
    name: "StealC Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "StealC malware log detection",
  },

  // ==========================================
  // RANSOMWARE LEAK SITE MONITORS
  // ==========================================
  LOCKBIT_LEAK_MONITOR: {
    name: "LockBit Leak Site Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors LockBit ransomware data leaks",
  },
  ALPHV_LEAK_MONITOR: {
    name: "ALPHV/BlackCat Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors ALPHV ransomware data leaks",
  },
  CLOP_LEAK_MONITOR: {
    name: "Cl0p Leak Site Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Cl0p ransomware victim data",
  },
  BLACKBASTA_LEAK_MONITOR: {
    name: "Black Basta Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Black Basta ransomware leak monitoring",
  },
  PLAY_RANSOMWARE_MONITOR: {
    name: "Play Ransomware Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Play ransomware leak site monitoring",
  },
  ROYAL_RANSOMWARE_MONITOR: {
    name: "Royal Ransomware Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Royal ransomware leak monitoring",
  },
  BIANLIAN_LEAK_MONITOR: {
    name: "BianLian Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "BianLian ransomware leak site",
  },
  AKIRA_RANSOMWARE_MONITOR: {
    name: "Akira Ransomware Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Akira ransomware leak monitoring",
  },
  MEDUSA_LEAK_MONITOR: {
    name: "Medusa Leak Site Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Medusa ransomware leak monitoring",
  },
  RHYSIDA_LEAK_MONITOR: {
    name: "Rhysida Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Rhysida ransomware leak site",
  },

  // ==========================================
  // TELEGRAM & CHAT MONITORS
  // ==========================================
  TELEGRAM_LEAK_CHANNELS: {
    name: "Telegram Leak Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Telegram channels sharing leaked data",
  },
  TELEGRAM_COMBOLIST: {
    name: "Telegram Combolist Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Credential combo list sharing channels",
  },
  TELEGRAM_STEALER_LOGS: {
    name: "Telegram Stealer Log Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stealer log distribution channels",
  },
  DISCORD_LEAK_SERVERS: {
    name: "Discord Leak Servers",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Discord servers sharing leaked credentials",
  },
  IRC_UNDERGROUND_CHANNELS: {
    name: "IRC Underground Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IRC channels for data trading",
  },
  JABBER_XMPP_NETWORKS: {
    name: "Jabber/XMPP Networks",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "XMPP networks used by cybercriminals",
  },

  // ==========================================
  // COMBOLIST & CREDENTIAL MARKETS
  // ==========================================
  COMBOLIST_MONITOR: {
    name: "Combolist Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors credential combination lists",
  },
  LOGS_MARKET_MONITOR: {
    name: "Logs Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bot and stealer log marketplaces",
  },
  FULLZ_MARKET_MONITOR: {
    name: "Fullz Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Full identity data (fullz) markets",
  },
  SSN_DOB_MARKET_MONITOR: {
    name: "SSN/DOB Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Social Security and DOB trading",
  },
  CREDIT_CARD_SHOP_MONITOR: {
    name: "Credit Card Shop Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen credit card marketplaces",
  },
  BANK_LOG_MARKET_MONITOR: {
    name: "Bank Log Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Banking credential markets",
  },
  ACCOUNT_SHOP_MONITOR: {
    name: "Account Shop Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen account marketplaces",
  },
  CRYPTO_WALLET_MARKET_MONITOR: {
    name: "Crypto Wallet Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency wallet theft markets",
  },
  EMAIL_2_SMS_GATEWAY_MONITOR: {
    name: "Email-to-SMS Gateway Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors for phone number exposure via gateway leaks",
  },

  // ==========================================
  // ADDITIONAL DARK WEB THREAT INTEL PLATFORMS
  // ==========================================
  MANDIANT_THREAT_INTEL: {
    name: "Mandiant Threat Intelligence",
    optOutUrl: "https://www.mandiant.com/privacy",
    privacyEmail: "privacy@mandiant.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google-owned threat intelligence platform",
  },
  CROWDSTRIKE_FALCON_X: {
    name: "CrowdStrike Falcon X",
    optOutUrl: "https://www.crowdstrike.com/privacy-notice/",
    privacyEmail: "privacy@crowdstrike.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence and dark web monitoring",
  },
  PALO_ALTO_UNIT42: {
    name: "Palo Alto Unit 42",
    optOutUrl: "https://www.paloaltonetworks.com/privacy",
    privacyEmail: "privacy@paloaltonetworks.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat research and dark web intelligence",
  },
  CISCO_TALOS: {
    name: "Cisco Talos Intelligence",
    optOutUrl: "https://www.cisco.com/c/en/us/about/legal/privacy-full.html",
    privacyEmail: "privacy@cisco.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence with dark web coverage",
  },
  PROOFPOINT_THREAT: {
    name: "Proofpoint Threat Intelligence",
    optOutUrl: "https://www.proofpoint.com/us/privacy-policy",
    privacyEmail: "privacy@proofpoint.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Email and dark web threat detection",
  },
  TRELLIX_INSIGHTS: {
    name: "Trellix Threat Intelligence",
    optOutUrl: "https://www.trellix.com/en-us/privacy.html",
    privacyEmail: "privacy@trellix.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Advanced threat intelligence platform",
  },
  SECUREWORKS_CTU: {
    name: "Secureworks Counter Threat Unit",
    optOutUrl: "https://www.secureworks.com/privacy-policy",
    privacyEmail: "privacy@secureworks.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web and underground monitoring",
  },
  ANOMALI_THREATSTREAM: {
    name: "Anomali ThreatStream",
    optOutUrl: "https://www.anomali.com/privacy-policy",
    privacyEmail: "privacy@anomali.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence platform",
  },
  THREATCONNECT: {
    name: "ThreatConnect",
    optOutUrl: "https://threatconnect.com/privacy-policy/",
    privacyEmail: "privacy@threatconnect.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence operations",
  },
  LOOKOUT_THREAT: {
    name: "Lookout Threat Lab",
    optOutUrl: "https://www.lookout.com/privacy-policy",
    privacyEmail: "privacy@lookout.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mobile and dark web threat intelligence",
  },

  // ==========================================
  // MORE BREACH AGGREGATORS & LEAK SITES
  // ==========================================
  LEAKED_SOURCE: {
    name: "Leaked.Source (Archives)",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Historical breach database archives",
  },
  COMB_MONITOR: {
    name: "COMB Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Compilation of Many Breaches monitoring",
  },
  ANTIPUBLIC_MONITOR: {
    name: "Anti Public Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major breach compilation monitoring",
  },
  EXPLOIT_IN_MONITOR: {
    name: "Exploit.in Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major breach database monitoring",
  },
  COLLECTION_MONITOR: {
    name: "Collection #1-5 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mega breach collections monitoring",
  },
  PEMIBLANC_MONITOR: {
    name: "Pemiblanc Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "French breach database monitoring",
  },
  LEAKEDSOURCE_ARCHIVES: {
    name: "LeakedSource Archives",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Historical breach data archives",
  },
  BREACH_COMPILATION: {
    name: "Breach Compilation Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Multi-source breach compilations",
  },
  MAILRU_BREACH_MONITOR: {
    name: "Mail.ru Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian email service breach monitoring",
  },
  RAMBLER_BREACH_MONITOR: {
    name: "Rambler Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian portal breach monitoring",
  },

  // ==========================================
  // MORE PASTE SITES & CODE SHARING
  // ==========================================
  RENTRY_MONITOR: {
    name: "Rentry.co Monitor",
    optOutUrl: "https://rentry.co/privacy",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Markdown paste site monitoring",
  },
  PRIVATEBIN_MONITOR: {
    name: "PrivateBin Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Encrypted paste site monitoring",
  },
  ZEROBIN_MONITOR: {
    name: "ZeroBin Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Zero-knowledge paste site",
  },
  TELEGRA_PH_MONITOR: {
    name: "Telegraph Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Telegram publishing platform",
  },
  SNIPPET_HOST_MONITOR: {
    name: "Snippet.host Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Code snippet sharing monitoring",
  },
  TOPTAL_PASTE_MONITOR: {
    name: "Toptal Paste Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Developer paste site monitoring",
  },
  PASTE2_MONITOR: {
    name: "Paste2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Alternative paste site",
  },
  PASTEALL_MONITOR: {
    name: "PasteAll Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Multi-format paste monitoring",
  },
  DEFUSE_PASTE_MONITOR: {
    name: "Defuse Paste Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Encrypted paste monitoring",
  },
  DOXBIN_MONITOR: {
    name: "Doxbin Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Doxxing site monitoring - critical for personal info",
  },

  // ==========================================
  // MORE UNDERGROUND FORUMS
  // ==========================================
  HACKFORUMS_MONITOR: {
    name: "HackForums Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Script kiddie and hacking forum",
  },
  RAIDFORUMS_ARCHIVE: {
    name: "RaidForums Archive Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Archived RaidForums data",
  },
  OGUSERS_MONITOR: {
    name: "OGUsers Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Account trading forum",
  },
  LOLZTEAM_MONITOR: {
    name: "Lolz.team Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian cracking community",
  },
  BHFIO_MONITOR: {
    name: "BHF.io Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hacking forum monitoring",
  },
  WWH_CLUB_MONITOR: {
    name: "WWH Club Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Carding and fraud forum",
  },
  VERIFIED_FORUM_MONITOR: {
    name: "Verified Forum Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian cybercrime forum",
  },
  ANTICHAT_MONITOR: {
    name: "Antichat Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian security/hacking forum",
  },
  XAKEP_MONITOR: {
    name: "Xakep Forum Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian hacker magazine forum",
  },
  DARKODE_MONITOR: {
    name: "Darkode Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Elite hacking forum monitoring",
  },

  // ==========================================
  // MORE CARDING & FINANCIAL FRAUD SITES
  // ==========================================
  JOKER_STASH_MONITOR: {
    name: "Joker's Stash Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major carding marketplace (successor sites)",
  },
  RESCATOR_MONITOR: {
    name: "Rescator Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card shop monitoring",
  },
  FERUM_SHOP_MONITOR: {
    name: "FeRum Shop Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Carding shop monitoring",
  },
  UNICC_MONITOR: {
    name: "UniCC Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card marketplace monitoring",
  },
  BRIANKREBS_MONITOR: {
    name: "BriansClub Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major carding site monitoring",
  },
  VALIDCC_MONITOR: {
    name: "ValidCC Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card validation service monitoring",
  },
  SWIPE_STORE_MONITOR: {
    name: "Swipe Store Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card shop monitoring",
  },
  ALLWORLD_CARDS_MONITOR: {
    name: "AllWorld Cards Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Global carding marketplace",
  },
  YALE_LODGE_MONITOR: {
    name: "Yale Lodge Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fullz and card data marketplace",
  },
  TRUMP_DUMPS_MONITOR: {
    name: "Trump's Dumps Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card dump marketplace",
  },

  // ==========================================
  // MORE STEALER & MALWARE LOGS
  // ==========================================
  AURORA_STEALER_MONITOR: {
    name: "Aurora Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Aurora stealer log monitoring",
  },
  META_STEALER_MONITOR: {
    name: "META Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "META info stealer monitoring",
  },
  RHADAMANTHYS_MONITOR: {
    name: "Rhadamanthys Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Advanced stealer monitoring",
  },
  DARKCLOUD_STEALER_MONITOR: {
    name: "DarkCloud Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DarkCloud logs monitoring",
  },
  PRYNT_STEALER_MONITOR: {
    name: "Prynt Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Prynt info stealer logs",
  },
  WHITESNAKE_STEALER_MONITOR: {
    name: "WhiteSnake Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "WhiteSnake malware monitoring",
  },
  MYSTIC_STEALER_MONITOR: {
    name: "Mystic Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mystic stealer log detection",
  },
  RISEPRO_STEALER_MONITOR: {
    name: "RisePro Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "RisePro stealer monitoring",
  },
  STEALC_V2_MONITOR: {
    name: "StealC v2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "StealC version 2 monitoring",
  },
  XWORM_RAT_MONITOR: {
    name: "XWorm RAT Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "XWorm remote access trojan logs",
  },

  // ==========================================
  // MORE RANSOMWARE LEAK SITES
  // ==========================================
  HIVE_RANSOMWARE_MONITOR: {
    name: "Hive Ransomware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hive ransomware leak monitoring",
  },
  CONTI_LEAK_MONITOR: {
    name: "Conti Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Conti ransomware data leaks",
  },
  REVIL_LEAK_MONITOR: {
    name: "REvil/Sodinokibi Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "REvil ransomware leak site",
  },
  MAZE_LEAK_MONITOR: {
    name: "Maze Ransomware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Maze leak site monitoring",
  },
  NETWALKER_LEAK_MONITOR: {
    name: "NetWalker Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NetWalker ransomware leaks",
  },
  RAGNAR_LOCKER_MONITOR: {
    name: "Ragnar Locker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ragnar Locker leak monitoring",
  },
  AVOSLOCKER_MONITOR: {
    name: "AvosLocker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "AvosLocker ransomware leaks",
  },
  CUBA_RANSOMWARE_MONITOR: {
    name: "Cuba Ransomware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cuba ransomware leak site",
  },
  SNATCH_TEAM_MONITOR: {
    name: "Snatch Team Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Snatch ransomware monitoring",
  },
  VICE_SOCIETY_MONITOR: {
    name: "Vice Society Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Vice Society leak monitoring",
  },

  // ==========================================
  // TELEGRAM DARK WEB CHANNELS
  // ==========================================
  TELEGRAM_CREDIT_CARDS: {
    name: "Telegram CC Channels",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Credit card trading channels",
  },
  TELEGRAM_FULLZ_CHANNELS: {
    name: "Telegram Fullz Channels",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity data trading channels",
  },
  TELEGRAM_BANK_DROPS: {
    name: "Telegram Bank Drops",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bank drop channels monitoring",
  },
  TELEGRAM_SSN_CHANNELS: {
    name: "Telegram SSN Channels",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SSN trading channel monitoring",
  },
  TELEGRAM_LOGS_CLOUD: {
    name: "Telegram Logs Cloud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cloud stealer log channels",
  },
  TELEGRAM_RUSSIA_FRAUD: {
    name: "Telegram Russian Fraud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian-language fraud channels",
  },
  TELEGRAM_SPAM_TOOLS: {
    name: "Telegram Spam/Tools",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Spam tool and exploit channels",
  },
  TELEGRAM_CRYPTO_FRAUD: {
    name: "Telegram Crypto Fraud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency fraud channels",
  },
  TELEGRAM_SIM_SWAP: {
    name: "Telegram SIM Swap",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SIM swapping service channels",
  },
  TELEGRAM_DOCUMENTS: {
    name: "Telegram Document Fraud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fake document channels",
  },

  // ==========================================
  // IDENTITY VERIFICATION BREACHES
  // ==========================================
  KYC_BREACH_MONITOR: {
    name: "KYC Data Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Know Your Customer data leaks",
  },
  ID_DOCUMENT_MONITOR: {
    name: "ID Document Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Passport and ID leaks",
  },
  SELFIE_LEAK_MONITOR: {
    name: "Selfie/Photo ID Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity verification photo leaks",
  },
  DRIVERS_LICENSE_MONITOR: {
    name: "Drivers License Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DL data leak monitoring",
  },
  PASSPORT_LEAK_MONITOR: {
    name: "Passport Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Passport data monitoring",
  },

  // ==========================================
  // ADDITIONAL DARK WEB MARKETS
  // ==========================================
  INCOGNITO_MARKET_MONITOR: {
    name: "Incognito Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },
  ARCHETYP_MARKET_MONITOR: {
    name: "Archetyp Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },
  ABACUS_MARKET_MONITOR: {
    name: "Abacus Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },
  TOR2DOOR_MONITOR: {
    name: "Tor2Door Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },
  MEGA_DARKNET_MONITOR: {
    name: "MEGA Darknet Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian dark web marketplace",
  },
  HYDRA_SUCCESSOR_MONITOR: {
    name: "Hydra Successor Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hydra market successor monitoring",
  },
  OMGOMG_MARKET_MONITOR: {
    name: "OMG!OMG! Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian market monitoring",
  },
  BLACKSPRUT_MONITOR: {
    name: "Blacksprut Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian marketplace monitoring",
  },
  KRAKEN_DARKNET_MONITOR: {
    name: "Kraken Darknet Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian darknet market",
  },
  SOLARIS_MARKET_MONITOR: {
    name: "Solaris Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },

  // ==========================================
  // INITIAL ACCESS BROKER (IAB) MONITORS
  // ==========================================
  IAB_MARKET_MONITOR: {
    name: "IAB Marketplace Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Initial access broker marketplaces",
  },
  RDP_SHOP_MONITOR: {
    name: "RDP Shop Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Compromised RDP credential shops",
  },
  VPN_ACCESS_MONITOR: {
    name: "VPN Access Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen VPN credentials marketplace",
  },
  CITRIX_ACCESS_MONITOR: {
    name: "Citrix Access Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Compromised Citrix access sales",
  },
  WEBSHELL_MARKET_MONITOR: {
    name: "Webshell Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Webshell and backdoor marketplace",
  },
  PULSE_VPN_MONITOR: {
    name: "Pulse VPN Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Pulse Secure VPN credential leaks",
  },
  FORTINET_LEAK_MONITOR: {
    name: "Fortinet Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "FortiGate credential leak monitoring",
  },
  SSH_KEY_MARKET_MONITOR: {
    name: "SSH Key Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen SSH key marketplace",
  },
  AWS_CREDS_MONITOR: {
    name: "AWS Credentials Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked AWS access keys",
  },
  AZURE_CREDS_MONITOR: {
    name: "Azure Credentials Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked Azure credentials",
  },

  // ==========================================
  // BOTNET & MALWARE PANELS
  // ==========================================
  EMOTET_PANEL_MONITOR: {
    name: "Emotet Panel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Emotet botnet data monitoring",
  },
  TRICKBOT_MONITOR: {
    name: "TrickBot Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "TrickBot stolen data monitoring",
  },
  QAKBOT_MONITOR: {
    name: "QakBot Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "QakBot/Qbot data monitoring",
  },
  ICEDID_MONITOR: {
    name: "IcedID Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IcedID banking trojan logs",
  },
  DRIDEX_MONITOR: {
    name: "Dridex Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dridex banking malware",
  },
  BAZARLOADER_MONITOR: {
    name: "BazarLoader Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "BazarLoader infection data",
  },
  COBALT_STRIKE_MONITOR: {
    name: "Cobalt Strike Beacon Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cobalt Strike C2 victim data",
  },
  SLIVER_C2_MONITOR: {
    name: "Sliver C2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Sliver framework victim monitoring",
  },
  BRUTE_RATEL_MONITOR: {
    name: "Brute Ratel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Brute Ratel C4 monitoring",
  },
  HAVOC_C2_MONITOR: {
    name: "Havoc C2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Havoc framework monitoring",
  },

  // ==========================================
  // PHISHING & SCAM MONITORING
  // ==========================================
  PHISHING_KIT_MONITOR: {
    name: "Phishing Kit Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Phishing kit victim data",
  },
  EVILGINX_MONITOR: {
    name: "Evilginx Panel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Evilginx phishing data",
  },
  GOPHISH_MONITOR: {
    name: "GoPhish Campaign Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GoPhish victim data exposure",
  },
  MODLISHKA_MONITOR: {
    name: "Modlishka Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Modlishka reverse proxy phishing",
  },
  SCAM_PAGE_MONITOR: {
    name: "Scam Page Database",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Known scam page victim data",
  },
  CRYPTO_SCAM_MONITOR: {
    name: "Crypto Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency scam victim lists",
  },
  ROMANCE_SCAM_MONITOR: {
    name: "Romance Scam Database",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Romance scam victim exposure",
  },
  BEC_VICTIM_MONITOR: {
    name: "BEC Victim Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Business email compromise victims",
  },
  TECH_SUPPORT_SCAM_MONITOR: {
    name: "Tech Support Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tech support scam victim data",
  },
  INVESTMENT_SCAM_MONITOR: {
    name: "Investment Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Investment fraud victim lists",
  },

  // ==========================================
  // CRYPTOCURRENCY THREAT MONITORING
  // ==========================================
  CRYPTO_DRAINER_MONITOR: {
    name: "Crypto Drainer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wallet drainer victim monitoring",
  },
  NFT_SCAM_MONITOR: {
    name: "NFT Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NFT scam victim data",
  },
  DEFI_EXPLOIT_MONITOR: {
    name: "DeFi Exploit Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DeFi exploit victim tracking",
  },
  SEED_PHRASE_MONITOR: {
    name: "Seed Phrase Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency seed phrase leaks",
  },
  PRIVATE_KEY_MONITOR: {
    name: "Private Key Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Crypto private key exposure",
  },
  EXCHANGE_BREACH_MONITOR: {
    name: "Exchange Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency exchange breaches",
  },
  METAMASK_PHISH_MONITOR: {
    name: "MetaMask Phishing Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "MetaMask phishing victim data",
  },
  LEDGER_LEAK_MONITOR: {
    name: "Ledger Data Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ledger hardware wallet user leaks",
  },
  TREZOR_PHISH_MONITOR: {
    name: "Trezor Phishing Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Trezor phishing victim data",
  },
  COINBASE_BREACH_MONITOR: {
    name: "Coinbase Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Coinbase user data exposure",
  },

  // ==========================================
  // GAMING & VIRTUAL GOODS FRAUD
  // ==========================================
  STEAM_ACCOUNT_MONITOR: {
    name: "Steam Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen Steam account marketplace",
  },
  EPIC_GAMES_MONITOR: {
    name: "Epic Games Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Epic/Fortnite account theft",
  },
  ROBLOX_ACCOUNT_MONITOR: {
    name: "Roblox Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Roblox account marketplace",
  },
  MINECRAFT_ACCOUNT_MONITOR: {
    name: "Minecraft Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Minecraft account trading",
  },
  PSN_ACCOUNT_MONITOR: {
    name: "PSN Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "PlayStation Network accounts",
  },
  XBOX_ACCOUNT_MONITOR: {
    name: "Xbox Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Xbox Live account theft",
  },
  VALORANT_ACCOUNT_MONITOR: {
    name: "Valorant Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Valorant account marketplace",
  },
  LOL_ACCOUNT_MONITOR: {
    name: "League of Legends Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "LoL account trading",
  },
  GENSHIN_ACCOUNT_MONITOR: {
    name: "Genshin Impact Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Genshin account marketplace",
  },
  WOW_ACCOUNT_MONITOR: {
    name: "World of Warcraft Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "WoW account theft monitoring",
  },

  // ==========================================
  // SOCIAL MEDIA ACCOUNT MARKETS
  // ==========================================
  INSTAGRAM_ACCOUNT_MARKET: {
    name: "Instagram Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen Instagram account sales",
  },
  TIKTOK_ACCOUNT_MARKET: {
    name: "TikTok Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "TikTok account marketplace",
  },
  TWITTER_ACCOUNT_MARKET: {
    name: "Twitter/X Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Twitter account trading",
  },
  FACEBOOK_ACCOUNT_MARKET: {
    name: "Facebook Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Facebook account marketplace",
  },
  YOUTUBE_ACCOUNT_MARKET: {
    name: "YouTube Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "YouTube channel sales",
  },
  SNAPCHAT_ACCOUNT_MARKET: {
    name: "Snapchat Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Snapchat account trading",
  },
  LINKEDIN_ACCOUNT_MARKET: {
    name: "LinkedIn Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "LinkedIn account sales",
  },
  DISCORD_ACCOUNT_MARKET: {
    name: "Discord Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Discord account/nitro marketplace",
  },
  TWITCH_ACCOUNT_MARKET: {
    name: "Twitch Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Twitch account trading",
  },
  REDDIT_ACCOUNT_MARKET: {
    name: "Reddit Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Reddit account marketplace",
  },

  // ==========================================
  // STREAMING SERVICE ACCOUNTS
  // ==========================================
  NETFLIX_ACCOUNT_MONITOR: {
    name: "Netflix Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Netflix credential marketplace",
  },
  SPOTIFY_ACCOUNT_MONITOR: {
    name: "Spotify Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Spotify account trading",
  },
  DISNEY_PLUS_MONITOR: {
    name: "Disney+ Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Disney+ credential sales",
  },
  HBO_MAX_MONITOR: {
    name: "HBO Max Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "HBO Max account marketplace",
  },
  AMAZON_PRIME_MONITOR: {
    name: "Amazon Prime Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Amazon Prime account sales",
  },
  HULU_ACCOUNT_MONITOR: {
    name: "Hulu Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hulu credential trading",
  },
  APPLE_TV_MONITOR: {
    name: "Apple TV+ Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Apple TV+ account sales",
  },
  PARAMOUNT_PLUS_MONITOR: {
    name: "Paramount+ Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Paramount+ credential marketplace",
  },
  CRUNCHYROLL_MONITOR: {
    name: "Crunchyroll Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Crunchyroll account trading",
  },
  VPN_ACCOUNT_MONITOR: {
    name: "VPN Service Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NordVPN, ExpressVPN account sales",
  },

  // ==========================================
  // GOVERNMENT & MILITARY LEAKS
  // ==========================================
  GOV_BREACH_MONITOR: {
    name: "Government Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Government data breach monitoring",
  },
  MILITARY_LEAK_MONITOR: {
    name: "Military Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Military personnel data leaks",
  },
  CLEARANCE_DATA_MONITOR: {
    name: "Security Clearance Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Security clearance data exposure",
  },
  FEDERAL_EMPLOYEE_MONITOR: {
    name: "Federal Employee Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Federal employee data leaks",
  },
  LAW_ENFORCEMENT_MONITOR: {
    name: "Law Enforcement Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Police/LEO data exposure",
  },

  // ==========================================
  // HEALTHCARE & MEDICAL DATA
  // ==========================================
  HIPAA_BREACH_MONITOR: {
    name: "HIPAA Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Healthcare data breach monitoring",
  },
  MEDICAL_RECORDS_MONITOR: {
    name: "Medical Records Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Medical record leak detection",
  },
  PRESCRIPTION_DATA_MONITOR: {
    name: "Prescription Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Prescription history exposure",
  },
  INSURANCE_CLAIM_MONITOR: {
    name: "Insurance Claim Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Health insurance claim leaks",
  },
  PATIENT_DATABASE_MONITOR: {
    name: "Patient Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hospital patient data exposure",
  },

  // ==========================================
  // CORPORATE & ENTERPRISE DATA
  // ==========================================
  CORPORATE_EMAIL_MONITOR: {
    name: "Corporate Email Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Corporate email credential leaks",
  },
  SHAREPOINT_LEAK_MONITOR: {
    name: "SharePoint Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SharePoint data exposure",
  },
  CONFLUENCE_LEAK_MONITOR: {
    name: "Confluence Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Confluence wiki data leaks",
  },
  JIRA_LEAK_MONITOR: {
    name: "Jira Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Jira project data exposure",
  },
  SLACK_LEAK_MONITOR: {
    name: "Slack Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Slack workspace data leaks",
  },
  GITHUB_SECRET_MONITOR: {
    name: "GitHub Secret Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GitHub exposed secrets/keys",
  },
  GITLAB_LEAK_MONITOR: {
    name: "GitLab Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GitLab repository leaks",
  },
  S3_BUCKET_MONITOR: {
    name: "S3 Bucket Exposure Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Exposed AWS S3 bucket data",
  },
  AZURE_BLOB_MONITOR: {
    name: "Azure Blob Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Azure blob storage exposure",
  },
  GCP_BUCKET_MONITOR: {
    name: "GCP Bucket Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google Cloud storage leaks",
  },

  // ==========================================
  // MOBILE DEVICE DATA LEAKS
  // ==========================================
  IMEI_DATABASE_MONITOR: {
    name: "IMEI Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mobile device IMEI leak monitoring",
  },
  PHONE_BACKUP_MONITOR: {
    name: "Phone Backup Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cloud phone backup exposure",
  },
  ICLOUD_BREACH_MONITOR: {
    name: "iCloud Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Apple iCloud data leaks",
  },
  GOOGLE_ACCOUNT_MONITOR: {
    name: "Google Account Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google account credential leaks",
  },
  SAMSUNG_ACCOUNT_MONITOR: {
    name: "Samsung Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Samsung account data exposure",
  },
  WHATSAPP_BACKUP_MONITOR: {
    name: "WhatsApp Backup Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "WhatsApp cloud backup leaks",
  },
  TELEGRAM_DATA_MONITOR: {
    name: "Telegram Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Telegram account data exposure",
  },
  SIGNAL_LEAK_MONITOR: {
    name: "Signal Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Signal app data exposure",
  },
  VIBER_DATA_MONITOR: {
    name: "Viber Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Viber account leak monitoring",
  },
  LINE_APP_MONITOR: {
    name: "LINE App Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "LINE messenger data leaks",
  },

  // ==========================================
  // E-COMMERCE & RETAIL FRAUD
  // ==========================================
  AMAZON_ACCOUNT_FRAUD: {
    name: "Amazon Account Fraud Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Amazon account marketplace",
  },
  EBAY_ACCOUNT_MONITOR: {
    name: "eBay Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "eBay account theft monitoring",
  },
  PAYPAL_ACCOUNT_MARKET: {
    name: "PayPal Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "PayPal credential marketplace",
  },
  VENMO_ACCOUNT_MONITOR: {
    name: "Venmo Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Venmo account trading",
  },
  CASHAPP_ACCOUNT_MONITOR: {
    name: "Cash App Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cash App credential leaks",
  },
  ZELLE_FRAUD_MONITOR: {
    name: "Zelle Fraud Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Zelle payment fraud monitoring",
  },
  SHOPIFY_STORE_MONITOR: {
    name: "Shopify Store Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Shopify store credential leaks",
  },
  STRIPE_ACCOUNT_MONITOR: {
    name: "Stripe Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stripe payment credential leaks",
  },
  WALMART_ACCOUNT_MONITOR: {
    name: "Walmart Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Walmart account marketplace",
  },
  TARGET_ACCOUNT_MONITOR: {
    name: "Target Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Target account credential leaks",
  },

  // ==========================================
  // TRAVEL & HOSPITALITY FRAUD
  // ==========================================
  AIRLINE_MILES_MONITOR: {
    name: "Airline Miles Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Frequent flyer account theft",
  },
  HOTEL_POINTS_MONITOR: {
    name: "Hotel Points Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hotel loyalty point fraud",
  },
  AIRBNB_ACCOUNT_MONITOR: {
    name: "Airbnb Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Airbnb account marketplace",
  },
  UBER_ACCOUNT_MONITOR: {
    name: "Uber Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Uber account trading",
  },
  LYFT_ACCOUNT_MONITOR: {
    name: "Lyft Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Lyft account marketplace",
  },
  DOORDASH_ACCOUNT_MONITOR: {
    name: "DoorDash Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DoorDash account leaks",
  },
  UBEREATS_ACCOUNT_MONITOR: {
    name: "UberEats Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "UberEats account trading",
  },
  GRUBHUB_ACCOUNT_MONITOR: {
    name: "Grubhub Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Grubhub credential marketplace",
  },
  BOOKING_COM_MONITOR: {
    name: "Booking.com Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Booking.com account leaks",
  },
  EXPEDIA_ACCOUNT_MONITOR: {
    name: "Expedia Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Expedia account trading",
  },

  // ==========================================
  // EDUCATION & ACADEMIC DATA
  // ==========================================
  STUDENT_RECORDS_MONITOR: {
    name: "Student Records Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Student record data leaks",
  },
  UNIVERSITY_BREACH_MONITOR: {
    name: "University Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "University data breach monitoring",
  },
  EDU_EMAIL_MARKET: {
    name: ".edu Email Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Educational email marketplace",
  },
  STUDENT_LOAN_MONITOR: {
    name: "Student Loan Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Student loan data exposure",
  },
  SCHOLARSHIP_FRAUD_MONITOR: {
    name: "Scholarship Fraud Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Scholarship application fraud",
  },
  LMS_BREACH_MONITOR: {
    name: "LMS Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Learning management system breaches",
  },
  CANVAS_LEAK_MONITOR: {
    name: "Canvas LMS Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Canvas platform data leaks",
  },
  BLACKBOARD_LEAK_MONITOR: {
    name: "Blackboard Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Blackboard platform exposure",
  },
  COURSERA_ACCOUNT_MONITOR: {
    name: "Coursera Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Coursera account marketplace",
  },
  UDEMY_ACCOUNT_MONITOR: {
    name: "Udemy Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Udemy account trading",
  },

  // ==========================================
  // IOT & SMART DEVICE VULNERABILITIES
  // ==========================================
  SMART_HOME_MONITOR: {
    name: "Smart Home Device Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart home device exposure",
  },
  RING_CAMERA_MONITOR: {
    name: "Ring Camera Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ring doorbell credential leaks",
  },
  NEST_ACCOUNT_MONITOR: {
    name: "Nest Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google Nest device exposure",
  },
  WYZE_BREACH_MONITOR: {
    name: "Wyze Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wyze camera data leaks",
  },
  ALEXA_DATA_MONITOR: {
    name: "Alexa Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Amazon Alexa data exposure",
  },
  SMART_TV_MONITOR: {
    name: "Smart TV Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart TV data leaks",
  },
  ROUTER_VULN_MONITOR: {
    name: "Router Vulnerability Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Home router credential leaks",
  },
  IP_CAMERA_MONITOR: {
    name: "IP Camera Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IP camera feed exposure",
  },
  BABY_MONITOR_LEAK: {
    name: "Baby Monitor Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Baby monitor data exposure",
  },
  SMART_LOCK_MONITOR: {
    name: "Smart Lock Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart lock credential leaks",
  },

  // ==========================================
  // AUTOMOTIVE & VEHICLE DATA
  // ==========================================
  TESLA_ACCOUNT_MONITOR: {
    name: "Tesla Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tesla account credential leaks",
  },
  CONNECTED_CAR_MONITOR: {
    name: "Connected Car Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Connected vehicle data exposure",
  },
  ONSTAR_DATA_MONITOR: {
    name: "OnStar Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GM OnStar data leaks",
  },
  UCONNECT_MONITOR: {
    name: "Uconnect Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Chrysler Uconnect data exposure",
  },
  FORD_SYNC_MONITOR: {
    name: "Ford SYNC Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ford SYNC system data leaks",
  },
  VIN_DATABASE_MONITOR: {
    name: "VIN Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Vehicle identification number leaks",
  },
  GPS_TRACKER_MONITOR: {
    name: "GPS Tracker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Vehicle GPS tracker data exposure",
  },
  FLEET_MANAGEMENT_MONITOR: {
    name: "Fleet Management Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fleet management system leaks",
  },
  OBD_DATA_MONITOR: {
    name: "OBD Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "OBD-II diagnostic data leaks",
  },
  EV_CHARGING_MONITOR: {
    name: "EV Charging Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "EV charging network data leaks",
  },

  // ==========================================
  // FINANCIAL SERVICES & BANKING
  // ==========================================
  BANK_OF_AMERICA_MONITOR: {
    name: "Bank of America Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "BofA account credential leaks",
  },
  CHASE_ACCOUNT_MONITOR: {
    name: "Chase Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Chase bank account leaks",
  },
  WELLS_FARGO_MONITOR: {
    name: "Wells Fargo Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wells Fargo credential leaks",
  },
  CITI_ACCOUNT_MONITOR: {
    name: "Citibank Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Citibank account exposure",
  },
  CAPITAL_ONE_MONITOR: {
    name: "Capital One Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Capital One credential leaks",
  },
  CRYPTO_EXCHANGE_MONITOR: {
    name: "Crypto Exchange Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency exchange leaks",
  },
  BINANCE_ACCOUNT_MONITOR: {
    name: "Binance Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Binance account credential leaks",
  },
  KRAKEN_ACCOUNT_MONITOR: {
    name: "Kraken Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Kraken exchange account leaks",
  },
  ROBINHOOD_MONITOR: {
    name: "Robinhood Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Robinhood account exposure",
  },
  FIDELITY_MONITOR: {
    name: "Fidelity Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fidelity account leaks",
  },

  // ==========================================
  // DATING & ADULT SITE LEAKS
  // ==========================================
  TINDER_DATA_MONITOR: {
    name: "Tinder Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tinder user data leaks",
  },
  BUMBLE_DATA_MONITOR: {
    name: "Bumble Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bumble user data exposure",
  },
  HINGE_DATA_MONITOR: {
    name: "Hinge Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hinge profile data leaks",
  },
  GRINDR_DATA_MONITOR: {
    name: "Grindr Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Grindr user data exposure",
  },
  ASHLEY_MADISON_MONITOR: {
    name: "Ashley Madison Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ashley Madison breach monitoring",
  },
  ADULT_SITE_MONITOR: {
    name: "Adult Site Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Adult website data leaks",
  },
  ONLYFANS_LEAK_MONITOR: {
    name: "OnlyFans Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "OnlyFans creator data leaks",
  },
  DATING_APP_GENERAL: {
    name: "Dating App General Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "General dating app data leaks",
  },
  FETLIFE_MONITOR: {
    name: "FetLife Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "FetLife data exposure",
  },
  SEEKING_ARRANGEMENT_MONITOR: {
    name: "Seeking Arrangement Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Seeking Arrangement leaks",
  },
};

// Broker categories for organization
export const BROKER_CATEGORIES = {
  PEOPLE_SEARCH: [
    "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "PEOPLEFINDER",
    "TRUEPEOPLESEARCH", "RADARIS", "FASTPEOPLESEARCH", "USSEARCH", "PIPL",
    "INSTANTCHECKMATE", "PEOPLELOOKER", "PEOPLEFINDERS", "THATSTHEM",
    "PUBLICRECORDSNOW", "FAMILYTREENOW", "MYLIFE", "CLUSTRMAPS", "ADDRESSES",
    "ADVANCED_PEOPLE_SEARCH", "ZABASEARCH", "PEEKYOU", "BEEN_VERIFIED_PEOPLE",
    "PUBLICRECORDS360", "PERSOPO", "SMARTBACKGROUNDCHECKS", "LOCATEFAMILY",
    "PEOPLEWISE", "PEOPLESEARCHNOW", "PEOPLEBYNAME", "VIRTORY", "VERICORA",
    "GLADIKNOW", "IDENTITYPI", "QUICKPEOPLETRACE", "OURSTATES", "IDCRAWL",
    "INFOFREE", "CENTEDA", "CUBIB", "KWOLD", "NEWENGLANDFACTS", "OFFICIALUSA",
    "PUB360", "PROFILEENGINE", "PUBLICINFOSERVICES", "PEOPLEBACKGROUNDCHECK",
    "PRIVATERECORDS", "PEOPLEWHIZ", "SEARCHBUG", "SPYTOX", "STATERECORDS",
    "UNITEDSTATESPHONEBOOK", "USA_PEOPLE_SEARCH", "USATRACE", "VERIPAGES", "WELLNUT",
    "USSEARCHINFO", "FREEPHONETRACER", "FINDPEOPLESEARCH", "PEOPLESMART", "PEOPLEFINDERPRO",
    "DATAVERIA", "CYBERCHECK", "INFOTRACER", "COCOFINDER", "USPHONELOOKUP",
    "EASYBACKGROUNDCHECKS", "UNMASK", "REVEALNAME", "INFORMATION_COM", "BACKGROUNDALERT",
    "DOBSEARCH", "NEIGHBOR_REPORT", "NUMERLOOKUP", "VALIDNUMBER", "SEARCHPUBLICRECORDS",
    "IDTRUE", "LOOKUPUK", "PEEPSEARCH", "RECORDSFINDER", "PUBLICRECORDCENTER",
    "SEARCHSYSTEMS", "PERSONSEARCH", "ARKANSASVOTERS", "FLORIDAVOTERS", "OHIOVOTERS"
  ],
  BACKGROUND_CHECK: [
    "TRUTHFINDER", "CHECKPEOPLE", "CYBERBACKGROUNDCHECKS", "PUBLICDATACHECK",
    "SEARCHPEOPLEFREE", "FREEPEOPLESEARCH", "SEARCHQUARRY",
    "FIRST_ADVANTAGE", "INTELLICORP", "TALENTWISE", "INFOMART", "SJV_ASSOCIATES"
  ],
  COURT_RECORDS: [
    "JUDYRECORDS", "UNICOURT", "COURTRECORDS_ORG", "ARRESTFACTS",
    "CRIMINALSEARCHES", "MUGSHOTS_COM", "INSTANTARREST", "PUBLICPOLICERECORD",
    "CRIMINALWATCHDOG", "DOCKETBIRD", "PACERMONITOR", "TRELLIS_LAW",
    "COURTLISTENER", "DOCKETALARM"
  ],
  PHONE_LOOKUP: [
    "ANYWHO", "YELLOWPAGES", "INFOSPACE", "NUWBER", "REVERSEPHONELOOKUP",
    "SPYDIALER", "CALLTRUTH", "USPHONEBOOK", "WHITEPAGES_PREMIUM",
    "PHONEBOOKS_COM", "ADDRESSES_COM", "PHONELOOKUP", "PHONEOWNER",
    "SYNC_ME", "HIYA", "TRUECALLER", "MR_NUMBER", "CALLERIDTEST", "OLDPHONEBOOK",
    "CALLERSMART", "CALLERCENTER", "NUMBERGURU", "NUMBERVILLE", "PHONEVALIDATOR",
    "WHOCALLEDME", "WHOCALLSME", "WHYCALL", "CALLERID411", "FREECALLERIDSEARCH",
    "SHOWCALLER", "EYECON", "GETCONTACT", "CALLAPP", "WHOSCALL", "DRUPE",
    "SHOWCALLERID", "REVERSEMOBILE", "CARRIERLOOKUP", "FREECARRIERLOOKUP",
    "TEXTMAGIC", "TEXTEM", "NUMVERIFY"
  ],
  PROPERTY_RECORDS: [
    "NEIGHBOR_WHO", "HOMEMETRY", "BLOCKSHOPPER", "OWNERLY", "REHOLD",
    "PROPERTYSHARK", "ZILLOW", "REDFIN", "REALTOR_COM", "TRULIA",
    "HOUSEVALUES", "ADDRESSREPORT", "LANDWATCH", "REALTYHOP", "SHOWCASE",
    "HOMES_COM", "HOMESNAP", "MOVOTO", "OPENDOOR", "ESTATELY", "XOME",
    "FORECLOSURE_COM", "LOOPNET", "REMAX", "CENTURY21", "COLDWELLBANKER",
    "KELLER_WILLIAMS", "COMPASS_RE", "HOMELIGHT", "OFFERPAD", "SUNDAE"
  ],
  EMAIL_IDENTITY: [
    "VOTERRECORDS", "EMAILSHERLOCK", "EMAILFINDER", "HUNTER_IO"
  ],
  PROFESSIONAL_B2B: [
    "ZOOMINFO", "LUSHA", "APOLLO", "ROCKETREACH", "LEADIQ", "COGNISM",
    "CLEARBIT", "FULLCONTACT", "SEAMLESS_AI", "DATANYZE", "UPLEAD",
    "SNOV_IO", "FINDTHATLEADS", "VOILANORBERT", "ADAPT_IO", "CONTACTOUT",
    "SIGNALHIRE", "WIZA", "OVERLOOP", "SALESLOFT", "AEROLEADS", "GETPROSPECT",
    "KASPR", "DROPCONTACT", "ANYMAILFINDER", "EMAILHUNTER", "FINDYMAIL",
    "SKRAPP", "TOMBA", "NYMERIA", "PROSPECTLINKER", "SWORDFISH",
    "LEADFEEDER", "LEADGENIUS", "DEMANDBASE", "SIXSENSE", "BOMBORA",
    "DISCOVERORG", "DUNS_BRADSTREET", "HOOVERS", "INSIDEVIEW", "CLEARBIT_ENRICHMENT"
  ],
  MARKETING: [
    "ACXIOM", "ORACLE_DATACLOUD", "EPSILON", "EXPERIAN_MARKETING",
    "EQUIFAX_MARKETING", "LEXISNEXIS", "LIVERAMP", "TAPAD", "NEUSTAR",
    "NIELSEN", "LOTAME", "DATALOGIX", "BLUEKAI", "INFOGROUP",
    "TRANSUNION", "COMSCORE", "THETRADEDESK", "PUBMATIC", "MAGNITE",
    "OPENX", "CRITEO", "VIANT", "ADSRVR", "EYEOTA",
    "MEDIAMATH", "AMOBEE", "ADROLL", "QUANTCAST", "SHARETHROUGH",
    "TRIPLELIFT", "APPNEXUS", "INDEX_EXCHANGE", "SOVRN", "SPOTX",
    "TOWER_DATA", "NEXTROLL", "PERMUTIVE", "ADADYN", "INTENTIQ"
  ],
  DATING_RELATIONSHIP: [
    "DATING_BACKGROUND", "MATCHDOTCOM_LOOKUP", "DATESEARCHSITE", "ROMANCESCAMS",
    "BUMBLE_LOOKUP", "HINGE_LOOKUP", "OKCUPID_LOOKUP", "PLENTYOFFISH", "TINDER_LOOKUP"
  ],
  FINANCIAL: [
    "EXPERIAN_CONSUMER", "EQUIFAX_CONSUMER", "TRANSUNION_CONSUMER",
    "CHEXSYSTEMS", "INNOVIS", "NCTUE", "SAGESTREAM"
  ],
  VEHICLE_DRIVING: [
    "VEHICLEHISTORY", "CARFAX", "AUTOCHECK", "DRIVINGRECORDS"
  ],
  GENEALOGY: [
    "ANCESTRY", "MYHERITAGE", "FINDAGRAVE", "BILLIONGRAVES",
    "ARCHIVES_COM", "GENEALOGYBANK", "NEWSPAPERS_COM", "LEGACY_COM",
    "TRIBUTES_COM", "ECHOVITA", "EVERHERE", "FOLD3", "FINDMYPAST"
  ],
  INTERNATIONAL: [
    "CANADA411", "UK_192", "INFOBEL", "YASNI", "WEBMII", "PIPL_UK", "FOREBEARS",
    "SPOKEO_UK", "CHECKPEOPLE_UK", "PERSONLOOKUP_UK", "WHITEPAGES_AU",
    "PAGESJAUNES", "DASTELEFONBUCH", "PAGINEBIANCHE", "GUIALOCAL",
    "PIPL_INTERNATIONAL", "ZLOOKUP", "TRUECALLER_IN", "JUSTDIAL", "SULEKHA",
    "YELLOWPAGES_CA", "WHITEPAGES_NZ", "HEROLD_AT", "LOCAL_CH", "GOUDEN_GIDS",
    "TELOFONO_BLANCO", "PAGINASAMARILLAS_BR", "TELELISTAS", "ENIRO", "HITTA_SE",
    "KRAK_DK", "DEGULESIDER_NO"
  ],
  EDUCATIONAL: [
    "NATIONAL_STUDENT_CLEARINGHOUSE", "VERIFYED", "LICENSE_LOOKUP"
  ],
  HEALTHCARE: [
    "HEALTHGRADES", "VITALS", "ZOCDOC", "DOXIMITY", "NPPES"
  ],
  LOCATION_TRACKING: [
    "FOURSQUARE", "SAFEGRAPH", "MOBILEWALLA", "XMODE", "GRAVY_ANALYTICS", "PLACER_AI"
  ],
  INSURANCE_RISK: [
    "LN_RISK_SOLUTIONS", "VERISK", "CLUE_REPORT", "ISO_CLAIMS"
  ],
  EMAIL_VERIFICATION: [
    "ZEROBOUNCE", "NEVERBOUNCE", "KICKBOX", "DEBOUNCE", "EMAILLISTVERIFY", "CLEAROUT"
  ],
  IDENTITY_GRAPHS: [
    "DRAWBRIDGE", "CROSSWISE", "IQVIA", "ID5", "SHAREDID"
  ],
  BREACH_DATABASE: [
    "HAVEIBEENPWNED", "DEHASHED", "LEAKCHECK", "SNUSBASE"
  ],
  SOCIAL_MEDIA: [
    "LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK", "REDDIT",
    "PINTEREST", "YOUTUBE", "SNAPCHAT", "DISCORD"
  ],
  AI_TRAINING: [
    "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
    "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI"
  ],
  FACIAL_RECOGNITION: [
    "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH",
    "TINEYE", "YANDEX_IMAGES"
  ],
  VOICE_CLONING: [
    "ELEVENLABS", "RESEMBLE_AI", "MURF_AI"
  ],
  TENANT_SCREENING: [
    "RENTBUREAU", "CORELOGIC_RENTAL", "REALPAGE", "ONSITE_RESIDENT", "TRANSUNION_RENTAL"
  ],
  EMPLOYMENT_HR: [
    "THEWORKNUMBER", "HIRERIGHT", "STERLING", "CHECKR", "GOODHIRE", "ACCURATE_BG"
  ],
  DATA_ENRICHMENT: [
    "PEOPLE_DATA_LABS", "CORESIGNAL", "PROXYCURL", "REVELIO_LABS", "DIFFBOT"
  ],
  DARK_WEB_MONITORING: [
    "SPYCLOUD", "RECORDED_FUTURE", "DARKOWL", "FLASHPOINT", "INTEL471",
    "SIXGILL", "KELA", "DIGITAL_SHADOWS", "ZEROFOX", "CYBERINT",
    "CONSTELLA", "SOCRADAR"
  ],
  BREACH_LEAK_DB: [
    "BREACHSENSE", "LEAKPEEK", "LEAKIX", "INTELLIGENCE_X", "NUCLEON",
    "SCYLLA_SH", "HASHES_ORG", "WELEAKINFO", "BREACHDIRECTORY", "LEAKBASE"
  ],
  PASTE_SITE_MONITORS: [
    "PASTEBIN_MONITOR", "GHOSTBIN_MONITOR", "DPASTE_MONITOR", "HASTEBIN_MONITOR",
    "PASTECODE_MONITOR", "JUSTPASTE_MONITOR", "CONTROLC_MONITOR", "CODEPAD_MONITOR",
    "IDEONE_MONITOR", "SLEXY_MONITOR"
  ],
  DARK_MARKETPLACE_MONITORS: [
    "DARKMARKET_MONITOR", "GENESIS_MARKET_MONITOR", "RUSSIAN_MARKET_MONITOR",
    "EXPLOIT_FORUM_MONITOR", "XSS_FORUM_MONITOR", "BREACHFORUMS_MONITOR",
    "RAIDFORUMS_SUCCESSOR_MONITOR", "NULLED_FORUM_MONITOR", "CRACKED_FORUM_MONITOR",
    "SINISTER_FORUM_MONITOR", "DREAD_FORUM_MONITOR", "ALPHABAY_MONITOR",
    "VERSUS_MARKET_MONITOR", "KINGDOM_MARKET_MONITOR", "BOHEMIA_MARKET_MONITOR"
  ],
  CREDENTIAL_MONITORING: [
    "FIREFOX_MONITOR", "GOOGLE_PASSWORD_CHECKUP", "APPLE_SECURITY_RECOMMENDATIONS",
    "IDENTITY_GUARD", "LIFELOCK", "IDENTITYFORCE", "AURA_IDENTITY",
    "EXPERIAN_DARK_WEB", "TRANSUNION_DARK_WEB", "EQUIFAX_DARK_WEB",
    "MCAFEE_IDENTITY", "BITDEFENDER_IDENTITY", "NORTON_DARK_WEB", "AVAST_BREACHGUARD"
  ],
  DARK_WEB_SEARCH: [
    "AHMIA_SEARCH", "TORCH_SEARCH", "NOTEVIL_SEARCH", "HAYSTAK_SEARCH",
    "DARKSEARCH_IO", "ONION_SEARCH"
  ],
  STEALER_LOG_MONITORS: [
    "REDLINE_STEALER_MONITOR", "RACCOON_STEALER_MONITOR", "VIDAR_STEALER_MONITOR",
    "AZORULT_MONITOR", "TAURUS_STEALER_MONITOR", "LUMMA_STEALER_MONITOR",
    "TITAN_STEALER_MONITOR", "STEALC_MONITOR"
  ],
  RANSOMWARE_LEAK_MONITORS: [
    "LOCKBIT_LEAK_MONITOR", "ALPHV_LEAK_MONITOR", "CLOP_LEAK_MONITOR",
    "BLACKBASTA_LEAK_MONITOR", "PLAY_RANSOMWARE_MONITOR", "ROYAL_RANSOMWARE_MONITOR",
    "BIANLIAN_LEAK_MONITOR", "AKIRA_RANSOMWARE_MONITOR", "MEDUSA_LEAK_MONITOR",
    "RHYSIDA_LEAK_MONITOR"
  ],
  CHAT_PLATFORM_MONITORS: [
    "TELEGRAM_LEAK_CHANNELS", "TELEGRAM_COMBOLIST", "TELEGRAM_STEALER_LOGS",
    "DISCORD_LEAK_SERVERS", "IRC_UNDERGROUND_CHANNELS", "JABBER_XMPP_NETWORKS"
  ],
  CREDENTIAL_MARKETS: [
    "COMBOLIST_MONITOR", "LOGS_MARKET_MONITOR", "FULLZ_MARKET_MONITOR",
    "SSN_DOB_MARKET_MONITOR", "CREDIT_CARD_SHOP_MONITOR", "BANK_LOG_MARKET_MONITOR",
    "ACCOUNT_SHOP_MONITOR", "CRYPTO_WALLET_MARKET_MONITOR", "EMAIL_2_SMS_GATEWAY_MONITOR"
  ],
  THREAT_INTEL_PLATFORMS: [
    "MANDIANT_THREAT_INTEL", "CROWDSTRIKE_FALCON_X", "PALO_ALTO_UNIT42",
    "CISCO_TALOS", "PROOFPOINT_THREAT", "TRELLIX_INSIGHTS", "SECUREWORKS_CTU",
    "ANOMALI_THREATSTREAM", "THREATCONNECT", "LOOKOUT_THREAT"
  ],
  BREACH_AGGREGATORS: [
    "LEAKED_SOURCE", "COMB_MONITOR", "ANTIPUBLIC_MONITOR", "EXPLOIT_IN_MONITOR",
    "COLLECTION_MONITOR", "PEMIBLANC_MONITOR", "LEAKEDSOURCE_ARCHIVES",
    "BREACH_COMPILATION", "MAILRU_BREACH_MONITOR", "RAMBLER_BREACH_MONITOR"
  ],
  ADDITIONAL_PASTE_SITES: [
    "RENTRY_MONITOR", "PRIVATEBIN_MONITOR", "ZEROBIN_MONITOR", "TELEGRA_PH_MONITOR",
    "SNIPPET_HOST_MONITOR", "TOPTAL_PASTE_MONITOR", "PASTE2_MONITOR",
    "PASTEALL_MONITOR", "DEFUSE_PASTE_MONITOR", "DOXBIN_MONITOR"
  ],
  UNDERGROUND_FORUMS: [
    "HACKFORUMS_MONITOR", "RAIDFORUMS_ARCHIVE", "OGUSERS_MONITOR", "LOLZTEAM_MONITOR",
    "BHFIO_MONITOR", "WWH_CLUB_MONITOR", "VERIFIED_FORUM_MONITOR", "ANTICHAT_MONITOR",
    "XAKEP_MONITOR", "DARKODE_MONITOR"
  ],
  CARDING_FRAUD_SITES: [
    "JOKER_STASH_MONITOR", "RESCATOR_MONITOR", "FERUM_SHOP_MONITOR", "UNICC_MONITOR",
    "BRIANKREBS_MONITOR", "VALIDCC_MONITOR", "SWIPE_STORE_MONITOR",
    "ALLWORLD_CARDS_MONITOR", "YALE_LODGE_MONITOR", "TRUMP_DUMPS_MONITOR"
  ],
  ADDITIONAL_STEALER_LOGS: [
    "AURORA_STEALER_MONITOR", "META_STEALER_MONITOR", "RHADAMANTHYS_MONITOR",
    "DARKCLOUD_STEALER_MONITOR", "PRYNT_STEALER_MONITOR", "WHITESNAKE_STEALER_MONITOR",
    "MYSTIC_STEALER_MONITOR", "RISEPRO_STEALER_MONITOR", "STEALC_V2_MONITOR",
    "XWORM_RAT_MONITOR"
  ],
  ADDITIONAL_RANSOMWARE_LEAKS: [
    "HIVE_RANSOMWARE_MONITOR", "CONTI_LEAK_MONITOR", "REVIL_LEAK_MONITOR",
    "MAZE_LEAK_MONITOR", "NETWALKER_LEAK_MONITOR", "RAGNAR_LOCKER_MONITOR",
    "AVOSLOCKER_MONITOR", "CUBA_RANSOMWARE_MONITOR", "SNATCH_TEAM_MONITOR",
    "VICE_SOCIETY_MONITOR"
  ],
  TELEGRAM_FRAUD_CHANNELS: [
    "TELEGRAM_CREDIT_CARDS", "TELEGRAM_FULLZ_CHANNELS", "TELEGRAM_BANK_DROPS",
    "TELEGRAM_SSN_CHANNELS", "TELEGRAM_LOGS_CLOUD", "TELEGRAM_RUSSIA_FRAUD",
    "TELEGRAM_SPAM_TOOLS", "TELEGRAM_CRYPTO_FRAUD", "TELEGRAM_SIM_SWAP",
    "TELEGRAM_DOCUMENTS"
  ],
  IDENTITY_DOCUMENT_LEAKS: [
    "KYC_BREACH_MONITOR", "ID_DOCUMENT_MONITOR", "SELFIE_LEAK_MONITOR",
    "DRIVERS_LICENSE_MONITOR", "PASSPORT_LEAK_MONITOR"
  ],
  ADDITIONAL_DARK_MARKETS: [
    "INCOGNITO_MARKET_MONITOR", "ARCHETYP_MARKET_MONITOR", "ABACUS_MARKET_MONITOR",
    "TOR2DOOR_MONITOR", "MEGA_DARKNET_MONITOR", "HYDRA_SUCCESSOR_MONITOR",
    "OMGOMG_MARKET_MONITOR", "BLACKSPRUT_MONITOR", "KRAKEN_DARKNET_MONITOR",
    "SOLARIS_MARKET_MONITOR"
  ],
  INITIAL_ACCESS_BROKERS: [
    "IAB_MARKET_MONITOR", "RDP_SHOP_MONITOR", "VPN_ACCESS_MONITOR",
    "CITRIX_ACCESS_MONITOR", "WEBSHELL_MARKET_MONITOR", "PULSE_VPN_MONITOR",
    "FORTINET_LEAK_MONITOR", "SSH_KEY_MARKET_MONITOR", "AWS_CREDS_MONITOR",
    "AZURE_CREDS_MONITOR"
  ],
  BOTNET_MALWARE_PANELS: [
    "EMOTET_PANEL_MONITOR", "TRICKBOT_MONITOR", "QAKBOT_MONITOR", "ICEDID_MONITOR",
    "DRIDEX_MONITOR", "BAZARLOADER_MONITOR", "COBALT_STRIKE_MONITOR",
    "SLIVER_C2_MONITOR", "BRUTE_RATEL_MONITOR", "HAVOC_C2_MONITOR"
  ],
  PHISHING_SCAM_MONITORING: [
    "PHISHING_KIT_MONITOR", "EVILGINX_MONITOR", "GOPHISH_MONITOR", "MODLISHKA_MONITOR",
    "SCAM_PAGE_MONITOR", "CRYPTO_SCAM_MONITOR", "ROMANCE_SCAM_MONITOR",
    "BEC_VICTIM_MONITOR", "TECH_SUPPORT_SCAM_MONITOR", "INVESTMENT_SCAM_MONITOR"
  ],
  CRYPTO_THREAT_MONITORING: [
    "CRYPTO_DRAINER_MONITOR", "NFT_SCAM_MONITOR", "DEFI_EXPLOIT_MONITOR",
    "SEED_PHRASE_MONITOR", "PRIVATE_KEY_MONITOR", "EXCHANGE_BREACH_MONITOR",
    "METAMASK_PHISH_MONITOR", "LEDGER_LEAK_MONITOR", "TREZOR_PHISH_MONITOR",
    "COINBASE_BREACH_MONITOR"
  ],
  GAMING_ACCOUNT_FRAUD: [
    "STEAM_ACCOUNT_MONITOR", "EPIC_GAMES_MONITOR", "ROBLOX_ACCOUNT_MONITOR",
    "MINECRAFT_ACCOUNT_MONITOR", "PSN_ACCOUNT_MONITOR", "XBOX_ACCOUNT_MONITOR",
    "VALORANT_ACCOUNT_MONITOR", "LOL_ACCOUNT_MONITOR", "GENSHIN_ACCOUNT_MONITOR",
    "WOW_ACCOUNT_MONITOR"
  ],
  SOCIAL_MEDIA_ACCOUNT_MARKETS: [
    "INSTAGRAM_ACCOUNT_MARKET", "TIKTOK_ACCOUNT_MARKET", "TWITTER_ACCOUNT_MARKET",
    "FACEBOOK_ACCOUNT_MARKET", "YOUTUBE_ACCOUNT_MARKET", "SNAPCHAT_ACCOUNT_MARKET",
    "LINKEDIN_ACCOUNT_MARKET", "DISCORD_ACCOUNT_MARKET", "TWITCH_ACCOUNT_MARKET",
    "REDDIT_ACCOUNT_MARKET"
  ],
  STREAMING_ACCOUNT_FRAUD: [
    "NETFLIX_ACCOUNT_MONITOR", "SPOTIFY_ACCOUNT_MONITOR", "DISNEY_PLUS_MONITOR",
    "HBO_MAX_MONITOR", "AMAZON_PRIME_MONITOR", "HULU_ACCOUNT_MONITOR",
    "APPLE_TV_MONITOR", "PARAMOUNT_PLUS_MONITOR", "CRUNCHYROLL_MONITOR",
    "VPN_ACCOUNT_MONITOR"
  ],
  GOVERNMENT_MILITARY_LEAKS: [
    "GOV_BREACH_MONITOR", "MILITARY_LEAK_MONITOR", "CLEARANCE_DATA_MONITOR",
    "FEDERAL_EMPLOYEE_MONITOR", "LAW_ENFORCEMENT_MONITOR"
  ],
  HEALTHCARE_DATA_LEAKS: [
    "HIPAA_BREACH_MONITOR", "MEDICAL_RECORDS_MONITOR", "PRESCRIPTION_DATA_MONITOR",
    "INSURANCE_CLAIM_MONITOR", "PATIENT_DATABASE_MONITOR"
  ],
  CORPORATE_DATA_EXPOSURE: [
    "CORPORATE_EMAIL_MONITOR", "SHAREPOINT_LEAK_MONITOR", "CONFLUENCE_LEAK_MONITOR",
    "JIRA_LEAK_MONITOR", "SLACK_LEAK_MONITOR", "GITHUB_SECRET_MONITOR",
    "GITLAB_LEAK_MONITOR", "S3_BUCKET_MONITOR", "AZURE_BLOB_MONITOR",
    "GCP_BUCKET_MONITOR"
  ],
  MOBILE_DEVICE_LEAKS: [
    "IMEI_DATABASE_MONITOR", "PHONE_BACKUP_MONITOR", "ICLOUD_BREACH_MONITOR",
    "GOOGLE_ACCOUNT_MONITOR", "SAMSUNG_ACCOUNT_MONITOR", "WHATSAPP_BACKUP_MONITOR",
    "TELEGRAM_DATA_MONITOR", "SIGNAL_LEAK_MONITOR", "VIBER_DATA_MONITOR",
    "LINE_APP_MONITOR"
  ],
  ECOMMERCE_RETAIL_FRAUD: [
    "AMAZON_ACCOUNT_FRAUD", "EBAY_ACCOUNT_MONITOR", "PAYPAL_ACCOUNT_MARKET",
    "VENMO_ACCOUNT_MONITOR", "CASHAPP_ACCOUNT_MONITOR", "ZELLE_FRAUD_MONITOR",
    "SHOPIFY_STORE_MONITOR", "STRIPE_ACCOUNT_MONITOR", "WALMART_ACCOUNT_MONITOR",
    "TARGET_ACCOUNT_MONITOR"
  ],
  TRAVEL_HOSPITALITY_FRAUD: [
    "AIRLINE_MILES_MONITOR", "HOTEL_POINTS_MONITOR", "AIRBNB_ACCOUNT_MONITOR",
    "UBER_ACCOUNT_MONITOR", "LYFT_ACCOUNT_MONITOR", "DOORDASH_ACCOUNT_MONITOR",
    "UBEREATS_ACCOUNT_MONITOR", "GRUBHUB_ACCOUNT_MONITOR", "BOOKING_COM_MONITOR",
    "EXPEDIA_ACCOUNT_MONITOR"
  ],
  EDUCATION_ACADEMIC_LEAKS: [
    "STUDENT_RECORDS_MONITOR", "UNIVERSITY_BREACH_MONITOR", "EDU_EMAIL_MARKET",
    "STUDENT_LOAN_MONITOR", "SCHOLARSHIP_FRAUD_MONITOR", "LMS_BREACH_MONITOR",
    "CANVAS_LEAK_MONITOR", "BLACKBOARD_LEAK_MONITOR", "COURSERA_ACCOUNT_MONITOR",
    "UDEMY_ACCOUNT_MONITOR"
  ],
  IOT_SMART_DEVICE_LEAKS: [
    "SMART_HOME_MONITOR", "RING_CAMERA_MONITOR", "NEST_ACCOUNT_MONITOR",
    "WYZE_BREACH_MONITOR", "ALEXA_DATA_MONITOR", "SMART_TV_MONITOR",
    "ROUTER_VULN_MONITOR", "IP_CAMERA_MONITOR", "BABY_MONITOR_LEAK",
    "SMART_LOCK_MONITOR"
  ],
  AUTOMOTIVE_VEHICLE_DATA: [
    "TESLA_ACCOUNT_MONITOR", "CONNECTED_CAR_MONITOR", "ONSTAR_DATA_MONITOR",
    "UCONNECT_MONITOR", "FORD_SYNC_MONITOR", "VIN_DATABASE_MONITOR",
    "GPS_TRACKER_MONITOR", "FLEET_MANAGEMENT_MONITOR", "OBD_DATA_MONITOR",
    "EV_CHARGING_MONITOR"
  ],
  FINANCIAL_BANKING_LEAKS: [
    "BANK_OF_AMERICA_MONITOR", "CHASE_ACCOUNT_MONITOR", "WELLS_FARGO_MONITOR",
    "CITI_ACCOUNT_MONITOR", "CAPITAL_ONE_MONITOR", "CRYPTO_EXCHANGE_MONITOR",
    "BINANCE_ACCOUNT_MONITOR", "KRAKEN_ACCOUNT_MONITOR", "ROBINHOOD_MONITOR",
    "FIDELITY_MONITOR"
  ],
  DATING_ADULT_SITE_LEAKS: [
    "TINDER_DATA_MONITOR", "BUMBLE_DATA_MONITOR", "HINGE_DATA_MONITOR",
    "GRINDR_DATA_MONITOR", "ASHLEY_MADISON_MONITOR", "ADULT_SITE_MONITOR",
    "ONLYFANS_LEAK_MONITOR", "DATING_APP_GENERAL", "FETLIFE_MONITOR",
    "SEEKING_ARRANGEMENT_MONITOR"
  ],

  // ==========================================
  // ADDITIONAL DATA BROKER CATEGORIES v1.18.0
  // ==========================================

  SKIP_TRACING_COLLECTIONS: [
    "TRANSUNION_TRUELOOK", "EQUIFAX_WORKFORCE", "EXPERIAN_MARKETING",
    "ACCURINT_LEXISNEXIS", "TRACERS_INFO", "IRB_SEARCH", "TLOXP",
    "SKIPMAX", "SKIP_SMASHER", "BATCH_SKIP_TRACING"
  ],
  AUTOMOTIVE_DATA: [
    "CARFAX_OWNER", "AUTOCHECK_EXPERIAN", "VINAUDIT", "POLK_AUTOMOTIVE",
    "JD_POWER_DATA", "VEHICLEHISTORY_COM", "CLEARVIN", "BUMPER_VEHICLE",
    "EPICVIN", "FAXVIN"
  ],
  INSURANCE_DATA: [
    "LEXISNEXIS_CLUE", "VERISK_ISO", "MIB_GROUP", "MILLIMAN_INTELLISCRIPT",
    "A_PLUS_INSURANCE", "CHOICEPOINT_INSURANCE", "TRANSUNION_INSURANCE",
    "EXPERIAN_INSURANCE", "FENRIS_DIGITAL", "CAPE_ANALYTICS"
  ],
  HEALTHCARE_PROVIDERS: [
    "IQVIA_DATA", "HEALTHGRADES_DATA", "DOXIMITY_DATA", "WEBMD_PROVIDER",
    "VITALS_DIRECTORY", "ZOCDOC_LISTINGS", "REALSELF_DIRECTORY",
    "CASTLIGHT_HEALTH", "SHARECARE_DATA", "DEFINITIVE_HC"
  ],
  B2B_DATA_PROVIDERS: [
    "ZOOMINFO", "DUNSANDBRADSREET", "HOOVERS_DNB", "INFOGROUP_DATA",
    "LEAD411", "DISCOVER_ORG", "SEAMLESS_AI", "LUSHA_DATA", "APOLLO_IO",
    "CLEARBIT_DATA", "SLINTEL", "COGNISM", "CONTACTOUT", "HUNTER_IO",
    "VOILANORBERT", "ROCKETREACH", "SNOV_IO", "UPLEAD", "DATANYZE", "SALESINTEL"
  ],
  CONSUMER_MARKETING_DATA: [
    "ACXIOM_ABOUTTHEDATA", "ORACLE_DATACLOUD", "EPSILON_DATA", "LIVERAMP_DATA",
    "NIELSEN_IQ", "LOTAME_DATA", "COMSCORE_DATA", "TAPAD_DATA", "DRAWBRIDGE", "TRUTHSET"
  ],
  RETAIL_SHOPPING_DATA: [
    "CATALINA_DATA", "IBOTTA_DATA", "FETCH_REWARDS", "RAKUTEN_DATA",
    "CARDLYTICS", "SHOPKICK_DATA", "INMARKET_DATA", "PLACED_FOURSQUARE",
    "AFFINITY_SOLUTIONS", "NUMERATOR_DATA"
  ],
  LOCATION_DATA_PROVIDERS: [
    "SAFEGRAPH_DATA", "PLACER_AI", "GRAVY_ANALYTICS", "UNACAST_DATA",
    "CUEBIQ_DATA", "VERASET_DATA", "NEARMEDIA", "GROUNDTRUTH_DATA",
    "REVEAL_MOBILE", "XMODE_DATA"
  ],
  IDENTITY_RESOLUTION: [
    "FULLCONTACT", "PIPL_ENTERPRISE", "PEOPLEDATALABS", "VERSIUM_DATA",
    "TOWERDATA", "BIGDBM", "ZEROBOUNCE_DATA", "NEVERBOUNCE_DATA",
    "KICKBOX_DATA", "EMAILAGE"
  ],
  ALTERNATIVE_CREDIT: [
    "CHEXSYSTEMS_CREDIT", "CERTEGY_CHECK", "TELECHECK", "NCTUE_UTILITY",
    "CLARITY_SERVICES", "FACTORTRUST", "SRS_TENANT", "INNOVIS_DATA",
    "PRBC_CREDIT", "SAGESTREAM_CREDIT"
  ],
  EMPLOYMENT_DATA: [
    "THE_WORK_NUMBER", "ADP_VERIFICATION", "PAYCHEX_DATA", "TALENTIQ",
    "HIBOB_DATA", "GREENHOUSE_DATA", "LEVER_DATA", "SMARTRECRUITERS",
    "JOBVITE_DATA", "WORKDAY_DATA"
  ],
  LEGAL_RECORDS: [
    "PACER_RECORDS", "COURTLINK_LN", "WESTLAW_COURT", "COURTRECORDS_ORG",
    "JUDYRECORDS", "UNIQUECOURT", "DOCKETBIRD", "COURTLISTENER",
    "JUSTIA_DOCKETS", "BLOOMBERG_LAW"
  ],
  REAL_ESTATE_DATA: [
    "CORELOGIC_PROPERTY", "ATTOM_DATA", "FIRST_AMERICAN_DATA", "BLACK_KNIGHT_DATA",
    "REONOMY_DATA", "REALTYTRACK", "PROPERTYSHARK", "LANDGRID", "REGRID", "REALPAGE_DATA"
  ],
  VOTER_POLITICAL_DATA: [
    "L2_VOTER_DATA", "ARISTOTLE_VOTER", "CATALIST_DATA", "TARGET_SMART",
    "NATIONBUILDER", "NGPVAN", "I360_DATA", "DATA_TRUST", "VOTERBASE", "POLITICAL_DATA"
  ],
  SOCIAL_AGGREGATORS: [
    "SOCIAL_CATFISH_AGG", "BRANDYOURSELF", "SOCIALBAKERS", "SOCIAL_MENTION",
    "BRANDWATCH", "SPRINKLR_DATA", "NETBASE_QUID", "HOOTSUITE_DATA",
    "TALKWALKER", "SYSOMOS"
  ],
  PHONE_DATA_PROVIDERS: [
    "TWILIO_LOOKUP", "NUMVERIFY_PHONE", "EKATA_DATA", "TELESIGN_DATA",
    "MARCHEX_DATA", "CALLRAIL_DATA", "INVOCA_DATA", "DIALOGTECH",
    "RINGBA_DATA", "CONVIRZA_DATA"
  ],
  INTERNATIONAL_APAC: [
    "PIPL_APAC", "WHITEPAGES_AUSTRALIA", "YELLOWPAGES_AU", "LOCALSEARCH_AU",
    "TRUELOCAL_AU", "WHITEPAGES_NEWZEALAND", "YELLOWPAGES_NZ", "FINDA_NZ",
    "JUSTDIAL_IN", "SULEKHA_IN"
  ],
  INTERNATIONAL_LATAM: [
    "PAGINASAMARILLAS_MX", "SECCIONAMARILLA_MX", "TELELISTAS_BR", "LISTASAMARILLAS_BR",
    "PAGINASAMARILLAS_AR", "PAGINASAMARILLAS_CL", "PAGINASAMARILLAS_CO",
    "PAGINASAMARILLAS_PE", "CIUDAD_CL", "GUIAMAIS_BR"
  ],
  INTERNATIONAL_MENA_AFRICA: [
    "YELLOWPAGES_ZA", "WHITEPAGES_ZA", "YELLOWPAGES_AE", "YELLOWPAGES_SA",
    "YELLOWPAGES_EG", "D144_EG", "BEBEO_SA", "YELLOWPAGES_NG",
    "BUSINESSLIST_KE", "YELLOWPAGES_MA"
  ],
  SPECIALTY_DATA: [
    "DATALOGIX_ORACLE", "MERKLE_DATA", "CROSSIX", "HEALTHVERITY",
    "KOMODO_HEALTH", "SYMPHONY_HEALTH", "PULSEPOINTLIFE", "ADTHEORENT",
    "DIGITALENVOY", "MAXMIND"
  ],

  // ==========================================
  // ADDITIONAL CATEGORIES v1.19.0 (1000 MILESTONE)
  // ==========================================

  ADDITIONAL_BACKGROUND_CHECK: [
    "GOODHIRE_BG", "CRIMCHECK", "VERIFIED_FIRST", "ORANGE_TREE", "ASURINT"
  ],
  ADDITIONAL_CONSUMER_DATA: [
    "INFUTOR_DATA", "WEBBULA", "DATAAXLE", "THROTLE", "SEMCASTING"
  ],
  ADDITIONAL_REAL_ESTATE: [
    "LISTHUB", "HOMEBOT", "QUANTARIUM", "HOUSECANARY", "HOMEUNION"
  ],
  ADDITIONAL_PHONE_IDENTITY: [
    "WHITECALLER", "PHONEBOOK_OF_THE_WORLD", "CALLER_ID_SERVICE", "PHONEINFO", "PHONEDETECTIVE"
  ],
  INTERNATIONAL_EUROPE: [
    "INFOBEL_EU", "EUROPAGES", "KOMPASS_EU", "HOTFROG_EU", "CYLEX_EU"
  ],
  BUSINESS_INTELLIGENCE: [
    "OWLER_DATA", "CRUNCHBASE_DATA", "PITCHBOOK", "CB_INSIGHTS", "PRIVCO"
  ],
  PROFESSIONAL_DIRECTORIES: [
    "AVVO_LEGAL", "MARTINDALE", "FINDLAW_DIR", "LAWYERS_COM", "JUSTIA_DIR"
  ],
  ADVERTISING_DATA: [
    "THE_TRADE_DESK_DATA", "BIDSWITCH", "SAMBA_TV", "VIZIO_INSCAPE", "AUTOMATIC_TV"
  ],
  ADDITIONAL_RETAIL_DATA: [
    "SHOPPERTRACK", "PRICESPIDER", "BAZAARVOICE", "POWER_REVIEWS", "YOTPO_DATA"
  ],
} as const;

// Get data broker info by source
export function getDataBrokerInfo(source: string): DataBrokerInfo | null {
  return DATA_BROKER_DIRECTORY[source] || null;
}

// Get all broker keys
export function getAllBrokerKeys(): string[] {
  return Object.keys(DATA_BROKER_DIRECTORY);
}

// Get broker count
export function getBrokerCount(): number {
  return Object.keys(DATA_BROKER_DIRECTORY).length;
}

// Get brokers by category
export function getBrokersByCategory(category: keyof typeof BROKER_CATEGORIES): DataBrokerInfo[] {
  return BROKER_CATEGORIES[category]
    .map(key => DATA_BROKER_DIRECTORY[key])
    .filter(Boolean);
}

// Get all data brokers (excluding social media and breach databases)
export function getDataBrokersOnly(): Record<string, DataBrokerInfo> {
  const excludeCategories = ["SOCIAL_MEDIA", "BREACH_DATABASE"] as const;
  const excludeKeys = new Set<string>(
    excludeCategories.flatMap(cat => BROKER_CATEGORIES[cat])
  );

  return Object.fromEntries(
    Object.entries(DATA_BROKER_DIRECTORY).filter(([key]) => !excludeKeys.has(key))
  );
}

// Get opt-out instructions for a source
export function getOptOutInstructions(source: string): string {
  const broker = DATA_BROKER_DIRECTORY[source];

  if (!broker) {
    return "Contact the source directly to request removal of your data.";
  }

  let instructions = `To remove your data from ${broker.name}:\n\n`;

  if (broker.optOutUrl) {
    instructions += `1. Visit their opt-out page: ${broker.optOutUrl}\n`;
  }

  if (broker.privacyEmail) {
    instructions += `2. Or email their privacy team: ${broker.privacyEmail}\n`;
  }

  instructions += `\nEstimated processing time: ${broker.estimatedDays} days`;

  if (broker.notes) {
    instructions += `\n\nNote: ${broker.notes}`;
  }

  return instructions;
}

// Get brokers that support automated email removal
export function getEmailRemovalBrokers(): Record<string, DataBrokerInfo> {
  return Object.fromEntries(
    Object.entries(DATA_BROKER_DIRECTORY).filter(
      ([, broker]) => broker.removalMethod === "EMAIL" || broker.removalMethod === "BOTH"
    )
  );
}

// Get brokers that require form submission
export function getFormRemovalBrokers(): Record<string, DataBrokerInfo> {
  return Object.fromEntries(
    Object.entries(DATA_BROKER_DIRECTORY).filter(
      ([, broker]) => broker.removalMethod === "FORM" || broker.removalMethod === "BOTH"
    )
  );
}
